# concept-learning HANDOFF

コンセプト学習Webappのセッション履歴。

## 現在の状態

| 項目 | 値 |
|------|-----|
| 本番URL | https://webapp-five-bay.vercel.app |
| 技術スタック | Next.js 16 + React 19 + TypeScript |
| 最終更新 | 2026-01-22 |

## セッション履歴

### 2026-01-19〜22 (Sessions 1-10, 37-41)
- YouTube動画（コンセプト学習）をGemini APIで分析
- コンセプト学習資料をMarkdownで作成（docs/concept/）
- marketing-onboarding Next.jsアプリを作成
- WebアプリをAP/webappに移動
- Vercelに本番デプロイ
- 用語統一「コンセプト」、評価項目14項目統合、webappシンプル化
- 事例15個に拡張、ネーミング案14項目評価で改善

## 未解決の問題

- `docs/concept-data.json` と `webapp/src/data/concept-data.json` は手動同期が必要（Turbopackがシンボリックリンク非対応）
