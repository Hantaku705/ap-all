import NextAuth from "next-auth";
import TikTok from "next-auth/providers/tiktok";

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

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tiktok?: TikTokProfile;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    TikTok({
      clientId: process.env.TIKTOK_CLIENT_KEY!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user.info.basic,user.info.stats",
        },
      },
    }),
  ],
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
          openId: tiktokProfile.open_id || tiktokProfile.data?.user?.open_id,
          displayName:
            tiktokProfile.display_name ||
            tiktokProfile.data?.user?.display_name,
          avatarUrl:
            tiktokProfile.avatar_url || tiktokProfile.data?.user?.avatar_url,
          followerCount:
            tiktokProfile.follower_count ||
            tiktokProfile.data?.user?.follower_count ||
            0,
          followingCount:
            tiktokProfile.following_count ||
            tiktokProfile.data?.user?.following_count ||
            0,
          likesCount:
            tiktokProfile.likes_count ||
            tiktokProfile.data?.user?.likes_count ||
            0,
          videoCount:
            tiktokProfile.video_count ||
            tiktokProfile.data?.user?.video_count ||
            0,
          bioDescription:
            tiktokProfile.bio_description ||
            tiktokProfile.data?.user?.bio_description,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにTikTok情報を追加
      if (token.tiktok) {
        session.user.tiktok = token.tiktok;
      }
      if (token.accessToken) {
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
