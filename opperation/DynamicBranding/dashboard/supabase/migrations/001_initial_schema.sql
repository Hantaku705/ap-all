-- ========================================
-- DynamicBranding Dashboard - 初期スキーマ
-- ========================================

-- ブランドマスタ（8件）
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期データ
INSERT INTO brands (name, name_en, color) VALUES
  ('ほんだし', 'hondashi', '#E53935'),
  ('クックドゥ', 'cookdo', '#FB8C00'),
  ('味の素', 'ajinomoto', '#D81B60'),
  ('丸鶏がらスープ', 'marutori', '#7CB342'),
  ('香味ペースト', 'koumi', '#00897B'),
  ('コンソメ', 'consomme', '#5E35B1'),
  ('ピュアセレクト', 'pure_select', '#039BE5'),
  ('アジシオ', 'ajishio', '#F4511E')
ON CONFLICT (name) DO NOTHING;

-- 週次トレンドデータ（262週 × 8ブランド = 2,096件）
CREATE TABLE IF NOT EXISTS weekly_trends (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, brand_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_trends_week ON weekly_trends(week_start);
CREATE INDEX IF NOT EXISTS idx_trends_brand ON weekly_trends(brand_id);

-- 相関データ（8 × 8 = 64件）
CREATE TABLE IF NOT EXISTS correlations (
  id SERIAL PRIMARY KEY,
  brand_a_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  brand_b_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  coefficient NUMERIC(4,2) CHECK (coefficient >= -1 AND coefficient <= 1),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_a_id, brand_b_id, analysis_date)
);

-- 季節性データ（8ブランド × 12月 = 96件）
CREATE TABLE IF NOT EXISTS seasonality (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  avg_score NUMERIC(5,2),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, month, analysis_date)
);

-- インサイトデータ（5-10件）
CREATE TABLE IF NOT EXISTS insights (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('correlation', 'seasonality', 'strategy', 'risk')),
  confidence TEXT CHECK (confidence IN ('A', 'B', 'C')),
  confidence_reason TEXT,
  related_brands TEXT[],
  action_items TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- RLS（Row Level Security）設定
-- 認証不要のため、全読み取り許可
-- ========================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonality ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- 全テーブルで anon ロールに SELECT 許可
DROP POLICY IF EXISTS "Allow anonymous read" ON brands;
CREATE POLICY "Allow anonymous read" ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON weekly_trends;
CREATE POLICY "Allow anonymous read" ON weekly_trends FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON correlations;
CREATE POLICY "Allow anonymous read" ON correlations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON seasonality;
CREATE POLICY "Allow anonymous read" ON seasonality FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON insights;
CREATE POLICY "Allow anonymous read" ON insights FOR SELECT USING (true);

-- service_role 用の全権限ポリシー（データ投入用）
DROP POLICY IF EXISTS "Service role full access" ON brands;
CREATE POLICY "Service role full access" ON brands FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON weekly_trends;
CREATE POLICY "Service role full access" ON weekly_trends FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON correlations;
CREATE POLICY "Service role full access" ON correlations FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON seasonality;
CREATE POLICY "Service role full access" ON seasonality FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON insights;
CREATE POLICY "Service role full access" ON insights FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
