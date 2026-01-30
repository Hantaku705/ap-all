import { Deal, MonthlySummary, ManagerPerformance, AccountPerformance, ClientPerformance, MonthlyTarget } from '@/types/deal';
import { monthlySummaryData, MonthlySummary as CsvMonthlySummary } from '@/data/monthly-summary';

// CSVサマリーデータをMapに変換（高速検索用）
const csvSummaryMap = new Map<string, CsvMonthlySummary>(
  monthlySummaryData.map(s => [s.month, s])
);

// 粗利計算
export function calculateGrossProfit(sales: number, cost: number, category: 'AJP' | 'RCP'): number {
  if (category === 'AJP') {
    return sales;
  }
  // RCP: 粗利 = 売上 - 支払費用60%
  return sales - (cost * 0.6);
}

// 支払費用60%計算
export function calculatePaymentCost60(cost: number): number {
  return cost * 0.6;
}

// 月別サマリー計算
// CSVサマリーデータがある場合はそちらの売上・粗利を優先使用
export function calculateMonthlySummary(deals: Deal[], targets: MonthlyTarget[]): MonthlySummary[] {
  const months = [...new Set(deals.map(d => d.month))].sort();

  return months.map(month => {
    const monthDeals = deals.filter(d => d.month === month);
    const target = targets.find(t => t.month === month)?.target || 0;

    // CSVサマリーデータがあればそちらを使用、なければ案件データから計算
    const csvSummary = csvSummaryMap.get(month);
    const totalSales = csvSummary && csvSummary.sales > 0
      ? csvSummary.sales
      : monthDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = csvSummary && csvSummary.grossProfit > 0
      ? csvSummary.grossProfit
      : monthDeals.reduce((sum, d) => sum + d.grossProfit, 0);

    const ajpDeals = monthDeals.filter(d => d.category === 'AJP');
    const rcpDeals = monthDeals.filter(d => d.category === 'RCP');

    const ajpSales = ajpDeals.reduce((sum, d) => sum + d.sales, 0);
    const rcpSales = rcpDeals.reduce((sum, d) => sum + d.sales, 0);
    const ajpProfit = ajpDeals.reduce((sum, d) => sum + d.grossProfit, 0);
    const rcpProfit = rcpDeals.reduce((sum, d) => sum + d.grossProfit, 0);

    const completedDeals = monthDeals.filter(d => d.status === '投稿完了');

    return {
      month,
      target,
      totalSales,
      totalGrossProfit,
      grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
      achievementRate: target > 0 ? (totalSales / target) * 100 : 0,
      ajpSales,
      rcpSales,
      ajpProfit,
      rcpProfit,
      dealCount: monthDeals.length,
      completedCount: completedDeals.length,
    };
  });
}

// 担当者別パフォーマンス計算
export function calculateManagerPerformance(deals: Deal[]): ManagerPerformance[] {
  const managerMap = new Map<string, Deal[]>();

  deals.forEach(deal => {
    const manager = deal.manager || '（未設定）';
    if (!managerMap.has(manager)) {
      managerMap.set(manager, []);
    }
    managerMap.get(manager)!.push(deal);
  });

  const performances: ManagerPerformance[] = [];

  managerMap.forEach((managerDeals, manager) => {
    const totalSales = managerDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = managerDeals.reduce((sum, d) => sum + d.grossProfit, 0);
    const ajpCount = managerDeals.filter(d => d.category === 'AJP').length;
    const rcpCount = managerDeals.filter(d => d.category === 'RCP').length;

    performances.push({
      manager,
      totalSales,
      totalGrossProfit,
      grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
      dealCount: managerDeals.length,
      ajpCount,
      rcpCount,
    });
  });

  return performances.sort((a, b) => b.totalSales - a.totalSales);
}

// アカウント別パフォーマンス計算
export function calculateAccountPerformance(deals: Deal[]): AccountPerformance[] {
  const accountMap = new Map<string, Deal[]>();

  deals.forEach(deal => {
    const account = deal.accountName || '（未設定）';
    if (!accountMap.has(account)) {
      accountMap.set(account, []);
    }
    accountMap.get(account)!.push(deal);
  });

  const performances: AccountPerformance[] = [];

  accountMap.forEach((accountDeals, accountName) => {
    const totalSales = accountDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = accountDeals.reduce((sum, d) => sum + d.grossProfit, 0);

    // 主要カテゴリ（より多い方）
    const ajpCount = accountDeals.filter(d => d.category === 'AJP').length;
    const rcpCount = accountDeals.filter(d => d.category === 'RCP').length;
    const mainCategory = ajpCount >= rcpCount ? 'AJP' : 'RCP';

    performances.push({
      accountName,
      totalSales,
      totalGrossProfit,
      grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
      dealCount: accountDeals.length,
      mainCategory,
    });
  });

  return performances.sort((a, b) => b.totalSales - a.totalSales);
}

