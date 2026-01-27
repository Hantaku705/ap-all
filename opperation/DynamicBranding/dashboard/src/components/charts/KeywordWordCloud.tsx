"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/utils/colors";
import { AlertCircle, Cloud } from "lucide-react";

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

interface WordItem {
  text: string;
  value: number;
  brand: string;
  color: string;
}

export function KeywordWordCloud() {
  const [data, setData] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"rising" | "top" | "all">("all");

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

  // ワードクラウド用データを生成
  const words = useMemo(() => {
    if (!data.length) return [];

    // フィルタリング
    let filtered = data;
    if (selectedBrand !== "all") {
      filtered = filtered.filter((d) => d.brand === selectedBrand);
    }
    if (selectedType !== "all") {
      filtered = filtered.filter((d) => d.queryType === selectedType);
    }

    // キーワードごとにスコアを集計
    const keywordMap = new Map<string, { value: number; brand: string; color: string }>();

    filtered.forEach((item) => {
      const score = item.extractedValue || (11 - item.rank) * 10;
      const existing = keywordMap.get(item.keyword);

      if (!existing || score > existing.value) {
        keywordMap.set(item.keyword, {
          value: score,
          brand: item.brand,
          color: BRAND_COLORS[item.brand] || item.brandColor,
        });
      }
    });

    // 配列に変換してソート
    const wordArray: WordItem[] = Array.from(keywordMap.entries()).map(
      ([text, info]) => ({
        text,
        value: info.value,
        brand: info.brand,
        color: info.color,
      })
    );

    // スコア順にソートして上位50件
    return wordArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  }, [data, selectedBrand, selectedType]);

  // フォントサイズを計算（12px〜48px）
  const getFontSize = (value: number) => {
    if (!words.length) return 16;
    const maxValue = Math.max(...words.map((w) => w.value));
    const minValue = Math.min(...words.map((w) => w.value));
    const range = maxValue - minValue || 1;
    const normalized = (value - minValue) / range;
    return Math.round(12 + normalized * 36);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            キーワードワードクラウド
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            キーワードワードクラウド
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const brands = [...new Set(data.map((d) => d.brand))];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              キーワードワードクラウド
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              関連キーワードを検索ボリュームに応じた大きさで表示
            </p>
          </div>
          <div className="flex gap-2">
            {/* タイプフィルター */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Rising + Top</option>
              <option value="rising">Rising のみ</option>
              <option value="top">Top のみ</option>
            </select>
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
        <div className="min-h-[400px] flex flex-wrap items-center justify-center gap-3 p-4">
          {words.map((word, index) => (
            <span
              key={`${word.text}-${index}`}
              className="cursor-default hover:opacity-80 transition-opacity"
              style={{
                fontSize: `${getFontSize(word.value)}px`,
                color: word.color,
                fontWeight: word.value > 50 ? "bold" : "normal",
                lineHeight: 1.2,
              }}
              title={`${word.text} (${word.brand}: ${word.value})`}
            >
              {word.text}
            </span>
          ))}

          {words.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              データがありません
            </div>
          )}
        </div>

        {/* 凡例 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-4 justify-center">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: BRAND_COLORS[brand] || "#666" }}
                />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
