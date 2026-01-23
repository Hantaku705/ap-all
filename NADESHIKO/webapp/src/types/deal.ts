// 区分
export type Category = 'AJP' | 'RCP';

// 税区分
export type TaxType = '課税' | '非課税';

// ステータス
export type DealStatus = '進行中' | '投稿完了' | '請求済み' | 'キャンセル';

// 案件データ
export interface Deal {
  id: string;
  month: string;              // "2026-01", "2026-02", "2026-03"
  manager: string;            // 担当者
  client: string;             // クライアント
  projectName: string;        // 案件名
  accountName: string;        // アカウント名（インフルエンサー）
  category: Category;         // 区分 (AJP/RCP)
  taxType: TaxType;           // 税区分
  description: string;        // 摘要
  sales: number;              // 売上
  cost: number;               // 費用
  paymentCost60: number;      // 支払費用60%
  adCost: number;             // 広告費
  grossProfit: number;        // 粗利
  status: DealStatus;         // ステータス
  note: string;               // 備考
  createdAt: string;          // 作成日時
  updatedAt: string;          // 更新日時
}

// 月別目標
export interface MonthlyTarget {
  month: string;
  target: number;
}

// 月別サマリー
export interface MonthlySummary {
  month: string;
  target: number;
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  achievementRate: number;
  ajpSales: number;
  rcpSales: number;
  ajpProfit: number;
  rcpProfit: number;
  dealCount: number;
  completedCount: number;
}

// 担当者別パフォーマンス
export interface ManagerPerformance {
  manager: string;
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  dealCount: number;
  ajpCount: number;
  rcpCount: number;
}

// アカウント別パフォーマンス
export interface AccountPerformance {
  accountName: string;
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  dealCount: number;
  mainCategory: Category;
}

// クライアント別パフォーマンス
export interface ClientPerformance {
  client: string;
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  dealCount: number;
}

// 新規案件フォーム用
export type DealFormData = Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'grossProfit' | 'paymentCost60'>;
