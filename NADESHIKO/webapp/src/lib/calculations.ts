import { Deal, MonthlySummary, ManagerPerformance, AccountPerformance, ClientPerformance, MonthlyTarget } from '@/types/deal';

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
export function calculateMonthlySummary(deals: Deal[], targets: MonthlyTarget[]): MonthlySummary[] {
  const months = [...new Set(deals.map(d => d.month))].sort();

  return months.map(month => {
    const monthDeals = deals.filter(d => d.month === month);
    const target = targets.find(t => t.month === month)?.target || 0;

    const totalSales = monthDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = monthDeals.reduce((sum, d) => sum + d.grossProfit, 0);

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

// 全体サマリー計算
export function calculateTotalSummary(deals: Deal[], targets: MonthlyTarget[]) {
  const totalSales = deals.reduce((sum, d) => sum + d.sales, 0);
  const totalGrossProfit = deals.reduce((sum, d) => sum + d.grossProfit, 0);
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
