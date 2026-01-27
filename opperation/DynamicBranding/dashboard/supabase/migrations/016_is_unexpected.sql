-- 口コミ「王道/意外」判定用カラム追加
-- 実行方法: Supabase SQL Editor で実行

-- ============================================
-- 1. is_unexpected カラム追加
-- ============================================
ALTER TABLE sns_posts
ADD COLUMN IF NOT EXISTS is_unexpected BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN sns_posts.is_unexpected IS '意外性フラグ: TRUE=意外な使い方, FALSE=王道の使い方, NULL=未判定';

-- ============================================
-- 2. インデックス作成
-- ============================================
-- 単体インデックス（意外性フィルター用）
CREATE INDEX IF NOT EXISTS idx_sns_posts_is_unexpected
  ON sns_posts(is_unexpected)
  WHERE is_unexpected IS NOT NULL;

-- 複合インデックス（意外性 + センチメント フィルター用）
CREATE INDEX IF NOT EXISTS idx_sns_posts_unexpected_sentiment
  ON sns_posts(is_unexpected, sentiment)
  WHERE is_unexpected IS NOT NULL;

-- 複合インデックス（意外性 + エンゲージメント ソート用）
CREATE INDEX IF NOT EXISTS idx_sns_posts_unexpected_engagement
  ON sns_posts(is_unexpected, engagement_total DESC)
  WHERE is_unexpected IS NOT NULL;
