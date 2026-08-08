/**
 * 갤러리 카드 이미지를 실제 제품 화면으로 합성한다.
 *
 * 처음에는 Pexels 분위기 사진을 썼다 — 그때는 보여줄 제품이 없었다.
 * 지금은 네 프로젝트 모두 실제 UI가 있으므로, 카드가 그 제품을 직접 보여준다.
 * "이 사람이 만든 것"을 스톡 사진이 가리게 두지 않는다.
 *
 * 합성 규칙
 * - 캔버스 5:4 (1920×1536 마스터) — 갤러리 카드 비율과 동일
 * - 바탕색은 그 화면의 평균색에서 뽑는다. 어두운 UI는 살짝 밝히고 밝은 UI는 살짝 눌러
 *   가장자리가 보이게 한다. 임의의 브랜드색을 지어내지 않는다
 * - 데스크톱 화면(1920×1200)은 폭 1720으로 줄여 중앙 배치 — 확대는 텍스트를 뭉갠다.
 *   축소만 한다
 * - 모바일 화면(1280×2770)은 높이 1336으로 세워 중앙 배치, 모서리 20px 라운드
 * - 흑백→hover 컬러는 CSS·셰이더가 이미 하므로 여기서는 손대지 않는다
 *
 * 사용: node scripts/make-card-images.mjs
 */
import sharp from "sharp";

const CANVAS = { w: 1920, h: 1536 }; // 5:4
const OUTPUT_WIDTHS = [640, 1280, 1920];

const CARDS = [
  { out: "card-concert", src: "public/screens/concert-catalog-1920.webp", kind: "desktop" },
  { out: "card-chat", src: "public/screens/chat-conversation-1920.webp", kind: "desktop" },
  { out: "card-finmate", src: "public/screens/finmate-my-1280.webp", kind: "mobile" },
  { out: "card-eta", src: "public/screens/eta-routes-1280.webp", kind: "mobile" },
];

/** 화면 평균색 → 바탕색. 어두우면 밝히고 밝으면 누른다. */
async function backdropOf(src) {
  const { channels } = await sharp(src).stats();
  const [r, g, b] = channels.map((c) => c.mean);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const mix = (v, target, t) => Math.round(v + (target - v) * t);
  return lum < 0.5
    ? { r: mix(r, 255, 0.1), g: mix(g, 255, 0.1), b: mix(b, 255, 0.1) } // 어두운 UI → 10% 밝게
    : { r: mix(r, 0, 0.16), g: mix(g, 0, 0.16), b: mix(b, 0, 0.16) }; // 밝은 UI → 16% 어둡게
}

const roundedMask = (w, h, radius) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`,
  );

const borderOverlay = (w, h, radius) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${radius}" ry="${radius}" fill="none" stroke="rgba(120,120,130,0.45)" stroke-width="2"/></svg>`,
  );

async function compose({ out, src, kind }) {
  const backdrop = await backdropOf(src);

  let shot;
  let radius;
  if (kind === "desktop") {
    const w = 1720;
    shot = await sharp(src).resize({ width: w }).toBuffer();
    radius = 8;
  } else {
    const h = 1336;
    shot = await sharp(src).resize({ height: h }).toBuffer();
    radius = 20;
  }
  const meta = await sharp(shot).metadata();

  const rounded = await sharp(shot)
    .composite([{ input: roundedMask(meta.width, meta.height, radius), blend: "dest-in" }])
    .png()
    .toBuffer();

  const master = await sharp({
    create: { width: CANVAS.w, height: CANVAS.h, channels: 3, background: backdrop },
  })
    .composite([
      {
        input: rounded,
        left: Math.round((CANVAS.w - meta.width) / 2),
        top: Math.round((CANVAS.h - meta.height) / 2),
      },
      {
        input: borderOverlay(meta.width, meta.height, radius),
        left: Math.round((CANVAS.w - meta.width) / 2),
        top: Math.round((CANVAS.h - meta.height) / 2),
      },
    ])
    .png()
    .toBuffer();

  for (const w of OUTPUT_WIDTHS) {
    const h = Math.round((w * 4) / 5);
    const resized = sharp(master).resize(w, h);
    await resized.clone().webp({ quality: 84 }).toFile(`public/images/${out}-${w}.webp`);
    await resized.clone().avif({ quality: 58 }).toFile(`public/images/${out}-${w}.avif`);
  }
  const hex = `#${[backdrop.r, backdrop.g, backdrop.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  console.log(`${out}: ${kind} · 바탕 ${hex} · 화면 ${meta.width}x${meta.height}`);
}

for (const card of CARDS) await compose(card);
console.log("완료");
