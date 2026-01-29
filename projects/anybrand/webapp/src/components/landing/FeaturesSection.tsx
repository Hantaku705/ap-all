import { Coins, Package, HeadphonesIcon, Shield, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "業界最高水準のコミッション",
    description:
      "平均25%のコミッション率。他社の2〜3倍の報酬を獲得できます。月間120万円以上を稼ぐトップクリエイターも多数在籍。",
    color: "bg-[#ff6b6b]",
  },
  {
    icon: Package,
    title: "豊富な商品ラインアップ",
    description:
      "美容、ファッション、家電、食品など500以上のブランドと提携。あなたのフォロワーに合った商品が必ず見つかります。",
    color: "bg-[#ffd93d]",
  },
  {
    icon: HeadphonesIcon,
    title: "専属サポートチーム",
    description:
      "専任のアカウントマネージャーが、コンテンツ作成から収益最大化まで徹底サポート。初心者でも安心してスタートできます。",
    color: "bg-[#4ade80]",
  },
];

const subFeatures = [
  {
    icon: Shield,
    title: "安心の日本企業運営",
    description: "日本法人が運営。請求書発行・確定申告サポートも万全。",
  },
  {
    icon: TrendingUp,
    title: "リアルタイム分析",
    description: "売上、クリック数、コンバージョン率をリアルタイムで確認。",
  },
  {
    icon: Zap,
    title: "即日承認",
    description: "最短24時間で商品アフィリエイトを開始できます。",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            AnyBrandが選ばれる<span className="text-[#ff6b6b]">3つの理由</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            クリエイターの成功を第一に考えたプラットフォーム
          </p>
        </div>

        {/* Main Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Sub Features */}
        <div className="mt-16 rounded-2xl bg-gray-50 p-8">
          <div className="grid gap-8 md:grid-cols-3">
            {subFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff6b6b]/10">
                  <feature.icon className="h-5 w-5 text-[#ff6b6b]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
