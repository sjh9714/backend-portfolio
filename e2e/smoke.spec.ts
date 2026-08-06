import { expect, test } from "@playwright/test";

/** 기본 포트폴리오에 노출되는 것. 감춘 프로젝트는 여기 없다. */
const PROJECTS = [
  "좌석 예약 시스템",
  "실시간 채팅 서버",
  "FinMate — 청년 금융 온보딩",
  "배리어프리 길찾기 (My ETA)",
];

/** 감춘 프로젝트 — 갤러리·사이트맵에는 없지만 URL은 살아 있어야 한다 */
const HIDDEN = { slug: "ai-usage-billing-gateway", name: "사용량 과금 게이트웨이" };

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

test("상세 — 무슨 서비스인지가 문제 해결보다 먼저 나온다", async ({ page }) => {
  await page.goto("/projects/concert-booking");

  const service = page.locator('section[aria-label="서비스"]');
  await expect(service).toBeVisible();
  await expect(service).toContainText("예매");

  // 사용자 흐름과 직접 띄우는 방법이 함께 있어야 "돌아가는 물건"으로 읽힌다
  await expect(service).toContainText("좌석 선택");
  await expect(service).toContainText("docker compose");

  const top = (sel: string) =>
    page.locator(sel).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(await top('section[aria-label="서비스"]')).toBeLessThan(
    await top('section[aria-label="문제 해결"]'),
  );
});

test("데모 화면은 서비스 섹션에만 있고 문제 해결의 그림은 전부 다이어그램이다", async ({
  page,
}) => {
  await page.goto("/projects/concert-booking");

  // 자료 p.18: 백엔드 포트폴리오의 문제 해결 그림은 화면 캡처가 아니라 구조와 흐름이어야 한다
  const caseFigures = page.locator('section[aria-label="문제 해결"] figure img');
  const count = await caseFigures.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(caseFigures.nth(i)).toHaveAttribute("src", /\/diagrams\//);
  }

  const screens = page.locator('section[aria-label="서비스"] figure img');
  await expect(screens).toHaveCount(2);
  for (let i = 0; i < 2; i += 1) {
    await expect(screens.nth(i)).toHaveAttribute("src", /\/screens\/.+\.webp$/);
    await expect(screens.nth(i)).toHaveAttribute("alt", /.{10,}/);
  }
});

test("데모가 없는 프로젝트는 없다고 밝힌다", async ({ page }) => {
  await page.goto("/projects/eta");
  const service = page.locator('section[aria-label="서비스"]');
  await expect(service.locator("img")).toHaveCount(0);
  await expect(service).toContainText("화면을 싣지 않았습니다");
});

test("감춘 프로젝트는 갤러리·사이트맵에서 빠지되 URL은 살아 있다", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator(`#work a[href="/projects/${HIDDEN.slug}"]`)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: HIDDEN.name })).toHaveCount(0);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain(HIDDEN.slug);

  // 지운 게 아니다 — 정산 공고에 링크로 건넬 수 있어야 한다
  await page.goto(`/projects/${HIDDEN.slug}`);
  await expect(page.getByRole("heading", { name: HIDDEN.name, level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("구현 기능 — 문제 해결이 아닌 기능도 함께 적는다", async ({ page }) => {
  for (const slug of ["concert-booking", "realtime-chat", "finmate", "eta"]) {
    await page.goto(`/projects/${slug}`);
    const features = page.locator('section[aria-label="구현 기능"] li');
    expect(await features.count()).toBeGreaterThanOrEqual(3);
  }
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
  for (const slug of ["concert-booking", "realtime-chat"]) {
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
