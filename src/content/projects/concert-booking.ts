import type { Project } from "../types";

export const concertBooking: Project = {
  "slug": "concert-booking",
  "name": "콘서트 예매",
  "domain": "공연 선택부터 좌석 선점·테스트 결제·예매 확인까지",
  "period": "2026.02 ~ 2026.05 · 재구성 2026.10",
  "role": "API·화면·검증",
  "scope": "PostgreSQL을 사용하는 기본 예약 서비스입니다. 좌석 선점, 테스트 결제, 결제 전 취소와 미결제 만료를 제공합니다. 실제 PG와 결제 후 환불은 포함하지 않습니다.",
  "service": {
    "what": [
      "공연과 회차를 고르고 좌석을 선점한 뒤 테스트 결제를 마치는 예매 데모입니다.",
      "선점한 좌석은 결제 전 취소하거나 만료되면 다시 선택할 수 있습니다."
    ],
    "flow": [
      "공연 선택",
      "좌석 선점",
      "테스트 결제",
      "예매 확인"
    ],
    "demo": {
      "screens": [
        {
          "base": "/screens/concert-catalog",
          "alt": "TICKETLINE의 테스트 결제 후 예매 확정과 좌석 정보를 보여 주는 화면",
          "caption": "테스트 결제 후 예매 확정 화면입니다. 실제 PG 결제가 아닙니다.",
          "width": 1280,
          "height": 1107
        },
        {
          "base": "/screens/concert-seats",
          "alt": "콘서트 회차의 구역별 좌석 배치와 선택한 좌석 가격을 보여 주는 화면",
          "caption": "기존 좌석 선택 화면입니다. 선택한 좌석 전체가 함께 선점되거나 모두 실패합니다.",
          "width": 2560,
          "height": 1800
        }
      ],
      "stack": "React · TypeScript · Vite",
      "run": "python3 scripts/init-service-env.py\ndocker compose --env-file .env.service -f compose.service.yml up -d --build",
      "url": "localhost:4176 · API는 localhost:18082"
    }
  },
  "summary": [
    "현재 좌석 소유권 확인",
    "예약 종료와 좌석 반환을 같은 트랜잭션으로 처리",
    "중복 요청과 결제·만료 경쟁 검증"
  ],
  "features": [
    "JWT 인증과 본인 예약 접근 검사",
    "예약·결제 중복 요청 키와 동일 응답 재사용",
    "선점 만료, 취소 후 재예약, 잔여석 조회"
  ],
  "stack": [
    "Java 21",
    "Spring Boot",
    "PostgreSQL",
    "Spring Data JPA",
    "Testcontainers"
  ],
  "photo": {
    "base": "/images/card-concert",
    "alt": "TICKETLINE 테스트 결제 후 예매 확정 화면",
    "credit": "로컬 데모의 실제 화면 캡처"
  },
  "links": {
    "github": "https://github.com/sjh9714/concert-booking"
  },
  "claimBoundary": [
    "AI를 활용해 구현·검증한 개인 프로젝트입니다. 로컬 시연은 service 프로필을 사용하고, Redis·Kafka·세 가지 락 비교는 별도 실험 모드에 보존했습니다."
  ]
};
