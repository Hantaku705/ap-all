import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_REF = "usjfsbvdawhsfdkabqzg";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN!;

async function main() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error("Usage: npx tsx scripts/apply-migration.ts <migration_file>");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), migrationFile);
  console.log(`Reading: ${filePath}`);
  
  const sql = fs.readFileSync(filePath, "utf-8");
  console.log("Executing SQL...");
  
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    process.exit(1);
  }

  const result = await response.json();
  console.log("Result:", JSON.stringify(result, null, 2));
  console.log("Migration applied successfully!");
}

main().catch(console.error);
