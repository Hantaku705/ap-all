import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client lazily to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(req: NextRequest) {
  try {
    const client = getOpenAI();
    if (!client) {
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    const { messages, dealsContext } = await req.json();

    const systemPrompt = `あなたはNADESHIKO売上管理ダッシュボードのAIアシスタントです。
売上データの分析や質問に回答してください。

## 現在のデータ概要:
${dealsContext}

## 回答ルール:
- 日本語で簡潔に回答
- 数値は万円単位で表示（例: 1,234万円）
- データに基づいた回答を心がける
- 分析や提案も積極的に行う`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'AIとの通信に失敗しました' },
      { status: 500 }
    );
  }
}
