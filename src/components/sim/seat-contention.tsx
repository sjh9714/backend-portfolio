"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { DEFAULT_RETRY_LIMIT, MEASURED_VUS, simulate, type Strategy } from "./model";

const TICKS_PER_SEC = 9;
/** 결과가 자리를 잡는 데 걸리는 시간 (tick 단위) */
const SETTLE = 1.4;

const STRATEGIES: Array<{ id: Strategy; label: string; measured: string }> = [
  { id: "pessimistic", label: "비관적 락", measured: "실측 100%" },
  { id: "optimistic", label: "낙관적 락", measured: "실측 40%" },
  { id: "distributed", label: "Redis 분산 락", measured: "실측 100%" },
];

interface Palette {
  line: string;
  muted: string;
  surface: string;
  ok: string;
  fail: string;
  accent: string;
}

function readPalette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const v = (n: string, fallback: string) => s.getPropertyValue(n).trim() || fallback;
  return {
    line: v("--color-line", "#3a4050"),
    muted: v("--color-muted", "#9aa3b2"),
    surface: v("--color-surface", "#242a36"),
    ok: v("--color-delivery", "#5fd39b"),
    fail: v("--color-gateway", "#e0a23c"),
    accent: v("--color-queuelock", "#b48ce8"),
  };
}

