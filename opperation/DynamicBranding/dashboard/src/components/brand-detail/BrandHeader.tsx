"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, Target } from "lucide-react";

interface BrandSummary {
  id: number;
  name: string;
  nameEn: string;
  color: string;
  mentionCount: number;
  mentionShare: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  negativeRate: number;
  topCep: {
    name: string;
    score: number;
  } | null;
  primaryQuadrant: string;
  quadrantDistribution: Record<string, number>;
  cepCount: number;
}

const QUADRANT_COLORS: Record<string, { bg: string; text: string }> = {
  コア強化: { bg: "bg-green-100", text: "text-green-700" },
  機会獲得: { bg: "bg-blue-100", text: "text-blue-700" },
  育成検討: { bg: "bg-yellow-100", text: "text-yellow-700" },
  低優先: { bg: "bg-gray-100", text: "text-gray-600" },
};

interface BrandHeaderProps {
  brandName: string;
}

export function BrandHeader({ brandName }: BrandHeaderProps) {
  const [data, setData] = useState<BrandSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/brands/${encodeURIComponent(brandName)}`);
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching brand summary:", err);
        setError("ブランド情報の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || "データが見つかりません"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quadrantStyle = QUADRANT_COLORS[data.primaryQuadrant] || QUADRANT_COLORS.低優先;
  const totalSentiment = (data.positiveCount ?? 0) + (data.neutralCount ?? 0) + (data.negativeCount ?? 0);
  const positiveRate = totalSentiment > 0
    ? Math.round(((data.positiveCount ?? 0) / totalSentiment) * 1000) / 10
    : 0;

  return (
    <Card className="overflow-hidden">
      {/* ヘッダーバー（ブランドカラー） */}
      <div
        className="h-2"
        style={{ backgroundColor: data.color }}
      />

      <CardContent className="pt-6">
        {/* ブランド名 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: data.color }}
            >
              {data.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{data.name}</h1>
              <p className="text-muted-foreground text-sm">{data.nameEn}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${quadrantStyle.bg} ${quadrantStyle.text}`}>
            {data.primaryQuadrant}
          </span>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 言及シェア */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              言及シェア
            </div>
            <p className="text-2xl font-bold">{(data.mentionShare ?? 0).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{(data.mentionCount ?? 0).toLocaleString()}件</p>
          </div>

          {/* ポジティブ率 */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              ポジティブ率
            </div>
            <p className="text-2xl font-bold text-green-600">{positiveRate}%</p>
            <p className="text-xs text-muted-foreground">{(data.positiveCount ?? 0).toLocaleString()}件</p>
          </div>

          {/* ネガティブ率 */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              ネガティブ率
            </div>
            <p className="text-2xl font-bold text-red-600">{(data.negativeRate ?? 0).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{(data.negativeCount ?? 0).toLocaleString()}件</p>
          </div>

          {/* Top CEP */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="h-4 w-4" />
              Top CEP
            </div>
            {data.topCep ? (
              <>
                <p className="text-lg font-bold truncate" title={data.topCep.name}>
                  {data.topCep.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.topCep.score != null ? `Score: ${data.topCep.score.toFixed(2)}` : ""}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">-</p>
            )}
          </div>
        </div>

        {/* 4象限分布 */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">CEP分布（{data.cepCount ?? 0}件）</p>
          <div className="flex gap-4 text-sm">
            {Object.entries(data.quadrantDistribution ?? {}).map(([quadrant, count]) => {
              const style = QUADRANT_COLORS[quadrant] || QUADRANT_COLORS.低優先;
              return (
                <div key={quadrant} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${style.bg}`} />
                  <span className="text-muted-foreground">{quadrant}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
