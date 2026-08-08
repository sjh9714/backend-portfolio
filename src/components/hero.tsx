import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";
import { RotatingBadge } from "@/components/motion/rotating-badge";
import { profile } from "@/content/profile";

/**
 * 서버 컴포넌트 + CSS 엔트런스(.rise)로만 렌더한다.
 * JS 하이드레이션을 기다리지 않으므로 LCP가 애니메이션에 묶이지 않는다.
 *
 * 구도는 dennissnellenberg.com의 문법이다 — 거대 이름은 왼쪽 덩어리가 아니라
 * **화면 하단을 전폭으로 흐르는 마키**가 갖는다. 왼쪽 열에 이름·문장·문단을 다
 * 쌓았을 때는 첫 화면이 이력서 표지처럼 정적이었다. 이름이 흐르고 배지가 돌면
 * 같은 내용이 장면이 된다.
 *
 * h1은 마키 트랙의 첫 항목이다. 복제분만 aria-hidden이라 접근성 트리·SEO에는
 * 이름이 한 번 남고, 스모크 테스트의 h1 단언도 그대로 통과한다.
 */
export function Hero() {
  /*
   * 위쪽은 두 열이다. 왼쪽이 문장, 오른쪽이 근거 계기판.
   *
   * 칩은 한 벌만 렌더하고 grid로 자리를 옮긴다. 처음엔 데스크톱용·모바일용 두 벌을
   * 두고 CSS로 한쪽을 숨겼는데, 숨은 링크가 DOM에 남아 e2e가 걸려 넘어졌다 —
   * 같은 사실을 두 곳에 두면 화면에서도 탈이 난다.
   */
  return (
    <section aria-label="소개" className="flex min-h-svh flex-col pt-24">
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10">
        <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-20">
          <div>
            <p className="rise label text-[var(--color-muted)]">
              {profile.role} · {profile.tagline}
            </p>

            <p className="rise-move rise-2 headline mt-8 max-w-[20ch] text-balance">
              {profile.headline}
            </p>

            <p className="rise rise-3 mt-8 max-w-[54ch] leading-relaxed text-[var(--color-muted)]">
              {profile.lead}
            </p>
          </div>

          {/* 좁은 화면: 본문과 CTA 사이. 넓은 화면: 오른쪽 열, 아랫선을 맞춘 계기판 */}
          <ul
            className="rise rise-4 mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:grid-cols-1 lg:gap-y-7 lg:self-end"
            aria-label="핵심 근거"
          >
            {/* ↘ — 계기판이 아래 내용의 근거임을 가리키는 장식 (Dennis의 화살표 문법) */}
            <li aria-hidden="true" className="hidden lg:block">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 6l12 12M17 8.5V18H7.5" />
              </svg>
            </li>
            {profile.proofChips.map((chip) => (
              <li key={chip.text}>
                <Link
                  href={chip.href}
                  className="group block border-t border-[var(--color-fg)] pt-3 transition-colors hover:border-[var(--color-accent)]"
                >
                  <span className="font-mono text-lg tracking-tight group-hover:text-[var(--color-accent)] lg:text-xl">
                    {chip.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="rise rise-5 mt-14 flex flex-wrap items-center gap-6 text-sm lg:col-start-1">
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
            <RotatingBadge id="badge-hero" className="ml-auto hidden sm:block" />
          </div>
        </div>
      </div>

      {/* 하단 전폭 마키 — 이 화면의 주인공. 헤더 링크·본문과 같은 이름이 여기서는 크기로 말한다 */}
      <Marquee as="h1" text={`${profile.name} — 백엔드 개발자`} className="rise-move rise-1 pb-8" />
    </section>
  );
}
