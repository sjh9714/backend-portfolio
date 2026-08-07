#!/usr/bin/env node
/**
 * 데모 UI의 실제 화면을 캡처해 최적화한다.
 *
 * 화면은 **"이게 무슨 서비스인가"를 말하는 자리에만** 쓴다.
 * 문제 해결의 그림 자리는 구조 다이어그램으로 남긴다 —
 * 『개발자를 위한 이력서 포트폴리오 완벽 가이드 2』 p.18:
 *   "백엔드 개발자는 '기능 화면'이 아니라 '구조와 흐름'을 보여줘야 합니다."
 *
 * 사전 조건: 해당 프로젝트의 데모 스택이 떠 있어야 한다.
 *   concert  cd ~/Projects/concert-booking
 *            docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d
 *   chat     cd ~/Projects/realtime-chat
 *            docker compose -f docker-compose.demo.yml up -d
 *   eta      cd ~/Projects/eta/backend
 *            ROUTE_PROVIDER=mock CORS_ORIGINS='["http://localhost:5180"]' \
 *              uv run uvicorn app.main:app --port 8000
 *            cd ../frontend && npx vite --port 5180 --strictPort
 *            (frontend/.env에 VITE_KAKAO_MAP_APP_KEY 필요. 카카오 콘솔에서
 *             http://localhost:5180을 JS SDK 도메인에 등록해 둘 것)
 *
 * 갤러리 사진과 달리 **흑백·대비 보정을 하지 않는다.** 그건 출처가 제각각인
 * 사진 네 장을 한 세트로 묶는 처리이고, UI 화면은 있는 그대로여야 한다.
 *
 * 사용법: node scripts/capture-screens.mjs [concert|chat|finmate|eta]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "screens");
const WIDTHS = [640, 1280, 1920];
/** 데스크톱 앱 기본값. 모바일 앱은 target에서 따로 준다. */
const VIEWPORT = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

const TARGETS = {
  concert: {
    base: "http://localhost:4173",
    shots: [
      { name: "concert-seats", go: seatsScreen },
      { name: "concert-queue", go: queueScreen },
    ],
  },
  chat: {
    base: "http://localhost:14173",
    shots: [
      { name: "chat-conversation", go: chatConversation },
      { name: "chat-rooms", go: chatRooms },
    ],
  },
  finmate: {
    base: "http://localhost:5173",
    // 모바일 390×844 기준으로 설계된 앱이다. 데스크톱 뷰포트로 찍으면 폰 프레임만 나온다.
    viewport: MOBILE,
    shots: [
      { name: "finmate-my", go: finmateTab("마이") },
      // 분석(AI 코치)은 첫 진입에 인사말만 있어 화면이 비어 보인다.
      // 발표자료가 핵심 해법으로 든 "또래 금융 구경"이 피드이므로 그쪽을 찍는다.
      { name: "finmate-feed", go: finmateTab("피드") },
    ],
  },
  eta: {
    base: "http://localhost:5180",
    viewport: MOBILE,
    // 현위치를 물어보는 앱이라 권한과 좌표를 미리 준다.
    // 안 주면 권한 배너에서 멈춰 지도가 뜨지 않는다.
    pageOptions: {
      permissions: ["geolocation"],
      geolocation: { latitude: 37.5547, longitude: 126.9707 }, // 서울역
    },
    shots: [
      { name: "eta-routes", go: etaRoutes },
      { name: "eta-map", go: etaMap },
    ],
  },
};

/** 하단 탭 하나를 눌러 그 화면이 자리를 잡을 때까지 기다린다 */
function finmateTab(label) {
  return async (page, base) => {
    await page.goto(base);
    await page.getByRole("link", { name: label }).click();
    // 스프링 모션과 SVG 차트가 그려질 시간을 준다
    await page.waitForTimeout(1600);
  };
}

/** 데모 계정으로 들어가 현위치까지 켠 상태를 만든다 */
async function etaSignIn(page, base) {
  await page.goto(base);
  const boxes = page.getByRole("textbox");
  await boxes.nth(0).fill("test@eta.com");
  await boxes.nth(1).fill("password123");
  await page.getByRole("button", { name: /로그인하기/ }).click();
  await page.getByRole("button", { name: "내 위치 자동 동의" }).click();
  // 카카오 지도 타일이 다 그려질 때까지 기다린다. 반쯤 그려진 지도를 찍으면 회색 격자가 남는다.
  await page.waitForFunction(() => Boolean(window.kakao?.maps));
  await page.waitForTimeout(3000);
}

/** 현위치 지도. 상단에 학습된 보행속도가 함께 보인다 */
async function etaMap(page, base) {
  await etaSignIn(page, base);
}

/**
 * 경로 비교 화면. 이 프로젝트가 하려는 말이 여기 있다 —
 * 일반 소요와 개인화 템포 소요가 나란히 서고, 왜 늘어나는지 근거가 붙는다.
 */
async function etaRoutes(page, base) {
  await etaSignIn(page, base);
  await page.getByRole("button", { name: /어디로 안전하게/ }).click();
  await page.locator("input").first().fill("서울역");
  await page.getByRole("button").filter({ hasText: "KTX,SRT정차역" }).first().click();
  await page.getByRole("button", { name: "목적지로 지정" }).click();
  // 개인화 소요가 나올 때까지 기다린다 — 이게 이 화면의 요점이다
  await page.getByText("개인화 템포 소요").waitFor();
  await page.waitForTimeout(1200);
}

/**
 * 좌석 선택 화면.
 * 좌석 하나를 실제로 골라 선택 상태가 보이게 한 뒤, 맨 위로 올려 화면 전체를 담는다.
 */
