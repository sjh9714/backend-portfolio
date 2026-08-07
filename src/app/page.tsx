import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { FeaturedWork } from "@/components/work/featured-work";
import { profile } from "@/content/profile";
import { fundamentals, strengths, type SkillLine } from "@/content/skills";

function SkillColumn({ title, note, items }: { title: string; note: string; items: SkillLine[] }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <h3 className="label">{title}</h3>
        <span className="text-xs text-[var(--color-muted)]">{note}</span>
      </div>
      <ul className="mt-6 space-y-6">
        {items.map((s) => (
          <li key={s.area}>
            <Link href={s.href} className="group block">
              <p className="font-medium group-hover:text-[var(--color-accent)]">{s.area}</p>
              <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-[var(--color-muted)]">
                {s.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 자료의 "기본기 60% + 강점 40%" 구성을 그대로 화면에 옮긴다.
 * 각 줄은 문제 해결 덩어리의 제목이고, 누르면 그 덩어리로 바로 간다.
 */
function SkillsSection() {
  return (
    <section
      aria-labelledby="skills-title"
      className="border-t border-[var(--color-line)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 id="skills-title" className="label border-b border-[var(--color-fg)] pb-4">
          Capability
        </h2>
        <div className="mt-12 grid gap-16 md:grid-cols-2">
          <SkillColumn title="기본기" note="락 · 쿼리와 인덱스 · Redis" items={fundamentals} />
          <SkillColumn title="강점" note="원인 규명 · 실시간 이벤트" items={strengths} />
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <footer className="bg-[var(--color-invert)] text-[var(--color-invert-fg)]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 className="display max-w-[12ch] text-balance">함께 일하고 싶습니다</h2>

        <div className="mt-16 grid gap-8 border-t border-white/20 pt-8 sm:grid-cols-3">
          <a href={`mailto:${profile.email}`} className="group block">
            <p className="label text-white/50">Email</p>
            <p className="mt-2 font-mono text-sm transition-colors group-hover:text-[var(--color-signal)]">
              {profile.email}
            </p>
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="group block">
            <p className="label text-white/50">GitHub</p>
            <p className="mt-2 font-mono text-sm transition-colors group-hover:text-[var(--color-signal)]">
              github.com/sjh9714
            </p>
          </a>
          <Link href="/resume" className="group block">
            <p className="label text-white/50">Resume</p>
            <p className="mt-2 font-mono text-sm transition-colors group-hover:text-[var(--color-signal)]">
              이력서 · PDF
            </p>
          </Link>
        </div>

        <p className="mt-16 text-xs text-white/50">
          © 2026 {profile.name} · 모든 수치는 근거 문서로 연결됩니다
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
