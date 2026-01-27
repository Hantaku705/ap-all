/**
 * UGCラベリング オーケストレーター
 *
 * ソース別に4プロセスを並列起動して効率化
 *
 * 使用方法:
 *   npx tsx scripts/label-orchestrator.ts              # 4並列で全件処理
 *   npx tsx scripts/label-orchestrator.ts --dry-run    # ドライラン
 */

import { spawn, ChildProcess } from "child_process";
import { resolve } from "path";

const SOURCES = ["twitter", "news", "blog", "messageboard"];

interface WorkerResult {
  source: string;
  exitCode: number | null;
  duration: number;
}

function parseArgs(): { dryRun: boolean } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
  };
}

async function runWorker(source: string, dryRun: boolean): Promise<WorkerResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const scriptPath = "./scripts/label-ugc-posts.ts";
    const args = ["tsx", scriptPath, "--source", source];

    if (dryRun) {
      args.push("--dry-run");
    }

    console.log(`[${source}] Starting worker...`);

    const child: ChildProcess = spawn("npx", args, {
      cwd: process.cwd(),
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.log(`[${source}] ${line}`);
        }
      }
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.error(`[${source}] ERROR: ${line}`);
        }
      }
      stderr += data.toString();
    });

    child.on("close", (code) => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`[${source}] Finished with code ${code} in ${duration.toFixed(1)}s`);
      resolve({
        source,
        exitCode: code,
        duration,
      });
    });

    child.on("error", (err) => {
      console.error(`[${source}] Process error:`, err.message);
      resolve({
        source,
        exitCode: 1,
        duration: (Date.now() - startTime) / 1000,
      });
    });
  });
}

async function main() {
  const { dryRun } = parseArgs();

  console.log("=== UGCラベリング オーケストレーター ===");
  console.log(`モード: ${dryRun ? "ドライラン" : "本番実行"}`);
  console.log(`ソース: ${SOURCES.join(", ")}`);
  console.log("");

  const startTime = Date.now();

  // 注意: Gemini APIのレート制限（10リクエスト/分）があるため、
  // 真の並列化は逆効果になる可能性があります。
  // 代わりに順次実行するオプションも提供します。

  console.log("⚠️ Gemini APIレート制限のため、順次実行します");
  console.log("   (並列実行すると429エラーが多発します)");
  console.log("");

  const results: WorkerResult[] = [];

  // 順次実行（APIレート制限対策）
  for (const source of SOURCES) {
    const result = await runWorker(source, dryRun);
    results.push(result);
    console.log("");
  }

  // 結果サマリー
  const totalDuration = (Date.now() - startTime) / 1000;
  console.log("=== 全体サマリー ===");
  console.log(`総処理時間: ${totalDuration.toFixed(1)}秒`);
  console.log("");
  console.log("ソース別結果:");
  for (const r of results) {
    const status = r.exitCode === 0 ? "✓" : "✗";
    console.log(`  ${status} ${r.source}: ${r.duration.toFixed(1)}秒`);
  }

  const failures = results.filter((r) => r.exitCode !== 0);
  if (failures.length > 0) {
    console.log("");
    console.log(`エラー: ${failures.length}件`);
    process.exit(1);
  }
}

main().catch(console.error);
