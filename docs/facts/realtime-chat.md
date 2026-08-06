# 사실 대장 — realtime-chat

출처: `sjh9714/realtime-chat`
- `docs/PERF_RESULT.md`
- `docs/LIMITATIONS.md`
- `docs/evidence/RECEIVER_MATRIX_1000USERS_REPEAT3_2026-05-23.md`

확인일: 2026-08-06 · 상태: 🟡 **REST 조회는 재측정 완료 / WebSocket 전달은 여전히 대기**

> 2026-08-06에 현재 커밋(`9663f58`)에서 REST 조회 부하를 3회 반복 재측정했다.
> 결과는 문서 하단 「재측정 결과」 참조. WebSocket receiver matrix는 아직 재측정하지 않았다.

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

---

## 코드 대조 (2026-08-06, 로컬 클론 `~/Projects/realtime-chat`)

측정 문서가 아니라 **현재 코드**를 직접 읽어 확인한 사실. 배너 영향을 받지 않는다.

### 목록 조회 쿼리 수는 1회가 아니라 **3회**

`ChatRoomService.getMyRooms`는 프로젝션 이후 두 개의 배치 조회를 더 실행한다.

1. `ChatRoomRepository.findAllWithMemberInfoByUserId` — constructor expression 프로젝션
   (`cr.id, cr.name, cr.type, COUNT(m2), m.unreadCount, cr.createdAt` = **6개 값**)
2. `ChatRoomMemberRepository.findOtherMemberNicknames` — `WHERE m.chatRoom.id IN :roomIds`
3. `MessageRepository.findLatestByRoomIds` — `WHERE m.chatRoom.id IN :roomIds` + `JOIN FETCH m.sender`

두 배치 조회는 표시 이름과 최근 메시지 미리보기 기능이 나중에 추가되며 붙었고,
**IN 절로 묶어 N+1이 되지 않게** 했다. 따라서 정확한 서술은 "101회 → 1회"가 아니라
**"방 개수에 비례하던 2N+1을 제거하고 3회로 고정"** 이다.

> ⚠️ 2026-08-05 버전 카피는 "101회 → 1회"라고 적고 있었다. 기능이 늘어난 뒤의 코드와 맞지 않아 수정함.

`ChatRoomListResponse`의 필드는 11개지만 프로젝션이 채우는 것은 6개이고,
나머지는 `enrich()`가 배치 조회 결과로 채운다.

### 캐시 무효화는 **선택 + 전체 혼합**

- 선택 무효화 (잦은 이벤트)
  - `MessagePersistenceService.evictRoomCachesBestEffort` — 해당 방 멤버들의 키만 `evict(userId)`.
    `TransactionSynchronization.afterCommit`에 등록해 **커밋 이후에만** 실행하고, 실패해도 로그만 남긴다.
    무효화 횟수를 `roomsCacheEvictionsCounter` 메트릭으로 집계한다.
  - `ReadReceiptService` — 읽음 처리 시 해당 사용자 키만 `evict`
- 전체 무효화 (드문 이벤트, `allEntries = true`)
  - `ChatRoomService.createDirectRoom` / `createGroupRoom` / `joinRoom` 3곳

> ⚠️ 2026-08-05 버전 카피는 "전체 무효화를 제거"라고 적고 있었다. 사실이 아니므로 수정함.
> 정확한 서술: **잦은 이벤트만 선택 무효화로 좁히고, 드문 경로는 전체 무효화로 남겼다.**

TTL은 `RedisConfig`의 `entryTtl(Duration.ofMinutes(5))` — **5분 맞음** ✅

### 버전

`build.gradle.kts` 기준 Spring Boot **3.4.3**, Java **21**.
`docker-compose` 기준 postgres **16-alpine**, redis **7-alpine**, apache/kafka **3.9.0**.

---

## 재측정 결과 (2026-08-06) ✅

현재 커밋 `9663f58`에서 환경·명령을 고정해 REST 조회 부하를 3회 반복 실행했다.

