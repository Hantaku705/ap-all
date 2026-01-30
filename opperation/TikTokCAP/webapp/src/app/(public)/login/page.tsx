"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

// TikTokアイコンコンポーネント
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTikTokLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("tiktok", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("TikTok login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6b6b]">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">AnyBrand</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              アカウントにログイン
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              TikTokアカウントで簡単にログインできます
            </p>
          </div>

          {/* TikTok Login Button - Primary */}
          <div className="mt-10">
            <button
              type="button"
              onClick={handleTikTokLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TikTokIcon className="h-6 w-6" />
              {isLoading ? "ログイン中..." : "TikTokでログイン"}
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  TikTokアカウントと連携
                </p>
                <p className="text-xs text-gray-500">
                  フォロワー数・動画数を自動取得
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  パスワード不要
                </p>
                <p className="text-xs text-gray-500">
                  セキュアなOAuth認証でログイン
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  即座に商品申請可能
                </p>
                <p className="text-xs text-gray-500">
                  ログイン後すぐにアフィリエイト開始
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-gray-500">
            ログインすることで、
            <Link href="/terms" className="text-[#ff6b6b] hover:underline">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="text-[#ff6b6b] hover:underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a]">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h3 className="text-3xl font-bold">TikTokで稼ぐなら AnyBrand</h3>
            <p className="mt-4 max-w-md text-center text-lg text-white/90">
              10,000人以上のクリエイターが利用中。
              業界最高水準のコミッションで、あなたの収益を最大化します。
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold">25%</p>
                <p className="mt-1 text-sm text-white/80">平均コミッション率</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">¥120万+</p>
                <p className="mt-1 text-sm text-white/80">月間最高報酬</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
