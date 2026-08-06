import type { Metric } from "@/content/types";

const EVIDENCE_LABEL = { measured: "측정", verified: "검증" } as const;

/**
 * 수치 한 칸. 링크를 누르면 근거 문서로 간다.
 * evidence와 source 없이는 타입상 존재할 수 없으므로, 근거 없는 수치가 화면에 뜰 수 없다.
 */
export function MetricChip({ metric }: { metric: Metric }) {
  const measured = metric.evidence === "measured";

  return (
    <a
      href={metric.source.href}
      target="_blank"
      rel="noreferrer"
      title={`${EVIDENCE_LABEL[metric.evidence]} 근거: ${metric.source.label}${metric.condition ? ` · ${metric.condition}` : ""}`}
      className="group flex flex-col gap-2 border-t border-[var(--color-fg)] pt-3 transition-colors hover:border-[var(--color-accent)]"
    >
      <span className="flex items-center gap-2">
        <span
          className={`label px-1.5 py-0.5 ${
            measured
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-muted)]"
          }`}
        >
          {EVIDENCE_LABEL[metric.evidence]}
        </span>
        <span className="text-sm text-[var(--color-muted)]">{metric.label}</span>
      </span>

      <span className="font-mono text-2xl font-medium tracking-tight">
        {metric.before && (
          <>
            <span className="text-[var(--color-muted)]">{metric.before}</span>
            <span className="mx-2 text-[var(--color-muted)]">→</span>
          </>
        )}
        <span className="group-hover:text-[var(--color-accent)]">{metric.after}</span>
        {metric.delta && (
          <span className="ml-2 text-base text-[var(--color-accent)]">{metric.delta}</span>
        )}
      </span>

      {metric.condition && (
        <span className="text-xs leading-relaxed text-[var(--color-muted)]">
          {metric.condition}
        </span>
      )}
    </a>
  );
}
