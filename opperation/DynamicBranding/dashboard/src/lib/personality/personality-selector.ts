/**
 * Brand Personality 選定ロジック
 *
 * 5軸スコアからパーソナリティを選定
 */

import { PersonalityAxis } from "./keyword-dictionary";
import { PersonalityScores, getSimpleScores } from "./score-calculator";

/**
 * パーソナリティ候補定義
 */
export interface PersonalityCandidate {
  name: string;
  description: string;
  conditions: PersonalityCondition;
}

/**
 * 選定条件
 */
export interface PersonalityCondition {
  intellect?: { min?: number; max?: number };
  innovation?: { min?: number; max?: number };
  warmth?: { min?: number; max?: number };
  reliability?: { min?: number; max?: number };
  boldness?: { min?: number; max?: number };
}

/**
 * 選定結果
 */
export interface PersonalitySelection {
  personality: string;
  description: string;
  reason: string;
  matchedConditions: string[];
  scores: Record<PersonalityAxis, number>;
}

/**
 * パーソナリティ候補マトリクス
 * 優先度順に評価（最初にマッチしたものを採用）
 */
export const PERSONALITY_CANDIDATES: PersonalityCandidate[] = [
  // 知性 + 大胆さ = インテリのヘンタイ
  {
    name: "インテリのヘンタイ",
    description: "研究熱心でありながら大胆な発想を持つ知的冒険者",
    conditions: {
      intellect: { min: 70 },
      boldness: { min: 60 },
    },
  },

  // 親しみ + 信頼 = 頼れる実家の母
  {
    name: "頼れる実家の母",
    description: "いつでも温かく迎えてくれる安心の存在",
    conditions: {
      warmth: { min: 70 },
      reliability: { min: 70 },
    },
  },

  // 高信頼 + 低大胆 = 不動の番人
  {
    name: "不動の番人",
    description: "変わらない品質で支え続ける守護者",
    conditions: {
      reliability: { min: 80 },
      boldness: { max: 50 },
    },
  },

  // 革新性 + 大胆さ = 破壊的イノベーター
  {
    name: "破壊的イノベーター",
    description: "常識を覆す新しい価値を創造する挑戦者",
    conditions: {
      innovation: { min: 75 },
      boldness: { min: 70 },
    },
  },

  // 知性 + 信頼 = 信頼の職人
  {
    name: "信頼の職人",
    description: "確かな技術と知識で品質を追求する匠",
    conditions: {
      intellect: { min: 65 },
      reliability: { min: 70 },
    },
  },

  // 親しみ + 革新 = 親しみやすい革新者
  {
    name: "親しみやすい革新者",
    description: "新しいことを身近に届ける架け橋",
    conditions: {
      warmth: { min: 60 },
      innovation: { min: 60 },
    },
  },

  // 高知性 = 知的探究者
  {
    name: "知的探究者",
    description: "科学と研究で真実を追い求める探求者",
    conditions: {
      intellect: { min: 75 },
    },
  },

  // 高親しみ = 家庭の味方
  {
    name: "家庭の味方",
    description: "毎日の食卓を支える心強いパートナー",
    conditions: {
      warmth: { min: 70 },
    },
  },

  // 高信頼 = 安定の守護者
  {
    name: "安定の守護者",
    description: "変わらぬ品質で安心を届ける存在",
    conditions: {
      reliability: { min: 75 },
    },
  },

  // デフォルト
  {
    name: "バランス型パートナー",
    description: "多面的な価値を提供する頼れる存在",
    conditions: {},
  },
];

/**
 * 条件をチェック
 */
function checkCondition(
  scores: Record<PersonalityAxis, number>,
  conditions: PersonalityCondition
): { matched: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const axes: PersonalityAxis[] = [
    "intellect",
    "innovation",
    "warmth",
    "reliability",
    "boldness",
  ];

  for (const axis of axes) {
    const condition = conditions[axis];
    if (!condition) continue;

    const score = scores[axis];

    if (condition.min !== undefined && score < condition.min) {
      return { matched: false, reasons: [] };
    }

    if (condition.max !== undefined && score > condition.max) {
      return { matched: false, reasons: [] };
    }

    // 条件にマッチした理由を記録
    if (condition.min !== undefined) {
      reasons.push(`${axis}=${score} (>=${condition.min})`);
    }
    if (condition.max !== undefined) {
      reasons.push(`${axis}=${score} (<=${condition.max})`);
    }
  }

  return { matched: true, reasons };
}

/**
 * パーソナリティを選定
 */
export function selectPersonality(
  scores: PersonalityScores
): PersonalitySelection {
  const simpleScores = getSimpleScores(scores);

  for (const candidate of PERSONALITY_CANDIDATES) {
    const { matched, reasons } = checkCondition(
      simpleScores,
      candidate.conditions
    );

    if (matched) {
      // 選定理由を生成
      const scoreStr = Object.entries(simpleScores)
        .map(([axis, score]) => `${axis}=${score}`)
        .join(", ");

      const reason =
        reasons.length > 0
          ? `条件マッチ: ${reasons.join(", ")}`
          : "デフォルト選定";

      return {
        personality: candidate.name,
        description: candidate.description,
        reason: `${reason} [${scoreStr}]`,
        matchedConditions: reasons,
        scores: simpleScores,
      };
    }
  }

  // ここには到達しない（最後のcandidateは常にマッチする）
  return {
    personality: "バランス型パートナー",
    description: "多面的な価値を提供する頼れる存在",
    reason: "デフォルト選定",
    matchedConditions: [],
    scores: simpleScores,
  };
}

/**
 * 日本語の軸名を取得
 */
export function getAxisLabel(axis: PersonalityAxis): string {
  const labels: Record<PersonalityAxis, string> = {
    intellect: "知性",
    innovation: "革新性",
    warmth: "親しみやすさ",
    reliability: "信頼性",
    boldness: "挑戦心",
  };
  return labels[axis];
}
