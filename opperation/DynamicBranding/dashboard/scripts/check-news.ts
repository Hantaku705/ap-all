import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error, count } = await supabase
    .from('corporate_world_news')
    .select('id, title, category, sentiment', { count: 'exact' })
    .limit(3);

  console.log('Count:', count);
  if (data) {
    data.forEach(d => console.log('-', d.title?.slice(0, 50), '|', d.category, '|', d.sentiment));
  }
  if (error) console.log('Error:', error);
}
main();
