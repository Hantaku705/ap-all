-- SNS投稿ブランド影響度テーブル
-- 実行方法: Supabase SQL Editor で実行

-- ============================================
-- 1. ENUM型定義
-- ============================================
DO $$ BEGIN
  CREATE TYPE impact_level_type AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. post_brand_impacts（投稿別ブランド影響度）
-- ============================================
CREATE TABLE IF NOT EXISTS post_brand_impacts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES sns_posts(id) ON DELETE CASCADE,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  impact_level impact_level_type NOT NULL,
  confidence_score NUMERIC(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  analysis_reason TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, brand_id)
);

COMMENT ON TABLE post_brand_impacts IS 'SNS投稿における各ブランドの影響度（メイン/関連/サブ）';
COMMENT ON COLUMN post_brand_impacts.impact_level IS 'high=メイン言及, medium=関連言及, low=サブ言及';
COMMENT ON COLUMN post_brand_impacts.confidence_score IS 'LLM判定の確信度（0.0-1.0）';
COMMENT ON COLUMN post_brand_impacts.analysis_reason IS 'LLM判定理由（例: "レシピのメイン材料として使用"）';

-- ============================================
-- 3. インデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_brand_impacts_post ON post_brand_impacts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_brand_impacts_brand ON post_brand_impacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_post_brand_impacts_level ON post_brand_impacts(impact_level);
CREATE INDEX IF NOT EXISTS idx_post_brand_impacts_brand_level ON post_brand_impacts(brand_id, impact_level);

-- 複合インデックス（ブランド別highのみ取得用）
CREATE INDEX IF NOT EXISTS idx_post_brand_impacts_brand_high
  ON post_brand_impacts(brand_id)
  WHERE impact_level = 'high';

-- ============================================
-- 4. RLS（Row Level Security）設定
-- ============================================
ALTER TABLE post_brand_impacts ENABLE ROW LEVEL SECURITY;

-- anon 読み取り許可
DROP POLICY IF EXISTS "Allow anonymous read" ON post_brand_impacts;
CREATE POLICY "Allow anonymous read" ON post_brand_impacts
  FOR SELECT USING (true);

-- service_role フルアクセス（データ投入用）
DROP POLICY IF EXISTS "Service role full access" ON post_brand_impacts;
CREATE POLICY "Service role full access" ON post_brand_impacts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 5. ビュー: ブランド別影響度サマリー
-- ============================================
CREATE OR REPLACE VIEW brand_impact_summary AS
SELECT
  b.name AS brand_name,
  b.color AS brand_color,
  pbi.impact_level::TEXT AS impact_level,
  COUNT(*) AS post_count,
  AVG(pbi.confidence_score) AS avg_confidence
FROM post_brand_impacts pbi
JOIN brands b ON pbi.brand_id = b.id
GROUP BY b.id, b.name, b.color, pbi.impact_level
ORDER BY b.name,
  CASE pbi.impact_level
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END;
