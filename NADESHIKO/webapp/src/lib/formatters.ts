// 金額フォーマット（円）
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

// 金額フォーマット（万円）
export function formatCurrencyMan(value: number): string {
  const man = value / 10000;
  if (man >= 100) {
    return `${(man / 100).toFixed(1)}億円`;
  }
  return `${man.toFixed(0)}万円`;
}

// パーセンテージフォーマット
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// 数値フォーマット（カンマ区切り）
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(value);
}

// 月ラベル（2026-01 → 1月）
export function formatMonthShort(month: string): string {
  const m = parseInt(month.split('-')[1], 10);
  return `${m}月`;
}

// 月ラベル（2026-01 → 2026年1月）
export function formatMonthFull(month: string): string {
  const [year, m] = month.split('-');
  return `${year}年${parseInt(m, 10)}月`;
}
