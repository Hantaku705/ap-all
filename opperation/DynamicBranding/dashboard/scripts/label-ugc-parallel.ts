/**
 * UGCラベリング 並列処理版（OpenAI API）
 *
 * 複数のAPIキーを使って超高速並列処理
 *
 * 使用方法:
 *   npx tsx scripts/label-ugc-parallel.ts                # 全件処理
 *   npx tsx scripts/label-ugc-parallel.ts --limit 100    # 100件のみ
 *   npx tsx scripts/label-ugc-parallel.ts --dry-run      # API呼び出しなし
 *
 * 環境変数:
 *   OPENAI_API_KEYS=sk-xxx1,sk-xxx2,sk-xxx3,...  # カンマ区切りで複数キー
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, existsSync, readFileSync, unlinkSync } from "fs";

// 環境変数読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKeys = (process.env.OPENAI_API_KEYS || "").split(",").filter(Boolean);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

if (openaiKeys.length === 0) {
  console.error("Missing OPENAI_API_KEYS (comma-separated)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// OpenAIクライアントプール
const openaiClients = openaiKeys.map((key) => new OpenAI({ apiKey: key.trim() }));
let clientIndex = 0;

function getNextClient(): OpenAI {
  const client = openaiClients[clientIndex];
  clientIndex = (clientIndex + 1) % openaiClients.length;
  return client;
}

// 進捗保存ファイル
const PROGRESS_FILE = resolve(process.cwd(), ".label-parallel-progress.json");

// ラベル定義
const LABELS = {
  sentiment: ["positive", "neutral", "negative"],
  cep_category: [
    "time_saving_weeknight", "taste_anxiety", "weekend_cooking", "kids_picky_eating",
    "solo_easy_meal", "health_conscious", "entertaining", "drinking_snacks",
    "leftover_remake", "seasonal_taste", "diet_satisfaction", "morning_time_save", "none",
  ],
  intent: ["purchase_consider", "usage_report", "recipe_share", "question", "complaint", "other"],
  life_stage: ["single", "couple", "child_raising", "empty_nest", "senior", "unknown"],
  cooking_skill: ["beginner", "intermediate", "advanced", "unknown"],
  emotion: ["anxiety", "relief", "satisfaction", "guilt", "excitement", "frustration", "neutral"],
  with_whom: ["solo", "family", "kids", "guest", "unknown"],
};

// CEP ID マッピング
const CEP_ID_MAP: Record<string, number | null> = {
  time_saving_weeknight: 1, taste_anxiety: 2, weekend_cooking: 3, kids_picky_eating: 4,
  solo_easy_meal: 5, health_conscious: 6, entertaining: 7, drinking_snacks: 8,
  leftover_remake: 9, seasonal_taste: 10, diet_satisfaction: 11, morning_time_save: 12, none: null,
};

// プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドに関するSNS投稿を分析するエキスパートです。

各投稿について以下の項目を判定し、JSON配列で出力してください。

## 分類項目

1. **sentiment**: positive / neutral / negative
2. **cep_category**: time_saving_weeknight / taste_anxiety / weekend_cooking / kids_picky_eating / solo_easy_meal / health_conscious / entertaining / drinking_snacks / leftover_remake / seasonal_taste / diet_satisfaction / morning_time_save / none
3. **intent**: purchase_consider / usage_report / recipe_share / question / complaint / other
4. **life_stage**: single / couple / child_raising / empty_nest / senior / unknown
5. **cooking_skill**: beginner / intermediate / advanced / unknown
6. **emotion**: anxiety / relief / satisfaction / guilt / excitement / frustration / neutral
7. **with_whom**: solo / family / kids / guest / unknown
8. **why_motivation**: 動機（20字以内）
9. **paired_keywords**: 関連キーワード（最大3つ）

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"sentiment":"positive","cep_category":"time_saving_weeknight","intent":"usage_report","life_stage":"child_raising","cooking_skill":"intermediate","emotion":"satisfaction","with_whom":"family","why_motivation":"忙しい夜に簡単に","paired_keywords":["野菜炒め"]}]`;

interface Post {
  id: number;
  url: string;
  title: string | null;
  content: string | null;
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

// 設定
const BATCH_SIZE = 20; // 1回のAPI呼び出しで処理する投稿数
const CONCURRENCY = 3; // 同時API呼び出し数（レート制限対策で控えめに）
const MAX_RETRIES = 3;
const DELAY_BETWEEN_BATCHES = 1000; // バッチ間の待機時間(ms)

// コマンドライン引数解析
function parseArgs(): { limit: number | null; dryRun: boolean; resume: boolean } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let dryRun = false;
  let resume = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--resume") {
      resume = true;
    }
  }

  return { limit, dryRun, resume };
}

// 進捗読み込み・保存
function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { processedIds: [], lastUpdated: "" };
}

function saveProgress(progress: Progress) {
  progress.lastUpdated = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// OpenAI APIで分析（リトライ付き）
async function analyzeWithOpenAI(posts: Post[], retryCount = 0): Promise<LabelResult[]> {
  const client = getNextClient();

  const postsText = posts
    .map((p) => {
      const text = p.content || p.title || "(内容なし)";
      const truncated = text.length > 300 ? text.slice(0, 300) + "..." : text;
      return `[ID: ${p.id}]\n${truncated}`;
    })
    .join("\n\n---\n\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // 高速・低コスト
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `以下の${posts.length}件の投稿を分析してください:\n\n${postsText}` },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "";

    // JSON抽出
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error("JSON配列が見つかりません");
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
    console.error(`OpenAI API error (attempt ${retryCount + 1}):`, err.message);

    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithOpenAI(posts, retryCount + 1);
    }

    return [];
  }
}

// バッチ更新
async function updateBatch(results: LabelResult[]): Promise<number> {
  let successCount = 0;

  // 並列でDB更新
  await Promise.all(
    results.map(async (result) => {
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

      if (!error) successCount++;
    })
  );

  return successCount;
}

// 並列実行ヘルパー（バッチ間待機付き）
async function processInParallel<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
  delayMs: number = 0
): Promise<R[]> {
  const results: R[] = [];

  // 同時実行数ごとにグループ化
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);

    // バッチ間で待機
    if (delayMs > 0 && i + concurrency < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// メイン処理
async function main() {
  const { limit, dryRun, resume } = parseArgs();
  const progress = resume ? loadProgress() : { processedIds: [], lastUpdated: "" };

  console.log("=== UGCラベリング 並列処理版（OpenAI） ===");
  console.log(`モード: ${dryRun ? "ドライラン" : "本番実行"}`);
  console.log(`APIキー数: ${openaiClients.length}`);
  console.log(`同時実行数: ${Math.min(CONCURRENCY, openaiClients.length)}`);
  if (limit) console.log(`件数制限: ${limit}件`);
  if (resume) console.log(`前回の続きから再開 (処理済み: ${progress.processedIds.length}件)`);
  console.log("");

  // 未処理投稿を取得
  let query = supabase
    .from("sns_posts")
    .select("id, url, title, content")
    .is("intent", null)
    .order("id", { ascending: true });

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

  // バッチに分割
  const batches: Post[][] = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    batches.push(posts.slice(i, i + BATCH_SIZE));
  }

  console.log(`対象投稿: ${posts.length}件`);
  console.log(`バッチ数: ${batches.length}`);
  console.log(`予想処理時間: 約${Math.ceil(batches.length / Math.min(CONCURRENCY, openaiClients.length) * 3)}秒`);
  console.log("");

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;
  let completedBatches = 0;

  const stats = {
    sentiment: {} as Record<string, number>,
    cep_category: {} as Record<string, number>,
    intent: {} as Record<string, number>,
  };

  // 並列処理
  const concurrency = Math.min(CONCURRENCY, openaiClients.length);

  if (dryRun) {
    console.log("ドライラン: API呼び出しをスキップ");
    processed = posts.length;
  } else {
    await processInParallel(
      batches,
      async (batch) => {
        const batchIds = batch.map((p) => p.id);

        try {
          const results = await analyzeWithOpenAI(batch);

          if (results.length > 0) {
            const successCount = await updateBatch(results);
            processed += successCount;
            errors += batch.length - successCount;

            // 統計更新
            for (const r of results) {
              stats.sentiment[r.sentiment] = (stats.sentiment[r.sentiment] || 0) + 1;
              stats.cep_category[r.cep_category] = (stats.cep_category[r.cep_category] || 0) + 1;
              stats.intent[r.intent] = (stats.intent[r.intent] || 0) + 1;
            }

            // 進捗保存
            progress.processedIds.push(...batchIds);
            saveProgress(progress);
          } else {
            errors += batch.length;
          }
        } catch (e) {
          errors += batch.length;
        }

        completedBatches++;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const percent = ((completedBatches / batches.length) * 100).toFixed(0);
        process.stdout.write(`\r進捗: ${completedBatches}/${batches.length} (${percent}%) [${elapsed}s]`);
      },
      concurrency,
      DELAY_BETWEEN_BATCHES
    );
  }

  // 結果サマリー
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n");
  console.log("=== 処理完了 ===");
  console.log(`処理件数: ${processed}/${posts.length}`);
  console.log(`エラー: ${errors}件`);
  console.log(`処理時間: ${totalTime}秒`);
  console.log(`スループット: ${(posts.length / parseFloat(totalTime)).toFixed(1)}件/秒`);

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
  }

  // 進捗ファイル削除（完了時）
  if (processed === posts.length && existsSync(PROGRESS_FILE)) {
    unlinkSync(PROGRESS_FILE);
    console.log("\n進捗ファイルを削除しました。");
  }
}

main().catch(console.error);
