import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "포트존 — 주식·코인 종목 추천 플랫폼",
  description:
    "코스피·코스닥·나스닥·뉴욕증시·바이낸스·바이비트·업비트·빗썸의 단타·스윙·장타 추천 종목을 카카오 알림톡으로 받아보세요.",
  manifest: "/manifest.json",
  applicationName: "PortZone",
  appleWebApp: {
    capable: true,
    title: "PortZone",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A2540" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// 빌드 시 정적 생성을 비활성화 (Prisma DATABASE_URL 미설정 환경에서 빌드 실패 방지)
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* 다크 모드 즉시 적용 (FOUC 방지) */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
