"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRANDS } from "@/lib/utils/colors";
import {
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Trophy,
  Loader2,
  Building2,
  BarChart3,
  Layers,
  Zap,
} from "lucide-react";

// ============================================
// 型定義
// ============================================
type ViewMode = "portfolio" | "brand";

interface ActionPlan {
  対象: string;
  施策: string;
  KPI: string;
  期限: string;
}

interface BrandStrategy {
  findings: string[];
  recommendations: string[];
  keyInsight: string;
  executiveSummary: string;
  deepInsights: string[];
  winningPatterns: string[];
  improvementOpportunities: string[];
  actionPlan: ActionPlan[];
  competitorStrategy: string[];
}

interface PortfolioSection {
  title: string;
  question: string;
  findings: string[];
  insights?: string[];
  recommendations?: string[];
  crossAnalysis?: string;
  priority?: "high" | "medium" | "low";
  dataTable?: Array<Record<string, string | number>>;
}

interface StrategicPriorities {
  immediate: string[];
  midTerm: string[];
  deferred: string[];
}

interface PortfolioData {
  issueId: string;
  title: string;
  generatedAt: string;
  executiveSummary: string;
  strategicPriorities: StrategicPriorities;
  sections: PortfolioSection[];
}

interface BrandReportData {
  strategy: BrandStrategy;
  brandName?: string;
}

// ============================================
// メインコンポーネント
// ============================================
export function StrategyView() {
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [selectedBrand, setSelectedBrand] = useState<string>("ほんだし");
  const [brandStrategy, setBrandStrategy] = useState<BrandStrategy | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (viewMode === "portfolio") {
          const res = await fetch("/api/reports/issues/portfolio");
          if (!res.ok) throw new Error("Failed to fetch portfolio data");
          const data: PortfolioData = await res.json();
          setPortfolioData(data);
        } else {
          const res = await fetch(`/api/reports/brands/${encodeURIComponent(selectedBrand)}`);
          if (!res.ok) throw new Error("Failed to fetch brand strategy");
          const data: BrandReportData = await res.json();
          setBrandStrategy(data.strategy);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [viewMode, selectedBrand]);

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            戦略分析
          </CardTitle>
          <CardDescription>
            味の素グループ全体の総合戦略、または各ブランドの個別戦略を確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "portfolio"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              総合
            </button>
            <button
              onClick={() => setViewMode("brand")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "brand"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              ブランド別
            </button>
          </div>

          {/* Brand Selector (only in brand mode) */}
          {viewMode === "brand" && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedBrand === brand
                      ? "bg-secondary text-secondary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Portfolio View */}
      {viewMode === "portfolio" && portfolioData && !loading && (
        <PortfolioStrategyView data={portfolioData} />
      )}

      {/* Brand View */}
      {viewMode === "brand" && brandStrategy && !loading && (
        <BrandStrategyView data={brandStrategy} brandName={selectedBrand} />
      )}
    </div>
  );
}

// ============================================
// ポートフォリオ戦略ビュー
// ============================================
function PortfolioStrategyView({ data }: { data: PortfolioData }) {
  return (
    <>
      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            エグゼクティブサマリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {data.executiveSummary.split("\n").map((line, i) => (
              <p key={i} className="text-sm leading-relaxed mb-2">
                {line.startsWith("**") ? (
                  <strong>{line.replace(/\*\*/g, "")}</strong>
                ) : line.startsWith("- ") ? (
                  <span className="ml-4">• {line.slice(2)}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immediate Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              即時アクション
            </CardTitle>
            <CardDescription>今すぐ実行すべき施策</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.strategicPriorities.immediate.map((action, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Mid-term Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              中期アクション
            </CardTitle>
            <CardDescription>3-6ヶ月以内に実行</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.strategicPriorities.midTerm.map((action, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Sections */}
      <div className="space-y-6">
        {data.sections.map((section, i) => (
          <PortfolioSectionCard key={i} section={section} />
        ))}
      </div>
    </>
  );
}

// ============================================
// ポートフォリオセクションカード
// ============================================
function PortfolioSectionCard({ section }: { section: PortfolioSection }) {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-green-200 bg-green-50",
  };

  const priorityLabels = {
    high: "高優先度",
    medium: "中優先度",
    low: "低優先度",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{section.title}</CardTitle>
          {section.priority && (
            <Badge
              variant="outline"
              className={priorityColors[section.priority]}
            >
              {priorityLabels[section.priority]}
            </Badge>
          )}
        </div>
        <CardDescription>{section.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Findings */}
        {section.findings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              発見
            </h4>
            <ul className="space-y-1">
              {section.findings.map((finding, i) => (
                <li key={i} className="text-sm text-muted-foreground ml-6">
                  • {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insights */}
        {section.insights && section.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              インサイト
            </h4>
            <ul className="space-y-1">
              {section.insights.map((insight, i) => (
                <li key={i} className="text-sm text-muted-foreground ml-6">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {section.recommendations && section.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-blue-600" />
              推奨アクション
            </h4>
            <ul className="space-y-1">
              {section.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground ml-6">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cross Analysis */}
        {section.crossAnalysis && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>クロス分析:</strong> {section.crossAnalysis}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// ブランド戦略ビュー（既存）
// ============================================
function BrandStrategyView({ data, brandName }: { data: BrandStrategy; brandName: string }) {
  return (
    <>
      {/* Key Insight */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Key Insight - {brandName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{data.keyInsight}</p>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            エグゼクティブサマリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {data.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Findings & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              主要な発見
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.findings.map((finding, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              推奨アクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Winning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            勝ちパターン
          </CardTitle>
          <CardDescription>
            高エンゲージメントを獲得しているセグメント×文脈×メニューの組み合わせ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.winningPatterns.map((pattern, i) => (
              <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm">{pattern}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deep Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            深層インサイト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.deepInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            改善機会
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.improvementOpportunities.map((opp, i) => (
              <div key={i} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm">{opp}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            アクションプラン
          </CardTitle>
          <CardDescription>
            具体的な施策とKPI・期限
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.actionPlan.map((action, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {action.対象}
                  </Badge>
                  <Badge variant="secondary">
                    期限: {action.期限}
                  </Badge>
                </div>
                <p className="text-sm">{action.施策}</p>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">KPI</p>
                  <p className="text-sm">{action.KPI}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            競合戦略
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.competitorStrategy.map((strategy, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm">{strategy}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
