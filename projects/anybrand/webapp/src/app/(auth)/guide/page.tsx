"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Coins,
  ShoppingBag,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { faqs } from "@/data/mock-data";

export default function GuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    {
      id: "getting-started",
      icon: BookOpen,
      title: "始め方ガイド",
      description: "アカウント作成から初めての報酬獲得まで",
      color: "bg-[#ff6b6b]",
    },
    {
      id: "commission",
      icon: Coins,
      title: "コミッション体系",
      description: "報酬の仕組みと振込について",
      color: "bg-[#4ade80]",
    },
    {
      id: "products",
      icon: ShoppingBag,
      title: "商品の選び方",
      description: "効果的な商品選定のコツ",
      color: "bg-[#ffd93d]",
    },
    {
      id: "faq",
      icon: HelpCircle,
      title: "よくある質問",
      description: "FAQ・トラブルシューティング",
      color: "bg-[#60a5fa]",
    },
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "アカウント登録",
      description: "メールアドレスとTikTokアカウントで簡単登録。審査には1〜3営業日かかります。",
    },
    {
      step: 2,
      title: "プロフィール設定",
      description: "振込先の銀行口座と、SNSアカウント情報を設定します。",
    },
    {
      step: 3,
      title: "商品を選ぶ",
      description: "500以上の商品から、あなたのフォロワーに合った商品を選びましょう。",
    },
    {
      step: 4,
      title: "申請・承認",
      description: "気になる商品にアフィリエイト申請。承認後、専用リンクが発行されます。",
    },
    {
      step: 5,
      title: "コンテンツ投稿",
      description: "商品を紹介するコンテンツを作成し、アフィリエイトリンクを設置。",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ガイド・ヘルプ</h1>
        <p className="mt-1 text-sm text-gray-500">
          AnyBrandの使い方とよくある質問
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="質問やキーワードで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
        />
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setActiveSection(activeSection === category.id ? null : category.id)
            }
            className={`group rounded-xl bg-white p-6 shadow-sm text-left transition-all hover:-translate-y-1 hover:shadow-md ${
              activeSection === category.id ? "ring-2 ring-[#ff6b6b]" : ""
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color}`}
            >
              <category.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 font-medium text-gray-900">{category.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{category.description}</p>
          </button>
        ))}
      </div>

      {/* Getting Started Section */}
      {(activeSection === "getting-started" || !activeSection) && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BookOpen className="h-5 w-5 text-[#ff6b6b]" />
            始め方ガイド
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            5ステップでアフィリエイトを始めましょう
          </p>

          <div className="mt-6 space-y-4">
            {gettingStartedSteps.map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-lg border border-gray-100 p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b6b] text-lg font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Section */}
      {(activeSection === "commission" || !activeSection) && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Coins className="h-5 w-5 text-[#4ade80]" />
            コミッション体系
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-[#ff6b6b]/10 to-[#ff6b6b]/5 p-4">
              <p className="text-3xl font-bold text-[#ff6b6b]">15-30%</p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                商品別コミッション率
              </p>
              <p className="mt-1 text-xs text-gray-500">
                業界標準より高い報酬率
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-[#4ade80]/10 to-[#4ade80]/5 p-4">
              <p className="text-3xl font-bold text-[#4ade80]">¥5,000〜</p>
              <p className="mt-2 text-sm font-medium text-gray-900">最低振込額</p>
              <p className="mt-1 text-xs text-gray-500">
                少額からでも振込可能
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-[#60a5fa]/10 to-[#60a5fa]/5 p-4">
              <p className="text-3xl font-bold text-[#60a5fa]">毎月15日</p>
              <p className="mt-2 text-sm font-medium text-gray-900">振込日</p>
              <p className="mt-1 text-xs text-gray-500">
                前月分を翌月15日に振込
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">コミッション計算例</h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">商品価格</span>
                <span className="text-gray-900">¥4,980</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">コミッション率</span>
                <span className="text-gray-900">25%</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-900">あなたの報酬</span>
                <span className="font-bold text-[#ff6b6b]">¥1,245</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {(activeSection === "faq" || !activeSection || searchQuery) && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <HelpCircle className="h-5 w-5 text-[#60a5fa]" />
            よくある質問
          </h2>

          <div className="mt-6 space-y-3">
            {filteredFaqs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                該当する質問が見つかりませんでした
              </p>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-lg border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === faq.id ? null : faq.id)
                    }
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tips Section */}
      {(activeSection === "products" || !activeSection) && (
        <div className="rounded-xl bg-gradient-to-r from-[#ff6b6b]/10 to-[#ffd93d]/10 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShoppingBag className="h-5 w-5 text-[#ffd93d]" />
            商品選びのコツ
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4ade80]" />
              <p className="text-sm text-gray-700">
                <strong>フォロワー層に合った商品を選ぶ</strong> -
                美容系アカウントならコスメ、ライフスタイル系ならホーム用品など
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4ade80]" />
              <p className="text-sm text-gray-700">
                <strong>実際に使用してレビューする</strong> -
                本音の感想が視聴者に響きます
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4ade80]" />
              <p className="text-sm text-gray-700">
                <strong>コミッション率だけで選ばない</strong> -
                売れやすさとのバランスが重要
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4ade80]" />
              <p className="text-sm text-gray-700">
                <strong>PR表記を忘れずに</strong> - 景品表示法に基づき、必ず「PR」と明示
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">
          お探しの情報が見つからない場合
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          担当アカウントマネージャーまたはサポートチームにお問い合わせください。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:support@anybrand.jp"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            メールで問い合わせ
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#ee5a5a]"
          >
            チャットサポート
          </a>
        </div>
      </div>
    </div>
  );
}
