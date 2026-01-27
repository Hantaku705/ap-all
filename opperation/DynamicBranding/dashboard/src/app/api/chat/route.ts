import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatRequest, ChatResponse } from "@/types/data.types";

const SYSTEM_PROMPT = `あなたは味の素グループのブランド分析アシスタントです。
以下のデータを基に質問に答えてください。回答は日本語で、簡潔かつ実用的に。

## 分析対象ブランド（8ブランド）
- ほんだし: 和風だしの素（検索シェア最大、冬に強い）
- クックドゥ: 中華合わせ調味料（通年安定）
- 味の素: うま味調味料（コーポレートブランド、ハブ的役割）
- 丸鶏がらスープ: 鶏ガラスープの素
- 香味ペースト: 中華調味料（独自の動き、他ブランドと負の相関）
- コンソメ: 洋風スープの素（冬に非常に強い、11月ピーク）
- ピュアセレクト: マヨネーズ
- アジシオ: 味付け塩

## 主要な発見

### 正の相関（連合）
- **だし連合**: ほんだし × コンソメ（r=0.38）- 冬場に同時検索される傾向
- **うま味連合**: 味の素 × アジシオ（r=0.35）- うま味訴求で連動

### 負の相関・リスク
- **MSG批判リスク**: 味の素への批判がアジシオに波及（ネガティブ率同率4.2%）
- **香味ペースト孤立**: 多くのブランドと負の相関、独自ポジション

### 季節性パターン
- コンソメ: 冬型（11月ピーク、変動幅23.3）
- ほんだし: 弱い冬型（12月ピーク、変動幅4.3）
- その他: 比較的平坦

## 戦略的結論
「味の素は諸刃の剣。ハブとしての波及力は最大だが、MSG批判リスクも最大。攻め（だし連合）と守り（MSG対応）の二軸戦略が必要。」

## 推奨投資配分
- 守り 40%: MSG対応 + アジシオ連動
- 攻め 45%: だし連合（冬場集中）+ 中華連合
- 育成 15%: 香味ペースト認知向上

質問に対しては、上記の分析結果を踏まえて具体的なアドバイスをしてください。`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "申し訳ありません。AI機能は現在設定中です。GEMINI_API_KEYを設定してください。",
        },
        { status: 200 }
      );
    }

    const body: ChatRequest = await request.json();
    const { messages, context } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Add context to system prompt if available
    let systemPrompt = SYSTEM_PROMPT;
    if (context?.tab) {
      const tabNames: Record<string, string> = {
        trends: "トレンド推移",
        correlation: "相関分析",
        seasonality: "季節性",
        sns: "SNS分析",
        insights: "インサイト",
        rawdata: "生データ",
        reports: "レポート",
      };
      systemPrompt += `\n\n現在ユーザーは「${tabNames[context.tab] || context.tab}」タブを見ています。この文脈に沿った回答を心がけてください。`;
    }

    // Build conversation history for Gemini
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `以下の指示に従ってください:\n\n${systemPrompt}` }],
        },
        {
          role: "model",
          parts: [
            {
              text: "はい、味の素グループのブランド分析アシスタントとして、上記の分析データを踏まえて質問にお答えします。何かご質問はありますか？",
            },
          ],
        },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const assistantMessage = response.text();

    const chatResponse: ChatResponse = {
      message: assistantMessage,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "申し訳ありません。エラーが発生しました。もう一度お試しください。",
      },
      { status: 200 }
    );
  }
}
