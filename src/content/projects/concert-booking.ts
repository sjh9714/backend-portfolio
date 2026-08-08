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
          base: "/screens/concert-catalog",
          alt: "맨 위에 야간 공연장 일러스트 배너가 있고 그 위에 공연명·공연장·기간과 예매하기 버튼, 아래쪽에 공연 여섯 개의 썸네일이 있다. 배너 아래로는 예매 중인 공연 6건이 포스터 카드 격자로 놓여 있다",
          caption:
            "공연 목록 — 배너 비율·전환 속도·썸네일 크기는 NOL 티켓을 실측해 맞췄다. 다만 그쪽 캐러셀은 정지 버튼이 없고 썸네일이 div라 키보드로 못 쓴다. 정지·키보드 이동을 더했고, 움직임을 줄이는 설정에서는 자동 전환을 아예 시작하지 않는다 (이 화면이 그 상태다)",
        },
        {
          width: 1280,
          height: 800,
          base: "/screens/concert-seats",
          alt: "무대 아래로 VIP·R 구역이 이어지는 좌석표. 회색 칸은 이미 팔린 자리이고 VIP 1열 1번이 검게 선택돼 있다. 하단 막대에 1석 선택, VIP 1열 1번, 15만원이 표시돼 있다",
          caption:
            "좌석 선택 — 구역은 무대에서 가까운 순으로 서고, 회색은 이미 팔린 자리다. 고르면 하단에 등급·열·번호와 금액이 잡힌다",
        },
        {
          width: 1280,
          height: 800,
          base: "/screens/concert-queue",
          alt: "대기실 화면 위쪽에 종이비행기 공연의 포스터와 공연장·회차가 있고, 가운데에 현재 내 순서로 입장이 크게 표시된다. 좌석을 선택할 차례이며 토큰이 5분간 유효하다는 안내가 있다",
          caption:
            "대기열 — 순번은 SSE로 내려온다. 무엇을 기다리는지 먼저 적는다. 데모는 대기가 없어 바로 입장이며, 페이지를 벗어나도 순서가 유지된다",
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
    "같은 좌석에 100명이 몰릴 때 나던 중복 판매를 락 3종 비교로 막아 oversell 0건, p95는 106–215ms로 실측",
    "다른 좌석인데 예매가 서로 실패하던 원인이 잔여석 카운터 한 줄이었음을 밝혀 성공률 40% → 100%",
    "매진된 좌석 요청까지 DB를 잡던 것을 Redis에서 미리 걸러 쓰기 p95 37ms → 6ms, 총 RPS 969 → 1,005",
    "결제·만료 race와 멱등 replay, 대기열 토큰 우회를 시나리오로 재현해 체크 594/594 통과",
  ],
  features: [
    "JWT 인증(가입·로그인)과 내 정보 조회, 데모 계정 원클릭 로그인",
    "콘서트 목록·회차·좌석 배치 조회와 예매 내역 조회·취소, 대기열 순번은 SSE로 전달",
    "Transactional Outbox로 커밋과 발행을 분리하고, 재고 정합성 대조와 Kafka DLT 수동 replay를 운영용 엔드포인트로 제공",
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
    base: "/images/card-concert",
    alt: "TICKETLINE 공연 목록 화면 — 야간 공연장 일러스트 배너 아래 예매 중인 공연들이 카드로 놓여 있다",
    credit: "제품 화면 직접 캡처",
  },
  links: { github: "https://github.com/sjh9714/concert-booking" },
  claimBoundary: [
    "모든 수치는 Apple M4 단일 머신의 로컬 Docker 측정값입니다. DB·Redis·Kafka·애플리케이션이 같은 머신에서 실행됐고, JVM warmup을 두지 않았으며, 단일 실행이라 평균·표준편차·신뢰구간을 계산하지 않았습니다. 샘플이 작아 p99는 주장하지 않습니다.",
    "결제는 mock 즉시 성공 구조라 외부 PG 지연·승인 실패·webhook 흐름은 포함하지 않습니다. 운영 성능이나 SLO 주장이 아닙니다.",
  ],
};
