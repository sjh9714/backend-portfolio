import Link from "next/link";
import { profile } from "@/content/profile";

/**
 * 서버 컴포넌트 + CSS 엔트런스(.rise)로만 렌더한다.
 * JS 하이드레이션을 기다리지 않으므로 LCP가 애니메이션에 묶이지 않는다.
 *
 * 파티클·프리로더를 걷어내고 타이포 자체로 승부한다 — lusion 임팩트의 상당 부분이 여기서 나온다.
 */
export function Hero() {
  return (
    <section
      aria-label="소개"
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 pb-16 pt-24"
    >
      <p className="rise label text-[var(--color-muted)]">
        {profile.role} · {profile.tagline}
      </p>

      <h1 className="rise-move rise-1 display mt-6">{profile.name}</h1>

      <p className="rise-move rise-2 headline mt-8 max-w-[20ch] text-balance">
        {profile.headline}
      </p>

      <p className="rise rise-3 mt-8 max-w-[54ch] leading-relaxed text-[var(--color-muted)]">
        {profile.lead}
      </p>

      <ul className="rise rise-4 mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-3" aria-label="핵심 근거">
        {profile.proofChips.map((chip) => (
          <li key={chip.text}>
            <Link
              href={chip.href}
              className="group block border-t border-[var(--color-fg)] pt-3 transition-colors hover:border-[var(--color-accent)]"
            >
              <span className="font-mono text-lg tracking-tight group-hover:text-[var(--color-accent)]">
                {chip.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rise rise-5 mt-14 flex flex-wrap items-center gap-6 text-sm">
        <a
          href="#work"
          className="border-b border-[var(--color-fg)] pb-1 font-medium transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          프로젝트 보기
        </a>
        <Link
          href="/resume"
          className="border-b border-transparent pb-1 text-[var(--color-muted)] transition-colors hover:border-[var(--color-fg)] hover:text-[var(--color-fg)]"
        >
          이력서
        </Link>
      </div>
    </section>
  );
}
