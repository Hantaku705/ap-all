import React from "react";
import { Composition } from "remotion";
import { ProductVideo, productVideoSchema } from "./compositions/ProductVideo";
import { TikTokDemoVideo } from "./compositions/TikTokDemoVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductVideo"
        component={ProductVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        schema={productVideoSchema}
        defaultProps={{
          product: {
            id: "demo",
            name: "サンプル商品",
            description: "商品説明",
            price: 1980,
            brandName: "AnyBrand",
            commissionRate: 15,
            earnPerSale: 297,
            imageUrl: "https://placehold.co/800x800/ff6b6b/white?text=Sample",
            category: "美容・コスメ",
            categoryId: "beauty",
            stock: 100,
            status: "active" as const,
            avgViews: 10000,
            avgOrders: 50,
            rating: 4.5,
            totalSold: 1000,
            soldYesterday: 25,
            gmv: 1980000,
            badges: [],
            hasSample: true,
            isTopSelling: false,
            createdAt: new Date().toISOString(),
          },
        }}
      />
      <Composition
        id="TikTokDemoVideo"
        component={TikTokDemoVideo}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
