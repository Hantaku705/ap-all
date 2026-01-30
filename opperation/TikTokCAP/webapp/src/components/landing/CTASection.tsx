import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "完全無料で登録",
  "24時間以内に審査完了",
  "業界最高水準のコミッション",
  "専属サポート付き",
];

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNCAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            今すぐ始めよう
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            10,000人以上のクリエイターが AnyBrand で収益を上げています。
            <br />
            あなたも今日からTikTokで稼ぎ始めましょう。
          </p>

          {/* Benefits */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-[#ff6b6b] shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              無料で登録する
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/guide"
              className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
            >
              詳しく見る
            </Link>
          </div>

          {/* Trust Note */}
          <p className="mt-8 text-sm text-white/70">
            登録は1分で完了。クレジットカード不要。
          </p>
        </div>
      </div>
    </section>
  );
}
