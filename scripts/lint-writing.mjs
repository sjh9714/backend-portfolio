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
import { HASH_FILE, resumeSourceHash } from "./resume-source-hash.mjs";

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

/**
 * 배열 필드 안의 문자열들을 뽑는다. 파일 안 위치(at)도 함께 돌려준다 —
 * case-studies.ts는 한 파일에 여러 프로젝트가 들어 있어서, 어느 프로젝트의 문장인지는
 * 위치로만 알 수 있다(바로 앞의 projectSlug).
 */
function stringsIn(text, fieldPat) {
  const out = [];
  for (const m of text.matchAll(fieldPat)) {
    const base = m.index + m[0].indexOf(m[1]);
    for (const s of m[1].matchAll(/"((?:[^"\\]|\\.)+)"/g)) out.push({ s: s[1], at: base + s.index });
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

// ── 문장이 어느 프로젝트의 것인지 ────────────────────────────────────────────
// 근거 검사를 "docs/facts 어딘가에 있음"이 아니라 "그 프로젝트의 대장에 있음"으로
// 좁히려면 문장마다 슬러그가 필요하다.

const CS_FILE = path.join(CONTENT_DIR, "case-studies.ts");
const slugOfFile = new Map();
for (const [f, t] of texts) {
  if (!f.includes("/projects/")) continue;
  const m = t.match(/\n {2}slug: "([^"]+)"/);
  if (m) slugOfFile.set(f, m[1]);
}
const csSlugMarks = [...(texts.get(CS_FILE) ?? "").matchAll(/projectSlug: "([^"]+)"/g)].map(
  (m) => ({ at: m.index, slug: m[1] }),
);
/** 파일 안 위치로 프로젝트를 찾는다. 못 정하면 null(= 대장 전체와 대조) */
function slugFor(file, at) {
  if (slugOfFile.has(file)) return slugOfFile.get(file);
  if (file !== CS_FILE) return null;
  let found = null;
  for (const mk of csSlugMarks) {
    if (mk.at < at) found = mk.slug;
    else break;
  }
  return found;
}

const layerStrings = {}; // layer → [{file, s, slug}]
for (const [name, { pat }] of Object.entries(LAYERS)) {
  layerStrings[name] = [];
  for (const [f, t] of texts) {
    for (const { s, at } of stringsIn(t, pat)) {
      layerStrings[name].push({ file: f, s, slug: slugFor(f, at) });
    }
  }
}
// 캡션은 배열이 아니라 단일 필드
layerStrings.caption = [];
for (const [f, t] of texts) {
  for (const m of t.matchAll(/caption:\s*\n?\s*"((?:[^"\\]|\\.)+)"/g)) {
    layerStrings.caption.push({ file: f, s: m[1], slug: slugFor(f, m.index) });
  }
}
LAYERS.caption = { register: "free" };

/*
 * 아래 세 층은 원래 검사 밖에 있었다. 그런데 화면에서 가장 먼저 읽히는 수치가 여기 있다 —
 * 특히 히어로 근거 칩은 이 저장소의 근거 대장을 만들게 한 사고가 난 자리다
 * (부인된 `+70.5%`가 칩까지 올라와 있었다. docs/facts/realtime-chat.md 참조).
 * 검사가 산문 층만 보고 정작 표제 수치를 안 보고 있었다.
 */

