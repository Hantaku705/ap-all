"use client";

import { ArrowRight, ArrowDown, Clock } from "lucide-react";
import type { LoyaltyConversionFunnel as FunnelType } from "@/types/corporate.types";

interface LoyaltyConversionFunnelProps {
  funnels: FunnelType[];
}

const LEVEL_CONFIG = {
  high: { label: "高", color: "#22c55e", bgColor: "bg-green-100" },
  medium: { label: "中", color: "#f59e0b", bgColor: "bg-amber-100" },
  low: { label: "低", color: "#ef4444", bgColor: "bg-red-100" },
};

export function LoyaltyConversionFunnel({
  funnels,
}: LoyaltyConversionFunnelProps) {
  // 上向き転換（ポジティブ）と下向き転換（ネガティブ）を分類
  const positiveConversions = funnels.filter(
    (f) =>
      (f.fromLevel === "low" && f.toLevel === "medium") ||
      (f.fromLevel === "medium" && f.toLevel === "high")
  );
  const negativeConversions = funnels.filter(
    (f) =>
      (f.fromLevel === "high" && f.toLevel === "medium") ||
      (f.fromLevel === "medium" && f.toLevel === "low")
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        ロイヤリティ転換フロー
      </h3>

      {/* ファネルビジュアル */}
      <div className="flex justify-center items-center gap-8 mb-8">
        {/* LOW */}
        <div className="text-center">
          <div
            className={`w-24 h-24 rounded-full ${LEVEL_CONFIG.low.bgColor} flex items-center justify-center border-4`}
            style={{ borderColor: LEVEL_CONFIG.low.color }}
          >
            <span className="text-2xl font-bold" style={{ color: LEVEL_CONFIG.low.color }}>
              低
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">5%</p>
        </div>

        {/* LOW → MEDIUM Arrow */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-green-600">
            <ArrowRight className="w-8 h-8" />
            <span className="text-lg font-bold">40%</span>
          </div>
          <span className="text-xs text-gray-500">30日</span>
        </div>

        {/* MEDIUM */}
        <div className="text-center">
          <div
            className={`w-32 h-32 rounded-full ${LEVEL_CONFIG.medium.bgColor} flex items-center justify-center border-4`}
            style={{ borderColor: LEVEL_CONFIG.medium.color }}
          >
            <span className="text-3xl font-bold" style={{ color: LEVEL_CONFIG.medium.color }}>
              中
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">71%</p>
        </div>

        {/* MEDIUM → HIGH Arrow */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-green-600">
            <ArrowRight className="w-8 h-8" />
            <span className="text-lg font-bold">8.5%</span>
          </div>
          <span className="text-xs text-gray-500">45日</span>
        </div>

        {/* HIGH */}
        <div className="text-center">
          <div
            className={`w-28 h-28 rounded-full ${LEVEL_CONFIG.high.bgColor} flex items-center justify-center border-4`}
            style={{ borderColor: LEVEL_CONFIG.high.color }}
          >
            <span className="text-3xl font-bold" style={{ color: LEVEL_CONFIG.high.color }}>
              高
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">25%</p>
        </div>
      </div>

      {/* 転換詳細テーブル */}
      <div className="grid grid-cols-2 gap-6">
        {/* ポジティブ転換 */}
        <div>
          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            アップグレード転換
          </h4>
          <div className="space-y-3">
            {positiveConversions.map((funnel) => (
              <div
                key={`${funnel.fromLevel}-${funnel.toLevel}`}
                className="bg-green-50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {LEVEL_CONFIG[funnel.fromLevel].label} →{" "}
                    {LEVEL_CONFIG[funnel.toLevel].label}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {funnel.conversionRate}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    平均{funnel.averageTimeToConvert}日
                  </span>
                  <span>サンプル: {funnel.sampleSize}件</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ネガティブ転換 */}
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            ダウングレード転換
          </h4>
          <div className="space-y-3">
            {negativeConversions.map((funnel) => (
              <div
                key={`${funnel.fromLevel}-${funnel.toLevel}`}
                className="bg-red-50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {LEVEL_CONFIG[funnel.fromLevel].label} →{" "}
                    {LEVEL_CONFIG[funnel.toLevel].label}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {funnel.conversionRate}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    平均{funnel.averageTimeToConvert}日
                  </span>
                  <span>サンプル: {funnel.sampleSize}件</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