// クライアント別パフォーマンス計算
export function calculateClientPerformance(deals: Deal[]): ClientPerformance[] {
  const clientMap = new Map<string, Deal[]>();

  deals.forEach(deal => {
    if (!clientMap.has(deal.client)) {
      clientMap.set(deal.client, []);
    }
    clientMap.get(deal.client)!.push(deal);
  });

  const performances: ClientPerformance[] = [];

  clientMap.forEach((clientDeals, client) => {
    const totalSales = clientDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = clientDeals.reduce((sum, d) => sum + d.grossProfit, 0);

    performances.push({
      client,
      totalSales,
      totalGrossProfit,
      grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
      dealCount: clientDeals.length,
    });
  });

  return performances.sort((a, b) => b.totalSales - a.totalSales);
}

// 前年同月を取得 "2025-06" → "2024-06"
export function getPreviousYearMonth(month: string): string {
  const [year, m] = month.split('-');
  return `${parseInt(year) - 1}-${m}`;
}

// YoY増減率を計算（前年同月比）
export function calculateYoYRate(
  current: number,
  previous: number | null
): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// 月別サマリーにYoY情報を付加
export function calculateMonthlySummaryWithYoY(
  summaries: MonthlySummary[]
): (MonthlySummary & {
  salesYoY: number | null;
  grossProfitYoY: number | null;
  previousYearSales: number | null;
  previousYearGrossProfit: number | null;
})[] {
  const summaryMap = new Map(summaries.map(s => [s.month, s]));

  return summaries.map(s => {
    const prevMonth = getPreviousYearMonth(s.month);
    const prevSummary = summaryMap.get(prevMonth);

    const previousYearSales = prevSummary?.totalSales ?? null;
    const previousYearGrossProfit = prevSummary?.totalGrossProfit ?? null;

    return {
      ...s,
      salesYoY: calculateYoYRate(s.totalSales, previousYearSales),
      grossProfitYoY: calculateYoYRate(s.totalGrossProfit, previousYearGrossProfit),
      previousYearSales,
      previousYearGrossProfit,
    };
  });
}

// 時系列パフォーマンス計算（トップN項目の月別推移）
export interface TimeSeriesItem {
  name: string;
  monthlyData: { month: string; sales: number; grossProfit: number }[];
  totalSales: number;
  latestMonthSales: number;
  previousMonthSales: number;
  changeRate: number | null; // 前月比（%）
  trend: 'up' | 'down' | 'stable';
}

export function calculateTimeSeriesPerformance(
  deals: Deal[],
  groupBy: 'manager' | 'accountName' | 'client',
  startMonth: string,
  endMonth: string,
  topN: number = 10
): { items: TimeSeriesItem[]; months: string[] } {
  // 期間内のユニークな月を取得
  const allMonths = [...new Set(deals.map(d => d.month))]
    .filter(m => m >= startMonth && m <= endMonth)
    .sort();

  if (allMonths.length === 0) {
    return { items: [], months: [] };
  }

  // グループ別に集計
  const groupMap = new Map<string, Map<string, { sales: number; grossProfit: number }>>();
  const totalSalesMap = new Map<string, number>();

  deals.forEach(deal => {
    if (deal.month < startMonth || deal.month > endMonth) return;

    const key = groupBy === 'manager'
      ? (deal.manager || '（未設定）')
      : groupBy === 'accountName'
      ? (deal.accountName || '（未設定）')
      : deal.client;

    if (!groupMap.has(key)) {
      groupMap.set(key, new Map());
      totalSalesMap.set(key, 0);
    }

    const monthData = groupMap.get(key)!;
    if (!monthData.has(deal.month)) {
      monthData.set(deal.month, { sales: 0, grossProfit: 0 });
    }

    const current = monthData.get(deal.month)!;
    current.sales += deal.sales;
    current.grossProfit += deal.grossProfit;
    totalSalesMap.set(key, totalSalesMap.get(key)! + deal.sales);
  });

  // トップNを抽出
  const sortedKeys = [...totalSalesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([key]) => key);

  const items: TimeSeriesItem[] = sortedKeys.map(name => {
    const monthData = groupMap.get(name)!;
    const monthlyData = allMonths.map(month => {
      const data = monthData.get(month);
      return {
        month,
        sales: data?.sales || 0,
        grossProfit: data?.grossProfit || 0,
      };
    });

    const latestMonth = allMonths[allMonths.length - 1];
    const previousMonth = allMonths.length > 1 ? allMonths[allMonths.length - 2] : null;

    const latestData = monthData.get(latestMonth);
    const previousData = previousMonth ? monthData.get(previousMonth) : null;

    const latestMonthSales = latestData?.sales || 0;
    const previousMonthSales = previousData?.sales || 0;

    let changeRate: number | null = null;
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (previousMonthSales > 0) {
      changeRate = ((latestMonthSales - previousMonthSales) / previousMonthSales) * 100;
      if (changeRate > 5) trend = 'up';
      else if (changeRate < -5) trend = 'down';
    }

    return {
      name,
      monthlyData,
      totalSales: totalSalesMap.get(name)!,
      latestMonthSales,
      previousMonthSales,
      changeRate,
      trend,
    };
  });

  return { items, months: allMonths };
}

