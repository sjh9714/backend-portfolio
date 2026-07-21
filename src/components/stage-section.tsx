import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project, StageId } from "@/content/types";
import { MetricChip } from "./metric-chip";

export const STAGE_ACCENT: Record<StageId, string> = {
  gateway: "var(--color-gateway)",
  "queue-lock": "var(--color-queuelock)",
  stream: "var(--color-stream)",
  delivery: "var(--color-delivery)",
};

export function StageSection({ project, index }: { project: Project; index: number }) {
  const accent = STAGE_ACCENT[project.stage.id];

  return (
    <section
      id={`stage-${project.slug}`}
      aria-labelledby={`stage-title-${project.slug}`}
      data-stage={project.stage.id}
      style={{ "--stage-accent": accent } as CSSProperties}
      className="scroll-mt-20"
    >
      {/* 스테이지 HUD */}
      <div className="mb-6 flex items-baseline gap-3 font-mono text-sm">
        <span className="font-semibold tracking-widest text-[var(--stage-accent)]">
          {project.stage.label}
        </span>
        <span className="text-xs text-[var(--color-muted)]">{index + 1} / 4</span>
      </div>
      <p className="mb-4 font-mono text-xs text-[var(--color-muted)]">
        <span aria-hidden="true">└─ </span>
        {project.stage.caption}
      </p>

      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 id={`stage-title-${project.slug}`} className="text-2xl font-bold tracking-tight">
            {project.name}
          </h3>
          <span className="font-mono text-xs text-[var(--color-muted)]">{project.period}</span>
        </div>
        {project.team && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {project.team} · {project.role}
          </p>
        )}
        <p className="mt-3 max-w-2xl text-[var(--color-muted)]">{project.oneLiner}</p>

        {/* 문제 → 해결 → 결과 (홈에는 최대 3개) */}
        <ul className="mt-6 space-y-4">
          {project.bullets.slice(0, 3).map((b) => (
            <li
              key={b.problem}
              className="border-l-2 pl-4"
              style={{ borderColor: "color-mix(in oklch, var(--stage-accent) 55%, transparent)" }}
            >
              <p className="text-sm text-[var(--color-muted)]">{b.problem}</p>
              <p className="mt-1 text-sm">
                <span className="font-semibold text-[var(--stage-accent)]">→ </span>
                {b.result}
              </p>
            </li>
          ))}
        </ul>

        {project.metrics.length > 0 && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {project.metrics.map((m) => (
              <MetricChip key={m.label} metric={m} />
            ))}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          <Image
            src={project.diagram.src}
            alt={project.diagram.alt}
            width={880}
            height={420}
            className="w-full"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-1.5" aria-label="기술 스택">
            {project.stack.map((s) => (
              <li
                key={s}
                className="rounded-md border border-[var(--color-line)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-muted)]"
              >
                {s}
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 gap-4 text-sm font-medium">
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-muted)] underline-offset-4 hover:underline"
            >
              GitHub
            </a>
            <Link
              href={`/projects/${project.slug}`}
              className="text-[var(--stage-accent)] underline-offset-4 hover:underline"
            >
              자세히 보기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
