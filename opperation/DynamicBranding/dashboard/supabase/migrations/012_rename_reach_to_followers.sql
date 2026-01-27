-- ============================================
-- reach → followers リネーム
-- 2026-01-19
-- ============================================

-- カラムリネーム
ALTER TABLE sns_posts RENAME COLUMN reach TO followers;

-- インデックス削除→再作成（名前変更のため）
DROP INDEX IF EXISTS idx_sns_posts_reach;
CREATE INDEX IF NOT EXISTS idx_sns_posts_followers ON sns_posts(followers DESC);
