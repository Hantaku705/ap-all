import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 1000;

async function main() {
  console.log("=== Corporate Tag Distribution Analysis ===\n");

  let offset = 0;
  const counts = { true: 0, false: 0, null: 0 };
  const reasons: Record<string, number> = {};
  
  while (true) {
    const { data } = await supabase
      .from("sns_posts")
      .select("is_corporate, corporate_reason")
      .range(offset, offset + PAGE_SIZE - 1);

    if (!data || data.length === 0) break;
    
    for (const row of data) {
      if (row.is_corporate === true) counts.true++;
      else if (row.is_corporate === false) counts.false++;
      else counts.null++;
      
      if (row.corporate_reason) {
        reasons[row.corporate_reason] = (reasons[row.corporate_reason] || 0) + 1;
      }
    }
    
    offset += PAGE_SIZE;
    if (data.length < PAGE_SIZE) break;
  }

  const total = counts.true + counts.false + counts.null;
  console.log("1. is_corporate value distribution:");
  console.log("   is_corporate=true:  " + counts.true + " (" + ((counts.true / total) * 100).toFixed(1) + "%)");
  console.log("   is_corporate=false: " + counts.false + " (" + ((counts.false / total) * 100).toFixed(1) + "%)");
  console.log("   is_corporate=null:  " + counts.null + " (" + ((counts.null / total) * 100).toFixed(1) + "%)");
  console.log("   Total: " + total);

  console.log("\n2. corporate_reason distribution (top 15):");
  const sortedReasons = Object.entries(reasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  for (const [reason, count] of sortedReasons) {
    console.log("   \"" + reason + "\": " + count);
  }

  console.log("\n3. is_corporate=true with Ajinomoto in brand_mentions:");
  
  let ajinomotoMentionCount = 0;
  offset = 0;
  const samples: any[] = [];
  
  while (true) {
    const { data } = await supabase
      .from("sns_posts")
      .select("id, content, brand_mentions, corporate_topic, sentiment, engagement_total, published")
      .eq("is_corporate", true)
      .range(offset, offset + PAGE_SIZE - 1);

    if (!data || data.length === 0) break;
    
    for (const row of data) {
      if (row.brand_mentions && (row.brand_mentions.includes("味の素") || row.brand_mentions.includes("Ajinomoto"))) {
        ajinomotoMentionCount++;
        if (samples.length < 5) {
          samples.push(row);
        }
      }
    }
    
    offset += PAGE_SIZE;
    if (data.length < PAGE_SIZE) break;
  }

  console.log("   Count: " + ajinomotoMentionCount);
  console.log("\n   Samples (first 5):");
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    console.log("\n   [" + (i + 1) + "] ID: " + s.id);
    console.log("       brand_mentions: " + s.brand_mentions);
    console.log("       corporate_topic: " + s.corporate_topic);
    console.log("       sentiment: " + s.sentiment);
    console.log("       published: " + s.published);
    console.log("       content: " + (s.content || "").substring(0, 80));
  }
}

main().catch(console.error);
