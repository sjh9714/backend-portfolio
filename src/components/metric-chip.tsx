import type { Metric } from "@/content/types";

const KIND_LABEL = { "before-after": "전후 비교", comparison: "대안 비교", observation: "단일 관측" } as const;

export function MetricChip({ metric }: { metric: Metric }) {
  return (
    <figure data-metric-kind={metric.kind} className="metric-result">
      <figcaption>{metric.label}<span>{KIND_LABEL[metric.kind]}</span></figcaption>
      {metric.kind === "comparison" ? (
        <table>
          <caption className="sr-only">{metric.label}</caption>
          <thead><tr><th scope="col">비교 대상</th><th scope="col">관측값</th></tr></thead>
          <tbody>{metric.values.map(value => <tr key={value.label}><th scope="row">{value.label}</th><td>{value.value}</td></tr>)}</tbody>
        </table>
      ) : (
        <p className="metric-value">
          {metric.kind === "before-after" ? <><span>{metric.before}</span><span aria-label="에서"> → </span>{metric.after}</> : metric.value}
          {metric.kind === "before-after" && metric.delta && <small>{metric.delta}</small>}
        </p>
      )}
      <p data-metric-condition className="metric-condition">{metric.condition}</p>
      <a href={metric.source.href} target="_blank" rel="noreferrer">{metric.source.label}</a>
    </figure>
  );
}
