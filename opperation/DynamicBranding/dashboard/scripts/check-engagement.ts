import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const { data: impacts } = await supabase
    .from('post_brand_impacts')
    .select('post_id')
    .eq('impact_level', 'high');
  
  const ids = [...new Set(impacts?.map(i => i.post_id) || [])];
  
  const { data: posts } = await supabase
    .from('sns_posts')
    .select('engagement_total')
    .in('id', ids)
    .order('engagement_total', { ascending: false });
  
  const engagements = posts?.map(p => p.engagement_total || 0) || [];
  
  console.log('=== エンゲージメント分布 ===');
  console.log('総件数:', engagements.length);
  console.log('最大:', Math.max(...engagements));
  console.log('100以上:', engagements.filter(e => e >= 100).length, '件');
  console.log('500以上:', engagements.filter(e => e >= 500).length, '件');
  console.log('1000以上:', engagements.filter(e => e >= 1000).length, '件');
  console.log('Top 10:', engagements.slice(0, 10));
}
main();
