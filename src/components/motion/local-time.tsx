"use client";

import { useEffect, useState } from "react";

/**
 * 서울 고정 로컬타임 — dennissnellenberg.com 푸터의 "local time" 문법.
 * 접속자의 시간이 아니라 작업자의 시간이다.
 *
 * 정적 빌드에는 시각이 없으므로 자리 표시로 렌더하고 클라이언트에서 채운다 —
 * suppressHydrationWarning은 그 불일치를 위한 것이다.
 */
const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  return <time suppressHydrationWarning>{now ?? "--:--"}</time>;
}
