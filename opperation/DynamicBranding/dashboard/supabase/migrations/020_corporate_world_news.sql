-- 世の中分析（World Analysis）用スキーマ
-- 第三者からのニュース・レポート・SNS言及を収集・分析

-- ============================================
-- 世の中ニューステーブル
-- ============================================

CREATE TABLE IF NOT EXISTS corporate_world_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corp_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'report', 'sns', 'blog', 'manual')),
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- LLM分析結果
  category TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score NUMERIC(3,2),
  relevance_score NUMERIC(3,2),
  summary TEXT,
  keywords TEXT[],
  is_important BOOLEAN DEFAULT FALSE,

  -- メタデータ
  author TEXT,
  image_url TEXT,
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 重複URLチェック用のユニーク制約（corp_id + urlの組み合わせ）
CREATE UNIQUE INDEX IF NOT EXISTS idx_world_news_unique_url
  ON corporate_world_news(corp_id, url);

-- ============================================
-- カテゴリマスタ
-- ============================================

CREATE TABLE IF NOT EXISTS corporate_news_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  priority INTEGER DEFAULT 0
);

-- デフォルトカテゴリ
INSERT INTO corporate_news_categories (name, label, color, priority) VALUES
  ('ir_finance', 'IR・財務', '#3B82F6', 1),
  ('product_service', '製品・サービス', '#10B981', 2),
  ('esg_sustainability', 'ESG・サステナ', '#8B5CF6', 3),
  ('management', '経営・人事', '#F59E0B', 4),
  ('industry', '業界動向', '#EC4899', 5),
  ('reputation', '評判・評価', '#06B6D4', 6),
  ('other', 'その他', '#6B7280', 99)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- フェッチログ
-- ============================================

CREATE TABLE IF NOT EXISTS corporate_news_fetch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corp_id INTEGER NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  articles_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('success', 'error', 'partial')),
  error_message TEXT,
  duration_ms INTEGER
);

-- ============================================
-- インデックス
-- ============================================

CREATE INDEX IF NOT EXISTS idx_world_news_corp_published
  ON corporate_world_news(corp_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_news_category
  ON corporate_world_news(category);
CREATE INDEX IF NOT EXISTS idx_world_news_important
  ON corporate_world_news(is_important) WHERE is_important = TRUE;
CREATE INDEX IF NOT EXISTS idx_world_news_sentiment
  ON corporate_world_news(sentiment);
CREATE INDEX IF NOT EXISTS idx_world_news_source_type
  ON corporate_world_news(source_type);
CREATE INDEX IF NOT EXISTS idx_fetch_log_corp
  ON corporate_news_fetch_log(corp_id, fetched_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE corporate_world_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_news_fetch_log ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員可
DROP POLICY IF EXISTS "Allow read for all world_news" ON corporate_world_news;
CREATE POLICY "Allow read for all world_news" ON corporate_world_news
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for all categories" ON corporate_news_categories;
CREATE POLICY "Allow read for all categories" ON corporate_news_categories
  FOR SELECT USING (true);

-- 書き込みはサービスロールのみ
DROP POLICY IF EXISTS "Service role full access news" ON corporate_world_news;
CREATE POLICY "Service role full access news" ON corporate_world_news
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access log" ON corporate_news_fetch_log;
CREATE POLICY "Service role full access log" ON corporate_news_fetch_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access categories" ON corporate_news_categories;
CREATE POLICY "Service role full access categories" ON corporate_news_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
