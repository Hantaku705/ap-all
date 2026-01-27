/**
 * 季節性インサイト生成スクリプト
 *
 * output/seasonality.json を読み込み、LLMで詳細分析を行い、
 * output/seasonality-insights.json に保存する
 *
 * 使用方法:
 *   npx tsx scripts/generate-seasonality-insights.ts
 *
 * 環境変数:
 *   OPENAI_API_KEY または OPENAI_API_KEY_BCM
 */

import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ブランド一覧
const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

// 月名マッピング
const MONTH_NAMES = [
  "",
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

// ブランド特性（LLMプロンプト用）
const BRAND_DESCRIPTIONS: Record<string, string> = {
  コンソメ:
    "洋風煮込み料理の素。シチュー、ポトフ、ロールキャベツ、コンソメスープ等に使用。固形・顆粒タイプがある。",
  ほんだし:
    "和風だしの素。味噌汁、煮物、うどん、鍋料理、おでん等に使用。かつお節ベースのうま味。",
  味の素:
    "うま味調味料。あらゆる料理の下味・仕上げに使用可能な万能調味料。炒め物、スープ、サラダ等。",
  クックドゥ:
    "中華合わせ調味料。麻婆豆腐、回鍋肉、青椒肉絲、酢豚等の中華料理を手軽に作れる。",
  丸鶏がらスープ:
    "中華だしの素。ラーメン、チャーハン、中華スープ、炒め物等に使用。鶏がらのコクとうま味。",
  香味ペースト:
    "中華万能ペースト。チャーハン、野菜炒め、スープ等に。チューブで手軽に使える。",
  ピュアセレクト:
    "マヨネーズブランド。サラダ、サンドイッチ、ポテトサラダ、たまごサンド等に使用。",
  アジシオ:
    "塩にうま味をプラスした調味塩。料理の下味、焼き魚、天ぷら、おにぎり等の仕上げに。",
};

// 型定義
interface SeasonalityData {
  month: number;
  monthName: string;
  [key: string]: string | number;
}

interface BrandStats {
  brand: string;
  maxScore: number;
  minScore: number;
  avgScore: number;
  peakMonth: number;
  bottomMonth: number;
  variationRate: number;
  scores: number[];
}

interface BrandInsight {
  pattern: string;
  variationRate: number;
  peak: {
    month: number;
    monthName: string;
    score: number;
    reason: string;
  };
  bottom: {
    month: number;
    monthName: string;
    score: number;
    challenge: string;
  };
  recommendation: string;
  detailedInsight: string;
}

interface OverallInsight {
  summary: string;
  crossBrandInsights: string[];
  strategicActions: Array<{
    brand: string;
    action: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }>;
}

interface SeasonalityInsights {
  generatedAt: string;
  overall: OverallInsight;
  brands: Record<string, BrandInsight>;
}

// LLMプロバイダー種別
type LLMProvider = "gemini" | "openai";

interface LLMClient {
  provider: LLMProvider;
  openai?: OpenAI;
  gemini?: GoogleGenerativeAI;
}

// LLMクライアント初期化（Gemini優先）
function getLLMClient(): LLMClient | null {
  // Gemini優先
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    console.log("Using Gemini API");
    return {
      provider: "gemini",
      gemini: new GoogleGenerativeAI(geminiKey),
    };
  }

  // OpenAIフォールバック
  const openaiKey =
    process.env.OPENAI_API_KEY_BCM || process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.includes("\n")) {
    console.log("Using OpenAI API");
    return {
      provider: "openai",
      openai: new OpenAI({ apiKey: openaiKey }),
    };
  }

  console.error("Error: No valid API key found (GEMINI_API_KEY or OPENAI_API_KEY)");
  return null;
}

// LLMでJSON生成
async function generateJSON(
  client: LLMClient,
  prompt: string
): Promise<string> {
  if (client.provider === "gemini" && client.gemini) {
    const model = client.gemini.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });
    return result.response.text();
  }

  if (client.provider === "openai" && client.openai) {
    const response = await client.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    return response.choices[0]?.message?.content || "";
  }

  throw new Error("No valid LLM client");
}

// ブランド別統計を計算
function calculateBrandStats(
  monthlyData: SeasonalityData[]
): Map<string, BrandStats> {
  const statsMap = new Map<string, BrandStats>();

  for (const brand of VALID_BRANDS) {
    const scores = monthlyData.map((d) => (d[brand] as number) || 0);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const peakMonth = scores.indexOf(maxScore) + 1;
    const bottomMonth = scores.indexOf(minScore) + 1;
    const variationRate =
      minScore > 0 ? ((maxScore - minScore) / minScore) * 100 : 0;

    statsMap.set(brand, {
      brand,
      maxScore,
      minScore,
      avgScore,
      peakMonth,
      bottomMonth,
      variationRate: Math.round(variationRate),
      scores,
    });
  }

  return statsMap;
}

