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

---

## 버전 (2026-08-06, 로컬 클론에서 확인)

`build.gradle.kts`: Spring Boot **3.5.14**, Java **21**, dependency-management 1.1.7
`docker-compose`: postgres **16-alpine**, redis **7-alpine**
(자료가 스택에 버전을 함께 적으라고 해서 확인한 값이며, 사이트에 반영했다.)

---

## 서비스 개요 · 구현 기능 (2026-08-06 추가)

### 무슨 서비스인가

README 첫 줄: "재시도가 중복 과금이 되지 않도록. API Key 발급부터 사용량 계량, webhook,
정산 원장까지 — 돈이 걸린 경계 4개의 정합성을 검증하는 멀티테넌트 과금 게이트웨이".

**화면(UI)이 없다.** 다른 서비스가 호출하는 게이트웨이이고 저장소에 `web/`이 없다.
없는 것을 있는 것처럼 쓰지 않는다. 사용자 흐름은 사람이 아니라 **호출자** 기준으로 적는다:
조직 생성 → API Key 발급 → 게이트웨이 호출 → 사용량 계량 → 인보이스 생성 → 결제 webhook 수신

### 구현 기능 (컨트롤러 실측)

| 컨트롤러 | 엔드포인트 |
|---|---|
| AuthController | `POST /api/auth/signup`, `POST /api/auth/login` |
| OrganizationController | `POST /`, `GET /`, `GET /{orgId}`, `POST /{orgId}/members`, `PUT /{orgId}/subscription` |
| ApiKeyController | `POST /`, `GET /`, `DELETE /{keyId}` — 조직별 API Key 발급·폐기 |
| UsageController | `POST /api/usage/events` — 사용량 계량 |
| BillingController | `POST /{orgId}/invoices/generate` — 인보이스 생성 |
| PaymentWebhookController | `POST /api/webhooks/payments` — 결제 webhook 수신 |
| GatewayController | `POST /v1/gateway/mock-completion` — 과금 대상 호출의 mock |

---

## 싣지 않는 수치

**기계가 읽는 목록이다.** `scripts/lint-writing.mjs`의 「금지」 검사가 화면 카피에서 이
값들을 막는다. 형식은 `` - `값` — 이유 ``.

여기 있는 값들은 숫자가 가짜라서가 아니라 **의미가 다르기 때문에** 금지다. 5 VU 부하의
RPS를 처리량처럼 쓰면 측정은 맞고 주장이 틀린다.

- `4.86` — 5 VU 부하의 RPS라 처리량 지표가 아니다. 절대 성능 수치로 인용하지 않는다
- `4.93` — 같은 실행의 나머지 두 회차
- `4.9` — 위 값들의 반올림 표기
