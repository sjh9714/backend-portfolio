/**
 * 이력서 데이터.
 * 참고자료 원칙: 프로젝트당 문제해결형 불릿 우선, 전부 수치/근거 기반.
 *
 * NOTE: 학력·자격증 정보는 확인된 사실이 없어 싣지 않았다.
 * 사용자에게 받아서 education/certifications 섹션으로 추가할 것.
 */

export interface ResumeProject {
  name: string;
  period: string;
  headcount: string;
  stack: string;
  summary: string;
  bullets: string[];
}

export const resume = {
  title: "성진혁 이력서",
  intro: [
    "동시성·정합성·실시간 처리를 직접 재현하고 측정해 온 신입 백엔드 개발자입니다.",
    "좌석 예약 시스템에서 락 전략 3종을 같은 조건으로 실측 비교해 oversell 0건을 검증했고, 채팅 서비스의 N+1 쿼리를 제거해 RPS를 70.5% 개선했습니다.",
    "모든 프로젝트에서 Testcontainers 통합 테스트와 k6 부하 테스트로 주장에 근거를 붙이는 방식으로 일합니다.",
  ],
  projects: [
    {
      name: "Concert Booking — 동시성 좌석 예약 시스템",
      period: "2026.02 – 2026.05",
      headcount: "개인",
      stack: "Java 21, Spring Boot, PostgreSQL, Redis(Redisson), Kafka, JPA, Flyway, Testcontainers, k6",
      summary: "락 전략 3종을 실측 비교하고 이벤트 복구 경로까지 검증한 예약 백엔드",
      bullets: [
        "동일 좌석 100명 동시 예매 경합에서 비관·낙관·Redis 분산 락 3전략 모두 중복 판매 0건 검증, p95 106–215ms 실측 비교",
        "좌석이 달라도 낙관적 락 성공률이 40%로 붕괴하는 원인을 공유 카운터 row의 @Version 충돌로 규명하고 전략별 트레이드오프 문서화",
        "Transactional Outbox + Kafka DLT 수동 replay로 이벤트 유실 복구 경로 구축, Testcontainers 통합 테스트로 검증",
        "결제/만료 race·멱등성·대기열 토큰 남용 k6 시나리오를 3전략 × 3회 반복 — 체크 594/594 통과, 중복 결제 0건",
      ],
    },
    {
      name: "Realtime Chat — 실시간 채팅 시스템",
      period: "2026.02 – 2026.05",
      headcount: "개인",
      stack: "Java 21, Spring Boot, WebSocket(STOMP), Kafka, Redis Pub/Sub, PostgreSQL, JPA, k6",
      summary: "DB 커밋 후에만 브로드캐스트하는 persist-before-broadcast 메시지 파이프라인",
      bullets: [
        "채팅방 목록 N+1 쿼리(방 N개당 2N+1회)를 JPQL 프로젝션 단일 쿼리로 제거 — RPS 937 → 1,598 (+70.5%), p95 212.85 → 149.22ms",
        "Kafka → DB 커밋 → Redis Pub/Sub 순서를 강제하고 senderId+clientMessageId 멱등성 설계 — 2대 인스턴스·1,000명 수신 검증 3회 반복에서 유실 0·중복 0",
        "핵심 쿼리 4개를 EXPLAIN ANALYZE로 분석해 인덱스 5개 설계, Index Only Scan 확인 (실행 시간 0.08–1.3ms)",
        "Redis Cache Aside에 이벤트별 선택 무효화(방 멤버만·해당 유저만) 적용해 전체 무효화 제거",
      ],
    },
    {
      name: "AI Usage Billing Gateway — 사용량 과금 게이트웨이",
      period: "2026.05",
      headcount: "개인",
      stack: "Java 21, Spring Boot, Spring Security, PostgreSQL, Redis, JPA, Flyway, Testcontainers, k6",
      summary: "API Key 인증부터 사용량 계량, 정산 원장까지 과금 경계의 정합성 검증",
      bullets: [
        "사용량 기록에 Idempotency-Key를 강제해 재시도·중복 전송이 중복 과금으로 이어지지 않도록 설계 — k6 혼합 시나리오 3회 반복 체크 150/150, 중복 계량 0건",
        "PG webhook에 HMAC 서명 검증 + providerEventId 중복 제거 적용, duplicate delivery 시나리오로 검증",
        "잔액을 덮어쓰지 않는 append-only ledger 설계 — 환불 포함 원장 정합성을 Testcontainers 통합 테스트로 고정",
        "API Key 해시 저장·조직 스코프 격리로 멀티테넌트 교차 접근 차단",
      ],
    },
    {
      name: "My ETA — 교통약자 배리어프리 내비게이션",
      period: "2026 (하나금융×SKT Tech4Good 해커톤)",
      headcount: "7인 팀 · 백엔드 전담",
      stack: "Python 3.12, FastAPI, Pydantic, HTTPX, TMAP·서울 공공데이터·Kakao API, pytest",
      summary: "교통약자의 실제 보행속도로 도착시간을 재계산하는 개인화 경로 API",
      bullets: [
        "이동 유형·보조기구 프로필과 안내 중 수집한 속도 표본으로 도보 ETA를 보정하는 개인화 엔진 구현 (이상치 표본 필터링 포함)",
        "TMAP 경로·서울 버스/지하철 실시간·엘리베이터 등 외부 API 5종을 provider 어댑터 계층으로 통합",
        "확인되지 않은 접근성 정보를 UNKNOWN 일급 상태로 명시하는 API 계약 설계 — 없는 데이터를 지어내지 않음",
        "경로 이탈·대중교통 놓침 시 현재 위치 기준 재탐색 흐름과 위치 요청 지연 복구 구현",
      ],
    },
  ] satisfies ResumeProject[],
  activities: [
    {
      name: "하나금융그룹 × SK텔레콤 Tech4Good 2026",
      detail: "해커톤 — 교통약자 내비게이션 My ETA 백엔드 전담 (15조 피프틴피프틴)",
    },
    {
      name: "하나금융그룹 청년 금융인재 양성 과정 (하나 파워온)",
      detail: "금융·데이터 교육 과정 수료 활동",
    },
  ],
  pdfPath: "/resume-sung-jinhyuk.pdf",
} as const;
