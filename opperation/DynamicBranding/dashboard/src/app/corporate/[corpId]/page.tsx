"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MVVSection } from "@/components/corporate/MVVSection";
import { StockUGCChart } from "@/components/corporate/StockUGCChart";
// TODO: ファン資産（製品ブランド）- Learning実装後に有効化
// import { FanUrchinChart } from "@/components/corporate/FanUrchinChart";
// import { FanTireChart } from "@/components/corporate/FanTireChart";
import { CorporateLoyaltySection } from "@/components/corporate/CorporateLoyaltySection";
import {
  LoyaltyGrowthTargets,
  LoyaltyConversionFunnel,
  LoyaltyTriggerAnalysis,
  LoyaltyBehavioralPatterns,
  LoyaltyProjectionChart,
  LoyaltyStrategyCards,
} from "@/components/loyalty-growth";
import {
  CorporateOverview,
  CorporateTopicChart,
  CorporateSentimentByTopic,
  CorporateTrendsChart,
  CorporateSourceChart,
  CorporateTopPosts,
} from "@/components/corporate-analytics";
import { WorldNewsSection } from "@/components/corporate-world-news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CorporateSummaryResponse, LoyaltyGrowthResponse } from "@/types/corporate.types";
import {
  Building2,
  TrendingUp,
  Users,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Globe,
  Target,
  AlertTriangle,
} from "lucide-react";
import { NegativeAnalysisSection } from "@/components/corporate/NegativeAnalysisSection";

type ActiveTab = "ugc" | "stock" | "fan" | "world" | "strategy" | "negative";

