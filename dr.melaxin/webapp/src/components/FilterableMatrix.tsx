"use client";

import { useState, useMemo } from "react";
import {
  annualBudgetMatrix,
  annualReachMatrix,
  filterOptions,
  formatBudget,
  formatReach,
  getSnsColor,
  purposeColors,
  type Purpose,
} from "@/data/matrix-data";

type ViewMode = "budget" | "reach" | "both";
type RowAxis = "all" | "sns" | "tactic" | "purpose";
type ColAxis = "all" | "month" | "quarter";

type DataFilter = {
  sns: string[];
  tactic: string[];
  purpose: string[];
};

// Quarter to months mapping
const quarterMonths: Record<string, string[]> = {
  Q1: ["2月", "3月"],
  Q2: ["4月", "5月", "6月"],
  Q3: ["7月", "8月", "9月"],
  Q4: ["10月", "11月", "12月"],
};

const quarters = ["Q1", "Q2", "Q3", "Q4"];

// Month mapping from Japanese to English keys
const monthMapping: Record<string, string> = {
  "2月": "feb",
  "3月": "mar",
  "4月": "apr",
  "5月": "may",
  "6月": "jun",
  "7月": "jul",
  "8月": "aug",
  "9月": "sep",
  "10月": "oct",
  "11月": "nov",
  "12月": "dec",
};

