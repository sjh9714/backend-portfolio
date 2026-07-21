/**
 * 사이트에서 실제 사용하는 글자만 남긴 폰트 서브셋을 생성한다.
 * 콘텐츠(카피) 수정 후에는 반드시 다시 실행할 것:
 *   node scripts/subset-font.mjs
 * (uv 필요 — pyftsubset을 uvx로 실행한다. 누락 글자는 시스템 폴백 폰트로 렌더링된다.)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC_FONT = join(ROOT, "src/fonts/PretendardStdVariable.woff2");
const OUT_FONT = join(ROOT, "src/fonts/PretendardSubset.woff2");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx|svg|css)$/.test(name)) yield p;
  }
}

const chars = new Set();
// ASCII 전체는 항상 포함
for (let c = 0x20; c <= 0x7e; c += 1) chars.add(c);
for (const file of walk(join(ROOT, "src"))) {
  for (const ch of readFileSync(file, "utf8")) {
    const cp = ch.codePointAt(0);
    if (cp > 0x7e) chars.add(cp);
  }
}

const unicodes = [...chars]
  .sort((a, b) => a - b)
  .map((c) => `U+${c.toString(16).toUpperCase().padStart(4, "0")}`)
  .join(",");

console.log(`glyph codepoints: ${chars.size}`);
execFileSync("uvx", [
  "--from",
  "fonttools",
  "--with",
  "brotli",
  "pyftsubset",
  SRC_FONT,
  `--unicodes=${unicodes}`,
  "--flavor=woff2",
  "--layout-features=*",
  `--output-file=${OUT_FONT}`,
]);
const size = statSync(OUT_FONT).size;
console.log(`saved ${OUT_FONT} (${(size / 1024).toFixed(1)} KB)`);
