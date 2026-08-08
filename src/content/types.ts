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

/**
 * 직접 만든 데모 UI. 없는 프로젝트도 있고, 없으면 없다고 쓴다.
 *
 * 화면은 **"이게 무슨 서비스인가"를 말하는 자리에만** 놓는다.
 * 문제 해결의 그림 자리에는 절대 넣지 않는다 — CaseStudy.figure 주석 참고.
 */
export interface Demo {
  /**
   * width/height는 캡처한 뷰포트 그대로 적는다. CLS를 0으로 유지하는 값이고,
   * 세로가 더 긴 모바일 화면은 이 값으로 판별해 좁은 폭으로 렌더한다.
   */
  screens: { base: string; alt: string; caption: string; width: number; height: number }[];
  /** 프론트 스택 한 줄 (예: "React 19 · TypeScript · Playwright e2e") */
  stack: string;
  /** 면접관이 그대로 복사해 띄울 수 있는 실행 한 줄 */
  run: string;
  /** 접속 주소 (예: "localhost:4173") */
  url: string;
  /** e2e가 화면 레벨에서 재현하는 시나리오. 자료가 "테스트 결과 근거"로 권하는 자리다. */
  provenBy?: string[];
}

/**
 * 이 프로젝트가 무슨 서비스인가.
 *
 * 자료 p.9 이력서 템플릿의 "서비스: 프로젝트에 대한 개요" 자리다.
 * 이게 없으면 문제 해결이 어디서 벌어진 일인지 알 수 없어 공중에 뜬다.
 */
export interface Service {
  /** 무슨 서비스인지 2~3줄 */
  what: string[];
  /** 사용자가 거치는 흐름. UI가 없는 서비스는 호출자 기준으로 적는다. */
  flow: string[];
  demo?: Demo;
  /** 데모가 없을 때 그 이유. 없는 걸 없다고 말하는 것도 주장이다. */
  noDemo?: string;
}

export interface Project {
  slug: string;
  name: string;
  /**
   * 기본 포트폴리오에서 감춘다. 갤러리·사이트맵·이력서·히어로에서 빠지지만
   * 상세 URL은 살아 있어 특정 공고에 링크로 건넬 수 있다.
   * 삭제가 아니다 — 지우면 되돌릴 수 없고, 감추면 한 줄로 되돌린다.
   */
  hidden?: boolean;
  /** 서비스 개요 한 줄. 자료 기준으로 길게 쓰지 않는다. */
  domain: string;
  period: string;
  role: string;
  /** 포지션별로 적는다 (예: "BE 1명 / FE 2명 / 기획 3명"). 없으면 개인 프로젝트. */
  team?: string;
  service: Service;
  /** 이력서용 압축 요약. "문제+해결+결과+도메인"이 한 줄에 들어간다. */
  summary: string[];
  /**
   * 자료의 "단순히 구현" 2~3줄. 문제 해결이 아닌 구현 기능이다.
   * 이게 없으면 트러블슈팅만 남아 서비스의 폭이 보이지 않는다.
   */
  features: string[];
  /** 버전을 함께 적는다 (예: "Java 21") */
  stack: string[];
  /** 갤러리 카드의 이미지. 도메인 분위기 담당이며 정보를 지지 않는다. */
  photo: { base: string; alt: string; credit: string };
  links: { github: string };
  /**
   * 주장의 범위 — 상세 페이지 맨 끝에 그대로 노출된다.
   *
   * 측정 환경, 저작 경계, 아직 안 된 일, 어떤 실행과는 비교할 수 없는지를 **여기 한 곳에** 적는다.
   * 예전에는 `pendingMeasurement`(뒤에 `readingCaveat`)가 따로 있었는데 하는 일이 같았고,
   * 강조 상자까지 붙어 페이지에서 가장 눈에 띄는 게 면책 문구가 됐다. 그래서 합쳤다.
   */
  claimBoundary: string;
}
