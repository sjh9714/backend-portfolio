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
  /*
   * 근거 칩은 프로젝트의 맨 위로 간다.
   *
   * 처음엔 그 수치를 낸 케이스 스터디로 바로 걸었다(`#seat-contention` 등).
   * 눌러 보면 화면 중간(1,735px·3,000px)에서 시작해 제목도 맥락도 없이 문단만 보인다.
   * 의도는 근거로 데려가는 것이었는데 받는 쪽에서는 스크롤이 고장 난 것으로 읽힌다.
   *
   * 케이스 스터디는 프로젝트 화면 안에서 바로 보이므로, 먼저 무슨 프로젝트인지 보여 주고
   * 거기서 찾아가게 한다.
   */
  proofChips: [
    { text: "동시 예매 oversell 0건", href: "/projects/concert-booking" },
    { text: "쓰기 p95 37ms → 6ms", href: "/projects/concert-booking" },
    { text: "목록 조회 101회 → 3회", href: "/projects/realtime-chat" },
  ],
  email: "jinhyuk9714@gmail.com",
  github: "https://github.com/sjh9714",
  // 주소는 여기 한 곳에만 둔다 — sitemap·robots·JSON-LD·OG·이력서가 전부 이걸 읽는다.
  // `sjh9714.vercel.app`으로 옮기는 중이지만 아직 Vercel에 붙지 않아(404) 살아 있는 쪽을 쓴다.
  siteUrl: "https://new-portfolio-smoky-one-41.vercel.app",
} as const;
