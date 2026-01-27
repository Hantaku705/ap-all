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
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface TrendPoint {
  week: string;
  [cepName: string]: string | number;
}

interface CEPInfo {
  id: number;
  name: string;
}

interface CEPGrowth {
  id: number;
  name: string;
  currentWeekCount: number;
  prevWeekCount: number;
  growthRate: number;
}

interface ApiResponse {
  data: TrendPoint[];
  ceps: CEPInfo[];
  growth: CEPGrowth[];
  summary: {
    growing: CEPGrowth[];
    declining: CEPGrowth[];
  };
  period: {
    weeks: number;
    start: string;
    end: string;
  };
}

// CEP用のカラーパレット
const CEP_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#a855f7", // purple
];

type PeriodWeeks = 12 | 26 | 52;

function GrowthBadge({ cep, color }: { cep: CEPGrowth; color?: string }) {
  const isGrowing = cep.growthRate > 0;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isGrowing ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}
    >
      {isGrowing ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-600" />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium" style={{ color }}>
          {cep.name}
        </span>
        <span
          className={`text-xs font-bold ${
            isGrowing ? "text-green-600" : "text-red-600"
          }`}
        >
          {isGrowing ? "+" : ""}{cep.growthRate}%
        </span>
      </div>
    </div>
  );
}

export function CEPTrendChart() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [ceps, setCeps] = useState<CEPInfo[]>([]);
  const [summary, setSummary] = useState<ApiResponse["summary"] | null>(null);
  const [period, setPeriod] = useState<ApiResponse["period"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCeps, setVisibleCeps] = useState<Set<string>>(new Set());
  const [selectedWeeks, setSelectedWeeks] = useState<PeriodWeeks>(52);

  const fetchData = async (weeks: PeriodWeeks) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ceps/trends?weeks=${weeks}`);
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const json: ApiResponse = await res.json();
      setData(json.data);
      setCeps(json.ceps);
      setSummary(json.summary);
      setPeriod(json.period);
      // 初期表示はすべてのCEP
      if (visibleCeps.size === 0) {
        setVisibleCeps(new Set(json.ceps.map((c) => c.name)));
      }
    } catch (err) {
      console.error("Error fetching CEP trends:", err);
      setError("CEPトレンドデータの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedWeeks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeeks]);

  const toggleCep = (cepName: string) => {
    setVisibleCeps((prev) => {
      const next = new Set(prev);
      if (next.has(cepName)) {
        next.delete(cepName);
      } else {
        next.add(cepName);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (visibleCeps.size === ceps.length) {
      setVisibleCeps(new Set());
    } else {
      setVisibleCeps(new Set(ceps.map((c) => c.name)));
    }
  };

  const getCepColor = (cepName: string) => {
    const index = ceps.findIndex((c) => c.name === cepName);
    return CEP_COLORS[index % CEP_COLORS.length];
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">生活文脈（CEP）トレンド</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">生活文脈（CEP）トレンド</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl">生活文脈（CEP）トレンド</CardTitle>
            <p className="text-muted-foreground mt-1">
              どのCEPが伸びているか？SNS UGCベースで分析
            </p>
          </div>
          {/* 期間セレクター */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {([12, 26, 52] as PeriodWeeks[]).map((weeks) => (
              <button
                key={weeks}
                onClick={() => setSelectedWeeks(weeks)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedWeeks === weeks
                    ? "bg-white shadow text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {weeks}週間
              </button>
            ))}
          </div>
        </div>

        {/* 成長/下降サマリー */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                成長中 TOP3
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.growing.length > 0 ? (
                  summary.growing.map((cep) => (
                    <GrowthBadge
                      key={cep.id}
                      cep={cep}
                      color={getCepColor(cep.name)}
                    />
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-700 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                下降中 TOP3
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.declining.length > 0 ? (
                  summary.declining.map((cep) => (
                    <GrowthBadge
                      key={cep.id}
                      cep={cep}
                      color={getCepColor(cep.name)}
                    />
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 期間表示 */}
        {period && (
          <p className="text-xs text-muted-foreground mt-4">
            期間: {period.start} 〜 {period.end}（{period.weeks}週間）
          </p>
        )}

        {/* CEPフィルター */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          <button
            onClick={toggleAll}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              visibleCeps.size === ceps.length
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {visibleCeps.size === ceps.length ? "すべて非表示" : "すべて表示"}
          </button>
          {ceps.map((cep, index) => (
            <button
              key={cep.id}
              onClick={() => toggleCep(cep.name)}
              className={`px-2 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 border ${
                visibleCeps.has(cep.name) ? "opacity-100" : "opacity-40"
              }`}
              style={{
                backgroundColor: visibleCeps.has(cep.name)
                  ? `${CEP_COLORS[index % CEP_COLORS.length]}15`
                  : undefined,
                color: CEP_COLORS[index % CEP_COLORS.length],
                borderColor: CEP_COLORS[index % CEP_COLORS.length],
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CEP_COLORS[index % CEP_COLORS.length] }}
              />
              {cep.name}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}週`;
              }}
              formatter={(value, name) => [`${value}件`, name]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-sm">{value}</span>
              )}
            />
            {ceps.map(
              (cep, index) =>
                visibleCeps.has(cep.name) && (
                  <Line
                    key={cep.id}
                    type="monotone"
                    dataKey={cep.name}
                    stroke={CEP_COLORS[index % CEP_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