async function seatsScreen(page, base) {
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: "데모 계정으로 바로 시작" }).click();
  await page.locator(".concert-row").first().click();
  await page.getByRole("button", { name: /예매하기/ }).first().click();
  await page.getByRole("button", { name: "좌석 선택으로 입장" }).click();
  await page.getByRole("button", { name: /선택 가능/ }).first().click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

/** 대기열 화면 — 좌석 선택 직전 단계에서 멈춘다 */
async function queueScreen(page, base) {
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: "데모 계정으로 바로 시작" }).click();
  await page.locator(".concert-row").first().click();
  await page.getByRole("button", { name: /예매하기/ }).first().click();
  await page.getByRole("button", { name: "좌석 선택으로 입장" }).waitFor();
}

/** 게이트웨이 주소 — 데모 스택은 nginx가 app-1/app-2 앞에 선다 */
const CHAT_API = "http://localhost:18080";

/** 실제 사용자를 하나 만든다. 화면에 빈 대화만 남지 않게 하려면 상대가 있어야 한다. */
async function signup(label) {
  const suffix = `${label}-${process.pid}-${Math.random().toString(16).slice(2, 8)}`;
  const res = await fetch(`${CHAT_API}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: `${suffix}@example.com`,
      password: "password123",
      nickname: `${label}${suffix.slice(-4)}`,
    }),
  });
  if (!res.ok) throw new Error(`signup ${label}: HTTP ${res.status}`);
  return res.json();
}

/** 세션을 sessionStorage에 심어 그 사용자로 연 페이지를 만든다 (web/e2e와 같은 방식) */
async function pageAs(browser, session) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await context.addInitScript((value) => {
    sessionStorage.setItem("relay-auth", JSON.stringify({ state: { session: value }, version: 0 }));
  }, session);
  return context.newPage();
}

/**
 * 두 사용자가 실제로 주고받은 대화를 만든다.
 * 데모 스택은 인스턴스가 2대라 이 메시지는 서로 다른 노드를 거쳐 도달한다.
 */
async function seedConversation(browser, base) {
  const [alice, bob] = [await signup("Alice"), await signup("Bob")];
  const aPage = await pageAs(browser, alice);
  const bPage = await pageAs(browser, bob);

  await aPage.goto(base);
  await aPage.getByRole("searchbox", { name: "새 대화" }).fill(bob.nickname);
  await aPage.getByRole("button", { name: bob.nickname, exact: true }).click();
  await aPage.getByRole("heading", { name: bob.nickname }).waitFor();

  await bPage.goto(base);
  await bPage.getByRole("heading", { name: alice.nickname }).waitFor();

  const say = async (page, text) => {
    const box = page.getByRole("textbox").last();
    await box.fill(text);
    await box.press("Enter");
    await page.waitForTimeout(700);
  };
  await say(aPage, "내일 회의 자료 초안 올려뒀어요");
  await say(bPage, "확인했어요. 3장만 다시 볼게요");
  await say(aPage, "네, 그 부분만 고치면 될 것 같아요");
  await aPage.waitForTimeout(1200);

  return { aPage, bPage };
}

async function chatConversation(page, base, ctx) {
  ctx.seeded ??= await seedConversation(page.context().browser(), base);
  return ctx.seeded.aPage;
}

async function chatRooms(page, base, ctx) {
  ctx.seeded ??= await seedConversation(page.context().browser(), base);
  return ctx.seeded.bPage;
}

/**
 * 캡처한 PNG를 AVIF·WebP 3폭으로 굽는다. 색 보정은 하지 않는다.
 * 비율은 캡처한 뷰포트를 따른다 — 모바일 세로 화면을 가로로 자르면 안 된다.
 */
async function bake(name, png, viewport = VIEWPORT) {
  for (const w of WIDTHS) {
    const base = sharp(png).resize(w, Math.round((w * viewport.height) / viewport.width), {
      fit: "cover",
    });
    await writeFile(
      path.join(OUT, `${name}-${w}.avif`),
      await base.clone().avif({ quality: 58, effort: 6 }).toBuffer(),
    );
    await writeFile(
      path.join(OUT, `${name}-${w}.webp`),
      await base.clone().webp({ quality: 80 }).toBuffer(),
    );
  }
}

async function main() {
  const which = process.argv[2];
  const targets = which ? { [which]: TARGETS[which] } : TARGETS;
  if (which && !TARGETS[which]) throw new Error(`모르는 대상: ${which}`);

  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  try {
    for (const [key, target] of Object.entries(targets)) {
      const res = await fetch(target.base).catch(() => null);
      if (!res?.ok) {
        console.log(`· ${key} 건너뜀 — ${target.base}가 응답하지 않습니다 (데모 스택을 먼저 띄우세요)`);
        continue;
      }

      // 채팅처럼 여러 사용자를 세워야 하는 대상은 첫 shot이 만든 상태를 뒤에서 재사용한다
      const ctx = {};
      const viewport = target.viewport ?? VIEWPORT;
      for (const shot of target.shots) {
        const page = await browser.newPage({
          viewport,
          deviceScaleFactor: 2,
          ...(target.pageOptions ?? {}),
        });
        try {
          // go가 다른 페이지를 돌려주면 그 페이지를 찍는다
          const shown = (await shot.go(page, target.base, ctx)) ?? page;
          await bake(shot.name, await shown.screenshot({ type: "png" }), viewport);
          console.log(`  → ${shot.name}-{640,1280,1920}.{avif,webp}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n완료 → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
