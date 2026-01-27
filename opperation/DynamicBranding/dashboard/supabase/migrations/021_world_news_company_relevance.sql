-- 世の中分析：自社/競合/業界ラベル追加
-- 第三者ニュースを「自社（味の素）」「競合」「業界全般」で分類

-- company_relevance_typeカラム追加
ALTER TABLE corporate_world_news
ADD COLUMN IF NOT EXISTS company_relevance_type TEXT
CHECK (company_relevance_type IN ('self', 'competitor', 'industry'));

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_world_news_company_relevance
ON corporate_world_news(company_relevance_type);
