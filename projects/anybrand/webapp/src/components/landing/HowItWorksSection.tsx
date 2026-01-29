import { UserPlus, Search, Video, Banknote } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "無料登録",
    description:
      "メールアドレスとTikTokアカウントを登録。最短1分で完了します。審査は24時間以内に完了。",
  },
  {
    step: "02",
    icon: Search,
    title: "商品を選ぶ",
    description:
      "500以上のブランドから、あなたのフォロワーに合った商品を選択。コミッション率や人気度を確認できます。",
  },
  {
    step: "03",
    icon: Video,
    title: "TikTokで紹介",
    description:
      "商品のアフィリエイトリンクを取得して、TikTokで紹介。動画やライブコマースで自由に宣伝。",
  },
  {
    step: "04",
    icon: Banknote,
    title: "報酬を獲得",
    description:
      "視聴者が購入すると報酬が発生。リアルタイムで確認でき、毎月末に自動振込。",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="text-[#ff6b6b]">4ステップ</span>で始める
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            今すぐ無料で登録して、TikTokで稼ぎ始めましょう
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gray-200 lg:block" />

            <div className="space-y-12 lg:space-y-24">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center gap-8 lg:flex-row ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    <div
                      className={`inline-flex flex-col items-center lg:items-${
                        index % 2 === 0 ? "end" : "start"
                      }`}
                    >
                      <span className="text-sm font-bold text-[#ff6b6b]">
                        STEP {step.step}
                      </span>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-md text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg lg:flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b6b]">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden flex-1 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
