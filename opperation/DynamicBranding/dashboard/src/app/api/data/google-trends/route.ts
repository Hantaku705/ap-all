import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GoogleTrendsRow, GoogleTrendsResponse } from "@/types/data.types";

interface BrandRelation {
  name: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 入力値検証: page と limit の範囲チェック
    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const limitRaw = parseInt(searchParams.get("limit") || "50", 10);
    const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : Math.min(pageRaw, 1000);
    const limit = Number.isNaN(limitRaw) || limitRaw < 1 ? 50 : Math.min(limitRaw, 500);

    // sortOrder のホワイトリスト検証
    const sortByParam = searchParams.get("sortBy") || "date";
    const sortOrderParam = searchParams.get("sortOrder");
    const sortBy = ["date", "ほんだし", "クックドゥ", "味の素", "丸鶏がらスープ", "香味ペースト", "コンソメ", "ピュアセレクト", "アジシオ"].includes(sortByParam) ? sortByParam : "date";
    const sortOrder: "asc" | "desc" = sortOrderParam === "asc" ? "asc" : "desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabase = await createClient();

    // Get weekly trends data from Supabase
    const { data: trendsData, error } = await supabase
      .from("weekly_trends")
      .select(`
        week_start,
        score,
        brands (
          name
        )
      `)
      .order("week_start", { ascending: sortOrder === "asc" });

    if (error) {
      throw new Error(error.message);
    }

    // Pivot data: { date: "2021-01-10", ほんだし: 13, ... }
    const pivotedData: Record<string, GoogleTrendsRow> = {};

    trendsData?.forEach((row) => {
      const date = row.week_start;
      const brandData = row.brands as unknown as BrandRelation | null;
      const brand = brandData?.name as keyof Omit<GoogleTrendsRow, "date">;
      const score = row.score;

      if (!pivotedData[date]) {
        pivotedData[date] = {
          date,
          ほんだし: 0,
          クックドゥ: 0,
          味の素: 0,
          丸鶏がらスープ: 0,
          香味ペースト: 0,
          コンソメ: 0,
          ピュアセレクト: 0,
          アジシオ: 0,
        };
      }
      if (brand && score !== null) {
        pivotedData[date][brand] = score;
      }
    });

    let data = Object.values(pivotedData);

    // Filter by date range
    if (startDate) {
      data = data.filter((row) => row.date >= startDate);
    }
    if (endDate) {
      data = data.filter((row) => row.date <= endDate);
    }

    // Sort by specified column
    if (sortBy !== "date") {
      data = [...data].sort((a, b) => {
        const aVal = a[sortBy as keyof GoogleTrendsRow];
        const bVal = b[sortBy as keyof GoogleTrendsRow];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        const aNum = Number(aVal);
        const bNum = Number(bVal);
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      });
    }

    const total = data.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);

    const response: GoogleTrendsResponse = {
      data: paginatedData,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch Google Trends data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
