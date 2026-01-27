"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users, RefreshCw, LayoutGrid, Table } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  ZAxis,
} from "recharts";
import { BRAND_COLORS } from "@/lib/utils/colors";
import {
  Persona,
  AllPersonasResponse,
  PersonaScatterPoint,
  ClusterConfig,
  ClusteringQuality,
  DEFAULT_CLUSTER_CONFIG,
} from "@/types/persona.types";
import { PersonaDetailPanel } from "./PersonaDetailPanel";
import { PersonaQualityIndicator } from "./PersonaQualityIndicator";
import { PersonaMethodologySection } from "./PersonaMethodologySection";
import { PersonaTable } from "./PersonaTable";

// 9ゾーン「界隈」設定（3×3グリッド）
const ZONE_CONFIG = [
  // 上段（こだわり: Y > 0.67）
  {
    id: "quick-gourmet",
    name: "時短グルメ界隈",
    subtitle: "手軽に美味しく",
    x1: -2.5, x2: -0.67, y1: 0.67, y2: 2.5,
    bgColor: "#fef3c7",
    textColor: "#92400e",
    labelX: "17%",
    labelY: "17%",
  },
  {
    id: "committed",
    name: "こだわり派界隈",
    subtitle: "バランス重視",
    x1: -0.67, x2: 0.67, y1: 0.67, y2: 2.5,
    bgColor: "#e0e7ff",
    textColor: "#4338ca",
    labelX: "50%",
    labelY: "17%",
  },
  {
    id: "authentic",
    name: "本格派界隈",
    subtitle: "時間かけて極める",
    x1: 0.67, x2: 2.5, y1: 0.67, y2: 2.5,
    bgColor: "#dbeafe",
    textColor: "#1e40af",
    labelX: "83%",
    labelY: "17%",
  },
  // 中段（日常: -0.67 < Y < 0.67）
  {
    id: "everyday",
    name: "普段使い界隈",
    subtitle: "とりあえずこれ",
    x1: -2.5, x2: -0.67, y1: -0.67, y2: 0.67,
    bgColor: "#fef9c3",
    textColor: "#854d0e",
    labelX: "17%",
    labelY: "50%",
  },
  {
    id: "versatile",
    name: "万能派界隈",
    subtitle: "何でも対応",
    x1: -0.67, x2: 0.67, y1: -0.67, y2: 0.67,
    bgColor: "#f3f4f6",
    textColor: "#374151",
    labelX: "50%",
    labelY: "50%",
  },
  {
    id: "enthusiast",
    name: "料理好き界隈",
    subtitle: "楽しんで作る",
    x1: 0.67, x2: 2.5, y1: -0.67, y2: 0.67,
    bgColor: "#ccfbf1",
    textColor: "#0f766e",
    labelX: "83%",
    labelY: "50%",
  },
  // 下段（ルーティン: Y < -0.67）
  {
    id: "quick-routine",
    name: "時短ルーティン界隈",
    subtitle: "最速で済ませる",
    x1: -2.5, x2: -0.67, y1: -2.5, y2: -0.67,
    bgColor: "#fee2e2",
    textColor: "#991b1b",
    labelX: "17%",
    labelY: "83%",
  },
  {
    id: "standard",
    name: "定番派界隈",
    subtitle: "いつもの味",
    x1: -0.67, x2: 0.67, y1: -2.5, y2: -0.67,
    bgColor: "#fce7f3",
    textColor: "#9d174d",
    labelX: "50%",
    labelY: "83%",
  },
  {
    id: "careful-daily",
    name: "丁寧な日常界隈",
    subtitle: "日々を大切に",
    x1: 0.67, x2: 2.5, y1: -2.5, y2: -0.67,
    bgColor: "#d1fae5",
    textColor: "#065f46",
    labelX: "83%",
    labelY: "83%",
  },
];

interface PersonaClusterChartProps {
  initialBrand?: string;
  hideFilter?: boolean;
}

