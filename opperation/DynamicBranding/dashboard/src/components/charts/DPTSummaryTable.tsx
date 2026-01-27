"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/utils/colors";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  List,
  Table,
} from "lucide-react";

interface DPTSummary {
  brandName: string;
  brandId: number | null;
  useCaseCount: number;
  postCount: number;
  topUseCase: string | null;
  topUseCasePostCount: number;
  generatedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  isGenerated: boolean;
}

interface DPTSummaryResponse {
  summaries: DPTSummary[];
  generatedCount: number;
  expiredCount: number;
  totalBrands: number;
}

interface DPTDetailUseCase {
  id: string;
  name: string;
  brandName: string;
  brandId: number;
  context: {
    why: string;
    when: string;
    where: string;
    withWhom: string;
  };
  positioning: {
    competitors: string[];
    pop: string[];
    pod: string[];
  };
  evidence: {
    postCount: number;
    topKeywords?: string[];
    samplePosts?: string[];
  };
  generatedAt: string | null;
}

interface DPTDetailResponse {
  useCases: DPTDetailUseCase[];
  totalCount: number;
}

type ViewMode = "summary" | "detail";

interface Filters {
  brands: string[];
  searchText: string;
  minPosts: number | null;
}

interface SortConfig {
  key: "brandName" | "name" | "postCount";
  direction: "asc" | "desc";
}

const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

