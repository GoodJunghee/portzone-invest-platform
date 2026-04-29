import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포트존 — 주식·코인 종목 추천 플랫폼",
  description:
    "코스피·코스닥·나스닥·뉴욕증시·바이낸스·바이비트·업비트·빗썸의 단타·스윙·장타 추천 종목을 카카오 알림톡으로 받아보세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
