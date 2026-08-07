import { visibleProjects } from "./projects";

/**
 * 이력서 데이터.
 *
 * **프로젝트 항목은 손으로 쓰지 않는다.** `src/content/projects/*.ts`에서 파생한다.
 * 예전에는 같은 사실을 프로젝트 데이터와 여기에 따로 적었고, 그래서 숫자가 갈라졌다
 * (이력서에만 있던 `p95 106–215ms`, 프로젝트에만 있던 줄들). 손으로 맞추는 한 또 갈라진다.
 *
 * 자료(『개발자를 위한 이력서 포트폴리오 완벽 가이드 2』)의 규칙이 그대로 이 매핑이다 —
 * 최상단에 "문제 + 해결 + 결과 + 도메인"을 3~4줄(`summary`), 그 아래 단순 구현 2~3줄(`features`).
 * 그러니 이력서 한 줄을 고치고 싶으면 프로젝트 파일을 고친다.
 *
 * 여기 손으로 남는 것은 프로젝트가 알 수 없는 것들뿐이다 — 소개, 활동, 학력.
 *
 * NOTE: 자격증은 아직 받지 않았다. 생기면 certifications 섹션으로 추가할 것.
 * 학력은 사용자에게 직접 받은 사실이다 (2026-08-07).
 */

export interface ResumeProject {
  name: string;
  period: string;
  headcount: string;
  role: string;
  stack: string;
  summary: string;
  bullets: string[];
}

const projects: ResumeProject[] = visibleProjects.map((p) => ({
  name: p.name,
  period: p.period,
  // `team`은 "인력 · 소속" 순서로 적는다. 이력서 머리줄에는 인력만 쓴다 —
  // 소속까지 넣으면 기간 옆에서 세 줄로 접히고, 소속은 아래 「활동」에 이미 있다.
  headcount: p.team?.split(" · ")[0] ?? "개인 프로젝트",
  role: p.role,
  stack: p.stack.join(", "),
  summary: p.domain,
  // 문제 해결이 먼저, 단순 구현이 그다음. 자료가 정한 순서다.
  bullets: [...p.summary, ...p.features],
}));

export const resume = {
  title: "성진혁 이력서",
  intro: [
    "동시성 제어와 데이터 정합성을 직접 재현하고 측정해 온 신입 백엔드 개발자입니다.",
    "좌석 예약 시스템에서 락 전략 3종을 같은 조건으로 실측 비교해 중복 판매 0건을 검증했고, 혼합 부하에서 Redis 재고 선차감으로 쓰기 p95를 37ms에서 6ms로 줄였습니다.",
    "Testcontainers 통합 테스트와 k6 부하 테스트로 주장에 근거를 붙이고, 측정하지 못한 항목은 측정하지 못했다고 문서에 남기는 방식으로 일합니다.",
  ],
  projects,
  activities: [
    {
      name: "하나금융그룹 × SK텔레콤 Tech4Good 2026",
      detail: "해커톤 — 교통약자 내비게이션 My ETA 개발 (15조 피프틴피프틴)",
    },
    {
      name: "하나금융그룹 청년 금융인재 양성 과정 (하나 파워온)",
      detail: "금융·데이터 교육 과정 수료 활동",
    },
  ],
  education: [
    {
      school: "가톨릭대학교 성심교정",
      major: "컴퓨터정보공학부",
      period: "2021.03 – 2028.03 (졸업 예정)",
    },
  ],
  pdfPath: "/resume-sung-jinhyuk.pdf",
} as const;
