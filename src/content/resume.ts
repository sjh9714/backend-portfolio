import { profile } from "./profile";
import { getProject } from "./projects";
import { evidence } from "./evidence";

export interface ResumeProject {
  name: string;
  period: string;
  headcount: string;
  role: string;
  stack: string;
  summary: string;
  bullets: string[];
  href: string;
  github: string;
}

const selections = [
  {
    slug: "finmate",
    caseId: "peer-rollup",
    stack: "Java 21 · Spring Boot · PostgreSQL · JPA / SQL · React · TypeScript",
    summary: "금융이 막막한 20대를 위한 소비 조회·또래 비교 서비스",
    bullets: [
      "같은 소득대에서 월 자료가 준비된 사람만 비교하고 무거래자는 0원으로 포함했습니다. 100원 지출자와 무거래자의 평균 50원, 미적재 기간, 마지막 거래 삭제 후 재집계를 DB 테스트로 검증했습니다.",
      `같은 결과를 내는 직접 집계·쿼리 재작성·커버링 인덱스·사전 집계의 p50은 각각 ${evidence.finmateQueries.values.map(value => value.value).join(" / ")}였습니다. 합성 2,000명·432,000행, 로컬 단일 클라이언트, 대안별 워밍업 5회·측정 40회의 JDBC 호출 시간입니다.`,
      "배치 적재 데모에는 월 집계를 유지했습니다. 재집계 전 최신성은 보장하지 않으며, 전체 재생성 351.305ms는 단일 관측입니다. 기존 다섯 탭을 보존하고 마이·피드 더보기·기록을 API에 연결했습니다.",
    ],
  },
  {
    slug: "concert-booking",
    caseId: "seat-contention",
    stack: "Java 21 · Spring Boot · PostgreSQL · Spring Data JPA · Testcontainers",
    summary: "좌석 선점·테스트 결제·취소·만료를 제공하는 예매 서비스",
    bullets: [
      "A 취소 후 B가 재선점한 좌석을 A의 반환 재처리가 풀어 버리는 경로를 재현했습니다. 좌석에 현재 예약의 소유권을 기록하고, 상태와 소유 예약이 모두 일치할 때만 확정·반환하도록 수정했습니다.",
      "기본 서비스는 좌석의 DB 비관적 잠금을 사용하고 예약 종료와 좌석 반환을 함께 커밋합니다. 잔여석은 좌석 상태에서 계산하며, Redis·Kafka·세 가지 락 비교는 별도 실험 모드에 보존했습니다.",
      `중복 예약·결제, 다중 좌석 롤백, 결제·만료 경쟁을 검증했습니다. ${evidence.seatConcurrency.value}의 성공은 요청 8개의 DB 통합 시험이며, 워밍업 없이 조건별 1회 관측입니다. 실제 PG·환불·운영 처리량은 포함하지 않습니다.`,
    ],
  },
  {
    slug: "realtime-chat",
    caseId: "persist-order",
    stack: "Java 21 · Spring Boot · PostgreSQL · Kafka · Redis · WebSocket",
    summary: "서버 저장 확인과 재접속 이력 복구를 검증한 보조 프로젝트",
    bullets: [
      "PERSISTED를 서버 저장 완료로 표시하고, 실시간 최대 ID와 이력 조회 완료 기준을 나눴습니다. 중간 메시지 누락 뒤 더 큰 ID를 받고 재접속하는 두 노드 E2E에서 빠진 메시지 복구와 중복 제거를 확인했습니다.",
      "정상 발행 뒤 수신자가 놓친 메시지는 이력 조회로 보충합니다. 모든 장애에서 정확히 한 번 전달을 보장한다는 의미는 아닙니다.",
    ],
  },
];

const projects: ResumeProject[] = selections.map(({ slug, caseId, ...copy }) => {
  const project = getProject(slug)!;
  return {
    ...copy,
    name: project.name,
    period: project.period,
    headcount: project.team ? "4인 팀" : "개인 프로젝트",
    role: project.role,
    href: `${profile.siteUrl}/projects/${slug}#${caseId}`,
    github: project.links.github,
  };
});

export const resume = {
  title: "성진혁 이력서",
  intro: [
    "Java·Spring으로 소비 조회와 좌석 예매 서비스를 만들고 있습니다. 데이터의 정의, 트랜잭션 범위, 실패 후 상태를 코드와 테스트로 확인했습니다.",
    "구현·검증에 AI를 활용했습니다. 팀의 기획·리서치·데이터 작업과 이후 개인 보강을 구분하며, 아래 결과는 합성 데이터와 로컬 실험에 한정합니다.",
  ],
  projects,
  activities: [
    { name: "하나금융그룹 × SK텔레콤 Tech4Good 2026", detail: "My ETA 팀 해커톤. 프론트·백엔드 구현, 개인화 엔진 공동 작업. 개인 보강에서 DEMO/LIVE 분리와 외부 정보의 UNKNOWN·동시 조회 공유를 검증했습니다." },
    { name: "하나금융그룹 청년 금융인재 양성 과정", detail: "가가제작소 4인 팀의 FinMate 앱·API 구현. 기획·리서치·데이터셋은 팀원 작업입니다." },
  ],
  education: [
    { school: "가톨릭대학교 성심교정", major: "컴퓨터정보공학부", period: "2021.03 ~ 2028.03 (졸업 예정)" },
  ],
  pdfPath: "/resume-sung-jinhyuk.pdf",
} as const;
