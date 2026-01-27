"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle, AlertCircle } from "lucide-react";
import type { GoogleTrendsRow, GoogleTrendsResponse } from "@/types/data.types";
import { BRAND_COLORS } from "@/lib/utils/colors";

export function GoogleTrendsTable() {
  const [data, setData] = useState<GoogleTrendsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const limit = 50;

  const brands = [
    "ほんだし",
    "クックドゥ",
    "味の素",
    "丸鶏がらスープ",
    "香味ペースト",
    "コンソメ",
    "ピュアセレクト",
    "アジシオ",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });
        const res = await fetch(`/api/data/google-trends?${params}`);
        if (!res.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const json: GoogleTrendsResponse = await res.json();
        setData(json.data);
        setTotal(json.total);
      } catch (err) {
        console.error("Failed to fetch Google Trends data:", err);
        setError("データの読み込みに失敗しました。再読み込みしてください。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, sortBy, sortOrder]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const handleExportCSV = () => {
    try {
      const headers = ["date", ...brands];
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          [row.date, ...brands.map((b) => row[b as keyof GoogleTrendsRow])].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `google-trends-page${page}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setToast({ message: "CSVをダウンロードしました", type: "success" });
    } catch {
      setToast({ message: "CSVのダウンロードに失敗しました", type: "error" });
    }
  };

  return (
    <Card className="relative">
      {/* Toast notification */}
      {toast && (
        <div
          className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Google Trends 生データ</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            全 {total} 件
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV出力
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              再読み込み
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th
                      className="px-3 py-2 text-left cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        日付
                        <ArrowUpDown className="h-3 w-3" />
                        {sortBy === "date" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    {brands.map((brand) => (
                      <th
                        key={brand}
                        className="px-3 py-2 text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(brand)}
                        style={{
                          borderBottom: `3px solid ${BRAND_COLORS[brand as keyof typeof BRAND_COLORS] || "#666"}`,
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {brand}
                          {sortBy === brand && (
                            <span className="text-xs">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={row.date}
                      className={idx % 2 === 0 ? "bg-muted/20" : ""}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{row.date}</td>
                      {brands.map((brand) => (
                        <td
                          key={brand}
                          className="px-3 py-2 text-right font-mono"
                        >
                          {row[brand as keyof GoogleTrendsRow]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total} 件
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
