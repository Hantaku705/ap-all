import type { CategoryConfig } from "@/data/types"

export const categories: Record<string, CategoryConfig> = {
  // shampoo: {
  //   id: "shampoo",
  //   label: "シャンプー",
  //   xAxisLabel: "← 機能訴求　　　　　感性訴求 →",
  //   yAxisLabel: "← 日常　　　　特別感 →",
  //   xAxisFilters: [
  //     { key: "functional", label: "機能訴求", condition: (x) => x < 0 },
  //     { key: "emotional", label: "感性訴求", condition: (x) => x >= 0 },
  //   ],
  //   yAxisFilters: [
  //     { key: "daily", label: "日常", condition: (y) => y <= 0 },
  //     { key: "special", label: "特別感", condition: (y) => y > 0 },
  //   ],
  //   priceCategories: [
  //     { key: "petit", label: "プチプラ (~1,100円)", color: "#22c55e" },
  //     { key: "drugcos", label: "ドラコス (1,200~1,980円)", color: "#3b82f6" },
  //     { key: "salon", label: "美容専売品 (2,000円~)", color: "#a855f7" },
  //   ],
  // },
  skincare: {
    id: "skincare",
    label: "スキンケア",
    xAxisLabel: "← 成分・機能訴求　　　　　　体験・感性訴求 →",
    yAxisLabel: "← ベーシック　　　　ラグジュアリー →",
    xAxisFilters: [
      { key: "functional", label: "機能訴求", condition: (x) => x < 0 },
      { key: "emotional", label: "感性訴求", condition: (x) => x >= 0 },
    ],
    yAxisFilters: [
      { key: "basic", label: "ベーシック", condition: (y) => y <= 0 },
      { key: "luxury", label: "ラグジュアリー", condition: (y) => y > 0 },
    ],
    priceCategories: [
      { key: "petit", label: "プチプラ (~2,000円)", color: "#22c55e" },
      { key: "middle", label: "ミドル (2,000~5,000円)", color: "#3b82f6" },
      { key: "luxury", label: "デパコス (5,000円~)", color: "#a855f7" },
    ],
  },
  lip: {
    id: "lip",
    label: "リップ",
    xAxisLabel: "← 色持ち・機能訴求　　　　　　発色・感性訴求 →",
    yAxisLabel: "← ナチュラル　　　　華やか →",
    xAxisFilters: [
      { key: "functional", label: "機能訴求", condition: (x) => x < 0 },
      { key: "emotional", label: "感性訴求", condition: (x) => x >= 0 },
    ],
    yAxisFilters: [
      { key: "natural", label: "ナチュラル", condition: (y) => y <= 0 },
      { key: "gorgeous", label: "華やか", condition: (y) => y > 0 },
    ],
    priceCategories: [
      { key: "petit", label: "プチプラ (~1,500円)", color: "#22c55e" },
      { key: "middle", label: "ミドル (1,500~3,500円)", color: "#3b82f6" },
      { key: "luxury", label: "デパコス (3,500円~)", color: "#a855f7" },
    ],
  },
}

export const categoryIds = Object.keys(categories)
export const defaultCategory = "skincare"
