// "use client"를 두지 않는다 — hero-stage(클라이언트)에서만 임포트되므로 클라이언트 그래프에 들어간다.
// 지시어를 붙이면 이 파일이 클라이언트 진입점이 되어 함수 prop을 Server Action으로 오해받는다.
import { useCallback, useEffect, useRef, useState } from "react";
import { useMounted } from "@/lib/use-mounted";

const CURL = "$ curl -i https://sung.dev";
/**
 * 이 시간을 넘기면 무슨 일이 있어도 통과시킨다.
 * 연출이 길수록 LCP가 그대로 밀린다 — 오버레이가 걷히기 전까지 본문이 보이지 않기 때문이다.
 */
const DEADLINE_MS = 850;
const TYPE_MS = 16;
const SESSION_KEY = "sung.booted";

type Phase = "typing" | "ok" | "gone";

/**
 * 건너뛸지 여부는 모듈 스코프에 한 번만 기록한다.
 *
 * sessionStorage를 매 렌더마다 읽으면, 아래 effect가 값을 쓴 직후 재렌더에서 결정이 뒤집혀
 * 연출이 재생 도중 사라진다. 첫 판단을 고정해 두면 그 문제가 생기지 않는다.
 */
let skipDecision: boolean | null = null;

function shouldSkipBoot(): boolean {
  if (skipDecision === null) {
    skipDecision =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem(SESSION_KEY) === "1";
  }
  return skipDecision;
}

/**
 * 첫 화면의 부팅 연출. `200 OK`가 뜨는 순간 히어로 파티클이 점화된다.
 *
 * 세 가지를 지킨다:
 *  - 0.85초 상한. 넘으면 즉시 통과
 *  - 재방문(같은 세션)에는 아예 뜨지 않음
 *  - reduced-motion이면 건너뜀
 */
export function Preloader({ onIgnite }: { onIgnite: () => void }) {
  const mounted = useMounted();
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState(0);
  const ignited = useRef(false);

  const ignite = useCallback(() => {
    if (ignited.current) return;
    ignited.current = true;
    onIgnite();
  }, [onIgnite]);

  // 서버 렌더와 첫 클라이언트 렌더에서는 오버레이를 내보내지 않는다.
  // 연출이 SSR HTML에 끼어들지 않으므로 LCP 경로에도 영향이 없다.
  const skip = mounted ? shouldSkipBoot() : true;

  useEffect(() => {
    if (!mounted) return;
    if (skip) {
      ignite();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    // 연출이 로딩을 붙잡지 못하도록 상한을 건다
    const deadline = window.setTimeout(() => {
      ignite();
      setPhase("gone");
    }, DEADLINE_MS);
    return () => window.clearTimeout(deadline);
  }, [mounted, skip, ignite]);

  // 타이핑 → 200 OK
  useEffect(() => {
    if (skip || phase !== "typing") return;
    if (typed >= CURL.length) {
      const t = window.setTimeout(() => {
        setPhase("ok");
        ignite();
      }, 90);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearTimeout(t);
  }, [skip, phase, typed, ignite]);

  // 200 OK를 잠깐 보여준 뒤 걷어낸다
  useEffect(() => {
    if (skip || phase !== "ok") return;
    const t = window.setTimeout(() => setPhase("gone"), 200);
    return () => window.clearTimeout(t);
  }, [skip, phase]);

  if (skip) return null;

  if (phase === "gone") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] bg-[var(--color-bg)] opacity-0 transition-opacity duration-300"
      />
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="페이지를 불러오는 중"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-bg)] transition-opacity duration-300"
    >
      <div className="px-5 font-mono text-sm sm:text-base">
        <p className="text-[var(--color-muted)]">
          {CURL.slice(0, typed)}
          {phase === "typing" && (
            <span className="ml-0.5 inline-block w-[0.55em] animate-pulse bg-[var(--color-packet)] align-middle">
              &nbsp;
            </span>
          )}
        </p>
        {phase === "ok" && (
          <p className="mt-2 font-semibold text-[var(--color-delivery)]">HTTP/1.1 200 OK</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          ignite();
          setPhase("gone");
        }}
        className="absolute bottom-6 right-6 font-mono text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
      >
        건너뛰기
      </button>
    </div>
  );
}
