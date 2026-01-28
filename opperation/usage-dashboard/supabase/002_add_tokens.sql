-- トークン追跡カラム追加
-- 実行: Supabase SQL Editor で実行

-- usage_logs にトークンカラム追加
ALTER TABLE usage_logs
  ADD COLUMN IF NOT EXISTS input_tokens BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens BIGINT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED;

-- コメント追加
COMMENT ON COLUMN usage_logs.input_tokens IS '入力トークン数（日別）';
COMMENT ON COLUMN usage_logs.output_tokens IS '出力トークン数（日別）';
COMMENT ON COLUMN usage_logs.total_tokens IS '合計トークン数（自動計算）';

-- ビュー再作成: ユーザー別累計（トークン追加）
CREATE OR REPLACE VIEW usage_summary AS
SELECT
  user_id,
  hostname,
  username,
  SUM(minutes) as total_minutes,
  SUM(sessions) as total_sessions,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(input_tokens + output_tokens) as total_tokens,
  MAX(date) as last_active_date,
  MAX(last_sync) as last_sync
FROM usage_logs
GROUP BY user_id, hostname, username;

-- ビュー再作成: 日別合計（トークン追加）
CREATE OR REPLACE VIEW usage_daily_total AS
SELECT
  date,
  SUM(minutes) as total_minutes,
  SUM(sessions) as total_sessions,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(input_tokens + output_tokens) as total_tokens,
  COUNT(DISTINCT user_id) as active_users
FROM usage_logs
GROUP BY date
ORDER BY date DESC;
