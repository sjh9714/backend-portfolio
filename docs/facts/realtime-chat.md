# 사실 대장 — realtime-chat

출처: `sjh9714/realtime-chat`
- `docs/PERF_RESULT.md`
- `docs/LIMITATIONS.md`
- `docs/evidence/RECEIVER_MATRIX_1000USERS_REPEAT3_2026-05-23.md`

확인일: 2026-08-05 · 상태: 🟠 **재측정 대기 중** (2026-08-05 결정)

> **결정:** 현재 커밋에서 재측정한 뒤 수치를 싣는다. 재측정 전까지 사이트는 이 프로젝트의
> 성능 수치를 주장하지 않는다. 절차는 문서 하단 「재측정 절차」 참조.

---

## 🔴 핵심 문제

현재 포트폴리오는 이 프로젝트의 수치 4개를 `evidence: "measured"` / `"verified"`로 싣고 있고,
그중 **2개는 홈 히어로 proofChips에 노출**돼 있다. 그런데 출처 문서가 스스로를 근거로 쓰지 말라고 한다.

### PERF_RESULT.md 최상단 배너 (원문 인용)

> [!WARNING]
> Historical unpinned archive입니다. 이 결과는 현재 room-list와 persistence pipeline의 commit-pinned
> 측정이 아니므로 **현재 코드의 성능 evidence로 사용하지 않습니다.** 공개 성능 수치는 현재 commit에서
> 환경·명령·raw artifact를 고정해 재측정한 뒤에만 갱신합니다.

RPS·p95 수치는 **전부 이 문서 안에 있다** (PERF_RESULT.md L489–519).

### LIMITATIONS.md — "현재 주장하지 않는 것" 표 (원문 인용)

| 항목 | 원문 진술 |
|---|---|
| send-to-receive latency | "이전 local 결과는 historical unpinned archive이며 현재 코드 evidence가 아님" |
| **delivery completeness** | "이전 receiver matrix는 historical unpinned archive이며 **현재 코드의 public delivery 결과가 아님**" |
| mixed traffic p95 | "현재 room-list와 persistence pipeline 기준 **공개 수치 없음**" |

---

## 저장소 내부에서 진술이 엇갈리는 지점

`RECEIVER_MATRIX_1000USERS_REPEAT3_2026-05-23.md` 자체는 자기 부인 배너가 **없다**.
2026-05-23 실행 결과를 정상적인 local scenario evidence로 제시하며, 유보 문구는 이 수준이다:

> "이 결과는 local scenario evidence입니다. 운영 성능 claim, mixed traffic benchmark,
> production p95 claim으로 사용하지 않습니다."

이건 현재 사이트의 claimBoundary와 **같은 층위의 유보**라 문제가 없다.
그런데 `LIMITATIONS.md`가 나중에 "이전 receiver matrix는 현재 코드 결과가 아님"으로 덮어썼다.

→ **두 문서 중 어느 쪽이 유효한지는 저장소 주인만 안다.**

---

## 측정된 값 자체 (실행은 실제로 있었음)

### N+1 제거 · 부하 테스트 (PERF_RESULT.md — 자기 부인 배너 적용됨)

| 항목 | Before | After | 변화 |
|---|---:|---:|---:|
| RPS | 937 | 1,598 | +70.5% |
| p95 | 212.85ms | 149.22ms | −29.9% |
| 총 요청 | 67,417 | 118,900 | +76.4% |
| 쿼리 수 (방 N개) | 2N+1 | 1 | — |

EXPLAIN ANALYZE 실행시간 (유저 200명 · 방 50개 · 멤버 1,039건):
- 방 목록 프로젝션 쿼리 **0.392ms**
- 커서 페이지네이션 0.258ms
- 멱등성 체크 (Index Only Scan) 0.439ms
- unreadCount 계산 1.325ms
- 멤버 확인 (Index Only Scan) 0.080ms

인덱스 5개 설계 + **의도적으로 추가하지 않은 인덱스 3개**를 근거와 함께 문서화
(`messages(room_id)`, `chat_room_members(room_id)`, `messages(created_at)`)
→ 이 "안 만든 이유" 기록은 서사 소재로 가치가 높다.

### 1,000명 receiver matrix (evidence 문서 — 자기 부인 배너 없음)

Docker Compose app-1/app-2 · 방 인원 1,000 · sender 5명 · 각 20건 · 100ms 간격

| run | expected | unique | missing | duplicate | completeness | p95 | out-of-order |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 99,900 | 99,900 | 0 | 0 | 100% | 45ms | 0 |
| 2 | 99,900 | 99,900 | 0 | 0 | 100% | 50ms | 0 |
| 3 | 99,900 | 99,900 | 0 | 0 | 100% | 45ms | 0 |

---

## 수치와 무관하게 안전한 사실 (배너 영향 없음)

아래는 성능 주장이 아니라 **설계·구현 사실**이라 자유롭게 쓸 수 있다.

- 메시지 상태 `SENDING → ACCEPTED → PERSISTED → FAILED`.
  `ACCEPTED`는 Kafka 수신이지 저장이 아니며, 브로드캐스트는 DB 커밋 이후에만 발생
