import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://portzone-invest-platform.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "포트존 — 주식·코인 종목 추천 플랫폼",
    template: "%s | 포트존",
  },
  description:
    "코스피·코스닥·나스닥·뉴욕증시·바이낸스·바이비트·업비트·빗썸의 단타·스윙·장타 추천 종목을 카카오 알림톡으로 받아보세요. 7일 무료 체험.",
  keywords: [
    "주식 추천", "코인 추천", "단타", "스윙", "장타",
    "코스피", "코스닥", "나스닥", "뉴욕증시",
    "바이낸스", "바이비트", "업비트", "빗썸",
    "카카오 알림톡", "종목 추천", "포트존",
  ],
  authors: [{ name: "PortZone" }],
  creator: "PortZone",
  publisher: "PortZone",
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
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "PortZone",
    title: "포트존 — 주식·코인 종목 추천 플랫폼",
    description:
      "8개 시장의 단타·스윙·장타 추천을 카카오 알림톡으로. 7일 무료 체험.",
    images: [{ url: "/icons/icon-512.svg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "포트존 — 주식·코인 종목 추천",
    description: "8개 시장의 추천 종목을 알림톡으로",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
