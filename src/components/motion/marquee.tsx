import type { JSX } from "react";

/**
 * 전폭 무한 마키 — dennissnellenberg.com 히어로 하단의 거대 이름 흐름.
 *
 * 같은 항목을 여섯 개 이어 붙이고 트랙을 -50%까지 밀면, 절반이 정확히 세 항목이라
 * 이어 붙은 자리가 보이지 않는다. 항목 하나가 뷰포트보다 넓으므로(글자 크기가 vw 기준)
 * 절반 세 개면 어떤 화면 폭도 덮는다.
 *
 * 접근성: 첫 항목만 실제 요소(as prop — 히어로에서는 h1)이고 나머지는 aria-hidden 복제다.
 * reduced-motion에서는 트랙이 멈춰 첫 항목이 정적으로 보인다 — e2e가 이를 단언한다.
 */
const COPIES = 6;

export function Marquee({
  text,
  as: First = "span",
  className = "",
}: {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track">
        <First className="marquee-item">
          {text}
          <span aria-hidden="true" className="marquee-sep">
            —
          </span>
        </First>
        {Array.from({ length: COPIES - 1 }, (_, i) => (
          <span key={i} aria-hidden="true" className="marquee-item">
            {text}
            <span className="marquee-sep">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
