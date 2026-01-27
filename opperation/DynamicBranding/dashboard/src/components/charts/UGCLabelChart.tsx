"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Tag, AlertCircle, RefreshCw } from "lucide-react";

interface LabelItem {
  name: string;
  count: number;
  percentage: number;
}

interface LabelData {
  total: number;
  sentiment: LabelItem[];
  intent: LabelItem[];
  emotion: LabelItem[];
  cep: LabelItem[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

const INTENT_COLORS: Record<string, string> = {
  usage_report: "#3b82f6",
  recipe_share: "#8b5cf6",
  question: "#f59e0b",
  complaint: "#ef4444",
  purchase_consider: "#22c55e",
  other: "#94a3b8",
};

const EMOTION_COLORS: Record<string, string> = {
  satisfaction: "#22c55e",
  excitement: "#f59e0b",
  neutral: "#94a3b8",
  frustration: "#ef4444",
  relief: "#06b6d4",
  anxiety: "#f97316",
  guilt: "#a855f7",
};

const CEP_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#a855f7",
  "#14b8a6", "#6366f1",
];

const SENTIMENT_LABELS: Record<string, string> = {
  positive: "ポジティブ",
  neutral: "ニュートラル",
  negative: "ネガティブ",
};

const INTENT_LABELS: Record<string, string> = {
  usage_report: "使用報告",
  recipe_share: "レシピ共有",
  question: "質問",
  complaint: "不満",
  purchase_consider: "購入検討",
  other: "その他",
};

const EMOTION_LABELS: Record<string, string> = {
  satisfaction: "満足",
  excitement: "ワクワク",
  neutral: "普通",
  frustration: "不満",
  relief: "安心",
  anxiety: "不安",
  guilt: "罪悪感",
};

const CEP_LABELS: Record<string, string> = {
  time_saving_weeknight: "平日夜の時短",
  taste_anxiety: "味付け不安解消",
  weekend_cooking: "週末の本格料理",
  kids_picky_eating: "子どもの好き嫌い",
  solo_easy_meal: "一人暮らし手抜き",
  health_conscious: "健康意識",
  entertaining: "おもてなし",
  drinking_snacks: "晩酌おつまみ",
  leftover_remake: "残り物リメイク",
  seasonal_taste: "季節の味覚",
  diet_satisfaction: "ダイエット中",
  morning_time_save: "朝の時短",
};

interface UGCLabelChartProps {
  brand?: string;
}

export function UGCLabelChart({ brand = "all" }: UGCLabelChartProps) {
  const [data, setData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = brand === "all"
        ? "/api/sns/labels"
        : `/api/sns/labels?brand=${encodeURIComponent(brand)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [brand]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            UGCラベリング分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            UGCラベリング分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>{error || "データがありません"}</p>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <RefreshCw className="h-4 w-4" />
              再読み込み
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // センチメント用の円グラフデータ
  const sentimentPieData = data.sentiment.map((item) => ({
    name: SENTIMENT_LABELS[item.name] || item.name,
    value: item.count,
    fill: SENTIMENT_COLORS[item.name] || "#94a3b8",
  }));

  // 意図用の棒グラフデータ
  const intentBarData = data.intent.map((item) => ({
    name: INTENT_LABELS[item.name] || item.name,
    count: item.count,
    percentage: item.percentage,
    fill: INTENT_COLORS[item.name] || "#94a3b8",
  }));

  // 感情用の棒グラフデータ
  const emotionBarData = data.emotion.map((item) => ({
    name: EMOTION_LABELS[item.name] || item.name,
    count: item.count,
    percentage: item.percentage,
    fill: EMOTION_COLORS[item.name] || "#94a3b8",
  }));

  // CEP用の棒グラフデータ（上位10件）
  const cepBarData = data.cep.slice(0, 10).map((item, idx) => ({
    name: CEP_LABELS[item.name] || item.name,
    count: item.count,
    percentage: item.percentage,
    fill: CEP_COLORS[idx % CEP_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            UGCラベリング分布
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {(data.total ?? 0).toLocaleString()} 件
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* センチメント円グラフ */}
          <div>
            <h3 className="text-sm font-medium mb-2">センチメント分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${(value as number).toLocaleString()} 件`,
                    "件数",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 意図棒グラフ */}
          <div>
            <h3 className="text-sm font-medium mb-2">投稿意図分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={intentBarData}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={75}
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${(value as number).toLocaleString()} 件 (${(props.payload as { percentage: number }).percentage}%)`,
                    "件数",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {intentBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 感情棒グラフ */}
          <div>
            <h3 className="text-sm font-medium mb-2">感情分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={emotionBarData}
                layout="vertical"
                margin={{ left: 60, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={55}
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${(value as number).toLocaleString()} 件 (${(props.payload as { percentage: number }).percentage}%)`,
                    "件数",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {emotionBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CEP棒グラフ */}
          <div>
            <h3 className="text-sm font-medium mb-2">CEP（生活文脈）分布 TOP10</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={cepBarData}
                layout="vertical"
                margin={{ left: 100, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={95}
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${(value as number).toLocaleString()} 件 (${(props.payload as { percentage: number }).percentage}%)`,
                    "件数",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {cepBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
