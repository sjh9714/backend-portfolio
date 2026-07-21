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
    line: "채팅방 목록의 2N+1 쿼리를 JPQL 프로젝션 단일 쿼리로 — RPS +70.5%의 주 기여 요인",
    projectSlug: "realtime-chat",
  },
  {
    area: "캐시",
    line: "Redis Cache Aside에 이벤트별 선택 무효화(방 멤버만·해당 유저만)를 결합해 전체 무효화를 제거",
    projectSlug: "realtime-chat",
  },
  {
    area: "멱등성",
    line: "예매·결제·사용량 계량에 Idempotency-Key를 강제 — replay는 같은 결과, 같은 키 다른 본문은 conflict",
    projectSlug: "ai-usage-billing-gateway",
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
    line: "persist-before-broadcast 파이프라인으로 2대 인스턴스 · 1,000명 수신 검증에서 유실 0건",
    projectSlug: "realtime-chat",
  },
  {
    area: "검증 문화",
    line: "Testcontainers 실컨테이너 통합 테스트 + k6 시나리오 반복 실행 — 수치 없는 주장은 하지 않음",
    projectSlug: "concert-booking",
  },
  {
    area: "Python · FastAPI",
    line: "외부 API 5종 어댑터 계층과 개인화 ETA 엔진 — 해커톤 팀 프로젝트 백엔드 전담",
    projectSlug: "eta",
  },
];
