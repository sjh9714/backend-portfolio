import type { Project } from "../types";

export const concertBooking: Project = {
  slug: "concert-booking",
  name: "좌석 예약 시스템",
  domain: "공연 좌석 예약 — 대기열 · 락 전략 · 이벤트 전달",
  period: "2026.02 – 2026.05",
  role: "설계 · 구현 · 측정 전체",
  service: {
    what: [
      "관객이 콘서트를 고르고, 대기열을 거쳐 좌석을 선택하고, 결제까지 마치는 예매 서비스입니다.",
      "예매는 같은 좌석에 사람이 몰리는 순간에만 어려워집니다. 그래서 좌석 하나를 두고 경합이 일어나는 구간에 검증을 집중했습니다.",
      "결제는 mock 즉시 성공 구조이며 실제 결제는 일어나지 않습니다.",
    ],
    flow: ["가입", "콘서트 목록", "대기열", "좌석 선택", "결제", "예매 내역"],
    demo: {
      screens: [
        {
          width: 1280,
          height: 800,
          base: "/screens/concert-seats",
          alt: "무대를 기준으로 배치된 좌석표에서 VIP 1열 1번을 고른 화면. 하단 막대에 1석 선택, VIP 1열 1번, 15만원이 표시돼 있다",
          caption:
            "좌석 선택 — 고르면 하단에 등급·열·번호와 금액이 잡힌다. 좌석 상태는 5초마다 갱신된다",
        },
        {
          width: 1280,
          height: 800,
          base: "/screens/concert-queue",
          alt: "대기실 화면에 현재 내 순서로 입장이 크게 표시되고, 좌석을 선택할 차례이며 토큰이 5분간 유효하다는 안내가 있다",
          caption:
            "대기열 — 순번은 SSE로 내려온다. 데모는 대기가 없어 바로 입장이며, 페이지를 벗어나도 순서가 유지된다",
        },
      ],
      stack: "React · TypeScript · Vite · Playwright e2e",
      run: "docker compose -f docker-compose.yml -f docker-compose.demo.yml up",
      url: "localhost:4173",
      provenBy: [
        "두 브라우저가 한 좌석을 경쟁하면 한 쪽만 성공하고 진 쪽은 복구된다",
        "대기열 토큰 응답이 유실돼 재요청해도 예매는 한 건만 생긴다",
      ],
    },
  },
  summary: [
    "동일 좌석 동시 예매 시 중복 판매 문제를 락 전략 3종 비교로 검증해 oversell 0건 확인",
    "서로 다른 좌석에서도 낙관적 락 성공률이 40%로 하락하는 원인을 잔여석 공유 row 버전 충돌로 규명",
    "혼합 부하에서 Redis 재고 선차감으로 쓰기 p95 37ms → 6ms 단축",
    "결제·만료 race, 멱등 replay, 대기열 토큰 우회를 시나리오로 재현해 체크 594/594 통과",
    "Transactional Outbox와 Kafka DLT replay 경로를 Testcontainers 통합 테스트로 고정",
  ],
  features: [
    "JWT 인증(가입·로그인)과 내 정보 조회, 데모 계정 원클릭 로그인",
    "콘서트 목록·회차·좌석 배치 조회 API와 예매 내역 조회·취소",
    "대기열 입장·순번 조회·토큰 발급, 진행 상황은 SSE로 전달",
    "운영용 재고 초기화·정합성 대조와 Kafka DLT 수동 replay 엔드포인트",
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
  links: { github: "https://github.com/sjh9714/concert-booking" },
  claimBoundary:
    "모든 수치는 Apple M4 단일 머신의 로컬 Docker 측정값입니다. DB·Redis·Kafka·애플리케이션이 같은 머신에서 실행됐고, JVM warmup을 두지 않았으며, 단일 실행이라 평균·표준편차·신뢰구간을 계산하지 않았습니다. 샘플이 작아 p99는 주장하지 않습니다. 결제는 mock 즉시 성공 구조라 외부 PG 지연·승인 실패·webhook 흐름은 포함하지 않습니다. 운영 성능이나 SLO 주장이 아닙니다.",
};
