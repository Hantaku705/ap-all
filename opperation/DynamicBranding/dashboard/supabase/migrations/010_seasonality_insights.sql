-- 季節性インサイトキャッシュテーブル
-- LLM生成した季節性分析インサイトをキャッシュ

CREATE TABLE IF NOT EXISTS seasonality_insights_cache (
  id SERIAL PRIMARY KEY,
  brand_name TEXT,                         -- NULLなら全体インサイト、ブランド名なら個別インサイト
  insights_data JSONB NOT NULL,            -- LLM生成結果（summary, brandPatterns, crossBrandInsights, strategicActions）
  llm_provider TEXT DEFAULT 'openai',      -- 使用LLMプロバイダー
  llm_model TEXT DEFAULT 'gpt-4o-mini',    -- 使用モデル
  generation_time_ms INTEGER,              -- 生成にかかった時間（ms）
  generated_at TIMESTAMPTZ DEFAULT NOW(),  -- 生成日時
  expires_at TIMESTAMPTZ NOT NULL,         -- 有効期限（24時間TTL）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- brand_nameにユニーク制約（NULLも含む）
CREATE UNIQUE INDEX IF NOT EXISTS idx_seasonality_insights_cache_brand
  ON seasonality_insights_cache (COALESCE(brand_name, '__ALL__'));

-- 有効期限でのクエリ用インデックス
CREATE INDEX IF NOT EXISTS idx_seasonality_insights_cache_expires
  ON seasonality_insights_cache (expires_at);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_seasonality_insights_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seasonality_insights_cache_updated_at
  ON seasonality_insights_cache;

CREATE TRIGGER trigger_update_seasonality_insights_cache_updated_at
  BEFORE UPDATE ON seasonality_insights_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_seasonality_insights_cache_updated_at();

-- RLSポリシー
ALTER TABLE seasonality_insights_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON seasonality_insights_cache;
CREATE POLICY "Allow public read" ON seasonality_insights_cache
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role all" ON seasonality_insights_cache;
CREATE POLICY "Allow service role all" ON seasonality_insights_cache
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- anon keyでの読み書きを許可（API Route用）
DROP POLICY IF EXISTS "Allow anon insert" ON seasonality_insights_cache;
CREATE POLICY "Allow anon insert" ON seasonality_insights_cache
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update" ON seasonality_insights_cache;
CREATE POLICY "Allow anon update" ON seasonality_insights_cache
  FOR UPDATE USING (true);
