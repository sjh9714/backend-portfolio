import type { CaseStudy } from "./types";

/**
 * 포트폴리오 본문. 단위는 프로젝트가 아니라 문제 해결 하나다.
 *
 * 모든 문장의 근거는 `docs/facts/*.md`에 있다. 새 사실을 만들지 않는다.
 * realtime-chat의 PERF_RESULT.md는 스스로를 "현재 코드의 성능 evidence가 아님"으로
 * 표시하므로 RPS·p95·EXPLAIN 실행시간은 인용하지 않고, 코드로 확인되는 구조적 사실만 쓴다.
 */

const CONCERT_PERF = "https://github.com/sjh9714/concert-booking/blob/main/docs/PERF_RESULT.md";
const BILLING_PERF =
  "https://github.com/sjh9714/ai-usage-billing-gateway/blob/main/docs/PERF_RESULT.md";
const CHAT_REPO_QUERY =
  "https://github.com/sjh9714/realtime-chat/blob/main/src/main/java/com/realtime/chat/repository/ChatRoomRepository.java";
const CHAT_SCHEMA =
  "https://github.com/sjh9714/realtime-chat/blob/main/src/main/resources/db/migration/V1__create_initial_schema.sql";
/**
 * 재측정에 사용한 k6 시나리오. 결과 artifact는 아직 푸시하지 않은 브랜치
 * `perf/rest-remeasure-2026-08-06`에 있으므로, 지금은 공개된 재현 절차를 근거로 건다.
 * 브랜치를 푸시하면 evidence 문서로 링크를 올린다.
 */
const CHAT_K6_REST =
  "https://github.com/sjh9714/realtime-chat/blob/main/k6/rest-api-test.js";

