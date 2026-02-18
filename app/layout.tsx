import type { Metadata } from "next";

import { AppThemeProvider } from "@/app/providers/theme-provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/shared/config/site";
import { SiteHeader } from "@/widgets/site-header";

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
    <html lang="ko" suppressHydrationWarning>
      <body
        className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 font-['SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-slate-800 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100"
      >
        <AppThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <SiteHeader />
            {children}
          </div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
