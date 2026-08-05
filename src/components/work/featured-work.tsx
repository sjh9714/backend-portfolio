import { projects } from "@/content/projects";
import { Reveal } from "@/components/reveal";
import { WorkCard } from "./work-card";

/**
 * 프로젝트 갤러리. 요청이 지나는 순서(GATEWAY → QUEUE·LOCK → STREAM → DELIVERY)가
 * 곧 카드 순서다 — 정렬 기준 자체가 "요청의 여정" 콘셉트를 이어받는다.
 */
export function FeaturedWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-5xl scroll-mt-16 px-5 py-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="work-title" className="text-sm font-semibold tracking-[0.2em] text-[var(--color-muted)]">
          FEATURED WORK
        </h2>
        <p className="font-mono text-xs text-[var(--color-muted)]">
          요청이 지나는 순서대로 — 관문에서 도착까지
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug}>
            <WorkCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
