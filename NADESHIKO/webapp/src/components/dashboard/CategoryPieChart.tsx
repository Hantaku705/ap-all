"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface CategoryPieChartProps {
  ajpSales: number;
  rcpSales: number;
  ajpProfit: number;
  rcpProfit: number;
}

const COLORS = {
  AJP: "#3b82f6",
  RCP: "#f59e0b",
};

export default function CategoryPieChart({
  ajpSales,
  rcpSales,
  ajpProfit,
  rcpProfit,
}: CategoryPieChartProps) {
  const salesData = [
    { name: "AJP（自社）", value: ajpSales },
    { name: "RCP（外部）", value: rcpSales },
  ];

  const profitData = [
    { name: "AJP（自社）", value: ajpProfit },
    { name: "RCP（外部）", value: rcpProfit },
  ];

  const totalSales = ajpSales + rcpSales;
  const totalProfit = ajpProfit + rcpProfit;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">区分別比率</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* 売上 */}
        <div>
          <p className="text-xs text-gray-500 text-center mb-2">売上構成</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill={COLORS.AJP} />
                  <Cell fill={COLORS.RCP} />
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const v = value as number;
                    return [
                      `${formatCurrency(v)} (${formatPercentage((v / totalSales) * 100)})`,
                      "",
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS.AJP }}
              />
              <span>AJP</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS.RCP }}
              />
              <span>RCP</span>
            </div>
          </div>
        </div>

        {/* 粗利 */}
        <div>
          <p className="text-xs text-gray-500 text-center mb-2">粗利構成</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill={COLORS.AJP} />
                  <Cell fill={COLORS.RCP} />
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const v = value as number;
                    return [
                      `${formatCurrency(v)} (${formatPercentage((v / totalProfit) * 100)})`,
                      "",
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-center text-gray-500">
            AJP: 粗利率100% / RCP: 粗利率40%
          </div>
        </div>
      </div>
    </div>
  );
}
