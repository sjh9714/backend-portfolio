import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/resume",
  "/projects/concert-booking",
  "/projects/realtime-chat",
  "/projects/finmate",
  "/projects/eta",
  "/projects/ai-usage-billing-gateway",
];

for (const path of PAGES) {
  test(`접근성: ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("키보드로 대표 사례 링크를 열면 사례 제목이 보인다", async ({ page }) => {
  await page.goto("/");
  const link = page.locator('#work article[data-case-id="peer-rollup"] a[href$="#peer-rollup"]');
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/finmate#peer-rollup$/);
  await expect(page.locator("#peer-rollup h2, #peer-rollup h3").first()).toBeVisible();
});

test("모바일 화면에서 가로 스크롤이나 가려진 주요 내용이 없다", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path}: 가로 넘침`).toBeLessThanOrEqual(1);
    if (path === "/") {
      const link = page.locator('#work a[href$="#peer-rollup"]');
      const bounds = await link.boundingBox();
      expect(bounds!.y, "첫 화면에서 대표 사례 제목을 찾을 수 있다").toBeLessThan(812);
      await page.screenshot({ path: testInfo.outputPath("home-mobile.png"), fullPage: true });
    }
    if (path === "/projects/finmate") {
      await page.screenshot({ path: testInfo.outputPath("finmate-mobile.png"), fullPage: true });
    }
  }
  await context.close();
});

test("움직임을 줄인 설정에서도 사례 내용이 보이고 애니메이션이 멈춘다", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const path of ["/", "/projects/realtime-chat", "/resume"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const hidden = await page.locator("main h1, main h2, main h3, main p, main li").evaluateAll((els) =>
      els.filter((el) => {
        const style = getComputedStyle(el);
        return style.visibility === "hidden" || style.opacity === "0";
      }).length,
    );
    expect(hidden, `${path}: 숨은 본문`).toBe(0);
    const activeAnimations = await page.locator("main *").evaluateAll((els) =>
      els.filter((el) => getComputedStyle(el).animationName !== "none").length,
    );
    expect(activeAnimations, `${path}: 지속 애니메이션`).toBe(0);
  }
  await context.close();
});
