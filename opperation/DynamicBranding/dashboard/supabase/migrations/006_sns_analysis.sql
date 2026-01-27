-- SNS投稿のセンチメント・CEP分析用カラム追加
-- 2026-01-17

-- センチメントカラム追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS sentiment TEXT
  CHECK (sentiment IN ('positive', 'neutral', 'negative'));

-- CEP外部キー追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS cep_id INTEGER REFERENCES ceps(id);

-- 分析実行日時
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- インデックス追加（フィルター高速化）
CREATE INDEX IF NOT EXISTS idx_sns_posts_sentiment ON sns_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_sns_posts_cep ON sns_posts(cep_id);
CREATE INDEX IF NOT EXISTS idx_sns_posts_analyzed ON sns_posts(analyzed_at);
