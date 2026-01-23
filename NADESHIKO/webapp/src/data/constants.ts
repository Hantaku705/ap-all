import { Category, DealStatus, TaxType } from '@/types/deal';

// カテゴリオプション
export const categoryOptions: { value: Category; label: string }[] = [
  { value: 'AJP', label: 'AJP（自社）' },
  { value: 'RCP', label: 'RCP（外部）' },
];

// 税区分オプション
export const taxTypeOptions: { value: TaxType; label: string }[] = [
  { value: '課税', label: '課税' },
  { value: '非課税', label: '非課税' },
];

// ステータスオプション
export const statusOptions: { value: DealStatus; label: string }[] = [
  { value: '進行中', label: '進行中' },
  { value: '投稿完了', label: '投稿完了' },
  { value: '請求済み', label: '請求済み' },
  { value: 'キャンセル', label: 'キャンセル' },
];

// 期間タイプ
export type PeriodType = 'all' | 'year' | 'quarter' | 'month';

// 期間オプション（統合セレクター用）
export interface PeriodOption {
  value: string;
  label: string;
  type: PeriodType;
  group?: string;
}

export const periodOptions: PeriodOption[] = [
  // 全期間
  { value: 'all', label: '全期間', type: 'all' },
  // 年
  { value: '2026', label: '2026年', type: 'year', group: '年' },
  { value: '2025', label: '2025年', type: 'year', group: '年' },
  { value: '2024', label: '2024年', type: 'year', group: '年' },
  { value: '2023', label: '2023年', type: 'year', group: '年' },
  // Q（暦年ベース: Q1=1-3月, Q2=4-6月, Q3=7-9月, Q4=10-12月）
  { value: '2026-Q1', label: 'Q1 2026 (1-3月)', type: 'quarter', group: '四半期' },
  { value: '2025-Q4', label: 'Q4 2025 (10-12月)', type: 'quarter', group: '四半期' },
  { value: '2025-Q3', label: 'Q3 2025 (7-9月)', type: 'quarter', group: '四半期' },
  { value: '2025-Q2', label: 'Q2 2025 (4-6月)', type: 'quarter', group: '四半期' },
  { value: '2025-Q1', label: 'Q1 2025 (1-3月)', type: 'quarter', group: '四半期' },
  { value: '2024-Q4', label: 'Q4 2024 (10-12月)', type: 'quarter', group: '四半期' },
  { value: '2024-Q3', label: 'Q3 2024 (7-9月)', type: 'quarter', group: '四半期' },
  { value: '2024-Q2', label: 'Q2 2024 (4-6月)', type: 'quarter', group: '四半期' },
  { value: '2024-Q1', label: 'Q1 2024 (1-3月)', type: 'quarter', group: '四半期' },
  { value: '2023-Q4', label: 'Q4 2023 (10-12月)', type: 'quarter', group: '四半期' },
  // 月
  { value: '2026-04', label: '26年4月', type: 'month', group: '月' },
  { value: '2026-03', label: '26年3月', type: 'month', group: '月' },
  { value: '2026-02', label: '26年2月', type: 'month', group: '月' },
  { value: '2026-01', label: '26年1月', type: 'month', group: '月' },
  { value: '2025-12', label: '25年12月', type: 'month', group: '月' },
  { value: '2025-11', label: '25年11月', type: 'month', group: '月' },
  { value: '2025-10', label: '25年10月', type: 'month', group: '月' },
  { value: '2025-09', label: '25年9月', type: 'month', group: '月' },
  { value: '2025-08', label: '25年8月', type: 'month', group: '月' },
  { value: '2025-07', label: '25年7月', type: 'month', group: '月' },
  { value: '2025-06', label: '25年6月', type: 'month', group: '月' },
  { value: '2025-05', label: '25年5月', type: 'month', group: '月' },
  { value: '2025-04', label: '25年4月', type: 'month', group: '月' },
  { value: '2025-03', label: '25年3月', type: 'month', group: '月' },
  { value: '2025-02', label: '25年2月', type: 'month', group: '月' },
  { value: '2025-01', label: '25年1月', type: 'month', group: '月' },
  { value: '2024-12', label: '24年12月', type: 'month', group: '月' },
  { value: '2024-11', label: '24年11月', type: 'month', group: '月' },
  { value: '2024-10', label: '24年10月', type: 'month', group: '月' },
  { value: '2024-09', label: '24年9月', type: 'month', group: '月' },
  { value: '2024-08', label: '24年8月', type: 'month', group: '月' },
  { value: '2024-07', label: '24年7月', type: 'month', group: '月' },
  { value: '2024-06', label: '24年6月', type: 'month', group: '月' },
  { value: '2024-05', label: '24年5月', type: 'month', group: '月' },
  { value: '2024-04', label: '24年4月', type: 'month', group: '月' },
  { value: '2024-03', label: '24年3月', type: 'month', group: '月' },
  { value: '2024-02', label: '24年2月', type: 'month', group: '月' },
  { value: '2024-01', label: '24年1月', type: 'month', group: '月' },
  { value: '2023-12', label: '23年12月', type: 'month', group: '月' },
  { value: '2023-11', label: '23年11月', type: 'month', group: '月' },
];

// 旧形式互換（月オプションのみ、昇順）
export const monthOptions = periodOptions
  .filter(p => p.type === 'month')
  .map(p => ({ value: p.value, label: p.label }))
  .reverse();

// カテゴリカラー
export const categoryColors: Record<Category, string> = {
  AJP: '#3b82f6', // blue-500
  RCP: '#f59e0b', // amber-500
};

// ステータスカラー
export const statusColors: Record<DealStatus, string> = {
  '進行中': '#f59e0b',    // amber-500
  '投稿完了': '#22c55e',  // green-500
  '請求済み': '#3b82f6',  // blue-500
  'キャンセル': '#ef4444', // red-500
};