export function PersonaClusterChart({
  initialBrand,
  hideFilter = false,
}: PersonaClusterChartProps = {}) {
  const [data, setData] = useState<AllPersonasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  );
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"scatter" | "table">("scatter");

  const fetchData = useCallback(async (forceRefresh = false) => {
    setError(null);
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const url = forceRefresh
        ? "/api/personas/all?refresh=true"
        : "/api/personas/all";
      const res = await fetch(url);
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching personas:", err);
      setError("ペルソナデータの読み込みに失敗しました");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 全ペルソナを散布図用データに変換（安全なアクセス）- フックの前に計算
  const allPersonas: Persona[] = useMemo(() => {
    if (!data) return [];
    return (data.brands || []).flatMap((b) =>
      (b.personas || []).map((p) => ({ ...p, brand: b.brand }))
    );
  }, [data]);

  // フィルタリング
  const filteredPersonas = useMemo(() => {
    if (selectedBrands.length > 0) {
      return allPersonas.filter((p) => selectedBrands.includes(p.brand));
    }
    return allPersonas;
  }, [allPersonas, selectedBrands]);

  // 散布図用データポイントに変換（安全なアクセス）
  const scatterData: PersonaScatterPoint[] = useMemo(() => {
    return filteredPersonas
      .filter((p) => p.position && p.metrics)
      .map((p) => ({
        x: p.position?.x ?? 0,
        y: p.position?.y ?? 0,
        z: p.metrics?.post_count ?? 0,
        persona: p,
        brand: p.brand,
        color: BRAND_COLORS[p.brand] || "#666",
      }));
  }, [filteredPersonas]);

  // ブランド一覧（安全なアクセス）
  const brands = useMemo(() => {
    if (!data) return [];
    return (data.brands || []).map((b) => b.brand);
  }, [data]);

  // Loading state
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ペルソナ クラスター分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span>ペルソナを生成中...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ペルソナ クラスター分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              再読み込み
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ブランド選択のトグル
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  // 全選択/全解除
  const selectAll = () => setSelectedBrands(brands);
  const clearAll = () => setSelectedBrands([]);

  const clusterConfig: ClusterConfig = data.clusterConfig || DEFAULT_CLUSTER_CONFIG;

  // Get combined quality metrics for selected brands
  const getAggregatedQuality = (): ClusteringQuality | null => {
    const brandsList = data.brands || [];
    const relevantBrands = selectedBrands.length > 0
      ? brandsList.filter((b) => selectedBrands.includes(b.brand))
      : brandsList;

    const qualityBrands = relevantBrands.filter((b) => b.quality);
    if (qualityBrands.length === 0) return null;

    // Aggregate quality metrics
    const totalAnalyzed = qualityBrands.reduce((sum, b) => sum + (b.quality?.postsAnalyzed || 0), 0);
    const totalClustered = qualityBrands.reduce((sum, b) => sum + (b.quality?.postsClustered || 0), 0);
    const totalExcluded = qualityBrands.reduce((sum, b) => sum + (b.quality?.postsExcluded || 0), 0);
    const avgConfidence = qualityBrands.reduce((sum, b) => sum + (b.quality?.overallConfidence || 0), 0) / qualityBrands.length;
    const avgSilhouette = qualityBrands.reduce((sum, b) => sum + (b.quality?.silhouetteScore || 0), 0) / qualityBrands.length;
    const avgCompleteness = qualityBrands.reduce((sum, b) => sum + (b.quality?.dataCompleteness || 0), 0) / qualityBrands.length;

    // Aggregate unknown rates
    const unknownRates = {
      life_stage: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.life_stage || 0), 0) / qualityBrands.length),
      cooking_skill: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.cooking_skill || 0), 0) / qualityBrands.length),
      motivation_category: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.motivation_category || 0), 0) / qualityBrands.length),
      meal_occasion: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.meal_occasion || 0), 0) / qualityBrands.length),
      cooking_for: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.cooking_for || 0), 0) / qualityBrands.length),
      emotion: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.emotion || 0), 0) / qualityBrands.length),
      average: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.unknownRates?.average || 0), 0) / qualityBrands.length),
    };

    // Collect all cluster sizes
    const allClusterSizes = qualityBrands.flatMap((b) => b.quality?.clusterSizes || []);

    return {
      silhouetteScore: Math.round(avgSilhouette * 100) / 100,
      unknownRates,
      dataCompleteness: Math.round(avgCompleteness),
      clusterSeparation: Math.round(qualityBrands.reduce((sum, b) => sum + (b.quality?.clusterSeparation || 0), 0) / qualityBrands.length),
      overallConfidence: Math.round(avgConfidence),
      postsAnalyzed: totalAnalyzed,
      postsClustered: totalClustered,
      postsExcluded: totalExcluded,
      clusteringMethod: qualityBrands.every((b) => b.quality?.clusteringMethod === "kmeans") ? "kmeans" : "mixed",
      clusterSizes: allClusterSizes,
    };
  };

  const aggregatedQuality = getAggregatedQuality();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {initialBrand
                  ? `${initialBrand} - ペルソナ分析`
                  : "ペルソナ クラスター分析"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                横軸: {clusterConfig.x_axis.label}（{clusterConfig.x_axis.labels.min} → {clusterConfig.x_axis.labels.max}）
                縦軸: {clusterConfig.y_axis.label}（{clusterConfig.y_axis.labels.min} → {clusterConfig.y_axis.labels.max}）
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* 表示切り替えボタン */}
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("scatter")}
                  className={`p-2 text-sm transition-colors ${
                    viewMode === "scatter"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100"
                  }`}
                  title="散布図"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 text-sm transition-colors ${
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100"
                  }`}
                  title="テーブル"
                >
                  <Table className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="p-2 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                title="再生成"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          {!hideFilter && (
            <div className="flex gap-2 flex-wrap mt-4">
              <button
                onClick={selectAll}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedBrands.length === 0
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                全て
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedBrands.includes(brand)
                      ? "text-white border-transparent"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  style={
                    selectedBrands.includes(brand)
                      ? { backgroundColor: BRAND_COLORS[brand] || "#666" }
                      : {}
                  }
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
          {/* 品質インジケータ */}
          {aggregatedQuality && (
            <div className="mt-4">
              <PersonaQualityIndicator quality={aggregatedQuality} />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <PersonaTable
              personas={filteredPersonas}
              onSelectPersona={setSelectedPersona}
            />
          ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={clusterConfig.x_axis.label}
                  domain={[clusterConfig.x_axis.min - 0.5, clusterConfig.x_axis.max + 0.5]}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{
                    value: `${clusterConfig.x_axis.label} →`,
                    position: "bottom",
                    offset: 40,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={clusterConfig.y_axis.label}
                  domain={[clusterConfig.y_axis.min - 0.5, clusterConfig.y_axis.max + 0.5]}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{
                    value: `${clusterConfig.y_axis.label} →`,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[100, 400]}
                  name="投稿数"
                />

                {/* 4象限ゾーン背景 */}
                {ZONE_CONFIG.map((zone) => (
                  <ReferenceArea
                    key={zone.id}
                    x1={zone.x1}
                    x2={zone.x2}
                    y1={zone.y1}
                    y2={zone.y2}
                    fill={zone.bgColor}
                    fillOpacity={0.4}
                    stroke="none"
                  />
                ))}

                {/* 3×3グリッド境界線 */}
                <ReferenceLine x={-0.67} stroke="#d1d5db" strokeDasharray="3 3" />
                <ReferenceLine x={0.67} stroke="#d1d5db" strokeDasharray="3 3" />
                <ReferenceLine y={-0.67} stroke="#d1d5db" strokeDasharray="3 3" />
                <ReferenceLine y={0.67} stroke="#d1d5db" strokeDasharray="3 3" />
                {/* 原点の補助線（目立たせる） */}
                <ReferenceLine x={0} stroke="#999" strokeDasharray="3 3" strokeWidth={1.5} />
                <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" strokeWidth={1.5} />

                {/* 界隈ラベル（9ゾーン用に小さめフォント）*/}
                {ZONE_CONFIG.map((zone) => (
                  <g key={`label-${zone.id}`}>
                    <text
                      x={zone.labelX}
                      y={zone.labelY}
                      textAnchor="middle"
                      fill={zone.textColor}
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {zone.name}
                    </text>
                    <text
                      x={zone.labelX}
                      y={zone.labelY}
                      dy={15}
                      textAnchor="middle"
                      fill="#78716c"
                      fontSize={10}
                    >
                      {zone.subtitle}
                    </text>
                  </g>
                ))}

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload as PersonaScatterPoint;
                      const p = point.persona;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: point.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {p.brand}
                            </span>
                          </div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {p.description}
                          </p>
                          <div className="mt-2 text-xs space-y-1">
                            <p>料理スキル: {p.position.x.toFixed(1)}</p>
                            <p>こだわり度: {p.position.y.toFixed(1)}</p>
                            <p>投稿数: {p.metrics.post_count}件</p>
                          </div>
                          <p className="text-xs text-primary mt-2">
                            クリックで詳細を表示
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={scatterData}
                  onClick={(data) => {
                    if (data && data.persona) {
                      setSelectedPersona(data.persona);
                    }
                  }}
                  cursor="pointer"
                >
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.8}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* ブランド別ペルソナ数サマリー */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-6">
            {(data.brands || []).map((b) => (
              <div
                key={b.brand}
                className="p-2 rounded-lg text-center"
                style={{ backgroundColor: BRAND_COLORS[b.brand] + "15" }}
              >
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: BRAND_COLORS[b.brand] }}
                >
                  {b.brand}
                </p>
                <p className="text-lg font-bold">{(b.personas || []).length}</p>
                <p className="text-xs text-muted-foreground">ペルソナ</p>
              </div>
            ))}
          </div>

          {/* ペルソナ生成ロジック説明 */}
          <PersonaMethodologySection
            totalPosts={aggregatedQuality?.postsAnalyzed || 0}
            clusterCount={
              selectedBrands.length === 1
                ? (data.brands || []).find((b) => b.brand === selectedBrands[0])?.personas?.length || 0
                : Math.round(
                    (data.brands || []).reduce((sum, b) => sum + (b.personas || []).length, 0) /
                      Math.max((data.brands || []).length, 1)
                  )
            }
            excludedPosts={aggregatedQuality?.postsExcluded || 0}
          />
        </CardContent>
      </Card>

      {/* 詳細パネル */}
      <PersonaDetailPanel
        persona={selectedPersona}
        isOpen={!!selectedPersona}
        onClose={() => setSelectedPersona(null)}
      />
    </>
  );
}
