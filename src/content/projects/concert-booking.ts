import type { Project } from "../types";

const PERF = "https://github.com/sjh9714/concert-booking/blob/main/docs/PERF_RESULT.md";
const EVIDENCE_DEF =
  "https://github.com/sjh9714/concert-booking/blob/main/docs/evidence/SCENARIO_D_E_F_FORMAL_2026-05-22.md";

export const concertBooking: Project = {
  slug: "concert-booking",
  name: "Concert Booking",
  oneLiner: "락 전략 세 개를 같은 조건에서 재보고, 교과서가 어디서 틀리는지 찾았습니다",
  period: "2026.02 – 2026.05 · 개인",
  role: "설계·구현·측정 전체",
  stage: {
    id: "queue-lock",
    label: "QUEUE → LOCK·TX",
    caption: "요청이 대기열을 통과해 좌석 락을 두고 경합합니다",
  },

  narrative: {
    hook: "같은 좌석이 두 사람에게 팔리는 사고는, 서버가 두 번 다 정상 응답을 돌려주면서 일어납니다.",

    setup: [
      "티켓 예매는 평소에 한가하다가 특정 순간에만 수천 명이 같은 좌석 하나를 동시에 누릅니다. 평소엔 아무 문제 없던 코드가 이때만 깨집니다.",
      "두 요청이 \"이 좌석 비어 있음\"을 동시에 읽고 둘 다 예약을 기록하면, 두 사람 모두 200 응답을 받고 좌석은 하나입니다. 에러 로그에는 아무것도 남지 않습니다. 이런 실패는 서버가 멈추는 게 아니라 조용히 성공한 척하기 때문에, 나중에 현장에서 발견됩니다.",
    ],

    attempt: [
      "교과서에는 규칙이 있습니다. 충돌이 잦으면 비관적 락, 드물면 낙관적 락. 이 규칙을 외우는 대신 어느 조건에서 무엇이 무너지는지 직접 보고 싶었습니다.",
      "같은 예약 도메인 위에 비관적 락·낙관적 락·Redis 분산 락을 전략 패턴으로 구현하고, k6 시나리오를 전략만 바꿔 동일 조건으로 돌렸습니다.",
      "100명이 같은 좌석 하나에 몰리는 조건에서는 세 전략 모두 성공 1건, oversell 0건이었습니다. 여기까지는 교과서대로였습니다.",
    ],

    twist: {
      question:
        "그런데 좌석이 서로 다른 조건에서 낙관적 락만 성공률이 40%로 떨어졌습니다. 50명이 각자 다른 좌석을 예매했으니 충돌할 일이 없어야 하는데도.",
      finding: [
        "범인은 좌석이 아니었습니다. 좌석이 전부 달라도 모든 예매는 같은 잔여석 카운터 한 줄을 함께 감소시킵니다. 낙관적 락은 커밋 시점에 이 공유 row의 버전 충돌을 감지하고, 50건 중 30건을 되돌렸습니다.",
        "다만 40%는 낙관적 락의 고정된 성질이 아닙니다. retry 한도를 늘리면 성공률은 올라갑니다 — 대신 p95 응답 시간과 DB 부하도 함께 올라갑니다. 이 수치는 \"이 구현이 선택한 retry 한도에서의 값\"이지, 낙관적 락이 부적합하다는 증거가 아닙니다.",
      ],
    },

    lesson: [
      "\"충돌이 드물면 낙관적 락\"이라는 규칙은 도메인에 공유 카운터가 하나만 있어도 뒤집힙니다. 충돌이 드문 것은 좌석이었지 카운터가 아니었습니다.",
      "규칙을 아는 것과 그 규칙이 어디서 깨지는지 아는 것은 다른 일이었습니다. 뒤쪽은 직접 재봐야만 알 수 있었습니다.",
    ],
  },

  bullets: [
    {
      problem: "예약 확정 이벤트가 브로커 장애 시 유실될 수 있다",
      approach: "Transactional Outbox로 DB 커밋과 발행을 분리하고, Kafka DLT + 수동 replay 경로 구축",
      result:
        "Outbox 실패/재시도와 DLT replay를 Testcontainers 통합 테스트로 검증 (OutboxIntegrationTest, KafkaDltReplayIntegrationTest)",
    },
    {
      problem: "결제와 만료가 동시에 도착하는 race, 같은 요청의 중복 제출, 대기열 토큰 우회",
      approach:
        "Idempotency-Key, 상태 전이 불변식, 대기열 토큰 검증을 설계하고 k6 시나리오 D/E/F를 3전략 × 3회 반복 실행",
      result: "체크 594/594 통과 — 중복 결제 0건, 멱등 replay 정상, 무권한 성공 0건",
    },
    {
      problem: "Redis 재고는 최종 기준 데이터가 아니라 DB와 어긋날 수 있다",
      approach:
        "분산 락 전략은 DB 트랜잭션 전에 Redis 재고를 먼저 차감해 소진된 좌석 요청이 커넥션을 잡지 않게 하고, 대신 보정 유틸리티를 별도로 둠",
      result: "혼합 부하에서 쓰기 p95 6ms — 대가로 reconciliation 경로가 필요하다는 것을 문서화",
    },
  ],

  metrics: [
    {
      label: "동일 좌석 100명 경합 oversell",
      after: "0건",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-A", href: PERF },
      condition: "로컬 Docker · k6 100 VU · 3전략 모두 · 단일 실행",
    },
    {
      label: "분산 예약 성공률 (비관 vs 낙관)",
      after: "100% vs 40%",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-B", href: PERF },
      condition: "50 VU · 서로 다른 좌석 50개 · 낙관은 제한된 retry 한도 기준",
    },
    {
      label: "혼합 부하 총 RPS (Redis 락)",
      after: "1,005",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-C", href: PERF },
      condition: "200 VU · 조회 70% + 예매 30% · 단일 실행",
    },
    {
      label: "race·멱등·토큰 남용 검증 체크",
      after: "594/594",
      evidence: "verified",
      source: { label: "시나리오 D/E/F formal repeat", href: EVIDENCE_DEF },
      condition: "3전략 × 3회 반복 (D 216 · E 234 · F 144)",
    },
  ],

  tags: ["동시성 제어", "분산 락", "outbox", "k6 부하테스트"],

  stack: [
    "Java 21",
    "Spring Boot",
    "PostgreSQL",
    "Redis · Redisson",
    "Kafka",
    "JPA",
    "Flyway",
    "Testcontainers",
    "k6",
  ],

  diagram: {
    src: "/diagrams/concert-booking.svg",
    alt: "대기열 토큰 → 락 전략(비관/낙관/분산) → 예약 트랜잭션 → Outbox → Kafka → DLT replay로 이어지는 예약 처리 구조",
  },

  links: { github: "https://github.com/sjh9714/concert-booking" },

  claimBoundary:
    "모든 수치는 Apple M4 단일 머신의 로컬 Docker 측정값입니다. DB·Redis·Kafka·애플리케이션이 같은 머신에서 실행됐고, JVM warmup을 두지 않았으며, A/B/C는 단일 실행이라 평균·표준편차·신뢰구간을 계산하지 않았습니다. 샘플이 작아 p99는 주장하지 않습니다. 결제는 mock 즉시 성공 구조라 외부 PG 지연·승인 실패·webhook 흐름은 포함하지 않습니다. 운영 성능이나 SLO 주장이 아닙니다.",
};
