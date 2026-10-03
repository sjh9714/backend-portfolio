import Link from "next/link";
import { Photo } from "@/components/photo";
import { caseStudies, featuredCases } from "@/content/case-studies";
import { getProject, visibleProjects } from "@/content/projects";

export function FeaturedWork() {
  const selectedSlugs = featuredCases.map(({ caseId }) => caseStudies.find(c => c.id === caseId)!.projectSlug);
  const additional = visibleProjects.filter(p => !selectedSlugs.includes(p.slug));
  return (
    <section id="work" aria-labelledby="work-title" className="page-shell work-section">
      <h2 id="work-title" className="sr-only">대표 프로젝트</h2>
      <div className="featured-projects">
        {featuredCases.map((featured, index) => {
          const study = caseStudies.find(c => c.id === featured.caseId)!;
          const project = getProject(study.projectSlug)!;
          return (
            <article key={study.id} data-case-id={study.id} className="project-preview">
              <Link href={`/projects/${project.slug}#${study.id}`} className="project-preview-link" aria-labelledby={`preview-${study.id}`}>
                <div className="project-preview-copy">
                  <p className="project-name">{project.name}</p>
                  <h3 id={`preview-${study.id}`}>{featured.title}</h3>
                  <p className="project-decision">{featured.summary}</p>
                </div>
                <div className={`project-cover ${project.slug}`}>
                  <Photo base={featured.cover.base} alt={featured.cover.alt} priority={index === 0}
                    width={featured.cover.width} height={featured.cover.height}
                    sizes="(min-width: 1088px) 496px, (min-width: 768px) 46vw, calc(100vw - 48px)" />
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      <section aria-labelledby="additional-title" className="additional-projects">
        <h2 id="additional-title">더 읽어보기</h2>
        {additional.map(project => {
          const study = caseStudies.find(c => c.projectSlug === project.slug)!;
          return (
            <article key={project.slug} className="additional-project">
              <Link href={`/projects/${project.slug}#${study.id}`} aria-labelledby={`additional-${project.slug}`}>
                <p className="project-name">{project.name}</p>
                <h3 id={`additional-${project.slug}`}>{study.title}</h3>
                <p>{study.summary}</p>
              </Link>
            </article>
          );
        })}
      </section>
    </section>
  );
}
