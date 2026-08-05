import type { Project } from "../types";

export const realtimeChat: Project = {
  slug: "realtime-chat",
  name: "실시간 채팅 서버",
  domain: "다중 인스턴스 채팅 — 메시지 영속화 · fan-out · 전달 검증",
  period: "2026.02 – 2026.05",
  role: "설계 · 구현 · 측정 전체",
  summary: [
    "채팅방 목록 조회의 2N+1 쿼리를 JPQL 프로젝션 단일 쿼리로 전환해 방 50개 기준 101회 → 1회로 고정",
    "커서 페이지네이션·멱등성·unread 등 핵심 쿼리를 EXPLAIN ANALYZE로 분석해 인덱스 5개 설계, 커버되는 3개는 근거를 적고 미추가",
    "DB 커밋 이후에만 브로드캐스트하는 순서를 강제해 화면에 보였다가 사라지는 메시지를 구조적으로 차단",
    "발신자 ID와 클라이언트 메시지 ID 유니크 제약으로 재전송 멱등성 확보, 재연결 시 마지막 수신 ID 기준 보충 조회 구현",
    "Redis 패턴 구독에서 수신 채널명을 목적지로 쓰던 오브로드캐스트를 payload 기준으로 수정하고 단위 테스트로 고정",
  ],
  stack: [
    "Java 21",
    "Spring Boot 3.4.3",
    "WebSocket · STOMP",
    "Apache Kafka 3.9.0 (KRaft)",
    "Redis 7 Pub/Sub",
    "PostgreSQL 16",
    "JPA",
    "Testcontainers",
    "k6 v1.5.0",
  ],
  photo: {
    base: "/photos/chat",
    alt: "야간 도시의 불빛이 연결된 것처럼 보이는 장면",
    credit: "Pexels",
  },
  links: { github: "https://github.com/sjh9714/realtime-chat" },
  claimBoundary:
    "설계와 구현은 저장소 코드·테스트로 확인할 수 있지만, 처리량·지연시간·전달 완전성 수치는 현재 커밋 기준으로 재측정하기 전까지 주장하지 않습니다. 저장소의 LIMITATIONS 문서에 아직 주장하지 않는 항목을 그대로 정리해 두었습니다.",
  pendingMeasurement:
    "이 프로젝트의 성능 수치는 싣지 않았습니다. 저장소의 측정 문서가 스스로를 \"현재 코드 기준이 아닌 과거 아카이브\"로 표시하고 있어, 현재 커밋에서 환경·명령·raw artifact를 고정해 다시 측정한 뒤에만 게재합니다. 위 요약의 쿼리 수는 부하 측정이 아니라 코드로 확인되는 구조적 카운트입니다.",
};
