import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const SLUGS = [
  "concert-booking",
  "realtime-chat",
  "finmate",
  "eta",
  "ai-usage-billing-gateway",
];

test("모든 공개 주소와 사례 앵커가 살아 있고 과금 프로젝트도 검색 가능하다", async ({ page, request }) => {
  const cases: Record<string, string[]> = {
    "concert-booking": ["seat-contention", "shared-counter"],
    "realtime-chat": ["n-plus-one", "persist-order"],
    finmate: ["peer-rollup"],
    eta: ["provider-fanout"],
    "ai-usage-billing-gateway": ["idempotency"],
  };
  for (const route of ["/", "/resume", ...SLUGS.map((slug) => `/projects/${slug}`)]) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} HTTP status`).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
  for (const slug of SLUGS) {
    await page.goto(`/projects/${slug}`);
    for (const id of cases[slug] ?? []) await expect(page.locator(`#${id}`)).toBeVisible();
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/projects/ai-usage-billing-gateway");
  await page.goto("/projects/ai-usage-billing-gateway");
  const robots = page.locator('meta[name="robots"]');
  if (await robots.count()) await expect(robots).not.toHaveAttribute("content", /noindex/);
});

test("문제 해결 그림은 구조도이고 서비스 화면에는 대체 텍스트가 있다", async ({ page }) => {
  let figures = 0;
  for (const slug of SLUGS) {
    await page.goto(`/projects/${slug}`);
    const caseFigures = page.locator('section[aria-label="문제 해결"] figure img');
    const count = await caseFigures.count();
    figures += count;
    for (let i = 0; i < count; i += 1) {
      await expect(caseFigures.nth(i)).toHaveAttribute("src", /\/diagrams\//);
      const alt = await caseFigures.nth(i).getAttribute("alt");
      expect(alt?.trim().length ?? 0).toBeGreaterThan(10);
    }
    const screens = page.locator('section[aria-label="서비스"] figure img');
    for (let i = 0; i < await screens.count(); i += 1) {
      await expect(screens.nth(i)).toHaveAttribute("src", /\/screens\/.+\.webp$/);
      const alt = await screens.nth(i).getAttribute("alt");
      expect(alt?.trim().length ?? 0).toBeGreaterThan(10);
    }
  }
  expect(figures).toBeGreaterThan(0);
});

function bannedNumbers() {
  const out: { token: string; why: string; from: string }[] = [];
  for (const f of readdirSync("docs/facts").filter((x) => x.endsWith(".md"))) {
    const block = readFileSync(join("docs/facts", f), "utf8").match(
      /\n## 싣지 않는 수치\n([\s\S]*?)(?=\n## |$)/,
    )?.[1];
    if (!block) continue;
    for (const [, token, why] of block.matchAll(/^- `([^`]+)`: (.+)$/gm)) {
      if (token && why) out.push({ token: token.trim(), why: why.trim(), from: f });
    }
  }
  return out;
}

test("대장이 금지한 수치는 어느 화면에도 나타나지 않는다", async ({ page }) => {
  const bans = bannedNumbers();
  expect(bans.length, "금지 수치 목록을 읽어야 검사가 유효하다").toBeGreaterThan(0);
  for (const route of ["/", "/resume", ...SLUGS.map((slug) => `/projects/${slug}`)]) {
    await page.goto(route);
    const body = await page.locator("body").innerText();
    for (const b of bans) {
      const rx = new RegExp(
        `(?<![\\d.,])${b.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}(?![\\d])`,
      );
      expect(rx.test(body), `${route}: "${b.token}": ${b.why} (${b.from})`).toBe(false);
    }
  }
});

test("이력서 PDF 다운로드가 실제 PDF를 반환한다", async ({ page, request }) => {
  await page.goto("/resume");
  const link = page.getByRole("link", { name: /PDF/ });
  const href = await link.getAttribute("href");
  expect(href).toBeTruthy();
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/pdf/);
  expect((await response.body()).subarray(0, 4).toString()).toBe("%PDF");
});
