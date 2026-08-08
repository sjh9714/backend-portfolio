/**
 * 갤러리 카드 이미지 — 실제 제품 화면으로 5:4를 가득 채운다.
 *
 * 처음에는 화면을 축소해 바탕색 위에 띄웠는데, 카드가 제품이 아니라
 * 발표 슬라이드처럼 보였다. 특히 폰 화면은 1920px 캔버스에 617px짜리
 * 스티커가 됐다. 액자를 버린다 — **카드가 곧 제품 화면이다.**
 *
 * 합성 규칙
 * - 캔버스 5:4 (1920×1536 마스터), 여백·바탕색·테두리 없음
 * - 데스크톱 화면(1920×1200): 5:4 센터 크롭(1500×1200) → 확대 없이 가득.
 *   1920 변형만 1.28배 업스케일인데, 카드 실사용 해상도는 1280 변형이다
 * - 모바일 화면(1280×2770): **두 화면을 반반 투업** — 각 상단 1280×2048을
 *   크롭해 960×1536으로 축소, 사이 6px 흰 seam. 폰 하나를 띄우는 것보다
 *   제품이 두 배 보이고 프레임이 남지 않는다
 * - 흑백 기본 → hover 컬러는 CSS·셰이더가 이미 하므로 여기서는 손대지 않는다
 *
 * 사용: node scripts/make-card-images.mjs  (화면 캡처를 갱신하면 다시 실행)
 */
import sharp from "sharp";

const CANVAS = { w: 1920, h: 1536 }; // 5:4
const OUTPUT_WIDTHS = [640, 1280, 1920];
const SEAM = 6; // 투업 사이 흰 이음선

const CARDS = [
  { out: "card-concert", kind: "desktop", src: "public/screens/concert-catalog-1920.webp" },
  { out: "card-chat", kind: "desktop", src: "public/screens/chat-conversation-1920.webp" },
  {
    out: "card-finmate",
    kind: "phone-pair",
    srcs: ["public/screens/finmate-my-1280.webp", "public/screens/finmate-feed-1280.webp"],
  },
  {
    out: "card-eta",
    kind: "phone-pair",
    srcs: ["public/screens/eta-routes-1280.webp", "public/screens/eta-map-1280.webp"],
  },
];

/** 데스크톱: 5:4 크롭으로 캔버스를 가득 채운다. 왼쪽 정렬 — 로고와 제목이 왼쪽에 산다 */
async function desktopMaster(src) {
  const meta = await sharp(src).metadata();
  const cropW = Math.round((meta.height * 5) / 4);
  return sharp(src)
    .extract({ left: 0, top: 0, width: cropW, height: meta.height })
    .resize(CANVAS.w, CANVAS.h)
    .png()
    .toBuffer();
}

/** 폰 두 장: 각 상단을 크롭해 반반 풀블리드 */
async function phonePairMaster(srcs) {
  const half = Math.floor((CANVAS.w - SEAM) / 2); // 957
  const parts = [];
  for (const src of srcs) {
    const meta = await sharp(src).metadata();
    const cropH = Math.round((meta.width * CANVAS.h) / half); // 원본 폭 기준 필요한 높이
    parts.push(
      await sharp(src)
        .extract({ left: 0, top: 0, width: meta.width, height: Math.min(cropH, meta.height) })
        .resize(half, CANVAS.h)
        .png()
        .toBuffer(),
    );
  }
  return sharp({
    create: { width: CANVAS.w, height: CANVAS.h, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: parts[0], left: 0, top: 0 },
      { input: parts[1], left: half + SEAM, top: 0 },
    ])
    .png()
    .toBuffer();
}

for (const card of CARDS) {
  const master =
    card.kind === "desktop" ? await desktopMaster(card.src) : await phonePairMaster(card.srcs);
  for (const w of OUTPUT_WIDTHS) {
    const h = Math.round((w * 4) / 5);
    const resized = sharp(master).resize(w, h);
    await resized.clone().webp({ quality: 84 }).toFile(`public/images/${card.out}-${w}.webp`);
    await resized.clone().avif({ quality: 58 }).toFile(`public/images/${card.out}-${w}.avif`);
  }
  console.log(`${card.out}: ${card.kind}`);
}
console.log("완료");
