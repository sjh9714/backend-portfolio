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
 * 2026-08-06 재측정의 근거 문서. 브랜치는 삭제될 수 있으므로 커밋 SHA로 고정한다.
 * 환경·명령·3회 결과와 claim boundary가 함께 들어 있다.
 */
const CHAT_REST_EVIDENCE =
  "https://github.com/sjh9714/realtime-chat/blob/2eb243985978dc73c02a25b0a408cb177f9c7fd0/docs/evidence/REST_ROOMLIST_REPEAT3_2026-08-06.md";
/** 브랜치는 삭제될 수 있으므로 커밋 SHA로 고정한다. 환경·명령·실행 계획이 함께 들어 있다. */
const FINMATE_PERF =
  "https://github.com/gaga-studio/finmate-api/blob/d83f04aaff82b3887e24576abcc487d6b892b30b/docs/PERF_RESULT.md";

/** 브랜치는 삭제될 수 있으므로 전부 커밋 SHA로 고정한다. */
const CHAT_SHA = "f68fe5ddd03fa12910f8de6be32a6d5144f0cc0d";
const CHAT_CONSUMER = `https://github.com/sjh9714/realtime-chat/blob/${CHAT_SHA}/src/main/java/com/realtime/chat/consumer/MessagePersistenceConsumer.java`;
const CHAT_E2E = `https://github.com/sjh9714/realtime-chat/blob/${CHAT_SHA}/web/e2e/chat-flow.spec.ts`;

const FINMATE_SHA = "169c037a759b1172006bc50e222c498512265bd4";
const FINMATE_WORKER = `https://github.com/gaga-studio/finmate-api/blob/${FINMATE_SHA}/src/main/java/com/gagastudio/finmate/diary/DiaryWorker.java`;
const FINMATE_DIARY_TEST = `https://github.com/gaga-studio/finmate-api/blob/${FINMATE_SHA}/src/test/java/com/gagastudio/finmate/diary/DiaryPipelineIntegrationTest.java`;

