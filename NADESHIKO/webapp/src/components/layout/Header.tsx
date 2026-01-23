"use client";

import { useEdit } from "@/contexts/EditContext";

export default function Header() {
  const { isDev } = useEdit();

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
          {isDev && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
              DEV
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
