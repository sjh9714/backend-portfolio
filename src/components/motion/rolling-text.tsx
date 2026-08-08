/**
 * 호버 시 텍스트가 위로 굴러가고 복제가 올라오는 롤 — dennissnellenberg.com 네비의 문법.
 *
 * 부모 링크에 `group` 클래스가 있어야 동작한다. 복제는 aria-hidden이라
 * 접근성 트리·검색에는 원문 한 벌만 남는다. reduced-motion에서는 굴리지 않는다.
 */
export function RollingText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`roll ${className}`}>
      <span className="roll-stack">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </span>
    </span>
  );
}
