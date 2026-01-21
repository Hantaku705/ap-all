"use client";

import { useState, useEffect } from "react";
import { q1Data, q2Data, q3Data, q4Data } from "@/data/quarterly-data";
import { annualBudgetMatrix, annualReachMatrix, purposeColors, Purpose } from "@/data/matrix-data";
import { tacticsMasterData } from "@/data/tactics-data";

// All months in order
const allMonths = ["2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

// Month key for filters
type MonthKey = "2月" | "3月" | "4月" | "5月" | "6月" | "7月" | "8月" | "9月" | "10月" | "11月" | "12月";

// Quarter ID type
type QuarterId = "all" | "Q1" | "Q2" | "Q3" | "Q4";

// Quarter definitions
const quarters = [
  { id: "Q1" as const, months: ["2月", "3月"] as MonthKey[], data: q1Data, color: "bg-sky-50", hoverColor: "hover:bg-sky-100" },
  { id: "Q2" as const, months: ["4月", "5月", "6月"] as MonthKey[], data: q2Data, color: "bg-emerald-50", hoverColor: "hover:bg-emerald-100" },
  { id: "Q3" as const, months: ["7月", "8月", "9月"] as MonthKey[], data: q3Data, color: "bg-amber-50", hoverColor: "hover:bg-amber-100" },
  { id: "Q4" as const, months: ["10月", "11月", "12月"] as MonthKey[], data: q4Data, color: "bg-purple-50", hoverColor: "hover:bg-purple-100" },
];

// Quarter to months mapping
const quarterMonthsMap: Record<QuarterId, MonthKey[]> = {
  all: allMonths as MonthKey[],
  Q1: ["2月", "3月"],
  Q2: ["4月", "5月", "6月"],
  Q3: ["7月", "8月", "9月"],
  Q4: ["10月", "11月", "12月"],
};

// Purpose categories
const purposeCategories: Purpose[] = ["認知", "話題化", "購入", "比較検討", "ブランディング"];

// Mega sale months
const megaSaleMonths = ["3月", "6月", "9月", "11月"];

// Month key mapping
const monthKeyMap: Record<string, "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec"> = {
  "2": "feb", "3": "mar", "4": "apr", "5": "may", "6": "jun",
  "7": "jul", "8": "aug", "9": "sep", "10": "oct", "11": "nov", "12": "dec",
};

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 left-0 top-full mt-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs max-w-xs whitespace-normal shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

// Get quarter for a month
function getQuarterForMonth(month: string) {
  return quarters.find((q) => q.months.includes(month as MonthKey));
}

// Check if month is mega sale
function isMegaSaleMonth(month: string): boolean {
  return megaSaleMonths.includes(month);
}

// Tactic details interface
interface TacticDetail {
  name: string;
  shortName: string;
  budget: number; // in 万円
  reach: number; // in 万UU
  posts?: number; // 投稿数
  followers?: number; // フォロワー数（万人）
}

// Get tactics with details for a specific purpose and month
function getTacticsForPurposeAndMonth(purpose: Purpose, month: string): TacticDetail[] {
  const monthKey = month.replace("月", "");
  const key = monthKeyMap[monthKey];
  if (!key) return [];

  const shortNames: Record<string, string> = {
    "TikTok大量生成": "TT",
    "X RT部隊": "RT",
    "広告配信（運用型TT）": "広告TT",
    "広告配信（運用型IG）": "広告IG",
    "広告配信（獲得型X）": "獲得X",
    "広告配信（獲得型IG）": "獲得IG",
    "KOL Pick（IG）": "KOL-IG",
    "KOL Pick（YT）": "KOL-YT",
    "TTS GMV MAX": "TTS",
    "@cosme/LIPS": "@cos",
    "アンバサダー起用（グク）": "Amb",
  };

  return annualBudgetMatrix
    .filter((item) => item.purpose.includes(purpose) && item.data[key] > 0)
    .map((item) => {
      const budget = item.data[key];

      // Find corresponding reach data
      const reachItem = annualReachMatrix.find(
        (r) => r.tactic === item.tactic ||
        (r.tactic.includes("運用型") && item.tactic.includes("運用型") && r.sns === item.sns) ||
        (r.tactic.includes("獲得型") && item.tactic.includes("獲得型"))
      );
      const reach = reachItem?.data[key] || 0;

      // Get posts and followers from tactics master data
      const masterTactic = tacticsMasterData.find((t) => t.name === item.tactic);

      // Calculate posts: use master data if available, otherwise TikTok formula
      let posts: number | undefined;
      if (masterTactic?.annualPosts) {
        // Proportionally distribute annual posts based on budget ratio
        const monthlyRatio = budget / item.total;
        posts = Math.round(masterTactic.annualPosts * monthlyRatio);
      }

      // Get followers from master data (only for KOL-type tactics)
      const followers = masterTactic?.totalFollowers;

      return {
        name: item.tactic,
        shortName: shortNames[item.tactic] || item.tactic.slice(0, 4),
        budget,
        reach,
        posts,
        followers,
      };
    });
}

// Format budget
function formatBudget(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(1)}億`;
  }
  if (valueInMan >= 1000) {
    return `${Math.round(valueInMan / 100) / 10}千万`;
  }
  return `${valueInMan}万`;
}

// Format reach
function formatReach(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(1)}億`;
  }
  return `${valueInMan.toLocaleString()}万`;
}

