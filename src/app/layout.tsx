import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 사용 글자만 서브셋한 파일 — 카피 수정 후 `node scripts/subset-font.mjs` 재실행 필수
const pretendard = localFont({
  src: "../fonts/PretendardSubset.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://new-portfolio-smoky-one-41.vercel.app"),
  title: {
    default: "성진혁 — 백엔드 개발자",
    template: "%s",
  },
  description:
    "동시성·정합성·실시간 처리를 검증으로 증명하는 신입 Java/Spring 백엔드 개발자 성진혁의 포트폴리오",
  openGraph: {
    title: "성진혁 — 백엔드 개발자",
    description:
      "\"잘 돌아간다\"를 수치와 테스트로 증명합니다 — 요청의 여정으로 보는 백엔드 포트폴리오",
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
