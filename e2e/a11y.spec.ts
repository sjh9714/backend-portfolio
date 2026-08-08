import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * 화이트 테마로 반전하면서 대비 조합이 전부 바뀌었으므로 전 페이지를 다시 검사한다.
 * 특히 라임(--color-signal)은 흰 배경에서 대비가 1.2:1이라 반전 섹션에서만 써야 한다.
 */
const PAGES = [
  { path: "/", name: "홈" },
  { path: "/projects/concert-booking", name: "상세 · 문제해결 3개" },
  { path: "/projects/realtime-chat", name: "상세 · 주장 범위가 긴 쪽" },
  { path: "/projects/eta", name: "상세 · 팀 프로젝트" },
  { path: "/resume", name: "이력서" },
];

for (const { path, name } of PAGES) {
  test(`접근성 — ${name}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("키보드 — 갤러리 카드에 탭으로 닿고 엔터로 열린다", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('#work a[href="/projects/concert-booking"]');
  await card.focus();
  await expect(card).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/concert-booking/);
});

test("reduced-motion — 마스크가 콘텐츠를 가리지 않는다", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/projects/concert-booking");

  // .reveal은 기본 상태가 clip-path로 가려진 상태다.
  // 모션을 끈 사용자에게는 마스크가 완전히 풀려 있어야 한다.
  const clips = await page.$$eval(".reveal", (els) =>
    els.map((el) => getComputedStyle(el).clipPath),
  );
  expect(clips.length).toBeGreaterThan(0);
  for (const c of clips) expect(c).toBe("none");

  await expect(page.getByText("문제 원인").first()).toBeVisible();
  await ctx.close();
});

test("reduced-motion — 히어로 마키가 멈춰 있고 이름은 보인다", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");

  // 마키는 CSS 키프레임으로 흐른다. 모션을 끈 사용자에게는 애니메이션이 아예 없어야 하고,
  // 그때 트랙의 첫 항목(실제 h1)이 정적으로 온전히 보여야 한다.
  const anim = await page
    .locator(".marquee-track")
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe("none");
  await expect(page.getByRole("heading", { name: "Sung Jinhyuk", level: 1 })).toBeVisible();
  await ctx.close();
});

test("사진과 그림에 대체 텍스트가 있다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  const imgs = page.locator("main img");
  const count = await imgs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const alt = await imgs.nth(i).getAttribute("alt");
    expect(alt?.length ?? 0).toBeGreaterThan(10);
  }
});