export function SeatContentionSim() {
  const reduced = useReducedMotion();
  const mounted = useMounted();

  const [vus, setVus] = useState(MEASURED_VUS);
  const [retryLimit, setRetryLimit] = useState(DEFAULT_RETRY_LIMIT);
  const [strategy, setStrategy] = useState<Strategy>("optimistic");
  /** 사용자가 직접 멈췄는지. 재생 여부를 effect가 아니라 조작에서 결정한다 */
  const [paused, setPaused] = useState(false);
  /** 현재 재생 시각 (tick, 소수 허용) */
  const [now, setNow] = useState(0);

  const result = useMemo(() => simulate(vus, retryLimit, strategy), [vus, retryLimit, strategy]);
  const endTick = result.ticks + SETTLE;

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const visibleRef = useRef(true);
  const rafRef = useRef(0);
  const nowRef = useRef(0);

  // reduced-motion이면 재생하지 않고 최종 상태만 보여준다
  const displayNow = reduced ? endTick : now;
  const finished = displayNow >= endTick;
  const running = mounted && !reduced && !paused;

  /** 파라미터를 바꾸면 처음부터 다시 재생한다 */
  const restart = useCallback(() => {
    nowRef.current = 0;
    setNow(0);
    setPaused(false);
  }, []);

  // 화면 밖이면 재생을 멈춘다
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 재생 루프. 끝에 닿으면 다음 프레임을 예약하지 않는다
  useEffect(() => {
    if (!running || nowRef.current >= endTick) return;
    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      // 화면 밖이면 시간을 진행시키지 않는다
      if (visibleRef.current) {
        nowRef.current = Math.min(endTick, nowRef.current + dt * TICKS_PER_SEC);
        setNow(nowRef.current);
      }
      if (nowRef.current < endTick) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, endTick]);

  // 그리기
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const palette = paletteRef.current ?? (paletteRef.current = readPalette(wrap));

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const gateX = Math.round(cssW * 0.54);
    const padY = 34;
    const usableH = cssH - padY * 2;

    // 공유 카운터 row — 모든 요청이 여기를 지난다
    const recentCommit = result.timeline.some(
      (e) => e.committed.length > 0 && displayNow - e.tick >= 0 && displayNow - e.tick < 0.45,
    );
    ctx.save();
    ctx.strokeStyle = recentCommit ? palette.accent : palette.line;
    ctx.lineWidth = recentCommit ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(gateX, padY - 14);
    ctx.lineTo(gateX, cssH - padY + 14);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.fillText("availableSeats", gateX, padY - 22);
    ctx.restore();

    // 요청 점 배치
    const cols = Math.max(4, Math.ceil(Math.sqrt(vus * 0.75)));
    const rows = Math.ceil(vus / cols);
    const cellW = Math.min(20, (gateX - 34) / cols);
    const cellH = Math.min(20, usableH / Math.max(rows, 1));
    const gridW = cols * cellW;
    const gridH = rows * cellH;
    const originX = Math.max(14, gateX - 40 - gridW);
    const originY = padY + (usableH - gridH) / 2;

    const outCols = Math.max(3, Math.ceil(Math.sqrt(vus * 0.6)));
    const outCellW = Math.min(18, (cssW - gateX - 40) / outCols);
    // 통과 그리드는 최종 성공 수 기준으로 높이를 잡아 둔다 — 재생 중에 위치가 흔들리지 않는다
    const okGridH = Math.ceil(Math.max(result.success, 1) / outCols) * outCellW;
    const okOriginY = padY + Math.max(0, (usableH - okGridH) / 2);

    let shownOk = 0;
    let shownFail = 0;

    for (let i = 0; i < result.requests.length; i += 1) {
      const req = result.requests[i]!;
      const homeX = originX + (i % cols) * cellW + cellW / 2;
      const homeY = originY + Math.floor(i / cols) * cellH + cellH / 2;

      const resolveTick = req.committedAt ?? req.failedAt;
      const resolved = resolveTick !== null && displayNow >= resolveTick;
      const p = resolved ? Math.min(1, (displayNow - resolveTick!) / SETTLE) : 0;
      const eased = p * p * (3 - 2 * p);

      let x = homeX;
      let y = homeY;
      let color = palette.line;
      let radius = 3.2;

      if (resolved && req.committedAt !== null) {
        const slot = shownOk;
        shownOk += 1;
        const tx = gateX + 32 + (slot % outCols) * outCellW + outCellW / 2;
        const ty = okOriginY + Math.floor(slot / outCols) * outCellW + outCellW / 2;
        x = homeX + (tx - homeX) * eased;
        y = homeY + (ty - homeY) * eased;
        color = palette.ok;
        radius = 3.6;
      } else if (resolved) {
        shownFail += 1;
        // 실패한 요청은 통과하지 못하고 제자리에서 사그라든다
        color = palette.fail;
        radius = 3.2 - eased * 1.1;
        ctx.globalAlpha = 1 - eased * 0.62;
      } else {
        // 아직 경합 중 — 커밋을 시도한 tick에 짧게 밝아진다
        const attempting = result.timeline.some(
          (e) => e.conflicted.includes(i) && displayNow - e.tick >= 0 && displayNow - e.tick < 0.5,
        );
        color = attempting ? palette.accent : palette.line;
        radius = attempting ? 4.2 : 3.2;
      }

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 결과 라벨
    ctx.save();
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = palette.ok;
    ctx.fillText(`통과 ${shownOk}`, gateX + 32, cssH - padY + 24);
    if (shownFail > 0) {
      ctx.fillStyle = palette.fail;
      ctx.textAlign = "right";
      ctx.fillText(`버전 충돌로 실패 ${shownFail}`, gateX - 32, cssH - padY + 24);
    }
    ctx.restore();
  }, [displayNow, result, vus]);

  useEffect(() => {
    if (!mounted) return;
    draw();
  }, [draw, mounted]);

  useEffect(() => {
    const onResize = () => {
      paletteRef.current = null;
      draw();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const pct = Math.round((result.success / vus) * 100);

  return (
    <div
      ref={wrapRef}
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/40 p-4 sm:p-6"
    >
      <p className="font-mono text-[11px] leading-relaxed text-[var(--color-muted)]">
        좌석 {vus}석 · 각 요청은 <span className="text-[var(--color-fg)]">서로 다른 좌석</span>을
        예매합니다. 그래도 모두 같은 잔여석 row를 지나갑니다.
      </p>

      <canvas
        ref={canvasRef}
        className="mt-3 h-[240px] w-full sm:h-[280px]"
        role="img"
        aria-label={`${STRATEGIES.find((s) => s.id === strategy)?.label} 전략에서 ${vus}개 요청 중 ${result.success}개가 예약에 성공하는 시뮬레이션`}
      />

      {/* 화면 낭독기용 결과 미러 — 캔버스는 읽히지 않는다 */}
      <p aria-live="polite" className="sr-only">
        {STRATEGIES.find((s) => s.id === strategy)?.label}, 동시 요청 {vus}개, retry 한도{" "}
        {retryLimit}회에서 성공 {result.success}건, 실패 {result.failed}건, 성공률 {pct}퍼센트입니다.
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-sm">
        <span className="text-[var(--color-muted)]">성공률</span>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: pct >= 90 ? "var(--color-delivery)" : "var(--color-gateway)" }}
        >
          {pct}%
        </span>
        <span className="text-[var(--color-muted)]">
          {result.success} / {vus}
        </span>
      </div>

      {/* ── 조작 ── */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="font-mono text-[11px] text-[var(--color-muted)]">락 전략</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STRATEGIES.map((s) => (
              <label
                key={s.id}
                className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                  strategy === s.id
                    ? "border-[var(--stage-accent)] text-[var(--color-fg)]"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-muted)]"
                }`}
              >
                <input
                  type="radio"
                  name="lock-strategy"
                  value={s.id}
                  checked={strategy === s.id}
                  onChange={() => {
                    setStrategy(s.id);
                    restart();
                  }}
                  className="sr-only"
                />
                {s.label}
                {/* 실측값은 이 그림을 믿을 근거라 흐리게 두지 않는다 */}
                <span className="ml-1.5 font-mono text-[11px] text-[var(--color-muted)]">
                  {s.measured}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="sim-vus"
              className="flex justify-between font-mono text-[11px] text-[var(--color-muted)]"
            >
              <span>동시 요청</span>
              <span className="tabular-nums text-[var(--color-fg)]">{vus}</span>
            </label>
            <input
              id="sim-vus"
              type="range"
              min={10}
              max={100}
              step={5}
              value={vus}
              onChange={(e) => {
                setVus(Number(e.target.value));
                restart();
              }}
              className="mt-1 w-full accent-[var(--stage-accent)]"
            />
          </div>
          <div>
            <label
              htmlFor="sim-retry"
              className="flex justify-between font-mono text-[11px] text-[var(--color-muted)]"
            >
              <span>retry 한도</span>
              <span className="tabular-nums text-[var(--color-fg)]">{retryLimit}회</span>
            </label>
            <input
              id="sim-retry"
              type="range"
              min={0}
              max={12}
              step={1}
              value={retryLimit}
              onChange={(e) => {
                setRetryLimit(Number(e.target.value));
                restart();
              }}
              disabled={strategy !== "optimistic"}
              className="mt-1 w-full accent-[var(--stage-accent)] disabled:opacity-35"
            />
            {strategy !== "optimistic" && (
              <p className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">
                이 전략은 충돌로 되돌아가지 않아 retry가 없습니다
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (finished) restart();
            else setPaused((p) => !p);
          }}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 font-mono text-xs transition-colors hover:border-[var(--stage-accent)]"
        >
          {finished ? "다시 재생" : paused ? "재생" : "일시정지"}
        </button>
        <span className="font-mono text-[10px] text-[var(--color-muted)]">
          tick {Math.min(result.ticks, Math.floor(displayNow))} / {result.ticks}
        </span>
      </div>

      <p className="mt-5 border-t border-[var(--color-line)]/60 pt-3 font-mono text-[10px] leading-relaxed text-[var(--color-muted)]">
        이 그림은 측정이 아니라 실측 결과를 재현하도록 맞춘 모형입니다. 새 수치를 만들지 않습니다.
        기본값(동시 요청 {MEASURED_VUS} · retry {DEFAULT_RETRY_LIMIT}회)에서 실측 시나리오 B와 같은
        20/50이 나오도록 시드를 고정했으며, 저장소 구현의 실제 retry 한도가 {DEFAULT_RETRY_LIMIT}회라는
        뜻은 아닙니다.
      </p>
    </div>
  );
}
