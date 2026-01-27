"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { CorrelationHeatmap } from "@/components/charts/CorrelationHeatmap";
import { SeasonalityChart } from "@/components/charts/SeasonalityChart";
// InsightList removed - merged into ReportsView
import { MentionShareChart } from "@/components/charts/MentionShareChart";
import { CooccurrenceHeatmap } from "@/components/charts/CooccurrenceHeatmap";
import { SentimentChart } from "@/components/charts/SentimentChart";
import { GoogleTrendsTable } from "@/components/data/GoogleTrendsTable";
import { SNSDataView } from "@/components/data/SNSDataView";
import { ReportsView } from "@/components/reports/ReportsView";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CEPMarketOverview } from "@/components/charts/CEPMarketOverview";
import { CEPCompetitionMap } from "@/components/charts/CEPCompetitionMap";
import { CEPGapFinder } from "@/components/charts/CEPGapFinder";
import { CEPTrendChart } from "@/components/charts/CEPTrendChart";
import { CEPMatrix } from "@/components/charts/CEPMatrix";
import { KeywordWordCloud } from "@/components/charts/KeywordWordCloud";
import { KeywordCooccurrenceMatrix } from "@/components/charts/KeywordCooccurrenceMatrix";
import { KeywordRanking } from "@/components/charts/KeywordRanking";
import { BrandKeywordCEPSankey } from "@/components/charts/BrandKeywordCEPSankey";
import { KeywordInsightSummary } from "@/components/charts/KeywordInsightSummary";
import { UGCLabelChart } from "@/components/charts/UGCLabelChart";
import { SNSBrandFilter } from "@/components/charts/SNSBrandFilter";
import { DPTSummaryTable } from "@/components/charts/DPTSummaryTable";
import WsDetailChart from "@/components/charts/WsDetailChart";
import { PersonaAnalysisTab } from "@/components/persona/PersonaAnalysisTab";
import { ReviewCardsTab } from "@/components/charts/ReviewCardsTab";
import { BrandHeader } from "@/components/brand-detail/BrandHeader";
import { BrandUserSection } from "@/components/brand-detail/BrandUserSection";
import { BrandCEPSection } from "@/components/brand-detail/BrandCEPSection";
import { BrandDPTSection } from "@/components/brand-detail/BrandDPTSection";
import { BrandPostsSection } from "@/components/brand-detail/BrandPostsSection";
import { BRANDS, BRAND_COLORS } from "@/lib/utils/colors";
import {
  TrendingUp,
  Grid3X3,
  Calendar,
  MessageSquare,
  Database,
  FileText,
  Target,
  Search,
  BarChart3,
  Building2,
  LayoutGrid,
  Users,
  Compass,
  Star,
} from "lucide-react";
import { StrategyView } from "@/components/strategy/StrategyView";

// ============================================
// 型定義
// ============================================
type Section = "data" | "analytics" | "reports";
type AnalyticsSubCategory = "overview" | "brand";

interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionConfig {
  id: Section;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tabs: TabConfig[];
}

