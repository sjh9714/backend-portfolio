"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";

const CURL_LINE = "$ curl -X GET https://sung.dev/portfolio";

export function CurlIntro() {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const [typed, setTyped] = useState(0);

  // reduced-motion이면 타이핑 없이 전체 표시 (mounted 게이트로 하이드레이션 안전)
  const shown = mounted && reduced ? CURL_LINE.length : typed;
  const done = shown >= CURL_LINE.length;

  useEffect(() => {
    if (reduced || typed >= CURL_LINE.length) return;
    const t = setTimeout(() => setTyped((n) => n + 1), 34);
    return () => clearTimeout(t);
  }, [typed, reduced]);

  return (
    <p className="mt-16 font-mono text-xs text-[var(--color-muted)]" aria-hidden="true">
      <span className="text-[var(--color-packet)]">{CURL_LINE.slice(0, shown)}</span>
      {!done && <span className="animate-pulse">▍</span>}
      {done && <span> · 요청이 시스템에 진입합니다 ↓</span>}
    </p>
  );
}
