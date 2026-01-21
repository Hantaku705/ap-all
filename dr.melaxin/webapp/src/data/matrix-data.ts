// Dr.Melaxin Matrix Data - SNS×Month Budget & Reach Tables ($10M Version)

export type SnsType = "TikTok" | "X" | "Instagram" | "YouTube" | "TikTokShop" | "Other";
export type Month = "2月" | "3月" | "4月" | "5月" | "6月" | "7月" | "8月" | "9月" | "10月" | "11月" | "12月";
export type Purpose = "認知" | "比較検討" | "購入" | "話題化" | "ブランディング";

// ============================================
// Annual Budget Matrix (SNS × Month)
// ============================================
export interface BudgetCell {
  value: number; // in 万円
  displayValue: string; // e.g., "30M", "¥3,000万"
}

export interface BudgetRow {
  tactic: string;
  sns: SnsType;
  subRow?: string; // 予算 / 本数 / Reach
  feb: BudgetCell;
  mar: BudgetCell;
  apr: BudgetCell;
  may: BudgetCell;
  jun: BudgetCell;
  jul: BudgetCell;
  aug: BudgetCell;
  sep: BudgetCell;
  oct: BudgetCell;
  nov: BudgetCell;
  dec: BudgetCell;
  total: BudgetCell;
  kpi?: string;
}

// Alias for component use
export type MatrixRow = BudgetRow;

// Annual Budget by Tactic (in 万円)
export const annualBudgetMatrix = [
  {
    tactic: "TikTok大量生成",
    sns: "TikTok" as SnsType,
    purpose: ["認知", "話題化"] as Purpose[],
    data: {
      feb: 3000, mar: 10000, apr: 3000, may: 3000, jun: 10000,
      jul: 5000, aug: 5000, sep: 10000, oct: 5000, nov: 10000, dec: 6000,
    },
    total: 70000,
    kpi: "7,000本・1本¥10,000",
  },
  {
    tactic: "X RT部隊",
    sns: "X" as SnsType,
    purpose: ["話題化"] as Purpose[],
    data: {
      feb: 2000, mar: 8000, apr: 1000, may: 1000, jun: 6000,
      jul: 1000, aug: 1000, sep: 6000, oct: 1000, nov: 6000, dec: 2000,
    },
    total: 35000,
    kpi: "imp単価¥1・トレンド入り",
  },
  {
    tactic: "広告配信（運用型TT）",
    sns: "TikTok" as SnsType,
    purpose: ["認知"] as Purpose[],
    data: {
      feb: 900, mar: 1500, apr: 900, may: 900, jun: 1800,
      jul: 1200, aug: 1200, sep: 1500, oct: 1200, nov: 1500, dec: 1500,
    },
    total: 14100,
    kpi: "CPM¥300",
  },
  {
    tactic: "広告配信（運用型IG）",
    sns: "Instagram" as SnsType,
    purpose: ["認知"] as Purpose[],
    data: {
      feb: 600, mar: 1000, apr: 600, may: 600, jun: 1200,
      jul: 800, aug: 800, sep: 1000, oct: 800, nov: 1000, dec: 1000,
    },
    total: 9400,
    kpi: "CPM¥300",
  },
  {
    tactic: "広告配信（獲得型X）",
    sns: "X" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 500, mar: 3500, apr: 500, may: 500, jun: 4000,
      jul: 1000, aug: 1000, sep: 3500, oct: 1000, nov: 3500, dec: 1500,
    },
    total: 20500,
    kpi: "CPA¥3,000",
  },
  {
    tactic: "広告配信（獲得型IG）",
    sns: "Instagram" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 0, mar: 1000, apr: 0, may: 0, jun: 1500,
      jul: 0, aug: 0, sep: 1000, oct: 0, nov: 1000, dec: 500,
    },
    total: 5000,
    kpi: "リタゲ",
  },
  {
    tactic: "KOL Pick（IG）",
    sns: "Instagram" as SnsType,
    purpose: ["比較検討", "ブランディング"] as Purpose[],
    data: {
      feb: 0, mar: 7000, apr: 0, may: 0, jun: 7000,
      jul: 0, aug: 0, sep: 5500, oct: 0, nov: 5500, dec: 0,
    },
    total: 25000,
    kpi: "Aクラス2人",
  },
  {
    tactic: "KOL Pick（YT）",
    sns: "YouTube" as SnsType,
    purpose: ["比較検討", "ブランディング"] as Purpose[],
    data: {
      feb: 0, mar: 3000, apr: 0, may: 0, jun: 3000,
      jul: 0, aug: 0, sep: 2000, oct: 0, nov: 2000, dec: 0,
    },
    total: 10000,
    kpi: "メガ系KOL",
  },
  {
    tactic: "TTS GMV MAX",
    sns: "TikTokShop" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 2000, mar: 6000, apr: 2000, may: 2000, jun: 6000,
      jul: 3000, aug: 3000, sep: 6000, oct: 3000, nov: 6000, dec: 4000,
    },
    total: 43000,
    kpi: "ROAS 200%",
  },
  {
    tactic: "@cosme/LIPS",
    sns: "Other" as SnsType,
    purpose: ["比較検討"] as Purpose[],
    data: {
      feb: 500, mar: 500, apr: 500, may: 500, jun: 500,
      jul: 500, aug: 500, sep: 500, oct: 500, nov: 500, dec: 0,
    },
    total: 5000,
    kpi: "レビュー施策",
  },
  {
    tactic: "アンバサダー起用（グク）",
    sns: "Other" as SnsType,
    purpose: ["ブランディング", "認知", "話題化"] as Purpose[],
    data: {
      feb: 0, mar: 0, apr: 0, may: 0, jun: 30000,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    },
    total: 30000,
    kpi: "6月メガ割に合わせて起用",
  },
];

