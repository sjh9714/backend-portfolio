import Link from "next/link";
import { profile } from "@/content/profile";
import { CurlIntro } from "./curl-intro";

/**
 * 히어로는 서버 컴포넌트 + CSS 엔트런스(.rise)로 렌더링한다.
 * JS 하이드레이션을 기다리지 않으므로 LCP가 애니메이션에 묶이지 않는다.
 */
export function Hero() {
  return (
    <section
      aria-label="소개"
      className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-5 pt-14"
    >
      <p className="rise font-mono text-sm text-[var(--color-packet)]">
        {profile.role} · {profile.tagline}
      </p>
      <h1 className="rise-move rise-1 mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
        {profile.name}
      </h1>
      <p className="rise-move rise-2 mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        {profile.headline}
      </p>
      <p className="rise-move rise-3 mt-4 max-w-2xl text-[var(--color-muted)]">{profile.lead}</p>

      <ul className="rise rise-4 mt-8 flex flex-wrap gap-2" aria-label="핵심 근거">
        {profile.proofChips.map((chip) => (
          <li key={chip.text}>
            <Link
              href={chip.href}
              className="inline-block rounded-full border border-[var(--color-line)] bg-[var(--color-surface)]/60 px-4 py-1.5 font-mono text-xs transition-colors hover:border-[var(--color-packet)]"
            >
              {chip.text}
            </Link>
          </li>
        ))}
      </ul>

      <div className="rise rise-5 mt-10 flex flex-wrap gap-3">
        <a
          href="#journey"
          className="rounded-lg bg-[var(--color-packet)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
        >
          요청 보내기 — 프로젝트 보기
        </a>
        <Link
          href="/resume"
          className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--color-packet)]"
        >
          이력서
        </Link>
      </div>

      <CurlIntro />
    </section>
  );
}
