import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "이력서 — 성진혁",
  description: "신입 백엔드 개발자 성진혁의 이력서",
};

export default function ResumePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28">
        <h1 className="text-4xl font-bold tracking-tight">이력서</h1>
        <p className="mt-4 text-[var(--color-muted)]">
          이력서 페이지를 준비하고 있습니다. 아래에서 연락처와 프로젝트를 확인해
          주세요.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-lg bg-[var(--color-fg)] px-5 py-2.5 text-[var(--color-bg)]"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5"
          >
            GitHub
          </a>
        </div>
      </main>
    </>
  );
}