export function DPTSummaryTable() {
  // Summary view state
  const [data, setData] = useState<DPTSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingBrand, setGeneratingBrand] = useState<string | null>(null);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [brandDetails, setBrandDetails] = useState<Record<string, unknown>>({});

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("summary");

  // Detail view state
  const [detailData, setDetailData] = useState<DPTDetailUseCase[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<DPTDetailUseCase | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    searchText: "",
    minPosts: null,
  });
  const [showBrandFilter, setShowBrandFilter] = useState(false);

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "postCount",
    direction: "desc",
  });

  // Fetch detail data
  const fetchDetailData = useCallback(async () => {
    if (detailData) return; // Already fetched
    try {
      setDetailLoading(true);
      const res = await fetch("/api/dpt?view=detail");
      if (!res.ok) throw new Error("詳細データの取得に失敗しました");
      const json: DPTDetailResponse = await res.json();
      setDetailData(json.useCases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setDetailLoading(false);
    }
  }, [detailData]);

  // Filter and sort detail data
  const filteredData = useMemo(() => {
    if (!detailData) return [];

    return detailData
      .filter((uc) => {
        // Brand filter
        if (filters.brands.length > 0 && !filters.brands.includes(uc.brandName)) {
          return false;
        }
        // Text search
        if (filters.searchText && !uc.name.includes(filters.searchText)) {
          return false;
        }
        // Post count filter
        if (filters.minPosts !== null && uc.evidence.postCount < filters.minPosts) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "postCount") {
          return (a.evidence.postCount - b.evidence.postCount) * multiplier;
        }
        if (sortConfig.key === "brandName") {
          return a.brandName.localeCompare(b.brandName) * multiplier;
        }
        return a.name.localeCompare(b.name) * multiplier;
      });
  }, [detailData, filters, sortConfig]);

  // Toggle sort
  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Toggle brand filter
  const toggleBrandFilter = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ brands: [], searchText: "", minPosts: null });
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  async function fetchSummaries() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dpt");
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function generateDPT(brandName: string) {
    try {
      setGeneratingBrand(brandName);
      const res = await fetch(
        `/api/brands/${encodeURIComponent(brandName)}/dpt?refresh=true`
      );
      if (!res.ok) throw new Error("DPT生成に失敗しました");
      await fetchSummaries();
    } catch (err) {
      console.error("DPT generation failed:", err);
    } finally {
      setGeneratingBrand(null);
    }
  }

  const [detailError, setDetailError] = useState<Record<string, string>>({});

  async function fetchBrandDetail(brandName: string) {
    if (brandDetails[brandName]) return;
    setDetailError((prev) => ({ ...prev, [brandName]: "" }));
    try {
      const res = await fetch(
        `/api/brands/${encodeURIComponent(brandName)}/dpt`
      );
      if (!res.ok) {
        throw new Error("詳細データの取得に失敗しました");
      }
      const json = await res.json();
      setBrandDetails((prev) => ({ ...prev, [brandName]: json }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setDetailError((prev) => ({ ...prev, [brandName]: msg }));
    }
  }

  function toggleExpand(brandName: string) {
    if (expandedBrand === brandName) {
      setExpandedBrand(null);
    } else {
      setExpandedBrand(brandName);
      fetchBrandDetail(brandName);
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadge(summary: DPTSummary) {
    if (!summary.isGenerated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
          <AlertCircle className="h-3 w-3" />
          未生成
        </span>
      );
    }
    if (summary.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3" />
          期限切れ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        有効
      </span>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>DPTサマリーを読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchSummaries}
              className="px-4 py-2 text-sm border rounded hover:bg-muted"
            >
              再試行
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  DPT（Dynamic Positioning Table）一覧
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  全ブランドのポジショニング分析概要
                </p>
              </div>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
                <button
                  onClick={() => setViewMode("summary")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === "summary"
                      ? "bg-background shadow-sm font-medium"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <List className="h-4 w-4" />
                  サマリー
                </button>
                <button
                  onClick={() => {
                    setViewMode("detail");
                    fetchDetailData();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === "detail"
                      ? "bg-background shadow-sm font-medium"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Table className="h-4 w-4" />
                  詳細テーブル
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {viewMode === "summary" ? (
                  <>
                    生成済み: {data.generatedCount}/{data.totalBrands}
                    {data.expiredCount > 0 && (
                      <span className="text-yellow-600 ml-2">
                        （{data.expiredCount}件期限切れ）
                      </span>
                    )}
                  </>
                ) : (
                  <>全{filteredData.length}件</>
                )}
              </div>
              <button
                onClick={() => {
                  if (viewMode === "summary") {
                    fetchSummaries();
                  } else {
                    setDetailData(null);
                    fetchDetailData();
                  }
                }}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="更新"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "detail" ? (
            <DetailTableView
              data={filteredData}
              loading={detailLoading}
              filters={filters}
              setFilters={setFilters}
              showBrandFilter={showBrandFilter}
              setShowBrandFilter={setShowBrandFilter}
              toggleBrandFilter={toggleBrandFilter}
              clearFilters={clearFilters}
              sortConfig={sortConfig}
              handleSort={handleSort}
              onRowClick={setSelectedUseCase}
            />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">ブランド</th>
                  <th className="text-center py-3 px-2 font-medium">
                    Use Case
                  </th>
                  <th className="text-center py-3 px-2 font-medium">投稿数</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Top Use Case
                  </th>
                  <th className="text-center py-3 px-2 font-medium">更新</th>
                  <th className="text-center py-3 px-2 font-medium">状態</th>
                  <th className="text-center py-3 px-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.summaries.map((summary) => (
                  <>
                    <tr
                      key={summary.brandName}
                      className={`border-b hover:bg-muted/30 transition-colors ${
                        expandedBrand === summary.brandName ? "bg-muted/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            summary.isGenerated && toggleExpand(summary.brandName)
                          }
                          className="flex items-center gap-2 hover:underline disabled:hover:no-underline disabled:opacity-50"
                          disabled={!summary.isGenerated}
                        >
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                BRAND_COLORS[summary.brandName] || "#888",
                            }}
                          />
                          <span className="font-medium">{summary.brandName}</span>
                          {summary.isGenerated && (
                            expandedBrand === summary.brandName ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )
                          )}
                        </button>
                      </td>
                      <td className="text-center py-3 px-2">
                        {summary.isGenerated ? (
                          <span className="font-medium">
                            {summary.useCaseCount}件
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {summary.isGenerated ? (
                          <span>{(summary.postCount ?? 0).toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {summary.topUseCase ? (
                          <div className="flex items-center gap-2">
                            <span>{summary.topUseCase}</span>
                            <span className="text-xs text-muted-foreground">
                              ({summary.topUseCasePostCount}件)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2 text-muted-foreground">
                        {formatDate(summary.generatedAt)}
                      </td>
                      <td className="text-center py-3 px-2">
                        {getStatusBadge(summary)}
                      </td>
                      <td className="text-center py-3 px-2">
                        <button
                          onClick={() => generateDPT(summary.brandName)}
                          disabled={generatingBrand !== null}
                          className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          {generatingBrand === summary.brandName ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              生成中
                            </span>
                          ) : summary.isGenerated ? (
                            "再生成"
                          ) : (
                            "生成"
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedBrand === summary.brandName && detailError[summary.brandName] && (
                        <tr key={`${summary.brandName}-error`}>
                          <td colSpan={7} className="p-4 bg-red-50">
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              {detailError[summary.brandName]}
                            </div>
                          </td>
                        </tr>
                      )}
                    {expandedBrand === summary.brandName &&
                      brandDetails[summary.brandName] && (
                        <tr key={`${summary.brandName}-detail`}>
                          <td colSpan={7} className="p-0">
                            <UseCaseDetail
                              data={
                                brandDetails[summary.brandName] as {
                                  useCases: Array<{
                                    id: string;
                                    name: string;
                                    context: {
                                      why: string;
                                      when: string;
                                      where: string;
                                      withWhom: string;
                                    };
                                    positioning: {
                                      competitors: string[];
                                      pop: string[];
                                      pod: string[];
                                    };
                                    evidence: {
                                      postCount: number;
                                    };
                                  }>;
                                }
                              }
                            />
                          </td>
                        </tr>
                      )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedUseCase && (
        <UseCaseModal
          useCase={selectedUseCase}
          onClose={() => setSelectedUseCase(null)}
        />
      )}
    </div>
  );
}

// Use Case詳細表示コンポーネント
function UseCaseDetail({
  data,
}: {
  data: {
    useCases: Array<{
      id: string;
      name: string;
      context: {
        why: string;
        when: string;
        where: string;
        withWhom: string;
      };
      positioning: {
        competitors: string[];
        pop: string[];
        pod: string[];
      };
      evidence: {
        postCount: number;
      };
    }>;
  };
}) {
  if (!data.useCases || data.useCases.length === 0) {
    return (
      <div className="p-4 bg-muted/20 text-sm text-muted-foreground">
        Use Caseデータがありません
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/20 border-t">
      <div className="grid gap-3">
        {data.useCases.map((uc) => (
          <div
            key={uc.id}
            className="bg-background rounded-lg p-3 border text-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {uc.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {uc.evidence.postCount}件
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs mb-2">
              <div>
                <span className="text-muted-foreground">Why:</span>{" "}
                {uc.context.why}
              </div>
              <div>
                <span className="text-muted-foreground">When:</span>{" "}
                {uc.context.when}
              </div>
              <div>
                <span className="text-muted-foreground">Where:</span>{" "}
                {uc.context.where}
              </div>
              <div>
                <span className="text-muted-foreground">Who:</span>{" "}
                {uc.context.withWhom}
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-blue-600 font-medium">POP:</span>{" "}
                {uc.positioning.pop.join(", ")}
              </div>
              <div>
                <span className="text-green-600 font-medium">POD:</span>{" "}
                {uc.positioning.pod.join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 詳細テーブルビューコンポーネント
function DetailTableView({
  data,
  loading,
  filters,
  setFilters,
  showBrandFilter,
  setShowBrandFilter,
  toggleBrandFilter,
  clearFilters,
  sortConfig,
  handleSort,
  onRowClick,
}: {
  data: DPTDetailUseCase[];
  loading: boolean;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  showBrandFilter: boolean;
  setShowBrandFilter: React.Dispatch<React.SetStateAction<boolean>>;
  toggleBrandFilter: (brand: string) => void;
  clearFilters: () => void;
  sortConfig: SortConfig;
  handleSort: (key: SortConfig["key"]) => void;
  onRowClick: (uc: DPTDetailUseCase) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>詳細データを読み込み中...</p>
      </div>
    );
  }

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const hasActiveFilters =
    filters.brands.length > 0 || filters.searchText || filters.minPosts !== null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg">
        {/* Brand Filter */}
        <div className="relative">
          <button
            onClick={() => setShowBrandFilter(!showBrandFilter)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md bg-background hover:bg-muted/50"
          >
            ブランド
            {filters.brands.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                {filters.brands.length}
              </span>
            )}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showBrandFilter && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background border rounded-lg shadow-lg z-10 min-w-[160px]">
              {VALID_BRANDS.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrandFilter(brand)}
                    className="rounded border-gray-300"
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: BRAND_COLORS[brand] || "#888" }}
                  />
                  {brand}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Use Case Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Use Case検索..."
            value={filters.searchText}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchText: e.target.value }))
            }
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>

        {/* Post Count Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">投稿数 ≥</span>
          <input
            type="number"
            placeholder="0"
            value={filters.minPosts ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minPosts: e.target.value ? parseInt(e.target.value, 10) : null,
              }))
            }
            className="w-20 px-2 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            クリア
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                className="text-left py-3 px-3 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort("brandName")}
              >
                <div className="flex items-center gap-1">
                  ブランド
                  {getSortIcon("brandName")}
                </div>
              </th>
              <th
                className="text-left py-3 px-3 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Use Case
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="text-center py-3 px-2 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort("postCount")}
              >
                <div className="flex items-center justify-center gap-1">
                  投稿数
                  {getSortIcon("postCount")}
                </div>
              </th>
              <th className="text-left py-3 px-3 font-medium">Why</th>
              <th className="text-left py-3 px-3 font-medium">When</th>
              <th className="text-left py-3 px-3 font-medium">Who</th>
              <th className="text-left py-3 px-3 font-medium">POP</th>
              <th className="text-left py-3 px-3 font-medium">POD</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  {hasActiveFilters
                    ? "フィルター条件に一致するデータがありません"
                    : "データがありません"}
                </td>
              </tr>
            ) : (
              data.map((uc) => (
                <tr
                  key={`${uc.brandName}-${uc.id}`}
                  onClick={() => onRowClick(uc)}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: BRAND_COLORS[uc.brandName] || "#888",
                        }}
                      />
                      <span className="font-medium">{uc.brandName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium">{uc.name}</td>
                  <td className="py-3 px-2 text-center">
                    {uc.evidence.postCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[150px] truncate">
                    {uc.context.why}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[120px] truncate">
                    {uc.context.when}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {uc.context.withWhom}
                  </td>
                  <td className="py-3 px-3 text-xs max-w-[150px]">
                    <span className="text-blue-600">
                      {uc.positioning.pop.slice(0, 2).join(", ")}
                      {uc.positioning.pop.length > 2 && "..."}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs max-w-[150px]">
                    <span className="text-green-600">
                      {uc.positioning.pod.slice(0, 2).join(", ")}
                      {uc.positioning.pod.length > 2 && "..."}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 詳細モーダルコンポーネント
function UseCaseModal({
  useCase,
  onClose,
}: {
  useCase: DPTDetailUseCase;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
              style={{
                backgroundColor: BRAND_COLORS[useCase.brandName] || "#888",
              }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {useCase.brandName} - {useCase.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 bg-white dark:bg-gray-900">
          {/* Post Count */}
          <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <span className="font-medium text-gray-700 dark:text-gray-300">投稿数:</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {useCase.evidence.postCount.toLocaleString()}件
            </span>
          </div>

          {/* Context */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Target className="h-4 w-4 text-orange-500" />
              Context
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm border border-orange-100 dark:border-orange-800">
              <div>
                <span className="text-orange-600 dark:text-orange-400 font-medium">Why:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{useCase.context.why}</p>
              </div>
              <div>
                <span className="text-orange-600 dark:text-orange-400 font-medium">When:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{useCase.context.when}</p>
              </div>
              <div>
                <span className="text-orange-600 dark:text-orange-400 font-medium">Where:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{useCase.context.where}</p>
              </div>
              <div>
                <span className="text-orange-600 dark:text-orange-400 font-medium">Who:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{useCase.context.withWhom}</p>
              </div>
            </div>
          </div>

          {/* Positioning */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Positioning</h3>
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
              {/* Competitors */}
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">競合:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {useCase.positioning.competitors.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* POP */}
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">POP (Points of Parity):</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {useCase.positioning.pop.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* POD */}
              <div>
                <span className="text-green-600 dark:text-green-400 font-semibold">POD (Points of Difference):</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {useCase.positioning.pod.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sample Posts */}
          {useCase.evidence.samplePosts && useCase.evidence.samplePosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">サンプル投稿</h3>
              <div className="space-y-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm border border-purple-100 dark:border-purple-800">
                {useCase.evidence.samplePosts.map((post, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 italic">
                    「{post}」
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Top Keywords */}
          {useCase.evidence.topKeywords && useCase.evidence.topKeywords.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">関連キーワード</h3>
              <div className="flex flex-wrap gap-2">
                {useCase.evidence.topKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
