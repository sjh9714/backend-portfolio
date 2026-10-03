# 포트폴리오의 선택 이유와 담당 범위 보강 Implementation Plan

> **For agentic workers:** Use the agreed native execution workflow and available task-delivery guidance. Track completion per task; specialist dependencies must be available and authorized.

**Goal:** 현재 프로젝트 중심 구성을 유지하면서 대표 두 사례의 판단과 요청 흐름, 팀 작업과 개인 보강의 경계를 설명하고 검증된 정적 사이트와 2쪽 이력서를 배포한다.

**Architecture:** Next.js 정적 페이지와 기존 콘텐츠 파일을 사용한다. 실제 대안 비교와 구현 이유를 콘텐츠 타입에서 구분하며, 사실·수치·출처는 공통 근거 데이터로 관리한다. 새로운 서비스, CMS, 의존성은 추가하지 않는다.

**Tech Stack:** Next.js 16.2.10, React 19, TypeScript, Pretendard, Playwright, 기존 PDF 생성 스크립트, Vercel Hobby 정적 배포.

**Spec:** 2026-10-04 사용자의 “다음 계획 자세하게 짜고 진행해” 요청과 직전 내용 검토의 다섯 보완점. 상세 구성과 표기 기준은 `docs/writing.md`를 따른다.

## Global Constraints

- 작업 위치는 `codex/portfolio-cases`의 기존 worktree이며 시작 커밋은 `c421502fedd4d5c2b435fceb46a0dd7ed6a61c62`다.
- 홈의 소개·대표 프로젝트·추가 프로젝트·연락처, 상세의 프로젝트 정보·사례·구현 기능·서비스 화면 순서를 유지한다.
- 기존 프로젝트 URL과 사례 앵커를 유지한다. 홈의 프로젝트 클릭은 상세 맨 위로 이동한다.
- FinMate 앱, 다섯 탭, 각 서비스 README와 백엔드 코드는 이번 수정 대상이 아니다.
- 합성 데이터·로컬 실험·실제 API 미검증 조건을 유지한다. 새로운 성능 수치나 경험·협업 과정을 만들지 않는다.
- 실제 비교하지 않은 선택지를 과거에 검토한 대안으로 쓰지 않는다. 코드로 확인한 구현 이유와 과거 경험을 구분한다.
- em dash와 en dash는 공개 문구에 사용하지 않는다.
- 기존 사이트 `sjh9714.vercel.app`과 main을 보존한다. PR #1은 초안으로 유지한다.
- 배포 대상은 기존 `sjh9714-backend.vercel.app` 하나이며 추가 지출 한도는 0원이다.
- Docker와 백엔드는 중지 상태로 유지한다. 미리보기 서버만 검사 중 실행하고 종료한다.

## Review Focus

- 비교가 없는 사례에 가짜 선택지나 선택 배지가 생기지 않아야 한다. Task 1의 분기 E2E로 검사한다.
- 비교 표의 관측값과 저장 공간이 다른 대안의 행에 붙지 않아야 한다. Task 2의 행별 검사와 실제 화면 대조로 확인한다.
- 팀의 공동 구현을 단독 성과로 바꾸지 않아야 한다. Task 4에서 기존 기록과 사용자 답변을 대조하며 불명확한 분담은 확대하지 않는다.
- 범위 설명을 줄이면서 합성 자료·실험 조건·현재 미연동 기능이 숨겨지지 않아야 한다. Task 4의 공개 문구 검토와 기존 측정 조건 E2E를 유지한다.
- 콘텐츠가 길어져 모바일 표나 PDF가 잘리지 않아야 한다. Task 5에서 375px·390px·1280px·1440px 화면과 PDF 전체를 확인한다.

## Task 1: 비교와 구현 이유를 구분하는 콘텐츠 구조

**Files:** `src/content/types.ts`, `src/components/case-study.tsx`, `src/content/case-studies.ts`, `scripts/lint-writing.mjs`, `e2e/redesign.spec.ts`

