"use client";

import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { ProductVideo } from "@/remotion/compositions/ProductVideo";
import type { Product } from "@/types";

interface VideoPreviewProps {
  product: Product;
  width?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

export default function VideoPreview({
  product,
  width = 320,
  autoPlay = false,
  loop = true,
}: VideoPreviewProps) {
  // Convert Product type to the schema expected by Remotion
  const inputProps = useMemo(
    () => ({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        brandName: product.brandName,
        commissionRate: product.commissionRate,
        earnPerSale: product.earnPerSale,
        imageUrl: product.imageUrl,
        category: product.category,
        categoryId: product.categoryId,
        stock: product.stock,
        status: product.status,
        avgViews: product.avgViews,
        avgOrders: product.avgOrders,
        rating: product.rating,
        totalSold: product.totalSold,
        soldYesterday: product.soldYesterday,
        gmv: product.gmv,
        badges: product.badges,
        hasSample: product.hasSample,
        isTopSelling: product.isTopSelling,
        createdAt: product.createdAt,
        affiliateUrl: product.affiliateUrl,
        shopUrl: product.shopUrl,
      },
    }),
    [product]
  );

  // Calculate height for 9:16 aspect ratio (vertical video)
  const height = (width * 16) / 9;

  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100">
      <Player
        component={ProductVideo}
        inputProps={inputProps}
        durationInFrames={300}
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{
          width,
          height,
        }}
        controls
        autoPlay={autoPlay}
        loop={loop}
      />
    </div>
  );
}
