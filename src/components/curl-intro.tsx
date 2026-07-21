"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const CURL_LINE = "$ curl -X GET https://sung.dev/portfolio";

export function CurlIntro() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const done = typed >= CURL_LINE.length;

  useEffect(() => {
    if (reduced) {
      setTyped(CURL_LINE.length);
      return;
    }
    if (typed >= CURL_LINE.length) return;
    const t = setTimeout(() => setTyped((n) => n + 1), 34);
    return () => clearTimeout(t);
  }, [typed, reduced]);

  return (
    <p className="mt-16 font-mono text-xs text-[var(--color-muted)]" aria-hidden="true">
      <span className="text-[var(--color-packet)]">{CURL_LINE.slice(0, typed)}</span>
      {!done && <span className="animate-pulse">▍</span>}
      {done && <span> · 요청이 시스템에 진입합니다 ↓</span>}
    </p>
  );
}
