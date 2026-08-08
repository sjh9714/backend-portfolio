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
      { name: "concert-catalog", go: catalogScreen },
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
    // 데모 문서 기준은 5180이지만 개발 중에는 vite 기본 포트로 뜬다.
    // 백엔드 CORS 기본 허용이 5173뿐이라(app/config.py) env로 덮을 수 있게 둔다.
    base: process.env.ETA_BASE || "http://localhost:5180",
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
  // (앱 문구가 "개인화 템포 소요" → "내 속도로는"으로 바뀌었다, 2026-08-08 design pass)
  await page.getByText("내 속도로는").waitFor();
  await page.waitForTimeout(1200);
}

/**
 * 좌석 선택 화면.
 * 좌석 하나를 실제로 골라 선택 상태가 보이게 한 뒤, 맨 위로 올려 화면 전체를 담는다.
 */
/**
 * 데모용 공연을 고른다.
 *
 * 첫 공연은 쓰지 않는다 — e2e가 `/api/admin/load-test/reset`으로 그 회차의 좌석을
 * 전부 되돌리기 때문에, e2e를 돌린 뒤 찍으면 매진 자리가 하나도 없는 좌석표가 나온다.
 * 실제로 그렇게 찍혀서 VIP 36석이 전부 비어 있었다.
 */
const DEMO_CONCERT = "종이비행기";

async function openDemoConcert(page, base) {
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: "데모 계정으로 바로 시작" }).click();
  await page.locator(".concert-card").filter({ hasText: DEMO_CONCERT }).first().click();
}

/**
 * 공연 목록.
 *
 * 포스터가 다 뜬 뒤에 찍는다. 지연 로딩이라 바로 찍으면 아래쪽 카드가 빈 칸으로 나온다.
 *
 * 맨 위 배너는 5초마다 넘어간다. 그대로 찍으면 매번 다른 공연이 나오므로
 * 감소 모션으로 연다 — 그러면 자동 전환이 시작되지 않아 언제나 첫 장이다.
 * 겸사겸사 그 경로가 실제로 도는지도 확인된다.
 */
async function catalogScreen(page, base) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  await page.locator(".concert-card").first().waitFor();
  await page.locator(".banner-slide:not([inert]) .banner-title").waitFor();
  /*
   * 화면에 실제로 걸린 이미지만 기다린다.
   *
   * 전에는 `document.images` 전부를 기다렸다가 영영 안 끝났다 — 캐러셀에는 슬라이드가
   * 복제까지 8칸이고 보이지 않는 칸의 그림은 loading="lazy"라 뷰포트에 들어오지 않으면
   * 끝내 로드되지 않는다. `complete`가 계속 false다.
   *
   * 그래서 뷰포트와 겹치는 것만 고르고, 그래도 안 끝나면 4초에 포기한다.
   */
  await page.evaluate(async () => {
    const onScreen = [...document.images].filter((image) => {
      if (image.complete) return false;
      const box = image.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
    });
    const settled = Promise.all(
      onScreen.map(
        (image) => new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
      ),
    );
    await Promise.race([settled, new Promise((resolve) => setTimeout(resolve, 4000))]);
  });
  await page.waitForTimeout(400);
}

async function seatsScreen(page, base) {
  await openDemoConcert(page, base);
  await page.getByRole("button", { name: /예매하기/ }).first().click();
  await page.getByRole("button", { name: "좌석 선택으로 입장" }).click();
  await page.getByRole("button", { name: /선택 가능/ }).first().click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

/**
 * 대기열 화면 — 좌석 선택 직전 단계에서 멈춘다.
 *
 * 버튼이 생기자마자 찍으면 SSE가 아직 붙기 전이라 "연결 중"에 버튼이 비활성인
 * 중간 상태가 나온다. 실제로 그렇게 찍혔다. 연결이 서고 버튼이 눌리는 상태까지 기다린다.
 */
async function queueScreen(page, base) {
  await openDemoConcert(page, base);
  await page.getByRole("button", { name: /예매하기/ }).first().click();
  await page.getByRole("button", { name: "좌석 선택으로 입장" }).waitFor();
  await page.getByText("실시간 연결").waitFor();
  await page.getByRole("button", { name: "좌석 선택으로 입장" }).waitFor({ state: "attached" });
  await page.waitForFunction(
    () => !document.querySelector("main.queue-page .primary-button")?.disabled,
  );
  await page.waitForTimeout(400);
}

/** 게이트웨이 주소 — 데모 스택은 nginx가 app-1/app-2 앞에 선다 */
/**
 * 데모 계정으로 들어간다.
 *
 * 전에는 여기서 사용자 둘을 가입시키고 대화를 하나 만들어 세 마디를 주고받았다.
 * 그렇게 찍으면 대화 1개에 메시지 3개짜리 화면이 나오고, 그건 메신저가 아니라
 * 기능 테스트로 보인다.
 *
 * 지금은 백엔드 데모 시드가 대화 5개(1:1·그룹)와 며칠치 기록을 만들어 둔다
 * (realtime-chat `DemoDataConfig`). 그걸 그대로 찍는다.
 */
async function chatDemoLogin(page, base) {
  await page.goto(base);
  await page.getByRole("button", { name: /가입하지 않고 둘러보기/ }).click();
  await page.getByText("제품팀 스탠드업").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(900);
}

/** 대화 화면 — 그룹 대화를 연다. 사람이 여럿인 쪽이 메신저로 읽힌다. */
async function chatConversation(page, base) {
  await chatDemoLogin(page, base);
  await page.getByText("제품팀 스탠드업").first().click();
  await page.waitForTimeout(1400);
}

/** 대화 목록 — 방금 연 대화 대신 목록이 주인공이 되도록 1:1 대화를 연다 */
async function chatRooms(page, base) {
  await chatDemoLogin(page, base);
  await page.getByText("유진").first().click();
  await page.waitForTimeout(1400);
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
