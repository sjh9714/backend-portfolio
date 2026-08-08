import { caseStudies } from "./case-studies";

/**
 * 홈의 Capability는 새로 쓰는 글이 아니라 **대표 5칸으로 가는 목차**다.
 *
 * 그래서 여기에는 문장을 적지 않는다. 어느 덩어리인지만 가리키고,
 * 보이는 문장은 그 덩어리의 제목을 그대로 읽어 온다.
 * 같은 사실을 두 군데에 따로 쓰면 반드시 갈라지기 때문이다 (`docs/writing.md`).
 *
 * 구성은 가이드의 기본기 60% + 강점 40% — 6칸이면 4 : 2다.
 * 가이드가 든 신입 기본기 네 가지(실행계획 분석 · 캐시 · Redis · 동기·비동기 구분)를
 * 한 칸씩 덮는다. 그리고 네 프로젝트가 모두 한 칸 이상을 가진다 —
 * 상세가 없는 프로젝트를 만들지 않는 것이 이 배열의 규칙이다.
 */

interface SkillSlot {
  /** 화면에 굵게 뜨는 분야 이름. 제목과 겹치지 않게 짧게 둔다. */
  area: string;
  /** `case-studies.ts`의 id */
  caseId: string;
}

export interface SkillLine {
  area: string;
  title: string;
  href: string;
}

const FUNDAMENTAL_SLOTS: SkillSlot[] = [
  { area: "트랜잭션 · 락", caseId: "seat-contention" },
  { area: "쿼리 · 인덱스", caseId: "n-plus-one" },
  { area: "집계 전략", caseId: "peer-rollup" },
  { area: "동기 · 비동기", caseId: "provider-fanout" },
];

const STRENGTH_SLOTS: SkillSlot[] = [
  { area: "원인 규명", caseId: "shared-counter" },
  { area: "실시간 · 이벤트", caseId: "persist-order" },
];

function resolve(slots: SkillSlot[]): SkillLine[] {
  return slots.map(({ area, caseId }) => {
    const study = caseStudies.find((c) => c.id === caseId);
    if (!study) {
      // 케이스를 지웠는데 여기를 안 고치면 홈이 조용히 비어 버린다. 빌드에서 잡는다.
      throw new Error(`Capability "${area}"가 가리키는 케이스가 없다: ${caseId}`);
    }
    return { area, title: study.title, href: `/projects/${study.projectSlug}#${study.id}` };
  });
}

export const fundamentals = resolve(FUNDAMENTAL_SLOTS);
export const strengths = resolve(STRENGTH_SLOTS);
