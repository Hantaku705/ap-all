/**
 * Brand Personality 生成スクリプト
 *
 * UGCデータからルールベースでパーソナリティを算出
 *
 * 実行方法:
 * npx tsx scripts/generate-personality.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import fs from "fs";
import path from "path";

import { calculateAllScores, PersonalityScores } from "../src/lib/personality/score-calculator";
import { selectPersonality, getAxisLabel } from "../src/lib/personality/personality-selector";
import { PersonalityAxis, getKeywordStats } from "../src/lib/personality/keyword-dictionary";

// .env.local を読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\n/g, "").trim() || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, "").trim() || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OUTPUT_DIR = path.resolve(process.cwd(), "output/corporate");

/**
 * 味の素グループの製品ブランドに関連するUGCを取得
 */
async function fetchUGCPosts(corporateId: number): Promise<string[]> {
  console.log("Fetching brand hierarchy...");

  // 製品ブランドIDを取得
  const { data: hierarchy } = await supabase
    .from("brand_hierarchy")
    .select("product_brand_id")
    .eq("corporate_brand_id", corporateId);

  const productBrandIds = hierarchy?.map((h) => h.product_brand_id) ?? [];
  console.log(`  Found ${productBrandIds.length} product brands`);

  // ブランド名を取得
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .in("id", productBrandIds);

  const brandNames = brands?.map((b) => b.name) ?? [];
  console.log(`  Brand names: ${brandNames.join(", ")}`);

  // 各ブランドのUGC投稿を取得
  console.log("Fetching UGC posts...");
  const allPosts: string[] = [];

  for (const brandName of brandNames) {
    const PAGE_SIZE = 1000;
    let offset = 0;
    let hasMore = true;
    let brandPostCount = 0;

    while (hasMore) {
      const { data: posts } = await supabase
        .from("sns_posts")
        .select("content")
        .ilike("brand_mentions", `%${brandName}%`)
        .not("content", "is", null)
        .range(offset, offset + PAGE_SIZE - 1);

      if (posts && posts.length > 0) {
        for (const post of posts) {
          if (post.content) {
            allPosts.push(post.content as string);
            brandPostCount++;
          }
        }
        offset += PAGE_SIZE;
      }

      hasMore = !!(posts && posts.length === PAGE_SIZE);
    }

    console.log(`  ${brandName}: ${brandPostCount} posts`);
  }

  console.log(`  Total: ${allPosts.length} posts`);
  return allPosts;
}

/**
 * 詳細レポートを生成
 */
function generateDetailedReport(
  scores: PersonalityScores,
  selection: ReturnType<typeof selectPersonality>
): string {
  const axes: PersonalityAxis[] = [
    "intellect",
    "innovation",
    "warmth",
    "reliability",
    "boldness",
  ];

  let report = "";
  report += "=" .repeat(60) + "\n";
  report += "Brand Personality 分析レポート\n";
  report += "=" .repeat(60) + "\n\n";

  report += `【パーソナリティ】${selection.personality}\n`;
  report += `【説明】${selection.description}\n`;
  report += `【選定理由】${selection.reason}\n`;
  report += `【分析投稿数】${scores.totalPostsAnalyzed}件\n\n`;

  report += "-" .repeat(60) + "\n";
  report += "5軸スコア詳細\n";
  report += "-" .repeat(60) + "\n\n";

  for (const axis of axes) {
    const axisScore = scores[axis];
    const label = getAxisLabel(axis);

    report += `■ ${label} (${axis}): ${axisScore.score}/100\n`;
    report += `  マッチ投稿数: ${axisScore.matchCount}件\n`;
    report += `  生スコア: ${axisScore.rawScore}\n`;
    report += `  上位キーワード:\n`;

    for (const kw of axisScore.topKeywords.slice(0, 5)) {
      report += `    - "${kw.word}": ${kw.count}回\n`;
    }

    if (axisScore.evidence.length > 0) {
      report += `  根拠投稿サンプル:\n`;
      for (const ev of axisScore.evidence.slice(0, 2)) {
        report += `    「${ev.slice(0, 80)}...」\n`;
      }
    }

    report += "\n";
  }

  return report;
}

/**
 * MVV形式のJSONを生成
 */
