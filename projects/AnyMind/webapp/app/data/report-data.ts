// AnyMind Monthly Report Data - 2025

// Group KPIs (from Group.csv)
export const groupKPIs = {
  global: {
    revenue: { current: 6479834543, previous: 5627995487, yoy: 0.151 },
    grossProfit: { current: 2660462067, previous: 2194955348, yoy: 0.212 },
    operatingProfit: { current: 833044855, previous: 374965343, yoy: 1.222 },
    ytd: {
      revenue: 57414370309,
      grossProfit: 21983923154,
      operatingProfit: 2022435769,
    },
  },
  japan: {
    revenue: { current: 3003528043, previous: 2479872888, yoy: 0.211 },
    grossProfit: { current: 1358919722, previous: 1082952791, yoy: 0.255 },
    operatingProfit: { current: 444307007, previous: 226859791, yoy: 0.959 },
    ytd: {
      revenue: 24728354323,
      grossProfit: 11220360368,
      operatingProfit: 1578923174,
    },
  },
};

// Business Units Performance (from BvA.csv)
export const businessUnits = [
  { name: 'Brand Marketing', budget: 217300000, actual: 239728637, acmRate: 1.103, yoy: 0.802 },
  { name: 'Brand Commerce', budget: 83597238, actual: 196743054, acmRate: 2.353, yoy: 2.161 },
  { name: 'WEB', budget: 136544323, actual: 180828125, acmRate: 1.324, yoy: 0.750 },
  { name: 'APP', budget: 79383000, actual: 71900671, acmRate: 0.906, yoy: 0.361 },
  { name: 'Creator Growth', budget: 23562431, actual: 121521073, acmRate: 5.157, yoy: 1.967 },
  { name: 'D2C for Creator', budget: 68365000, actual: 84400407, acmRate: 1.235, yoy: 0.575 },
  { name: 'DX / AI', budget: 46500000, actual: 37752569, acmRate: 0.812, yoy: 0.655 },
  { name: 'ENGAWA', budget: 48670000, actual: 93406024, acmRate: 1.919, yoy: 2.205 },
  { name: 'Grove', budget: 107554595, actual: 195235441, acmRate: 1.815, yoy: 1.298 },
  { name: 'LYFT', budget: 93770128, actual: 104385741, acmRate: 1.113, yoy: 0.350 },
  { name: 'AnyReach', budget: 23161123, actual: 33017980, acmRate: 1.426, yoy: 4.040 },
];

// Budget Progress (from 予算進捗率.csv)
export const budgetProgress = {
  grossProfit: [
    { name: 'JP', ytd: 0.955, gap: 0.045 },
    { name: 'BM', ytd: 0.837, gap: 0.163 },
    { name: 'BC', ytd: 2.994, gap: -1.994 },
    { name: 'PG Web', ytd: 0.850, gap: 0.150 },
    { name: 'PG App', ytd: 0.845, gap: 0.155 },
    { name: 'CG', ytd: 1.327, gap: -0.327 },
    { name: 'D2C CR', ytd: 0.758, gap: 0.242 },
    { name: 'GEC', ytd: 0.328, gap: 0.672 },
    { name: 'DX / AI', ytd: 0.812, gap: 0.188 },
    { name: 'GROVE', ytd: 1.323, gap: -0.323 },
    { name: 'ENGAWA', ytd: 0.833, gap: 0.167 },
    { name: 'LYFT', ytd: 1.058, gap: -0.058 },
    { name: 'AnyReach', ytd: 0.800, gap: 0.200 },
  ],
  operatingProfit: [
    { name: 'JP', ytd: 0.764, gap: 0.236 },
    { name: 'BM', ytd: 0.521, gap: 0.479 },
    { name: 'BC', ytd: 7.512, gap: -6.512 },
    { name: 'PG Web', ytd: 0.785, gap: 0.215 },
    { name: 'PG App', ytd: 0.117, gap: 0.883 },
    { name: 'CG', ytd: 1.770, gap: -0.770 },
    { name: 'D2C CR', ytd: 2.005, gap: -1.005 },
    { name: 'GEC', ytd: 1.715, gap: -0.715 },
    { name: 'DX / AI', ytd: 0.184, gap: 0.816 },
    { name: 'GROVE', ytd: 1.872, gap: -0.872 },
    { name: 'ENGAWA', ytd: 1.494, gap: -0.494 },
    { name: 'LYFT', ytd: 1.005, gap: -0.005 },
    { name: 'AnyReach', ytd: 0.389, gap: 0.611 },
  ],
};

