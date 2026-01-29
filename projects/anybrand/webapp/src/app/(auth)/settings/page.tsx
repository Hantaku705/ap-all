"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Camera,
  Save,
  ExternalLink,
  Check,
} from "lucide-react";

type Tab = "profile" | "bank" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "田中 美咲",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
    tiktokUsername: "@misaka_beauty",
    tiktokFollowers: 125000,
    instagramUsername: "@misaka.beauty",
    youtubeChannel: "",
  });

  // Bank state
  const [bank, setBank] = useState({
    bankName: "三菱UFJ銀行",
    branchName: "渋谷支店",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "タナカ ミサキ",
    verified: true,
  });

  // Notification state
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderApproved: true,
    payoutComplete: true,
    monthlyReport: true,
    newProducts: false,
    promotions: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 1000);
  };

  const tabs = [
    { id: "profile" as Tab, label: "プロフィール", icon: User },
    { id: "bank" as Tab, label: "銀行口座", icon: Building2 },
    { id: "notifications" as Tab, label: "通知設定", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウント情報と各種設定の管理
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-[#ff6b6b] text-[#ff6b6b]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b] text-white shadow-lg hover:bg-[#ee5a5a]">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.tiktokUsername}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h4 className="mb-4 font-medium text-gray-900">基本情報</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    名前
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                  />
                </div>
              </div>
            </div>

            {/* Social Accounts */}
            <div>
              <h4 className="mb-4 font-medium text-gray-900">SNSアカウント連携</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TikTok
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={profile.tiktokUsername}
                      onChange={(e) =>
                        setProfile({ ...profile, tiktokUsername: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    />
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      連携済み
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    フォロワー: {profile.tiktokFollowers.toLocaleString()}人
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={profile.instagramUsername}
                    onChange={(e) =>
                      setProfile({ ...profile, instagramUsername: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={profile.youtubeChannel}
                    onChange={(e) =>
                      setProfile({ ...profile, youtubeChannel: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                    placeholder="チャンネルURL"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Tab */}
        {activeTab === "bank" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">本人確認完了</p>
                  <p className="text-sm text-blue-700">
                    口座情報は確認済みです。変更する場合は再度確認が必要です。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  銀行名
                </label>
                <select
                  value={bank.bankName}
                  onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none"
                >
                  <option>三菱UFJ銀行</option>
                  <option>三井住友銀行</option>
                  <option>みずほ銀行</option>
                  <option>りそな銀行</option>
                  <option>楽天銀行</option>
                  <option>PayPay銀行</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  支店名
                </label>
                <input
                  type="text"
                  value={bank.branchName}
                  onChange={(e) =>
                    setBank({ ...bank, branchName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  口座種別
                </label>
                <select
                  value={bank.accountType}
                  onChange={(e) =>
                    setBank({ ...bank, accountType: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none"
                >
                  <option>普通</option>
                  <option>当座</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  口座番号
                </label>
                <input
                  type="text"
                  value={bank.accountNumber}
                  onChange={(e) =>
                    setBank({ ...bank, accountNumber: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  口座名義（カタカナ）
                </label>
                <input
                  type="text"
                  value={bank.accountHolder}
                  onChange={(e) =>
                    setBank({ ...bank, accountHolder: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h4 className="mb-4 font-medium text-gray-900">メール通知</h4>
              <div className="space-y-4">
                <ToggleItem
                  label="新規注文通知"
                  description="アフィリエイト経由で注文があった時"
                  checked={notifications.newOrder}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, newOrder: checked })
                  }
                />
                <ToggleItem
                  label="注文承認通知"
                  description="注文のコミッションが確定した時"
                  checked={notifications.orderApproved}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, orderApproved: checked })
                  }
                />
                <ToggleItem
                  label="振込完了通知"
                  description="コミッションが振り込まれた時"
                  checked={notifications.payoutComplete}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, payoutComplete: checked })
                  }
                />
                <ToggleItem
                  label="月次レポート"
                  description="毎月の実績レポートを受け取る"
                  checked={notifications.monthlyReport}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, monthlyReport: checked })
                  }
                />
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-medium text-gray-900">その他の通知</h4>
              <div className="space-y-4">
                <ToggleItem
                  label="新商品のお知らせ"
                  description="新しい商品が追加された時"
                  checked={notifications.newProducts}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, newProducts: checked })
                  }
                />
                <ToggleItem
                  label="プロモーション情報"
                  description="キャンペーンや特別オファーのお知らせ"
                  checked={notifications.promotions}
                  onChange={(checked) =>
                    setNotifications({ ...notifications, promotions: checked })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
          {showSaved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              保存しました
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#ff6b6b] px-6 py-2 text-sm font-medium text-white hover:bg-[#ee5a5a] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="font-medium text-red-900">アカウント削除</h3>
        <p className="mt-1 text-sm text-red-700">
          アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </p>
        <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
          アカウントを削除
        </button>
      </div>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-[#ff6b6b]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
