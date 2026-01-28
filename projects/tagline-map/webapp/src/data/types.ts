// 共通のタグラインデータインターフェース
export interface TaglineData {
  brand: string
  maker: string
  price: number
  priceCategory: string
  catchcopy?: string
  tagline: string
  url?: string
  taglineFC: boolean
  taglineSourceUrl?: string
  catchcopyFC?: boolean
  catchcopySourceUrl?: string
  x: number // -5 〜 +5
  y: number // -5 〜 +5
}

// 価格帯の定義
export interface PriceCategoryConfig {
  key: string
  label: string
  color: string
}

// 軸フィルターの定義
export interface AxisFilter {
  key: string
  label: string
  condition: (value: number) => boolean
}

// カテゴリ設定
export interface CategoryConfig {
  id: string
  label: string
  xAxisLabel: string
  yAxisLabel: string
  xAxisFilters: AxisFilter[]
  yAxisFilters: AxisFilter[]
  priceCategories: PriceCategoryConfig[]
}
