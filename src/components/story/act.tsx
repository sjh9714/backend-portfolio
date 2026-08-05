import { Reveal } from "@/components/reveal";

/**
 * 서사의 한 막(기·승·결). 라벨은 장식이 아니라 읽는 사람에게 현재 위치를 알려준다.
 * 문단은 평문 배열이므로 마크다운 파싱이 필요 없다.
 */
export function Act({ label, paragraphs }: { label: string; paragraphs: string[] }) {
  return (
    <Reveal>
      <section className="mt-14">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--color-muted)]">
          {label}
        </p>
        <div className="mt-4 space-y-4">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[62ch] leading-[1.85] text-[var(--color-fg)]/85">
              {p}
            </p>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
