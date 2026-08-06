"use client";

import type { Mesh as OglMesh, Texture as OglTexture } from "ogl";
import { useEffect, useRef } from "react";

/**
 * lusion Featured Work의 이미지 렌더 방식 — 공유 WebGL 캔버스 하나가
 * 카드 DOM 요소의 rect를 읽어 그 자리에 평면을 그린다.
 *
 * 레이어 순서: body 배경 → 이 캔버스(fixed) → 콘텐츠(z-10).
 * 카드의 이미지 칸만 배경을 비워 캔버스가 그 구멍으로 보인다.
 *
 * DOM의 <img>는 지우지 않는다. alt 텍스트·SEO·폴백이 거기 있고,
 * WebGL이 켜졌을 때만 CSS로 감춘다(`html[data-gl-on]`).
 *
 * ogl은 effect 안에서 동적 import한다 — 첫 페인트 경로에 넣지 않아 LCP를 지킨다.
 */

const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform vec2 uPos;
  uniform vec2 uSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(uPos + position.xy * uSize * 2.0, 0.0, 1.0);
  }
`;

/**
 * hover하면 이미지가 중앙으로 살짝 빨려들고(배럴) 마우스 방향으로 미세하게 밀리며,
 * **원래 색이 드러난다.**
 *
 * 텍스처는 컬러로 저장돼 있고 흑백은 여기서 만든다. 파일에 흑백을 구우면
 * 색 정보가 사라져 되살릴 수가 없다. 평소에는 네 장이 흑백으로 한 세트로 읽히고,
 * 마우스를 올린 카드만 자기 색을 되찾는다.
 *
 * uCover는 텍스처와 평면의 비율 차이를 흡수해 object-fit: cover와 같게 만든다.
 */
const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uCover;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) * uCover;
    float r2 = dot(uv, uv);
    uv *= 1.0 - uHover * 0.10 * (1.0 - r2 * 1.2);
    uv += uMouse * uHover * 0.018;
    uv += 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    vec3 color = texture2D(tMap, uv).rgb;

    // 휘도(Rec.709)로 흑백을 만들고 대비를 살짝 올린다 — 출처가 제각각인 사진 네 장을 한 세트로 묶는다
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    vec3 mono = clamp(vec3((luma - 0.5) * 1.12 + 0.5), 0.0, 1.0);

    gl_FragColor = vec4(mix(mono, color, uHover), 1.0);
  }
`;

interface PlaneEntry {
  el: HTMLElement;
  mesh: OglMesh;
  hover: number;
  hoverTarget: number;
  mouse: [number, number];
  mouseTarget: [number, number];
  ready: boolean;
}

/** 이 중 하나라도 걸리면 WebGL을 켜지 않고 DOM 이미지를 그대로 둔다 */
function shouldSkip(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (!window.matchMedia("(pointer: fine)").matches) return true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  return cores <= 4 || memory <= 4;
}

export function GalleryGL() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || shouldSkip()) return;

    const items = [...document.querySelectorAll<HTMLElement>("[data-gl-plane]")];
    if (items.length === 0) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const { Renderer, Program, Mesh, Plane, Texture } = await import("ogl");
      if (disposed) return;

      // 매 마운트마다 새 canvas — 정리에서 컨텍스트를 잃은 canvas를 재사용하면 죽은 채로 돌아온다
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none";
      host.appendChild(canvas);

      let renderer: InstanceType<typeof Renderer>;
      try {
        renderer = new Renderer({
          canvas,
          alpha: true,
          antialias: true,
          dpr: Math.min(2, window.devicePixelRatio || 1),
        });
      } catch {
        canvas.remove();
        return;
      }
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      // 평면을 하나씩 그리므로 렌더러가 매번 지우지 않게 하고 프레임 시작에 한 번만 지운다
      renderer.autoClear = false;

      const geometry = new Plane(gl);
      const entries: PlaneEntry[] = [];

      for (const el of items) {
        const img = el.querySelector("img");
        if (!img) continue;

        const texture = new Texture(gl, { generateMipmaps: false });
        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          transparent: true,
          depthTest: false,
          uniforms: {
            tMap: { value: texture },
            uPos: { value: [0, 0] },
            uSize: { value: [0, 0] },
            uCover: { value: [1, 1] },
            uHover: { value: 0 },
            uMouse: { value: [0, 0] },
          },
        });

        const entry: PlaneEntry = {
          el,
          mesh: new Mesh(gl, { geometry, program }),
          hover: 0,
          hoverTarget: 0,
          mouse: [0, 0],
          mouseTarget: [0, 0],
          ready: false,
        };
        entries.push(entry);

        // DOM <img>가 이미 고른 소스를 그대로 텍스처로 쓴다 — 같은 URL이라 재다운로드가 없다
        const load = () => {
          const src = img.currentSrc || img.src;
          if (!src) return;
          const bitmap = new Image();
          bitmap.crossOrigin = "anonymous";
          bitmap.onload = () => {
            if (disposed) return;
            texture.image = bitmap;
            entry.ready = true;
          };
          bitmap.src = src;
        };
        if (img.complete && (img.currentSrc || img.src)) load();
        else img.addEventListener("load", load, { once: true });
      }

      if (entries.length === 0) {
        canvas.remove();
        return;
      }

      document.documentElement.setAttribute("data-gl-on", "");

      const onPointerMove = (e: PointerEvent) => {
        for (const entry of entries) {
          const r = entry.el.getBoundingClientRect();
          const inside =
            e.clientX >= r.left &&
            e.clientX <= r.right &&
            e.clientY >= r.top &&
            e.clientY <= r.bottom;
          entry.hoverTarget = inside ? 1 : 0;
          if (inside) {
            entry.mouseTarget = [
              ((e.clientX - r.left) / r.width) * 2 - 1,
              -(((e.clientY - r.top) / r.height) * 2 - 1),
            ];
          }
        }
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const resize = () => renderer.setSize(window.innerWidth, window.innerHeight);
      resize();
      window.addEventListener("resize", resize);

      let raf = 0;
      const loop = () => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const visible: PlaneEntry[] = [];

        for (const entry of entries) {
          const r = entry.el.getBoundingClientRect();
          if (!entry.ready || r.bottom < -80 || r.top > vh + 80) continue;
          visible.push(entry);

          // 화면 좌표 → 클립 좌표
          const u = entry.mesh.program.uniforms;
          u.uPos!.value = [
            ((r.left + r.width / 2) / vw) * 2 - 1,
            -(((r.top + r.height / 2) / vh) * 2 - 1),
          ];
          u.uSize!.value = [r.width / vw, r.height / vh];

          // object-fit: cover 보정
          const src = (u.tMap!.value as OglTexture).image as HTMLImageElement | undefined;
          if (src?.naturalWidth) {
            const texAspect = src.naturalWidth / src.naturalHeight;
            const planeAspect = r.width / r.height;
            u.uCover!.value =
              texAspect > planeAspect ? [planeAspect / texAspect, 1] : [1, texAspect / planeAspect];
          }

          entry.hover += (entry.hoverTarget - entry.hover) * 0.12;
          entry.mouse[0] += (entry.mouseTarget[0] - entry.mouse[0]) * 0.1;
          entry.mouse[1] += (entry.mouseTarget[1] - entry.mouse[1]) * 0.1;
          u.uHover!.value = entry.hover;
          u.uMouse!.value = entry.mouse;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        for (const entry of visible) renderer.render({ scene: entry.mesh });
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", resize);
        document.documentElement.removeAttribute("data-gl-on");
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" />;
}
