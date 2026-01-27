"use client";

import { useEffect, useState } from "react";
import { InsightCard } from "./InsightCard";
import { AlertCircle } from "lucide-react";
import type { Insight } from "@/types/database.types";

// スケルトンカードコンポーネント
function InsightCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-5 w-16 bg-muted rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function InsightList() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "A" | "B" | "C">("all");

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/insights");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setInsights(json);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("インサイトの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        {/* フィルタースケルトン */}
        <div className="flex gap-2 mb-6">
          <div className="h-7 w-24 bg-muted rounded animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-12 bg-muted rounded-full animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
        {/* カードスケルトン */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  const filteredInsights =
    filter === "all"
      ? insights
      : insights.filter((i) => i.confidence === filter);

  return (
    <div>
      {/* フィルター */}
      <div className="flex gap-2 mb-6">
        <span className="text-sm text-muted-foreground py-1">
          納得性フィルター:
        </span>
        {(["all", "A", "B", "C"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "すべて" : f}
          </button>
        ))}
      </div>

      {/* インサイトカード一覧 */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            該当するインサイトがありません
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              category={insight.category as "correlation" | "seasonality" | "strategy" | "risk"}
              confidence={insight.confidence as "A" | "B" | "C"}
              confidenceReason={insight.confidence_reason}
              relatedBrands={insight.related_brands}
              actionItems={insight.action_items}
            />
          ))
        )}
      </div>
    </div>
  );
}
