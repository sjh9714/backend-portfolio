import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/photo";
import type { Project } from "@/content/types";
import { LetterRoll } from "./letter-roll";

/**
 * lusion Featured Work 아이템 구조를 그대로 따른다.
 *
 *   [ 이미지 5:4 ]        ← data-gl-plane: WebGL이 켜지면 이 rect에 평면을 맞춘다
 *   태그 · 태그 · 태그     ← line-1
 *   제 목                 ← line-2, 글자별 롤
 *
 * 이미지 요소는 WebGL이 켜져도 DOM에 남긴다 — alt 텍스트·SEO·폴백이 여기 있다.
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
    <Link
      href={`/projects/${project.slug}`}
      data-gl-item={project.slug}
      style={
        {
          "--card-bg": project.theme.bg,
          "--card-fg": project.theme.fg,
        } as CSSProperties
      }
      className="group block"
    >
      <div
        data-gl-plane
        className="relative overflow-hidden bg-[var(--color-surface)]"
        style={{ aspectRatio: "5 / 4" }}
      >
        <div className="photo-drift h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <Photo
            base={project.photo.base}
            alt={project.photo.alt}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={priority}
            className="h-full w-full object-cover"
          />
        </div>
        {/* 프로젝트 고유색 — hover 시 카드가 그 프로젝트의 색으로 물든다 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-color transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: "var(--card-bg)" }}
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="label text-[var(--color-muted)]">{project.domain}</p>
        <span className="font-mono text-xs text-[var(--color-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="subhead mt-2 transition-colors group-hover:text-[var(--color-accent)]">
        <LetterRoll text={project.name} />
      </h3>

      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {project.summary[0]}
      </p>
    </Link>
  );
}
