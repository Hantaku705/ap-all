"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  StockResponse,
  StockPricePoint,
  CorrelationResponse,
} from "@/types/corporate.types";
import type { BuzzImpactData } from "@/app/api/corporate/buzz-impact/route";
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Newspaper, ExternalLink } from "lucide-react";

interface StockUGCChartProps {
  corporateId: number;
}

interface BuzzPostInfo {
  engagement: number;
  impact: string;
  url: string | null;
  content: string;
  stockChange: number | null;
  sentiment: string | null;
  coherence: {
    isCoherent: boolean;
    coherenceScore: number;
    coherenceLabel: string;
  };
  reliabilityScore: number;
  reliabilityLabel: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  price: number;
  priceChange: number;
  mentions: number;
  volume: number;
  buzzPost?: BuzzPostInfo;
  buzzY?: number; // For scatter plot positioning
}

// Custom marker for buzz posts on chart
const BuzzMarker = (props: {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.buzzPost) return null;

  const { buzzPost } = payload;
  const size =
    buzzPost.impact === "high" ? 12 : buzzPost.impact === "medium" ? 8 : 5;

  // 信頼度に応じた透明度
  const opacity =
    buzzPost.reliabilityScore >= 70 ? 1.0 :
    buzzPost.reliabilityScore >= 40 ? 0.6 : 0.3;

  // 整合性に応じた塗りつぶし色
  const fillColor = buzzPost.coherence?.isCoherent
    ? (buzzPost.stockChange ?? 0) >= 0 ? "#22c55e" : "#ef4444"  // 整合: 通常色
    : "#9ca3af";  // 矛盾/中立: グレー

  // 整合性に応じた枠線色
  const strokeColor = buzzPost.coherence?.isCoherent
    ? "#fff"
    : buzzPost.coherence?.coherenceScore === 50
    ? "#eab308"  // 中立: 黄色枠
    : "#ef4444"; // 矛盾: 赤枠

  return (
    <circle
      cx={cx}
      cy={cy}
      r={size}
      fill={fillColor}
      fillOpacity={opacity}
      stroke={strokeColor}
      strokeWidth={2}
      style={{ cursor: buzzPost.url ? "pointer" : "default" }}
      onClick={() => {
        if (buzzPost.url) {
          window.open(buzzPost.url, "_blank", "noopener,noreferrer");
        }
      }}
    />
  );
};

