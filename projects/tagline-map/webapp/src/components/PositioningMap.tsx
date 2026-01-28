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
import type { TaglineData, CategoryConfig } from "@/data/types"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TaglineData }>
  priceCategories: CategoryConfig["priceCategories"]
}

function CustomTooltip({ active, payload, priceCategories }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const categoryLabel = priceCategories.find((p) => p.key === d.priceCategory)?.label || d.priceCategory
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-bold text-sm">{d.brand}</p>
      <p className="text-xs text-gray-500">{d.maker} / {categoryLabel}</p>
      <p className="text-xs text-gray-500">約{d.price.toLocaleString()}円</p>
      {d.catchcopy && <p className="mt-1 text-xs text-gray-400">{d.catchcopy}</p>}
      <p className="mt-0.5 text-sm text-gray-800 italic">&ldquo;{d.tagline}&rdquo;</p>
    </div>
  )
}

interface PositioningMapProps {
  data: TaglineData[]
  config: CategoryConfig
}

export default function PositioningMap({ data, config }: PositioningMapProps) {
  const [filter, setFilter] = useState<string>("all")

  const filtered = filter === "all" ? data : data.filter((d) => d.priceCategory === filter)

  const groupedData = config.priceCategories.map((pc) => ({
    ...pc,
    data: filtered.filter((d) => d.priceCategory === pc.key),
  }))

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

  const filters = [
    { label: "すべて", value: "all" },
    ...config.priceCategories.map((pc) => ({ label: pc.label.split(" ")[0], value: pc.key })),
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
        {config.priceCategories.map((pc) => (
          <div key={pc.key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pc.color }} />
            <span className="text-xs text-gray-600">{pc.label}</span>
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
            <Label value={config.xAxisLabel} position="bottom" offset={10} style={{ fontSize: 13, fill: "#6b7280" }} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[-5.5, 5.5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          >
            <Label value={config.yAxisLabel} angle={-90} position="left" offset={10} style={{ fontSize: 13, fill: "#6b7280" }} />
          </YAxis>
          <ReferenceLine x={0} stroke="#d1d5db" />
          <ReferenceLine y={0} stroke="#d1d5db" />
          <Tooltip content={<CustomTooltip priceCategories={config.priceCategories} />} />
          {groupedData.map((g) => (
            <Scatter key={g.key} name={g.label} data={g.data} shape={renderDot(g.color)} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
