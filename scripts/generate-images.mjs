#!/usr/bin/env node
/**
 * 갤러리 카드 이미지를 fal.ai로 생성하고 최적화한다.
 *
 * 원칙 두 가지:
 * 1. **하나의 아트 디렉션.** 재질·조명·팔레트·카메라를 공통 프리픽스로 고정하고
 *    프로젝트별로는 형태(subject)만 바꾼다. 4장이 따로 놀면 스톡 사진과 같은 문제가 된다.
 * 2. **가짜 정보를 만들지 않는다.** 문자·수치·UI가 들어가지 않도록 프롬프트에서 배제한다.
 *    근거는 다이어그램이 지고 이미지는 분위기만 담당한다는 분리를 지킨다.
 *
 * 키는 `.env.local`의 FAL_KEY에서만 읽고 어떤 산출물에도 남기지 않는다.
 *
 * 사용법: node scripts/generate-images.mjs [--force] [--only <name>]
 */
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");
const WIDTHS = [640, 1280, 1920];
/** 카드 비율 5:4 — lusion 실측값(528×419)과 같다 */
const RATIO = 4 / 5;
const MODEL = "fal-ai/flux-pro/v1.1-ultra";
const ENDPOINT = `https://fal.run/${MODEL}`;

/**
 * 공통 아트 디렉션. 이 문장이 4장을 한 세트로 묶는다.
 * 문자·UI·수치를 명시적으로 배제한다.
 */
const STYLE = [
  "abstract 3d render",
  "matte ceramic and brushed aluminium surfaces",
  "single soft key light from upper left, long soft shadows",
  "seamless off-white studio backdrop",
  "muted neutral palette with one electric blue accent",
  "shallow depth of field, centered composition, generous negative space",
  "minimal, editorial product photography aesthetic",
  "no text, no letters, no numbers, no user interface, no charts",
].join(", ");

const SUBJECTS = [
  {
    name: "concert",
    slug: "concert-booking",
    seed: 101,
    subject:
      "a dense grid of identical small cubes converging toward one point, exactly one cube lifted above the plane and glowing electric blue while every other cube stays matte white",
    note: "좌석 예약 — 같은 지점을 두고 경합하다 하나만 통과",
  },
  {
    name: "billing",
    slug: "ai-usage-billing-gateway",
    seed: 202,
    subject:
      "a precise stack of thin flat plates layered in perfect alignment, one single plate slid outward in the opposite direction, casting its own shadow",
    note: "사용량 과금 — 덮어쓰지 않고 쌓이는 원장, 환불은 반대 방향 엔트리",
  },
  {
    name: "chat",
    slug: "realtime-chat",
    seed: 303,
    subject:
      "concentric ripple rings expanding outward from a single origin point across a smooth matte surface, the innermost ring lit electric blue",
    note: "실시간 채팅 — 커밋된 뒤 한 점에서 전원에게 퍼지는 fan-out",
  },
  {
    name: "eta",
    slug: "eta",
    seed: 404,
    subject:
      "a single smooth ribbon path splitting into two diverging routes and merging back into one, resting on a subtle stepped topographic surface",
    note: "배리어프리 길찾기 — 이탈하면 갈라졌다 다시 합류하는 경로",
  },
];

const force = process.argv.includes("--force");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

