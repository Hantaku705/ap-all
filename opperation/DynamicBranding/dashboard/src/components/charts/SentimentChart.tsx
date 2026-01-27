"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SentimentData {
  brand: string;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  negativeRate: number;
  total: number;
  color: string;
}

// ネガティブ率に応じた色（高いほど赤）
function getNegativeColor(rate: number): string {
  if (rate >= 4) return "#ef4444"; // 赤（危険）
  if (rate >= 2) return "#f97316"; // オレンジ（要注意）
  if (rate >= 1) return "#eab308"; // 黄色（注意）
  return "#22c55e"; // 緑（良好）
}

interface SentimentChartProps {
  brand?: string;
}

export function SentimentChart({ brand = "all" }: SentimentChartProps) {
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      setLoading(true);
      try {
        const url = brand === "all"
          ? "/api/sns/sentiments"
          : `/api/sns/sentiments?brand=${encodeURIComponent(brand)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("センチメントデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brand]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>センチメント分析</CardTitle>
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
          <CardTitle>センチメント分析</CardTitle>
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
        <CardTitle>センチメント分析（SNS）</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          ネガティブ率。味の素・アジシオが4.2%で要注意（MSG批判の波及）。
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 5]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="brand"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, _name, props) => {
                const item = props.payload as SentimentData;
                return [
                  `${value}% (${item.negativeCount}件 / ${item.total}件)`,
                  "ネガティブ率",
                ];
              }}
            />
            <ReferenceLine x={4} stroke="#ef4444" strokeDasharray="5 5" />
            <Bar dataKey="negativeRate" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getNegativeColor(entry.negativeRate)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* 凡例 */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }} />
            <span>良好 (&lt;1%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#eab308" }} />
            <span>注意 (1-2%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }} />
            <span>要注意 (2-4%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }} />
            <span>危険 (≥4%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