// 히어로 근거 칩 — href가 어느 프로젝트의 주장인지 지정한다
layerStrings.proofChip = [];
for (const m of (texts.get(path.join(CONTENT_DIR, "profile.ts")) ?? "").matchAll(
  /\{\s*text: "((?:[^"\\]|\\.)+)",\s*href: "([^"]*)"/g,
)) {
  layerStrings.proofChip.push({
    file: path.join(CONTENT_DIR, "profile.ts"),
    s: m[1],
    slug: m[2].match(/\/projects\/([^/#]+)/)?.[1] ?? null,
  });
}
LAYERS.proofChip = { register: "free" };

// 이력서 도입부 — 여러 프로젝트를 가로지르는 요약이라 슬러그를 하나로 정할 수 없다
layerStrings.resumeIntro = [];
{
  const m = (texts.get(path.join(CONTENT_DIR, "resume.ts")) ?? "").match(
    /\n {2}intro: \[([\s\S]*?)\n {2}\]/,
  );
  for (const s of m?.[1].matchAll(/"((?:[^"\\]|\\.)+)"/g) ?? []) {
    layerStrings.resumeIntro.push({
      file: path.join(CONTENT_DIR, "resume.ts"),
      s: s[1],
      slug: null,
    });
  }
}
LAYERS.resumeIntro = { register: "polite" };

// 케이스의 전후 수치 — 화면의 표에 그대로 나가는 값이다
layerStrings.metric = [];
for (const m of (texts.get(CS_FILE) ?? "").matchAll(
  /\n {6,10}(?:before|after|condition):\s*\n?\s*"((?:[^"\\]|\\.)+)"/g,
)) {
  layerStrings.metric.push({ file: CS_FILE, s: m[1], slug: slugFor(CS_FILE, m.index) });
}
LAYERS.metric = { register: "free" };

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

// ── 근거 대장 읽기 ───────────────────────────────────────────────────────────

const FACT_FILES = readdirSync("docs/facts").filter((f) => f.endsWith(".md"));

/**
 * 프로젝트별 숫자 집합. 파일 이름이 슬러그다 (ai-usage-billing-gateway.md → 그 슬러그)
 *
 * exact 와 rounded 를 나눠 둔다. 반올림은 **화면이 대장보다 거친 쪽으로만** 허용한다 —
 * 대장 `32.5ms`를 화면이 `32ms`로 줄여 적는 건 같은 사실이지만, 대장 어딘가의 `0`을
 * 근거로 화면의 `0.72ms`를 통과시키면 그건 근거가 아니다. 한 방향만 연다.
 */
const factNums = new Map();
const factNumsAll = { exact: new Set(), rounded: new Set() };
for (const f of FACT_FILES) {
  const exact = new Set();
  const rounded = new Set();
  for (const m of readFileSync(path.join("docs/facts", f), "utf8").matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = m[0].replace(/,/g, "");
    exact.add(n);
    factNumsAll.exact.add(n);
    if (n.includes(".")) {
      rounded.add(n.split(".")[0]);
      factNumsAll.rounded.add(n.split(".")[0]);
    }
  }
  factNums.set(path.basename(f, ".md"), { exact, rounded });
}

/**
 * 「싣지 않는 수치」 블록. 대장에 사람 말로만 적혀 있던 금지 규칙을 기계가 읽는 자리로
 * 옮긴 것이다. 이유까지 위반 메시지에 실어 나른다.
 */
