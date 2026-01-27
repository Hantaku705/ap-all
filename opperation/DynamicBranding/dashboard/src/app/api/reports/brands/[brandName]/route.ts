import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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

/**
 * GET /api/reports/brands/[brandName]
 *
 * ファイルベースのレポートを返す
 * output/reports/[brandName]/report.json を読み込み
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);

    // ブランド名の検証
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

    // ファイルの存在確認
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        {
          error: "Report not found",
          message: `Report for ${decodedBrand} has not been generated yet. Run: npx tsx scripts/generate-reports.ts --brand=${decodedBrand}`,
          brandName: decodedBrand
        },
        { status: 404 }
      );
    }

    // ファイル読み込み
    const reportContent = fs.readFileSync(reportPath, "utf-8");
    const report = JSON.parse(reportContent);

    // レスポンスにブランド名を追加（互換性のため）
    return NextResponse.json({
      ...report,
      brandName: decodedBrand,
      source: "file",
      filePath: `output/reports/${decodedBrand}/report.json`,
    });
  } catch (error) {
    console.error("Failed to load brand report:", error);
    return NextResponse.json(
      { error: "Failed to load brand report", details: String(error) },
      { status: 500 }
    );
  }
}
