/**
 * 이미지마다 20px짜리 흐린 미리보기(base64)를 만들어 TS 파일로 굳힌다.
 *
 * 데모 화면은 lazy AVIF라 스크롤 직후 잠깐 흰 상자만 보였다 — 파일이 늦는 게 아니라
 * 디코드가 늦는 것이라, 그 사이를 채울 것은 이미지 자신의 흐린 잔상이 가장 정직하다.
 * 임의의 회색 상자는 화면과 무관한 색을 만든다.
 *
 * `Photo`가 이 맵을 읽어 <img>의 background로 깐다. 본 이미지가 그려지면 자연히 덮인다.
 *
 * 사용: node scripts/make-placeholders.mjs  (screens·카드 이미지를 바꿀 때마다 다시 실행)
 */
import { readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SOURCES = [
  { dir: "public/screens", prefix: "/screens" },
  { dir: "public/images", prefix: "/images" },
];

const entries = [];
for (const { dir, prefix } of SOURCES) {
  // -640.webp 하나당 base 하나
  const bases = readdirSync(dir)
    .filter((f) => f.endsWith("-640.webp"))
    .map((f) => f.replace(/-640\.webp$/, ""))
    .sort();
  for (const name of bases) {
    const buf = await sharp(`${dir}/${name}-640.webp`)
      .resize({ width: 20 })
      .blur(1.2)
      .webp({ quality: 45 })
      .toBuffer();
    entries.push([`${prefix}/${name}`, `data:image/webp;base64,${buf.toString("base64")}`]);
  }
}

const body = entries.map(([k, v]) => `  ${JSON.stringify(k)}:\n    ${JSON.stringify(v)},`).join("\n");
writeFileSync(
  "src/generated/placeholders.ts",
  `// scripts/make-placeholders.mjs가 생성. 손으로 고치지 않는다.
// 이미지가 디코드되는 동안 <img> 배경으로 깔리는 20px 흐림 미리보기.
export const PLACEHOLDERS: Record<string, string> = {
${body}
};
`,
);
console.log(`${entries.length}개 생성 → src/generated/placeholders.ts`);
