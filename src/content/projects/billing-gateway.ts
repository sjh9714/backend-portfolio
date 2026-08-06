import type { Project } from "../types";

export const billingGateway: Project = {
  slug: "ai-usage-billing-gateway",
  name: "사용량 과금 게이트웨이",
  domain: "멀티테넌트 AI 사용량 과금 — 인증 · 계량 · 정산 원장",
  period: "2026.05",
  role: "설계 · 구현 · 검증 전체",
  summary: [
    "클라이언트 재시도가 중복 과금이 되는 문제를 Idempotency-Key 강제로 차단해 중복 계량 0건 확인",
    "PG webhook 재전달을 HMAC 서명 검증과 이벤트 ID 중복 제거로 걸러 중복 결제 반영 0건 확인",
    "잔액을 덮어쓰지 않는 append-only 원장으로 환불·조정을 포함한 금액 변화 이력을 추적 가능하게 설계",
    "게이트웨이·계량·인보이스·webhook 4개 경로를 모두 실행하는 혼합 시나리오 3회 반복에서 체크 150/150 통과",
    "API Key를 해시로만 저장하고 조회·기록 경로를 조직 스코프로 격리해 교차 테넌트 접근 차단",
  ],
  stack: [
    "Java 21",
    "Spring Boot 3.5.14",
    "Spring Security",
    "PostgreSQL 16",
    "Redis 7",
    "JPA",
    "Flyway",
    "Testcontainers",
    "k6",
  ],
  photo: {
    base: "/images/billing",
    alt: "계산대에서 카드로 결제하는 손과 점원",
    credit: "Pexels",
  },
  theme: { bg: "#eaa55f", fg: "#f0f1fa" },
  links: { github: "https://github.com/sjh9714/ai-usage-billing-gateway" },
  claimBoundary:
    "이 프로젝트는 처리량·지연시간 벤치마크 수치를 주장하지 않습니다. 저장소 문서에 명시된 대로 공개 가능한 production 성능 측정치가 없으며, 위 수치는 모두 로컬 환경의 동작 검증 결과입니다. 부하 테스트의 RPS는 5 VU 조건이라 처리량 지표가 아니고, webhook 구간은 같은 이벤트 ID를 재사용하는 중복 전달 확인용이라 결제 처리량으로 해석하지 않습니다.",
};
