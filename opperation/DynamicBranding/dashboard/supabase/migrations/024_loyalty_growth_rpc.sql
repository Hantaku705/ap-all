-- 024_loyalty_growth_rpc.sql
-- ロイヤリティ成長戦略用の集計RPC関数

-- ============================================
-- 1. コーポレートロイヤリティ分布
-- ============================================
-- sentiment: positive=高, neutral=中, negative=低
CREATE OR REPLACE FUNCTION get_corporate_loyalty_distribution()
RETURNS TABLE (
  sentiment TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
  WITH totals AS (
    SELECT COUNT(*) as total
    FROM sns_posts
    WHERE is_corporate = true
      AND sentiment IS NOT NULL
  )
  SELECT
    sp.sentiment,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / NULLIF(t.total, 0), 1) as percentage
  FROM sns_posts sp
  CROSS JOIN totals t
  WHERE sp.is_corporate = true
    AND sp.sentiment IS NOT NULL
  GROUP BY sp.sentiment, t.total
  ORDER BY
    CASE sp.sentiment
      WHEN 'positive' THEN 1
      WHEN 'neutral' THEN 2
      WHEN 'negative' THEN 3
    END
$$ LANGUAGE SQL;

-- ============================================
-- 2. トピック別エンゲージメント（ロイヤリティ層別）
-- ============================================
CREATE OR REPLACE FUNCTION get_topic_engagement_by_loyalty()
RETURNS TABLE (
  sentiment TEXT,
  topic TEXT,
  avg_engagement NUMERIC,
  avg_likes NUMERIC,
  avg_retweets NUMERIC,
  avg_comments NUMERIC,
  post_count BIGINT
) AS $$
  SELECT
    sp.sentiment,
    sp.corporate_topic as topic,
    ROUND(AVG(sp.engagement_total), 1) as avg_engagement,
    ROUND(AVG(sp.likes_count), 1) as avg_likes,
    ROUND(AVG(sp.retweets_count), 1) as avg_retweets,
    ROUND(AVG(sp.comments_count), 1) as avg_comments,
    COUNT(*) as post_count
  FROM sns_posts sp
  WHERE sp.is_corporate = true
    AND sp.sentiment IS NOT NULL
    AND sp.corporate_topic IS NOT NULL
  GROUP BY sp.sentiment, sp.corporate_topic
  ORDER BY sp.sentiment, avg_engagement DESC
$$ LANGUAGE SQL;

-- ============================================
-- 3. 週次ロイヤリティ推移（直近24週）
-- ============================================
CREATE OR REPLACE FUNCTION get_weekly_loyalty_trends()
RETURNS TABLE (
  week_start DATE,
  high_count BIGINT,
  medium_count BIGINT,
  low_count BIGINT,
  total_count BIGINT,
  high_percentage NUMERIC,
  medium_percentage NUMERIC,
  low_percentage NUMERIC
) AS $$
  WITH weekly AS (
    SELECT
      DATE_TRUNC('week', published::date)::date as week_start,
      COUNT(*) FILTER (WHERE sentiment = 'positive') as high_count,
      COUNT(*) FILTER (WHERE sentiment = 'neutral') as medium_count,
      COUNT(*) FILTER (WHERE sentiment = 'negative') as low_count,
      COUNT(*) as total_count
    FROM sns_posts
    WHERE is_corporate = true
      AND sentiment IS NOT NULL
      AND published >= NOW() - INTERVAL '24 weeks'
    GROUP BY week_start
  )
  SELECT
    week_start,
    high_count,
    medium_count,
    low_count,
    total_count,
    ROUND(high_count * 100.0 / NULLIF(total_count, 0), 1) as high_percentage,
    ROUND(medium_count * 100.0 / NULLIF(total_count, 0), 1) as medium_percentage,
    ROUND(low_count * 100.0 / NULLIF(total_count, 0), 1) as low_percentage
  FROM weekly
  ORDER BY week_start
$$ LANGUAGE SQL;

