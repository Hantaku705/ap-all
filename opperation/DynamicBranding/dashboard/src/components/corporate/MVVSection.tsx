"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalityRadar } from "./PersonalityRadar";
import type { MVVResponse, CorporateMVV, PersonalityAxisDetail, PersonalityTraits, PersonalityAlternative } from "@/types/corporate.types";
import { PERSONALITY_TRAIT_LABELS } from "@/types/corporate.types";
import {
  Target,
  Eye,
  Heart,
  Sparkles,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MVVSectionProps {
  corporateId: number;
}

export function MVVSection({ corporateId }: MVVSectionProps) {
  const [data, setData] = useState<CorporateMVV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    async function fetchMVV() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/corporate/${corporateId}/mvv`);
        if (!res.ok) throw new Error("Failed to fetch MVV");
        const json: MVVResponse = await res.json();
        setData(json.mvv);
      } catch (err) {
        console.error("Error fetching MVV:", err);
        setError("MVVデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchMVV();
  }, [corporateId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ブランドアイデンティティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ブランドアイデンティティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || "データがありません"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          ブランドアイデンティティ
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.posts_analyzed.toLocaleString()}件のUGCから抽出
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* パーソナリティ（目立つ表示） */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Brand Personality</p>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {data.personality || "分析中..."}
          </p>
          {data.personality_description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {data.personality_description}
            </p>
          )}
          {data.personality_tone && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/70 rounded-full text-xs text-indigo-600">
              Tone: {data.personality_tone}
            </span>
          )}
          {data.personality_shadow && (
            <div className="mt-3 text-xs text-gray-500 bg-gray-100/50 rounded px-3 py-1 inline-block">
              <span className="text-gray-400">Shadow:</span> {data.personality_shadow}
            </div>
          )}
        </div>

        {/* LLM選定理由 */}
        {data.personality_reasoning && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-1">選定理由（LLM）</p>
            <p className="text-sm text-amber-700">{data.personality_reasoning}</p>
          </div>
        )}

        {/* 代替案（拡張カード表示） */}
        {data.personality_alternatives && data.personality_alternatives.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">代替案</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.personality_alternatives.map((alt, i) => {
                // PersonalityAlternativeオブジェクトか文字列かを判定
                const altObj = typeof alt === 'string'
                  ? { name: alt, description: '', tone: '', shadow: '' }
                  : alt as PersonalityAlternative;
                return (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <p className="font-medium text-gray-800 mb-1">{altObj.name}</p>
                    {altObj.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{altObj.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {altObj.tone && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs">
                          Tone: {altObj.tone}
                        </span>
                      )}
                      {altObj.shadow && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">
                          Shadow: {altObj.shadow}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MVPカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Mission</span>
            </div>
            <p className="text-sm">{data.mission || "—"}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Vision</span>
            </div>
            <p className="text-sm">{data.vision || "—"}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Purpose</span>
            </div>
            <p className="text-sm">{data.purpose || "—"}</p>
          </div>
        </div>

        {/* Values */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-muted-foreground">Values</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.values || []).map((value, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white rounded-full text-sm border shadow-sm"
              >
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* パーソナリティ5軸 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              パーソナリティ5軸
            </h4>
            {data.personality_traits && (
              <PersonalityRadar traits={data.personality_traits} size="md" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              軸別スコア（クリックで根拠表示）
            </h4>
            <div className="space-y-3">
              {data.personality_traits && Object.entries(data.personality_traits).map(([key, value]) => {
                const bipolarLabels = PERSONALITY_TRAIT_LABELS[key as keyof PersonalityTraits];
                const colors: Record<string, string> = {
                  intellect: "bg-blue-500",
                  innovation: "bg-purple-500",
                  warmth: "bg-amber-500",
                  reliability: "bg-green-500",
                  boldness: "bg-red-500",
                };
                const detail = data.personality_traits_detailed?.[key as keyof typeof data.personality_traits_detailed];
                return (
                  <AxisScoreItem
                    key={key}
                    axisKey={key}
                    leftLabel={bipolarLabels.left}
                    rightLabel={bipolarLabels.right}
                    score={value}
                    colorClass={colors[key]}
                    detail={detail}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* エビデンス（折りたたみ） */}
        {data.evidence && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showEvidence ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              抽出根拠を表示
            </button>

            {showEvidence && (
              <div className="mt-4 space-y-4 text-sm">
                {Object.entries(data.evidence).map(([key, items]) => {
                  const labels: Record<string, string> = {
                    mission_evidence: "Mission根拠",
                    vision_evidence: "Vision根拠",
                    values_evidence: "Values根拠",
                    personality_evidence: "Personality根拠",
                  };
                  return (
                    <div key={key}>
                      <p className="font-medium text-muted-foreground mb-1">{labels[key]}</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {(items as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* メタ情報 */}
        <div className="text-xs text-muted-foreground text-right">
          Generated by {data.llm_provider}/{data.llm_model} at{" "}
          {new Date(data.generated_at).toLocaleString("ja-JP")}
          {data.methodology && ` | ${data.methodology}`}
        </div>
      </CardContent>
    </Card>
  );
}

// 軸別スコアアイテム（展開可能、双極軸対応）
function AxisScoreItem({
  axisKey,
  leftLabel,
  rightLabel,
  score,
  colorClass,
  detail,
}: {
  axisKey: string;
  leftLabel: string;
  rightLabel: string;
  score: number;
  colorClass: string;
  detail?: PersonalityAxisDetail;
}) {
  const [expanded, setExpanded] = useState(false);

  // -50〜+50 を 0%〜100% に変換
  const percentage = ((score + 50) / 100) * 100;
  const formattedScore = score > 0 ? `+${score}` : `${score}`;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => detail && setExpanded(!expanded)}
        className={`w-full text-left p-2 ${detail ? "cursor-pointer hover:bg-muted/30" : ""}`}
        disabled={!detail}
      >
        {/* 左右ラベル */}
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>

        {/* 双極プログレスバー */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
          {/* 中央線 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10" />

          {/* マーカー */}
          <div
            className={`absolute top-0 bottom-0 w-3 ${colorClass} rounded-full transition-all duration-500 z-20`}
            style={{ left: `calc(${percentage}% - 6px)` }}
          />
        </div>

        {/* スコア表示 */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {detail && (
              expanded ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />
            )}
            {detail ? "根拠を表示" : ""}
          </span>
          <span className="font-mono font-bold text-sm">
            {formattedScore}
          </span>
        </div>
      </button>

      {expanded && detail && (
        <div className="p-3 border-t bg-muted/20 space-y-3">
          {/* キーワード */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">上位キーワード</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(detail.keywords).slice(0, 5).map(([kw, count]) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 text-xs bg-white rounded border"
                >
                  {kw} <span className="text-muted-foreground">({count})</span>
                </span>
              ))}
            </div>
          </div>

          {/* エビデンス投稿 */}
          {detail.top_evidence && detail.top_evidence.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">根拠投稿</p>
              <div className="space-y-1">
                {detail.top_evidence.slice(0, 2).map((ev, i) => (
                  <p key={i} className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-gray-300">
                    &ldquo;{ev.slice(0, 100)}...&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
