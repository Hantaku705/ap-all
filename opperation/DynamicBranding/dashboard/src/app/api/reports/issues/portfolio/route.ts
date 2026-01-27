/**
 * ポートフォリオレポートAPI
 *
 * 事前生成されたレポートファイルを読み込んで返す
 * ファイルが存在しない場合は404を返す
 *
 * 使用方法:
 * GET /api/reports/issues/portfolio
 *
 * レポート生成:
 * npx tsx scripts/generate-reports.ts
 */

import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

interface PortfolioSection {
  title: string;
  question: string;
  findings: string[];
  insights: string[];
  recommendations: string[];
  crossAnalysis?: string;
  priority: 'high' | 'medium' | 'low';
  dataTable?: Array<Record<string, string | number>>;
}

interface PortfolioReport {
  issueId: string;
  title: string;
  generatedAt: string;
  sections: PortfolioSection[];
  executiveSummary: string;
  strategicPriorities: {
    immediate: string[];
    midTerm: string[];
    deferred: string[];
  };
  markdown: string;
}

export async function GET() {
  try {
    // レポートファイルのパス
    const reportPath = path.join(
      process.cwd(),
      "output",
      "reports",
      "portfolio",
      "report.json"
    );

    // ファイル存在チェック
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        {
          error: "Report not found",
          message: `ポートフォリオレポートが生成されていません。以下のコマンドで生成してください:`,
          command: `npx tsx scripts/generate-reports.ts`,
        },
        { status: 404 }
      );
    }

    // ファイル読み込み
    const reportJson = fs.readFileSync(reportPath, "utf-8");
    const report: PortfolioReport = JSON.parse(reportJson);

    // キャッシュヘッダー追加（5分間キャッシュ）
    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to read portfolio report:", error);
    return NextResponse.json(
      { error: "Failed to read portfolio report" },
      { status: 500 }
    );
  }
}

// Markdownレポートを返すエンドポイント
export async function POST() {
  try {
    const mdPath = path.join(
      process.cwd(),
      "output",
      "reports",
      "portfolio",
      "report.md"
    );

    if (!fs.existsSync(mdPath)) {
      return NextResponse.json({ error: "Markdown report not found" }, { status: 404 });
    }

    const markdown = fs.readFileSync(mdPath, "utf-8");
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to read portfolio markdown:", error);
    return NextResponse.json(
      { error: "Failed to read portfolio report" },
      { status: 500 }
    );
  }
}
