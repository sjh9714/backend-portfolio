import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeJsonLd } from "@/components/json-ld";
import { LocalTime } from "@/components/motion/local-time";
import { Magnetic } from "@/components/motion/magnetic";
import { RollingText } from "@/components/motion/rolling-text";
import { RotatingBadge } from "@/components/motion/rotating-badge";
import { SiteHeader } from "@/components/site-header";
import { FeaturedWork } from "@/components/work/featured-work";
import { profile } from "@/content/profile";
import { fundamentals, strengths, type SkillLine } from "@/content/skills";

/**
 * 두 묶음을 좌우로 놓으면 4 : 2라 오른쪽 아래가 크게 빈다.
 * 위아래로 쌓고 각 묶음 안에서 두 칸씩 채우면 빈 곳이 없고,
 * 기본기가 두 줄 · 강점이 한 줄이라 비율도 그대로 보인다.
 */
function SkillGroup({ title, note, items }: { title: string; note: string; items: SkillLine[] }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 border-b border-[var(--color-line)] pb-3">
        <h3 className="label">{title}</h3>
        <span className="text-xs text-[var(--color-muted)]">{note}</span>
      </div>
      <ul className="mt-6 grid gap-x-16 gap-y-6 sm:grid-cols-2">
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
        <div className="mt-12 space-y-14">
          <SkillGroup
            title="기본기"
            note="락 · 쿼리와 인덱스 · 집계 · 동기와 비동기"
            items={fundamentals}
          />
          <SkillGroup title="강점" note="원인 규명 · 실시간 이벤트" items={strengths} />
        </div>
      </div>
    </section>
  );
}

/**
 * 푸터는 dennissnellenberg.com의 장면 문법이다 — 같은 문구("함께 일하고 싶습니다"는
 * 그 사이트의 "Let's work together"가 원조다)를 문장 하나로 크게 띄우는 게 아니라,
 * 곡면 진입 · 디바이더에 걸친 원형 CTA · 자석 필 버튼 · 로컬타임으로 하나의 장면을 만든다.
 * 로컬타임은 접속자가 아니라 서울 고정 — 이 사이트를 만드는 사람의 시간이다.
 */
function ContactSection() {
  return (
    <footer className="bg-[var(--color-invert)] text-[var(--color-invert-fg)]">
      {/* 위 밝은 섹션(surface)이 타원 곡선을 그리며 넘어온다 */}
      <div aria-hidden="true" className="overflow-hidden">
        <div className="footer-curve" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-14 sm:pt-24">
        <div className="relative">
          <h2 className="display max-w-[12ch] text-balance">함께 일하고 싶습니다</h2>
          <RotatingBadge
            id="badge-footer"
            size={92}
            className="absolute right-0 top-0 hidden text-white/80 sm:block"
          />
        </div>
        <p className="mt-8 text-sm text-white/60">신입 백엔드 자리를 찾고 있습니다.</p>

        {/* 디바이더에 걸치는 원형 CTA — 선이 버튼을 관통하는 게 의도다 */}
        <div className="relative mt-16 border-t border-white/25">
          <div className="absolute right-[6%] top-0 -translate-y-1/2">
            <Magnetic>
              <a href={`mailto:${profile.email}`} className="cta-circle text-sm font-medium">
                메일 보내기
              </a>
            </Magnetic>
          </div>
        </div>

        {/* 모바일은 원형 CTA가 디바이더 아래로 68px 내려오므로 첫 줄이 더 물러난다 */}
        <div className="mt-24 flex flex-wrap items-center gap-4 text-sm sm:mt-16">
          <Magnetic strength={0.25}>
            <a href={`mailto:${profile.email}`} className="pill-fill font-mono">
              {profile.email}
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <Link href="/resume" className="pill-fill">
              이력서 PDF
            </Link>
          </Magnetic>
        </div>

        <div className="mt-24 flex flex-wrap items-end justify-between gap-6 sm:mt-28">
          <p className="text-xs text-white/50">
            © 2026 {profile.name} · 모든 수치는 근거 문서로 연결됩니다
          </p>
          <div className="flex items-center gap-8">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="group label text-white/70 transition-colors hover:text-white"
            >
              <RollingText text="GitHub" />
            </a>
            <p className="label text-white/50">
              Seoul · <LocalTime /> KST
            </p>
          </div>
        </div>
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
