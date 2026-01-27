/**
 * LLM Section Regenerator
 *
 * Regenerates low-quality report sections using LLM with UGC evidence.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { QualityIssue, ReportSection, ReportStrategy } from "./detector";
import type { UGCEvidence, UGCAggregation } from "./ugc-fetcher";
import { formatUGCForPrompt, formatAggregationForPrompt } from "./ugc-fetcher";

export type { UGCAggregation } from "./ugc-fetcher";

// Lazy-initialized LLM clients (to ensure environment variables are loaded)
let openaiInstance: OpenAI | null = null;
let geminiInstance: GoogleGenerativeAI | null = null;
let clientsInitialized = false;

function validateApiKey(key: string | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim().replace(/\\n/g, "").replace(/\n/g, "");
  return trimmed.length > 10 ? trimmed : null;
}

function initializeLLMClients(): void {
  if (clientsInitialized) return;

  const openaiKey = validateApiKey(process.env.OPENAI_API_KEY_BCM) || validateApiKey(process.env.OPENAI_API_KEY);
  const geminiKey = validateApiKey(process.env.GEMINI_API_KEY);

  if (openaiKey) {
    openaiInstance = new OpenAI({ apiKey: openaiKey });
  }
  if (geminiKey) {
    geminiInstance = new GoogleGenerativeAI(geminiKey);
  }

  clientsInitialized = true;
}

function getOpenAI(): OpenAI | null {
  initializeLLMClients();
  return openaiInstance;
}

function getGemini(): GoogleGenerativeAI | null {
  initializeLLMClients();
  return geminiInstance;
}

// System prompt for section regeneration
const SECTION_REGENERATION_PROMPT = `あなたはブランド分析の専門家です。
以下のSNS投稿（UGCデータ）を根拠として、分析セクションを改善してください。

## 改善ルール
1. 「分析完了」「データなし」「可能性があります」などの定型文を使用しない
2. 必ず具体的な数値・事例を含める（「約○○%」「○件中△件」など）
3. 抽象的な提言（「認知度向上」「SNS強化」）は禁止
4. UGCから引用した具体的な声を「」で囲んで含める
5. 推奨アクションは「誰が」「何を」「いつまでに」「どうやって」を明確に
6. 各項目は30〜80文字程度で具体的に記述

## 出力形式
必ず以下のJSON形式で出力してください：
{
  "findings": ["改善された発見事項（3-5件）"],
  "insights": ["改善されたインサイト（2-4件）"],
  "recommendations": ["具体的な推奨アクション（2-4件）"],
  "citedPostIds": [引用したUGC投稿のID番号]
}`;

// System prompt for strategy regeneration
const STRATEGY_REGENERATION_PROMPT = `あなたはブランド戦略コンサルタントです。
SNSデータに基づいて、経営層に提出できる品質の戦略提言を作成してください。

## 品質基準
1. 全ての提言に数値根拠を含める
2. 「〇〇訴求」のような単語レベルの提言は禁止
3. 各アクションプランに「対象」「施策」「KPI」「期限」を明記
4. 競合との差別化ポイントを具体的に
5. UGCから消費者の生の声を引用

## 出力形式
必ず以下のJSON形式で出力してください：
{
  "keyInsight": "1文で表す核心的インサイト（50-100文字）",
  "executiveSummary": "エグゼクティブサマリー（150-250文字）",
  "findings": ["発見事項（5件、各30-60文字）"],
  "recommendations": ["推奨アクション（5件、各30-60文字）"],
  "actionPlan": ["フェーズ別アクションプラン（3-5件、各100-150文字）"],
  "citedPostIds": [引用したUGC投稿のID番号]
}`;

export interface RegeneratedSection {
  findings: string[];
  insights: string[];
  recommendations: string[];
  citedPostIds: number[];
}

export interface RegeneratedStrategy {
  keyInsight: string;
  executiveSummary: string;
  findings: string[];
  recommendations: string[];
  actionPlan: string[];
  citedPostIds: number[];
}

/**
 * Build user prompt for section regeneration
 */
