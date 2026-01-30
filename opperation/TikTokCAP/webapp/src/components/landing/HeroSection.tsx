import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f3f3f3]">
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF0050]/10 px-4 py-2 text-sm text-[#FF0050]">
            <span className="flex h-2 w-2 rounded-full bg-[#FF0050]" />
            TikTok公式アフィリエイトパートナー
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            TikTokで稼ぐなら
            <br />
            <span className="text-[#FF0050]">AnyBrand</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            高いコミッション率、豊富な商品ラインアップ、専門的サポートで、
            あなたのTikTok活動を収益化。
            <br />
            日本No.1のクリエイター向けアフィリエイトプラットフォーム。
          </p>

          <div className="mt-10">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-[#FF0050] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#e6004a] hover:shadow-lg hover:shadow-[#FF0050]/25"
            >
              無料で始める
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
