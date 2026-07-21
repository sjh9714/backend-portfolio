import { expect, test } from "@playwright/test";

test("홈 — 히어로·4 스테이지·200 OK가 렌더링된다", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "성진혁" })).toBeVisible();
  for (const name of [
    "AI Usage Billing Gateway",
    "Concert Booking",
    "Realtime Chat",
    "My ETA",
  ]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expect(page.getByText("HTTP/1.1 200 OK", { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test("프로젝트 상세 — 수치 칩과 주장 범위가 보인다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  await expect(page.getByRole("heading", { name: "Concert Booking" })).toBeVisible();
  await expect(page.getByText("주장하지 않는 것")).toBeVisible();
  await expect(page.getByText("0건").first()).toBeVisible();
});

test("이력서 — PDF 링크가 유효하다", async ({ page, request }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "성진혁" })).toBeVisible();
  const res = await request.get("/resume-sung-jinhyuk.pdf");
  expect(res.status()).toBe(200);
});
