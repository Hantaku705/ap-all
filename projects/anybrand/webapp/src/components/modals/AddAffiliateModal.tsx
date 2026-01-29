"use client";

import { useState } from "react";
import { X, Copy, Check, ExternalLink, Smartphone, Link2, Monitor } from "lucide-react";
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

  const affiliateUrl = `https://shop.tiktok.com/affiliate/product/${product.id}?ref=anybrand`;
  const tiktokSellerUrl = "https://seller-us.tiktok.com/affiliate/creator";

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

        {/* Content */}
        <div className="space-y-4 px-6 py-6">
          <h4 className="text-center font-medium text-gray-900">
            方法を選択
          </h4>

          {/* Option 1: TikTok Shop App */}
          <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b6b]/10">
                <Smartphone className="h-5 w-5 text-[#ff6b6b]" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">
                  TikTok Shopアプリで追加
                </h5>
                <p className="mt-1 text-sm text-gray-500">
                  QRコードをスキャンしてアプリで開く
                </p>
                <div className="mt-3 flex justify-center">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <QRCodeSVG
                      value={affiliateUrl}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Copy Link */}
          <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b6b]/10">
                <Link2 className="h-5 w-5 text-[#ff6b6b]" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">リンクをコピー</h5>
                <p className="mt-1 text-sm text-gray-500">
                  アフィリエイトリンクをクリップボードにコピー
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {affiliateUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ee5a5a]"
                  >
                    {copiedLink ? (
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
            </div>
          </div>

          {/* Option 3: PC */}
          <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b6b]/10">
                <Monitor className="h-5 w-5 text-[#ff6b6b]" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">PCで開く</h5>
                <p className="mt-1 text-sm text-gray-500">
                  TikTok Shop Seller Centerで追加
                </p>
                <a
                  href={tiktokSellerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#ff6b6b] px-4 py-2 text-sm font-medium text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/5"
                >
                  TikTok Shop Sellerを開く
                  <ExternalLink className="h-4 w-4" />
                </a>
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
