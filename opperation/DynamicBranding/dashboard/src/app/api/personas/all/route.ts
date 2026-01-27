import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";
import {
  PersonaResponse,
  AllPersonasResponse,
  DEFAULT_CLUSTER_CONFIG,
} from "@/types/persona.types";

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

// 静的JSONファイルのパス
function getPersonaFilePath(brandName: string): string {
  return path.join(process.cwd(), "output", "personas", `${brandName}.json`);
}

// 静的JSONファイルを読み込む
async function loadStaticPersona(brandName: string): Promise<PersonaResponse | null> {
  try {
    const filePath = getPersonaFilePath(brandName);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as PersonaResponse;
  } catch {
    // ファイルが存在しない場合はnullを返す
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const brandsParam = request.nextUrl.searchParams.get("brands");
    const refresh = request.nextUrl.searchParams.get("refresh") === "true";

    // refreshが指定された場合は再生成を促す
    if (refresh) {
      return NextResponse.json(
        { error: "静的生成モードでは refresh はサポートされていません。scripts/generate-personas.ts を実行してください。" },
        { status: 400 }
      );
    }

    // 対象ブランドを決定
    let targetBrands = VALID_BRANDS;
    if (brandsParam) {
      const requestedBrands = brandsParam.split(",").map(b => decodeURIComponent(b.trim()));
      targetBrands = requestedBrands.filter(b => VALID_BRANDS.includes(b));
    }

    // 静的ファイルから並列読み込み
    const loadPromises = targetBrands.map(brandName => loadStaticPersona(brandName));
    const results = await Promise.all(loadPromises);

    // 有効な結果のみフィルタリング
    const brandResponses: PersonaResponse[] = results.filter(
      (r): r is PersonaResponse => r !== null
    );

    // ブランド名順でソート
    brandResponses.sort((a, b) => {
      const indexA = VALID_BRANDS.indexOf(a.brand);
      const indexB = VALID_BRANDS.indexOf(b.brand);
      return indexA - indexB;
    });

    // 全ペルソナ数をカウント
    const totalPersonas = brandResponses.reduce(
      (sum, b) => sum + b.personas.length,
      0
    );

    const response: AllPersonasResponse = {
      brands: brandResponses,
      totalPersonas,
      clusterConfig: DEFAULT_CLUSTER_CONFIG,
      generatedAt: brandResponses[0]?.generatedAt || new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch all personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}