// ============================================
// セクション定義
// ============================================
const SECTIONS: SectionConfig[] = [
  {
    id: "data",
    label: "Data",
    description: "素データへのアクセス・検索",
    icon: Database,
    tabs: [
      { id: "googletrends", label: "GT生データ", shortLabel: "GT", icon: TrendingUp },
      { id: "snsdata", label: "SNS生データ", shortLabel: "SNS", icon: Database },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "複数次元での分析・トレンド把握",
    icon: BarChart3,
    tabs: [
      { id: "trends", label: "トレンド推移", shortLabel: "トレンド", icon: TrendingUp },
      { id: "correlation", label: "相関分析", shortLabel: "相関", icon: Grid3X3 },
      { id: "seasonality", label: "季節性", shortLabel: "季節", icon: Calendar },
      { id: "sns", label: "SNS分析", shortLabel: "SNS", icon: MessageSquare },
      { id: "keywords", label: "関連KW", shortLabel: "KW", icon: Search },
      { id: "cep", label: "市場構造", shortLabel: "市場", icon: Target },
      { id: "ws", label: "W's分析", shortLabel: "W's", icon: Users },
      { id: "dpt", label: "DPT", shortLabel: "DPT", icon: LayoutGrid },
      { id: "persona", label: "ペルソナ", shortLabel: "ペルソナ", icon: Users },
      { id: "reviews", label: "口コミ", shortLabel: "口コミ", icon: Star },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    description: "総合的な分析結果・戦略提案",
    icon: FileText,
    tabs: [
      { id: "reports", label: "レポート", shortLabel: "報告", icon: FileText },
      { id: "strategy-overview", label: "戦略", shortLabel: "戦略", icon: Compass },
    ],
  },
];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("analytics");
  const [activeTab, setActiveTab] = useState("trends");
  const [analyticsSubCategory, setAnalyticsSubCategory] = useState<AnalyticsSubCategory>("overview");
  const [selectedBrand, setSelectedBrand] = useState<string>("ほんだし");
  const [snsBrand, setSnsBrand] = useState<string>("all");

  // セクション切り替え時に最初のタブに自動移動
  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    const sectionConfig = SECTIONS.find((s) => s.id === section);
    if (sectionConfig && sectionConfig.tabs.length > 0) {
      setActiveTab(sectionConfig.tabs[0].id);
    }
  };

  // 現在のセクション設定を取得
  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">DynamicBranding ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">
          味の素グループ 8ブランドの検索トレンド分析 - 「点→線→面」ブランディング
        </p>
      </header>

      {/* セクション切り替えボタン */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 hover:shadow text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </button>
          );
        })}

        {/* コーポレート分析リンク */}
        <Link
          href="/corporate/1"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          <Building2 className="h-4 w-4" />
          <span>Corporate分析</span>
        </Link>
      </div>

      {/* セクション説明 */}
      {currentSection && (
        <p className="text-sm text-muted-foreground mb-4">
          {currentSection.description}
        </p>
      )}

      {/* Analytics サブカテゴリ切り替え */}
      {activeSection === "analytics" && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAnalyticsSubCategory("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
              analyticsSubCategory === "overview"
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            総合
          </button>
          <button
            onClick={() => setAnalyticsSubCategory("brand")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
              analyticsSubCategory === "brand"
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            ブランド別
          </button>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* 現在のセクションのタブ（Analyticsはoverviewモードのみ表示） */}
        {currentSection && !(activeSection === "analytics" && analyticsSubCategory === "brand") && (
          <TabsList
            className={`grid w-full lg:w-auto lg:inline-grid ${
              currentSection.tabs.length === 2
                ? "grid-cols-2"
                : currentSection.tabs.length === 10
                ? "grid-cols-5 sm:grid-cols-10"
                : currentSection.tabs.length === 9
                ? "grid-cols-3 sm:grid-cols-9"
                : currentSection.tabs.length === 8
                ? "grid-cols-4 sm:grid-cols-8"
                : currentSection.tabs.length === 7
                ? "grid-cols-4 sm:grid-cols-7"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {currentSection.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        )}

        {/* Data セクションのコンテンツ */}
        <TabsContent value="googletrends">
          <GoogleTrendsTable />
        </TabsContent>

        <TabsContent value="snsdata">
          <SNSDataView />
        </TabsContent>

        {/* Analytics セクションのコンテンツ（総合モードのみ） */}
        {!(activeSection === "analytics" && analyticsSubCategory === "brand") && (
          <>
            <TabsContent value="trends">
              <TrendLineChart />
            </TabsContent>

            <TabsContent value="correlation">
              <CorrelationHeatmap />
            </TabsContent>

            <TabsContent value="seasonality">
              <SeasonalityChart />
            </TabsContent>

            <TabsContent value="sns">
              <div className="space-y-6">
                <SNSBrandFilter
                  selectedBrand={snsBrand}
                  onBrandChange={setSnsBrand}
                />
                <UGCLabelChart brand={snsBrand} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MentionShareChart />
                  <SentimentChart brand={snsBrand} />
                </div>
                <CooccurrenceHeatmap />
              </div>
            </TabsContent>

            <TabsContent value="keywords">
              <div className="space-y-6">
                <KeywordInsightSummary brand="all" />
                <KeywordWordCloud />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <KeywordCooccurrenceMatrix />
                  <KeywordRanking />
                </div>
                <BrandKeywordCEPSankey />
              </div>
            </TabsContent>

            <TabsContent value="cep">
              <div className="space-y-6">
                {/* メイン: CEPトレンド推移（フル幅） */}
                <CEPTrendChart />

                {/* CEPポートフォリオ: 4象限マトリックス（フル幅） */}
                <CEPMatrix />

                {/* サブ: 市場規模・競争・空白発見（3列） */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <CEPMarketOverview />
                  <CEPCompetitionMap />
                  <CEPGapFinder />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ws">
              <WsDetailChart />
            </TabsContent>

            <TabsContent value="dpt">
              <DPTSummaryTable />
            </TabsContent>

            <TabsContent value="persona">
              <PersonaAnalysisTab />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewCardsTab />
            </TabsContent>
          </>
        )}

        {/* Reports セクションのコンテンツ */}
        <TabsContent value="reports">
          <ReportsView />
        </TabsContent>

        {/* Strategy セクションのコンテンツ */}
        <TabsContent value="strategy-overview">
          <StrategyView />
        </TabsContent>
      </Tabs>

      {/* Analytics ブランド別モードのコンテンツ */}
      {activeSection === "analytics" && analyticsSubCategory === "brand" && (
        <div className="space-y-8">
          {/* ブランドセレクタ（ボタン形式） */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                ブランドを選択:
              </span>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedBrand === brand
                        ? "text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border"
                    }`}
                    style={
                      selectedBrand === brand
                        ? { backgroundColor: BRAND_COLORS[brand] }
                        : undefined
                    }
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPIサマリー */}
          <BrandHeader brandName={selectedBrand} />

          {/* トレンド推移 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">トレンド推移</h3>
            <TrendLineChart brandFilter={selectedBrand} />
          </section>

          {/* ユーザー理解 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">ユーザー理解</h3>
            <BrandUserSection brandName={selectedBrand} />
          </section>

          {/* CEP分析 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">CEP分析</h3>
            <BrandCEPSection brandName={selectedBrand} />
          </section>

          {/* DPT分析 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">DPT分析</h3>
            <BrandDPTSection brandName={selectedBrand} />
          </section>

          {/* 生投稿サンプル */}
          <section>
            <h3 className="text-lg font-semibold mb-4">生投稿サンプル</h3>
            <BrandPostsSection brandName={selectedBrand} />
          </section>
        </div>
      )}

      <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground print:hidden">
        <p>DynamicBranding Dashboard - 味の素グループ ブランド分析</p>
        <p className="mt-1">
          データソース: Google Trends（過去5年・日本）/ SNS（50,000件）
        </p>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget context={{ section: activeSection, tab: activeTab }} />
    </main>
  );
}
