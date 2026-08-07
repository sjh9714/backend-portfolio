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
   * 해시가 있으면 0이 아니라 **그 자리로** 간다. 예전에는 여기서 그냥 손을 뗐는데,
   * Lenis가 스크롤을 들고 있는 동안에는 브라우저의 해시 이동이 먹지 않아 결국 맨 위에서
   * 열렸다. 홈의 Capability가 덩어리를 직접 가리키게 되면서 드러난 문제다.
   *
   * layout effect인 이유는 페인트 전에 끝내야 한 프레임 깜빡이지 않기 때문이다.
   */
  useIsoLayoutEffect(() => {
    const { hash } = window.location;
    const target = hash.length > 1 ? document.querySelector(hash) : null;

    if (target) {
      // Lenis는 지연 로드라 아직 안 붙어 있을 수 있다. 그때는 네이티브로 옮긴다 —
      // 나중에 Lenis가 붙으면 그 시점의 위치를 그대로 이어받는다.
      if (lenisRef.current) {
        // 먼저 치수를 다시 재게 한다. Lenis는 이전 페이지의 최대 스크롤값을 들고 있어서,
        // 그대로 부르면 거기에 걸려 중간에 멈췄다가 뒤늦게 미끄러져 내려갔다.
        // 실측으로 0ms에 2,828px에서 멈췄다가 600ms에 걸쳐 5,175px로 갔다.
        lenisRef.current.resize();
        // 오프셋을 주지 않는다. Lenis가 이미 `scroll-mt-20`(scroll-margin-top)을 반영해
        // 덩어리 위에 80px을 남긴다. 여기서 -80을 더 주면 160px이 됐다가 브라우저가
        // 100ms 뒤 되돌려 화면이 한 번 튄다.
        lenisRef.current.scrollTo(target as HTMLElement, { immediate: true, force: true });
      } else {
        // `behavior: "instant"`가 꼭 필요하다. 기본값은 CSS의 `scroll-behavior: smooth`를
        // 따라가서, 페이지가 열린 뒤 600ms에 걸쳐 스르륵 내려갔다 — 이동이 아니라
        // 오작동처럼 보인다. 실측으로 0ms에 2,828px, 600ms에 5,175px이었다.
        (target as HTMLElement).scrollIntoView({ behavior: "instant", block: "start" });
      }
      return;
    }

    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