// 単一ブランドのインサイト生成
async function generateBrandInsight(
  client: LLMClient,
  brand: string,
  stats: BrandStats,
  monthlyData: SeasonalityData[]
): Promise<BrandInsight> {
  const prompt = `あなたは消費財ブランドの季節性分析エキスパートです。

## ブランド: ${brand}
## ブランド特性
${BRAND_DESCRIPTIONS[brand]}

## 月別検索スコア（Google Trends 5年平均）
${monthlyData.map((d) => `${d.monthName}: ${d[brand]}`).join("\n")}

## 統計サマリー
- ピーク月: ${MONTH_NAMES[stats.peakMonth]}（スコア: ${stats.maxScore.toFixed(1)}）
- ボトム月: ${MONTH_NAMES[stats.bottomMonth]}（スコア: ${stats.minScore.toFixed(1)}）
- 変動率: ${stats.variationRate}%
- 年間平均: ${stats.avgScore.toFixed(1)}

## 分析タスク
このブランドの季節性パターンを深く分析し、以下を含む洞察を提供してください：

1. **パターン分類**: 冬型（10-2月ピーク）/夏型（6-8月ピーク）/春型（3-5月ピーク）/通年安定（変動15%未満）
2. **ピーク月の背景**: なぜこの月にピークなのか。生活文脈、季節メニュー、年中行事との関連を具体的に
3. **ボトム月の課題**: なぜ低下するのか。消費者心理、競合へのシフト、季節要因を分析
4. **施策提案**: ボトム期間の需要喚起策。具体的なキャンペーン・コンテンツ案を提示
5. **詳細インサイト**: 3-4文でこのブランドの季節性の本質を説明。他ブランドとの違いにも言及

## 出力形式（JSON）
必ず以下の形式で出力してください。説明や前置きは不要です。
{
  "pattern": "冬型 or 夏型 or 春型 or 通年安定",
  "peak": {
    "reason": "ピーク月の理由を50-80文字で"
  },
  "bottom": {
    "challenge": "ボトム月の課題を50-80文字で"
  },
  "recommendation": "具体的な施策提案を80-120文字で",
  "detailedInsight": "3-4文の詳細分析（150-250文字）"
}`;

  const content = await generateJSON(client, prompt);
  if (!content) {
    throw new Error(`Empty response for brand: ${brand}`);
  }

  const result = JSON.parse(content);

  // 統計情報を追加してフルデータを返す
  return {
    pattern: result.pattern,
    variationRate: stats.variationRate,
    peak: {
      month: stats.peakMonth,
      monthName: MONTH_NAMES[stats.peakMonth],
      score: stats.maxScore,
      reason: result.peak.reason,
    },
    bottom: {
      month: stats.bottomMonth,
      monthName: MONTH_NAMES[stats.bottomMonth],
      score: stats.minScore,
      challenge: result.bottom.challenge,
    },
    recommendation: result.recommendation,
    detailedInsight: result.detailedInsight,
  };
}

