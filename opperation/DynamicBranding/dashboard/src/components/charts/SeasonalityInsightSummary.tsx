"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface BrandPattern {
  brand: string;
  pattern: string;
  variationRate: number;
  peak: {
    month: number;
    monthName: string;
    score: number;
    reason: string;
  };
  bottom: {
    month: number;
    monthName: string;
    score: number;
    challenge: string;
  };
  recommendation: string;
}

interface StrategicAction {
  brand: string;
  action: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
}

interface SeasonalityInsight {
  summary: string;
  brandPatterns: BrandPattern[];
  crossBrandInsights: string[];
  strategicActions: StrategicAction[];
  generatedAt: string;
  cached: boolean;
}

interface SeasonalityInsightSummaryProps {
  brand: string | "all";
}

export function SeasonalityInsightSummary({
  brand,
}: SeasonalityInsightSummaryProps) {
  const [insight, setInsight] = useState<SeasonalityInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url =
      brand === "all"
        ? "/api/seasonality/insights"
        : `/api/seasonality/insights?brand=${encodeURIComponent(brand)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch insights");
        return res.json();
      })
      .then(setInsight)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [brand]);

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>季節性パターンを分析中...</span>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        コンソメは冬季（11月）にピーク。他ブランドは比較的平坦。
      </p>
    );
  }

  // サマリーの**太字**をHTMLに変換
  const formattedSummary = insight.summary.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-foreground">$1</strong>'
  );

  // 特定ブランドの場合の詳細表示
  const brandPattern = brand !== "all" ? insight.brandPatterns[0] : null;

  return (
    <div className="mt-3 space-y-3">
      {/* メインサマリー */}
      <p
        className="text-sm text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedSummary }}
      />

      {/* ブランド個別の詳細（選択時） */}
      {brandPattern && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-full text-white ${
                  brandPattern.pattern === "冬型"
                    ? "bg-blue-500"
                    : brandPattern.pattern === "夏型"
                      ? "bg-orange-500"
                      : brandPattern.pattern === "春型"
                        ? "bg-green-500"
                        : "bg-gray-500"
                }`}
              >
                {brandPattern.pattern}
              </span>
              <span className="text-muted-foreground">
                変動{brandPattern.variationRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">
                  ピーク: {brandPattern.peak.monthName}（
                  {brandPattern.peak.score.toFixed(1)}）
                </div>
                <div className="text-muted-foreground">
                  {brandPattern.peak.reason}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">
                  ボトム: {brandPattern.bottom.monthName}（
                  {brandPattern.bottom.score.toFixed(1)}）
                </div>
                <div className="text-muted-foreground">
                  {brandPattern.bottom.challenge}
                </div>
              </div>
            </div>
          </div>

          {brandPattern.recommendation && (
            <div className="flex items-start gap-2 pt-2 border-t text-xs">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">施策提案: </span>
                <span className="text-muted-foreground">
                  {brandPattern.recommendation}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 全体表示時の展開ボタン */}
      {brand === "all" && insight.crossBrandInsights.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "詳細を閉じる" : "詳細を表示"}
          </button>

          {expanded && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-3 text-xs">
              {/* クロスブランドインサイト */}
              <div>
                <div className="font-medium mb-1">ブランド間の特徴</div>
                <ul className="space-y-1 text-muted-foreground">
                  {insight.crossBrandInsights.map((item, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 戦略アクション */}
              {insight.strategicActions.length > 0 && (
                <div>
                  <div className="font-medium mb-1">推奨アクション</div>
                  <div className="space-y-1">
                    {insight.strategicActions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {action.brand}:
                          </span>{" "}
                          {action.action}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            action.impact === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : action.impact === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {action.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* キャッシュ情報 */}
              <div className="text-[10px] text-muted-foreground/60 pt-2 border-t">
                {insight.cached ? "キャッシュ済み" : "新規生成"} •{" "}
                {new Date(insight.generatedAt).toLocaleString("ja-JP")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
