"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { orders } from "@/data/mock-data";

type StatusFilter = "all" | "completed" | "pending" | "cancelled";
type PeriodFilter = "all" | "7days" | "30days" | "90days";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    // ステータスフィルター
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !order.product?.name.toLowerCase().includes(query) &&
        !order.id.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // 期間フィルター
    if (periodFilter !== "all") {
      const orderDate = new Date(order.orderedAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      if (periodFilter === "7days" && diffDays > 7) return false;
      if (periodFilter === "30days" && diffDays > 30) return false;
      if (periodFilter === "90days" && diffDays > 90) return false;
    }

    return true;
  });

  const totalCommission = filteredOrders.reduce(
    (sum, order) => sum + order.commissionAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">注文履歴</h1>
          <p className="mt-1 text-sm text-gray-500">
            アフィリエイト経由の注文一覧と獲得コミッション
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          CSVダウンロード
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">表示中の注文数</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {filteredOrders.length}件
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">表示中の売上合計</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            ¥{filteredOrders.reduce((sum, o) => sum + o.orderAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">表示中のコミッション合計</p>
          <p className="mt-1 text-2xl font-bold text-[#ff6b6b]">
            ¥{totalCommission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="注文ID・商品名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
            />
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none"
            >
              <option value="all">全期間</option>
              <option value="7days">過去7日</option>
              <option value="30days">過去30日</option>
              <option value="90days">過去90日</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1">
              {(["all", "completed", "pending"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    statusFilter === status
                      ? "bg-[#ff6b6b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" && "すべて"}
                  {status === "completed" && "完了"}
                  {status === "pending" && "処理中"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  注文ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  商品
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  注文金額
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  コミッション
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  ステータス
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                  注文日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    該当する注文がありません
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        #{order.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.product?.imageUrl}
                          alt={order.product?.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.product?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.product?.brandName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ¥{order.orderAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#ff6b6b]">
                        +¥{order.commissionAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status === "completed" && "完了"}
                        {order.status === "pending" && "処理中"}
                        {order.status === "cancelled" && "キャンセル"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.orderedAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            全{filteredOrders.length}件中 1-{filteredOrders.length}件を表示
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </button>
            <button
              disabled
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
