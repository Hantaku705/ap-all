"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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
import { SeasonalityInsightSummary } from "./SeasonalityInsightSummary";

interface SeasonalityData {
  month: number;
  monthName: string;
  [key: string]: string | number;
}

interface SeasonalityChartProps {
  initialBrand?: string; // 初期選択ブランド
  hideSelector?: boolean; // セレクター非表示
}

export function SeasonalityChart({
  initialBrand,
  hideSelector = false,
}: SeasonalityChartProps = {}) {
  const [data, setData] = useState<SeasonalityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | "all">(
    initialBrand || "all"
  );

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/seasonality");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching seasonality:", err);
        setError("季節性データの読み込みに失敗しました");
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
          <CardTitle>月別検索パターン</CardTitle>
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
          <CardTitle>月別検索パターン</CardTitle>
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

  const displayBrands =
    selectedBrand === "all" ? BRANDS : [selectedBrand as string];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {initialBrand
              ? `${initialBrand} - 月別検索パターン`
              : "月別検索パターン（季節性）"}
          </CardTitle>
          {!hideSelector && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md bg-background"
            >
              <option value="all">全ブランド</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}
        </div>
        <SeasonalityInsightSummary brand={selectedBrand} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
            <YAxis
              domain={selectedBrand === "all" ? [0, 100] : ["auto", "auto"]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? value.toFixed(1) : value,
              ]}
            />
            <Legend />
            {displayBrands.map((brand) => (
              <Bar
                key={brand}
                dataKey={brand}
                fill={BRAND_COLORS[brand]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
