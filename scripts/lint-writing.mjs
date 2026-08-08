/**
 * 글 린트 — `docs/writing.md`의 규칙을 검사로 강제한다.
 *
 * 이 사이트의 통일성은 오래 습관으로 유지됐다. 습관은 다음 문장 하나에서 무너진다.
 * 파생 이력서와 Capability 참조가 "숫자가 갈라질 수 없는 구조"이듯,
 * 이 스크립트는 "문체가 갈라질 수 없는 구조"다.
 *
 * 검사 대상: `src/content`의 사용자에게 보이는 문장 층.
 * (alt 텍스트·run 명령·stack 목록은 서술문이 아니라 제외한다)
 *
 * 사용: node scripts/lint-writing.mjs   — 위반이 있으면 목록과 함께 exit 1
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// ── 콘텐츠 수집 ───────────────────────────────────────────────────────────────

const CONTENT_DIR = "src/content";
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".ts")) files.push(p);
  }
})(CONTENT_DIR);

const texts = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

/** 배열 필드 안의 문자열들을 뽑는다 */
function stringsIn(text, fieldPat) {
  const out = [];
  for (const m of text.matchAll(fieldPat)) {
    for (const s of m[1].matchAll(/"((?:[^"\\]|\\.)+)"/g)) out.push(s[1]);
  }
  return out;
}

// 층: 이름 → { pat, register }
// register: "polite"(습니다체 전수) | "nominal"(개조식, — 뒤 강조절만 평서) | "free"(캡션·증명 서술)
const LAYERS = {
  what: { pat: /\n {4}what: \[([\s\S]*?)\n {4}\]/g, register: "polite" },
  claimBoundary: { pat: /\n {2}claimBoundary: \[([\s\S]*?)\n {2}\]/g, register: "polite" },
  summary: { pat: /\n {2}summary: \[([\s\S]*?)\n {2}\]/g, register: "nominal" },
  features: { pat: /\n {2}features: \[([\s\S]*?)\n {2}\]/g, register: "nominal" },
  cause: { pat: /\n {4}cause: \[([\s\S]*?)\n {4}\]/g, register: "nominal" },
  approach: { pat: /\n {4}approach: \[([\s\S]*?)\n {4}\]/g, register: "nominal" },
  result: { pat: /\n {4}result: \[([\s\S]*?)\n {4}\]/g, register: "nominal" },
  provenBy: { pat: /provenBy: \[([\s\S]*?)\n {6}\]/g, register: "free" },
};

const layerStrings = {}; // layer → [{file, s}]
for (const [name, { pat }] of Object.entries(LAYERS)) {
  layerStrings[name] = [];
  for (const [f, t] of texts) {
    for (const s of stringsIn(t, pat)) layerStrings[name].push({ file: f, s });
  }
}
// 캡션은 배열이 아니라 단일 필드
layerStrings.caption = [];
for (const [f, t] of texts) {
  for (const m of t.matchAll(/caption:\s*\n?\s*"((?:[^"\\]|\\.)+)"/g)) {
    layerStrings.caption.push({ file: f, s: m[1] });
  }
}
LAYERS.caption = { register: "free" };

// ── 검사 ─────────────────────────────────────────────────────────────────────

const violations = [];
const fail = (rule, file, detail) =>
  violations.push(`  ✗ [${rule}] ${path.basename(file)}: ${detail}`);

