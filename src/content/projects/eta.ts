import type { Project } from "../types";

export const eta: Project = {
  "slug": "eta",
  "name": "My ETA",
  "domain": "이동 조건을 고려하는 교통약자 길찾기 프로토타입",
  "period": "2026 해커톤 · 개인 보강 2026.10",
  "role": "프론트·백엔드 구현, 개인화 엔진 공동 작업",
  "team": "7인 팀. 개발 4명, 기획·리서치 3명.",
  "contributions": [
    { "phase": "팀 프로젝트", "description": "프론트·백엔드 구현을 맡고 개인화 엔진을 공동으로 작업했습니다. 호출택시 추천과 보도 데이터 공급자는 팀원 구현입니다." },
    { "phase": "개인 보강", "description": "DEMO·LIVE 공급자 분리, 시설 존재와 운행 상태의 구분, 같은 외부 원본의 동시 조회 공유를 보강했습니다." }
  ],
  "scope": "DEMO는 합성 경로를 사용하고, LIVE는 확인하지 못한 운행 정보를 UNKNOWN으로 응답합니다. 시설 목록 조회와 현재 운행 확인을 구분합니다.",
  "service": {
    "what": [
      "이동 유형과 보조기구에 맞춰 경로와 주의 정보를 보여 주는 해커톤 프로토타입입니다.",
      "이동 프로필을 설정하고 출발·도착지의 경로를 비교하며, 구간별로 이용 전에 확인할 정보를 살펴봅니다."
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
    "개인 보강의 구현·검증에는 AI를 활용했습니다. 외부 HTTP 응답을 대체한 테스트의 조건은 위 결과와 함께 표시했습니다."
  ]
};
