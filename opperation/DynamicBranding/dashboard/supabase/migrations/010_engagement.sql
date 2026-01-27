-- ============================================
-- エンゲージメントデータ追加
-- 2026-01-19
-- ============================================

-- エンゲージメントカラム追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS retweets_count INTEGER DEFAULT 0;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 合計エンゲージメント（計算カラム）
-- PostgreSQL 12+ の GENERATED ALWAYS AS STORED を使用
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS engagement_total INTEGER DEFAULT 0;

-- engagement_total を自動計算するトリガー
CREATE OR REPLACE FUNCTION update_engagement_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_total := COALESCE(NEW.likes_count, 0) + COALESCE(NEW.retweets_count, 0) + COALESCE(NEW.comments_count, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_engagement ON sns_posts;
CREATE TRIGGER trigger_update_engagement
  BEFORE INSERT OR UPDATE OF likes_count, retweets_count, comments_count
  ON sns_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_total();

-- 既存データのengagement_total を更新
UPDATE sns_posts
SET engagement_total = COALESCE(likes_count, 0) + COALESCE(retweets_count, 0) + COALESCE(comments_count, 0)
WHERE engagement_total IS NULL OR engagement_total = 0;

-- インデックス追加（ENGソート高速化）
CREATE INDEX IF NOT EXISTS idx_sns_posts_engagement ON sns_posts(engagement_total DESC);
CREATE INDEX IF NOT EXISTS idx_sns_posts_likes ON sns_posts(likes_count DESC);

-- 複合インデックス（ブランド×CEP×ENG）
CREATE INDEX IF NOT EXISTS idx_sns_posts_brand_cep_eng ON sns_posts(cep_id, engagement_total DESC)
  WHERE cep_id IS NOT NULL;