// Monthly P/L Data (from Slide用.csv - ALL section)
export const monthlyPL = [
  { month: '2024/11', revenue: null, grossProfit: 893146, personnelCost: 199444, otherSGA: 376977, adminCost: 103530, engineerCost: 37373, operatingProfit: 175821, gpMargin: 0.45, opMargin: 0.089, headcount: 413, gpPerHead: 2163, opPerHead: 426 },
  { month: '2024/12', revenue: 2479974, grossProfit: 1083043, personnelCost: 212412, otherSGA: 443487, adminCost: 166804, engineerCost: 33390, operatingProfit: 226950, gpMargin: 0.437, opMargin: 0.092, headcount: 412, gpPerHead: 2630, opPerHead: 551 },
  { month: '2025/01', revenue: 1618817, grossProfit: 724495, personnelCost: 222046, otherSGA: 338423, adminCost: 87437, engineerCost: 37235, operatingProfit: 39354, gpMargin: 0.448, opMargin: 0.024, headcount: 410, gpPerHead: 1766, opPerHead: 96 },
  { month: '2025/02', revenue: 1750862, grossProfit: 741645, personnelCost: 235072, otherSGA: 326051, adminCost: 109681, engineerCost: 34981, operatingProfit: 35860, gpMargin: 0.424, opMargin: 0.020, headcount: 425, gpPerHead: 1743, opPerHead: 84 },
  { month: '2025/03', revenue: 2093259, grossProfit: 919204, personnelCost: 223008, otherSGA: 346703, adminCost: 112096, engineerCost: 35856, operatingProfit: 201540, gpMargin: 0.439, opMargin: 0.096, headcount: 446, gpPerHead: 2061, opPerHead: 452 },
  { month: '2025/04', revenue: 1676729, grossProfit: 836230, personnelCost: 238776, otherSGA: 330637, adminCost: 122789, engineerCost: 37466, operatingProfit: 106563, gpMargin: 0.499, opMargin: 0.064, headcount: 466, gpPerHead: 1795, opPerHead: 229 },
  { month: '2025/05', revenue: 1730577, grossProfit: 847073, personnelCost: 233283, otherSGA: 351055, adminCost: 176717, engineerCost: 37927, operatingProfit: 48091, gpMargin: 0.489, opMargin: 0.028, headcount: 475, gpPerHead: 1785, opPerHead: 101 },
  { month: '2025/06', revenue: 2317608, grossProfit: 1019494, personnelCost: 236703, otherSGA: 375027, adminCost: 157714, engineerCost: 39636, operatingProfit: 210414, gpMargin: 0.440, opMargin: 0.091, headcount: 482, gpPerHead: 2113, opPerHead: 436 },
  { month: '2025/07', revenue: 1903754, grossProfit: 814123, personnelCost: 238423, otherSGA: 346741, adminCost: 174229, engineerCost: 35752, operatingProfit: 18978, gpMargin: 0.428, opMargin: 0.010, headcount: 482, gpPerHead: 1690, opPerHead: 39 },
  { month: '2025/08', revenue: 1946605, grossProfit: 891344, personnelCost: 236204, otherSGA: 369972, adminCost: 188429, engineerCost: 35347, operatingProfit: 61393, gpMargin: 0.458, opMargin: 0.032, headcount: 484, gpPerHead: 1841, opPerHead: 127 },
  { month: '2025/09', revenue: 2657177, grossProfit: 1311678, personnelCost: 248850, otherSGA: 422827, adminCost: 168107, engineerCost: 33809, operatingProfit: 438085, gpMargin: 0.494, opMargin: 0.165, headcount: 481, gpPerHead: 2725, opPerHead: 910 },
  { month: '2025/10', revenue: 1814279, grossProfit: 806377, personnelCost: 248997, otherSGA: 379467, adminCost: 160881, engineerCost: 33374, operatingProfit: -16341, gpMargin: 0.444, opMargin: -0.009, headcount: 497, gpPerHead: 1624, opPerHead: -33 },
  { month: '2025/11', revenue: 2215160, grossProfit: 949779, personnelCost: 249104, otherSGA: 466166, adminCost: 210586, engineerCost: 33243, operatingProfit: -9320, gpMargin: 0.429, opMargin: -0.004, headcount: 507, gpPerHead: 1872, opPerHead: -18 },
  { month: '2025/12', revenue: 3003528, grossProfit: 1358920, personnelCost: 258038, otherSGA: 461705, adminCost: 171024, engineerCost: 23845, operatingProfit: 444307, gpMargin: 0.452, opMargin: 0.148, headcount: 496, gpPerHead: 2741, opPerHead: 896 },
];

// YTD Summary
export const ytdSummary = {
  revenue: 24728354,
  grossProfit: 11220360,
  operatingProfit: 1578923,
  avgGPMargin: 0.454,
  avgOPMargin: 0.064,
};

// Cost Breakdown (千円)
export const costBreakdown = {
  personnel: 2868504,
  otherSGA: 4514772,
  adminCost: 1839690,
  engineerCost: 418471,
  total: 9641437,
};

// Helper function to format numbers
export const formatCurrency = (value: number, unit: 'yen' | 'thousand' | 'million' = 'thousand') => {
  if (unit === 'million') {
    return `¥${(value / 1000000).toFixed(1)}M`;
  }
  if (unit === 'thousand') {
    return `¥${(value / 1000).toFixed(0)}K`;
  }
  return `¥${value.toLocaleString()}`;
};

export const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatYoY = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};

// ==========================================
// 2025 Annual Performance (from slides 4-11)
// ==========================================

// Annual Summary (2025 Full Year) - Slide 4
export const annualSummary = {
  revenue: 24700000000,        // 247億円
  grossProfit: 11200000000,    // 112億円
  operatingProfit: 1580000000, // 15.8億円
  gpMargin: 0.454,             // 45.4%
  opMargin: 0.064,             // 6.4%
  revenueYoY: 0.19,            // +19%
  grossProfitYoY: 0.24,        // +24%
  operatingProfitYoY: 0.06,    // +6%
  targetGrossProfit: 11737000000, // 目標: ¥11,737百万円
  actualGrossProfit: 11220000000, // 実績: ¥11,220百万円
  achievementRate: 0.96,       // 達成率: 96%
};

// Quarterly Performance YoY - Slide 4
export const quarterlyPerformance = [
  { quarter: '1Q', revenueYoY: 0.14, gpYoY: 0.15, opYoY: -0.35 },
  { quarter: '2Q', revenueYoY: 0.22, gpYoY: 0.30, opYoY: 0.43 },
  { quarter: '3Q', revenueYoY: 0.29, gpYoY: 0.41, opYoY: 0.96 },
  { quarter: '4Q', revenueYoY: 0.12, gpYoY: 0.13, opYoY: -0.23 },
];

// Per Head Metrics - Slides 6-7
export const perHeadMetrics = {
  gpPerHead: { actual: 1980, target: 2205, previous: 1910, yoy: 0.036, achievement: 0.90 },
  opPerHead: { actual: 277, target: 321, previous: 314, yoy: -0.118, achievement: 0.86 },
};

