/**
 * /resume 페이지를 A4 PDF로 출력해 public/에 커밋용으로 저장한다.
 * 사용: dev 서버 실행 상태에서 `node scripts/resume-pdf.mjs`
 */
import { chromium } from "playwright";

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
console.log(`saved ${OUT}`);
