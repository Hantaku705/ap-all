"use client";

import { useState } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Product } from "@/types";

interface GetSampleModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function GetSampleModal({
  product,
  isOpen,
  onClose,
}: GetSampleModalProps) {
  const [copiedName, setCopiedName] = useState(false);

  if (!isOpen) return null;

  const tiktokShopUrl = `https://shop.tiktok.com/view/product/${product.id}`;

  const handleCopyName = () => {
    navigator.clipboard.writeText(product.name);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
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
          <h2 className="text-lg font-semibold text-gray-900">Get Sample</h2>
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
            <p className="text-sm text-gray-500">{product.brandName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          <h4 className="text-center font-medium text-gray-900">
            TikTokでサンプルを申請する方法
          </h4>

          {/* Step 1 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b] text-xs font-bold text-white">
                1
              </span>
              <span className="font-medium text-gray-900">
                TikTok Shopを開く
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 rounded-lg bg-white p-2">
                <QRCodeSVG
                  value={tiktokShopUrl}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">QRコードをスキャンするか、</p>
                <a
                  href={tiktokShopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#ff6b6b] hover:underline"
                >
                  shop.tiktok.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b] text-xs font-bold text-white">
                2
              </span>
              <span className="font-medium text-gray-900">商品を検索</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                {product.name}
              </div>
              <button
                onClick={handleCopyName}
                className="flex items-center gap-1 rounded-lg bg-[#ff6b6b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ee5a5a]"
              >
                {copiedName ? (
                  <>
                    <Check className="h-4 w-4" />
                    コピー済み
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

          {/* Step 3 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b] text-xs font-bold text-white">
                3
              </span>
              <span className="font-medium text-gray-900">
                サンプルを申請
              </span>
            </div>
            <p className="text-sm text-gray-600">
              商品ページで「Get Sample」または「サンプルを申請」ボタンをクリックして申請してください。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <a
            href={tiktokShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff6b6b] px-6 py-3 font-medium text-white transition-colors hover:bg-[#ee5a5a]"
          >
            <ExternalLink className="h-5 w-5" />
            TikTok Shopを開く
          </a>
        </div>
      </div>
    </div>
  );
}
