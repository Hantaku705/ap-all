"use client"

import { useState, useCallback } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"
import {
  taglineData,
  priceCategoryColors,
  priceCategoryLabels,
  type ShampooTagline,
} from "@/data/tagline-data"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ShampooTagline }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-bold text-sm">{d.brand}</p>
      <p className="text-xs text-gray-500">{d.maker} / {d.priceCategory === "petit" ? "プチプラ" : d.priceCategory === "drugcos" ? "ドラコス" : "美容専売品"}</p>
      <p className="text-xs text-gray-500">約{d.price.toLocaleString()}円</p>
      {d.catchcopy && <p className="mt-1 text-xs text-gray-400">{d.catchcopy}</p>}
      <p className="mt-0.5 text-sm text-gray-800 italic">&ldquo;{d.tagline}&rdquo;</p>
    </div>
  )
}

type PriceFilter = "all" | "petit" | "drugcos" | "salon"

export default function PositioningMap() {
  const [filter, setFilter] = useState<PriceFilter>("all")

  const filtered = filter === "all" ? taglineData : taglineData.filter((d) => d.priceCategory === filter)

  const petitData = filtered.filter((d) => d.priceCategory === "petit")
  const drugcosData = filtered.filter((d) => d.priceCategory === "drugcos")
  const salonData = filtered.filter((d) => d.priceCategory === "salon")

  const renderDot = useCallback(
    (color: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any) => {
        const { cx, cy } = props
        return (
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={color}
            fillOpacity={0.8}
            stroke={color}
            strokeWidth={2}
            strokeOpacity={0.3}
          />
        )
      },
    []
  )

  const filters: { label: string; value: PriceFilter }[] = [
    { label: "すべて", value: "all" },
    { label: "プチプラ", value: "petit" },
    { label: "ドラコス", value: "drugcos" },
    { label: "美容専売品", value: "salon" },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-3 flex-wrap">
        {Object.entries(priceCategoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: priceCategoryColors[key] }}
            />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-5.5, 5.5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          >
            <Label value="← 機能訴求　　　　　　感性訴求 →" position="bottom" offset={10} style={{ fontSize: 13, fill: "#6b7280" }} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[-5.5, 5.5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          >
            <Label value="← 日常　　　　特別感 →" angle={-90} position="left" offset={10} style={{ fontSize: 13, fill: "#6b7280" }} />
          </YAxis>
          <ReferenceLine x={0} stroke="#d1d5db" />
          <ReferenceLine y={0} stroke="#d1d5db" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="プチプラ" data={petitData} shape={renderDot(priceCategoryColors.petit)} />
          <Scatter name="ドラコス" data={drugcosData} shape={renderDot(priceCategoryColors.drugcos)} />
          <Scatter name="美容専売品" data={salonData} shape={renderDot(priceCategoryColors.salon)} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
