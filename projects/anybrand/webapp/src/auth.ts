import NextAuth from "next-auth";

// TikTok プロフィール型
export interface TikTokProfile {
  openId: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  bioDescription?: string;
}

// JWT トークン拡張
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tiktok?: TikTokProfile;
      accessToken?: string;
    };
  }
}

// JWT型はcallback内で型アサーションを使用

// カスタムTikTok OAuthプロバイダー
const TikTokProvider = {
  id: "tiktok",
  name: "TikTok",
  type: "oauth" as const,
  authorization: {
    url: "https://www.tiktok.com/v2/auth/authorize",
    params: {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      scope: "user.info.basic,user.info.profile,user.info.stats",
      response_type: "code",
    },
  },
  token: {
    url: "https://open.tiktokapis.com/v2/oauth/token/",
    async request({ params, provider }: { params: { code: string; redirect_uri: string }; provider: { callbackUrl: string } }) {
      const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code: params.code,
          grant_type: "authorization_code",
          redirect_uri: provider.callbackUrl,
        }),
      });

      const tokens = await response.json();
      return { tokens };
    },
  },
  userinfo: {
    url: "https://open.tiktokapis.com/v2/user/info/",
    async request({ tokens }: { tokens: { access_token: string } }) {
      const response = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      const data = await response.json();
      return data.data?.user || data;
    },
  },
  profile(profile: {
    open_id?: string;
    display_name?: string;
    avatar_url?: string;
    follower_count?: number;
    following_count?: number;
    likes_count?: number;
    video_count?: number;
    bio_description?: string;
  }) {
    return {
      id: profile.open_id || "",
      name: profile.display_name || "",
      email: null,
      image: profile.avatar_url || "",
    };
  },
  clientId: process.env.TIKTOK_CLIENT_KEY!,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [TikTokProvider],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // TikTokログイン時にトークンとプロフィールを保存
      if (account?.provider === "tiktok" && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        // TikTokプロフィール情報を保存
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tiktokProfile = profile as any;
        token.tiktok = {
          openId: tiktokProfile.open_id || tiktokProfile.id || "",
          displayName: tiktokProfile.display_name || tiktokProfile.name || "",
          avatarUrl: tiktokProfile.avatar_url || tiktokProfile.image || "",
          followerCount: tiktokProfile.follower_count || 0,
          followingCount: tiktokProfile.following_count || 0,
          likesCount: tiktokProfile.likes_count || 0,
          videoCount: tiktokProfile.video_count || 0,
          bioDescription: tiktokProfile.bio_description || "",
        };
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにTikTok情報を追加
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extendedToken = token as any;
      if (extendedToken.tiktok) {
        session.user.tiktok = extendedToken.tiktok as TikTokProfile;
      }
      if (extendedToken.accessToken) {
        session.user.accessToken = extendedToken.accessToken as string;
      }
      return session;
    },
  },
});
