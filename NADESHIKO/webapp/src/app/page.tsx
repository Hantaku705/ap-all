"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DealsContent from "@/components/deals/DealsContent";
import PerformanceContent from "@/components/performance/PerformanceContent";
import SettingsContent from "@/components/settings/SettingsContent";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <main className="min-h-screen">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "deals" && <DealsContent />}
        {activeTab === "performance" && <PerformanceContent />}
        {activeTab === "settings" && <SettingsContent />}
      </div>
    </main>
  );
}
