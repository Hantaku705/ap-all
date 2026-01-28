"use client";

import { Zap, MessageSquare, Calendar, Heart } from "lucide-react";
import type { LoyaltyConversionFunnel, ConversionTrigger } from "@/types/corporate.types";

interface LoyaltyTriggerAnalysisProps {
  funnels: LoyaltyConversionFunnel[];
}

const TRIGGER_TYPE_CONFIG = {
  topic: { icon: MessageSquare, label: "トピック", color: "#3b82f6" },
  event: { icon: Calendar, label: "イベント", color: "#8b5cf6" },
  content: { icon: Heart, label: "コンテンツ", color: "#ec4899" },
  engagement: { icon: Zap, label: "エンゲージメント", color: "#f59e0b" },
};

export function LoyaltyTriggerAnalysis({ funnels }: LoyaltyTriggerAnalysisProps) {
  // 中→高の転換トリガーを取得
  const mediumToHighFunnel = funnels.find(
    (f) => f.fromLevel === "medium" && f.toLevel === "high"
  );

  // 低→中の転換トリガーを取得
  const lowToMediumFunnel = funnels.find(
    (f) => f.fromLevel === "low" && f.toLevel === "medium"
  );

  const renderTriggerBar = (trigger: ConversionTrigger) => {
    const config = TRIGGER_TYPE_CONFIG[trigger.type];
    const Icon = config.icon;

    return (
      <div key={trigger.name} className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: config.color }} />
            <span className="text-sm font-medium text-gray-700">
              {trigger.description.slice(0, 30)}...
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: config.color }}>
            {trigger.impactScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${trigger.impactScore}%`,
              backgroundColor: config.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{config.label}</span>
          <span className="text-xs text-gray-500">
            観測: {trigger.frequency}回
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          転換トリガー分析
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* 中→高 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h4 className="font-semibold text-gray-800">
              中 → 高 転換トリガー
            </h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            高ロイヤリティへの転換に最も影響力のある要因
          </p>
          {mediumToHighFunnel?.topTriggers.map(renderTriggerBar)}
        </div>

        {/* 低→中 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h4 className="font-semibold text-gray-800">
              低 → 中 転換トリガー
            </h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            ネガティブユーザーの態度改善に効果的な要因
          </p>
          {lowToMediumFunnel?.topTriggers.map(renderTriggerBar)}
        </div>
      </div>

      {/* インサイトボックス */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Key Insight
        </h4>
        <p className="text-sm text-blue-700">
          <strong>R&D・イノベーションコンテンツ</strong>への反応が、中→高転換の最も強力なトリガー（impact: 85%）です。
          一方、低→中転換では<strong>直接的なエンゲージメント</strong>（クレーム対応等）が最も効果的（impact: 90%）です。
        </p>
      </div>
    </div>
  );
}
