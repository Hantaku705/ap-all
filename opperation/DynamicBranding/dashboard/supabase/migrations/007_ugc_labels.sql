-- ============================================
-- UGCラベリング用カラム追加
-- 2026-01-17
-- ============================================

-- ============================================
-- 1. ENUM型の定義
-- ============================================

-- 時間帯
DO $$ BEGIN
  CREATE TYPE time_slot_type AS ENUM ('morning', 'afternoon', 'evening', 'night');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 意図・目的
DO $$ BEGIN
  CREATE TYPE intent_type AS ENUM (
    'purchase_consider',  -- 購入検討
    'usage_report',       -- 使用報告
    'recipe_share',       -- レシピ共有
    'question',           -- 質問
    'complaint',          -- 不満
    'other'               -- その他
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ライフステージ
DO $$ BEGIN
  CREATE TYPE life_stage_type AS ENUM (
    'single',        -- 一人暮らし
    'couple',        -- 二人暮らし
    'child_raising', -- 子育て中
    'empty_nest',    -- 子供独立後
    'senior',        -- シニア
    'unknown'        -- 不明
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 料理スキル
DO $$ BEGIN
  CREATE TYPE cooking_skill_type AS ENUM (
    'beginner',     -- 初心者
    'intermediate', -- 中級
    'advanced',     -- 上級
    'unknown'       -- 不明
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 感情
DO $$ BEGIN
  CREATE TYPE emotion_type AS ENUM (
    'anxiety',      -- 不安
    'relief',       -- 安心
    'satisfaction', -- 満足
    'guilt',        -- 罪悪感
    'excitement',   -- ワクワク
    'frustration',  -- イライラ
    'neutral'       -- 特になし
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 同伴者
DO $$ BEGIN
  CREATE TYPE with_whom_type AS ENUM (
    'solo',    -- 一人
    'family',  -- 家族
    'kids',    -- 子ども
    'guest',   -- 来客
    'unknown'  -- 不明
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. sns_postsテーブルへのカラム追加
-- ============================================

-- 派生カラム（日時から自動計算）
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS time_slot time_slot_type;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS day_type TEXT CHECK (day_type IN ('weekday', 'weekend'));

-- AI分類カラム
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS intent intent_type;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS life_stage life_stage_type;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS cooking_skill cooking_skill_type;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS emotion emotion_type;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS with_whom with_whom_type;

-- 詳細テキストカラム
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS when_detail TEXT;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS why_motivation TEXT;
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS paired_keywords TEXT[];

-- ============================================
-- 3. インデックス追加（フィルター高速化）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sns_posts_time_slot ON sns_posts(time_slot);
CREATE INDEX IF NOT EXISTS idx_sns_posts_day_type ON sns_posts(day_type);
CREATE INDEX IF NOT EXISTS idx_sns_posts_intent ON sns_posts(intent);
CREATE INDEX IF NOT EXISTS idx_sns_posts_life_stage ON sns_posts(life_stage);
CREATE INDEX IF NOT EXISTS idx_sns_posts_emotion ON sns_posts(emotion);

-- ============================================
-- 4. 派生カラム一括計算（time_slot, day_type）
-- ============================================

-- time_slot: 時間帯を計算
UPDATE sns_posts
SET time_slot = CASE
  WHEN EXTRACT(HOUR FROM published) < 6 THEN 'night'::time_slot_type
  WHEN EXTRACT(HOUR FROM published) < 12 THEN 'morning'::time_slot_type
  WHEN EXTRACT(HOUR FROM published) < 18 THEN 'afternoon'::time_slot_type
  ELSE 'evening'::time_slot_type
END
WHERE time_slot IS NULL AND published IS NOT NULL;

-- day_type: 曜日を計算（0=日曜, 6=土曜）
UPDATE sns_posts
SET day_type = CASE
  WHEN EXTRACT(DOW FROM published) IN (0, 6) THEN 'weekend'
  ELSE 'weekday'
END
WHERE day_type IS NULL AND published IS NOT NULL;
