import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { FeaturedWork } from "@/components/work/featured-work";
import { profile } from "@/content/profile";
import { fundamentals, strengths } from "@/content/skills";

function SkillsSection() {
  return (
    <section aria-labelledby="skills-title" className="mx-auto max-w-5xl px-5 py-24">
      <p className="font-mono text-sm font-semibold tracking-widest text-[var(--color-packet)]">
        200 OK
      </p>
      <h2 id="skills-title" className="mt-3 text-3xl font-bold tracking-tight">
        응답 본문 — 무엇으로 무엇을 했는가
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="font-mono text-sm font-semibold text-[var(--color-muted)]">기본기</h3>
          <ul className="mt-4 space-y-4">
            {fundamentals.map((s) => (
              <li key={s.area} className="text-sm leading-relaxed">
                <Link
                  href={`/projects/${s.projectSlug}`}
                  className="font-semibold text-[var(--color-fg)] underline-offset-4 hover:underline"
                >
                  {s.area}
                </Link>
                <span className="text-[var(--color-muted)]"> — {s.line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-sm font-semibold text-[var(--color-muted)]">강점</h3>
          <ul className="mt-4 space-y-4">
            {strengths.map((s) => (
              <li key={s.area} className="text-sm leading-relaxed">
                <Link
                  href={`/projects/${s.projectSlug}`}
                  className="font-semibold text-[var(--color-fg)] underline-offset-4 hover:underline"
                >
                  {s.area}
                </Link>
                <span className="text-[var(--color-muted)]"> — {s.line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <footer className="border-t border-[var(--color-line)]/60">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <p className="font-mono text-sm text-[var(--color-delivery)]">
          HTTP/1.1 200 OK · Connection: keep-alive
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          응답이 도착했습니다. 다음 요청을 기다립니다.
        </h2>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-lg bg-[var(--color-fg)] px-5 py-2.5 font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 font-semibold transition-colors hover:border-[var(--color-packet)]"
          >
            github.com/sjh9714
          </a>
          <Link
            href="/resume"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 font-semibold transition-colors hover:border-[var(--color-packet)]"
          >
            이력서 · PDF
          </Link>
        </div>
        <p className="mt-10 font-mono text-xs text-[var(--color-muted)]">
          © 2026 성진혁 · 모든 수치는 근거 문서로 연결됩니다
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedWork />
        <SkillsSection />
      </main>
      <ContactSection />
    </>
  );
}
