"use client";

import { useMemo, useState } from "react";
import { useEdit } from "@/contexts/EditContext";
import { formatCurrency } from "@/lib/formatters";
import { monthOptions, categoryOptions, statusOptions, statusColors } from "@/data/constants";
import { Deal, Category, DealStatus } from "@/types/deal";

type SortField = "month" | "manager" | "client" | "projectName" | "accountName" | "category" | "sales" | "grossProfit" | "status";

export default function DealsContent() {
  const { deals, targets, selectedMonth, setSelectedMonth, isEditMode, updateDeal, deleteDeal, addDeal } = useEdit();

  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DealStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortField>("sales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAddForm, setShowAddForm] = useState(false);

  // フィルター・ソート済みの案件
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // 月フィルター
    if (selectedMonth !== "all") {
      result = result.filter((d) => d.month === selectedMonth);
    }

    // カテゴリフィルター
    if (filterCategory !== "all") {
      result = result.filter((d) => d.category === filterCategory);
    }

    // ステータスフィルター
    if (filterStatus !== "all") {
      result = result.filter((d) => d.status === filterStatus);
    }

    // ソート
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "sales":
          comparison = a.sales - b.sales;
          break;
        case "grossProfit":
          comparison = a.grossProfit - b.grossProfit;
          break;
        case "manager":
          comparison = a.manager.localeCompare(b.manager);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [deals, selectedMonth, filterCategory, filterStatus, sortBy, sortOrder]);

  // サマリー
  const summary = useMemo(() => {
    const totalSales = filteredDeals.reduce((sum, d) => sum + d.sales, 0);
    const totalProfit = filteredDeals.reduce((sum, d) => sum + d.grossProfit, 0);
    return { totalSales, totalProfit, count: filteredDeals.length };
  }, [filteredDeals]);

  const handleSort = (field: "sales" | "grossProfit" | "manager") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("この案件を削除しますか？")) {
      deleteDeal(id);
    }
  };

  const handleStatusChange = (id: string, status: DealStatus) => {
    updateDeal(id, { status });
  };

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">月:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">全期間</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">区分:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">すべて</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">ステータス:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DealStatus | "all")}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">すべて</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {isEditMode && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-1.5 text-sm font-medium bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            + 新規追加
          </button>
        )}
      </div>

      {/* サマリー */}
      <div className="flex gap-4 text-sm">
        <span className="text-gray-600">
          {summary.count}件 / 売上: <span className="font-medium text-gray-900">{formatCurrency(summary.totalSales)}</span>
        </span>
        <span className="text-gray-600">
          粗利: <span className="font-medium text-green-600">{formatCurrency(summary.totalProfit)}</span>
        </span>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-600">月</th>
                <th
                  className="px-3 py-2 text-left text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("manager")}
                >
                  担当者 {sortBy === "manager" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2 text-left text-gray-600">クライアント</th>
                <th className="px-3 py-2 text-left text-gray-600">案件名</th>
                <th className="px-3 py-2 text-left text-gray-600">アカウント</th>
                <th className="px-3 py-2 text-center text-gray-600">区分</th>
                <th
                  className="px-3 py-2 text-right text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sales")}
                >
                  売上 {sortBy === "sales" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-3 py-2 text-right text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("grossProfit")}
                >
                  粗利 {sortBy === "grossProfit" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2 text-center text-gray-600">ステータス</th>
                {isEditMode && <th className="px-3 py-2 text-center text-gray-600">操作</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {deal.month.split("-")[1]}月
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                    {deal.manager || "（未設定）"}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-32 truncate">
                    {deal.client}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-32 truncate">
                    {deal.projectName}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-24 truncate">
                    {deal.accountName || "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        deal.category === "AJP"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {deal.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900 font-medium whitespace-nowrap">
                    {formatCurrency(deal.sales)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-600 whitespace-nowrap">
                    {formatCurrency(deal.grossProfit)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isEditMode ? (
                      <select
                        value={deal.status}
                        onChange={(e) => handleStatusChange(deal.id, e.target.value as DealStatus)}
                        className="px-2 py-0.5 text-xs border border-gray-300 rounded"
                        style={{ color: statusColors[deal.status] }}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${statusColors[deal.status]}20`,
                          color: statusColors[deal.status],
                        }}
                      >
                        {deal.status}
                      </span>
                    )}
                  </td>
                  {isEditMode && (
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        削除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新規追加フォーム（モーダル） */}
      {showAddForm && (
        <AddDealModal
          onClose={() => setShowAddForm(false)}
          onAdd={(data) => {
            addDeal(data);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}

// 新規追加モーダル
function AddDealModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'grossProfit' | 'paymentCost60'>) => void;
}) {
  const [formData, setFormData] = useState({
    month: "2026-01",
    manager: "",
    client: "",
    projectName: "",
    accountName: "",
    category: "AJP" as Category,
    taxType: "課税" as "課税" | "非課税",
    description: "TT投稿費用",
    sales: 0,
    cost: 0,
    adCost: 0,
    status: "進行中" as DealStatus,
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">新規案件追加</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">月</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">区分</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">担当者</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Song Rie"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">クライアント</label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">案件名</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">アカウント名</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="突撃ちゃん"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">売上</label>
              <input
                type="number"
                value={formData.sales}
                onChange={(e) => setFormData({ ...formData, sales: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">費用（RCPのみ）</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={formData.category === "AJP"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">備考</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
