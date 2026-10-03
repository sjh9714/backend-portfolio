import type { Project } from "../types";

export const realtimeChat: Project = {
  caseNote: "두 서버를 사용하는 로컬 채팅 데모입니다. 저장 확인, 실시간 수신, 재접속 복구를 구분해 검증했습니다.",
  "slug": "realtime-chat",
  "name": "실시간 채팅",
  "domain": "대화 저장과 재접속 복구의 보장 범위를 확인하는 채팅 데모",
  "period": "2026.02 ~ 2026.05 · 보강 2026.10",
  "role": "API·화면·검증",
  "scope": "두 앱 인스턴스·Kafka·Redis·PostgreSQL을 사용하는 채팅 데모입니다. PERSISTED는 서버 저장 완료이며 상대방의 수신 확인이 아닙니다.",
  "service": {
    "what": [
      "두 브라우저 창에서 1:1 또는 그룹 대화를 주고받을 수 있습니다.",
      "끊겼다가 돌아왔을 때 이력 조회 완료 기준 이후의 메시지를 보충합니다."
    ],
    "flow": [
      "둘러보기",
      "대화방 선택",
      "메시지 전송",
      "재접속 복구"
    ],
    "demo": {
      "screens": [
        {
          "base": "/screens/chat-conversation",
          "alt": "Relay의 대화방과 메시지 타임라인, 서버 저장 완료 배지가 보이는 화면",
          "caption": "일반 데모 화면입니다. 저장 배지는 발신자의 DB 저장 확인을 뜻합니다.",
          "width": 2560,
          "height": 1440
        }
      ],
      "stack": "React · TypeScript · STOMP",
      "run": "README의 로컬 환경값 설정 후\ndocker compose -f docker-compose.demo.yml up -d --build",
      "url": "localhost:14173 · API는 localhost:18080"
    }
  },
  "summary": [
    "접수·저장·발행·수신의 차이",
    "중간 메시지 누락 후 이력 복구",
    "중복 메시지와 방 목록 조회 검증"
  ],
  "features": [
    "1:1·그룹 대화, 사용자 검색과 방 접근 검사",
    "동일 clientMessageId의 중복 저장 방지",
    "이력 동기화 완료 기준과 실시간 최대 ID 분리"
  ],
  "stack": [
    "Java 21",
    "Spring Boot",
    "PostgreSQL",
    "Kafka",
    "Redis",
    "WebSocket · STOMP"
  ],
  "photo": {
    "base": "/images/card-chat",
    "alt": "Relay 채팅방의 실제 대화 화면",
    "credit": "로컬 데모 화면 캡처"
  },
  "links": {
    "github": "https://github.com/sjh9714/realtime-chat"
  },
  "claimBoundary": [
    "AI 지원 구현·검증입니다. 보존된 로컬 실험과 이번 회귀 검사를 실제 운영 전달률로 일반화하지 않습니다.",
    "N+1 사례의 과거 전후 결과에는 인덱스·캐시 변경도 포함됩니다. 쿼리 수정 하나의 성과로 분리하지 않습니다."
  ]
};
