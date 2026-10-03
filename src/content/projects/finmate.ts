import type { Project } from "../types";

export const finmate: Project = {
  "slug": "finmate",
  "name": "FinMate",
  "domain": "금융이 막막한 20대를 위한 첫 금융 온보딩",
  "period": "2026.04 ~ 2026.07 · 개인 보강 2026.10",
  "role": "앱·API 구현과 개인 보강",
  "team": "가가제작소 4인 팀",
  "contributions": [
    { "phase": "팀 프로젝트", "description": "앱 화면과 API 구현을 맡았습니다. 기획·리서치·데이터셋은 팀원 작업입니다." },
    { "phase": "개인 보강", "description": "평균의 모집단, 거래 삭제 후 재집계, 기존 마이·피드 더보기·기록의 API 연결을 보강했습니다." }
  ],
  "scope": "기존 다섯 탭을 유지합니다. 로컬 서버 모드의 금융 조회는 합성 원장을 사용하며, AI 코치·미션·그림·스토리는 고정 시연 콘텐츠입니다.",
  "service": {
    "what": [
      "또래의 금융 생활을 구경하고 내 소비를 돌아본 뒤 작은 미션으로 이어지는 모바일 웹 서비스입니다.",
      "마이에서 기간별 소비를 확인하고, 피드 더보기에서 같은 소득대와 비교하며, 기록에서 월별 요약과 날짜별 거래를 읽습니다."
    ],
    "flow": [
      "마이의 기간 선택",
      "소득대 비교",
      "월별 기록",
      "날짜별 거래"
    ],
    "demo": {
      "preview": {
        "href": "https://finmate-app-one.vercel.app/my",
        "label": "기존 화면 시연 보기",
        "note": "고정 데이터로 제공하는 기존 다섯 탭입니다. API를 사용하는 조회 흐름은 아래의 로컬 실행으로 확인할 수 있습니다."
      },
      "screens": [
        {
          "base": "/screens/finmate-my",
          "alt": "기존 FinMate의 물잔 예산 카드와 소비 목록, 다섯 탭이 보이는 마이 화면",
          "caption": "기존 마이 화면입니다. 캡처는 팀 시연 모드이며, 서버 모드에서는 예산과 소비 목록이 API를 읽습니다.",
          "width": 390,
          "height": 844
        },
        {
          "base": "/screens/finmate-feed",
          "alt": "FinMate의 소득 그룹과 금융 스토리 카드, 더보기 버튼이 있는 피드 화면",
          "caption": "기존 피드 화면입니다. 서버 모드의 더보기에서 월별 소득대 평균을 조회합니다. 스토리와 그룹 카드는 시연 자료입니다.",
          "width": 390,
          "height": 844
        }
      ],
      "stack": "React · TypeScript · Vite",
      "run": "API 저장소 README의 Compose 실행 후\nVITE_API_URL=http://localhost:5175 npm run dev -- --port 5175",
      "url": "localhost:5175 · API는 localhost:18081"
    }
  },
  "summary": [
    "모집단 정의와 원장·집계 결과 일치",
    "같은 정의의 네 조회 대안 비교",
    "기존 화면의 API 연결과 오류 표시"
  ],
  "features": [
    "본인 persona의 기간별 원장 조회, 소비·저축·투자·소득 구분",
    "무거래와 미적재 구분, 월 집계 재생성",
    "기존 다섯 탭·공유 카드와 팀 시연 콘텐츠 보존"
  ],
  "stack": [
    "Java 21",
    "Spring Boot",
    "PostgreSQL",
    "JPA · SQL",
    "React · TypeScript"
  ],
  "photo": {
    "base": "/images/card-finmate",
    "alt": "FinMate의 마이와 피드 시연 화면",
    "credit": "팀 앱의 실제 화면 캡처"
  },
  "links": {
    "github": "https://github.com/gaga-studio/finmate-api"
  },
  "claimBoundary": [
    "구현과 검증에 AI를 활용했습니다. 사례의 근거는 코드와 로컬 재현 기록입니다."
  ]
};
