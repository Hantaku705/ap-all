"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface PersonaMethodologySectionProps {
  totalPosts: number;
  clusterCount: number;
  excludedPosts: number;
}

export function PersonaMethodologySection({
  totalPosts,
  clusterCount,
  excludedPosts,
}: PersonaMethodologySectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Info className="h-4 w-4" />
          ペルソナ生成ロジック
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 text-sm border-t">
          {/* 処理フロー */}
          <div className="pt-4">
            <h4 className="font-medium mb-2">処理フロー</h4>
            <div className="flex items-center gap-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-nowrap">
              <span className="bg-blue-100 px-2 py-1 rounded">
                SNS投稿 {totalPosts.toLocaleString()}件
              </span>
              <span className="text-gray-400">→</span>
              <span className="bg-green-100 px-2 py-1 rounded">
                特徴量抽出(6属性)
              </span>
              <span className="text-gray-400">→</span>
              <span className="bg-yellow-100 px-2 py-1 rounded">
                k-means(K={clusterCount})
              </span>
              <span className="text-gray-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded">
                LLMペルソナ化
              </span>
            </div>
            {excludedPosts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ※ データ不足の{excludedPosts.toLocaleString()}件は除外
              </p>
            )}
          </div>

          {/* 特徴量 */}
          <div>
            <h4 className="font-medium mb-2">
              使用特徴量（6属性 → 44次元ベクトル）
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                {
                  name: "ライフステージ",
                  key: "life_stage",
                  example: "子育て世帯、一人暮らし等",
                },
                {
                  name: "料理スキル",
                  key: "cooking_skill",
                  example: "初級、中級、上級",
                },
                {
                  name: "動機",
                  key: "motivation",
                  example: "時短、健康、おもてなし等",
                },
                {
                  name: "食事シーン",
                  key: "meal_occasion",
                  example: "平日夜、週末、パーティー等",
                },
                {
                  name: "調理対象",
                  key: "cooking_for",
                  example: "自分、家族、子ども、ゲスト",
                },
                {
                  name: "感情",
                  key: "emotion",
                  example: "焦り、満足、ワクワク等",
                },
              ].map((attr) => (
                <div key={attr.key} className="bg-gray-50 p-2 rounded">
                  <p className="font-medium text-xs">{attr.name}</p>
                  <p className="text-xs text-muted-foreground">{attr.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 座標計算 */}
          <div>
            <h4 className="font-medium mb-2">座標計算ロジック</h4>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">X軸（時間・労力投資度）</p>
                <p className="text-muted-foreground">
                  = 料理スキル×35% + 食事シーン×35% + 動機×20% + 感情×10%
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">Y軸（心理的関与度）</p>
                <p className="text-muted-foreground">
                  = 動機×35% + 調理対象×30% + ライフステージ×20% + 感情×15%
                </p>
              </div>
            </div>
          </div>

          {/* パラメータ */}
          <div>
            <h4 className="font-medium mb-2">アルゴリズムパラメータ</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-muted-foreground">クラスター数</p>
                <p className="font-bold">5〜8</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-muted-foreground">最小既知属性</p>
                <p className="font-bold">2/6</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-muted-foreground">振幅係数</p>
                <p className="font-bold">2.5x</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-muted-foreground">ジッター</p>
                <p className="font-bold">±0.15</p>
              </div>
            </div>
          </div>

          {/* アルゴリズム説明 */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
            <p className="font-medium text-blue-900 mb-1">k-meansクラスタリングとは？</p>
            <p>
              投稿データを類似性に基づいてK個のグループに分類するアルゴリズムです。
              各ペルソナは、類似した特徴を持つ投稿群の「重心」を表現しています。
              Gemini LLMが統計データを解釈し、マーケティング活用しやすいペルソナ名・説明を生成します。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
