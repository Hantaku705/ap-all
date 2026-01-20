# 動画分析キット - 他プロジェクト移植用

## 対応プラットフォーム

| Platform  | インサイト取得 | 動画ダウンロード |    AI分析    |
| --------- | :------------: | :--------------: | :----------: |
| TikTok    |       ✅       |        ✅        |      ✅      |
| Instagram |       ✅       |        ✅        |      ✅      |
| YouTube   |       -        |        -         | ✅ (URL直接) |
| Twitter/X |       ❌       |        ❌        |      ❌      |

---

## 環境変数

```bash
# TikTok API (RapidAPI) - 同じキーで複数API使用可能
TIKTOK_RAPIDAPI_KEY=64b6e140famshd084ac154d96681p142bbbjsncac563e58e50

# Instagram API (RapidAPI)
INSTAGRAM_RAPIDAPI_KEY=64b6e140famshd084ac154d96681p142bbbjsncac563e58e50

# Gemini AI (Google AI Studio で取得)
GEMINI_API_KEY=your_gemini_api_key
```

---

## 使用API一覧

### TikTok (RapidAPI)

| 用途             | API Host                                     | エンドポイント                              |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| 動画詳細         | `tiktok-api23.p.rapidapi.com`                | `/api/post/detail?videoId={id}`             |
| ユーザー情報     | `tiktok-api23.p.rapidapi.com`                | `/api/user/info?uniqueId={username}`        |
| ユーザー投稿一覧 | `tiktok-api23.p.rapidapi.com`                | `/api/user/posts?secUid={secUid}&count={n}` |
| 動画ダウンロード | `tiktok-video-downloader-api.p.rapidapi.com` | `/media?videoUrl={url}`                     |

### Instagram (RapidAPI)

| 用途             | API Host                                      | エンドポイント                                              |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------- |
| 投稿詳細         | `instagram-scraper-api2.p.rapidapi.com`       | `/v1/post_info?code_or_id_or_url={shortcode}`               |
| 動画ダウンロード | `instagram-scraper-stable-api.p.rapidapi.com` | `/get_media_data.php?reel_post_code_or_url={url}&type=reel` |

### YouTube

- Gemini 2.0 Flash にURLを直接渡して分析（API不要）

---

## 必要パッケージ

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"
  }
}
```

---

## 必要ファイル

### 1. lib/types.ts（型定義）

```typescript
export interface InsightData {
  url: string;
  platform: "TikTok" | "YouTube" | "Instagram" | "X";
  view: number | null;
  like: number | null;
  comment: number | null;
  share: number | null;
  save: number | null;
  durationSec: number | null;
  thumbnail?: string;
}
```

### 2. lib/utils/platform.ts（URL解析）

```typescript
export function detectPlatform(
  url: string,
): "TikTok" | "YouTube" | "Instagram" | "X" | null {
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes("tiktok.com")) return "TikTok";
  if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be"))
    return "YouTube";
  if (lowUrl.includes("instagram.com")) return "Instagram";
  if (lowUrl.includes("twitter.com") || lowUrl.includes("x.com")) return "X";
  return null;
}

export function extractTikTokId(url: string): string | null {
  const match = url.match(/\/(video|photo)\/(\d+)/);
  if (match) return match[2];
  const idMatch = url.match(/(\d{8,})/);
  return idMatch ? idMatch[1] : null;
}

export function isTikTokProfileUrl(url: string): boolean {
  if (!url.toLowerCase().includes("tiktok.com")) return false;
  if (url.includes("/video/") || url.includes("/photo/")) return false;
  return /@[^/]+/.test(url);
}

export function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([^/?#]+)/i);
  return match ? match[1] : null;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const match = urlObj.pathname.match(/^\/([A-Za-z0-9_-]{6,})/);
      return match ? match[1] : null;
    }
    if (host.includes("youtube.com")) {
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      const match = urlObj.pathname.match(
        /^\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/,
      );
      return match ? match[2] : null;
    }
  } catch {
    const match = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    return match ? match[1] : null;
  }
  return null;
}

export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/i);
  return match ? match[1] : null;
}
```

### 3. lib/api/tiktok.ts

```typescript
import { InsightData } from "@/lib/types";
import { extractTikTokId, extractTikTokUsername } from "@/lib/utils/platform";

const RAPIDAPI_KEY = process.env.TIKTOK_RAPIDAPI_KEY;

export interface TikTokVideo {
  id: string;
  url: string;
  desc: string;
  createTime: number;
  stats: {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  };
  durationSec: number;
  thumbnail: string | null;
}

