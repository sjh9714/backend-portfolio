import type { Project } from "../types";

const PERF = "https://github.com/sjh9714/realtime-chat/blob/main/docs/PERF_RESULT.md";
const MATRIX_1000 =
  "https://github.com/sjh9714/realtime-chat/blob/main/docs/evidence/RECEIVER_MATRIX_1000USERS_REPEAT3_2026-05-23.md";

export const realtimeChat: Project = {
  slug: "realtime-chat",
  name: "Realtime Chat",
  oneLiner:
    "\"화면에 보였다\"와 \"실제 저장됐다\"를 구분하는 채팅 — DB 커밋 후에만 브로드캐스트하고, 1,000명 수신 검증에서 유실 0건",
  period: "2026.02 – 2026.05 · 개인",
  role: "설계·구현·측정 전체",
  stage: {
    id: "stream",
    label: "STREAM",
    caption: "응답이 커밋된 뒤에야 구독자 전원에게 fan-out됩니다",
  },
  bullets: [
    {
      problem: "채팅방 목록 API가 방 N개당 2N+1회 쿼리를 실행 (방 50개면 101회)",
      approach:
        "JPQL 프로젝션으로 단일 쿼리화하고, Redis Cache Aside(TTL 5분)에 이벤트별 선택 무효화를 결합",
      result: "k6 200 VU에서 RPS 937 → 1,598 (+70.5%), p95 212.85ms → 149.22ms (−29.9%)",
    },
    {
      problem: "브로드캐스트 후 DB 저장이 실패하면, 화면에는 보였지만 사라지는 메시지가 생긴다",
      approach:
        "persist-before-broadcast 원칙 — Kafka 소비 → DB 커밋 → Redis Pub/Sub 순서를 강제하고, senderId+clientMessageId 멱등성과 재연결 시 마지막 메시지 ID 기준 보충 조회를 설계",
      result:
        "2대 인스턴스 · 1,000명 receiver matrix 3회 반복에서 expected 99,900건 전량 수신 — 유실 0 · 중복 0 · 순서 역전 0",
    },
    {
      problem: "데이터가 쌓이면 조회 경로가 느려질 수 있는데, 어떤 인덱스가 실제로 쓰이는지 모른다",
      approach:
        "커서 페이지네이션·멱등성 체크·unread 계산 등 핵심 쿼리 4개를 EXPLAIN ANALYZE로 분석해 인덱스 5개를 설계하고, 커버되는 인덱스는 의도적으로 추가하지 않음",
      result:
        "멱등성·멤버 확인은 Index Only Scan, 핵심 쿼리 실행 시간 0.08 – 1.3ms 확인",
    },
  ],
  metrics: [
    {
      label: "채팅방 목록 RPS",
      before: "937",
      after: "1,598",
      delta: "+70.5%",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-2", href: PERF },
      condition: "로컬 Docker · 200 VU · 조회 시나리오",
    },
    {
      label: "p95 응답시간",
      before: "212.85ms",
      after: "149.22ms",
      delta: "−29.9%",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-2", href: PERF },
      condition: "동일 시나리오 Before/After",
    },
    {
      label: "목록 조회 쿼리 수 (방 N개)",
      before: "2N+1회",
      after: "1회",
      evidence: "measured",
      source: { label: "PERF_RESULT §1", href: PERF },
      condition: "Hibernate SQL 로그로 확인",
    },
    {
      label: "1,000명 수신 완전성 (3회 반복)",
      after: "99,900 / 99,900",
      evidence: "verified",
      source: { label: "receiver matrix repeat3", href: MATRIX_1000 },
      condition: "2대 인스턴스 · 유실 0 · 중복 0",
    },
  ],
  stack: [
    "Java 21",
    "Spring Boot",
    "WebSocket · STOMP",
    "Kafka",
    "Redis Pub/Sub",
    "PostgreSQL",
    "JPA",
    "Testcontainers",
    "k6",
  ],
  diagram: {
    src: "/diagrams/realtime-chat.svg",
    alt: "STOMP 전송 → Kafka → DB 커밋 → Redis Pub/Sub → 2대 인스턴스 fan-out으로 이어지는 persist-before-broadcast 메시지 파이프라인",
  },
  links: { github: "https://github.com/sjh9714/realtime-chat" },
  claimBoundary:
    "모든 수치는 로컬 Docker 측정값이며 운영 성능 주장이 아닙니다. receiver matrix는 시나리오 검증이고, 운영 트래픽 기준 send-to-receive latency는 별도 측정 대상입니다.",
  deepDive: [
    {
      heading: "상태 이름은 수신 확인이 아니다",
      paragraphs: [
        "메시지에는 SENDING → ACCEPTED → PERSISTED → FAILED 상태를 두었습니다. ACCEPTED는 Kafka가 받았다는 뜻이지 저장됐다는 뜻이 아니고, 브로드캐스트는 DB 커밋 이후에만 일어납니다. \"보였는데 사라지는 메시지\"를 구조적으로 만들 수 없게 하는 것이 목표였습니다.",
        "발신 클라이언트가 끊겨도 재전송이 중복 저장되지 않도록 senderId + clientMessageId 유니크 제약으로 멱등성을 걸었고, 재연결 시에는 마지막으로 받은 메시지 ID 이후를 DB에서 보충 조회합니다. Redis 발행이 실패해도 Kafka 재전달로 복구됩니다.",
      ],
    },
    {
      heading: "유실 0건을 어떻게 확인했나",
      paragraphs: [
        "\"연결이 잘 된다\"는 smoke와 \"보낸 것이 전부 도착했다\"는 검증은 다릅니다. 수신자 전원의 수신 로그를 대조하는 receiver matrix 러너를 만들어, 1방 1,000명 조건에서 sender 5명이 보낸 100건 × 수신자 999명 = expected 99,900건을 3회 반복 검산했습니다. 세 번 모두 유실 0, 중복 0이었고, 저장된 메시지 ID 기준 순서 역전도 0건이었습니다.",
        "이 과정에서 실제 버그도 잡았습니다. Redis PatternTopic 수신 채널을 그대로 목적지로 쓰면 /topic/room.*로 잘못 브로드캐스트되는 문제가 드러나 payload의 roomId 기준으로 고치고 단위 테스트로 고정했습니다.",
      ],
    },
    {
      heading: "N+1과 캐시 — 기본기의 순서",
      paragraphs: [
        "가장 큰 개선은 화려한 캐시가 아니라 쿼리 자체였습니다. Entity 그래프를 로드해 DTO로 바꾸는 패턴이 방 N개당 2N+1회 쿼리를 만들고 있었고, JPQL constructor expression 프로젝션으로 단일 쿼리로 바꿨습니다. EXPLAIN ANALYZE 기준 0.392ms.",
        "그 위에 Redis Cache Aside를 얹되 무효화를 이벤트별로 좁혔습니다. 메시지 수신은 해당 방 멤버의 캐시만, 읽음 처리는 해당 유저만 무효화합니다. Before/After 부하 테스트의 RPS +70.5% 중 대부분은 N+1 제거의 기여이며, 캐시 단독 효과는 분리 측정하지 않았다고 문서에 그대로 남겼습니다.",
      ],
    },
  ],
};
