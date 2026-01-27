"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS, BRANDS } from "@/lib/utils/colors";
import { AlertCircle } from "lucide-react";

interface TrendData {
  date: string;
  [key: string]: string | number;
}

type DataSource = "google" | "sns";

// スケルトンローダーコンポーネント
function ChartSkeleton() {
  return (
    <div className="h-[400px] relative overflow-hidden">
      {/* Y軸スケルトン */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between py-4">
        {[100, 80, 60, 40, 20, 0].map((val) => (
          <div key={val} className="h-3 w-8 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* グラフ領域スケルトン */}
      <div className="absolute left-14 right-4 top-4 bottom-8 flex items-end gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded-t animate-pulse"
            style={{
              height: `${30 + Math.sin(i * 0.5) * 20 + Math.random() * 30}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
      {/* X軸スケルトン */}
      <div className="absolute left-14 right-4 bottom-0 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 w-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* 凡例スケルトン */}
      <div className="absolute right-4 top-4 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-16 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}

interface TrendLineChartProps {
  brandFilter?: string; // 単一ブランドモード
  showSourceToggle?: boolean; // データソース切り替えの表示（デフォルト: true）
  compact?: boolean; // コンパクトモード（デフォルト: false）
}

export function TrendLineChart({
  brandFilter,
  showSourceToggle = true,
  compact = false,
}: TrendLineChartProps = {}) {
  const [dataSource, setDataSource] = useState<DataSource>("google");
  const [googleData, setGoogleData] = useState<TrendData[]>([]);
  const [snsData, setSnsData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [snsLoading, setSnsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(
    new Set(brandFilter ? [brandFilter] : BRANDS)
  );
  const [excludeCampaign, setExcludeCampaign] = useState(false);

  // brandFilterが指定されている場合、visibleBrandsを更新
  useEffect(() => {
    if (brandFilter) {
      setVisibleBrands(new Set([brandFilter]));
    }
  }, [brandFilter]);

  // Google Trendsデータ取得
  useEffect(() => {
    async function fetchGoogleData() {
      setError(null);
      try {
        const res = await fetch("/api/trends");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setGoogleData(json);
      } catch (err) {
        console.error("Error fetching Google trends:", err);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchGoogleData();
  }, []);

  // SNSトレンドデータ取得（キャンペーン除外フラグ対応）
  useEffect(() => {
    async function fetchSnsData() {
      setSnsLoading(true);
      try {
        const params = new URLSearchParams();
        if (excludeCampaign) {
          params.set("excludeCampaign", "true");
        }
        const res = await fetch(`/api/sns/trends?${params}`);
        if (!res.ok) throw new Error("SNSデータの取得に失敗しました");
        const json = await res.json();
        setSnsData(json);
      } catch (err) {
        console.error("Error fetching SNS trends:", err);
      } finally {
        setSnsLoading(false);
      }
    }
    fetchSnsData();
  }, [excludeCampaign]);

  const toggleBrand = (brand: string) => {
    setVisibleBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  // 現在のデータソースに応じたデータを取得
  const currentData = dataSource === "google" ? googleData : snsData;
  const isCurrentLoading = dataSource === "google" ? loading : snsLoading;

  // Y軸のドメインを計算（SNSは自動スケール）
  const yAxisDomain: [number, number | "auto"] =
    dataSource === "google" ? [0, 100] : [0, "auto"];

  // タイトルを切り替え
  const title =
    dataSource === "google"
      ? "検索トレンド推移（過去5年）"
      : "SNS言及数トレンド（週次）";

  if (loading && dataSource === "google") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検索トレンド推移</CardTitle>
          {/* ブランドボタンスケルトン */}
          <div className="flex flex-wrap gap-2 mt-4">
            {BRANDS.map((brand, i) => (
              <div
                key={brand}
                className="h-7 w-20 bg-muted rounded-full animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error && dataSource === "google") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検索トレンド推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              再読み込み
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* ブランドフィルター（単一ブランドモードでは非表示）- 最上部に配置 */}
          {!brandFilter && (
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    visibleBrands.has(brand)
                      ? "text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  style={{
                    backgroundColor: visibleBrands.has(brand)
                      ? BRAND_COLORS[brand]
                      : undefined,
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

          {/* データソース切り替えタブ */}
          {showSourceToggle && (
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setDataSource("google")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dataSource === "google"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Google Trends
                </button>
                <button
                  onClick={() => setDataSource("sns")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dataSource === "sns"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  SNS言及数
                </button>
              </div>
              {/* キャンペーン除外トグル（SNSモード時のみ表示） */}
              {dataSource === "sns" && (
                <label className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeCampaign}
                    onChange={(e) => setExcludeCampaign(e.target.checked)}
                    className="rounded border-amber-400"
                  />
                  <span className="text-sm font-medium text-amber-800">
                    キャンペーン除外
                  </span>
                </label>
              )}
            </div>
          )}

          <CardTitle>
            {brandFilter ? `${brandFilter} - ${title}` : title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isCurrentLoading ? (
          <ChartSkeleton />
        ) : currentData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value) =>
                  dataSource === "google"
                    ? [value as number, "検索スコア"]
                    : [`${value as number}件`, "言及数"]
                }
              />
              <Legend />
              {BRANDS.filter((brand) => visibleBrands.has(brand)).map((brand) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={BRAND_COLORS[brand]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
