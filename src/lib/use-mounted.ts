import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** 하이드레이션 안전한 클라이언트 마운트 여부 — SSR/첫 렌더 false, 이후 true */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
