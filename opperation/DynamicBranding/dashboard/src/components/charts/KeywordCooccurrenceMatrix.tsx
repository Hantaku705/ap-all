"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/utils/colors";
import { AlertCircle, Grid3X3 } from "lucide-react";

interface CooccurrenceKeyword {
  keyword: string;
  brandCount: number;
  totalScore: number;
  brandNames: string[];
  brandColors: string[];
  analysisDate: string;
}

interface CooccurrenceData {
  keywords: CooccurrenceKeyword[];
  matrix: Record<string, Record<string, number>>;
  brands: string[];
}

// 共起件数を色に変換
function getHeatmapColor(value: number, max: number): string {
  if (value === 0) return "rgb(255, 255, 255)";
  const intensity = Math.min(1, value / max);
  const r = Math.round(255 - intensity * 180);
  const g = Math.round(255 - intensity * 100);
  const b = 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export function KeywordCooccurrenceMatrix() {
  const [data, setData] = useState<CooccurrenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    brandA: string;
    brandB: string;
    value: number;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/keywords/cooccurrences");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching cooccurrences:", err);
        setError("共起データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            キーワード共起マトリクス
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
            <Grid3X3 className="h-5 w-5" />
            キーワード共起マトリクス
          </CardTitle>
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

  const { brands, matrix, keywords } = data;

  // 最大共起件数を取得
  let maxCount = 0;
  brands.forEach((brandA) => {
    brands.forEach((brandB) => {
      if (brandA !== brandB) {
        const value = matrix[brandA]?.[brandB] ?? 0;
        if (value > maxCount) maxCount = value;
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          キーワード共起マトリクス
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          複数ブランドで共通して出現する関連キーワードの数
        </p>
      </CardHeader>
      <CardContent>
        {/* ヒートマップ */}
        <div className="overflow-x-auto mb-6">
          <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: `100px repeat(${brands.length}, 60px)` }}
          >
            {/* ヘッダー行 */}
            <div></div>
            {brands.map((brand) => (
              <div
                key={`header-${brand}`}
                className="text-xs text-center font-medium truncate px-1"
                title={brand}
              >
                {brand.slice(0, 4)}
              </div>
            ))}

            {/* データ行 */}
            {brands.map((rowBrand) => (
              <>
                <div
                  key={`row-${rowBrand}`}
                  className="text-xs text-right pr-2 font-medium truncate"
                  title={rowBrand}
                >
                  {rowBrand}
                </div>
                {brands.map((colBrand) => {
                  const value = matrix[rowBrand]?.[colBrand] ?? 0;
                  const isHovered =
                    hoveredCell?.brandA === rowBrand &&
                    hoveredCell?.brandB === colBrand;
                  const isDiagonal = rowBrand === colBrand;

                  return (
                    <div
                      key={`${rowBrand}-${colBrand}`}
                      className={`w-[60px] h-[40px] flex items-center justify-center text-xs font-mono cursor-pointer transition-all border border-gray-100 ${
                        isHovered ? "ring-2 ring-black ring-offset-1" : ""
                      } ${isDiagonal ? "bg-gray-100" : ""}`}
                      style={{
                        backgroundColor: isDiagonal
                          ? "#f5f5f5"
                          : getHeatmapColor(value, maxCount),
                      }}
                      onMouseEnter={() =>
                        setHoveredCell({ brandA: rowBrand, brandB: colBrand, value })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isDiagonal ? "-" : value}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* ツールチップ */}
        {hoveredCell && hoveredCell.brandA !== hoveredCell.brandB && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {hoveredCell.brandA} × {hoveredCell.brandB}
            </p>
            <p className="text-lg font-mono">
              共通キーワード: {hoveredCell.value}件
            </p>
          </div>
        )}

        {/* カラーバー */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-xs mr-2">0件</span>
          <div
            className="h-4 w-48 rounded"
            style={{
              background: "linear-gradient(to right, white, rgb(75, 155, 255))",
            }}
          />
          <span className="text-xs ml-2">{maxCount}件</span>
        </div>

        {/* 共通キーワードリスト */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">
            複数ブランドで出現するキーワード（上位10件）
          </h4>
          <div className="space-y-2">
            {keywords.slice(0, 10).map((kw, index) => (
              <div
                key={kw.keyword}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
              >
                <span className="text-xs font-mono text-muted-foreground w-6">
                  {index + 1}
                </span>
                <span className="font-medium flex-1">{kw.keyword}</span>
                <div className="flex gap-1">
                  {kw.brandNames.map((brand, i) => (
                    <div
                      key={brand}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{
                        backgroundColor: BRAND_COLORS[brand] || kw.brandColors[i],
                      }}
                      title={brand}
                    >
                      {brand.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {kw.brandCount}ブランド
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
