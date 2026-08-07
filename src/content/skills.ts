/**
 * 기본기 60% + 강점 40% 원칙.
 * 태그 클라우드가 아니라 "무엇으로 무엇을 했는지" 한 줄씩만 적는다.
 */

export interface SkillLine {
  area: string;
  line: string;
  projectSlug: string;
}

export const fundamentals: SkillLine[] = [
  {
    area: "트랜잭션 · 락",
    line: "비관·낙관·Redis 분산 락 3전략을 같은 조건에서 실측 비교하고, 공유 카운터 row의 @Version 충돌로 낙관 성공률이 40%까지 떨어지는 지점을 규명",
    projectSlug: "concert-booking",
  },
  {
    area: "DB 인덱스",
    line: "핵심 쿼리를 EXPLAIN ANALYZE로 분석해 인덱스 5개를 설계 — Index Only Scan 확인, 이미 커버되는 인덱스는 추가하지 않음",
    projectSlug: "realtime-chat",
  },
  {
    area: "JPA · 쿼리",
    line: "채팅방 목록의 2N+1 쿼리를 JPQL 프로젝션으로 제거하고, 기능이 늘어난 뒤에도 IN 배치로 방 개수와 무관하게 쿼리 수 고정",
    projectSlug: "realtime-chat",
  },
  {
    area: "캐시",
    line: "Redis Cache Aside(TTL 5분)에서 잦은 이벤트만 선택 무효화 — 메시지 수신은 방 멤버 키만, 읽음 처리는 해당 사용자 키만, 커밋 이후 실행",
    projectSlug: "realtime-chat",
  },
  {
    area: "멱등성",
    line: "예매 요청에 Idempotency-Key를 강제해 응답이 유실돼 재요청해도 예약은 한 건 — 대기열 토큰 우회까지 시나리오로 재현",
    projectSlug: "concert-booking",
  },
];

export const strengths: SkillLine[] = [
  {
    area: "Kafka · 이벤트",
    line: "Transactional Outbox로 커밋과 발행을 분리하고, DLT 격리 + 수동 replay 복구 경로까지 통합 테스트로 고정",
    projectSlug: "concert-booking",
  },
  {
    area: "실시간 · WebSocket",
    line: "DB 커밋 이후에만 브로드캐스트하는 순서를 강제하고, 재전송 멱등성과 재연결 보충 조회로 유실 경로를 차단",
    projectSlug: "realtime-chat",
  },
  {
    area: "검증 문화",
    line: "Testcontainers 실컨테이너 통합 테스트 + k6 시나리오 반복 실행. 근거가 과거 아카이브로 표시된 수치는 내리고 현재 커밋에서 다시 측정",
    projectSlug: "concert-booking",
  },
  {
    area: "Python · FastAPI",
    line: "외부 API 5종 어댑터 계층과 개인화 ETA 엔진 — 24시간 해커톤, 코드의 91%를 작성",
    projectSlug: "eta",
  },
  {
    area: "외부 의존 · 비동기",
    line: "수 초 걸리는 외부 생성 API를 상태 기계로 감싸 하루 한 장 멱등성·3회 재시도·응답 없는 작업 회수를 처리",
    projectSlug: "finmate",
  },
  {
    area: "React · 프론트엔드",
    line: "화면의 모든 수치를 거래 원장에서 파생하는 순수 셀렉터로 통일하고, 차트는 라이브러리 없이 SVG로 직접 구현",
    projectSlug: "finmate",
  },
];
