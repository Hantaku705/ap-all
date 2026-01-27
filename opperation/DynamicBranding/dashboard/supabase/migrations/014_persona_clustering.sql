-- ============================================
-- 014: ペルソナクラスタリング品質メトリクス
-- ============================================

-- brand_persona_cacheにクラスタリング品質メトリクスを追加
-- 真のk-meansクラスタリングによる分析結果の信頼性を可視化

-- クラスタリング手法
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS clustering_method TEXT DEFAULT 'kmeans';

-- シルエットスコア（-1〜1、クラスター品質指標）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS silhouette_score REAL;

-- 各属性のunknown率（JSON）
-- {
--   "life_stage": 22,
--   "cooking_skill": 28,
--   "motivation_category": 15,
--   "meal_occasion": 18,
--   "cooking_for": 12,
--   "emotion": 25,
--   "average": 20
-- }
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS unknown_rates JSONB;

-- データ完全性（0-100%、100 - average_unknown_rate）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS data_completeness REAL;

-- クラスター分離度（0-100、クラスター間の明確さ）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS cluster_separation REAL;

-- 総合信頼度スコア（0-100、複合スコア）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS overall_confidence REAL;

-- 分析対象投稿数（全件）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS posts_analyzed INTEGER;

-- クラスタリングに使用した投稿数（十分な属性があった件数）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS posts_clustered INTEGER;

-- 除外された投稿数（属性不足で除外）
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS posts_excluded INTEGER;

-- 各クラスターのサイズ配列
-- [245, 180, 120, 95] のように実際のクラスターサイズを記録
ALTER TABLE brand_persona_cache
  ADD COLUMN IF NOT EXISTS cluster_sizes INTEGER[];

-- コメント追加
COMMENT ON COLUMN brand_persona_cache.clustering_method IS 'クラスタリング手法: kmeans | legacy';
COMMENT ON COLUMN brand_persona_cache.silhouette_score IS 'シルエットスコア: -1〜1、高いほどクラスターが明確';
COMMENT ON COLUMN brand_persona_cache.unknown_rates IS '各属性のunknown率（%）';
COMMENT ON COLUMN brand_persona_cache.data_completeness IS 'データ完全性: 0-100%';
COMMENT ON COLUMN brand_persona_cache.cluster_separation IS 'クラスター分離度: 0-100';
COMMENT ON COLUMN brand_persona_cache.overall_confidence IS '総合信頼度: 0-100';
COMMENT ON COLUMN brand_persona_cache.posts_analyzed IS '分析対象の総投稿数';
COMMENT ON COLUMN brand_persona_cache.posts_clustered IS 'クラスタリングに使用した投稿数';
COMMENT ON COLUMN brand_persona_cache.posts_excluded IS '属性不足で除外された投稿数';
COMMENT ON COLUMN brand_persona_cache.cluster_sizes IS '各クラスターの実際のサイズ';

-- ============================================
-- 品質メトリクスの解釈ガイド:
--
-- overall_confidence（総合信頼度）:
--   80-100%: 高信頼 - 十分なデータ量と品質
--   60-79%:  中程度 - 一部不明だが参考になる
--   40-59%:  低信頼 - データ不足、参考程度
--   0-39%:   要注意 - データが不十分
--
-- silhouette_score（シルエットスコア）:
--   0.7+:    クラスターが明確に分離
--   0.5-0.7: 適度な分離
--   0.25-0.5: 重複あり
--   <0.25:   分離が不明確
--
-- data_completeness（データ完全性）:
--   100 - average_unknown_rate
--   80%+: 良好
--   60-80%: 許容範囲
--   <60%: 注意が必要
-- ============================================
