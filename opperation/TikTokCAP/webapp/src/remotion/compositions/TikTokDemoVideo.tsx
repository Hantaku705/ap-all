import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// TikTok brand color
const TIKTOK_BLACK = "#000000";
const TIKTOK_CYAN = "#25F4EE";
const TIKTOK_PINK = "#FE2C55";
const ANYBRAND_COLOR = "#ff6b6b";

export const TikTokDemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif",
      }}
    >
      {/* Scene 1: Title (0-90 frames = 0-3秒) */}
      <Sequence from={0} durationInFrames={90}>
        <TitleScene fps={fps} />
      </Sequence>

      {/* Scene 2: Landing Page (90-240 frames = 3-8秒) */}
      <Sequence from={90} durationInFrames={150}>
        <LandingScene fps={fps} />
      </Sequence>

      {/* Scene 3: Login Button (240-360 frames = 8-12秒) */}
      <Sequence from={240} durationInFrames={120}>
        <LoginButtonScene fps={fps} />
      </Sequence>

      {/* Scene 4: OAuth Screen (360-510 frames = 12-17秒) */}
      <Sequence from={360} durationInFrames={150}>
        <OAuthScene fps={fps} />
      </Sequence>

      {/* Scene 5: Redirect (510-600 frames = 17-20秒) */}
      <Sequence from={510} durationInFrames={90}>
        <RedirectScene fps={fps} />
      </Sequence>

      {/* Scene 6: Profile Page (600-810 frames = 20-27秒) */}
      <Sequence from={600} durationInFrames={210}>
        <ProfileScene fps={fps} />
      </Sequence>

      {/* Scene 7: Product Application (810-1050 frames = 27-35秒) */}
      <Sequence from={810} durationInFrames={240}>
        <ProductScene fps={fps} />
      </Sequence>

      {/* Scene 8: Completion (1050-1200 frames = 35-40秒) */}
      <Sequence from={1050} durationInFrames={150}>
        <CompletionScene fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Scene 1: Title
const TitleScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const logoOffset = interpolate(frame, [0, 45], [-50, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${logoOffset}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* TikTok + AnyBrand logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* TikTok Logo */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: TIKTOK_BLACK,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `3px solid ${TIKTOK_CYAN}`,
              boxShadow: `0 0 30px ${TIKTOK_PINK}`,
            }}
          >
            <span style={{ fontSize: 50, color: "white", fontWeight: "bold" }}>
              T
            </span>
          </div>

          <span style={{ fontSize: 60, color: "white" }}>×</span>

          {/* AnyBrand Logo */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${ANYBRAND_COLOR} 0%, #ee5a5a 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 0 30px ${ANYBRAND_COLOR}`,
            }}
          >
            <span style={{ fontSize: 50, color: "white", fontWeight: "bold" }}>
              A
            </span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            margin: 0,
            textAlign: "center",
          }}
        >
          TikTok Integration Demo
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
          }}
        >
          AnyBrand × TikTok Login API
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Landing Page
const LandingScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  const translateY = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%)",
        padding: 60,
      }}
    >
      {/* Step indicator */}
      <StepIndicator step={1} label="Visit AnyBrand" />

      {/* Mock browser */}
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          overflow: "hidden",
          marginTop: 80,
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            background: "#f0f0f0",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#ff5f57",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#febc2e",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#28c840",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: 8,
              padding: "8px 15px",
              fontSize: 18,
              color: "#666",
            }}
          >
            anybrand-platform.vercel.app
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 15,
                background: `linear-gradient(135deg, ${ANYBRAND_COLOR} 0%, #ee5a5a 100%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: 30, color: "white", fontWeight: "bold" }}
              >
                A
              </span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
              AnyBrand
            </h2>
          </div>
          <p style={{ fontSize: 24, color: "#666", marginTop: 20 }}>
            TikTokクリエイター向けアフィリエイトプラットフォーム
          </p>
          <p style={{ fontSize: 20, color: "#999", marginTop: 10 }}>
            500以上のブランドと高コミッション案件
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Login Button
const LoginButtonScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const pulse = Math.sin(frame * 0.2) * 0.05 + 1;
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Cursor animation
  const cursorX = interpolate(frame, [30, 60], [1400, 960], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [30, 60], [200, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Button click effect
  const buttonScale =
    frame >= 70 && frame < 90
      ? interpolate(frame, [70, 80, 90], [1, 0.95, 1])
      : 1;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%)",
        padding: 60,
      }}
    >
      <StepIndicator step={2} label="Click TikTok Login" />

      {/* Login button area */}
      <div
        style={{
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          marginTop: 80,
        }}
      >
        <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 40 }}>
          ログイン
        </h2>

        {/* TikTok Login Button */}
        <div
          style={{
            transform: `scale(${pulse * buttonScale})`,
            background: TIKTOK_BLACK,
            borderRadius: 16,
            padding: "20px 60px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow:
              frame >= 70
                ? `0 0 40px ${TIKTOK_PINK}`
                : "0 10px 40px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${TIKTOK_CYAN} 0%, ${TIKTOK_PINK} 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 24, color: "white", fontWeight: "bold" }}>
              T
            </span>
          </div>
          <span style={{ fontSize: 28, color: "white", fontWeight: 600 }}>
            TikTokでログイン
          </span>
        </div>

        <p style={{ fontSize: 20, color: "#999", marginTop: 30 }}>
          TikTokアカウントで簡単にログイン
        </p>
      </div>

      {/* Animated cursor */}
      {frame >= 30 && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            width: 30,
            height: 30,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
            <path d="M5.5 3.21V20.8L10.3 16L14.1 22L18.3 20.1L14.5 14.2L20.8 14.2L5.5 3.21Z" />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Scene 4: OAuth Screen
const OAuthScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Authorize button animation
  const buttonGlow = frame >= 90 ? Math.sin((frame - 90) * 0.2) * 0.3 + 1 : 1;
  const buttonClick = frame >= 120 && frame < 135 ? 0.95 : 1;

  return (
    <AbsoluteFill
      style={{
        background: TIKTOK_BLACK,
        padding: 60,
      }}
    >
      <StepIndicator step={3} label="Authorize App" dark />

      {/* TikTok OAuth modal */}
      <div
        style={{
          opacity,
          transform: `scale(${slideIn})`,
          background: "#1a1a1a",
          borderRadius: 24,
          padding: 50,
          margin: "80px auto 0",
          maxWidth: 600,
          border: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        {/* TikTok logo */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${TIKTOK_CYAN} 0%, ${TIKTOK_PINK} 100%)`,
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 40, color: "white", fontWeight: "bold" }}>
              T
            </span>
          </div>
        </div>

        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          AnyBrand がアクセスを求めています
        </h2>

        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          このアプリは以下の情報にアクセスします:
        </p>

        {/* Permissions list */}
        <div style={{ marginBottom: 40 }}>
          {["基本プロフィール情報", "フォロワー数", "動画統計情報"].map(
            (perm, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: TIKTOK_CYAN,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14, color: "black" }}>✓</span>
                </div>
                <span style={{ fontSize: 18, color: "white" }}>{perm}</span>
              </div>
            )
          )}
        </div>

        {/* Authorize button */}
        <div
          style={{
            transform: `scale(${buttonGlow * buttonClick})`,
            background: `linear-gradient(135deg, ${TIKTOK_PINK} 0%, ${TIKTOK_CYAN} 100%)`,
            borderRadius: 12,
            padding: "18px 40px",
            textAlign: "center",
            boxShadow:
              frame >= 120
                ? `0 0 30px ${TIKTOK_PINK}`
                : "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 22, color: "white", fontWeight: 700 }}>
            許可する
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Redirect
const RedirectScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const rotation = frame * 8;
  const opacity = interpolate(frame, [60, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ opacity, textAlign: "center" }}>
        {/* Spinner */}
        <div
          style={{
            width: 80,
            height: 80,
            border: `6px solid #f0f0f0`,
            borderTopColor: ANYBRAND_COLOR,
            borderRadius: "50%",
            transform: `rotate(${rotation}deg)`,
            margin: "0 auto 30px",
          }}
        />
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "#333" }}>
          認証中...
        </h2>
        <p style={{ fontSize: 20, color: "#666", marginTop: 15 }}>
          AnyBrand にリダイレクトしています
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 6: Profile Page
const ProfileScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const slideUp = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Stats counter animation
  const followerCount = Math.min(Math.floor(frame * 500), 45000);
  const likeCount = Math.min(Math.floor(frame * 3000), 280000);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%)",
        padding: 60,
      }}
    >
      <StepIndicator step={4} label="View TikTok Profile Data" />

      <div
        style={{
          opacity,
          transform: `translateY(${interpolate(slideUp, [0, 1], [50, 0])}px)`,
          marginTop: 80,
        }}
      >
        {/* Profile header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: `linear-gradient(135deg, ${TIKTOK_CYAN} 0%, ${TIKTOK_PINK} 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 50, color: "white" }}>👤</span>
          </div>
          <div>
            <h2 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>
              @creator_demo
            </h2>
            <p style={{ fontSize: 22, color: "#666", marginTop: 10 }}>
              TikTokクリエイター
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: "#28c840",
              borderRadius: 12,
              padding: "12px 24px",
            }}
          >
            <span style={{ fontSize: 18, color: "white", fontWeight: 600 }}>
              ✓ 連携完了
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {[
            {
              label: "フォロワー",
              value: followerCount.toLocaleString(),
              icon: "👥",
            },
            { label: "フォロー中", value: "1,234", icon: "👤" },
            {
              label: "いいね",
              value: likeCount.toLocaleString(),
              icon: "❤️",
            },
            { label: "動画", value: "156", icon: "🎬" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 25,
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <span style={{ fontSize: 40 }}>{stat.icon}</span>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  margin: "10px 0 5px",
                  color: "#333",
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: 16, color: "#666", margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Success message */}
        <div
          style={{
            marginTop: 30,
            background: "rgba(40, 200, 64, 0.1)",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 20, color: "#28c840", margin: 0 }}>
            ✓ TikTokアカウントの連携が完了しました
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 7: Product Application
const ProductScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Product selection animation
  const selectedProduct = frame >= 60;
  const modalOpen = frame >= 120;
  const modalScale = modalOpen
    ? spring({
        frame: frame - 120,
        fps,
        config: { damping: 200, stiffness: 100 },
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%)",
        padding: 60,
      }}
    >
      <StepIndicator step={5} label="Apply for Affiliate" />

      <div style={{ opacity, marginTop: 80 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 30 }}>
          商品を選択
        </h2>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {[
            { name: "美容液セラム", price: 4980, commission: 20 },
            { name: "保湿クリーム", price: 3280, commission: 15 },
            { name: "クレンジング", price: 2480, commission: 18 },
          ].map((product, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border:
                  selectedProduct && i === 0
                    ? `3px solid ${ANYBRAND_COLOR}`
                    : "3px solid transparent",
                transform:
                  selectedProduct && i === 0 ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 150,
                  background: "#f0f0f0",
                  borderRadius: 12,
                  marginBottom: 15,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 60 }}>📦</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                {product.name}
              </h3>
              <p style={{ fontSize: 24, fontWeight: 800, margin: "10px 0" }}>
                ¥{product.price.toLocaleString()}
              </p>
              <p style={{ fontSize: 16, color: "#28c840", margin: 0 }}>
                獲得額: ¥
                {Math.floor(
                  (product.price * product.commission) / 100
                ).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Application modal */}
      {modalOpen && (
        <AbsoluteFill
          style={{
            background: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${modalScale})`,
              background: "white",
              borderRadius: 24,
              padding: 40,
              maxWidth: 500,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                background: "#28c840",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <span style={{ fontSize: 40, color: "white" }}>✓</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 15 }}>
              申請完了！
            </h2>
            <p style={{ fontSize: 18, color: "#666", marginBottom: 20 }}>
              「美容液セラム」のアフィリエイト申請が完了しました
            </p>
            <p style={{ fontSize: 16, color: "#999" }}>
              承認後、アフィリエイトリンクが発行されます
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Scene 8: Completion
const CompletionScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const checkScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 150, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${ANYBRAND_COLOR} 0%, #ee5a5a 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        {/* Success checkmark */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            background: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 40px",
            transform: `scale(${checkScale})`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ fontSize: 80, color: ANYBRAND_COLOR }}>✓</span>
        </div>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            margin: 0,
            marginBottom: 20,
          }}
        >
          Integration Complete
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.9)",
            margin: 0,
            marginBottom: 50,
          }}
        >
          TikTok ログイン連携が正常に動作しています
        </p>

        {/* Feature list */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
          }}
        >
          {["OAuth 2.0 認証", "プロフィール取得", "統計データ連携"].map(
            (feature, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  padding: "15px 30px",
                }}
              >
                <span style={{ fontSize: 20, color: "white" }}>
                  ✓ {feature}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Step Indicator Component
const StepIndicator: React.FC<{
  step: number;
  label: string;
  dark?: boolean;
}> = ({ step, label, dark = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 15,
    }}
  >
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        background: dark ? "rgba(255,255,255,0.2)" : ANYBRAND_COLOR,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "white",
        }}
      >
        {step}
      </span>
    </div>
    <span
      style={{
        fontSize: 24,
        fontWeight: 600,
        color: dark ? "white" : "#333",
      }}
    >
      {label}
    </span>
  </div>
);
