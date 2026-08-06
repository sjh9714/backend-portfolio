#!/usr/bin/env node
/**
 * 갤러리 카드용 실사 사진을 받아 최적화한다.
 *
 * 사진은 **생성하지 않는다.** 네 장 모두 실제로 촬영된 사진이고,
 * 각각 그 서비스를 쓰는 순간의 사람이 담겨 있다.
 *
 * next.config.ts가 `images: { unoptimized: true }`(정적 export)이므로
 * Next가 대신 해 주지 않는다. 여기서 리사이즈·포맷 변환을 끝내고
 * `<picture>`로 srcSet만 걸어 쓴다.
 *
 * 트리트먼트: 흑백 + 대비 강화를 굽는다.
 * 출처가 제각각인 사진 네 장이 한 세트로 읽히게 하는 장치이며,
 * 액센트 색은 굽지 않고 CSS에서 올린다.
 *
 * 사용법: node scripts/fetch-photos.mjs [--force]
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");
const WIDTHS = [640, 1280, 1920];
/** 카드 비율 5:4 — lusion 실측(528×419)과 같다 */
const RATIO = 4 / 5;

/**
 * 채팅과 길찾기가 둘 다 "폰 든 사람"이 되면 서로 구분이 안 되므로
 * 프레이밍을 갈랐다 — 채팅은 밤·클로즈업·실루엣, 길찾기는 낮·부감·군중.
 */
const PHOTOS = [
  {
    name: "concert",
    slug: "concert-booking",
    id: "21790480",
    desc: "무대 조명을 배경으로 손을 든 콘서트 관객 실루엣",
  },
  {
    name: "billing",
    slug: "ai-usage-billing-gateway",
    id: "3907161",
    desc: "카드 결제가 오가는 고객과 계산대의 손",
  },
  {
    name: "chat",
    slug: "realtime-chat",
    id: "18694904",
    desc: "밤 발코니에서 메시지를 보내는 실루엣, 뒤로 도시 불빛",
  },
  {
    name: "eta",
    slug: "eta",
    id: "13534777",
    desc: "높은 곳에서 내려다본 횡단보도를 건너는 보행자들",
  },
];

const force = process.argv.includes("--force");

const fileUrl = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;
const pageUrl = (id) => `https://www.pexels.com/photo/${id}/`;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * 카드 hover 틴트로 쓸 색을 **흑백을 굽기 전 원본에서** 뽑는다.
 * 흑백 이미지에는 채도가 없어 나중에 뽑으면 네 장이 전부 같은 폴백 색으로 떨어진다.
 *
 * `stats().dominant`는 쓰지 않는다 — 화면 대부분을 차지하는 배경색이 잡혀
 * `mix-blend-color` 오버레이가 밋밋해진다. 가장 채도 높은 픽셀을 찾는다.
 */
async function themeFrom(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(96, 96, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let best = [0, 22, 236]; // 못 찾으면 사이트 액센트로 떨어진다
  let bestSat = -1;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 510;
    // 배경(밝음)과 그림자(어두움)는 색이 아니다
    if (lightness < 0.18 || lightness > 0.88) continue;
    const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (sat > bestSat) {
      bestSat = sat;
      best = [r, g, b];
    }
  }

  const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${hex(best[0])}${hex(best[1])}${hex(best[2])}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const themes = [];

  for (const photo of PHOTOS) {
    const marker = path.join(OUT, `${photo.name}-1280.avif`);
    if (!force && (await exists(marker))) {
      console.log(`· ${photo.name} 이미 있음 (--force로 강제 재생성)`);
      continue;
    }

    process.stdout.write(`↓ ${photo.name} 받는 중… `);
    const res = await fetch(fileUrl(photo.id));
    if (!res.ok) throw new Error(`${photo.name}: HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    console.log(`${(input.length / 1024).toFixed(0)}KB`);

    // 색이 살아 있을 때 테마를 먼저 뽑는다
    const theme = await themeFrom(input);
    themes.push({ ...photo, theme });

    for (const w of WIDTHS) {
      const base = sharp(input)
        .resize(w, Math.round(w * RATIO), { fit: "cover", position: "attention" })
        .grayscale()
        .linear(1.18, -14);

      const avif = await base.clone().avif({ quality: 52, effort: 6 }).toBuffer();
      const webp = await base.clone().webp({ quality: 74 }).toBuffer();
      await writeFile(path.join(OUT, `${photo.name}-${w}.avif`), avif);
      await writeFile(path.join(OUT, `${photo.name}-${w}.webp`), webp);
    }
    console.log(`  → ${photo.name}-{640,1280,1920}.{avif,webp} · 테마 ${theme}`);
  }

  await writeFile(
    path.join(OUT, "CREDITS.md"),
    [
      "# 갤러리 이미지 출처",
      "",
      "네 장 모두 [Pexels](https://www.pexels.com/license/)에서 받은 **실제 촬영 사진**입니다.",
      "AI로 생성한 이미지가 아닙니다.",
      "",
      "Pexels 라이선스는 상업적 사용과 수정을 허용하며 출처 표기를 요구하지 않지만,",
      "확인 가능하도록 남겨 둡니다.",
      "",
      "| 파일 | 장면 | 원본 |",
      "| --- | --- | --- |",
      ...PHOTOS.map((p) => `| \`${p.name}-*\` | ${p.desc} | [Pexels #${p.id}](${pageUrl(p.id)}) |`),
      "",
      "## 역할",
      "",
      "이미지는 **도메인 분위기만** 담당합니다. 성능 수치·아키텍처 등 주장의 근거가 되는 그림은",
      "`public/diagrams/`의 구조 다이어그램이며 역할이 다릅니다.",
      "",
      "## 생성",
      "",
      "`node scripts/fetch-photos.mjs` — 5:4로 잘라 흑백·대비 보정을 구운 뒤",
      "640/1280/1920 폭의 AVIF·WebP로 저장합니다.",
      "카드 hover 틴트 색은 흑백을 굽기 전 원본에서 뽑습니다(흑백에는 채도가 없어 나중엔 못 뽑습니다).",
      "",
    ].join("\n"),
  );

  if (themes.length > 0) {
    console.log("\n카드 테마에 반영할 값:");
    for (const t of themes) console.log(`  ${t.slug}: { bg: "${t.theme}", fg: "#f0f1fa" }`);
  }
  console.log(`\n완료 → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
