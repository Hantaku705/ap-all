-- 023_loyalty_growth_cache.sql
-- ロイヤリティ成長戦略のLLM生成キャッシュ

CREATE TABLE IF NOT EXISTS loyalty_growth_cache (
  id SERIAL PRIMARY KEY,
  corp_id INTEGER NOT NULL,
  data JSONB NOT NULL,
  llm_model TEXT NOT NULL,
  input_hash TEXT NOT NULL,  -- 入力データのハッシュ（データ変化検出用）
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  UNIQUE(corp_id)
);

-- 有効期限インデックス
CREATE INDEX IF NOT EXISTS idx_loyalty_growth_cache_expires
  ON loyalty_growth_cache(expires_at);

-- コーポレートIDインデックス
CREATE INDEX IF NOT EXISTS idx_loyalty_growth_cache_corp_id
  ON loyalty_growth_cache(corp_id);

-- コメント
COMMENT ON TABLE loyalty_growth_cache IS 'ロイヤリティ成長戦略のLLM生成結果キャッシュ（24時間TTL）';
COMMENT ON COLUMN loyalty_growth_cache.input_hash IS 'sns_postsの変化を検出するためのハッシュ値';
