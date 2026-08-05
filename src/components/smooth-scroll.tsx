"use client";

import { useEffect } from "react";

/**
 * 관성 스크롤. lusion 계열 사이트의 "미끄러지는 느낌"이 여기서 나온다.
 *
 * 접근성 원칙:
 *  - reduced-motion이면 아예 켜지 않는다
 *  - 터치 입력은 네이티브 스크롤을 그대로 둔다 (모바일에서 관성을 덧씌우면 오히려 어색하다)
 *  - 앵커 이동은 Lenis에 위임해 CSS smooth와 충돌하지 않게 한다
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let lenis: import("lenis").default | null = null;
    let raf = 0;
    let disposed = false;

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (!lenis || !href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -56 });
    };

    import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
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
