"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, GitBranch } from "lucide-react";
import { BRAND_COLORS } from "@/lib/utils/colors";
import {
  Sankey,
  Tooltip,
  Rectangle,
  Layer,
  ResponsiveContainer,
} from "recharts";

interface SankeyNode {
  name: string;
  type: "brand" | "keyword" | "cep";
  color?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// ノードの色を取得
function getNodeColor(node: SankeyNode): string {
  if (node.type === "brand") {
    return BRAND_COLORS[node.name] || node.color || "#666666";
  }
  if (node.type === "keyword") {
    return "#94a3b8"; // slate-400
  }
  if (node.type === "cep") {
    return "#22c55e"; // green-500
  }
  return "#666666";
}

// カスタムノードレンダラー
function CustomNode({
  x,
  y,
  width,
  height,
  index,
  payload,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: SankeyNode;
}) {
  const color = getNodeColor(payload);
  const isLeft = payload.type === "brand";
  const isRight = payload.type === "cep";

  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.9}
      />
      <text
        x={isLeft ? x - 5 : isRight ? x + width + 5 : x + width / 2}
        y={y + height / 2}
        textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
        dominantBaseline="central"
        fontSize={11}
        fill="#333"
      >
        {payload.name.length > 12 ? payload.name.slice(0, 12) + "..." : payload.name}
      </text>
    </Layer>
  );
}

// カスタムツールチップ
function CustomTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0] as { payload?: { source?: SankeyNode; target?: SankeyNode; value?: number } };
  if (!data.payload) return null;

  const { source, target, value } = data.payload;

  return (
    <div className="bg-white p-3 rounded shadow-lg border text-sm">
      <p className="font-medium">
        {source?.name} → {target?.name}
      </p>
      <p className="text-muted-foreground">
        スコア: {value}
      </p>
    </div>
  );
}

export function BrandKeywordCEPSankey() {
  const [data, setData] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [limit, setLimit] = useState<number>(8);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedBrand !== "all") params.set("brand", selectedBrand);
        params.set("limit", String(limit));

        const res = await fetch(`/api/keywords/sankey?${params.toString()}`);
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching sankey data:", err);
        setError("サンキーデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedBrand, limit]);

  // ブランド一覧を抽出
  const brands = useMemo(() => {
    if (!data) return [];
    return data.nodes
      .filter((n) => n.type === "brand")
      .map((n) => n.name);
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            ブランド → キーワード → CEP フロー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            ブランド → キーワード → CEP フロー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              再読み込み
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // データがない場合
  if (!data || data.nodes.length === 0 || data.links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            ブランド → キーワード → CEP フロー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
            <GitBranch className="h-16 w-16 mb-4 opacity-30" />
            <p>サンキーダイアグラムを表示するにはデータが必要です</p>
            <p className="text-sm mt-2">
              関連キーワードデータを取得してください
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              ブランド → キーワード → CEP フロー
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ブランドの関連キーワードがどのCEP（生活文脈）に繋がるかを可視化
            </p>
          </div>
          <div className="flex gap-2">
            {/* キーワード数 */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value={5}>Top 5 KW</option>
              <option value={8}>Top 8 KW</option>
              <option value={10}>Top 10 KW</option>
              <option value={15}>Top 15 KW</option>
            </select>
            {/* ブランドフィルター */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">全ブランド</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={{
                nodes: data.nodes.map((n) => ({ ...n })),
                links: data.links.map((l) => ({ ...l })),
              }}
              node={CustomNode as never}
              link={{ stroke: "#94a3b8", strokeOpacity: 0.3 }}
              nodePadding={30}
              nodeWidth={15}
              margin={{ top: 20, right: 150, bottom: 20, left: 100 }}
            >
              <Tooltip content={<CustomTooltip />} />
            </Sankey>
          </ResponsiveContainer>
        </div>

        {/* 凡例 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>ブランド</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-400" />
              <span>関連キーワード</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>CEP（生活文脈）</span>
            </div>
          </div>
        </div>

        {/* 統計 */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold text-primary">
              {data.nodes.filter((n) => n.type === "brand").length}
            </p>
            <p className="text-muted-foreground">ブランド</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-500">
              {data.nodes.filter((n) => n.type === "keyword").length}
            </p>
            <p className="text-muted-foreground">キーワード</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {data.nodes.filter((n) => n.type === "cep").length}
            </p>
            <p className="text-muted-foreground">CEP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
