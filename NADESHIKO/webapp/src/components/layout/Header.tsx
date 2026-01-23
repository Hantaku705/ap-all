"use client";

import { useEdit } from "@/contexts/EditContext";

export default function Header() {
  const { isEditMode, setEditMode, isDirty, isSaving, saveChanges, isDev } = useEdit();

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      alert("保存しました");
    } else {
      alert("保存に失敗しました");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded">
                NADESHIKO
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 rounded">
                2024年10月期
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              売上管理ダッシュボード
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-sm text-amber-600">
                未保存の変更があります
              </span>
            )}
            {isEditMode && (
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isSaving || !isDirty
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
              >
                {isSaving ? "保存中..." : "保存"}
              </button>
            )}
            <button
              onClick={() => setEditMode(!isEditMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isEditMode
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isEditMode ? "編集モード ON" : "編集モード OFF"}
            </button>
            {isDev && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                DEV
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
