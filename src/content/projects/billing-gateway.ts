import type { Project } from "../types";

export const billingGateway: Project = {
  caseNote: "모의 AI 응답과 결제 이벤트를 사용한 로컬 검증입니다. 실제 AI 제공자나 PG를 연결한 서비스는 아닙니다.",
  slug: "ai-usage-billing-gateway",
  name: "사용량 과금 게이트웨이",
  domain: "멀티테넌트 AI 사용량 과금: 인증 · 계량 · 정산 원장",
  period: "2026.05",
  role: "설계 · 구현 · 검증 전체",
  scope: "mock AI 응답을 REQUEST 1회로 계량하는 API 프로젝트입니다. 멱등 요청·모의 결제 webhook·원장을 구현했으며 실제 AI 제공자와 PG는 연동하지 않았습니다.",
  service: {
    what: [
      "여러 조직의 API 사용량을 계량하고 인보이스와 원장에 반영하는 게이트웨이 프로토타입입니다.",
      "현재 호출 대상은 mock 응답입니다. 같은 요청의 재시도를 새 사용량으로 중복 기록하지 않는 경로를 다룹니다.",
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
    "동일 사용량 요청의 재시도를 Idempotency-Key로 구분해 검증 시나리오에서 중복 계량 0건 관측",
    "모의 결제 webhook의 HMAC 서명과 이벤트 ID를 검증해 재전달 중복 반영 0건 관측",
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
