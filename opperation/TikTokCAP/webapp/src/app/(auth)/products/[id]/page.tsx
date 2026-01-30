"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Gift,
  ShoppingCart,
  Share2,
  Copy,
  Check,
  Lock,
  ExternalLink,
  TrendingUp,
  Package,
  Calendar,
  BarChart3,
  Star,
} from "lucide-react";
import { products, productApplications } from "@/data/mock-data";
import type { ProductBadge, Product } from "@/types";
import { GetSampleModal, AddAffiliateModal } from "@/components/modals";

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
    <span className={`rounded px-3 py-1 text-sm font-bold ${styles[badge]}`}>
      {labels[badge]}
    </span>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = products.find((p) => p.id === productId);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(
    productApplications.some(
      (app) => app.productId === productId && app.status !== "rejected"
    )
  );
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">商品が見つかりません</p>
      </div>
    );
  }

  const handleApply = async () => {
    setIsApplying(true);
    // TODO: API連携
    setTimeout(() => {
      setIsApplied(true);
      setIsApplying(false);
    }, 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://anybrand.jp/l/${product.id}?ref=creator123`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        商品一覧に戻る
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image with TikTok Shop Banner - anystarr.com style */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* TikTok Shop Banner */}
          <div className="flex items-center justify-between bg-black px-4 py-2">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-sm font-medium text-white">TikTok Shop</span>
            </div>
            <span className="text-sm font-medium text-[#ff6b6b]">DEALS FOR YOU</span>
          </div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />

          {/* Badges - Top Left */}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.badges.slice(0, 2).map((badge) => (
              <ProductBadgeLabel key={badge} badge={badge} />
            ))}
          </div>

          {/* Favorite - Top Right */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white"
          >
            <Heart
              className={`h-6 w-6 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-[#ff6b6b]">
              {product.brandName}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.totalSold}件販売)</span>
            </div>

            <p className="mt-4 text-gray-600">{product.description}</p>
          </div>

          {/* Price Range */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">販売価格</p>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{(product.priceMin || product.price).toLocaleString()}
                  {product.priceMax && product.priceMax !== product.priceMin && (
                    <span className="text-gray-400"> - ¥{product.priceMax.toLocaleString()}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Earn Per Sale - Green & Prominent */}
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-500">売上あたり獲得額</p>
              <p className="text-3xl font-bold text-green-600">
                ¥{product.earnPerSale.toLocaleString()}
              </p>
            </div>

            {/* Commission 3-Tier Cards - anystarr.com style */}
            <div className="mt-4">
              <p className="mb-3 text-sm text-gray-500">コミッション率</p>
              <div className="grid grid-cols-3 gap-2">
                {/* TikTok Tier */}
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500">TikTok</p>
                  <p className="mt-1 text-lg font-bold text-gray-400">
                    {Math.max(product.commissionRate - 2, 5)}%
                  </p>
                </div>
                {/* AnyBrand Tier - Current */}
                <div className="rounded-lg border-2 border-[#ff6b6b] bg-[#ff6b6b]/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-[#ff6b6b]">AnyBrand</p>
                    <Check className="h-3 w-3 text-[#ff6b6b]" />
                  </div>
                  <p className="mt-1 text-lg font-bold text-[#ff6b6b]">
                    {product.commissionRate}%
                  </p>
                </div>
                {/* Premium Tier */}
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500">Premium</p>
                    <Lock className="h-3 w-3 text-gray-400" />
                  </div>
                  <p className="mt-1 text-lg font-bold text-gray-400">
                    {product.maxCommissionRate || product.commissionRate + 3}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Stats */}
          <div className="grid grid-cols-4 gap-3">
            <StatBox
              icon={Package}
              label="総売上"
              value={product.totalSold.toLocaleString()}
            />
            <StatBox
              icon={Calendar}
              label="昨日の売上"
              value={product.soldYesterday.toString()}
            />
            <StatBox
              icon={BarChart3}
              label="GMV"
              value={`¥${(product.gmv / 10000).toFixed(0)}万`}
            />
            <StatBox
              icon={TrendingUp}
              label="在庫数"
              value={`${product.stock}個`}
            />
          </div>

          {/* Action Buttons - anystarr.com style */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {product.hasSample && (
                <button
                  onClick={() => setShowSampleModal(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#ff6b6b] px-6 py-3 font-medium text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/5"
                >
                  <Gift className="h-5 w-5" />
                  サンプルを申請
                </button>
              )}
              <button
                onClick={isApplied ? () => setShowAddModal(true) : handleApply}
                disabled={isApplying}
                className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors ${
                  product.hasSample ? "flex-1" : "flex-1"
                } ${
                  isApplied
                    ? "bg-green-500"
                    : "bg-[#ff6b6b] hover:bg-[#ee5a5a]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isApplied ? (
                  <>
                    <Check className="h-5 w-5" />
                    アフィリエイト承認済み
                  </>
                ) : isApplying ? (
                  "申請中..."
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    アフィリエイトに追加
                  </>
                )}
              </button>
            </div>

            {isApplied && (
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    コピーしました！
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    アフィリエイトリンクをコピー
                  </>
                )}
              </button>
            )}

            <div className="flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
                シェア
              </button>
              <a
                href={`https://example.com/products/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="h-5 w-5" />
                商品ページ
              </a>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">カテゴリ</p>
            <p className="mt-1 font-medium text-gray-900">{product.category}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-gradient-to-r from-[#ff6b6b]/10 to-[#ffd93d]/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          この商品を紹介するコツ
        </h3>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b6b] text-xs text-white">
              1
            </span>
            実際に使用した感想を正直に伝えましょう
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b6b] text-xs text-white">
              2
            </span>
            ビフォーアフターや使用方法を見せると効果的です
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b6b] text-xs text-white">
              3
            </span>
            PR表記は必ず入れましょう（景品表示法対応）
          </li>
        </ul>
      </div>

      {/* Related Products - anystarr.com style */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          関連商品
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products
            .filter(
              (p) => p.categoryId === product.categoryId && p.id !== product.id
            )
            .slice(0, 5)
            .map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Badges */}
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {relatedProduct.badges.slice(0, 1).map((badge) => (
                      <span
                        key={badge}
                        className={`rounded px-2 py-0.5 text-xs font-bold ${
                          badge === "top-selling"
                            ? "bg-orange-500 text-white"
                            : badge === "free-sample"
                            ? "bg-green-500 text-white"
                            : badge === "new"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {badge === "top-selling"
                          ? "Top Selling"
                          : badge === "free-sample"
                          ? "Free Sample"
                          : badge === "new"
                          ? "New"
                          : "Hot"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">
                    {relatedProduct.brandName}
                  </p>
                  <h4 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">
                    {relatedProduct.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    ¥{(relatedProduct.priceMin || relatedProduct.price).toLocaleString()}
                  </p>

                  {/* Earn Per Sale */}
                  <p className="mt-2 text-lg font-bold text-green-600">
                    ¥{relatedProduct.earnPerSale.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">売上あたり獲得額</p>

                  {/* Commission Tier */}
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className="flex items-center gap-0.5 text-green-600">
                      {relatedProduct.commissionRate}%
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-gray-400">→</span>
                    {relatedProduct.maxCommissionRate && relatedProduct.maxCommissionRate > relatedProduct.commissionRate ? (
                      <span className="flex items-center gap-0.5 text-gray-400">
                        {relatedProduct.maxCommissionRate}%
                        <Lock className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Modals */}
      <GetSampleModal
        product={product}
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
      />
      <AddAffiliateModal
        product={product}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm text-center">
      <Icon className="mx-auto h-5 w-5 text-gray-400" />
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
