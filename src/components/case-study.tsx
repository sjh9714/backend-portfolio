import Image from "next/image";
import { MetricChip } from "@/components/metric-chip";
import { Reveal } from "@/components/reveal";
import type { CaseStudy } from "@/content/types";

/**
 * 포트폴리오의 한 덩어리.
 *
 * 순서는 자료가 규정한 그대로 고정한다: 제목 → 그림 → 문제 원인 → 해결 과정 → 결과.
 * 이 순서를 바꾸거나 그림을 빼면 안 된다.
 */
export function CaseStudySection({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <section
      id={study.id}
      aria-labelledby={`${study.id}-title`}
      className="scroll-mt-20 border-t border-[var(--color-fg)] pt-8"
    >
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-sm text-[var(--color-muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="label text-[var(--color-muted)]">{study.domain}</span>
        </div>

        {/*
          제목은 이력서의 한 줄을 그대로 쓰기 때문에 길다.
          디스플레이 크기로 키우면 4줄로 넘쳐 오히려 안 읽히므로 본문보다 한 단계만 키운다.
        */}
        <h3
          id={`${study.id}-title`}
          className="mt-4 max-w-[34ch] text-balance text-xl font-medium leading-snug tracking-tight sm:text-2xl"
        >
          {study.title}
        </h3>
      </Reveal>

      <Reveal>
        <figure className="mt-10">
          <div className="overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
            {/*
              늦게 불러오지 않는다. 홈 Capability에서 누르면 이 덩어리로 바로 내려오는데,
              그때 그림이 아직 안 붙어 빈 상자가 한동안 보였다. 도식은 4~6KB짜리 SVG이고
              한 페이지에 많아야 셋이라 늦춰서 아낄 것이 없다.
              `priority`는 쓰지 않는다 — preload까지 걸 만큼 급하지는 않다.
            */}
            <Image
              src={study.figure.src}
              alt={study.figure.alt}
              width={880}
              height={420}
              loading="eager"
              className="w-full"
            />
          </div>
          <figcaption className="mt-3 text-sm text-[var(--color-muted)]">
            {study.figure.caption}
          </figcaption>
        </figure>
      </Reveal>

      <div className="mt-12 space-y-10">
        <Reveal>
          <Block label="문제 원인" items={study.cause} />
        </Reveal>
        <Reveal>
          <Block label="해결 과정" items={study.approach} />
        </Reveal>
        <Reveal>
          <Block label="결과" items={study.result} accent />
        </Reveal>
      </div>

      {study.metrics.length > 0 && (
        <Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {study.metrics.map((m) => (
              <MetricChip key={m.label} metric={m} />
            ))}
          </div>
        </Reveal>
      )}
    </section>
  );
}

/** 라벨은 왼쪽, 내용은 오른쪽. 넓은 화면에서 스캔 경로가 한 줄로 정리된다. */
function Block({
  label,
  items,
  accent = false,
}: {
  label: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[7rem_1fr] md:gap-8">
      <p className={`label pt-1 ${accent ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
        {label}
      </p>
      <ol className="space-y-3">
        {items.map((text, i) => (
          <li key={text.slice(0, 24)} className="flex gap-3 leading-[1.7]">
            <span
              aria-hidden="true"
              className="shrink-0 pt-1 font-mono text-xs text-[var(--color-muted)]"
            >
              {i + 1}
            </span>
            <span className="max-w-[62ch]">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
