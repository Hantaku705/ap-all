"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "登録に費用はかかりますか？",
    answer:
      "いいえ、AnyBrandへの登録は完全無料です。初期費用、月額費用、手数料なども一切かかりません。報酬から差し引かれることもありませんので、安心してご利用ください。",
  },
  {
    question: "TikTokのフォロワー数に条件はありますか？",
    answer:
      "フォロワー数1,000人以上のTikTokアカウントが必要です。ただし、フォロワー数が少なくても、エンゲージメント率が高い場合は審査に通る可能性があります。まずは登録してみてください。",
  },
  {
    question: "報酬の支払いはいつですか？",
    answer:
      "報酬は毎月末に締め、翌月15日に指定口座へお振込みします。最低支払い金額は5,000円です。振込手数料はAnyBrandが負担しますので、報酬は全額受け取れます。",
  },
  {
    question: "どのような商品を紹介できますか？",
    answer:
      "美容・コスメ、ファッション、家電・ガジェット、食品・健康など、500以上のブランドの商品を紹介できます。商品カタログから自由に選択でき、あなたのフォロワー層に合った商品を見つけることができます。",
  },
  {
    question: "確定申告のサポートはありますか？",
    answer:
      "はい、年間の報酬支払い明細を発行しています。また、確定申告に関するガイドも用意しており、必要に応じて税理士への相談サポートも行っています。",
  },
  {
    question: "他のアフィリエイトサービスと併用できますか？",
    answer:
      "はい、AnyBrandは他のアフィリエイトサービスとの併用が可能です。ただし、同一投稿内で複数のアフィリエイトリンクを掲載する場合は、各サービスの規約をご確認ください。",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            よくある<span className="text-[#ff6b6b]">質問</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ご不明な点がありましたらお気軽にお問い合わせください
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            お探しの回答が見つかりませんか？
          </p>
          <a
            href="mailto:support@anybrand.jp"
            className="mt-2 inline-block font-medium text-[#ff6b6b] hover:text-[#ee5a5a]"
          >
            サポートに問い合わせる →
          </a>
        </div>
      </div>
    </section>
  );
}
