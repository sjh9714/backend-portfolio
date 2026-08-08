import type { Project } from "../types";

/**
 * 기본 포트폴리오에서 감춘다.
 *
 * 좌석 예약과 같은 이야기(중복이 생기지 않게 하는 정합성)를 두 번 하는데
 * 모든 지표에서 좌석 예약이 낫다 — k6 8:1, 테스트 31:15, 커밋 30:14.
 * 레퍼런스가 권하는 프로젝트 수도 2~3개다.
 *
 * 지우지는 않는다. 정산·핀테크 공고에는 멀티테넌트·멱등·HMAC·append-only 원장이 무기가 되므로
 * 그때 `hidden`을 빼고 링크를 건넨다.
 */
export const billingGateway: Project = {
  slug: "ai-usage-billing-gateway",
  name: "사용량 과금 게이트웨이",
  hidden: true,
  domain: "멀티테넌트 AI 사용량 과금 — 인증 · 계량 · 정산 원장",
  period: "2026.05",
  role: "설계 · 구현 · 검증 전체",
  service: {
    what: [
      "여러 조직이 함께 쓰는 AI API 앞단에서, 누가 얼마나 썼는지 세고 그만큼 청구하는 게이트웨이입니다.",
      "돈이 걸린 경로라 어려운 지점은 속도가 아니라 정합성입니다. 네트워크가 끊겨 클라이언트가 재시도하면 그건 두 번 쓴 게 아닙니다.",
      "그래서 계량·결제 webhook·정산 원장 세 경계에서 같은 일이 두 번 반영되지 않도록 막았습니다.",
    ],
    flow: [
      "조직 생성",
      "API Key 발급",
      "게이트웨이 호출",
      "사용량 계량",
      "인보이스 생성",
      "결제 webhook",
    ],
    noDemo:
      "화면이 없습니다. 사람이 쓰는 서비스가 아니라 다른 서비스가 호출하는 게이트웨이라, 저장소에도 프론트엔드가 없습니다. 흐름은 사용자가 아니라 호출자 기준입니다.",
  },
  summary: [
    "클라이언트 재시도가 중복 과금이 되는 문제를 Idempotency-Key 강제로 차단해 중복 계량 0건 확인",
    "PG webhook 재전달을 HMAC 서명 검증과 이벤트 ID 중복 제거로 걸러 중복 결제 반영 0건 확인",
    "잔액을 덮어쓰지 않는 append-only 원장으로 환불·조정을 포함한 금액 변화 이력을 추적 가능하게 설계",
    "게이트웨이·계량·인보이스·webhook 4개 경로를 모두 실행하는 혼합 시나리오 3회 반복에서 체크 150/150 통과",
    "API Key를 해시로만 저장하고 조회·기록 경로를 조직 스코프로 격리해 교차 테넌트 접근 차단",
  ],
  features: [
    "조직 생성·조회와 멤버 추가, 구독 플랜 변경",
    "조직별 API Key 발급·목록·폐기, 키는 해시로만 저장",
    "사용량 이벤트 수집과 인보이스 생성, 결제 webhook 수신",
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
  links: { github: "https://github.com/sjh9714/ai-usage-billing-gateway" },
  claimBoundary: [
    "이 프로젝트는 처리량·지연시간 벤치마크 수치를 주장하지 않습니다. 저장소 문서에 명시된 대로 공개 가능한 production 성능 측정치가 없으며, 위 수치는 모두 로컬 환경의 동작 검증 결과입니다.",
    "부하 테스트의 RPS는 5 VU 조건이라 처리량 지표가 아니고, webhook 구간은 같은 이벤트 ID를 재사용하는 중복 전달 확인용이라 결제 처리량으로 해석하지 않습니다.",
  ],
};
