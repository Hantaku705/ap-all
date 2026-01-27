-- ============================================
-- SNS Posts & Weekly Trends Schema
-- ============================================

-- ============================================
-- 1. sns_posts（SNS生データ）
-- ============================================
CREATE TABLE IF NOT EXISTS sns_posts (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  published TIMESTAMPTZ NOT NULL,
  title TEXT,
  content TEXT,
  lang TEXT DEFAULT 'ja',
  source_type TEXT,
  author_name TEXT,
  brand_mentions TEXT,  -- カンマ区切り: "味の素,コンソメ"
  brand_count INTEGER DEFAULT 0,
  is_multi_brand BOOLEAN DEFAULT FALSE,
  content_length INTEGER DEFAULT 0,
  has_negative_kw BOOLEAN DEFAULT FALSE,
  source_category TEXT CHECK (source_category IN ('twitter', 'news', 'blog', 'messageboard', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sns_posts_published ON sns_posts(published);
CREATE INDEX IF NOT EXISTS idx_sns_posts_source ON sns_posts(source_category);

-- ============================================
-- 2. sns_weekly_trends（週次SNS言及数）
-- ============================================
CREATE TABLE IF NOT EXISTS sns_weekly_trends (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  mention_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_sns_weekly_week ON sns_weekly_trends(week_start);
CREATE INDEX IF NOT EXISTS idx_sns_weekly_brand ON sns_weekly_trends(brand_id);

-- ============================================
-- RLS設定
-- ============================================
ALTER TABLE sns_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_weekly_trends ENABLE ROW LEVEL SECURITY;

-- sns_posts
DROP POLICY IF EXISTS "Allow anonymous read" ON sns_posts;
CREATE POLICY "Allow anonymous read" ON sns_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON sns_posts;
CREATE POLICY "Service role full access" ON sns_posts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- sns_weekly_trends
DROP POLICY IF EXISTS "Allow anonymous read" ON sns_weekly_trends;
CREATE POLICY "Allow anonymous read" ON sns_weekly_trends FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON sns_weekly_trends;
CREATE POLICY "Service role full access" ON sns_weekly_trends FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