-- ============================================
-- 4. 代表投稿（ロイヤリティ層別上位）
-- ============================================
CREATE OR REPLACE FUNCTION get_representative_posts(limit_per_level INTEGER DEFAULT 10)
RETURNS TABLE (
  sentiment TEXT,
  id BIGINT,
  content TEXT,
  topic TEXT,
  engagement_total INTEGER,
  likes_count INTEGER,
  retweets_count INTEGER,
  url TEXT,
  published TIMESTAMPTZ
) AS $$
  (
    SELECT 'positive' as sentiment, id, content, corporate_topic as topic,
           engagement_total, likes_count, retweets_count, url, published
    FROM sns_posts
    WHERE is_corporate = true AND sentiment = 'positive'
    ORDER BY engagement_total DESC NULLS LAST
    LIMIT limit_per_level
  )
  UNION ALL
  (
    SELECT 'neutral' as sentiment, id, content, corporate_topic as topic,
           engagement_total, likes_count, retweets_count, url, published
    FROM sns_posts
    WHERE is_corporate = true AND sentiment = 'neutral'
    ORDER BY engagement_total DESC NULLS LAST
    LIMIT limit_per_level
  )
  UNION ALL
  (
    SELECT 'negative' as sentiment, id, content, corporate_topic as topic,
           engagement_total, likes_count, retweets_count, url, published
    FROM sns_posts
    WHERE is_corporate = true AND sentiment = 'negative'
    ORDER BY engagement_total DESC NULLS LAST
    LIMIT limit_per_level
  )
$$ LANGUAGE SQL;

-- ============================================
-- 5. トピック×ロイヤリティ相関（全体平均との比較）
-- ============================================
CREATE OR REPLACE FUNCTION get_topic_loyalty_correlation()
RETURNS TABLE (
  topic TEXT,
  total_posts BIGINT,
  high_ratio NUMERIC,
  medium_ratio NUMERIC,
  low_ratio NUMERIC,
  overall_high_ratio NUMERIC,
  loyalty_correlation NUMERIC
) AS $$
  WITH overall AS (
    SELECT
      COUNT(*) FILTER (WHERE sentiment = 'positive') * 100.0 / NULLIF(COUNT(*), 0) as overall_high_pct
    FROM sns_posts
    WHERE is_corporate = true AND sentiment IS NOT NULL
  ),
  by_topic AS (
    SELECT
      corporate_topic as topic,
      COUNT(*) as total_posts,
      ROUND(COUNT(*) FILTER (WHERE sentiment = 'positive') * 100.0 / NULLIF(COUNT(*), 0), 1) as high_ratio,
      ROUND(COUNT(*) FILTER (WHERE sentiment = 'neutral') * 100.0 / NULLIF(COUNT(*), 0), 1) as medium_ratio,
      ROUND(COUNT(*) FILTER (WHERE sentiment = 'negative') * 100.0 / NULLIF(COUNT(*), 0), 1) as low_ratio
    FROM sns_posts
    WHERE is_corporate = true
      AND sentiment IS NOT NULL
      AND corporate_topic IS NOT NULL
    GROUP BY corporate_topic
    HAVING COUNT(*) >= 10  -- 最低10件以上
  )
  SELECT
    bt.topic,
    bt.total_posts,
    bt.high_ratio,
    bt.medium_ratio,
    bt.low_ratio,
    ROUND(o.overall_high_pct, 1) as overall_high_ratio,
    ROUND((bt.high_ratio / NULLIF(o.overall_high_pct, 0) - 1) * 100, 1) as loyalty_correlation
  FROM by_topic bt
  CROSS JOIN overall o
  ORDER BY loyalty_correlation DESC
$$ LANGUAGE SQL;

-- ============================================
-- インデックス追加（RPC高速化）
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sns_posts_corporate_sentiment
  ON sns_posts(is_corporate, sentiment)
  WHERE is_corporate = true;

CREATE INDEX IF NOT EXISTS idx_sns_posts_corporate_topic_sentiment
  ON sns_posts(is_corporate, corporate_topic, sentiment)
  WHERE is_corporate = true;

-- コメント
COMMENT ON FUNCTION get_corporate_loyalty_distribution() IS 'コーポレート投稿のロイヤリティ分布（high/medium/low）';
COMMENT ON FUNCTION get_topic_engagement_by_loyalty() IS 'トピック別エンゲージメント（ロイヤリティ層別）';
COMMENT ON FUNCTION get_weekly_loyalty_trends() IS '週次ロイヤリティ推移（直近24週）';
COMMENT ON FUNCTION get_representative_posts(INTEGER) IS '代表投稿（各ロイヤリティ層の上位N件）';
COMMENT ON FUNCTION get_topic_loyalty_correlation() IS 'トピック×ロイヤリティ相関（全体平均との比較）';
