"use client";

import { PersonaClusterChart } from "@/components/charts/PersonaClusterChart";

interface PersonaAnalysisTabProps {
  selectedBrand?: string;
}

export function PersonaAnalysisTab({ selectedBrand }: PersonaAnalysisTabProps) {
  return (
    <div className="space-y-6">
      {/* ペルソナクラスター散布図 */}
      <PersonaClusterChart
        initialBrand={selectedBrand}
        hideFilter={!!selectedBrand}
      />

      {/* 説明セクション */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">ペルソナ分析について</h3>
        <p className="text-sm text-muted-foreground">
          SNS投稿データから、各ブランドのユーザーを3〜5個の代表的なペルソナに分類しています。
          散布図上の位置は「料理スキル」と「こだわり度」の2軸で表現されており、
          バブルの大きさは該当する投稿数を示しています。
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>・横軸（料理スキル）: 左が初心者、右が上級者</li>
          <li>・縦軸（こだわり度）: 下が手抜き志向、上が本格志向</li>
          <li>・バブルをクリックすると詳細情報を表示します</li>
          <li>・ペルソナは24時間キャッシュされ、自動更新されます</li>
        </ul>
      </div>
    </div>
  );
}
