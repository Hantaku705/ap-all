/**
 * Loyalty Growth LLM Generator
 *
 * SNSデータからロイヤリティ成長戦略をLLMで生成
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LoyaltyGrowthInput, LoyaltyGrowthOutput } from "./types";
import { formatInputForPrompt } from "./metrics-calculator";

// Lazy-initialized LLM clients
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

  const openaiKey =
    validateApiKey(process.env.OPENAI_API_KEY_BCM) ||
    validateApiKey(process.env.OPENAI_API_KEY);
  const geminiKey = validateApiKey(process.env.GEMINI_API_KEY);

  if (openaiKey) {
    openaiInstance = new OpenAI({ apiKey: openaiKey });
  }
  if (geminiKey) {
    geminiInstance = new GoogleGenerativeAI(geminiKey);
  }

  clientsInitialized = true;
}

function getGemini(): GoogleGenerativeAI | null {
  initializeLLMClients();
  return geminiInstance;
}

function getOpenAI(): OpenAI | null {
  initializeLLMClients();
  return openaiInstance;
}

// ============================================
// System Prompt
// ============================================

const LOYALTY_GROWTH_SYSTEM_PROMPT = `あなたは企業のロイヤリティ成長戦略の専門家です。
SNSデータの分析結果を基に、実行可能で効果的な戦略提案を生成してください。

## 入力データの解釈
- sentiment: positive=高ロイヤリティ、neutral=中ロイヤリティ、negative=低ロイヤリティ
- topic: 投稿のトピック（R&D、製品、サステナビリティ等）
- engagement_total: いいね+RT+コメント数

## 出力要件

### 1. conversionFunnels（転換ファネル）
- lowからmedium、mediumからhighへの転換パターンを分析
- topTriggersには具体的なトピック名と投稿事例を含める
- conversionRateは週次トレンドから算出された値を参考に

### 2. behavioralPatterns（行動パターン）
- 各レベルのエンゲージメント特性を記述
- topicPreferencesには実データのトピックを含める
- 「〇倍」などの比較は実データの比率から算出

### 3. growthTargets（成長目標）
- currentDistributionは入力データをそのまま使用
- targetDistributionは現状+5-10%を現実的な目標として設定
- projectedTimelineは四半期単位で設定

### 4. recommendations（戦略提案）
- 各提案に代表投稿からの引用を含める（「」で囲む）
- implementationEffortとtimeToResultを具体的に
- KPIは現在値と目標値の両方を設定

## 出力形式
必ず以下のJSON形式で出力してください：
{
  "conversionFunnels": [...],
  "behavioralPatterns": [...],
  "growthTargets": {...},
  "recommendations": [...]
}`;

// ============================================
// Prompt Builder
// ============================================

function buildUserPrompt(input: LoyaltyGrowthInput): string {
  const formattedData = formatInputForPrompt(input);

  return `以下のSNSデータ分析結果を基に、ロイヤリティ成長戦略を生成してください。

${formattedData}

## 出力形式の詳細

### conversionFunnels（2件：低→中、中→高）
各ファネルには以下を含める：
- fromLevel, toLevel: 転換元・先のレベル
- conversionRate: 推定転換率（入力データの転換率を参考）
- averageTimeToConvert: 転換に要する平均日数（30-90日程度）
- sampleSize: 分析対象の投稿数
- topTriggers: 転換のきっかけ（3-5件）
  - type: topic/event/content/engagement
  - name: トリガー名（具体的なトピック名を使用）
  - description: 詳細説明（代表投稿を「」で引用）
  - impactScore: 影響度スコア（1-100）
  - frequency: 発生頻度

### behavioralPatterns（3件：high/medium/low）
各パターンには以下を含める：
- level: high/medium/low
- engagementMetrics: 平均投稿頻度、いいね、RT、リプライ
- topicPreferences: 好むトピック（3-5件）
  - topic: トピック名（入力データのtopicを使用）
  - topicLabel: 日本語ラベル
  - engagementRate: エンゲージメント率
  - loyaltyCorrelation: ロイヤリティ相関

### growthTargets
- currentDistribution: 入力データの分布をそのまま使用
- targetDistribution: 現状+5-10%の目標
  - high: { percentage: XX, targetDate: "YYYY-MM-DD" }
  - medium: { percentage: XX }
  - low: { percentage: XX }
- projectedTimeline: 四半期単位の予測（4-6件）
  - date, highPercentage, mediumPercentage, lowPercentage, keyAction

### recommendations（3-5件）
各提案には以下を含める：
- segment: 対象セグメント
- title: 施策タイトル
- description: 詳細説明（代表投稿を「」で引用して根拠を示す）
- expectedImpact: 期待効果
- implementationEffort: low/medium/high
- timeToResult: 効果発現までの期間
- requiredResources: 必要リソース
- kpis: KPI（2-3件）
  - name, currentValue, targetValue, unit

上記の形式に従ってJSONを生成してください。`;
}

// ============================================
// JSON Parser
// ============================================

function parseJsonResponse<T>(text: string): T | null {
  try {
    // Try to extract JSON from markdown code block
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Raw response:", text.substring(0, 500));
    return null;
  }
}

// ============================================
// LLM Generation Functions
// ============================================

/**
 * Generate with Gemini (primary)
 */
async function generateWithGemini(
  input: LoyaltyGrowthInput
): Promise<LoyaltyGrowthOutput | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${LOYALTY_GROWTH_SYSTEM_PROMPT}\n\n${buildUserPrompt(input)}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return parseJsonResponse<LoyaltyGrowthOutput>(text);
  } catch (error) {
    console.error("Gemini loyalty growth generation failed:", error);
    return null;
  }
}

/**
 * Generate with OpenAI (fallback)
 */
async function generateWithOpenAI(
  input: LoyaltyGrowthInput
): Promise<LoyaltyGrowthOutput | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: LOYALTY_GROWTH_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return parseJsonResponse<LoyaltyGrowthOutput>(content);
  } catch (error) {
    console.error("OpenAI loyalty growth generation failed:", error);
    return null;
  }
}

// ============================================
// Main Export Functions
// ============================================

/**
 * Generate loyalty growth strategy with fallback
 */
export async function generateLoyaltyGrowthStrategy(
  input: LoyaltyGrowthInput
): Promise<{ output: LoyaltyGrowthOutput | null; model: string }> {
  // Try Gemini first (faster and cheaper)
  let output = await generateWithGemini(input);
  if (output) {
    return { output, model: "gemini-2.0-flash" };
  }

  // Fallback to OpenAI
  output = await generateWithOpenAI(input);
  if (output) {
    return { output, model: "gpt-4o-mini" };
  }

  console.warn("No LLM available for loyalty growth generation");
  return { output: null, model: "none" };
}

/**
 * Check if any LLM provider is available
 */
export function isLLMAvailable(): boolean {
  initializeLLMClients();
  return geminiInstance !== null || openaiInstance !== null;
}

/**
 * Get available LLM provider name
 */
export function getAvailableLLMProvider(): string {
  initializeLLMClients();
  if (geminiInstance) return "Gemini";
  if (openaiInstance) return "OpenAI";
  return "None";
}
