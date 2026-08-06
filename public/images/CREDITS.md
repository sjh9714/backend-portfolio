# 갤러리 이미지 출처

**이 이미지들은 AI로 생성한 것입니다.** 촬영물이 아닙니다.

- 모델: `fal-ai/flux-pro/v1.1-ultra` (fal.ai)
- 생성: `node scripts/generate-images.mjs`
- 후처리: 5:4로 잘라 640/1280/1920 폭의 AVIF·WebP 생성 (sharp)

## 역할

이미지는 **도메인의 분위기만** 담당합니다. 성능 수치·아키텍처 등 주장의 근거가 되는 그림은
`public/diagrams/`의 구조 다이어그램이며 역할이 다릅니다.
그래서 프롬프트에서 문자·수치·UI를 명시적으로 배제했습니다 — 그럴듯한 대시보드나
가짜 지표가 들어가면 근거와 분위기의 경계가 무너집니다.

## 공통 아트 디렉션

4장이 한 세트로 읽히도록 재질·조명·팔레트·카메라를 고정했습니다.

```
abstract 3d render, matte ceramic and brushed aluminium surfaces, single soft key light from upper left, long soft shadows, seamless off-white studio backdrop, muted neutral palette with one electric blue accent, shallow depth of field, centered composition, generous negative space, minimal, editorial product photography aesthetic, no text, no letters, no numbers, no user interface, no charts
```

## 이미지별 프롬프트

### `billing` — ai-usage-billing-gateway

사용량 과금 — 덮어쓰지 않고 쌓이는 원장, 환불은 반대 방향 엔트리

- seed: `202`
- 대표색: `#282828`

```
a precise stack of thin flat plates layered in perfect alignment, one single plate slid outward in the opposite direction, casting its own shadow
```

### `chat` — realtime-chat

실시간 채팅 — 커밋된 뒤 한 점에서 전원에게 퍼지는 fan-out

- seed: `303`
- 대표색: `#2c2c2c`

```
concentric ripple rings expanding outward from a single origin point across a smooth matte surface, the innermost ring lit electric blue
```

### `eta` — eta

배리어프리 길찾기 — 이탈하면 갈라졌다 다시 합류하는 경로

- seed: `404`
- 대표색: `#303030`

```
a single smooth ribbon path splitting into two diverging routes and merging back into one, resting on a subtle stepped topographic surface
```
