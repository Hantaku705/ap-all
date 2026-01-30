"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Gift,
  Layers,
  Check,
  Lock,
  ArrowDown,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { products, categories } from "@/data/mock-data";
import type { Product, ProductBadge } from "@/types";
import { GetSampleModal, AddAffiliateModal } from "@/components/modals";

// ソートオプション
const sortTabs = [
  { id: "totalSold", label: "総売上", key: "totalSold" as keyof Product },
  { id: "soldYesterday", label: "昨日の売上", key: "soldYesterday" as keyof Product },
  { id: "earnPerSale", label: "獲得額", key: "earnPerSale" as keyof Product },
  { id: "commissionRate", label: "コミッション率", key: "commissionRate" as keyof Product },
  { id: "gmv", label: "GMV", key: "gmv" as keyof Product },
  { id: "rating", label: "評価", key: "rating" as keyof Product },
  { id: "price", label: "価格", key: "price" as keyof Product },
];

export default function ProductsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("totalSold");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showRecommended, setShowRecommended] = useState(false);

  // Modal states
  const [sampleModalProduct, setSampleModalProduct] = useState<Product | null>(null);
  const [addModalProduct, setAddModalProduct] = useState<Product | null>(null);

  const handleOpenSampleModal = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSampleModalProduct(product);
  };

  const handleOpenAddModal = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddModalProduct(product);
  };

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSortClick = (tabId: string) => {
    if (sortBy === tabId) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(tabId);
      setSortDirection("desc");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;
    const matchesRecommended = !showRecommended || product.isTopSelling;
    return matchesSearch && matchesCategory && matchesRecommended;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const modifier = sortDirection === "desc" ? -1 : 1;
    const tab = sortTabs.find((t) => t.id === sortBy);
    if (!tab) return 0;
    const aVal = a[tab.key] as number;
    const bVal = b[tab.key] as number;
    return (aVal - bVal) * modifier;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">商品セレクション</h1>
        <p className="mt-1 text-sm text-gray-500">
          500以上の商品から、あなたのフォロワーに合った商品を見つけましょう
        </p>
      </div>

      {/* Sort Tabs */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500">🔥 Sort By</span>
          {sortTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSortClick(tab.id)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === tab.id
                  ? "bg-[#ff6b6b] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {sortBy === tab.id && (
                sortDirection === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )
              )}
            </button>
          ))}
        </div>

        {/* Recommended Button */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-[#ff6b6b] bg-[#ff6b6b]/5 text-[#ff6b6b]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              フィルター
            </button>

            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setView("grid")}
                className={`p-2 ${
                  view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 ${
                  view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowRecommended(!showRecommended)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              showRecommended
                ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] text-white"
                : "bg-[#ff6b6b]/10 text-[#ff6b6b] hover:bg-[#ff6b6b]/20"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            あなたへのおすすめ
          </button>
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="商品名またはブランド名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#ff6b6b] focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
            />
          </div>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-700">カテゴリ</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-[#ff6b6b] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                すべて
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#ff6b6b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        {sortedProducts.length}件の商品が見つかりました
      </p>

      {/* Products Grid - 5 columns */}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.has(product.id)}
              onToggleFavorite={toggleFavorite}
              onOpenSampleModal={handleOpenSampleModal}
              onOpenAddModal={handleOpenAddModal}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isFavorite={favorites.has(product.id)}
              onToggleFavorite={toggleFavorite}
              onOpenSampleModal={handleOpenSampleModal}
              onOpenAddModal={handleOpenAddModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {sampleModalProduct && (
        <GetSampleModal
          product={sampleModalProduct}
          isOpen={!!sampleModalProduct}
          onClose={() => setSampleModalProduct(null)}
        />
      )}
      {addModalProduct && (
        <AddAffiliateModal
          product={addModalProduct}
          isOpen={!!addModalProduct}
          onClose={() => setAddModalProduct(null)}
        />
      )}
    </div>
  );
}

// バッジコンポーネント
function ProductBadgeLabel({ badge }: { badge: ProductBadge }) {
  const styles: Record<ProductBadge, string> = {
    "top-selling": "bg-orange-500 text-white",
    "free-sample": "bg-green-500 text-white",
    "new": "bg-blue-500 text-white",
    "hot": "bg-red-500 text-white",
  };

  const labels: Record<ProductBadge, string> = {
    "top-selling": "Top Selling",
    "free-sample": "Free Sample",
    "new": "New",
    "hot": "Hot",
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-bold ${styles[badge]}`}>
      {labels[badge]}
    </span>
  );
}

