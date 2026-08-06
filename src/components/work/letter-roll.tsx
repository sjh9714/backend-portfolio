/**
 * lusion Featured Work 제목의 서명 동작 — 글자별 슬롯머신 롤.
 *
 * 원본 구조(lusion.co 계측): 글자마다 같은 글자를 세로로 여러 겹 쌓고
 * `overflow: hidden` 안에서 `translateY`로 굴린다. 글자가 위로 빠지면서
 * 아래에서 같은 글자가 올라와, 바뀌지 않는데도 움직임이 읽힌다.
 *
 * 접근성: 글자를 쪼개면 화면 낭독기가 한 글자씩 끊어 읽는다.
 * `aria-label`은 role 없는 span에 쓸 수 없으므로(aria-prohibited-attr),
 * 원문을 sr-only로 따로 두고 굴러가는 쪽을 aria-hidden으로 감춘다.
 * 부수 효과로 텍스트 검색·선택도 원문 기준으로 동작한다.
 */

/** 한 글자당 쌓는 겹 수. globals.css의 --roll-steps와 맞춰야 한다. */
const LAYERS = 4;

export function LetterRoll({ text, className = "" }: { text: string; className?: string }) {
  const chars = [...text];

  return (
    <span className={`letter-roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="letter-roll-visual">
        {chars.map((ch, i) => {
          // 공백은 굴리지 않는다 — overflow 컨테이너 안에서 폭이 무너진다
          if (ch === " ") {
            return (
              <span key={`sp-${i}`} className="letter-roll-space">
                &nbsp;
              </span>
            );
          }
          return (
            <span
              key={`${ch}-${i}`}
              className="letter-roll-col"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="letter-roll-stack">
                {Array.from({ length: LAYERS }, (_, l) => (
                  <span key={l}>{ch}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
