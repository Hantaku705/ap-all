-- ============================================
-- 013: ペルソナ分析キャッシュ
-- ============================================

-- ペルソナキャッシュテーブル
-- LLMで生成したペルソナデータを24時間キャッシュ
CREATE TABLE IF NOT EXISTS brand_persona_cache (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,

  -- 生成結果（JSON）
  personas JSONB NOT NULL,

  -- クラスター設定（軸定義など）
  cluster_config JSONB,

  -- メタ情報
  post_count INTEGER NOT NULL DEFAULT 0,      -- 分析対象投稿数
  persona_count INTEGER NOT NULL DEFAULT 0,   -- 生成ペルソナ数

  -- 生成情報
  llm_provider TEXT,           -- 'openai', 'gemini', 'claude'
  llm_model TEXT,              -- 'gpt-4o-mini', etc.
  generation_time_ms INTEGER,  -- 生成時間（ms）

  -- タイムスタンプ
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id)  -- 1ブランド1レコード（最新のみ保持）
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_persona_cache_brand ON brand_persona_cache(brand_id);
CREATE INDEX IF NOT EXISTS idx_persona_cache_expires ON brand_persona_cache(expires_at);

-- RLS設定
ALTER TABLE brand_persona_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read persona_cache" ON brand_persona_cache;
CREATE POLICY "Allow anonymous read persona_cache" ON brand_persona_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access persona_cache" ON brand_persona_cache;
CREATE POLICY "Service role full access persona_cache" ON brand_persona_cache FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- personas JSONBの構造:
-- [
--   {
--     "id": "p_1",
--     "name": "忙しいワーママ",
--     "description": "仕事と育児を両立する30代女性。時短でも...",
--     "brand": "ほんだし",
--     "position": {
--       "x": -0.5,    -- 料理スキル（-2:初心者 ～ +2:上級者）
--       "y": 1.2      -- こだわり度（-2:手抜き志向 ～ +2:本格志向）
--     },
--     "attributes": {
--       "life_stage": "子育て世帯",
--       "cooking_skill": "初級〜中級",
--       "primary_motivation": "時短・効率化",
--       "primary_occasion": "平日夕食",
--       "primary_emotion": "焦り"
--     },
--     "behavior": {
--       "cooking_for": ["家族", "子ども"],
--       "peak_occasions": ["平日夕食", "急ぎの食事"],
--       "keywords": ["時短", "簡単", "子ども向け"]
--     },
--     "metrics": {
--       "post_count": 245,
--       "avg_engagement": 1250,
--       "share_percentage": 18.5
--     },
--     "sample_posts": [
--       "ほんだし入れたら一発で味決まった！",
--       "子どもが野菜食べてくれた..."
--     ]
--   }
-- ]
-- ============================================
-- cluster_config JSONBの構造:
-- {
--   "x_axis": {
--     "label": "料理スキル",
--     "min": -2,
--     "max": 2,
--     "labels": {
--       "-2": "初心者",
--       "2": "上級者"
--     }
--   },
--   "y_axis": {
--     "label": "こだわり度",
--     "min": -2,
--     "max": 2,
--     "labels": {
--       "-2": "手抜き志向",
--       "2": "本格志向"
--     }
--   }
-- }
-- ============================================
