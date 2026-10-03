import Image from "next/image";
import { MetricChip } from "@/components/metric-chip";
import type { CaseStudy, Project } from "@/content/types";

export function CaseStudySection({ study, project }: { study: CaseStudy; project: Project }) {
  return (
    <section id={study.id} aria-labelledby={`${study.id}-title`} className="case-study scroll-mt-24 border-t border-[var(--color-fg)] pt-7">
      <p className="text-sm text-[var(--color-accent)]">{study.domain}</p>
      <h3 id={`${study.id}-title`} className="mt-4 max-w-[34ch] text-balance text-2xl font-semibold leading-[1.45] tracking-tight sm:text-3xl">{study.title}</h3>
      <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">{project.name} · 담당: {project.role}</p>
      <div className="mt-9 space-y-9">
        <div className="case-block">
          <h4>상황과 조건</h4>
          <p className="leading-[1.85]">{study.situation}</p>
        </div>
        <Block label="관찰한 원인" items={study.cause} />
        <figure>
          <div className="overflow-hidden border border-[var(--color-line)] bg-white">
            <Image src={study.figure.src} alt={study.figure.alt} width={880} height={study.figure.height ?? 420} loading="lazy" className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-xs leading-relaxed text-[var(--color-muted)]">
            <span>{study.figure.caption}</span>
            <a href={study.figure.src} target="_blank" rel="noreferrer" className="text-link inline-block py-1 text-[var(--color-accent)]" aria-label={`${study.domain} 구조도 크게 보기`}>구조도 크게 보기 ↗</a>
          </figcaption>
        </figure>
        <div className="case-block">
          <h4>대안과 선택</h4>
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {study.alternatives.map((alternative) => (
              <li key={alternative.option} className="py-4 first:pt-4">
                <p className="font-medium">{alternative.option}{alternative.chosen && <span className="ml-3 inline-block bg-[var(--color-accent)] px-2 py-0.5 align-middle text-xs font-normal text-white">선택</span>}</p>
                <p className="mt-2 text-sm leading-[1.85] text-[var(--color-muted)]">{alternative.reason}</p>
              </li>
            ))}
          </ul>
        </div>
        <Block label="적용 과정" items={study.approach} />
        <Block label="결과와 근거" items={study.result} />
        <div className="grid items-start gap-5 sm:grid-cols-2">
          {study.metrics.map((metric) => <MetricChip key={metric.label} metric={metric} />)}
        </div>
        <div className="case-block border-t border-[var(--color-line)] pt-6">
          <h4>남은 한계</h4>
          <ul className="space-y-3 text-sm leading-[1.85] text-[var(--color-muted)]">
            {study.limitations.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
        <div className="case-block">
          <h4>코드와 기록</h4>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {study.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer" className="text-link inline-block py-1 text-sm text-[var(--color-accent)]">{source.label} <span aria-hidden="true">↗</span></a></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="case-block">
      <h4>{label}</h4>
      <ul className="space-y-3 leading-[1.85]">
        {items.map((text) => <li key={text} className="flex gap-3"><span aria-hidden="true" className="text-[var(--color-muted)]">·</span><span>{text}</span></li>)}
      </ul>
    </div>
  );
}
