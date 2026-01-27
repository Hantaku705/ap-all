"use client";

export function WorldNewsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex items-center gap-4">
            <div className="w-48 h-48 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b flex p-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
