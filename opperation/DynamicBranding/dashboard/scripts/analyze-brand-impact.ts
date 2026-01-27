/**
 * ブランド影響度分析スクリプト
 *
 * SNS投稿における各ブランドの影響度（メイン/関連/サブ）をLLMで分析
 *
 * 使用方法:
 *   npx tsx scripts/analyze-brand-impact.ts                # 全件処理
 *   npx tsx scripts/analyze-brand-impact.ts --limit 100   # 100件のみ
 *   npx tsx scripts/analyze-brand-impact.ts --dry-run     # API呼び出しなし
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
const PROGRESS_FILE = resolve(process.cwd(), ".brand-impact-progress.json");

// 影響度定義
const IMPACT_LEVELS = ["high", "medium", "low"] as const;
type ImpactLevel = (typeof IMPACT_LEVELS)[number];

// ブランドマスタ（事前読み込み）
let BRAND_MAP: Map<string, number> = new Map();

// 共通プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドに関するSNS投稿を分析するエキスパートです。

投稿内容から、言及されている各ブランドの「影響度」を判定してください。

## 影響度の定義

- **high（メイン言及）**: 投稿の主題、レシピのメイン材料、購入報告の対象、詳細なレビュー対象
- **medium（関連言及）**: 比較対象、組み合わせ使用、サブ材料、関連商品として言及
- **low（サブ言及）**: 背景情報、たまたま含まれる、文脈上の引用、軽い言及のみ

## 判定のポイント

1. ブランド名が投稿の主題か背景か
2. 使用方法が詳細に書かれているか
3. 感想や評価の対象になっているか
4. 他のブランドとの比較での位置づけ

## 出力形式（JSON配列のみ、説明不要）

[
  {
    "post_id": 123,
    "brands": [
      {"name": "ほんだし", "impact": "high", "confidence": 0.95, "reason": "味噌汁レシピのメイン出汁として詳細紹介"},
      {"name": "味の素", "impact": "low", "confidence": 0.80, "reason": "仕上げの隠し味として1回だけ言及"}
    ]
  }
]`;

interface Post {
  id: number;
  content: string | null;
  title: string | null;
  brand_mentions: string | null;
}

interface BrandImpactResult {
  name: string;
  impact: ImpactLevel;
  confidence: number;
  reason: string;
}

interface PostImpactResult {
  post_id: number;
  brands: BrandImpactResult[];
}

interface Progress {
  processedIds: number[];
  lastUpdated: string;
}

// 設定
const BATCH_SIZE = 15; // 1回のAPI呼び出しで処理する投稿数（影響度分析は複雑なので少なめ）
const MAX_RETRIES = 3;

// プロバイダー定義
type Provider = {
  name: string;
  analyze: (posts: Post[]) => Promise<PostImpactResult[]>;
};

// プロバイダーごとの統計
const providerStats: Record<string, { success: number; error: number; time: number }> = {};

// APIキーの検証（空文字、改行のみ、短すぎるキーを除外）
function isValidApiKey(key: string | undefined): key is string {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.length > 10; // 最低10文字以上
}

function createProviders(): Provider[] {
  const providers: Provider[] = [];

  // 1. OpenAI (takumi) - comma-separated keys
  const openaiKeys = (process.env.OPENAI_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 10);
  if (openaiKeys.length > 0) {
    const openaiTakumi = new OpenAI({ apiKey: openaiKeys[0] });
    providers.push({
      name: "OpenAI-takumi",
      analyze: (posts) => analyzeWithOpenAI(openaiTakumi, posts),
    });
    providerStats["OpenAI-takumi"] = { success: 0, error: 0, time: 0 };
  }

  // 1b. OpenAI (bcm) - single key
  const openaiKeyBcm = process.env.OPENAI_API_KEY_BCM;
  if (isValidApiKey(openaiKeyBcm)) {
    const openaiBcm = new OpenAI({ apiKey: openaiKeyBcm.trim() });
    providers.push({
      name: "OpenAI-bcm",
      analyze: (posts) => analyzeWithOpenAI(openaiBcm, posts),
    });
    providerStats["OpenAI-bcm"] = { success: 0, error: 0, time: 0 };
  }

  // 2. Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (isValidApiKey(geminiKey)) {
    const genAI = new GoogleGenerativeAI(geminiKey.trim());
    providers.push({
      name: "Gemini",
      analyze: (posts) => analyzeWithGemini(genAI, posts),
    });
    providerStats["Gemini"] = { success: 0, error: 0, time: 0 };
  }

  // 3. Claude (bcm)
  const claudeKeyBcm = process.env.ANTHROPIC_API_KEY_BCM;
  if (isValidApiKey(claudeKeyBcm)) {
    const claudeBcm = new Anthropic({ apiKey: claudeKeyBcm.trim() });
    providers.push({
      name: "Claude-bcm",
      analyze: (posts) => analyzeWithClaude(claudeBcm, posts),
    });
    providerStats["Claude-bcm"] = { success: 0, error: 0, time: 0 };
  }

  // 4. Claude (takumi)
  const claudeKeyTakumi = process.env.ANTHROPIC_API_KEY_TAKUMI;
  if (isValidApiKey(claudeKeyTakumi)) {
    const claudeTakumi = new Anthropic({ apiKey: claudeKeyTakumi.trim() });
    providers.push({
      name: "Claude-takumi",
      analyze: (posts) => analyzeWithClaude(claudeTakumi, posts),
    });
    providerStats["Claude-takumi"] = { success: 0, error: 0, time: 0 };
  }

  return providers;
}

// OpenAI分析
async function analyzeWithOpenAI(client: OpenAI, posts: Post[], retryCount = 0): Promise<PostImpactResult[]> {
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
async function analyzeWithGemini(genAI: GoogleGenerativeAI, posts: Post[], retryCount = 0): Promise<PostImpactResult[]> {
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
async function analyzeWithClaude(client: Anthropic, posts: Post[], retryCount = 0): Promise<PostImpactResult[]> {
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
      const truncated = text.length > 400 ? text.slice(0, 400) + "..." : text;
      return `[ID: ${p.id}] [ブランド: ${p.brand_mentions || "不明"}]\n${truncated}`;
    })
    .join("\n\n---\n\n");
}

// 結果パース・バリデーション
function parseAndValidateResults(content: string, posts: Post[]): PostImpactResult[] {
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error("\n[PARSE] JSON配列が見つかりません");
    return [];
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]) as Array<{
      post_id?: number;
      brands?: Array<{
        name?: string;
        impact?: string;
        confidence?: number;
        reason?: string;
      }>;
    }>;

    const postIds = posts.map((p) => p.id);

    return parsed.map((r, index) => {
      const actualId = r.post_id && postIds.includes(r.post_id) ? r.post_id : postIds[index];
      if (!actualId) return null;

      const brands = (r.brands || [])
        .map((b) => {
          if (!b.name) return null;
          const impact = IMPACT_LEVELS.includes(b.impact as ImpactLevel)
            ? (b.impact as ImpactLevel)
            : "medium";
          return {
            name: b.name,
            impact,
            confidence: typeof b.confidence === "number" ? Math.min(1, Math.max(0, b.confidence)) : 0.5,
            reason: (b.reason || "").slice(0, 100),
          };
        })
        .filter((b): b is BrandImpactResult => b !== null);

      return {
        post_id: actualId,
        brands,
      };
    }).filter((r): r is PostImpactResult => r !== null && r.brands.length > 0);
  } catch (e) {
    console.error("JSON parse error:", (e as Error).message);
    return [];
  }
}

// DB更新（post_brand_impacts テーブルに挿入）
async function updateBatch(results: PostImpactResult[]): Promise<number> {
  let successCount = 0;

  for (const result of results) {
    for (const brand of result.brands) {
      const brandId = BRAND_MAP.get(brand.name);
      if (!brandId) {
        // ブランド名が見つからない場合、部分一致を試みる
        const matchedBrand = Array.from(BRAND_MAP.entries()).find(([name]) =>
          name.includes(brand.name) || brand.name.includes(name)
        );
        if (!matchedBrand) continue;
        const [, id] = matchedBrand;

        const { error } = await supabase.from("post_brand_impacts").upsert(
          {
            post_id: result.post_id,
            brand_id: id,
            impact_level: brand.impact,
            confidence_score: brand.confidence,
            analysis_reason: brand.reason,
            analyzed_at: new Date().toISOString(),
          },
          { onConflict: "post_id,brand_id" }
        );

        if (!error) successCount++;
      } else {
        const { error } = await supabase.from("post_brand_impacts").upsert(
          {
            post_id: result.post_id,
            brand_id: brandId,
            impact_level: brand.impact,
            confidence_score: brand.confidence,
            analysis_reason: brand.reason,
            analyzed_at: new Date().toISOString(),
          },
          { onConflict: "post_id,brand_id" }
        );

        if (!error) successCount++;
      }
    }
  }

  return successCount;
}

// ブランドマスタ読み込み
async function loadBrandMap(): Promise<void> {
  const { data, error } = await supabase.from("brands").select("id, name");
  if (error) {
    console.error("Failed to load brands:", error.message);
    process.exit(1);
  }
  BRAND_MAP = new Map(data.map((b) => [b.name, b.id]));
  console.log(`ブランドマスタ読み込み: ${BRAND_MAP.size}件`);
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

  // ブランドマスタ読み込み
  await loadBrandMap();

  // プロバイダー初期化
  const providers = createProviders();

  console.log("=== ブランド影響度分析 ===");
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

  // 未処理投稿を取得（brand_mentionsがある投稿のみ対象）
  // post_brand_impactsに既にある投稿は除外
  const PAGE_SIZE = 1000;
  let allPosts: Post[] = [];
  let from = 0;

  console.log("対象投稿を取得中...");

  while (true) {
    const { data: batch, error } = await supabase
      .from("sns_posts")
      .select("id, content, title, brand_mentions")
      .not("brand_mentions", "is", null)
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

  // 既に処理済みの投稿IDを取得
  const { data: existingData } = await supabase
    .from("post_brand_impacts")
    .select("post_id");

  const existingPostIds = new Set((existingData || []).map((d) => d.post_id));
  console.log(`既存レコード: ${existingPostIds.size}件`);

  // 処理済み・既存を除外
  const posts = allPosts.filter(
    (p) => !progress.processedIds.includes(p.id) && !existingPostIds.has(p.id)
  );

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
  console.log(`並列数: ${providers.length}`);
  console.log("");

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;
  let completedBatches = 0;

  const impactStats: Record<ImpactLevel, number> = { high: 0, medium: 0, low: 0 };

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
                for (const b of r.brands) {
                  impactStats[b.impact]++;
                }
              }

              return { success: successCount, error: batch.length - results.length, ids: batchIds };
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
      process.stdout.write(
        `\r進捗: ${completedBatches}/${batches.length} (${percent}%) | 処理: ${processed}件 | ${elapsed}s`
      );
    }
  }

  // 結果サマリー
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n");
  console.log("=== 処理完了 ===");
  console.log(`処理件数: ${processed}`);
  console.log(`エラー: ${errors}件`);
  console.log(`処理時間: ${totalTime}秒`);

  // プロバイダー別統計
  console.log("");
  console.log("プロバイダー別統計:");
  for (const [name, stat] of Object.entries(providerStats)) {
    const avgTime = stat.success > 0 ? (stat.time / (stat.success + stat.error) * BATCH_SIZE).toFixed(0) : "-";
    console.log(`  ${name}: 成功 ${stat.success}件, エラー ${stat.error}件, 平均${avgTime}ms/バッチ`);
  }

  if (!dryRun && processed > 0) {
    console.log("");
    console.log("影響度分布:");
    const total = impactStats.high + impactStats.medium + impactStats.low;
    for (const [level, count] of Object.entries(impactStats)) {
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
      console.log(`  ${level}: ${count}件 (${pct}%)`);
    }
  }

  // 完了時は進捗ファイル削除
  if (processed === posts.length && existsSync(PROGRESS_FILE)) {
    unlinkSync(PROGRESS_FILE);
    console.log("\n進捗ファイルを削除しました。");
  }
}

main().catch(console.error);
