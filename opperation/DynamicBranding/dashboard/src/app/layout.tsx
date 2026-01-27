import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DynamicBranding ダッシュボード",
  description: "味の素グループ ブランド分析ダッシュボード",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
