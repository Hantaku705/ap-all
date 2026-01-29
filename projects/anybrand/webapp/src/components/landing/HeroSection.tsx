import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNCAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b6b]/10 px-4 py-2 text-sm text-[#ff6b6b]">
              <span className="flex h-2 w-2 rounded-full bg-[#ff6b6b]" />
              TikTok公式アフィリエイトパートナー
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              TikTokで稼ぐなら
              <br />
              <span className="text-[#ff6b6b]">AnyBrand</span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 sm:text-xl">
              高いコミッション率、豊富な商品ラインアップ、専門的サポートで、
              あなたのTikTok活動を収益化。
              <br />
              日本No.1のクリエイター向けアフィリエイトプラットフォーム。
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-[#ff6b6b] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#ee5a5a] hover:shadow-lg hover:shadow-[#ff6b6b]/25"
              >
                無料で始める
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="flex items-center gap-2 rounded-full border border-gray-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:border-gray-400 hover:bg-white/5">
                <Play className="h-5 w-5" />
                使い方を見る
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-col items-center gap-4 lg:items-start">
              <p className="text-sm text-gray-400">登録クリエイター数</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-800 bg-gradient-to-br from-gray-600 to-gray-700 text-sm font-medium text-white"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xl font-bold text-white">10,000+</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="relative">
            <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-lg">
              <div className="grid gap-6 sm:grid-cols-2">
                <StatCard
                  value="¥120万+"
                  label="月間最高報酬"
                  color="text-[#ff6b6b]"
                />
                <StatCard
                  value="25%"
                  label="平均コミッション率"
                  color="text-[#ffd93d]"
                />
                <StatCard
                  value="500+"
                  label="取扱ブランド数"
                  color="text-[#4ade80]"
                />
                <StatCard
                  value="98%"
                  label="クリエイター満足度"
                  color="text-[#60a5fa]"
                />
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -right-4 -top-4 rounded-full bg-[#ffd93d] px-4 py-2 text-sm font-bold text-gray-900 shadow-lg">
              業界最高水準
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-6 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-2 text-sm text-gray-400">{label}</p>
    </div>
  );
}
