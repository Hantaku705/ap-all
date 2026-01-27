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
  Cell,
  ReferenceLine,
  Label,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Star, TrendingUp, Package, AlertTriangle } from "lucide-react";

interface CEPGrowth {
  id: number;
  name: string;
  currentWeekCount: number;
  prevWeekCount: number;
  growthRate: number;
}

interface ApiResponse {
  growth: CEPGrowth[];
  period: {
    weeks: number;
    start: string;
    end: string;
  };
}

// CEP用のカラーパレット（CEPTrendChartと同じ）
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

// 象限の定義
interface Quadrant {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}

const QUADRANTS: Record<string, Quadrant> = {
  star: {
    name: "スター",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    description: "高VOL・高成長 → 継続投資",
  },
  growth: {
    name: "成長",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    description: "低VOL・高成長 → 育成候補",
  },
  mature: {
    name: "成熟",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    description: "高VOL・低成長 → 維持・効率化",
  },
  decline: {
    name: "衰退",
    icon: AlertTriangle,
    color: "text-gray-500",
    bgColor: "bg-gray-50 border-gray-200",
    description: "低VOL・低成長 → 要検討",
  },
};

function QuadrantCard({
  quadrant,
  ceps,
  getCepColor,
}: {
  quadrant: Quadrant;
  ceps: CEPGrowth[];
  getCepColor: (name: string) => string;
}) {
  const Icon = quadrant.icon;
  return (
    <div className={`p-3 rounded-lg border ${quadrant.bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${quadrant.color}`} />
        <span className={`text-sm font-semibold ${quadrant.color}`}>
          {quadrant.name}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {ceps.length}件
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{quadrant.description}</p>
      {ceps.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {ceps.map((cep) => (
            <span
              key={cep.id}
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: getCepColor(cep.name) }}
            >
              {cep.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">該当なし</span>
      )}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: CEPGrowth }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-1">{data.name}</p>
      <div className="space-y-1 text-xs">
        <p>
          <span className="text-muted-foreground">VOL数:</span>{" "}
          <span className="font-medium">{data.currentWeekCount}件</span>
        </p>
        <p>
          <span className="text-muted-foreground">伸び率:</span>{" "}
          <span
            className={`font-medium ${
              data.growthRate > 0 ? "text-green-600" : data.growthRate < 0 ? "text-red-600" : ""
            }`}
          >
            {data.growthRate > 0 ? "+" : ""}
            {data.growthRate}%
          </span>
        </p>
        <p>
          <span className="text-muted-foreground">前期:</span>{" "}
          <span className="font-medium">{data.prevWeekCount}件</span>
        </p>
      </div>
    </div>
  );
}

export function CEPMatrix() {
  const [data, setData] = useState<CEPGrowth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ceps/trends?weeks=52");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json: ApiResponse = await res.json();
        setData(json.growth);
      } catch (err) {
        console.error("Error fetching CEP matrix data:", err);
        setError("CEPマトリックスデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // CEPの色を取得
  const getCepColor = (cepName: string) => {
    const index = data.findIndex((c) => c.name === cepName);
    return CEP_COLORS[index % CEP_COLORS.length];
  };

  // VOL中央値を計算（X軸の分割線）
  const volMedian =
    data.length > 0
      ? [...data].sort((a, b) => a.currentWeekCount - b.currentWeekCount)[
          Math.floor(data.length / 2)
        ].currentWeekCount
      : 0;

  // 象限別にCEPを分類
  const classifyCeps = () => {
    const star: CEPGrowth[] = [];
    const growth: CEPGrowth[] = [];
    const mature: CEPGrowth[] = [];
    const decline: CEPGrowth[] = [];

    for (const cep of data) {
      const isHighVol = cep.currentWeekCount >= volMedian;
      const isHighGrowth = cep.growthRate > 0;

      if (isHighVol && isHighGrowth) {
        star.push(cep);
      } else if (!isHighVol && isHighGrowth) {
        growth.push(cep);
      } else if (isHighVol && !isHighGrowth) {
        mature.push(cep);
      } else {
        decline.push(cep);
      }
    }

    return { star, growth, mature, decline };
  };

  const { star, growth, mature, decline } = classifyCeps();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>CEPポートフォリオ</CardTitle>
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
        <CardHeader className="pb-2">
          <CardTitle>CEPポートフォリオ</CardTitle>
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

  // X軸・Y軸の範囲を計算
  const maxVol = Math.max(...data.map((d) => d.currentWeekCount)) * 1.1;
  const minGrowth = Math.min(...data.map((d) => d.growthRate), -10);
  const maxGrowth = Math.max(...data.map((d) => d.growthRate), 10);
  const growthRange = Math.max(Math.abs(minGrowth), Math.abs(maxGrowth)) * 1.2;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">CEPポートフォリオ</CardTitle>
        <p className="text-muted-foreground text-sm">
          VOL数 × 伸び率の4象限分析（直近2週 vs 前2週）
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 40, right: 40, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* X軸: VOL数 */}
            <XAxis
              type="number"
              dataKey="currentWeekCount"
              name="VOL数"
              domain={[0, maxVol]}
              tick={{ fontSize: 11 }}
            >
              <Label value="VOL数（件）" position="bottom" offset={0} fontSize={12} />
            </XAxis>

            {/* Y軸: 伸び率 */}
            <YAxis
              type="number"
              dataKey="growthRate"
              name="伸び率"
              unit="%"
              domain={[-growthRange, growthRange]}
              tick={{ fontSize: 11 }}
            >
              <Label value="伸び率（%）" angle={-90} position="left" offset={0} fontSize={12} />
            </YAxis>

            {/* 象限の区切り線 */}
            <ReferenceLine
              x={volMedian}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            <ReferenceLine
              y={0}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* 象限ラベル */}
            {/* 右上: スター */}
            <ReferenceLine y={growthRange * 0.8} stroke="transparent">
              <Label
                value="スター ⭐"
                position="insideRight"
                fill="#d97706"
                fontSize={11}
                fontWeight="bold"
              />
            </ReferenceLine>
            {/* 左上: 成長 */}
            <ReferenceLine y={growthRange * 0.8} stroke="transparent">
              <Label
                value="成長 📈"
                position="insideLeft"
                fill="#16a34a"
                fontSize={11}
                fontWeight="bold"
              />
            </ReferenceLine>
            {/* 右下: 成熟 */}
            <ReferenceLine y={-growthRange * 0.8} stroke="transparent">
              <Label
                value="成熟 📦"
                position="insideRight"
                fill="#2563eb"
                fontSize={11}
                fontWeight="bold"
              />
            </ReferenceLine>
            {/* 左下: 衰退 */}
            <ReferenceLine y={-growthRange * 0.8} stroke="transparent">
              <Label
                value="衰退 ⚠️"
                position="insideLeft"
                fill="#6b7280"
                fontSize={11}
                fontWeight="bold"
              />
            </ReferenceLine>

            <Tooltip content={<CustomTooltip />} />

            <Scatter data={data} name="CEP">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getCepColor(entry.name)}
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* 象限別CEPリスト */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <QuadrantCard quadrant={QUADRANTS.star} ceps={star} getCepColor={getCepColor} />
          <QuadrantCard quadrant={QUADRANTS.growth} ceps={growth} getCepColor={getCepColor} />
          <QuadrantCard quadrant={QUADRANTS.mature} ceps={mature} getCepColor={getCepColor} />
          <QuadrantCard quadrant={QUADRANTS.decline} ceps={decline} getCepColor={getCepColor} />
        </div>
      </CardContent>
    </Card>
  );
}
