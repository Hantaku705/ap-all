import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Check if column exists by trying to select it
  const { error: testError } = await supabase
    .from("sns_posts")
    .select("is_corporate")
    .limit(1);
    
  if (testError && testError.message.includes("does not exist")) {
    console.log("Column does not exist yet.");
    console.log("\nPlease run this SQL in Supabase Dashboard SQL Editor:");
    console.log("https://supabase.com/dashboard/project/usjfsbvdawhsfdkabqzg/sql/new");
    console.log("\n--- SQL ---");
    console.log(`
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT NULL;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS corporate_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_sns_posts_is_corporate ON sns_posts(is_corporate);
    `);
  } else if (!testError) {
    console.log("Column already exists! Ready to run labeling script.");
  } else {
    console.log("Error:", testError.message);
  }
}

main().catch(console.error);
