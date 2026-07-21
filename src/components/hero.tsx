"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";

const CURL_LINE = "$ curl -X GET https://sung.dev/portfolio";

function CurlIntro() {
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

export function Hero() {
  const reduced = useReducedMotion();

  // DOM은 항상 동일(initial 스타일 포함) — reduced-motion은 transition만 0으로.
  const item = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };
  const t = (delay: number) => ({
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      aria-label="소개"
      className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-5 pt-14"
    >
      <motion.p {...item} {...t(0)} className="font-mono text-sm text-[var(--color-packet)]">
        {profile.role} · {profile.tagline}
      </motion.p>
      <motion.h1 {...item} {...t(0.08)} className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
        {profile.name}
      </motion.h1>
      <motion.p
        {...item}
        {...t(0.16)}
        className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {profile.headline}
      </motion.p>
      <motion.p {...item} {...t(0.24)} className="mt-4 max-w-2xl text-[var(--color-muted)]">
        {profile.lead}
      </motion.p>

      <motion.ul {...item} {...t(0.34)} className="mt-8 flex flex-wrap gap-2" aria-label="핵심 근거">
        {profile.proofChips.map((chip) => (
          <li key={chip.text}>
            <Link
              href={chip.href}
              className="inline-block rounded-full border border-[var(--color-line)] bg-[var(--color-surface)]/60 px-4 py-1.5 font-mono text-xs transition-colors hover:border-[var(--color-packet)]"
            >
              {chip.text}
            </Link>
          </li>
        ))}
      </motion.ul>

      <motion.div {...item} {...t(0.44)} className="mt-10 flex flex-wrap gap-3">
        <a
          href="#journey"
          className="rounded-lg bg-[var(--color-packet)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
        >
          요청 보내기 — 프로젝트 보기
        </a>
        <Link
          href="/resume"
          className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--color-packet)]"
        >
          이력서
        </Link>
      </motion.div>

      <CurlIntro />
    </section>
  );
}
