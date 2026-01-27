"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";

interface StrategyData {
  strengths: string[];
  risks: string[];
  opportunities: string[];
}

interface BrandStrategySectionProps {
  brandName: string;
}

export function BrandStrategySection({ brandName }: BrandStrategySectionProps) {
  const [data, setData] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // まずサマリーAPIからデータを取得してローカルで戦略を生成
        const summaryRes = await fetch(
          `/api/brands/${encodeURIComponent(brandName)}`
        );
        if (!summaryRes.ok) throw new Error("データの取得に失敗しました");
        const summary = await summaryRes.json();

        // ラベル分布を取得
        const labelsRes = await fetch(
          `/api/sns/labels?brand=${encodeURIComponent(brandName)}`
        );
        const labels = labelsRes.ok ? await labelsRes.json() : null;

        // 関連性データを取得
        const relationsRes = await fetch(
          `/api/brands/${encodeURIComponent(brandName)}/relations`
        );
        const relations = relationsRes.ok ? await relationsRes.json() : null;

        // データから戦略示唆を生成
        const strategy = generateStrategy(summary, labels, relations);
        setData(strategy);
      } catch (err) {
        console.error("Error generating strategy:", err);
        setError("戦略示唆の生成に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">戦略示唆</h2>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              データを分析中...
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">戦略示唆</h2>
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-600">{error || "データが見つかりません"}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">戦略示唆</h2>
      <p className="text-muted-foreground mb-4">
        データ分析に基づく{brandName}の戦略的示唆
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 強み */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              強み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.strengths.map((item, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="text-green-600 font-bold">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* リスク */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              リスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.risks.map((item, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="text-red-600 font-bold">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 機会 */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-5 w-5" />
              機会
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.opportunities.map((item, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// データから戦略示唆を生成するヘルパー関数
function generateStrategy(
  summary: {
    name: string;
    mentionShare: number;
    negativeRate: number;
    topCep?: { name: string; score: number } | null;
    primaryQuadrant: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relations: any
): StrategyData {
  const strengths: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  // 言及シェアに基づく強み/機会
  if (summary.mentionShare > 20) {
    strengths.push(`高い言及シェア（${(summary.mentionShare ?? 0).toFixed(1)}%）を維持`);
  } else if (summary.mentionShare > 10) {
    opportunities.push("言及シェア拡大の余地あり");
  } else {
    opportunities.push("ブランド認知向上施策の検討が必要");
  }

  // ネガティブ率に基づくリスク
  if (summary.negativeRate > 10) {
    risks.push(`高いネガティブ率（${(summary.negativeRate ?? 0).toFixed(1)}%）への対応が急務`);
  } else if (summary.negativeRate > 5) {
    risks.push("ネガティブ投稿の継続的なモニタリングが必要");
  } else {
    strengths.push(`低いネガティブ率（${(summary.negativeRate ?? 0).toFixed(1)}%）を維持`);
  }

  // CEPに基づく示唆
  if (summary.topCep) {
    if (summary.primaryQuadrant === "コア強化") {
      strengths.push(`「${summary.topCep.name}」でのCEP適合が高い`);
    } else if (summary.primaryQuadrant === "機会獲得") {
      opportunities.push(`「${summary.topCep.name}」への訴求強化で成長余地`);
    } else if (summary.primaryQuadrant === "育成検討") {
      opportunities.push("CEPポジションの改善・明確化が必要");
    }
  }

  // ラベル分布に基づく示唆
  if (labels?.intent) {
    const topIntent = labels.intent[0];
    if (topIntent?.name === "usage_report") {
      strengths.push("実際の利用報告が多く、実用性が評価されている");
    } else if (topIntent?.name === "recipe_share") {
      strengths.push("レシピ共有が活発で、料理シーンでの活用が定着");
    } else if (topIntent?.name === "complaint") {
      risks.push("不満・クレームが多く、品質/UX改善が必要");
    }
  }

  if (labels?.emotion) {
    const emotions = labels.emotion.slice(0, 3);
    const hasExcitement = emotions.find((e: { name: string }) => e.name === "excitement");
    const hasFrustration = emotions.find((e: { name: string }) => e.name === "frustration");

    if (hasExcitement) {
      strengths.push("ワクワク感を伴う投稿が多い");
    }
    if (hasFrustration) {
      risks.push("フラストレーションを感じるユーザーへの対応");
    }
  }

  // 関連性に基づく示唆
  if (relations?.cooccurrences?.length > 0) {
    const topCooc = relations.cooccurrences[0];
    opportunities.push(`${topCooc.brand}との連携施策で相乗効果の可能性`);
  }

  if (relations?.keywords?.length > 0) {
    const risingKeywords = relations.keywords.filter(
      (k: { keyword_type: string }) => k.keyword_type === "rising"
    );
    if (risingKeywords.length > 0) {
      opportunities.push(`急上昇キーワード「${risingKeywords[0].keyword}」への対応`);
    }
  }

  // 最低3つずつ確保
  while (strengths.length < 3) {
    strengths.push("継続的なブランド価値の維持が重要");
  }
  while (risks.length < 3) {
    risks.push("競合動向のモニタリングが必要");
  }
  while (opportunities.length < 3) {
    opportunities.push("新規ターゲット層への訴求拡大");
  }

  return {
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
  };
}
