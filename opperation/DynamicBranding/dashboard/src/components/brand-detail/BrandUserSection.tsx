"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface LabelDistribution {
  name: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface LabelData {
  total: number;
  sentiment: LabelDistribution[];
  intent: LabelDistribution[];
  emotion: LabelDistribution[];
  cep: LabelDistribution[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

const INTENT_COLORS: Record<string, string> = {
  usage_report: "#3b82f6",
  recipe_share: "#22c55e",
  purchase_consider: "#8b5cf6",
  question: "#f59e0b",
  complaint: "#ef4444",
  other: "#94a3b8",
};

const EMOTION_COLORS: Record<string, string> = {
  satisfaction: "#22c55e",
  excitement: "#f59e0b",
  relief: "#3b82f6",
  neutral: "#94a3b8",
  frustration: "#ef4444",
  anxiety: "#dc2626",
  guilt: "#a855f7",
};

interface BrandUserSectionProps {
  brandName: string;
}

export function BrandUserSection({ brandName }: BrandUserSectionProps) {
  const [data, setData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/sns/labels?brand=${encodeURIComponent(brandName)}`
        );
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching labels:", err);
        setError("ラベルデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">ユーザー理解</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-8">
                <div className="h-[200px] bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">ユーザー理解</h2>
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-600">{error || "データが見つかりません"}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">ユーザー理解</h2>
      <p className="text-muted-foreground mb-4">
        {brandName}に関する{(data.total ?? 0).toLocaleString()}件の投稿を分析
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* センチメント分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">センチメント分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sentiment}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                  >
                    {data.sentiment.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SENTIMENT_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value as number}件`, "件数"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 投稿意図分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">投稿意図</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.intent.slice(0, 6)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value as number}件`, "件数"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.intent.slice(0, 6).map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={INTENT_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 感情プロファイル */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">感情プロファイル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.emotion.slice(0, 6)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value as number}件`, "件数"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.emotion.slice(0, 6).map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={EMOTION_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CEP分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">生活文脈（CEP）分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.cep.slice(0, 6)}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip
                    formatter={(value) => [`${value as number}件`, "件数"]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
