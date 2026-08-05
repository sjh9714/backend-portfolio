"use client";

import { Geometry, Mesh, Program, Renderer } from "ogl";
import { useEffect, useRef } from "react";

/**
 * 히어로 배경 파티클.
 *
 * 이름을 이루던 입자가 스크롤에 따라 무너져 좌→우 요청 스트림이 된다.
 * LCP 후보는 DOM 헤드라인이므로 이 캔버스는 순수 장식이다 — 늦게 켜져도 지표에 영향이 없다.
 */

/**
 * 셰이더 소스에는 ASCII만 쓴다. GLSL 소스 문자 집합에 한글이 들어가면
 * 드라이버가 링크를 거부하고, OGL은 uniformLocations를 못 만든 채로 진행한다.
 * 설명은 전부 여기 TS 주석에 남긴다.
 *
 * 정점 셰이더가 하는 일:
 *  1. aScatter(흩어진 초기 위치) → aTarget(글자 모양) 을 uAssemble로 섞는다
 *  2. 아주 느린 부유를 더한다 — 완전히 멈추면 죽은 그림처럼 보인다
 *  3. 커서를 밀어낸다. 종횡비를 보정해야 원형으로 밀린다
 *  4. uScroll이 오르면 글자가 무너져 좌→우 스트림이 된다
 */
const VERT = /* glsl */ `
  attribute vec2 aTarget;
  attribute vec2 aScatter;
  attribute float aSeed;

  uniform float uAssemble;
  uniform float uScroll;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uDpr;
  uniform float uAlphaScale;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 pos = mix(aScatter, aTarget, uAssemble);

    pos += vec2(sin(uTime * 0.7 + aSeed * 6.283), cos(uTime * 0.61 + aSeed * 4.13)) * 0.0045;

    vec2 d = (pos - uMouse) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = smoothstep(0.30, 0.0, dist) * 0.17;
    pos += (d / max(dist, 0.0001)) * push / vec2(uAspect, 1.0);

    float lane = (fract(aSeed * 31.7) - 0.5) * 0.72;
    vec2 streamPos = vec2(-1.5 + fract(aSeed * 7.31 + uTime * 0.1) * 3.0, lane);
    pos = mix(pos, streamPos, uScroll);

    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = mix(2.5, 1.4, uScroll) * uDpr;
    vAlpha = (0.45 + aSeed * 0.55) * uAssemble * (1.0 - uScroll * 0.42) * uAlphaScale;
    vSeed = aSeed;
  }
`;

/** 사각 점을 원형으로 깎고, 씨앗값으로 두 색 사이를 섞는다 */
const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float a = smoothstep(0.25, 0.01, d) * vAlpha;
    gl_FragColor = vec4(mix(uColorA, uColorB, vSeed), a);
  }
