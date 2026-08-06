"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * 관성 스크롤. 스크롤이 미끄러지면서 `.reveal`의 마스크가 이어져 열린다 —
 * 이게 없으면 스크롤이 뚝뚝 끊겨 리빌도 계단처럼 보인다.
 *
 * 지키는 것:
 *  - reduced-motion이면 켜지 않는다
 *  - 터치 입력은 네이티브 스크롤 그대로 (모바일에 관성을 덧씌우면 오히려 어색하다)
 *  - 지연 로드라 첫 페인트·LCP 경로에 들어가지 않는다
 *  - 앵커 이동은 Lenis에 위임해 CSS smooth와 이중으로 움직이지 않게 한다
 *  - 페이지를 옮기면 맨 위에서 시작한다 (아래 「페이지를 옮길 때」)
 */

// 서버 렌더에서는 layout effect를 쓸 수 없다. 정적 내보내기라 프리렌더가 돈다.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function SmoothScroll() {
  const lenisRef = useRef<import("lenis").default | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let disposed = false;

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"], a[href*="/#"]');
      const href = anchor?.getAttribute("href");
      const lenis = lenisRef.current;
      if (!lenis || !href) return;
      const hash = href.slice(href.indexOf("#"));
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -56 });
    };

    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenisRef.current = lenis;
      document.documentElement.classList.add("lenis-on");
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      document.addEventListener("click", onAnchorClick);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onAnchorClick);
      document.documentElement.classList.remove("lenis-on");
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  /*
   * 페이지를 옮길 때.
   *
   * Lenis는 스크롤 위치를 자기가 들고 있다. Next가 라우트 이동에서 window를 0으로 되돌려도
   * Lenis가 다음 프레임에 들고 있던 예전 위치를 다시 써 버려서, 프로젝트를 누르면
   * 화면 중간부터 열렸다. 실제로 홈에서 2,500px 내린 뒤 누르면 1,735px에서 시작했다.
   *
   * 그래서 경로가 바뀌면 Lenis에게도 0으로 가라고 말한다. `immediate`는 미끄러지지 않고
   * 즉시 옮기라는 뜻이다 — 새 페이지가 스르륵 올라가는 건 이동이 아니라 오작동처럼 보인다.
   *
   * 해시가 있으면 건드리지 않는다. `/#work`로 온 경우 그 자리로 가야 한다.
   * layout effect인 이유는 페인트 전에 끝내야 한 프레임 깜빡이지 않기 때문이다.
   */
  useIsoLayoutEffect(() => {
    if (window.location.hash.length > 1) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
