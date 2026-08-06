import Link from "next/link";
import { profile } from "@/content/profile";

export function SiteHeader() {
  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="label">
          {profile.name}
        </Link>
        <nav aria-label="주 메뉴" className="label flex items-center gap-6">
          <Link
            href="/#work"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Projects
          </Link>
          <Link
            href="/resume"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Resume
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
