import type { Project } from "../types";

export const eta: Project = {
  slug: "eta",
  name: "배리어프리 길찾기 (My ETA)",
  domain: "교통약자 대상 경로 안내 — 개인화 ETA · 접근성 데이터 통합",
  period: "2026 · 해커톤",
  role: "백엔드 전담 (FastAPI)",
  team: "7명 — 개발 4명(본인 백엔드 전담) / 기획·리서치 3명",
  summary: [
    "표준 보행속도 기준 ETA가 교통약자에게 항상 틀리는 문제를 이동 유형·보조기구 프로필과 안내 중 수집한 유효 속도 표본 기반 보정 엔진으로 해결",
    "확인되지 않은 접근성 정보를 이용 가능으로 단정하지 않도록 UNKNOWN을 API 계약의 일급 상태로 정의",
    "TMAP 경로·서울 버스·지하철 실시간 도착·엘리베이터·장소 검색 등 외부 API 5종을 provider 어댑터 계층으로 통합",
    "경로 이탈과 대중교통 놓침을 감지해 현재 위치를 새 출발점으로 경로와 ETA를 재계산하는 흐름 구현",
    "원본 위치 좌표를 안내 중 계산에만 사용하고 영구 저장하지 않도록 처리 경로 설계",
  ],
  stack: [
    "Python 3.12",
    "FastAPI",
    "Pydantic",
    "HTTPX",
    "TMAP API",
    "서울 공공데이터",
    "Kakao Local",
    "pytest",
    "OpenAPI 3.1",
  ],
  photo: {
    base: "/images/eta",
    alt: "높은 곳에서 내려다본 횡단보도를 건너는 보행자들",
    credit: "Pexels",
  },
  links: { github: "https://github.com/tech4good-2026/eta" },
  claimBoundary:
    "하나금융그룹 × SK텔레콤 Tech4Good 2026 해커톤의 팀 프로젝트입니다. 백엔드(경로 엔진·외부 데이터 연동·개인화 API)를 전담했고, 기획과 프론트엔드는 팀원과의 협업 결과입니다. 성능은 측정하지 않았으므로 수치를 싣지 않습니다. 서비스 품질 보장 범위는 서울시입니다.",
};
