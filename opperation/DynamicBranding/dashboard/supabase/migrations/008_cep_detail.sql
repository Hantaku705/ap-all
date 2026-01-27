-- 008_cep_detail.sql
-- CEP粒度向上: W's詳細化カラム追加

-- ============================================
-- 1. 新規カラム追加
-- ============================================

-- What: 料理カテゴリ
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS dish_category TEXT;
COMMENT ON COLUMN sns_posts.dish_category IS '料理カテゴリ: soup/stir_fry/stew/chinese/rice/salad/noodle/fried/grilled/seasoning/other';

-- What: 具体的な料理名
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS dish_name TEXT;
COMMENT ON COLUMN sns_posts.dish_name IS '具体的な料理名（味噌汁、麻婆豆腐など）';

-- When: 食事シーン
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS meal_occasion TEXT;
COMMENT ON COLUMN sns_posts.meal_occasion IS '食事シーン: weekday_dinner_rush/weekday_dinner_leisurely/weekend_brunch/weekend_dinner/lunch_box/late_night_snack/breakfast/party';

-- Who: 誰のために作ったか
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS cooking_for TEXT;
COMMENT ON COLUMN sns_posts.cooking_for IS '調理対象: self/family/kids/spouse/parents/guest/multiple';

-- Why: 動機カテゴリ
ALTER TABLE sns_posts ADD COLUMN IF NOT EXISTS motivation_category TEXT;
COMMENT ON COLUMN sns_posts.motivation_category IS '動機: time_pressure/taste_assurance/health_concern/cost_saving/skill_confidence/variety_seeking/comfort_food/impression';

-- ============================================
-- 2. インデックス追加
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sns_posts_dish_category ON sns_posts(dish_category);
CREATE INDEX IF NOT EXISTS idx_sns_posts_dish_name ON sns_posts(dish_name);
CREATE INDEX IF NOT EXISTS idx_sns_posts_meal_occasion ON sns_posts(meal_occasion);
CREATE INDEX IF NOT EXISTS idx_sns_posts_cooking_for ON sns_posts(cooking_for);
CREATE INDEX IF NOT EXISTS idx_sns_posts_motivation_category ON sns_posts(motivation_category);

-- ============================================
-- 3. ブランド別代表メニューマスタ
-- ============================================

CREATE TABLE IF NOT EXISTS brand_dishes (
  id SERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  dish_category TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_name, dish_name)
);

COMMENT ON TABLE brand_dishes IS 'ブランド別代表メニューマスタ';

-- 初期データ投入
INSERT INTO brand_dishes (brand_name, dish_name, dish_category, is_primary) VALUES
  -- ほんだし
  ('ほんだし', '味噌汁', 'soup', true),
  ('ほんだし', '煮物', 'stew', true),
  ('ほんだし', 'おでん', 'stew', false),
  ('ほんだし', '炊き込みご飯', 'rice', false),
  ('ほんだし', '肉じゃが', 'stew', false),
  ('ほんだし', '茶碗蒸し', 'other', false),

  -- クックドゥ
  ('クックドゥ', '麻婆豆腐', 'chinese', true),
  ('クックドゥ', '回鍋肉', 'chinese', true),
  ('クックドゥ', '青椒肉絲', 'chinese', false),
  ('クックドゥ', '酢豚', 'chinese', false),
  ('クックドゥ', 'エビチリ', 'chinese', false),
  ('クックドゥ', '八宝菜', 'chinese', false),

  -- コンソメ
  ('コンソメ', 'ポトフ', 'soup', true),
  ('コンソメ', 'コンソメスープ', 'soup', true),
  ('コンソメ', 'ロールキャベツ', 'stew', false),
  ('コンソメ', 'オニオンスープ', 'soup', false),
  ('コンソメ', 'シチュー', 'stew', false),

  -- 味の素
  ('味の素', '野菜炒め', 'stir_fry', true),
  ('味の素', 'チャーハン', 'rice', true),
  ('味の素', '卵焼き', 'other', false),
  ('味の素', '唐揚げ', 'fried', false),
  ('味の素', 'パスタ', 'noodle', false),
  ('味の素', 'ラーメン', 'noodle', false),

  -- 丸鶏がらスープ
  ('丸鶏がらスープ', '中華スープ', 'soup', true),
  ('丸鶏がらスープ', 'ラーメン', 'noodle', false),
  ('丸鶏がらスープ', 'チャーハン', 'rice', false),
  ('丸鶏がらスープ', '鍋', 'stew', false),
  ('丸鶏がらスープ', '餃子のタレ', 'seasoning', false),

  -- 香味ペースト
  ('香味ペースト', '野菜炒め', 'stir_fry', true),
  ('香味ペースト', 'チャーハン', 'rice', true),
  ('香味ペースト', '焼きそば', 'noodle', false),
  ('香味ペースト', 'スープ', 'soup', false),
  ('香味ペースト', '鍋', 'stew', false),

  -- アジシオ
  ('アジシオ', 'おにぎり', 'rice', true),
  ('アジシオ', '天ぷら', 'fried', false),
  ('アジシオ', '焼き魚', 'grilled', false),
  ('アジシオ', 'サラダ', 'salad', false),
  ('アジシオ', '漬物', 'other', false),

  -- ピュアセレクト
  ('ピュアセレクト', 'サラダ', 'salad', true),
  ('ピュアセレクト', 'ポテトサラダ', 'salad', true),
  ('ピュアセレクト', 'サンドイッチ', 'other', false),
  ('ピュアセレクト', 'タルタルソース', 'seasoning', false)
ON CONFLICT (brand_name, dish_name) DO NOTHING;

-- RLSポリシー
ALTER TABLE brand_dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access on brand_dishes" ON brand_dishes;
CREATE POLICY "Allow anonymous read access on brand_dishes"
  ON brand_dishes FOR SELECT
  TO anon
  USING (true);
