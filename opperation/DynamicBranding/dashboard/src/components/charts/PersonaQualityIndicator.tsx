"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { ClusteringQuality } from "@/types/persona.types";

interface PersonaQualityIndicatorProps {
  quality: ClusteringQuality;
  compact?: boolean;
}

/**
 * Get confidence level info based on score
 */
function getConfidenceLevel(confidence: number): {
  level: "high" | "medium" | "low" | "very_low";
  label: string;
  color: string;
  bgColor: string;
  message: string;
  Icon: typeof CheckCircle;
} {
  if (confidence >= 80) {
    return {
      level: "high",
      label: "高信頼",
      color: "#22c55e",
      bgColor: "bg-green-50",
      message: "十分なデータ量と品質があります",
      Icon: CheckCircle,
    };
  } else if (confidence >= 60) {
    return {
      level: "medium",
      label: "中程度",
      color: "#eab308",
      bgColor: "bg-yellow-50",
      message: "一部のデータが不明ですが、参考になります",
      Icon: AlertCircle,
    };
  } else if (confidence >= 40) {
    return {
      level: "low",
      label: "低信頼",
      color: "#f97316",
      bgColor: "bg-orange-50",
      message: "データ不足のため参考程度としてご覧ください",
      Icon: AlertTriangle,
    };
  } else {
    return {
      level: "very_low",
      label: "要注意",
      color: "#ef4444",
      bgColor: "bg-red-50",
      message: "データが不十分です",
      Icon: AlertTriangle,
    };
  }
}

/**
 * Get silhouette score interpretation
 */
function getSilhouetteInterpretation(score: number): string {
  if (score >= 0.7) return "明確に分離";
  if (score >= 0.5) return "適度な分離";
  if (score >= 0.25) return "重複あり";
  return "分離不明確";
}

/**
 * Unknown rates breakdown labels
 */
const UNKNOWN_RATE_LABELS: Record<string, string> = {
  life_stage: "ライフステージ",
  cooking_skill: "料理スキル",
  motivation_category: "動機",
  meal_occasion: "調理シーン",
  cooking_for: "調理対象",
  emotion: "感情",
};

export function PersonaQualityIndicator({
  quality,
  compact = false,
}: PersonaQualityIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { label, color, bgColor, message, Icon } = getConfidenceLevel(
    quality.overallConfidence
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: color + "20", color }}
        >
          <Icon className="w-3 h-3" />
          <span>{label}</span>
          <span>{quality.overallConfidence}%</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {quality.postsClustered.toLocaleString()}件分析
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${bgColor} p-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color }} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color }}>
                {label}
              </span>
              <span className="text-lg font-bold" style={{ color }}>
                {quality.overallConfidence}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/50 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${quality.overallConfidence}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">{quality.postsClustered.toLocaleString()}</span>
          <span className="ml-1">件クラスタリング</span>
        </div>
        <div>
          <span className="font-medium">{quality.postsExcluded.toLocaleString()}</span>
          <span className="ml-1">件除外</span>
        </div>
        {quality.clusteringMethod === "kmeans" && (
          <div className="flex items-center gap-1">
            <span>シルエット:</span>
            <span className="font-medium">
              {quality.silhouetteScore.toFixed(2)}
            </span>
            <span className="text-[10px]">
              ({getSilhouetteInterpretation(quality.silhouetteScore)})
            </span>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-3">
          {/* Clustering method */}
          <div className="flex items-center gap-2 text-xs">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              クラスタリング手法:{" "}
              <span className="font-medium">
                {quality.clusteringMethod === "kmeans" ? "k-means" : "レガシー"}
              </span>
            </span>
          </div>

          {/* Unknown rates breakdown */}
          <div>
            <p className="text-xs font-medium mb-2">属性別unknown率</p>
            <div className="space-y-1.5">
              {Object.entries(UNKNOWN_RATE_LABELS).map(([key, label]) => {
                const rate = quality.unknownRates[key as keyof typeof quality.unknownRates];
                if (typeof rate !== "number") return null;

                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 truncate">
                      {label}
                    </span>
                    <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data completeness */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">データ完全性</span>
            <span className="font-medium">{quality.dataCompleteness}%</span>
          </div>

          {/* Cluster sizes */}
          {quality.clusterSizes && quality.clusterSizes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                クラスターサイズ (実測値)
              </p>
              <div className="flex gap-1 flex-wrap">
                {quality.clusterSizes.map((size, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-white rounded"
                  >
                    #{idx + 1}: {size.toLocaleString()}件
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
