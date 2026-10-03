#!/usr/bin/env node
/**
 * Lighthouse 리포트를 읽어 최소 점수를 강제한다.
 *
 * 홈, 이력서, 모든 프로젝트 상세의 모바일 성능·접근성 회귀를 확인한다.
 * 페이지별 기준은 동일하며 새 라우트를 추가하면 CI 대상에도 포함한다.
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

// 회귀를 읽기 쉽게: 점수만 보면 어디서 샜는지 알 수 없다
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
