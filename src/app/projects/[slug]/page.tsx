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
  return projects.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const study = caseStudiesFor(project.slug)[0];
  return { title: study ? `${study.title} | ${project.name}` : project.name, description: study?.summary ?? project.domain, ...(project.hidden ? { robots: { index: false, follow: true } } : {}) };
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
        <Link href="/#work" className="back-link">전체 프로젝트</Link>
        <section aria-label="문제 해결">
          {studies.map((study, index) => <CaseStudySection key={study.id} study={study} project={project} primary={index === 0} />)}
        </section>
        <section aria-label="프로젝트 정보" className="project-context">
          <h2>{project.name} 프로젝트</h2>
          <p>{project.domain}</p>
          <dl>
            <div><dt>기간</dt><dd>{project.period}</dd></div>
            <div><dt>담당</dt><dd>{project.role}</dd></div>
            <div><dt>구성</dt><dd>{project.team ?? "개인 프로젝트"}</dd></div>
          </dl>
          <p>{project.scope}</p>
          <p className="project-stack">{project.stack.join(", ")}</p>
          <a href={project.links.github} target="_blank" rel="noreferrer">GitHub 저장소</a>
          <h3>함께 구현한 기능</h3>
          <ul>{project.features.map(line => <li key={line}>{line}</li>)}</ul>
        </section>
        <ServiceSection service={project.service} />
        <aside aria-label="주장 범위" className="claim-boundary">
          <h2>자료와 검증 범위</h2>
          {project.claimBoundary.map(line => <p key={line}>{line}</p>)}
        </aside>
        <footer className="article-end"><Link href="/#work">전체 프로젝트로 돌아가기</Link><Link href="/resume">이력서 보기</Link></footer>
      </main>
    </>
  );
}
