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

/**
 * 프로젝트 하나를 "사건"으로 서술하는 구조.
 *
 * bullets는 동등한 무게의 목록이라 클라이맥스를 만들 수 없다.
 * Narrative는 순서 자체가 의미를 갖는다 — twist가 절정이고, 시뮬레이터가 거기 앉는다.
 */
export interface Narrative {
  /**
   * 훅 — 한 문장. 전문용어를 쓰지 않는다.
   * 아직 아무것도 모르는 사람에게 "왜 이게 어려운가"의 긴장만 전달한다.
   */
  hook: string;
  /** 기 — 상황. 해결책은 아직 등장하지 않는다. */
  setup: string[];
  /** 승 — 정석대로 시도한 것. */
  attempt: string[];
  /**
   * 전 — 예상과 달랐던 지점. 없는 프로젝트도 있다.
   * question은 독자가 품게 될 의문, finding은 그 답.
   */
  twist?: { question: string; finding: string[] };
  /** 결 — 무엇을 알게 되었나. 통념이 어떻게 깨지는가. */
  lesson: string[];
}

export type StageId = "gateway" | "queue-lock" | "stream" | "delivery";

export interface Stage {
  id: StageId;
  /** HUD 표기 (예: "GATEWAY") */
  label: string;
  /** 요청 관점의 한 줄 내레이션 */
  caption: string;
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
  /** 페이지의 뼈대. 읽는 순서가 곧 사건의 전개 순서다. */
  narrative: Narrative;
  /**
   * 서사에 들어가지 못한 나머지 방어선.
   * 상세 페이지 하단에 압축 목록으로 렌더링된다 — 주인공이 아니다.
   */
  bullets: CaseBullet[];
  metrics: Metric[];
  /** Featured Work 카드 태그. stack 전체가 아니라 성격을 드러내는 4개 내외. */
  tags: string[];
  stack: string[];
  diagram: { src: string; alt: string };
  links: { github: string };
  /** 로컬 측정 등 주장 범위 한계 — 상세 페이지에 그대로 노출 */
  claimBoundary: string;
  /**
   * 수치를 싣지 않은 이유. 측정을 아직 못 했거나 근거가 현재 코드 기준이 아닐 때 쓴다.
   * 비워두고 넘어가는 대신 이유를 그대로 노출한다 — 없는 걸 없다고 말하는 것도 주장이다.
   */
  pendingMeasurement?: string;
}
