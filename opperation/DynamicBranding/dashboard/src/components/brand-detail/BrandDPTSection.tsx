"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  Clock,
  Users,
  MapPin,
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  List,
  Table,
} from "lucide-react";

interface UseCase {
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
    topKeywords: string[];
    samplePosts: string[];
  };
}

interface DPTData {
  brandName: string;
  useCases: UseCase[];
  generatedAt: string;
  postCount: number;
}

interface BrandDPTSectionProps {
  brandName: string;
}

export function BrandDPTSection({ brandName }: BrandDPTSectionProps) {
  const [data, setData] = useState<DPTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUseCase, setExpandedUseCase] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"accordion" | "table">("accordion");

  useEffect(() => {
    fetchDPT();
  }, [brandName]);

  async function fetchDPT(forceRefresh = false) {
    try {
      if (forceRefresh) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = `/api/brands/${encodeURIComponent(brandName)}/dpt${forceRefresh ? "?refresh=true" : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const json: DPTData = await res.json();
      setData(json);

      // 最初のUse Caseを展開
      if (json.useCases?.length > 0 && !expandedUseCase) {
        setExpandedUseCase(json.useCases[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  // Loading状態
  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">
          DPT（Dynamic Positioning Table）
        </h2>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>ポジショニング分析中...</p>
              <p className="text-xs">初回は数秒かかる場合があります</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Error状態
  if (error) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">
          DPT（Dynamic Positioning Table）
        </h2>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchDPT()}
                className="px-4 py-2 text-sm border rounded hover:bg-muted"
              >
                再試行
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // データなし
  if (!data || !data.useCases || data.useCases.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">
          DPT（Dynamic Positioning Table）
        </h2>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare className="h-12 w-12" />
              <p>分析対象の投稿が不足しています</p>
              <p className="text-xs">CEPが付与された投稿が必要です</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const generatedDate = new Date(data.generatedAt).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            DPT（Dynamic Positioning Table）
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {(data.postCount ?? 0).toLocaleString()}件の投稿から
            {data.useCases?.length ?? 0}件のUse Caseを抽出
            <span className="ml-2 text-xs opacity-70">
              （{generatedDate}更新）
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode("accordion")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors ${
                viewMode === "accordion"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title="アコーディオン表示"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs border-l transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title="表形式"
            >
              <Table className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Regenerate Button */}
          <button
            onClick={() => fetchDPT(true)}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
            />
            再生成
          </button>
        </div>
      </div>

      {viewMode === "accordion" ? (
        <div className="space-y-3">
        {data.useCases.map((useCase) => (
          <UseCaseCard
            key={useCase.id}
            useCase={useCase}
            isExpanded={expandedUseCase === useCase.id}
            onToggle={() =>
              setExpandedUseCase(
                expandedUseCase === useCase.id ? null : useCase.id
              )
            }
          />
        ))}
        </div>
      ) : (
        <DPTTable useCases={data.useCases} />
      )}
    </section>
  );
}

// Use Caseカードコンポーネント
function UseCaseCard({
  useCase,
  isExpanded,
  onToggle,
}: {
  useCase: UseCase;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={isExpanded ? "border-primary/50 shadow-sm" : ""}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/30 transition-colors py-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {useCase.name}
            <span className="text-xs text-muted-foreground font-normal px-2 py-0.5 bg-muted rounded-full">
              {useCase.evidence?.postCount ?? 0}件
            </span>
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          {/* Context Section */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Why（理由）
                </p>
                <p className="text-sm mt-0.5">{useCase.context.why}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  When（いつ）
                </p>
                <p className="text-sm mt-0.5">{useCase.context.when}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Where（どこで）
                </p>
                <p className="text-sm mt-0.5">{useCase.context.where}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  With Whom（誰と）
                </p>
                <p className="text-sm mt-0.5">{useCase.context.withWhom}</p>
              </div>
            </div>
          </div>

          {/* Positioning Table */}
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-muted/40">
                  <td className="px-4 py-2.5 font-medium w-24 border-r">
                    競合
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {useCase.positioning.competitors.map((comp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2.5 font-medium bg-blue-50 text-blue-700 border-r">
                    POP
                  </td>
                  <td className="px-4 py-2.5">
                    <ul className="space-y-1">
                      {useCase.positioning.pop.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">・</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2.5 font-medium bg-green-50 text-green-700 border-r">
                    POD
                  </td>
                  <td className="px-4 py-2.5">
                    <ul className="space-y-1">
                      {useCase.positioning.pod.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-green-700"
                        >
                          <span className="text-green-400 mt-0.5">・</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Evidence */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">根拠:</span>{" "}
              {useCase.evidence?.postCount ?? 0}件の投稿
              {(useCase.evidence?.topKeywords?.length ?? 0) > 0 && (
                <>
                  {" "}
                  / キーワード:{" "}
                  {useCase.evidence?.topKeywords?.slice(0, 5).join(", ")}
                </>
              )}
            </p>
            {(useCase.evidence?.samplePosts?.length ?? 0) > 0 && (
              <div className="space-y-1">
                {useCase.evidence?.samplePosts?.slice(0, 2).map((post, i) => (
                  <p
                    key={i}
                    className="text-xs text-muted-foreground italic truncate"
                  >
                    「{post.length > 80 ? post.slice(0, 80) + "..." : post}」
                  </p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// DPT表形式コンポーネント
function DPTTable({ useCases }: { useCases: UseCase[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">Use Case</th>
                <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-16">件数</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">Why（理由）</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">When（いつ）</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">Where（どこ）</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">With Whom</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">競合</th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap min-w-[180px]">
                  <span className="text-blue-600">POP</span>
                </th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap min-w-[180px]">
                  <span className="text-green-600">POD</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {useCases.map((useCase, idx) => (
                <tr
                  key={useCase.id}
                  className={`border-b last:border-b-0 ${idx % 2 === 0 ? "" : "bg-muted/20"} hover:bg-muted/30`}
                >
                  <td className="px-3 py-3 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="whitespace-nowrap">{useCase.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {useCase.evidence?.postCount ?? 0}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground max-w-[150px]">
                    <span className="line-clamp-2">{useCase.context.why}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground max-w-[120px]">
                    <span className="line-clamp-2">{useCase.context.when}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground max-w-[100px]">
                    <span className="line-clamp-2">{useCase.context.where}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground max-w-[100px]">
                    <span className="line-clamp-2">{useCase.context.withWhom}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(useCase.positioning?.competitors ?? []).slice(0, 2).map((comp, i) => (
                        <span
                          key={i}
                          className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap"
                        >
                          {comp}
                        </span>
                      ))}
                      {(useCase.positioning?.competitors?.length ?? 0) > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{(useCase.positioning?.competitors?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <ul className="space-y-0.5">
                      {(useCase.positioning?.pop ?? []).slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs text-blue-600 line-clamp-1">
                          • {item}
                        </li>
                      ))}
                      {(useCase.positioning?.pop?.length ?? 0) > 2 && (
                        <li className="text-xs text-muted-foreground">
                          +{(useCase.positioning?.pop?.length ?? 0) - 2}件
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-3 py-3">
                    <ul className="space-y-0.5">
                      {(useCase.positioning?.pod ?? []).slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs text-green-600 line-clamp-1">
                          • {item}
                        </li>
                      ))}
                      {(useCase.positioning?.pod?.length ?? 0) > 2 && (
                        <li className="text-xs text-muted-foreground">
                          +{(useCase.positioning?.pod?.length ?? 0) - 2}件
                        </li>
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
