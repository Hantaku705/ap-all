"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandHeader } from "@/components/brand-detail/BrandHeader";
import { BrandTrendSection } from "@/components/brand-detail/BrandTrendSection";
import { BrandCEPSection } from "@/components/brand-detail/BrandCEPSection";
import { BrandDPTSection } from "@/components/brand-detail/BrandDPTSection";
import { BrandUserSection } from "@/components/brand-detail/BrandUserSection";
import { BrandRelationSection } from "@/components/brand-detail/BrandRelationSection";
import { BrandPostsSection } from "@/components/brand-detail/BrandPostsSection";
import { BrandStrategySection } from "@/components/brand-detail/BrandStrategySection";

interface BrandDetailClientProps {
  brandName: string;
}

export function BrandDetailClient({ brandName }: BrandDetailClientProps) {
  return (
    <main className="container mx-auto py-8 px-4">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        ダッシュボードに戻る
      </Link>

      <div className="space-y-8">
        {/* Section 1: ヘッダー */}
        <BrandHeader brandName={brandName} />

        {/* Section 2: トレンド分析 */}
        <BrandTrendSection brandName={brandName} />

        {/* Section 3: ユーザー理解 */}
        <BrandUserSection brandName={brandName} />

        {/* Section 4: CEP分析 */}
        <BrandCEPSection brandName={brandName} />

        {/* Section 5: DPT分析 */}
        <BrandDPTSection brandName={brandName} />

        {/* Section 6: 関連性分析 */}
        <BrandRelationSection brandName={brandName} />

        {/* Section 7: 生投稿サンプル */}
        <BrandPostsSection brandName={brandName} />

        {/* Section 8: 戦略示唆 */}
        <BrandStrategySection brandName={brandName} />
      </div>

      <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>DynamicBranding Dashboard - {brandName} 詳細分析</p>
      </footer>
    </main>
  );
}
