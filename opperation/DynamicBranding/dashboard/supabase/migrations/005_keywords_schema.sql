-- 関連検索キーワード分析用テーブル
-- 実行方法: Supabase SQL Editor で実行

-- ============================================
-- 1. related_keywords（関連キーワードマスタ）
-- ============================================
CREATE TABLE IF NOT EXISTS related_keywords (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  query_type TEXT CHECK (query_type IN ('rising', 'top')),
  value TEXT,                    -- "+250%" や "Breakout"
  extracted_value INTEGER,       -- 数値化した値（100, 250等）
  rank INTEGER,                  -- 順位（1-25）
  fetch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, keyword, query_type, fetch_date)
);

CREATE INDEX IF NOT EXISTS idx_related_kw_brand ON related_keywords(brand_id);
CREATE INDEX IF NOT EXISTS idx_related_kw_type ON related_keywords(query_type);
CREATE INDEX IF NOT EXISTS idx_related_kw_date ON related_keywords(fetch_date);
CREATE INDEX IF NOT EXISTS idx_related_kw_value ON related_keywords(extracted_value DESC);

-- ============================================
-- 2. keyword_cooccurrences（キーワード共起マトリクス）
-- どのキーワードが複数ブランドで共通して出現するか
-- ============================================
CREATE TABLE IF NOT EXISTS keyword_cooccurrences (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  brand_ids INTEGER[] NOT NULL,  -- 出現ブランドのID配列
  brand_count INTEGER NOT NULL,  -- 出現ブランド数
  total_score INTEGER DEFAULT 0, -- 合計スコア
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, analysis_date)
);

CREATE INDEX IF NOT EXISTS idx_kw_cooccur_count ON keyword_cooccurrences(brand_count DESC);
CREATE INDEX IF NOT EXISTS idx_kw_cooccur_score ON keyword_cooccurrences(total_score DESC);

-- ============================================
-- 3. keyword_cep_mappings（キーワード→CEPマッピング）
-- 関連キーワードとCEPの紐付け（サンキー用）
-- ============================================
CREATE TABLE IF NOT EXISTS keyword_cep_mappings (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  cep_id INTEGER REFERENCES ceps(id) ON DELETE CASCADE,
  relevance_score NUMERIC(4,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  mapping_source TEXT CHECK (mapping_source IN ('manual', 'ai', 'rule')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, cep_id)
);

CREATE INDEX IF NOT EXISTS idx_kw_cep_keyword ON keyword_cep_mappings(keyword);
CREATE INDEX IF NOT EXISTS idx_kw_cep_cep ON keyword_cep_mappings(cep_id);

-- ============================================
-- RLS（Row Level Security）設定
-- ============================================
ALTER TABLE related_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_cooccurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_cep_mappings ENABLE ROW LEVEL SECURITY;

-- anon 読み取り許可
DROP POLICY IF EXISTS "Allow anonymous read" ON related_keywords;
CREATE POLICY "Allow anonymous read" ON related_keywords FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON keyword_cooccurrences;
CREATE POLICY "Allow anonymous read" ON keyword_cooccurrences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON keyword_cep_mappings;
CREATE POLICY "Allow anonymous read" ON keyword_cep_mappings FOR SELECT USING (true);

-- service_role フルアクセス（データ投入用）
DROP POLICY IF EXISTS "Service role full access" ON related_keywords;
CREATE POLICY "Service role full access" ON related_keywords FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON keyword_cooccurrences;
CREATE POLICY "Service role full access" ON keyword_cooccurrences FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON keyword_cep_mappings;
CREATE POLICY "Service role full access" ON keyword_cep_mappings FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ビュー: ブランド別関連キーワードサマリー
-- ============================================
CREATE OR REPLACE VIEW brand_keyword_summary AS
SELECT
  b.name AS brand_name,
  b.color AS brand_color,
  rk.keyword,
  rk.query_type,
  rk.value,
  rk.extracted_value,
  rk.rank,
  rk.fetch_date
FROM related_keywords rk
JOIN brands b ON rk.brand_id = b.id
ORDER BY b.name, rk.query_type, rk.rank;

-- ============================================
-- ビュー: サンキー用データ（ブランド→キーワード→CEP）
-- ============================================
CREATE OR REPLACE VIEW sankey_brand_keyword_cep AS
SELECT
  b.name AS brand_name,
  b.color AS brand_color,
  rk.keyword,
  rk.extracted_value AS keyword_score,
  c.cep_name,
  c.category AS cep_category,
  kcm.relevance_score
FROM keyword_cep_mappings kcm
JOIN related_keywords rk ON kcm.keyword = rk.keyword
JOIN brands b ON rk.brand_id = b.id
JOIN ceps c ON kcm.cep_id = c.id
WHERE kcm.relevance_score >= 0.5
  AND rk.query_type = 'top'
ORDER BY b.name, rk.extracted_value DESC;

-- ============================================
-- ビュー: キーワード共起サマリー
-- ============================================
CREATE OR REPLACE VIEW keyword_cooccurrence_summary AS
SELECT
  kc.keyword,
  kc.brand_count,
  kc.total_score,
  array_agg(b.name ORDER BY b.id) AS brand_names,
  array_agg(b.color ORDER BY b.id) AS brand_colors
FROM keyword_cooccurrences kc
CROSS JOIN LATERAL unnest(kc.brand_ids) AS bid
JOIN brands b ON b.id = bid
GROUP BY kc.id, kc.keyword, kc.brand_count, kc.total_score
ORDER BY kc.brand_count DESC, kc.total_score DESC;
