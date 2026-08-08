"use client";

import { useRef, type ReactNode } from "react";

/**
 * 자석 버튼 — 커서가 위에 있는 동안 자식이 커서 쪽으로 끌리고, 떠나면 제자리로 돌아온다.
 *
 * rAF 스프링 대신 CSS transition에 맡긴다 — mousemove마다 목표만 갱신하면
 * transition이 따라오며 감쇠가 생겨 스프링처럼 보인다. JS는 좌표 계산뿐이다.
 * 터치(hover 없음)와 reduced-motion에서는 아무것도 하지 않는다.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`magnetic ${className}`}
    >
      {children}
    </div>
  );
}