function buildSectionPrompt(
  section: ReportSection,
  issues: QualityIssue[],
  ugcEvidence: UGCEvidence[],
  aggregation?: UGCAggregation
): string {
  const issueList = issues
    .map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.reason}: 「${issue.originalValue.substring(0, 50)}...」`)
    .join("\n");

  const aggregationSection = aggregation
    ? `\n${formatAggregationForPrompt(aggregation)}\n`
    : "";

  return `## 対象セクション
タイトル: ${section.title}
問い: ${section.question || "N/A"}

## 現在の内容（要改善）
### 発見事項
${section.findings?.join("\n") || "なし"}

### インサイト
${section.insights?.join("\n") || "なし"}

### 推奨アクション
${section.recommendations?.join("\n") || "なし"}

## 検出された品質問題（${issues.length}件）
${issueList}
${aggregationSection}
## 代表的なUGC投稿サンプル（${ugcEvidence.length}件）
※ 上記の全体統計を踏まえた上で、以下の代表サンプルを参考にしてください
${formatUGCForPrompt(ugcEvidence)}

上記の全体統計とUGCサンプルを根拠に、品質問題を解消した改善版を生成してください。
必ず全体統計の数値を引用し、具体的な割合や件数を含めてください。`;
}

/**
 * Build user prompt for strategy regeneration
 */
function buildStrategyPrompt(
  brandName: string,
  strategy: ReportStrategy,
  issues: QualityIssue[],
  ugcEvidence: {
    highEngagement: UGCEvidence[];
    negative: UGCEvidence[];
    withCEP: UGCEvidence[];
  },
  aggregation?: UGCAggregation
): string {
  const issueList = issues
    .map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.reason}`)
    .join("\n");

  const aggregationSection = aggregation
    ? `\n${formatAggregationForPrompt(aggregation)}\n`
    : "";

  return `## ブランド: ${brandName}

## 現在の戦略サマリー（要改善）
### キーインサイト
${strategy.keyInsight || "なし"}

### 発見事項
${strategy.findings?.join("\n") || "なし"}

### 推奨アクション
${strategy.recommendations?.join("\n") || "なし"}

## 検出された品質問題
${issueList}
${aggregationSection}
## 高エンゲージメント投稿サンプル（${ugcEvidence.highEngagement.length}件）
${formatUGCForPrompt(ugcEvidence.highEngagement.slice(0, 10))}

## ネガティブ投稿サンプル（リスク把握用、${ugcEvidence.negative.length}件）
${formatUGCForPrompt(ugcEvidence.negative.slice(0, 5))}

## CEP関連投稿サンプル（${ugcEvidence.withCEP.length}件）
${formatUGCForPrompt(ugcEvidence.withCEP.slice(0, 10))}

上記の全体統計とUGCサンプルを根拠に、経営層に提出できる品質の戦略提言を生成してください。
必ず全体統計の数値（例: 「ポジティブ率49%」「unknown層が86%」）を引用してください。`;
}

/**
 * Parse JSON from LLM response (handles ```json``` wrappers)
 */
function parseJsonResponse<T>(text: string): T | null {
  try {
    // Try to extract JSON from markdown code block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Raw response:", text.substring(0, 500));
    return null;
  }
}

/**
 * Regenerate a section using OpenAI
 */
async function regenerateSectionWithOpenAI(
  section: ReportSection,
  issues: QualityIssue[],
  ugcEvidence: UGCEvidence[],
  aggregation?: UGCAggregation
): Promise<RegeneratedSection | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SECTION_REGENERATION_PROMPT },
        { role: "user", content: buildSectionPrompt(section, issues, ugcEvidence, aggregation) },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return parseJsonResponse<RegeneratedSection>(content);
  } catch (error) {
    console.error("OpenAI section regeneration failed:", error);
    return null;
  }
}

/**
 * Regenerate a section using Gemini
 */
