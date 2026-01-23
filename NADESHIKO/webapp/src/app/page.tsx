"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DealsContent from "@/components/deals/DealsContent";
import PerformanceContent from "@/components/performance/PerformanceContent";
import ViewsContent from "@/components/views/ViewsContent";
import AlgorithmContent from "@/components/algorithm/AlgorithmContent";
import ChatWidget from "@/components/chat/ChatWidget";
import { useEdit } from "@/contexts/EditContext";
import { formatCurrency } from "@/lib/formatters";
import {
  calculateManagerPerformance,
  calculateAccountPerformance,
  calculateClientPerformance,
} from "@/lib/calculations";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { deals } = useEdit();

  // AIに渡すデータコンテキストを生成
  const dealsContext = useMemo(() => {
    const totalSales = deals.reduce((sum, d) => sum + d.sales, 0);
    const totalGrossProfit = deals.reduce((sum, d) => sum + d.grossProfit, 0);
    const dealCount = deals.length;

    // 最新月のデータ
    const months = [...new Set(deals.map(d => d.month))].sort();
    const latestMonth = months[months.length - 1] || "N/A";
    const latestMonthDeals = deals.filter(d => d.month === latestMonth);
    const latestMonthSales = latestMonthDeals.reduce((sum, d) => sum + d.sales, 0);

    // トップ担当者
    const managerPerf = calculateManagerPerformance(deals).slice(0, 5);
    const topManagers = managerPerf.map(m => `${m.manager}: ${formatCurrency(m.totalSales)}`).join(", ");

    // トップアカウント
    const accountPerf = calculateAccountPerformance(deals).slice(0, 5);
    const topAccounts = accountPerf.map(a => `${a.accountName}: ${formatCurrency(a.totalSales)}`).join(", ");

    // トップクライアント
    const clientPerf = calculateClientPerformance(deals).slice(0, 5);
    const topClients = clientPerf.map(c => `${c.client}: ${formatCurrency(c.totalSales)}`).join(", ");

    return `
- 総案件数: ${dealCount}件
- 総売上: ${formatCurrency(totalSales)}
- 総粗利: ${formatCurrency(totalGrossProfit)}
- 最新月: ${latestMonth}
- 最新月売上: ${formatCurrency(latestMonthSales)}
- トップ担当者: ${topManagers}
- トップアカウント: ${topAccounts}
- トップクライアント: ${topClients}
    `.trim();
  }, [deals]);

  return (
    <main className="min-h-screen">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "deals" && <DealsContent />}
        {activeTab === "performance" && <PerformanceContent />}
        {activeTab === "views" && <ViewsContent />}
        {activeTab === "algorithm" && <AlgorithmContent />}
      </div>

      {/* AIチャットウィジェット */}
      <ChatWidget dealsContext={dealsContext} />
    </main>
  );
}
