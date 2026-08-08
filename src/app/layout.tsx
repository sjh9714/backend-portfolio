import type { Metadata } from "next";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/smooth-scroll";
import { profile } from "@/content/profile";
import "./globals.css";

// 사용 글자만 서브셋한 파일 — 카피 수정 후 `node scripts/subset-font.mjs` 재실행 필수
const pretendard = localFont({
  src: "../fonts/PretendardSubset.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  // 주소는 `profile.siteUrl` 한 곳에만 둔다. sitemap·robots·JSON-LD도 전부 거기서 파생된다
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: "성진혁 — 백엔드 개발자",
    template: "%s",
  },
  description:
    "동시성·정합성·실시간 처리를 직접 재현하고 측정하는 신입 Java/Spring 백엔드 개발자 성진혁의 포트폴리오",
  openGraph: {
    title: "성진혁 — 백엔드 개발자",
    description:
      "동시성 제어와 데이터 정합성을 부하 테스트로 검증합니다 — 문제 해결 과정을 근거와 함께 정리한 백엔드 포트폴리오",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
