#!/usr/bin/env node
/**
 * 갤러리 카드용 실사 사진을 받아 최적화한다.
 *
 * next.config.ts가 `images: { unoptimized: true }`(정적 export)이므로 Next가 대신 해 주지 않는다.
 * 여기서 리사이즈·포맷 변환을 미리 끝내고 `<picture>`로 srcSet만 걸어 쓴다.
 *
 * 트리트먼트: 흑백 + 대비 강화를 굽는다.
 * 출처가 제각각인 사진 4장이 한 세트로 읽히게 하는 장치이며,
 * 액센트 색은 굽지 않고 CSS에서 올린다(테마가 바뀌어도 재다운로드가 필요 없도록).
 *
 * 사용법: node scripts/fetch-photos.mjs [--force]
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "photos");
const WIDTHS = [640, 1280, 1920];
/** 카드 비율 3:2 */
const RATIO = 2 / 3;

const PHOTOS = [
  {
    name: "concert",
    id: "38780318",
    url: "https://images.pexels.com/photos/38780318/pexels-photo-38780318.jpeg?auto=compress&cs=tinysrgb&w=2400",
    page: "https://www.pexels.com/photo/38780318/",
    desc: "공연장 무대 조명과 관객",
  },
  {
    name: "chat",
    id: "35072449",
    url: "https://images.pexels.com/photos/35072449/pexels-photo-35072449.jpeg?auto=compress&cs=tinysrgb&w=2400",
    page: "https://www.pexels.com/photo/35072449/",
    desc: "야간 도시 스카이라인 (시부야)",
  },
  {
    // 3D 렌더가 아니라 실사여야 한다 — 렌더 이미지는 스톡 티가 나고 신뢰를 깎는다
    name: "billing",
    id: "19224085",
    url: "https://images.pexels.com/photos/19224085/pexels-photo-19224085.jpeg?auto=compress&cs=tinysrgb&w=2400",
    page: "https://www.pexels.com/photo/19224085/",
    desc: "영수증을 출력 중인 계산대와 카드",
  },
  {
    name: "eta",
    id: "13534777",
    url: "https://images.pexels.com/photos/13534777/pexels-photo-13534777.jpeg?auto=compress&cs=tinysrgb&w=2400",
    page: "https://www.pexels.com/photo/13534777/",
    desc: "높은 곳에서 내려다본 횡단보도",
  },
];

const force = process.argv.includes("--force");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const report = [];

  for (const photo of PHOTOS) {
    const marker = path.join(OUT, `${photo.name}-1280.avif`);
    if (!force && (await exists(marker))) {
      console.log(`· ${photo.name} 이미 있음 (--force로 강제 재생성)`);
      continue;
    }

    process.stdout.write(`↓ ${photo.name} 받는 중… `);
    const res = await fetch(photo.url);
    if (!res.ok) throw new Error(`${photo.name}: HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    console.log(`${(input.length / 1024).toFixed(0)}KB`);

    for (const w of WIDTHS) {
      // 흑백 + 대비 강화를 구워 4장이 한 세트로 보이게 한다
      const base = sharp(input)
        .resize(w, Math.round(w * RATIO), { fit: "cover", position: "attention" })
        .grayscale()
        .linear(1.18, -14);

      const avif = await base.clone().avif({ quality: 52, effort: 6 }).toBuffer();
      const webp = await base.clone().webp({ quality: 74 }).toBuffer();
      await writeFile(path.join(OUT, `${photo.name}-${w}.avif`), avif);
      await writeFile(path.join(OUT, `${photo.name}-${w}.webp`), webp);
      report.push(`  ${photo.name}-${w}: avif ${(avif.length / 1024).toFixed(0)}KB · webp ${(webp.length / 1024).toFixed(0)}KB`);
    }
  }

  if (report.length) console.log(report.join("\n"));

  await writeFile(
    path.join(OUT, "CREDITS.md"),
    [
      "# 사진 출처",
      "",
      "갤러리 카드의 사진은 모두 [Pexels](https://www.pexels.com/license/)에서 받았습니다.",
      "Pexels 라이선스는 상업적 사용과 수정을 허용하며 출처 표기를 요구하지 않지만, 확인 가능하도록 남겨 둡니다.",
      "",
      "이 사진들은 **도메인 분위기만 담당**합니다. 성능 수치·아키텍처 등 근거가 되는 그림은",
      "`public/diagrams/`의 구조 다이어그램이며 사진과 역할이 다릅니다.",
      "",
      "| 파일 | 내용 | 원본 |",
      "| --- | --- | --- |",
      ...PHOTOS.map((p) => `| \`${p.name}-*\` | ${p.desc} | [Pexels #${p.id}](${p.page}) |`),
      "",
      "생성: `node scripts/fetch-photos.mjs` — 흑백·대비 보정을 구운 뒤 640/1280/1920 폭의 AVIF·WebP로 저장합니다.",
      "",
    ].join("\n"),
  );
  console.log(`\n완료 → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
