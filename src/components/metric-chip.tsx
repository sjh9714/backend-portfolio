import type { Metric } from "@/content/types";

const EVIDENCE_LABEL = { measured: "측정", verified: "동작 검증" } as const;
const KIND_LABEL = { "before-after": "전후 비교", comparison: "대안 비교", observation: "단일 관측" } as const;

export function MetricChip({ metric, compact = false }: { metric: Metric; compact?: boolean }) {
  return (
    <div data-metric-kind={metric.kind} className={`min-w-0 border-l-2 border-[var(--color-line)] pl-5 ${compact ? "text-sm" : "bg-[var(--color-surface)] p-5"}`}>
      <p className="text-xs text-[var(--color-muted)]">{EVIDENCE_LABEL[metric.evidence]} · {KIND_LABEL[metric.kind]}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed">{metric.label}</p>
      {metric.kind === "comparison" ? (
        <ul className="mt-3 space-y-2">
          {metric.values.map((value) => (
            <li key={value.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-[var(--color-line)] pb-2 text-sm"><span className="text-[var(--color-muted)]">{value.label}</span><span className="font-mono font-medium">{value.value}</span></li>
          ))}
        </ul>
      ) : (
        <p className={`mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-medium tracking-tight ${compact ? "text-xl" : "text-2xl"}`}>
          {metric.kind === "before-after" && <><span className="text-[var(--color-muted)]">{metric.before}</span><span aria-label="에서">→</span></>}
          <span>{metric.kind === "observation" ? metric.value : metric.after}</span>
          {metric.kind === "before-after" && metric.delta && <span className="text-sm text-[var(--color-accent)]">{metric.delta}</span>}
        </p>
      )}
      <p data-metric-condition className="mt-3 text-xs leading-[1.8] text-[var(--color-muted)]">{metric.condition}</p>
      <a href={metric.source.href} target="_blank" rel="noreferrer" className="text-link mt-3 inline-block py-1 text-xs text-[var(--color-accent)]">{metric.source.label} <span aria-hidden="true">↗</span></a>
    </div>
  );
}
