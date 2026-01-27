import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";
import {
  PersonaResponse,
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
    const data = JSON.parse(content) as PersonaResponse;
    // キャッシュフラグを更新
    return {
      ...data,
      cached: true,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const brand = request.nextUrl.searchParams.get("brand");
    const refresh = request.nextUrl.searchParams.get("refresh") === "true";

    if (!brand) {
      return NextResponse.json(
        { error: "Brand parameter is required" },
        { status: 400 }
      );
    }

    const decodedBrand = decodeURIComponent(brand);

    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json(
        { error: "Invalid brand name" },
        { status: 404 }
      );
    }

    // refreshが指定された場合は再生成を促す
    if (refresh) {
      return NextResponse.json(
        { error: "静的生成モードでは refresh はサポートされていません。scripts/generate-personas.ts を実行してください。" },
        { status: 400 }
      );
    }

    // 静的ファイルから読み込み
    const data = await loadStaticPersona(decodedBrand);

    if (!data) {
      // ファイルがない場合は空のレスポンス
      return NextResponse.json({
        brand: decodedBrand,
        personas: [],
        clusterConfig: DEFAULT_CLUSTER_CONFIG,
        postCount: 0,
        personaCount: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        cached: false,
        error: "静的ファイルが見つかりません。scripts/generate-personas.ts を実行してください。",
      } as PersonaResponse);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}
