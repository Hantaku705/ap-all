# API リファレンス

使用する外部APIと内部関数の仕様。

## 目次

- [外部API](#外部api)
- [内部関数](#内部関数)
- [型定義](#型定義)
- [レスポンス形式](#レスポンス形式)

---

## 外部API

### 1. TikTok API (tiktok-api23)

プロフィール情報・動画一覧を取得。

#### ユーザー情報取得

```
GET https://tiktok-api23.p.rapidapi.com/api/user/info
```

| パラメータ | 型     | 必須 | 説明       |
| ---------- | ------ | ---- | ---------- |
| `uniqueId` | string | ○    | ユーザー名 |

**リクエスト例:**

```bash
curl "https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=username" \
  -H "X-RapidAPI-Key: YOUR_API_KEY" \
  -H "X-RapidAPI-Host: tiktok-api23.p.rapidapi.com"
```

**レスポンス例:**

```json
{
  "userInfo": {
    "user": {
      "id": "123456789",
      "uniqueId": "username",
      "nickname": "表示名",
      "secUid": "MS4wLjAB..."
    },
    "stats": {
      "followerCount": 50000,
      "followingCount": 100,
      "heart": 1000000,
      "videoCount": 150
    }
  }
}
```

#### 動画一覧取得

```
GET https://tiktok-api23.p.rapidapi.com/api/user/posts
```

| パラメータ | 型     | 必須 | 説明               |
| ---------- | ------ | ---- | ------------------ |
| `secUid`   | string | ○    | ユーザーのsecUid   |
| `count`    | number | -    | 取得件数（最大35） |
| `cursor`   | string | -    | ページネーション用 |

**レスポンス例:**

```json
{
  "itemList": [
    {
      "id": "7234567890123456789",
      "desc": "動画の説明文 #ハッシュタグ",
      "createTime": 1699000000,
      "video": {
        "duration": 30,
        "cover": "https://..."
      },
      "stats": {
        "playCount": 50000,
        "diggCount": 2500,
        "commentCount": 80,
        "shareCount": 200,
        "collectCount": 150
      }
    }
  ],
  "hasMore": true,
  "cursor": "1699000000000"
}
```

---

### 2. TikTok Video Downloader

動画ファイルをダウンロード。

```
GET https://tiktok-video-downloader-api.p.rapidapi.com/
```

| パラメータ | 型     | 必須 | 説明      |
| ---------- | ------ | ---- | --------- |
| `videoUrl` | string | ○    | 動画のURL |

**レスポンス例:**

```json
{
  "status": "success",
  "videoUrl": "https://v16-webapp.tiktok.com/...",
  "videoUrlNoWatermark": "https://..."
}
```

---

### 3. Google Generative AI

動画分析・テキスト生成。

#### File Manager

```typescript
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// アップロード
const uploadResult = await fileManager.uploadFile(filePath, {
  mimeType: "video/mp4",
  displayName: "video.mp4",
});

// 状態確認（PROCESSING → ACTIVE）
let file = await fileManager.getFile(uploadResult.file.name);
while (file.state === "PROCESSING") {
  await new Promise((r) => setTimeout(r, 2000));
  file = await fileManager.getFile(uploadResult.file.name);
}
```

#### 動画分析

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const result = await model.generateContent([
  {
    fileData: {
      fileUri: file.uri,
      mimeType: file.mimeType,
    },
  },
  { text: ANALYSIS_PROMPT },
]);
```

#### ストリーミングチャット

```typescript
const chat = model.startChat({
  history: messages,
  systemInstruction: systemPrompt,
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 4096,
  },
});

const result = await chat.sendMessageStream(userInput);

for await (const chunk of result.stream) {
  const text = chunk.text();
  // SSEで送信
}
```

---

## 内部関数

### getTikTokUserVideos

プロフィールから動画一覧を取得。

```typescript
async function getTikTokUserVideos(
  profileUrl: string,
  count?: number,
): Promise<TikTokUserVideos | null>;
```

| パラメータ   | 型     | デフォルト | 説明            |
| ------------ | ------ | ---------- | --------------- |
| `profileUrl` | string | -          | プロフィールURL |
| `count`      | number | 10         | 取得する動画数  |

**戻り値:** `TikTokUserVideos | null`

---

### calculateAccountStats

動画データから統計を計算。

```typescript
function calculateAccountStats(videos: TikTokVideo[]): AccountStats;
```

**計算項目:**

| 項目               | 計算式                           |
| ------------------ | -------------------------------- |
| `lvr`              | (総いいね / 総再生) × 100        |
| `cvr`              | (総コメント / 総再生) × 100      |
| `svr`              | (総シェア / 総再生) × 100        |
| `saveRate`         | (総保存 / 総再生) × 100          |
| `buzzRate`         | (平均2倍超の動画数 / 総数) × 100 |
| `postingFrequency` | 平均投稿間隔（日）               |

---

### downloadTikTokVideo

動画をダウンロードしてBufferを返す。

```typescript
async function downloadTikTokVideo(videoUrl: string): Promise<Buffer | null>;
```

**処理フロー:**

1. RapidAPI で動画URLを取得
2. fetch で動画データをダウンロード
3. Buffer として返却

---

### analyzeVideoWithGemini

動画をAIで分析。

```typescript
async function analyzeVideoWithGemini(
  videoBuffer: Buffer,
  videoId: string,
): Promise<string | null>;
```

**処理フロー:**

1. 一時ファイルとして保存
2. FileManager でアップロード
3. PROCESSING状態を待機
4. generateContent で分析
5. 一時ファイル削除
6. Markdown形式の分析結果を返却

---

### analyzeVideosInBatches

複数動画をバッチ並列処理。

```typescript
async function analyzeVideosInBatches(
  videos: TikTokVideo[],
  batchSize: number,
  onProgress: ProgressCallback,
): Promise<VideoAnalysisResult[]>;
```

| パラメータ   | 型               | 説明                  |
| ------------ | ---------------- | --------------------- |
| `videos`     | TikTokVideo[]    | 分析対象の動画配列    |
| `batchSize`  | number           | 並列処理数（推奨: 5） |
| `onProgress` | ProgressCallback | 進捗コールバック      |

---

## 型定義

### TikTokVideo

```typescript
interface TikTokVideo {
  id: string;
  url: string;
  desc: string;
  createTime: number;
  durationSec?: number;
  thumbnail?: string;
  stats: {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  };
}
```

### TikTokUserVideos

```typescript
interface TikTokUserVideos {
  username: string;
  profileUrl: string;
  videos: TikTokVideo[];
}
```

### AccountStats

```typescript
interface AccountStats {
  // 基本指標
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  averageViews: number;

  // エンゲージメント率
  lvr: number; // Like-to-View Ratio
  cvr: number; // Comment-to-View Ratio
  svr: number; // Share-to-View Ratio
  saveRate: number; // 保存率
  totalER: number; // 総合エンゲージメント率

  // パフォーマンス分布
  maxViews: number;
  minViews: number;
  medianViews: number;
  stdDevViews: number;
  buzzRate: number; // バズ動画率

  // 投稿頻度
  postingFrequency: string; // "毎日" | "2日1回" | "週1回" | "不定期"
  avgDaysBetweenPosts: number;
}
```

### VideoAnalysisResult

```typescript
interface VideoAnalysisResult {
  videoId: string;
  analysis: string | null; // Markdown形式
  error?: string;
}
```

### VideoItem（UI用）

```typescript
interface VideoItem {
  id: string;
  url: string;
  desc: string;
  thumbnail: string;
  stats: {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  };
  metrics: {
    lvr: number;
    cvr: number;
    svr: number;
    saveRate: number;
    totalER: number;
  };
  analysis: string | null;
  error?: string;
}
```

---

## レスポンス形式

### SSEメッセージ

Server-Sent Events形式でストリーミング。

```
data: {"type":"progress","stage":"プロフィール取得中","percent":5}\n\n
data: {"type":"progress","stage":"動画分析中","percent":30,"current":3,"total":10}\n\n
data: {"choices":[{"delta":{"content":"分析結果..."}}]}\n\n
data: {"type":"video_list","videos":[...]}\n\n
data: {"type":"suggested_questions","questions":[...]}\n\n
data: [DONE]\n\n
```

### 進捗メッセージ

```typescript
interface ProgressMessage {
  type: "progress";
  stage: string;
  percent: number;
  current?: number;
  total?: number;
  steps?: ProgressStep[];
}

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "current" | "completed" | "error";
}
```

### エラーレスポンス

```typescript
// APIエラー
{
  "error": "サーバーエラーが発生しました",
  "details": "TikTok API rate limit exceeded"
}

// 部分エラー（動画単位）
{
  "type": "video_list",
  "videos": [
    { "id": "123", "analysis": "...", "error": null },
    { "id": "456", "analysis": null, "error": "ダウンロード失敗" }
  ]
}
```

---

## 業界ベンチマーク

レポート生成時に使用する業界平均値。

| 指標   | 業界平均 | 優秀ライン | 要改善ライン |
| ------ | -------- | ---------- | ------------ |
| LVR    | 4.5%     | > 6%       | < 3%         |
| CVR    | 0.2%     | > 0.4%     | < 0.1%       |
| SVR    | 0.15%    | > 0.3%     | < 0.1%       |
| 保存率 | 0.5%     | > 1%       | < 0.3%       |
| 総合ER | 5.5%     | > 8%       | < 4%         |

**比較ラベル:**

- 🔥 優秀（業界平均の1.5倍以上）
- ✅ 平均以上
- ➖ 平均
- ⚠️ 要改善（業界平均の半分以下）
