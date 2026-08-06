import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudySection } from "@/components/case-study";
import { ProjectJsonLd } from "@/components/json-ld";
import { ServiceSection } from "@/components/service-section";
import { SiteHeader } from "@/components/site-header";
import { caseStudiesFor } from "@/content/case-studies";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: `${project.name} — 성진혁`, description: project.domain };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const studies = caseStudiesFor(project.slug);

  return (
    <>
      <ProjectJsonLd project={project} />
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <Link
          href="/#work"
          className="label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          ← Projects
        </Link>

        {/* ── 프로젝트 헤더 ── */}
        <p className="label mt-10 text-[var(--color-muted)]">{project.domain}</p>
        <h1 className="rise-move headline mt-3">{project.name}</h1>

        <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-[var(--color-fg)] pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="label text-[var(--color-muted)]">기간</dt>
            <dd className="mt-1.5">{project.period}</dd>
          </div>
          <div>
            <dt className="label text-[var(--color-muted)]">역할</dt>
            <dd className="mt-1.5">{project.role}</dd>
          </div>
          <div>
            <dt className="label text-[var(--color-muted)]">참여 인력</dt>
            <dd className="mt-1.5">{project.team ?? "개인 프로젝트"}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
          {project.stack.map((s) => (
            <span key={s} className="font-mono text-xs text-[var(--color-muted)]">
              {s}
            </span>
          ))}
        </div>

        <a
          href={project.links.github}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block border-b border-[var(--color-fg)] pb-1 text-sm font-medium transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          GitHub에서 코드 보기 ↗
        </a>

        {/* ── 무슨 서비스인가 (자료 p.9 "서비스: 프로젝트에 대한 개요") ── */}
        <ServiceSection service={project.service} />

        {/* ── 요약: 이력서에 한 줄로 들어가는 문장들 ── */}
        <section aria-label="요약" className="mt-16">
          <h2 className="label text-[var(--color-muted)]">요약</h2>
          <ul className="mt-5 space-y-3">
            {project.summary.map((line) => (
              <li key={line.slice(0, 24)} className="flex gap-3 leading-[1.7]">
                <span aria-hidden="true" className="text-[var(--color-muted)]">
                  ·
                </span>
                <span className="max-w-[62ch]">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 문제 해결 상세 ── */}
        {studies.length > 0 && (
          <section aria-label="문제 해결" className="mt-24 space-y-24">
            {studies.map((study, i) => (
              <CaseStudySection key={study.id} study={study} index={i} />
            ))}
          </section>
        )}

        {/* ── 구현 기능 (자료 p.9 "단순히 구현") ── */}
        <section aria-label="구현 기능" className="mt-24">
          <h2 className="label text-[var(--color-muted)]">구현 기능</h2>
          <p className="mt-3 max-w-[62ch] text-sm text-[var(--color-muted)]">
            위 문제 해결 외에, 서비스가 돌아가기 위해 구현한 것들입니다.
          </p>
          <ul className="mt-5 space-y-3">
            {project.features.map((line) => (
              <li key={line.slice(0, 24)} className="flex gap-3 leading-[1.7]">
                <span aria-hidden="true" className="text-[var(--color-muted)]">
                  ·
                </span>
                <span className="max-w-[62ch]">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 근거의 한계 ── */}
        {project.pendingMeasurement && (
          <section
            aria-label="수치를 싣지 않은 이유"
            className="mt-24 border-l-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-6"
          >
            <h2 className="label text-[var(--color-accent)]">수치를 싣지 않은 이유</h2>
            <p className="mt-3 text-sm leading-[1.8]">{project.pendingMeasurement}</p>
          </section>
        )}

        <aside
          aria-label="주장 범위"
          className="mt-6 border-t border-[var(--color-line)] pt-5 text-sm text-[var(--color-muted)]"
        >
          <h2 className="label">주장하지 않는 것</h2>
          <p className="mt-3 leading-[1.8]">{project.claimBoundary}</p>
        </aside>

        <div className="mt-16">
          <Link
            href="/#work"
            className="label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            ← Projects
          </Link>
        </div>
      </main>
    </>
  );
}
