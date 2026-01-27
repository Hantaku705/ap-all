-- SNS分析用テーブル
-- 実行方法: Supabase SQL Editor で実行

-- ============================================
-- 1. sns_mentions（ブランド言及数）
-- ============================================
CREATE TABLE IF NOT EXISTS sns_mentions (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  mention_count INTEGER NOT NULL CHECK (mention_count >= 0),
  share_percentage NUMERIC(5,2) CHECK (share_percentage >= 0 AND share_percentage <= 100),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, analysis_date)
);

CREATE INDEX IF NOT EXISTS idx_sns_mentions_brand ON sns_mentions(brand_id);
CREATE INDEX IF NOT EXISTS idx_sns_mentions_date ON sns_mentions(analysis_date);

-- ============================================
-- 2. sns_cooccurrences（共起マトリクス）
-- ============================================
CREATE TABLE IF NOT EXISTS sns_cooccurrences (
  id SERIAL PRIMARY KEY,
  brand_a_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  brand_b_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  cooccurrence_count INTEGER NOT NULL CHECK (cooccurrence_count >= 0),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_a_id, brand_b_id, analysis_date)
);

CREATE INDEX IF NOT EXISTS idx_sns_cooccurrences_brands ON sns_cooccurrences(brand_a_id, brand_b_id);

-- ============================================
-- 3. sns_sentiments（センチメント分析）
-- ============================================
CREATE TABLE IF NOT EXISTS sns_sentiments (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  positive_count INTEGER NOT NULL DEFAULT 0,
  neutral_count INTEGER NOT NULL DEFAULT 0,
  negative_count INTEGER NOT NULL DEFAULT 0,
  negative_rate NUMERIC(5,2) CHECK (negative_rate >= 0 AND negative_rate <= 100),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, analysis_date)
);

CREATE INDEX IF NOT EXISTS idx_sns_sentiments_brand ON sns_sentiments(brand_id);

-- ============================================
-- RLS（Row Level Security）設定
-- ============================================
ALTER TABLE sns_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_cooccurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_sentiments ENABLE ROW LEVEL SECURITY;

-- anon 読み取り許可
DROP POLICY IF EXISTS "Allow anonymous read" ON sns_mentions;
CREATE POLICY "Allow anonymous read" ON sns_mentions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON sns_cooccurrences;
CREATE POLICY "Allow anonymous read" ON sns_cooccurrences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON sns_sentiments;
CREATE POLICY "Allow anonymous read" ON sns_sentiments FOR SELECT USING (true);

-- service_role フルアクセス（データ投入用）
DROP POLICY IF EXISTS "Service role full access" ON sns_mentions;
CREATE POLICY "Service role full access" ON sns_mentions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON sns_cooccurrences;
CREATE POLICY "Service role full access" ON sns_cooccurrences FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON sns_sentiments;
CREATE POLICY "Service role full access" ON sns_sentiments FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
