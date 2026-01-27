"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANDS } from "@/lib/utils/colors";
import { AlertCircle } from "lucide-react";

type CorrelationMatrix = Record<string, Record<string, number>>;

// 相関係数を色に変換（-1: 青, 0: 白, 1: 赤）
function getHeatmapColor(value: number): string {
  if (value >= 0) {
    const intensity = Math.round(value * 200);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  } else {
    const intensity = Math.round(Math.abs(value) * 200);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  }
}

export function CorrelationHeatmap() {
  const [data, setData] = useState<CorrelationMatrix | null>(null);
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
        const res = await fetch("/api/correlations");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching correlations:", err);
        setError("相関データの読み込みに失敗しました");
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
          <CardTitle>ブランド間相関マトリクス</CardTitle>
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
          <CardTitle>ブランド間相関マトリクス</CardTitle>
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
        <CardTitle>ブランド間相関マトリクス</CardTitle>
        <p className="text-sm text-muted-foreground">
          Google Trends 262週分（過去5年）の検索スコアから算出
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          赤: 正の相関 / 青: 負の相関 / 白: 無相関
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `80px repeat(${BRANDS.length}, 60px)` }}>
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
              <div key={`row-group-${rowBrand}`} className="contents">
                <div
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

                  return (
                    <div
                      key={`${rowBrand}-${colBrand}`}
                      className={`w-[60px] h-[40px] flex items-center justify-center text-xs font-mono cursor-pointer transition-all ${
                        isHovered ? "ring-2 ring-black ring-offset-1" : ""
                      } ${isDiagonal ? "opacity-50" : ""}`}
                      style={{ backgroundColor: getHeatmapColor(value) }}
                      onMouseEnter={() =>
                        setHoveredCell({ brandA: rowBrand, brandB: colBrand, value })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {value.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ツールチップ */}
        {hoveredCell && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {hoveredCell.brandA} × {hoveredCell.brandB}
            </p>
            <p className="text-lg font-mono">
              r = {hoveredCell.value.toFixed(2)}
              <span className="ml-2 text-sm text-muted-foreground">
                {hoveredCell.value > 0.3
                  ? "（強い正の相関）"
                  : hoveredCell.value > 0.1
                    ? "（弱い正の相関）"
                    : hoveredCell.value < -0.1
                      ? "（弱い負の相関）"
                      : "（ほぼ無相関）"}
              </span>
            </p>
          </div>
        )}

        {/* カラーバー（凡例） */}
        <div className="flex items-center justify-center mt-6">
          <span className="text-xs mr-2">-1.0</span>
          <div className="h-4 w-48 bg-gradient-to-r from-blue-500 via-white to-red-500 rounded" />
          <span className="text-xs ml-2">+1.0</span>
        </div>

        {/* 定性的インサイト */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm mb-3">主要な相関パターン（定性的にも妥当）</h4>

          {/* 正の相関グループ */}
          <div className="mb-4">
            <p className="text-xs font-medium text-red-700 mb-2">正の相関（連動するブランド群）</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <span className="text-red-600 font-medium">だし連合</span>: ほんだし×コンソメ (r=0.38)
                <p className="text-xs ml-4 mt-1">→ 鍋・汁物シーズン（秋冬）に同時需要増。和洋だしの併用傾向</p>
              </li>
              <li>
                <span className="text-red-600 font-medium">うま味連合</span>: 味の素×アジシオ (r=0.35)
                <p className="text-xs ml-4 mt-1">→ 下味・仕上げの基本調味料として併用。料理の「味決め」シーンで連動</p>
              </li>
              <li>
                <span className="text-red-600 font-medium">スープベース連合</span>: コンソメ×丸鶏がらスープ (r=0.26)
                <p className="text-xs ml-4 mt-1">→ 洋風・中華スープの需要が連動。寒い時期のスープ需要</p>
              </li>
            </ul>
          </div>

          {/* 負の相関グループ */}
          <div className="mb-4">
            <p className="text-xs font-medium text-blue-700 mb-2">負の相関（対照的なブランド群）</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <span className="text-blue-600 font-medium">手作り vs 時短</span>: ほんだし×クックドゥ (r=-0.11)
                <p className="text-xs ml-4 mt-1">→ 「だしから作る派」と「合わせ調味料で時短派」の対照的な料理スタイル</p>
              </li>
              <li>
                <span className="text-blue-600 font-medium">独自ポジション</span>: 香味ペースト×他ブランド（複数で負の相関）
                <p className="text-xs ml-4 mt-1">→ 中華料理特化で独自の需要パターン。味の素(r=-0.17)、ほんだし(r=-0.15)と負の相関</p>
              </li>
            </ul>
          </div>

          {/* 施策示唆 */}
          <div className="pt-3 border-t border-blue-200">
            <p className="text-xs font-medium text-gray-700 mb-1">施策への示唆</p>
            <p className="text-xs text-muted-foreground">
              正の相関ブランドは「線」として統合訴求が有効。負の相関ブランドは異なるCEP（購買起点）でのアプローチが必要。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
