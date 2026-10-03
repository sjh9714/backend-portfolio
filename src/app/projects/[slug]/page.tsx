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
      <main id="content" className="detail-shell">
        <Link href="/#work" className="text-link back-link">← 전체 사례</Link>
        <header className="project-header">
          <h1>{project.name}</h1>
          <p className="project-description">{project.domain}</p>
          <dl className="project-meta">
            <div><dt className="text-xs text-[var(--color-muted)]">기간</dt><dd className="mt-2">{project.period}</dd></div>
            <div><dt className="text-xs text-[var(--color-muted)]">역할</dt><dd className="mt-2 leading-relaxed">{project.role}</dd></div>
            <div><dt className="text-xs text-[var(--color-muted)]">참여 인력</dt><dd className="mt-2 leading-relaxed">{project.team ?? "개인 프로젝트"}</dd></div>
          </dl>
          <p className="project-scope"><span>구현 범위</span>{project.scope}</p>
          <div className="project-stack">{project.stack.map((s) => <span key={s}>{s}</span>)}</div>
          <a href={project.links.github} target="_blank" rel="noreferrer" className="text-link project-source">GitHub에서 코드 보기 ↗</a>
        </header>
        <nav aria-label="이 프로젝트의 사례" className="project-cases-nav">
          {studies.map((study) => <a key={study.id} href={`#${study.id}`} className="text-link py-1 leading-relaxed">{study.title} <span aria-hidden="true">↓</span></a>)}
        </nav>
        <section aria-label="문제 해결" className="case-studies">
          <h2 className="sr-only">문제 해결 사례</h2>
          {studies.map((study) => <CaseStudySection key={study.id} study={study} project={project} />)}
        </section>
        <section aria-label="구현 기능" className="project-features">
          <h2 className="text-xl font-semibold">함께 구현한 기능</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-[1.85] text-[var(--color-muted)]">{project.features.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
        <ServiceSection service={project.service} />
        <aside aria-label="주장 범위" className="claim-boundary">
          <h2 className="font-semibold text-[var(--color-fg)]">자료와 검증 범위</h2>
          <div className="mt-4 space-y-3 leading-[1.85]">{project.claimBoundary.map((line) => <p key={line}>{line}</p>)}</div>
        </aside>
        <div className="detail-end"><Link href="/#work" className="text-link text-sm">← 전체 사례로 돌아가기</Link></div>
      </main>
    </>
  );
}