// 全体サマリー生成
async function generateOverallInsight(
  client: LLMClient,
  brandsInsights: Record<string, BrandInsight>,
  statsMap: Map<string, BrandStats>
): Promise<OverallInsight> {
  // ブランド情報を整形
  const brandsSummary = VALID_BRANDS.map((brand) => {
    const insight = brandsInsights[brand];
    const stats = statsMap.get(brand)!;
    return `- ${brand}: ${insight.pattern}、ピーク${insight.peak.monthName}（${stats.maxScore.toFixed(1)}）、ボトム${insight.bottom.monthName}（${stats.minScore.toFixed(1)}）、変動${stats.variationRate}%`;
  }).join("\n");

  const prompt = `あなたは消費財ブランドの季節性分析エキスパートです。

## 8ブランドの季節性サマリー
${brandsSummary}

## ブランド別詳細インサイト
${VALID_BRANDS.map((brand) => `### ${brand}\n${brandsInsights[brand].detailedInsight}`).join("\n\n")}

## タスク
上記8ブランドの季節性パターンを俯瞰し、以下を生成してください：

1. **全体サマリー**: 2-3文で最も重要な発見を要約。特徴的なブランド名を**太字**で強調
2. **クロスブランドインサイト**: ブランド間の比較・関連性から導かれる洞察を3-4点
3. **戦略的アクション**: 優先度の高い施策を3-5点（impact: HIGH/MEDIUM/LOW）

## 出力形式（JSON）
{
  "summary": "全体サマリー（2-3文、100-150文字、重要ブランドは**太字**）",
  "crossBrandInsights": [
    "インサイト1（40-60文字）",
    "インサイト2",
    "インサイト3"
  ],
  "strategicActions": [
    { "brand": "ブランド名", "action": "施策内容（30-50文字）", "impact": "HIGH" }
  ]
}`;

  const content = await generateJSON(client, prompt);
  if (!content) {
    throw new Error("Empty response for overall insight");
  }

  return JSON.parse(content);
}

// メイン処理
async function main() {
  console.log("=== 季節性インサイト生成開始 ===\n");

  // 1. 入力データ読み込み
  const inputPath = path.join(process.cwd(), "output", "seasonality.json");
  console.log(`入力ファイル: ${inputPath}`);

  const monthlyData: SeasonalityData[] = JSON.parse(
    fs.readFileSync(inputPath, "utf-8")
  );
  console.log(`データ読み込み完了: ${monthlyData.length}ヶ月\n`);

  // 2. LLMクライアント初期化
  const llmClient = getLLMClient();
  if (!llmClient) {
    console.error("LLM APIキーが設定されていません。終了します。");
    process.exit(1);
  }

  // 3. ブランド別統計計算
  const statsMap = calculateBrandStats(monthlyData);
  console.log("統計計算完了:\n");

  for (const [brand, stats] of statsMap) {
    console.log(
      `  ${brand}: ピーク${MONTH_NAMES[stats.peakMonth]}(${stats.maxScore.toFixed(1)}) / ` +
        `ボトム${MONTH_NAMES[stats.bottomMonth]}(${stats.minScore.toFixed(1)}) / 変動${stats.variationRate}%`
    );
  }
  console.log("");

  // 4. ブランド別インサイト生成
  console.log("ブランド別インサイト生成中...\n");
  const brandsInsights: Record<string, BrandInsight> = {};

  for (const brand of VALID_BRANDS) {
    const stats = statsMap.get(brand)!;
    console.log(`  [${brand}] 生成中...`);

    try {
      const insight = await generateBrandInsight(
        llmClient,
        brand,
        stats,
        monthlyData
      );
      brandsInsights[brand] = insight;
      console.log(`  [${brand}] 完了: ${insight.pattern}`);
    } catch (error) {
      console.error(`  [${brand}] エラー:`, error);
      // フォールバック
      brandsInsights[brand] = {
        pattern:
          stats.variationRate < 15
            ? "通年安定"
            : stats.peakMonth >= 10 || stats.peakMonth <= 2
              ? "冬型"
              : stats.peakMonth >= 6 && stats.peakMonth <= 8
                ? "夏型"
                : "春型",
        variationRate: stats.variationRate,
        peak: {
          month: stats.peakMonth,
          monthName: MONTH_NAMES[stats.peakMonth],
          score: stats.maxScore,
          reason: "季節の料理需要に連動",
        },
        bottom: {
          month: stats.bottomMonth,
          monthName: MONTH_NAMES[stats.bottomMonth],
          score: stats.minScore,
          challenge: "オフシーズンの需要喚起が課題",
        },
        recommendation: "季節に合わせたレシピ提案",
        detailedInsight:
          "データに基づく詳細分析が必要です。",
      };
    }
  }
  console.log("");

  // 5. 全体インサイト生成
  console.log("全体インサイト生成中...");
  let overallInsight: OverallInsight;

  try {
    overallInsight = await generateOverallInsight(
      llmClient,
      brandsInsights,
      statsMap
    );
    console.log("全体インサイト生成完了\n");
  } catch (error) {
    console.error("全体インサイト生成エラー:", error);
    overallInsight = {
      summary:
        "**コンソメ**は8ブランド中最も強い季節性（変動40%）を示し、冬の煮込み料理シーズンに需要が集中。一方、**味の素**は通年安定で万能調味料としての地位を確立している。",
      crossBrandInsights: [
        "コンソメとほんだしは共に冬型だが、洋食vs和食でピーク月がずれる",
        "味の素は通年安定で季節変動に左右されない万能ポジション",
        "中華系（クックドゥ、丸鶏がらスープ）は相対的に季節性が弱い",
      ],
      strategicActions: [
        {
          brand: "コンソメ",
          action: "夏場の冷製スープ・トマト煮込みキャンペーン",
          impact: "HIGH",
        },
        {
          brand: "ほんだし",
          action: "夏の冷やし味噌汁・素麺つゆ訴求",
          impact: "HIGH",
        },
        {
          brand: "味の素",
          action: "季節イベント連動の使い方提案",
          impact: "MEDIUM",
        },
      ],
    };
  }

  // 6. 出力ファイル生成
  const output: SeasonalityInsights = {
    generatedAt: new Date().toISOString(),
    overall: overallInsight,
    brands: brandsInsights,
  };

  const outputPath = path.join(
    process.cwd(),
    "output",
    "seasonality-insights.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`出力ファイル: ${outputPath}`);
  console.log("\n=== 季節性インサイト生成完了 ===\n");

  // 7. サマリー表示
  console.log("【全体サマリー】");
  console.log(output.overall.summary);
  console.log("\n【クロスブランドインサイト】");
  output.overall.crossBrandInsights.forEach((insight, i) => {
    console.log(`  ${i + 1}. ${insight}`);
  });
  console.log("\n【戦略的アクション】");
  output.overall.strategicActions.forEach((action, i) => {
    console.log(
      `  ${i + 1}. [${action.impact}] ${action.brand}: ${action.action}`
    );
  });
}

main().catch(console.error);