// Business Units Extended Performance (千円) - Slide 11
export const businessUnitsExtended = [
  { name: 'BM', revenue: 4836229, gp: 2301244, gpGrowth: 0.142, gpAchieve: 0.85, op: 577662, opGrowth: -0.239, opAchieve: 0.56 },
  { name: 'BC', revenue: 1819962, gp: 1064916, gpGrowth: 0.573, gpAchieve: 1.21, op: 164219, opGrowth: null, opAchieve: 1.69 },
  { name: 'PG Web', revenue: 5276863, gp: 1485929, gpGrowth: 0.022, gpAchieve: 0.85, op: 591404, opGrowth: -0.180, opAchieve: 0.82 },
  { name: 'PG App', revenue: 1270154, gp: 791188, gpGrowth: 0.239, gpAchieve: 0.85, op: 7975, opGrowth: 1.173, opAchieve: 0.04 },
  { name: 'CG', revenue: 2214096, gp: 573841, gpGrowth: -0.241, gpAchieve: 1.33, op: 376199, opGrowth: -0.324, opAchieve: 4.28 },
  { name: 'D2C Creator', revenue: 1517568, gp: 798253, gpGrowth: 0.197, gpAchieve: 0.76, op: -238775, opGrowth: 0.568, opAchieve: -5.77 },
  { name: 'DX / AI', revenue: 601517, gp: 451522, gpGrowth: 0.309, gpAchieve: 0.81, op: 18406, opGrowth: null, opAchieve: 0.40 },
  { name: 'GROVE', revenue: 4107129, gp: 1932694, gpGrowth: 0.776, gpAchieve: 1.32, op: 259537, opGrowth: 0.338, opAchieve: 3.00 },
  { name: 'ENGAWA', revenue: 1036224, gp: 595790, gpGrowth: 0.074, gpAchieve: 0.83, op: -190559, opGrowth: -1.259, opAchieve: -1.25 },
  { name: 'LYFT', revenue: 1840661, gp: 1031883, gpGrowth: 0.307, gpAchieve: 1.06, op: 69671, opGrowth: 0.393, opAchieve: 1.59 },
  { name: 'AnyReach', revenue: 207951, gp: 193100, gpGrowth: null, gpAchieve: 0.84, op: -56818, opGrowth: null, opAchieve: -1.33 },
];

// Per Head by Business Unit (千円) - Slide 8
export const perHeadByUnit = [
  { name: 'ALL', gpPerHead24: 1910, gpPerHead25: 1980, gpGrowth: 0.036, opPerHead24: 314, opPerHead25: 277, opGrowth: -0.118 },
  { name: 'BM', gpPerHead24: 2072, gpPerHead25: 1869, gpGrowth: -0.098, opPerHead24: 782, opPerHead25: 477, opGrowth: -0.390 },
  { name: 'BC', gpPerHead24: 2483, gpPerHead25: 3541, gpGrowth: 0.426, opPerHead24: -462, opPerHead25: 606, opGrowth: 2.312 },
  { name: 'PG Web', gpPerHead24: 3265, gpPerHead25: 2914, gpGrowth: -0.108, opPerHead24: 1622, opPerHead25: 1159, opGrowth: -0.285 },
  { name: 'PG App', gpPerHead24: 2991, gpPerHead25: 4254, gpGrowth: 0.422, opPerHead24: -210, opPerHead25: 61, opGrowth: 1.290 },
  { name: 'CG', gpPerHead24: 8838, gpPerHead25: 9169, gpGrowth: 0.037, opPerHead24: 6550, opPerHead25: 6104, opGrowth: -0.068 },
  { name: 'D2C Creator', gpPerHead24: 2032, gpPerHead25: 2628, gpGrowth: 0.293, opPerHead24: -1675, opPerHead25: -780, opGrowth: 0.534 },
  { name: 'DX / AI', gpPerHead24: 1975, gpPerHead25: 2077, gpGrowth: 0.052, opPerHead24: -427, opPerHead25: 84, opGrowth: 1.197 },
  { name: 'GROVE', gpPerHead24: 1467, gpPerHead25: 2049, gpGrowth: 0.397, opPerHead24: 255, opPerHead25: 265, opGrowth: 0.039 },
  { name: 'ENGAWA', gpPerHead24: 939, gpPerHead25: 818, gpGrowth: -0.129, opPerHead24: -39, opPerHead25: -272, opGrowth: -5.974 },
  { name: 'LYFT', gpPerHead24: 2186, gpPerHead25: 2141, gpGrowth: -0.021, opPerHead24: 114, opPerHead25: 126, opGrowth: 0.105 },
  { name: 'AnyReach', gpPerHead24: null, gpPerHead25: 1272, gpGrowth: null, opPerHead24: null, opPerHead25: -329, opGrowth: null },
];

// ==========================================
// Bottleneck Analysis Data (Report Page)
// ==========================================

// Health Score Calculation
// Score = (GP達成率×30) + (OP達成率×40) + (成長率×20) + (効率性×10)
export const healthScore = {
  overall: 72,
  components: {
    gpAchievement: { value: 95.5, weight: 30, contribution: 28.65 },
    opAchievement: { value: 76.4, weight: 40, contribution: 30.56 },
    growth: { value: 21.1, weight: 20, contribution: 4.22 },
    efficiency: { value: 86, weight: 10, contribution: 8.6 },
  },
};

// Critical Alerts
export const criticalAlerts = [
  {
    level: 'critical',
    title: '営業利益の急激な悪化',
    description: '10-11月が赤字転落。OP Marginが-0.9%～-0.4%に低迷',
    metric: 'Operating Profit',
    value: '¥-25M (Oct-Nov)',
    impact: 'high',
  },
  {
    level: 'high',
    title: '事業部門間の二極化',
    description: 'BC=751%達成 vs DX/AI=18%達成（40倍格差）',
    metric: 'BU Performance Gap',
    value: '40x variance',
    impact: 'high',
  },
  {
    level: 'medium',
    title: '生産性の低下',
    description: 'OP Per Head が前年比-11.8%、目標比86%',
    metric: 'OP Per Head',
    value: '¥277K (-11.8% YoY)',
    impact: 'medium',
  },
];

