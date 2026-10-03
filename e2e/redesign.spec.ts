import { expect, test } from "@playwright/test";

const CASE_LINKS = [
  { id: "peer-rollup", href: "/projects/finmate#peer-rollup" },
  { id: "seat-contention", href: "/projects/concert-booking#seat-contention" },
] as const;

const PROJECTS = [
  "concert-booking",
  "realtime-chat",
  "finmate",
  "eta",
  "ai-usage-billing-gateway",
] as const;

test("홈에서 대표 문제를 읽고 해당 사례로 바로 이동한다", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "성진혁", level: 1 })).toBeVisible();

  const rows = page.locator("#work article[data-case-id]");
  await expect(rows).toHaveCount(CASE_LINKS.length);
  expect(await rows.evaluateAll((els) => els.map((el) => el.getAttribute("data-case-id")))).toEqual(
    CASE_LINKS.map(({ id }) => id),
  );
  for (const { id, href } of CASE_LINKS) {
    const article = page.locator(`#work article[data-case-id="${id}"]`);
    await expect(article.locator(`a[href="${href}"]`)).toHaveCount(1);
    await expect(article).toContainText(/역할|담당/);
    await expect(article).toContainText(/프로젝트|서비스|채팅|금융|예약/);
    await expect(article.getByRole("img")).toBeVisible();
    await expect(article.locator("[data-outcome]")).not.toBeEmpty();
  }

  await expect(page.locator('#work a[href^="/projects/eta"]')).toBeVisible();
  await expect(page.locator('#work a[href^="/projects/ai-usage-billing-gateway"]')).toBeVisible();

  await expect(page.locator('#work a[href^="/projects/realtime-chat"]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("home-desktop.png"), fullPage: true });
  const link = page.locator(`#work article[data-case-id="peer-rollup"] a[href="${CASE_LINKS[0].href}"]`);
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${CASE_LINKS[0].href}$`));
  const target = page.locator("#peer-rollup");
  await expect(target).toBeVisible();
  const top = await target.evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(-8);
  expect(top).toBeLessThan(160);
});

test("모든 상세에서 맥락과 문제 해결을 먼저 읽고 기존 사례 주소가 열린다", async ({ page }) => {
  const ids: Record<string, string[]> = {
    "concert-booking": ["seat-contention", "shared-counter"],
    "realtime-chat": ["n-plus-one", "persist-order"],
    finmate: ["peer-rollup"],
    eta: ["provider-fanout"],
    "ai-usage-billing-gateway": ["idempotency"],
  };

  for (const slug of PROJECTS) {
    await page.goto(`/projects/${slug}`);
    const main = page.locator("main#content");
    await expect(main).toBeVisible();
    const problem = main.locator('section[aria-label="문제 해결"]');
    const service = main.locator('section[aria-label="서비스"]');
    await expect(problem).toBeVisible();
    await expect(service).toBeVisible();
    const header = main.locator("header").first();
    await expect(header).toContainText(/역할|담당/);
    await expect(header).toContainText(/범위|담당 영역/);
    const positions = await page.evaluate(() => {
      const top = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().top ?? Infinity;
      return {
        header: top("main#content header"),
        problem: top('section[aria-label="문제 해결"]'),
        service: top('section[aria-label="서비스"]'),
      };
    });
    expect(positions.header).toBeLessThan(positions.problem);
    expect(positions.problem).toBeLessThan(positions.service);

    for (const id of ids[slug] ?? []) {
      const study = main.locator(`#${id}`);
      await expect(study).toBeVisible();
      for (const label of ["상황과 조건", "관찰한 원인", "대안과 선택", "적용 과정", "결과와 근거", "남은 한계"]) {
        await expect(study).toContainText(label);
      }
    }
  }
});

test("측정 수치는 유형, 조건, 클릭 가능한 근거를 함께 보여 준다", async ({ page }) => {
  let count = 0;
  for (const slug of PROJECTS) {
    await page.goto(`/projects/${slug}`);
    const metrics = page.locator('[data-metric-kind="before-after"], [data-metric-kind="comparison"], [data-metric-kind="observation"]');
    const n = await metrics.count();
    count += n;
    for (let i = 0; i < n; i += 1) {
      const metric = metrics.nth(i);
      await expect(metric.locator("[data-metric-condition]")).not.toBeEmpty();
      await expect(metric.locator('a[href]:not([href=""])')).toHaveCount(1);
      if ((await metric.getAttribute("data-metric-kind")) === "comparison") {
        expect(await metric.locator("li, tr").count()).toBeGreaterThanOrEqual(2);
        expect(await metric.innerText()).not.toMatch(/\S\s*→\s*\S/);
      }
    }
  }
  expect(count).toBeGreaterThan(0);
});

test("이력서는 선별한 세 프로젝트와 상세 사례 링크를 보여 준다", async ({ page }) => {
  await page.goto("/resume");
  const section = page.locator("#resume-projects").locator("..");
  for (const href of CASE_LINKS.map(({ href }) => href)) {
    await expect(section.locator(`a[href$="${href}"]`)).toBeVisible();
  }
  await expect(section.locator('a[href$="/projects/realtime-chat#persist-order"]')).toBeVisible();
  await expect(section.locator('a[href*="/projects/"]')).toHaveCount(3);
  await expect(section).not.toContainText("My ETA");
  await expect(section).not.toContainText("과금 게이트웨이");
});

test("인쇄용 이력서에는 PDF 다운로드 버튼이 나오지 않는다", async ({ page }) => {
  await page.goto("/resume");
  const download = page.getByRole("link", { name: /PDF 다운로드/ });
  await expect(download).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(download).toBeHidden();
});
