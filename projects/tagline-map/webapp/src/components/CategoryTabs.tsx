"use client"

import { categories, categoryIds } from "@/config/categories"

interface CategoryTabsProps {
  selected: string
  onSelect: (categoryId: string) => void
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {categoryIds.map((id) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === id
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {categories[id].label}
        </button>
      ))}
    </div>
  )
}
