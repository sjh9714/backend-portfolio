"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StageId } from "@/content/types";
import { PACKET_HEX, STAGE_ACCENT_HEX } from "@/lib/stage-accents";

interface StageMark {
  id: StageId;
  label: string;
  ratio: number;
  accent: string;
}

/**
 * "요청의 여정" 장식 레이어.
 * 콘텐츠는 일반 문서 흐름(children)에 있고, 스파인·패킷·HUD는 절대 배치 장식이다.
 * reduced-motion에서는 정적 스파인(전체 점등)만 남는다.
 */
export function Journey({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(0);
  const [marks, setMarks] = useState<StageMark[]>([]);
  const [hud, setHud] = useState(-1);

  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHeight(rect.height);
    const sections = el.querySelectorAll<HTMLElement>("[data-stage]");
    const next: StageMark[] = [];
    sections.forEach((sec) => {
      const id = sec.dataset.stage as StageId;
      const label = sec.dataset.stageLabel ?? "";
      const top = sec.getBoundingClientRect().top - rect.top;
      next.push({
        id,
        label,
        ratio: Math.min(1, Math.max(0, (top + 24) / rect.height)),
        accent: STAGE_ACCENT_HEX[id] ?? PACKET_HEX,
      });
    });
    setMarks(next);
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.55", "end 0.9"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 });
  const packetY = useTransform(progress, (v) => v * height);

  const colorStops = marks.length >= 2 ? marks.map((m) => m.ratio) : [0, 1];
  const colors = marks.length >= 2 ? marks.map((m) => m.accent) : [PACKET_HEX, PACKET_HEX];
  const packetColor = useTransform(progress, colorStops, colors);

  useMotionValueEvent(progress, "change", (v) => {
    if (!marks.length) return;
    let idx = -1;
    for (let i = 0; i < marks.length; i += 1) {
      if (v >= marks[i]!.ratio - 0.015) idx = i;
    }
    if (v <= 0.001 || v >= 0.999) idx = -1;
    setHud((prev) => (prev === idx ? prev : idx));
  });

  const active = hud >= 0 ? marks[hud] : undefined;

  return (
    <div ref={containerRef} className="relative">
      {/* 스파인 장식 레이어 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-3">
        <div className="absolute inset-y-0 left-1 w-px bg-[var(--color-line)]/50" />
        {mounted && (reduced ? (
          <div className="absolute inset-y-0 left-1 w-px bg-[var(--color-packet)]/60" />
        ) : (
          height > 0 && (
            <>
              <motion.div
                className="absolute left-[3.5px] top-0 w-[2px] origin-top rounded-full bg-gradient-to-b from-[var(--color-packet)] via-[var(--color-queuelock)] to-[var(--color-delivery)]"
                style={{ height, scaleY: progress }}
              />
              {marks.map((m) => (
                <StageNode key={m.id} mark={m} progress={progress} />
              ))}
              <motion.div
                className="absolute left-[-1px] top-[-6px] size-3 rounded-full"
                style={{
                  y: packetY,
                  backgroundColor: packetColor,
                  boxShadow: "0 0 14px 3px color-mix(in srgb, currentcolor 40%, transparent)",
                  color: packetColor,
                  willChange: "transform",
                }}
              />
            </>
          )
        ))}
      </div>

      <div className="pl-7 sm:pl-10">{children}</div>

      {/* 현재 스테이지 HUD */}
      {mounted && !reduced && (
        <div
          aria-hidden="true"
          className={`fixed bottom-5 left-5 z-40 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)]/85 px-3 py-1.5 font-mono text-xs backdrop-blur transition-opacity duration-300 ${
            active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <span style={{ color: active?.accent }}>▸ {active?.label}</span>
          <span className="ml-2 text-[var(--color-muted)]">
            {hud + 1} / {marks.length}
          </span>
        </div>
      )}
    </div>
  );
}

function StageNode({
  mark,
  progress,
}: {
  mark: StageMark;
  progress: ReturnType<typeof useSpring>;
}) {
  const lit = useTransform(progress, [mark.ratio - 0.03, mark.ratio], [0.25, 1]);
  const scale = useTransform(progress, [mark.ratio - 0.03, mark.ratio], [0.7, 1]);
  return (
    <motion.div
      className="absolute left-[-2px] size-[14px] rounded-full border-2 bg-[var(--color-bg)]"
      style={{
        top: `calc(${mark.ratio * 100}% - 7px)`,
        borderColor: mark.accent,
        opacity: lit,
        scale,
        boxShadow: `0 0 10px 1px ${mark.accent}55`,
      }}
    />
  );
}