const ETA_SHA = "8102b7b554b6153e7d7c5d6a2fca78090c6f2bf4";
const ETA_MODELS = `https://github.com/tech4good-2026/eta/blob/${ETA_SHA}/backend/app/models.py`;
const ETA_ACCESS_TEST = `https://github.com/tech4good-2026/eta/blob/${ETA_SHA}/backend/tests/test_accessibility_provider.py`;

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
      '좌석 재고 확인과 예약 기록이 하나의 원자적 단위가 아니면, 두 요청이 같은 "잔여 있음"을 읽고 둘 다 예약을 기록',
      "이 실패는 예외를 남기지 않고 두 요청 모두 정상 응답으로 종료되어 로그로 탐지 불가",
      '"충돌이 잦으면 비관적 락, 드물면 낙관적 락"이라는 통념만으로는 이 도메인에 어느 쪽이 맞는지 판단 근거 없음',
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
      '"충돌이 드물면 낙관적 락" 규칙이 공유 카운터가 있는 모델에서 뒤집힌다는 결론을 측정 문서에 기록',
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
        condition:
          "방 50개 기준 101회 → 3회 · 프로젝션 1 + IN 배치 2 · 코드로 확인되는 구조적 카운트",
      },
      {
        label: "조회 부하 RPS / p95 (3회 반복)",
        after: "1,806–1,940 / 129–133ms",
        evidence: "measured",
        source: { label: "재측정 근거 · 3회 반복 (커밋 9663f58)", href: CHAT_REST_EVIDENCE },
        condition:
          "2026-08-06 재측정 · 로컬 Docker 단일 인스턴스 · 200 VU · 목록·상세·메시지 이력 혼합 · 개선율 아님",
      },
      {
        label: "HTTP 실패 (3회 합계 398,256 요청)",
        after: "0건",
        evidence: "measured",
        source: { label: "재측정 근거 · 3회 반복 (커밋 9663f58)", href: CHAT_REST_EVIDENCE },
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
  {
    id: "peer-rollup",
    projectSlug: "finmate",
    domain: "청년 금융 · 인구 집계",
    title:
      "또래 비교가 매 요청 원장 88만 행을 다시 세던 것을 사람×월 사전 집계로 접어 p50 32.5ms → 0.72ms",
    figure: {
      src: "/diagrams/cs-peer-rollup.svg",
      alt: "변경 전 원장 88만 7천 행을 순차 스캔하고 디스크 정렬까지 거치던 경로와, 변경 후 사람과 월 단위로 접어 둔 1만 4천 행 집계만 읽는 경로를 비교한 도식",
      caption: "또래 비교 — 요청마다 다시 세기 vs 한 번 접어 두고 읽기",
    },
    cause: [
      "또래 비교는 소득대가 같은 사람 전부를 가로질러 집계하므로 한 달치가 105,484행",
      "조건이 기간뿐이라 (persona_id, occurred_on) 인덱스의 선행 컬럼이 없어 Parallel Seq Scan",
      "count(DISTINCT persona_id)가 정렬을 강요해 work_mem을 넘기고 디스크 정렬 2,496kB 발생",
    ],
    approach: [
      "고치기 전에 먼저 측정 — 개인 화면도 함께 재보니 p95 0.96ms로 문제가 아니었고, 예상과 달리 인구 집계만 비쌌음",
      "싼 것부터 순서대로 검증 — 쿼리 수정(count DISTINCT 제거)으로 디스크 정렬을 없애 p50 28.0ms",
      "커버링 인덱스 (flow, occurred_on) INCLUDE (persona_id, amount)는 50MB를 쓰고 24.0ms에 그쳐 채택하지 않음",
      "사람×월 사전 집계를 도입하되 원장을 유일한 진실로 두어 언제든 통째로 재생성 가능하게 설계",
    ],
    result: [
      "p50 32.5ms → 0.72ms, 읽는 버퍼 23,326 → 206 (전체 2,000명 · 원장 887,002행 기준)",
      "사전 집계는 14,000행 1.9MB로 원장의 1.1%, 전체 재생성 401ms",
      "두 방식의 결과가 소득대 6개 그룹 전부 일치하는 것을 통합 테스트로 고정",
    ],
    metrics: [
      {
        label: "또래 비교 p50",
        before: "32.5ms",
        after: "0.72ms",
        delta: "45배",
        evidence: "measured",
        source: { label: "PERF_RESULT.md §3", href: FINMATE_PERF },
        condition: "로컬 Testcontainers postgres:16 · 2,000명 887,002행 · 단일 클라이언트 40회",
      },
      {
        label: "읽는 버퍼",
        before: "23,326",
        after: "206",
        evidence: "measured",
        source: { label: "EXPLAIN (ANALYZE, BUFFERS)", href: FINMATE_PERF },
      },
      {
        label: "사전 집계 크기",
        after: "1.9MB",
        evidence: "measured",
        source: { label: "PERF_RESULT.md §3-3", href: FINMATE_PERF },
        condition: "원장 179MB 대비 1.1%",
      },
    ],
  },
  {
    id: "persist-order",
    projectSlug: "realtime-chat",
    domain: "실시간 채팅 · 메시지 생명주기",
    title:
      "저장보다 브로드캐스트가 먼저 끝날 수 있던 구조를 한 컨슈머로 합쳐 화면에 보인 메시지가 DB에도 있게 만듦",
    figure: {
      src: "/diagrams/cs-persist-order.svg",
      alt: "이전에는 브로드캐스트 컨슈머와 저장 컨슈머가 같은 Kafka 이벤트를 따로 처리해 저장보다 브로드캐스트가 먼저 끝날 수 있었고, 지금은 한 컨슈머가 DB 커밋을 마친 뒤 그 DB ID로 브로드캐스트하는 구조를 비교한 도식",
      caption: "메시지 생명주기 — 따로 처리하기 vs 저장을 끝내고 내보내기",
    },
    cause: [
      "브로드캐스트 컨슈머와 저장 컨슈머가 같은 Kafka 이벤트를 각자 처리해 완료 순서가 보장되지 않음",
      "브로드캐스트가 먼저 끝나면 상대는 DB에 아직 없는 메시지를 보게 됨",
      "직후 저장이 실패하면 새로고침·재접속에서 그 메시지가 사라짐 — 보였다가 없어지는 것은 처음부터 안 보이는 것보다 나쁨",
    ],
    approach: [
      "두 컨슈머를 하나로 합쳐 DB 커밋이 끝난 뒤에만 브로드캐스트하도록 순서를 강제",
      "브로드캐스트에 DB가 발급한 message id를 실어 재접속 보충 조회가 같은 메시지를 다시 찾을 수 있게 함",
      "ACCEPTED(큐 접수)와 PERSISTED(저장 완료)를 상태로 분리해 화면이 둘을 구분해 표시",
      "Redis 발행이 실패하면 Kafka ACK를 보류하고, 재전달에서 기존 DB 행으로 fan-out만 다시 시도",
    ],
    result: [
      "DB 저장 실패를 주입하면 그 시점에 전달되지 않고, 재시도로 저장된 뒤에 전달되는 것을 e2e로 확인",
      "Redis 발행 실패를 주입해도 저장은 1건인 채 전달만 지연되고 이후 정확히 한 번 도착",
      "같은 clientMessageId로 두 번 보내도 저장 1건·전달 1건 — 인스턴스를 지정해 붙는 e2e가 고정",
    ],
    metrics: [
      {
        label: "전달 완전성 (50명 단일 방 · 두 노드 분산 · 3회)",
        after: "기대 4,900건 전부 도착",
        evidence: "verified",
        source: { label: "receiver matrix 3회", href: CHAT_E2E },
        condition:
          "누락 0 · 중복 0 · 순서 위반 0. 로컬 Docker Compose 반복이라 성능 수치로 쓰지 않음",
      },
      {
        label: "저장 순서 강제",
        before: "컨슈머 2개 · 순서 보장 없음",
        after: "컨슈머 1개 · DB 커밋 후 브로드캐스트",
        evidence: "verified",
        source: { label: "MessagePersistenceConsumer", href: CHAT_CONSUMER },
      },
    ],
  },
  {
    id: "claim-by-state",
    projectSlug: "finmate",
    domain: "AI 그림일기 · 외부 의존 비동기",
    title:
      "행 잠금이 외부 호출 구간을 지키지 못하던 것을 상태 전이로 집는 방식으로 바꿔 두 인스턴스가 같은 작업을 가져가지 못하게 함",
    figure: {
      src: "/diagrams/cs-claim-by-state.svg",
      alt: "행 잠금은 트랜잭션이 끝나면서 풀려 정작 3에서 6초 걸리는 외부 호출 동안에는 아무도 그 행을 지키지 않았고, 지금은 PENDING을 SUBMITTED로 바꾸는 원자적 UPDATE로 집는 구조를 비교한 도식",
      caption: "비동기 작업 집기 — 잠금 vs 상태 전이",
    },
    cause: [
      "하루의 소비를 그림 한 장으로 만드는 기능이라 외부 이미지 생성 API 호출에 3~6초가 걸림",
      "처음엔 SELECT … FOR UPDATE SKIP LOCKED로 집고 별도 트랜잭션에서 외부 API를 불렀는데, 잠금은 그 트랜잭션이 끝나며 풀리므로 정작 호출이 도는 동안에는 아무도 그 행을 지키지 않음",
      "그렇다고 잠근 채로 부르면 3~6초 동안 DB 커넥션을 붙들게 되어 커넥션 풀이 마름",
    ],
    approach: [
      "잠금이 아니라 상태로 집기 — PENDING을 SUBMITTED로 바꾸는 UPDATE … RETURNING 한 문장이 원자적이라 두 인스턴스가 같은 행을 가져갈 수 없음",
      "SKIP LOCKED는 서로 다른 행을 동시에 집을 때 기다리지 않게 하는 역할로만 남김",
      "집은 직후 죽으면 job id 없는 SUBMITTED가 남으므로, 일정 시간이 지난 것은 PENDING으로 되돌리는 회수 경로를 따로 둠",
      "수거 대상은 job id가 있는 SUBMITTED로 한정 — 제출 전에 죽은 행까지 수거하면 멀쩡한 작업을 실패로 버리게 됨",
    ],
    result: [
      "동시에 요청해도 그림이 하나만 생기는 것을 Testcontainers 실 PostgreSQL 통합 테스트로 고정",
      "(persona_id, entry_date) 유니크 제약으로 같은 날을 두 번 요청해도 그림은 하나",
      "실패는 세 번까지 재시도하고 이유를 남기며, 응답이 오지 않는 작업은 되돌려 다시 집게 함",
    ],
    metrics: [
      {
        label: "외부 호출 중 DB 커넥션 점유",
        before: "잠금을 유지하면 3~6초",
        after: "0 — 호출 전에 놓는다",
        evidence: "verified",
        source: { label: "DiaryWorker.claimPending", href: FINMATE_WORKER },
      },
      {
        label: "동시 요청 시 생성되는 그림",
        after: "1장",
        evidence: "verified",
        source: { label: "DiaryPipelineIntegrationTest", href: FINMATE_DIARY_TEST },
        condition: "Testcontainers 실 PostgreSQL · 동시 요청 테스트",
      },
    ],
  },
  {
    id: "unknown-state",
    projectSlug: "eta",
    domain: "교통약자 경로 안내 · 데이터 신뢰도",
    title:
      "확인하지 못한 접근성 정보를 이용 가능으로 채우지 않도록 UNKNOWN을 API 계약의 일급 상태로 정의",
    figure: {
      src: "/diagrams/cs-unknown-state.svg",
      alt: "확인하지 못한 접근성 정보를 이용 가능으로 채우면 휠체어 이용자가 갈 수 없는 길을 안내받게 되므로, 여섯 개 열거형에 UNKNOWN을 값으로 두고 판정은 이용 가능 대신 주의로 내리는 구조를 보여주는 도식",
      caption: "모르는 것을 모른다고 말하는 자리 — 열거형 · 판정 · 화면",
    },
    cause: [
      "엘리베이터·저상버스 여부는 서울시 공공데이터에 의존하는데 응답이 없거나 항목 자체가 없는 경우가 흔함",
      "빈 칸을 기본값으로 채우면 휠체어 이용자가 계단 앞에서 멈추고, 되돌아가는 사이 대중교통까지 놓침",
      "이 서비스에서 틀린 안내의 비용은 몇 분이 아니라 그 경로를 못 가는 것",
    ],
    approach: [
      "UNKNOWN을 열거형의 값으로 두어 API 계약에 실림 — 데이터 신뢰도·시각 출처·저상버스·시설·노면·출처 6개 열거형이 이 값을 가짐",
      "판정은 ACCESSIBLE·CAUTION·UNAVAILABLE 세 갈래로 두되, 모르는 데이터가 ACCESSIBLE로 올라가지 않고 CAUTION으로 내려가게 함",
      "출처를 값으로 구분해 합성 데이터가 실제 데이터로 섞이지 않게 함 (SYNTHETIC_FIXTURE를 별도 값으로 둠)",
      "경로 정렬 기준을 이용 가능성 우선, 개인화 ETA 차순으로 두어 빠른 길이 못 가는 길을 앞지르지 않게 함",
    ],
    result: [
      "지하철 구간은 승차역과 하차역 둘 다 엘리베이터 데이터가 있을 때만 이용 가능으로 판정",
      "버스 API 키가 없는 실시간 모드에서 저상버스 여부를 합성값으로 주장하지 않는 것을 테스트로 고정",
      "UNKNOWN이 프론트까지 그대로 전달돼 화면에 '확인요망' 배지로 표시됨",
    ],
    metrics: [
      {
        label: "UNKNOWN을 값으로 가진 열거형",
        after: "6개 / 전체 14개",
        evidence: "verified",
        source: { label: "backend/app/models.py", href: ETA_MODELS },
        condition:
          "DataConfidence · TimeSource · LowFloorStatus · FacilityStatus · SurfaceType · DataSource",
      },
      {
        label: "확인되지 않은 접근성의 판정",
        before: "기본값으로 채우면 ACCESSIBLE",
        after: "CAUTION — ACCESSIBLE로 올리지 않는다",
        evidence: "verified",
        source: { label: "test_accessibility_provider.py", href: ETA_ACCESS_TEST },
      },
    ],
  },
];

export function caseStudiesFor(slug: string): CaseStudy[] {
  return caseStudies.filter((c) => c.projectSlug === slug);
}
