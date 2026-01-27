"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Target, Users, Zap } from "lucide-react";

interface GapData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  brand_count: number;
  gap_score: number;
  gap_type: "white_space" | "underserved" | "competitive";
  opportunity_brands: string[];
  reason: string;
}

interface ApiResponse {
  data: GapData[];
  summary: {
    white_space_count: number;
    underserved_count: number;
    competitive_count: number;
  };
}

const GAP_TYPE_CONFIG = {
  white_space: {
    label: "空白領域",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Target,
    description: "未開拓で大きな機会",
  },
  underserved: {
    label: "参入余地あり",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Zap,
    description: "競争は弱め",
  },
  competitive: {
    label: "競争激化",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Users,
    description: "差別化が必要",
  },
};

export function CEPGapFinder() {
  const [data, setData] = useState<GapData[]>([]);
  const [summary, setSummary] = useState<ApiResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "white_space" | "underserved">("all");

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const res = await fetch("/api/ceps/gaps");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json: ApiResponse = await res.json();
        setData(json.data);
        setSummary(json.summary);
      } catch (err) {
        console.error("Error fetching gaps:", err);
        setError("空白CEPデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>空白CEP発見</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
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
          <CardTitle>空白CEP発見</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = filter === "all"
    ? data
    : data.filter((d) => d.gap_type === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>空白CEP発見</CardTitle>
        <p className="text-sm text-muted-foreground">
          どのブランドも弱い領域を特定し、参入機会を発見
        </p>
        {summary && (
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              すべて ({data.length})
            </button>
            <button
              onClick={() => setFilter("white_space")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === "white_space" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              空白領域 ({summary.white_space_count})
            </button>
            <button
              onClick={() => setFilter("underserved")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === "underserved" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              参入余地 ({summary.underserved_count})
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredData.map((item, index) => {
            const config = GAP_TYPE_CONFIG[item.gap_type];
            const Icon = config.icon;
            return (
              <div
                key={item.cep_id}
                className={`p-4 rounded-lg border ${config.color} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.cep_name}</h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-white/50">
                          <Icon className="inline h-3 w-3 mr-1" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mt-1">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span>言及数: {item.total_mentions}</span>
                        <span>参入ブランド: {item.brand_count}</span>
                        <span>空白度: {item.gap_score}点</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{item.gap_score}</div>
                    <div className="text-xs opacity-70">空白度</div>
                  </div>
                </div>
                {item.opportunity_brands.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <p className="text-xs opacity-70 mb-1">参入機会のあるブランド:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.opportunity_brands.map((brand) => (
                        <span
                          key={brand}
                          className="px-2 py-0.5 text-xs rounded bg-white/50"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
