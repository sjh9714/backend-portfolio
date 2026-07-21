import type { StageId } from "@/content/types";

/** CSS 변수 참조 — 서버 렌더 스타일용 */
export const STAGE_ACCENT: Record<StageId, string> = {
  gateway: "var(--color-gateway)",
  "queue-lock": "var(--color-queuelock)",
  stream: "var(--color-stream)",
  delivery: "var(--color-delivery)",
};

/** motion 색 보간용 실제 색상값 — globals.css 토큰과 동기 유지 */
export const STAGE_ACCENT_HEX: Record<StageId, string> = {
  gateway: "#e8b34b",
  "queue-lock": "#b78ae8",
  stream: "#56c8e0",
  delivery: "#4fd193",
};

export const PACKET_HEX = "#6cb8ff";

export const STAGE_ORDER: StageId[] = ["gateway", "queue-lock", "stream", "delivery"];
