import Link from "next/link";
import { profile } from "@/content/profile";

/**
 * 서버 컴포넌트 + CSS 엔트런스(.rise)로만 렌더한다.
 * JS 하이드레이션을 기다리지 않으므로 LCP가 애니메이션에 묶이지 않는다.
 *
 * 파티클·프리로더를 걷어내고 타이포 자체로 승부한다 — lusion 임팩트의 상당 부분이 여기서 나온다.
 */
export function Hero() {
  /*
   * 넓은 화면에서는 두 열이다. 왼쪽이 이름과 문장, 오른쪽이 근거.
   *
   * 예전에는 전부 왼쪽에 쌓아 1440px에서 오른쪽 절반이 그냥 남았다 — 의도한 여백이
   * 아니라 남은 여백으로 읽혔다. 이 사이트의 정체성은 "측정하는 사람"이므로, 그 자리는
   * 장식이 아니라 측정값이 갖는 게 맞다. 칩 세 개를 계기판처럼 세로로 세운다.
   *
   * 칩은 한 벌만 렌더하고 grid로 자리를 옮긴다. 처음엔 데스크톱용·모바일용 두 벌을
   * 두고 CSS로 한쪽을 숨겼는데, 숨은 링크가 DOM에 남아 e2e가 걸려 넘어졌다 —
   * 같은 사실을 두 곳에 두면 화면에서도 탈이 난다.
   */
  return (
    <section
      aria-label="소개"
      className="mx-auto flex min-h-svh max-w-6xl items-center px-6 pb-16 pt-24"
    >
      <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-20">
        <div>
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
        </div>

        {/* 좁은 화면: 본문과 CTA 사이. 넓은 화면: 오른쪽 열, CTA와 아랫선을 맞춘 계기판 */}
        <ul
          className="rise rise-4 mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:grid-cols-1 lg:gap-y-7 lg:self-end"
          aria-label="핵심 근거"
        >
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
        </div>
      </div>
    </section>
  );
}
