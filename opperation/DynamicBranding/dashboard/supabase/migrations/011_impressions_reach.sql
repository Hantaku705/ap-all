-- ============================================
-- インプレッション・リーチカラム追加
-- 2026-01-19
-- ============================================

-- インプレッション・リーチカラム追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;

-- インデックス追加（ソート高速化）
CREATE INDEX IF NOT EXISTS idx_sns_posts_impressions ON sns_posts(impressions DESC);
CREATE INDEX IF NOT EXISTS idx_sns_posts_reach ON sns_posts(reach DESC);

-- 複合インデックス（ブランド×ENG指標）
CREATE INDEX IF NOT EXISTS idx_sns_posts_brand_eng ON sns_posts(brand_mentions, engagement_total DESC)
  WHERE brand_mentions IS NOT NULL;
