/**
 * UGCラベリングスクリプト（並列処理版）
 *
 * 新しいラベルを付与:
 * - sentiment, cep_category, intent, life_stage, cooking_skill, emotion, with_whom
 * - why_motivation, paired_keywords
 *
 * 使用方法:
 *   npx tsx scripts/label-ugc-posts.ts                    # 全件処理
 *   npx tsx scripts/label-ugc-posts.ts --limit 100        # 100件のみ
 *   npx tsx scripts/label-ugc-posts.ts --source twitter   # Twitterのみ
 *   npx tsx scripts/label-ugc-posts.ts --dry-run          # API呼び出しなし
 *   npx tsx scripts/label-ugc-posts.ts --concurrency 5    # 同時実行数
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, existsSync, readFileSync } from "fs";

// 環境変数読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

// 進捗保存ファイル
const PROGRESS_FILE = resolve(process.cwd(), ".label-progress.json");

// ラベル定義
const LABELS = {
  sentiment: ["positive", "neutral", "negative"],
  cep_category: [
    "time_saving_weeknight",
    "taste_anxiety",
    "weekend_cooking",
    "kids_picky_eating",
    "solo_easy_meal",
    "health_conscious",
    "entertaining",
    "drinking_snacks",
    "leftover_remake",
    "seasonal_taste",
    "diet_satisfaction",
    "morning_time_save",
    "none",
  ],
  intent: ["purchase_consider", "usage_report", "recipe_share", "question", "complaint", "other"],
  life_stage: ["single", "couple", "child_raising", "empty_nest", "senior", "unknown"],
  cooking_skill: ["beginner", "intermediate", "advanced", "unknown"],
  emotion: ["anxiety", "relief", "satisfaction", "guilt", "excitement", "frustration", "neutral"],
  with_whom: ["solo", "family", "kids", "guest", "unknown"],
};

// CEP ID マッピング
const CEP_ID_MAP: Record<string, number | null> = {
  time_saving_weeknight: 1,
  taste_anxiety: 2,
  weekend_cooking: 3,
  kids_picky_eating: 4,
  solo_easy_meal: 5,
  health_conscious: 6,
  entertaining: 7,
  drinking_snacks: 8,
  leftover_remake: 9,
  seasonal_taste: 10,
  diet_satisfaction: 11,
  morning_time_save: 12,
  none: null,
};

// プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドに関するSNS投稿を分析するエキスパートです。

各投稿について以下の項目を判定し、JSON配列で出力してください。

## 分類項目

### 1. sentiment（感情）
- positive: 好意的、満足、おすすめ
- neutral: 中立、事実共有、質問
- negative: 不満、批判、問題提起

### 2. cep_category（生活文脈）
- time_saving_weeknight: 平日夜の時短
- taste_anxiety: 味付け不安
- weekend_cooking: 週末本格料理
- kids_picky_eating: 子どもの好き嫌い
- solo_easy_meal: 一人暮らし手抜き
- health_conscious: 健康意識
- entertaining: おもてなし
- drinking_snacks: 晩酌つまみ
- leftover_remake: 残り物リメイク
- seasonal_taste: 季節の味覚
- diet_satisfaction: ダイエット満足
- morning_time_save: 朝の時短
- none: 該当なし

### 3. intent（投稿意図）
- purchase_consider: 購入検討
- usage_report: 使用報告
- recipe_share: レシピ共有
- question: 質問
- complaint: 不満・クレーム
- other: その他

### 4. life_stage（ライフステージ）
- single: 一人暮らし
- couple: 二人暮らし
- child_raising: 子育て中
- empty_nest: 子供独立後
- senior: シニア
- unknown: 不明

### 5. cooking_skill（料理スキル）
- beginner: 初心者
- intermediate: 中級
- advanced: 上級
- unknown: 不明

### 6. emotion（主な感情）
- anxiety: 不安
- relief: 安心
- satisfaction: 満足
- guilt: 罪悪感
- excitement: ワクワク
- frustration: イライラ
- neutral: 特になし

### 7. with_whom（誰と）
- solo: 一人
- family: 家族
- kids: 子ども
- guest: 来客
- unknown: 不明

### 8. why_motivation（動機）20字以内で簡潔に

### 9. paired_keywords（関連キーワード）
料理名、食材など最大3つ

## 出力形式
\`\`\`json
[
  {
    "id": 1,
    "sentiment": "positive",
    "cep_category": "time_saving_weeknight",
    "intent": "usage_report",
    "life_stage": "child_raising",
    "cooking_skill": "intermediate",
    "emotion": "satisfaction",
    "with_whom": "family",
    "why_motivation": "忙しい夜に簡単に",
    "paired_keywords": ["野菜炒め", "豚肉"]
  }
]
\`\`\``;

interface Post {
  id: number;
  url: string;
  title: string | null;
  content: string | null;
  source_category: string | null;
}

interface LabelResult {
  id: number;
  sentiment: string;
  cep_category: string;
  intent: string;
  life_stage: string;
  cooking_skill: string;
  emotion: string;
  with_whom: string;
  why_motivation: string;
  paired_keywords: string[];
}

interface Progress {
  processedIds: number[];
  lastUpdated: string;
}

// バッチサイズと待機時間
const BATCH_SIZE = 50; // 1回のAPI呼び出しで処理する投稿数
const DELAY_MS = 7000; // 7秒（Gemini API: 10リクエスト/分制限対策）
const MAX_RETRIES = 3;

// コマンドライン引数解析
function parseArgs(): {
  limit: number | null;
  source: string | null;
  dryRun: boolean;
  concurrency: number;
  resume: boolean;
} {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let source: string | null = null;
  let dryRun = false;
  let concurrency = 1; // デフォルトは1（レート制限のため）
  let resume = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--source" && args[i + 1]) {
      source = args[i + 1];
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--concurrency" && args[i + 1]) {
      concurrency = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--resume") {
      resume = true;
    }
  }

  return { limit, source, dryRun, concurrency, resume };
}

// 進捗読み込み
function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    const data = readFileSync(PROGRESS_FILE, "utf-8");
    return JSON.parse(data);
  }
  return { processedIds: [], lastUpdated: "" };
}

// 進捗保存
function saveProgress(progress: Progress) {
  progress.lastUpdated = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Gemini APIで分析（リトライ付き）
async function analyzeWithGemini(posts: Post[], retryCount = 0): Promise<LabelResult[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const postsText = posts
    .map((p) => {
      const text = p.content || p.title || "(内容なし)";
      const truncated = text.length > 300 ? text.slice(0, 300) + "..." : text;
      return `[ID: ${p.id}]\n${truncated}`;
    })
    .join("\n\n---\n\n");

  const prompt = `${SYSTEM_PROMPT}\n\n## 分析対象の投稿（${posts.length}件）\n\n${postsText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // JSON抽出
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error("JSON配列が見つかりません:", response.slice(0, 200));
      return [];
    }

    const parsed: LabelResult[] = JSON.parse(arrayMatch[0]);

    // バリデーション
    return parsed.map((r) => ({
      id: r.id,
      sentiment: LABELS.sentiment.includes(r.sentiment) ? r.sentiment : "neutral",
      cep_category: LABELS.cep_category.includes(r.cep_category) ? r.cep_category : "none",
      intent: LABELS.intent.includes(r.intent) ? r.intent : "other",
      life_stage: LABELS.life_stage.includes(r.life_stage) ? r.life_stage : "unknown",
      cooking_skill: LABELS.cooking_skill.includes(r.cooking_skill) ? r.cooking_skill : "unknown",
      emotion: LABELS.emotion.includes(r.emotion) ? r.emotion : "neutral",
      with_whom: LABELS.with_whom.includes(r.with_whom) ? r.with_whom : "unknown",
      why_motivation: (r.why_motivation || "").slice(0, 50),
      paired_keywords: Array.isArray(r.paired_keywords) ? r.paired_keywords.slice(0, 3) : [],
    }));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error(`Gemini API error (attempt ${retryCount + 1}):`, err.message);

    // レート制限の場合はリトライ
    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 10000; // 指数バックオフ
      console.log(`  Rate limited. Waiting ${backoff / 1000}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithGemini(posts, retryCount + 1);
    }

    return [];
  }
}

// バッチ更新
async function updateBatch(results: LabelResult[]): Promise<number> {
  let successCount = 0;

  for (const result of results) {
    const cepId = CEP_ID_MAP[result.cep_category] ?? null;

    const { error } = await supabase
      .from("sns_posts")
      .update({
        sentiment: result.sentiment,
        cep_id: cepId,
        intent: result.intent,
        life_stage: result.life_stage,
        cooking_skill: result.cooking_skill,
        emotion: result.emotion,
        with_whom: result.with_whom,
        why_motivation: result.why_motivation,
        paired_keywords: result.paired_keywords,
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", result.id);

    if (error) {
      console.error(`  ID ${result.id} 更新エラー:`, error.message);
    } else {
      successCount++;
    }
  }

  return successCount;
}

// メイン処理
async function main() {
  const { limit, source, dryRun, resume } = parseArgs();
  const progress = resume ? loadProgress() : { processedIds: [], lastUpdated: "" };

  console.log("=== UGCラベリングスクリプト ===");
  console.log(`モード: ${dryRun ? "ドライラン" : "本番実行"}`);
  if (limit) console.log(`件数制限: ${limit}件`);
  if (source) console.log(`ソース: ${source}`);
  if (resume) console.log(`前回の続きから再開 (処理済み: ${progress.processedIds.length}件)`);
  console.log("");

  // 未処理投稿を取得
  let query = supabase
    .from("sns_posts")
    .select("id, url, title, content, source_category")
    .is("intent", null) // 新ラベルがnullのもの
    .order("id", { ascending: true });

  if (source) {
    query = query.eq("source_category", source);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data: allPosts, error } = await query;

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  if (!allPosts || allPosts.length === 0) {
    console.log("未処理の投稿がありません。");
    return;
  }

  // 処理済みを除外
  const posts = allPosts.filter((p) => !progress.processedIds.includes(p.id));

  if (posts.length === 0) {
    console.log("すべての投稿が処理済みです。");
    return;
  }

  console.log(`対象投稿: ${posts.length}件`);
  console.log(`バッチサイズ: ${BATCH_SIZE}件`);
  const estimatedMinutes = Math.ceil((posts.length / BATCH_SIZE) * (DELAY_MS / 1000 / 60));
  console.log(`予想処理時間: 約${estimatedMinutes}分`);
  console.log("");

  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  const stats = {
    sentiment: {} as Record<string, number>,
    cep_category: {} as Record<string, number>,
    intent: {} as Record<string, number>,
    emotion: {} as Record<string, number>,
  };

  // バッチ処理
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(posts.length / BATCH_SIZE);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(
      `[${batchNum}/${totalBatches}] 処理中... (ID: ${batch[0].id}〜${batch[batch.length - 1].id}) [${elapsed}s]`
    );

    if (dryRun) {
      processed += batch.length;
      continue;
    }

    // Gemini APIで分析
    const results = await analyzeWithGemini(batch);

    if (results.length === 0) {
      console.log(`  ⚠️ API応答なし、スキップ`);
      errors += batch.length;
      continue;
    }

    // DB更新
    const successCount = await updateBatch(results);
    processed += successCount;
    errors += batch.length - successCount;

    // 統計更新
    for (const r of results) {
      stats.sentiment[r.sentiment] = (stats.sentiment[r.sentiment] || 0) + 1;
      stats.cep_category[r.cep_category] = (stats.cep_category[r.cep_category] || 0) + 1;
      stats.intent[r.intent] = (stats.intent[r.intent] || 0) + 1;
      stats.emotion[r.emotion] = (stats.emotion[r.emotion] || 0) + 1;
    }

    // 進捗保存
    progress.processedIds.push(...batch.map((p) => p.id));
    saveProgress(progress);

    console.log(`  ✓ ${successCount}/${batch.length}件 完了`);

    // レート制限対策
    if (i + BATCH_SIZE < posts.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // 結果サマリー
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("");
  console.log("=== 処理完了 ===");
  console.log(`処理件数: ${processed}/${posts.length}`);
  console.log(`エラー: ${errors}件`);
  console.log(`処理時間: ${totalTime}秒`);

  if (!dryRun && processed > 0) {
    console.log("");
    console.log("センチメント分布:");
    for (const [key, count] of Object.entries(stats.sentiment).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("CEP分布 (上位5):");
    const sortedCeps = Object.entries(stats.cep_category).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [cep, count] of sortedCeps) {
      console.log(`  ${cep}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("Intent分布:");
    for (const [key, count] of Object.entries(stats.intent).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("Emotion分布 (上位5):");
    const sortedEmotions = Object.entries(stats.emotion).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [emotion, count] of sortedEmotions) {
      console.log(`  ${emotion}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }
  }

  // 進捗ファイル削除（完了時）
  if (processed === posts.length && existsSync(PROGRESS_FILE)) {
    const { unlinkSync } = await import("fs");
    unlinkSync(PROGRESS_FILE);
    console.log("\n進捗ファイルを削除しました。");
  }
}

main().catch(console.error);
