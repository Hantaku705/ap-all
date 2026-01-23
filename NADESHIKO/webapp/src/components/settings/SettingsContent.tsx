"use client";

import { useState } from "react";
import { useEdit } from "@/contexts/EditContext";
import { formatCurrency } from "@/lib/formatters";
import { monthOptions } from "@/data/constants";

export default function SettingsContent() {
  const { targets, updateTarget, deals, isEditMode } = useEdit();
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEdit = (month: string) => {
    const target = targets.find((t) => t.month === month);
    setEditingMonth(month);
    setEditValue(target?.target || 0);
  };

  const handleSave = () => {
    if (editingMonth) {
      updateTarget(editingMonth, editValue);
      setEditingMonth(null);
    }
  };

  const handleCancel = () => {
    setEditingMonth(null);
  };

  // CSVエクスポート
  const handleExport = () => {
    const headers = [
      "月",
      "担当者",
      "クライアント",
      "案件名",
      "アカウント名",
      "区分",
      "税区分",
      "摘要",
      "売上",
      "費用",
      "支払費用60%",
      "広告費",
      "粗利",
      "ステータス",
      "備考",
    ];

    const rows = deals.map((d) => [
      d.month,
      d.manager,
      d.client,
      d.projectName,
      d.accountName,
      d.category,
      d.taxType,
      d.description,
      d.sales,
      d.cost,
      d.paymentCost60,
      d.adCost,
      d.grossProfit,
      d.status,
      d.note,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nadeshiko_deals_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 月別目標設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">月別目標設定</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left text-gray-600">月</th>
                <th className="px-3 py-2 text-right text-gray-600">目標金額</th>
                {isEditMode && <th className="px-3 py-2 text-center text-gray-600">操作</th>}
              </tr>
            </thead>
            <tbody>
              {monthOptions.map((opt) => {
                const target = targets.find((t) => t.month === opt.value);
                const isEditing = editingMonth === opt.value;

                return (
                  <tr key={opt.value} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900">{opt.label}</td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-right"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">
                          {target?.target ? formatCurrency(target.target) : "-"}
                        </span>
                      )}
                    </td>
                    {isEditMode && (
                      <td className="px-3 py-2 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-700 text-xs"
                            >
                              保存
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(opt.value)}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            編集
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* データエクスポート */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">データエクスポート</h3>
        <p className="text-sm text-gray-600 mb-4">
          現在のデータをCSV形式でエクスポートします。
        </p>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900"
        >
          CSVをダウンロード
        </button>
      </div>

      {/* データ概要 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">データ概要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">総案件数</p>
            <p className="text-lg font-medium">{deals.length}件</p>
          </div>
          <div>
            <p className="text-gray-500">AJP案件</p>
            <p className="text-lg font-medium text-blue-600">
              {deals.filter((d) => d.category === "AJP").length}件
            </p>
          </div>
          <div>
            <p className="text-gray-500">RCP案件</p>
            <p className="text-lg font-medium text-amber-600">
              {deals.filter((d) => d.category === "RCP").length}件
            </p>
          </div>
          <div>
            <p className="text-gray-500">完了案件</p>
            <p className="text-lg font-medium text-green-600">
              {deals.filter((d) => d.status === "投稿完了").length}件
            </p>
          </div>
        </div>
      </div>

      {/* 粗利計算ロジック説明 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">粗利計算ロジック</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium text-blue-600">AJP（自社）:</span> 粗利 = 売上（粗利率100%）
          </p>
          <p>
            <span className="font-medium text-amber-600">RCP（外部）:</span> 粗利 = 売上 - 支払費用60%（粗利率約40%）
          </p>
        </div>
      </div>
    </div>
  );
}
