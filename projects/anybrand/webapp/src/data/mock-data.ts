import type {
  Category,
  DashboardStats,
  Order,
  Notification,
  ProductApplication,
  CommissionPayout,
  FAQ,
} from "@/types";

// 商品データ（TikTokCAPスプレッドシートから同期）
export { products, productCountByCategory } from "./products-data";
import { products } from "./products-data";

// カテゴリ（実データに基づく）
export const categories: Category[] = [
  { id: "beauty", name: "美容・コスメ", slug: "beauty", icon: "💄", productCount: 58 },
  { id: "food", name: "食品・健康", slug: "food", icon: "🍎", productCount: 74 },
  { id: "electronics", name: "家電・ガジェット", slug: "electronics", icon: "📱", productCount: 23 },
  { id: "fashion", name: "ファッション", slug: "fashion", icon: "👗", productCount: 11 },
  { id: "home", name: "ホーム・インテリア", slug: "home", icon: "🏠", productCount: 10 },
  { id: "others", name: "その他", slug: "others", icon: "📦", productCount: 123 },
];

// ダッシュボード統計
export const dashboardStats: DashboardStats = {
  totalSales: 1250000,
  totalCommission: 287500,
  pendingCommission: 45000,
  totalClicks: 125000,
  conversionRate: 3.2,
  approvedProducts: 12,
  monthlyTrend: [
    { month: "9月", sales: 180000, commission: 41400 },
    { month: "10月", sales: 220000, commission: 50600 },
    { month: "11月", sales: 280000, commission: 64400 },
    { month: "12月", sales: 350000, commission: 80500 },
    { month: "1月", sales: 220000, commission: 50600 },
  ],
};

// 注文履歴（実データの商品を使用）
export const orders: Order[] = [
  {
    id: "o1",
    creatorId: "c1",
    productId: products[0]?.id || "1",
    product: products[0],
    orderAmount: products[0]?.price || 0,
    commissionAmount: products[0]?.earnPerSale || 0,
    status: "completed",
    orderedAt: "2025-01-28T10:30:00Z",
  },
  {
    id: "o2",
    creatorId: "c1",
    productId: products[1]?.id || "2",
    product: products[1],
    orderAmount: products[1]?.price || 0,
    commissionAmount: products[1]?.earnPerSale || 0,
    status: "completed",
    orderedAt: "2025-01-27T15:45:00Z",
  },
  {
    id: "o3",
    creatorId: "c1",
    productId: products[2]?.id || "3",
    product: products[2],
    orderAmount: products[2]?.price || 0,
    commissionAmount: products[2]?.earnPerSale || 0,
    status: "completed",
    orderedAt: "2025-01-26T09:20:00Z",
  },
  {
    id: "o4",
    creatorId: "c1",
    productId: products[3]?.id || "4",
    product: products[3],
    orderAmount: products[3]?.price || 0,
    commissionAmount: products[3]?.earnPerSale || 0,
    status: "pending",
    orderedAt: "2025-01-25T14:10:00Z",
  },
  {
    id: "o5",
    creatorId: "c1",
    productId: products[4]?.id || "5",
    product: products[4],
    orderAmount: products[4]?.price || 0,
    commissionAmount: products[4]?.earnPerSale || 0,
    status: "completed",
    orderedAt: "2025-01-24T11:55:00Z",
  },
];

// 商品申請（実データの商品を使用）
export const productApplications: ProductApplication[] = [
  {
    id: "pa1",
    creatorId: "c1",
    productId: products[0]?.id || "1",
    product: products[0],
    status: "approved",
    appliedAt: "2025-01-15T10:00:00Z",
    approvedAt: "2025-01-15T14:00:00Z",
  },
  {
    id: "pa2",
    creatorId: "c1",
    productId: products[1]?.id || "2",
    product: products[1],
    status: "approved",
    appliedAt: "2025-01-16T09:30:00Z",
    approvedAt: "2025-01-16T11:00:00Z",
  },
  {
    id: "pa3",
    creatorId: "c1",
    productId: products[2]?.id || "3",
    product: products[2],
    status: "approved",
    appliedAt: "2025-01-17T14:20:00Z",
    approvedAt: "2025-01-17T18:00:00Z",
  },
  {
    id: "pa4",
    creatorId: "c1",
    productId: products[3]?.id || "4",
    product: products[3],
    status: "pending",
    appliedAt: "2025-01-28T10:00:00Z",
  },
];

