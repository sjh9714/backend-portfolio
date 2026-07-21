import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { MetricChip } from "@/components/metric-chip";
import { SiteHeader } from "@/components/site-header";
import { STAGE_ACCENT } from "@/lib/stage-accents";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.name} — 성진혁`,
    description: project.oneLiner,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const accent = STAGE_ACCENT[project.stage.id];

  return (
    <>
      <SiteHeader />
      <main
        style={{ "--stage-accent": accent } as CSSProperties}
        className="mx-auto max-w-3xl px-5 pb-24 pt-28"
      >
        <Link
          href={`/#stage-${project.slug}`}
          className="font-mono text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          ← 여정으로 돌아가기
        </Link>

        <p className="mt-8 font-mono text-sm font-semibold tracking-widest text-[var(--stage-accent)]">
          {project.stage.label}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{project.name}</h1>
        <p className="mt-3 text-lg text-[var(--color-muted)]">{project.oneLiner}</p>

        <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 font-mono text-[var(--color-muted)]">기간</dt>
            <dd>{project.period}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-mono text-[var(--color-muted)]">역할</dt>
            <dd>{project.role}</dd>
          </div>
          {project.team && (
            <div className="flex gap-2 sm:col-span-2">
              <dt className="shrink-0 font-mono text-[var(--color-muted)]">팀</dt>
              <dd>{project.team}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-[var(--color-line)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-muted)]"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]/40">
          <Image
            src={project.diagram.src}
            alt={project.diagram.alt}
            width={880}
            height={420}
            className="w-full"
            priority
          />
        </div>

        {project.metrics.length > 0 && (
          <section aria-label="핵심 수치" className="mt-10">
            <div className="grid gap-2 sm:grid-cols-2">
              {project.metrics.map((m) => (
                <MetricChip key={m.label} metric={m} />
              ))}
            </div>
          </section>
        )}

        <section aria-label="문제와 해결" className="mt-12 space-y-8">
          {project.bullets.map((b, i) => (
            <div
              key={b.problem}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]/40 p-5"
            >
              <p className="font-mono text-xs text-[var(--color-muted)]">문제 {i + 1}</p>
              <p className="mt-1 font-medium">{b.problem}</p>
              <p className="mt-3 font-mono text-xs text-[var(--color-muted)]">해결</p>
              <p className="mt-1 text-sm text-[var(--color-fg)]/90">{b.approach}</p>
              <p className="mt-3 font-mono text-xs text-[var(--stage-accent)]">결과</p>
              <p className="mt-1 text-sm font-medium">{b.result}</p>
            </div>
          ))}
        </section>

        <section aria-label="깊이 읽기" className="mt-14 space-y-10">
          {project.deepDive.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="mt-3 leading-relaxed text-[var(--color-muted)]">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </section>

        <aside
          aria-label="주장 범위"
          className="mt-14 rounded-xl border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]"
        >
          <p className="font-mono text-xs font-semibold">주장하지 않는 것</p>
          <p className="mt-2 leading-relaxed">{project.claimBoundary}</p>
        </aside>

        <div className="mt-10 flex gap-4 text-sm font-medium">
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 transition-colors hover:border-[var(--stage-accent)]"
          >
            GitHub에서 코드 보기
          </a>
          <Link
            href={`/#stage-${project.slug}`}
            className="rounded-lg px-5 py-2.5 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          >
            ← 여정으로
          </Link>
        </div>
      </main>
    </>
  );
}
