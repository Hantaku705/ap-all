"use client";

import {
  TrendingUp,
  TrendingDown,
  Coins,
  ShoppingBag,
  MousePointerClick,
  Package,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardStats, notifications, orders } from "@/data/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            こんにちは、田中さん！今日も頑張りましょう。
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-lg bg-white p-2 shadow-sm hover:bg-gray-50">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b6b] text-xs text-white">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Coins}
          title="累計コミッション"
          value={`¥${dashboardStats.totalCommission.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          color="bg-[#ff6b6b]"
        />
        <StatCard
          icon={ShoppingBag}
          title="累計売上"
          value={`¥${dashboardStats.totalSales.toLocaleString()}`}
          change="+8.2%"
          trend="up"
          color="bg-[#ffd93d]"
        />
        <StatCard
          icon={MousePointerClick}
          title="総クリック数"
          value={dashboardStats.totalClicks.toLocaleString()}
          change="+15.3%"
          trend="up"
          color="bg-[#4ade80]"
        />
        <StatCard
          icon={Package}
          title="承認済み商品"
          value={dashboardStats.approvedProducts.toString()}
          change="+2"
          trend="up"
          color="bg-[#60a5fa]"
        />
      </div>

      {/* Chart & Notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">月別推移</h2>
            <select className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
              <option>過去5ヶ月</option>
              <option>過去12ヶ月</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardStats.monthlyTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCommission"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
                <Tooltip
                  formatter={(value) => `¥${(value as number).toLocaleString()}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#ff6b6b"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                  name="売上"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="#4ade80"
                  fill="url(#colorCommission)"
                  strokeWidth={2}
                  name="コミッション"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">通知</h2>
            <Link
              href="/notifications"
              className="text-sm font-medium text-[#ff6b6b] hover:text-[#ee5a5a]"
            >
              すべて見る
            </Link>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-3 ${
                  notification.read
                    ? "border-gray-100 bg-white"
                    : "border-[#ff6b6b]/20 bg-[#ff6b6b]/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      notification.type === "success"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {notification.type === "success" ? (
                      <Coins className="h-4 w-4 text-green-600" />
                    ) : (
                      <Bell className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の注文</h2>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-sm font-medium text-[#ff6b6b] hover:text-[#ee5a5a]"
          >
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                  商品
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                  注文金額
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                  コミッション
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                  ステータス
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                  日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.product?.imageUrl}
                        alt={order.product?.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {order.product?.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    ¥{order.orderAmount.toLocaleString()}
                  </td>
                  <td className="py-4 text-sm font-medium text-[#ff6b6b]">
                    +¥{order.commissionAmount.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "completed" ? "完了" : "処理中"}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    {new Date(order.orderedAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          title="商品を探す"
          description="500以上の商品から選択"
          href="/products"
          color="bg-[#ff6b6b]"
        />
        <QuickAction
          title="コミッションを確認"
          description="報酬の詳細を確認"
          href="/commissions"
          color="bg-[#4ade80]"
        />
        <QuickAction
          title="ヘルプセンター"
          description="使い方やFAQを確認"
          href="/guide"
          color="bg-[#60a5fa]"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{title}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
        <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
