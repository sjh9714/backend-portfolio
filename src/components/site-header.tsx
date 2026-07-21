import Link from "next/link";
import { profile } from "@/content/profile";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-line)]/60 bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          sung<span className="text-[var(--color-packet)]">.dev</span>
        </Link>
        <nav aria-label="주 메뉴" className="flex items-center gap-5 text-sm">
          <Link href="/#journey" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]">
            여정
          </Link>
          <Link href="/resume" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]">
            이력서
          </Link>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
