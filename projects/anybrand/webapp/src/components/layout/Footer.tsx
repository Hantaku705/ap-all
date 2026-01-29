import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & About */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b6b]">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-bold text-white">AnyBrand</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              TikTok公式アフィリエイトパートナー。
              クリエイターの収益最大化を支援するプラットフォームです。
            </p>
          </div>

          {/* Guide Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              ガイド
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/guide/getting-started"
                  className="text-sm hover:text-white"
                >
                  始め方
                </Link>
              </li>
              <li>
                <Link
                  href="/guide/affiliate-program"
                  className="text-sm hover:text-white"
                >
                  アフィリエイトプログラム
                </Link>
              </li>
              <li>
                <Link
                  href="/guide/commission"
                  className="text-sm hover:text-white"
                >
                  コミッション体系
                </Link>
              </li>
              <li>
                <Link href="/guide/faq" className="text-sm hover:text-white">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              会社情報
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm hover:text-white">
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              お問い合わせ
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:support@anybrand.jp"
                  className="text-sm hover:text-white"
                >
                  support@anybrand.jp
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-white">公式SNS</h4>
              <div className="mt-2 flex items-center gap-4">
                <a
                  href="https://www.tiktok.com/@anybrand_jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white"
                >
                  TikTok
                </a>
                <a
                  href="https://twitter.com/anybrand_jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://line.me/anybrand"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white"
                >
                  LINE
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © 2025 AnyBrand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
