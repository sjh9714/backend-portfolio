import type { Project } from "../types";

const PERF = "https://github.com/sjh9714/ai-usage-billing-gateway/blob/main/docs/PERF_RESULT.md";

export const billingGateway: Project = {
  slug: "ai-usage-billing-gateway",
  name: "AI Usage Billing Gateway",
  oneLiner: "돈이 걸린 경계를 먼저 정하고, 각 경계마다 깨뜨려 보는 시나리오를 짝지었습니다",
  period: "2026.05 · 개인",
  role: "설계·구현·검증 전체",
  stage: {
    id: "gateway",
    label: "GATEWAY",
    caption: "요청이 인증되고, 계량되고, 같은 요청은 두 번 과금되지 않습니다",
  },

  narrative: {
    hook: "과금 시스템이 고장 나면 500 에러가 뜨지 않습니다. 요금이 두 번 청구될 뿐입니다.",

    setup: [
      "네트워크가 불안하면 클라이언트는 재시도합니다. 그게 정상 동작입니다. 그런데 사용량을 기록하는 API가 재시도를 새 요청으로 받으면, 같은 사용량이 두 번 쌓이고 그대로 청구서에 올라갑니다.",
      "이런 실패는 알림이 오지 않습니다. 고객이 청구서를 보고 문의할 때까지 아무도 모릅니다.",
    ],

    attempt: [
      "그래서 기능 목록부터 만들지 않았습니다. 대신 돈이 틀어질 수 있는 경계를 먼저 네 개로 좁혔습니다 — 중복 계량, 결제 webhook 재전달, 원장 불일치, 테넌트 간 데이터 누출.",
      "경계마다 방어 장치와 그것을 깨뜨려 보는 시나리오를 짝으로 만들었습니다. 사용량 기록에는 Idempotency-Key를 강제해 같은 키의 재요청이 새 row를 만들지 못하게 하고, 같은 키에 다른 본문이 오면 conflict로 거절합니다. webhook은 HMAC 서명을 검증한 뒤 이벤트 ID로 중복을 제거합니다.",
      "잔액은 UPDATE하지 않습니다. 모든 금액 변화를 append-only 원장에 기록하고, 환불도 삭제가 아니라 반대 방향 엔트리로 남깁니다. \"지금 잔액이 왜 이 값인지\"를 언제든 되짚을 수 있어야 하기 때문입니다.",
    ],

    twist: {
      question:
        "검증은 전부 통과했습니다. 그런데 이 프로젝트에는 성능 수치를 싣지 않았습니다.",
      finding: [
        "부하 테스트를 돌리긴 했습니다. 세 번 반복해서 체크 150개가 전부 통과했고 HTTP 실패는 0건이었습니다. 숫자만 보면 그럴듯한 RPS도 나옵니다.",
        "그런데 그 RPS는 5 VU로 돌린 값이라 처리량을 뜻하지 않습니다. webhook 구간은 같은 인보이스에 같은 이벤트 ID를 일부러 재사용하도록 짜여 있어서, 결제 처리량이 아니라 중복 전달 경로를 확인하는 용도입니다. 이걸 성능 수치로 옮기면 측정하지 않은 것을 측정했다고 말하는 셈이 됩니다.",
        "그래서 저장소 문서에 \"공개 가능한 production 처리량·지연시간·에러율 측정치는 없다\"고 먼저 못 박고, 여기 실린 수치는 전부 동작 검증 결과로만 두었습니다.",
      ],
    },

    lesson: [
      "측정값이 있다는 것과 그 값이 무엇을 뜻하는지 아는 것은 다른 일이었습니다. 숫자를 만드는 것보다 그 숫자가 무엇을 재지 않았는지 적는 쪽이 어려웠습니다.",
      "돈을 다루는 코드에서는 \"아마 괜찮을 것\"이 통하지 않습니다. 그래서 이 프로젝트에서 배운 것은 과금 로직이 아니라, 주장할 수 있는 것과 없는 것을 나누는 습관이었습니다.",
    ],
  },

  bullets: [
    {
      problem: "멀티테넌트에서 한 조직의 키가 다른 조직 데이터에 닿으면 안 된다",
      approach: "API Key는 해시만 저장하고, 모든 조회·기록 경로를 조직 스코프로 격리",
      result: "교차 테넌트 접근 차단을 통합 테스트로 고정",
    },
    {
      problem: "로컬에서 Prometheus 스크랩이 인증 정책 때문에 401을 반환했다",
      approach: "수치를 비워두거나 다른 값으로 채우지 않고, unavailable 사유를 artifact에 그대로 기록",
      result: "측정하지 못한 항목이 측정된 것처럼 보이지 않도록 남김",
    },
  ],

  metrics: [
    {
      label: "혼합 시나리오 체크 (3회 반복)",
      after: "150/150",
      evidence: "verified",
      source: { label: "PERF_RESULT · full mixed repeat3", href: PERF },
      condition: "로컬 · gateway·계량·인보이스·webhook 4개 경로 모두 실행",
    },
    {
      label: "HTTP 실패",
      after: "0 / 150",
      evidence: "verified",
      source: { label: "PERF_RESULT · full mixed repeat3", href: PERF },
      condition: "3회 반복 모두",
    },
    {
      label: "중복 과금·중복 결제 반영",
      after: "0건",
      evidence: "verified",
      source: { label: "멱등성·webhook dedup 검증", href: PERF },
      condition: "멱등 replay · duplicate delivery 시나리오",
    },
  ],

  tags: ["멱등성", "webhook 검증", "append-only 원장", "멀티테넌시"],

  stack: [
    "Java 21",
    "Spring Boot",
    "Spring Security",
    "PostgreSQL",
    "Redis",
    "JPA",
    "Flyway",
    "Testcontainers",
    "k6",
  ],

  diagram: {
    src: "/diagrams/billing-gateway.svg",
    alt: "API Key 인증 → 멱등성·쿼터 검사 → 사용량 계량 → 인보이스 → HMAC webhook → append-only ledger로 이어지는 과금 경계 구조",
  },

  links: { github: "https://github.com/sjh9714/ai-usage-billing-gateway" },

  claimBoundary:
    "이 프로젝트는 처리량·지연시간 벤치마크 수치를 주장하지 않습니다. 저장소 문서에 명시된 대로 공개 가능한 production 성능 측정치가 없으며, 위 수치는 모두 로컬 환경의 동작 검증 결과입니다. 부하 테스트의 RPS는 5 VU 조건이라 처리량 지표가 아니고, webhook 구간은 중복 전달 경로 확인용이라 결제 처리량으로 해석하지 않습니다.",
};
