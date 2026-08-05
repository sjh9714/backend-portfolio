/**
 * 좌석 경합 시뮬레이션 모형.
 *
 * 이것은 측정이 아니라 **재현용 모형**이다. 새 수치를 만들지 않는다.
 * concert-booking의 실측 시나리오 B — 50명이 서로 다른 좌석을 예매했는데도
 * 낙관적 락만 성공률이 떨어진 현상 — 을 눈으로 볼 수 있게 하는 것이 목적이다.
 *
 * 핵심 규칙 하나만 모형화한다:
 *   좌석이 서로 달라도 모든 예매는 같은 잔여석 카운터 row를 감소시킨다.
 *   따라서 커밋 시점에는 이 row 하나를 두고 직렬화된다.
 */

export type Strategy = "pessimistic" | "optimistic" | "distributed";

export interface RequestState {
  /** 요청이 노리는 좌석 번호 — 전부 다르다 */
  seat: number;
  attempts: number;
  /** 커밋에 성공한 tick. 실패했으면 null */
  committedAt: number | null;
  /** retry 한도를 소진해 포기한 tick. 성공했으면 null */
  failedAt: number | null;
}

export interface SimResult {
  requests: RequestState[];
  success: number;
  failed: number;
  /** 전체가 끝나기까지 걸린 tick 수 */
  ticks: number;
  /** tick별로 커밋에 성공한 요청 인덱스 (애니메이션 재생용) */
  timeline: Array<{ tick: number; committed: number[]; conflicted: number[] }>;
}

/** 시드 고정 PRNG — 같은 입력이면 항상 같은 결과가 나와야 한다 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 시드와 JITTER는 실측 시나리오 B의 결과(50명 중 20명 성공 = 40%)를
 * DEFAULT_RETRY_LIMIT에서 재현하도록 맞춘 값이다.
 * 저장소 구현의 실제 retry 한도가 4라고 주장하는 것이 아니다 — 모형의 눈금일 뿐이다.
 */
const SEED = 31337;
/** 재시도가 흩어지는 폭 (tick) */
const JITTER = 5;

/** 이 값에서 낙관적 락이 실측과 같은 20/50을 낸다 */
export const DEFAULT_RETRY_LIMIT = 4;
/** 실측 시나리오 B와 같은 조건 */
export const MEASURED_VUS = 50;

export function simulate(vus: number, retryLimit: number, strategy: Strategy): SimResult {
  const rand = mulberry32(SEED);
  const requests: RequestState[] = Array.from({ length: vus }, (_, i) => ({
    seat: i + 1,
    attempts: 0,
    committedAt: null,
    failedAt: null,
  }));
  const timeline: SimResult["timeline"] = [];

  // 비관적 락과 분산 락은 커밋 순서를 미리 정렬한다 — 충돌로 되돌아가는 요청이 없다.
  // 비관은 락 대기로 직렬화되고, 분산은 Redis 재고를 먼저 차감해 더 빨리 빠진다.
  if (strategy !== "optimistic") {
    const perTick = strategy === "distributed" ? 4 : 2;
    for (let i = 0; i < vus; i += 1) {
      const req = requests[i]!;
      req.attempts = 1;
      req.committedAt = Math.floor(i / perTick) + 1;
    }
    const ticks = Math.max(1, Math.ceil(vus / perTick));
    for (let t = 1; t <= ticks; t += 1) {
      timeline.push({
        tick: t,
        committed: requests.flatMap((r, i) => (r.committedAt === t ? [i] : [])),
        conflicted: [],
      });
    }
    return { requests, success: vus, failed: 0, ticks, timeline };
  }

  // 낙관적 락: 커밋 시점에 공유 row의 version을 확인한다.
  // 같은 tick에 커밋을 시도한 요청 중 하나만 통과하고 나머지는 충돌로 되돌아간다.
  const nextAttempt = requests.map(() => 1);
  let done = 0;
  let tick = 0;

  while (done < vus && tick < 400) {
    tick += 1;
    const attempting: number[] = [];
    for (let i = 0; i < vus; i += 1) {
      const req = requests[i]!;
      if (req.committedAt !== null || req.failedAt !== null) continue;
      if (nextAttempt[i] === tick) attempting.push(i);
    }
    if (attempting.length === 0) continue;

    // 공유 row는 한 tick에 하나만 통과시킨다
    const winner = attempting[Math.floor(rand() * attempting.length)]!;
    const conflicted: number[] = [];

    for (const i of attempting) {
      const req = requests[i]!;
      req.attempts += 1;
      if (i === winner) {
        req.committedAt = tick;
        done += 1;
        continue;
      }
      conflicted.push(i);
      if (req.attempts > retryLimit) {
        req.failedAt = tick;
        done += 1;
      } else {
        nextAttempt[i] = tick + 1 + Math.floor(rand() * JITTER);
      }
    }
    timeline.push({ tick, committed: [winner], conflicted });
  }

  const success = requests.filter((r) => r.committedAt !== null).length;
  return { requests, success, failed: vus - success, ticks: tick, timeline };
}