// ============================================
// Annual Reach Matrix (SNS × Month) - in 万UU
// ============================================
export const annualReachMatrix = [
  {
    tactic: "TikTok大量生成",
    sns: "TikTok" as SnsType,
    purpose: ["認知", "話題化"] as Purpose[],
    data: {
      feb: 1470, mar: 4900, apr: 1470, may: 1470, jun: 4900,
      jul: 2450, aug: 2450, sep: 4900, oct: 2450, nov: 4900, dec: 2940,
    },
    total: 34300,
    note: "UU率70%",
  },
  {
    tactic: "X RT部隊",
    sns: "X" as SnsType,
    purpose: ["話題化"] as Purpose[],
    data: {
      feb: 500, mar: 2000, apr: 250, may: 250, jun: 1500,
      jul: 250, aug: 250, sep: 1500, oct: 250, nov: 1500, dec: 500,
    },
    total: 8750,
    note: "freq4",
  },
  {
    tactic: "広告配信（運用型TT）",
    sns: "TikTok" as SnsType,
    purpose: ["認知"] as Purpose[],
    data: {
      feb: 1000, mar: 1667, apr: 1000, may: 1000, jun: 2000,
      jul: 1333, aug: 1333, sep: 1667, oct: 1333, nov: 1667, dec: 1667,
    },
    total: 15667,
    note: "freq3",
  },
  {
    tactic: "広告配信（運用型IG）",
    sns: "Instagram" as SnsType,
    purpose: ["認知"] as Purpose[],
    data: {
      feb: 667, mar: 1111, apr: 667, may: 667, jun: 1333,
      jul: 889, aug: 889, sep: 1111, oct: 889, nov: 1111, dec: 1111,
    },
    total: 10445,
    note: "freq3",
  },
  {
    tactic: "広告配信（獲得型X）",
    sns: "X" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 556, mar: 3889, apr: 556, may: 556, jun: 4444,
      jul: 1111, aug: 1111, sep: 3889, oct: 1111, nov: 3889, dec: 1667,
    },
    total: 22778,
    note: "freq3",
  },
  {
    tactic: "広告配信（獲得型IG）",
    sns: "Instagram" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    },
    total: 0,
    note: "リタゲのためReach計算なし",
  },
  {
    tactic: "KOL Pick（IG）",
    sns: "Instagram" as SnsType,
    purpose: ["比較検討", "ブランディング"] as Purpose[],
    data: {
      feb: 0, mar: 1200, apr: 0, may: 0, jun: 1200,
      jul: 0, aug: 0, sep: 800, oct: 0, nov: 800, dec: 0,
    },
    total: 4000,
    note: "20万FW×10%",
  },
  {
    tactic: "KOL Pick（YT）",
    sns: "YouTube" as SnsType,
    purpose: ["比較検討", "ブランディング"] as Purpose[],
    data: {
      feb: 0, mar: 4000, apr: 0, may: 0, jun: 4000,
      jul: 0, aug: 0, sep: 3000, oct: 0, nov: 3000, dec: 0,
    },
    total: 14000,
    note: "25万登録×40%",
  },
  {
    tactic: "TTS GMV MAX",
    sns: "TikTokShop" as SnsType,
    purpose: ["購入"] as Purpose[],
    data: {
      feb: 400, mar: 1200, apr: 400, may: 400, jun: 1200,
      jul: 600, aug: 600, sep: 1200, oct: 600, nov: 1200, dec: 800,
    },
    total: 8600,
    note: "freq5",
  },
  {
    tactic: "@cosme/LIPS",
    sns: "Other" as SnsType,
    purpose: ["比較検討"] as Purpose[],
    data: {
      feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    },
    total: 0,
    note: "レビュー施策のためReach計算なし",
  },
  {
    tactic: "アンバサダー起用（グク）",
    sns: "Other" as SnsType,
    purpose: ["ブランディング", "認知", "話題化"] as Purpose[],
    data: {
      feb: 0, mar: 0, apr: 0, may: 0, jun: 50000,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    },
    total: 50000,
    note: "5,000万フォロワー",
  },
];

