export const profile = {
  name: "성진혁",
  role: "신입 백엔드 개발자",
  tagline: "Java · Spring",
  /** 히어로 헤드라인 — 10초 스캔의 핵심 문장 */
  headline: "\"잘 돌아간다\"를 수치와 테스트로 증명합니다",
  lead: "동시성 제어, 데이터 정합성, 실시간 전달 — 백엔드가 조용히 깨지는 지점을 직접 재현하고, 막고, 측정해 왔습니다. 모든 주장에는 실측 수치 또는 테스트 근거가 붙어 있습니다.",
  /** 히어로 근거 칩 — 각 수치는 프로젝트 metrics와 동일 소스 */
  proofChips: [
    { text: "동시 예약 oversell 0건", href: "/projects/concert-booking" },
    { text: "목록 조회 RPS +70.5%", href: "/projects/realtime-chat" },
    { text: "1,000명 수신 검증 유실 0건", href: "/projects/realtime-chat" },
  ],
  email: "jinhyuk9714@gmail.com",
  github: "https://github.com/sjh9714",
  siteUrl: "https://new-portfolio-smoky-one-41.vercel.app",
} as const;
