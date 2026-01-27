"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANDS } from "@/lib/utils/colors";
import { AlertCircle, MousePointerClick } from "lucide-react";
import { CooccurrenceInsightModal } from "./CooccurrenceInsightModal";

type CooccurrenceMatrix = Record<string, Record<string, number>>;

interface RepresentativePost {
  id: string;
  content: string;
  sentiment: string | null;
  dish: string | null;
  scene: string | null;
}

interface CooccurrencePair {
  brand1: string;
  brand2: string;
  count: number;
  representativePosts: RepresentativePost[];
  patterns: {
    dishes: string[];
    scenes: string[];
    sentiments: Record<string, number>;
  };
  insight: string;
}

// 共起件数を色に変換（0: 白, max: 濃い青）
function getHeatmapColor(value: number, max: number): string {
  if (value === 0) return "rgb(255, 255, 255)";
  const intensity = Math.min(1, value / max);
  const r = Math.round(255 - intensity * 180);
  const g = Math.round(255 - intensity * 100);
  const b = 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export function CooccurrenceHeatmap() {
  const [data, setData] = useState<CooccurrenceMatrix | null>(null);
  const [insights, setInsights] = useState<CooccurrencePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    brandA: string;
    brandB: string;
    value: number;
  } | null>(null);
  const [selectedPair, setSelectedPair] = useState<CooccurrencePair | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const [matrixRes, insightsRes] = await Promise.all([
          fetch("/api/sns/cooccurrences"),
          fetch("/api/sns/cooccurrence-insights"),
        ]);
        if (!matrixRes.ok) throw new Error("データの取得に失敗しました");
        const matrixJson = await matrixRes.json();
        setData(matrixJson);

        if (insightsRes.ok) {
          const insightsJson = await insightsRes.json();
          setInsights(insightsJson.pairs || []);
        }
      } catch (err) {
        setError("共起データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCellClick = (brandA: string, brandB: string) => {
    if (brandA === brandB) return;
    // ペアを正規化（アルファベット順でソート）
    const [b1, b2] = [brandA, brandB].sort();
    const pair = insights.find(
      (p) =>
        (p.brand1 === b1 && p.brand2 === b2) ||
        (p.brand1 === b2 && p.brand2 === b1)
    );
    if (pair) {
      setSelectedPair(pair);
    }
  };

  const hasPairInsight = (brandA: string, brandB: string): boolean => {
    const [b1, b2] = [brandA, brandB].sort();
    return insights.some(
      (p) =>
        (p.brand1 === b1 && p.brand2 === b2) ||
        (p.brand1 === b2 && p.brand2 === b1)
    );
  };

  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>共起マトリクス</CardTitle>
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
          <CardTitle>共起マトリクス</CardTitle>
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

  // 最大共起件数を取得（対角線を除く）
  let maxCount = 0;
  BRANDS.forEach((brandA) => {
    BRANDS.forEach((brandB) => {
      if (brandA !== brandB) {
        const value = data[brandA]?.[brandB] ?? 0;
        if (value > maxCount) maxCount = value;
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>共起マトリクス（SNS）</CardTitle>
        <p className="text-sm text-muted-foreground">
          同一投稿内で複数ブランドが言及された件数。味の素が調理文脈のハブとして機能。
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: `100px repeat(${BRANDS.length}, 60px)` }}
          >
            {/* ヘッダー行 */}
            <div></div>
            {BRANDS.map((brand) => (
              <div
                key={`header-${brand}`}
                className="text-xs text-center font-medium truncate px-1"
                title={brand}
              >
                {brand.slice(0, 4)}
              </div>
            ))}

            {/* データ行 */}
            {BRANDS.map((rowBrand) => (
              <>
                <div
                  key={`row-${rowBrand}`}
                  className="text-xs text-right pr-2 font-medium truncate"
                  title={rowBrand}
                >
                  {rowBrand}
                </div>
                {BRANDS.map((colBrand) => {
                  const value = data[rowBrand]?.[colBrand] ?? 0;
                  const isHovered =
                    hoveredCell?.brandA === rowBrand &&
                    hoveredCell?.brandB === colBrand;
                  const isDiagonal = rowBrand === colBrand;
                  const hasInsight = !isDiagonal && hasPairInsight(rowBrand, colBrand);

                  return (
                    <div
                      key={`${rowBrand}-${colBrand}`}
                      className={`w-[60px] h-[40px] flex items-center justify-center text-xs font-mono transition-all border border-gray-100 ${
                        isHovered ? "ring-2 ring-black ring-offset-1" : ""
                      } ${isDiagonal ? "bg-gray-100" : ""} ${hasInsight ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "cursor-default"}`}
                      style={{
                        backgroundColor: isDiagonal
                          ? "#f5f5f5"
                          : getHeatmapColor(value, maxCount),
                      }}
                      onMouseEnter={() =>
                        setHoveredCell({ brandA: rowBrand, brandB: colBrand, value })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => handleCellClick(rowBrand, colBrand)}
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
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {hoveredCell.brandA} × {hoveredCell.brandB}
            </p>
            <p className="text-lg font-mono">
              {hoveredCell.value}件
              <span className="ml-2 text-sm text-muted-foreground">
                {hoveredCell.value >= 30
                  ? "（強い共起）"
                  : hoveredCell.value >= 10
                    ? "（中程度の共起）"
                    : hoveredCell.value >= 1
                      ? "（弱い共起）"
                      : "（共起なし）"}
              </span>
            </p>
            {hasPairInsight(hoveredCell.brandA, hoveredCell.brandB) && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <MousePointerClick className="h-3 w-3" />
                クリックでインサイト表示
              </p>
            )}
          </div>
        )}

        {/* カラーバー（凡例） */}
        <div className="flex items-center justify-center mt-6">
          <span className="text-xs mr-2">0件</span>
          <div
            className="h-4 w-48 rounded"
            style={{
              background: "linear-gradient(to right, white, rgb(75, 155, 255))",
            }}
          />
          <span className="text-xs ml-2">{maxCount}件</span>
        </div>
      </CardContent>

      {/* インサイトモーダル */}
      <CooccurrenceInsightModal
        pair={selectedPair}
        onClose={() => setSelectedPair(null)}
      />
    </Card>
  );
}
