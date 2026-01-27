import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export interface Coherence {
  isCoherent: boolean;
  coherenceScore: number;
  coherenceLabel: string;
}

export interface BuzzImpactData {
  threshold: number;
  totalBuzzPosts: number;
  analyzedPosts: number;
  summary: {
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
    highImpactRate: number;
    coherentCount: number;
    incoherentCount: number;
    neutralCount: number;
    highReliability: number;
    mediumReliability: number;
    lowReliability: number;
  };
  impacts: Array<{
    postDate: string;
    engagement: number;
    sentiment: string | null;
    content: string;
    topic: string | null;
    url: string | null;
    nextTradingDay: string | null;
    stockChange: number | null;
    impact: "high" | "medium" | "low" | "none";
    impactLabel: string;
    coherence: Coherence;
    reliabilityScore: number;
    reliabilityLabel: string;
  }>;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "output/corporate/1-buzz-impact.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Buzz impact data not found" },
        { status: 404 }
      );
    }

    const data: BuzzImpactData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load buzz impact data:", error);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