export default function CorporateDashboardPage() {
  const params = useParams();
  const corpId = params.corpId as string;
  const corporateId = parseInt(corpId);

  const [summary, setSummary] = useState<CorporateSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ugc");

  // Loyalty Growth Strategy state
  const [loyaltyGrowthData, setLoyaltyGrowthData] = useState<LoyaltyGrowthResponse | null>(null);
  const [loyaltyGrowthLoading, setLoyaltyGrowthLoading] = useState(false);
  const [loyaltyGrowthError, setLoyaltyGrowthError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setSummaryError(null);
        const res = await fetch(`/api/corporate/${corporateId}`);
        if (res.ok) {
          const json: CorporateSummaryResponse = await res.json();
          setSummary(json);
        } else {
          const errorData = await res.json().catch(() => ({}));
          setSummaryError(errorData.error || "コーポレートサマリーの取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching corporate summary:", err);
        setSummaryError("コーポレートサマリーの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(corporateId)) {
      fetchSummary();
    }
  }, [corporateId]);

  // 戦略タブがアクティブになったらロイヤリティ成長データを取得
  useEffect(() => {
    async function fetchLoyaltyGrowth() {
      if (activeTab !== "strategy" || loyaltyGrowthData) return;

      try {
        setLoyaltyGrowthLoading(true);
        setLoyaltyGrowthError(null);
        const res = await fetch(`/api/corporate/${corporateId}/loyalty-growth`);
        if (res.ok) {
          const json: LoyaltyGrowthResponse = await res.json();
          setLoyaltyGrowthData(json);
        } else {
          const errorData = await res.json();
          setLoyaltyGrowthError(errorData.error || "ロイヤリティ成長データの取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching loyalty growth:", err);
        setLoyaltyGrowthError("ロイヤリティ成長データの取得中にエラーが発生しました");
      } finally {
        setLoyaltyGrowthLoading(false);
      }
    }
    if (!isNaN(corporateId)) {
      fetchLoyaltyGrowth();
    }
  }, [activeTab, corporateId]);

  if (isNaN(corporateId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">無効なコーポレートIDです</p>
      </div>
    );
  }

  if (summaryError && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{summaryError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold">
                  {loading ? "読み込み中..." : summary?.corporate.name || "コーポレート分析"}
                </h1>
                {summary?.corporate.ticker_symbol && (
                  <span className="text-sm text-muted-foreground">
                    ({summary.corporate.ticker_symbol})
                  </span>
                )}
              </div>
            </div>

            {/* クイックリンク */}
            {summary?.corporate.ticker_symbol && (
              <a
                href={`https://finance.yahoo.co.jp/quote/${summary.corporate.ticker_symbol}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Yahoo Finance
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* サマリーカード */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">製品ブランド数</p>
                    <p className="text-2xl font-bold">
                      {summary.product_brands.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">総言及数</p>
                    <p className="text-2xl font-bold">
                      {summary.aggregated_metrics.total_mentions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ポジティブ率</p>
                    <p className="text-2xl font-bold">
                      {summary.aggregated_metrics.positive_rate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CEPカバレッジ</p>
                    <p className="text-2xl font-bold">
                      {summary.aggregated_metrics.cep_coverage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 製品ブランド一覧 */}
        {summary && summary.product_brands.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                製品ブランド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.product_brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${encodeURIComponent(brand.name)}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MVVセクション */}
        <MVVSection corporateId={corporateId} />

        {/* タブナビゲーション */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("ugc")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ugc"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            UGC分析
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "stock"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            株価×UGC
          </button>
          <button
            onClick={() => setActiveTab("fan")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "fan"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            ファン資産
          </button>
          <button
            onClick={() => setActiveTab("world")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "world"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            世の中分析
          </button>
          <button
            onClick={() => setActiveTab("strategy")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "strategy"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            戦略提案
          </button>
          <button
            onClick={() => setActiveTab("negative")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "negative"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            ロイヤリティ低分析
          </button>
        </div>

        {/* UGC分析タブ */}
        {activeTab === "ugc" && (
          <div className="space-y-6">
            {/* KPI概要 */}
            <CorporateOverview />

            {/* トピック分布 × センチメント */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorporateTopicChart />
              <CorporateSentimentByTopic />
            </div>

            {/* 時系列推移 */}
            <CorporateTrendsChart />

            {/* ソース分布 × 高エンゲージメント投稿 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorporateSourceChart />
              <CorporateTopPosts />
            </div>
          </div>
        )}

        {/* 株価×UGC相関タブ */}
        {activeTab === "stock" && (
          <StockUGCChart corporateId={corporateId} />
        )}

        {/* ファン資産可視化タブ */}
        {activeTab === "fan" && (
          <div className="space-y-6">
            {/* コーポレートロイヤリティ */}
            <CorporateLoyaltySection corporateId={corporateId} />
          </div>
        )}

        {/* 世の中分析タブ */}
        {activeTab === "world" && (
          <WorldNewsSection corpId={corporateId} />
        )}

        {/* 戦略提案タブ - ロイヤリティ成長戦略 */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  ロイヤリティ成長戦略
                  {loyaltyGrowthData?.isFallback && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      静的データ
                    </span>
                  )}
                  {loyaltyGrowthData && !loyaltyGrowthData.isFallback && loyaltyGrowthData.cached && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      キャッシュ
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  SNS 50,000件のデータからAIが生成した戦略提案
                </p>
              </div>
              {/* 生成情報 */}
              {loyaltyGrowthData && (
                <div className="text-xs text-muted-foreground text-right">
                  {loyaltyGrowthData.generatedAt && (
                    <p>生成: {new Date(loyaltyGrowthData.generatedAt).toLocaleString("ja-JP")}</p>
                  )}
                </div>
              )}
            </div>

            {/* ローディング */}
            {loyaltyGrowthLoading && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      ロイヤリティ成長データを読み込み中...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* エラー */}
            {loyaltyGrowthError && !loyaltyGrowthLoading && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6">
                  <p className="text-sm text-red-600">{loyaltyGrowthError}</p>
                </CardContent>
              </Card>
            )}

            {/* ロイヤリティ成長戦略コンテンツ */}
            {loyaltyGrowthData && !loyaltyGrowthLoading && (
              <>
                {/* 目標概要 */}
                <LoyaltyGrowthTargets
                  targets={loyaltyGrowthData.growthTargets}
                />

                {/* 転換フロー × 行動パターン */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LoyaltyConversionFunnel
                    funnels={loyaltyGrowthData.conversionFunnels}
                  />
                  <LoyaltyBehavioralPatterns
                    patterns={loyaltyGrowthData.behavioralPatterns}
                  />
                </div>

                {/* トリガー分析 */}
                <LoyaltyTriggerAnalysis
                  funnels={loyaltyGrowthData.conversionFunnels}
                />

                {/* 成長予測タイムライン */}
                <LoyaltyProjectionChart
                  timeline={loyaltyGrowthData.growthTargets.projectedTimeline}
                  targetDate={loyaltyGrowthData.growthTargets.targetDistribution.high.targetDate}
                />

                {/* 戦略提案カード */}
                <LoyaltyStrategyCards
                  recommendations={loyaltyGrowthData.recommendations}
                />
              </>
            )}
          </div>
        )}

        {/* ロイヤリティ低分析タブ */}
        {activeTab === "negative" && (
          <NegativeAnalysisSection corporateId={corporateId} />
        )}

        {/* 分析のポイント */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-base">分析のポイント</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">ブランドパーソナリティ</h4>
                <p className="text-muted-foreground">
                  UGCから抽出されたブランドの性格。
                  消費者がブランドをどう認識しているかを表します。
                  5軸のバランスでブランドの個性が分かります。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">株価×UGC相関</h4>
                <p className="text-muted-foreground">
                  SNS上の言及と株価の関係性を分析。
                  ラグ（遅延）を考慮し、UGCが株価に先行するか、
                  または株価変動がUGCに影響するかを検証します。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">ファン資産</h4>
                <p className="text-muted-foreground">
                  ブランドとファンの関係性を可視化。
                  コアファンの割合、関係の強さ、距離感を把握し、
                  ファンマーケティングの方向性を示します。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>
            データは{summary?.product_brands.length || 0}ブランドの
            {summary?.aggregated_metrics.total_mentions.toLocaleString() || 0}件のUGCから生成
          </p>
        </footer>
      </main>
    </div>
  );
}
