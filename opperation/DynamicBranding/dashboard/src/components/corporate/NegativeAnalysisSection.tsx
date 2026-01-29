"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  NegativeAnalysisResponse,
  NegativeCategory,
  CategorySeverity,
  NegativeTrendPoint,
  NEGATIVE_CATEGORY_LABELS,
  NEGATIVE_CATEGORY_COLORS,
  NEGATIVE_TREND_LABELS,
  NEGATIVE_TREND_COLORS,
} from "@/types/corporate.types";

interface NegativeAnalysisSectionProps {
  corporateId: number;
}

export function NegativeAnalysisSection({ corporateId }: NegativeAnalysisSectionProps) {
  const [data, setData] = useState<NegativeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NegativeCategory | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/corporate/${corporateId}/negative-analysis`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corporateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        エラー: {error}
      </div>
    );
  }

  if (!data) return null;

  // 時系列チャート用のデータ変換
  const chartData = data.timeSeries.map((point) => ({
    week: point.week,
    ...point.categories,
  }));

  // カテゴリ分布用データ（未分類を除く）
  const pieData = data.categories
    .filter((c) => c.category !== "uncategorized" && c.count > 0)
    .map((c) => ({
      name: c.categoryLabel,
      value: c.count,
      category: c.category,
    }));

  return (
    <div className="space-y-8">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="総ネガティブ投稿"
          value={data.summary.totalNegative.toLocaleString()}
          subtitle={`分類済: ${data.summary.categorizedCount}件 / 未分類: ${data.summary.uncategorizedCount}件`}
        />
        <SummaryCard
          title="全体トレンド"
          value={NEGATIVE_TREND_LABELS[data.summary.overallTrend]}
          valueColor={NEGATIVE_TREND_COLORS[data.summary.overallTrend]}
          icon={getTrendIcon(data.summary.overallTrend)}
        />
        <SummaryCard
          title="最も深刻なカテゴリ"
          value={NEGATIVE_CATEGORY_LABELS[data.summary.mostCriticalCategory]}
          valueColor={NEGATIVE_CATEGORY_COLORS[data.summary.mostCriticalCategory]}
        />
        <SummaryCard
          title="分類率"
          value={`${Math.round((data.summary.categorizedCount / data.summary.totalNegative) * 100)}%`}
          subtitle={`${data.summary.categorizedCount} / ${data.summary.totalNegative}`}
        />
      </div>

      {/* 時系列チャート */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">ネガティブ投稿の時系列推移</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(v) => v.slice(5)} // "01-01" 形式
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                content={<CustomTooltip />}
              />
              {Object.keys(NEGATIVE_CATEGORY_LABELS)
                .filter((k) => k !== "uncategorized")
                .map((category) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stackId="1"
                    stroke={NEGATIVE_CATEGORY_COLORS[category as NegativeCategory]}
                    fill={NEGATIVE_CATEGORY_COLORS[category as NegativeCategory]}
                    fillOpacity={selectedCategory === null || selectedCategory === category ? 0.7 : 0.1}
                    name={NEGATIVE_CATEGORY_LABELS[category as NegativeCategory]}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {Object.entries(NEGATIVE_CATEGORY_LABELS)
            .filter(([k]) => k !== "uncategorized")
            .map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key as NegativeCategory)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === key
                    ? "ring-2 ring-offset-2 ring-gray-400"
                    : ""
                }`}
                style={{
                  backgroundColor: NEGATIVE_CATEGORY_COLORS[key as NegativeCategory] + "20",
                  color: NEGATIVE_CATEGORY_COLORS[key as NegativeCategory],
                }}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      {/* 2カラムレイアウト: 円グラフ + 深刻度テーブル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ分布円グラフ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">カテゴリ分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                  fontSize={11}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={NEGATIVE_CATEGORY_COLORS[entry.category]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 深刻度テーブル */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">カテゴリ別深刻度</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">カテゴリ</th>
                  <th className="text-right py-2 px-3">件数</th>
                  <th className="text-right py-2 px-3">平均いいね</th>
                  <th className="text-right py-2 px-3">深刻度</th>
                  <th className="text-center py-2 px-3">トレンド</th>
                </tr>
              </thead>
              <tbody>
                {data.categories
                  .filter((c) => c.category !== "uncategorized" && c.count > 0)
                  .map((category) => (
                    <tr key={category.category} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: NEGATIVE_CATEGORY_COLORS[category.category] }}
                        />
                        {category.categoryLabel}
                      </td>
                      <td className="text-right py-2 px-3">{category.count}</td>
                      <td className="text-right py-2 px-3">{category.avgLikes}</td>
                      <td className="text-right py-2 px-3">
                        <SeverityBadge score={category.severityScore} />
                      </td>
                      <td className="text-center py-2 px-3">
                        <TrendBadge trend={category.trend} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 代表的ネガティブ投稿 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">カテゴリ別 代表的ネガティブ投稿</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categories
            .filter((c) => c.category !== "uncategorized" && c.topPosts.length > 0)
            .slice(0, 6)
            .map((category) => (
              <div
                key={category.category}
                className="border rounded-lg p-4"
                style={{ borderColor: NEGATIVE_CATEGORY_COLORS[category.category] + "50" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: NEGATIVE_CATEGORY_COLORS[category.category] }}
                  />
                  <span className="font-medium text-sm">{category.categoryLabel}</span>
                  <span className="text-xs text-gray-500">({category.count}件)</span>
                </div>
                {category.topPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="mb-2 last:mb-0">
                    <p className="text-xs text-gray-600 line-clamp-3">{post.text}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>❤️ {post.likes}</span>
                      <span>{post.published.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// サマリーカード
function SummaryCard({
  title,
  value,
  subtitle,
  valueColor,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-bold" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

// カスタムTooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">{label}</div>
      {payload
        .filter((p: any) => p.value > 0)
        .map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.name}: {p.value}</span>
          </div>
        ))}
    </div>
  );
}

// 深刻度バッジ
function SeverityBadge({ score }: { score: number }) {
  let bgColor = "bg-green-100 text-green-700";
  if (score >= 70) bgColor = "bg-red-100 text-red-700";
  else if (score >= 40) bgColor = "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {score}/100
    </span>
  );
}

// トレンドバッジ
function TrendBadge({ trend }: { trend: CategorySeverity["trend"] }) {
  const config = {
    increasing: { icon: "↑", color: "text-red-500" },
    stable: { icon: "→", color: "text-gray-500" },
    decreasing: { icon: "↓", color: "text-green-500" },
  };
  const { icon, color } = config[trend];

  return (
    <span className={`text-lg font-bold ${color}`} title={NEGATIVE_TREND_LABELS[trend]}>
      {icon}
    </span>
  );
}

// トレンドアイコン
function getTrendIcon(trend: "increasing" | "stable" | "decreasing") {
  const icons = {
    increasing: <span className="text-red-500 text-xl">↑</span>,
    stable: <span className="text-gray-500 text-xl">→</span>,
    decreasing: <span className="text-green-500 text-xl">↓</span>,
  };
  return icons[trend];
}

export default NegativeAnalysisSection;