const stripTail = (s) =>
  s
    .replace(/\([^()]*\)[\s.]*$/g, "") // 문장 끝 괄호 보충("(프론트 91% …)")은 종결이 아니다
    .replace(/[\s.)"'”’]+$/g, "");

// 1. 문체 — 습니다체 층: 모든 문장이 ~니다로 끝난다
for (const [name, { register }] of Object.entries(LAYERS)) {
  if (register !== "polite") continue;
  for (const { file, s } of layerStrings[name]) {
    for (const sent of s.split(/(?<=\.)\s+/)) {
      const tail = stripTail(sent);
      if (tail && !tail.endsWith("니다")) {
        fail("문체·습니다체", file, `${name} 층은 습니다체 — "…${tail.slice(-24)}"`);
      }
    }
  }
}

// 2. 문체 — 개조식 층: '~다' 종결은 대시(—) 포함 불릿에서만
for (const [name, { register }] of Object.entries(LAYERS)) {
  if (register !== "nominal") continue;
  for (const { file, s } of layerStrings[name]) {
    if (/다$/.test(stripTail(s)) && !s.includes("—")) {
      fail("문체·대시강조", file, `${name}: 대시 없는 평서 종결 — "…${s.slice(-30)}"`);
    }
  }
}

// 3. 쉼표 — 절 쉼표 2개까지 (숫자 콤마 제외)
for (const name of Object.keys(layerStrings)) {
  for (const { file, s } of layerStrings[name]) {
    const noNum = s.replace(/(?<=\d),(?=\d)/g, "");
    for (const sent of noNum.split(/(?<=\.)\s+/)) {
      const n = (sent.match(/,/g) || []).length;
      if (n >= 3) fail("쉼표", file, `${name}: 쉼표 ${n}개 — "${sent.slice(0, 40)}…"`);
    }
  }
}

// 4. 표기 — 화살표 공백, VU 붙여쓰기
for (const name of Object.keys(layerStrings)) {
  for (const { file, s } of layerStrings[name]) {
    if (/\S→|→\S/.test(s)) fail("표기·화살표", file, `${name}: → 앞뒤 공백 — "${s.slice(0, 40)}…"`);
    if (/\d+VU/.test(s)) fail("표기·VU", file, `${name}: N VU로 띄어 쓴다 — "${s.slice(0, 40)}…"`);
  }
}

// 5. 표기 — 4~5자리 숫자 콤마 (연도·hex SHA 제외)
for (const name of Object.keys(layerStrings)) {
  for (const { file, s } of layerStrings[name]) {
    for (const m of s.matchAll(/(?<![\d,.\w])(\d{4,5})(?![\d,]|[a-f])/g)) {
      if (/^202\d$/.test(m[1])) continue;
      fail("표기·숫자콤마", file, `${name}: ${m[1]} — 네 자리부터 콤마`);
    }
  }
}

// 6. 구조 — 케이스 제목 45자, 문제/해결/결과 3/3/3
{
  const cs = texts.get(path.join(CONTENT_DIR, "case-studies.ts"));
  for (const m of cs.matchAll(/title:\s*\n?\s*"((?:[^"\\]|\\.)+)"/g)) {
    if (m[1].length > 46) fail("구조·제목", "case-studies.ts", `${m[1].length}자: ${m[1].slice(0, 30)}…`);
  }
  const blocks = cs.split(/\n {2}\{\n {4}id: "/).slice(1);
  for (const b of blocks) {
    const id = b.split('"')[0];
    for (const key of ["cause", "approach", "result"]) {
      const bm = b.match(new RegExp(`\\n {4}${key}: \\[([\\s\\S]*?)\\n {4}\\]`));
      const n = bm ? (bm[1].match(/^\s+["']/gm) || []).length : 0;
      if (n !== 3) fail("구조·3/3/3", "case-studies.ts", `${id}.${key} = ${n}줄 (3이어야)`);
    }
  }
}

// 7. 구조 — 프로젝트당 summary 3~4 · features 2~3 (hidden 제외)
for (const [f, t] of texts) {
  if (!f.includes("/projects/") || f.endsWith("index.ts")) continue;
  if (t.includes("hidden: true")) continue;
  const count = (key, indent) => {
    const m = t.match(new RegExp(`\\n {${indent}}${key}: \\[([\\s\\S]*?)\\n {${indent}}\\]`));
    return m ? (m[1].match(/^\s+"/gm) || []).length : 0;
  };
  const s = count("summary", 2);
  const ft = count("features", 2);
  if (s < 3 || s > 4) fail("구조·요약수", f, `summary ${s}줄 (3~4)`);
  if (ft < 2 || ft > 3) fail("구조·구현수", f, `features ${ft}줄 (2~3)`);
}

// 8. 근거 — 화면 수치가 docs/facts에 있다
{
  const facts = readdirSync("docs/facts")
    .filter((f) => f.endsWith(".md"))
    .map((f) => readFileSync(path.join("docs/facts", f), "utf8"))
    .join(" ");
  const norm = new Set();
  for (const m of facts.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = m[0].replace(/,/g, "");
    norm.add(n);
    norm.add(n.split(".")[0]); // 소수점 근거는 정수부 매칭도 허용
  }
  const UNIT = /(\d[\d,]*(?:\.\d+)?)\s?(ms|%|건|회|배|MB|kB|행|VU|RPS|반복\/초|명)/g;
  for (const name of Object.keys(layerStrings)) {
    for (const { file, s } of layerStrings[name]) {
      for (const m of s.matchAll(UNIT)) {
        const n = m[1].replace(/,/g, "").replace(/\.$/, "");
        if (!norm.has(n) && !norm.has(n.split(".")[0])) {
          fail("근거", file, `${name}: "${m[1]}${m[2]}" — docs/facts에 없음`);
        }
      }
    }
  }
}

// ── 결과 ─────────────────────────────────────────────────────────────────────

const total = Object.values(layerStrings).reduce((a, v) => a + v.length, 0);
if (violations.length) {
  console.error(`글 린트 실패 — 문장 ${total}개 중 위반 ${violations.length}건\n`);
  for (const v of violations) console.error(v);
  process.exit(1);
}
console.log(`글 린트 통과 — 문장 ${total}개, 위반 0`);
