import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Product schema for Remotion
export const productVideoSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    brandName: z.string(),
    commissionRate: z.number(),
    earnPerSale: z.number(),
    imageUrl: z.string(),
    category: z.string(),
    categoryId: z.string(),
    stock: z.number(),
    status: z.enum(["active", "inactive"]),
    avgViews: z.number(),
    avgOrders: z.number(),
    rating: z.number(),
    totalSold: z.number(),
    soldYesterday: z.number(),
    gmv: z.number(),
    badges: z.array(z.any()),
    hasSample: z.boolean(),
    isTopSelling: z.boolean(),
    createdAt: z.string(),
    affiliateUrl: z.string().optional(),
    shopUrl: z.string().optional(),
  }),
});

type ProductVideoProps = z.infer<typeof productVideoSchema>;

// Brand colors
const BRAND_COLOR = "#ff6b6b";
const BRAND_GRADIENT = "linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)";

export const ProductVideo: React.FC<ProductVideoProps> = ({ product }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)",
        fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif",
      }}
    >
      {/* Phase 1: Brand Logo (0-60 frames = 0-2秒) */}
      <Sequence from={0} durationInFrames={60}>
        <BrandLogo fps={fps} />
      </Sequence>

      {/* Phase 2: Product Image (60-150 frames = 2-5秒) */}
      <Sequence from={60} durationInFrames={90}>
        <ProductImage imageUrl={product.imageUrl} fps={fps} />
      </Sequence>

      {/* Phase 3: Product Info (150-210 frames = 5-7秒) */}
      <Sequence from={150} durationInFrames={60}>
        <ProductInfo
          name={product.name}
          price={product.price}
          brandName={product.brandName}
          fps={fps}
        />
      </Sequence>

      {/* Phase 4: Commission Info (210-270 frames = 7-9秒) */}
      <Sequence from={210} durationInFrames={60}>
        <CommissionInfo
          commissionRate={product.commissionRate}
          earnPerSale={product.earnPerSale}
          fps={fps}
        />
      </Sequence>

      {/* Phase 5: CTA (270-300 frames = 9-10秒) */}
      <Sequence from={270} durationInFrames={30}>
        <CallToAction fps={fps} />
      </Sequence>

      {/* Persistent elements after their intro */}
      {frame >= 150 && (
        <PersistentProductImage imageUrl={product.imageUrl} frame={frame} />
      )}
    </AbsoluteFill>
  );
};

// Brand Logo Component
const BrandLogo: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: BRAND_GRADIENT,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 20px 60px rgba(255, 107, 107, 0.3)",
          }}
        >
          <span style={{ fontSize: 60, color: "white", fontWeight: "bold" }}>
            A
          </span>
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#1a1a1a",
            margin: 0,
            letterSpacing: -2,
          }}
        >
          AnyBrand
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "#666",
            margin: 0,
          }}
        >
          TikTok Affiliate Platform
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Product Image Component
const ProductImage: React.FC<{ imageUrl: string; fps: number }> = ({
  imageUrl,
  fps,
}) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
    from: 0.5,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          width: 700,
          height: 700,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Img
          src={imageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Persistent Product Image (smaller, top position)
const PersistentProductImage: React.FC<{ imageUrl: string; frame: number }> = ({
  imageUrl,
  frame,
}) => {
  const localFrame = frame - 150;
  const translateY = interpolate(localFrame, [0, 30], [0, -500], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(localFrame, [0, 30], [1, 0.5], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
        width: 400,
        height: 400,
        borderRadius: 30,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

// Product Info Component
const ProductInfo: React.FC<{
  name: string;
  price: number;
  brandName: string;
  fps: number;
}> = ({ name, price, brandName, fps }) => {
  const frame = useCurrentFrame();

  const slideUp = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const translateY = interpolate(slideUp, [0, 1], [100, 0]);
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 400,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: BRAND_COLOR,
            fontWeight: 600,
            margin: 0,
            marginBottom: 16,
          }}
        >
          {brandName}
        </p>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#1a1a1a",
            margin: 0,
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          ¥{price.toLocaleString()}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Commission Info Component
const CommissionInfo: React.FC<{
  commissionRate: number;
  earnPerSale: number;
  fps: number;
}> = ({ commissionRate, earnPerSale, fps }) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          background: BRAND_GRADIENT,
          borderRadius: 40,
          padding: "60px 100px",
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(255, 107, 107, 0.3)",
        }}
      >
        <p
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
            marginBottom: 16,
          }}
        >
          1件あたりの獲得額
        </p>
        <p
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            margin: 0,
            marginBottom: 16,
          }}
        >
          ¥{earnPerSale.toLocaleString()}
        </p>
        <p
          style={{
            fontSize: 36,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
          }}
        >
          コミッション率 {commissionRate}%
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Call To Action Component
const CallToAction: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const pulse = Math.sin(frame * 0.3) * 0.05 + 1;

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 200,
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${pulse})`,
          background: BRAND_GRADIENT,
          borderRadius: 100,
          padding: "40px 100px",
          boxShadow: "0 20px 60px rgba(255, 107, 107, 0.4)",
        }}
      >
        <p
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "white",
            margin: 0,
          }}
        >
          今すぐ申請 →
        </p>
      </div>
    </AbsoluteFill>
  );
};
