/**
 * /resume 페이지를 A4 PDF로 출력해 public/에 커밋용으로 저장한다.
 * 사용: dev 서버 실행 상태에서 `node scripts/resume-pdf.mjs`
 *
 * 출처 해시도 함께 남긴다 — 콘텐츠를 고치고 이 스크립트를 잊으면 린트가 잡는다.
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { HASH_FILE, resumeSourceHash } from "./resume-source-hash.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("../public/resume-sung-jinhyuk.pdf", import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: "print" });
await page.goto(`${BASE}/resume`, { waitUntil: "networkidle" });
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
});
await browser.close();
writeFileSync(HASH_FILE, `${resumeSourceHash()}\n`);
console.log(`saved ${OUT}`);
console.log(`saved ${HASH_FILE} — 이력서 콘텐츠가 바뀌면 린트가 재생성을 요구한다`);
