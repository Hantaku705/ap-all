/**
 * アフィリエイト商品データ
 */
export interface Product {
  /** 商品ID */
  id: string
  /** 商品名 */
  name: string
  /** 商品画像URL */
  image: string
  /** 販売価格 */
  price: number
  /** 通貨 */
  currency: string
  /** コミッション率（%） */
  commissionRate: number
  /** コミッション金額 */
  commissionAmount: number
  /** カテゴリ */
  category: string
  /** 販売者名 */
  seller: string
  /** 在庫数 */
  stock: number
  /** 販売数 */
  sales: number
  /** 商品URL */
  url: string
  /** スクレイピング日時 */
  scrapedAt: string
}

/**
 * スクレイピング結果
 */
export interface ScrapeResult {
  /** 成功した商品リスト */
  products: Product[]
  /** 総ページ数 */
  totalPages: number
  /** 総商品数 */
  totalProducts: number
  /** スクレイピング開始時刻 */
  startedAt: string
  /** スクレイピング終了時刻 */
  finishedAt: string
  /** エラー */
  errors: string[]
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
}
