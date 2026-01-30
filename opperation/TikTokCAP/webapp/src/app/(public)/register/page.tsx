"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, AtSign, CheckCircle } from "lucide-react";

const steps = [
  { id: 1, name: "基本情報" },
  { id: 2, name: "TikTok連携" },
  { id: 3, name: "完了" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tiktokUsername: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Supabase登録を実装
    setTimeout(() => {
      setCurrentStep(3);
      setIsLoading(false);
    }, 1500);
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
              無料アカウント作成
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/login"
                className="font-medium text-[#ff6b6b] hover:text-[#ee5a5a]"
              >
                ログイン
              </Link>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      currentStep > step.id
                        ? "bg-[#ff6b6b] text-white"
                        : currentStep === step.id
                        ? "border-2 border-[#ff6b6b] text-[#ff6b6b]"
                        : "border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      currentStep >= step.id
                        ? "font-medium text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-8 ${
                        currentStep > step.id ? "bg-[#ff6b6b]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="mt-8 space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  お名前
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="山田 太郎"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  パスワード
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="8文字以上"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-[#ff6b6b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#ee5a5a] focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:ring-offset-2"
              >
                次へ
              </button>
            </form>
          )}

          {/* Step 2: TikTok Link */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* TikTok Username */}
              <div>
                <label
                  htmlFor="tiktokUsername"
                  className="block text-sm font-medium text-gray-700"
                >
                  TikTokユーザー名
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <AtSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="tiktokUsername"
                    name="tiktokUsername"
                    type="text"
                    required
                    value={formData.tiktokUsername}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="your_tiktok_username"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  @なしでユーザー名のみ入力してください
                </p>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#ff6b6b] focus:ring-[#ff6b6b]"
                />
                <label
                  htmlFor="agreeTerms"
                  className="ml-2 block text-sm text-gray-700"
                >
                  <Link
                    href="/terms"
                    className="text-[#ff6b6b] hover:text-[#ee5a5a]"
                  >
                    利用規約
                  </Link>
                  と
                  <Link
                    href="/privacy"
                    className="text-[#ff6b6b] hover:text-[#ee5a5a]"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex flex-1 justify-center rounded-lg bg-[#ff6b6b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#ee5a5a] focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "登録中..." : "登録する"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="mt-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">
                登録が完了しました！
              </h3>
              <p className="mt-2 text-gray-600">
                確認メールを送信しました。
                <br />
                メール内のリンクをクリックして認証を完了してください。
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#ff6b6b] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ee5a5a]"
              >
                ダッシュボードへ
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a]">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h3 className="text-3xl font-bold">1分で登録完了</h3>
            <p className="mt-4 max-w-md text-center text-lg text-white/90">
              完全無料で始められます。
              クレジットカードの登録は不要です。
            </p>
            <div className="mt-12 space-y-4">
              <Feature text="業界最高水準のコミッション率" />
              <Feature text="500以上の提携ブランド" />
              <Feature text="専属サポートチーム" />
              <Feature text="リアルタイム分析ダッシュボード" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
