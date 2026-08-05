import type { Project } from "../types";

export const realtimeChat: Project = {
  slug: "realtime-chat",
  name: "Realtime Chat",
  oneLiner: "보낸 메시지가 전부 도착했는지 확인하려다, 도구가 진짜 버그를 찾아냈습니다",
  period: "2026.02 – 2026.05 · 개인",
  role: "설계·구현·측정 전체",
  stage: {
    id: "stream",
    label: "STREAM",
    caption: "응답이 커밋된 뒤에야 구독자 전원에게 fan-out됩니다",
  },

  narrative: {
    hook: "채팅에서 가장 나쁜 버그는 메시지가 안 가는 게 아니라, 갔다가 사라지는 것입니다.",

    setup: [
      "메시지를 받자마자 화면에 뿌리고 저장은 뒤에서 하면 앱은 빨라 보입니다. 그런데 저장이 실패하면 그 메시지는 화면에 떠 있다가 새로고침하는 순간 없어집니다. 보낸 사람은 보냈다고 믿고, 받은 사람은 봤다고 믿는데 기록은 없습니다.",
      "이걸 막으려면 순서를 뒤집어야 합니다. DB에 커밋된 뒤에만 브로드캐스트하는 것. 대신 그만큼 느려지고, 중간 단계마다 실패 지점이 늘어납니다.",
    ],

    attempt: [
      "메시지에 SENDING → ACCEPTED → PERSISTED → FAILED 상태를 두고, ACCEPTED는 Kafka가 받았다는 뜻일 뿐 저장됐다는 뜻이 아니라는 걸 이름으로 못 박았습니다. 브로드캐스트는 DB 커밋 이후에만 일어납니다.",
      "재전송이 중복 저장되지 않도록 발신자 ID와 클라이언트 메시지 ID에 유니크 제약을 걸었고, 재연결하면 마지막으로 받은 메시지 ID 이후를 DB에서 보충 조회하게 했습니다. Redis 발행이 실패해도 Kafka 재전달로 복구됩니다.",
      "여기까지는 설계입니다. 문제는 이게 정말 작동하는지 어떻게 아느냐였습니다.",
    ],

    twist: {
      question:
        "\"연결이 잘 된다\"는 확인과 \"보낸 게 전부 도착했다\"는 확인은 다릅니다. 후자를 재려면 수신자 전원의 로그를 대조해야 하는데, 그런 도구가 없어서 직접 만들었습니다.",
      finding: [
        "한 방에 1,000명을 넣고 다섯 명이 보낸 메시지가 나머지 999명에게 전부 도착했는지 대조하는 러너를 만들었습니다. 발신 로그와 수신 로그를 메시지 ID로 조인해 빠진 것, 중복된 것, 순서가 뒤집힌 것을 계산합니다.",
        "그런데 검증받아야 할 대상이 아니라 이 도구가 먼저 버그를 잡았습니다. Redis 패턴 구독에서 수신 채널 이름을 그대로 전송 목적지로 쓰고 있었고, 그래서 메시지가 엉뚱한 방까지 브로드캐스트되고 있었습니다. 눈으로 채팅을 해서는 알아차릴 수 없는 종류의 버그였습니다.",
        "메시지 본문의 방 ID를 기준으로 목적지를 정하도록 고치고, 같은 실수가 다시 들어오지 못하게 단위 테스트로 고정했습니다.",
      ],
    },

    lesson: [
      "\"잘 되는 것 같다\"와 \"전부 도착했다\"를 가르는 것은 결국 검산 도구가 있느냐였습니다. 도구가 없으면 성공했다고 믿을 근거도 없습니다.",
      "그리고 검산 도구를 만들면 부산물이 생깁니다 — 이 프로젝트에서는 그게 실제 버그였습니다.",
    ],
  },

  bullets: [
    {
      problem: "채팅방 목록 API가 Entity 그래프를 로드한 뒤 DTO로 바꾸느라 방 N개당 2N+1회 쿼리를 실행",
      approach:
        "필요한 필드가 6개뿐이라는 점에 착안해 JPQL constructor expression 프로젝션으로 단일 쿼리화하고, Redis Cache Aside(TTL 5분)에 이벤트별 선택 무효화를 결합",
      result: "Entity 로드 없이 DB에서 DTO를 직접 반환 — 방이 몇 개든 쿼리 1회",
    },
    {
      problem: "어떤 인덱스가 실제로 쓰이는지 모른 채 추가하면 쓰지 않는 인덱스만 늘어난다",
      approach:
        "커서 페이지네이션·멱등성 체크·unread 계산·멤버 확인 4개 쿼리를 EXPLAIN ANALYZE로 실행 계획까지 확인하고 인덱스 5개를 설계",
      result:
        "멱등성·멤버 확인은 Index Only Scan 확인. 이미 커버되는 인덱스 3개는 이유를 적고 의도적으로 추가하지 않음",
    },
    {
      problem: "Redis 캐시에 LocalDateTime을 넣으면 직렬화가 깨지고, 역직렬화에는 기본 생성자가 필요하다",
      approach: "구현 중 만난 직렬화 문제를 원인과 함께 저장소 문서에 기록",
      result: "같은 문제를 다시 만났을 때 참고할 수 있는 형태로 남김",
    },
  ],

  metrics: [],

  pendingMeasurement:
    "이 프로젝트의 성능 수치는 지금 싣지 않습니다. 저장소의 측정 문서가 스스로를 \"현재 코드 기준이 아닌 과거 아카이브\"로 표시하고 있어서, 현재 커밋에서 환경·명령·raw artifact를 고정해 다시 측정한 뒤에만 게재합니다. 과거에 측정된 값이 있지만, 그 값이 지금 코드의 결과라고 말할 근거가 없습니다.",

  tags: ["websocket", "kafka", "멱등성", "전달 검증"],

  stack: [
    "Java 21",
    "Spring Boot",
    "WebSocket · STOMP",
    "Kafka",
    "Redis Pub/Sub",
    "PostgreSQL",
    "JPA",
    "Testcontainers",
    "k6",
  ],

  diagram: {
    src: "/diagrams/realtime-chat.svg",
    alt: "STOMP 전송 → Kafka → DB 커밋 → Redis Pub/Sub → 2대 인스턴스 fan-out으로 이어지는 persist-before-broadcast 메시지 파이프라인",
  },

  links: { github: "https://github.com/sjh9714/realtime-chat" },

  claimBoundary:
    "설계와 검증 과정은 저장소 코드·테스트로 확인할 수 있지만, 처리량·지연시간·전달 완전성 수치는 현재 코드 기준으로 재측정하기 전까지 주장하지 않습니다. 저장소의 LIMITATIONS 문서에 무엇을 아직 주장하지 않는지 그대로 정리해 두었습니다.",
};