**환경** — Apple M4 · macOS 26.3.1 · Docker Desktop 29.4.3 (CPU 10 · MEM 8GB)
postgres 16-alpine · redis 7-alpine · apache/kafka 3.9.0 · Spring Boot 3.4.3 / Java 21
**단일 인스턴스**(`app-1`) · k6 v1.5.0 · ramping-vus 0→50(10s)→200(30s)→0(10s)

| run | HTTP 요청 | RPS | med | p90 | p95 | HTTP 실패 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 129,163 | 1,806.5 | 16.26ms | 98.62ms | 129.05ms | 0.00% |
| 2 | 134,338 | 1,921.4 | 14.08ms | 96.43ms | 133.20ms | 0.00% |
| 3 | 134,755 | 1,940.2 | 14.05ms | 97.36ms | 129.09ms | 0.00% |

3회 합계 **398,256 요청 중 HTTP 실패 0건**, checks 100% 통과.

### 주의 — 이 수치가 무엇이 아닌지

- **목록 조회 단독이 아니다.** `k6/rest-api-test.js`는 목록·상세·메시지 이력 3개 엔드포인트를
  호출하는 조회 계열 혼합 부하다.
- **개선율이 아니다.** 개선 전 수치를 같은 환경에서 재현할 수 없었다 —
  저장소 히스토리(44커밋)에 N+1 버전이 별도 커밋으로 남아 있지 않다.
  따라서 `+70.5%` 같은 개선 주장은 **복원하지 않는다.**
- 로컬 Docker 단일 머신 · 단일 인스턴스 · JVM warmup 없음.

### 근거 문서

`realtime-chat` 저장소 브랜치 **`perf/rest-remeasure-2026-08-06`** 에 커밋했다 (`6826d4f`).

- `docs/evidence/REST_ROOMLIST_REPEAT3_2026-08-06.md`
- `docs/evidence/rest-roomlist-20260806-run{1,2,3}-summary.json`

✅ **2026-08-06 푸시 완료.** 포트폴리오의 `Metric.source`는 이 evidence 문서를 가리킨다
(브랜치 삭제에 대비해 커밋 SHA `0d96de3`로 고정한 permalink).

> summary JSON은 k6 `--summary-export` 결과에서 `setup_data`를 제거한 것이다.
> 거기에 setup 단계가 만든 로드테스트 유저의 JWT 200개가 들어 있어 공개 저장소에 남기지 않았다.
> 측정값인 `root_group`·`metrics`는 그대로다.

### 남은 대기 항목

- WebSocket receiver matrix(전달 완전성) 재측정 — `docs/WEBSOCKET_MEASUREMENT.md` §7-1 체크리스트
- `PERF_RESULT.md` 최상단 `[!WARNING]` 배너는 WebSocket·기존 수치에 대해 여전히 유효

---

## 서비스 개요 · 구현 기능 (2026-08-06 추가)

### 무슨 서비스인가

README 첫 줄: "'화면에 보였다'와 '실제 저장됐다'를 구분하는 채팅.
DB 커밋 후에만 브로드캐스트하는 persist-before-broadcast 파이프라인".

`web/src/components/` 실제 화면: AuthScreen · ChatShell · RoomSidebar · Conversation · DeliveryBadge

사용자 흐름: 로그인 → 방 목록 → 1:1 또는 그룹 방 → 대화 → 전달 상태 배지 확인

### 구현 기능 (컨트롤러 실측)

| 컨트롤러 | 엔드포인트 |
|---|---|
| AuthController | `POST /api/auth/signup`, `POST /api/auth/login` |
| UserController | `GET /api/users/me`, `GET /api/users/search` |
| ChatRoomController | `POST /direct`, `POST /group`, `POST /{roomId}/join`, `GET /`, `GET /{roomId}` |
| MessageController | `GET /messages`, **`GET /messages/sync`**, `POST /read` |
| PresenceController | `GET /{roomId}/members/online` |
| ChatMessageController | `@MessageMapping("/chat.send")` — STOMP |
| PresenceMessageController | `@MessageMapping("/presence.heartbeat")` — STOMP |
| DemoController | `GET /instance` (응답한 인스턴스 확인), 장애 주입/카운트 |

