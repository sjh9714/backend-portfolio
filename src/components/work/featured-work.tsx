import { Reveal } from "@/components/reveal";
import { projects } from "@/content/projects";
import { ProjectCard } from "./project-card";

export function FeaturedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="mx-auto max-w-6xl scroll-mt-16 px-6 py-24 sm:py-32"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-[var(--color-fg)] pb-4">
        <h2 id="work-title" className="label">
          Projects
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          각 프로젝트의 문제 해결 과정은 상세 페이지에 있습니다
        </p>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {/*
          갤러리는 전부 첫 화면 아래에 있으므로 어느 것도 우선 로드하지 않는다.
          fetchPriority=high를 걸면 화면 밖 사진이 폰트와 대역폭을 다퉈 본문 렌더가 밀린다.
        */}
        {projects.map((project, i) => (
          <Reveal key={project.slug}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
