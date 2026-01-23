'use client';

import { formatNumber } from '@/lib/formatters';

interface ViewsKPICardsProps {
  totalViews: number;
  avgViews: number;
  medianViews: number;
  postCount: number;
  avgEngagement: number;
  avgRetention: number;
}

export default function ViewsKPICards({
  totalViews,
  avgViews,
  medianViews,
  postCount,
  avgEngagement,
  avgRetention,
}: ViewsKPICardsProps) {
  const cards = [
    {
      title: '総再生数',
      value: formatNumber(totalViews),
      subtitle: 'Total Views',
      color: 'bg-blue-500',
    },
    {
      title: '平均再生数',
      value: formatNumber(Math.round(avgViews)),
      subtitle: 'Avg per Post',
      color: 'bg-green-500',
    },
    {
      title: '中央再生数',
      value: formatNumber(Math.round(medianViews)),
      subtitle: 'Median',
      color: 'bg-cyan-500',
    },
    {
      title: '投稿数',
      value: formatNumber(postCount),
      subtitle: 'Posts',
      color: 'bg-purple-500',
    },
    {
      title: '平均いいね率',
      value: `${avgEngagement.toFixed(2)}%`,
      subtitle: 'Engagement',
      color: 'bg-orange-500',
    },
    {
      title: '平均視聴維持率',
      value: `${avgRetention.toFixed(1)}%`,
      subtitle: 'Retention',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-4 border-l-4"
          style={{ borderLeftColor: card.color.replace('bg-', '') }}
        >
          <div className={`w-8 h-1 ${card.color} rounded mb-2`} />
          <p className="text-xs text-gray-500 uppercase">{card.subtitle}</p>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
