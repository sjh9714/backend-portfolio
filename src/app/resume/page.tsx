import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "이력서 — 성진혁",
  description: "신입 백엔드 개발자 성진혁의 이력서 — 동시성·정합성·실시간 처리를 수치로 증명",
};

export default function ResumePage() {
  return (
    <>
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="resume mx-auto max-w-3xl px-5 pb-24 pt-28 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-medium tracking-tight print:text-3xl">{profile.name}</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              {profile.role} · {profile.tagline}
            </p>
          </div>
          {/*
            연락처 링크는 inline-block + 세로 여백으로 24px을 채운다.
            글자만 감싸면 높이가 14px이라 손가락으로 정확히 누르기 어렵다(WCAG 2.2 목표 크기).
            인쇄본은 누를 일이 없으므로 여백을 되돌려 머리글이 늘어지지 않게 한다.
          */}
          <div className="text-right font-mono text-xs leading-relaxed text-[var(--color-muted)]">
            <p>
              <a
                href={`mailto:${profile.email}`}
                className="inline-block py-1.5 hover:underline print:py-0"
              >
                {profile.email}
              </a>
            </p>
            <p>
              <a href={profile.github} className="inline-block py-1.5 hover:underline print:py-0">
                github.com/sjh9714
              </a>
            </p>
            <p>
              <a href={profile.siteUrl} className="inline-block py-1.5 hover:underline print:py-0">
                포트폴리오 사이트
              </a>
            </p>
          </div>
        </header>

        <a
          href={resume.pdfPath}
          download
          className="mt-6 inline-block bg-[var(--color-fg)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent)] print:hidden"
        >
          PDF 다운로드
        </a>

        <section aria-labelledby="resume-intro" className="mt-10">
          <h2 id="resume-intro" className="resume-h2">
            소개
          </h2>
          {resume.intro.map((p) => (
            <p key={p.slice(0, 16)} className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {p}
            </p>
          ))}
        </section>

        <section aria-labelledby="resume-projects" className="mt-10">
          <h2 id="resume-projects" className="resume-h2">
            프로젝트
          </h2>
          <div className="mt-4 space-y-8">
            {resume.projects.map((p) => (
              <article key={p.name} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {p.period} · {p.headcount}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{p.summary}</p>
                <p className="mt-1 font-mono text-[11px] text-[var(--color-muted)]">{p.stack}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                  {p.bullets.map((b) => (
                    <li key={b.slice(0, 24)}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="resume-activities" className="mt-10">
          <h2 id="resume-activities" className="resume-h2">
            활동
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {resume.activities.map((a) => (
              <li key={a.name}>
                <span className="font-semibold">{a.name}</span>
                <span className="text-[var(--color-muted)]"> — {a.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
