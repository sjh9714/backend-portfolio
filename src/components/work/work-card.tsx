"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Project } from "@/content/types";
import { STAGE_ACCENT } from "@/lib/stage-accents";
import { MiniSim } from "./mini-sim";

/**
 * Featured Work 카드.
 *
 * lusion의 배열 순서(태그 → 제목 → 비주얼)를 따르되, 비주얼 자리에 영상 대신
 * 그 시스템이 실제로 도는 루프를 넣는다. 마우스를 올리면 루프가 빨라진다.
 */
export function WorkCard({ project, index }: { project: Project; index: number }) {
  const [hot, setHot] = useState(false);

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={{ "--stage-accent": STAGE_ACCENT[project.stage.id] } as CSSProperties}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      className="group block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/30 p-5 transition-colors duration-300 hover:border-[var(--stage-accent)]/70 focus-visible:border-[var(--stage-accent)] focus-visible:outline-none sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] tracking-wide text-[var(--color-muted)]">
          {project.tags.join(" · ")}
        </p>
        <span className="shrink-0 font-mono text-[11px] text-[var(--color-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{project.name}</h3>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {project.oneLiner}
      </p>

      <div className="mt-5 h-[104px] overflow-hidden rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-bg)]/60">
        <MiniSim stage={project.stage.id} hot={hot} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] font-semibold tracking-widest text-[var(--stage-accent)]">
          {project.stage.label}
        </span>
        <span className="font-mono text-xs text-[var(--color-muted)] transition-colors group-hover:text-[var(--stage-accent)]">
          자세히 보기 →
        </span>
      </div>
    </Link>
  );
}
