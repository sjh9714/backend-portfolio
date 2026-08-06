/**
 * 콘텐츠 그래프 타입.
 *
 * 구조는 『개발자를 위한 이력서 포트폴리오 완벽 가이드 2』를 따른다:
 * - 이력서는 프로젝트 단위. 각 프로젝트마다 "문제+해결+결과+도메인"을 한 줄로 압축한다.
 * - 포트폴리오는 그 한 줄을 풀어 쓴 것이며, 단위는 프로젝트가 아니라 **문제 해결 하나**다.
 * - 한 덩어리는 제목 / 그림 / 문제 원인 3줄 / 해결 과정 3~4줄 / 결과 3줄로 고정한다.
 *
 * 수치 정직성 원칙도 타입으로 강제한다:
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

/**
 * 포트폴리오의 단위. 프로젝트가 아니라 문제 해결 하나.
 *
 * 자료의 규칙:
 * - title은 이력서에 한 줄로 압축해 둔 그 문장을 그대로 쓴다
 * - 그림 없는 항목은 넣지 않는다 ("그림으로 표현할 수 없다면 넣을 난이도가 아니다")
 * - cause/approach/result는 서술체가 아니라 개조식으로 끝낸다
 */
export interface CaseStudy {
  id: string;
  /** 이력서의 그 한 줄이 그대로 제목이 된다 */
  title: string;
  /** 어떤 도메인·기능에서 벌어진 일인지 (예: "좌석 예약 · 동시성 제어") */
  domain: string;
  projectSlug: string;
  /** 아키텍처·시퀀스·변경 전후. 앱 화면 캡처는 쓰지 않는다. */
  figure: { src: string; alt: string; caption: string };
  /** 문제 원인 — 3줄 */
  cause: string[];
  /** 해결 과정 — 3~4줄 */
  approach: string[];
  /** 결과 — 3줄 */
  result: string[];
  metrics: Metric[];
}

export interface Project {
  slug: string;
  name: string;
  /** 서비스 개요 한 줄. 자료 기준으로 길게 쓰지 않는다. */
  domain: string;
  period: string;
  role: string;
  /** 포지션별로 적는다 (예: "BE 1명 / FE 2명 / 기획 3명"). 없으면 개인 프로젝트. */
  team?: string;
  /** 이력서용 압축 요약. "문제+해결+결과+도메인"이 한 줄에 들어간다. */
  summary: string[];
  /** 버전을 함께 적는다 (예: "Java 21") */
  stack: string[];
  /** 갤러리 카드의 이미지. 도메인 분위기 담당이며 정보를 지지 않는다. */
  photo: { base: string; alt: string; credit: string };
  links: { github: string };
  /** 로컬 측정 등 주장 범위 한계 — 상세 페이지에 그대로 노출 */
  claimBoundary: string;
  /**
   * 수치를 싣지 않은 이유. 측정을 아직 못 했거나 근거가 현재 코드 기준이 아닐 때 쓴다.
   * 비워두고 넘어가는 대신 이유를 그대로 노출한다 — 없는 걸 없다고 말하는 것도 주장이다.
   */
  pendingMeasurement?: string;
}
