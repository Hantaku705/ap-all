"use client";

import { useState } from "react";
import {
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardStats, commissionPayouts, orders } from "@/data/mock-data";

export default function CommissionsPage() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // 統計計算
  const totalPaid = commissionPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = commissionPayouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonthCommission = orders.reduce(
    (sum, o) => sum + o.commissionAmount,
    0
  );

  const handleRequestPayout = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setShowRequestModal(false);
      alert("振込申請を受け付けました。15日以内に振込されます。");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">コミッション</h1>
          <p className="mt-1 text-sm text-gray-500">
            獲得コミッションの確認と振込申請
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#ee5a5a]"
        >
          <Wallet className="h-4 w-4" />
          振込申請
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Coins}
          title="累計コミッション"
          value={`¥${dashboardStats.totalCommission.toLocaleString()}`}
          color="bg-[#ff6b6b]"
        />
        <StatCard
          icon={TrendingUp}
          title="今月の見込み"
          value={`¥${currentMonthCommission.toLocaleString()}`}
          color="bg-[#4ade80]"
        />
        <StatCard
          icon={Clock}
          title="振込待ち"
          value={`¥${totalPending.toLocaleString()}`}
          color="bg-[#ffd93d]"
        />
        <StatCard
          icon={CheckCircle}
          title="振込済み"
          value={`¥${totalPaid.toLocaleString()}`}
          color="bg-[#60a5fa]"
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">月別推移</h2>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <Download className="h-4 w-4" />
            レポート出力
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardStats.monthlyTrend}>
              <defs>
                <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value) => [
                  `¥${(value as number).toLocaleString()}`,
                  "コミッション",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="commission"
                stroke="#ff6b6b"
                fill="url(#colorCommission)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commission Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payout History */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">振込履歴</h2>
          <div className="space-y-4">
            {commissionPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    ¥{payout.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payout.requestedAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    申請
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    payout.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : payout.status === "processing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payout.status === "paid" && "振込済み"}
                  {payout.status === "processing" && "処理中"}
                  {payout.status === "pending" && "申請中"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            今月のコミッション内訳
          </h2>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
              >
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
                      売上 ¥{order.orderAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="font-medium text-[#ff6b6b]">
                  +¥{order.commissionAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Commission Rules */}
      <div className="rounded-xl bg-gradient-to-r from-[#ff6b6b]/10 to-[#ffd93d]/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900">コミッション体系</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4">
            <p className="text-2xl font-bold text-[#ff6b6b]">15-30%</p>
            <p className="mt-1 text-sm text-gray-600">商品別コミッション率</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-2xl font-bold text-[#ff6b6b]">¥5,000</p>
            <p className="mt-1 text-sm text-gray-600">最低振込額</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-2xl font-bold text-[#ff6b6b]">毎月15日</p>
            <p className="mt-1 text-sm text-gray-600">振込日</p>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">振込申請</h3>
            <p className="mt-2 text-sm text-gray-500">
              現在の振込可能額: ¥{dashboardStats.pendingCommission.toLocaleString()}
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  振込先口座
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  三菱UFJ銀行 渋谷支店 普通 1234567
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  振込予定日
                </label>
                <p className="mt-1 text-sm text-gray-900">2025年2月15日（土）</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={isRequesting}
                className="flex-1 rounded-lg bg-[#ff6b6b] py-2 text-sm font-medium text-white hover:bg-[#ee5a5a] disabled:opacity-50"
              >
                {isRequesting ? "申請中..." : "申請する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{title}</p>
    </div>
  );
}
