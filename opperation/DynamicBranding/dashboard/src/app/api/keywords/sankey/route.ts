import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

interface SankeyNode {
  name: string;
  type: "brand" | "keyword" | "cep";
  color?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface CepMapping {
  keyword: string;
  relevance_score: number;
  ceps: { cep_name: string; category: string } | null;
}

interface KeywordData {
  keyword: string;
  queryType: string;
  value: string;
  extractedValue: number;
  rank: number;
  fetchDate: string;
  brand: string;
  brandColor: string;
}

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "output", "keywords", "sankey.json");
    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const searchParams = request.nextUrl.searchParams;
    const brandFilter = searchParams.get("brand");
    const limit = parseInt(searchParams.get("limit") || "10");

    const keywords: KeywordData[] = rawData.keywords || [];
    const cepMappings: CepMapping[] = rawData.cepMappings || [];

    // Build node and link arrays
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const nodeIndex = new Map<string, number>();

    // Helper to add node
    const addNode = (name: string, type: SankeyNode["type"], color?: string): number => {
      const key = `${type}:${name}`;
      if (!nodeIndex.has(key)) {
        nodeIndex.set(key, nodes.length);
        nodes.push({ name, type, color });
      }
      return nodeIndex.get(key)!;
    };

    const keywordMap = new Map<string, { brandIndex: number; value: number }[]>();

    // Process keywords (limit per brand)
    const brandKeywordCount: Record<string, number> = {};

    keywords.forEach((kw) => {
      if (!kw.brand) return;
      if (brandFilter && kw.brand !== brandFilter) return;

      // Limit keywords per brand
      if (!brandKeywordCount[kw.brand]) brandKeywordCount[kw.brand] = 0;
      if (brandKeywordCount[kw.brand] >= limit) return;
      brandKeywordCount[kw.brand]++;

      const brandIndex = addNode(kw.brand, "brand", kw.brandColor);
      const kwIndex = addNode(kw.keyword, "keyword");
      const value = kw.extractedValue || 1;

      // Brand -> Keyword link
      links.push({
        source: brandIndex,
        target: kwIndex,
        value,
      });

      // Track for CEP mapping
      if (!keywordMap.has(kw.keyword)) {
        keywordMap.set(kw.keyword, []);
      }
      keywordMap.get(kw.keyword)!.push({ brandIndex, value });
    });

    // Create CEP mapping lookup
    const cepMappingMap = new Map<string, { cepName: string; score: number }[]>();
    cepMappings.forEach((m) => {
      if (!m.ceps) return;
      if (!cepMappingMap.has(m.keyword)) {
        cepMappingMap.set(m.keyword, []);
      }
      cepMappingMap.get(m.keyword)!.push({
        cepName: m.ceps.cep_name,
        score: Number(m.relevance_score),
      });
    });

    // Rule-based CEP mapping for keywords without explicit mapping
    const cepRules: Record<string, string[]> = {
      時短: ["平日夜の時短ニーズ"],
      レシピ: ["平日夜の時短ニーズ", "味付け不安の解消"],
      簡単: ["平日夜の時短ニーズ", "一人暮らしの手抜き飯"],
      味噌汁: ["平日夜の時短ニーズ", "味付け不安の解消"],
      料理: ["味付け不安の解消"],
      一人暮らし: ["一人暮らしの手抜き飯"],
      おつまみ: ["晩酌のおつまみ"],
      子ども: ["子どもの好き嫌い対策"],
      ダイエット: ["ダイエット中の満足感"],
      健康: ["健康意識の高まり"],
      おもてなし: ["おもてなし料理"],
      残り物: ["残り物リメイク"],
      朝: ["朝の時間節約"],
    };

    // Apply mappings: Keyword -> CEP
    keywordMap.forEach((brandInfos, keyword) => {
      const kwKey = `keyword:${keyword}`;
      const kwIndex = nodeIndex.get(kwKey);
      if (kwIndex === undefined) return;

      // Check explicit mappings first
      const explicitMappings = cepMappingMap.get(keyword);
      if (explicitMappings && explicitMappings.length > 0) {
        explicitMappings.forEach((m) => {
          const cepIndex = addNode(m.cepName, "cep");
          const avgValue = brandInfos.reduce((sum, b) => sum + b.value, 0) / brandInfos.length;
          links.push({
            source: kwIndex,
            target: cepIndex,
            value: Math.round(avgValue * m.score),
          });
        });
        return;
      }

      // Rule-based fallback
      for (const [pattern, ceps] of Object.entries(cepRules)) {
        if (keyword.includes(pattern)) {
          ceps.forEach((cepName) => {
            const cepIndex = addNode(cepName, "cep");
            const avgValue = brandInfos.reduce((sum, b) => sum + b.value, 0) / brandInfos.length;
            links.push({
              source: kwIndex,
              target: cepIndex,
              value: Math.round(avgValue * 0.7),
            });
          });
          return;
        }
      }
    });

    return NextResponse.json({
      nodes,
      links,
    });
  } catch (error) {
    console.error("Error fetching sankey data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
