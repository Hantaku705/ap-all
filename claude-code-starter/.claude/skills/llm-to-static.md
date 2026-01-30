# LLM事前生成→静的ファイル化パターン

動的LLM API呼び出しを静的JSONファイルに変換し、同時にLLMでデータの解像度・粒度を向上させる。

---

## いつ使うか

- 動的LLM API呼び出しがボトルネックになっている
- レスポンス時間を改善したい（100ms以上 → 20ms以下）
- データの更新頻度が低い（日次〜週次で十分）

---

## 3ステップ

### Step 1: 現状分析

1. 動的LLM呼び出しのAPIを特定
2. 現在の出力形式・型定義を確認
3. レスポンス時間を計測

```bash
# レスポンス時間計測
curl -w "Time: %{time_total}s\n" -s -o /dev/null "https://example.com/api/endpoint"
```

### Step 2: LLMでデータ充実化

現在のデータをベースに**解像度・粒度を上げて**静的JSONファイルを作成。

**充実化の例**:

| Before | After |
|--------|-------|
| `customerProfile: string` | `personas: Persona[]` |
| 3項目のシンプルなオブジェクト | 10項目のリッチなオブジェクト |
| 抽象的な説明 | 具体的なペルソナ・引用文 |

```json
// Before: シンプル
{
  "customerProfile": "企業の研究開発に注目する層"
}

// After: 解像度UP
{
  "customerProfile": "企業の研究開発に注目する層",
  "personas": [
    {
      "personaName": "長期株式投資家",
      "ageRange": "40-50代",
      "interests": ["株価動向", "配当利回り"],
      "representativeQuote": "味の素が2年ぶり最高益..."
    }
  ]
}
```

**保存先**: `src/data/[feature]/[id].json`

### Step 3: API簡素化

動的生成コードを削除し、静的ファイルを返すだけに変更。

```typescript
// Before: 350行の動的生成
const openai = getOpenAIClient();
const insights = await generateLevelInsight(openai, levelData);
return NextResponse.json({ insights });

// After: 30行の静的返却
import data from "@/data/feature/data.json";

export async function GET(request, { params }) {
  const { id } = await params;
  if (id === "1") {
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

---

## 効果

| 指標 | Before | After |
|------|--------|-------|
| レスポンス時間 | 100-200ms | <20ms |
| APIコード行数 | 350行 | 30行 |
| LLM API呼び出し | 毎リクエスト | 0回 |
| データ解像度 | 低 | 高 |

---

## チェックリスト

- [ ] 動的LLM APIを特定した
- [ ] 現在の出力形式を確認した
- [ ] LLMでデータを充実化した（解像度UP）
- [ ] 静的JSONファイルを`src/data/`に保存した
- [ ] APIルートを簡素化した
- [ ] Cache-Controlヘッダを追加した
- [ ] ビルドが通ることを確認した
- [ ] 本番にデプロイして動作確認した

---

## 適用例

### DynamicBranding LoyaltySummary

- **Before**: `/api/corporate/[corpId]/loyalty-summary` がOpenAI APIを呼び出し
- **After**: `src/data/corporate-loyalty/corp-1-summary.json` を返すだけ
- **充実化**: `customerProfile` → `personas[]` 追加
- **効果**: 330ms → 118ms（64%改善）
