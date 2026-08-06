import { expect, test } from "@playwright/test";

const PROJECTS = [
  "사용량 과금 게이트웨이",
  "좌석 예약 시스템",
  "실시간 채팅 서버",
  "배리어프리 길찾기 (My ETA)",
];

test("홈 — 히어로와 프로젝트 4개가 렌더링된다", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "성진혁", level: 1 })).toBeVisible();
  for (const name of PROJECTS) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("갤러리 — 카드 4장이 이미지와 함께 상세로 연결된다", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('#work a[href^="/projects/"]');
  await expect(links).toHaveCount(4);

  // 갤러리는 전부 첫 화면 아래라 lazy 로딩이므로, 스크롤해 들어온 뒤에 확인한다.
  const img = links.first().locator("img");
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute("src", /\/images\/.+\.webp$/);
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
  const decoded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
  expect([640, 1280, 1920]).toContain(decoded);

  await links.filter({ hasText: "좌석 예약 시스템" }).click();
  await expect(page).toHaveURL(/\/projects\/concert-booking/);
});

test("상세 — 프로젝트 헤더가 기간·역할·참여 인력을 밝힌다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  await expect(page.getByRole("heading", { name: "좌석 예약 시스템", level: 1 })).toBeVisible();
  for (const label of ["기간", "역할", "참여 인력"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  // 스택은 버전을 함께 적는다
  await expect(page.getByText("Java 21", { exact: true })).toBeVisible();
  await expect(page.getByText("주장하지 않는 것")).toBeVisible();
});

test("문제 해결 — 제목 → 그림 → 원인 → 과정 → 결과 순서가 지켜진다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  const order = await page.evaluate(() => {
    const section = document.querySelector("#seat-contention");
    if (!section) return null;
    const top = (el: Element | null) =>
      el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN;
    const labelled = (text: string) =>
      [...section.querySelectorAll("p")].find((p) => p.textContent?.trim() === text) ?? null;
    return {
      title: top(section.querySelector("h3")),
      figure: top(section.querySelector("figure")),
      cause: top(labelled("문제 원인")),
      approach: top(labelled("해결 과정")),
      result: top(labelled("결과")),
    };
  });
  expect(order).not.toBeNull();
  const o = order!;
  expect(Object.values(o).some(Number.isNaN)).toBe(false);
  expect(o.title).toBeLessThan(o.figure);
  expect(o.figure).toBeLessThan(o.cause);
  expect(o.cause).toBeLessThan(o.approach);
  expect(o.approach).toBeLessThan(o.result);
});

test("모든 문제 해결 항목에 그림이 하나씩 붙어 있다", async ({ page }) => {
  for (const slug of ["concert-booking", "realtime-chat", "ai-usage-billing-gateway"]) {
    await page.goto(`/projects/${slug}`);
    const sections = page.locator('section[aria-label="문제 해결"] > section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(sections.nth(i).locator("figure img")).toBeVisible();
    }
  }
});

test("realtime-chat — 부인된 수치와 재현 불가한 개선율을 주장하지 않는다", async ({ page }) => {
  await page.goto("/projects/realtime-chat");
  const body = await page.locator("body").innerText();

  // 저장소가 스스로 "현재 코드 evidence가 아님"으로 표시한 과거 수치들
  for (const banned of ["+70.5%", "212.85", "149.22", "99,900"]) {
    expect(body).not.toContain(banned);
  }

  // 2026-08-06 재측정 결과는 실려 있어야 한다
  expect(body).toContain("1,806");

  // 개선 전 수치를 같은 환경에서 재현할 수 없어 개선율은 싣지 않는다
  await expect(page.getByText("수치를 싣지 않은 이유")).toBeVisible();
});

test("이력서 — PDF 링크가 유효하다", async ({ page, request }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "성진혁" })).toBeVisible();
  const res = await request.get("/resume-sung-jinhyuk.pdf");
  expect(res.status()).toBe(200);
});
