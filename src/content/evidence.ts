import type { Metric } from "./types";

export const sourceRevisions = {
  "finmate": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f",
  "concert": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86",
  "chat": "https://github.com/sjh9714/realtime-chat/blob/1a55c7687a4f631e53be0b9cb202745c5f019cd8",
  "eta": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d"
};

export const evidence = {
  "finmateAccuracy": {
    "kind": "observation",
    "label": "무거래자를 포함한 평균 검증",
    "value": "(100원 + 0원) ÷ 2 = 50원",
    "evidence": "verified",
    "source": {
      "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/src/test/java/com/gagastudio/finmate/metrics/PeerAccuracyIntegrationTest.java",
      "label": "평균·자료 없음·재집계 회귀 테스트"
    },
    "condition": "동일 소득대 두 사람의 월 자료가 모두 준비된 DB 테스트. 자료가 없는 사람은 모집단에서 제외합니다."
  },
  "finmateQueries": {
    "kind": "comparison",
    "label": "동일 결과의 조회 대안별 p50",
    "values": [
      {
        "label": "원장 직접 집계",
        "value": "68.34 ms"
      },
      {
        "label": "사람별 집계로 재작성",
        "value": "37.00 ms"
      },
      {
        "label": "재작성 + 커버링 인덱스",
        "value": "9.82 ms"
      },
      {
        "label": "사람×월 사전 집계",
        "value": "3.53 ms"
      }
    ],
    "evidence": "measured",
    "source": {
      "href": "https://github.com/gaga-studio/finmate-api/blob/5af6db3115b8004cddc459ccb8859198eb57a00f/docs/PERF_RESULT.md",
      "label": "측정 조건과 원표본"
    },
    "condition": "2026-10-02 로컬 PostgreSQL 16. 합성 2,000명·432,000행. JDBC 호출부터 결과 수신까지, 단일 클라이언트·warm cache·대안별 워밍업 5회·측정 40회. HTTP 응답시간이 아닙니다."
  },
  "seatOwnership": {
    "kind": "observation",
    "label": "과거 취소의 재처리 결과",
    "value": "B의 선점과 소유권 유지",
    "evidence": "verified",
    "source": {
      "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/src/test/java/com/concert/booking/integration/ServiceBookingIntegrationTest.java",
      "label": "소유권·상태 전이 통합 테스트"
    },
    "condition": "A 취소, B 재예약, A 반환 재처리 순서의 PostgreSQL 통합 테스트. 반환된 좌석 0개와 B의 소유 예약 ID를 검사합니다."
  },
  "seatConcurrency": {
    "kind": "observation",
    "label": "동시 요청의 성공 수",
    "value": "같은 좌석 1/8 · 다른 좌석 8/8",
    "evidence": "verified",
    "source": {
      "href": "https://github.com/sjh9714/concert-booking/blob/b2dea4b7fa7f9c2a512e084c05f03bc9f60e5d86/docs/evidence/2026-10-02/service-holds/summary.json",
      "label": "동시 요청 원표본과 조건"
    },
    "condition": "요청 8개, PostgreSQL Testcontainers, Java 서비스 호출. 워밍업 없이 조건별 1회. HTTP 처리량이나 운영 성공률을 측정한 결과가 아닙니다."
  },
  "chatRecovery": {
    "kind": "observation",
    "label": "중간 메시지 누락 후 복구",
    "value": "놓친 메시지까지 한 번씩 표시",
    "evidence": "verified",
    "source": {
      "href": "https://github.com/sjh9714/realtime-chat/blob/1a55c7687a4f631e53be0b9cb202745c5f019cd8/web/e2e/chat-flow.spec.ts",
      "label": "프레임 누락·재접속 E2E"
    },
    "condition": "로컬 두 노드 E2E. 실제 WebSocket 프레임 하나를 누락시킨 뒤 더 큰 ID를 수신하고 재접속했습니다. 서버 이력과 화면을 대조합니다."
  },
  "etaCache": {
    "kind": "before-after",
    "label": "빈 캐시의 원본 호출 수",
    "before": "8회",
    "after": "1회",
    "evidence": "verified",
    "source": {
      "href": "https://github.com/tech4good-2026/eta/blob/eb4d34575187319b82b930571cbd219d30b1862d/docs/evidence/2026-10-02/source-cache.json",
      "label": "원본 호출 수·실험 조건"
    },
    "condition": "같은 원본에 동시 요청 8개. 실제 SeoulDataClient의 HTTP 응답만 테스트 대역으로 교체한 로컬 관측. 외부 API 응답시간 측정은 아닙니다."
  }
} satisfies Record<string, Metric>;
