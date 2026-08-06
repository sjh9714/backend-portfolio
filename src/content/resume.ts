/**
 * 이력서 데이터.
 *
 * 자료(『개발자를 위한 이력서 포트폴리오 완벽 가이드 2』) 1-4장 규칙을 따른다:
 * - 프로젝트 단위로 쓰고, 최상단에 "문제 + 해결 + 결과 + 도메인"을 한 줄씩 3~4줄
 * - 그 아래 단순 구현 항목을 2~3줄
 * - 일정은 월 단위, 기술 스택은 버전 명시, 참여 인력은 포지션별
 *
 * NOTE: 자격증은 아직 받지 않았다. 생기면 certifications 섹션으로 추가할 것.
 * 학력의 졸업(예정) 시점도 아직 확인하지 못해 입학만 적었다 — docs/facts/CONFIRM.md 참조.
 *
 * realtime-chat의 RPS·p95·EXPLAIN 수치는 저장소 측정 문서가 스스로를 부인하므로 싣지 않는다.
 */

export interface ResumeProject {
  name: string;
  period: string;
  headcount: string;
  stack: string;
  summary: string;
  bullets: string[];
}

export const resume = {
  title: "성진혁 이력서",
  intro: [
    "동시성 제어와 데이터 정합성을 직접 재현하고 측정해 온 신입 백엔드 개발자입니다.",
    "좌석 예약 시스템에서 락 전략 3종을 같은 조건으로 실측 비교해 중복 판매 0건을 검증했고, 혼합 부하에서 Redis 재고 선차감으로 쓰기 p95를 37ms에서 6ms로 줄였습니다.",
    "Testcontainers 통합 테스트와 k6 부하 테스트로 주장에 근거를 붙이고, 측정하지 못한 항목은 측정하지 못했다고 문서에 남기는 방식으로 일합니다.",
  ],
  projects: [
    {
      name: "좌석 예약 시스템 — 대기열·락 전략·이벤트 전달",
      period: "2026.02 – 2026.05",
      headcount: "개인 프로젝트",
      stack:
        "Java 21, Spring Boot 3.4.1, PostgreSQL 16, Redis 7(Redisson 3.40.2), Apache Kafka(cp 7.6.0), JPA, Flyway, Testcontainers, k6 v1.5.0",
      summary: "락 전략 3종을 같은 조건에서 실측 비교하고 이벤트 복구 경로까지 검증한 예약 백엔드",
      bullets: [
        "동일 좌석 100명 동시 예매 경합에서 비관·낙관·Redis 분산 락 3전략을 같은 조건으로 비교해 중복 판매 0건 검증, p95 106–215ms 실측",
        "서로 다른 좌석인데도 낙관적 락 성공률이 40%로 하락한 원인을 잔여석 공유 row의 버전 충돌로 규명하고 retry 한도 의존성까지 문서화",
        "혼합 부하에서 소진된 좌석 요청이 DB 커넥션을 잡지 않도록 Redis 재고를 선차감해 쓰기 p95 37ms → 6ms, 총 RPS 969 → 1,005",
        "결제·만료 race, 멱등 replay, 대기열 토큰 우회를 k6 시나리오로 재현해 3전략 × 3회 반복 체크 594/594 통과, 중복 결제 0건",
        "Transactional Outbox로 커밋과 발행을 분리하고 Kafka DLT 수동 replay 복구 경로를 Testcontainers 통합 테스트로 고정",
      ],
    },
    {
      name: "실시간 채팅 서버 — 메시지 영속화·fan-out",
      period: "2026.02 – 2026.05",
      headcount: "개인 프로젝트",
      stack:
        "Java 21, Spring Boot 3.4.3, WebSocket(STOMP), Apache Kafka 3.9.0(KRaft), Redis 7 Pub/Sub, PostgreSQL 16, JPA, Testcontainers, k6 v1.5.0",
      summary: "DB 커밋 이후에만 브로드캐스트하는 메시지 파이프라인과 쿼리·인덱스 최적화",
      bullets: [
        "채팅방 목록 조회의 2N+1 쿼리를 JPQL 프로젝션으로 제거하고 이후 추가 기능도 IN 배치로 처리해 방 50개 기준 101회 → 3회 고정",
        "커서 페이지네이션·멱등성 체크·unread 계산 등 핵심 쿼리 4개를 EXPLAIN ANALYZE로 분석해 인덱스 5개 설계, 커버되는 3개는 근거를 적고 미추가",
        "현재 커밋에서 200 VU 조회 부하를 3회 반복 측정해 RPS 1,806–1,940 · p95 129–133ms, 39.8만 요청 중 HTTP 실패 0건 확인",
        "DB 커밋 이후에만 브로드캐스트하도록 순서를 강제하고 발신자 ID + 클라이언트 메시지 ID 유니크 제약으로 재전송 멱등성 확보",
        "Redis 패턴 구독에서 수신 채널명을 전송 목적지로 쓰던 오브로드캐스트를 payload 기준으로 수정하고 단위 테스트로 고정",
        "Redis Cache Aside(TTL 5분)에서 잦은 이벤트만 선택 무효화하고 커밋 이후에 실행 — 메시지 수신은 방 멤버 키만, 읽음 처리는 해당 사용자 키만 제거",
      ],
    },
    {
      name: "FinMate — 청년 금융 온보딩 서비스",
      period: "2026.04 – 2026.07 (하나금융×금감원 청년 금융인재)",
      headcount: "4명 — 기획 2 / 풀스택 1(본인) / 데이터 1",
      stack:
        "Java 21, Spring Boot 3.5, PostgreSQL 16, Flyway, Testcontainers, fal.ai / React 19, TypeScript strict, Vite, Tailwind CSS v4, Motion v12",
      summary: "또래 비교와 미션으로 20대의 첫 금융 행동을 만드는 모바일 서비스",
      bullets: [
        "또래 비교가 매 요청 원장 88만 행을 다시 세던 것을 사람×월 사전 집계로 접어 p50 32.5ms → 0.72ms",
        "고치기 전에 먼저 측정해 개인 화면은 p95 0.96ms로 문제가 아님을 확인하고, 인덱스(50MB·24.0ms) 대신 사전 집계(1.9MB) 선택",
        "하루의 거래에서 주인공을 판정해 그림을 만드는 비동기 파이프라인 구현 — 하루 한 장 멱등성, 3회 재시도, 응답 없는 작업 회수",
        "합성 데이터셋 2,000명 887,002행을 JDBC 배치로 적재(34,490행/초)하고 원장·프로필 정합성을 통합 테스트로 고정",
        "백엔드 없이 시연해야 하는 제약에서 고정 날짜·고정 시드로 화면 전체를 결정적으로 만들어 촬영 재현성 확보",
        "일간·주간·월간 전환 시 화면 전체가 일관되게 바뀌도록 지표를 전부 거래 원장에서 파생하는 순수 셀렉터로 통일",
        "차트 라이브러리 없이 SVG와 스프링 모션으로 물잔·링 게이지·라인차트를 구현해 차트 의존성 0개",
        "공유 카드를 layoutId 전환으로 9:16 확대하고 html-to-image로 1080×1920 PNG 저장·Web Share 연동",
        "프론트와 다른 제품 정의로 설계돼 연결된 적 없던 백엔드를 앱의 데이터 계층을 계약으로 삼아 재구현",
      ],
    },
    {
      name: "배리어프리 길찾기 My ETA — 교통약자 경로 안내",
      period: "2026 (하나금융×SKT Tech4Good 해커톤)",
      headcount: "개발 4명(본인 BE 전담) / 기획·리서치 3명",
      stack:
        "Python 3.12, FastAPI, Pydantic, HTTPX, TMAP·서울 공공데이터·Kakao Local API, pytest, OpenAPI 3.1",
      summary: "교통약자의 실제 보행속도로 도착시간을 다시 계산하는 개인화 경로 API",
      bullets: [
        "표준 보행속도 기준 ETA가 교통약자에게 항상 틀리는 문제를 이동 유형·보조기구 프로필과 실측 속도 표본 기반 보정 엔진으로 해결",
        "확인되지 않은 접근성 정보를 이용 가능으로 단정하지 않도록 UNKNOWN을 API 계약의 일급 상태로 정의",
        "경로 이탈·대중교통 놓침을 감지해 현재 위치를 새 출발점으로 경로와 ETA를 재계산하는 흐름 구현",
        "TMAP 경로·서울 버스/지하철 실시간·엘리베이터 등 외부 API 5종을 provider 어댑터 계층으로 통합",
        "유효하지 않은 속도 표본을 걸러 개인화 ETA에 반영되지 않게 하고, 원본 위치 좌표는 안내 중 계산에만 사용해 영구 저장하지 않도록 설계",
      ],
    },
  ] satisfies ResumeProject[],
  activities: [
    {
      name: "하나금융그룹 × SK텔레콤 Tech4Good 2026",
      detail: "해커톤 — 교통약자 내비게이션 My ETA 백엔드 전담 (15조 피프틴피프틴)",
    },
    {
      name: "하나금융그룹 청년 금융인재 양성 과정 (하나 파워온)",
      detail: "금융·데이터 교육 과정 수료 활동",
    },
  ],
  education: [
    {
      school: "가톨릭대학교 성심교정",
      major: "컴퓨터정보공학부",
      // 졸업(예정) 시점을 확인하지 못했다. 모르는 것을 적는 대신 아는 것만 적는다.
      period: "2021.03 입학",
    },
  ],
  pdfPath: "/resume-sung-jinhyuk.pdf",
} as const;