// ============================================
// Monthly Summary Data
// ============================================
export const monthlySummary = [
  { month: "2月", budget: 9500, reach: 4592, event: "立ち上げ" },
  { month: "3月", budget: 41500, reach: 21078, event: "メガ割（年1回目）", isMegaSale: true },
  { month: "4月", budget: 8500, reach: 4342, event: "継続" },
  { month: "5月", budget: 8500, reach: 4342, event: "PD準備" },
  { month: "6月", budget: 41000, reach: 22244, event: "メガ割（年2回目）+ジョングク", isMegaSale: true },
  { month: "7月", budget: 12500, reach: 6633, event: "TTS強化" },
  { month: "8月", budget: 12500, reach: 6633, event: "TTS強化" },
  { month: "9月", budget: 37000, reach: 19178, event: "メガ割（年3回目）+Drug Store", isMegaSale: true },
  { month: "10月", budget: 12500, reach: 6633, event: "BF準備" },
  { month: "11月", budget: 37000, reach: 19178, event: "メガ割（年4回目）+BF", isMegaSale: true },
  { month: "12月", budget: 16500, reach: 9240, event: "BestCosme" },
];

// ============================================
// SNS Summary Data
// ============================================
export const snsSummary = [
  { sns: "TikTok", budget: 84100, budgetPct: 35.5, reach: 49970, reachPct: 40.3, color: "#00f2ea" },
  { sns: "X", budget: 55500, budgetPct: 23.4, reach: 31540, reachPct: 25.4, color: "#1da1f2" },
  { sns: "TikTok Shop", budget: 43000, budgetPct: 18.1, reach: 8600, reachPct: 6.9, color: "#ff0050" },
  { sns: "Instagram", budget: 39400, budgetPct: 16.6, reach: 20010, reachPct: 16.1, color: "#e4405f" },
  { sns: "YouTube", budget: 10000, budgetPct: 4.2, reach: 14000, reachPct: 11.3, color: "#ff0000" },
  { sns: "その他", budget: 5000, budgetPct: 2.1, reach: 0, reachPct: 0, color: "#888888" },
];

