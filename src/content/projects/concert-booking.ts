import type { Project } from "../types";

const PERF = "https://github.com/sjh9714/concert-booking/blob/main/docs/PERF_RESULT.md";
const EVIDENCE_DEF =
  "https://github.com/sjh9714/concert-booking/blob/main/docs/evidence/SCENARIO_D_E_F_FORMAL_2026-05-22.md";

export const concertBooking: Project = {
  slug: "concert-booking",
  name: "Concert Booking",
  oneLiner:
    "100명이 같은 좌석에 몰려도 중복 판매 0건 — 락 전략 3종을 같은 조건에서 실측 비교한 좌석 예약 시스템",
  period: "2026.02 – 2026.05 · 개인",
  role: "설계·구현·측정 전체",
  stage: {
    id: "queue-lock",
    label: "QUEUE → LOCK·TX",
    caption: "요청이 대기열을 통과해 좌석 락을 두고 경합합니다",
  },
  bullets: [
    {
      problem: "동일 좌석에 동시 예매가 몰리면 중복 판매(oversell)가 발생할 수 있다",
      approach:
        "비관적 락·낙관적 락·Redis 분산 락 3전략을 같은 도메인에 구현하고 k6로 동일 조건 비교",
      result:
        "100 VU 동일 좌석 경합에서 3전략 모두 성공 1건·oversell 0건, p95는 낙관 106ms / Redis 145ms / 비관 215ms",
    },
    {
      problem: "서로 다른 좌석을 예매해도 낙관적 락 성공률이 40%로 무너졌다",
      approach:
        "실측으로 원인 규명 — 좌석이 달라도 모든 예매가 ConcertSchedule.availableSeats 공유 row의 @Version을 갱신해 충돌",
      result:
        "분산 예약 성공률 비관 100% vs 낙관 40%를 근거로, 공유 카운터가 있는 모델에서의 전략별 트레이드오프를 문서화",
    },
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
      result:
        "체크 594/594 통과 — 중복 결제 0건, 멱등 replay 정상, 무권한 성공 0건",
    },
  ],
  metrics: [
    {
      label: "동일 좌석 100명 경합 oversell",
      after: "0건",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-A", href: PERF },
      condition: "로컬 Docker · k6 100 VU · 3전략 모두",
    },
    {
      label: "분산 예약 성공률 (비관 vs 낙관)",
      after: "100% vs 40%",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-B", href: PERF },
      condition: "50 VU · 서로 다른 좌석 50개",
    },
    {
      label: "혼합 부하 총 RPS (Redis 락)",
      after: "1,005",
      evidence: "measured",
      source: { label: "PERF_RESULT §4-C", href: PERF },
      condition: "200 VU · 조회 70% + 예매 30%",
    },
    {
      label: "race·멱등·토큰 남용 검증 체크",
      after: "594/594",
      evidence: "verified",
      source: { label: "시나리오 D/E/F formal repeat", href: EVIDENCE_DEF },
      condition: "3전략 × 3회 반복",
    },
  ],
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
    "모든 수치는 로컬 Docker 단일 머신 측정값입니다. 운영 성능·SLO 주장이 아니며, A/B 시나리오는 샘플이 작아 p99를 주장하지 않습니다.",
  deepDive: [
    {
      heading: "왜 락 전략을 3개나 구현했나",
      paragraphs: [
        "\"어떤 락이 정답인가\"가 아니라 \"어떤 조건에서 무엇이 무너지는가\"를 직접 보고 싶었습니다. 같은 예약 도메인 위에 비관적 락, 낙관적 락, Redis 분산 락을 전략 패턴으로 구현하고, k6 시나리오를 전략만 바꿔 동일 조건으로 실행했습니다.",
        "결과는 교과서와 달랐습니다. 좌석이 서로 달라 충돌이 없어야 할 시나리오에서 낙관적 락 성공률이 40%로 떨어졌는데, 원인은 좌석 row가 아니라 모든 예매가 함께 갱신하는 잔여석 카운터(공유 row)의 @Version 충돌이었습니다. \"충돌이 드물면 낙관적 락\"이라는 규칙은 공유 카운터 하나로 쉽게 뒤집힙니다.",
      ],
    },
    {
      heading: "실패한 요청을 어떻게 빨리 돌려보내나",
      paragraphs: [
        "Redis 분산 락 전략은 DB 트랜잭션 전에 Redis 재고를 먼저 차감합니다. 이미 소진된 좌석으로 오는 요청은 DB 커넥션을 잡지 않고 실패하므로, 혼합 부하에서 쓰기 p95가 6ms까지 내려갑니다. 대신 Redis 재고는 최종 기준이 아니므로 DB와 어긋날 수 있어, 별도 reconciliation 유틸리티로 보정 경로를 두었습니다.",
      ],
    },
    {
      heading: "이벤트는 유실되지 않는가",
      paragraphs: [
        "예약 확정 이벤트는 트랜잭션 안에서 Outbox 테이블에 먼저 기록하고, relay가 Kafka로 발행합니다. 발행 실패는 재시도 후 DEAD 상태로 격리되고, 소비 실패는 DLT로 빠진 뒤 수동 replay로 복구합니다. 이 경로 전체를 Testcontainers(PostgreSQL·Kafka 실컨테이너) 통합 테스트로 고정했습니다.",
      ],
    },
    {
      heading: "결제·만료 race와 멱등성",
      paragraphs: [
        "결제 완료와 홀드 만료가 동시에 도착해도 같은 예약이 confirmed와 expired를 동시에 가질 수 없도록 상태 전이 불변식을 두고, 결제·예매 요청에는 Idempotency-Key를 강제했습니다. k6 시나리오 D(race)/E(멱등 replay·conflict)/F(대기열 토큰 남용)를 3전략 × 3회 반복해 594개 체크 전부 통과, 중복 결제 0건·무권한 성공 0건을 확인했습니다.",
      ],
    },
  ],
};
