-- Claude Code 使用時間追跡システム
-- Supabase テーブル作成SQL

-- usage_logs テーブル作成
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- username@hostname 形式
  hostname TEXT NOT NULL,          -- PCホスト名
  username TEXT NOT NULL,          -- macOSユーザー名
  date DATE NOT NULL,              -- 日付
  minutes INTEGER NOT NULL DEFAULT 0,  -- その日の使用時間（分）
  sessions INTEGER NOT NULL DEFAULT 0, -- その日のセッション数
  last_sync TIMESTAMPTZ DEFAULT NOW(), -- 最終同期時刻
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- user_id + date で一意（UPSERT用）
  CONSTRAINT usage_logs_user_date_unique UNIQUE (user_id, date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON usage_logs(date);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, date);

-- RLS有効化
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 読み取りは誰でも可能（ダッシュボード用）
DROP POLICY IF EXISTS "Anyone can read usage_logs" ON usage_logs;
CREATE POLICY "Anyone can read usage_logs"
  ON usage_logs FOR SELECT
  USING (true);

-- RLSポリシー: Service Role経由のみ書き込み可能
DROP POLICY IF EXISTS "Service role can insert usage_logs" ON usage_logs;
CREATE POLICY "Service role can insert usage_logs"
  ON usage_logs FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update usage_logs" ON usage_logs;
CREATE POLICY "Service role can update usage_logs"
  ON usage_logs FOR UPDATE
  USING (true);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_usage_logs_updated_at ON usage_logs;
CREATE TRIGGER update_usage_logs_updated_at
  BEFORE UPDATE ON usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 集計用ビュー: ユーザー別累計
CREATE OR REPLACE VIEW usage_summary AS
SELECT
  user_id,
  hostname,
  username,
  SUM(minutes) as total_minutes,
  SUM(sessions) as total_sessions,
  MAX(date) as last_active_date,
  MAX(last_sync) as last_sync
FROM usage_logs
GROUP BY user_id, hostname, username;

-- 集計用ビュー: 日別合計（全ユーザー）
CREATE OR REPLACE VIEW usage_daily_total AS
SELECT
  date,
  SUM(minutes) as total_minutes,
  SUM(sessions) as total_sessions,
  COUNT(DISTINCT user_id) as active_users
FROM usage_logs
GROUP BY date
ORDER BY date DESC;
