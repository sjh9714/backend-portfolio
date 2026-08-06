import type { Project } from "../types";

export const realtimeChat: Project = {
  slug: "realtime-chat",
  name: "실시간 채팅 서버",
  domain: "다중 인스턴스 채팅 — 메시지 영속화 · fan-out · 전달 검증",
  period: "2026.02 – 2026.05",
  role: "설계 · 구현 · 측정 전체",
  summary: [
    "채팅방 목록 조회의 2N+1 쿼리를 JPQL 프로젝션으로 전환하고 이후 추가 기능도 IN 배치로 처리해 방 50개 기준 101회 → 3회 고정",
    "커서 페이지네이션·멱등성·unread 등 핵심 쿼리를 EXPLAIN ANALYZE로 분석해 인덱스 5개 설계, 커버되는 3개는 근거를 적고 미추가",
    "현재 커밋에서 200 VU 조회 부하를 3회 반복 재측정해 RPS 1,806–1,940 · p95 129–133ms · 39.8만 요청 중 HTTP 실패 0건 확인",
    "DB 커밋 이후에만 브로드캐스트하는 순서를 강제해 화면에 보였다가 사라지는 메시지를 구조적으로 차단",
    "발신자 ID와 클라이언트 메시지 ID 유니크 제약으로 재전송 멱등성 확보, 재연결 시 마지막 수신 ID 기준 보충 조회 구현",
    "Redis 패턴 구독에서 수신 채널명을 목적지로 쓰던 오브로드캐스트를 payload 기준으로 수정하고 단위 테스트로 고정",
  ],
  stack: [
    "Java 21",
    "Spring Boot 3.4.3",
    "WebSocket · STOMP",
    "Apache Kafka 3.9.0 (KRaft)",
    "Redis 7 Pub/Sub",
    "PostgreSQL 16",
    "JPA",
    "Testcontainers",
    "k6 v1.5.0",
  ],
  photo: {
    base: "/images/chat",
    alt: "한 점에서 동심원 파문이 바깥으로 퍼져 나가는 추상 3D 렌더",
    credit: "fal.ai · FLUX 1.1 pro ultra 생성",
  },
  theme: { bg: "#78d9fb", fg: "#f0f1fa" },
  links: { github: "https://github.com/sjh9714/realtime-chat" },
  claimBoundary:
    "조회 부하 수치는 2026-08-06에 현재 커밋(9663f58)에서 다시 측정한 값입니다. Apple M4 단일 머신의 로컬 Docker에서 애플리케이션·PostgreSQL·Redis·Kafka를 함께 실행했고, 단일 인스턴스 기준이며 JVM warmup을 두지 않았습니다. 운영 성능이나 SLO 주장이 아닙니다. WebSocket 전달 완전성(receiver matrix)은 아직 재측정하지 않아 수치를 싣지 않습니다.",
  pendingMeasurement:
    "개선 전후를 비교한 개선율은 싣지 않았습니다. 저장소 히스토리에 N+1 버전이 별도 커밋으로 남아 있지 않아 같은 환경에서 재현할 수 없었고, 재현할 수 없는 비교치를 만들지 않기로 했습니다. 위 수치는 현재 코드의 상태이며, 쿼리 수는 부하 측정이 아니라 코드로 확인되는 구조적 카운트입니다. WebSocket 전달 완전성도 재측정 전까지 주장하지 않습니다.",
};
