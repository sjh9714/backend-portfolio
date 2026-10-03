/** 정적 산출물의 경로·앵커와 외부 출처를 확인한다. 빌드 후 실행한다. */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const origin = process.env.SITE_ORIGIN ?? "https://sjh9714-backend.vercel.app";
const errors = [];
const documents = new Map();
const external = new Set();
const githubTrees = new Map();

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name))
    : [path.join(dir, entry.name)]))).flat();
}

const all = await files(root);
const inventory = new Set(all);
for (const filename of all.filter(file => file.endsWith(".html"))) {
  documents.set(filename, await readFile(filename, "utf8"));
}

const decode = value => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
let localCount = 0;
for (const [filename, html] of documents) {
  const route = path.relative(root, filename).replace(/index\.html$/, "").replace(/\.html$/, "");
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = decode(raw);
    if (/^(mailto:|tel:|data:)/.test(href)) continue;
    const url = new URL(href, `${origin}/${route}`);
    if (url.origin !== origin) {
      if (url.protocol === "https:" || url.protocol === "http:") external.add(url.href);
      continue;
    }
    localCount += 1;
    const base = path.join(root, decodeURIComponent(url.pathname));
    const target = [base, `${base}.html`, path.join(base, "index.html")].find(candidate => inventory.has(candidate));
    if (!target || !(await stat(target)).isFile()) {
      errors.push(`${route || "/"}: 없는 파일 ${href}`);
    } else if (url.hash && documents.has(target)) {
      const ids = [...documents.get(target).matchAll(/id="([^"]+)"/g)].map(match => decode(match[1]));
      if (!ids.includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${route || "/"}: 없는 앵커 ${href}`);
    }
  }
}

async function checkExternal(href) {
  const url = new URL(href);
  const pinned = url.hostname === "github.com" && url.pathname.match(/^\/([^/]+\/[^/]+)\/(blob|tree)\/([0-9a-f]{40})\/(.+)$/);
  if (pinned) {
    const [, repo, type, revision, file] = pinned;
    const key = `${repo}/${revision}`;
    if (!githubTrees.has(key)) {
      githubTrees.set(key, (async () => {
        const response = await fetch(`https://api.github.com/repos/${repo}/git/trees/${revision}?recursive=1`, {
          headers: {
            Accept: "application/vnd.github+json",
            ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
          },
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${repo}@${revision}`);
        const json = await response.json();
        if (json.truncated) throw new Error(`GitHub 트리가 잘려 전체 확인 불가: ${key}`);
        return new Map(json.tree.map(entry => [entry.path, entry.type]));
      })());
    }
    const tree = await githubTrees.get(key);
    if (tree.get(decodeURIComponent(file)) !== (type === "blob" ? "blob" : "tree")) throw new Error(`GitHub 파일 없음: ${href}`);
  } else {
    const response = await fetch(href, { method: "HEAD", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${href}`);
  }
}

// 서버에 한 번에 많은 요청을 보내지 않는다.
const queue = [...external];
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let href = queue.shift(); href; href = queue.shift()) {
    try { await checkExternal(href); } catch (error) { errors.push(String(error)); }
  }
}));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`링크 검사 통과: HTML ${documents.size}개, 내부 참조 ${localCount}개, 외부 URL ${external.size}개`);