// 動画インサイト取得
export async function getTikTokInsight(
  url: string,
): Promise<InsightData | null> {
  if (!RAPIDAPI_KEY) return null;

  const videoId = extractTikTokId(url);
  if (!videoId) return null;

  const res = await fetch(
    `https://tiktok-api23.p.rapidapi.com/api/post/detail?videoId=${videoId}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-api23.p.rapidapi.com",
      },
    },
  );

  if (!res.ok) return null;

  const json = await res.json();
  const item = json.itemInfo?.itemStruct || json.item || json;
  const stats = item.stats || {};

  return {
    url,
    platform: "TikTok",
    view: stats.playCount || null,
    like: stats.diggCount || null,
    comment: stats.commentCount || null,
    share: stats.shareCount || null,
    save: stats.collectCount || null,
    durationSec: item.video?.duration || null,
    thumbnail: item.video?.cover || null,
  };
}

// 動画ダウンロード
export async function downloadTikTokVideo(url: string): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  const res = await fetch(
    `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodeURIComponent(url)}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-video-downloader-api.p.rapidapi.com",
      },
    },
  );

  if (!res.ok) return null;

  const json = await res.json();
  const videoUrl = json.videoUrl || json.downloadUrl || json.data?.videoUrl;
  if (!videoUrl) return null;

  const videoRes = await fetch(videoUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!videoRes.ok) return null;
  return Buffer.from(await videoRes.arrayBuffer());
}

// ユーザー動画一覧取得（プロフィール分析用）
export async function getTikTokUserVideos(
  profileUrl: string,
  count: number = 10,
): Promise<{ username: string; videos: TikTokVideo[] } | null> {
  if (!RAPIDAPI_KEY) return null;

  const username = extractTikTokUsername(profileUrl);
  if (!username) return null;

  // 1. ユーザー情報取得（secUid必要）
  const userRes = await fetch(
    `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${username}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-api23.p.rapidapi.com",
      },
    },
  );

  if (!userRes.ok) return null;
  const userJson = await userRes.json();
  const secUid = userJson.userInfo?.user?.secUid;
  if (!secUid) return null;

  // 2. 投稿一覧取得
  const postsRes = await fetch(
    `https://tiktok-api23.p.rapidapi.com/api/user/posts?secUid=${encodeURIComponent(secUid)}&count=${count}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-api23.p.rapidapi.com",
      },
    },
  );

  if (!postsRes.ok) return null;
  const postsJson = await postsRes.json();
  const items = postsJson.data?.itemList || postsJson.itemList || [];

  const videos: TikTokVideo[] = items.map((item: any) => ({
    id: item.id,
    url: `https://www.tiktok.com/@${username}/video/${item.id}`,
    desc: item.desc || "",
    createTime: item.createTime || 0,
    stats: {
      playCount: item.stats?.playCount || 0,
      likeCount: item.stats?.diggCount || 0,
      commentCount: item.stats?.commentCount || 0,
      shareCount: item.stats?.shareCount || 0,
      collectCount: item.stats?.collectCount || 0,
    },
    durationSec: item.video?.duration || 0,
    thumbnail: item.video?.cover || null,
  }));

  return { username, videos };
}
```

### 4. lib/api/instagram.ts

```typescript
import { InsightData } from "@/lib/types";
import { extractInstagramShortcode } from "@/lib/utils/platform";

const RAPIDAPI_KEY = process.env.INSTAGRAM_RAPIDAPI_KEY;

