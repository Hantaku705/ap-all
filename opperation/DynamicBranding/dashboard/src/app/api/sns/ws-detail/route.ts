import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// 有効なブランド一覧
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

// 静的ファイルディレクトリ
const WS_DETAIL_DIR = path.join(process.cwd(), "output", "sns", "ws-detail");

// 静的JSONファイル読み込み
function readStaticJson(filename: string): WsDetailData | null {
  const filePath = path.join(WS_DETAIL_DIR, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  }
  return null;
}

// データ型定義
interface WsDetailData {
  dish_category: Array<{ category: string; count: number; percentage: number }>;
  dish_name: Array<{ name: string; count: number; brand: string }>;
  meal_occasion: Array<{ occasion: string; count: number; percentage: number }>;
  cooking_for: Array<{ target: string; count: number; percentage: number }>;
  motivation: Array<{ category: string; count: number; percentage: number }>;
  brand_dish: Array<{ brand: string; category: string; count: number }>;
}

// 複数ブランドデータのマージ
function mergeWsDetailData(dataList: WsDetailData[]): WsDetailData {
  if (dataList.length === 0) {
    return {
      dish_category: [],
      dish_name: [],
      meal_occasion: [],
      cooking_for: [],
      motivation: [],
      brand_dish: [],
    };
  }

  if (dataList.length === 1) {
    return dataList[0];
  }

  // カテゴリ系のマージ（countを合算してpercentageを再計算）
  const mergeCounts = <T extends { count: number }>(
    key: keyof WsDetailData,
    dataList: WsDetailData[],
    labelKey: string
  ) => {
    const counts: Record<string, number> = {};
    for (const data of dataList) {
      const items = data[key] as Array<{ count: number; [k: string]: unknown }>;
      for (const item of items) {
        const label = item[labelKey] as string;
        counts[label] = (counts[label] || 0) + item.count;
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        [labelKey]: label,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  };

  // dish_name のマージ（countを合算、brandを結合）
  const mergeNames = () => {
    const nameCounts: Record<string, { count: number; brands: Set<string> }> = {};
    for (const data of dataList) {
      for (const item of data.dish_name) {
        if (!nameCounts[item.name]) {
          nameCounts[item.name] = { count: 0, brands: new Set() };
        }
        nameCounts[item.name].count += item.count;
        if (item.brand) {
          item.brand.split(/[,・]/).forEach((b) => nameCounts[item.name].brands.add(b.trim()));
        }
      }
    }
    return Object.entries(nameCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        brand: Array.from(data.brands).slice(0, 2).join("・"),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  };

  // brand_dish のマージ
  const mergeBrandDish = () => {
    const counts: Record<string, Record<string, number>> = {};
    for (const data of dataList) {
      for (const item of data.brand_dish) {
        if (!counts[item.brand]) counts[item.brand] = {};
        counts[item.brand][item.category] = (counts[item.brand][item.category] || 0) + item.count;
      }
    }
    const result: Array<{ brand: string; category: string; count: number }> = [];
    for (const [brand, categories] of Object.entries(counts)) {
      for (const [category, count] of Object.entries(categories)) {
        result.push({ brand, category, count });
      }
    }
    return result.sort((a, b) => b.count - a.count);
  };

  return {
    dish_category: mergeCounts("dish_category", dataList, "category") as WsDetailData["dish_category"],
    dish_name: mergeNames(),
    meal_occasion: mergeCounts("meal_occasion", dataList, "occasion") as WsDetailData["meal_occasion"],
    cooking_for: mergeCounts("cooking_for", dataList, "target") as WsDetailData["cooking_for"],
    motivation: mergeCounts("motivation", dataList, "category") as WsDetailData["motivation"],
    brand_dish: mergeBrandDish(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandsParam = searchParams.get("brands");

    // ブランド指定なし → 全ブランド統合ファイル
    if (!brandsParam) {
      const allData = readStaticJson("all.json");
      if (allData) {
        return NextResponse.json(allData, {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    }

    // 指定ブランドのファイルを読み込み
    const brands = brandsParam?.split(",").map((b) => b.trim()).filter((b) => VALID_BRANDS.includes(b)) || [];

    // 単一ブランド → 直接ファイルを返す
    if (brands.length === 1) {
      const brandData = readStaticJson(`${brands[0]}.json`);
      if (brandData) {
        return NextResponse.json(brandData, {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    }

    // 複数ブランド → マージして返す
    if (brands.length > 1) {
      const dataList: WsDetailData[] = [];
      for (const brand of brands) {
        const data = readStaticJson(`${brand}.json`);
        if (data) {
          dataList.push(data);
        }
      }
      if (dataList.length > 0) {
        const merged = mergeWsDetailData(dataList);
        return NextResponse.json(merged, {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    }

    // 全ブランド統合ファイルにフォールバック
    const allData = readStaticJson("all.json");
    if (allData) {
      return NextResponse.json(allData, {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }

    // 静的ファイルが存在しない場合はエラー
    return NextResponse.json(
      { error: "Static data not found. Run: npx tsx scripts/generate-static-data.ts" },
      { status: 500 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
