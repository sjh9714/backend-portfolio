import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "이력서: 성진혁",
  description: "신입 백엔드 개발자 성진혁의 이력서: 동시성, 데이터 조회, 메시지 복구의 설계와 검증",
};

export default function ResumePage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="resume mx-auto max-w-3xl px-6 pb-20 pt-12 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--color-fg)] pb-6">
          <div>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight print:mt-0">{profile.name}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{profile.role} · {profile.tagline}</p>
          </div>
          <div className="text-xs leading-relaxed text-[var(--color-muted)]">
            <p><a href={`mailto:${profile.email}`} className="text-link inline-block py-1.5 print:py-0">{profile.email}</a></p>
            <p><a href={profile.github} className="text-link inline-block py-1.5 print:py-0">github.com/sjh9714</a></p>
            <p><a href={profile.siteUrl} className="text-link inline-block py-1.5 print:py-0">포트폴리오 · sjh9714-backend.vercel.app</a></p>
          </div>
        </header>
        <a href={resume.pdfPath} download className="action-link no-print mt-6 text-sm">PDF 다운로드 <span aria-hidden="true">↓</span></a>
        <section aria-labelledby="resume-intro" className="mt-9">
          <h2 id="resume-intro" className="resume-h2">소개</h2>
          {resume.intro.map((line) => <p key={line} className="mt-3 text-sm leading-[1.8] text-[var(--color-muted)] print:text-[14px]">{line}</p>)}
        </section>
        <section aria-labelledby="resume-projects" className="mt-9">
          <h2 id="resume-projects" className="resume-h2">대표 프로젝트</h2>
          <div className="mt-5 space-y-9">
            {resume.projects.map((project) => (
              <article key={project.name} className="resume-project">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className="text-xs text-[var(--color-muted)]">{project.period}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed print:text-[14px]">{project.summary}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{project.headcount} · {project.role}</p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">{project.stack}</p>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-[1.8] print:text-[14px]">
                  {project.bullets.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <div className="mt-3 flex gap-5 text-xs">
                  <a href={project.href} className="text-link inline-block py-1 text-[var(--color-accent)]">설계와 검증 과정 ↗</a>
                  <a href={project.github} className="text-link inline-block py-1 text-[var(--color-muted)]">소스 코드 ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="resume-activities" className="mt-9">
          <h2 id="resume-activities" className="resume-h2">활동</h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed print:text-[14px]">
            {resume.activities.map((activity) => <li key={activity.name}><p className="font-medium">{activity.name}</p><p className="mt-1 text-[var(--color-muted)]">{activity.detail}</p></li>)}
          </ul>
        </section>
        <section aria-labelledby="resume-education" className="mt-9">
          <h2 id="resume-education" className="resume-h2">학력</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed print:text-[14px]">
            {resume.education.map((education) => <li key={education.school}><span className="font-medium">{education.school}</span><span className="ml-2 text-[var(--color-muted)]">{education.major} · {education.period}</span></li>)}
          </ul>
        </section>
      </main>
    </>
  );
}
