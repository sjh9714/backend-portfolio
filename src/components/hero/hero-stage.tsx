"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Preloader } from "./preloader";

// OGL은 첫 페인트 경로에 없어야 한다 — 히어로 텍스트가 LCP를 잡는다
const ParticleField = dynamic(() => import("./particle-field").then((m) => m.ParticleField), {
  ssr: false,
});

/**
 * 부팅 연출과 배경 파티클을 묶는 레이어.
 * 히어로 카피는 서버에서 렌더되고, 이 컴포넌트는 그 뒤에 깔린다.
 */
export function HeroStage({ text }: { text: string }) {
  const [ignited, setIgnited] = useState(false);

  return (
    <>
      <Preloader onIgnite={() => setIgnited(true)} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <ParticleField text={text} ignite={ignited} />
      </div>
    </>
  );
}