export const caseStudies: CaseStudy[] = [
  {
    id: "seat-contention",
    projectSlug: "concert-booking",
    domain: "좌석 예약 · 동시성 제어",
    title:
      "동일 좌석에 100명이 동시 예매할 때 중복 판매를 막기 위해 락 전략 3종을 같은 조건에서 비교하고 oversell 0건 확인",
    figure: {
      src: "/diagrams/cs-seat-contention.svg",
      alt: "동일 좌석 경합 시 비관적 락·낙관적 락·Redis 분산 락 각각의 커밋 경로와 차단 지점을 비교한 구조도",
      caption: "전략별 차단 지점 — 락 대기 / 커밋 시점 버전 검사 / Redis 재고 선차감",
    },
    cause: [
      "좌석 재고 확인과 예약 기록이 하나의 원자적 단위가 아니면, 두 요청이 같은 \"잔여 있음\"을 읽고 둘 다 예약을 기록",
      "이 실패는 예외를 남기지 않고 두 요청 모두 정상 응답으로 종료되어 로그로 탐지 불가",
      "\"충돌이 잦으면 비관적 락, 드물면 낙관적 락\"이라는 통념만으로는 이 도메인에 어느 쪽이 맞는지 판단 근거 없음",
    ],
    approach: [
      "비관적 락 · 낙관적 락 · Redis 분산 락을 같은 예약 도메인 위에 전략 패턴으로 구현하고 실행 시 플래그로 교체",
      "k6 시나리오를 전략만 바꿔 동일 조건으로 실행 (100 VU · 동일 좌석 1개 · VU당 1회)",
      "reset 엔드포인트로 좌석·Redis 재고·대기열 키를 매 실행 전 같은 fixture로 초기화",
      "성공·실패 건수와 실제 좌석 상태를 도메인 요약 API로 교차 검산",
    ],
    result: [
      "세 전략 모두 성공 1건 / 실패 99건 / oversell 0건 — 동일 좌석 경합에서 중복 판매 차단 확인",
      "p95는 낙관 106ms · Redis 145ms · 비관 215ms로 벌어져 락 대기 비용이 응답 시간에 직결됨을 확인",
      "샘플이 100건이라 p99는 주장하지 않고 측정 문서에 한계로 명시",
    ],
    metrics: [
      {
        label: "동일 좌석 100 VU oversell",
        after: "0건",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-A", href: CONCERT_PERF },
        condition: "로컬 Docker · 3전략 모두 · 단일 실행",
      },
      {
        label: "p95 (낙관 / Redis / 비관)",
        after: "106 / 145 / 215ms",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-A", href: CONCERT_PERF },
        condition: "100 VU · 동일 좌석 1개",
      },
    ],
  },

  {
    id: "shared-counter",
    projectSlug: "concert-booking",
    domain: "좌석 예약 · 낙관적 락 충돌 원인 규명",
    title:
      "서로 다른 좌석인데도 낙관적 락 성공률이 40%로 떨어진 원인을 잔여석 공유 row의 버전 충돌로 규명",
    figure: {
      src: "/diagrams/cs-shared-counter.svg",
      alt: "서로 다른 좌석 row를 대상으로 한 예약들이 공통으로 감소시키는 잔여석 카운터 row에서 버전 충돌이 발생하는 구조도",
      caption: "충돌 지점은 좌석 row가 아니라 모든 예약이 함께 감소시키는 잔여석 카운터 row",
    },
    cause: [
      "좌석이 서로 달라 충돌이 없어야 하는 조건인데 낙관적 락만 성공률 40%(20/50)로 하락",
      "원인은 좌석 row가 아니라 모든 예약이 함께 감소시키는 잔여석 카운터 단일 row",
      "낙관적 락이 커밋 시점에 이 공유 row의 버전 충돌을 감지해 나머지 요청을 롤백",
    ],
    approach: [
      "50 VU가 서로 다른 좌석 50개를 예매하는 시나리오를 전략만 바꿔 실행해 낙관적 락에서만 재현됨을 확인",
      "충돌 대상을 좌석 row에서 잔여석 카운터 row로 좁혀 원인 규명",
      "retry 한도를 올리면 성공률이 회복되는 대신 p95와 DB 부하가 함께 상승하는 트레이드오프 확인",
      "\"충돌이 드물면 낙관적 락\" 규칙이 공유 카운터가 있는 모델에서 뒤집힌다는 결론을 측정 문서에 기록",
    ],
    result: [
      "분산 좌석 예약 성공률 비관 100%(50/50) vs 낙관 40%(20/50) — 공유 row 존재 시 낙관적 락의 비용을 수치로 확인",
      "40%가 낙관적 락의 고정된 성질이 아니라 구현이 선택한 retry 한도에 종속된 값임을 함께 기록",
      "p95는 비관 95ms · Redis 126ms · 낙관 215ms로 재시도 비용이 응답 시간에 반영됨을 확인",
    ],
    metrics: [
      {
        label: "분산 예약 성공률 (비관 vs 낙관)",
        after: "100% vs 40%",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-B", href: CONCERT_PERF },
        condition: "50 VU · 서로 다른 좌석 50개 · 낙관은 제한된 retry 한도 기준",
      },
      {
        label: "p95 (비관 / Redis / 낙관)",
        after: "95 / 126 / 215ms",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-B", href: CONCERT_PERF },
        condition: "동일 시나리오",
      },
    ],
  },

  {
    id: "redis-stock",
    projectSlug: "concert-booking",
    domain: "좌석 예약 · 혼합 부하 최적화",
    title:
      "혼합 부하에서 소진된 좌석 요청이 DB 커넥션을 잡지 않도록 Redis 재고를 선차감해 쓰기 p95를 37ms → 6ms로 단축",
    figure: {
      src: "/diagrams/cs-redis-stock.svg",
      alt: "변경 전에는 실패할 요청도 DB 트랜잭션에 진입하고, 변경 후에는 Redis 재고 검사에서 조기 실패하는 경로 비교도",
      caption: "변경 전 / 후 — 실패할 요청을 DB 커넥션 앞에서 걷어낸다",
    },
    cause: [
      "좌석이 소진된 뒤에도 예매 요청이 계속 유입되어, 실패가 확정된 요청이 DB 커넥션과 락을 점유",
      "커넥션 풀이 실패 요청에 소모되면서 같은 시간대의 조회 경로까지 지연",
      "혼합 부하에서 쓰기 p95가 비관적 락 기준 37ms까지 상승",
    ],
    approach: [
      "Redis 재고를 DB 트랜잭션 앞에 두고 선차감 — 소진된 좌석 요청은 커넥션을 잡지 않고 조기 실패",
      "200 VU 혼합 부하로 측정 (조회 70% + 예매 30%, 예매의 80%를 인기 좌석 상위 20%에 집중)",
      "Redis 재고가 최종 기준 데이터가 아님을 전제로, DB와 어긋날 때를 위한 보정 유틸리티를 별도 구현",
      "세 전략을 같은 시나리오로 실행해 읽기·쓰기 지연과 총 처리량을 함께 비교",
    ],
    result: [
      "쓰기 p95 비관 37ms → Redis 분산 락 6ms — 실패 요청을 DB 앞에서 차단한 효과 확인",
      "총 RPS 969 → 1,005, 읽기 p95 28ms → 7ms로 조회 경로에 대한 간섭 감소",
      "대가로 Redis 재고 · 잔여석 카운터 · 좌석 상태 간 정합성 보정 경로가 필요함을 한계로 명시",
    ],
    metrics: [
      {
        label: "혼합 부하 쓰기 p95",
        before: "37ms",
        after: "6ms",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-C", href: CONCERT_PERF },
        condition: "200 VU · 조회 70% + 예매 30% · 비관 → Redis 분산 락",
      },
      {
        label: "총 RPS",
        before: "969",
        after: "1,005",
        evidence: "measured",
        source: { label: "PERF_RESULT §4-C", href: CONCERT_PERF },
        condition: "동일 시나리오 · 단일 실행",
      },
    ],
  },

  {
    id: "n-plus-one",
    projectSlug: "realtime-chat",
    domain: "채팅방 목록 조회 · 쿼리와 인덱스",
    title:
      "채팅방 목록 조회의 2N+1 쿼리를 JPQL 프로젝션과 IN 배치로 바꿔 방 개수와 무관하게 3회로 고정하고 인덱스 5개를 실행계획 근거로 설계",
    figure: {
      src: "/diagrams/cs-nplus1.svg",
      alt: "변경 전 Entity 그래프 로드로 방마다 추가 쿼리가 발생하는 경로와, 변경 후 JPQL 프로젝션 1회에 IN 배치 조회 2회를 더해 3회로 고정되는 경로를 비교한 도식",
      caption: "변경 전 / 후 — 방 개수에 비례하던 쿼리를 3회로 고정",
    },
    cause: [
      "채팅방 목록 API가 Entity 그래프를 로드한 뒤 DTO로 변환하는 구조라 컬렉션 접근마다 Lazy Loading 발생",
      "방 N개당 채팅방 N회 + 멤버 컬렉션 N회 + 최초 1회 = 2N+1 쿼리, 방 50개 기준 101회",
      "JOIN FETCH로 묶어도 DTO 변환 과정에서 컬렉션 접근이 남아 근본 해결 불가",
    ],
    approach: [
      "목록에 필요한 6개 값(방 ID·이름·타입·멤버 수·읽지 않은 수·생성일)만 JPQL constructor expression으로 직접 조회해 Entity 로드를 제거",
      "이후 표시 이름과 최근 메시지 미리보기를 붙일 때도 방마다 조회하지 않고 roomIds IN 배치 쿼리 2개로 처리, 최근 메시지의 발신자는 JOIN FETCH로 함께 로드",
      "커서 페이지네이션 · 멱등성 체크 · unread 계산 · 멤버 확인 4개 쿼리를 EXPLAIN ANALYZE로 실행계획까지 확인한 뒤 인덱스 5개 설계",
      "Redis Cache Aside(TTL 5분)에서 자주 일어나는 이벤트만 선택 무효화 — 메시지 수신은 해당 방 멤버의 키만, 읽음 처리는 해당 사용자 키만 제거하고 커밋 이후에 실행. 드물게 일어나는 방 생성·참여는 전체 무효화로 남김",
    ],
    result: [
      "방 개수에 비례하던 2N+1 구조를 제거 — 방이 50개든 500개든 프로젝션 1회 + 배치 조회 2회로 총 3회 고정",
      "현재 커밋에서 200 VU 조회 부하를 3회 반복 재측정 — RPS 1,806–1,940 · p95 129–133ms · 39.8만 요청 중 HTTP 실패 0건",
      "멱등성 체크와 멤버 확인은 유니크 제약을 타고 Index Only Scan으로 동작, 커버되는 단일 인덱스 3개는 근거를 적고 미추가",
    ],
    metrics: [
      {
        label: "목록 조회 쿼리 수 (방 N개)",
        before: "2N+1회",
        after: "3회 고정",
        evidence: "verified",
        source: { label: "ChatRoomRepository · ChatRoomService", href: CHAT_REPO_QUERY },
        condition: "방 50개 기준 101회 → 3회 · 프로젝션 1 + IN 배치 2 · 코드로 확인되는 구조적 카운트",
      },
      {
        label: "조회 부하 RPS / p95 (3회 반복)",
        after: "1,806–1,940 / 129–133ms",
        evidence: "measured",
        source: { label: "k6 rest-api-test.js · 커밋 9663f58", href: CHAT_K6_REST },
        condition:
          "2026-08-06 재측정 · 로컬 Docker 단일 인스턴스 · 200 VU · 목록·상세·메시지 이력 혼합 · 개선율 아님",
      },
      {
        label: "HTTP 실패 (3회 합계 398,256 요청)",
        after: "0건",
        evidence: "measured",
        source: { label: "k6 rest-api-test.js · 커밋 9663f58", href: CHAT_K6_REST },
        condition: "checks 100% 통과 · threshold p(95)<500ms · 실패율<1% 모두 충족",
      },
      {
        label: "설계한 인덱스",
        after: "5개",
        evidence: "verified",
        source: { label: "V1__create_initial_schema.sql", href: CHAT_SCHEMA },
        condition: "커버되는 단일 인덱스 3개는 근거를 적고 미추가",
      },
    ],
  },

  {
    id: "idempotency",
    projectSlug: "ai-usage-billing-gateway",
    domain: "사용량 과금 · 멱등성과 원장 정합성",
    title:
      "재시도가 중복 과금이 되지 않도록 Idempotency-Key와 webhook 이벤트 중복 제거를 걸어 중복 반영 0건 검증",
    figure: {
      src: "/diagrams/cs-idempotency.svg",
      alt: "클라이언트 재시도와 PG webhook 재전달이 각각 Idempotency-Key 검사와 providerEventId 중복 제거에서 차단되고 원장에는 한 번만 반영되는 경로도",
      caption: "재시도와 재전달이 차단되는 두 지점, 그리고 append-only 원장",
    },
    cause: [
      "네트워크 불안정 시 클라이언트 재시도는 정상 동작이지만, 사용량 기록 API가 이를 새 요청으로 받으면 같은 사용량이 중복 적재",
      "PG webhook은 재전달 · 순서 뒤바뀜 · 위조가 전제라 같은 결제 이벤트가 원장에 두 번 반영될 수 있음",
      "이런 실패는 예외를 남기지 않고 청구서에서만 드러나 탐지가 늦음",
    ],
    approach: [
      "사용량 기록 API에 Idempotency-Key를 강제 — 같은 키의 재요청은 새 row를 만들지 않고, 같은 키에 다른 본문이 오면 conflict로 거절",
      "webhook은 HMAC 서명 검증 후 providerEventId로 중복 제거해 같은 이벤트의 재전달이 결제 상태를 두 번 바꾸지 못하도록 차단",
      "잔액을 UPDATE하지 않고 append-only 원장에 기록, 환불도 삭제가 아니라 반대 방향 엔트리로 남겨 금액 변화 이력 보존",
      "게이트웨이 · 직접 계량 · 인보이스 · webhook 4개 경로를 모두 실행하는 k6 혼합 시나리오를 3회 반복",
    ],
    result: [
      "체크 150/150 통과, HTTP 실패 0/150 — 3회 반복 모두 동일",
      "멱등 replay와 webhook 중복 전달 시나리오에서 중복 계량 · 중복 결제 반영 0건 확인",
      "부하 테스트 RPS는 5 VU 조건이라 처리량 지표로 승격하지 않고 동작 검증 결과로만 기록",
    ],
    metrics: [
      {
        label: "혼합 시나리오 체크 (3회 반복)",
        after: "150/150",
        evidence: "verified",
        source: { label: "PERF_RESULT · full mixed repeat3", href: BILLING_PERF },
        condition: "로컬 · 4개 경로 모두 실행 · HTTP 실패 0/150",
      },
      {
        label: "중복 계량 · 중복 결제 반영",
        after: "0건",
        evidence: "verified",
        source: { label: "멱등성 · webhook dedup 검증", href: BILLING_PERF },
        condition: "멱등 replay · duplicate delivery 시나리오",
      },
    ],
  },
];

export function caseStudiesFor(slug: string): CaseStudy[] {
  return caseStudies.filter((c) => c.projectSlug === slug);
}
