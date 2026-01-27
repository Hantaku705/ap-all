-- CEP分析用テーブル
-- 実行方法: Supabase SQL Editor で実行

-- ============================================
-- 1. ceps（CEPマスタ）
-- ============================================
CREATE TABLE IF NOT EXISTS ceps (
  id SERIAL PRIMARY KEY,
  cep_name TEXT NOT NULL,
  description TEXT,
  representative_goal TEXT,
  representative_attribute TEXT,
  context_summary TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cep_name)
);

CREATE INDEX IF NOT EXISTS idx_ceps_name ON ceps(cep_name);
CREATE INDEX IF NOT EXISTS idx_ceps_category ON ceps(category);

-- ============================================
-- 2. brand_ceps（ブランド別CEPスコア）
-- ============================================
CREATE TABLE IF NOT EXISTS brand_ceps (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  cep_id INTEGER REFERENCES ceps(id) ON DELETE CASCADE,
  reach_score NUMERIC(6,4) CHECK (reach_score >= 0 AND reach_score <= 1),
  frequency_score NUMERIC(6,2) CHECK (frequency_score >= 0),
  habit_strength NUMERIC(4,2) CHECK (habit_strength >= 0 AND habit_strength <= 10),
  wtp NUMERIC(10,2),
  potential_score NUMERIC(6,3),
  strength_alignment NUMERIC(3,1) CHECK (strength_alignment >= -2 AND strength_alignment <= 2),
  quadrant TEXT CHECK (quadrant IN ('コア強化', '機会獲得', '育成検討', '低優先')),
  mention_count INTEGER DEFAULT 0,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, cep_id, analysis_date)
);

CREATE INDEX IF NOT EXISTS idx_brand_ceps_brand ON brand_ceps(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_ceps_cep ON brand_ceps(cep_id);
CREATE INDEX IF NOT EXISTS idx_brand_ceps_quadrant ON brand_ceps(quadrant);
CREATE INDEX IF NOT EXISTS idx_brand_ceps_potential ON brand_ceps(potential_score DESC);

-- ============================================
-- 3. cep_contexts（CEP詳細文脈）
-- ============================================
CREATE TABLE IF NOT EXISTS cep_contexts (
  id SERIAL PRIMARY KEY,
  cep_id INTEGER REFERENCES ceps(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  sample_text TEXT,
  why_factor TEXT,
  when_factor TEXT,
  where_factor TEXT,
  while_factor TEXT,
  with_what TEXT,
  with_whom TEXT,
  how_feeling TEXT,
  source_url TEXT,
  source_type TEXT,
  published_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cep_contexts_cep ON cep_contexts(cep_id);
CREATE INDEX IF NOT EXISTS idx_cep_contexts_brand ON cep_contexts(brand_id);

-- ============================================
-- RLS（Row Level Security）設定
-- ============================================
ALTER TABLE ceps ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_ceps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cep_contexts ENABLE ROW LEVEL SECURITY;

-- anon 読み取り許可
DROP POLICY IF EXISTS "Allow anonymous read" ON ceps;
CREATE POLICY "Allow anonymous read" ON ceps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON brand_ceps;
CREATE POLICY "Allow anonymous read" ON brand_ceps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON cep_contexts;
CREATE POLICY "Allow anonymous read" ON cep_contexts FOR SELECT USING (true);

-- service_role フルアクセス（データ投入用）
DROP POLICY IF EXISTS "Service role full access" ON ceps;
CREATE POLICY "Service role full access" ON ceps FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON brand_ceps;
CREATE POLICY "Service role full access" ON brand_ceps FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON cep_contexts;
CREATE POLICY "Service role full access" ON cep_contexts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ビュー: ブランド別CEPサマリー
-- ============================================
CREATE OR REPLACE VIEW brand_cep_summary AS
SELECT
  b.name AS brand_name,
  b.color AS brand_color,
  c.cep_name,
  c.category AS cep_category,
  bc.reach_score,
  bc.frequency_score,
  bc.habit_strength,
  bc.potential_score,
  bc.strength_alignment,
  bc.quadrant,
  bc.mention_count,
  bc.analysis_date
FROM brand_ceps bc
JOIN brands b ON bc.brand_id = b.id
JOIN ceps c ON bc.cep_id = c.id
ORDER BY bc.potential_score DESC;

-- ============================================
-- ビュー: 4象限ポートフォリオ
-- ============================================
CREATE OR REPLACE VIEW cep_portfolio AS
SELECT
  b.name AS brand_name,
  b.color AS brand_color,
  c.cep_name,
  bc.potential_score,
  bc.strength_alignment,
  bc.quadrant,
  bc.analysis_date
FROM brand_ceps bc
JOIN brands b ON bc.brand_id = b.id
JOIN ceps c ON bc.cep_id = c.id
WHERE bc.quadrant IS NOT NULL
ORDER BY b.name, bc.potential_score DESC;