async function regenerateSectionWithGemini(
  section: ReportSection,
  issues: QualityIssue[],
  ugcEvidence: UGCEvidence[],
  aggregation?: UGCAggregation
): Promise<RegeneratedSection | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${SECTION_REGENERATION_PROMPT}\n\n${buildSectionPrompt(section, issues, ugcEvidence, aggregation)}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return parseJsonResponse<RegeneratedSection>(text);
  } catch (error) {
    console.error("Gemini section regeneration failed:", error);
    return null;
  }
}

/**
 * Regenerate strategy using OpenAI
 */
async function regenerateStrategyWithOpenAI(
  brandName: string,
  strategy: ReportStrategy,
  issues: QualityIssue[],
  ugcEvidence: {
    highEngagement: UGCEvidence[];
    negative: UGCEvidence[];
    withCEP: UGCEvidence[];
  },
  aggregation?: UGCAggregation
): Promise<RegeneratedStrategy | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: STRATEGY_REGENERATION_PROMPT },
        { role: "user", content: buildStrategyPrompt(brandName, strategy, issues, ugcEvidence, aggregation) },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return parseJsonResponse<RegeneratedStrategy>(content);
  } catch (error) {
    console.error("OpenAI strategy regeneration failed:", error);
    return null;
  }
}

/**
 * Regenerate strategy using Gemini
 */
async function regenerateStrategyWithGemini(
  brandName: string,
  strategy: ReportStrategy,
  issues: QualityIssue[],
  ugcEvidence: {
    highEngagement: UGCEvidence[];
    negative: UGCEvidence[];
    withCEP: UGCEvidence[];
  },
  aggregation?: UGCAggregation
): Promise<RegeneratedStrategy | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${STRATEGY_REGENERATION_PROMPT}\n\n${buildStrategyPrompt(brandName, strategy, issues, ugcEvidence, aggregation)}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return parseJsonResponse<RegeneratedStrategy>(text);
  } catch (error) {
    console.error("Gemini strategy regeneration failed:", error);
    return null;
  }
}

/**
 * Regenerate a section with fallback between providers
 */
export async function regenerateSection(
  section: ReportSection,
  issues: QualityIssue[],
  ugcEvidence: UGCEvidence[],
  aggregation?: UGCAggregation
): Promise<RegeneratedSection | null> {
  // Try OpenAI first
  let result = await regenerateSectionWithOpenAI(section, issues, ugcEvidence, aggregation);
  if (result) return result;

  // Fallback to Gemini
  result = await regenerateSectionWithGemini(section, issues, ugcEvidence, aggregation);
  if (result) return result;

  console.warn(`No LLM available for regenerating section: ${section.title}`);
  return null;
}

/**
 * Regenerate strategy with fallback between providers
 */
export async function regenerateStrategy(
  brandName: string,
  strategy: ReportStrategy,
  issues: QualityIssue[],
  ugcEvidence: {
    highEngagement: UGCEvidence[];
    negative: UGCEvidence[];
    withCEP: UGCEvidence[];
  },
  aggregation?: UGCAggregation
): Promise<RegeneratedStrategy | null> {
  // Try OpenAI first
  let result = await regenerateStrategyWithOpenAI(brandName, strategy, issues, ugcEvidence, aggregation);
  if (result) return result;

  // Fallback to Gemini
  result = await regenerateStrategyWithGemini(brandName, strategy, issues, ugcEvidence, aggregation);
  if (result) return result;

  console.warn(`No LLM available for regenerating strategy: ${brandName}`);
  return null;
}

/**
 * Check if any LLM provider is available
 */
export function isLLMAvailable(): boolean {
  initializeLLMClients();
  return openaiInstance !== null || geminiInstance !== null;
}

/**
 * Get available LLM provider name
 */
export function getAvailableLLMProvider(): string {
  initializeLLMClients();
  if (openaiInstance) return "OpenAI";
  if (geminiInstance) return "Gemini";
  return "None";
}
