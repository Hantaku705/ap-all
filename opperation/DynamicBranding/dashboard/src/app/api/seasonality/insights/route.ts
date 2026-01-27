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

// 型定義
interface BrandInsight {
  pattern: string;
  variationRate: number;
  peak: {
    month: number;
    monthName: string;
    score: number;
    reason: string;
  };
  bottom: {
    month: number;
    monthName: string;
    score: number;
    challenge: string;
  };
  recommendation: string;
  detailedInsight: string;
}

interface OverallInsight {
  summary: string;
  crossBrandInsights: string[];
  strategicActions: Array<{
    brand: string;
    action: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }>;
}

interface SeasonalityInsightsFile {
  generatedAt: string;
  overall: OverallInsight;
  brands: Record<string, BrandInsight>;
}

interface BrandPattern {
  brand: string;
  pattern: string;
  variationRate: number;
  peak: {
    month: number;
    monthName: string;
    score: number;
    reason: string;
  };
  bottom: {
    month: number;
    monthName: string;
    score: number;
    challenge: string;
  };
  recommendation: string;
  detailedInsight?: string;
}

interface ApiResponse {
  summary: string;
  brandPatterns: BrandPattern[];
  crossBrandInsights: string[];
  strategicActions: Array<{
    brand: string;
    action: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }>;
  generatedAt: string;
}

/**
 * ファイルベースの季節性インサイトAPI
 *
 * output/seasonality-insights.json を読み込んで返す
 * LLM呼び出しは行わない（スクリプトで事前生成）
 *
 * @param brand - 特定ブランドのみ取得する場合に指定
 */
export async function GET(request: NextRequest) {
  try {
    const brand = request.nextUrl.searchParams.get("brand");

    // ブランド名の検証
    if (brand && !VALID_BRANDS.includes(brand)) {
      return NextResponse.json({ error: "Invalid brand name" }, { status: 400 });
    }

    // インサイトファイルを読み込み
    const filePath = path.join(
      process.cwd(),
      "output",
      "seasonality-insights.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Insights file not found. Run generate-seasonality-insights.ts first." },
        { status: 404 }
      );
    }

    const data: SeasonalityInsightsFile = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    // レスポンス構築
    if (brand) {
      // 特定ブランドの場合
      const brandData = data.brands[brand];
      if (!brandData) {
        return NextResponse.json(
          { error: `Brand "${brand}" not found in insights` },
          { status: 404 }
        );
      }

      const response: ApiResponse = {
        summary: `${brand}は${brandData.peak.monthName}にピーク（${brandData.peak.score}）、${brandData.bottom.monthName}にボトム（${brandData.bottom.score}）。変動幅${brandData.variationRate}%の${brandData.pattern}パターン。`,
        brandPatterns: [
          {
            brand,
            ...brandData,
          },
        ],
        crossBrandInsights: data.overall.crossBrandInsights,
        strategicActions: data.overall.strategicActions.filter(
          (a) => a.brand === brand
        ),
        generatedAt: data.generatedAt,
      };

      return NextResponse.json(response);
    }

    // 全体の場合
    const brandPatterns: BrandPattern[] = Object.entries(data.brands).map(
      ([brandName, insight]) => ({
        brand: brandName,
        ...insight,
      })
    );

    const response: ApiResponse = {
      summary: data.overall.summary,
      brandPatterns,
      crossBrandInsights: data.overall.crossBrandInsights,
      strategicActions: data.overall.strategicActions,
      generatedAt: data.generatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to load insights: ${message}` },
      { status: 500 }
    );
  }
}
