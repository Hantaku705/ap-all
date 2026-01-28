/**
 * ペルソナ代表口コミURLをDBから取得してJSONを更新するスクリプト
 *
 * 処理フロー:
 * 1. corp-1-summary.jsonを読み込み
 * 2. 各ペルソナのセンチメント（高=positive, 中=neutral, 低=negative）に基づき
 *    sns_postsから代表的な投稿（いいね数上位）を取得
 * 3. 投稿のurl, id, contentでJSONを更新
 *
 * 使い方:
 *   cd dashboard
 *   npx tsx scripts/update-persona-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// .env.productionから環境変数を読み込み
dotenv.config({ path: path.join(__dirname, '../.env.production') });

// 環境変数（改行文字を除去）
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\\n/g, '').trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('   NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LoyaltyPersona {
  id: string;
  personaName: string;
  ageRange: string;
  lifeStage: string;
  interests: string[];
  motivations: string[];
  voiceTone: string[];
  representativeQuote: string;
  representativeQuoteUrl?: string;
  representativeQuotePostId?: number;
  postCount: number;
  percentage: number;
}

interface LoyaltySummaryInsight {
  level: string;
  levelName: string;
  levelColor: string;
  count: number;
  percentage: string;
  personas: LoyaltyPersona[];
  topicDistribution: unknown[];
  customerProfile?: string;
  mainInterests?: string[];
  voiceTone?: string[];
  keywords?: string[];
}

interface SummaryData {
  insights: LoyaltySummaryInsight[];
  generatedAt: string;
  cached: boolean;
}

// ロイヤリティレベル → センチメント マッピング
const LEVEL_TO_SENTIMENT: Record<string, string> = {
  high: 'positive',
  medium: 'neutral',
  low: 'negative',
};

/**
 * 指定センチメントのコーポレート投稿をいいね数上位で取得
 */
async function getTopPostsBySentiment(
  sentiment: string,
  limit: number
): Promise<Array<{ id: number; url: string; content: string }>> {
  const { data, error } = await supabase
    .from('sns_posts')
    .select('id, url, content, likes_count')
    .eq('is_corporate', true)
    .eq('sentiment', sentiment)
    .not('url', 'is', null)
    .order('likes_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`  ⚠️ 検索エラー (${sentiment}): ${error.message}`);
    return [];
  }

  return data || [];
}

async function main() {
  console.log('🔍 ペルソナ代表口コミURL取得スクリプト（DBベース）\n');

  // JSONファイルパス
  const jsonPath = path.join(
    __dirname,
    '../src/data/corporate-loyalty/corp-1-summary.json'
  );

  // JSONファイル読み込み
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const summaryData: SummaryData = JSON.parse(rawData);

  console.log(`📂 JSONファイル読み込み完了: ${jsonPath}\n`);

  let updatedCount = 0;

  // 各ロイヤリティレベルのペルソナを処理
  for (const insight of summaryData.insights) {
    const sentiment = LEVEL_TO_SENTIMENT[insight.level];
    console.log(
      `\n📊 ${insight.levelName} → sentiment="${sentiment}" (${insight.personas.length}ペルソナ)`
    );
    console.log('─'.repeat(60));

    // このレベルの投稿をいいね数上位で取得（ペルソナ数分）
    const posts = await getTopPostsBySentiment(
      sentiment,
      insight.personas.length
    );

    console.log(`  📥 取得した投稿: ${posts.length}件`);

    // 各ペルソナに投稿を割り当て
    for (let i = 0; i < insight.personas.length; i++) {
      const persona = insight.personas[i];
      const post = posts[i];

      console.log(`\n  👤 ${persona.personaName}`);

      if (post) {
        persona.representativeQuoteUrl = post.url;
        persona.representativeQuotePostId = post.id;
        // 引用テキストも実際の投稿内容に更新
        persona.representativeQuote =
          post.content.length > 120
            ? post.content.slice(0, 120) + '...'
            : post.content;

        console.log(`     ✅ URL: ${post.url}`);
        console.log(`     📝 内容: "${post.content.slice(0, 50)}..."`);
        console.log(`     🔢 Post ID: ${post.id}`);
        updatedCount++;
      } else {
        console.log(`     ❌ 投稿が見つかりませんでした`);
      }
    }
  }

  // 更新日時を更新
  summaryData.generatedAt = new Date().toISOString();

  // JSONファイル書き込み
  fs.writeFileSync(jsonPath, JSON.stringify(summaryData, null, 2) + '\n');

  console.log('\n' + '═'.repeat(60));
  console.log('📝 結果サマリー');
  console.log('─'.repeat(60));
  console.log(`  ✅ URL取得・更新: ${updatedCount}件`);
  console.log(`  📂 更新ファイル: ${jsonPath}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