// Quadrant Analysis (BCG Matrix style)
// X: YoY Growth (100% = baseline), Y: OP Achievement (100% = baseline)
export const quadrantData = [
  { name: 'BC', x: 216.1, y: 751.2, quadrant: 'star', size: 1064916 },
  { name: 'CG', x: 196.7, y: 177.0, quadrant: 'star', size: 573841 },
  { name: 'ENGAWA', x: 220.5, y: 149.4, quadrant: 'star', size: 595790 },
  { name: 'GROVE', x: 129.8, y: 187.2, quadrant: 'star', size: 1932694 },
  { name: 'D2C CR', x: 57.5, y: 200.5, quadrant: 'cashCow', size: 798253 },
  { name: 'BM', x: 80.2, y: 52.1, quadrant: 'dog', size: 2301244 },
  { name: 'PG Web', x: 75.0, y: 78.5, quadrant: 'dog', size: 1485929 },
  { name: 'PG App', x: 36.1, y: 11.7, quadrant: 'dog', size: 791188 },
  { name: 'DX / AI', x: 65.5, y: 18.4, quadrant: 'dog', size: 451522 },
  { name: 'LYFT', x: 35.0, y: 100.5, quadrant: 'dog', size: 1031883 },
  { name: 'AnyReach', x: 404.0, y: -133.0, quadrant: 'problemChild', size: 193100 },
];

// Risk BU Ranking (sorted by risk score, higher = more risky)
export const riskRanking = [
  { rank: 1, name: 'AnyReach', riskScore: 85.2, gpAchieve: 0.84, opAchieve: -1.33, yoy: 4.04, issue: 'OP赤字、達成率-133%' },
  { rank: 2, name: 'PG App', riskScore: 78.5, gpAchieve: 0.85, opAchieve: 0.04, yoy: 0.361, issue: 'OP達成率4%、YoY-64%' },
  { rank: 3, name: 'DX / AI', riskScore: 72.3, gpAchieve: 0.81, opAchieve: 0.40, yoy: 0.655, issue: 'OP達成率40%、成長鈍化' },
  { rank: 4, name: 'ENGAWA', riskScore: 65.1, gpAchieve: 0.83, opAchieve: -1.25, yoy: 2.205, issue: 'OP赤字転落' },
  { rank: 5, name: 'D2C CR', riskScore: 58.4, gpAchieve: 0.76, opAchieve: -5.77, yoy: 0.575, issue: 'OP大幅赤字' },
  { rank: 6, name: 'BM', riskScore: 52.8, gpAchieve: 0.85, opAchieve: 0.56, yoy: 0.802, issue: 'OP達成率56%' },
  { rank: 7, name: 'PG Web', riskScore: 48.2, gpAchieve: 0.85, opAchieve: 0.82, yoy: 0.750, issue: 'YoY-25%' },
  { rank: 8, name: 'LYFT', riskScore: 42.1, gpAchieve: 1.06, opAchieve: 1.59, yoy: 0.350, issue: 'YoY-65%' },
  { rank: 9, name: 'GROVE', riskScore: 25.3, gpAchieve: 1.32, opAchieve: 3.00, yoy: 1.298, issue: '-' },
  { rank: 10, name: 'CG', riskScore: 18.7, gpAchieve: 1.33, opAchieve: 4.28, yoy: 1.967, issue: '-' },
  { rank: 11, name: 'BC', riskScore: 8.5, gpAchieve: 1.21, opAchieve: 1.69, yoy: 2.161, issue: '-' },
];

// Margin Waterfall (December 2025, 千円)
export const waterfallData = [
  { name: 'Revenue', value: 3003528, cumulative: 3003528, type: 'positive' },
  { name: 'COGS', value: -1644608, cumulative: 1358920, type: 'negative' },
  { name: 'Gross Profit', value: 1358920, cumulative: 1358920, type: 'subtotal' },
  { name: 'Personnel', value: -258038, cumulative: 1100882, type: 'negative' },
  { name: 'Other SGA', value: -461705, cumulative: 639177, type: 'negative' },
  { name: 'Admin', value: -171024, cumulative: 468153, type: 'negative' },
  { name: 'Engineer', value: -23845, cumulative: 444307, type: 'negative' },
  { name: 'OP', value: 444307, cumulative: 444307, type: 'total' },
];

// Margin Efficiency (conversion rates)
export const marginEfficiency = {
  revenueToGP: 0.452, // 45.2%
  gpToOP: 0.327, // 32.7% of GP becomes OP
  revenueToOP: 0.148, // 14.8%
  costBreakdown: {
    cogs: 54.8, // % of revenue
    personnel: 8.6,
    otherSGA: 15.4,
    admin: 5.7,
    engineer: 0.8,
    op: 14.8,
  },
};

// Trend Alerts (3-month moving average slope)
export const trendAlerts = [
  { metric: 'OP Margin', current: 0.148, ma3: 0.045, slope: -0.45, status: 'critical', trend: 'recovering' },
  { metric: 'GP Margin', current: 0.452, ma3: 0.442, slope: 0.02, status: 'ok', trend: 'stable' },
  { metric: 'OP Per Head', current: 896, ma3: 293, slope: 0.18, status: 'ok', trend: 'recovering' },
  { metric: 'GP Per Head', current: 2741, ma3: 2079, slope: 0.08, status: 'ok', trend: 'improving' },
  { metric: 'Headcount', current: 496, ma3: 495, slope: 0.01, status: 'ok', trend: 'stable' },
  { metric: 'Revenue', current: 3003528, ma3: 2343456, slope: 0.12, status: 'ok', trend: 'growing' },
];

