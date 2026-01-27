/**
 * Brand Personality 5軸スコア算出用キーワード辞書
 *
 * 各軸に対応するキーワードを重み付きで定義
 * - high: +3点
 * - medium: +2点
 * - low: +1点
 */

export type PersonalityAxis =
  | "intellect"
  | "innovation"
  | "warmth"
  | "reliability"
  | "boldness";

export type KeywordWeight = "high" | "medium" | "low";

export interface KeywordEntry {
  word: string;
  weight: KeywordWeight;
  points: number;
}

export interface AxisKeywords {
  high: string[];
  medium: string[];
  low: string[];
}

/**
 * 5軸キーワード辞書
 */
export const KEYWORD_DICTIONARY: Record<PersonalityAxis, AxisKeywords> = {
  /**
   * intellect（知性）: 研究開発力、専門性、知的好奇心
   */
  intellect: {
    high: [
      "研究",
      "科学",
      "アミノ酸",
      "栄養",
      "開発",
      "技術",
      "成分",
      "製法",
      "特許",
      "学会",
      "論文",
      "エビデンス",
      "データ",
      "分析",
    ],
    medium: [
      "専門",
      "こだわり",
      "品質",
      "本格",
      "プロ",
      "匠",
      "職人",
      "伝統",
      "製造",
      "工場",
    ],
    low: ["知識", "勉強", "学ぶ", "調べ"],
  },

  /**
   * innovation（革新性）: 新しさへの挑戦、技術革新、先進性
   */
  innovation: {
    high: [
      "新しい",
      "初めて",
      "意外",
      "発見",
      "アレンジ",
      "オリジナル",
      "斬新",
      "革命",
      "進化",
      "最新",
    ],
    medium: [
      "変わった",
      "ユニーク",
      "工夫",
      "試し",
      "挑戦",
      "実験",
      "チャレンジ",
    ],
    low: ["違う", "珍しい", "独自"],
  },

  /**
   * warmth（親しみやすさ）: 家庭的、温かみ、アクセスのしやすさ
   */
  warmth: {
    high: [
      "家族",
      "子供",
      "子ども",
      "おばあちゃん",
      "おじいちゃん",
      "お母さん",
      "お父さん",
      "ママ",
      "パパ",
      "思い出",
      "懐かしい",
      "実家",
      "故郷",
    ],
    medium: [
      "毎日",
      "定番",
      "いつもの",
      "日常",
      "普段",
      "常備",
      "ストック",
      "欠かせない",
      "必需品",
    ],
    low: ["手軽", "簡単", "便利", "身近"],
  },

  /**
   * reliability（信頼性）: 安定感、実績、一貫性
   */
  reliability: {
    high: [
      "間違いない",
      "失敗しない",
      "リピート",
      "必ず",
      "絶対",
      "鉄板",
      "王道",
      "定番中の定番",
    ],
    medium: [
      "安定",
      "いつも同じ",
      "信頼",
      "安心",
      "確実",
      "保証",
      "老舗",
      "歴史",
      "伝統",
    ],
    low: ["無難", "普通", "標準"],
  },

  /**
   * boldness（挑戦心）: 冒険心、大胆さ、ユニークさ
   */
  boldness: {
    high: [
      "驚き",
      "すごい",
      "まさか",
      "やばい",
      "神",
      "最高",
      "感動",
      "衝撃",
      "びっくり",
      "想像以上",
    ],
    medium: [
      "面白い",
      "変わってる",
      "大胆",
      "冒険",
      "挑戦的",
      "攻めてる",
    ],
    low: ["ちょっと違う", "意外と"],
  },
};

/**
 * 重みから点数を取得
 */
export function getPoints(weight: KeywordWeight): number {
  switch (weight) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

/**
 * フラット化されたキーワードリストを取得
 */
export function getFlatKeywords(axis: PersonalityAxis): KeywordEntry[] {
  const axisKeywords = KEYWORD_DICTIONARY[axis];
  const entries: KeywordEntry[] = [];

  for (const weight of ["high", "medium", "low"] as KeywordWeight[]) {
    for (const word of axisKeywords[weight]) {
      entries.push({ word, weight, points: getPoints(weight) });
    }
  }

  return entries;
}

/**
 * 全軸のキーワード数を取得
 */
export function getKeywordStats(): Record<PersonalityAxis, number> {
  const axes: PersonalityAxis[] = [
    "intellect",
    "innovation",
    "warmth",
    "reliability",
    "boldness",
  ];

  const stats: Record<PersonalityAxis, number> = {} as Record<PersonalityAxis, number>;

  for (const axis of axes) {
    const kw = KEYWORD_DICTIONARY[axis];
    stats[axis] = kw.high.length + kw.medium.length + kw.low.length;
  }

  return stats;
}