**Interfaces:** `CaseStudy.alternatives`를 `decision`으로 교체한다. `CaseDecision`은 `{ kind: "comparison"; options: { option: string; reason: string; chosen: boolean }[]; conclusion: string }` 또는 `{ kind: "rationale"; paragraphs: string[] }`다. `CaseStudySection`의 입력·기존 앵커·문제 해결 항목 순서는 유지한다.

- [x] 실제 FinMate 비교와 과금 구현 이유를 다르게 표시하는 E2E를 먼저 추가해 현재 구현에서 실패하는지 확인한다.
- [x] 비교에는 대안 이름·이유·선택 하나·결론을, 설명에는 비어 있지 않은 이유를 렌더한다. 설명형에 선택 배지를 붙이지 않는다.
- [x] 글쓰기 검사를 새 타입에 맞춰 바꾼다. 모든 사례에 대안 둘 이상을 강제하는 검사를 제거하고 이유·근거 누락을 검사한다.
- [x] 7개 사례를 전환한다. 실제로 네 쿼리를 측정한 FinMate만 비교형을 사용한다. 나머지는 기록으로 확인한 수정·설계 이유를 설명한다.
- [x] 기존 문제·결과·측정 조건·출처 검사와 새 표시 분기 검사를 함께 통과시킨다.

## Task 2: FinMate의 정확성과 조회 비용 설명

**Files:** `src/content/case-studies.ts`, `src/content/evidence.ts`, `src/content/types.ts`, `src/components/metric-chip.tsx`, `src/app/globals.css`, `docs/facts/finmate.md`, `e2e/redesign.spec.ts`

**Interfaces:** 비교 지표의 각 값에 선택적인 `storage?: string`을 추가한다. 저장 공간이 있는 지표에만 세 번째 열을 표시하고, 없는 지표는 기존 두 열을 유지한다. 전체 재생성 값은 `evidence.finmateRefresh`의 단일 관측으로 관리한다.

- [x] 고정 커밋의 `PERF_RESULT.md`, 비교 쿼리, 집계 갱신 코드를 다시 읽어 문장과 수치를 대조한다.
- [x] 평균의 모집단을 정하는 업무 규칙과 같은 결과를 내는 네 조회 방식의 비교를 구분한다.
- [x] 직접 집계, 재작성, 재작성+인덱스, 월 집계 각각의 처리 차이와 비용을 설명한다. 인덱스 9.82ms만으로도 충분할 수 있으며 현재 측정이 사용자 체감 개선의 증명은 아니라는 경계를 유지한다.
- [x] p50 네 값은 그대로 둔다. 추가 저장은 비교용 인덱스 25,460,736 bytes, 집계 테이블·인덱스 1,671,168 bytes다. 전체 재생성 351.305ms는 단일 관측으로 표시한다.
- [x] 배치로 완전히 적재한 읽기 중심 자료라는 조건에서 월 집계를 유지한 이유와 재집계 전 최신성의 비용을 연결한다.
- [x] 표의 행별 대응, 조건·출처, 모바일 넘침을 확인한다. 새 성능 실험은 실행하지 않는다.

## Task 3: 예매의 요청 흐름과 트랜잭션 판단

**Files:** `src/content/case-studies.ts`, `docs/facts/concert-booking.md`

**Interfaces:** Task 1의 설명형 `decision`을 사용한다. 기존 소유권 그림과 `seat-contention`, `shared-counter` 앵커는 유지한다.

- [x] 예약 생성·결제·취소·만료·좌석 반환의 실제 호출 순서와 잠금 위치를 읽는다.
- [x] 소유권 확인이 오래된 요청의 대상 검증이라는 점을 설명한다. 이벤트 중복 제거를 대체하는 만능 해법으로 쓰지 않는다.
- [x] 좌석 잠금과 공유 카운터 제거, 같은 DB 변경을 한 트랜잭션에 묶은 이유를 각각 설명한다.
- [x] 적용 과정에서 선점, 테스트 결제, 취소·만료의 입력 확인·잠금·상태 변경·커밋 범위를 따라 읽게 한다. 결제와 만료 경쟁에서 나중 요청이 상태를 다시 확인하는 이유를 명시한다.
- [x] 과거 세 락 비교와 현재 기본 서비스의 결과를 섞지 않는다. 실제 PG·환불·운영 처리량은 범위 밖으로 유지한다.

