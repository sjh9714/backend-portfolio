/**
 * 콘텐츠 그래프 타입.
 *
 * 수치 정직성 원칙을 타입으로 강제한다:
 * - Metric은 evidence("measured" | "verified")와 source 링크 없이는 존재할 수 없다.
 * - "추정치"를 표현하는 타입 자체가 없다. 실측·검증되지 않은 수치는 실을 수 없다.
 */

/** measured = k6 등으로 수치를 직접 측정 / verified = 테스트·시나리오로 동작을 검증 */
export type Evidence = "measured" | "verified";

export interface MetricSource {
  label: string;
  href: string;
}

export interface Metric {
  label: string;
  /** before → after 표기. before가 없으면 단일 값 지표. */
  before?: string;
  after: string;
  delta?: string;
  evidence: Evidence;
  source: MetricSource;
  /** 측정 조건 요약 (예: "로컬 Docker, 100 VU"). 과장 방지용 문맥. */
  condition?: string;
}

/** 문제 → 해결 → 결과 순서를 강제하는 성과 불릿 */
export interface CaseBullet {
  problem: string;
  approach: string;
  result: string;
}

export type StageId = "gateway" | "queue-lock" | "stream" | "delivery";

export interface Stage {
  id: StageId;
  /** HUD 표기 (예: "GATEWAY") */
  label: string;
  /** 요청 관점의 한 줄 내레이션 */
  caption: string;
}

export interface DeepDiveSection {
  heading: string;
  /** 마크다운 아님 — 문단 배열. 렌더링 단순화를 위해 평문만. */
  paragraphs: string[];
  metrics?: Metric[];
  bullets?: CaseBullet[];
}

export interface Project {
  slug: string;
  name: string;
  oneLiner: string;
  period: string;
  role: string;
  /** 팀 프로젝트일 때만. 개인/팀 구분을 명시적으로. */
  team?: string;
  stage: Stage;
  bullets: CaseBullet[];
  metrics: Metric[];
  stack: string[];
  diagram: { src: string; alt: string };
  links: { github: string };
  /** 로컬 측정 등 주장 범위 한계 — 상세 페이지에 그대로 노출 */
  claimBoundary: string;
  deepDive: DeepDiveSection[];
}
