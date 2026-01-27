/**
 * 関連キーワードインサイト生成スクリプト
 *
 * output/keywords/*.json を読み込み、LLMで戦略的インサイトを生成し、
 * output/keyword-insights.json に保存する
 *
 * 使用方法:
 *   npx tsx scripts/generate-keyword-insights.ts
 *
 * 環境変数:
 *   GEMINI_API_KEY または OPENAI_API_KEY
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

// ブランド特性（LLMプロンプト用）
const BRAND_DESCRIPTIONS: Record<string, string> = {
  ほんだし:
    "和風だしの素。味噌汁、煮物、うどん、鍋料理、おでん等に使用。かつお節ベースのうま味。",
  クックドゥ:
    "中華合わせ調味料。麻婆豆腐、回鍋肉、青椒肉絲、酢豚等の中華料理を手軽に作れる。",
  味の素:
    "うま味調味料。あらゆる料理の下味・仕上げに使用可能な万能調味料。炒め物、スープ、サラダ等。",
  丸鶏がらスープ:
    "中華だしの素。ラーメン、チャーハン、中華スープ、炒め物等に使用。鶏がらのコクとうま味。",
  香味ペースト:
    "中華万能ペースト。チャーハン、野菜炒め、スープ等に。チューブで手軽に使える。",
  コンソメ:
    "洋風煮込み料理の素。シチュー、ポトフ、ロールキャベツ、コンソメスープ等に使用。固形・顆粒タイプがある。",
  ピュアセレクト:
    "マヨネーズブランド。サラダ、サンドイッチ、ポテトサラダ、たまごサンド等に使用。",
  アジシオ:
    "塩にうま味をプラスした調味塩。料理の下味、焼き魚、天ぷら、おにぎり等の仕上げに。",
};

// 型定義
interface KeywordData {
  keyword: string;
  queryType: "rising" | "top";
  value: string;
  extractedValue: number | null;
  rank: number;
  fetchDate: string;
  brand: string;
  brandColor: string;
}

interface CooccurrenceKeyword {
  keyword: string;
  brandCount: number;
  totalScore: number;
  brandNames: string[];
  brandColors: string[];
  analysisDate: string;
}

interface CooccurrenceData {
  keywords: CooccurrenceKeyword[];
  matrix: Record<string, Record<string, number>>;
  brands: string[];
}

interface ExclusiveKeyword {
  brand: string;
  keywords: string[];
  insight: string;
}

interface ContestedKeyword {
  keywords: string[];
  brands: string[];
  insight: string;
}

interface RisingKeywordAnalysis {
  keyword: string;
  status: string;
  brands: string[];
  background: string;
  recommendation: string;
}

interface StrategicAction {
  brand: string;
  action: string;
  type: "strengthen" | "capture" | "monitor";
  impact: "HIGH" | "MEDIUM" | "LOW";
}

interface BrandKeywordInsight {
  exclusiveKeywords: string[];
  sharedKeywords: string[];
  risingKeywords: string[];
  competitivePosition: string;
  recommendation: string;
}

interface KeywordInsights {
  generatedAt: string;
  overall: {
    summary: string;
    competitivePositioning: {
      exclusive: ExclusiveKeyword[];
      contested: ContestedKeyword[];
    };
    risingAnalysis: RisingKeywordAnalysis[];
    strategicActions: StrategicAction[];
  };
  brands: Record<string, BrandKeywordInsight>;
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

  console.error(
    "Error: No valid API key found (GEMINI_API_KEY or OPENAI_API_KEY)"
  );
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

// ブランド別キーワード統計を計算
function analyzeKeywordsByBrand(keywords: KeywordData[]): {
  brandKeywords: Map<string, Set<string>>;
  risingKeywords: KeywordData[];
  topKeywords: KeywordData[];
} {
  const brandKeywords = new Map<string, Set<string>>();
  const risingKeywords: KeywordData[] = [];
  const topKeywords: KeywordData[] = [];

  // ブランド別キーワードセットを構築
  for (const brand of VALID_BRANDS) {
    brandKeywords.set(brand, new Set());
  }

  for (const kw of keywords) {
    const brandSet = brandKeywords.get(kw.brand);
    if (brandSet) {
      brandSet.add(kw.keyword);
    }

    if (kw.queryType === "rising") {
      risingKeywords.push(kw);
    } else {
      topKeywords.push(kw);
    }
  }

  return { brandKeywords, risingKeywords, topKeywords };
}

// 独占キーワードと競合キーワードを分類
function classifyKeywords(
  brandKeywords: Map<string, Set<string>>,
  cooccurrences: CooccurrenceData
): {
  exclusive: Map<string, string[]>;
  contested: { keyword: string; brands: string[] }[];
} {
  const exclusive = new Map<string, string[]>();
  const contested: { keyword: string; brands: string[] }[] = [];

  // 初期化
  for (const brand of VALID_BRANDS) {
    exclusive.set(brand, []);
  }

  // 共起データから分類
  for (const kw of cooccurrences.keywords) {
    if (kw.brandCount === 1) {
      // 1ブランドのみ = 独占
      const brand = kw.brandNames[0];
      const list = exclusive.get(brand);
      if (list) {
        list.push(kw.keyword);
      }
    } else if (kw.brandCount >= 3) {
      // 3ブランド以上 = 激戦区
      contested.push({
        keyword: kw.keyword,
        brands: kw.brandNames,
      });
    }
  }

  return { exclusive, contested };
}

// 全体インサイト生成
async function generateOverallInsight(
  client: LLMClient,
  keywords: KeywordData[],
  cooccurrences: CooccurrenceData,
  classification: {
    exclusive: Map<string, string[]>;
    contested: { keyword: string; brands: string[] }[];
  }
): Promise<KeywordInsights["overall"]> {
  // データを整形
  const exclusiveList = Array.from(classification.exclusive.entries())
    .filter(([, kws]) => kws.length > 0)
    .map(([brand, kws]) => `- ${brand}: ${kws.slice(0, 5).join(", ")}`)
    .join("\n");

  const contestedList = classification.contested
    .slice(0, 10)
    .map((c) => `- 「${c.keyword}」: ${c.brands.join(", ")}`)
    .join("\n");

  const risingKeywords = keywords
    .filter((k) => k.queryType === "rising" && k.value === "Breakout")
    .slice(0, 10)
    .map((k) => `- 「${k.keyword}」(${k.brand})`)
    .join("\n");

  const prompt = `あなたは消費財ブランドの検索キーワード戦略アナリストです。

## 分析対象
8つの味の素ブランド: ${VALID_BRANDS.join(", ")}

## ブランド特性
${VALID_BRANDS.map((b) => `- ${b}: ${BRAND_DESCRIPTIONS[b]}`).join("\n")}

## データ概要
- 総キーワード数: ${keywords.length}
- Rising（急上昇）キーワード: ${keywords.filter((k) => k.queryType === "rising").length}
- Top（上位）キーワード: ${keywords.filter((k) => k.queryType === "top").length}

## 独占領域（1ブランドのみに関連）
${exclusiveList || "（なし）"}

## 激戦区（3ブランド以上で共通）
${contestedList || "（なし）"}

## Breakout（急上昇中）キーワード
${risingKeywords || "（なし）"}

## 分析タスク
上記データを戦略的に分析し、以下を生成してください：

1. **全体サマリー（2-3文）**: 最も重要な発見を要約。重要なブランド名やキーワードは「」で強調
2. **競合ポジショニング分析**:
   - exclusive: 各ブランドの独占領域（差別化の源泉）とその戦略的意味
   - contested: 激戦区キーワードと対応すべきブランド・施策
3. **Rising KW分析**: Breakoutキーワードの背景（なぜ伸びているか）と推奨アクション
4. **戦略アクション（5-7点）**: 優先度の高い施策をtype（strengthen=強化/capture=奪取/monitor=静観）とimpact（HIGH/MEDIUM/LOW）で分類

## 出力形式（JSON）
{
  "summary": "全体サマリー（2-3文、100-150文字）",
  "competitivePositioning": {
    "exclusive": [
      {"brand": "ほんだし", "keywords": ["だし", "和風"], "insight": "和食の基本調味料として独占的地位を確立（40-60文字）"}
    ],
    "contested": [
      {"keywords": ["時短", "簡単"], "brands": ["ほんだし", "クックドゥ", "香味ペースト"], "insight": "時短ニーズは全ブランド共通の激戦区。差別化訴求が必要（50-70文字）"}
    ]
  },
  "risingAnalysis": [
    {"keyword": "減塩", "status": "Breakout", "brands": ["ほんだし", "コンソメ"], "background": "健康志向の高まりで減塩ニーズ増加（30-50文字）", "recommendation": "減塩訴求コンテンツの拡充（30-50文字）"}
  ],
  "strategicActions": [
    {"brand": "ほんだし", "action": "「だし」関連コンテンツの拡充で独占領域を強化", "type": "strengthen", "impact": "HIGH"},
    {"brand": "クックドゥ", "action": "「時短×中華」の差別化訴求でポジション確立", "type": "strengthen", "impact": "HIGH"},
    {"brand": "全体", "action": "「減塩」トレンドへの対応コンテンツ開発", "type": "capture", "impact": "HIGH"}
  ]
}`;

  const content = await generateJSON(client, prompt);
  if (!content) {
    throw new Error("Empty response for overall insight");
  }

  return JSON.parse(content);
}

// ブランド別インサイト生成
async function generateBrandInsight(
  client: LLMClient,
  brand: string,
  keywords: KeywordData[],
  classification: {
    exclusive: Map<string, string[]>;
    contested: { keyword: string; brands: string[] }[];
  }
): Promise<BrandKeywordInsight> {
  const brandKws = keywords.filter((k) => k.brand === brand);
  const exclusiveKws = classification.exclusive.get(brand) || [];
  const sharedKws = classification.contested
    .filter((c) => c.brands.includes(brand))
    .map((c) => c.keyword);
  const risingKws = brandKws
    .filter((k) => k.queryType === "rising")
    .map((k) => k.keyword);

  const prompt = `あなたは消費財ブランドの検索キーワード戦略アナリストです。

## 分析対象ブランド: ${brand}
${BRAND_DESCRIPTIONS[brand]}

## このブランドのキーワードデータ
- 総キーワード数: ${brandKws.length}
- 独占キーワード: ${exclusiveKws.slice(0, 10).join(", ") || "なし"}
- 競合との共通キーワード: ${sharedKws.slice(0, 10).join(", ") || "なし"}
- Risingキーワード: ${risingKws.slice(0, 10).join(", ") || "なし"}

## タスク
このブランドの検索キーワードポジションを分析し、戦略的な示唆を提供してください。

## 出力形式（JSON）
{
  "competitivePosition": "このブランドの検索領域における競争ポジション（60-100文字）",
  "recommendation": "優先的に取り組むべき施策（80-120文字）"
}`;

  const content = await generateJSON(client, prompt);
  if (!content) {
    throw new Error(`Empty response for brand: ${brand}`);
  }

  const result = JSON.parse(content);

  return {
    exclusiveKeywords: exclusiveKws.slice(0, 10),
    sharedKeywords: sharedKws.slice(0, 10),
    risingKeywords: risingKws.slice(0, 10),
    competitivePosition: result.competitivePosition,
    recommendation: result.recommendation,
  };
}

// メイン処理
async function main() {
  console.log("=== 関連キーワードインサイト生成開始 ===\n");

  // 1. 入力データ読み込み
  const keywordsPath = path.join(
    process.cwd(),
    "output",
    "keywords",
    "all.json"
  );
  const cooccurrencesPath = path.join(
    process.cwd(),
    "output",
    "keywords",
    "cooccurrences.json"
  );

  console.log(`キーワードファイル: ${keywordsPath}`);
  console.log(`共起ファイル: ${cooccurrencesPath}`);

  const keywords: KeywordData[] = JSON.parse(
    fs.readFileSync(keywordsPath, "utf-8")
  );
  const cooccurrences: CooccurrenceData = JSON.parse(
    fs.readFileSync(cooccurrencesPath, "utf-8")
  );

  console.log(`\nデータ読み込み完了:`);
  console.log(`  - キーワード: ${keywords.length}件`);
  console.log(`  - 共起キーワード: ${cooccurrences.keywords.length}件\n`);

  // 2. LLMクライアント初期化
  const llmClient = getLLMClient();
  if (!llmClient) {
    console.error("LLM APIキーが設定されていません。終了します。");
    process.exit(1);
  }

  // 3. キーワード分類
  console.log("キーワード分類中...");
  const { brandKeywords, risingKeywords } = analyzeKeywordsByBrand(keywords);
  const classification = classifyKeywords(brandKeywords, cooccurrences);

  console.log(`  - 独占キーワード数: ${Array.from(classification.exclusive.values()).reduce((a, b) => a + b.length, 0)}件`);
  console.log(`  - 激戦区キーワード数: ${classification.contested.length}件`);
  console.log(`  - Risingキーワード数: ${risingKeywords.length}件\n`);

  // 4. 全体インサイト生成
  console.log("全体インサイト生成中...");
  let overallInsight: KeywordInsights["overall"];

  try {
    overallInsight = await generateOverallInsight(
      llmClient,
      keywords,
      cooccurrences,
      classification
    );
    console.log("全体インサイト生成完了\n");
  } catch (error) {
    console.error("全体インサイト生成エラー:", error);
    // フォールバック
    overallInsight = {
      summary:
        "「だし」「調味料」「レシピ」は全ブランド共通の激戦区キーワード。一方、「味噌汁」はほんだし、「中華」はクックドゥが優位性を持つ。",
      competitivePositioning: {
        exclusive: [
          {
            brand: "ほんだし",
            keywords: ["味噌汁", "和風だし"],
            insight: "和食の基本調味料として独占的地位を確立",
          },
        ],
        contested: [
          {
            keywords: ["レシピ", "簡単"],
            brands: ["ほんだし", "クックドゥ", "味の素"],
            insight: "レシピ検索は全ブランド共通の激戦区",
          },
        ],
      },
      risingAnalysis: [],
      strategicActions: [
        {
          brand: "全体",
          action: "レシピコンテンツの差別化が急務",
          type: "strengthen",
          impact: "HIGH",
        },
      ],
    };
  }

  // 5. ブランド別インサイト生成
  console.log("ブランド別インサイト生成中...\n");
  const brandsInsights: Record<string, BrandKeywordInsight> = {};

  for (const brand of VALID_BRANDS) {
    console.log(`  [${brand}] 生成中...`);

    try {
      const insight = await generateBrandInsight(
        llmClient,
        brand,
        keywords,
        classification
      );
      brandsInsights[brand] = insight;
      console.log(`  [${brand}] 完了`);
    } catch (error) {
      console.error(`  [${brand}] エラー:`, error);
      // フォールバック
      brandsInsights[brand] = {
        exclusiveKeywords: classification.exclusive.get(brand) || [],
        sharedKeywords: classification.contested
          .filter((c) => c.brands.includes(brand))
          .map((c) => c.keyword)
          .slice(0, 5),
        risingKeywords: keywords
          .filter((k) => k.brand === brand && k.queryType === "rising")
          .map((k) => k.keyword)
          .slice(0, 5),
        competitivePosition: "データに基づく分析が必要です",
        recommendation: "詳細分析を実施してください",
      };
    }
  }
  console.log("");

  // 6. 出力ファイル生成
  const output: KeywordInsights = {
    generatedAt: new Date().toISOString(),
    overall: overallInsight,
    brands: brandsInsights,
  };

  const outputPath = path.join(
    process.cwd(),
    "output",
    "keyword-insights.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`出力ファイル: ${outputPath}`);
  console.log("\n=== 関連キーワードインサイト生成完了 ===\n");

  // 7. サマリー表示
  console.log("【全体サマリー】");
  console.log(output.overall.summary);

  console.log("\n【競合ポジショニング - 独占領域】");
  output.overall.competitivePositioning.exclusive.forEach((e) => {
    console.log(`  ${e.brand}: ${e.keywords.join(", ")} - ${e.insight}`);
  });

  console.log("\n【競合ポジショニング - 激戦区】");
  output.overall.competitivePositioning.contested.forEach((c) => {
    console.log(`  「${c.keywords.join(", ")}」: ${c.brands.join(", ")} - ${c.insight}`);
  });

  if (output.overall.risingAnalysis.length > 0) {
    console.log("\n【Rising KW分析】");
    output.overall.risingAnalysis.forEach((r) => {
      console.log(`  🔥 「${r.keyword}」(${r.status}): ${r.background}`);
      console.log(`     → ${r.recommendation}`);
    });
  }

  console.log("\n【戦略アクション】");
  output.overall.strategicActions.forEach((action, i) => {
    const typeLabel =
      action.type === "strengthen"
        ? "強化"
        : action.type === "capture"
          ? "奪取"
          : "静観";
    console.log(
      `  ${i + 1}. [${action.impact}/${typeLabel}] ${action.brand}: ${action.action}`
    );
  });
}

main().catch(console.error);