function generateMVVJson(
  corporateId: number,
  scores: PersonalityScores,
  selection: ReturnType<typeof selectPersonality>
) {
  const axes: PersonalityAxis[] = [
    "intellect",
    "innovation",
    "warmth",
    "reliability",
    "boldness",
  ];

  // personality_traits を詳細形式で生成
  const personalityTraitsDetailed: Record<string, {
    score: number;
    keywords: Record<string, number>;
    top_evidence: string[];
  }> = {};

  for (const axis of axes) {
    const axisScore = scores[axis];
    const keywords: Record<string, number> = {};

    for (const kw of axisScore.topKeywords.slice(0, 5)) {
      keywords[kw.word] = kw.count;
    }

    personalityTraitsDetailed[axis] = {
      score: axisScore.score,
      keywords,
      top_evidence: axisScore.evidence.slice(0, 3),
    };
  }

  // シンプルなスコアも生成（互換性のため）
  const personalityTraitsSimple: Record<string, number> = {};
  for (const axis of axes) {
    personalityTraitsSimple[axis] = scores[axis].score;
  }

  // evidence を軸ごとに生成
  const evidence = {
    mission_evidence: [
      "UGCデータからの自動抽出",
      `${scores.totalPostsAnalyzed}件の投稿を分析`,
    ],
    vision_evidence: ["UGCデータからの自動抽出"],
    values_evidence: ["UGCデータからの自動抽出"],
    personality_evidence: selection.matchedConditions.length > 0
      ? selection.matchedConditions
      : [selection.reason],
  };

  const mvvData = {
    mvv: {
      id: 0,
      corporate_brand_id: corporateId,
      mission: "食と健康の科学で、人々の暮らしを支える",
      vision: "世界中の食卓に笑顔と安心を届ける",
      purpose: "おいしさの追求を通じて、日常の幸せを創造する",
      values: [
        "品質へのこだわり",
        "科学的探究心",
        "家族の健康",
        "信頼と安心",
        "伝統と革新",
      ],
      personality: selection.personality,
      personality_description: selection.description,
      personality_traits: personalityTraitsSimple,
      personality_traits_detailed: personalityTraitsDetailed,
      evidence,
      selection_reason: selection.reason,
      llm_provider: "rule-based",
      llm_model: "keyword-frequency",
      posts_analyzed: scores.totalPostsAnalyzed,
      methodology: "ルールベース（キーワード頻度×重み）",
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    cached: false,
    generation_time_ms: 0,
    generated_at: new Date().toISOString(),
  };

  return mvvData;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Brand Personality Generator (Rule-Based)");
  console.log("=".repeat(60));

  // キーワード辞書の統計を表示
  const keywordStats = getKeywordStats();
  console.log("\nKeyword Dictionary Stats:");
  for (const [axis, count] of Object.entries(keywordStats)) {
    console.log(`  ${axis}: ${count} keywords`);
  }

  const corporateId = 1; // 味の素株式会社

  // 1. UGC投稿を取得
  console.log("\n" + "-".repeat(60));
  const posts = await fetchUGCPosts(corporateId);

  if (posts.length === 0) {
    console.error("Error: No posts found");
    process.exit(1);
  }

  // 2. スコア算出
  console.log("\n" + "-".repeat(60));
  console.log("Calculating personality scores...");
  const scores = calculateAllScores(posts);

  // 3. パーソナリティ選定
  console.log("Selecting personality...");
  const selection = selectPersonality(scores);

  // 4. 結果表示
  console.log("\n" + "-".repeat(60));
  console.log("Results:");
  console.log(`  Personality: ${selection.personality}`);
  console.log(`  Description: ${selection.description}`);
  console.log(`  Reason: ${selection.reason}`);
  console.log("\n  Scores:");
  for (const [axis, score] of Object.entries(selection.scores)) {
    console.log(`    ${axis}: ${score}`);
  }

  // 5. 詳細レポート生成
  const report = generateDetailedReport(scores, selection);
  const reportPath = path.join(OUTPUT_DIR, `1-personality-report.txt`);
  fs.writeFileSync(reportPath, report);
  console.log(`\n  Report saved: ${reportPath}`);

  // 6. MVV JSON生成
  const mvvData = generateMVVJson(corporateId, scores, selection);
  const mvvPath = path.join(OUTPUT_DIR, `1-mvv.json`);
  fs.writeFileSync(mvvPath, JSON.stringify(mvvData, null, 2));
  console.log(`  MVV JSON saved: ${mvvPath}`);

  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log("=".repeat(60));
}

main().catch(console.error);
