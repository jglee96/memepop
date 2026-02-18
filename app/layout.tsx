import type { Metadata } from "next";
import Link from "next/link";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/shared/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 밈 문구를 상황 맞춤으로 리믹스`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 밈 문구를 상황 맞춤으로 리믹스`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [{ url: absoluteUrl("/og/memepop-home.svg"), width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 밈 문구를 상황 맞춤으로 리믹스`,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og/memepop-home.svg")]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="top-nav">
            <Link href="/" className="brand" style={{ fontFamily: "var(--font-display)" }}>
              MemePop
            </Link>
            <nav className="nav-links">
              <Link href="/memes">밈 목록</Link>
              <Link href="/m/eotteokharago">첫 밈 바로가기</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
