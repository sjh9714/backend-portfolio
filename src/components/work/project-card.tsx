import Link from "next/link";
import { Photo } from "@/components/photo";
import type { Project } from "@/content/types";

/**
 * 갤러리 카드. lusion의 배열 순서(비주얼 → 라벨 → 제목)를 따른다.
 *
 * 상태를 쓰지 않고 CSS group-hover만으로 반응하므로 서버 컴포넌트로 남는다.
 */
export function ProjectCard({
  project,
  index,
  priority = false,
}: {
  project: Project;
  index: number;
  priority?: boolean;
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-[var(--color-surface)]">
        <Photo
          base={project.photo.base}
          alt={project.photo.alt}
          priority={priority}
          className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {/* 액센트 틴트 — 사진 4장을 한 세트로 묶고 hover를 알린다 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[var(--color-accent)] opacity-0 mix-blend-color transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="label text-[var(--color-muted)]">{project.domain}</p>
        <span className="font-mono text-xs text-[var(--color-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="subhead mt-2 group-hover:text-[var(--color-accent)]">{project.name}</h3>

      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {project.summary[0]}
      </p>
    </Link>
  );
}
