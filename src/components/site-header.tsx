import Link from "next/link";
import { profile } from "@/content/profile";

export function SiteHeader() {
  return (
    <header className="site-header no-print">
      <a href="#content" className="skip-link">본문으로 바로가기</a>
      <div className="page-shell header-inner">
        <Link href="/" className="site-name">{profile.name}<span>백엔드 포트폴리오</span></Link>
        <nav aria-label="주 메뉴">
          <Link href="/#work" className="text-link">프로젝트</Link>
          <Link href="/resume" className="text-link">이력서</Link>
          <a href={profile.github} target="_blank" rel="noreferrer" className="text-link">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
