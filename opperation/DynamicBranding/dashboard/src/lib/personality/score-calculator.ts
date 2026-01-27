/**
 * Brand Personality 5軸スコア算出
 *
 * UGC投稿をスキャンし、キーワード頻度からスコアを算出
 */

import {
  KEYWORD_DICTIONARY,
  getFlatKeywords,
  PersonalityAxis,
  KeywordEntry,
} from "./keyword-dictionary";

/**
 * 軸ごとのスコア結果
 */
export interface AxisScoreResult {
  score: number; // 0-100 正規化スコア
  rawScore: number; // 生スコア（重み付き合計）
  matchCount: number; // マッチした投稿数
  keywordCounts: Record<string, number>; // キーワード別出現回数
  topKeywords: Array<{ word: string; count: number }>; // 上位キーワード
  evidence: string[]; // 根拠となる投稿サンプル（最大5件）
}

/**
 * 全軸のスコア結果
 */
export interface PersonalityScores {
  intellect: AxisScoreResult;
  innovation: AxisScoreResult;
  warmth: AxisScoreResult;
  reliability: AxisScoreResult;
  boldness: AxisScoreResult;
  totalPostsAnalyzed: number;
}

/**
 * 単一軸のスコアを算出
 */
export function calculateAxisScore(
  posts: string[],
  axis: PersonalityAxis
): AxisScoreResult {
  const keywords = getFlatKeywords(axis);
  const keywordCounts: Record<string, number> = {};
  const evidence: string[] = [];
  let rawScore = 0;
  let matchCount = 0;

  // 全キーワードの出現回数を初期化
  for (const kw of keywords) {
    keywordCounts[kw.word] = 0;
  }

  // 各投稿をスキャン
  for (const post of posts) {
    if (!post) continue;

    let postMatched = false;

    for (const kw of keywords) {
      // 部分一致でカウント（大文字小文字区別なし）
      const regex = new RegExp(kw.word, "gi");
      const matches = post.match(regex);

      if (matches) {
        const count = matches.length;
        keywordCounts[kw.word] += count;
        rawScore += kw.points * count;
        postMatched = true;
      }
    }

    // マッチした投稿を根拠として保存（最大5件）
    if (postMatched) {
      matchCount++;
      if (evidence.length < 5) {
        evidence.push(post.slice(0, 150));
      }
    }
  }

  // 上位キーワードを抽出
  const topKeywords = Object.entries(keywordCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // スコア正規化（0-100）
  // 方法: マッチ率ベース + 強度ベースのハイブリッド
  // - マッチ率: どれだけの投稿がこの軸に関連しているか (0-50点)
  // - 強度: マッチした投稿あたりの平均ポイント (0-50点)
  const matchRate = posts.length > 0 ? matchCount / posts.length : 0;
  const intensity = matchCount > 0 ? rawScore / matchCount : 0;

  // マッチ率スコア: 10%以上で50点満点
  const matchRateScore = Math.min(50, Math.round(matchRate * 500));

  // 強度スコア: 平均3点以上で50点満点
  const intensityScore = Math.min(50, Math.round((intensity / 3) * 50));

  const normalizedScore = matchRateScore + intensityScore;

  return {
    score: normalizedScore,
    rawScore,
    matchCount,
    keywordCounts,
    topKeywords,
    evidence,
  };
}

/**
 * 全5軸のスコアを算出
 */
export function calculateAllScores(posts: string[]): PersonalityScores {
  const axes: PersonalityAxis[] = [
    "intellect",
    "innovation",
    "warmth",
    "reliability",
    "boldness",
  ];

  const scores: Partial<PersonalityScores> = {
    totalPostsAnalyzed: posts.length,
  };

  for (const axis of axes) {
    scores[axis] = calculateAxisScore(posts, axis);
  }

  return scores as PersonalityScores;
}

/**
 * スコアをシンプルな数値オブジェクトに変換
 */
export function getSimpleScores(
  scores: PersonalityScores
): Record<PersonalityAxis, number> {
  return {
    intellect: scores.intellect.score,
    innovation: scores.innovation.score,
    warmth: scores.warmth.score,
    reliability: scores.reliability.score,
    boldness: scores.boldness.score,
  };
}

/**
 * スコアの統計情報を取得
 */
export function getScoreStats(scores: PersonalityScores): {
  maxAxis: PersonalityAxis;
  minAxis: PersonalityAxis;
  avgScore: number;
  dominantAxes: PersonalityAxis[];
} {
  const simple = getSimpleScores(scores);
  const entries = Object.entries(simple) as [PersonalityAxis, number][];

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const maxAxis = sorted[0][0];
  const minAxis = sorted[sorted.length - 1][0];
  const avgScore = Math.round(
    entries.reduce((sum, [, score]) => sum + score, 0) / entries.length
  );

  // 平均+20以上の軸を支配的な軸とみなす
  const dominantAxes = entries
    .filter(([, score]) => score >= avgScore + 20)
    .map(([axis]) => axis);

  return { maxAxis, minAxis, avgScore, dominantAxes };
}
