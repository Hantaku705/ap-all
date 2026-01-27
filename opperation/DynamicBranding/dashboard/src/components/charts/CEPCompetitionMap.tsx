"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface CompetitionData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  brand_count: number;
  hhi: number;
  concentration: "low" | "medium" | "high";
  dominant_brand: string | null;
  dominant_share: number;
  brand_shares: { brand: string; mentions: number; share: number }[];
}

interface ApiResponse {
  data: CompetitionData[];
}

const CONCENTRATION_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

const CONCENTRATION_LABELS = {
  low: "競争的",
  medium: "やや集中",
  high: "寡占",
};

export function CEPCompetitionMap() {
  const [data, setData] = useState<CompetitionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/ceps/competition");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json: ApiResponse = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Error fetching competition:", err);
        setError("競争状況データの読み込みに失敗しました");
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
          <CardTitle>CEP競争マップ</CardTitle>
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
          <CardTitle>CEP競争マップ</CardTitle>
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

  // 散布図用データ（x: 市場規模, y: HHI, z: ブランド数）
  const chartData = data.map((d) => ({
    ...d,
    x: d.total_mentions,
    y: d.hhi,
    z: d.brand_count * 100,
  }));

  const avgMentions = data.reduce((sum, d) => sum + d.total_mentions, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CEP競争マップ</CardTitle>
        <p className="text-sm text-muted-foreground">
          横軸: 市場規模（言及数）、縦軸: 集中度（HHI）、バブルサイズ: 参入ブランド数
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="言及数"
              tick={{ fontSize: 12 }}
              label={{ value: "市場規模（言及数）", position: "bottom", offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="HHI"
              domain={[0, 10000]}
              tick={{ fontSize: 12 }}
              label={{ value: "集中度（HHI）", angle: -90, position: "insideLeft" }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as CompetitionData;
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-sm min-w-[200px]">
                    <p className="font-medium">{item.cep_name}</p>
                    <div className="mt-2 space-y-1">
                      <p>言及数: <span className="font-medium">{item.total_mentions.toLocaleString()}</span></p>
                      <p>参入ブランド: <span className="font-medium">{item.brand_count}</span></p>
                      <p>
                        集中度:
                        <span
                          className="ml-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${CONCENTRATION_COLORS[item.concentration]}20`,
                            color: CONCENTRATION_COLORS[item.concentration],
                          }}
                        >
                          {CONCENTRATION_LABELS[item.concentration]}（HHI: {item.hhi}）
                        </span>
                      </p>
                      {item.dominant_brand && (
                        <p>支配ブランド: <span className="font-medium">{item.dominant_brand}</span>（{item.dominant_share}%）</p>
                      )}
                    </div>
                    {item.brand_shares.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">ブランドシェア:</p>
                        <div className="space-y-0.5">
                          {item.brand_shares.slice(0, 4).map((b) => (
                            <div key={b.brand} className="flex justify-between text-xs">
                              <span>{b.brand}</span>
                              <span>{b.share}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <ReferenceLine y={2500} stroke="#f59e0b" strokeDasharray="5 5" />
            <ReferenceLine y={1500} stroke="#22c55e" strokeDasharray="5 5" />
            <ReferenceLine x={avgMentions} stroke="#666" strokeDasharray="5 5" />
            <Scatter
              data={chartData}
              shape={(rawProps: unknown) => {
                const props = rawProps as { cx: number; cy: number; payload: CompetitionData };
                const { cx, cy, payload } = props;
                const size = Math.max(8, Math.min(30, payload.brand_count * 4));
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={CONCENTRATION_COLORS[payload.concentration]}
                    fillOpacity={0.7}
                    stroke={CONCENTRATION_COLORS[payload.concentration]}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>競争的（HHI &lt; 1500）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>やや集中（1500-2500）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>寡占（HHI &gt; 2500）</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
