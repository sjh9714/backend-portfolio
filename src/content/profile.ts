export const profile = {
  name: "성진혁",
  role: "신입 백엔드 개발자",
  tagline: "Java · Spring",
  /**
   * 히어로 한 줄. 슬로건이 아니라 무엇을 하는 사람인지의 서술이다.
   * 자료가 "열정적인 개발자" 류의 어필 문구를 지양하라고 해서 팩트 기반으로 쓴다.
   */
  headline: "동시성 제어와 데이터 정합성을 부하 테스트로 검증합니다",
  lead: "좌석 예약·실시간 전달에서 서버가 에러 없이 조용히 실패하는 지점을 재현하고 막아 왔습니다. 측정하지 못한 것은 측정하지 못했다고 적었습니다.",
  /** 각 항목은 해당 문제 해결로 바로 연결된다. 감춘 프로젝트는 가리키지 않는다. */
  proofChips: [
    { text: "동시 예매 oversell 0건", href: "/projects/concert-booking#seat-contention" },
    { text: "쓰기 p95 37ms → 6ms", href: "/projects/concert-booking#redis-stock" },
    { text: "목록 조회 101회 → 3회", href: "/projects/realtime-chat#n-plus-one" },
  ],
  email: "jinhyuk9714@gmail.com",
  github: "https://github.com/sjh9714",
  siteUrl: "https://new-portfolio-smoky-one-41.vercel.app",
} as const;