`;

/**
 * 텍스트를 픽셀로 그린 뒤 불투명한 지점을 표본으로 뽑는다.
 *
 * fontFamily는 CSS 변수가 아니라 실제 패밀리명이어야 한다 —
 * canvas의 font 속성은 var()를 해석하지 않는다.
 */
function sampleText(
  text: string,
  w: number,
  h: number,
  budget: number,
  fontFamily: string,
  anchorX: number,
) {
  const c = document.createElement("canvas");
  const scale = 0.55;
  c.width = Math.max(1, Math.floor(w * scale));
  c.height = Math.max(1, Math.floor(h * scale));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { targets: new Float32Array(0), count: 0 };

  // 글자 수 기준으로 폭을 맞춘다 — 넓은 화면에서는 카피를 피해 오른쪽에 앉는다
  const room = anchorX > 0.5 ? 1 - anchorX : 0.5;
  const fontSize = Math.min((c.width * room * 1.7) / Math.max(text.length, 1), c.height * 0.46);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.fillText(text, c.width * anchorX, c.height / 2);

  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const hits: number[] = [];
  for (let y = 0; y < c.height; y += 1) {
    for (let x = 0; x < c.width; x += 1) {
      if (data[(y * c.width + x) * 4 + 3]! > 128) hits.push(x, y);
    }
  }

  const total = hits.length / 2;
  if (total === 0) return { targets: new Float32Array(0), count: 0 };

  const count = Math.min(budget, total);
  const targets = new Float32Array(count * 2);
  const stride = total / count;
  for (let i = 0; i < count; i += 1) {
    const src = Math.floor(i * stride) * 2;
    // 픽셀 좌표 → 클립 좌표. 표본 간 격자가 보이지 않도록 미세하게 흩뜨린다
    targets[i * 2] = (hits[src]! / c.width) * 2 - 1 + (Math.random() - 0.5) * 0.004;
    targets[i * 2 + 1] = -((hits[src + 1]! / c.height) * 2 - 1) + (Math.random() - 0.5) * 0.004;
  }
  return { targets, count };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function ParticleField({ text, ignite }: { text: string; ignite: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const igniteRef = useRef(ignite);

  // rAF 루프는 재시작하지 않고 최신 값만 읽어 간다
  useEffect(() => {
    igniteRef.current = ignite;
  }, [ignite]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // canvas를 JSX가 아니라 여기서 만든다.
    // StrictMode는 effect를 마운트→정리→마운트로 두 번 돌리는데, 정리에서 컨텍스트를
    // 강제로 잃은 canvas를 재사용하면 두 번째 컨텍스트가 죽은 채로 돌아온다.
    // 마운트마다 새 canvas를 쓰면 그 문제가 없다.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    host.appendChild(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
    const small = window.innerWidth < 640;
    const budget = small || cores <= 4 || memory <= 4 ? 9000 : 30000;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: false,
        dpr: Math.min(1.75, window.devicePixelRatio || 1),
      });
    } catch {
      return; // WebGL을 못 쓰는 환경 — 배경 없이 텍스트만 남는다
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let mesh: Mesh | null = null;
    let raf = 0;
    let disposed = false;

    const state = {
      assemble: 0,
      scroll: 0,
      mouse: [0, -2] as [number, number],
      mouseTarget: [0, -2] as [number, number],
    };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      depthTest: false,
      uniforms: {
        uAssemble: { value: 0 },
        uScroll: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: state.mouse },
        uAspect: { value: 1 },
        uAlphaScale: { value: 1 },
        uDpr: { value: Math.min(1.75, window.devicePixelRatio || 1) },
        uColorA: { value: hexToRgb("#6cb8ff") },
        uColorB: { value: hexToRgb("#b78ae8") },
      },
    });
    program.setBlendFunc(gl.SRC_ALPHA, gl.ONE);

    // canvas는 body의 폰트를 상속받으므로 여기서 실제 패밀리명이 나온다
    const fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";

    const build = () => {
      // canvas가 아니라 host를 잰다.
      // OGL Renderer는 생성 시 기본값 300x150으로 setSize를 호출하면서 canvas의
      // width/height 스타일을 px로 덮어쓴다. canvas를 재면 그 300에 갇힌다.
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      program.uniforms.uAspect!.value = w / h;

      // 좁은 화면에서는 카피가 폭을 다 쓰므로 가운데에 두고 더 흐리게 깐다
      const wide = w >= 900;
      const anchorX = wide ? 0.72 : 0.5;
      program.uniforms.uAlphaScale!.value = wide ? 1 : 0.45;

      const { targets, count } = sampleText(text, w, h, budget, fontFamily, anchorX);
      if (count === 0) return;

      const scatter = new Float32Array(count * 2);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.75 + Math.random() * 1.4;
        scatter[i * 2] = Math.cos(a) * r;
        scatter[i * 2 + 1] = Math.sin(a) * r;
        seeds[i] = Math.random();
      }

      const geometry = new Geometry(gl, {
        aTarget: { size: 2, data: targets },
        aScatter: { size: 2, data: scatter },
        aSeed: { size: 1, data: seeds },
      });
      mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });
    };

    build();
    // 서브셋 폰트가 늦게 로드되면 글자 모양이 달라지므로 준비된 뒤 한 번 더 표본을 뜬다
    document.fonts?.ready.then(() => {
      if (!disposed) build();
    });

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.mouseTarget = [
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      ];
    };
    const onLeave = () => {
      state.mouseTarget = [0, -2];
    };

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 180);
    };
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      state.scroll = Math.min(1, Math.max(0, window.scrollY / (vh * 0.85)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (reduced) {
      // 정지 프레임 한 장 — 이름은 조립된 상태로 보이되 움직이지 않는다
      state.assemble = 1;
      program.uniforms.uAssemble!.value = 1;
      program.uniforms.uMouse!.value = [0, -2];
      if (mesh) renderer.render({ scene: mesh });
    } else {
      const start = performance.now();
      const loop = (now: number) => {
        if (disposed) return;
        const t = (now - start) / 1000;

        const target = igniteRef.current ? 1 : 0;
        state.assemble += (target - state.assemble) * 0.045;
        state.mouse[0] += (state.mouseTarget[0] - state.mouse[0]) * 0.09;
        state.mouse[1] += (state.mouseTarget[1] - state.mouse[1]) * 0.09;

        program.uniforms.uTime!.value = t;
        program.uniforms.uAssemble!.value = state.assemble;
        program.uniforms.uScroll!.value = state.scroll;
        program.uniforms.uMouse!.value = state.mouse;

        // 히어로가 화면 밖으로 완전히 나가면 그리지 않는다
        if (state.scroll < 0.999 && mesh) renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [text]);

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}
