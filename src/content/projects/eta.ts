import type { Project } from "../types";

export const eta: Project = {
  "slug": "eta",
  "name": "My ETA",
  "domain": "이동 조건을 고려하는 교통약자 길찾기 프로토타입",
  "period": "2026 해커톤 · 개인 보강 2026.10",
  "role": "프론트·백엔드 구현, 개인화 엔진 공동 작업",
  "team": "7인 팀. 개발 4명, 기획·리서치 3명.",
  "scope": "Python·FastAPI 팀 프로젝트입니다. DEMO와 LIVE 공급자를 분리하고 정보 없음·시설 존재·운행 확인을 구분했습니다. 실제 경로의 접근성이나 도착시간 정확도는 검증하지 않았습니다.",
  "service": {
    "what": [
      "이동 유형과 보조기구에 맞춰 경로와 주의 정보를 보여 주는 해커톤 프로토타입입니다.",
      "개인 보강은 외부 정보의 부분 실패, 합성 데이터의 경계, 동일 원본 조회 공유에 집중했습니다."
    ],
    "flow": [
      "데모 시작",
      "이동 프로필",
      "목적지 선택",
      "경로·주의 정보"
    ],
    "demo": {
      "screens": [
        {
          "base": "/screens/eta-routes",
          "alt": "My ETA의 합성 경로와 접근성 주의 정보, DEMO 안내가 있는 모바일 화면",
          "caption": "합성 경로를 표시하는 DEMO 화면입니다. 실제 길찾기 결과나 현장 이용 가능성을 입증하는 자료가 아닙니다.",
          "width": 1082,
          "height": 2202
        }
      ],
      "stack": "React · TypeScript · 외부 지도 SDK",
      "run": "docker compose -f compose.demo.yml up -d --build\n프론트 실행은 저장소 README 참고",
      "url": "API localhost:18083 · 프론트 localhost:4178"
    }
  },
  "summary": [
    "DEMO·LIVE 공급자 분리",
    "시설 존재와 운행 여부 구분",
    "캐시 초기 동시 조회의 원본 요청 공유"
  ],
  "features": [
    "이동 프로필에 따른 경로·주의 정보",
    "외부 공급자 타임아웃과 부분 실패의 UNKNOWN 응답",
    "출처·목록 조회 시각·운행 관측 시각 구분"
  ],
  "stack": [
    "Python 3.12",
    "FastAPI",
    "HTTPX",
    "asyncio",
    "Pydantic",
    "pytest"
  ],
  "photo": {
    "base": "/images/card-eta",
    "alt": "My ETA의 합성 경로 안내 화면",
    "credit": "데모 화면 캡처"
  },
  "links": {
    "github": "https://github.com/tech4good-2026/eta"
  },
  "claimBoundary": [
    "팀의 기획·리서치와 공동 구현 범위를 구분합니다. 개인 보강의 구현·검증에는 AI를 활용했습니다.",
    "실제 지도 SDK·공공데이터의 정확도와 현장 경로는 미검증입니다. 외부 HTTP 응답을 대체한 테스트와 실제 외부 API 실행을 구분합니다."
  ]
};