## Task 4: 담당 범위와 중복 문장 정리

**Files:** `src/content/projects/finmate.ts`, `src/content/projects/eta.ts`, `src/content/projects/concert-booking.ts`, `src/content/projects/realtime-chat.ts`, `src/content/projects/billing-gateway.ts`, `src/content/types.ts`, `src/app/projects/[slug]/page.tsx`, `src/app/globals.css`, `src/content/resume.ts`, `docs/writing.md`

**Interfaces:** `Project.contributions?: { phase: string; description: string }[]`를 팀 프로젝트에만 사용한다. 기존 프로젝트 정보 안에서 팀 프로젝트 당시 역할과 이후 개인 보강을 분리해 표시한다.

- [x] 기존 팀 자료와 역할 기록을 확인한다. 사용자에게 추가 분담을 물었으며 답변이 없으면 현재 확인된 역할 범위만 사용한다.
- [x] FinMate는 앱·API 구현과 이후 평균·재집계·기존 화면 API 연결을 구분한다. ETA는 프론트·백엔드와 개인화 엔진 공동 작업, 이후 공급자 경계·조회 공유를 구분한다.
- [x] 홈은 현재 정보 배치와 두 대표 사례를 유지한다. 팀 인력, 기능, 수치를 임의로 추가하지 않는다.
- [x] 합성 자료·테스트 결제 등 기본 조건은 상단, 측정 조건은 결과 옆, 기술적 한계는 사례 끝에 둔다. 마지막 범위 설명에서 동일한 문장의 반복을 줄인다.
- [x] 이력서는 현재 세 프로젝트와 2쪽 구성을 유지하며 판단 이유를 짧게 반영한다. 기존 수치·사례 링크의 의미는 유지한다.

## Task 5: 검증, PDF 갱신과 기존 주소 배포

**Files:** `public/resume-sung-jinhyuk.pdf`, `public/resume-sung-jinhyuk.pdf.sha256`, `docs/VERIFICATION.md`, 이 계획의 완료 표시와 기존 작업 상태 기록

- [x] `npm run lint`, `npm run typecheck`, `npm run build`를 실행한다.
- [x] 기존 PDF 스크립트로 A4 2쪽을 생성한다. PDF 도구 원본 대조, 전체 페이지 렌더, 여백·잘림·문장 흐름·3개 사례 링크를 확인한다.
- [x] `npm run lint:writing`, `npm run check:links`, `npx playwright test`를 실행한다. 제목 문구를 고정하는 검사 대신 문제·판단·결과·조건·출처를 검사한다.
- [x] 4개 화면 폭에서 홈과 상세를 확인한다. FinMate 비용 표, 예매 설명, 팀 담당 범위를 실제 캡처에서 검토한다.

커밋 이후 확인은 기존 `/Users/sungjh/Projects/backend-service-rebuild/STATUS.md`와 PR #1에 리비전별 결과로 기록한다.

1. 최종 diff를 읽고 같은 브랜치에 커밋·푸시한다. 기존 PR #1을 업데이트하고 CI의 모바일 Lighthouse까지 확인한다.
2. Vercel 계정·프로젝트와 active Hobby를 확인하고 정적 `out/`만 기존 새 포트폴리오에 배포한다. 리비전·공개 HTML·PDF와 실제 클릭 결과를 대조한다.
3. 작업용 미리보기 서버를 종료하고 Docker와 관련 서버 포트가 꺼져 있는지 확인한다.

## 완료 기준

대표 두 사례에서 업무 조건, 선택 이유, 처리 흐름, 결과와 한계를 읽을 수 있다. 근거 없는 비교와 기여 확대가 없고 기존 구성·주소·앵커가 유지된다. 이력서와 사이트의 내용이 일치하며, CI 통과·동일 리비전 배포·서버 종료까지 확인하면 완료한다.
