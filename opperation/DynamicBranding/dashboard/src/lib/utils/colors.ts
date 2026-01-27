// ブランドカラー定義
export const BRAND_COLORS: Record<string, string> = {
  ほんだし: "#E53935",
  クックドゥ: "#FB8C00",
  味の素: "#D81B60",
  丸鶏がらスープ: "#7CB342",
  香味ペースト: "#00897B",
  コンソメ: "#5E35B1",
  ピュアセレクト: "#039BE5",
  アジシオ: "#F4511E",
  コーポレート: "#4F46E5", // 企業情報（株価、CSR、採用など）
};

export const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
] as const;

export type BrandName = (typeof BRANDS)[number];

// 納得性の色定義
export const CONFIDENCE_COLORS = {
  A: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-800",
  },
  B: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-800",
  },
  C: {
    bg: "bg-red-100",
    border: "border-red-500",
    text: "text-red-800",
  },
} as const;

export type Confidence = keyof typeof CONFIDENCE_COLORS;