// 商品カード（anystarr.comスタイル）
function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenSampleModal,
  onOpenAddModal,
}: {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenSampleModal: (product: Product, e: React.MouseEvent) => void;
  onOpenAddModal: (product: Product, e: React.MouseEvent) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Badges - Top Left */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.badges.slice(0, 2).map((badge) => (
              <ProductBadgeLabel key={badge} badge={badge} />
            ))}
          </div>

          {/* Favorite - Top Right */}
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-[#ff6b6b]">
            {product.name}
          </h3>
        </Link>

        {/* Price Range */}
        <p className="mt-1 text-sm text-gray-500">
          ¥{(product.priceMin || product.price).toLocaleString()}
          {product.priceMax && product.priceMax !== product.priceMin && (
            <> - ¥{product.priceMax.toLocaleString()}</>
          )}
        </p>

        {/* Earn Per Sale - Green & Prominent */}
        <div className="mt-2">
          <p className="text-xl font-bold text-green-600">
            ¥{product.earnPerSale.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">売上あたり獲得額</p>
        </div>

        {/* Commission Tier - Pill Style */}
        <div className="mt-2 flex items-center gap-1">
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
            {product.commissionRate}%
            <Check className="h-3 w-3" />
          </span>
          <span className="text-gray-300">→</span>
          {product.maxCommissionRate && product.maxCommissionRate > product.commissionRate ? (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              {product.maxCommissionRate}%
              <Lock className="h-3 w-3" />
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">--</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4 text-[10px] text-gray-400">
          <span>Earnings</span>
          <span>Max Earnings</span>
        </div>

        {/* Action Buttons - anystarr Style */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => onOpenSampleModal(product, e)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-orange-400 bg-white px-2 py-2 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-50"
          >
            <Gift className="h-3.5 w-3.5" />
            Sample
          </button>
          <button
            onClick={(e) => onOpenAddModal(product, e)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-2 py-2 text-xs font-medium text-white transition-colors hover:from-orange-500 hover:to-orange-600"
          >
            <Layers className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// リスト表示用
function ProductListItem({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenSampleModal,
  onOpenAddModal,
}: {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenSampleModal: (product: Product, e: React.MouseEvent) => void;
  onOpenAddModal: (product: Product, e: React.MouseEvent) => void;
}) {
  return (
    <div className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {/* Badges */}
        <div className="absolute left-1 top-1 flex flex-col gap-1">
          {product.badges.slice(0, 1).map((badge) => (
            <ProductBadgeLabel key={badge} badge={badge} />
          ))}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium text-gray-900 hover:text-[#ff6b6b]">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              ¥{(product.priceMin || product.price).toLocaleString()}
              {product.priceMax && product.priceMax !== product.priceMin && (
                <> - ¥{product.priceMax.toLocaleString()}</>
              )}
            </p>
          </div>

          {/* Earn Per Sale */}
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">
              ¥{product.earnPerSale.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">売上あたり獲得額</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Commission Tier - Pill Style */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                {product.commissionRate}%
                <Check className="h-3 w-3" />
              </span>
              <span className="text-gray-300">→</span>
              {product.maxCommissionRate && product.maxCommissionRate > product.commissionRate ? (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  {product.maxCommissionRate}%
                  <Lock className="h-3 w-3" />
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">--</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span>Earnings</span>
              <span>Max Earnings</span>
            </div>
          </div>

          {/* Actions - anystarr Style */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(product.id, e)}
              className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                }`}
              />
            </button>
            <button
              onClick={(e) => onOpenSampleModal(product, e)}
              className="flex items-center gap-1 rounded-lg border border-orange-400 bg-white px-3 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50"
            >
              <Gift className="h-4 w-4" />
              Sample
            </button>
            <button
              onClick={(e) => onOpenAddModal(product, e)}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:from-orange-500 hover:to-orange-600"
            >
              <Layers className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