// Monthly OP Trend (for crisis visualization)
export const opTrend = [
  { month: '2025/01', op: 39354, opMargin: 0.024 },
  { month: '2025/02', op: 35860, opMargin: 0.020 },
  { month: '2025/03', op: 201540, opMargin: 0.096 },
  { month: '2025/04', op: 106563, opMargin: 0.064 },
  { month: '2025/05', op: 48091, opMargin: 0.028 },
  { month: '2025/06', op: 210414, opMargin: 0.091 },
  { month: '2025/07', op: 18978, opMargin: 0.010 },
  { month: '2025/08', op: 61393, opMargin: 0.032 },
  { month: '2025/09', op: 438085, opMargin: 0.165 },
  { month: '2025/10', op: -16341, opMargin: -0.009 },
  { month: '2025/11', op: -9320, opMargin: -0.004 },
  { month: '2025/12', op: 444307, opMargin: 0.148 },
];

// Action Items (data-driven recommendations)
export const actionItems = [
  {
    priority: 1,
    level: 'critical',
    action: 'AnyReach黒字化計画策定',
    target: 'AnyReach',
    currentState: 'OP赤字 ¥-57M、達成率-133%',
    expectedImpact: 'OP +¥60M',
    timeline: '即時着手',
  },
  {
    priority: 2,
    level: 'critical',
    action: 'D2C Creator赤字解消',
    target: 'D2C Creator',
    currentState: 'OP赤字 ¥-239M、達成率-577%',
    expectedImpact: 'OP +¥250M',
    timeline: '即時着手',
  },
  {
    priority: 3,
    level: 'high',
    action: 'ENGAWA収益構造改善',
    target: 'ENGAWA',
    currentState: 'OP赤字 ¥-191M、達成率-125%',
    expectedImpact: 'OP +¥200M',
    timeline: 'Q1 2026',
  },
  {
    priority: 4,
    level: 'high',
    action: 'PG App成長戦略見直し',
    target: 'PG App',
    currentState: 'OP達成率4%、YoY-64%',
    expectedImpact: 'OP +¥50M',
    timeline: 'Q1 2026',
  },
  {
    priority: 5,
    level: 'medium',
    action: 'BC/CG成功パターン横展開',
    target: '全社',
    currentState: 'BC/CGが高成長・高利益達成',
    expectedImpact: 'GP +5%',
    timeline: 'Q2 2026',
  },
  {
    priority: 6,
    level: 'medium',
    action: '人件費効率化',
    target: '全社',
    currentState: 'OP Per Head -11.8% YoY',
    expectedImpact: 'Per Head +10%',
    timeline: 'Q2 2026',
  },
];

// ==========================================
// BU-level Bottleneck Analysis (v2)
// ==========================================

// 4軸評価: 収益性、成長性、効率性、達成度
export interface BUBottleneck {
  bu: string;
  profitability: { score: number; status: 'ok' | 'warning' | 'critical'; issue: string | null; detail: string };
  growth: { score: number; status: 'ok' | 'warning' | 'critical'; issue: string | null; detail: string };
  efficiency: { score: number; status: 'ok' | 'warning' | 'critical'; issue: string | null; detail: string };
  achievement: { score: number; status: 'ok' | 'warning' | 'critical'; issue: string | null; detail: string };
  primaryBottleneck: 'profitability' | 'growth' | 'efficiency' | 'achievement' | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  opAmount: number; // OP金額（千円）
  // Factベースインサイト
  insights: {
    summary: string;           // Factベースの1行サマリー
    keyMetrics: string[];      // データから取得した数値指標
    trend: string;             // 月次データからの客観的傾向
    riskLevel: string;         // 数値に基づくリスク評価
  };
}

