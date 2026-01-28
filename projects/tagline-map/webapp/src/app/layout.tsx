import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "タグラインポジショニングマップ",
  description: "シャンプー・スキンケア・リップのタグライン比較マップ",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