// ============================================
// Tactic Summary Data
// ============================================
export const tacticSummary = [
  { tactic: "TikTok大量生成", budget: 70000, reach: 49000, budgetPct: 29.5, color: "#00f2ea" },
  { tactic: "TTS GMV MAX", budget: 43000, reach: 8600, budgetPct: 18.1, color: "#ff0050" },
  { tactic: "X RT部隊", budget: 35000, reach: 35000, budgetPct: 14.8, color: "#1da1f2" },
  { tactic: "KOL Pick", budget: 35000, reach: 15000, budgetPct: 14.8, color: "#e4405f" },
  { tactic: "広告（獲得型）", budget: 25500, reach: 8500, budgetPct: 10.8, color: "#4267b2" },
  { tactic: "広告（運用型）", budget: 23500, reach: 7835, budgetPct: 9.9, color: "#833ab4" },
  { tactic: "@cosme/LIPS", budget: 5000, reach: 160, budgetPct: 2.1, color: "#888888" },
];

// ============================================
// KPI Summary
// ============================================
export const matrixKpiSummary = {
  totalBudget: 237000, // 万円 = 23.7億円
  totalReach: 124095, // 万UU = 約12.4億UU
  tiktokVideos: 7000,
  kolDeliveries: 34, // IG 20 + YT 14
  megaSaleGmv: 33, // 億円 (4回合計)
  annualGmv: 73.6, // 億円
  annualRoas: 466, // %
};

// ============================================
// Reach Calculation Logic
// ============================================
export const reachCalculationLogic = [
  { media: "TikTok大量生成", formula: "本数 × 平均再生7万 × UU率70%", param: "1本¥10,000" },
  { media: "X RT部隊", formula: "予算 ÷ imp単価¥1 ÷ freq4", param: "100万imp/投稿" },
  { media: "広告（運用型）", formula: "(予算 ÷ CPM¥300) × 1,000 ÷ freq3", param: "CPM¥300" },
  { media: "広告（獲得型）", formula: "(予算 ÷ CPM¥300) × 1,000 ÷ freq3", param: "CPA¥3,000目標" },
  { media: "IG KOL Pick", formula: "20万FW × 視聴率10% × 配信数", param: "Aクラス" },
  { media: "YT KOL Pick", formula: "25万登録 × 視聴率40% × 配信数", param: "メガ系" },
  { media: "TTS GMV MAX", formula: "(予算 ÷ CPM¥1,000) × 1,000 ÷ freq5", param: "ROAS 200%" },
];

// ============================================
// Chart-Ready Data
// ============================================

// SNS Budget Pie Chart Data
export const snsBudgetPieData = snsSummary.map((item) => ({
  name: item.sns,
  value: item.budget,
  fill: item.color,
}));

// SNS Reach Pie Chart Data
export const snsReachPieData = snsSummary
  .filter((item) => item.reach > 0)
  .map((item) => ({
    name: item.sns,
    value: item.reach,
    fill: item.color,
  }));

// Tactic Budget Pie Chart Data
export const tacticBudgetPieData = tacticSummary.map((item) => ({
  name: item.tactic,
  value: item.budget,
  fill: item.color,
}));

// Monthly Trend Chart Data
export const monthlyTrendData = monthlySummary.map((item) => ({
  month: item.month,
  budget: item.budget / 100, // 億円に変換
  reach: item.reach / 100, // 億UUに変換
  isMegaSale: item.isMegaSale || false,
}));

// Monthly Reach by SNS (for stacked area chart)
export const monthlyReachTrend = [
  { month: "2月", tiktok: 1800, x: 1200, instagram: 800, youtube: 400, tts: 392 },
  { month: "3月", tiktok: 9100, x: 5400, instagram: 3200, youtube: 1500, tts: 1878, isMegaSale: true },
  { month: "4月", tiktok: 1700, x: 1100, instagram: 800, youtube: 350, tts: 392 },
  { month: "5月", tiktok: 1700, x: 1100, instagram: 800, youtube: 350, tts: 392 },
  { month: "6月", tiktok: 9500, x: 6000, instagram: 3500, youtube: 1500, tts: 1744, isMegaSale: true },
  { month: "7月", tiktok: 2500, x: 1800, instagram: 1100, youtube: 500, tts: 733 },
  { month: "8月", tiktok: 2500, x: 1800, instagram: 1100, youtube: 500, tts: 733 },
  { month: "9月", tiktok: 8200, x: 4800, instagram: 2900, youtube: 1400, tts: 1878, isMegaSale: true },
  { month: "10月", tiktok: 2500, x: 1800, instagram: 1100, youtube: 500, tts: 733 },
  { month: "11月", tiktok: 8200, x: 4800, instagram: 2900, youtube: 1400, tts: 1878, isMegaSale: true },
  { month: "12月", tiktok: 3770, x: 2740, instagram: 1510, youtube: 700, tts: 520 },
];

