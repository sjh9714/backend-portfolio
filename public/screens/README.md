# 데모 화면 출처

`scripts/capture-screens.mjs`가 **실제로 띄운 데모 스택을 Playwright로 캡처**한 것입니다.
목업이나 생성 이미지가 아니며, 화면에 보이는 데이터는 캡처 시점에 그 자리에서 만들어진 것입니다.

| 파일 | 출처 | 화면 |
| --- | --- | --- |
| `concert-seats-*` | [concert-booking](https://github.com/sjh9714/concert-booking) `web/` | 좌석 선택 (VIP 1열 1번 선택 상태) |
| `concert-queue-*` | 〃 | 대기실 — 입장 순서 |
| `chat-conversation-*` | [realtime-chat](https://github.com/sjh9714/realtime-chat) `web/` | 보낸 쪽 대화 |
| `chat-rooms-*` | 〃 | 받은 쪽 대화 |
| `finmate-my-*` | [finmate-app](https://github.com/gaga-studio/finmate-app) | 마이 — 오늘의 예산 |
| `finmate-feed-*` | 〃 | 피드 — 또래 그룹과 금융 스토리 |

채팅 화면의 두 사용자는 캡처 스크립트가 그 자리에서 가입시킨 계정이고, 대화 내용도
스크립트가 보낸 것입니다. 실존 인물이나 실제 대화가 아닙니다.
콘서트 화면은 저장소가 제공하는 데모 계정으로 접속했고, 결제는 mock이라 실제 결제가 없습니다.
FinMate 화면의 거래·잔액·또래 정보는 전부 고정 시드로 생성된 목 데이터이며 실제 금융 정보가 아닙니다.

## 놓이는 자리

화면은 **"이게 무슨 서비스인가"를 말하는 자리에만** 씁니다.
문제 해결의 그림 자리는 `public/diagrams/`의 구조 다이어그램이 맡습니다.
『개발자를 위한 이력서 포트폴리오 완벽 가이드 2』 p.18:

> 백엔드 개발자는 '기능 화면'이 아니라 '구조와 흐름'을 보여줘야 합니다.

이 분리는 e2e(`e2e/smoke.spec.ts`)가 지킵니다 —
문제 해결의 모든 그림이 `/diagrams/`인지, 서비스 섹션의 이미지가 `/screens/`인지 검사합니다.

## 다시 만들기

```bash
# concert
cd ~/Projects/concert-booking
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d   # :4173

# chat (인스턴스 2대 + 게이트웨이)
cd ~/Projects/realtime-chat
docker compose -f docker-compose.demo.yml up -d                          # :14173

# finmate (도커 불필요 — 목 데이터로 도는 프론트다)
cd ~/Projects/finmate-app && npm run dev                                 # :5173

node scripts/capture-screens.mjs            # 전부 / concert / chat / finmate
```

두 스택 모두 `JWT_SECRET` 등의 환경변수를 요구합니다. 각 저장소의 `.env.example`을 참고하세요.
비밀값은 이 저장소에 두지 않습니다.
