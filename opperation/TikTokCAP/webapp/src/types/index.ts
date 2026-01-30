// クリエイター
export interface Creator {
  id: string;
  email: string;
  name: string;
  tiktokUsername: string;
  tiktokFollowers: number;
  avatarUrl: string;
  status: "pending" | "approved" | "rejected";
  bankName?: string;
  bankAccount?: string;
  createdAt: string;
  updatedAt: string;
}

// カテゴリ
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

// 商品バッジタイプ
export type ProductBadge = "top-selling" | "free-sample" | "new" | "hot";

// 商品
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  commissionRate: number;
  imageUrl: string;
  category: string;
  categoryId: string;
  brandName: string;
  stock: number;
  avgViews: number;
  avgOrders: number;
  status: "active" | "inactive";
  createdAt: string;
  // anystarr.com UI用の新フィールド
  priceMin?: number;
  priceMax?: number;
  maxCommissionRate?: number;
  earnPerSale: number;
  badges: ProductBadge[];
  hasSample: boolean;
  isTopSelling: boolean;
  rating: number;
  totalSold: number;
  soldYesterday: number;
  gmv: number;
  // TikTokCAP連携フィールド
  affiliateUrl?: string;
  shopUrl?: string;
  campaignPeriod?: string;
}

// 商品申請
export interface ProductApplication {
  id: string;
  creatorId: string;
  productId: string;
  product?: Product;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  approvedAt?: string;
}

// 注文
export interface Order {
  id: string;
  creatorId: string;
  productId: string;
  product?: Product;
  orderAmount: number;
  commissionAmount: number;
  status: "pending" | "completed" | "cancelled";
  orderedAt: string;
}

// コミッション支払い
export interface CommissionPayout {
  id: string;
  creatorId: string;
  amount: number;
  status: "pending" | "processing" | "paid";
  requestedAt: string;
  paidAt?: string;
}

// ダッシュボード統計
export interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  totalClicks: number;
  conversionRate: number;
  approvedProducts: number;
  monthlyTrend: {
    month: string;
    sales: number;
    commission: number;
  }[];
}

// 通知
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

// FAQ
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
