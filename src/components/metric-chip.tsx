import type { Metric } from "@/content/types";

const EVIDENCE_LABEL = { measured: "측정", verified: "검증" } as const;

export function MetricChip({ metric }: { metric: Metric }) {
  return (
    <a
      href={metric.source.href}
      target="_blank"
      rel="noreferrer"
      title={`${EVIDENCE_LABEL[metric.evidence]} 근거: ${metric.source.label}${metric.condition ? ` · ${metric.condition}` : ""}`}
      className="group flex flex-col gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]/60 px-3.5 py-3 transition-colors hover:border-[var(--stage-accent,var(--color-packet))]"
    >
      <span className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <span
          className={`rounded-sm px-1 py-px font-mono text-[10px] font-semibold ${
            metric.evidence === "measured"
              ? "bg-[var(--stage-accent,var(--color-packet))]/15 text-[var(--stage-accent,var(--color-packet))]"
              : "bg-[var(--color-line)]/60 text-[var(--color-muted)]"
          }`}
        >
          {EVIDENCE_LABEL[metric.evidence]}
        </span>
        {metric.label}
      </span>
      <span className="font-mono text-sm font-semibold tracking-tight">
        {metric.before && (
          <>
            <span className="text-[var(--color-muted)] line-through decoration-[var(--color-line)]">
              {metric.before}
            </span>
            <span className="mx-1.5 text-[var(--color-muted)]">→</span>
          </>
        )}
        <span className="text-[var(--color-fg)]">{metric.after}</span>
        {metric.delta && (
          <span className="ml-2 text-xs font-medium text-[var(--stage-accent,var(--color-packet))]">
            {metric.delta}
          </span>
        )}
      </span>
    </a>
  );
}
