import type { ReactNode } from "react";

/**
 * 스크롤에 물려 아래에서 올라오는 등장.
 *
 * JS를 쓰지 않는다. `globals.css`의 `.reveal`이 `animation-timeline: view()`로
 * 스크롤 위치와 직접 연결되어 있고, 그 기능이 없는 브라우저는 @supports 블록을
 * 건너뛰어 콘텐츠가 처음부터 온전히 보인다.
 *
 * opacity 대신 clip-path 마스크를 쓰는 이유는 globals.css 주석 참조.
 * 스크롤 타임라인에서는 `animation-delay`가 동작하지 않으므로 stagger 옵션을 두지 않는다.
 */
export function Reveal({ children }: { children: ReactNode }) {
  return <div className="reveal">{children}</div>;
}
