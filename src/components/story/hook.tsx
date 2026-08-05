/**
 * 서사의 첫 문장. 전문용어 없이 긴장만 전달하는 자리다.
 * 큰 텍스트이므로 LCP 후보가 될 수 있어 opacity 애니메이션을 걸지 않는다.
 */
export function Hook({ children }: { children: string }) {
  return (
    <p className="rise-move mt-6 max-w-[38ch] text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
      {children}
    </p>
  );
}
