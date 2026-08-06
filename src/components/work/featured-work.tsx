import { Reveal } from "@/components/reveal";
import { visibleProjects } from "@/content/projects";
import { GalleryGL } from "./gallery-gl";
import { ProjectCard } from "./project-card";

/**
 * lusion Featured Work의 그리드 구조를 그대로 따른다 —
 * 12칼럼, 아이템 6칼럼 span(=2단), 칼럼 간격 24px.
 */
export function FeaturedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative isolate mx-auto max-w-6xl scroll-mt-16 px-6 py-24 sm:py-32"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-[var(--color-fg)] pb-4">
        <h2 id="work-title" className="label">
          Featured Work
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          각 프로젝트의 문제 해결 과정은 상세 페이지에 있습니다
        </p>
      </div>

      {/* 캔버스가 카드보다 먼저 와야 콘텐츠 아래에 깔린다 */}
      <GalleryGL />

      <div
        data-gl-grid
        className="relative z-10 mt-12 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-12"
      >
        {visibleProjects.map((project, i) => (
          <div key={project.slug} className="md:col-span-6">
            <Reveal>
              <ProjectCard project={project} index={i} />
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
