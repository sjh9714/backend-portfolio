export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-sm text-[var(--color-packet)]">
        GET /portfolio → 302 Found · 리뉴얼 진행 중
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">성진혁</h1>
      <p className="max-w-md text-balance text-[var(--color-muted)]">
        동시성·정합성·실시간 처리를 검증으로 증명하는 백엔드 개발자입니다. 새
        포트폴리오를 준비하고 있습니다.
      </p>
      <div className="flex gap-4 font-mono text-sm">
        <a
          className="underline underline-offset-4 hover:text-[var(--color-packet)]"
          href="https://github.com/sjh9714"
        >
          GitHub
        </a>
        <a
          className="underline underline-offset-4 hover:text-[var(--color-packet)]"
          href="mailto:jinhyuk9714@gmail.com"
        >
          Email
        </a>
      </div>
    </main>
  );
}
