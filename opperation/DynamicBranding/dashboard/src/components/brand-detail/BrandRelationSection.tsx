"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, Hash } from "lucide-react";
import { BRAND_COLORS } from "@/lib/utils/colors";

interface Cooccurrence {
  brand: string;
  count: number;
}

interface Correlation {
  brand: string;
  coefficient: number;
}

interface Keyword {
  keyword: string;
  relevance_score: number;
  keyword_type: string;
}

interface RelationData {
  brand: string;
  cooccurrences: Cooccurrence[];
  correlations: Correlation[];
  keywords: Keyword[];
}

interface BrandRelationSectionProps {
  brandName: string;
}

export function BrandRelationSection({ brandName }: BrandRelationSectionProps) {
  const [data, setData] = useState<RelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/brands/${encodeURIComponent(brandName)}/relations`
        );
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching relations:", err);
        setError("関連性データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">関連性分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
        <h2 className="text-xl font-bold mb-4">関連性分析</h2>
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
      <h2 className="text-xl font-bold mb-4">関連性分析</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 共起ブランド */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4" />
              共起ブランドTOP5
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              一緒に言及されることが多いブランド
            </p>
          </CardHeader>
          <CardContent>
            {data.cooccurrences.length === 0 ? (
              <p className="text-muted-foreground text-sm">データなし</p>
            ) : (
              <div className="space-y-3">
                {data.cooccurrences.map((item, index) => (
                  <div key={item.brand} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-4">
                      {index + 1}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: BRAND_COLORS[item.brand] || "#94a3b8",
                      }}
                    />
                    <span className="flex-1 font-medium text-sm">
                      {item.brand}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {item.count}件
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 相関ブランド */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              検索トレンド相関TOP5
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              検索トレンドが連動するブランド
            </p>
          </CardHeader>
          <CardContent>
            {data.correlations.length === 0 ? (
              <p className="text-muted-foreground text-sm">データなし</p>
            ) : (
              <div className="space-y-3">
                {data.correlations.map((item, index) => (
                  <div key={item.brand} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-4">
                      {index + 1}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: BRAND_COLORS[item.brand] || "#94a3b8",
                      }}
                    />
                    <span className="flex-1 font-medium text-sm">
                      {item.brand}
                    </span>
                    <span
                      className={`text-sm font-mono ${
                        item.coefficient >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.coefficient >= 0 ? "+" : ""}
                      {item.coefficient.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 関連キーワード */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              関連キーワードTOP10
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              検索者が他に調べているKW
            </p>
          </CardHeader>
          <CardContent>
            {data.keywords.length === 0 ? (
              <p className="text-muted-foreground text-sm">データなし</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((item) => (
                  <span
                    key={item.keyword}
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.keyword_type === "rising"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    title={`スコア: ${item.relevance_score}`}
                  >
                    {item.keyword}
                    {item.keyword_type === "rising" && " ↑"}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
