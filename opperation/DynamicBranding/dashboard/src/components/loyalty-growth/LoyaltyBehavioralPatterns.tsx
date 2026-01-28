"use client";

import { Users, Heart, Repeat, MessageCircle, FileText } from "lucide-react";
import type { LoyaltyBehavioralPattern } from "@/types/corporate.types";

interface LoyaltyBehavioralPatternsProps {
  patterns: LoyaltyBehavioralPattern[];
}

const LEVEL_CONFIG = {
  high: { label: "高ロイヤリティ", color: "#22c55e", bgColor: "bg-green-50" },
  medium: { label: "中ロイヤリティ", color: "#f59e0b", bgColor: "bg-amber-50" },
  low: { label: "低ロイヤリティ", color: "#ef4444", bgColor: "bg-red-50" },
};

export function LoyaltyBehavioralPatterns({
  patterns,
}: LoyaltyBehavioralPatternsProps) {
  // high, medium, low の順に並べ替え
  const sortedPatterns = ["high", "medium", "low"]
    .map((level) => patterns.find((p) => p.level === level))
    .filter(Boolean) as LoyaltyBehavioralPattern[];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          行動パターン比較
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sortedPatterns.map((pattern) => {
          const config = LEVEL_CONFIG[pattern.level];

          return (
            <div
              key={pattern.level}
              className={`${config.bgColor} rounded-lg p-4 border`}
              style={{ borderColor: config.color }}
            >
              {/* ヘッダー */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <h4 className="font-semibold" style={{ color: config.color }}>
                  {config.label}
                </h4>
              </div>

              {/* エンゲージメント指標 */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    投稿/月
                  </span>
                  <span className="font-bold text-gray-800">
                    {pattern.engagementMetrics.avgPostFrequency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    平均いいね
                  </span>
                  <span className="font-bold text-gray-800">
                    {pattern.engagementMetrics.avgLikes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    平均RT
                  </span>
                  <span className="font-bold text-gray-800">
                    {pattern.engagementMetrics.avgRetweets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    平均リプライ
                  </span>
                  <span className="font-bold text-gray-800">
                    {pattern.engagementMetrics.avgReplies}
                  </span>
                </div>
              </div>

              {/* トピック嗜好 */}
              <div className="border-t pt-3">
                <h5 className="text-xs font-semibold text-gray-600 mb-2">
                  関心トピック
                </h5>
                <div className="space-y-2">
                  {pattern.topicPreferences.slice(0, 3).map((topic) => (
                    <div key={topic.topic} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">{topic.topicLabel}</span>
                        <span
                          className={
                            topic.loyaltyCorrelation > 0
                              ? "text-green-600"
                              : topic.loyaltyCorrelation < 0
                              ? "text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {topic.loyaltyCorrelation > 0 ? "+" : ""}
                          {(topic.loyaltyCorrelation * 100).toFixed(0)}%相関
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, topic.engagementRate * 50)}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 比較インサイト */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <h5 className="text-sm font-semibold text-green-800 mb-1">
            高ロイヤリティの特徴
          </h5>
          <p className="text-xs text-green-700">
            投稿頻度が中層の<strong>2倍以上</strong>、R&D・CSRコンテンツへの関心が特に高い
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h5 className="text-sm font-semibold text-amber-800 mb-1">
            中層→高層の転換ポイント
          </h5>
          <p className="text-xs text-amber-700">
            R&Dコンテンツへのエンゲージメントを増やすことで転換率向上が期待できる
          </p>
        </div>
      </div>
    </div>
  );
}
