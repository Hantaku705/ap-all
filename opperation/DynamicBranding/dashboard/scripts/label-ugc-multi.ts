/**
 * UGCラベリング マルチプロバイダー並列処理版
 *
 * 異なるプロバイダー/アカウントのAPIキーを使用して真の並列処理を実現
 *
 * プロバイダー:
 *   1. OpenAI (takumi) - OPENAI_API_KEYS の1つ
 *   2. OpenAI (bcm.ai) - OPENAI_API_KEY_BCM
 *   3. Gemini - GEMINI_API_KEY
 *   4. Claude (bcm) - ANTHROPIC_API_KEY_BCM
 *   5. Claude (takumi) - ANTHROPIC_API_KEY_TAKUMI
 *
 * 使用方法:
 *   npx tsx scripts/label-ugc-multi.ts                # 全件処理
 *   npx tsx scripts/label-ugc-multi.ts --limit 100   # 100件のみ
 *   npx tsx scripts/label-ugc-multi.ts --dry-run     # API呼び出しなし
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, existsSync, readFileSync, unlinkSync } from "fs";

// 環境変数読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 進捗保存ファイル
const PROGRESS_FILE = resolve(process.cwd(), ".label-multi-progress.json");

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

// 共通プロンプト
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
const MAX_RETRIES = 3;

// プロバイダー定義
type Provider = {
  name: string;
  analyze: (posts: Post[]) => Promise<LabelResult[]>;
};

// プロバイダーごとの統計
const providerStats: Record<string, { success: number; error: number; time: number }> = {};

function createProviders(): Provider[] {
  const providers: Provider[] = [];

  // 1. OpenAI (takumi)
  const openaiKeys = (process.env.OPENAI_API_KEYS || "").split(",").filter(Boolean);
  if (openaiKeys.length > 0) {
    const openaiTakumi = new OpenAI({ apiKey: openaiKeys[0].trim() });
    providers.push({
      name: "OpenAI-takumi",
      analyze: (posts) => analyzeWithOpenAI(openaiTakumi, posts),
    });
    providerStats["OpenAI-takumi"] = { success: 0, error: 0, time: 0 };
  }

  // 2. OpenAI (別アカウント) - sk-で始まるキーのみ有効
  const openaiKeyBcm = process.env.OPENAI_API_KEY_BCM;
  if (openaiKeyBcm && openaiKeyBcm.trim().startsWith("sk-")) {
    const openaiBcm = new OpenAI({ apiKey: openaiKeyBcm.trim() });
    providers.push({
      name: "OpenAI-bcm",
      analyze: (posts) => analyzeWithOpenAI(openaiBcm, posts),
    });
    providerStats["OpenAI-bcm"] = { success: 0, error: 0, time: 0 };
  }

  // 3. Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    providers.push({
      name: "Gemini",
      analyze: (posts) => analyzeWithGemini(genAI, posts),
    });
    providerStats["Gemini"] = { success: 0, error: 0, time: 0 };
  }

  // 4. Claude (bcm)
  const claudeKeyBcm = process.env.ANTHROPIC_API_KEY_BCM;
  if (claudeKeyBcm) {
    const claudeBcm = new Anthropic({ apiKey: claudeKeyBcm });
    providers.push({
      name: "Claude-bcm",
      analyze: (posts) => analyzeWithClaude(claudeBcm, posts),
    });
    providerStats["Claude-bcm"] = { success: 0, error: 0, time: 0 };
  }

  // 5. Claude (takumi)
  const claudeKeyTakumi = process.env.ANTHROPIC_API_KEY_TAKUMI;
  if (claudeKeyTakumi) {
    const claudeTakumi = new Anthropic({ apiKey: claudeKeyTakumi });
    providers.push({
      name: "Claude-takumi",
      analyze: (posts) => analyzeWithClaude(claudeTakumi, posts),
    });
    providerStats["Claude-takumi"] = { success: 0, error: 0, time: 0 };
  }

  return providers;
}

// OpenAI分析
async function analyzeWithOpenAI(client: OpenAI, posts: Post[], retryCount = 0): Promise<LabelResult[]> {
  const postsText = formatPostsForAnalysis(posts);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `以下の${posts.length}件の投稿を分析してください:\n\n${postsText}` },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "";
    return parseAndValidateResults(content, posts);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithOpenAI(client, posts, retryCount + 1);
    }
    throw error;
  }
}

// Gemini分析
async function analyzeWithGemini(genAI: GoogleGenerativeAI, posts: Post[], retryCount = 0): Promise<LabelResult[]> {
  const postsText = formatPostsForAnalysis(posts);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${SYSTEM_PROMPT}\n\n以下の${posts.length}件の投稿を分析してください:\n\n${postsText}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    // デバッグ: 最初のバッチのみ表示
    const DEBUG_MODE = process.env.DEBUG === "1";
    if (DEBUG_MODE && retryCount === 0) {
      console.error(`\n[DEBUG] Gemini response (first 500 chars): ${content.slice(0, 500)}`);
    }
    return parseAndValidateResults(content, posts);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 2000; // Geminiは少し長め
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithGemini(genAI, posts, retryCount + 1);
    }
    throw error;
  }
}

// Claude分析
async function analyzeWithClaude(client: Anthropic, posts: Post[], retryCount = 0): Promise<LabelResult[]> {
  const postsText = formatPostsForAnalysis(posts);

  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `以下の${posts.length}件の投稿を分析してください:\n\n${postsText}` },
      ],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return parseAndValidateResults(content, posts);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithClaude(client, posts, retryCount + 1);
    }
    throw error;
  }
}

// 投稿をテキスト化
function formatPostsForAnalysis(posts: Post[]): string {
  return posts
    .map((p) => {
      const text = p.content || p.title || "(内容なし)";
      const truncated = text.length > 300 ? text.slice(0, 300) + "..." : text;
      return `[ID: ${p.id}]\n${truncated}`;
    })
    .join("\n\n---\n\n");
}

// 結果パース・バリデーション
function parseAndValidateResults(content: string, posts: Post[]): LabelResult[] {
  const DEBUG_MODE = process.env.DEBUG === "1";

  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error("\n[PARSE] JSON配列が見つかりません - content:", content.slice(0, 200));
    return [];
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]) as Array<{
      id?: number;
      sentiment?: string;
      cep_category?: string;
      intent?: string;
      life_stage?: string;
      cooking_skill?: string;
      emotion?: string;
      with_whom?: string;
      why_motivation?: string;
      paired_keywords?: string[];
    }>;

    // 入力投稿のIDマップを作成（LLMが返すIDを信頼せず、順序でマッピング）
    const postIds = posts.map((p) => p.id);

    if (DEBUG_MODE) {
      console.error(`\n[PARSE] parsed.length=${parsed.length}, posts.length=${posts.length}`);
      console.error(`[PARSE] postIds: [${postIds.slice(0, 5).join(", ")}...]`);
      console.error(`[PARSE] parsed IDs: [${parsed.slice(0, 5).map(r => r.id).join(", ")}...]`);
    }

    // LLMが返したIDが実際の投稿IDと一致するか確認
    const returnedIds = parsed.map((r) => r.id);
    const idsMatch = returnedIds.every((id) => id && postIds.includes(id));

    if (DEBUG_MODE) {
      console.error(`[PARSE] idsMatch=${idsMatch}`);
    }

    return parsed.map((r, index) => {
      // IDが一致しない場合は順序でマッピング
      const actualId = idsMatch && r.id ? r.id : postIds[index];
      if (!actualId) return null;

      return {
        id: actualId,
        sentiment: LABELS.sentiment.includes(r.sentiment || "") ? r.sentiment! : "neutral",
        cep_category: LABELS.cep_category.includes(r.cep_category || "") ? r.cep_category! : "none",
        intent: LABELS.intent.includes(r.intent || "") ? r.intent! : "other",
        life_stage: LABELS.life_stage.includes(r.life_stage || "") ? r.life_stage! : "unknown",
        cooking_skill: LABELS.cooking_skill.includes(r.cooking_skill || "") ? r.cooking_skill! : "unknown",
        emotion: LABELS.emotion.includes(r.emotion || "") ? r.emotion! : "neutral",
        with_whom: LABELS.with_whom.includes(r.with_whom || "") ? r.with_whom! : "unknown",
        why_motivation: (r.why_motivation || "").slice(0, 50),
        paired_keywords: Array.isArray(r.paired_keywords) ? r.paired_keywords.slice(0, 3) : [],
      };
    }).filter((r): r is LabelResult => r !== null);
  } catch (e) {
    console.error("JSON parse error:", (e as Error).message);
    return [];
  }
}

// DB更新
async function updateBatch(results: LabelResult[]): Promise<number> {
  const DEBUG_MODE = process.env.DEBUG === "1";

  const updateResults = await Promise.all(
    results.map(async (result) => {
      const cepId = CEP_ID_MAP[result.cep_category] ?? null;

      const { error, data, count } = await supabase
        .from("sns_posts")
        .update({
          sentiment: result.sentiment,
          cep_id: cepId,
          // cep_category はcep_idから参照可能なので省略
          intent: result.intent,
          life_stage: result.life_stage,
          cooking_skill: result.cooking_skill,
          emotion: result.emotion,
          with_whom: result.with_whom,
          why_motivation: result.why_motivation,
          paired_keywords: result.paired_keywords,
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", result.id)
        .select();

      if (DEBUG_MODE && (error || !data || data.length === 0)) {
        console.error(`\n[UPDATE] id=${result.id}, error=${error?.message || "none"}, data.length=${data?.length ?? 0}`);
      }

      return { success: !error && data && data.length > 0, error };
    })
  );

  const successCount = updateResults.filter((r) => r.success).length;

  if (DEBUG_MODE) {
    console.error(`[UPDATE] successCount=${successCount}/${results.length}`);
  }

  return successCount;
}

// コマンドライン引数解析
function parseArgs(): { limit: number | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { limit, dryRun };
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

// メイン処理
async function main() {
  const { limit, dryRun } = parseArgs();
  const progress = loadProgress();

  // プロバイダー初期化
  const providers = createProviders();

  console.log("=== UGCラベリング マルチプロバイダー並列処理 ===");
  console.log(`モード: ${dryRun ? "ドライラン" : "本番実行"}`);
  console.log(`プロバイダー数: ${providers.length}`);
  console.log(`プロバイダー: ${providers.map((p) => p.name).join(", ")}`);
  if (limit) console.log(`件数制限: ${limit}件`);
  if (progress.processedIds.length > 0) {
    console.log(`前回の続きから再開 (処理済み: ${progress.processedIds.length}件)`);
  }
  console.log("");

  if (providers.length === 0) {
    console.error("有効なAPIキーがありません");
    process.exit(1);
  }

  // 未処理投稿を取得（ページネーションで全件取得）
  const PAGE_SIZE = 1000;
  let allPosts: Post[] = [];
  let from = 0;

  console.log("未処理投稿を取得中...");

  while (true) {
    const { data: batch, error } = await supabase
      .from("sns_posts")
      .select("id, url, title, content")
      .is("intent", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Supabase error:", error.message);
      process.exit(1);
    }

    if (!batch || batch.length === 0) break;

    allPosts.push(...batch);
    from += PAGE_SIZE;

    if (batch.length < PAGE_SIZE) break; // 最後のページ
    if (limit && allPosts.length >= limit) {
      allPosts = allPosts.slice(0, limit);
      break;
    }
  }

  console.log(`取得完了: ${allPosts.length}件`);

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
  console.log(`真の並列数: ${providers.length}`);
  console.log(`予想処理時間: 約${Math.ceil(batches.length / providers.length * 3)}秒`);
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

  if (dryRun) {
    console.log("ドライラン: API呼び出しをスキップ");
    processed = posts.length;
  } else {
    // バッチをプロバイダー数ごとにグループ化して並列実行
    for (let i = 0; i < batches.length; i += providers.length) {
      const currentBatches = batches.slice(i, i + providers.length);

      const results = await Promise.all(
        currentBatches.map(async (batch, idx) => {
          const provider = providers[idx % providers.length];
          const batchIds = batch.map((p) => p.id);
          const batchStart = Date.now();

          try {
            const results = await provider.analyze(batch);
            const batchTime = Date.now() - batchStart;
            providerStats[provider.name].time += batchTime;

            if (results.length > 0) {
              const successCount = await updateBatch(results);
              providerStats[provider.name].success += successCount;

              // 統計更新
              for (const r of results) {
                stats.sentiment[r.sentiment] = (stats.sentiment[r.sentiment] || 0) + 1;
                stats.cep_category[r.cep_category] = (stats.cep_category[r.cep_category] || 0) + 1;
                stats.intent[r.intent] = (stats.intent[r.intent] || 0) + 1;
              }

              return { success: successCount, error: batch.length - successCount, ids: batchIds };
            } else {
              providerStats[provider.name].error += batch.length;
              return { success: 0, error: batch.length, ids: batchIds };
            }
          } catch (e) {
            providerStats[provider.name].error += batch.length;
            console.error(`\n[${provider.name}] Error:`, (e as Error).message);
            return { success: 0, error: batch.length, ids: batchIds };
          }
        })
      );

      // 結果集計
      for (const r of results) {
        processed += r.success;
        errors += r.error;
        progress.processedIds.push(...r.ids);
      }

      completedBatches += currentBatches.length;
      saveProgress(progress);

      // 進捗表示
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = ((completedBatches / batches.length) * 100).toFixed(0);
      const throughput = (processed / parseFloat(elapsed)).toFixed(1);
      process.stdout.write(
        `\r進捗: ${completedBatches}/${batches.length} (${percent}%) | 処理: ${processed}件 | ${throughput}件/秒 | ${elapsed}s`
      );
    }
  }

  // 結果サマリー
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n");
  console.log("=== 処理完了 ===");
  console.log(`処理件数: ${processed}/${posts.length}`);
  console.log(`エラー: ${errors}件`);
  console.log(`処理時間: ${totalTime}秒`);
  console.log(`スループット: ${(processed / parseFloat(totalTime)).toFixed(1)}件/秒`);

  // プロバイダー別統計
  console.log("");
  console.log("プロバイダー別統計:");
  for (const [name, stat] of Object.entries(providerStats)) {
    const avgTime = stat.success > 0 ? (stat.time / (stat.success + stat.error) * BATCH_SIZE).toFixed(0) : "-";
    console.log(`  ${name}: 成功 ${stat.success}件, エラー ${stat.error}件, 平均${avgTime}ms/バッチ`);
  }

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

  // 完了時は進捗ファイル削除
  if (processed === posts.length && existsSync(PROGRESS_FILE)) {
    unlinkSync(PROGRESS_FILE);
    console.log("\n進捗ファイルを削除しました。");
  }
}

main().catch(console.error);
