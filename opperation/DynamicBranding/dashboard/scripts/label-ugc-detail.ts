/**
 * UGC詳細ラベリング - W's詳細化版
 *
 * 既存のラベル済みデータに対して、以下の詳細項目を追加:
 *   - dish_category: 料理カテゴリ
 *   - dish_name: 具体的な料理名
 *   - meal_occasion: 食事シーン
 *   - cooking_for: 誰のために
 *   - motivation_category: 動機カテゴリ
 *
 * 使用方法:
 *   npx tsx scripts/label-ugc-detail.ts                # 全件処理
 *   npx tsx scripts/label-ugc-detail.ts --limit 100   # 100件のみ
 *   npx tsx scripts/label-ugc-detail.ts --dry-run     # API呼び出しなし
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
const PROGRESS_FILE = resolve(process.cwd(), ".label-detail-progress.json");

// ラベル定義
const LABELS = {
  dish_category: [
    "soup",      // 汁物（味噌汁、スープ）
    "stir_fry",  // 炒め物
    "stew",      // 煮込み・煮物
    "chinese",   // 中華料理
    "rice",      // ご飯もの（炊き込み、チャーハン、丼）
    "salad",     // サラダ・和え物
    "noodle",    // 麺類
    "fried",     // 揚げ物
    "grilled",   // 焼き物
    "seasoning", // 調味・下味
    "other",     // その他
    "unknown",   // 判別不能
  ],
  meal_occasion: [
    "weekday_dinner_rush",     // 平日夜の急いでいる夕食
    "weekday_dinner_leisurely", // 平日夜のゆっくり夕食
    "weekend_brunch",          // 週末の遅い朝食/ブランチ
    "weekend_dinner",          // 週末の夕食
    "lunch_box",               // お弁当作り
    "late_night_snack",        // 夜食・晩酌
    "breakfast",               // 朝食
    "party",                   // パーティー・来客
    "unknown",                 // 判別不能
  ],
  cooking_for: [
    "self",     // 自分用
    "family",   // 家族全員
    "kids",     // 子ども向け
    "spouse",   // 配偶者向け
    "parents",  // 親・高齢者向け
    "guest",    // 来客向け
    "multiple", // 複数対象
    "unknown",  // 判別不能
  ],
  motivation_category: [
    "time_pressure",    // 時間がない
    "taste_assurance",  // 味を失敗したくない
    "health_concern",   // 健康に気を使いたい
    "cost_saving",      // 節約したい
    "skill_confidence", // 料理に自信がない
    "variety_seeking",  // いつもと違うものを作りたい
    "comfort_food",     // 定番・安心感
    "impression",       // 相手を喜ばせたい
    "unknown",          // 判別不能
  ],
};

// ブランド別代表メニュー
const BRAND_DISHES: Record<string, string[]> = {
  "ほんだし": ["味噌汁", "煮物", "おでん", "炊き込みご飯", "肉じゃが", "茶碗蒸し", "うどん", "鍋"],
  "クックドゥ": ["麻婆豆腐", "回鍋肉", "青椒肉絲", "酢豚", "エビチリ", "八宝菜", "餃子"],
  "コンソメ": ["ポトフ", "コンソメスープ", "ロールキャベツ", "オニオンスープ", "シチュー", "野菜スープ"],
  "味の素": ["野菜炒め", "チャーハン", "卵焼き", "唐揚げ", "パスタ", "ラーメン", "焼きそば"],
  "丸鶏がらスープ": ["中華スープ", "ラーメン", "チャーハン", "鍋", "餃子のタレ", "スープ"],
  "香味ペースト": ["野菜炒め", "チャーハン", "焼きそば", "スープ", "鍋", "中華料理"],
  "アジシオ": ["おにぎり", "天ぷら", "焼き魚", "サラダ", "漬物", "塩味料理"],
  "ピュアセレクト": ["サラダ", "ポテトサラダ", "サンドイッチ", "タルタルソース", "マヨネーズ料理"],
};

// 共通プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドに関するSNS投稿から、料理・食事シーンを分析するエキスパートです。

各投稿について以下の項目を判定し、JSON配列で出力してください。

## 分類項目

1. **dish_category**: 料理カテゴリ
   - soup: 汁物（味噌汁、スープ）
   - stir_fry: 炒め物
   - stew: 煮込み・煮物
   - chinese: 中華料理
   - rice: ご飯もの（炊き込み、チャーハン、丼）
   - salad: サラダ・和え物
   - noodle: 麺類
   - fried: 揚げ物
   - grilled: 焼き物
   - seasoning: 調味・下味
   - other: その他
   - unknown: 判別不能

2. **dish_name**: 具体的な料理名（味噌汁、麻婆豆腐、チャーハンなど。わからなければ空文字）

3. **meal_occasion**: 食事シーン
   - weekday_dinner_rush: 平日夜の急いでいる夕食
   - weekday_dinner_leisurely: 平日夜のゆっくり夕食
   - weekend_brunch: 週末の遅い朝食/ブランチ
   - weekend_dinner: 週末の夕食
   - lunch_box: お弁当作り
   - late_night_snack: 夜食・晩酌
   - breakfast: 朝食
   - party: パーティー・来客
   - unknown: 判別不能

4. **cooking_for**: 誰のために作ったか
   - self: 自分用
   - family: 家族全員
   - kids: 子ども向け
   - spouse: 配偶者向け
   - parents: 親・高齢者向け
   - guest: 来客向け
   - multiple: 複数対象
   - unknown: 判別不能

5. **motivation_category**: 動機カテゴリ
   - time_pressure: 時間がない
   - taste_assurance: 味を失敗したくない
   - health_concern: 健康に気を使いたい
   - cost_saving: 節約したい
   - skill_confidence: 料理に自信がない
   - variety_seeking: いつもと違うものを作りたい
   - comfort_food: 定番・安心感
   - impression: 相手を喜ばせたい
   - unknown: 判別不能

## 注意事項
- 投稿内容から推測できない場合は "unknown" を使用
- dish_name は具体的な料理名がわかる場合のみ記載（例: 味噌汁、麻婆豆腐）
- ブランド名から料理を推測してよい（例: クックドゥ→中華料理、ほんだし→味噌汁・煮物）

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"dish_category":"soup","dish_name":"味噌汁","meal_occasion":"weekday_dinner_rush","cooking_for":"family","motivation_category":"time_pressure"}]`;

interface Post {
  id: number;
  url: string;
  title: string | null;
  content: string | null;
  brand_mentions: string | null;
}

interface DetailResult {
  id: number;
  dish_category: string;
  dish_name: string;
  meal_occasion: string;
  cooking_for: string;
  motivation_category: string;
}

interface Progress {
  processedIds: number[];
  lastUpdated: string;
}

// 設定
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

// プロバイダー定義
type Provider = {
  name: string;
  analyze: (posts: Post[]) => Promise<DetailResult[]>;
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
async function analyzeWithOpenAI(client: OpenAI, posts: Post[], retryCount = 0): Promise<DetailResult[]> {
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
async function analyzeWithGemini(genAI: GoogleGenerativeAI, posts: Post[], retryCount = 0): Promise<DetailResult[]> {
  const postsText = formatPostsForAnalysis(posts);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${SYSTEM_PROMPT}\n\n以下の${posts.length}件の投稿を分析してください:\n\n${postsText}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    return parseAndValidateResults(content, posts);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429 && retryCount < MAX_RETRIES) {
      const backoff = Math.pow(2, retryCount) * 2000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return analyzeWithGemini(genAI, posts, retryCount + 1);
    }
    throw error;
  }
}

// Claude分析
async function analyzeWithClaude(client: Anthropic, posts: Post[], retryCount = 0): Promise<DetailResult[]> {
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

// 投稿をテキスト化（ブランド情報も含める）
function formatPostsForAnalysis(posts: Post[]): string {
  return posts
    .map((p) => {
      const text = p.content || p.title || "(内容なし)";
      const truncated = text.length > 300 ? text.slice(0, 300) + "..." : text;
      const brands = p.brand_mentions || "(不明)";
      return `[ID: ${p.id}] [ブランド: ${brands}]\n${truncated}`;
    })
    .join("\n\n---\n\n");
}

// 結果パース・バリデーション
function parseAndValidateResults(content: string, posts: Post[]): DetailResult[] {
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error("JSON配列が見つかりません");
    return [];
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]) as Array<{
      id?: number;
      dish_category?: string;
      dish_name?: string;
      meal_occasion?: string;
      cooking_for?: string;
      motivation_category?: string;
    }>;

    // 入力投稿のIDマップを作成（LLMが返すIDを信頼せず、順序でマッピング）
    const postIds = posts.map((p) => p.id);

    // LLMが返したIDが実際の投稿IDと一致するか確認
    const returnedIds = parsed.map((r) => r.id);
    const idsMatch = returnedIds.every((id) => id && postIds.includes(id));

    return parsed.map((r, index) => {
      // IDが一致しない場合は順序でマッピング
      const actualId = idsMatch && r.id ? r.id : postIds[index];
      if (!actualId) return null;

      return {
        id: actualId,
        dish_category: LABELS.dish_category.includes(r.dish_category || "") ? r.dish_category! : "unknown",
        dish_name: (r.dish_name || "").slice(0, 50),
        meal_occasion: LABELS.meal_occasion.includes(r.meal_occasion || "") ? r.meal_occasion! : "unknown",
        cooking_for: LABELS.cooking_for.includes(r.cooking_for || "") ? r.cooking_for! : "unknown",
        motivation_category: LABELS.motivation_category.includes(r.motivation_category || "") ? r.motivation_category! : "unknown",
      };
    }).filter((r): r is DetailResult => r !== null);
  } catch (e) {
    console.error("JSON parse error:", (e as Error).message);
    return [];
  }
}

// DB更新
async function updateBatch(results: DetailResult[]): Promise<number> {
  const updateResults = await Promise.all(
    results.map(async (result) => {
      const { error, data } = await supabase
        .from("sns_posts")
        .update({
          dish_category: result.dish_category,
          dish_name: result.dish_name || null,
          meal_occasion: result.meal_occasion,
          cooking_for: result.cooking_for,
          motivation_category: result.motivation_category,
        })
        .eq("id", result.id)
        .select();

      return { success: !error && data && data.length > 0, error };
    })
  );

  return updateResults.filter((r) => r.success).length;
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

  console.log("=== UGC詳細ラベリング（W's詳細化） ===");
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

  // ラベル済み（intent != null）かつ詳細未処理（dish_category is null）を取得（ページネーション）
  const PAGE_SIZE = 1000;
  let allPosts: Post[] = [];
  let from = 0;

  console.log("未処理投稿を取得中...");

  while (true) {
    const { data: batch, error } = await supabase
      .from("sns_posts")
      .select("id, url, title, content, brand_mentions")
      .not("intent", "is", null)
      .is("dish_category", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Supabase error:", error.message);
      process.exit(1);
    }

    if (!batch || batch.length === 0) break;

    allPosts.push(...batch);
    from += PAGE_SIZE;

    if (batch.length < PAGE_SIZE) break;
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
    dish_category: {} as Record<string, number>,
    meal_occasion: {} as Record<string, number>,
    cooking_for: {} as Record<string, number>,
    motivation_category: {} as Record<string, number>,
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
                stats.dish_category[r.dish_category] = (stats.dish_category[r.dish_category] || 0) + 1;
                stats.meal_occasion[r.meal_occasion] = (stats.meal_occasion[r.meal_occasion] || 0) + 1;
                stats.cooking_for[r.cooking_for] = (stats.cooking_for[r.cooking_for] || 0) + 1;
                stats.motivation_category[r.motivation_category] = (stats.motivation_category[r.motivation_category] || 0) + 1;
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
    console.log("料理カテゴリ分布:");
    for (const [key, count] of Object.entries(stats.dish_category).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("食事シーン分布:");
    for (const [key, count] of Object.entries(stats.meal_occasion).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("調理対象分布:");
    for (const [key, count] of Object.entries(stats.cooking_for).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }

    console.log("");
    console.log("動機分布:");
    for (const [key, count] of Object.entries(stats.motivation_category).sort((a, b) => b[1] - a[1])) {
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
