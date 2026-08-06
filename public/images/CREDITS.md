# 갤러리 이미지 출처

네 장 모두 [Pexels](https://www.pexels.com/license/)에서 받은 **실제 촬영 사진**입니다.
AI로 생성한 이미지가 아닙니다.

Pexels 라이선스는 상업적 사용과 수정을 허용하며 출처 표기를 요구하지 않지만,
확인 가능하도록 남겨 둡니다.

| 파일 | 장면 | 원본 |
| --- | --- | --- |
| `concert-*` | 무대 조명을 배경으로 손을 든 콘서트 관객 실루엣 | [Pexels #21790480](https://www.pexels.com/photo/21790480/) |
| `billing-*` | 카드 결제가 오가는 고객과 계산대의 손 | [Pexels #3907161](https://www.pexels.com/photo/3907161/) |
| `chat-*` | 밤 발코니에서 메시지를 보내는 실루엣, 뒤로 도시 불빛 | [Pexels #18694904](https://www.pexels.com/photo/18694904/) |
| `eta-*` | 높은 곳에서 내려다본 횡단보도를 건너는 보행자들 | [Pexels #13534777](https://www.pexels.com/photo/13534777/) |

## 역할

이미지는 **도메인 분위기만** 담당합니다. 성능 수치·아키텍처 등 주장의 근거가 되는 그림은
`public/diagrams/`의 구조 다이어그램이며 역할이 다릅니다.

## 생성

`node scripts/fetch-photos.mjs` — 5:4로 잘라 흑백·대비 보정을 구운 뒤
640/1280/1920 폭의 AVIF·WebP로 저장합니다.
카드 hover 틴트 색은 흑백을 굽기 전 원본에서 뽑습니다(흑백에는 채도가 없어 나중엔 못 뽑습니다).