// ============================================
// Filter Options
// ============================================
export const filterOptions = {
  sns: ["TikTok", "X", "Instagram", "YouTube", "TikTokShop", "Other"],
  month: ["2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  quarter: ["Q1", "Q2", "Q3", "Q4"],
  tactic: [
    "TikTok大量生成",
    "X RT部隊",
    "広告配信（運用型TT）",
    "広告配信（運用型IG）",
    "広告配信（獲得型X）",
    "広告配信（獲得型IG）",
    "KOL Pick（IG）",
    "KOL Pick（YT）",
    "TTS GMV MAX",
    "@cosme/LIPS",
    "アンバサダー起用（グク）",
  ],
  purpose: ["認知", "比較検討", "購入", "話題化", "ブランディング"],
};

// Purpose color map
export const purposeColors: Record<Purpose, string> = {
  認知: "#3b82f6",      // blue
  比較検討: "#f59e0b",  // amber
  購入: "#10b981",      // emerald
  話題化: "#ec4899",    // pink
  ブランディング: "#8b5cf6", // violet
};

// ============================================
// Quarterly Matrix Summary
// ============================================
export const quarterlyMatrixSummary = [
  {
    quarter: "Q1",
    period: "2-3月",
    budget: 38000,
    reach: 12310,
    mainEvent: "3月メガ割",
    breakdown: {
      tiktok: 10000,
      x: 9000,
      instagram: 5500,
      youtube: 1500,
      tts: 4000,
      other: 8000,
    },
  },
  {
    quarter: "Q2",
    period: "4-6月",
    budget: 36000,
    reach: 14000,
    mainEvent: "6月メガ割+ジョングク",
    breakdown: {
      tiktok: 12000,
      x: 8000,
      instagram: 5000,
      youtube: 2500,
      tts: 5000,
      other: 3500,
    },
  },
  {
    quarter: "Q3",
    period: "7-9月",
    budget: 40000,
    reach: 15000,
    mainEvent: "9月メガ割+Drug Store",
    breakdown: {
      tiktok: 12000,
      x: 6500,
      instagram: 3500,
      youtube: 2000,
      tts: 7500,
      other: 8500,
    },
  },
  {
    quarter: "Q4",
    period: "10-12月",
    budget: 44000,
    reach: 17000,
    mainEvent: "11月メガ割+BF+BestCosme",
    breakdown: {
      tiktok: 11500,
      x: 7500,
      instagram: 5500,
      youtube: 2500,
      tts: 7000,
      other: 10000,
    },
  },
];

// ============================================
// Helper Functions
// ============================================
export function formatBudget(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(1)}億`;
  }
  return `${valueInMan.toLocaleString()}万`;
}

export function formatReach(valueInMan: number): string {
  if (valueInMan >= 10000) {
    return `${(valueInMan / 10000).toFixed(2)}億UU`;
  }
  return `${valueInMan.toLocaleString()}万UU`;
}

export function getQuarterForMonth(month: string): string {
  const q1 = ["2月", "3月"];
  const q2 = ["4月", "5月", "6月"];
  const q3 = ["7月", "8月", "9月"];
  const q4 = ["10月", "11月", "12月"];

  if (q1.includes(month)) return "Q1";
  if (q2.includes(month)) return "Q2";
  if (q3.includes(month)) return "Q3";
  if (q4.includes(month)) return "Q4";
  return "";
}

export function getSnsColor(sns: string): string {
  const colors: Record<string, string> = {
    TikTok: "#00f2ea",
    X: "#1da1f2",
    Instagram: "#e4405f",
    YouTube: "#ff0000",
    TikTokShop: "#ff0050",
    Other: "#888888",
  };
  return colors[sns] || "#888888";
}
