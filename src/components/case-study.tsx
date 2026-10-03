import Image from "next/image";
import { MetricChip } from "@/components/metric-chip";
import type { CasePart, CaseStudy, Project } from "@/content/types";

export function CaseStudySection({ study, project, primary = false }: { study: CaseStudy; project: Project; primary?: boolean }) {
  const Title = primary ? "h1" : "h2";
  const Heading = primary ? "h2" : "h3";
  return (
    <article id={study.id} aria-labelledby={`${study.id}-title`} className={`case-study${primary ? " case-study-primary" : ""}`}>
      <header className="article-header">
        <p className="article-project">{project.name}</p>
        <Title id={`${study.id}-title`}>{study.title}</Title>
        <p className="article-deck">{study.summary}</p>
        <p className="article-byline">{project.team ? "팀 프로젝트" : "개인 프로젝트"}<span aria-hidden="true"> / </span>담당: {project.role}</p>
        <p className="article-scope">{project.caseNote}</p>
      </header>
      <div className="article-body">
        {study.sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`${study.id}-section-${index}`} className="article-section">
            <Heading id={`${study.id}-section-${index}`}>{section.heading}</Heading>
            {section.parts.map((part, partIndex) => <ArticlePart key={partIndex} part={part} study={study} />)}
          </section>
        ))}
      </div>
      <footer className="article-sources">
        <Heading>관련 코드와 기록</Heading>
        <ul>{study.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </footer>
    </article>
  );
}

function ArticlePart({ part, study }: { part: CasePart; study: CaseStudy }) {
  if (part.kind === "text") {
    const value = study[part.field];
    const paragraphs = typeof value === "string" ? [value] : value;
    const selected = selectItems(paragraphs, part.items);
    return <div data-case-part={part.field} className="article-paragraphs">{selected.map(text => <p key={text}>{text}</p>)}</div>;
  }
  if (part.kind === "alternatives") {
    return <div data-case-part="alternatives" className="article-alternatives">{study.alternatives.map(alternative => (
      <p key={alternative.option} data-chosen={alternative.chosen || undefined}>
        <strong>{alternative.option}.</strong> {alternative.reason}
        {alternative.chosen && <span className="chosen-note">이 기준을 적용했습니다.</span>}
      </p>
    ))}</div>;
  }
  if (part.kind === "metrics") {
    const metrics = selectItems(study.metrics, part.items);
    return <div className="article-metrics">{metrics.map(metric => <MetricChip key={metric.label} metric={metric} />)}</div>;
  }
  return (
    <figure className="article-figure">
      <a href={study.figure.src} target="_blank" rel="noreferrer" aria-label={`${study.domain} 구조도 크게 보기`}>
        <Image src={study.figure.src} alt={study.figure.alt} width={880} height={study.figure.height ?? 420} loading="lazy" />
      </a>
      <figcaption>{study.figure.caption}<span>그림을 누르면 크게 볼 수 있습니다.</span></figcaption>
    </figure>
  );
}

function selectItems<T>(items: T[], indexes?: number[]): T[] {
  return indexes ? indexes.map(index => {
    const item = items[index];
    if (item === undefined) throw new Error(`사례에 없는 문단 또는 근거 참조: ${index}`);
    return item;
  }) : items;
}