const bans = [];
for (const f of FACT_FILES) {
  const sec = readFileSync(path.join("docs/facts", f), "utf8").match(
    /\n## 싣지 않는 수치\n([\s\S]*?)(?=\n## |$)/,
  );
  for (const m of sec?.[1].matchAll(/^- `([^`]+)` — (.+)$/gm) ?? []) {
    bans.push({ token: m[1].trim(), why: m[2].trim(), from: f });
  }
}

/*
 * 8. 근거 — 화면 수치가 **그 프로젝트의** 대장에 있다
 *
 * 이 검사가 못 보는 것을 적어 둔다. 값과 프로젝트는 대조하지만 **단위는 대조하지 않는다** —
 * 대장의 `4.9`가 RPS인지 %인지까지는 보지 않으므로, 값이 맞고 의미가 틀린 인용은
 * 여기서 안 걸린다. 그 종류는 「싣지 않는 수치」(검사 9)가 이름으로 막는다.
 * 대장이 마크다운 표라 값과 단위가 늘 붙어 있지 않아, 단위까지 기계로 맞추면
 * 오탐이 실익보다 커진다고 판단했다.
 */
{
  const UNIT = /(\d[\d,]*(?:\.\d+)?)\s?(ms|%|건|회|배|MB|kB|행|VU|RPS|반복\/초|명)/g;
  for (const name of Object.keys(layerStrings)) {
    for (const { file, s, slug } of layerStrings[name]) {
      const scoped = slug && factNums.has(slug);
      const pool = scoped ? factNums.get(slug) : factNumsAll;
      const where = scoped ? `${slug}.md` : "docs/facts";
      for (const m of s.matchAll(UNIT)) {
        const n = m[1].replace(/,/g, "").replace(/\.$/, "");
        const ok = pool.exact.has(n) || (!n.includes(".") && pool.rounded.has(n));
        if (!ok) fail("근거", file, `${name}: "${m[1]}${m[2]}" — ${where}에 없음`);
      }
    }
  }
}

// 9. 금지 — 대장이 "싣지 않는다"고 표시한 수치가 화면에 없다
{
  // 숫자 경계를 요구한다. 그러지 않으면 "4.9" 금지가 "14.9"까지 잡는다.
  const rx = (token) =>
    new RegExp(
      `(?<![\\d.,])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}(?![\\d])`,
    );
  for (const name of Object.keys(layerStrings)) {
    for (const { file, s } of layerStrings[name]) {
      for (const b of bans) {
        if (rx(b.token).test(s)) {
          fail("금지", file, `${name}: "${b.token}" — ${b.why} (${b.from})`);
        }
      }
    }
  }
}

// 10. 근거 — measured/verified로 표시한 수치에는 링크가 붙어 있다
{
  // 화면의 수치 옆에 "측정함"이라 써 놓고 어디서 쟀는지 안 걸어 두면, 그 표시는
  // 근거가 아니라 장식이다. 지금은 23개 전부 붙어 있고, 앞으로도 그래야 한다.
  const cs = texts.get(CS_FILE) ?? "";
  const balanced = (s, start, open, close) => {
    let depth = 0;
    for (let i = start; i < s.length; i += 1) {
      if (s[i] === open) depth += 1;
      else if (s[i] === close && --depth === 0) return s.slice(start, i + 1);
    }
    return "";
  };
  for (let idx = cs.indexOf("metrics: ["); idx !== -1; idx = cs.indexOf("metrics: [", idx + 1)) {
    const arr = balanced(cs, cs.indexOf("[", idx), "[", "]");
    for (let j = arr.indexOf("{"); j !== -1; j = arr.indexOf("{", j + 1)) {
      const obj = balanced(arr, j, "{", "}");
      if (!obj || !/evidence: "/.test(obj) || !/^\s+label:/m.test(obj)) continue;
      if (!/href:/.test(obj)) {
        const label = obj.match(/label: "([^"]+)"/)?.[1] ?? "(라벨 없음)";
        fail("근거·링크", CS_FILE, `metric "${label}" — evidence 표시가 있는데 링크가 없다`);
      }
      j += obj.length - 1;
    }
  }
}

// 11. 산출물 — 이력서 PDF가 지금 콘텐츠에서 나온 것인가
{
  // PDF는 커밋된 산출물이라 조용히 낡는다. 그러면 화면과 채용담당자가 받는 파일이
  // 다른 숫자를 말한다 — 이 사이트에서 가장 비싼 종류의 불일치다.
  let recorded = null;
  try {
    recorded = readFileSync(HASH_FILE, "utf8").trim();
  } catch {
    /* 아직 없음 */
  }
  const now = resumeSourceHash();
  if (recorded !== now) {
    fail(
      "산출물",
      HASH_FILE,
      recorded === null
        ? "이력서 PDF의 출처 해시가 없다 — `node scripts/resume-pdf.mjs`로 다시 뽑을 것"
        : "이력서 콘텐츠가 PDF 생성 이후에 바뀌었다 — `node scripts/resume-pdf.mjs`로 다시 뽑을 것",
    );
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
