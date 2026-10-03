/** 근거의 성격과 측정 조건을 콘텐츠 옆에 유지한다. */
export type Evidence = "measured" | "verified";

export interface MetricSource {
  label: string;
  href: string;
}

interface MetricBase {
  label: string;
  evidence: Evidence;
  source: MetricSource;
  condition: string;
}

/** 전후 변화, 대안 비교, 단일 관측을 서로 다른 형태로 표현한다. */
export type Metric = MetricBase & (
  | { kind: "before-after"; before: string; after: string; delta?: string }
  | { kind: "comparison"; values: { label: string; value: string }[] }
  | { kind: "observation"; value: string }
);

export type CaseTextField = "situation" | "cause" | "approach" | "result" | "limitations";

/** 본문은 사실을 복제하지 않고 기존 문단과 근거를 읽는 순서로 배치한다. */
export type CasePart =
  | { kind: "text"; field: CaseTextField; items?: number[] }
  | { kind: "metrics"; items?: number[] }
  | { kind: "figure" }
  | { kind: "alternatives" };

export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  sections: { heading: string; parts: CasePart[] }[];
  domain: string;
  projectSlug: string;
  situation: string;
  figure: { src: string; alt: string; caption: string; height?: number };
  cause: string[];
  alternatives: { option: string; reason: string; chosen: boolean }[];
  approach: string[];
  result: string[];
  metrics: Metric[];
  limitations: string[];
  sources: MetricSource[];
}

export interface Demo {
  screens: { base: string; alt: string; caption: string; width: number; height: number }[];
  stack: string;
  run: string;
  url: string;
  provenBy?: string[];
  preview?: { href: string; label: string; note: string };
}

export interface Service {
  what: string[];
  flow: string[];
  demo?: Demo;
  noDemo?: string;
}

export interface Project {
  slug: string;
  name: string;
  hidden?: boolean;
  domain: string;
  period: string;
  role: string;
  team?: string;
  /** 구현된 범위와 mock·미연결 경계를 프로젝트 첫 화면에 표시한다. */
  scope: string;
  /** 상세 글 첫 화면에 표시할 데이터·실행 범위. */
  caseNote: string;
  service: Service;
  summary: string[];
  features: string[];
  stack: string[];
  photo: { base: string; alt: string; credit: string };
  links: { github: string };
  claimBoundary: string[];
}
