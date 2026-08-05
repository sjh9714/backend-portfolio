import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * 화이트 테마로 반전하면서 대비 조합이 전부 바뀌었으므로 전 페이지를 다시 검사한다.
 * 특히 라임(--color-signal)은 흰 배경에서 대비가 1.2:1이라 반전 섹션에서만 써야 한다.
 */
const PAGES = [
  { path: "/", name: "홈" },
  { path: "/projects/concert-booking", name: "상세 · 문제해결 3개" },
  { path: "/projects/realtime-chat", name: "상세 · 수치 없음" },
  { path: "/projects/eta", name: "상세 · 문제해결 없음" },
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
