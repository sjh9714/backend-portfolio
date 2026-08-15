# backend-portfolio

Java·Spring 백엔드 포트폴리오 사이트의 소스입니다. 배포된 화면은 [sjh9714.vercel.app](https://sjh9714.vercel.app)에 있습니다.

Next.js 정적 내보내기로 빌드해 Vercel에 올립니다. 프로젝트 5개, 문제 해결 사례 7개,
프로젝트에서 파생한 이력서(화면과 PDF)가 들어 있습니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ 으로 정적 내보내기
```

## 구조

```
src/content/     화면에 나가는 모든 글과 수치 (프로젝트·사례·이력서·프로필)
src/components/  화면 부품
docs/facts/      화면 수치의 근거 대장. 프로젝트마다 하나씩
docs/writing.md  글 규칙 (문체, 표기, 구조)
scripts/         글 린트, 이미지·PDF·폰트 서브셋 생성
e2e/             Playwright 테스트
```

글과 수치는 전부 `src/content/`에 있습니다. 컴포넌트에는 문구를 두지 않습니다.

## 수치와 근거

이 사이트는 화면에 수치를 싣습니다. 그 수치가 근거와 어긋나지 않도록 프로젝트마다
근거 대장(`docs/facts/*.md`)을 두고, 지켜야 할 것을 사람의 주의가 아니라 검사로 옮겼습니다.

시작은 사고였습니다. 저장소가 스스로 "현재 코드의 근거가 아님"이라고 표시해 둔 수치가
홈 화면 상단 칩까지 올라와 있었습니다. 조심하는 것으로는 다음 문장 하나에서 다시
무너진다고 보고 린트를 만들었습니다.

`npm run lint:writing`이 검사하는 것은 열 가지입니다.

| 검사 | 내용 |
|---|---|
| 문체 | 층별 어미, 대시 없는 평서 종결 |
| 표기 | 쉼표 개수, 화살표 앞뒤 공백, 네 자리 숫자 콤마, `N VU` 띄어쓰기 |
| 구조 | 사례 제목 길이, 문제·해결·결과 각 3줄, 요약 3~4줄, 구현 2~3줄 |
| 근거 | 화면의 모든 수치가 **그 프로젝트의** 대장에 있는지 |
| 금지 | 대장이 「싣지 않는 수치」로 표시한 값이 화면에 없는지 |
| 링크 | "측정함" 표시가 붙은 수치에 근거 링크가 붙어 있는지 |
| 산출물 | 이력서 PDF가 지금 콘텐츠에서 나온 것인지 (출처 해시 대조) |

e2e는 렌더된 화면을 한 번 더 봅니다. 린트는 소스를 보고 e2e는 결과를 보기 때문에,
콘텐츠 바깥(컴포넌트나 alt 텍스트)에 금지 수치가 새어 나오면 린트는 통과하고 e2e만 잡습니다.

근거 링크는 브랜치가 아니라 커밋 SHA로 고정합니다. `main`을 가리키면 저장소가 바뀔 때
화면의 수치는 그대로인데 근거만 조용히 다른 내용이 됩니다.

## 검증

```bash
npm run lint          # ESLint
npm run lint:writing  # 글과 수치 검사
npm run typecheck
npm run build
npx playwright test   # e2e 23개 (접근성 포함)
```

CI가 위 전부와 Lighthouse 모바일 게이트(성능 90 이상, 접근성 100)를 돌립니다.
Lighthouse는 공유 러너에서 결과가 흔들려 페이지마다 최대 3회까지 다시 잽니다.

## 콘텐츠를 고칠 때

1. `src/content/`의 해당 파일을 고칩니다.
2. 수치를 더하거나 바꿨으면 `docs/facts/`의 대장에도 근거를 남깁니다.
3. 이력서에 영향이 가면 `node scripts/resume-pdf.mjs`로 PDF를 다시 뽑습니다.
4. 새로 쓴 한글이 있으면 `node scripts/subset-font.mjs`로 폰트 서브셋을 다시 만듭니다.

2번과 3번을 잊으면 `npm run lint:writing`이 잡습니다. 4번을 잊으면 그 글자만
시스템 폰트로 렌더되므로 화면에서 바로 보입니다.

## 그 밖의 스크립트

| 스크립트 | 하는 일 |
|---|---|
| `capture-screens.mjs` | 각 프로젝트를 띄워 제품 화면을 캡처 |
| `make-card-images.mjs` | 캡처를 갤러리 카드 이미지로 합성 |
| `make-placeholders.mjs` | 이미지 로딩 전에 깔 저해상도 자리표시 생성 |
| `subset-font.mjs` | 실제로 쓰는 글자만 남긴 Pretendard 서브셋 생성 |
| `resume-pdf.mjs` | `/resume` 화면을 A4 PDF로 출력하고 출처 해시 기록 |

글을 쓸 때의 규칙은 [`docs/writing.md`](docs/writing.md)에 있습니다.
