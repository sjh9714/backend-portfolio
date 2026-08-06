#!/usr/bin/env node
/**
 * Lighthouse 리포트를 읽어 최소 점수를 강제한다.
 *
 * 왜 필요한가: 히어로 파티클(WebGL), 카드 미니 시뮬, 좌석 경합 시뮬레이터를 얹으면서
 * 성능이 조용히 새기 쉬워졌다. 특히 부팅 연출은 화면을 덮는 동안 LCP가 그대로 밀리므로,
 * 연출을 늘릴 때마다 이 게이트가 먼저 걸리도록 해 둔다.
 *
 * 사용법: node scripts/check-lighthouse.mjs <report.json>
 */
import { readFileSync } from "node:fs";

/** 모바일 기준. 실측 여유를 두되 회귀는 잡히는 선. */
const MIN = {
  performance: 90,
  accessibility: 100,
  "best-practices": 90,
  seo: 95,
};

const path = process.argv[2];
if (!path) {
  console.error("사용법: node scripts/check-lighthouse.mjs <report.json>");
  process.exit(2);
}

const report = JSON.parse(readFileSync(path, "utf8"));
const failures = [];

for (const [key, min] of Object.entries(MIN)) {
  const category = report.categories?.[key];
  if (!category) {
    failures.push(`${key}: 리포트에 없음`);
    continue;
  }
  const score = Math.round(category.score * 100);
  const ok = score >= min;
  console.log(`${ok ? "✓" : "✗"} ${key.padEnd(15)} ${String(score).padStart(3)} (최소 ${min})`);
  if (!ok) failures.push(`${key}: ${score} < ${min}`);
}

// 회귀를 읽기 쉽게 — 점수만 보면 어디서 샜는지 알 수 없다
const metrics = [
  "largest-contentful-paint",
  "first-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
];
console.log("\n주요 지표");
for (const id of metrics) {
  const audit = report.audits?.[id];
  if (audit) console.log(`  ${id.padEnd(26)} ${audit.displayValue}`);
}

if (failures.length > 0) {
  console.error(`\nLighthouse 게이트 실패:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\nLighthouse 게이트 통과");