- `senderId + clientMessageId` 유니크 제약으로 재전송 멱등성
- 재연결 시 마지막 수신 메시지 ID 이후를 DB에서 보충 조회
- Redis 발행 실패는 Kafka 재전달로 복구
- **PatternTopic 오브로드캐스트 수정** — ✅ 저장소에서 직접 확인 (2026-08-05)

  `src/test/java/com/realtime/chat/RedisPubSubServiceTest.java`:
  > `@DisplayName("PatternTopic 수신 channel이 pattern이어도 event roomId로 room topic에 전달한다")`
  > `void onMessageUsesEventRoomIdWhenPatternTopicProvidesPatternChannel()`

  `RedisPubSubService`는 발행 시 `CHAT_ROOM_CHANNEL_PREFIX + roomId` 채널을 쓰고,
  수신 시에는 패턴 채널명이 아니라 payload의 `roomId`로 목적지를 정한다.
  수정과 회귀 테스트 모두 실재한다.

  > ⚠️ **"이 버그를 receiver matrix 도구가 먼저 잡았다"는 발견 경위는 근거 없음.**
  > 저장소는 수정된 결과만 보여 준다. `DELIVERY_MATRIX_BY_ROOM_GUARD_2026-05-22.md`는
  > 앱 버그 기록이 아니라 *측정 도구*가 방 단위 분모를 분리하는지 보장하는 문서다
  > (cross-room 수신을 `unexpectedDeliveries`로 계산). **사용자 확인 필요.**
- LIMITATIONS.md의 "면접에서 안전하게 말할 문장"이 이미 정리돼 있음 → 카피 톤의 기준으로 활용

---

## 판정

| 현재 사이트 주장 | 위치 | 판정 |
|---|---|---|
| 목록 조회 RPS +70.5% | **홈 히어로 proofChip** + 상세 metric | 🔴 출처 문서가 자기 부인 |
| p95 −29.9% | 상세 metric | 🔴 출처 문서가 자기 부인 |
| 목록 쿼리 2N+1 → 1회 | 상세 metric | 🟡 구조적 사실이나 같은 문서 출처 |
| 1,000명 수신 유실 0건 | **홈 히어로 proofChip** + 상세 metric | 🟡 evidence 문서는 유효, LIMITATIONS가 부인 |

**현재 사이트의 claimBoundary가 부족한 이유:** "로컬 Docker 측정값이며 운영 성능 주장이 아닙니다"는
*로컬이냐 운영이냐*의 유보다. 저장소가 말하는 건 다른 층위 —
***현재 코드 기준 측정이 아니다***. 이 유보가 빠져 있다.

---

## 재측정 절차

저장소에 이미 **「근거 승격 체크리스트」**(`docs/WEBSOCKET_MEASUREMENT.md` §7-1)가 정의돼 있다.
이 체크리스트가 *"artifact를 `docs/PERF_RESULT.md` 또는 **portfolio claim**으로 옮기기 전에
아래를 모두 확인한다"* 라고 직접 명시하므로, 그대로 따르면 된다.

### 1. HTTP 부하 (RPS · p95) 재측정

측정 환경 (원문 §4-1): macOS Apple Silicon · Docker Desktop CPU 4코어 / 메모리 8GB ·
PostgreSQL 16-alpine · Redis 7-alpine · Kafka 3.9.0 KRaft 파티션 6개 · 앱 컨테이너 2대 · k6 v1.5.0
시나리오: 200 VU · 50초 (워밍업 10s → 최대부하 30s → 쿨다운 10s)

```bash
k6 run \
  --env BASE_URL=http://localhost:8081 \
  --env WS_URL=ws://localhost:8081/ws \
  --env VUS=50 --env DURATION=30s \
  --summary-export=k6/results/mixed-chat-summary.json \
  k6/mixed-chat-test.js
```

Before/After 비교가 목적이라면 N+1 커밋 전후를 각각 측정해야 한다.

### 2. Receiver matrix (delivery completeness) 재측정

```bash
node scripts/ws-delivery-runner.mjs   # 옵션은 WEBSOCKET_MEASUREMENT.md §5 참조
node scripts/validate-delivery-evidence.mjs --artifact-dir <artifact-dir>
```

### 3. 승격 게이트 (원문 §7-1 — 전부 통과해야 함)

- [ ] `validate-delivery-evidence.mjs`가 통과한다
- [ ] `manifest.json`이 options·environment·claimBoundary·expected sessions/rooms/messages를 기록한다
- [ ] `summary.json`이 raw `members/send/receive/status/http.jsonl`에서 재생성된다
- [ ] 각 expected room id가 `summary.byRoom`에 존재한다
- [ ] mixed HTTP probe 포함 실행은 `mixedHttp.failedRequests === 0`
- [ ] `statusless`·`failed`·`missing`·`duplicate`·`unexpected`가 있으면 성공 claim이 아니라 진단으로만 쓴다
- [ ] 커밋 SHA·환경·명령·raw artifact를 고정해 기록한다
- [ ] `PERF_RESULT.md` 최상단의 `[!WARNING]` 배너를 제거하거나 갱신한다

### 4. 완료 후 포트폴리오에 반영할 것

1. 이 대장의 상태를 ✅ 로 바꾸고 새 수치·측정일·커밋 SHA 기록
2. `src/content/projects/realtime-chat.ts`의 `metrics` 채우기
3. `Metric.condition`에 측정 커밋 SHA 포함
4. 히어로 proofChip 재검토 (현재는 concert-booking·billing-gateway 수치로 구성)

> 원문 §7-1 마지막 줄: *"현재 local receiver matrix는 `시나리오 검증`으로 유지한다."*
> → 재측정하더라도 **`measured`가 아니라 `verified`로 두는 것이 저장소 원칙과 맞을 수 있다.**
> 승격 여부는 artifact를 보고 판단할 것.
