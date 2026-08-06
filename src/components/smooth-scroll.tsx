"use client";

import { useEffect } from "react";

/**
 * 관성 스크롤. 스크롤이 미끄러지면서 `.reveal`의 마스크가 이어져 열린다 —
 * 이게 없으면 스크롤이 뚝뚝 끊겨 리빌도 계단처럼 보인다.
 *
 * 지키는 것:
 *  - reduced-motion이면 켜지 않는다
 *  - 터치 입력은 네이티브 스크롤 그대로 (모바일에 관성을 덧씌우면 오히려 어색하다)
 *  - 지연 로드라 첫 페인트·LCP 경로에 들어가지 않는다
 *  - 앵커 이동은 Lenis에 위임해 CSS smooth와 이중으로 움직이지 않게 한다
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let lenis: import("lenis").default | null = null;
    let raf = 0;
    let disposed = false;

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"], a[href*="/#"]');
      const href = anchor?.getAttribute("href");
      if (!lenis || !href) return;
      const hash = href.slice(href.indexOf("#"));
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -56 });
    };

    import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      document.documentElement.classList.add("lenis-on");
      const loop = (t: number) => {
        lenis?.raf(t);
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
      lenis?.destroy();
    };
  }, []);

  return null;
}
