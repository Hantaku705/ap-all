"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  Download,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Building2,
  LayoutGrid,
  Quote,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import type { IssueReport, IssueSection, SamplePost, PersonaSummary } from "@/types/data.types";

const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

type ReportMode = "overview" | "brand";

export function ReportsView() {
  const [report, setReport] = useState<IssueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ReportMode>("overview");
  const [selectedBrand, setSelectedBrand] = useState<string>(BRANDS[0]);

  // モードまたはブランドが変わったらレポートを取得
  useEffect(() => {
    fetchReport();
  }, [mode, selectedBrand]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = mode === "overview"
        ? "/api/reports/issues/portfolio"
        : `/api/reports/issues/brand/${encodeURIComponent(selectedBrand)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("レポートの取得に失敗しました");
      const json: IssueReport = await res.json();
      setReport(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setError(msg);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const url = mode === "overview"
        ? "/api/reports/issues/portfolio?refresh=true"
        : `/api/reports/issues/brand/${encodeURIComponent(selectedBrand)}?refresh=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("レポートの更新に失敗しました");
      const json: IssueReport = await res.json();
      setReport(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!report?.markdown) return;
    const blob = new Blob([report.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = mode === "overview"
      ? "portfolio-report.md"
      : `${selectedBrand}-report.md`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          再度読み込み
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        レポートの取得に失敗しました
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 border-b pb-4">
        <button
          onClick={() => setMode("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "overview"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          総合（10問）
        </button>
        <button
          onClick={() => setMode("brand")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "brand"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Building2 className="h-4 w-4" />
          ブランド別（12問×8）
        </button>
      </div>

      {/* Brand Selector (only in brand mode) */}
      {mode === "brand" && (
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedBrand === brand
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white hover:bg-blue-50 border-gray-200"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-sm text-muted-foreground">
            生成: {new Date(report.generatedAt).toLocaleString("ja-JP")}
            {mode === "brand" && ` | ${report.sections.length}問`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            更新
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Q&A Cards */}
      <div className="space-y-6">
        {report.sections.map((section, idx) => (
          <QuestionCard key={idx} section={section} number={idx + 1} />
        ))}
      </div>

      {/* Strategy Panel */}
      {report.strategy && <StrategyPanel strategy={report.strategy} />}
    </div>
  );
}

// Q&A Card Component
function QuestionCard({ section, number }: { section: IssueSection; number: number }) {
  // Priority badge color
  const getPriorityBadge = () => {
    if (section.priority === 'high') {
      return <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">重要</span>;
    }
    if (section.priority === 'medium') {
      return <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">注目</span>;
    }
    return null;
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <HelpCircle className="h-4 w-4" />
            <span>Q{number}: {section.title}</span>
            {getPriorityBadge()}
          </div>
          <p className="text-xl font-bold leading-relaxed">
            {section.question}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Answer (Findings/Facts) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <MessageSquare className="h-4 w-4" />
            <span>発見事項（FACT）</span>
          </div>
          <div className="space-y-2">
            {section.findings.map((finding, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <p className="text-base leading-relaxed">{finding}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights (Layer 2) */}
        {section.insights && section.insights.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                <Lightbulb className="h-4 w-4" />
                <span>洞察（INSIGHT）- なぜこうなったのか</span>
              </div>
              <div className="space-y-2">
                {section.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400"
                  >
                    <span className="text-lg">💡</span>
                    <p className="text-sm leading-relaxed text-indigo-800">{insight}</p>
                  </div>
                ))}
              </div>
              {/* Cross Analysis */}
              {section.crossAnalysis && (
                <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-700 flex items-start gap-2">
                  <span>📊</span>
                  <div>
                    <span className="font-medium">他セクションとの関連: </span>
                    {section.crossAnalysis}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recommendations (Layer 3) */}
        {section.recommendations && section.recommendations.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <span className="text-lg">✅</span>
                <span>推奨アクション（ACTION）</span>
              </div>
              <div className="space-y-2">
                {section.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-blue-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Evidence */}
        {section.dataTable && section.dataTable.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <BarChart3 className="h-4 w-4" />
                <span>Evidence</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      {Object.keys(section.dataTable[0]).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-sm font-semibold border"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.dataTable.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-muted/30"}
                      >
                        {Object.values(row).map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-2 text-sm border"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Personas */}
        {section.personas && section.personas.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                <Users className="h-4 w-4" />
                <span>Personas（k-meansクラスタリング）</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.personas.map((persona, idx) => (
                  <PersonaCard key={idx} persona={persona} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sample Posts */}
        {section.samplePosts && section.samplePosts.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                <Quote className="h-4 w-4" />
                <span>投稿エビデンス（{section.samplePosts.length}件）</span>
              </div>
              <div className="space-y-3">
                {section.samplePosts.map((post, idx) => (
                  <SamplePostCard key={idx} post={post} />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Persona Card Component
function PersonaCard({ persona }: { persona: PersonaSummary }) {
  return (
    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-indigo-900">{persona.name}</h4>
        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
          {persona.sharePercentage.toFixed(1)}%
        </span>
      </div>
      <p className="text-sm text-indigo-700 mb-3">{persona.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {persona.keywords.slice(0, 5).map((kw, idx) => (
          <span
            key={idx}
            className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-200"
          >
            {kw}
          </span>
        ))}
      </div>
      <div className="text-xs text-indigo-500 flex items-center gap-3">
        <span>{persona.postCount}件の投稿</span>
        <span>平均エンゲージメント: {persona.avgEngagement.toFixed(0)}</span>
      </div>
    </div>
  );
}

// Sample Post Card Component
function SamplePostCard({ post }: { post: SamplePost }) {
  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            <ThumbsUp className="h-3 w-3" />
            Positive
          </span>
        );
      case "negative":
        return (
          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            <ThumbsDown className="h-3 w-3" />
            Negative
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            <Minus className="h-3 w-3" />
            Neutral
          </span>
        );
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
      <div className="flex items-center gap-2 mb-2">
        {getSentimentBadge(post.sentiment)}
        {post.engagement !== undefined && post.engagement > 0 && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            Engagement: {post.engagement.toLocaleString()}
          </span>
        )}
        {post.source && (
          <span className="text-xs text-purple-500">{post.source}</span>
        )}
        {post.date && (
          <span className="text-xs text-purple-400">
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">
        &ldquo;{post.content}&rdquo;
      </p>
      {post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-500 hover:underline mt-2 inline-block"
        >
          元の投稿を見る →
        </a>
      )}
    </div>
  );
}

// Strategy Panel Component
function StrategyPanel({
  strategy,
}: {
  strategy: { findings: string[]; recommendations: string[]; keyInsight: string };
}) {
  return (
    <Card className="border-2 border-amber-200 bg-amber-50/30">
      <CardContent className="p-6 space-y-6">
        {/* Key Insight */}
        <div className="p-4 bg-amber-100 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Lightbulb className="h-5 w-5" />
            <span className="text-sm font-medium">Key Insight</span>
          </div>
          <p className="text-lg font-bold text-amber-900">
            {strategy.keyInsight}
          </p>
        </div>

        {/* Two Column: Findings & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Findings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">
                ✓
              </span>
              主な発見
            </h3>
            <div className="space-y-2">
              {strategy.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-green-50 rounded-lg text-sm border border-green-100"
                >
                  {finding}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                →
              </span>
              提言
            </h3>
            <div className="space-y-2">
              {strategy.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-100"
                >
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
