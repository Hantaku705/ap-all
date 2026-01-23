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

// 月オプション
export const monthOptions = [
  { value: '2025-11', label: '2025年11月' },
  { value: '2025-12', label: '2025年12月' },
  { value: '2026-01', label: '2026年1月' },
  { value: '2026-02', label: '2026年2月' },
  { value: '2026-03', label: '2026年3月' },
  { value: '2026-04', label: '2026年4月' },
];

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