// 通知
export const notifications: Notification[] = [
  {
    id: "n1",
    title: "新規注文",
    message: "ツヤ肌ファンデーションが購入されました。コミッション: ¥1,245",
    type: "success",
    read: false,
    createdAt: "2025-01-28T10:30:00Z",
  },
  {
    id: "n2",
    title: "商品承認",
    message: "「ワイヤレスイヤホン Pro」のアフィリエイト申請が承認されました。",
    type: "success",
    read: false,
    createdAt: "2025-01-27T18:00:00Z",
  },
  {
    id: "n3",
    title: "コミッション確定",
    message: "12月分のコミッション ¥80,500 が確定しました。",
    type: "info",
    read: true,
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "n4",
    title: "新商品追加",
    message: "「SKIN LAB」から新しい美容液が追加されました。",
    type: "info",
    read: true,
    createdAt: "2025-01-10T12:00:00Z",
  },
];

// コミッション支払い
export const commissionPayouts: CommissionPayout[] = [
  {
    id: "cp1",
    creatorId: "c1",
    amount: 125000,
    status: "paid",
    requestedAt: "2024-12-01T10:00:00Z",
    paidAt: "2024-12-15T14:00:00Z",
  },
  {
    id: "cp2",
    creatorId: "c1",
    amount: 89000,
    status: "paid",
    requestedAt: "2024-11-01T09:30:00Z",
    paidAt: "2024-11-15T12:00:00Z",
  },
  {
    id: "cp3",
    creatorId: "c1",
    amount: 156000,
    status: "processing",
    requestedAt: "2025-01-05T11:00:00Z",
  },
  {
    id: "cp4",
    creatorId: "c1",
    amount: 45000,
    status: "pending",
    requestedAt: "2025-01-20T15:00:00Z",
  },
];

// FAQ
export const faqs: FAQ[] = [
  {
    id: "faq1",
    question: "AnyBrandとは何ですか？",
    answer: "AnyBrandは、TikTokクリエイター向けのアフィリエイトプラットフォームです。高品質な商品を紹介し、売上に応じたコミッションを獲得できます。",
    category: "general",
  },
  {
    id: "faq2",
    question: "コミッション率はどのくらいですか？",
    answer: "商品によって異なりますが、業界標準よりも高い15〜30%のコミッション率を提供しています。具体的な料率は各商品ページでご確認いただけます。",
    category: "commission",
  },
  {
    id: "faq3",
    question: "報酬はいつ支払われますか？",
    answer: "コミッションは月末締め、翌月15日払いです。最低振込額は5,000円からとなっています。",
    category: "commission",
  },
  {
    id: "faq4",
    question: "どのような商品を紹介できますか？",
    answer: "美容・コスメ、ファッション、家電、食品など500以上のブランドの商品をご紹介いただけます。各商品は厳選された高品質なものばかりです。",
    category: "products",
  },
  {
    id: "faq5",
    question: "アフィリエイトリンクの取得方法は？",
    answer: "商品詳細ページで「アフィリエイトに申請する」をクリックし、承認後に専用リンクが発行されます。リンクをTikTokの投稿やプロフィールに掲載してください。",
    category: "howto",
  },
  {
    id: "faq6",
    question: "サンプル商品は提供されますか？",
    answer: "一定の実績があるクリエイター様には、無料でサンプル商品をお送りしています。詳しくは担当マネージャーにお問い合わせください。",
    category: "products",
  },
  {
    id: "faq7",
    question: "TikTok以外のSNSでも利用できますか？",
    answer: "はい、Instagram、YouTube、Xなど他のSNSでもアフィリエイトリンクをご利用いただけます。ただし、TikTokでの活動実績が審査基準となります。",
    category: "general",
  },
  {
    id: "faq8",
    question: "審査に落ちた場合、再申請できますか？",
    answer: "はい、30日後に再申請が可能です。フォロワー数の増加やコンテンツの質向上を行ってから再度お申し込みください。",
    category: "howto",
  },
];
