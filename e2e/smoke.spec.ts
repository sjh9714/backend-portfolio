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

test("프로젝트를 열면 맨 위에서 시작한다", async ({ page }) => {
  /*
   * 관성 스크롤(Lenis)은 스크롤 위치를 자기가 들고 있다. Next가 라우트 이동에서 window를
   * 0으로 되돌려도 Lenis가 다음 프레임에 예전 위치를 다시 써 버려서, 홈에서 아래로 내린 뒤
   * 프로젝트를 누르면 화면 중간부터 열렸다. 실측으로 홈 링크 18개 중 6개가 정확히 3,000px,
   * 즉 누르기 직전 위치 그대로였다.
   *
   * 홈에 있는 모든 프로젝트 링크를 확인한다. 하나만 보면 다음에 링크가 늘었을 때 놓친다.
   */
  await page.goto("/");
  const links = page.locator('a[href^="/projects/"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(3);

  for (let i = 0; i < count; i += 1) {
    await page.goto("/");
    const link = links.nth(i);
    const href = await link.getAttribute("href");

    // 링크까지 내려간 뒤 스크롤이 완전히 멈출 때까지 기다린다.
    // 미끄러지는 중에 누르면 도착 위치가 몇 px 흔들려 테스트가 흔들린다.
    await link.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const w = window as unknown as { __lastY?: number; __still?: number };
      if (w.__lastY === window.scrollY) {
        w.__still = (w.__still ?? 0) + 1;
      } else {
        w.__lastY = window.scrollY;
        w.__still = 0;
      }
      return (w.__still ?? 0) > 5;
    });

    await link.click();
    await page.waitForURL(/\/projects\//);

    // 도착한 순간의 위치를 본다. expect.poll로 기다리면 안 된다 —
    // 처음엔 그렇게 썼다가 통과했는데, 중간에서 열린 뒤 몇 초에 걸쳐 위로 미끄러지는 것을
    // 통과로 봤기 때문이다. 사용자가 보는 건 도착 순간이고 거기서 이미 틀렸다.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const landedAt = await page.evaluate(() => window.scrollY);
    expect(landedAt, `${href} 를 눌렀을 때 맨 위에서 시작해야 한다`).toBe(0);
  }
});