`/messages/sync`는 재접속 시 놓친 메시지를 따라잡는 경로다.

### 데모 UI

- `web/` — React 19 · TypeScript · zustand · @stomp/stompjs · zod · TanStack Query · Vite
- origin/main에 반영됨
- **데모 스택이 다중 인스턴스다** — `docker-compose.demo.yml`:
  postgres · redis · kafka · **app-1 · app-2** · nginx gateway(`:18080`) · web(`:14173`)
  즉 한 브라우저에서 보낸 메시지가 다른 인스턴스를 거쳐 도달하는 것을 눈으로 볼 수 있다
- 실행에 `CHAT_DB_PASSWORD`·`JWT_SECRET` 환경변수 필요 (compose가 `:?` 로 강제)
- Playwright e2e — `web/e2e/chat-flow.spec.ts`:
  - public demo hides upstream identity and fixed-node WebSocket routes
  - demo is one-click, strict-headered, accessible, and keyboard operable
  - **Alice creates a room and app-1 delivers to app-2 exactly once across recovery boundaries**

---

## 교차 노드 전달 e2e — 통과한다 (2026-08-07 확인)

`web/e2e/chat-flow.spec.ts:210` "app-1 delivers to app-2 exactly once across recovery boundaries".

**깨끗한 스택에서 5회 연속 통과, 전체 스위트 2회 연속 통과.**

이 테스트가 실제로 확인하는 것
- app-1에 지정해 붙은 클라이언트가 보낸 메시지를 app-2에 지정해 붙은 구독이 **정확히 한 번** 받는다
- 같은 `clientMessageId`로 두 번 보내도 저장은 1건, 전달도 1건이다
- 수신자를 오프라인으로 만든 동안 온 메시지는 온라인 복귀 후 보충된다
- **DB 저장 실패를 주입**하면 그 시점에 전달되지 않고, 재시도로 저장된 뒤 전달된다
- **Redis 발행 실패를 주입**하면 저장은 1건인 채 전달만 지연되고, 이후 정확히 한 번 도착한다
- 새로고침 후에도 위 여섯 메시지가 각각 1건씩만 보인다

### 한동안 통과하지 않았던 이유 — 앱이 아니라 실행 환경이었다

1. **오버레이 없이 돌렸다.** 데모 게이트웨이는 `/ws/app-1`을 일부러 404로 막는다
   (공개 데모는 노드 정체를 숨겨야 하고 그걸 검증하는 테스트가 따로 있다).
   노드 지정 e2e는 `docker-compose.e2e.yml`을 겹쳐야 한다. CI는 그렇게 한다.
2. **nginx가 업스트림 IP를 시작 시 한 번만 해석한다.** 앱만 재생성하고 게이트웨이를 두면
   `/ws/app-1`이 조용히 app-2로 간다.
3. **Kafka 로그와 Postgres의 수명이 달랐다.** Postgres는 명명 볼륨이라 살아남는데 Kafka는
   아니어서, 컨테이너를 다시 만들 때마다 오프셋이 0부터 시작했다. 새 메시지의
   `(partition, offset)`이 예전 행과 겹치면 `uk_messages_kafka`에 걸려 저장이 영영
   재시도에 빠지고, 저장이 안 되니 전달도 없다. **저장소를 고쳤다** —
   `docker-compose.demo.yml`에 Kafka 명명 볼륨 추가 (realtime-chat `18e7189`).

### 기록해 둘 것

처음에 나는 원인을 "주입된 장애에서 회복하는 시간이 모자란 것 같다"고 적었다. **틀렸다.**
장애 주입은 그 단언보다 뒤에서 켜지고 단언 시간은 이미 15초였다. 오래 떠 있던 스택의
로그에는 여러 실행의 흔적이 섞이는데, 시간을 맞춰 보지 않고 눈에 띄는 문구를 원인으로 삼았다.

"원본 코드에서도 실패하니 내 변경 탓이 아니다"라는 확인도 절반만 맞았다.
양쪽 다 **같은 잘못된 방법으로** 돌렸으니 둘 다 실패한 것이었다.
비교는 방법이 옳을 때만 뜻이 있다.
