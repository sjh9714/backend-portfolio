"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { StageId } from "@/content/types";
import { STAGE_ACCENT_HEX } from "@/lib/stage-accents";

/**
 * Featured Work 카드 안에서 계속 돌아가는 미니 루프.
 * lusion의 프로젝트 영상 릴이 있던 자리를, 그 시스템이 실제로 도는 그림으로 채운다.
 *
 * 장식이 아니라 요약이다 — 각 그림은 해당 프로젝트가 다루는 실패 지점을 보여준다.
 * 화면 밖이면 rAF를 멈추고, reduced-motion이면 정지 프레임 한 장만 그린다.
 */
export function MiniSim({ stage, hot }: { stage: StageId; hot: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const visibleRef = useRef(false);
  const hotRef = useRef(hot);
  const rafRef = useRef(0);

  // 루프를 재시작하지 않고 속도만 바꾸기 위해 ref로 넘긴다
  useEffect(() => {
    hotRef.current = hot;
  }, [hot]);

  const render = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW === 0 || cssH === 0) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const accent = STAGE_ACCENT_HEX[stage];
      const dim = "rgba(255,255,255,0.14)";
      draw[stage](ctx, cssW, cssH, t, accent, dim);
    },
    [stage],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);

    if (reduced) {
      // 정지 프레임 — 루프를 돌리지 않는다
      const id = requestAnimationFrame(() => render(2.4));
      return () => {
        cancelAnimationFrame(id);
        io.disconnect();
      };
    }

    const start = performance.now();
    const loop = (now: number) => {
      if (visibleRef.current) {
        const speed = hotRef.current ? 1.75 : 1;
        render(((now - start) / 1000) * speed);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
    };
  }, [render, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />;
}

type Draw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  dim: string,
) => void;

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** GATEWAY — 요청이 인증·멱등 검사를 지나고, 중복은 되돌아간다 */
const gateway: Draw = (ctx, w, h, t, accent, dim) => {
  const gateX = w * 0.55;
  const mid = h / 2;

  ctx.strokeStyle = dim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gateX, h * 0.2);
  ctx.lineTo(gateX, h * 0.8);
  ctx.stroke();

  const N = 16;
  for (let i = 0; i < N; i += 1) {
    const phase = (t * 0.42 + i / N) % 1;
    const lane = mid + (i % 5) * 13 - 26;
    // 넷에 하나는 중복 요청 — 멱등 검사에 걸려 게이트에서 되돌아간다
    const dup = i % 4 === 1;
    let x: number;
    let alpha = 1;
    if (dup && phase > 0.55) {
      const back = (phase - 0.55) / 0.45;
      x = gateX - back * (gateX - w * 0.1);
      alpha = 1 - back * 0.85;
    } else {
      x = w * 0.05 + phase * (dup ? gateX - w * 0.05 : w * 0.95 - w * 0.05);
    }
    ctx.globalAlpha = alpha;
    dot(ctx, x, lane, 2.6, dup && phase > 0.55 ? dim : accent);
    ctx.globalAlpha = 1;
  }
};

/** QUEUE·LOCK — 대기열이 차고, 락은 한 번에 하나만 통과시킨다 */
const queueLock: Draw = (ctx, w, h, t, accent, dim) => {
  const slots = 12;
  const boxW = (w * 0.5) / slots;
  const y = h / 2;
  const filled = Math.floor((Math.sin(t * 0.55) * 0.5 + 0.5) * slots);

  for (let i = 0; i < slots; i += 1) {
    ctx.fillStyle = i < filled ? accent : dim;
    ctx.globalAlpha = i < filled ? 0.75 : 1;
    ctx.fillRect(w * 0.06 + i * boxW, y - 7, boxW - 2, 14);
    ctx.globalAlpha = 1;
  }

  // 락 게이트
  const lockX = w * 0.66;
  ctx.strokeStyle = dim;
  ctx.lineWidth = 1;
  ctx.strokeRect(lockX - 11, y - 11, 22, 22);

  // 한 번에 하나만 통과
  const pass = (t * 0.85) % 1;
  const px = w * 0.58 + pass * (w * 0.36);
  ctx.globalAlpha = pass < 0.9 ? 1 : (1 - pass) * 10;
  dot(ctx, px, y, 3.2, accent);
  ctx.globalAlpha = 1;
};

/** STREAM — 커밋된 뒤에야 구독자 전원에게 퍼진다 */
const stream: Draw = (ctx, w, h, t, accent, dim) => {
  const srcX = w * 0.12;
  const mid = h / 2;
  dot(ctx, srcX, mid, 4, accent);

  const receivers = 14;
  const colX = w * 0.78;
  const spread = h * 0.68;
  const pulse = (t * 0.5) % 1;

  for (let i = 0; i < receivers; i += 1) {
    const ry = mid - spread / 2 + (i / (receivers - 1)) * spread;
    const delay = 0.25 + (Math.abs(i - (receivers - 1) / 2) / receivers) * 0.3;
    const lit = pulse > delay && pulse < delay + 0.42;

    ctx.strokeStyle = dim;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(srcX + 6, mid);
    ctx.bezierCurveTo(w * 0.42, mid, w * 0.52, ry, colX - 5, ry);
    ctx.stroke();

    dot(ctx, colX, ry, lit ? 3 : 2, lit ? accent : dim);
  }

  // 커밋 마커 — 이게 지나간 뒤에야 fan-out이 일어난다
  if (pulse < 0.3) {
    ctx.globalAlpha = 1 - pulse / 0.3;
    dot(ctx, srcX + pulse * (w * 0.28), mid, 3, accent);
    ctx.globalAlpha = 1;
  }
};

/** DELIVERY — 경로를 따라가다 막히면 다시 계산한다 */
const delivery: Draw = (ctx, w, h, t, accent, dim) => {
  const pts = [
    [w * 0.08, h * 0.72],
    [w * 0.3, h * 0.36],
    [w * 0.52, h * 0.62],
    [w * 0.74, h * 0.28],
    [w * 0.93, h * 0.5],
  ] as const;

  ctx.strokeStyle = dim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.stroke();

  const prog = (t * 0.3) % 1;
  const seg = Math.min(pts.length - 2, Math.floor(prog * (pts.length - 1)));
  const local = prog * (pts.length - 1) - seg;
  const a = pts[seg]!;
  const b = pts[seg + 1]!;

  // 지나온 구간
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= seg; i += 1) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.lineTo(a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local);
  ctx.stroke();

  for (let i = 0; i < pts.length; i += 1) {
    const passed = i <= seg;
    dot(ctx, pts[i]![0], pts[i]![1], passed ? 3 : 2.4, passed ? accent : dim);
  }

  dot(ctx, a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local, 4, accent);
};

const draw: Record<StageId, Draw> = {
  gateway,
  "queue-lock": queueLock,
  stream,
  delivery,
};
