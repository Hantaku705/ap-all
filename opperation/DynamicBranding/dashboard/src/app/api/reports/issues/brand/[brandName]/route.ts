/**
 * ブランドレポートAPI
 *
 * 事前生成されたレポートファイルを読み込んで返す
 * ファイルが存在しない場合は404を返す
 *
 * 使用方法:
 * GET /api/reports/issues/brand/{brandName}
 *
 * レポート生成:
 * npx tsx scripts/generate-reports.ts
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import type { IssueReport } from "@/types/data.types";

const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);

    // ブランド名のバリデーション
    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json(
        { error: "Invalid brand name", validBrands: VALID_BRANDS },
        { status: 404 }
      );
    }

    // レポートファイルのパス
    const reportPath = path.join(
      process.cwd(),
      "output",
      "reports",
      decodedBrand,
      "report.json"
    );

    // ファイル存在チェック
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        {
          error: "Report not found",
          message: `レポートが生成されていません。以下のコマンドで生成してください:`,
          command: `npx tsx scripts/generate-reports.ts --brand=${decodedBrand}`,
        },
        { status: 404 }
      );
    }

    // ファイル読み込み
    const reportJson = fs.readFileSync(reportPath, "utf-8");
    const report: IssueReport = JSON.parse(reportJson);

    // キャッシュヘッダー追加（5分間キャッシュ）
    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to read brand report:", error);
    return NextResponse.json(
      { error: "Failed to read brand report" },
      { status: 500 }
    );
  }
}

// Markdownレポートを返すエンドポイント（オプション）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);

    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json({ error: "Invalid brand name" }, { status: 404 });
    }

    const body = await request.json();
    const format = body.format || "json";

    if (format === "markdown") {
      const mdPath = path.join(
        process.cwd(),
        "output",
        "reports",
        decodedBrand,
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
    }

    // JSON形式（デフォルト）
    const reportPath = path.join(
      process.cwd(),
      "output",
      "reports",
      decodedBrand,
      "report.json"
    );

    if (!fs.existsSync(reportPath)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const reportJson = fs.readFileSync(reportPath, "utf-8");
    const report: IssueReport = JSON.parse(reportJson);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to read brand report:", error);
    return NextResponse.json(
      { error: "Failed to read brand report" },
      { status: 500 }
    );
  }
}

// 静的パラメータ生成（SSG用）
export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({
    brandName: brand,
  }));
}