export const buBottlenecks: BUBottleneck[] = [
  {
    bu: 'BC',
    profitability: { score: 95, status: 'ok', issue: null, detail: 'OP率 9.0%' },
    growth: { score: 90, status: 'ok', issue: null, detail: 'YoY +116.1%' },
    efficiency: { score: 88, status: 'ok', issue: null, detail: 'OP/Head ¥606K (+231%)' },
    achievement: { score: 92, status: 'ok', issue: null, detail: 'OP達成率 169%' },
    primaryBottleneck: null,
    severity: 'low',
    opAmount: 164219,
    insights: {
      summary: 'GP達成率294%、OP達成率751%で全BU最高の超過達成',
      keyMetrics: [
        'YoY +116.1%（売上前年比2.16倍）',
        'OP率 14.8%',
        '1人当たりOP ¥2,741K',
        'GP予算 ¥83.6M → 実績 ¥196.7M（達成率235%）',
      ],
      trend: '年間を通じて右肩上がり、12月に過去最高を記録',
      riskLevel: '低（全指標で予算超過）',
    },
  },
  {
    bu: 'CG',
    profitability: { score: 90, status: 'ok', issue: null, detail: 'OP率 17.0%' },
    growth: { score: 85, status: 'ok', issue: null, detail: 'YoY +96.7%' },
    efficiency: { score: 92, status: 'ok', issue: null, detail: 'OP/Head ¥6,104K' },
    achievement: { score: 95, status: 'ok', issue: null, detail: 'OP達成率 428%' },
    primaryBottleneck: null,
    severity: 'low',
    opAmount: 376199,
    insights: {
      summary: 'GP達成率516%、OP達成率177%で予算を大幅超過',
      keyMetrics: [
        'YoY +96.7%（売上前年比1.97倍）',
        'OP率 16.7%（全BU最高収益率）',
        '1人当たりOP ¥8,131K（全BU最高効率）',
        'GP予算 ¥23.6M → 実績 ¥121.5M（達成率516%）',
      ],
      trend: '年間を通じて高成長を維持',
      riskLevel: '低（全指標で予算超過）',
    },
  },
  {
    bu: 'GROVE',
    profitability: { score: 85, status: 'ok', issue: null, detail: 'OP率 6.3%' },
    growth: { score: 80, status: 'ok', issue: null, detail: 'YoY +29.8%' },
    efficiency: { score: 78, status: 'ok', issue: null, detail: 'OP/Head ¥265K (+3.9%)' },
    achievement: { score: 90, status: 'ok', issue: null, detail: 'OP達成率 300%' },
    primaryBottleneck: null,
    severity: 'low',
    opAmount: 259537,
    insights: {
      summary: 'GP達成率182%、OP達成率187%で安定成長',
      keyMetrics: [
        'YoY +29.8%',
        'OP率 6.3%',
        'OP達成率 300%',
        'GP予算 ¥107.6M → 実績 ¥195.2M（達成率182%）',
      ],
      trend: 'Q3以降に成長加速、12月は好調',
      riskLevel: '低（全指標で予算超過）',
    },
  },
  {
    bu: 'LYFT',
    profitability: { score: 75, status: 'ok', issue: null, detail: 'OP率 3.8%' },
    growth: { score: 25, status: 'critical', issue: '成長性', detail: 'YoY -65.0%' },
    efficiency: { score: 70, status: 'ok', issue: null, detail: 'OP/Head ¥126K (+10.5%)' },
    achievement: { score: 82, status: 'ok', issue: null, detail: 'OP達成率 159%' },
    primaryBottleneck: 'growth',
    severity: 'high',
    opAmount: 69671,
    insights: {
      summary: 'YoY -65.0%で全BU中最大の減収、OP達成率は159%で黒字維持',
      keyMetrics: [
        'YoY -65.0%（売上前年比0.35倍）',
        'OP率 3.8%',
        'GP達成率 105.8%（予算クリア）',
        'OP達成率 159%（予算超過）',
      ],
      trend: '売上は減少傾向だが、利益は予算をクリア',
      riskLevel: '中（成長性に課題、収益性は維持）',
    },
  },
  {
    bu: 'BM',
    profitability: { score: 72, status: 'ok', issue: null, detail: 'OP率 11.9%' },
    growth: { score: 55, status: 'warning', issue: null, detail: 'YoY -19.8%' },
    efficiency: { score: 50, status: 'warning', issue: null, detail: 'OP/Head ¥477K (-39%)' },
    achievement: { score: 40, status: 'critical', issue: '達成度', detail: 'OP達成率 56%' },
    primaryBottleneck: 'achievement',
    severity: 'high',
    opAmount: 577662,
    insights: {
      summary: 'OP達成率56%で予算大幅未達、YoY -19.8%で減収',
      keyMetrics: [
        'YoY -19.8%',
        'OP率 11.9%（黒字維持）',
        'GP達成率 83.7%',
        'OP達成率 56%（予算の44%未達）',
        '1人当たりOP ¥477K（-39%）',
      ],
      trend: '年間を通じて予算未達が継続',
      riskLevel: '高（達成度・効率に課題）',
    },
  },
  {
    bu: 'PG Web',
    profitability: { score: 70, status: 'ok', issue: null, detail: 'OP率 11.2%' },
    growth: { score: 50, status: 'warning', issue: '成長性', detail: 'YoY -25.0%' },
    efficiency: { score: 55, status: 'warning', issue: null, detail: 'OP/Head ¥1,159K (-28.5%)' },
    achievement: { score: 60, status: 'warning', issue: null, detail: 'OP達成率 82%' },
    primaryBottleneck: 'growth',
    severity: 'medium',
    opAmount: 591404,
    insights: {
      summary: 'YoY -25.0%で減収、OP達成率82%で予算未達',
      keyMetrics: [
        'YoY -25.0%',
        'OP率 11.2%（黒字維持）',
        'GP達成率 84.9%',
        'OP達成率 82%',
        '1人当たりOP ¥1,159K（-28.5%）',
      ],
      trend: '緩やかな下落傾向',
      riskLevel: '中（成長性に課題、収益性は維持）',
    },
  },
  {
    bu: 'PG App',
    profitability: { score: 45, status: 'warning', issue: null, detail: 'OP率 0.6%' },
    growth: { score: 20, status: 'critical', issue: '成長性', detail: 'YoY -63.9%' },
    efficiency: { score: 50, status: 'warning', issue: null, detail: 'OP/Head ¥61K' },
    achievement: { score: 5, status: 'critical', issue: '達成度', detail: 'OP達成率 4%' },
    primaryBottleneck: 'achievement',
    severity: 'critical',
    opAmount: 7975,
    insights: {
      summary: 'OP達成率4%で予算の96%未達、YoY -63.9%で急減',
      keyMetrics: [
        'YoY -63.9%（売上前年比0.36倍）',
        'OP率 0.6%（かろうじて黒字）',
        'GP達成率 84.5%',
        'OP達成率 4%（予算の96%未達）',
        '1人当たりOP ¥61K',
      ],
      trend: '年間を通じて急激な悪化',
      riskLevel: '危機的（達成度・成長性ともに深刻）',
    },
  },
  {
    bu: 'DX / AI',
    profitability: { score: 55, status: 'warning', issue: null, detail: 'OP率 3.1%' },
    growth: { score: 45, status: 'warning', issue: null, detail: 'YoY -34.5%' },
    efficiency: { score: 65, status: 'ok', issue: null, detail: 'OP/Head ¥84K (+120%)' },
    achievement: { score: 25, status: 'critical', issue: '達成度', detail: 'OP達成率 40%' },
    primaryBottleneck: 'achievement',
    severity: 'critical',
    opAmount: 18406,
    insights: {
      summary: 'OP達成率40%で予算大幅未達、YoY -34.5%',
      keyMetrics: [
        'YoY -34.5%',
        'OP率 3.1%（黒字維持）',
        'GP達成率 81.2%',
        'OP達成率 40%（予算の60%未達）',
        '1人当たりOP ¥84K（+120%改善）',
      ],
      trend: '効率は改善傾向、売上は減少',
      riskLevel: '高（達成度に課題、効率は改善中）',
    },
  },
  {
    bu: 'D2C CR',
    profitability: { score: 10, status: 'critical', issue: '収益性', detail: 'OP率 -15.7%（赤字）' },
    growth: { score: 40, status: 'warning', issue: null, detail: 'YoY -42.5%' },
    efficiency: { score: 35, status: 'critical', issue: null, detail: 'OP/Head ¥-780K' },
    achievement: { score: 0, status: 'critical', issue: null, detail: 'OP達成率 -577%' },
    primaryBottleneck: 'profitability',
    severity: 'critical',
    opAmount: -238775,
    insights: {
      summary: 'OP率-15.7%で赤字、YoY -42.5%で大幅減収',
      keyMetrics: [
        'YoY -42.5%',
        'OP率 -15.7%（赤字）',
        'OP -¥239M',
        'GP達成率 75.8%',
        '1人当たりOP -¥780K',
      ],
      trend: '年間を通じて悪化、赤字幅拡大',
      riskLevel: '危機的（収益性・成長性ともに深刻）',
    },
  },
  {
    bu: 'ENGAWA',
    profitability: { score: 15, status: 'critical', issue: '収益性', detail: 'OP率 -18.4%（赤字）' },
    growth: { score: 85, status: 'ok', issue: null, detail: 'YoY +120.5%' },
    efficiency: { score: 20, status: 'critical', issue: null, detail: 'OP/Head ¥-272K (-597%)' },
    achievement: { score: 0, status: 'critical', issue: null, detail: 'OP達成率 -125%' },
    primaryBottleneck: 'profitability',
    severity: 'critical',
    opAmount: -190559,
    insights: {
      summary: 'OP率-18.4%で赤字、ただしYoY +120.5%で急成長中',
      keyMetrics: [
        'YoY +120.5%（売上前年比2.2倍）',
        'OP率 -18.4%（赤字）',
        'OP -¥191M',
        'GP達成率 83.3%',
        '1人当たりOP -¥272K（-597%）',
      ],
      trend: '売上急成長も利益が追いつかず',
      riskLevel: '危機的（収益性に深刻な課題）',
    },
  },
  {
    bu: 'AnyReach',
    profitability: { score: 10, status: 'critical', issue: '収益性', detail: 'OP率 -27.3%（赤字）' },
    growth: { score: 95, status: 'ok', issue: null, detail: 'YoY +304.0%' },
    efficiency: { score: 15, status: 'critical', issue: null, detail: 'OP/Head ¥-329K' },
    achievement: { score: 0, status: 'critical', issue: null, detail: 'OP達成率 -133%' },
    primaryBottleneck: 'profitability',
    severity: 'critical',
    opAmount: -56818,
    insights: {
      summary: 'OP率-27.3%で赤字、YoY +304.0%で急成長中',
      keyMetrics: [
        'YoY +304.0%（売上前年比4倍）',
        'OP率 -27.3%（赤字）',
        'OP -¥57M',
        'GP達成率 79.9%',
        '1人当たりOP -¥329K',
      ],
      trend: '売上急成長も赤字継続',
      riskLevel: '危機的（新規事業、収益化が課題）',
    },
  },
];

