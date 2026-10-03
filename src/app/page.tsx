import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { FeaturedWork } from "@/components/work/featured-work";
import { profile } from "@/content/profile";

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <SiteHeader />
      <main id="content"><Hero /><FeaturedWork /></main>
      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <div><h2>연락처</h2><a href={`mailto:${profile.email}`} className="text-link">{profile.email}</a></div>
          <p>AI를 활용해 구현하고 검증한 프로젝트입니다.<br />팀 작업과 개인 보강, 실험과 운영 경험을 구분해 기록했습니다.</p>
          <Link href="/resume" className="text-link">이력서 보기</Link>
        </div>
      </footer>
    </>
  );
}
