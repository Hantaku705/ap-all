export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // 保護するページ（ログイン必須）
    "/dashboard/:path*",
    "/orders/:path*",
    "/commissions/:path*",
    "/settings/:path*",
    "/profile/:path*",
    // 商品ページは閲覧可能（申請時にログイン要求）
    // "/products/:path*",
  ],
};
