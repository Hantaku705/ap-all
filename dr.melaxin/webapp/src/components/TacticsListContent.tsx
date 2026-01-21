"use client";

import { useState } from "react";
import {
  tacticsMasterData,
  tacticsSummary,
  snsColors,
  typeColors,
  getPriorityStars,
  getPriorityColor,
  TacticMaster,
  TacticType,
} from "@/data/tactics-data";
import { purposeColors, Purpose, SnsType } from "@/data/matrix-data";

// Format budget
function formatBudget(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(1)}億`;
  }
  return `${(valueInMan / 1000).toFixed(1)}千万`;
}

// Format reach
function formatReach(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(1)}億UU`;
  }
  if (valueInMan > 0) {
    return `${(valueInMan / 1000).toFixed(1)}千万UU`;
  }
  return "-";
}

// Format posts
function formatPosts(posts?: number): string {
  if (!posts) return "-";
  if (posts >= 1000) {
    return `${(posts / 1000).toFixed(1)}千本`;
  }
  return `${posts}本`;
}

// Format followers (万人単位)
function formatFollowers(followers?: number): string {
  if (!followers) return "-";
  if (followers >= 10000) {
    return `${(followers / 10000).toFixed(1)}億人`;
  }
  if (followers >= 100) {
    return `${(followers / 100).toFixed(0)}百万人`;
  }
  return `${followers}万人`;
}

// Format average followers
function formatAvgFollowers(totalFollowers?: number, creatorCount?: number): string {
  if (!totalFollowers || !creatorCount) return "-";
  const avg = totalFollowers / creatorCount;
  if (avg >= 100) {
    return `${(avg / 100).toFixed(0)}百万`;
  }
  if (avg >= 1) {
    return `${avg.toFixed(1)}万`;
  }
  return `${(avg * 10000).toFixed(0)}`;
}

export default function TacticsListContent() {
  const [filterSns, setFilterSns] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "budget" | "reach">("priority");

  // Filter tactics
  let filteredTactics = [...tacticsMasterData];

  if (filterSns !== "all") {
    filteredTactics = filteredTactics.filter((t) => t.sns === filterSns);
  }

  if (filterType !== "all") {
    filteredTactics = filteredTactics.filter((t) => t.type === filterType);
  }

  if (filterPurpose !== "all") {
    filteredTactics = filteredTactics.filter((t) =>
      t.purposes.includes(filterPurpose as Purpose)
    );
  }

  // Sort tactics
  filteredTactics.sort((a, b) => {
    if (sortBy === "priority") return b.priority - a.priority;
    if (sortBy === "budget") return b.annualBudget - a.annualBudget;
    if (sortBy === "reach") return b.annualReach - a.annualReach;
    return 0;
  });

  const snsOptions: SnsType[] = ["TikTok", "X", "Instagram", "YouTube", "TikTokShop", "Other"];
  const typeOptions: TacticType[] = ["Post", "Boost", "Other"];
  const purposeOptions: Purpose[] = ["認知", "話題化", "購入", "比較検討", "ブランディング"];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">施策数</p>
          <p className="text-2xl font-bold text-gray-900">{tacticsSummary.totalTactics}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">年間投資</p>
          <p className="text-2xl font-bold text-amber-600">{formatBudget(tacticsSummary.totalBudget)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">年間Reach</p>
          <p className="text-2xl font-bold text-purple-600">{formatReach(tacticsSummary.totalReach)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">高優先度施策</p>
          <p className="text-2xl font-bold text-red-500">{tacticsSummary.byPriority.high}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">合計投稿数</p>
          <p className="text-2xl font-bold text-sky-600">{formatPosts(tacticsSummary.totalPosts)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">合計フォロワー</p>
          <p className="text-2xl font-bold text-pink-600">{formatFollowers(tacticsSummary.totalFollowers)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">SNS:</span>
            <select
              value={filterSns}
              onChange={(e) => setFilterSns(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">すべて</option>
              {snsOptions.map((sns) => (
                <option key={sns} value={sns}>{sns}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">タイプ:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">すべて</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">目的:</span>
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">すべて</option>
              {purposeOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "priority" | "budget" | "reach")}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="priority">優先順位</option>
              <option value="budget">予算</option>
              <option value="reach">Reach</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 ml-auto">
            {filteredTactics.length}件表示
          </div>
        </div>
      </div>

      {/* Tactics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">施策名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">タイプ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SNS</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">目的</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 min-w-[200px]">役割・狙い</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">優先度</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">年間予算</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">年間Reach</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">投稿数</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">フォロワー計</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">平均フォロワー</th>
              </tr>
            </thead>
            <tbody>
              {filteredTactics.map((tactic) => (
                <TacticRow key={tactic.id} tactic={tactic} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <div className="flex flex-wrap gap-4">
          <span className="font-medium">優先度:</span>
          <span><span className="text-red-500">★★★★★</span> 最重要</span>
          <span><span className="text-orange-500">★★★★☆</span> 重要</span>
          <span><span className="text-yellow-500">★★★☆☆</span> 中程度</span>
          <span><span className="text-lime-500">★★☆☆☆</span> 補助</span>
        </div>
      </div>
    </div>
  );
}

// Tactic row component
function TacticRow({ tactic }: { tactic: TacticMaster }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900">{tactic.name}</div>
          <div className="text-xs text-gray-500">{tactic.shortName}</div>
        </td>
        <td className="px-4 py-3">
          <span
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: typeColors[tactic.type] }}
          >
            {tactic.type}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: snsColors[tactic.sns] }}
          >
            {tactic.sns}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {tactic.purposes.map((purpose) => (
              <span
                key={purpose}
                className="inline-block px-2 py-0.5 text-xs font-medium rounded"
                style={{
                  backgroundColor: `${purposeColors[purpose]}20`,
                  color: purposeColors[purpose],
                }}
              >
                {purpose}
              </span>
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600 text-xs">
          {tactic.roleDescription}
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className="text-sm"
            style={{ color: getPriorityColor(tactic.priority) }}
          >
            {getPriorityStars(tactic.priority)}
          </span>
        </td>
        <td className="px-4 py-3 text-right font-medium text-amber-600">
          {formatBudget(tactic.annualBudget)}
        </td>
        <td className="px-4 py-3 text-right font-medium text-purple-600">
          {formatReach(tactic.annualReach)}
        </td>
        <td className="px-4 py-3 text-right font-medium text-sky-600">
          {formatPosts(tactic.annualPosts)}
        </td>
        <td className="px-4 py-3 text-right font-medium text-pink-600">
          {formatFollowers(tactic.totalFollowers)}
        </td>
        <td className="px-4 py-3 text-right font-medium text-gray-600">
          {formatAvgFollowers(tactic.totalFollowers, tactic.creatorCount)}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={11} className="px-4 py-3">
            <div className="flex gap-6 text-xs">
              {tactic.kpi && (
                <div>
                  <span className="text-gray-500">KPI:</span>
                  <span className="ml-1 text-gray-700">{tactic.kpi}</span>
                </div>
              )}
              {tactic.note && (
                <div>
                  <span className="text-gray-500">備考:</span>
                  <span className="ml-1 text-gray-700">{tactic.note}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
