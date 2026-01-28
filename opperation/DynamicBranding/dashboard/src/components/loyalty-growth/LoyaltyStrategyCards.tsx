"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Target, Clock, Users, BarChart3 } from "lucide-react";
import type { LoyaltyStrategyRecommendation } from "@/types/corporate.types";
import {
  LOYALTY_SEGMENT_LABELS,
  IMPLEMENTATION_EFFORT_LABELS,
  IMPLEMENTATION_EFFORT_COLORS,
} from "@/types/corporate.types";

interface LoyaltyStrategyCardsProps {
  recommendations: LoyaltyStrategyRecommendation[];
}

export function LoyaltyStrategyCards({
  recommendations,
}: LoyaltyStrategyCardsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const priorityColors = ["#3b82f6", "#6b7280", "#9ca3af"];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          戦略提案
        </h3>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedIndex === index;
          const priorityColor = priorityColors[index] || priorityColors[2];

          return (
            <div
              key={rec.segment}
              className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                isExpanded ? "ring-2 ring-blue-200" : ""
              }`}
            >
              {/* ヘッダー */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: priorityColor }}
                  >
                    P{index + 1}
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <span className="text-xs text-gray-500">
                      {LOYALTY_SEGMENT_LABELS[rec.segment]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${IMPLEMENTATION_EFFORT_COLORS[rec.implementationEffort]}20`,
                      color: IMPLEMENTATION_EFFORT_COLORS[rec.implementationEffort],
                    }}
                  >
                    工数: {IMPLEMENTATION_EFFORT_LABELS[rec.implementationEffort]}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* 展開コンテンツ */}
              {isExpanded && (
                <div className="border-t p-4 bg-gray-50">
                  {/* 説明 */}
                  <p className="text-sm text-gray-700 mb-4">{rec.description}</p>

                  {/* メタ情報 */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">期待効果</div>
                        <div className="text-sm font-medium text-gray-800">
                          {rec.expectedImpact}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">期間</div>
                        <div className="text-sm font-medium text-gray-800">
                          {rec.timeToResult}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs text-gray-500">必要リソース</div>
                        <div className="text-sm font-medium text-gray-800">
                          {rec.requiredResources.length}チーム
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* リソース */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2">
                      必要リソース
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.requiredResources.map((resource) => (
                        <span
                          key={resource}
                          className="text-xs px-2 py-1 bg-white rounded border text-gray-700"
                        >
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KPI */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      KPI目標
                    </h5>
                    <div className="space-y-2">
                      {rec.kpis.map((kpi) => {
                        const progress =
                          ((kpi.currentValue - 0) /
                            (kpi.targetValue - 0)) *
                          100;

                        return (
                          <div key={kpi.name} className="bg-white rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-700">
                                {kpi.name}
                              </span>
                              <span className="text-xs font-medium">
                                {kpi.currentValue}
                                {kpi.unit} → {kpi.targetValue}
                                {kpi.unit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, progress)}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
