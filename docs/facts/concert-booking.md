# 사실 대장: concert-booking

## 현재 기본 서비스 (2026-10-03)

리비전 b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86의 SERVICE_GUIDE·ServiceBookingIntegrationTest·Seat를 대조했습니다. 현재 소유 예약 ID와 상태를 검사하며, 취소·만료와 반환을 같은 트랜잭션에서 처리합니다. 5분 선점·30초 만료 주기입니다. 과거 취소 재처리에서 반환 0개, B 소유권 유지. 8개 동시 요청의 같은 좌석 성공 1/8·다른 좌석 8/8은 PostgreSQL 서비스 호출, 워밍업 없이 조건별 1회 관측입니다. HTTP 성능이 아닙니다. 아래는 이전 실험 조사로 현재 기본 서비스와 구분합니다.


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

## A. 동일 좌석 경합: measured

조건: 100 VU, 동일 좌석 1개, per-vu-iterations 1회

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 성공 | 1 | 1 | 1 |
| 실패 | 99 | 99 | 99 |
| oversell | 0건 | 0건 | 0건 |
| p50 | 68ms | 70ms | 70ms |
| p95 | 215ms | 106ms | 145ms |

원문 단서: **샘플 100건이라 p99는 주장하지 않음**

## B. 분산 좌석 예약: measured · 전략 비교

조건: 50 VU, 좌석 50개, 각 VU가 **서로 다른** 좌석 1개 예매

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 성공률 | 100% (50/50) | **40% (20/50)** | 100% (50/50) |
| p95 | 95ms | 215ms | 126ms |

**원인 (원문 §7 인용):**
> "Scenario B에서 각 사용자는 다른 좌석을 예매합니다. 그래도 모든 예매는 같은
> `ConcertSchedule.availableSeats`를 감소시킵니다. 낙관적 락은 이 공유 row의 version 충돌을
> 커밋 시점에 감지합니다."

**해석 경계 (2026-09-30 원문·코드 재대조):**

- 40%와 100%는 동일 시나리오의 전략 간 비교다. 수정 전후 성공률 개선으로 표현하지 않는다.
- 낙관적 락의 20/50건은 구현의 제한된 retry 조건이다.
- retry 한도를 늘린 성공률·p95·DB 부하 실험은 없다. 원문의 가능성 설명을 측정한 성과로 쓰지 않는다.

## C. 혼합 부하: measured

조건: 200 VU, ramping-vus 45초, 조회 70% + 예매 30%

**좌석 쏠림도 시나리오의 일부다.** 예매는 80% 확률로 인기 좌석(상위 20%)을 고른다 ,
`k6/scenario-c.js`에서 `seatIds.slice(0, floor(length * 0.2))`를 hot으로 두고
`Math.random() < 0.8`일 때 거기서 뽑는다. 즉 이 수치는 고르게 흩어진 부하가 아니라
**일부러 한곳으로 몰아 놓은** 부하에서 나온 값이다.

> 사이트가 "예매의 80%를 인기 좌석 상위 20%에 몰았다"고 쓰는 근거가 이것이다.
> 2026-08-08에 코드로 확인했다. 그 전까지 이 문서에 없어 근거 없는 숫자였다.

| 메트릭 | 비관적 | 낙관적 | Redis 분산 |
|---|---:|---:|---:|
| 총 RPS | 969 | 993 | **1,005** |
| 쓰기 p95 | 37ms | 10ms | **6ms** |

**해석 정정 (2026-09-30 원문·코드 재대조):**

쓰기 성공은 전략별 50건이고 실패는 비관 20,766건 / 낙관 21,711건 / Redis 21,638건이다.
쓰기 p95 37/10/6ms는 실패 요청이 대부분인 혼합 결과다. 성공한 예약이 빨라진 수치나
37ms → 6ms의 변경 전후 개선으로 주장하지 않는다. 포트폴리오의 대표 성과에서는 제외한다.

`RedisStockService.tryAcquire`는 선차감 전에 `initialize(scheduleId, false)`를 호출한다.
이 함수는 스케줄 조회와 AVAILABLE 좌석 수 조회를 먼저 수행한다. 따라서 소진 요청도
**DB 조회가 있으며 ‘DB 접근을 전부 우회한다’는 기존 설명은 틀렸다.**
예약 쓰기 트랜잭션 진입 전 거절하는 경로와 DB 무접근은 다르다.

