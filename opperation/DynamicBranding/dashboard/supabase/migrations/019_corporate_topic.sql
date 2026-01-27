-- ============================================
-- 019: コーポレートトピック分類追加
-- ============================================
-- コーポレートUGC（is_corporate = true）をさらに細分化

-- sns_postsにカラム追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS corporate_topic TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_sns_posts_corporate_topic ON sns_posts(corporate_topic);

-- コメント追加
COMMENT ON COLUMN sns_posts.corporate_topic IS 'コーポレート投稿のトピック分類: stock_ir, csr_sustainability, employment, company_news, rnd, management, other';
