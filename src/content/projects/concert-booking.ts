import type { Project } from "../types";

export const concertBooking: Project = {
  slug: "concert-booking",
  name: "좌석 예약 시스템",
  domain: "공연 좌석 예약 — 대기열 · 락 전략 · 이벤트 전달",
  period: "2026.02 – 2026.05",
  role: "설계 · 구현 · 측정 전체",
  summary: [
    "동일 좌석 동시 예매 시 중복 판매 문제를 락 전략 3종 비교로 검증해 oversell 0건 확인",
    "서로 다른 좌석에서도 낙관적 락 성공률이 40%로 하락하는 원인을 잔여석 공유 row 버전 충돌로 규명",
    "혼합 부하에서 Redis 재고 선차감으로 쓰기 p95 37ms → 6ms 단축",
    "결제·만료 race, 멱등 replay, 대기열 토큰 우회를 시나리오로 재현해 체크 594/594 통과",
    "Transactional Outbox와 Kafka DLT replay 경로를 Testcontainers 통합 테스트로 고정",
  ],
  stack: [
    "Java 21",
    "Spring Boot 3.4.1",
    "PostgreSQL 16",
    "Redis 7 · Redisson 3.40.2",
    "Apache Kafka (cp 7.6.0)",
    "JPA",
    "Flyway",
    "Testcontainers",
    "k6 v1.5.0",
  ],
  photo: {
    base: "/images/concert",
    alt: "무대 조명을 배경으로 손을 든 콘서트 관객들",
    credit: "Pexels",
  },
  theme: { bg: "#f3e6cc", fg: "#f0f1fa" },
  links: { github: "https://github.com/sjh9714/concert-booking" },
  claimBoundary:
    "모든 수치는 Apple M4 단일 머신의 로컬 Docker 측정값입니다. DB·Redis·Kafka·애플리케이션이 같은 머신에서 실행됐고, JVM warmup을 두지 않았으며, 단일 실행이라 평균·표준편차·신뢰구간을 계산하지 않았습니다. 샘플이 작아 p99는 주장하지 않습니다. 결제는 mock 즉시 성공 구조라 외부 PG 지연·승인 실패·webhook 흐름은 포함하지 않습니다. 운영 성능이나 SLO 주장이 아닙니다.",
};
