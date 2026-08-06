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
 * 색은 그대로 저장한다. 평소에는 흑백으로 보여 네 장이 한 세트로 읽히고,
 * hover하면 원래 색이 드러난다 — 그 전환은 셰이더와 CSS filter가 한다.
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
    name: "finmate",
    slug: "finmate",
    id: "6816989",
    desc: "밝은 카페 테이블에 앉아 휴대폰을 보는 20대",
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

async function main() {
  await mkdir(OUT, { recursive: true });

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

    for (const w of WIDTHS) {
      // 흑백을 굽지 않는다. 평소에는 흑백으로 보이지만 hover하면 원래 색이 드러나야 하고,
      // 그 전환은 셰이더(WebGL)와 CSS filter(폴백)가 담당한다.
      const base = sharp(input).resize(w, Math.round(w * RATIO), {
        fit: "cover",
        position: "attention",
      });

      const avif = await base.clone().avif({ quality: 52, effort: 6 }).toBuffer();
      const webp = await base.clone().webp({ quality: 74 }).toBuffer();
      await writeFile(path.join(OUT, `${photo.name}-${w}.avif`), avif);
      await writeFile(path.join(OUT, `${photo.name}-${w}.webp`), webp);
    }
    console.log(`  → ${photo.name}-{640,1280,1920}.{avif,webp}`);
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
      "`node scripts/fetch-photos.mjs` — 5:4로 잘라 640/1280/1920 폭의 AVIF·WebP로 저장합니다.",
      "**색을 그대로 둡니다.** 화면에서 흑백으로 보이는 것은 셰이더와 CSS filter가 만드는 것이고,",
      "카드에 마우스를 올리면 원래 색이 드러납니다.",
      "",
    ].join("\n"),
  );

  console.log(`\n완료 → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
