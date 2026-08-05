import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ProjectJsonLd } from "@/components/json-ld";
import { MetricChip } from "@/components/metric-chip";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { SeatContentionSim } from "@/components/sim/seat-contention";
import { Act } from "@/components/story/act";
import { Hook } from "@/components/story/hook";
import { TwistPanel } from "@/components/story/twist-panel";
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
  const { narrative } = project;

  return (
    <>
      <ProjectJsonLd project={project} />
      <SiteHeader />
      <main
        style={{ "--stage-accent": accent } as CSSProperties}
        className="mx-auto max-w-3xl px-5 pb-24 pt-28"
      >
        <Link
          href="/#work"
          className="font-mono text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          ← 프로젝트 목록으로
        </Link>

        {/* ── 도입: 무대 이름과 훅. 스택·수치는 아직 나오지 않는다 ── */}
        <p className="mt-8 font-mono text-sm font-semibold tracking-widest text-[var(--stage-accent)]">
          {project.stage.label}
        </p>
        <h1 className="rise-move mt-2 text-4xl font-bold tracking-tight">{project.name}</h1>
        <Hook>{narrative.hook}</Hook>

        <p className="mt-6 font-mono text-xs text-[var(--color-muted)]">
          {project.period} · {project.role}
          {project.team && <> · {project.team}</>}
        </p>

        {/* ── 기 · 승 ── */}
        <Act label="상황" paragraphs={narrative.setup} />
        <Act label="해본 것" paragraphs={narrative.attempt} />

        {/* ── 전 · 절정. 대표 프로젝트는 여기서 직접 만져 볼 수 있다 ── */}
        {narrative.twist && (
          <TwistPanel twist={narrative.twist}>
            {project.slug === "concert-booking" && <SeatContentionSim />}
          </TwistPanel>
        )}

        {/* ── 결 ── */}
        <Act label="알게 된 것" paragraphs={narrative.lesson} />

        {/* ── 나머지 방어선: 서사에 들어가지 못한 것들 ── */}
        {project.bullets.length > 0 && (
          <Reveal>
            <section aria-label="나머지 방어선" className="mt-16">
              <h2 className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--color-muted)]">
                나머지 방어선
              </h2>
              <ul className="mt-5 space-y-5">
                {project.bullets.map((b) => (
                  <li
                    key={b.problem}
                    className="border-l pl-5"
                    style={{
                      borderColor: "color-mix(in oklch, var(--stage-accent) 40%, transparent)",
                    }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--color-muted)]">{b.problem}</p>
                    <p className="mt-1.5 text-sm leading-relaxed">
                      <span className="font-semibold text-[var(--stage-accent)]">→ </span>
                      {b.result}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {/* ── 근거: 수치와 주장 범위 ── */}
        {project.metrics.length > 0 && (
          <Reveal>
            <section aria-label="핵심 수치" className="mt-16">
              <h2 className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--color-muted)]">
                근거
              </h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {project.metrics.map((m) => (
                  <MetricChip key={m.label} metric={m} />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {project.pendingMeasurement && (
          <Reveal>
            <section
              aria-label="아직 측정하지 않은 것"
              className="mt-16 rounded-xl border border-dashed border-[var(--stage-accent)]/40 p-5"
            >
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--stage-accent)]">
                수치를 싣지 않은 이유
              </p>
              <p className="mt-3 text-sm leading-[1.85] text-[var(--color-fg)]/85">
                {project.pendingMeasurement}
              </p>
            </section>
          </Reveal>
        )}

        <aside
          aria-label="주장 범위"
          className="mt-6 rounded-xl border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]"
        >
          <p className="font-mono text-xs font-semibold">주장하지 않는 것</p>
          <p className="mt-2 leading-relaxed">{project.claimBoundary}</p>
        </aside>

        {/* ── 참고 정보: 스택과 구조도는 사이드로 내린다 ── */}
        <section aria-label="구성" className="mt-16">
          <h2 className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--color-muted)]">
            구성
          </h2>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-md border border-[var(--color-line)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-muted)]"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]/40">
            <Image
              src={project.diagram.src}
              alt={project.diagram.alt}
              width={880}
              height={420}
              className="w-full"
            />
          </div>
        </section>

        <div className="mt-12 flex gap-4 text-sm font-medium">
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 transition-colors hover:border-[var(--stage-accent)]"
          >
            GitHub에서 코드 보기
          </a>
          <Link
            href="/#work"
            className="rounded-lg px-5 py-2.5 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          >
            ← 목록으로
          </Link>
        </div>
      </main>
    </>
  );
}
