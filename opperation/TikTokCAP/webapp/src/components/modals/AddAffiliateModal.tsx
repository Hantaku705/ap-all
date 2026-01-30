"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Product } from "@/types";

interface AddAffiliateModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAffiliateModal({
  product,
  isOpen,
  onClose,
}: AddAffiliateModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // 商品データのaffiliateUrlを使用、なければフォールバック
  const affiliateUrl = product.affiliateUrl ||
    `https://shop.tiktok.com/affiliate/product/${product.id}?ref=anybrand`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            アフィリエイトに追加
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-green-600">
              コミッション: {product.commissionRate}%
            </p>
          </div>
        </div>

        {/* Content - anystarr.com style */}
        <div className="space-y-4 px-6 py-6">
          {/* Method 1: QR Code */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b] text-xs font-bold text-white">
                1
              </span>
              <h5 className="font-medium text-gray-900">Method 1: QRコードをスキャン</h5>
            </div>
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={affiliateUrl}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              TikTokアプリでスキャンして商品を追加
            </p>
          </div>

          {/* Method 2: Copy Link */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b] text-xs font-bold text-white">
                2
              </span>
              <h5 className="font-medium text-gray-900">Method 2: リンクをコピー</h5>
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {affiliateUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ee5a5a]"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4" />
                    完了
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    コピー
                  </>
                )}
              </button>
            </div>
          </div>

          {/* How to make money - anystarr.com style */}
          <div className="rounded-xl bg-gray-50 p-4">
            <h5 className="mb-3 font-medium text-gray-900">
              AnyBrandで収益化する方法
            </h5>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-sm font-bold text-[#ff6b6b]">
                  1
                </div>
                <p className="mt-1 text-xs text-gray-600">商品を追加</p>
              </div>
              <div>
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-sm font-bold text-[#ff6b6b]">
                  2
                </div>
                <p className="mt-1 text-xs text-gray-600">動画を投稿</p>
              </div>
              <div>
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-sm font-bold text-[#ff6b6b]">
                  3
                </div>
                <p className="mt-1 text-xs text-gray-600">売上発生</p>
              </div>
              <div>
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-sm font-bold text-[#ff6b6b]">
                  4
                </div>
                <p className="mt-1 text-xs text-gray-600">報酬GET!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
