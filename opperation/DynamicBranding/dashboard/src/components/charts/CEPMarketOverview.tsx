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
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketSizeData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  prev_period_mentions: number;
  growth_rate: number;
  brand_count: number;
}

interface ApiResponse {
  data: MarketSizeData[];
  period: {
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
}

function GrowthBadge({ rate }: { rate: number }) {
  if (rate > 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        <TrendingUp className="h-3 w-3" />
        +{rate}%
      </span>
    );
  } else if (rate < -5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <TrendingDown className="h-3 w-3" />
        {rate}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
      <Minus className="h-3 w-3" />
      {rate > 0 ? "+" : ""}{rate}%
    </span>
  );
}

export function CEPMarketOverview() {
  const [data, setData] = useState<MarketSizeData[]>([]);
  const [period, setPeriod] = useState<ApiResponse["period"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/ceps/market-size");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json: ApiResponse = await res.json();
        setData(json.data);
        setPeriod(json.period);
      } catch (err) {
        console.error("Error fetching market size:", err);
        setError("市場規模データの読み込みに失敗しました");
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
          <CardTitle>CEP市場規模</CardTitle>
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
          <CardTitle>CEP市場規模</CardTitle>
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

  const avgMentions = data.reduce((sum, d) => sum + d.total_mentions, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CEP市場規模</CardTitle>
        <p className="text-sm text-muted-foreground">
          各CEPの総言及数と成長率（直近4週間 vs 前4週間）
        </p>
        {period && (
          <p className="text-xs text-muted-foreground">
            期間: {period.current.start} 〜 {period.current.end}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="cep_name"
              width={120}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as MarketSizeData;
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium">{item.cep_name}</p>
                    <p className="text-muted-foreground text-xs mt-1 max-w-[200px]">
                      {item.description}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p>言及数: <span className="font-medium">{item.total_mentions.toLocaleString()}</span></p>
                      <p>前期比: <GrowthBadge rate={item.growth_rate} /></p>
                      <p>参入ブランド: <span className="font-medium">{item.brand_count}</span></p>
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine x={avgMentions} stroke="#666" strokeDasharray="5 5" />
            <Bar dataKey="total_mentions" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.growth_rate > 10 ? "#22c55e" : entry.growth_rate < -10 ? "#ef4444" : "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {data.slice(0, 5).map((item) => (
            <div key={item.cep_id} className="flex items-center gap-2">
              <span className="text-muted-foreground">{item.cep_name}:</span>
              <GrowthBadge rate={item.growth_rate} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