// 全体ボトルネック集計
export const overallBottlenecks = {
  byType: {
    profitability: {
      label: '収益性',
      count: 3,
      bus: ['D2C CR', 'ENGAWA', 'AnyReach'],
      impact: -486152, // 千円
      description: '3事業部がOP赤字',
    },
    achievement: {
      label: '達成度',
      count: 3,
      bus: ['PG App', 'DX / AI', 'BM'],
      impact: -300000, // 推定未達額
      description: '3事業部がOP達成50%未満',
    },
    growth: {
      label: '成長性',
      count: 2,
      bus: ['LYFT', 'PG Web'],
      impact: null,
      description: '2事業部がYoY大幅減',
    },
    efficiency: {
      label: '効率性',
      count: 0,
      bus: [],
      impact: null,
      description: '該当なし',
    },
  },
  primary: 'profitability',
  secondary: 'achievement',
  conclusion: '最大のボトルネックは【収益性】。D2C CR・ENGAWA・AnyReachの3事業部が赤字で、合計¥-486Mの営業損失を計上。',
};

// 課題タイプラベル
export const bottleneckTypeLabels = {
  profitability: '収益性',
  growth: '成長性',
  efficiency: '効率性',
  achievement: '達成度',
};

// ==========================================
// Slide Data (slides 04-11 dynamic generation)
// ==========================================

// slide-05: 営業利益内訳サマリー（2024 vs 2025、百万円）
export const opBreakdown = {
  items: [
    { name: '売上高', y2024: 20823, y2025: 24728, yoy: 0.19 },
    { name: '原価', y2024: 11761, y2025: 13508, yoy: 0.15 },
    { name: '人件費', y2024: 2294, y2025: 2869, yoy: 0.25 },
    { name: '業務委託費', y2024: 866, y2025: 1123, yoy: 0.30 },
    { name: '広告宣伝費', y2024: 1001, y2025: 1122, yoy: 0.12 },
    { name: 'IT費用', y2024: 728, y2025: 766, yoy: 0.05 },
    { name: 'その他', y2024: 891, y2025: 1504, yoy: 0.69 },
    { name: '管理部門コスト', y2024: 1332, y2025: 1840, yoy: 0.38 },
    { name: 'エンジニアコスト', y2024: 464, y2025: 418, yoy: -0.09 },
    { name: '営業利益', y2024: 1486, y2025: 1579, yoy: 0.06 },
  ],
  notes: [
    '販管費は概ね通常の範囲で推移し、全体で27%の増加。',
    '管理部門コスト増の主因：30階増床に伴う費用増',
  ],
};

