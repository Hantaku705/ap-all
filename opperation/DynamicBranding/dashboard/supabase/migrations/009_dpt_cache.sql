-- ============================================
-- 009: DPT（Dynamic Positioning Table）キャッシュ
-- ============================================

-- DPTキャッシュテーブル
-- LLMで生成したDPTデータを24時間キャッシュ
CREATE TABLE IF NOT EXISTS brand_dpt_cache (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,

  -- 生成結果（JSON）
  dpt_data JSONB NOT NULL,

  -- メタ情報
  post_count INTEGER NOT NULL DEFAULT 0,      -- 分析対象投稿数
  use_case_count INTEGER NOT NULL DEFAULT 0,  -- 抽出Use Case数

  -- 生成情報
  llm_provider TEXT,           -- 'openai', 'gemini', 'claude'
  llm_model TEXT,              -- 'gpt-4o-mini', etc.
  generation_time_ms INTEGER,  -- 生成時間（ms）

  -- タイムスタンプ
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id)  -- 1ブランド1レコード（最新のみ保持）
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_dpt_cache_brand ON brand_dpt_cache(brand_id);
CREATE INDEX IF NOT EXISTS idx_dpt_cache_expires ON brand_dpt_cache(expires_at);

-- RLS設定
ALTER TABLE brand_dpt_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read dpt_cache" ON brand_dpt_cache;
CREATE POLICY "Allow anonymous read dpt_cache" ON brand_dpt_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access dpt_cache" ON brand_dpt_cache;
CREATE POLICY "Service role full access dpt_cache" ON brand_dpt_cache FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- dpt_data JSONBの構造例:
-- {
--   "useCases": [
--     {
--       "id": "uc_1",
--       "name": "平日夜の時短夕食",
--       "context": {
--         "why": "仕事帰りで疲れているが、家族に手作り感を出したい",
--         "when": "平日19時〜21時",
--         "where": "自宅キッチン",
--         "withWhom": "家族（子どもあり）"
--       },
--       "positioning": {
--         "competitors": ["冷凍食品", "レトルト食品"],
--         "pop": ["手軽さ", "時短調理", "失敗しない"],
--         "pod": ["本格的な味", "アレンジ自在", "罪悪感なし"]
--       },
--       "evidence": {
--         "postCount": 245,
--         "topKeywords": ["時短", "簡単", "子ども"],
--         "samplePosts": ["投稿例1", "投稿例2"]
--       }
--     }
--   ]
-- }
-- ============================================
