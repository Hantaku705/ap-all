-- ============================================
-- 018: コーポレートタグ追加
-- ============================================
-- SNS投稿が商品関連か企業全体関連かを識別するためのカラム追加

-- sns_postsにカラム追加
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT NULL;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS corporate_reason TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_sns_posts_is_corporate ON sns_posts(is_corporate);

-- コメント追加
COMMENT ON COLUMN sns_posts.is_corporate IS '企業情報に関する投稿（商品言及なし）の場合true。例: 株価、CSR、採用、決算など';
COMMENT ON COLUMN sns_posts.corporate_reason IS 'コーポレート判定の理由（LLM分析結果）';
