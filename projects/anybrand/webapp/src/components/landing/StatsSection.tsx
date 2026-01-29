const stats = [
  {
    value: "10,000+",
    label: "登録クリエイター",
    description: "日本全国のTikTokerが活動中",
  },
  {
    value: "500+",
    label: "提携ブランド",
    description: "人気ブランドとの独占契約多数",
  },
  {
    value: "¥5億+",
    label: "累計支払い報酬",
    description: "クリエイターへの実績",
  },
  {
    value: "98%",
    label: "満足度",
    description: "クリエイターアンケートより",
  },
];

export default function StatsSection() {
  return (
    <section className="bg-gray-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-bold text-[#ff6b6b] sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-gray-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
