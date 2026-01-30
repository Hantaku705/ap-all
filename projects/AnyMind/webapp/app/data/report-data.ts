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
