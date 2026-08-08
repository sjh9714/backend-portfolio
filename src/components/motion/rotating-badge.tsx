/**
 * 천천히 도는 원형 텍스트 배지 — dennissnellenberg.com 좌측 지구본 배지의 문법.
 *
 * 문구는 이 사이트에서만 나올 수 있는 것으로 쓴다: 화면의 모든 수치는 근거로 연결된다.
 * textLength로 원둘레(2π×38 ≈ 239)에 글자를 정확히 펴서 이음새 없이 돈다.
 *
 * id는 호출마다 달라야 한다(같은 페이지에 두 번 나온다) — useId는 서버 컴포넌트에서
 * 못 쓰므로 자리마다 명시한다.
 */
export function RotatingBadge({
  id,
  text = "EVERY NUMBER LINKS TO EVIDENCE · ",
  label = "모든 수치는 근거로 연결됩니다",
  size = 104,
  className = "",
}: {
  id: string;
  text?: string;
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`rotating-badge ${className}`}
    >
      <g className="rotating-badge-spin">
        <defs>
          <path id={id} d="M 50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" />
        </defs>
        <text fill="currentColor" fontSize="9.4" letterSpacing="0.14em">
          <textPath href={`#${id}`} textLength="239">
            {text}
          </textPath>
        </text>
      </g>
      {/* 중앙 ↓ — 아래 내용(마키·본문)을 가리킨다 */}
      <path
        d="M50 39v20m0 0l-6.5-6.5M50 59l6.5-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
