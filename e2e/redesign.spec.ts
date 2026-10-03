import { expect, test } from "@playwright/test";

const CASE_LINKS = [
  { id: "peer-rollup", projectHref: "/projects/finmate", href: "/projects/finmate#peer-rollup" },
  { id: "seat-contention", projectHref: "/projects/concert-booking", href: "/projects/concert-booking#seat-contention" },
] as const;

const PROJECTS = [
  "concert-booking",
  "realtime-chat",
  "finmate",
  "eta",
  "ai-usage-billing-gateway",
] as const;

test("홈에서 프로젝트를 열면 상세의 소개부터 보이고 내부 사례 이동도 유지된다", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "성진혁", level: 1 })).toBeVisible();

  const rows = page.locator("#work article[data-case-id]");
  await expect(rows).toHaveCount(CASE_LINKS.length);
  expect(await rows.evaluateAll((els) => els.map((el) => el.getAttribute("data-case-id")))).toEqual(
    CASE_LINKS.map(({ id }) => id),
  );
  for (const { id, projectHref } of CASE_LINKS) {
    const article = page.locator(`#work article[data-case-id="${id}"]`);
    await expect(article.locator(`a[href="${projectHref}"]`)).toHaveCount(1);
    await expect(article).toContainText(/역할|담당/);
    await expect(article).toContainText(/프로젝트|서비스|채팅|금융|예약/);
    await expect(article.getByRole("img")).toBeVisible();
    await expect(article.locator("[data-outcome]")).not.toBeEmpty();
  }

  await expect(page.locator('#work a[href^="/projects/eta"]')).toBeVisible();
  await expect(page.locator('#work a[href^="/projects/ai-usage-billing-gateway"]')).toBeVisible();

  await expect(page.locator('#work a[href^="/projects/realtime-chat"]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("home-desktop.png"), fullPage: true });
  for (const slug of PROJECTS) {
    await page.goto("/");
    await page.locator(`#work a[href="/projects/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}$`));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  }

  for (const { id, projectHref, href } of CASE_LINKS) {
    await page.goto(projectHref);
    await page.getByRole("navigation", { name: "이 프로젝트의 사례" }).locator(`a[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(`#${id}`).getByRole("heading").first()).toBeInViewport();
  }
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
      for (const label of ["상황과 조건", "관찰한 원인", "적용 과정", "결과와 근거", "남은 한계"]) {
        await expect(study).toContainText(label);
      }
      for (const part of ["situation", "cause", "decision", "approach", "result", "limitations"]) {
        await expect(study.locator(`[data-case-part="${part}"]`)).not.toBeEmpty();
      }
      const decision = study.locator('[data-case-part="decision"]');
      await expect(decision.getByRole('heading')).toContainText(/선택|이유/);
      if (await decision.getAttribute('data-decision-kind') === 'comparison') {
        await expect(decision.locator('[data-chosen=true]')).toHaveCount(1);
        await expect(decision.locator('[data-decision-conclusion]')).not.toBeEmpty();
      } else {
        await expect(decision).toHaveAttribute('data-decision-kind', 'rationale');
        await expect(decision.locator('p').first()).not.toBeEmpty();
        await expect(decision.locator('[data-chosen]')).toHaveCount(0);
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

for (const width of [1440, 1280, 390, 375]) {
  test(`구성 보존: ${width}px에서 프로젝트 소개와 사례를 읽을 수 있다`, async ({ browser }, testInfo) => {
    const height = width < 768 ? 844 : 900;
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    for (const route of ["/", ...PROJECTS.map(slug => `/projects/${slug}`)]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), route).toBeLessThanOrEqual(1);
      if (route === "/") {
        const title = page.locator('.project-preview-copy h3').first();
        expect((await title.boundingBox())!.y).toBeLessThan(height);
        await expect(page.locator('.hero-stack')).toContainText('Java');
        await expect(page.locator('.project-role').first()).not.toBeEmpty();
        await expect(page.locator('[data-outcome]').first()).not.toBeEmpty();
      } else {
        await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
        expect((await page.locator('.project-meta').boundingBox())!.y).toBeLessThan(height);
        await expect(page.getByRole('navigation', {name: '이 프로젝트의 사례'})).toBeVisible();
      }
      const name = route === '/' ? 'home' : route.split('/').at(-1);
      await page.screenshot({path: testInfo.outputPath(`${name}-${width}-first-screen.png`)});
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(async (element: HTMLImageElement) => { await element.decode(); });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({path: testInfo.outputPath(`${name}-${width}.png`), fullPage: true});
    }
    await context.close();
  });
}

test("FinMate의 평균 정의와 측정 조건이 복원한 구성에서도 유지된다", async ({ page }) => {
  await page.goto('/projects/finmate#peer-rollup');
  const study = page.locator('#peer-rollup');
  await expect(study).toContainText('(100원 + 0원) ÷ 2 = 50원');
  await expect(study.locator('[data-case-part=approach]')).toContainText('월 자료가 준비된 사람만 비교');
  await expect(study.locator('[data-chosen=true]')).toContainText('사람×월 사전 집계');
  const metric = study.locator('[data-metric-kind=comparison]');
  await expect(metric.getByRole('row')).toHaveCount(5);
  for (const value of ['68.34 ms', '37.00 ms', '9.82 ms', '3.53 ms']) await expect(metric).toContainText(value);
  await expect(metric.locator('[data-metric-condition]')).toContainText('합성 2,000명');
  await expect(study.locator('[data-case-part=limitations]')).toContainText('재집계 전까지 값은 최신이 아닙니다');
  await expect(page.getByRole('link', {name: '기존 화면 시연 보기'})).toHaveAttribute('href', 'https://finmate-app-one.vercel.app/my');
});

test("비교형은 선택과 결론을, 설명형은 선택 배지 없이 이유를 보여 준다", async ({ page }) => {
  await page.goto('/projects/finmate');
  const comparison = page.locator('#peer-rollup [data-decision-kind="comparison"]');
  await expect(comparison.getByRole('listitem')).toHaveCount(4);
  await expect(comparison.locator('[data-chosen=true]')).toHaveCount(1);
  await expect(comparison.locator('[data-decision-conclusion]')).not.toBeEmpty();

  await page.goto('/projects/ai-usage-billing-gateway');
  const rationale = page.locator('#idempotency [data-decision-kind="rationale"]');
  await expect(rationale).toBeVisible();
  await expect(rationale.locator('p').first()).not.toBeEmpty();
  await expect(rationale.locator('[data-chosen], .chosen-badge')).toHaveCount(0);
});

test("비용 표는 조회 시간과 저장 공간을 같은 대안의 행에 연결한다", async ({ page }) => {
  await page.goto('/projects/finmate');
  const table = page.locator('#peer-rollup [data-metric-kind="comparison"] table');
  await expect(table.getByRole('columnheader')).toHaveCount(3);
  const observed = [
    ['원장 직접 집계', '68.34 ms', '없음'],
    ['사람별 집계로 재작성', '37.00 ms', '없음'],
    ['재작성 + 커버링 인덱스', '9.82 ms', '25,460,736 bytes'],
    ['사람×월 사전 집계', '3.53 ms', '1,671,168 bytes'],
  ];
  for (const [label, time, storage] of observed) {
    const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', {name: label, exact: true}) });
    await expect(row.getByRole('cell')).toHaveText([time!, storage!]);
  }
  await page.goto('/projects/concert-booking');
  await expect(page.locator('#shared-counter table').getByRole('columnheader')).toHaveCount(2);
});