async function readKey() {
  try {
    const raw = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    const line = raw.split("\n").find((l) => l.startsWith("FAL_KEY="));
    const key = line?.slice("FAL_KEY=".length).trim();
    if (!key) throw new Error("empty");
    return key;
  } catch {
    console.error(
      "FAL_KEY를 찾을 수 없습니다.\n" +
        "  echo 'FAL_KEY=<키>' > .env.local\n" +
        "터미널에서 실행하세요 (.gitignore에 이미 포함돼 커밋되지 않습니다).",
    );
    process.exit(2);
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * 카드 hover 틴트로 쓸 색을 뽑는다.
 *
 * `stats().dominant`를 쓰면 안 된다 — 이 이미지들은 대부분 흰 배경이라
 * 무채색 회색이 나오고, `mix-blend-color` 오버레이는 채도가 없으면 아무 변화도 못 만든다.
 * 그래서 **가장 채도 높은 픽셀**을 찾는다. 배경(밝음)과 그림자(어두움)는 제외한다.
 */
async function themeFrom(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(96, 96, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let best = [10, 22, 236]; // 못 찾으면 사이트 액센트로 떨어진다
  let bestSat = -1;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 510;
    if (lightness < 0.18 || lightness > 0.88) continue;
    const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (sat > bestSat) {
      bestSat = sat;
      best = [r, g, b];
    }
  }

  const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return { bg: `#${hex(best[0])}${hex(best[1])}${hex(best[2])}`, fg: "#f0f1fa" };
}

async function generate(key, item) {
  const prompt = `${item.subject}. ${STYLE}`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "4:3", // 5:4는 지원하지 않아 4:3으로 받고 아래에서 잘라 맞춘다
      output_format: "png",
      num_images: 1,
      seed: item.seed,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${item.name}: HTTP ${res.status} — ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const url = json?.images?.[0]?.url;
  if (!url) throw new Error(`${item.name}: 응답에 이미지 URL이 없음`);

  const img = await fetch(url);
  if (!img.ok) throw new Error(`${item.name}: 이미지 다운로드 실패 HTTP ${img.status}`);
  return { buffer: Buffer.from(await img.arrayBuffer()), prompt, seed: json.seed ?? item.seed };
}

async function main() {
  const key = await readKey();
  await mkdir(OUT, { recursive: true });

  const targets = only ? SUBJECTS.filter((s) => s.name === only) : SUBJECTS;
  if (targets.length === 0) {
    console.error(`--only ${only} 에 해당하는 항목이 없습니다.`);
    process.exit(2);
  }

  const report = [];
  const themes = {};

  for (const item of targets) {
    const marker = path.join(OUT, `${item.name}-1280.avif`);
    if (!force && (await exists(marker))) {
      console.log(`· ${item.name} 이미 있음 (--force로 재생성)`);
      continue;
    }

    process.stdout.write(`↻ ${item.name} 생성 중… `);
    const { buffer, prompt, seed } = await generate(key, item);
    console.log(`${(buffer.length / 1024).toFixed(0)}KB`);

    const theme = await themeFrom(buffer);
    themes[item.slug] = theme;

    for (const w of WIDTHS) {
      const base = sharp(buffer).resize(w, Math.round(w * RATIO), {
        fit: "cover",
        position: "attention",
      });
      const avif = await base.clone().avif({ quality: 55, effort: 6 }).toBuffer();
      const webp = await base.clone().webp({ quality: 78 }).toBuffer();
      await writeFile(path.join(OUT, `${item.name}-${w}.avif`), avif);
      await writeFile(path.join(OUT, `${item.name}-${w}.webp`), webp);
    }

    report.push({ ...item, prompt, seed, theme });
    console.log(`  → ${item.name}-{640,1280,1920}.{avif,webp} · 테마 ${theme.bg}`);
  }

  if (report.length > 0) {
    await writeFile(
      path.join(OUT, "CREDITS.md"),
      [
        "# 갤러리 이미지 출처",
        "",
        "**이 이미지들은 AI로 생성한 것입니다.** 촬영물이 아닙니다.",
        "",
        `- 모델: \`${MODEL}\` (fal.ai)`,
        `- 생성: \`node scripts/generate-images.mjs\``,
        "- 후처리: 5:4로 잘라 640/1280/1920 폭의 AVIF·WebP 생성 (sharp)",
        "",
        "## 역할",
        "",
        "이미지는 **도메인의 분위기만** 담당합니다. 성능 수치·아키텍처 등 주장의 근거가 되는 그림은",
        "`public/diagrams/`의 구조 다이어그램이며 역할이 다릅니다.",
        "그래서 프롬프트에서 문자·수치·UI를 명시적으로 배제했습니다 — 그럴듯한 대시보드나",
        "가짜 지표가 들어가면 근거와 분위기의 경계가 무너집니다.",
        "",
        "## 공통 아트 디렉션",
        "",
        "4장이 한 세트로 읽히도록 재질·조명·팔레트·카메라를 고정했습니다.",
        "",
        "```",
        STYLE,
        "```",
        "",
        "## 이미지별 프롬프트",
        "",
        ...report.flatMap((r) => [
          `### \`${r.name}\` — ${r.slug}`,
          "",
          `${r.note}`,
          "",
          `- seed: \`${r.seed}\``,
          `- 대표색: \`${r.theme.bg}\``,
          "",
          "```",
          r.subject,
          "```",
          "",
        ]),
      ].join("\n"),
    );

    console.log("\n카드 테마에 반영할 값:");
    for (const r of report) console.log(`  ${r.slug}: { bg: "${r.theme.bg}", fg: "${r.theme.fg}" }`);
  }

  console.log(`\n완료 → ${OUT}`);
}

main().catch((e) => {
  // 오류 메시지에 키가 섞이지 않도록 원문을 그대로 던지지 않는다
  console.error(String(e.message ?? e).replace(/Key\s+\S+/g, "Key ***"));
  process.exit(1);
});