// 前月を取得 "2025-06" → "2025-05"
export function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (m === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(m - 1).padStart(2, '0')}`;
}

// 前Qを取得 "2025-Q4" → "2025-Q3", "2025-Q1" → "2024-Q4"
export function getPreviousQuarter(quarter: string): string {
  const [year, q] = quarter.split('-Q');
  const quarterNum = parseInt(q);
  if (quarterNum === 1) {
    return `${parseInt(year) - 1}-Q4`;
  }
  return `${year}-Q${quarterNum - 1}`;
}

// 前年を取得 "2025" → "2024"
export function getPreviousYear(year: string): string {
  return String(parseInt(year) - 1);
}

// Q→月の範囲変換（暦年ベース）
// Q1=1-3月, Q2=4-6月, Q3=7-9月, Q4=10-12月
export function quarterToMonths(quarter: string): string[] {
  const [year, q] = quarter.split('-Q');
  const quarterNum = parseInt(q);
  const monthRanges: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
  };
  return monthRanges[quarterNum].map(m => `${year}-${String(m).padStart(2, '0')}`);
}

// 年→月の範囲変換
export function yearToMonths(year: string): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
}

// 期間タイプを判定
export type PeriodType = 'all' | 'year' | 'quarter' | 'month';

export function getPeriodType(period: string): PeriodType {
  if (period === 'all') return 'all';
  if (period.includes('-Q')) return 'quarter';
  if (/^\d{4}$/.test(period)) return 'year';
  return 'month';
}

// 期間→月の範囲変換
export function periodToMonths(period: string): string[] {
  const type = getPeriodType(period);
  switch (type) {
    case 'quarter':
      return quarterToMonths(period);
    case 'year':
      return yearToMonths(period);
    case 'month':
      return [period];
    default:
      return [];
  }
}

// 比較対象期間を取得
export function getPreviousPeriod(period: string): string {
  const type = getPeriodType(period);
  switch (type) {
    case 'quarter':
      return getPreviousQuarter(period);
    case 'year':
      return getPreviousYear(period);
    case 'month':
      return getPreviousMonth(period);
    default:
      return '';
  }
}

// 比較ラベルを取得
export function getComparisonLabel(period: string): string {
  const type = getPeriodType(period);
  switch (type) {
    case 'quarter':
      return 'QoQ';
    case 'year':
      return 'YoY';
    case 'month':
      return 'MoM';
    default:
      return 'YoY';
  }
}

// 期間サマリー計算
export interface PeriodSummary {
  period: string;
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  dealCount: number;
  completedCount: number;
  target: number;
  achievementRate: number;
}

export function calculatePeriodSummary(
  deals: Deal[],
  targets: MonthlyTarget[],
  period: string
): PeriodSummary {
  const months = periodToMonths(period);
  const periodDeals = months.length > 0
    ? deals.filter(d => months.includes(d.month))
    : deals;
  const periodTargets = months.length > 0
    ? targets.filter(t => months.includes(t.month))
    : targets;

  // CSVサマリーデータがある月はそちらを使用
  let totalSales = 0;
  let totalGrossProfit = 0;

  if (months.length > 0) {
    // 期間指定がある場合、月ごとにCSVサマリーを参照
    months.forEach(month => {
      const csvSummary = csvSummaryMap.get(month);
      if (csvSummary && csvSummary.sales > 0) {
        totalSales += csvSummary.sales;
        totalGrossProfit += csvSummary.grossProfit;
      } else {
        // CSVサマリーがない月は案件データから計算
        const monthDeals = deals.filter(d => d.month === month);
        totalSales += monthDeals.reduce((sum, d) => sum + d.sales, 0);
        totalGrossProfit += monthDeals.reduce((sum, d) => sum + d.grossProfit, 0);
      }
    });
  } else {
    // 全期間の場合は案件データから計算
    totalSales = periodDeals.reduce((sum, d) => sum + d.sales, 0);
    totalGrossProfit = periodDeals.reduce((sum, d) => sum + d.grossProfit, 0);
  }

  const target = periodTargets.reduce((sum, t) => sum + t.target, 0);
  const completedDeals = periodDeals.filter(d => d.status === '投稿完了');

  return {
    period,
    totalSales,
    totalGrossProfit,
    grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
    dealCount: periodDeals.length,
    completedCount: completedDeals.length,
    target,
    achievementRate: target > 0 ? (totalSales / target) * 100 : 0,
  };
}

// 期間比較計算（MoM/QoQ/YoY）
export interface PeriodComparison {
  currentPeriod: PeriodSummary;
  previousPeriod: PeriodSummary | null;
  salesChange: number | null;
  grossProfitChange: number | null;
  dealCountChange: number | null;
  comparisonLabel: string;
}

export function calculatePeriodComparison(
  deals: Deal[],
  targets: MonthlyTarget[],
  period: string
): PeriodComparison {
  const currentPeriod = calculatePeriodSummary(deals, targets, period);
  const previousPeriodValue = getPreviousPeriod(period);
  const previousPeriod = previousPeriodValue
    ? calculatePeriodSummary(deals, targets, previousPeriodValue)
    : null;

  const salesChange = previousPeriod && previousPeriod.totalSales > 0
    ? ((currentPeriod.totalSales - previousPeriod.totalSales) / previousPeriod.totalSales) * 100
    : null;

  const grossProfitChange = previousPeriod && previousPeriod.totalGrossProfit > 0
    ? ((currentPeriod.totalGrossProfit - previousPeriod.totalGrossProfit) / previousPeriod.totalGrossProfit) * 100
    : null;

  const dealCountChange = previousPeriod && previousPeriod.dealCount > 0
    ? ((currentPeriod.dealCount - previousPeriod.dealCount) / previousPeriod.dealCount) * 100
    : null;

  return {
    currentPeriod,
    previousPeriod,
    salesChange,
    grossProfitChange,
    dealCountChange,
    comparisonLabel: getComparisonLabel(period),
  };
}

// 全体サマリー計算
// CSVサマリーデータを使用して月別の売上・粗利を集計
export function calculateTotalSummary(deals: Deal[], targets: MonthlyTarget[]) {
  // 月別にCSVサマリーを使用して集計
  const months = [...new Set(deals.map(d => d.month))];
  let totalSales = 0;
  let totalGrossProfit = 0;

  months.forEach(month => {
    const csvSummary = csvSummaryMap.get(month);
    if (csvSummary && csvSummary.sales > 0) {
      totalSales += csvSummary.sales;
      totalGrossProfit += csvSummary.grossProfit;
    } else {
      const monthDeals = deals.filter(d => d.month === month);
      totalSales += monthDeals.reduce((sum, d) => sum + d.sales, 0);
      totalGrossProfit += monthDeals.reduce((sum, d) => sum + d.grossProfit, 0);
    }
  });

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);

  const ajpDeals = deals.filter(d => d.category === 'AJP');
  const rcpDeals = deals.filter(d => d.category === 'RCP');

  return {
    totalSales,
    totalGrossProfit,
    grossProfitRate: totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0,
    totalTarget,
    achievementRate: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
    dealCount: deals.length,
    ajpCount: ajpDeals.length,
    rcpCount: rcpDeals.length,
    ajpSales: ajpDeals.reduce((sum, d) => sum + d.sales, 0),
    rcpSales: rcpDeals.reduce((sum, d) => sum + d.sales, 0),
    completedCount: deals.filter(d => d.status === '投稿完了').length,
  };
}