// 投稿インサイト取得
export async function getInstagramInsight(
  url: string,
): Promise<InsightData | null> {
  if (!RAPIDAPI_KEY) return null;

  const shortcode = extractInstagramShortcode(url);
  if (!shortcode) return null;

  const res = await fetch(
    `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(shortcode)}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com",
      },
    },
  );

  if (!res.ok) return null;

  const json = await res.json();
  const data = json.data || json;

  return {
    url,
    platform: "Instagram",
    view: data.play_count || data.view_count || null,
    like: data.like_count || null,
    comment: data.comment_count || null,
    share: data.reshare_count || null,
    save: null, // Instagram APIでは取得不可
    durationSec: data.video_duration || null,
    thumbnail: data.thumbnail_url || null,
  };
}

// 動画ダウンロード
export async function downloadInstagramVideo(
  url: string,
): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  const res = await fetch(
    `https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php?reel_post_code_or_url=${encodeURIComponent(url)}&type=reel`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com",
      },
    },
  );

  if (!res.ok) return null;

  const json = await res.json();
  const videoUrl = json.video_url || json.data?.video_url;
  if (!videoUrl) return null;

  const videoRes = await fetch(videoUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      Referer: "https://www.instagram.com/",
    },
  });

  if (!videoRes.ok) return null;
  return Buffer.from(await videoRes.arrayBuffer());
}
```

### 5. lib/api/gemini.ts

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getModel() {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function getFileManager() {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleAIFileManager(GEMINI_API_KEY);
}

// 動画ファイルを分析（TikTok, Instagram用）
export async function analyzeVideoWithGemini(
  videoBuffer: Buffer,
  prompt: string,
  mimeType: string = "video/mp4",
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const fileManager = getFileManager();

  // 一時ファイルに保存
  const tempDir = join(tmpdir(), "video-analysis");
  await mkdir(tempDir, { recursive: true });
  const filePath = join(tempDir, `video_${Date.now()}.mp4`);
  await writeFile(filePath, videoBuffer);

  // Geminiにアップロード
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: `video-${Date.now()}`,
  });

  // 処理完了まで待機
  let file = uploadResult.file;
  while (file.state === FileState.PROCESSING) {
    await new Promise((r) => setTimeout(r, 2000));
    file = await fileManager.getFile(file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Video processing failed");
  }

  // 分析実行
  const result = await getModel().generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { mimeType, fileUri: file.uri } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });

  // クリーンアップ
  await unlink(filePath).catch(() => {});

  return result.response.text();
}

// YouTube URL直接分析
export async function analyzeYouTubeWithGemini(
  youtubeUrl: string,
  prompt: string,
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const result = await getModel().generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `以下のYouTube動画を分析してください。\n動画URL: ${youtubeUrl}\n\n${prompt}`,
          },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });

  return result.response.text();
}
```

---

## 使用例

```typescript
import { detectPlatform } from "@/lib/utils/platform";
import { getTikTokInsight, downloadTikTokVideo } from "@/lib/api/tiktok";
import {
  getInstagramInsight,
  downloadInstagramVideo,
} from "@/lib/api/instagram";
import {
  analyzeVideoWithGemini,
  analyzeYouTubeWithGemini,
} from "@/lib/api/gemini";

const ANALYSIS_PROMPT = `
この動画を分析して、以下を出力してください：
- 動画内容の要約
- フック力（0-5）
- 改善点
`;

async function analyzeVideo(url: string) {
  const platform = detectPlatform(url);

  if (platform === "TikTok") {
    // 1. インサイト取得
    const insight = await getTikTokInsight(url);
    console.log("Insight:", insight);

    // 2. 動画ダウンロード
    const videoBuffer = await downloadTikTokVideo(url);
    if (!videoBuffer) throw new Error("Download failed");

    // 3. AI分析
    const analysis = await analyzeVideoWithGemini(videoBuffer, ANALYSIS_PROMPT);
    console.log("Analysis:", analysis);
  }

  if (platform === "Instagram") {
    const insight = await getInstagramInsight(url);
    const videoBuffer = await downloadInstagramVideo(url);
    if (videoBuffer) {
      const analysis = await analyzeVideoWithGemini(
        videoBuffer,
        ANALYSIS_PROMPT,
      );
    }
  }

  if (platform === "YouTube") {
    // YouTubeはURL直接分析（ダウンロード不要）
    const analysis = await analyzeYouTubeWithGemini(url, ANALYSIS_PROMPT);
    console.log("Analysis:", analysis);
  }
}
```

---

## RapidAPI サブスクリプション

使用しているAPIは以下のRapidAPIで購読：

1. **TikTok API23** - https://rapidapi.com/tikwm-tikwm-default/api/tiktok-api23
2. **TikTok Video Downloader** - https://rapidapi.com/ugradio/api/tiktok-video-downloader-api
3. **Instagram Scraper API2** - https://rapidapi.com/social-starter-media-social-starter-media-default/api/instagram-scraper-api2
4. **Instagram Scraper Stable** - https://rapidapi.com/developer1/api/instagram-scraper-stable-api

※ 同じRapidAPIキーで複数APIを使用可能（プラン内であれば）

---

## 注意事項

- API制限に注意（プランによりリクエスト数制限あり）
- 動画ダウンロードは一時ファイルを使用→クリーンアップ必須
- YouTube分析はGeminiがURL直接アクセスするため、限定公開動画は分析不可
- Instagram保存数は取得不可
