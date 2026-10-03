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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: `${project.name}: 성진혁`, description: project.domain, ...(project.hidden ? { robots: { index: false, follow: true } } : {}) };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const studies = caseStudiesFor(project.slug);
  return (
    <>
      <ProjectJsonLd project={project} />
      <SiteHeader />
      <main id="content" className="detail-shell pb-20 pt-10">
        <Link href="/#work" className="text-link text-sm text-[var(--color-muted)]">← 전체 사례</Link>
        <header className="mt-9">

          <h1 className="mt-3 text-balance text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">{project.name}</h1>
          <p className="mt-4 max-w-[64ch] leading-[1.8] text-[var(--color-muted)]">{project.domain}</p>
          <dl className="mt-7 grid gap-x-8 gap-y-4 border-y border-[var(--color-line)] py-5 text-sm sm:grid-cols-[1fr_1fr_1.5fr]">
            <div><dt className="text-xs text-[var(--color-muted)]">기간</dt><dd className="mt-2">{project.period}</dd></div>
            <div><dt className="text-xs text-[var(--color-muted)]">역할</dt><dd className="mt-2 leading-relaxed">{project.role}</dd></div>
            <div><dt className="text-xs text-[var(--color-muted)]">참여 인력</dt><dd className="mt-2 leading-relaxed">{project.team ?? "개인 프로젝트"}</dd></div>
          </dl>
          <p className="mt-5 max-w-[72ch] text-sm leading-[1.85]"><span className="mr-3 font-semibold">구현 범위</span>{project.scope}</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">{project.stack.map((s) => <span key={s} className="text-xs text-[var(--color-muted)]">{s}</span>)}</div>
          <a href={project.links.github} target="_blank" rel="noreferrer" className="text-link mt-5 inline-block py-1 text-sm text-[var(--color-accent)]">GitHub에서 코드 보기 ↗</a>
        </header>
        <nav aria-label="이 프로젝트의 사례" className="mt-8 flex flex-col items-start gap-1 border-l-2 border-[var(--color-line)] pl-5 text-sm">
          {studies.map((study) => <a key={study.id} href={`#${study.id}`} className="text-link py-1 leading-relaxed">{study.title} <span aria-hidden="true">↓</span></a>)}
        </nav>
        <section aria-label="문제 해결" className="mt-12 space-y-20 sm:space-y-24">
          <h2 className="sr-only">문제 해결 사례</h2>
          {studies.map((study) => <CaseStudySection key={study.id} study={study} project={project} />)}
        </section>
        <section aria-label="구현 기능" className="mt-20 border-t border-[var(--color-line)] pt-7">
          <h2 className="text-xl font-semibold">함께 구현한 기능</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-[1.85] text-[var(--color-muted)]">{project.features.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
        <ServiceSection service={project.service} />
        <aside aria-label="주장 범위" className="mt-16 border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-muted)]">
          <h2 className="font-semibold text-[var(--color-fg)]">자료와 검증 범위</h2>
          <div className="mt-4 space-y-3 leading-[1.85]">{project.claimBoundary.map((line) => <p key={line}>{line}</p>)}</div>
        </aside>
        <div className="mt-12 border-t border-[var(--color-line)] pt-6"><Link href="/#work" className="text-link text-sm">← 전체 사례로 돌아가기</Link></div>
      </main>
    </>
  );
}
