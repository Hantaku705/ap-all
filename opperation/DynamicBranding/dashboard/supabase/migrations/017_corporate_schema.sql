-- ============================================
-- 017: コーポレートブランド分析スキーマ
-- ============================================

-- ============================================
-- 1. corporate_brands - コーポレートブランドマスタ
-- ============================================
CREATE TABLE IF NOT EXISTS corporate_brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,           -- '味の素株式会社'
  ticker_symbol TEXT,                  -- '2802.T' (Tokyo Stock Exchange)
  english_name TEXT,                   -- 'Ajinomoto Co., Inc.'
  founded_year INTEGER,                -- 1909
  headquarters TEXT,                   -- '東京都中央区'
  industry TEXT,                       -- '食品'
  logo_url TEXT,                       -- ロゴ画像URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期データ
INSERT INTO corporate_brands (name, ticker_symbol, english_name, founded_year, headquarters, industry)
VALUES ('味の素株式会社', '2802.T', 'Ajinomoto Co., Inc.', 1909, '東京都中央区', '食品')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. brand_hierarchy - 製品ブランド→コーポレート階層
-- ============================================
CREATE TABLE IF NOT EXISTS brand_hierarchy (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,
  product_brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  weight NUMERIC(4,3) DEFAULT 1.0,     -- 貢献度重み（0-1）
  category TEXT,                        -- 'seasoning', 'instant_food' 等
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corporate_brand_id, product_brand_id)
);

-- 既存8ブランドを味の素コーポレートに紐付け
INSERT INTO brand_hierarchy (corporate_brand_id, product_brand_id, category)
SELECT
  (SELECT id FROM corporate_brands WHERE name = '味の素株式会社'),
  b.id,
  CASE
    WHEN b.name IN ('味の素', 'ほんだし', 'アジシオ', '丸鶏がらスープ', 'コンソメ') THEN 'seasoning'
    WHEN b.name = 'クックドゥ' THEN 'instant_food'
    WHEN b.name = '香味ペースト' THEN 'seasoning'
    WHEN b.name = 'ピュアセレクト' THEN 'mayonnaise'
    ELSE 'other'
  END
FROM brands b
ON CONFLICT (corporate_brand_id, product_brand_id) DO NOTHING;

