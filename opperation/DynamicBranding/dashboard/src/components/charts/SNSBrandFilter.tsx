"use client";

import { BRANDS, BRAND_COLORS, BrandName } from "@/lib/utils/colors";

interface SNSBrandFilterProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

export function SNSBrandFilter({
  selectedBrand,
  onBrandChange,
}: SNSBrandFilterProps) {
  return (
    <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">
          ブランドでフィルタ:
        </span>
        <div className="flex flex-wrap gap-2">
          {/* 全体 */}
          <button
            onClick={() => onBrandChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedBrand === "all"
                ? "bg-gray-800 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            全体
          </button>
          {/* ブランド別 */}
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandChange(brand)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBrand === brand
                  ? "text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
              style={
                selectedBrand === brand
                  ? { backgroundColor: BRAND_COLORS[brand as BrandName] }
                  : undefined
              }
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
