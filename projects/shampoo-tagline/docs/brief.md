# シャンプータグライン - データブリーフ

## データソース

| 項目 | 値 |
|------|-----|
| ファイル | `source/export_AnyMindGroup_永遠AnyTrend_dmYgikGz.csv` |
| ソース | Meltwater（AnyMind Group / AnyTag Trend） |
| 件数 | 10,000件 |
| サイズ | 23MB |
| 言語 | 主に日本語 |
| 対象 | シャンプー関連のSNS投稿・メンション |

## 主要カラム

### 基本情報
- `url`, `display_url` - 投稿URL
- `published`, `indexed` - 公開日時・インデックス日時
- `title`, `content` - タイトル・本文
- `lang` - 言語
- `source_type` - ソース種別（SOCIALMEDIA等）
- `post_type` - 投稿形式（VIDEO等）

### エンゲージメント指標
- Facebook: shares, reactions (total/like/haha/angry/sad/love/wow)
- Twitter/X: retweets, shares, quote_tweets, replies, impressions, video_views, likes
- Instagram: likes
- YouTube: views, likes, dislikes
- Pinterest: likes, pins, repins
- LinkedIn: shares, impression
- 共通: `engagement`, `reach`, `num_comments`

### センチメント・品質
- `sentiment` - センチメント値（0=ニュートラル、5=ポジティブ等）
- `nsfw_level` - NSFWレベル
- `rating` - レーティング

### 地理情報
- `continent`, `country`, `country_code`, `region`, `city`
- `longitude`, `latitude`
- 記事・著者・ソースそれぞれに地理データあり

### 著者情報
- `name`, `gender`, `image_url`, `short_name`, `url`
- `description` - プロフィール文
- フォロワー数（各プラットフォーム別）

### ソース情報
- `provider` - プロバイダ
- `word_count` - 語数
- Alexa/Semrush: pageviews, unique_visitors
- `ave` - 広告換算値

## 分析方針（案）

1. **センチメント分析** - シャンプー関連投稿の感情傾向
2. **エンゲージメント分析** - プラットフォーム別の反応傾向
3. **地域分布** - 投稿の地理的分布
4. **時系列トレンド** - 投稿量・エンゲージメントの推移
5. **インフルエンサー分析** - 高エンゲージメント著者の特定
6. **コンテンツ分析** - よく使われるハッシュタグ・キーワード
