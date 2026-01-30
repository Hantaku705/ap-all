import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AnyBrand | TikTokクリエイター向けアフィリエイトプラットフォーム",
  description:
    "高いコミッション率、豊富な商品ラインアップ、専門的サポートで、あなたのTikTok活動を収益化。日本No.1のクリエイター向けアフィリエイトプラットフォーム。",
  keywords: [
    "TikTok",
    "アフィリエイト",
    "クリエイター",
    "インフルエンサー",
    "収益化",
    "副業",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta
          name="tiktok-developers-site-verification"
          content="Jg0amCQILBERoaolxHeSA0r2HyysLhW6"
        />
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
