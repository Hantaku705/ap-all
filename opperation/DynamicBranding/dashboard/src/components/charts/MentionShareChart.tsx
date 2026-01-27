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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface MentionData {
  brand: string;
  count: number;
  share: number;
  color: string;
}

export function MentionShareChart() {
  const [data, setData] = useState<MentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"count" | "share">("count");

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/sns/mentions");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching mentions:", err);
        setError("言及データの読み込みに失敗しました");
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
          <CardTitle>ブランド言及シェア</CardTitle>
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
          <CardTitle>ブランド言及シェア</CardTitle>
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

  const chartData = data.map((d) => ({
    ...d,
    value: displayMode === "count" ? d.count : d.share,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ブランド言及シェア（SNS）</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayMode("count")}
              className={`px-3 py-1 text-sm rounded-md ${
                displayMode === "count"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              件数
            </button>
            <button
              onClick={() => setDisplayMode("share")}
              className={`px-3 py-1 text-sm rounded-md ${
                displayMode === "share"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              割合(%)
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          味の素が全体の44%を占め圧倒的存在感。香味ペーストは認知が低い。
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={displayMode === "share" ? [0, 50] : [0, "auto"]}
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
                const item = props.payload as MentionData;
                const numValue = typeof value === "number" ? value : 0;
                if (displayMode === "count") {
                  return [`${numValue.toLocaleString()}件 (${item.share}%)`, "言及数"];
                }
                return [`${numValue}%`, "シェア"];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
