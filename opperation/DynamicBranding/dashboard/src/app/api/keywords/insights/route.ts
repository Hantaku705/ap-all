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
interface ExclusiveKeyword {
  brand: string;
  keywords: string[];
  insight: string;
}

interface ContestedKeyword {
  keywords: string[];
  brands: string[];
  insight: string;
}

interface RisingKeywordAnalysis {
  keyword: string;
  status: string;
  brands: string[];
  background: string;
  recommendation: string;
}

interface StrategicAction {
  brand: string;
  action: string;
  type: "strengthen" | "capture" | "monitor";
  impact: "HIGH" | "MEDIUM" | "LOW";
}

interface BrandKeywordInsight {
  exclusiveKeywords: string[];
  sharedKeywords: string[];
  risingKeywords: string[];
  competitivePosition: string;
  recommendation: string;
}

interface KeywordInsightsFile {
  generatedAt: string;
  overall: {
    summary: string;
    competitivePositioning: {
      exclusive: ExclusiveKeyword[];
      contested: ContestedKeyword[];
    };
    risingAnalysis: RisingKeywordAnalysis[];
    strategicActions: StrategicAction[];
  };
  brands: Record<string, BrandKeywordInsight>;
}

interface ApiResponse {
  summary: string;
  competitivePositioning: {
    exclusive: ExclusiveKeyword[];
    contested: ContestedKeyword[];
  };
  risingAnalysis: RisingKeywordAnalysis[];
  strategicActions: StrategicAction[];
  brandInsight?: BrandKeywordInsight;
  generatedAt: string;
}

/**
 * ファイルベースの関連KWインサイトAPI
 *
 * output/keyword-insights.json を読み込んで返す
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
      "keyword-insights.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error:
            "Insights file not found. Run generate-keyword-insights.ts first.",
        },
        { status: 404 }
      );
    }

    const data: KeywordInsightsFile = JSON.parse(
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

      // ブランド関連の戦略アクションだけフィルタ
      const brandActions = data.overall.strategicActions.filter(
        (a) => a.brand === brand || a.brand === "全体"
      );

      // ブランド関連の独占領域
      const brandExclusive = data.overall.competitivePositioning.exclusive.filter(
        (e) => e.brand === brand
      );

      // ブランド関連の激戦区
      const brandContested = data.overall.competitivePositioning.contested.filter(
        (c) => c.brands.includes(brand)
      );

      const response: ApiResponse = {
        summary: `${brand}の検索キーワードポジション: ${brandData.competitivePosition}`,
        competitivePositioning: {
          exclusive: brandExclusive,
          contested: brandContested,
        },
        risingAnalysis: data.overall.risingAnalysis.filter(
          (r) => r.brands?.includes(brand)
        ),
        strategicActions: brandActions,
        brandInsight: brandData,
        generatedAt: data.generatedAt,
      };

      return NextResponse.json(response);
    }

    // 全体の場合
    const response: ApiResponse = {
      summary: data.overall.summary,
      competitivePositioning: data.overall.competitivePositioning,
      risingAnalysis: data.overall.risingAnalysis,
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
