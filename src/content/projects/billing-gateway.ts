import type { Project } from "../types";

const PERF = "https://github.com/sjh9714/ai-usage-billing-gateway/blob/main/docs/PERF_RESULT.md";

export const billingGateway: Project = {
  slug: "ai-usage-billing-gateway",
  name: "AI Usage Billing Gateway",
  oneLiner:
    "재시도가 중복 과금이 되지 않도록 — API Key 발급부터 사용량 계량, 정산 원장까지 돈이 걸린 경계를 검증하는 멀티테넌트 게이트웨이",
  period: "2026.05 · 개인",
  role: "설계·구현·검증 전체",
  stage: {
    id: "gateway",
    label: "GATEWAY",
    caption: "요청이 인증되고, 계량되고, 같은 요청은 두 번 과금되지 않습니다",
  },
  bullets: [
    {
      problem: "클라이언트 재시도·네트워크 중복 전송이 그대로 중복 과금으로 이어질 수 있다",
      approach:
        "사용량 기록에 Idempotency-Key를 강제하고 조직 단위 쿼터·rate limit을 결합, k6 혼합 시나리오(게이트웨이 70%·계량 20%·인보이스 5%·webhook 5%)를 3회 반복 실행",
      result: "체크 150/150 통과 · HTTP 실패 0건 · 중복 계량 0건 (3회 모두)",
    },
    {
      problem: "PG webhook은 재전달·순서 뒤바뀜·위조가 전제 조건이다",
      approach:
        "HMAC 서명 검증과 providerEventId 기반 중복 제거를 두고, 같은 이벤트의 중복 전달을 시나리오로 재현",
      result: "duplicate delivery가 결제 상태를 두 번 바꾸지 않음을 통합 테스트·k6 branch로 검증",
    },
    {
      problem: "환불·조정이 섞이면 \"지금 잔액이 왜 이 값인지\"를 추적할 수 없게 된다",
      approach: "잔액을 덮어쓰지 않는 append-only ledger와 감사 로그로 모든 금액 변화를 이력화",
      result: "환불 흐름 포함 원장 정합성을 Testcontainers 통합 테스트로 검증",
    },
    {
      problem: "멀티테넌트에서 한 조직의 키가 다른 조직 데이터에 닿으면 안 된다",
      approach: "API Key는 해시만 저장하고, 모든 조회·기록 경로를 조직 스코프로 격리",
      result: "교차 테넌트 접근 차단을 통합 테스트로 고정",
    },
  ],
  metrics: [
    {
      label: "혼합 시나리오 체크 (3회 반복)",
      after: "150/150",
      evidence: "verified",
      source: { label: "PERF_RESULT · full mixed repeat3", href: PERF },
      condition: "로컬 · 4개 경로 모두 실행",
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
    "이 프로젝트는 처리량·지연시간 벤치마크 수치를 주장하지 않습니다. 저장소 문서에 명시된 대로 공개 가능한 성능 측정치가 없으며, 위 수치는 모두 동작 검증(불변식) 결과입니다.",
  deepDive: [
    {
      heading: "무엇이 깨질 수 있는가에서 시작했다",
      paragraphs: [
        "과금 시스템의 실패는 500 에러가 아니라 \"조용히 두 번 청구된 요금\"입니다. 그래서 기능 목록이 아니라 깨질 수 있는 경계 4개 — 중복 계량, webhook 재전달, 원장 불일치, 테넌트 격리 — 를 먼저 정의하고, 각 경계마다 방어 장치와 그것을 재현·검증하는 시나리오를 짝으로 만들었습니다.",
      ],
    },
    {
      heading: "멱등성은 \"같은 응답\"이 아니라 \"같은 결과\"",
      paragraphs: [
        "사용량 기록 API는 Idempotency-Key를 강제합니다. 같은 키의 재요청은 새 row를 만들지 않고, 같은 키로 다른 본문이 오면 conflict로 거절합니다. k6 혼합 시나리오를 3회 반복해 게이트웨이·직접 계량·인보이스·webhook 경로가 모두 실행되는 조건에서 체크 150/150, HTTP 실패 0, 중복 row 0을 확인했습니다.",
      ],
    },
    {
      heading: "원장은 덮어쓰지 않는다",
      paragraphs: [
        "잔액 컬럼을 UPDATE하는 대신 모든 금액 변화를 append-only ledger에 기록합니다. 환불도 삭제가 아니라 반대 방향 엔트리입니다. 웹훅은 HMAC 서명을 검증한 뒤 providerEventId로 중복 제거하므로, 같은 결제 완료 이벤트가 두 번 와도 원장에는 한 번만 반영됩니다.",
      ],
    },
    {
      heading: "수치를 싣지 않은 이유",
      paragraphs: [
        "이 저장소의 성능 문서는 \"공개 가능한 벤치마크 수치 없음\"을 명시합니다. 로컬 smoke에서 관찰된 지연시간이 있지만, 반복·고정 환경 조건을 갖추기 전에는 성능 주장으로 승격하지 않는다는 원칙을 지켰습니다. 여기 실린 수치는 전부 정합성 검증 결과입니다.",
      ],
    },
  ],
};