// slide-06/07: 月別一人当たり粗利/営業利益（千円）
export const monthlyPerHead = {
  gp: [
    { month: '1月', y2024: 1766, y2025: 1743 },
    { month: '2月', y2024: 2061, y2025: 1785 },
    { month: '3月', y2024: 1795, y2025: 2061 },
    { month: '4月', y2024: 1785, y2025: 1795 },
    { month: '5月', y2024: 2113, y2025: 1785 },
    { month: '6月', y2024: 1690, y2025: 2113 },
    { month: '7月', y2024: 1841, y2025: 1690 },
    { month: '8月', y2024: 2725, y2025: 1841 },
    { month: '9月', y2024: 1624, y2025: 2725 },
    { month: '10月', y2024: 1872, y2025: 1624 },
    { month: '11月', y2024: 2741, y2025: 1872 },
    { month: '12月', y2024: 2163, y2025: 2741 },
  ],
  op: [
    { month: '1月', y2024: 96, y2025: 84 },
    { month: '2月', y2024: 452, y2025: 229 },
    { month: '3月', y2024: 101, y2025: 452 },
    { month: '4月', y2024: 39, y2025: 101 },
    { month: '5月', y2024: 436, y2025: 39 },
    { month: '6月', y2024: 127, y2025: 436 },
    { month: '7月', y2024: 910, y2025: 127 },
    { month: '8月', y2024: -33, y2025: 910 },
    { month: '9月', y2024: -18, y2025: -33 },
    { month: '10月', y2024: 896, y2025: -18 },
    { month: '11月', y2024: 426, y2025: 896 },
    { month: '12月', y2024: 551, y2025: 426 },
  ],
  summary: {
    gp: { y2024: 1910, y2025: 1980, target: 2205, yoy: 0.036, achievement: 0.90 },
    op: { y2024: 314, y2025: 277, target: 321, yoy: -0.118, achievement: 0.86 },
  },
  notes: {
    gp: '2025年累計の一人当たり粗利は前年比+3.6%の1,980千円と着実に増加。各部署の前年比はP.8ページをご参照ください。',
    op: '2025年累計の一人当たり営業利益は前年比△11.8%の277千円。9月と12月の数値変動が大きく、月次のブレが顕著。各部署の前年比はP.8ページをご参照ください。',
  },
};

// slide-09: マイナス要因分析
export const negativeFactorAnalysis = [
  {
    unit: 'ENGAWA',
    gpPerHead24: 939,
    gpPerHead25: 818,
    gpGrowth: -0.129,
    opPerHead24: -39,
    opPerHead25: -272,
    opGrowth: -5.974,
    gpReason: 'ECの移管に伴う高粗利案件の減少、CBMの大型案件不足、25年の中途採用メンバーの立ち上がり影響により、一人当たり粗利が低下。',
    opReason: '一人当たり粗利の低下に加え、24年度に未計上だった管理部門費用が25年度に反映されたことで、一人当たり営業利益が押し下げられた。',
  },
  {
    unit: 'PG Web',
    gpPerHead24: 3265,
    gpPerHead25: 2914,
    gpGrowth: -0.108,
    opPerHead24: 1622,
    opPerHead25: 1159,
    opGrowth: -0.285,
    gpReason: 'Videoポリシー厳格化を含む既存媒体の収益性低下により一人当たり粗利が減少。ロールアップを含む新規事業への人員配置転換も影響。ただし、25年10〜12月には改善傾向が見られる。',
    opReason: 'ポリシー厳格化による粗利低下に加え、ロールアップ投資を含めた販管費の増加により、一人当たり営業利益がさらに低下。ただし、25年10〜12月は改善傾向。',
  },
  {
    unit: 'BM',
    gpPerHead24: 2072,
    gpPerHead25: 1869,
    gpGrowth: -0.098,
    opPerHead24: 782,
    opPerHead25: 477,
    opGrowth: -0.390,
    gpReason: '粗利率が前年比で約1pt低下し、特にiHerb（54%→45%）の下落が一人当たり粗利減少に影響。',
    opReason: '一人当たり粗利の減少と業務委託費の急増（+116%）により、一人当たり営業利益が低下。',
  },
  {
    unit: 'LYFT',
    gpPerHead24: 2186,
    gpPerHead25: 2141,
    gpGrowth: -0.021,
    opPerHead24: 114,
    opPerHead25: 126,
    opGrowth: 0.105,
    gpReason: '渋谷店、横浜店の拡大による人員増、また各事業の人員強化により一人当たり粗利は微減、広告費適正化と売上増加による固定費コストのカバーで25年度は一人当たり営業利益が改善。',
    opReason: null,
  },
  {
    unit: 'CG',
    gpPerHead24: null,
    gpPerHead25: null,
    gpGrowth: null,
    opPerHead24: 6550,
    opPerHead25: 6104,
    opGrowth: -0.068,
    gpReason: null,
    opReason: 'BGM事業においてYouTubeから収益がなくなったことによる粗利及び営業利益の低下。',
  },
];

// slide-10: 月別粗利達成率
export const monthlyGpAchievement = [
  { month: 'Jan', actual: 724495, target: 717000, rate: 1.01 },
  { month: 'Feb', actual: 741645, target: 812000, rate: 0.91 },
  { month: 'Mar', actual: 919204, target: 940000, rate: 0.98 },
  { month: 'Apr', actual: 836230, target: 880000, rate: 0.95 },
  { month: 'May', actual: 847073, target: 865000, rate: 0.95 },
  { month: 'Jun', actual: 1019494, target: 990000, rate: 1.03 },
  { month: 'Jul', actual: 814123, target: 925000, rate: 0.88 },
  { month: 'Aug', actual: 891344, target: 1000000, rate: 0.89 },
  { month: 'Sep', actual: 1311678, target: 1120000, rate: 1.17 },
  { month: 'Oct', actual: 806377, target: 1045000, rate: 0.77 },
  { month: 'Nov', actual: 949779, target: 1155000, rate: 0.82 },
  { month: 'Dec', actual: 1358920, target: 1258000, rate: 1.08 },
];

// slide-10: 粗利達成サマリー
export const gpAchievementSummary = {
  target: 11737,  // 百万円
  actual: 11220,  // 百万円
  rate: 0.96,     // 96%
};
