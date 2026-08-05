# 사실 대장 — concert-booking

출처: `sjh9714/concert-booking`
- `docs/PERF_RESULT.md`
- `docs/evidence/SCENARIO_D_E_F_FORMAL_2026-05-22.md`

확인일: 2026-08-05 · 상태: **카피에 사용 가능** (아래 단서 조건부)

---

## 측정 환경 (원문 §1)

Apple M4 · RAM 16GB · macOS · Docker Desktop 로컬 컨테이너
PostgreSQL 16 · Redis 7 · Kafka 7.6.0 · Spring Boot 3.4.1 · JDK 21.0.8 · Redisson 3.40.2 · k6 v1.5.0
HikariCP pool size 10 (기본) · Tomcat max threads 200 (기본)

**PostgreSQL·Redis·Kafka·애플리케이션이 모두 같은 머신에서 실행됨** (원문 §9)

---

## A. 동일 좌석 경합 — measured

조건: 100 VU, 동일 좌석 1개, per-vu-iterations 1회

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 성공 | 1 | 1 | 1 |
| 실패 | 99 | 99 | 99 |
| oversell | 0건 | 0건 | 0건 |
| p50 | 68ms | 70ms | 70ms |
| p95 | 215ms | 106ms | 145ms |

원문 단서: **샘플 100건이라 p99는 주장하지 않음**

## B. 분산 좌석 예약 — measured ★ 서사의 클라이맥스

조건: 50 VU, 좌석 50개, 각 VU가 **서로 다른** 좌석 1개 예매

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 성공률 | 100% (50/50) | **40% (20/50)** | 100% (50/50) |
| p95 | 95ms | 215ms | 126ms |

**원인 (원문 §7 인용):**
> "Scenario B에서 각 사용자는 다른 좌석을 예매합니다. 그래도 모든 예매는 같은
> `ConcertSchedule.availableSeats`를 감소시킵니다. 낙관적 락은 이 공유 row의 version 충돌을
> 커밋 시점에 감지합니다."

**반드시 함께 실어야 하는 단서 (원문 §7 인용):**
> "retry 횟수를 크게 늘리면 성공률은 올라갈 수 있습니다. 대신 p95 응답 시간과 DB 부하도 같이
> 증가합니다. 이 결과는 낙관적 락이 무조건 부적합하다는 뜻이 아니라, **공유 카운터 row가 있는
> 모델에서는 충돌 비용이 쉽게 드러난다**는 뜻입니다."

> ⚠️ **현재 사이트 카피의 결함**: "낙관적 락 성공률이 40%로 무너졌다"고만 쓰고 retry 한도 단서를
> 누락했다. 40%는 낙관적 락의 본질이 아니라 **구현의 retry 한도에 달린 값**이다. 재작성 시 필수 포함.

## C. 혼합 부하 — measured

조건: 200 VU, ramping-vus 45초, 조회 70% + 예매 30%

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 총 RPS | 969 | 993 | **1,005** |
| 쓰기 p95 | 37ms | 10ms | **6ms** |

**Redis가 빠른 이유 (원문 §7):** DB 트랜잭션 전에 Redis stock을 먼저 감소시켜, 소진된 좌석 요청은
DB 커넥션을 잡지 않고 실패한다.
**대가:** Redis stock은 최종 기준 데이터가 아니며 `availableSeats`·`Seat.status`와 어긋날 수 있어
manual reconciliation utility가 필요하다.

## D/E/F 시나리오 검증 — verified

3전략 × 3회 반복 (2026-05-22)

| 시나리오 | 범위 | 체크 |
|---|---|---:|
| D 결제/만료 race | 3전략 × 3회 | 216/216 |
| E 멱등 replay/conflict | 3전략 × 3회 | 234/234 |
| F 대기열 token abuse | 3전략 × 3회 | 144/144 |
| **합계** | | **594/594** |

관측된 도메인 카운터: `duplicatePaymentCount: 0`, `unexpected: 0`, `redisStock: 50` (전 run)

✅ 현재 사이트의 "594/594" 표기는 정확하다.

---

## 원문이 명시한 한계 (§9) — claimBoundary에 반영 필수

- 로컬 Docker 기준, 운영 환경 수치 아님
- A/B/C는 **단일 실행** 결과. 평균·표준편차·신뢰구간 계산 안 함
- JVM warmup 없음
- A/B는 샘플이 작아 p99 주장 안 함
- HikariCP·Tomcat 기본 설정
- 결제는 mock 즉시 성공. 외부 PG latency·승인 실패·webhook 흐름 미포함

---

## 판정

| 현재 사이트 주장 | 판정 |
|---|---|
| 동일 좌석 100명 oversell 0건 | ✅ 정확 |
| 분산 예약 성공률 100% vs 40% | ⚠️ 수치는 정확하나 **retry 단서 누락** |
| 혼합 부하 총 RPS 1,005 | ✅ 정확 |
| race·멱등·토큰 체크 594/594 | ✅ 정확 |
| p95 낙관 106 / Redis 145 / 비관 215 | ✅ 정확 (시나리오 A) |