-- ============================================
-- 3. stock_prices - 株価履歴（5年分、日次）
-- ============================================
CREATE TABLE IF NOT EXISTS stock_prices (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_price NUMERIC(10,2),            -- 始値
  high_price NUMERIC(10,2),            -- 高値
  low_price NUMERIC(10,2),             -- 安値
  close_price NUMERIC(10,2),           -- 終値
  adj_close NUMERIC(10,2),             -- 調整済み終値
  volume BIGINT,                       -- 出来高
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corporate_brand_id, date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_stock_prices_date ON stock_prices(date);
CREATE INDEX IF NOT EXISTS idx_stock_prices_corp ON stock_prices(corporate_brand_id);

-- ============================================
-- 4. corporate_mvv - MVV/パーソナリティキャッシュ
-- ============================================
CREATE TABLE IF NOT EXISTS corporate_mvv (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,

  -- MVV (Mission/Vision/Value)
  mission TEXT,                        -- '社会的役割'
  vision TEXT,                         -- '将来像'
  purpose TEXT,                        -- '存在意義'
  values JSONB,                        -- ["value1", "value2", ...]

  -- パーソナリティ
  personality TEXT,                    -- キャッチーな表現 例: 'インテリのヘンタイ'
  personality_traits JSONB,            -- {intellect: 80, innovation: 90, warmth: 70, reliability: 85, boldness: 75}

  -- 詳細エビデンス
  evidence JSONB,                      -- {mission_evidence: [], vision_evidence: [], ...}

  -- 生成情報
  llm_provider TEXT,                   -- 'openai', 'claude' 等
  llm_model TEXT,                      -- 'gpt-4o' 等
  posts_analyzed INTEGER DEFAULT 0,    -- 分析対象投稿数

  -- タイムスタンプ
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(corporate_brand_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_corporate_mvv_corp ON corporate_mvv(corporate_brand_id);
CREATE INDEX IF NOT EXISTS idx_corporate_mvv_expires ON corporate_mvv(expires_at);

-- ============================================
-- 5. corporate_authority - Base of Authority（R&D、特許、発明）
-- ============================================
CREATE TABLE IF NOT EXISTS corporate_authority (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,

  category TEXT NOT NULL,              -- 'rd', 'patent', 'invention', 'award', 'history'
  title TEXT NOT NULL,                 -- 'アミノ酸研究のパイオニア'
  description TEXT,                    -- 詳細説明
  year INTEGER,                        -- 発明年、受賞年等
  source_url TEXT,                     -- エビデンスURL
  evidence_count INTEGER DEFAULT 0,    -- UGC言及数
  importance_score NUMERIC(3,2) DEFAULT 0.5,  -- 重要度（0-1）

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_authority_corp ON corporate_authority(corporate_brand_id);
CREATE INDEX IF NOT EXISTS idx_authority_category ON corporate_authority(category);

-- 初期データ（味の素の主要Authority）
INSERT INTO corporate_authority (corporate_brand_id, category, title, description, year, importance_score)
SELECT
  (SELECT id FROM corporate_brands WHERE name = '味の素株式会社'),
  category, title, description, year, importance_score
FROM (VALUES
  ('rd', 'アミノ酸研究のパイオニア', '1908年の「うま味」発見以来、アミノ酸科学のグローバルリーダー', 1908, 1.0),
  ('rd', 'AminoScience技術', 'アミノ酸の機能を最大限に引き出す独自技術', 2010, 0.9),
  ('patent', 'MSG製造法特許', '世界初のグルタミン酸ナトリウム製造法', 1908, 0.95),
  ('invention', 'うま味調味料の発明', '池田菊苗博士による「味の素」発明', 1908, 1.0),
  ('invention', '発酵法によるアミノ酸生産', '効率的なアミノ酸大量生産技術', 1956, 0.85),
  ('award', '紫綬褒章（池田菊苗）', 'うま味発見の功績', 1917, 0.8),
  ('history', '創業115年以上', '1909年創業の老舗食品メーカー', 1909, 0.75)
) AS t(category, title, description, year, importance_score)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. fan_assets - ファンセグメント
-- ============================================
CREATE TYPE fan_segment_type AS ENUM (
  'core_fan',        -- コアファン（高頻度・高好感度）
  'loyal_fan',       -- ロイヤルファン（中頻度・高好感度）
  'new_fan',         -- 新規ファン（最近・中程度エンゲージメント）
  'casual_user',     -- カジュアルユーザー（低頻度・中好感度）
  'at_risk',         -- 離反リスク（エンゲージメント低下中）
  'detractor'        -- デトラクター（ネガティブ発言者）
);

CREATE TABLE IF NOT EXISTS fan_assets (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,

  segment_type fan_segment_type NOT NULL,
  segment_name TEXT NOT NULL,          -- '熱狂的支持者' など日本語名

  -- セグメント指標
  user_count INTEGER DEFAULT 0,        -- ユーザー数
  post_count INTEGER DEFAULT 0,        -- 総投稿数
  avg_sentiment NUMERIC(4,3),          -- 平均センチメント（-1 to 1）
  avg_engagement NUMERIC(6,2),         -- 平均エンゲージメント

  -- ウニ/タイヤ可視化用
  relationship_strength NUMERIC(4,3) DEFAULT 0.5,  -- 関係強度（0-1）: ウニのトゲの太さ
  relationship_distance NUMERIC(4,3) DEFAULT 0.5,  -- 関係距離（0-1）: ウニのトゲの長さ（0=近い）

  -- セグメント詳細
  top_keywords JSONB,                  -- ["キーワード1", "キーワード2", ...]
  representative_posts JSONB,          -- [{"id": "xxx", "content": "..."}, ...]

  -- メタ情報
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(corporate_brand_id, segment_type)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_fan_assets_corp ON fan_assets(corporate_brand_id);
CREATE INDEX IF NOT EXISTS idx_fan_assets_segment ON fan_assets(segment_type);

-- ============================================
-- 7. stock_ugc_correlations - 株価×UGC相関係数
-- ============================================
CREATE TABLE IF NOT EXISTS stock_ugc_correlations (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,

  -- 相関対象
  ugc_metric TEXT NOT NULL,            -- 'mention_count', 'sentiment_score', 'positive_rate', 'engagement'
  stock_metric TEXT NOT NULL,          -- 'close_price', 'price_change', 'volume'

  -- 相関統計
  lag_days INTEGER NOT NULL DEFAULT 0,  -- UGCと株価のラグ（-7 to +7日）
  correlation_coefficient NUMERIC(5,4), -- ピアソン相関係数（-1 to 1）
  p_value NUMERIC(8,6),                -- 有意確率
  sample_size INTEGER,                  -- サンプルサイズ
  is_significant BOOLEAN DEFAULT FALSE, -- p < 0.05 かどうか

  -- 期間
  start_date DATE,
  end_date DATE,

  -- タイムスタンプ
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(corporate_brand_id, ugc_metric, stock_metric, lag_days)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_correlations_corp ON stock_ugc_correlations(corporate_brand_id);
CREATE INDEX IF NOT EXISTS idx_correlations_significant ON stock_ugc_correlations(is_significant) WHERE is_significant = TRUE;

-- ============================================
-- 8. influential_events - 株価影響イベント
-- ============================================
CREATE TABLE IF NOT EXISTS influential_events (
  id SERIAL PRIMARY KEY,
  corporate_brand_id INTEGER REFERENCES corporate_brands(id) ON DELETE CASCADE,

  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,            -- 'earnings', 'pr', 'scandal', 'product_launch', 'executive', 'external'
  event_title TEXT NOT NULL,
  event_description TEXT,

  -- 株価影響
  stock_change_percent NUMERIC(6,2),   -- 株価変動率（%）
  stock_change_days INTEGER DEFAULT 1, -- 影響日数

  -- UGC影響
  ugc_spike_percent NUMERIC(6,2),      -- UGC増加率（%）
  ugc_sentiment_change NUMERIC(4,3),   -- センチメント変化

  -- 詳細
  source_url TEXT,                     -- ニュースソース等
  related_posts JSONB,                 -- 関連UGC投稿

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_events_corp ON influential_events(corporate_brand_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON influential_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON influential_events(event_type);

-- ============================================
-- RLSポリシー（全テーブル共通）
-- ============================================

-- corporate_brands
ALTER TABLE corporate_brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read corporate_brands" ON corporate_brands;
CREATE POLICY "Allow anonymous read corporate_brands" ON corporate_brands FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access corporate_brands" ON corporate_brands;
CREATE POLICY "Service role full access corporate_brands" ON corporate_brands FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- brand_hierarchy
ALTER TABLE brand_hierarchy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read brand_hierarchy" ON brand_hierarchy;
CREATE POLICY "Allow anonymous read brand_hierarchy" ON brand_hierarchy FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access brand_hierarchy" ON brand_hierarchy;
CREATE POLICY "Service role full access brand_hierarchy" ON brand_hierarchy FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- stock_prices
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read stock_prices" ON stock_prices;
CREATE POLICY "Allow anonymous read stock_prices" ON stock_prices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access stock_prices" ON stock_prices;
CREATE POLICY "Service role full access stock_prices" ON stock_prices FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- corporate_mvv
ALTER TABLE corporate_mvv ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read corporate_mvv" ON corporate_mvv;
CREATE POLICY "Allow anonymous read corporate_mvv" ON corporate_mvv FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access corporate_mvv" ON corporate_mvv;
CREATE POLICY "Service role full access corporate_mvv" ON corporate_mvv FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- corporate_authority
ALTER TABLE corporate_authority ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read corporate_authority" ON corporate_authority;
CREATE POLICY "Allow anonymous read corporate_authority" ON corporate_authority FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access corporate_authority" ON corporate_authority;
CREATE POLICY "Service role full access corporate_authority" ON corporate_authority FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- fan_assets
ALTER TABLE fan_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read fan_assets" ON fan_assets;
CREATE POLICY "Allow anonymous read fan_assets" ON fan_assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access fan_assets" ON fan_assets;
CREATE POLICY "Service role full access fan_assets" ON fan_assets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- stock_ugc_correlations
ALTER TABLE stock_ugc_correlations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read stock_ugc_correlations" ON stock_ugc_correlations;
CREATE POLICY "Allow anonymous read stock_ugc_correlations" ON stock_ugc_correlations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access stock_ugc_correlations" ON stock_ugc_correlations;
CREATE POLICY "Service role full access stock_ugc_correlations" ON stock_ugc_correlations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- influential_events
ALTER TABLE influential_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read influential_events" ON influential_events;
CREATE POLICY "Allow anonymous read influential_events" ON influential_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access influential_events" ON influential_events;
CREATE POLICY "Service role full access influential_events" ON influential_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 完了メッセージ
-- ============================================
-- 作成テーブル:
-- 1. corporate_brands - コーポレートブランドマスタ
-- 2. brand_hierarchy - 製品ブランド→コーポレート階層
-- 3. stock_prices - 株価履歴（5年分、日次）
-- 4. corporate_mvv - MVV/パーソナリティキャッシュ
-- 5. corporate_authority - Base of Authority
-- 6. fan_assets - ファンセグメント
-- 7. stock_ugc_correlations - 株価×UGC相関
-- 8. influential_events - 株価影響イベント
