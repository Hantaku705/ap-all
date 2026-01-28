import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
);

interface Post {
  id: number;
  content: string;
  url: string;
  likes_count: number;
}

async function analyze(sentiment: string, label: string) {
  const { data, error } = await supabase
    .from('sns_posts')
    .select('id, content, url, likes_count')
    .eq('is_corporate', true)
    .eq('sentiment', sentiment)
    .order('likes_count', { ascending: false });

  if (error) { console.error(error); return; }

  console.log('\n=== ' + label + ' (' + sentiment + ') ===');
  console.log('総件数:', data?.length);

  const categories: Record<string, Post[]> = {};

  data?.forEach((post: Post) => {
    const c = post.content.toLowerCase();
    let cat = 'その他';

    if (c.includes('株') || c.includes('配当') || c.includes('ir') || c.includes('レーティング') || c.includes('投資')) {
      cat = '投資家・IR関心層';
    } else if (c.includes('就活') || c.includes('年収') || c.includes('ホワイト') || c.includes('福利') || c.includes('入社')) {
      cat = '就活・採用関心層';
    } else if (c.includes('sdgs') || c.includes('サステナ') || c.includes('環境') || c.includes('csr') || c.includes('社会貢献')) {
      cat = 'サステナビリティ共感層';
    } else if (c.includes('羽生') || c.includes('アスリート') || c.includes('スポーツ') || c.includes('オリンピック') || c.includes('勝ち飯')) {
      cat = 'スポーツ・アスリートファン';
    } else if (c.includes('研究') || c.includes('技術') || c.includes('開発') || c.includes('イノベーション') || c.includes('半導体') || c.includes('特許')) {
      cat = 'R&D・技術関心層';
    } else if (c.includes('採用') || c.includes('転職') || c.includes('キャリア') || c.includes('中途')) {
      cat = 'キャリア情報収集層';
    } else if (c.includes('業界') || c.includes('m&a') || c.includes('競合') || c.includes('シェア') || c.includes('市場')) {
      cat = '業界動向ウォッチャー';
    } else if (c.includes('決算') || c.includes('per') || c.includes('pbr') || c.includes('利回り')) {
      cat = '財務分析層';
    } else if (c.includes('向井') || c.includes('cm') || c.includes('タイ') || c.includes('アンバサダー')) {
      cat = 'タレント・CM関心層';
    } else if (c.includes('冷凍') || c.includes('ギョーザ') || c.includes('餃子')) {
      cat = '冷凍食品ファン';
    } else if (c.includes('働') && (c.includes('環境') || c.includes('残業') || c.includes('休み'))) {
      cat = '働き方関心層';
    }

    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(post);
  });

  const sorted = Object.entries(categories).sort((a,b) => b[1].length - a[1].length);
  for (const [cat, posts] of sorted) {
    if (posts.length >= 3) {
      console.log('\n【' + cat + '】', posts.length, '件');
      posts.slice(0, 3).forEach((p: Post) => {
        console.log('  ID:', p.id, '(', p.likes_count, 'likes) -', p.content.slice(0, 80));
      });
    }
  }
}

async function main() {
  await analyze('positive', 'ロイヤリティ高');
  await analyze('neutral', 'ロイヤリティ中');
}
main();
