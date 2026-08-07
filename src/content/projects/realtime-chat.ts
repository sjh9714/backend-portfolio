import type { Project } from "../types";

export const realtimeChat: Project = {
  slug: "realtime-chat",
  name: "실시간 채팅 서버",
  domain: "다중 인스턴스 채팅 — 메시지 영속화 · fan-out · 전달 검증",
  period: "2026.02 – 2026.05",
  role: "설계 · 구현 · 측정 전체",
  service: {
    what: [
      "1:1과 그룹 대화를 오가는 채팅 서비스입니다. 서버는 한 대가 아니라 여러 대로 뜹니다.",
      "채팅에서 어려운 지점은 메시지를 빨리 띄우는 게 아니라, 화면에 보인 메시지가 실제로 저장됐다고 보장하는 것입니다.",
      "그래서 DB 커밋이 끝난 뒤에만 브로드캐스트하고, 끊겼다 돌아온 사용자가 놓친 구간을 따라잡을 수 있게 했습니다.",
    ],
    flow: ["로그인", "방 목록", "1:1 · 그룹 방", "대화", "전달 상태 확인"],
    demo: {
      screens: [
        {
          width: 1280,
          height: 800,
          base: "/screens/chat-conversation",
          alt: "네 사람이 있는 그룹 대화 화면. 왼쪽 목록에 대화 다섯 개가 어제·8월 5일처럼 날짜와 함께 있고, 같은 사람이 이어 보낸 메시지는 이름과 프로필을 한 번만 쓴다. 내가 보낸 메시지 옆에 전달 완료 표시가 붙어 있다",
          caption:
            "그룹 대화 — 전달 완료는 DB 커밋이 끝난 뒤에 붙는다. 화면에 떴다는 뜻이 아니다. 연속 메시지를 묶고 시각을 말풍선 옆에 두어 같은 높이에 5개 대신 8개가 들어간다",
        },
        {
          width: 1280,
          height: 800,
          base: "/screens/chat-rooms",
          alt: "1:1 대화 화면. 왼쪽 목록에서 다른 대화로 옮겨 온 상태이고 각 대화의 마지막 메시지와 날짜가 함께 보인다",
          caption:
            "대화 목록 — 1:1과 그룹이 섞여 있고 마지막 메시지와 날짜로 정렬된다. 데모 스택은 인스턴스가 2대라 메시지는 다른 노드를 거쳐 도달한다",
        },
      ],
      stack: "React 19 · TypeScript · zustand · STOMP · Playwright e2e",
      run: "docker compose -f docker-compose.demo.yml up",
      url: "localhost:14173",
      provenBy: [
        "데모 스택이 인스턴스 2대와 게이트웨이로 구성돼 있어, 한쪽에서 보낸 메시지가 다른 인스턴스를 거쳐 도달한다",
        "인스턴스를 지정해 붙는 e2e가 app-1이 받은 메시지를 app-2가 중복 없이 정확히 한 번 전달하는 것을 확인한다 — DB 저장 실패와 Redis 발행 실패를 일부러 주입한 뒤 복구까지, 재접속 경계를 포함해서",
      ],
    },
  },
  summary: [
    "채팅방 목록 조회의 2N+1 쿼리를 JPQL 프로젝션으로 전환하고 이후 추가 기능도 IN 배치로 처리해 방 50개 기준 101회 → 3회 고정",
    "커서 페이지네이션·멱등성·unread 등 핵심 쿼리를 EXPLAIN ANALYZE로 분석해 인덱스 5개 설계, 커버되는 3개는 근거를 적고 미추가",
    "현재 커밋에서 200 VU 조회 부하를 3회 반복 재측정해 RPS 1,806–1,940 · p95 129–133ms · 39.8만 요청 중 HTTP 실패 0건 확인",
    "DB 커밋 이후에만 브로드캐스트하는 순서를 강제해 화면에 보였다가 사라지는 메시지를 구조적으로 차단",
    "발신자 ID와 클라이언트 메시지 ID 유니크 제약으로 재전송 멱등성 확보, 재연결 시 마지막 수신 ID 기준 보충 조회 구현",
    "Redis 패턴 구독에서 수신 채널명을 목적지로 쓰던 오브로드캐스트를 payload 기준으로 수정하고 단위 테스트로 고정",
    "50명이 한 방에 있고 접속이 두 인스턴스에 나뉜 상태에서 전달 완전성을 3회 반복 측정 — 기대 4,900건 전부 도착, 누락·중복·순서 위반 0건",
  ],
  features: [
    "JWT 인증(가입·로그인), 내 정보 조회와 사용자 검색",
    "1:1·그룹 방 생성과 참여, 참여 중인 방 목록·상세 조회",
    "커서 기반 메시지 조회와 읽음 처리, 재접속 시 놓친 구간 보충 조회",
    "STOMP 메시지 발행과 heartbeat 기반 접속자 표시",
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
    base: "/images/chat",
    alt: "밤 발코니에서 휴대폰으로 메시지를 보내는 사람, 뒤로 도시 불빛",
    credit: "Pexels",
  },
  links: { github: "https://github.com/sjh9714/realtime-chat" },
  claimBoundary:
    "조회 부하 수치는 2026-08-06에 현재 커밋(9663f58)에서 다시 측정한 값입니다. Apple M4 단일 머신의 로컬 Docker에서 애플리케이션·PostgreSQL·Redis·Kafka를 함께 실행했고, 단일 인스턴스 기준이며 JVM warmup을 두지 않았습니다. 운영 성능이나 SLO 주장이 아닙니다. WebSocket 전달 완전성(receiver matrix)은 아직 재측정하지 않아 수치를 싣지 않습니다.",
  pendingMeasurement:
    "개선 전후를 비교한 개선율은 싣지 않았습니다. 이전 구현을 지금 커밋에서 재현할 수 없어 같은 조건에서 잴 수 없었고, 재현되지 않는 비교는 근거가 되지 못한다고 판단했습니다.",
};
