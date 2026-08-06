import { Photo } from "@/components/photo";
import type { Service } from "@/content/types";

/**
 * "이게 무슨 서비스인가" 섹션.
 *
 * 자료 p.9 이력서 템플릿의 "서비스: 프로젝트에 대한 개요" 자리다.
 * 이게 없으면 아래의 문제 해결이 어디서 벌어진 일인지 알 수 없어 공중에 뜬다.
 *
 * 화면 캡처는 **이 섹션에만** 놓는다. 자료 p.18:
 *   "백엔드 개발자는 '기능 화면'이 아니라 '구조와 흐름'을 보여줘야 합니다."
 * 문제 해결의 그림 자리는 구조 다이어그램으로 유지한다(CaseStudySection).
 *
 * 데모가 없는 프로젝트는 없다고 쓴다. 없는 걸 있는 것처럼 만들지 않는다.
 */
export function ServiceSection({ service }: { service: Service }) {
  const { what, flow, demo, noDemo } = service;

  return (
    <section aria-label="서비스" className="mt-16">
      <h2 className="label text-[var(--color-muted)]">서비스</h2>

      <div className="mt-5 space-y-3">
        {what.map((line) => (
          <p key={line.slice(0, 24)} className="max-w-[62ch] leading-[1.7]">
            {line}
          </p>
        ))}
      </div>

      {/* 사용자가 거치는 흐름 — 화면이 없는 서비스는 호출자 기준이다 */}
      <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2">
        {flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-[var(--color-muted)]">
                →
              </span>
            )}
            <span className="border border-[var(--color-line)] px-2.5 py-1 font-mono text-xs">
              {step}
            </span>
          </li>
        ))}
      </ol>

      {demo && (
        <div className="mt-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {demo.screens.map((screen) => {
              // 모바일 세로 화면은 가로 폭을 다 채우면 페이지를 잡아먹는다. 폭을 묶어 폰처럼 세운다.
              const portrait = screen.height > screen.width;
              return (
                <figure
                  key={screen.base}
                  className={portrait ? "mx-auto max-w-[260px]" : undefined}
                >
                  <div className="overflow-hidden border border-[var(--color-line)]">
                    <Photo
                      base={screen.base}
                      alt={screen.alt}
                      sizes={portrait ? "260px" : "(min-width: 640px) 50vw, 100vw"}
                      width={screen.width}
                      height={screen.height}
                      className="block h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-2.5 text-sm leading-relaxed text-[var(--color-muted)]">
                    {screen.caption}
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-[var(--color-line)] pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="label text-[var(--color-muted)]">데모 UI</dt>
              <dd className="mt-1.5">{demo.stack}</dd>
            </div>
            <div>
              <dt className="label text-[var(--color-muted)]">직접 띄워보기</dt>
              <dd className="mt-1.5">
                {/* 가로 스크롤을 만들면 키보드로 닿지 않는 스크롤 영역이 된다. 줄바꿈으로 전부 보인다. */}
                <code className="block whitespace-pre-wrap break-words font-mono text-xs">
                  {demo.run}
                </code>
                <span className="mt-1.5 block font-mono text-xs text-[var(--color-muted)]">
                  → {demo.url}
                </span>
              </dd>
            </div>
          </dl>

          {demo.provenBy && (
            <div className="mt-6">
              <h3 className="label text-[var(--color-muted)]">e2e가 화면에서 재현하는 것</h3>
              <ul className="mt-3 space-y-2">
                {demo.provenBy.map((line) => (
                  <li key={line.slice(0, 24)} className="flex gap-3 text-sm leading-[1.7]">
                    <span aria-hidden="true" className="text-[var(--color-muted)]">
                      ·
                    </span>
                    <span className="max-w-[62ch]">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-[var(--color-muted)]">
            위 화면은 로컬 데모 실행 결과입니다. 운영 중인 서비스가 아닙니다.
          </p>
        </div>
      )}

      {noDemo && (
        <p className="mt-8 max-w-[62ch] border-l-2 border-[var(--color-line)] pl-4 text-sm leading-[1.8] text-[var(--color-muted)]">
          {noDemo}
        </p>
      )}
    </section>
  );
}