// Format followers (万人単位)
function formatFollowers(followers: number): string {
  if (followers >= 10000) {
    return `${(followers / 10000).toFixed(1)}億`;
  }
  if (followers >= 100) {
    return `${(followers / 100).toFixed(0)}百万`;
  }
  return `${followers}万`;
}

// Truncate keyMessage for display
function truncateKeyMessage(msg: string, maxLen: number = 18): string {
  if (msg.length <= maxLen) return msg;
  return msg.slice(0, maxLen) + "...";
}

export default function ActivationCalendarContent() {
  // Filter states
  const [filterQuarter, setFilterQuarter] = useState<QuarterId>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Reset month filter when quarter changes
  useEffect(() => {
    setFilterMonth("all");
  }, [filterQuarter]);

  // Get available months based on quarter filter
  const getAvailableMonths = (): MonthKey[] => {
    return quarterMonthsMap[filterQuarter];
  };

  // Get visible months based on both filters
  const getVisibleMonths = (): MonthKey[] => {
    const availableMonths = getAvailableMonths();
    if (filterMonth === "all") {
      return availableMonths;
    }
    return availableMonths.filter((m) => m === filterMonth);
  };

  // Get visible quarters (for header rendering)
  const getVisibleQuarters = () => {
    const visibleMonths = getVisibleMonths();
    return quarters
      .map((q) => ({
        ...q,
        visibleMonths: q.months.filter((m) => visibleMonths.includes(m)),
      }))
      .filter((q) => q.visibleMonths.length > 0);
  };

  const visibleMonths = getVisibleMonths();
  const visibleQuarters = getVisibleQuarters();
  const availableMonths = getAvailableMonths();

  // Dynamic width and font size based on visible months
  const tableMinWidth = visibleMonths.length === allMonths.length ? "min-w-[1100px]" : "";
  const cellMinWidth = visibleMonths.length <= 3 ? "min-w-[200px]" : visibleMonths.length <= 6 ? "min-w-[120px]" : "min-w-[85px]";
  const showFullMessage = visibleMonths.length <= 6;
  const tacticFontSize = visibleMonths.length <= 3 ? "text-sm" : visibleMonths.length <= 6 ? "text-xs" : "text-[9px]";
  const tacticPadding = visibleMonths.length <= 3 ? "px-3 py-2" : visibleMonths.length <= 6 ? "px-2 py-1.5" : "px-1.5 py-1";

  // Annual totals
  const totalInvestment = quarters.reduce((sum, q) => sum + q.data.summary.investmentValue, 0);
  const totalGmv = 73.6;
  const totalReach = quarters.reduce((sum, q) => sum + q.data.summary.totalReachValue, 0);

  // Check if filters are active
  const isFiltered = filterQuarter !== "all" || filterMonth !== "all";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Quarter Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">四半期</label>
            <select
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value as QuarterId)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="Q1">Q1（2-3月）</option>
              <option value="Q2">Q2（4-6月）</option>
              <option value="Q3">Q3（7-9月）</option>
              <option value="Q4">Q4（10-12月）</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">月</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filter Button */}
          {isFiltered && (
            <button
              onClick={() => {
                setFilterQuarter("all");
                setFilterMonth("all");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              クリア
            </button>
          )}

          {/* Filter Status */}
          <div className="ml-auto text-xs text-gray-500">
            表示: {visibleMonths.length}ヶ月 / {allMonths.length}ヶ月
          </div>
        </div>
      </div>

      {/* Compact KPI Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">年間投資</span>
            <span className="font-bold text-amber-600">{totalInvestment}億円</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">GMV</span>
            <span className="font-bold text-emerald-600">{totalGmv}億円</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Reach</span>
            <span className="font-bold text-purple-600">{totalReach.toFixed(1)}億UU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">ROAS</span>
            <span className="font-bold text-sky-600">466%</span>
          </div>
        </div>
      </div>

      {/* Single Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-xs border-collapse ${tableMinWidth}`}>
            {/* Quarter Header Row */}
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-left text-gray-600 font-medium border-b border-r border-gray-200 w-16 sticky left-0 bg-gray-100 z-10">
                  目的
                </th>
                {visibleQuarters.map((q) => (
                  <th
                    key={q.id}
                    colSpan={q.visibleMonths.length}
                    className={`px-2 py-2 text-center font-medium border-b border-r border-gray-200 ${q.color}`}
                  >
                    <Tooltip text={q.data.summary.keyMessage}>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{q.id}</span>
                        <span className={`text-[10px] text-gray-500 font-normal ${showFullMessage ? "" : "truncate"}`}>
                          {showFullMessage ? q.data.summary.keyMessage : truncateKeyMessage(q.data.summary.keyMessage)}
                        </span>
                      </div>
                    </Tooltip>
                  </th>
                ))}
              </tr>
              {/* Month Header Row */}
              <tr className="bg-gray-50">
                <th className="px-2 py-1.5 text-left text-gray-500 font-medium border-b border-r border-gray-200 sticky left-0 bg-gray-50 z-10">

                </th>
                {visibleMonths.map((month) => {
                  const q = getQuarterForMonth(month);
                  const isMega = isMegaSaleMonth(month);
                  return (
                    <th
                      key={month}
                      className={`px-1 py-1.5 text-center font-medium border-b border-r border-gray-200 ${cellMinWidth} ${
                        isMega ? "bg-amber-100 text-amber-800" : q?.color || ""
                      }`}
                    >
                      <span>{month.replace("月", "")}</span>
                      {isMega && <span className="text-amber-500 ml-0.5">★</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {purposeCategories.map((purpose) => (
                <tr key={purpose} className="hover:bg-gray-50">
                  <td className="px-2 py-2 border-b border-r border-gray-200 sticky left-0 bg-white z-10">
                    <span
                      className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded"
                      style={{
                        backgroundColor: `${purposeColors[purpose]}20`,
                        color: purposeColors[purpose],
                      }}
                    >
                      {purpose}
                    </span>
                  </td>
                  {visibleMonths.map((month) => {
                    const tactics = getTacticsForPurposeAndMonth(purpose, month);
                    const isMega = isMegaSaleMonth(month);
                    return (
                      <td
                        key={month}
                        className={`px-1 py-1.5 border-b border-r border-gray-200 align-top ${
                          isMega ? "bg-amber-50/50" : ""
                        }`}
                      >
                        {tactics.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {tactics.map((tactic, idx) => (
                              <div
                                key={idx}
                                className={`bg-gray-50 rounded ${tacticPadding} ${tacticFontSize}`}
                              >
                                <div className="font-semibold text-gray-800">{tactic.shortName}</div>
                                <div className="text-gray-500">
                                  {formatBudget(tactic.budget)}
                                  {tactic.posts && <span className="ml-1 text-sky-600">{tactic.posts}本</span>}
                                </div>
                                {tactic.reach > 0 && (
                                  <div className="text-purple-500">{formatReach(tactic.reach)}</div>
                                )}
                                {tactic.followers && tactic.followers > 0 && (
                                  <div className="text-pink-500">{formatFollowers(tactic.followers)}FW</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-center block">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium">凡例:</span>
          <span>TT=TikTok</span>
          <span>RT=RT部隊</span>
          <span>TTS=TikTokShop</span>
          <span>KOL=KOL Pick</span>
          <span>Amb=アンバサダー</span>
          <span className="text-pink-500">FW=フォロワー</span>
          <span className="text-amber-600">★=メガ割</span>
        </div>
      </div>

      {/* Quarter Summary Cards (Compact) */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {quarters.map((q) => (
          <div key={q.id} className={`rounded-lg p-2 ${q.color} border border-gray-200`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-gray-800">{q.id}</span>
              <span className="text-[10px] text-gray-500">{q.data.summary.mainEvent}</span>
            </div>
            <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">
              {q.data.summary.keyMessage}
            </p>
            <div className="flex gap-2 mt-1 text-[10px]">
              <span className="text-amber-600">{q.data.summary.investment}</span>
              <span className="text-emerald-600">{q.data.summary.targetGmv}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
