import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", name: "홈" },
  { path: "/projects/concert-booking", name: "상세 · 시뮬레이터" },
  { path: "/projects/realtime-chat", name: "상세 · 수치 없음" },
  { path: "/resume", name: "이력서" },
];

for (const { path, name } of PAGES) {
  test(`접근성 — ${name}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // 실패했을 때 무엇이 문제인지 바로 읽히도록 규칙 id와 대상을 남긴다
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

test("시뮬레이터 — 캔버스 상태가 텍스트로도 전달된다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  // 캔버스는 낭독되지 않으므로 결과가 반드시 텍스트로 미러링되어야 한다
  await expect(page.locator("p[aria-live]")).toContainText("성공 20건, 실패 30건");
  await expect(page.locator("#sim-vus")).toHaveAttribute("type", "range");
  await expect(page.locator("#sim-retry")).toHaveAttribute("type", "range");
});