export function StockUGCChart({ corporateId }: StockUGCChartProps) {
  const [stockData, setStockData] = useState<StockPricePoint[]>([]);
  const [ugcData, setUgcData] = useState<Map<string, number>>(new Map());
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [buzzImpact, setBuzzImpact] = useState<BuzzImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<"price" | "mentions">("price");
  const [showAllPosts, setShowAllPosts] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [stockRes, correlationRes, trendsRes, buzzRes] = await Promise.all([
          fetch(`/api/corporate/${corporateId}/stock?years=2`),
          fetch(`/api/corporate/${corporateId}/stock/correlation`),
          fetch(`/api/corporate/trends`),
          fetch(`/api/corporate/buzz-impact`),
        ]);

        if (!stockRes.ok) throw new Error("Failed to fetch stock data");
        const stockJson: StockResponse = await stockRes.json();
        setStockData(stockJson.prices);

        if (correlationRes.ok) {
          const correlationJson: CorrelationResponse = await correlationRes.json();
          setCorrelation(correlationJson);
        }

        if (trendsRes.ok) {
          const trendsJson = await trendsRes.json();
          const ugcMap = new Map<string, number>();
          // /api/corporate/trends は { trends: [...], total: N } を返す
          for (const trend of trendsJson.trends || []) {
            ugcMap.set(trend.week, trend.count || 0);
          }
          setUgcData(ugcMap);
        }

        if (buzzRes.ok) {
          const buzzJson: BuzzImpactData = await buzzRes.json();
          setBuzzImpact(buzzJson);
        }
      } catch (err) {
        console.error("Error fetching stock/UGC data:", err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corporateId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>株価×UGC相関分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || stockData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>株価×UGC相関分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || "データがありません"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // バズ投稿を日付ベースのMapに変換
  const buzzPostMap = new Map<string, BuzzPostInfo>();
  if (buzzImpact) {
    for (const impact of buzzImpact.impacts) {
      buzzPostMap.set(impact.postDate, {
        engagement: impact.engagement,
        impact: impact.impact,
        url: impact.url,
        content: impact.content,
        stockChange: impact.stockChange,
        sentiment: impact.sentiment,
        coherence: impact.coherence,
        reliabilityScore: impact.reliabilityScore,
        reliabilityLabel: impact.reliabilityLabel,
      });
    }
  }

  // 週次でサンプリング（チャートが見やすくなるよう）
  const weeklyData: ChartDataPoint[] = [];
  const seenWeeks = new Set<string>();

  for (const point of stockData) {
    const date = new Date(point.date);
    const weekStart = new Date(date);
    // 月曜始まりで週キーを計算（APIと統一）
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!seenWeeks.has(weekKey)) {
      seenWeeks.add(weekKey);
      const mentions = ugcData.get(weekKey) || 0;

      // この週にバズ投稿があるか確認
      let buzzPost: BuzzPostInfo | undefined;
      const weekEndDate = new Date(weekStart);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      for (const [postDate, postInfo] of buzzPostMap.entries()) {
        const postDateObj = new Date(postDate);
        if (postDateObj >= weekStart && postDateObj <= weekEndDate) {
          // 同じ週に複数ある場合は、影響度が高いものを優先
          if (
            !buzzPost ||
            (postInfo.impact === "high" && buzzPost.impact !== "high") ||
            (postInfo.impact === "medium" && buzzPost.impact === "low")
          ) {
            buzzPost = postInfo;
          }
        }
      }

      weeklyData.push({
        date: point.date,
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        price: point.close,
        priceChange: point.change ?? 0,
        mentions,
        volume: point.volume,
        buzzPost,
        buzzY: buzzPost ? point.close : undefined,
      });
    }
  }

  // 最新の株価変動
  const latestPrice = stockData[stockData.length - 1];
  const priceChange = latestPrice?.change || 0;
  const isPriceUp = priceChange >= 0;

  // 相関サマリー
  const bestCorr = correlation?.best_correlation;
  const hasSignificantCorrelation = bestCorr && Math.abs(bestCorr.correlation_coefficient) > 0.3;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            株価×UGC相関分析
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* 現在の株価 */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">現在の株価</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">
                  ¥{latestPrice?.close.toLocaleString()}
                </span>
                <span
                  className={`text-sm flex items-center ${
                    isPriceUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPriceUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPriceUp ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 相関係数サマリー */}
        {hasSignificantCorrelation && bestCorr && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">有意な相関を検出: </span>
              {bestCorr.ugc_metric === "mention_count" ? "SNS言及数" : bestCorr.ugc_metric}
              と
              {bestCorr.stock_metric === "close_price"
                ? "株価"
                : bestCorr.stock_metric === "price_change"
                ? "株価変動率"
                : bestCorr.stock_metric}
              の間に
              <span
                className={`font-mono font-bold ${
                  bestCorr.correlation_coefficient > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {" "}
                {bestCorr.correlation_coefficient > 0 ? "+" : ""}
                {bestCorr.correlation_coefficient.toFixed(3)}
              </span>
              の相関
              {bestCorr.lag_days !== 0 && (
                <span className="text-muted-foreground">
                  （ラグ: {bestCorr.lag_days > 0 ? "+" : ""}
                  {bestCorr.lag_days}日）
                </span>
              )}
            </p>
          </div>
        )}

        {/* メトリック切り替え */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveMetric("price")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeMetric === "price"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            株価推移
          </button>
          <button
            onClick={() => setActiveMetric("mentions")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeMetric === "mentions"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            言及数比較
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />

            {/* 株価軸（左） */}
            <YAxis
              yAxisId="price"
              orientation="left"
              domain={["auto", "auto"]}
              tick={{ fontSize: 10 }}
              tickFormatter={(value: number) => `¥${(value / 1000).toFixed(1)}k`}
              label={{
                value: "株価",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: 11 },
              }}
            />

            {/* 言及数軸（右） */}
            {activeMetric === "mentions" && (
              <YAxis
                yAxisId="mentions"
                orientation="right"
                domain={[0, "auto"]}
                tick={{ fontSize: 10 }}
                label={{
                  value: "言及数",
                  angle: 90,
                  position: "insideRight",
                  style: { textAnchor: "middle", fontSize: 11 },
                }}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                // バズ投稿データを取得
                const dataPoint = payload[0]?.payload as ChartDataPoint | undefined;
                const buzzPost = dataPoint?.buzzPost;

                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
                    <p className="font-medium text-sm mb-2">{label}</p>

                    {/* 通常の価格・言及数表示 */}
                    {payload.map((entry, i) => (
                      <p key={i} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}:{" "}
                        {entry.dataKey === "price"
                          ? `¥${(entry.value as number).toLocaleString()}`
                          : entry.value?.toLocaleString()}
                      </p>
                    ))}

                    {/* バズ投稿詳細（存在する場合） */}
                    {buzzPost && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          投稿日: {dataPoint?.date}
                        </p>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                          {buzzPost.content.substring(0, 80)}...
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="bg-amber-100 text-amber-800 px-1 rounded">
                            ENG: {buzzPost.engagement.toLocaleString()}
                          </span>
                          {buzzPost.sentiment && (
                            <span className={`px-1 rounded ${
                              buzzPost.sentiment === "positive"
                                ? "bg-green-100 text-green-700"
                                : buzzPost.sentiment === "negative"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {buzzPost.sentiment === "positive" ? "positive" :
                               buzzPost.sentiment === "negative" ? "negative" : "neutral"}
                            </span>
                          )}
                          {buzzPost.coherence && (
                            <span className={`px-1 rounded ${
                              buzzPost.coherence.isCoherent
                                ? "bg-green-100 text-green-700"
                                : buzzPost.coherence.coherenceScore === 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {buzzPost.coherence.coherenceLabel}
                            </span>
                          )}
                        </div>
                        {buzzPost.stockChange !== null && (
                          <p className={`text-xs mt-1 ${
                            buzzPost.stockChange >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            翌営業日: {buzzPost.stockChange >= 0 ? "+" : ""}
                            {buzzPost.stockChange.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend />

            {/* 株価ライン */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              name="株価"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {/* バズ投稿マーカー */}
            <Scatter
              yAxisId="price"
              dataKey="buzzY"
              name="バズ投稿"
              shape={<BuzzMarker />}
              legendType="circle"
            />

            {/* 言及数バー */}
            {activeMetric === "mentions" && (
              <Bar
                yAxisId="mentions"
                dataKey="mentions"
                name="SNS言及数"
                fill="#f59e0b"
                fillOpacity={0.6}
                barSize={8}
              />
            )}

            {/* 相関ラグポイントを表示（bestCorrelationがある場合） */}
            {bestCorr && bestCorr.lag_days !== 0 && (
              <ReferenceLine
                yAxisId="price"
                x={weeklyData[weeklyData.length - 1]?.displayDate}
                stroke="#ef4444"
                strokeDasharray="5 5"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* 相関詳細テーブル */}
        {correlation && correlation.significant_correlations.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              有意な相関（p &lt; 0.05）
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="pb-2">UGC指標</th>
                    <th className="pb-2">株価指標</th>
                    <th className="pb-2">ラグ（日）</th>
                    <th className="pb-2">相関係数</th>
                    <th className="pb-2">サンプル数</th>
                  </tr>
                </thead>
                <tbody>
                  {correlation.significant_correlations.slice(0, 5).map((c, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">
                        {c.ugc_metric === "mention_count" ? "言及数" : c.ugc_metric}
                      </td>
                      <td className="py-2">
                        {c.stock_metric === "close_price"
                          ? "終値"
                          : c.stock_metric === "price_change"
                          ? "変動率"
                          : c.stock_metric}
                      </td>
                      <td className="py-2">
                        {c.lag_days > 0 ? "+" : ""}
                        {c.lag_days}
                      </td>
                      <td className="py-2">
                        <span
                          className={`font-mono font-medium ${
                            c.correlation_coefficient > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {c.correlation_coefficient > 0 ? "+" : ""}
                          {c.correlation_coefficient.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{c.sample_size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* バズ投稿 → 株価影響分析 */}
        {buzzImpact && (() => {
          const coherentImpacts = buzzImpact.impacts.filter(
            (item) => item.coherence?.isCoherent
          );
          const displayedImpacts = showAllPosts
            ? buzzImpact.impacts
            : coherentImpacts;

          return (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              バズ投稿 → 株価影響分析（ENG≥{buzzImpact.threshold}）
            </h4>

            {/* 表示切り替え */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted-foreground">
                {showAllPosts
                  ? `全${buzzImpact.impacts.length}件表示中`
                  : `整合投稿${coherentImpacts.length}件表示中`}
              </span>
              <button
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showAllPosts
                  ? "整合のみ表示"
                  : `すべて表示（${buzzImpact.impacts.length}件）`}
              </button>
            </div>

            {/* バズ投稿と翌営業日の株価変動 */}
            <div className="space-y-3 mb-4">
              {displayedImpacts.map((item, idx) => {
                const isUp = (item.stockChange ?? 0) >= 0;
                const absChange = Math.abs(item.stockChange ?? 0);
                const bgColor =
                  item.impact === "high"
                    ? isUp
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                    : item.impact === "medium"
                    ? isUp
                      ? "bg-green-50/50 border-green-100"
                      : "bg-red-50/50 border-red-100"
                    : "bg-gray-50 border-gray-200";
                const textColor =
                  item.impact === "high" || item.impact === "medium"
                    ? isUp
                      ? "text-green-800"
                      : "text-red-800"
                    : "text-gray-700";

                return (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg ${bgColor}`}
                  >
                    <div className="flex items-start gap-2">
                      {isUp ? (
                        <TrendingUp
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            absChange >= 1.5 ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <TrendingDown
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            absChange >= 1.5 ? "text-red-600" : "text-gray-400"
                          }`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${textColor}`}>
                            {item.postDate}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            ENG: {item.engagement.toLocaleString()}
                          </span>
                          {item.sentiment && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                item.sentiment === "positive"
                                  ? "bg-green-100 text-green-700"
                                  : item.sentiment === "negative"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.sentiment === "positive"
                                ? "😊"
                                : item.sentiment === "negative"
                                ? "😠"
                                : "😐"}
                            </span>
                          )}
                          {/* 整合性バッジ */}
                          {item.coherence && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                item.coherence.isCoherent
                                  ? "bg-green-100 text-green-700"
                                  : item.coherence.coherenceScore === 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.coherence.coherenceLabel}
                            </span>
                          )}
                          {/* 信頼度スコア */}
                          {item.reliabilityScore !== undefined && (
                            <span
                              className={`text-xs font-mono ${
                                item.reliabilityScore >= 70
                                  ? "text-green-600"
                                  : item.reliabilityScore >= 40
                                  ? "text-yellow-600"
                                  : "text-gray-400"
                              }`}
                            >
                              信頼度:{item.reliabilityScore}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.content}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs font-medium ${textColor}`}>
                            → 翌営業日({item.nextTradingDay}): 株価{" "}
                            <span className={isUp ? "text-green-600" : "text-red-600"}>
                              {isUp ? "+" : ""}
                              {item.stockChange?.toFixed(2)}%
                            </span>
                          </p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              元投稿
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 統計サマリー */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">分析結論</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • バズ投稿（ENG≥{buzzImpact.threshold}）:{" "}
                  <span className="font-bold">{buzzImpact.totalBuzzPosts}件</span>
                </li>
                <li>
                  • 高影響（株価±3%以上）:{" "}
                  <span className="font-bold">
                    {buzzImpact.summary.highImpact}件
                  </span>
                  （{buzzImpact.summary.highImpactRate.toFixed(1)}%）
                </li>
                <li>
                  • 中影響（株価±1.5%以上）:{" "}
                  <span className="font-bold">
                    {buzzImpact.summary.mediumImpact}件
                  </span>
                </li>
              </ul>
            </div>

            {/* 整合性チェックサマリー */}
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">整合性チェック（センチメント×株価変動）</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded text-center">
                  <p className="text-green-700 font-medium">✅ 整合</p>
                  <p className="text-green-800 font-bold text-lg">
                    {buzzImpact.summary.coherentCount ?? 0}件
                  </p>
                  <p className="text-green-600 text-[10px]">センチメント×株価一致</p>
                </div>
                <div className="p-2 bg-red-50 rounded text-center">
                  <p className="text-red-700 font-medium">❌ 矛盾</p>
                  <p className="text-red-800 font-bold text-lg">
                    {buzzImpact.summary.incoherentCount ?? 0}件
                  </p>
                  <p className="text-red-600 text-[10px]">センチメント×株価不一致</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded text-center">
                  <p className="text-yellow-700 font-medium">⚠️ 中立</p>
                  <p className="text-yellow-800 font-bold text-lg">
                    {buzzImpact.summary.neutralCount ?? 0}件
                  </p>
                  <p className="text-yellow-600 text-[10px]">判定不能</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※ 整合性が低い投稿は、株価変動との因果関係が不明確（たまたま同時期の可能性）
              </p>
            </div>

            {/* 信頼度分布 */}
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-2">信頼度分布</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <span className="text-green-600 font-medium">高信頼（70+）</span>
                  <p className="font-bold">{buzzImpact.summary.highReliability ?? 0}件</p>
                </div>
                <div className="text-center">
                  <span className="text-yellow-600 font-medium">中信頼（40-69）</span>
                  <p className="font-bold">{buzzImpact.summary.mediumReliability ?? 0}件</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-400 font-medium">低信頼（0-39）</span>
                  <p className="font-bold">{buzzImpact.summary.lowReliability ?? 0}件</p>
                </div>
              </div>
            </div>
          </div>
        ); })()}
      </CardContent>
    </Card>
  );
}
