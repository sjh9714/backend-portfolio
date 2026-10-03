/**
 * 공개 문장의 근거와 콘텐츠 참조를 검사한다.
 * 사용: npm run lint:writing
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { Module } from "node:module";
import path from "node:path";
import ts from "typescript";
import { HASH_FILE, resumeSourceHash } from "./resume-source-hash.mjs";

// TypeScript 콘텐츠를 같은 실행에서 읽는다. TS 타입/주석을 정규식으로 해석하면
// 필드 순서나 줄바꿈만 바뀌어도 검사가 빠지므로 실제 export 값을 대상으로 한다.
const moduleCache = new Map();
function loadContent(file) {
  const candidate = path.resolve(file);
  const filename = existsSync(candidate) && !candidate.endsWith(".ts")
    ? path.join(candidate, "index.ts")
    : candidate.endsWith(".ts") ? candidate : `${candidate}.ts`;
  if (moduleCache.has(filename)) return moduleCache.get(filename).exports;
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  moduleCache.set(filename, mod);
  const nativeRequire = mod.require.bind(mod);
  mod.require = (specifier) =>
    specifier.startsWith(".")
      ? loadContent(path.resolve(path.dirname(filename), specifier))
      : nativeRequire(specifier);
  const source = readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  mod._compile(code, filename);
  return mod.exports;
}

const { projects } = loadContent("src/content/projects/index.ts");
const { caseStudies, featuredCases } = loadContent("src/content/case-studies.ts");
const { resume } = loadContent("src/content/resume.ts");
const { profile } = loadContent("src/content/profile.ts");

const violations = [];
const fail = (rule, place, detail) => violations.push(`  ✗ [${rule}] ${place}: ${detail}`);
const meaningful = (s) => typeof s === "string" && s.trim().length > 0;
const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
const caseById = new Map(caseStudies.map((c) => [c.id, c]));
if (projectBySlug.size !== projects.length) fail("참조", "projects", "프로젝트 slug가 중복되었다");
if (caseById.size !== caseStudies.length) fail("참조", "caseStudies", "사례 id가 중복되었다");
const caseHref = (c) => `/projects/${c.projectSlug}#${c.id}`;
const PROJECT_URL = /^\/projects\/([^/#]+)(?:#([^/#]+))?$/;

function checkProjectHref(href, place, requireCase = false) {
  if (!meaningful(href)) return fail("참조", place, "프로젝트 링크가 비어 있다");
  let pathname = href;
  if (/^https?:\/\//.test(pathname)) {
    try {
      const url = new URL(pathname);
      if (url.origin !== new URL(profile.siteUrl).origin) {
        return fail("참조", place, `다른 사이트 주소: ${href}`);
      }
      pathname = url.pathname + url.hash;
    } catch {
      return fail("참조", place, `잘못된 URL: ${href}`);
    }
  }
  const match = pathname.match(PROJECT_URL);
  if (!match || !projectBySlug.has(match[1])) {
    return fail("참조", place, `없는 프로젝트 주소: ${href}`);
  }
  if (requireCase && !match[2]) return fail("참조", place, `사례 앵커가 없다: ${href}`);
  if (match[2] && caseById.get(match[2])?.projectSlug !== match[1]) {
    fail("참조", place, `프로젝트와 사례가 맞지 않는다: ${href}`);
  }
}

const PINNED_GITHUB = /^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|tree)\/[0-9a-f]{40}\/.+/;
function checkSource(source, place) {
  if (!meaningful(source?.label) || !meaningful(source?.href)) {
    return fail("근거·링크", place, "근거 라벨과 URL이 모두 필요하다");
  }
  if (!PINNED_GITHUB.test(source.href)) {
    fail("근거·고정", place, `GitHub 파일을 40자리 커밋 SHA로 고정해야 한다: ${source.href}`);
  }
}

function checkPhoto(base, place) {
  if (!meaningful(base)) return;
  for (const width of [640, 1280, 1920]) {
    for (const ext of ["webp", "avif"]) {
      if (!existsSync(`public${base}-${width}.${ext}`)) {
        fail("파일", place, `이미지 파일이 없다: ${base}-${width}.${ext}`);
      }
    }
  }
}

for (const p of projects) {
  if (!meaningful(p.slug) || !meaningful(p.name)) fail("프로젝트", p.slug ?? "(slug 없음)", "이름과 slug가 필요하다");
  if (!meaningful(p.domain) || !meaningful(p.role) || !meaningful(p.scope)) {
    fail("프로젝트", p.slug, "목적·역할·담당 범위가 필요하다");
  }
  if (!p.service?.what?.length) fail("프로젝트", p.slug, "서비스 설명이 필요하다");
  for (const contribution of p.contributions ?? []) {
    if (!meaningful(contribution.phase) || !meaningful(contribution.description)) {
      fail("프로젝트", p.slug, "팀 작업과 개인 보강에는 구분과 담당 내용이 필요하다");
    }
  }
  if (!p.links?.github || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(p.links.github)) {
    fail("프로젝트", p.slug, "GitHub 저장소 링크 형식이 잘못되었다");
  }
  checkPhoto(p.photo?.base, p.slug);
  for (const screen of p.service?.demo?.screens ?? []) {
    checkPhoto(screen.base, p.slug);
  }
}

for (const c of caseStudies) {
  const place = c.id ?? "(id 없음)";
  if (!projectBySlug.has(c.projectSlug)) fail("참조", place, `없는 프로젝트: ${c.projectSlug}`);
  if (!meaningful(c.title) || !meaningful(c.situation) || !c.cause?.length || !c.approach?.length || !c.result?.length) {
    fail("사례", place, "제목·상황·원인·접근·결과가 필요하다");
  }
  if (c.decision?.kind === "comparison") {
    const options = c.decision.options;
    if (!Array.isArray(options) || options.length < 2 || options.filter(a => a.chosen).length !== 1) {
      fail("사례", place, "실제 비교에는 대안 둘 이상과 선택한 대안 하나가 필요하다");
    }
    for (const option of options ?? []) {
      if (!meaningful(option.option) || !meaningful(option.reason)) fail("사례", place, "비교 대상의 이름과 이유가 필요하다");
    }
    if (!meaningful(c.decision.conclusion)) fail("사례", place, "비교 뒤 선택한 조건과 결론이 필요하다");
  } else if (c.decision?.kind === "rationale") {
    if (!c.decision.paragraphs?.length || c.decision.paragraphs.some(p => !meaningful(p))) {
      fail("사례", place, "설명형 사례에는 구현 이유가 필요하다");
    }
  } else {
    fail("사례", place, "비교 또는 구현 이유를 명시해야 한다");
  }
  if (!Array.isArray(c.limitations) || c.limitations.length === 0 || c.limitations.some((s) => !meaningful(s))) {
    fail("사례", place, "남은 한계를 명시해야 한다");
  }
  if (!Array.isArray(c.sources) || c.sources.length === 0) fail("근거", place, "사례 근거가 필요하다");
  for (const source of c.sources ?? []) checkSource(source, place);
  if (!Array.isArray(c.metrics) || c.metrics.length === 0) fail("지표", place, "사례 지표가 필요하다");
  if (!c.figure?.src?.startsWith("/diagrams/") || !existsSync(`public${c.figure.src}`)) {
    fail("파일", place, `문제 해결 그림이 없거나 다이어그램 경로가 아니다: ${c.figure?.src}`);
  }
  if (!meaningful(c.figure?.alt) || !meaningful(c.figure?.caption)) fail("사례", place, "그림 설명이 필요하다");

  for (const metric of c.metrics ?? []) {
    const where = `${place} / ${metric.label ?? "(지표 이름 없음)"}`;
    if (!meaningful(metric.label) || !meaningful(metric.condition)) fail("지표", where, "라벨과 측정 조건이 필요하다");
    if (!(["measured", "verified"].includes(metric.evidence))) fail("지표", where, "측정·검증 유형이 필요하다");
    checkSource(metric.source, where);
    if (metric.kind === "before-after") {
      if (![metric.before, metric.after].every(meaningful)) fail("지표", where, "전후 값이 필요하다");
    } else if (metric.kind === "comparison") {
      if (!Array.isArray(metric.values) || metric.values.length < 2 || metric.values.some((v) => !meaningful(v.label) || !meaningful(v.value))) {
        fail("지표", where, "비교할 대상 이름과 값을 둘 이상 적어야 한다");
      }
      if (/[→]/.test(metric.label) || metric.values?.some((v) => /[→]/.test(`${v.label} ${v.value}`))) {
        fail("지표", where, "대안 비교는 개선 전후를 뜻하는 화살표 없이 이름 붙은 값으로 적는다");
      }
    } else if (metric.kind === "observation") {
      if (!meaningful(metric.value)) fail("지표", where, "관찰값이 필요하다");
    } else {
      fail("지표", where, `알 수 없는 지표 유형: ${metric.kind}`);
    }
  }
}

if (!featuredCases?.length) fail("대표 사례", "featuredCases", "대표 사례가 비어 있다");
if (new Set((featuredCases ?? []).map((entry) => entry.caseId)).size !== featuredCases?.length) {
  fail("대표 사례", "featuredCases", "같은 사례를 두 번 넣었다");
}
for (const entry of featuredCases ?? []) {
  const c = caseById.get(entry.caseId);
  if (!c) fail("참조", "featuredCases", `없는 사례: ${entry.caseId}`);
  if (!meaningful(entry.title) || !meaningful(entry.summary)) fail("대표 사례", entry.caseId, "제목과 요약이 필요하다");
}

if (!resume.projects?.length) fail("이력서", "projects", "프로젝트가 비어 있다");
for (const entry of resume.projects ?? []) {
  checkProjectHref(entry.href, `이력서 / ${entry.name}`, true);
  if (!meaningful(entry.summary)) fail("이력서", entry.name, "프로젝트 요약이 필요하다");
}
for (const chip of profile.proofChips ?? []) checkProjectHref(chip.href, `홈 근거 / ${chip.text}`);

// 근거 파일의 「싣지 않는 수치」와 양의 근거를 모두 읽는다.
const FACT_FILES = readdirSync("docs/facts").filter((f) => f.endsWith(".md"));
const factNumbers = new Map();
const allNumbers = { exact: new Set(), rounded: new Set() };
const bans = [];
for (const file of FACT_FILES) {
  const text = readFileSync(path.join("docs/facts", file), "utf8");
  const numbers = { exact: new Set(), rounded: new Set() };
  for (const match of text.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const value = match[0].replace(/,/g, "");
    numbers.exact.add(value);
    allNumbers.exact.add(value);
    if (value.includes(".")) {
      numbers.rounded.add(value.split(".")[0]);
      allNumbers.rounded.add(value.split(".")[0]);
    }
  }
  factNumbers.set(path.basename(file, ".md"), numbers);
  const block = text.match(/\n## 싣지 않는 수치\n([\s\S]*?)(?=\n## |$)/)?.[1];
  for (const [, token, why] of block?.matchAll(/^- `([^`]+)`: (.+)$/gm) ?? []) {
    bans.push({ token: token.trim(), why: why.trim(), from: file });
  }
}
if (bans.length === 0) fail("근거", "docs/facts", "금지 수치 목록을 읽지 못했다");

const entries = [];
function collect(value, slug, place) {
  if (typeof value === "string") entries.push({ text: value, slug, place });
  else if (Array.isArray(value)) value.forEach((v) => collect(v, slug, place));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (["href", "src", "base", "github", "pdfPath", "stack", "run", "url", "siteUrl", "period", "email"].includes(key)) continue;
      collect(child, slug, `${place}.${key}`);
    }
  }
}
for (const p of projects) collect({ domain: p.domain, role: p.role, scope: p.scope, contributions: p.contributions, service: p.service, summary: p.summary, features: p.features, claimBoundary: p.claimBoundary, photo: p.photo }, p.slug, p.slug);
for (const c of caseStudies) collect({ title: c.title, domain: c.domain, situation: c.situation, cause: c.cause, decision: c.decision, approach: c.approach, result: c.result, limitations: c.limitations, figure: c.figure, metrics: c.metrics }, c.projectSlug, c.id);
collect({ headline: profile.headline, lead: profile.lead }, null, "profile");
for (const chip of profile.proofChips ?? []) {
  collect(chip.text, chip.href.match(/\/projects\/([^/#]+)/)?.[1] ?? null, "profile.proofChips");
}
collect(resume.intro, null, "resume.intro");
for (const entry of resume.projects ?? []) {
  collect(entry, entry.href.match(/\/projects\/([^/#]+)/)?.[1] ?? null, `resume.${entry.name}`);
}
for (const featured of featuredCases ?? []) {
  collect(featured, caseById.get(featured.caseId)?.projectSlug ?? null, `featuredCases.${featured.caseId}`);
}

const UNIT = /(\d[\d,]*(?:\.\d+)?)\s?(ms|%|건|회|배|MB|kB|bytes|행|VU|RPS|반복\/초|명)/g;
for (const { text, slug, place } of entries) {
  const pool = (slug && factNumbers.get(slug)) || allNumbers;
  for (const match of text.matchAll(UNIT)) {
    const number = match[1].replace(/,/g, "");
    if (!pool.exact.has(number) && !(number.includes(".") === false && pool.rounded.has(number))) {
      fail("근거", place, `"${match[0]}": ${slug ?? "docs/facts"}에 없음`);
    }
  }
  for (const ban of bans) {
    const pattern = new RegExp(`(?<![\\d.,])${ban.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}(?![\\d])`);
    if (pattern.test(text)) fail("금지", place, `"${ban.token}": ${ban.why} (${ban.from})`);
  }
  if (/[\u2013\u2014]/.test(text)) fail("표기", place, "긴 대시는 사용하지 않는다");
  if (/\S→|→\S/.test(text)) fail("표기", place, "화살표 앞뒤에 공백을 둔다");
  if (/\d+VU/.test(text)) fail("표기", place, "숫자와 VU 사이를 띄운다");
}

let recorded = null;
try {
  recorded = readFileSync(HASH_FILE, "utf8").trim();
} catch {
  // PDF가 아직 없는 새 작업 복사본도 여기서 재생성을 요구한다.
}
if (recorded !== resumeSourceHash()) fail("산출물", HASH_FILE, "이력서 출처가 바뀌었다: PDF를 다시 생성한다");

if (violations.length) {
  console.error(`글 린트 실패: 문장 ${entries.length}개 중 위반 ${violations.length}건\n`);
  for (const violation of violations) console.error(violation);
  process.exit(1);
}
console.log(`글 린트 통과: 문장 ${entries.length}개, 위반 0`);