코드 근거: [RedisStockService](https://github.com/sjh9714/concert-booking/blob/96c0708a8f6dbf1c8642af97eb5119904ce5911a/src/main/java/com/concert/booking/service/stock/RedisStockService.java)

**대가:** Redis stock은 기준 데이터가 아니며 `availableSeats`·`Seat.status`와 어긋날 수 있어
정합성 대조와 보정 경로가 필요하다.

## D/E/F 시나리오 검증: verified

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

## 원문이 명시한 한계 (§9): claimBoundary에 반영 필수

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
| 분산 예약 성공률 100% vs 40% | ✅ 제한된 retry 조건의 **전략 비교**로만 사용 |
| 혼합 부하 총 RPS 1,005 | ✅ 정확 |
| race·멱등·토큰 체크 594/594 | ✅ 정확 |
| p95 낙관 106 / Redis 145 / 비관 215 | ✅ 정확 (시나리오 A) |

---

## 서비스 개요 · 구현 기능 (2026-08-06 추가)

가이드 p.9 프로젝트 템플릿의 "서비스: 프로젝트에 대한 개요"와 "단순히 구현" 항목이
사이트에 통째로 빠져 있어 보강한다. 아래는 전부 **코드에서 확인한 것**이다.

### 무슨 서비스인가

README 첫 줄: "락 전략 3종(비관적·낙관적·Redis 분산)을 같은 조건에서 실측 비교하고,
결제/만료 race·멱등성·이벤트 유실 복구까지 검증한 좌석 예약 백엔드".

`web/src/pages/` 실제 화면 9개:
AuthPage · CatalogPage · ConcertPage · QueuePage · SeatsPage · ReservationPage ·
ReservationsPage · NotFoundPage (+ QueuePage.test)

사용자 흐름: `web/e2e/booking.spec.ts` "user can reserve and complete a demo payment" 기준:
가입 → 콘서트 목록 → 예매하기 → 좌석 선택으로 입장(대기열) → 좌석 선택 → 이 좌석으로 예매 → 데모 결제

### 구현 기능 (컨트롤러 실측)

| 컨트롤러 | 엔드포인트 |
|---|---|
| AuthController | `POST /signup`, `POST /login` |
| UserController | `GET /me` |
| ConcertController | `GET /`, `GET /{id}`, `GET /{id}/schedules`, `GET /{id}/schedules/{scheduleId}/seats` |
| QueueController | `POST /enter`, `GET /position`, **`GET /events` (SSE, TEXT_EVENT_STREAM)**, `GET /token` |
| ReservationController | `POST /`, `GET /{id}`, `GET /my`, `DELETE /{id}` |
| PaymentController | `POST /`, `GET /{id}` |
| AdminController | `POST /reset`, `POST /dlt/replay`, `POST /schedules/{id}/stock/initialize`, `POST /schedules/{id}/stock/reconcile` |
| DemoAuthController | `POST /demo`: 데모 계정 원클릭 로그인 |

주의: 대기열 진행 상황은 폴링이 아니라 **SSE**로 내려준다 (`produces = TEXT_EVENT_STREAM_VALUE`).

### 데모 UI

- `web/`: React + TypeScript + Vite, nginx 도커 이미지, `docker-compose.yml`에 `web` 서비스로 물려 있음 (`:4173`)
- origin/main에 반영됨 (`git ls-tree origin/main` 확인)
- `VITE_DEMO_MODE=true`(demo 오버레이)면 "데모 계정으로 바로 시작" 버튼 노출
- Playwright e2e: `web/e2e/booking.spec.ts`:
  - catalog is accessible and opens a concert
  - correctness explanation opens as a keyboard-dismissible drawer
  - user can reserve and complete a demo payment
  - one fixed demo account opens the product without typing credentials
  - **two browsers competing for one seat yield one winner and a recoverable loser**
  - lost queue-token response is replayed and duplicate reservation keys return one reservation

마지막 두 개는 좌석 경합·멱등성 케이스 스터디를 화면 레벨에서 재현한 것이다.
가이드 p.18이 "테스트 결과를 근거로 제시하는 것은 아주 좋은 방향"이라 한 자리에 해당한다.
