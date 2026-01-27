"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WsData {
  dish_category: { category: string; count: number; percentage: number }[];
  dish_name: { name: string; count: number; brand?: string }[];
  meal_occasion: { occasion: string; count: number; percentage: number }[];
  cooking_for: { target: string; count: number; percentage: number }[];
  motivation: { category: string; count: number; percentage: number }[];
  brand_dish: { brand: string; category: string; count: number }[];
}

const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "コンソメ",
  "香味ペースト",
  "丸鶏がらスープ",
  "アジシオ",
  "ピュアセレクト",
];

const BRAND_COLORS: Record<string, string> = {
  ほんだし: "#e53935",
  クックドゥ: "#43a047",
  味の素: "#1e88e5",
  コンソメ: "#fb8c00",
  香味ペースト: "#8e24aa",
  丸鶏がらスープ: "#00acc1",
  アジシオ: "#fdd835",
  ピュアセレクト: "#6d4c41",
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

// 複数ブランドデータをキーでマージ
function mergeByKey<T extends Record<string, unknown>>(
  arrays: T[][],
  keyField: keyof T
): T[] {
  const map = new Map<unknown, T>();
  for (const arr of arrays) {
    for (const item of arr) {
      const key = item[keyField];
      const existing = map.get(key);
      if (existing) {
        // countを合算
        const newCount = ((existing as { count?: number }).count || 0) + ((item as { count?: number }).count || 0);
        map.set(key, { ...existing, count: newCount } as T);
      } else {
        map.set(key, { ...item });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    ((b as { count?: number }).count || 0) - ((a as { count?: number }).count || 0)
  );
}

export default function WsDetailChart() {
  const [data, setData] = useState<WsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(
    new Set(BRANDS)
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 全ブランド選択 or フィルタなし → all.json
      if (selectedBrands.size === 0 || selectedBrands.size === BRANDS.length) {
        const res = await fetch("/data/sns/ws-detail/all.json");
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const d = await res.json();
        setData(d);
      } else if (selectedBrands.size === 1) {
        // 単一ブランド → 直接ファイル取得
        const brand = Array.from(selectedBrands)[0];
        const res = await fetch(`/data/sns/ws-detail/${encodeURIComponent(brand)}.json`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const d = await res.json();
        setData(d);
      } else {
        // 複数ブランド → 各ファイルを取得してマージ
        const brandArray = Array.from(selectedBrands);
        const results = await Promise.all(
          brandArray.map(async (brand) => {
            const res = await fetch(`/data/sns/ws-detail/${encodeURIComponent(brand)}.json`);
            if (!res.ok) return null;
            return res.json();
          })
        );
        const validResults = results.filter((r): r is WsData => r !== null);
        if (validResults.length === 0) throw new Error("データの取得に失敗しました");
        // データをマージ
        const merged: WsData = {
          dish_category: mergeByKey(validResults.map(r => r.dish_category), "category"),
          dish_name: mergeByKey(validResults.map(r => r.dish_name), "name").slice(0, 20),
          meal_occasion: mergeByKey(validResults.map(r => r.meal_occasion), "occasion"),
          cooking_for: mergeByKey(validResults.map(r => r.cooking_for), "target"),
          motivation: mergeByKey(validResults.map(r => r.motivation), "category"),
          brand_dish: validResults.flatMap(r => r.brand_dish),
        };
        setData(merged);
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message || "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [selectedBrands]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedBrands(new Set(BRANDS));
  };

  const clearAll = () => {
    setSelectedBrands(new Set());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">{error || "データの取得に失敗しました"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">W&apos;s詳細分析（料理・シーン・動機）</h2>

      {/* ブランドフィルタ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">ブランドフィルタ:</span>
          <button
            onClick={selectAll}
            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            全選択
          </button>
          <button
            onClick={clearAll}
            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            全解除
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedBrands.has(brand)
                  ? "text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                selectedBrands.has(brand)
                  ? { backgroundColor: BRAND_COLORS[brand] }
                  : undefined
              }
            >
              {brand}
            </button>
          ))}
        </div>
        {selectedBrands.size === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            ブランドを選択してください
          </p>
        )}
      </div>

      <Tabs defaultValue="dish" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="dish">料理カテゴリ</TabsTrigger>
          <TabsTrigger value="menu">メニューランキング</TabsTrigger>
          <TabsTrigger value="occasion">食事シーン</TabsTrigger>
          <TabsTrigger value="target">誰のために</TabsTrigger>
          <TabsTrigger value="motivation">動機</TabsTrigger>
        </TabsList>

        <TabsContent value="dish">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 料理カテゴリ棒グラフ */}
            <div>
              <h3 className="font-semibold mb-2">料理カテゴリ別投稿数</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.dish_category}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" width={70} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                  <Bar dataKey="count" fill="#3b82f6">
                    {data.dish_category.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 料理カテゴリ円グラフ */}
            <div>
              <h3 className="font-semibold mb-2">料理カテゴリ構成比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.dish_category}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                  >
                    {data.dish_category.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="menu">
          <div>
            <h3 className="font-semibold mb-2">メニューランキング TOP20</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={data.dish_name}
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as {
                        name: string;
                        count: number;
                        brand?: string;
                      };
                      return (
                        <div className="bg-white border p-2 shadow-lg text-sm">
                          <p className="font-bold">{d.name}</p>
                          <p>投稿数: {(d.count ?? 0).toLocaleString()} 件</p>
                          {d.brand && <p className="text-gray-500">関連: {d.brand}</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10b981">
                  {data.dish_name.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="occasion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 食事シーン棒グラフ */}
            <div>
              <h3 className="font-semibold mb-2">食事シーン別投稿数</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.meal_occasion}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="occasion" width={110} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                  <Bar dataKey="count" fill="#f59e0b">
                    {data.meal_occasion.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 食事シーン円グラフ */}
            <div>
              <h3 className="font-semibold mb-2">食事シーン構成比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.meal_occasion}
                    dataKey="count"
                    nameKey="occasion"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                  >
                    {data.meal_occasion.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="target">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 調理対象棒グラフ */}
            <div>
              <h3 className="font-semibold mb-2">誰のために作ったか</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data.cooking_for}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="target" width={70} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6">
                    {data.cooking_for.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 調理対象円グラフ */}
            <div>
              <h3 className="font-semibold mb-2">調理対象構成比</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.cooking_for}
                    dataKey="count"
                    nameKey="target"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                  >
                    {data.cooking_for.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="motivation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 動機棒グラフ */}
            <div>
              <h3 className="font-semibold mb-2">調理動機別投稿数</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.motivation}
                  layout="vertical"
                  margin={{ left: 130 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" width={120} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                  <Bar dataKey="count" fill="#ec4899">
                    {data.motivation.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 動機円グラフ */}
            <div>
              <h3 className="font-semibold mb-2">調理動機構成比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.motivation}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                  >
                    {data.motivation.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} 件`,
                      "投稿数",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
