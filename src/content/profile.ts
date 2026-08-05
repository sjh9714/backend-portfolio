export const profile = {
  name: "성진혁",
  role: "신입 백엔드 개발자",
  tagline: "Java · Spring",
  /** 히어로 헤드라인 — 10초 스캔의 핵심 문장 */
  headline: "무엇이 깨지는지 재보고, 재본 것만 말합니다",
  lead: "동시성 제어, 데이터 정합성, 실시간 전달 — 백엔드가 에러 없이 조용히 실패하는 지점을 직접 재현하고 막아 왔습니다. 그리고 아직 측정하지 못한 것은 측정하지 못했다고 적어 두었습니다.",
  /** 히어로 근거 칩 — 각 수치는 프로젝트 metrics와 동일 소스 */
  proofChips: [
    { text: "동시 예약 oversell 0건", href: "/projects/concert-booking" },
    { text: "race·멱등·토큰 594/594", href: "/projects/concert-booking" },
    { text: "중복 과금 0건", href: "/projects/ai-usage-billing-gateway" },
  ],
  email: "jinhyuk9714@gmail.com",
  github: "https://github.com/sjh9714",
  siteUrl: "https://new-portfolio-smoky-one-41.vercel.app",
} as const;
