import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import type { Narrative } from "@/content/types";

/**
 * 서사의 절정. 예상과 달랐던 지점을 다룬다.
 *
 * 순서가 중요하다: 의문 → (직접 재현) → 답.
 * children으로 시뮬레이터를 받으면 독자가 답을 읽기 전에 먼저 만져 보게 된다.
 */
export function TwistPanel({
  twist,
  children,
}: {
  twist: NonNullable<Narrative["twist"]>;
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <section className="mt-16">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--stage-accent)]">
          예상과 달랐던 지점
        </p>

        <p className="mt-4 max-w-[54ch] border-l-2 pl-5 text-lg font-medium leading-[1.75] text-[var(--color-fg)]"
          style={{ borderColor: "var(--stage-accent)" }}
        >
          {twist.question}
        </p>

        {children && <div className="mt-8">{children}</div>}

        <div className="mt-8 space-y-4">
          {twist.finding.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[62ch] leading-[1.85] text-[var(--color-fg)]/85">
              {p}
            </p>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
