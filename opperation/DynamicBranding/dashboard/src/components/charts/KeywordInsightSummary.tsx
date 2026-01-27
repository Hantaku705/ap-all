"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Target,
  Swords,
  TrendingUp,
  Lightbulb,
  Shield,
  Crosshair,
  Eye,
} from "lucide-react";

interface ExclusiveKeyword {
  brand: string;
  keywords: string[];
  insight: string;
}

interface ContestedKeyword {
  keywords: string[];
  brands: string[];
  insight: string;
}

interface RisingKeywordAnalysis {
  keyword: string;
  status: string;
  brands?: string[];
  background: string;
  recommendation: string;
}

interface StrategicAction {
  brand: string;
  action: string;
  type: "strengthen" | "capture" | "monitor";
  impact: "HIGH" | "MEDIUM" | "LOW";
}

interface BrandKeywordInsight {
  exclusiveKeywords: string[];
  sharedKeywords: string[];
  risingKeywords: string[];
  competitivePosition: string;
  recommendation: string;
}

interface KeywordInsight {
  summary: string;
  competitivePositioning: {
    exclusive: ExclusiveKeyword[];
    contested: ContestedKeyword[];
  };
  risingAnalysis: RisingKeywordAnalysis[];
  strategicActions: StrategicAction[];
  brandInsight?: BrandKeywordInsight;
  generatedAt: string;
}

interface KeywordInsightSummaryProps {
  brand: string | "all";
}

export function KeywordInsightSummary({ brand }: KeywordInsightSummaryProps) {
  const [insight, setInsight] = useState<KeywordInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url =
      brand === "all"
        ? "/api/keywords/insights"
        : `/api/keywords/insights?brand=${encodeURIComponent(brand)}`;

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
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>キーワードインサイトを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">関連キーワード分析</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          インサイトデータがありません。scripts/generate-keyword-insights.ts
          を実行してください。
        </p>
      </div>
    );
  }

  // サマリーの「」をハイライト
  const formattedSummary = insight.summary.replace(
    /「(.+?)」/g,
    '<span class="font-medium text-foreground">「$1」</span>'
  );

  // アクションタイプのアイコンとラベル
  const getActionIcon = (type: string) => {
    switch (type) {
      case "strengthen":
        return <Shield className="h-3 w-3 text-green-500" />;
      case "capture":
        return <Crosshair className="h-3 w-3 text-blue-500" />;
      case "monitor":
        return <Eye className="h-3 w-3 text-gray-500" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case "strengthen":
        return "強化";
      case "capture":
        return "奪取";
      case "monitor":
        return "静観";
      default:
        return type;
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        <span className="font-medium text-sm">関連キーワード分析</span>
        {brand !== "all" && (
          <span className="text-xs text-muted-foreground">({brand})</span>
        )}
      </div>

      {/* メインサマリー */}
      <p
        className="text-sm text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedSummary }}
      />

      {/* ブランド個別の詳細（選択時） */}
      {brand !== "all" && insight.brandInsight && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          {/* キーワード概要 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">独占KW</div>
              <div className="font-medium">
                {insight.brandInsight.exclusiveKeywords.length}件
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">競合KW</div>
              <div className="font-medium">
                {insight.brandInsight.sharedKeywords.length}件
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Rising</div>
              <div className="font-medium">
                {insight.brandInsight.risingKeywords.length}件
              </div>
            </div>
          </div>

          {/* 独占キーワード表示 */}
          {insight.brandInsight.exclusiveKeywords.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Target className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">独占領域: </span>
                <span className="text-muted-foreground">
                  {insight.brandInsight.exclusiveKeywords.slice(0, 5).join("、")}
                </span>
              </div>
            </div>
          )}

          {/* 競合キーワード表示 */}
          {insight.brandInsight.sharedKeywords.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Swords className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">激戦区: </span>
                <span className="text-muted-foreground">
                  {insight.brandInsight.sharedKeywords.slice(0, 5).join("、")}
                </span>
              </div>
            </div>
          )}

          {/* 施策提案 */}
          {insight.brandInsight.recommendation && (
            <div className="flex items-start gap-2 pt-2 border-t text-xs">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">施策提案: </span>
                <span className="text-muted-foreground">
                  {insight.brandInsight.recommendation}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 全体表示時の展開ボタン */}
      {brand === "all" && (
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "詳細を閉じる" : "詳細を表示"}
          </button>

          {expanded && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-3 text-xs">
              {/* 競合ポジショニング - 独占領域 */}
              {insight.competitivePositioning.exclusive.length > 0 && (
                <div>
                  <div className="font-medium mb-1 flex items-center gap-1">
                    <Target className="h-3 w-3 text-green-500" />
                    独占領域（強み）
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    {insight.competitivePositioning.exclusive.map((e, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">●</span>
                        <span>
                          <span className="font-medium text-foreground">
                            {e.brand}:
                          </span>{" "}
                          {e.keywords.slice(0, 3).join("、")} - {e.insight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 競合ポジショニング - 激戦区 */}
              {insight.competitivePositioning.contested.length > 0 && (
                <div>
                  <div className="font-medium mb-1 flex items-center gap-1">
                    <Swords className="h-3 w-3 text-orange-500" />
                    激戦区（差別化必要）
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    {insight.competitivePositioning.contested
                      .slice(0, 5)
                      .map((c, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-orange-500">●</span>
                          <span>
                            「{c.keywords.slice(0, 2).join("、")}」:{" "}
                            {c.brands.slice(0, 3).join(", ")} - {c.insight}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Rising KW分析 */}
              {insight.risingAnalysis.length > 0 && (
                <div>
                  <div className="font-medium mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    Rising KW（注目）
                  </div>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {insight.risingAnalysis.slice(0, 3).map((r, i) => (
                      <li key={i}>
                        <div className="flex items-center gap-1">
                          <span className="text-red-500">🔥</span>
                          <span className="font-medium text-foreground">
                            「{r.keyword}」
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            {r.status}
                          </span>
                        </div>
                        <div className="ml-4 mt-0.5">
                          {r.background}
                          <br />→ {r.recommendation}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 戦略アクション */}
              {insight.strategicActions.length > 0 && (
                <div>
                  <div className="font-medium mb-1">推奨アクション</div>
                  <div className="space-y-1">
                    {insight.strategicActions.slice(0, 5).map((action, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {getActionIcon(action.type)}
                          <span className="font-medium text-foreground">
                            {action.brand}:
                          </span>
                          <span>{action.action}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              action.type === "strengthen"
                                ? "bg-green-100 text-green-700"
                                : action.type === "capture"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getActionLabel(action.type)}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 生成日時 */}
              <div className="text-[10px] text-muted-foreground/60 pt-2 border-t">
                生成日時: {new Date(insight.generatedAt).toLocaleString("ja-JP")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
