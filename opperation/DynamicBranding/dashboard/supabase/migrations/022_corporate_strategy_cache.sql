-- Corporate Strategy Cache Table
-- Stores LLM-generated strategy recommendations with 24-hour TTL

CREATE TABLE IF NOT EXISTS corporate_strategy_cache (
  id SERIAL PRIMARY KEY,
  corporate_id INTEGER NOT NULL REFERENCES corporate_brands(id) ON DELETE CASCADE,
  strategy_data JSONB NOT NULL,
  input_data JSONB NOT NULL,
  model TEXT NOT NULL,
  generation_time_ms INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Ensure only one cache entry per corporate
  CONSTRAINT unique_corporate_strategy UNIQUE (corporate_id)
);

-- Index for efficient lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_corporate_strategy_cache_corporate_id
  ON corporate_strategy_cache(corporate_id);

CREATE INDEX IF NOT EXISTS idx_corporate_strategy_cache_expires_at
  ON corporate_strategy_cache(expires_at);

-- RLS policies
ALTER TABLE corporate_strategy_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
DROP POLICY IF EXISTS "Allow read access to corporate_strategy_cache" ON corporate_strategy_cache;
CREATE POLICY "Allow read access to corporate_strategy_cache"
  ON corporate_strategy_cache FOR SELECT
  USING (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Allow service role full access to corporate_strategy_cache" ON corporate_strategy_cache;
CREATE POLICY "Allow service role full access to corporate_strategy_cache"
  ON corporate_strategy_cache FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comment for documentation
COMMENT ON TABLE corporate_strategy_cache IS 'Cache for LLM-generated corporate strategy recommendations (24-hour TTL)';
COMMENT ON COLUMN corporate_strategy_cache.strategy_data IS 'JSON containing strengths, challenges, opportunities, recommendations, actionPlan';
COMMENT ON COLUMN corporate_strategy_cache.input_data IS 'JSON containing UGC, stock correlation, loyalty, world news input data';
COMMENT ON COLUMN corporate_strategy_cache.generation_time_ms IS 'Time taken to generate strategy in milliseconds';
