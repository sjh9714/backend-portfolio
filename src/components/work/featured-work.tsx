import Link from "next/link";
import { Photo } from "@/components/photo";
import { caseStudies, featuredCases } from "@/content/case-studies";
import { getProject, visibleProjects } from "@/content/projects";

export function FeaturedWork() {
  const selectedSlugs = featuredCases.map(({ caseId }) => caseStudies.find(c => c.id === caseId)!.projectSlug);
  const additional = visibleProjects.filter(p => !selectedSlugs.includes(p.slug));
  return (
    <section id="work" aria-labelledby="work-title" className="page-shell work-section">
      <div className="section-heading">
        <h2 id="work-title">대표 프로젝트</h2>
        <p>사용 흐름에서 찾은 문제와 해결 과정</p>
      </div>
      <div className="featured-projects">
        {featuredCases.map((featured, index) => {
          const study = caseStudies.find(c => c.id === featured.caseId)!;
          const project = getProject(study.projectSlug)!;
          const projectHref = `/projects/${project.slug}`;
          return (
            <article key={study.id} data-case-id={study.id} className="project-preview">
              <figure className={`project-preview-image ${project.slug}`}>
                <a href={projectHref} aria-label={`${project.name} 프로젝트 상세 보기`} className="block rounded-[18px]">
                  <Photo base={project.photo.base} alt={project.photo.alt} priority={index === 0} width={1280} height={1024} sizes="(min-width: 768px) 380px, calc(100vw - 48px)" className="block h-auto w-full" />
                </a>
                <figcaption>{project.slug === "finmate" ? "기존 앱의 팀 시연 화면" : "로컬 예매 서비스 화면"}</figcaption>
              </figure>
              <div className="project-preview-copy">
                <h3><a href={projectHref} className="case-link">{project.name}</a></h3>
                <p className="project-purpose">{project.domain}</p>
                <p className="project-role">{project.team ? "팀 프로젝트" : "개인 프로젝트"} · 담당: {project.role}</p>
                <h4><a href={projectHref} className="case-link">{featured.title}</a></h4>
                <p className="project-decision">{featured.summary}</p>
                <div data-outcome className="project-outcome">
                  <span>확인한 결과</span>
                  <p>{featured.outcome}</p>
                  {study.metrics[0] && <a href={study.metrics[0].source.href} className="text-link" target="_blank" rel="noreferrer">검증 코드 보기</a>}
                </div>
                <p className="project-technologies">{project.stack.slice(0, 4).join(" · ")}</p>
              </div>
            </article>
          );
        })}
      </div>
      <section aria-labelledby="additional-title" className="additional-projects">
        <div className="section-heading"><h2 id="additional-title">추가 프로젝트</h2><p>전달 보장과 외부 정보의 경계</p></div>
        {additional.map(project => (
          <article key={project.slug} className="additional-project">
            <h3><Link href={`/projects/${project.slug}`} className="text-link">{project.name}</Link></h3>
            <p>{project.domain}</p>
            <span>{project.team ? "팀 프로젝트" : "개인 프로젝트"}</span>
          </article>
        ))}
      </section>
    </section>
  );
}
