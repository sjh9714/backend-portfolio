"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * 뷰포트 진입 시 상승.
 *
 * **opacity는 건드리지 않는다.** globals.css의 `.rise-move`와 같은 원칙이다.
 * 페이드로 만들면 화면 밖 콘텐츠가 계속 opacity 0으로 남아
 *  - 대비 검사에서 실제로 읽을 수 없는 텍스트로 잡히고
 *  - JS가 실패하면 그 글이 영영 보이지 않는다.
 *
 * reduced-motion에서는 transition만 0으로 — DOM은 동일해 하이드레이션이 안전하다.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
