"use client";

import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { SeasonalityChart } from "@/components/charts/SeasonalityChart";

interface BrandTrendSectionProps {
  brandName: string;
}

export function BrandTrendSection({ brandName }: BrandTrendSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">トレンド分析</h2>
      <div className="space-y-6">
        {/* Google Trends + SNS 推移 */}
        <TrendLineChart brandFilter={brandName} />

        {/* 季節性パターン */}
        <SeasonalityChart initialBrand={brandName} hideSelector />
      </div>
    </section>
  );
}
