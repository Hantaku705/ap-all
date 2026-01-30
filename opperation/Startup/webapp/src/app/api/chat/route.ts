import Anthropic from '@anthropic-ai/sdk'
import { exits } from '@/data/exits-data'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // 56件のケーススタディをコンテキストとして提供
    const context = exits
      .filter(e => e.source === 'manual' || !e.source) // 手動登録の高品質データのみ
      .map(e => {
        const value = e.status === 'exit' ? e.exitAmount : (e.valuation || 'N/A')
        const statusLabel = e.status === 'exit' ? 'EXIT' : e.status === 'growing' ? '成長中' : 'IPO予定'
        return `- ${e.company}（${statusLabel}）: ${e.coreValue} / ${value} / 日本競合: ${e.japanStatus === 'none' ? 'なし' : e.japanStatus === 'small' ? '小規模' : '多数'} / 参入難易度: ${e.entryDifficulty}`
      })
      .join('\n')

    const systemPrompt = `あなたはUS B2B SaaS市場の専門家です。以下のケーススタディデータを基に、日本市場への参入機会について議論してください。

【役割】
- 日本市場でのビジネス機会について、データに基づいた具体的なアドバイスを提供
- 各企業のビジネスモデルを日本市場に適用した場合の可能性を分析
- 競合状況、参入障壁、タイミングなどを考慮した実践的な示唆を提供

【ケーススタディデータ（56件）】
${context}

【注意事項】
- 日本語で回答してください
- 具体的な企業名やデータを引用しながら回答してください
- 「～かもしれません」より「～です」と断定的に答えてください
- 質問に対して端的に答え、必要に応じて詳細を追加してください`

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // ストリーミングレスポンスを返す
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
