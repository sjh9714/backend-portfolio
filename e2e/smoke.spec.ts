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
  await expect(page.getByText("HTTP/1.1 200 OK", { exact: false }).last()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Featured Work — 카드 4개가 각 상세로 연결된다", async ({ page }) => {
  await page.goto("/");
  // 히어로 근거 칩도 /projects/로 링크되므로 갤러리 영역으로 좁힌다
  const links = page.locator('#work a[href^="/projects/"]');
  await expect(links).toHaveCount(4);
  await links.filter({ hasText: "Concert Booking" }).click();
  await expect(page).toHaveURL(/\/projects\/concert-booking/);
});

test("프로젝트 상세 — 수치 칩과 주장 범위가 보인다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  await expect(page.getByRole("heading", { name: "Concert Booking" })).toBeVisible();
  await expect(page.getByText("주장하지 않는 것")).toBeVisible();
  await expect(page.getByText("0건").first()).toBeVisible();
});

test("상세 — 훅이 스택·수치보다 먼저 나온다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  // 문자열 위치가 아니라 실제 문서 순서로 확인한다 — 같은 단어가 본문에도 나오기 때문
  const order = await page.evaluate(() => {
    const top = (el: Element | null | undefined) =>
      el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN;
    const hook = [...document.querySelectorAll("main p")].find((p) =>
      p.textContent?.startsWith("같은 좌석이 두 사람에게"),
    );
    return {
      hook: top(hook),
      metrics: top(document.querySelector('section[aria-label="핵심 수치"]')),
      config: top(document.querySelector('section[aria-label="구성"]')),
    };
  });
  expect(Number.isNaN(order.hook)).toBe(false);
  expect(order.hook).toBeLessThan(order.metrics);
  expect(order.metrics).toBeLessThan(order.config);
});

test("시뮬레이터 — 기본값이 실측 40%를 재현하고 retry 한도로 바뀐다", async ({ page }) => {
  await page.goto("/projects/concert-booking");
  // Next의 라우트 알림도 aria-live라 시뮬레이터 것으로 좁힌다
  const live = page.locator("p[aria-live]");
  await expect(live).toContainText("성공률 40퍼센트");

  // retry 한도를 올리면 성공률이 올라가야 한다 — 이 그림의 논지 자체다
  const retry = page.locator("#sim-retry");
  await retry.fill("10");
  await expect(live).toContainText("retry 한도 10회");
  const text = (await live.textContent()) ?? "";
  const pct = Number(text.match(/성공률 (\d+)퍼센트/)?.[1]);
  expect(pct).toBeGreaterThan(40);
});

test("realtime-chat — 수치 대신 싣지 않은 이유를 밝힌다", async ({ page }) => {
  await page.goto("/projects/realtime-chat");
  await expect(page.getByText("수치를 싣지 않은 이유")).toBeVisible();
  // 재측정 전까지 성능 수치를 주장하지 않는다
  await expect(page.getByText("+70.5%")).toHaveCount(0);
});

test("reduced-motion — 부팅 연출 없이 내용이 온전하다", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "성진혁" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Concert Booking" })).toBeVisible();
  await ctx.close();
});

test("이력서 — PDF 링크가 유효하다", async ({ page, request }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "성진혁" })).toBeVisible();
  const res = await request.get("/resume-sung-jinhyuk.pdf");
  expect(res.status()).toBe(200);
});
