/**
 * レポート生成スクリプト
 *
 * ブランド別の分析レポートを事前生成し、output/reports/ に保存
 *
 * 実行方法:
 * npx tsx scripts/generate-reports.ts                 # 全ブランド
 * npx tsx scripts/generate-reports.ts --brand=ほんだし # 特定ブランド
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load .env.local from dashboard directory
config({ path: path.join(__dirname, "..", ".env.local") });

// APIキー検証ヘルパー（改行文字や空白を除去）
function validateApiKey(key: string | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim().replace(/\\n/g, '').replace(/\n/g, '');
  return trimmed.length > 10 ? trimmed : null;
}

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiKey = validateApiKey(process.env.OPENAI_API_KEY_BCM) || validateApiKey(process.env.OPENAI_API_KEY);
const geminiKey = validateApiKey(process.env.GEMINI_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials required");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// LLMプロバイダー状態を表示
console.log(`[LLM Status] OpenAI: ${openai ? '有効' : '無効'}, Gemini: ${gemini ? '有効' : '無効'}`);
if (!openai && !gemini) {
  console.warn("[WARN] LLM APIキーが設定されていません。デフォルト値を使用します。");
}

// ブランド定義
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

// 出力ディレクトリ
const OUTPUT_DIR = path.join(process.cwd(), "output", "reports");

// ブランドカテゴリと不適切なKWフィルター
const BRAND_CATEGORIES: Record<string, { category: string; excludeKW: string[] }> = {
  "ほんだし": { category: "dashi", excludeKW: ["麻婆豆腐", "回鍋肉", "マヨネーズ", "中華"] },
  "クックドゥ": { category: "chinese_sauce", excludeKW: ["味噌汁", "だし", "吸い物", "和食"] },
  "味の素": { category: "umami", excludeKW: [] },  // 万能調味料のためフィルターなし
  "丸鶏がらスープ": { category: "chicken_soup", excludeKW: ["マヨネーズ", "サラダ"] },
  "香味ペースト": { category: "chinese_paste", excludeKW: ["味噌汁", "だし", "吸い物", "和食"] },
  "コンソメ": { category: "western_soup", excludeKW: ["お好み焼き", "焼きそば", "たこ焼き", "和食"] },
  "ピュアセレクト": { category: "mayonnaise", excludeKW: ["味噌汁", "だし", "吸い物", "炒め物", "中華"] },
  "アジシオ": { category: "salt", excludeKW: ["だし", "吸い物"] },
};

// 検索KWがブランドに適切かチェック
function isRelevantKeyword(brandName: string, keyword: string): boolean {
  const config = BRAND_CATEGORIES[brandName];
  if (!config) return true;
  return !config.excludeKW.some((exclude) => keyword.includes(exclude));
}

// メニューカテゴリの日本語ラベル
const CATEGORY_LABELS: Record<string, string> = {
  soup: "汁物",
  stir_fry: "炒め物",
  stew: "煮込み",
  chinese: "中華",
  rice: "ご飯もの",
  salad: "サラダ",
  noodle: "麺類",
  fried: "揚げ物",
  grilled: "焼き物",
  seasoning: "下味・調味",
  other: "その他",
  unknown: "不明",
};

// カテゴリ名を日本語に変換
function toCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

// 型定義（3層分析フレームワーク）
interface IssueSection {
  title: string;
  question: string;
  // Layer 1: FACT（事実）- findingsと互換性維持
  findings: string[];
  dataTable?: Array<Record<string, string | number>>;
  samplePosts?: SamplePost[];
  personas?: PersonaSummary[];
  // Layer 2: INSIGHT（洞察）- なぜこうなったのか
  insights?: string[];
  crossAnalysis?: string;
  // Layer 3: ACTION（施策）- だから何をすべきか
  recommendations?: string[];
  priority?: 'high' | 'medium' | 'low';
}

interface SamplePost {
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  engagement?: number;
  source?: string;
  date?: string;
  url?: string;
}

interface PersonaSummary {
  id: string;
  name: string;
  description: string;
  postCount: number;
  sharePercentage: number;
  avgEngagement: number;
  keywords: string[];
}

interface CrossAnalysisResult {
  personaCEP: Array<{ persona: string; cep: string; count: number; avgEng: number; score: number }>;
  personaDish: Array<{ persona: string; dish: string; count: number; avgEng: number; score: number }>;
  cepDish: Array<{ cep: string; dish: string; count: number; avgEng: number; score: number }>;
  topCombinations: Array<{ persona: string; cep: string; dish: string; count: number; avgEng: number; score: number }>;
}

interface StrategyInsights {
  findings: string[];
  recommendations: string[];
  keyInsight: string;
  executiveSummary?: string;
  deepInsights?: string[];
  winningPatterns?: string[];
  improvementOpportunities?: string[];
  actionPlan?: string[];
  competitorStrategy?: string[];
}

interface IssueReport {
  issueId: string;
  title: string;
  generatedAt: string;
  sections: IssueSection[];
  strategy: StrategyInsights;
  markdown: string;
}

// コマンドライン引数解析
function parseArgs(): { brand?: string } {
  const args = process.argv.slice(2);
  const brandArg = args.find(a => a.startsWith("--brand="));
  return {
    brand: brandArg ? brandArg.split("=")[1] : undefined,
  };
}

// 投稿原文取得
async function fetchSamplePosts(
  brandName: string,
  options: { sentiment?: string; orderBy?: string; limit?: number } = {}
): Promise<SamplePost[]> {
  const { sentiment, orderBy = "engagement_total", limit = 5 } = options;

  let query = supabase
    .from("sns_posts")
    .select("content, sentiment, engagement_total, source_type, published, url")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("content", "is", null);

  if (sentiment) {
    query = query.eq("sentiment", sentiment);
  }

  query = query.order(orderBy, { ascending: false }).limit(limit);

  const { data: posts } = await query;

  if (!posts) return [];

  return posts.map((p: {
    content: string;
    sentiment: string;
    engagement_total: number;
    source_type: string;
    published: string;
    url: string;
  }) => ({
    content: p.content?.slice(0, 200) + (p.content?.length > 200 ? "..." : ""),
    sentiment: p.sentiment as "positive" | "neutral" | "negative",
    engagement: p.engagement_total || 0,
    source: p.source_type || "unknown",
    date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
    url: p.url,
  }));
}

// セクション別insights/recommendations生成（3層分析フレームワーク）
type SectionInsightConfig = {
  insights: (data: { findings: string[]; dataTable?: Array<Record<string, string | number>> }) => string[];
  recommendations: (data: { findings: string[]; dataTable?: Array<Record<string, string | number>> }) => string[];
  crossAnalysis?: (data: { findings: string[]; dataTable?: Array<Record<string, string | number>> }) => string | undefined;
};

const SECTION_INSIGHT_RULES: Record<string, SectionInsightConfig> = {
  "ブランド健康度": {
    insights: ({ findings }) => {
      const insights: string[] = [];
      const growthFinding = findings.find(f => f.includes("+") && f.includes("%"));
      const declineFinding = findings.find(f => f.includes("-") && f.includes("%"));
      const posFinding = findings.find(f => f.includes("ポジティブ率"));

      if (growthFinding) {
        insights.push("検索ボリュームの増加は、ブランド認知の自然拡大を示唆。広告投資の効率が高まっている可能性");
      }
      if (declineFinding) {
        insights.push("検索減少は、競合シフトまたはカテゴリ自体の縮小の可能性。原因特定が急務");
      }
      if (posFinding) {
        const match = posFinding.match(/(\d+)%/);
        if (match) {
          const posRate = parseInt(match[1]);
          if (posRate >= 50) insights.push("高いポジティブ率は、コアファンの存在を示唆。UGC活用施策が有効");
          else if (posRate < 30) insights.push("ポジティブ率が低い。製品体験の改善またはコミュニケーション戦略の見直しが必要");
        }
      }
      return insights.length > 0 ? insights : ["継続的なモニタリングにより、トレンド変化の早期検知が可能"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("成長"))) {
        recs.push("成長モメンタムを活かした認知拡大キャンペーンの実施");
        recs.push("高エンゲージメント投稿のパターン分析とコンテンツ横展開");
      }
      if (findings.some(f => f.includes("減少") || f.includes("警告"))) {
        recs.push("競合ブランドの動向調査と差別化ポイントの明確化");
        recs.push("既存ユーザーへのリエンゲージメント施策（レシピ提案等）");
      }
      return recs.length > 0 ? recs : ["定期的な健康度モニタリングの継続"];
    },
  },
  "ユーザー像": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      const unknownFinding = findings.find(f => f.includes("unknown"));
      if (unknownFinding && unknownFinding.includes("8") || unknownFinding?.includes("9")) {
        insights.push("ユーザー属性の「unknown」比率が高い。SNS上でのプロフィール開示が少ない層がメインユーザーの可能性");
        insights.push("属性不明ユーザーの投稿内容を深掘り分析し、隠れたペルソナを特定する価値あり");
      }
      if (findings.some(f => f.includes("self"))) {
        insights.push("「自分向け」調理が主流。一人暮らし・自炊層への訴求が効果的");
      }
      if (findings.some(f => f.includes("family"))) {
        insights.push("家族向け調理シーンが目立つ。ファミリー向けレシピコンテンツが有効");
      }
      return insights.length > 0 ? insights : ["ユーザー属性の更なる分析が推奨"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("unknown"))) {
        recs.push("ユーザー参加型キャンペーンで属性データを収集");
      }
      if (findings.some(f => f.includes("self"))) {
        recs.push("一人暮らし向け「手軽レシピ」シリーズの展開");
      }
      if (findings.some(f => f.includes("family"))) {
        recs.push("家族の健康を意識したレシピ訴求の強化");
      }
      return recs.length > 0 ? recs : ["ターゲットペルソナの明確化と訴求内容の最適化"];
    },
  },
  "利用文脈（CEP）": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      const mainCEP = findings.find(f => f.includes("主力CEP"));
      if (mainCEP) {
        insights.push("主力CEPへの集中は、ブランドポジショニングの明確さを示す一方、依存リスクも");
        insights.push("上位CEPの「なぜ選ばれるか」を深掘りし、訴求メッセージに反映すべき");
      }
      if (dataTable && dataTable.length > 3) {
        insights.push("複数CEPでの利用は、ブランドの汎用性を示唆。「万能調味料」ポジションの強化余地あり");
      }
      return insights.length > 0 ? insights : ["CEP分析により、ユーザーの利用シーンが明確化"];
    },
    recommendations: ({ findings, dataTable }) => {
      const recs: string[] = [];
      const mainCEPMatch = findings.find(f => f.includes("主力CEP"));
      if (mainCEPMatch) {
        recs.push("主力CEPに特化したコンテンツ・広告の集中投下");
      }
      if (dataTable && dataTable.length > 0) {
        const topCEP = dataTable[0];
        if (topCEP && topCEP["CEP"]) {
          recs.push(`「${topCEP["CEP"]}」シーン向けレシピ動画シリーズの制作`);
        }
      }
      recs.push("次点CEPへの拡張で、新規ユーザー獲得を図る");
      return recs;
    },
    crossAnalysis: ({ findings }) => {
      if (findings.some(f => f.includes("一人暮らし"))) {
        return "ユーザー像セクションの「self」傾向と一致。一人暮らし層へのCEP訴求が有効";
      }
      return undefined;
    },
  },
  "競合関係": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("味の素"))) {
        insights.push("親ブランド「味の素」との共起は、ブランドファミリーとしての認知を示す");
      }
      if (dataTable && dataTable.length > 2) {
        insights.push("複数ブランドとの共起は、調味料併用シーンでの存在感を示唆。クロスセル機会あり");
      }
      return insights.length > 0 ? insights : ["競合関係の継続モニタリングが推奨"];
    },
    recommendations: ({ findings, dataTable }) => {
      const recs: string[] = [];
      if (dataTable && dataTable.length > 0) {
        const topCooccur = dataTable[0];
        if (topCooccur && topCooccur["ブランド"]) {
          recs.push(`「${topCooccur["ブランド"]}」との併用レシピ提案でクロスセル促進`);
        }
      }
      recs.push("競合ブランドとの差別化ポイントを明確にしたコミュニケーション");
      return recs;
    },
  },
  "代表メニュー": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("高反応"))) {
        insights.push("高エンゲージメントメニューは、ユーザーの「作ってみたい」欲求を刺激。SNSシェア性が高い");
      }
      if (dataTable && dataTable.length > 3) {
        insights.push("多様なメニューでの利用は、ブランドの「使い回し力」の高さを示唆");
      }
      return insights.length > 0 ? insights : ["メニュー分析の継続で、新たな訴求ポイントを発見可能"];
    },
    recommendations: ({ findings, dataTable }) => {
      const recs: string[] = [];
      if (dataTable && dataTable.length > 0) {
        const topMenu = dataTable[0];
        if (topMenu && topMenu["メニュー"]) {
          recs.push(`「${topMenu["メニュー"]}」レシピの動画コンテンツ化`);
        }
      }
      recs.push("季節×メニューの組み合わせ訴求で、シーズナルキャンペーン展開");
      return recs;
    },
  },
  "W's詳細分析": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("勝ちパターン"))) {
        insights.push("勝ちパターンは再現性が高く、コンテンツ戦略の軸となる");
        insights.push("高ENG組み合わせの共通点を分析し、「なぜ響くか」を言語化すべき");
      }
      return insights.length > 0 ? insights : ["W's分析により、効果的なコンテンツパターンを特定"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("推奨訴求"))) {
        recs.push("勝ちパターンに基づいたコンテンツテンプレートの作成");
        recs.push("A/Bテストで勝ちパターンの再現性を検証");
      }
      return recs.length > 0 ? recs : ["W's分析結果をコンテンツ企画に反映"];
    },
  },
  "DPT分析（Use Case×Positioning）": {
    insights: ({ findings }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("DPT"))) {
        insights.push("DPT（Dynamic Positioning Table）により、利用シーン別の差別化ポイントが明確化");
      }
      return insights.length > 0 ? insights : ["DPTデータの蓄積により、より精緻な分析が可能に"];
    },
    recommendations: ({ findings }) => {
      return ["各Use Caseに応じた訴求メッセージの最適化", "競合との差別化ポイント（POD）を強調したコミュニケーション"];
    },
  },
  "弱み/リスク": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("体に悪い") || f.includes("化学調味料"))) {
        insights.push("「体に悪い」イメージは業界共通の課題。積極的な情報発信で払拭可能");
      }
      if (findings.some(f => f.includes("塩分"))) {
        insights.push("健康志向の高まりから、塩分への懸念が増加傾向。減塩ラインナップの訴求が有効");
      }
      return insights.length > 0 ? insights : ["顕著なリスク要因は検出されず。継続モニタリング推奨"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("体に悪い"))) {
        recs.push("原材料の安全性・製造工程の透明性を訴求するコンテンツ作成");
      }
      if (findings.some(f => f.includes("化学調味料"))) {
        recs.push("「うま味」の自然由来をアピールする啓発コンテンツ");
      }
      if (findings.some(f => f.includes("塩分"))) {
        recs.push("減塩レシピや使用量ガイドの提供");
      }
      return recs.length > 0 ? recs : ["定期的なネガティブ要因のモニタリング継続"];
    },
  },
  "成長機会": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("未開拓CEP"))) {
        insights.push("未開拓CEPは「ブルーオーシャン」の可能性。競合が手薄な領域から攻めるのが効率的");
      }
      if (dataTable && dataTable.length > 2) {
        insights.push("複数の成長機会が存在。リソース配分の優先順位付けが重要");
      }
      return insights.length > 0 ? insights : ["成長機会の継続的な探索が推奨"];
    },
    recommendations: ({ findings, dataTable }) => {
      const recs: string[] = [];
      if (dataTable && dataTable.length > 0) {
        const topOpp = dataTable[0];
        if (topOpp && topOpp["未開拓CEP"]) {
          recs.push(`「${topOpp["未開拓CEP"]}」CEPへの参入検討。パイロットキャンペーンでテスト`);
        }
      }
      recs.push("成長機会の優先順位付け（市場規模×参入障壁で評価）");
      return recs;
    },
  },
  "季節戦略": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("ピーク"))) {
        insights.push("ピーク月は需要が集中。在庫・販促リソースの事前確保が重要");
      }
      if (findings.some(f => f.includes("閑散期"))) {
        insights.push("閑散期は競合も手薄になるため、シェア獲得のチャンスでもある");
      }
      return insights.length > 0 ? insights : ["季節性パターンの把握により、効率的なリソース配分が可能"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("ピーク"))) {
        recs.push("ピーク月の2ヶ月前からキャンペーン準備開始");
      }
      if (findings.some(f => f.includes("閑散期"))) {
        recs.push("閑散期向けの独自レシピ提案で需要喚起");
      }
      return recs.length > 0 ? recs : ["季節別の販促カレンダー策定"];
    },
  },
  "コンテンツ戦略": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("エンゲージメントが高い"))) {
        insights.push("高ENG投稿タイプは、ユーザーの「共感ポイント」を示唆。再現性のあるコンテンツ設計が可能");
      }
      return insights.length > 0 ? insights : ["コンテンツ分析により、効果的な投稿パターンを特定"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      recs.push("高ENGパターンに基づいたコンテンツテンプレート作成");
      recs.push("投稿頻度・タイミングの最適化検討");
      return recs;
    },
  },
  "検索対策": {
    insights: ({ findings, dataTable }) => {
      const insights: string[] = [];
      if (findings.some(f => f.includes("レシピ") || f.includes("活用法"))) {
        insights.push("「レシピ」「使い方」検索が多い＝ユーザーは具体的な活用法を求めている");
        insights.push("検索意図に応えるコンテンツで、SEO流入増加の余地あり");
      }
      if (findings.some(f => f.includes("代用"))) {
        insights.push("「代用」検索は競合比較の意図。自社の優位性を訴求するチャンス");
      }
      return insights.length > 0 ? insights : ["検索キーワード分析により、ユーザーニーズを把握"];
    },
    recommendations: ({ findings }) => {
      const recs: string[] = [];
      if (findings.some(f => f.includes("レシピ"))) {
        recs.push("検索上位獲得を狙ったレシピページのSEO最適化");
      }
      if (findings.some(f => f.includes("代用"))) {
        recs.push("「○○ vs 当商品」比較コンテンツで、検索流入を獲得");
      }
      recs.push("関連キーワードを網羅したFAQページの作成");
      return recs;
    },
  },
};

// セクションにinsights/recommendationsを追加
function enrichSectionWithInsights(section: IssueSection): IssueSection {
  const rules = SECTION_INSIGHT_RULES[section.title];
  if (!rules) {
    return section;
  }

  const data = { findings: section.findings, dataTable: section.dataTable };

  return {
    ...section,
    insights: rules.insights(data),
    recommendations: rules.recommendations(data),
    crossAnalysis: rules.crossAnalysis ? rules.crossAnalysis(data) : undefined,
    priority: section.findings.some(f => f.includes("警告") || f.includes("リスク")) ? 'high' :
              section.findings.some(f => f.includes("成長") || f.includes("機会")) ? 'medium' : 'low',
  };
}

// クロス分析（ペルソナ×CEP×料理）
async function analyzeCrossDimensions(brandName: string): Promise<CrossAnalysisResult> {
  // CEPマスタを取得
  const { data: cepsData } = await supabase
    .from("ceps")
    .select("id, cep_name");

  const cepMap = new Map<number, string>();
  cepsData?.forEach((c: { id: number; cep_name: string }) => {
    cepMap.set(c.id, c.cep_name);
  });

  const { data: posts } = await supabase
    .from("sns_posts")
    .select("life_stage, cooking_for, cep_id, dish_category, engagement_total, likes_count, retweets_count")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("life_stage", "is", null)
    .limit(2000);

  const personaCEPMap = new Map<string, { count: number; totalEng: number }>();
  const personaDishMap = new Map<string, { count: number; totalEng: number }>();
  const cepDishMap = new Map<string, { count: number; totalEng: number }>();
  const combinationMap = new Map<string, { persona: string; cep: string; dish: string; count: number; totalEng: number }>();

  if (posts) {
    posts.forEach((p: { life_stage: string; cooking_for: string; cep_id: number | null; dish_category: string; engagement_total: number }) => {
      const persona = p.life_stage || p.cooking_for || "unknown";
      const cep = p.cep_id ? (cepMap.get(p.cep_id) || `CEP ${p.cep_id}`) : "unknown";
      const dish = p.dish_category || "unknown";
      const eng = p.engagement_total || 0;

      if (persona !== "unknown" && cep !== "unknown") {
        const key = `${persona}|${cep}`;
        const existing = personaCEPMap.get(key) || { count: 0, totalEng: 0 };
        personaCEPMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      if (persona !== "unknown" && dish !== "unknown") {
        const key = `${persona}|${dish}`;
        const existing = personaDishMap.get(key) || { count: 0, totalEng: 0 };
        personaDishMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      if (cep !== "unknown" && dish !== "unknown") {
        const key = `${cep}|${dish}`;
        const existing = cepDishMap.get(key) || { count: 0, totalEng: 0 };
        cepDishMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      if (persona !== "unknown" && cep !== "unknown" && dish !== "unknown") {
        const key = `${persona}|${cep}|${dish}`;
        const existing = combinationMap.get(key) || { persona, cep, dish, count: 0, totalEng: 0 };
        combinationMap.set(key, { ...existing, count: existing.count + 1, totalEng: existing.totalEng + eng });
      }
    });
  }

  const calcScore = (count: number, avgEng: number) => count * Math.log(avgEng + 1);

  const personaCEP = Array.from(personaCEPMap.entries())
    .map(([key, v]) => {
      const [persona, cep] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { persona, cep, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const personaDish = Array.from(personaDishMap.entries())
    .map(([key, v]) => {
      const [persona, dish] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { persona, dish, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const cepDish = Array.from(cepDishMap.entries())
    .map(([key, v]) => {
      const [cep, dish] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { cep, dish, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const topCombinations = Array.from(combinationMap.values())
    .map(v => {
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { ...v, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { personaCEP, personaDish, cepDish, topCombinations };
}

// Q1: ブランド健康度
async function analyzeHealth(
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const oneYearTwelveWeeksAgo = new Date(oneYearAgo.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const { data: recentTrends } = await supabase
    .from("weekly_trends")
    .select("score")
    .eq("brand_id", brandId)
    .gte("week_start", twelveWeeksAgo.toISOString().split("T")[0]);

  const { data: lastYearTrends } = await supabase
    .from("weekly_trends")
    .select("score")
    .eq("brand_id", brandId)
    .gte("week_start", oneYearTwelveWeeksAgo.toISOString().split("T")[0])
    .lte("week_start", oneYearAgo.toISOString().split("T")[0]);

  let recentAvg = 0;
  let lastYearAvg = 0;
  let trendChange = 0;

  if (recentTrends && recentTrends.length > 0) {
    recentAvg = recentTrends.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / recentTrends.length;
  }
  if (lastYearTrends && lastYearTrends.length > 0) {
    lastYearAvg = lastYearTrends.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / lastYearTrends.length;
  }
  if (lastYearAvg > 0) {
    trendChange = Math.round(((recentAvg - lastYearAvg) / lastYearAvg) * 100);
  }

  const { data: mentions } = await supabase
    .from("sns_mentions")
    .select("mention_count")
    .eq("brand_id", brandId)
    .single();

  const mentionCount = mentions?.mention_count || 0;

  const { data: sentimentPosts } = await supabase
    .from("sns_posts")
    .select("sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("sentiment", "is", null);

  let posRate = 0;
  let negRate = 0;
  let posCount = 0;
  let negCount = 0;
  let neuCount = 0;
  if (sentimentPosts && sentimentPosts.length > 0) {
    sentimentPosts.forEach((p: { sentiment: string }) => {
      if (p.sentiment === "positive") posCount++;
      else if (p.sentiment === "negative") negCount++;
      else neuCount++;
    });
    const total = posCount + negCount + neuCount;
    if (total > 0) {
      posRate = Math.round((posCount / total) * 100);
      negRate = Math.round((negCount / total) * 100);
    }
  }

  dataTable.push({
    指標: "検索スコア（直近12週）",
    現在: Math.round(recentAvg),
    前年同期: Math.round(lastYearAvg),
    変化: `${trendChange > 0 ? "+" : ""}${trendChange}%`,
  });
  dataTable.push({
    指標: "SNS言及数",
    現在: mentionCount,
    前年同期: "-",
    変化: "-",
  });
  dataTable.push({
    指標: "ポジティブ率",
    現在: `${posRate}%`,
    前年同期: "-",
    変化: "-",
  });
  dataTable.push({
    指標: "ネガティブ率",
    現在: `${negRate}%`,
    前年同期: "-",
    変化: "-",
  });

  if (trendChange > 5) {
    findings.push(`【成長シグナル】検索+${trendChange}%（前年比） → 認知拡大施策を強化する好機`);
  } else if (trendChange < -5) {
    findings.push(`【警告】検索${trendChange}%減少 → 新規ユースケース開拓・リポジショニングを検討`);
  } else {
    findings.push(`【安定】検索トレンドは前年比±${Math.abs(trendChange)}%で横ばい`);
  }

  findings.push(`【声量】SNS ${mentionCount}件（Pos ${posCount}/Neg ${negCount}/Neu ${neuCount}）`);

  if (posRate > 60) {
    findings.push(`【好感度高】ポジティブ率${posRate}% → UGC活用でさらに拡散`);
  } else if (negRate > 15) {
    findings.push(`【要改善】ネガティブ率${negRate}% → ネガティブ要因の特定と改善を優先`);
  } else if (posRate > 40) {
    findings.push(`【中立的】ポジティブ率${posRate}% → 感動体験コンテンツで差別化`);
  }

  return {
    title: "ブランド健康度",
    question: `「${brandName}」は健全に成長しているか？`,
    findings,
    dataTable,
  };
}

// Q2: ユーザー像
async function analyzeUserProfile(brandName: string): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: posts } = await supabase
    .from("sns_posts")
    .select("life_stage, cooking_skill, cooking_for, with_whom")
    .ilike("brand_mentions", `%${brandName}%`);

  const lifeStageCount = new Map<string, number>();
  const cookingForCount = new Map<string, number>();

  if (posts) {
    posts.forEach((p: { life_stage: string; cooking_for: string }) => {
      if (p.life_stage) {
        lifeStageCount.set(p.life_stage, (lifeStageCount.get(p.life_stage) || 0) + 1);
      }
      if (p.cooking_for) {
        cookingForCount.set(p.cooking_for, (cookingForCount.get(p.cooking_for) || 0) + 1);
      }
    });
  }

  const totalLife = Array.from(lifeStageCount.values()).reduce((a, b) => a + b, 0);
  const sortedLife = Array.from(lifeStageCount.entries()).sort((a, b) => b[1] - a[1]);

  sortedLife.slice(0, 3).forEach(([stage, count]) => {
    const share = totalLife > 0 ? Math.round((count / totalLife) * 100) : 0;
    dataTable.push({
      属性: `ライフステージ: ${stage}`,
      件数: count,
      シェア: `${share}%`,
    });
  });

  if (sortedLife.length > 0) {
    const top = sortedLife[0];
    const share = totalLife > 0 ? Math.round((top[1] / totalLife) * 100) : 0;
    findings.push(`主要ユーザー層は「${top[0]}」（${share}%）`);
  }

  const sortedFor = Array.from(cookingForCount.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedFor.length > 0) {
    const totalFor = Array.from(cookingForCount.values()).reduce((a, b) => a + b, 0);
    const share = totalFor > 0 ? Math.round((sortedFor[0][1] / totalFor) * 100) : 0;
    findings.push(`主に「${sortedFor[0][0]}」向けに調理（${share}%）`);
  }

  if (findings.length === 0) {
    findings.push("ユーザー属性データが限られています");
  }

  return {
    title: "ユーザー像",
    question: `誰が「${brandName}」を使っているか？`,
    findings,
    dataTable,
  };
}

// Q3: 利用文脈（CEP）
async function analyzeUsageContext(brandName: string): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // cep_idを使用してJOINでcep_nameを取得
  const { data: cepPosts } = await supabase
    .from("sns_posts")
    .select(`
      cep_id,
      ceps(cep_name),
      engagement_total
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_id", "is", null)
    .limit(2000);

  const cepStats = new Map<string, { count: number; totalEng: number }>();
  if (cepPosts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cepPosts.forEach((p: any) => {
      const cepName = p.ceps?.cep_name;
      if (cepName && cepName !== "unknown") {
        const existing = cepStats.get(cepName) || { count: 0, totalEng: 0 };
        cepStats.set(cepName, {
          count: existing.count + 1,
          totalEng: existing.totalEng + (p.engagement_total || 0),
        });
      }
    });
  }

  const scoredCeps = Array.from(cepStats.entries())
    .map(([cepName, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      const score = stats.count * Math.log(avgEng + 1);
      return { cepName, count: stats.count, avgEng: Math.round(avgEng), score };
    })
    .sort((a, b) => b.score - a.score);

  if (scoredCeps.length > 0) {
    scoredCeps.slice(0, 8).forEach((row) => {
      dataTable.push({
        CEP: row.cepName,
        言及数: row.count,
        平均ENG: row.avgEng,
        スコア: row.score.toFixed(1),
      });
    });

    const top = scoredCeps[0];
    const totalCount = scoredCeps.reduce((sum, c) => sum + c.count, 0);
    const topShare = totalCount > 0 ? Math.round((top.count / totalCount) * 100) : 0;

    findings.push(`【主力CEP】「${top.cepName}」がスコア最高（${top.count}件, 平均ENG ${top.avgEng}）`);

    if (scoredCeps.length >= 2) {
      const second = scoredCeps[1];
      findings.push(`【次点】「${second.cepName}」（${second.count}件, 平均ENG ${second.avgEng}）`);
    }

    findings.push(`→ 施策: 「${top.cepName}」を中心にコンテンツ展開（シェア${topShare}%）`);
  } else {
    findings.push("CEPデータが限られています");
  }

  return {
    title: "利用文脈（CEP）",
    question: `「${brandName}」はどんな場面で使われるか？`,
    findings,
    dataTable,
  };
}

// Q4: 競合関係
async function analyzeCompetition(
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // correlationsテーブルから相関データを取得
  const { data: correlations } = await supabase
    .from("correlations")
    .select("brand_id_2, correlation")
    .eq("brand_id_1", brandId)
    .neq("brand_id_2", brandId);

  // sns_postsから動的に共起を計算（同一投稿内での複数ブランド言及）
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("brand_mentions")
    .ilike("brand_mentions", `%${brandName}%`)
    .limit(5000);

  // 全ブランド名リスト
  const allBrandNames = Array.from(brandMap.values());
  const cooccMap = new Map<string, number>();

  posts?.forEach((p: { brand_mentions: string }) => {
    if (!p.brand_mentions) return;
    const mentions = p.brand_mentions.split(",").map((m: string) => m.trim());
    // 自ブランドを含む投稿で、他ブランドも言及されているか
    if (mentions.includes(brandName)) {
      mentions.forEach((m: string) => {
        if (m !== brandName && allBrandNames.includes(m)) {
          cooccMap.set(m, (cooccMap.get(m) || 0) + 1);
        }
      });
    }
  });

  // 相関データと共起データを結合
  const sorted = correlations?.sort((a: { correlation: number }, b: { correlation: number }) => b.correlation - a.correlation) || [];

  if (sorted.length > 0) {
    sorted.slice(0, 5).forEach((row: { brand_id_2: number; correlation: number }) => {
      const otherBrand = brandMap.get(row.brand_id_2) || "Unknown";
      const cooccCount = cooccMap.get(otherBrand) || 0;
      const relationship = row.correlation > 0.2 ? "補完" : row.correlation < -0.1 ? "競合" : "中立";

      dataTable.push({
        ブランド: otherBrand,
        相関: row.correlation.toFixed(2),
        共起数: cooccCount,
        関係性: relationship,
      });

      if (row.correlation > 0.2) {
        findings.push(`【補完関係】${otherBrand} → クロスセル施策有効`);
      } else if (row.correlation < -0.1) {
        findings.push(`【競合関係】${otherBrand} → 差別化訴求が必要`);
      }
    });
  } else {
    // correlationsがない場合は共起データのみで表示
    const sortedCooc = Array.from(cooccMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedCooc.forEach(([otherBrand, count]) => {
      dataTable.push({
        ブランド: otherBrand,
        相関: "-",
        共起数: count,
        関係性: "共起あり",
      });
      findings.push(`【共起】${otherBrand}と${count}回同時言及 → 関連性あり`);
    });
  }

  if (findings.length === 0) {
    findings.push("明確な補完・競合関係は検出されませんでした");
  }

  return {
    title: "競合関係",
    question: `「${brandName}」の競合・補完ブランドは？`,
    findings,
    dataTable,
  };
}

// Q5: 代表メニュー
async function analyzeSignatureDishes(brandName: string): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: posts } = await supabase
    .from("sns_posts")
    .select("dish_category, engagement_total")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("dish_category", "is", null)
    .limit(2000);

  const dishStats = new Map<string, { count: number; totalEng: number }>();
  if (posts) {
    posts.forEach((p: { dish_category: string; engagement_total: number }) => {
      if (p.dish_category && p.dish_category !== "unknown") {
        const existing = dishStats.get(p.dish_category) || { count: 0, totalEng: 0 };
        dishStats.set(p.dish_category, {
          count: existing.count + 1,
          totalEng: existing.totalEng + (p.engagement_total || 0),
        });
      }
    });
  }

  const scoredDishes = Array.from(dishStats.entries())
    .map(([dish, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      return { dish, count: stats.count, avgEng: Math.round(avgEng) };
    })
    .sort((a, b) => b.avgEng - a.avgEng);

  scoredDishes.slice(0, 8).forEach((row) => {
    dataTable.push({
      メニュー: toCategoryLabel(row.dish),
      言及数: row.count,
      平均ENG: row.avgEng,
    });
  });

  if (scoredDishes.length > 0) {
    const top3 = scoredDishes.slice(0, 3);
    findings.push(`【高反応メニュー】${top3.map(d => `「${toCategoryLabel(d.dish)}」(ENG ${d.avgEng})`).join("、")}`);
  } else {
    findings.push("メニューデータが限られています");
  }

  return {
    title: "代表メニュー",
    question: `「${brandName}」で人気のメニューは？`,
    findings,
    dataTable,
  };
}

// Q6: W's詳細分析
async function analyzeWsDetail(brandName: string): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: posts } = await supabase
    .from("sns_posts")
    .select("meal_occasion, cooking_for, when_detail, why_motivation, engagement_total")
    .ilike("brand_mentions", `%${brandName}%`)
    .limit(2000);

  // meal_occasion × cooking_for の組み合わせでエンゲージメント集計
  const occasionForMap = new Map<string, { count: number; totalEng: number }>();
  if (posts) {
    posts.forEach((p: { meal_occasion: string; cooking_for: string; engagement_total: number }) => {
      if (p.meal_occasion && p.cooking_for) {
        const key = `${p.meal_occasion} × ${p.cooking_for}`;
        const existing = occasionForMap.get(key) || { count: 0, totalEng: 0 };
        occasionForMap.set(key, {
          count: existing.count + 1,
          totalEng: existing.totalEng + (p.engagement_total || 0),
        });
      }
    });
  }

  const scoredOccasions = Array.from(occasionForMap.entries())
    .map(([occasion, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      return { occasion, count: stats.count, avgEng: Math.round(avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.avgEng - a.avgEng);

  scoredOccasions.slice(0, 8).forEach((row) => {
    dataTable.push({
      "シーン×対象": row.occasion,
      件数: row.count,
      平均ENG: row.avgEng,
    });
  });

  if (scoredOccasions.length > 0) {
    const top = scoredOccasions[0];
    findings.push(`【勝ちパターン】「${top.occasion}」が最高ENG（平均${top.avgEng}、${top.count}件）`);

    const top3 = scoredOccasions.slice(0, 3).map((o) => o.occasion);
    findings.push(`→ 推奨訴求: ${top3.join("、")}`);
  } else {
    findings.push("W's詳細データが限られています");
  }

  return {
    title: "W's詳細分析",
    question: `「${brandName}」の勝ちパターン（いつ×誰に）は？`,
    findings,
    dataTable,
  };
}

// Q7: DPT分析（独自価値）
async function analyzeDPT(brandName: string, brandId: number): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // DPTキャッシュから取得（brand_idを使用）
  const { data: dptCache } = await supabase
    .from("brand_dpt_cache")
    .select("dpt_data")
    .eq("brand_id", brandId)
    .single();

  // DPTデータ構造: { useCases: [...] } または 配列直接
  const dptData = dptCache?.dpt_data;
  const useCases = Array.isArray(dptData)
    ? dptData
    : (dptData?.useCases && Array.isArray(dptData.useCases))
      ? dptData.useCases
      : null;

  if (useCases && useCases.length > 0) {
    findings.push(`【${useCases.length}つのUse Caseを特定】`);

    useCases.slice(0, 5).forEach((row: { useCase?: string; name?: string; pop?: string; pod?: string; positioning?: { pop?: string; pod?: string } }) => {
      // APIは name と positioning.pop/pod を使用する可能性がある
      const useCase = row.useCase || row.name || "-";
      const pop = row.pop || row.positioning?.pop || "-";
      const pod = row.pod || row.positioning?.pod || "-";

      dataTable.push({
        "Use Case": useCase,
        "POP（共通価値）": pop,
        "POD（独自価値）": pod,
      });
      if (pod && pod !== "-") {
        findings.push(`「${useCase}」での独自価値: ${pod}`);
      }
    });

    const allPODs = useCases
      .map((row: { pod?: string; positioning?: { pod?: string } }) => row.pod || row.positioning?.pod)
      .filter((pod: string | undefined) => pod && pod !== "-");
    if (allPODs.length > 0) {
      findings.push(`→ 主要な差別化ポイント: ${[...new Set(allPODs)].slice(0, 3).join("、")}`);
    }
  } else {
    findings.push("DPT分析データを生成中です（Analyticsタブで確認可能）");
  }

  return {
    title: "DPT分析（Use Case×Positioning）",
    question: `どのような場面で、何が差別化価値となっているか？`,
    findings: findings.slice(0, 8),
    dataTable,
  };
}

// Q8: 弱み/リスク
async function analyzeRisks(brandName: string, brandId: number): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // ネガティブ投稿を取得
  const { data: negativePosts } = await supabase
    .from("sns_posts")
    .select("content, engagement_total, published, url")
    .ilike("brand_mentions", `%${brandName}%`)
    .eq("sentiment", "negative")
    .order("engagement_total", { ascending: false })
    .limit(100);

  // ネガティブキーワード分析
  const negativeKeywords: Record<string, number> = {};
  const patterns = ["まずい", "高い", "体に悪い", "添加物", "塩分", "化学調味料", "使いにくい", "開けにくい"];

  if (negativePosts) {
    negativePosts.forEach((post: { content: string }) => {
      if (post.content) {
        patterns.forEach((kw) => {
          if (post.content.includes(kw)) {
            negativeKeywords[kw] = (negativeKeywords[kw] || 0) + 1;
          }
        });
      }
    });
  }

  const sorted = Object.entries(negativeKeywords).sort((a, b) => b[1] - a[1]);

  // 詳細な対策文言（クライアントがアクションを取れるレベル）
  const countermeasures: Record<string, string> = {
    "まずい": "プロ料理家監修レシピ動画シリーズの展開。SNSで「失敗しない使い方」コンテンツを定期発信",
    "高い": "「1食あたり○○円」のコスパ訴求。大容量パックの拡充と詰め替え用商品の検討",
    "体に悪い": "医師・栄養士によるエンドースメントコンテンツの作成。成分・製造工程の透明性向上",
    "添加物": "原材料の可視化（パッケージQRコード→原材料産地ページへ誘導）。「無添加」ライン検討",
    "塩分": "減塩30%の新ライン開発。既存商品の「適量使用」ガイド発信。健康志向メディアとのタイアップ",
    "化学調味料": "「発酵由来」「天然由来」の訴求強化。製法ストーリーコンテンツの展開",
    "使いにくい": "ワンタッチキャップ・計量スプーン付きパッケージへの改良。使い方動画の充実",
    "開けにくい": "ユニバーサルデザイン採用パッケージへの刷新。高齢者モニターテストの実施",
  };

  sorted.slice(0, 5).forEach(([kw, count]) => {
    dataTable.push({
      要因: kw,
      件数: count,
      対策: countermeasures[kw] || "-",
    });
  });

  if (sorted.length > 0) {
    findings.push(`主なネガティブ要因: ${sorted.slice(0, 3).map(([kw, cnt]) => `${kw}(${cnt}件)`).join("、")}`);
  }

  // センチメント
  const { data: sentiment } = await supabase
    .from("sns_sentiments")
    .select("negative_rate, negative_count")
    .eq("brand_id", brandId)
    .single();

  if (sentiment && sentiment.negative_rate > 10) {
    findings.push(`ネガティブ率${sentiment.negative_rate.toFixed(1)}%で要注意`);
  }

  if (findings.length === 0) {
    findings.push("顕著なネガティブ要因は検出されませんでした");
  }

  // ネガティブ投稿原文を追加
  const samplePosts: SamplePost[] = negativePosts
    ?.slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: "negative" as const,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "弱み/リスク",
    question: `ネガティブ評価の原因は？`,
    findings,
    dataTable,
    samplePosts,
  };
}

// Q9: 成長機会
async function analyzeGrowthOpportunity(brandName: string, brandId: number): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // 自ブランドのCEPスコア
  const { data: myCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      ceps(cep_name)
    `)
    .eq("brand_id", brandId);

  // 全ブランドのCEPスコアを取得
  const { data: allCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      brand_id,
      ceps(cep_name)
    `);

  // 自ブランドが弱いが他ブランドが強いCEPを探す
  const myCepScores = new Map<string, number>();
  if (myCeps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    myCeps.forEach((row: any) => {
      const cepName = row.ceps?.cep_name || (Array.isArray(row.ceps) ? row.ceps[0]?.cep_name : null);
      if (cepName) {
        myCepScores.set(cepName, row.potential_score);
      }
    });
  }

  const cepMaxScores = new Map<string, { score: number; brand: string }>();
  if (allCeps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allCeps.forEach((row: any) => {
      const cepName = row.ceps?.cep_name || (Array.isArray(row.ceps) ? row.ceps[0]?.cep_name : null);
      if (cepName && row.brand_id !== brandId) {
        const current = cepMaxScores.get(cepName);
        if (!current || row.potential_score > current.score) {
          cepMaxScores.set(cepName, { score: row.potential_score, brand: `brand_${row.brand_id}` });
        }
      }
    });
  }

  const opportunities: Array<{ cep: string; myScore: number; maxScore: number; gap: number }> = [];

  cepMaxScores.forEach(({ score }, cepName) => {
    const myScore = myCepScores.get(cepName) || 0;
    if (myScore < 1.0 && score > 1.5) {
      opportunities.push({
        cep: cepName,
        myScore,
        maxScore: score,
        gap: score - myScore,
      });
    }
  });

  opportunities.sort((a, b) => b.gap - a.gap);

  opportunities.slice(0, 5).forEach((opp) => {
    dataTable.push({
      未開拓CEP: opp.cep,
      自社スコア: opp.myScore.toFixed(2),
      市場最高: opp.maxScore.toFixed(2),
      ポテンシャル: "高",
    });
  });

  if (opportunities.length > 0) {
    findings.push(`伸びしろCEP: ${opportunities.slice(0, 3).map((o) => `「${o.cep}」`).join("、")}`);
    findings.push(`${opportunities.length}件の未開拓CEPを発見`);
  } else {
    findings.push("主要CEPは概ねカバーしています");
  }

  return {
    title: "成長機会",
    question: `伸ばせる余地はどこか？`,
    findings,
    dataTable,
  };
}

// Q10: 季節戦略
async function analyzeSeasonalStrategy(brandName: string, brandId: number): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: seasonality } = await supabase
    .from("seasonality")
    .select("month, avg_score")
    .eq("brand_id", brandId)
    .order("month");

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const monthActions: Record<number, string> = {
    1: "正月料理・七草粥訴求",
    2: "バレンタイン料理訴求",
    3: "ひな祭り・卒業祝い訴求",
    4: "新生活応援・お弁当訴求",
    5: "GW・母の日料理訴求",
    6: "梅雨のさっぱり料理訴求",
    7: "夏バテ対策・冷やし料理訴求",
    8: "お盆・夏休み料理訴求",
    9: "敬老の日・秋の味覚訴求",
    10: "ハロウィン・秋の煮込み訴求",
    11: "鍋シーズン開始訴求",
    12: "年末・クリスマス料理訴求",
  };

  if (seasonality && seasonality.length > 0) {
    let peak = { month: 0, score: -Infinity };
    let low = { month: 0, score: Infinity };

    seasonality.forEach((row: { month: number; avg_score: number }) => {
      if (row.avg_score > peak.score) {
        peak = { month: row.month, score: row.avg_score };
      }
      if (row.avg_score < low.score) {
        low = { month: row.month, score: row.avg_score };
      }

      const action = row.avg_score >= peak.score * 0.9 ? "集中投下" : row.avg_score >= peak.score * 0.7 ? "維持" : "テコ入れ";
      dataTable.push({
        月: monthNames[row.month - 1],
        スコア: Math.round(row.avg_score),
        施策: action,
      });
    });

    findings.push(`ピーク月: ${monthNames[peak.month - 1]}（スコア${Math.round(peak.score)}）`);
    findings.push(`閑散期: ${monthNames[low.month - 1]}（スコア${Math.round(low.score)}）`);
    findings.push(`振れ幅: ${Math.round(peak.score - low.score)}pt`);
    findings.push(`→ ${monthNames[peak.month - 1]}施策: ${monthActions[peak.month] || "季節感のある料理訴求"}`);
    findings.push(`→ ${monthNames[low.month - 1]}施策: ${monthActions[low.month] || "季節感のある料理訴求"}（テコ入れ）`);
  } else {
    findings.push("季節データが限られています");
  }

  return {
    title: "季節戦略",
    question: `いつ強化すべきか？`,
    findings,
    dataTable,
  };
}

// Q11: コンテンツ戦略
async function analyzeContentStrategy(brandName: string): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // エンゲージメントの高い投稿パターンを分析
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("cooking_for, dish_category, engagement_total, likes_count, retweets_count, content, published, url, sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .order("engagement_total", { ascending: false })
    .limit(500);

  const patternStats = new Map<string, { total: number; count: number }>();
  const dishStats = new Map<string, { total: number; count: number }>();

  if (posts) {
    posts.forEach((p: { cooking_for: string; dish_category: string; engagement_total: number }) => {
      if (p.cooking_for) {
        const stats = patternStats.get(p.cooking_for) || { total: 0, count: 0 };
        stats.total += p.engagement_total || 0;
        stats.count++;
        patternStats.set(p.cooking_for, stats);
      }
      if (p.dish_category) {
        const stats = dishStats.get(p.dish_category) || { total: 0, count: 0 };
        stats.total += p.engagement_total || 0;
        stats.count++;
        dishStats.set(p.dish_category, stats);
      }
    });
  }

  const avgAll = posts && posts.length > 0
    ? posts.reduce((sum: number, p: { engagement_total: number }) => sum + (p.engagement_total || 0), 0) / posts.length
    : 0;

  const sorted = Array.from(patternStats.entries())
    .map(([pattern, stats]) => ({
      pattern,
      avg: stats.count > 0 ? stats.total / stats.count : 0,
      count: stats.count,
    }))
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.avg - a.avg);

  sorted.slice(0, 5).forEach((s) => {
    const ratio = avgAll > 0 ? (s.avg / avgAll).toFixed(1) : "-";
    dataTable.push({
      タイプ: s.pattern,
      平均ENG: Math.round(s.avg),
      対平均比: `${ratio}x`,
      投稿数: s.count,
    });
  });

  const sortedDish = Array.from(dishStats.entries())
    .map(([dish, stats]) => ({ dish, avg: stats.count > 0 ? stats.total / stats.count : 0, count: stats.count }))
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.avg - a.avg);

  if (sorted.length > 0 && avgAll > 0) {
    const best = sorted[0];
    const ratio = (best.avg / avgAll).toFixed(1);
    findings.push(`最もエンゲージメントが高いのは「${best.pattern}」投稿（${ratio}倍）`);

    const goodPatterns = sorted.filter((s) => s.avg > avgAll * 1.2);
    if (goodPatterns.length > 1) {
      findings.push(`高反応パターン: ${goodPatterns.slice(0, 3).map((s) => s.pattern).join("、")}`);
    }
  }

  if (sortedDish.length > 0 && avgAll > 0) {
    const bestDish = sortedDish[0];
    const ratio = (bestDish.avg / avgAll).toFixed(1);
    findings.push(`料理カテゴリでは「${bestDish.dish}」が高反応（${ratio}倍）`);
  }

  if (findings.length === 0) {
    findings.push("コンテンツパターン分析中です");
  }

  // 高エンゲージメント投稿原文を追加
  const samplePosts: SamplePost[] = posts
    ?.slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string; sentiment: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: (p.sentiment as "positive" | "neutral" | "negative") || undefined,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "コンテンツ戦略",
    question: `どんな投稿が響くか？`,
    findings,
    dataTable,
    samplePosts,
  };
}

// Q12: 検索対策
async function analyzeSearchStrategy(brandName: string, brandId: number): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // extracted_valueとrankを取得（search_volumeカラムは存在しない）
  const { data: keywords } = await supabase
    .from("related_keywords")
    .select("keyword, extracted_value, query_type, rank")
    .eq("brand_id", brandId)
    .order("extracted_value", { ascending: false })
    .order("rank", { ascending: true })
    .limit(15);

  if (keywords && keywords.length > 0) {
    const negativeKWs = ["危険", "体に悪い", "害", "添加物", "化学"];
    const recipeKWs = ["レシピ", "作り方", "使い方"];

    let hasNegative = false;
    let hasRecipe = false;
    let filteredCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keywords.forEach((kw: any) => {
      // ブランドに不適切なKWをスキップ
      if (kw.keyword && !isRelevantKeyword(brandName, kw.keyword)) {
        filteredCount++;
        return;
      }

      let intent = "一般";
      if (negativeKWs.some((neg) => kw.keyword?.includes(neg))) intent = "不安系";
      else if (recipeKWs.some((rec) => kw.keyword?.includes(rec))) intent = "活用法";
      else if (kw.keyword?.includes("代用") || kw.keyword?.includes("違い")) intent = "比較";
      else if (kw.keyword?.includes("値段") || kw.keyword?.includes("安い")) intent = "価格";

      dataTable.push({
        キーワード: kw.keyword || "-",
        スコア: kw.extracted_value || "-",
        順位: kw.rank || "-",
        意図: intent,
      });

      if (kw.keyword && negativeKWs.some((neg) => kw.keyword.includes(neg))) hasNegative = true;
      if (kw.keyword && recipeKWs.some((rec) => kw.keyword.includes(rec))) hasRecipe = true;
    });

    if (filteredCount > 0) {
      console.log(`  [INFO] ${filteredCount}件の不適切KWを除外`);
    }

    findings.push(`関連キーワード${keywords.length}件を検出`);

    if (hasRecipe) {
      findings.push("レシピ・使い方系の検索が多い（活用法訴求が有効）");
    }
    if (hasNegative) {
      findings.push("不安系キーワードあり（安全性・品質訴求が必要）");
    }
  } else {
    findings.push("関連キーワードデータが限られています");
  }

  return {
    title: "検索対策",
    question: `ユーザーは何を知りたいか？`,
    findings,
    dataTable,
  };
}

// 強化されたLLMプロンプト（リアルタイム制約なし版）
const ENHANCED_STRATEGY_SYSTEM_PROMPT = `あなたは調味料ブランドの上級戦略コンサルタントです。
詳細なデータ分析に基づき、経営層向けの**包括的で実行可能な**戦略レポートを作成してください。

## 出力形式
JSON形式で出力してください。
{
  "executiveSummary": "エグゼクティブサマリー（3〜5文、経営層向け）",
  "findings": ["発見1", "発見2", "発見3", "発見4", "発見5"],
  "deepInsights": [
    "なぜこのブランドが選ばれるのか、データから読み取れる本質的な理由",
    "成功している投稿パターンの共通点と、その背景にある消費者心理",
    "データが示唆する、まだ顕在化していない潜在的な機会"
  ],
  "winningPatterns": [
    "勝ちパターン1: 【ターゲット】×【シーン】×【訴求】（根拠データ付き）",
    "勝ちパターン2: ...",
    "勝ちパターン3: ..."
  ],
  "improvementOpportunities": [
    "改善機会1: 現状のギャップと具体的な解決策",
    "改善機会2: ..."
  ],
  "actionPlan": [
    "フェーズ1（即座に実行）: 具体的なアクション項目",
    "フェーズ2（3ヶ月以内）: ...",
    "フェーズ3（6ヶ月以内）: ..."
  ],
  "competitorStrategy": [
    "競合Aに対する差別化戦略",
    "補完ブランドとのクロスセル施策"
  ],
  "recommendations": ["提言1（30文字以内）", "提言2", "提言3"],
  "keyInsight": "最も重要なインサイト（1文）"
}

## 分析の深さ

### レベル1: 表面的な発見（WHAT）
- 数値の変化、シェア、ランキング

### レベル2: 背景の理解（WHY）
- なぜその数値なのか
- 消費者行動の文脈

### レベル3: 戦略的示唆（SO WHAT）
- ビジネスへの影響
- 具体的なアクション

### レベル4: 将来予測（WHAT NEXT）
- トレンドの方向性
- 新たな機会・リスク

## ガイドライン
- データに基づかない一般論は避ける
- 「認知度向上」「SNS強化」など抽象的な提言は禁止
- 必ず具体的な数値・根拠を含める
- 競合との差別化ポイントを明確に`;

// LLMで詳細戦略を生成
async function generateDetailedStrategy(
  brandName: string,
  sections: IssueSection[],
  crossAnalysis: CrossAnalysisResult,
  topPosts: SamplePost[]
): Promise<StrategyInsights> {
  const defaultInsights: StrategyInsights = {
    findings: ["データに基づく分析完了", "複数のパターンを検出", "追加調査を推奨"],
    recommendations: ["定期的なモニタリング", "データ収集の継続", "仮説検証の実施"],
    keyInsight: `${brandName}のブランド分析が完了しました`,
  };

  if (!openai && !gemini) {
    console.log("  [WARN] No LLM API configured, using default insights");
    return defaultInsights;
  }

  const healthSection = sections.find((s) => s.title === "ブランド健康度");
  const userSection = sections.find((s) => s.title === "ユーザー像");
  const cepSection = sections.find((s) => s.title === "利用文脈（CEP）");
  const competitionSection = sections.find((s) => s.title === "競合関係");
  const dishSection = sections.find((s) => s.title === "代表メニュー");
  const wsSection = sections.find((s) => s.title === "W's詳細分析");

  const crossAnalysisSection = `
## クロス分析結果（エンゲージメント加重）

### 勝ちパターン: ペルソナ × 利用シーン
${crossAnalysis.personaCEP.slice(0, 5).map((x) => `- 「${x.persona}」×「${x.cep}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 勝ちパターン: ペルソナ × 料理
${crossAnalysis.personaDish.slice(0, 5).map((x) => `- 「${x.persona}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 勝ちパターン: 利用シーン × 料理
${crossAnalysis.cepDish.slice(0, 5).map((x) => `- 「${x.cep}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 最強の3軸組み合わせ（ペルソナ × シーン × 料理）
${crossAnalysis.topCombinations.slice(0, 3).map((x, i) => `${i + 1}. 「${x.persona}」×「${x.cep}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}
`;

  const topPostsSection = topPosts && topPosts.length > 0 ? `
## 高エンゲージメント投稿（生の声）
${topPosts.slice(0, 5).map((p, i) => `${i + 1}. "${p.content}" (ENG: ${p.engagement || 0})`).join("\n")}
` : "";

  const userPrompt = `
ブランド: ${brandName}

## ブランド健康度
${healthSection ? healthSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}

## ユーザー像
${userSection ? userSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${userSection?.dataTable ? `
### 詳細
${userSection.dataTable.map((row) => `- ${JSON.stringify(row)}`).join("\n")}
` : ""}

## 利用文脈（CEP）
${cepSection ? cepSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${cepSection?.dataTable ? `
### 詳細
${cepSection.dataTable.slice(0, 5).map((row) => `- ${JSON.stringify(row)}`).join("\n")}
` : ""}

## 競合ポジショニング
${competitionSection ? competitionSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${competitionSection?.dataTable ? `
### 詳細
${competitionSection.dataTable.slice(0, 5).map((row) => `- ${row["ブランド"]}: 相関${row["相関"]}, 共起${row["共起数"]}件, ${row["関係性"]}`).join("\n")}
` : ""}

## 代表メニュー
${dishSection ? dishSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${dishSection?.dataTable ? `
### 詳細
${dishSection.dataTable.slice(0, 5).map((row) => `- ${JSON.stringify(row)}`).join("\n")}
` : ""}

## W's詳細分析
${wsSection ? wsSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${wsSection?.dataTable ? `
### 詳細
${wsSection.dataTable.slice(0, 5).map((row) => `- ${JSON.stringify(row)}`).join("\n")}
` : ""}

${crossAnalysisSection}

${topPostsSection}

上記データに基づき、以下の観点で**包括的な**戦略レポートを生成してください：

1. **エグゼクティブサマリー**: 経営層が3分で理解できる要約
2. **深層インサイト**: 数値の背景にある消費者心理まで掘り下げる
3. **勝ちパターン**: クロス分析から特定された最適な組み合わせ
4. **改善機会**: 現状のギャップと解決策
5. **アクションプラン**: 実行優先度付きの具体的施策
6. **競合戦略**: 差別化とクロスセルの両面`;

  // OpenAIで試行
  if (openai) {
    try {
      console.log("  [INFO] Calling OpenAI API...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ENHANCED_STRATEGY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const result = JSON.parse(content);
        console.log("  [INFO] OpenAI response received successfully");
        return {
          findings: result.findings || defaultInsights.findings,
          recommendations: result.recommendations || defaultInsights.recommendations,
          keyInsight: result.keyInsight || defaultInsights.keyInsight,
          executiveSummary: result.executiveSummary,
          deepInsights: result.deepInsights,
          winningPatterns: result.winningPatterns,
          improvementOpportunities: result.improvementOpportunities,
          actionPlan: result.actionPlan,
          competitorStrategy: result.competitorStrategy,
        };
      }
    } catch (error) {
      console.log("  [WARN] OpenAI failed, trying Gemini fallback...", error instanceof Error ? error.message : error);
    }
  }

  // Geminiフォールバック
  if (gemini) {
    try {
      console.log("  [INFO] Calling Gemini API...");
      const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

      const geminiPrompt = `${ENHANCED_STRATEGY_SYSTEM_PROMPT}

${userPrompt}

必ずJSON形式で出力してください。以下のフィールドを含めてください：
- findings: 発見事項の配列（3-5項目）
- recommendations: 提言の配列（3-5項目）
- keyInsight: 核心的インサイト（1文）
- executiveSummary: エグゼクティブサマリー（3-5文）
- deepInsights: 深層インサイトの配列（3-5項目）
- winningPatterns: 勝ちパターンの配列（2-3項目）
- improvementOpportunities: 改善機会の配列（2-3項目）
- actionPlan: アクションプランの配列（3-5項目）
- competitorStrategy: 競合戦略の配列（2-3項目）`;

      const response = await model.generateContent(geminiPrompt);
      const text = response.response.text();

      // JSONを抽出（```json...```形式の場合も対応）
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      const result = JSON.parse(jsonStr);

      console.log("  [INFO] Gemini response received successfully");
      return {
        findings: result.findings || defaultInsights.findings,
        recommendations: result.recommendations || defaultInsights.recommendations,
        keyInsight: result.keyInsight || defaultInsights.keyInsight,
        executiveSummary: result.executiveSummary,
        deepInsights: result.deepInsights,
        winningPatterns: result.winningPatterns,
        improvementOpportunities: result.improvementOpportunities,
        actionPlan: result.actionPlan,
        competitorStrategy: result.competitorStrategy,
      };
    } catch (error) {
      console.error("  [ERROR] Gemini generation failed:", error instanceof Error ? error.message : error);
    }
  }

  console.log("  [WARN] All LLM providers failed, using default insights");
  return defaultInsights;
}

// Markdown生成
function generateMarkdown(
  brandName: string,
  sections: IssueSection[],
  strategy: StrategyInsights
): string {
  let markdown = `# ${brandName} ブランド分析レポート

**生成日時**: ${new Date().toLocaleString("ja-JP")}

---

## エグゼクティブサマリー

${strategy.executiveSummary || strategy.keyInsight}

---

`;

  // 戦略セクション（LLM生成分）
  if (strategy.deepInsights && strategy.deepInsights.length > 0) {
    markdown += `## 深層インサイト

${strategy.deepInsights.map((i, idx) => `${idx + 1}. ${i}`).join("\n\n")}

---

`;
  }

  if (strategy.winningPatterns && strategy.winningPatterns.length > 0) {
    markdown += `## 勝ちパターン

${strategy.winningPatterns.map((p) => `- ${p}`).join("\n")}

---

`;
  }

  if (strategy.improvementOpportunities && strategy.improvementOpportunities.length > 0) {
    markdown += `## 改善機会

${strategy.improvementOpportunities.map((o) => `- ${o}`).join("\n")}

---

`;
  }

  if (strategy.actionPlan && strategy.actionPlan.length > 0) {
    markdown += `## アクションプラン

${strategy.actionPlan.map((a) => `- ${a}`).join("\n")}

---

`;
  }

  if (strategy.competitorStrategy && strategy.competitorStrategy.length > 0) {
    markdown += `## 競合戦略

${strategy.competitorStrategy.map((c) => `- ${c}`).join("\n")}

---

`;
  }

  // 主要発見と提言
  markdown += `## 主要発見

${strategy.findings.map((f) => `- ${f}`).join("\n")}

## 提言

${strategy.recommendations.map((r) => `- ${r}`).join("\n")}

---

`;

  // 各分析セクション（3層分析フレームワーク）
  sections.forEach((section) => {
    const priorityBadge = section.priority === 'high' ? '**[重要]** ' :
                          section.priority === 'medium' ? '[注目] ' : '';

    markdown += `## ${priorityBadge}${section.title}

**問い**: ${section.question}

### 発見事項

${section.findings.map((f) => `- ${f}`).join("\n")}

`;

    // Layer 2: INSIGHT（洞察）
    if (section.insights && section.insights.length > 0) {
      markdown += `### 洞察（なぜこうなったのか）

${section.insights.map((i) => `- 💡 ${i}`).join("\n")}

`;
    }

    // クロス分析
    if (section.crossAnalysis) {
      markdown += `> 📊 **他セクションとの関連**: ${section.crossAnalysis}

`;
    }

    // Layer 3: ACTION（施策）
    if (section.recommendations && section.recommendations.length > 0) {
      markdown += `### 推奨アクション

${section.recommendations.map((r) => `- ✅ ${r}`).join("\n")}

`;
    }

    if (section.dataTable && section.dataTable.length > 0) {
      markdown += `### データ

| ${Object.keys(section.dataTable[0]).join(" | ")} |
| ${Object.keys(section.dataTable[0]).map(() => "---").join(" | ")} |
${section.dataTable.map((row) => `| ${Object.values(row).join(" | ")} |`).join("\n")}

`;
    }

    markdown += `---

`;
  });

  return markdown;
}

// メイン処理：単一ブランドのレポート生成
async function generateBrandReport(brandName: string): Promise<void> {
  console.log(`\n[${brandName}] レポート生成開始...`);

  // ブランドID取得
  const { data: brandData } = await supabase
    .from("brands")
    .select("id, name")
    .eq("name", brandName)
    .single();

  if (!brandData) {
    console.error(`  [ERROR] Brand not found: ${brandName}`);
    return;
  }

  const brandId = brandData.id;

  // 全ブランドマップ
  const { data: allBrands } = await supabase
    .from("brands")
    .select("id, name");

  const brandMap = new Map<number, string>();
  allBrands?.forEach((b: { id: number; name: string }) => brandMap.set(b.id, b.name));

  // 各分析を並列実行（12セクション）
  console.log("  [INFO] Running analysis (12 sections)...");
  const [
    healthSection,
    userSection,
    cepSection,
    competitionSection,
    dishSection,
    wsSection,
    dptSection,
    risksSection,
    growthSection,
    seasonalSection,
    contentSection,
    searchSection,
    crossAnalysis,
    topPosts,
  ] = await Promise.all([
    analyzeHealth(brandName, brandId, brandMap),
    analyzeUserProfile(brandName),
    analyzeUsageContext(brandName),
    analyzeCompetition(brandName, brandId, brandMap),
    analyzeSignatureDishes(brandName),
    analyzeWsDetail(brandName),
    analyzeDPT(brandName, brandId),
    analyzeRisks(brandName, brandId),
    analyzeGrowthOpportunity(brandName, brandId),
    analyzeSeasonalStrategy(brandName, brandId),
    analyzeContentStrategy(brandName),
    analyzeSearchStrategy(brandName, brandId),
    analyzeCrossDimensions(brandName),
    fetchSamplePosts(brandName, { orderBy: "engagement_total", limit: 5 }),
  ]);

  // 3層分析フレームワーク適用（insights/recommendations追加）
  console.log("  [INFO] Applying 3-layer analysis framework...");
  const sections = [
    healthSection,
    userSection,
    cepSection,
    competitionSection,
    dishSection,
    wsSection,
    dptSection,
    risksSection,
    growthSection,
    seasonalSection,
    contentSection,
    searchSection,
  ].map(enrichSectionWithInsights);

  // LLM戦略生成
  console.log("  [INFO] Generating strategy insights...");
  const strategy = await generateDetailedStrategy(brandName, sections, crossAnalysis, topPosts);

  // Markdown生成
  console.log("  [INFO] Generating markdown...");
  const markdown = generateMarkdown(brandName, sections, strategy);

  // レポートオブジェクト
  const report: IssueReport = {
    issueId: `brand-${brandName}`,
    title: `${brandName} ブランド分析レポート`,
    generatedAt: new Date().toISOString(),
    sections,
    strategy,
    markdown,
  };

  // 出力ディレクトリ作成
  const brandDir = path.join(OUTPUT_DIR, brandName);
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }

  // JSON出力
  const jsonPath = path.join(brandDir, "report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`  [OK] ${jsonPath}`);

  // Markdown出力
  const mdPath = path.join(brandDir, "report.md");
  fs.writeFileSync(mdPath, markdown, "utf-8");
  console.log(`  [OK] ${mdPath}`);

  console.log(`[${brandName}] 完了`);
}

// ポートフォリオレポート用セクション型
interface PortfolioSection {
  title: string;
  question: string;
  findings: string[];
  insights: string[];
  recommendations: string[];
  crossAnalysis?: string;
  priority: 'high' | 'medium' | 'low';
  dataTable?: Array<Record<string, string | number>>;
}

interface PortfolioReport {
  issueId: string;
  title: string;
  generatedAt: string;
  sections: PortfolioSection[];
  executiveSummary: string;
  strategicPriorities: {
    immediate: string[];
    midTerm: string[];
    deferred: string[];
  };
  markdown: string;
}

// ポートフォリオレポート生成
async function generatePortfolioReport(): Promise<void> {
  console.log("\n[PORTFOLIO] ポートフォリオレポート生成開始...");

  // 出力ディレクトリ作成
  const portfolioDir = path.join(OUTPUT_DIR, "portfolio");
  if (!fs.existsSync(portfolioDir)) {
    fs.mkdirSync(portfolioDir, { recursive: true });
  }

  // 全ブランドデータを取得
  const { data: correlations } = await supabase
    .from("correlations")
    .select("brand1_id, brand2_id, correlation")
    .order("correlation", { ascending: false });

  const { data: seasonality } = await supabase
    .from("seasonality")
    .select("brand_id, month, avg_score");

  const { data: sentiments } = await supabase
    .from("sns_sentiments")
    .select("brand_id, positive_count, negative_count, neutral_count");

  const { data: weeklyTrends } = await supabase
    .from("weekly_trends")
    .select("brand_id, week_start, score")
    .order("week_start", { ascending: false })
    .limit(800);

  const { data: allBrands } = await supabase
    .from("brands")
    .select("id, name");

  const brandMap = new Map<number, string>();
  allBrands?.forEach((b: { id: number; name: string }) => brandMap.set(b.id, b.name));

  // セクション1: カニバリ検証
  const cannibalizationSection = analyzePortfolioCannibalization(correlations || [], brandMap);

  // セクション2: 導線設計（共起分析）
  const cooccurrenceSection = await analyzePortfolioCooccurrence(brandMap);

  // セクション3: 棲み分け（CEP分析）
  const cepDifferentiationSection = await analyzePortfolioCEPDifferentiation(brandMap);

  // セクション4: 季節性活用
  const seasonalitySection = analyzePortfolioSeasonality(seasonality || [], brandMap);

  // セクション5: トレンド変化
  const trendSection = analyzePortfolioTrend(weeklyTrends || [], brandMap);

  // セクション6: ユーザー感情
  const sentimentSection = analyzePortfolioSentiment(sentiments || [], brandMap);

  // セクション7: バズ要因
  const buzzSection = await analyzePortfolioBuzz(brandMap);

  // セクション8: 空白機会
  const opportunitySection = await analyzePortfolioOpportunity(brandMap);

  // セクション9: ポートフォリオバランス
  const balanceSection = await analyzePortfolioBalance(brandMap);

  // セクション10: 優先順位付け
  const prioritySection = await analyzePortfolioPriority(brandMap);

  const sections: PortfolioSection[] = [
    cannibalizationSection,
    cooccurrenceSection,
    cepDifferentiationSection,
    seasonalitySection,
    trendSection,
    sentimentSection,
    buzzSection,
    opportunitySection,
    balanceSection,
    prioritySection,
  ];

  // エグゼクティブサマリー生成
  const executiveSummary = generatePortfolioSummary(sections);

  // 戦略的優先順位
  const strategicPriorities = {
    immediate: sections
      .filter(s => s.priority === 'high')
      .flatMap(s => s.recommendations.slice(0, 2)),
    midTerm: sections
      .filter(s => s.priority === 'medium')
      .flatMap(s => s.recommendations.slice(0, 1)),
    deferred: sections
      .filter(s => s.priority === 'low')
      .flatMap(s => s.recommendations.slice(0, 1)),
  };

  // Markdown生成
  const markdown = generatePortfolioMarkdown(sections, executiveSummary, strategicPriorities);

  const report: PortfolioReport = {
    issueId: "portfolio",
    title: "ポートフォリオ総合分析",
    generatedAt: new Date().toISOString(),
    sections,
    executiveSummary,
    strategicPriorities,
    markdown,
  };

  // JSON出力
  const jsonPath = path.join(portfolioDir, "report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`  [OK] ${jsonPath}`);

  // Markdown出力
  const mdPath = path.join(portfolioDir, "report.md");
  fs.writeFileSync(mdPath, markdown, "utf-8");
  console.log(`  [OK] ${mdPath}`);

  console.log("[PORTFOLIO] 完了");
}

// カニバリ検証
function analyzePortfolioCannibalization(
  correlations: Array<{ brand1_id: number; brand2_id: number; correlation: number }>,
  brandMap: Map<number, string>
): PortfolioSection {
  const highCorrelations = correlations
    .filter(c => c.brand1_id !== c.brand2_id && c.correlation > 0.3)
    .slice(0, 10);

  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  highCorrelations.forEach(c => {
    const brand1 = brandMap.get(c.brand1_id) || `Brand${c.brand1_id}`;
    const brand2 = brandMap.get(c.brand2_id) || `Brand${c.brand2_id}`;
    findings.push(`${brand1}と${brand2}は相関${c.correlation.toFixed(2)}で連動傾向`);
    dataTable.push({
      "ブランドA": brand1,
      "ブランドB": brand2,
      "相関係数": c.correlation.toFixed(2),
      "評価": c.correlation > 0.5 ? "高連動" : "中連動",
    });
  });

  const insights = [
    "高い相関は、同一CEP（利用シーン）での競合または補完関係を示唆",
    "季節性が類似している場合、需要が連動するため広告投資の効率化が可能",
    "相関が低いブランドペアは独立した需要を持ち、リスク分散に寄与",
  ];

  const recommendations = [
    "相関0.5以上のペアはCEP差別化の検討（共食いリスク）",
    "中相関ペアは合同キャンペーンでクロスセル促進",
    "低相関ブランドは独立した訴求軸を維持",
  ];

  return {
    title: "カニバリ検証",
    question: "ブランド間で需要の奪い合い（カニバリ）は起きているか？",
    findings: findings.length > 0 ? findings : ["顕著なカニバリパターンは検出されず"],
    insights,
    recommendations,
    crossAnalysis: "棲み分けセクションのCEP重複状況と照合することで、連動の原因を特定可能",
    priority: highCorrelations.some(c => c.correlation > 0.5) ? 'high' : 'medium',
    dataTable,
  };
}

// 共起分析
async function analyzePortfolioCooccurrence(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  const { data: cooccurrences } = await supabase
    .from("sns_cooccurrences")
    .select("brand1_id, brand2_id, cooccurrence_count")
    .gt("cooccurrence_count", 5)
    .order("cooccurrence_count", { ascending: false })
    .limit(20);

  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  cooccurrences?.forEach((c: { brand1_id: number; brand2_id: number; cooccurrence_count: number }) => {
    if (c.brand1_id !== c.brand2_id) {
      const brand1 = brandMap.get(c.brand1_id) || `Brand${c.brand1_id}`;
      const brand2 = brandMap.get(c.brand2_id) || `Brand${c.brand2_id}`;
      findings.push(`${brand1}×${brand2}: ${c.cooccurrence_count}回共起`);
      dataTable.push({
        "ブランド1": brand1,
        "ブランド2": brand2,
        "共起数": c.cooccurrence_count,
        "施策": c.cooccurrence_count > 50 ? "クロスセル候補" : "要観察",
      });
    }
  });

  return {
    title: "導線設計（共起分析）",
    question: "どのブランドが同時に使われ/語られているか？",
    findings: findings.length > 0 ? findings.slice(0, 5) : ["共起データなし"],
    insights: [
      "高共起ペアは「併用シーン」が存在。レシピ提案でクロスセル可能",
      "共起が低いペアは接点が少なく、新たな組み合わせ提案の余地あり",
    ],
    recommendations: [
      "共起上位ペアの「併用レシピ」コンテンツ制作",
      "低共起ペアの組み合わせを提案するチャレンジキャンペーン",
    ],
    crossAnalysis: "カニバリ検証の相関と照合し、「補完」か「競合」かを判別",
    priority: 'medium',
    dataTable,
  };
}

// CEP棲み分け
async function analyzePortfolioCEPDifferentiation(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  const { data: brandCeps } = await supabase
    .from("brand_ceps")
    .select("brand_id, cep_id, mention_count, avg_engagement");

  const { data: ceps } = await supabase
    .from("ceps")
    .select("id, cep_name");

  const cepMap = new Map<number, string>();
  ceps?.forEach((c: { id: number; cep_name: string }) => cepMap.set(c.id, c.cep_name));

  // CEPごとのブランド競合分析
  const cepBrandCount = new Map<number, number>();
  brandCeps?.forEach((bc: { brand_id: number; cep_id: number; mention_count: number }) => {
    if (bc.mention_count > 10) {
      cepBrandCount.set(bc.cep_id, (cepBrandCount.get(bc.cep_id) || 0) + 1);
    }
  });

  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  cepBrandCount.forEach((count, cepId) => {
    const cepName = cepMap.get(cepId) || `CEP${cepId}`;
    if (count >= 3) {
      findings.push(`「${cepName}」は${count}ブランドが競合（要差別化）`);
    }
    dataTable.push({
      "CEP": cepName,
      "競合ブランド数": count,
      "評価": count >= 4 ? "過密" : count >= 3 ? "競合" : "適正",
    });
  });

  return {
    title: "棲み分け（CEP分析）",
    question: "各CEPでのブランドポジショニングは適切か？",
    findings: findings.length > 0 ? findings : ["CEP競合は軽微"],
    insights: [
      "複数ブランドが競合するCEPは、差別化メッセージが必須",
      "単独支配CEPはブランド資産として保護・強化すべき",
    ],
    recommendations: [
      "過密CEPでは「独自の切り口」を見つけて差別化",
      "空白CEPへの先行参入でポジション確立",
    ],
    crossAnalysis: "カニバリ検証で高相関だったペアのCEP重複を確認",
    priority: findings.length > 2 ? 'high' : 'medium',
    dataTable: dataTable.sort((a, b) => Number(b["競合ブランド数"]) - Number(a["競合ブランド数"])),
  };
}

// 季節性活用
function analyzePortfolioSeasonality(
  seasonality: Array<{ brand_id: number; month: number; avg_score: number }>,
  brandMap: Map<number, string>
): PortfolioSection {
  // 月別ブランドランキング
  const monthlyBest = new Map<number, { brand: string; score: number }>();
  seasonality.forEach(s => {
    const brand = brandMap.get(s.brand_id) || `Brand${s.brand_id}`;
    const current = monthlyBest.get(s.month);
    if (!current || s.avg_score > current.score) {
      monthlyBest.set(s.month, { brand, score: s.avg_score });
    }
  });

  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  monthlyBest.forEach((best, month) => {
    const monthName = `${month}月`;
    findings.push(`${monthName}のリーダー: ${best.brand}（スコア${best.score.toFixed(0)}）`);
    dataTable.push({
      "月": monthName,
      "トップブランド": best.brand,
      "スコア": Math.round(best.score),
    });
  });

  return {
    title: "季節性活用",
    question: "各季節でどのブランドを強化すべきか？",
    findings: findings.slice(0, 6),
    insights: [
      "季節ごとのリーダーブランドに広告予算を集中投下することで効率UP",
      "閑散期のブランドは低コストで露出維持し、ピーク期に備える",
    ],
    recommendations: [
      "月別ブランドカレンダーの作成と予算配分最適化",
      "閑散期向けの「オフシーズンレシピ」コンテンツ準備",
    ],
    priority: 'medium',
    dataTable: dataTable.sort((a, b) => Number(String(a["月"]).replace("月", "")) - Number(String(b["月"]).replace("月", ""))),
  };
}

// トレンド変化
function analyzePortfolioTrend(
  weeklyTrends: Array<{ brand_id: number; week_start: string; score: number }>,
  brandMap: Map<number, string>
): PortfolioSection {
  // 直近12週 vs 前年同期の比較
  const brandScores = new Map<number, { recent: number[]; yearAgo: number[] }>();

  weeklyTrends.forEach(t => {
    if (!brandScores.has(t.brand_id)) {
      brandScores.set(t.brand_id, { recent: [], yearAgo: [] });
    }
    const scores = brandScores.get(t.brand_id)!;
    if (scores.recent.length < 12) {
      scores.recent.push(t.score);
    } else if (scores.yearAgo.length < 12) {
      scores.yearAgo.push(t.score);
    }
  });

  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  brandScores.forEach((scores, brandId) => {
    const brand = brandMap.get(brandId) || `Brand${brandId}`;
    const recentAvg = scores.recent.length > 0 ? scores.recent.reduce((a, b) => a + b, 0) / scores.recent.length : 0;
    const yearAgoAvg = scores.yearAgo.length > 0 ? scores.yearAgo.reduce((a, b) => a + b, 0) / scores.yearAgo.length : 0;
    const change = yearAgoAvg > 0 ? ((recentAvg - yearAgoAvg) / yearAgoAvg * 100) : 0;

    if (Math.abs(change) > 5) {
      const trend = change > 0 ? "成長" : "減少";
      findings.push(`${brand}: ${trend}${Math.abs(change).toFixed(0)}%`);
    }

    dataTable.push({
      "ブランド": brand,
      "直近12週平均": Math.round(recentAvg),
      "前年同期平均": Math.round(yearAgoAvg),
      "変化率": `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`,
    });
  });

  const growthBrands = dataTable.filter(d => String(d["変化率"]).includes("+") && parseInt(String(d["変化率"])) > 5);
  const declineBrands = dataTable.filter(d => !String(d["変化率"]).includes("+") && Math.abs(parseInt(String(d["変化率"]))) > 5);

  return {
    title: "トレンド変化",
    question: "各ブランドの成長/減少トレンドは？",
    findings: findings.length > 0 ? findings : ["顕著なトレンド変化なし"],
    insights: [
      growthBrands.length > 0 ? `成長ブランド（${growthBrands.map(b => b["ブランド"]).join("、")}）への投資継続が有効` : "成長ブランドなし",
      declineBrands.length > 0 ? `減少ブランド（${declineBrands.map(b => b["ブランド"]).join("、")}）は原因分析と対策が急務` : "減少ブランドなし",
    ],
    recommendations: [
      "成長ブランドのモメンタム維持施策",
      "減少ブランドの競合分析と差別化強化",
    ],
    priority: declineBrands.length > 2 ? 'high' : 'medium',
    dataTable: dataTable.sort((a, b) => parseInt(String(b["変化率"])) - parseInt(String(a["変化率"]))),
  };
}

// ユーザー感情
function analyzePortfolioSentiment(
  sentiments: Array<{ brand_id: number; positive_count: number; negative_count: number; neutral_count: number }>,
  brandMap: Map<number, string>
): PortfolioSection {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  sentiments.forEach(s => {
    const brand = brandMap.get(s.brand_id) || `Brand${s.brand_id}`;
    const total = s.positive_count + s.negative_count + s.neutral_count;
    const posRate = total > 0 ? (s.positive_count / total * 100) : 0;
    const negRate = total > 0 ? (s.negative_count / total * 100) : 0;

    if (negRate > 10) {
      findings.push(`${brand}: ネガティブ率${negRate.toFixed(0)}%（要対策）`);
    }

    dataTable.push({
      "ブランド": brand,
      "ポジティブ率": `${posRate.toFixed(0)}%`,
      "ネガティブ率": `${negRate.toFixed(0)}%`,
      "評価": negRate > 15 ? "要対策" : negRate > 10 ? "注意" : "良好",
    });
  });

  const highNegBrands = dataTable.filter(d => d["評価"] === "要対策" || d["評価"] === "注意");

  return {
    title: "ユーザー感情",
    question: "各ブランドへのユーザー評価は健全か？",
    findings: findings.length > 0 ? findings : ["全ブランドのネガティブ率は許容範囲内"],
    insights: [
      "ネガティブ率10%超は、特定の不満が蓄積している可能性",
      "ポジティブ率が高いブランドはUGC活用のポテンシャルが高い",
    ],
    recommendations: highNegBrands.length > 0 ? [
      `${highNegBrands.map(b => b["ブランド"]).join("、")}のネガティブ投稿内容を詳細分析`,
      "不満要因への対策コンテンツ（FAQ、使い方ガイド等）作成",
    ] : [
      "現状の好感度維持施策の継続",
      "高ポジティブブランドのUGCキャンペーン検討",
    ],
    priority: highNegBrands.length > 0 ? 'high' : 'low',
    dataTable: dataTable.sort((a, b) => parseFloat(String(b["ネガティブ率"])) - parseFloat(String(a["ネガティブ率"]))),
  };
}

// バズ要因
async function analyzePortfolioBuzz(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  // CEPマスタを取得
  const { data: cepsData } = await supabase
    .from("ceps")
    .select("id, cep_name");

  const cepMap = new Map<number, string>();
  cepsData?.forEach((c: { id: number; cep_name: string }) => {
    cepMap.set(c.id, c.cep_name);
  });

  // 高エンゲージメント投稿の傾向分析（cep_idを使用）
  const { data: topPosts } = await supabase
    .from("sns_posts")
    .select("brand_mentions, cep_id, dish_category, cooking_for, engagement_total")
    .not("engagement_total", "is", null)
    .gt("engagement_total", 0)
    .order("engagement_total", { ascending: false })
    .limit(100);

  // パターン抽出
  const cepCounts = new Map<string, number>();
  const dishCounts = new Map<string, number>();

  topPosts?.forEach((p: { cep_id: number | null; dish_category: string | null }) => {
    if (p.cep_id) {
      const cepName = cepMap.get(p.cep_id) || `CEP ${p.cep_id}`;
      cepCounts.set(cepName, (cepCounts.get(cepName) || 0) + 1);
    }
    if (p.dish_category) dishCounts.set(p.dish_category, (dishCounts.get(p.dish_category) || 0) + 1);
  });

  const topCEPs = [...cepCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDishes = [...dishCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // データがない場合のフォールバック
  const cepList = topCEPs.length > 0 ? topCEPs.map(([cep]) => cep).join("、") : "データなし";
  const dishList = topDishes.length > 0 ? topDishes.map(([dish]) => toCategoryLabel(dish)).join("、") : "データなし";

  const findings = [
    `高ENG投稿のCEP上位: ${cepList}`,
    `高ENG投稿のメニュー上位: ${dishList}`,
  ];

  return {
    title: "バズ要因",
    question: "高エンゲージメントを生む投稿パターンは？",
    findings,
    insights: [
      "上位CEP・メニューの組み合わせは「共感ポイント」。コンテンツ戦略の軸に",
      "高ENG投稿の共通点を抽出し、再現性のあるテンプレート化が可能",
    ],
    recommendations: [
      `「${topCEPs[0]?.[0] || "時短"}」×「${toCategoryLabel(topDishes[0]?.[0] || "炒め物")}」テーマのコンテンツ集中制作`,
      "高ENG投稿のトンマナ・フォーマットを横展開",
    ],
    priority: 'medium',
    dataTable: topCEPs.map(([cep, count]) => ({ "CEP": cep, "高ENG投稿数": count })),
  };
}

// 空白機会
async function analyzePortfolioOpportunity(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  const { data: brandCeps } = await supabase
    .from("brand_ceps")
    .select("brand_id, cep_id, mention_count");

  const { data: ceps } = await supabase
    .from("ceps")
    .select("id, cep_name");

  const cepMap = new Map<number, string>();
  ceps?.forEach((c: { id: number; cep_name: string }) => cepMap.set(c.id, c.cep_name));

  // 各CEPでの市場最高と各ブランドのスコアを比較
  const cepMaxScore = new Map<number, number>();
  brandCeps?.forEach((bc: { cep_id: number; mention_count: number }) => {
    const current = cepMaxScore.get(bc.cep_id) || 0;
    if (bc.mention_count > current) {
      cepMaxScore.set(bc.cep_id, bc.mention_count);
    }
  });

  // 参入余地のあるCEPを特定
  const opportunities: Array<{ cep: string; gap: number; leader: string }> = [];
  cepMaxScore.forEach((maxScore, cepId) => {
    const cepName = cepMap.get(cepId) || `CEP${cepId}`;
    if (maxScore > 50) {  // 市場規模があるCEPのみ
      opportunities.push({ cep: cepName, gap: maxScore, leader: "要調査" });
    }
  });

  const findings = opportunities.slice(0, 5).map(o => `「${o.cep}」に参入余地（市場規模${o.gap}）`);

  return {
    title: "空白機会",
    question: "未開拓の成長機会はどこにあるか？",
    findings: findings.length > 0 ? findings : ["明確な空白機会は検出されず"],
    insights: [
      "空白CEPは「ブルーオーシャン」だが、需要が小さい可能性も考慮",
      "競合が手薄な領域から攻めることで、効率的なポジション確立が可能",
    ],
    recommendations: [
      "空白CEP上位3つについて、需要規模の詳細調査",
      "パイロットキャンペーンで市場反応をテスト",
    ],
    priority: opportunities.length > 3 ? 'medium' : 'low',
    dataTable: opportunities.slice(0, 10).map(o => ({
      "CEP": o.cep,
      "市場規模": o.gap,
      "評価": o.gap > 100 ? "高ポテンシャル" : "中ポテンシャル",
    })),
  };
}

// ポートフォリオバランス
async function analyzePortfolioBalance(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  const { data: mentions } = await supabase
    .from("sns_mentions")
    .select("brand_id, mention_count");

  const totalMentions = mentions?.reduce((sum, m: { mention_count: number }) => sum + m.mention_count, 0) || 0;

  const dataTable: Array<Record<string, string | number>> = [];
  mentions?.forEach((m: { brand_id: number; mention_count: number }) => {
    const brand = brandMap.get(m.brand_id) || `Brand${m.brand_id}`;
    const share = totalMentions > 0 ? (m.mention_count / totalMentions * 100) : 0;
    dataTable.push({
      "ブランド": brand,
      "言及数": m.mention_count,
      "シェア": `${share.toFixed(1)}%`,
    });
  });

  dataTable.sort((a, b) => Number(b["言及数"]) - Number(a["言及数"]));

  const topBrand = dataTable[0];
  const topShare = parseFloat(String(topBrand?.["シェア"] || "0"));

  const findings = [
    `トップブランド: ${topBrand?.["ブランド"]}（シェア${topBrand?.["シェア"]}）`,
    `ポートフォリオ集中度: ${topShare > 40 ? "高集中" : topShare > 25 ? "中程度" : "分散型"}`,
  ];

  return {
    title: "ポートフォリオバランス",
    question: "ブランド間のバランスは適切か？",
    findings,
    insights: [
      topShare > 40 ? "特定ブランドへの依存度が高い。リスク分散の観点から他ブランド育成も検討" : "バランスの取れたポートフォリオ構成",
      "下位ブランドは「ニッチ戦略」または「撤退」の判断が必要",
    ],
    recommendations: [
      topShare > 40 ? "第2位ブランドの育成強化でリスク分散" : "現状のバランス維持",
      "下位ブランドの役割定義（ニッチ特化 or 統廃合検討）",
    ],
    priority: topShare > 50 ? 'high' : 'low',
    dataTable,
  };
}

// 優先順位付け
async function analyzePortfolioPriority(
  brandMap: Map<number, string>
): Promise<PortfolioSection> {
  // 簡易的な優先順位付け（成長性 × 規模）
  const { data: mentions } = await supabase
    .from("sns_mentions")
    .select("brand_id, mention_count");

  const { data: sentiments } = await supabase
    .from("sns_sentiments")
    .select("brand_id, positive_count, negative_count, neutral_count");

  const dataTable: Array<Record<string, string | number>> = [];

  mentions?.forEach((m: { brand_id: number; mention_count: number }) => {
    const brand = brandMap.get(m.brand_id) || `Brand${m.brand_id}`;
    const sentiment = sentiments?.find((s: { brand_id: number }) => s.brand_id === m.brand_id);
    const total = sentiment ? sentiment.positive_count + sentiment.negative_count + sentiment.neutral_count : 0;
    const posRate = total > 0 ? (sentiment?.positive_count || 0) / total : 0;

    // 簡易スコア: 言及数 × ポジティブ率
    const priorityScore = Math.round(m.mention_count * posRate);

    dataTable.push({
      "ブランド": brand,
      "言及数": m.mention_count,
      "ポジティブ率": `${(posRate * 100).toFixed(0)}%`,
      "優先度スコア": priorityScore,
      "推奨施策": priorityScore > 1000 ? "積極投資" : priorityScore > 500 ? "維持" : "効率化",
    });
  });

  dataTable.sort((a, b) => Number(b["優先度スコア"]) - Number(a["優先度スコア"]));

  const findings = dataTable.slice(0, 3).map(d => `${d["ブランド"]}: ${d["推奨施策"]}（スコア${d["優先度スコア"]}）`);

  return {
    title: "投資優先順位",
    question: "どのブランドに優先的にリソースを投下すべきか？",
    findings,
    insights: [
      "スコア上位ブランドは「勝ち馬に乗る」戦略で投資効率を最大化",
      "下位ブランドは役割を明確化し、無駄な投資を削減",
    ],
    recommendations: [
      `${dataTable[0]?.["ブランド"]}への広告予算優先配分`,
      "下位ブランドのコスト最適化（効率化施策）",
    ],
    priority: 'high',
    dataTable,
  };
}

// ポートフォリオサマリー生成
function generatePortfolioSummary(sections: PortfolioSection[]): string {
  const highPrioritySections = sections.filter(s => s.priority === 'high');
  const keyFindings = highPrioritySections.flatMap(s => s.findings.slice(0, 1));
  const keyActions = highPrioritySections.flatMap(s => s.recommendations.slice(0, 1));

  return `
**重要発見**:
${keyFindings.map(f => `- ${f}`).join("\n")}

**優先アクション**:
${keyActions.map(a => `- ${a}`).join("\n")}
`.trim();
}

// ポートフォリオMarkdown生成
function generatePortfolioMarkdown(
  sections: PortfolioSection[],
  executiveSummary: string,
  strategicPriorities: { immediate: string[]; midTerm: string[]; deferred: string[] }
): string {
  let markdown = `# ポートフォリオ総合分析レポート

**生成日時**: ${new Date().toLocaleString("ja-JP")}

---

## エグゼクティブサマリー

${executiveSummary}

---

## 戦略的優先順位

### 今すぐ対応（高優先）
${strategicPriorities.immediate.length > 0 ? strategicPriorities.immediate.map(i => `- ${i}`).join("\n") : "- 特になし"}

### 中期的に取り組む
${strategicPriorities.midTerm.length > 0 ? strategicPriorities.midTerm.map(m => `- ${m}`).join("\n") : "- 特になし"}

### 見送り可
${strategicPriorities.deferred.length > 0 ? strategicPriorities.deferred.map(d => `- ${d}`).join("\n") : "- 特になし"}

---

`;

  sections.forEach(section => {
    const priorityBadge = section.priority === 'high' ? '**[重要]** ' :
                          section.priority === 'medium' ? '[注目] ' : '';

    markdown += `## ${priorityBadge}${section.title}

**問い**: ${section.question}

### 発見事項
${section.findings.map(f => `- ${f}`).join("\n")}

### 洞察
${section.insights.map(i => `- 💡 ${i}`).join("\n")}

${section.crossAnalysis ? `> 📊 **クロス分析**: ${section.crossAnalysis}\n\n` : ""}

### 推奨アクション
${section.recommendations.map(r => `- ✅ ${r}`).join("\n")}

${section.dataTable && section.dataTable.length > 0 ? `### データ

| ${Object.keys(section.dataTable[0]).join(" | ")} |
| ${Object.keys(section.dataTable[0]).map(() => "---").join(" | ")} |
${section.dataTable.slice(0, 10).map(row => `| ${Object.values(row).join(" | ")} |`).join("\n")}

` : ""}
---

`;
  });

  return markdown;
}

// index.json 生成
function generateIndex(brands: string[]): void {
  const index = {
    generatedAt: new Date().toISOString(),
    brands: brands.map((brand) => {
      const brandDir = path.join(OUTPUT_DIR, brand);
      const jsonPath = path.join(brandDir, "report.json");
      const exists = fs.existsSync(jsonPath);
      let updatedAt: string | undefined;

      if (exists) {
        const stat = fs.statSync(jsonPath);
        updatedAt = stat.mtime.toISOString();
      }

      return {
        name: brand,
        exists,
        updatedAt,
        paths: {
          json: `${brand}/report.json`,
          markdown: `${brand}/report.md`,
        },
      };
    }),
  };

  const indexPath = path.join(OUTPUT_DIR, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
  console.log(`\n[INDEX] ${indexPath}`);
}

// メイン
async function main() {
  const { brand } = parseArgs();

  console.log("====================================");
  console.log("レポート生成スクリプト");
  console.log("====================================");
  console.log(`出力先: ${OUTPUT_DIR}`);
  console.log(`OpenAI API: ${openai ? "有効" : "無効（デフォルト値使用）"}`);

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const targetBrands = brand ? [brand] : VALID_BRANDS;

  if (brand && !VALID_BRANDS.includes(brand)) {
    console.error(`[ERROR] Invalid brand: ${brand}`);
    console.error(`Valid brands: ${VALID_BRANDS.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n対象ブランド: ${targetBrands.join(", ")}`);

  for (const b of targetBrands) {
    await generateBrandReport(b);
  }

  // ポートフォリオレポート生成（ブランド指定がない場合のみ）
  if (!brand) {
    await generatePortfolioReport();
  }

  // index.json 生成
  generateIndex(VALID_BRANDS);

  console.log("\n====================================");
  console.log("完了");
  console.log("====================================");
}

main().catch(console.error);
