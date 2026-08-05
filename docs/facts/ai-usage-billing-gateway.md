# 사실 대장 — ai-usage-billing-gateway

출처: `sjh9714/ai-usage-billing-gateway` · `docs/PERF_RESULT.md`
확인일: 2026-08-05 · 상태: ✅ **카피에 사용 가능 — 현재 사이트가 가장 정직한 프로젝트**

---

## 저장소의 claim boundary (원문 인용)

> "Claim boundary: 현재 공개 가능한 production throughput / latency / error-rate 측정 완료 수치는
> 없습니다. 아래 full mixed repeat3는 local 환경에서 branch mix와 HTTP 결과를 확인한 측정
> evidence이며, 운영 성능 주장으로 사용하지 않습니다."

✅ 현재 사이트의 claimBoundary("이 프로젝트는 처리량·지연시간 벤치마크 수치를 주장하지 않습니다")가
저장소 진술과 정확히 일치한다. **네 프로젝트 중 유일하게 완전히 정합적이다.**

---

## Full Mixed Local Repeat3 — verified (2026-05-23)

조건: `K6_RUNS=3 K6_VUS=5 K6_DURATION=30s`

| Run | HTTP req | RPS | p95 | Checks | HTTP failed | gateway | usage | invoice | webhook | optional skipped |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 150 | 4.86 | 44.15ms | 150/150 | 0/150 | 107 | 31 | 6 | 6 | 0 |
| 2 | 150 | 4.93 | 19.89ms | 150/150 | 0/150 | 107 | 31 | 6 | 6 | 0 |
| 3 | 150 | 4.93 | 18.60ms | 150/150 | 0/150 | 107 | 31 | 6 | 6 | 0 |

Artifact: `docs/evidence/k6/full-mixed-20260523T015029Z/`

**중요한 해석 경계 (원문):**
- RPS 4.9는 5 VU 부하이므로 **처리량 지표가 아니다.** 절대 성능 수치로 인용 금지
- webhook branch는 같은 invoice + 같은 `providerEventId`를 재사용 →
  "fresh payment throughput이 아니라 **duplicate delivery / idempotency path**로 해석"
- `K6_REQUIRE_OPTIONAL_PATHS=true`는 benchmark가 아니라 **smoke readiness guard**

## Local Smoke (2026-05-22)

checks 28/28 · gateway path 24 · usage path 4 · skipped optional 2 · HTTP failed 0/28
→ 원문이 "public throughput/latency/error-rate benchmark로 사용하지 않습니다"라고 명시

---

## 설계 사실 (성능 주장과 무관 — 자유롭게 사용 가능)

- 사용량 기록 API에 `Idempotency-Key` 강제. 같은 키 재요청은 새 row를 만들지 않고,
  같은 키 + 다른 본문은 conflict로 거절
- PG webhook: HMAC 서명 검증 → `providerEventId` 기반 중복 제거
- 잔액을 UPDATE하지 않는 **append-only ledger**. 환불도 삭제가 아니라 반대 방향 엔트리
- API Key는 해시만 저장. 모든 조회·기록 경로를 조직 스코프로 격리
- 통합 테스트로 security·idempotency·invoice·webhook·ledger·audit 정합성 검증
- Prometheus scrape는 로컬에서 `401` 반환 → unavailable note를 artifact에 남김
  (실패를 숨기지 않고 기록한 사례 — 서사 소재)

---

## 판정

| 현재 사이트 주장 | 판정 |
|---|---|
| 혼합 시나리오 체크 150/150 (3회) | ✅ 정확 |
| HTTP 실패 0/150 | ✅ 정확 |
| 중복 과금·중복 결제 반영 0건 | ✅ 정확 |
| claimBoundary "벤치마크 수치 주장 안 함" | ✅ 저장소와 완전 일치 |

**주의:** RPS 4.9는 사이트에 싣지 않았다. 옳은 판단이므로 재작성 시에도 싣지 않는다.