const months = ["2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

type MatrixDataRow = {
  tactic: string;
  sns: string;
  purpose?: Purpose[];
  data: Record<string, number>;
  total: number;
  kpi?: string;
};

// Aggregated row for pivot display
type PivotRow = {
  key: string;
  label: string;
  color?: string;
  values: Record<string, number>;
  total: number;
  // "all" mode specific fields
  sns?: string;
  tactic?: string;
  purposes?: Purpose[];
};

export default function FilterableMatrix() {
  const [viewMode, setViewMode] = useState<ViewMode>("budget");
  const [rowAxis, setRowAxis] = useState<RowAxis>("all");
  const [colAxis, setColAxis] = useState<ColAxis>("month");
  const [filters, setFilters] = useState<DataFilter>({
    sns: [],
    tactic: [],
    purpose: [],
  });

  const toggleFilter = (type: keyof DataFilter, value: string) => {
    setFilters((prev) => {
      const current = prev[type];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({ sns: [], tactic: [], purpose: [] });
  };

  // Combined columns for "all" mode: months + quarterly totals
  const allColumns = [
    "2月", "3月", "Q1計",
    "4月", "5月", "6月", "Q2計",
    "7月", "8月", "9月", "Q3計",
    "10月", "11月", "12月", "Q4計",
  ];

  // Get column headers based on colAxis
  const columnHeaders = useMemo(() => {
    if (colAxis === "all") return allColumns;
    return colAxis === "month" ? months : quarters;
  }, [colAxis]);

  // Filter raw data
  const filterData = (data: MatrixDataRow[]) => {
    return data.filter((row) => {
      if (filters.sns.length > 0 && !filters.sns.includes(row.sns)) return false;
      if (filters.tactic.length > 0 && !filters.tactic.includes(row.tactic)) return false;
      if (filters.purpose.length > 0) {
        const rowPurposes = row.purpose || [];
        if (!filters.purpose.some((p) => rowPurposes.includes(p as Purpose))) return false;
      }
      return true;
    });
  };

  const filteredBudgetData = useMemo(() => filterData(annualBudgetMatrix as MatrixDataRow[]), [filters]);
  const filteredReachData = useMemo(() => filterData(annualReachMatrix as MatrixDataRow[]), [filters]);

  // Get value for a specific month
  const getMonthValue = (row: MatrixDataRow, month: string): number => {
    const key = monthMapping[month];
    return row.data[key] || 0;
  };

  // Get value for a specific quarter
  const getQuarterValue = (row: MatrixDataRow, quarter: string): number => {
    const qMonths = quarterMonths[quarter];
    return qMonths.reduce((sum, m) => sum + getMonthValue(row, m), 0);
  };

  // Get value for a column (month, quarter, or Q*計)
  const getColValue = (row: MatrixDataRow, col: string): number => {
    // Handle Q1計, Q2計, Q3計, Q4計
    if (col.endsWith("計")) {
      const quarter = col.replace("計", "");
      return getQuarterValue(row, quarter);
    }
    // Handle regular months
    if (months.includes(col)) {
      return getMonthValue(row, col);
    }
    // Handle quarters (Q1, Q2, Q3, Q4)
    return getQuarterValue(row, col);
  };

  // Helper: aggregate data by a specific axis
  const aggregateByAxis = (axis: "sns" | "tactic" | "purpose", data: MatrixDataRow[]): PivotRow[] => {
    const grouped = new Map<string, { rows: MatrixDataRow[]; color?: string }>();

    data.forEach((row) => {
      let keys: string[] = [];
      let color: string | undefined;

      if (axis === "sns") {
        keys = [row.sns];
        color = getSnsColor(row.sns);
      } else if (axis === "tactic") {
        keys = [row.tactic];
        color = getSnsColor(row.sns);
      } else if (axis === "purpose") {
        keys = row.purpose || ["その他"];
      }

      keys.forEach((key) => {
        if (!grouped.has(key)) {
          grouped.set(key, { rows: [], color: axis === "purpose" ? purposeColors[key as Purpose] : color });
        }
        grouped.get(key)!.rows.push(row);
      });
    });

    const result: PivotRow[] = [];
    grouped.forEach((value, key) => {
      const values: Record<string, number> = {};
      let total = 0;

      columnHeaders.forEach((col) => {
        const colTotal = value.rows.reduce((sum, row) => sum + getColValue(row, col), 0);
        values[col] = colTotal;
        total += colTotal;
      });

      result.push({
        key,
        label: key,
        color: value.color,
        values,
        total,
      });
    });

    result.sort((a, b) => b.total - a.total);
    return result;
  };

  // Aggregate data by row axis
  const aggregateByRowAxis = (data: MatrixDataRow[]): PivotRow[] => {
    // "all" mode: show all individual rows with SNS/施策/目的 columns
    if (rowAxis === "all") {
      return data.map((row, idx) => {
        const values: Record<string, number> = {};
        let total = 0;

        columnHeaders.forEach((col) => {
          const colValue = getColValue(row, col);
          values[col] = colValue;
          total += colValue;
        });

        return {
          key: `${row.sns}-${row.tactic}-${idx}`,
          label: row.tactic,
          color: getSnsColor(row.sns),
          values,
          total,
          sns: row.sns,
          tactic: row.tactic,
          purposes: row.purpose,
        };
      }).sort((a, b) => b.total - a.total);
    }

    return aggregateByAxis(rowAxis, data);
  };

  const pivotBudgetData = useMemo(() => aggregateByRowAxis(filteredBudgetData), [filteredBudgetData, rowAxis, colAxis, columnHeaders]);
  const pivotReachData = useMemo(() => aggregateByRowAxis(filteredReachData), [filteredReachData, rowAxis, colAxis, columnHeaders]);

  // Calculate totals
  const calculateTotals = (pivotData: PivotRow[]) => {
    const totals: Record<string, number> = {};
    columnHeaders.forEach((col) => {
      totals[col] = pivotData.reduce((sum, row) => sum + row.values[col], 0);
    });
    totals.total = pivotData.reduce((sum, row) => sum + row.total, 0);
    return totals;
  };

  const budgetTotals = useMemo(() => calculateTotals(pivotBudgetData), [pivotBudgetData, columnHeaders]);
  const reachTotals = useMemo(() => calculateTotals(pivotReachData), [pivotReachData, columnHeaders]);

  // Calculate percentage
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Render cell value
  const renderCell = (value: number, type: "budget" | "reach") => {
    if (value === 0) return <span className="text-gray-300">-</span>;
    return type === "budget" ? formatBudget(value) : formatReach(value);
  };

  // Get row label display
  const getRowAxisLabel = (axis: RowAxis): string => {
    switch (axis) {
      case "all": return "SNS / 施策";
      case "sns": return "SNS";
      case "tactic": return "施策";
      case "purpose": return "目的";
    }
  };

  // Find matching reach row for budget row
  const findMatchingReachRow = (budgetKey: string): PivotRow | undefined => {
    return pivotReachData.find((r) => r.key === budgetKey);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Pivot Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">メディア投資マトリックス</h3>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(["budget", "reach", "both"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {mode === "budget" ? "予算" : mode === "reach" ? "Reach" : "両方"}
              </button>
            ))}
          </div>
        </div>

        {/* Pivot Axis Controls */}
        <div className="flex items-center gap-6 flex-wrap">
          {/* Row Axis */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">行:</span>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(["all", "sns", "tactic", "purpose"] as RowAxis[]).map((axis) => (
                <button
                  key={axis}
                  onClick={() => setRowAxis(axis)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    rowAxis === axis
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {axis === "all" ? "全て" : getRowAxisLabel(axis)}
                </button>
              ))}
            </div>
          </div>

          {/* Column Axis */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">列:</span>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(["all", "month", "quarter"] as ColAxis[]).map((axis) => (
                <button
                  key={axis}
                  onClick={() => setColAxis(axis)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    colAxis === axis
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {axis === "all" ? "全て" : axis === "month" ? "月" : "四半期"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">フィルター</span>
            {(filters.sns.length > 0 || filters.tactic.length > 0 || filters.purpose.length > 0) && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {filters.sns.length + filters.tactic.length + filters.purpose.length}件選択中
              </span>
            )}
          </div>

          {/* SNS Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">SNS:</span>
            <div className="flex flex-wrap gap-1">
              {filterOptions.sns.map((sns) => {
                const isActive = filters.sns.includes(sns);
                const color = getSnsColor(sns);
                return (
                  <button
                    key={sns}
                    onClick={() => toggleFilter("sns", sns)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors border ${
                      isActive
                        ? "font-medium border-transparent"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                    style={isActive ? { backgroundColor: color, color: "white" } : undefined}
                  >
                    {isActive && "✓ "}{sns}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Purpose Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">目的:</span>
            <div className="flex flex-wrap gap-1">
              {filterOptions.purpose.map((purpose) => {
                const isActive = filters.purpose.includes(purpose);
                const color = purposeColors[purpose as Purpose] || "#888";
                return (
                  <button
                    key={purpose}
                    onClick={() => toggleFilter("purpose", purpose)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors border ${
                      isActive
                        ? "font-medium border-transparent"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                    style={isActive ? { backgroundColor: color, color: "white" } : undefined}
                  >
                    {isActive && "✓ "}{purpose}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactic Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">施策:</span>
            <div className="flex flex-wrap gap-1">
              {filterOptions.tactic.map((tactic) => {
                const isActive = filters.tactic.includes(tactic);
                return (
                  <button
                    key={tactic}
                    onClick={() => toggleFilter("tactic", tactic)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors border ${
                      isActive
                        ? "bg-indigo-500 text-white font-medium border-transparent"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {isActive && "✓ "}{tactic}
                  </button>
                );
              })}
            </div>
          </div>

          {(filters.sns.length > 0 || filters.tactic.length > 0 || filters.purpose.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded font-medium"
            >
              × クリア
            </button>
          )}
        </div>
      </div>

      {/* Pivot Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {rowAxis === "all" ? (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 min-w-[80px]">SNS</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 min-w-[140px]">施策</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 min-w-[120px]">目的</th>
                </>
              ) : (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 min-w-[120px]">
                  {getRowAxisLabel(rowAxis)}
                </th>
              )}
              {columnHeaders.map((col) => (
                <th key={col} className="px-2 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap min-w-[70px]">
                  {col}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 bg-gray-100 min-w-[90px]">計</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 min-w-[50px]">%</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === "budget" && pivotBudgetData.map((row) => (
              <tr key={row.key} className="border-t border-gray-100 hover:bg-gray-50">
                {rowAxis === "all" ? (
                  <>
                    <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: row.color }}>
                      {row.sns}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.tactic}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {row.purposes?.map((p) => (
                          <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${purposeColors[p]}20`, color: purposeColors[p] }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: row.color }}>
                    {row.label}
                  </td>
                )}
                {columnHeaders.map((col) => (
                  <td key={col} className="px-2 py-2 text-right text-gray-700 tabular-nums">
                    {renderCell(row.values[col], "budget")}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium text-amber-600 bg-gray-50 tabular-nums">
                  {formatBudget(row.total)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500 tabular-nums">
                  {calculatePercentage(row.total, budgetTotals.total)}
                </td>
              </tr>
            ))}

            {viewMode === "reach" && pivotReachData.map((row) => (
              <tr key={row.key} className="border-t border-gray-100 hover:bg-gray-50">
                {rowAxis === "all" ? (
                  <>
                    <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: row.color }}>
                      {row.sns}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.tactic}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {row.purposes?.map((p) => (
                          <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${purposeColors[p]}20`, color: purposeColors[p] }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: row.color }}>
                    {row.label}
                  </td>
                )}
                {columnHeaders.map((col) => (
                  <td key={col} className="px-2 py-2 text-right text-gray-700 tabular-nums">
                    {renderCell(row.values[col], "reach")}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium text-purple-600 bg-gray-50 tabular-nums">
                  {formatReach(row.total)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500 tabular-nums">
                  {calculatePercentage(row.total, reachTotals.total)}
                </td>
              </tr>
            ))}

            {viewMode === "both" && pivotBudgetData.map((budgetRow) => {
              const reachRow = findMatchingReachRow(budgetRow.key);
              return (
                <tr key={budgetRow.key} className="border-t border-gray-100 hover:bg-gray-50">
                  {rowAxis === "all" ? (
                    <>
                      <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: budgetRow.color }}>
                        {budgetRow.sns}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{budgetRow.tactic}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {budgetRow.purposes?.map((p) => (
                            <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${purposeColors[p]}20`, color: purposeColors[p] }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-2 sticky left-0 bg-white font-medium" style={{ color: budgetRow.color }}>
                      {budgetRow.label}
                    </td>
                  )}
                  {columnHeaders.map((col) => (
                    <td key={col} className="px-2 py-2 text-right tabular-nums">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-amber-600">
                          {budgetRow.values[col] > 0 ? formatBudget(budgetRow.values[col]) : "-"}
                        </span>
                        <span className="text-purple-600 text-xs">
                          {reachRow && reachRow.values[col] > 0 ? formatReach(reachRow.values[col]) : "-"}
                        </span>
                      </div>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium bg-gray-50 tabular-nums">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-amber-600">{formatBudget(budgetRow.total)}</span>
                      <span className="text-purple-600 text-xs">
                        {reachRow ? formatReach(reachRow.total) : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500 tabular-nums">
                    {calculatePercentage(budgetRow.total, budgetTotals.total)}
                  </td>
                </tr>
              );
            })}

            {/* Totals row */}
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-medium">
              {rowAxis === "all" ? (
                <td colSpan={3} className="px-3 py-2 sticky left-0 bg-gray-100">合計</td>
              ) : (
                <td className="px-3 py-2 sticky left-0 bg-gray-100">合計</td>
              )}
              {columnHeaders.map((col) => (
                <td key={col} className="px-2 py-2 text-right tabular-nums">
                  {viewMode === "both" ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-amber-600">{formatBudget(budgetTotals[col])}</span>
                      <span className="text-purple-600 text-xs">{formatReach(reachTotals[col])}</span>
                    </div>
                  ) : viewMode === "budget" ? (
                    <span className="text-gray-900">{formatBudget(budgetTotals[col])}</span>
                  ) : (
                    <span className="text-gray-900">{formatReach(reachTotals[col])}</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-right bg-gray-200 tabular-nums">
                {viewMode === "both" ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-amber-600">{formatBudget(budgetTotals.total)}</span>
                    <span className="text-purple-600 text-xs">{formatReach(reachTotals.total)}</span>
                  </div>
                ) : viewMode === "budget" ? (
                  <span className="text-gray-900">{formatBudget(budgetTotals.total)}</span>
                ) : (
                  <span className="text-gray-900">{formatReach(reachTotals.total)}</span>
                )}
              </td>
              <td className="px-3 py-2 text-right text-gray-500 tabular-nums">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {pivotBudgetData.length}件{rowAxis === "all" ? "の施策" : `の${getRowAxisLabel(rowAxis)}`}を表示中
          </span>
          <div className="flex gap-4">
            <span className="text-gray-700">
              予算合計: <strong className="text-amber-600">{formatBudget(budgetTotals.total)}</strong>
            </span>
            <span className="text-gray-700">
              Reach合計: <strong className="text-purple-600">{formatReach(reachTotals.total)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
