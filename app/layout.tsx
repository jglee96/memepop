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
        className="min-h-screen bg-slate-50 font-['SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
      >
        <AppThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative isolate min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 flex w-[70rem] -translate-x-1/2 justify-between px-10">
              <div className="h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/15" />
              <div className="h-80 w-[32rem] rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
            </div>
            <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
              <SiteHeader />
              {children}
            </div>
          </div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
