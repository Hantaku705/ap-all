"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { StrategyRecommendation } from "@/types/corporate.types";

interface StrategyRecommendationsProps {
  recommendations: StrategyRecommendation[];
  strengths: string[];
}

const PRIORITY_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900", badge: "bg-blue-600" },
  2: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-900", badge: "bg-gray-600" },
  3: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-500" },
};

export function StrategyRecommendations({ recommendations, strengths }: StrategyRecommendationsProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          戦略提案
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          優先度順に整理された具体的なアクション提案
        </p>
      </CardHeader>
      <CardContent>
        {/* 強み */}
        {strengths.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-medium text-green-700 mb-2">現状の強み</p>
            <ul className="space-y-1">
              {strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 提案リスト */}
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">戦略提案はありません</p>
        ) : (
          <div className="space-y-3">
            {recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec, idx) => {
                const colors = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS[3];
                const isExpanded = expandedIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all`}
                  >
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      className={`w-full p-4 text-left flex items-start gap-3 ${colors.text}`}
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.badge} text-white flex items-center justify-center text-sm font-bold`}
                      >
                        P{rec.priority}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base">{rec.title}</h4>
                        {!isExpanded && (
                          <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                            {rec.description}
                          </p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-11 space-y-3">
                          <p className="text-sm">{rec.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-2 bg-white rounded border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                期待効果
                              </p>
                              <p className="text-sm">{rec.expectedImpact}</p>
                            </div>
                            <div className="p-2 bg-white rounded border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                根拠データ
                              </p>
                              <p className="text-sm">{rec.relatedData}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
