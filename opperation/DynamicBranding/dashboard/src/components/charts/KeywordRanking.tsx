"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/utils/colors";
import { AlertCircle, TrendingUp, BarChart3 } from "lucide-react";

interface KeywordData {
  keyword: string;
  queryType: "rising" | "top";
  value: string;
  extractedValue: number | null;
  rank: number;
  fetchDate: string;
  brand: string;
  brandColor: string;
}

export function KeywordRanking() {
  const [data, setData] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"rising" | "top">("rising");

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/keywords");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching keywords:", err);
        setError("関連キーワードの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>関連キーワードランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>関連キーワードランキング</CardTitle>
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

  // ブランド一覧
  const brands = [...new Set(data.map((d) => d.brand))];

  // フィルタリング
  const filteredData = data
    .filter((d) => d.queryType === selectedType)
    .filter((d) => selectedBrand === "all" || d.brand === selectedBrand)
    .sort((a, b) => {
      // まずブランド順、次にランク順
      if (selectedBrand === "all") {
        return a.rank - b.rank || a.brand.localeCompare(b.brand);
      }
      return a.rank - b.rank;
    });

  // 上位20件に制限（全ブランドの場合）
  const displayData = selectedBrand === "all"
    ? filteredData.slice(0, 30)
    : filteredData;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedType === "rising" ? (
                <TrendingUp className="h-5 w-5 text-orange-500" />
              ) : (
                <BarChart3 className="h-5 w-5 text-blue-500" />
              )}
              関連キーワードランキング
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedType === "rising"
                ? "急上昇中の検索キーワード"
                : "人気の検索キーワード"}
            </p>
          </div>
          <div className="flex gap-2">
            {/* タイプ切り替え */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedType("rising")}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  selectedType === "rising"
                    ? "bg-orange-500 text-white"
                    : "bg-white hover:bg-muted"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Rising
              </button>
              <button
                onClick={() => setSelectedType("top")}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  selectedType === "top"
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-muted"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Top
              </button>
            </div>
            {/* ブランドフィルター */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">全ブランド</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {displayData.map((item, index) => (
            <div
              key={`${item.brand}-${item.keyword}-${index}`}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* ランク */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  backgroundColor:
                    BRAND_COLORS[item.brand] || item.brandColor,
                }}
              >
                {item.rank}
              </div>

              {/* キーワード */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.keyword}</p>
                <p className="text-xs text-muted-foreground">{item.brand}</p>
              </div>

              {/* 値 */}
              <div className="text-right flex-shrink-0">
                <p
                  className={`font-mono font-bold ${
                    selectedType === "rising"
                      ? item.value === "Breakout"
                        ? "text-red-500"
                        : "text-orange-500"
                      : "text-blue-500"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}

          {displayData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              データがありません
            </div>
          )}
        </div>

        {/* サマリー */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              表示: {displayData.length} / {filteredData.length} 件
            </span>
            <span>
              取得日: {data[0]?.fetchDate || "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
