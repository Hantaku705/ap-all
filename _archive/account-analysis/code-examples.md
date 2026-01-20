# コード実装例

他プロジェクトで再利用可能なコードスニペット集。

## 目次

- [1. URL判定](#1-url判定)
- [2. プロフィール取得](#2-プロフィール取得)
- [3. 統計計算](#3-統計計算)
- [4. バッチ並列処理](#4-バッチ並列処理)
- [5. Gemini動画分析](#5-gemini動画分析)
- [6. SSEストリーミング](#6-sseストリーミング)
- [7. レポート生成](#7-レポート生成)

---

## 1. URL判定

TikTokプロフィールURLかどうか判定。

```typescript
const TIKTOK_PROFILE_PATTERNS = [
  /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/?(\?.*)?$/,
  /^@[\w.-]+$/,
];

const TIKTOK_VIDEO_PATTERN =
  /^https?:\/\/(www\.|vm\.)?tiktok\.com\/.+\/video\/\d+/;

export function isTikTokProfileUrl(url: string): boolean {
  // 単一動画URLは除外
  if (TIKTOK_VIDEO_PATTERN.test(url)) {
    return false;
  }
  return TIKTOK_PROFILE_PATTERNS.some((pattern) => pattern.test(url.trim()));
}

// 使用例
isTikTokProfileUrl("https://www.tiktok.com/@username"); // true
isTikTokProfileUrl("@username"); // true
isTikTokProfileUrl("https://www.tiktok.com/@user/video/123"); // false
```

---

## 2. プロフィール取得

RapidAPIでTikTokユーザー情報を取得。

```typescript
const RAPIDAPI_HOST = "tiktok-api23.p.rapidapi.com";

interface FetchOptions {
  timeout?: number;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getTikTokUserVideos(
  profileUrl: string,
  count = 10,
): Promise<TikTokUserVideos | null> {
  const apiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  if (!apiKey) {
    console.error("TIKTOK_RAPIDAPI_KEY is not set");
    return null;
  }

  // URLからユーザー名を抽出
  const username = extractUsername(profileUrl);
  if (!username) return null;

  const headers = {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
  };

  try {
    // Step 1: ユーザー情報取得（secUidを取得）
    const userInfoUrl = `https://${RAPIDAPI_HOST}/api/user/info?uniqueId=${username}`;
    const userInfoRes = await fetchWithTimeout(userInfoUrl, { headers });

    if (!userInfoRes.ok) {
      throw new Error(`User info failed: ${userInfoRes.status}`);
    }

    const userInfoData = await userInfoRes.json();
    const secUid = userInfoData?.userInfo?.user?.secUid;

    if (!secUid) {
      throw new Error("secUid not found");
    }

    // Step 2: 動画一覧取得
    const postsUrl = `https://${RAPIDAPI_HOST}/api/user/posts?secUid=${secUid}&count=${count}`;
    const postsRes = await fetchWithTimeout(postsUrl, { headers });

    if (!postsRes.ok) {
      throw new Error(`Posts fetch failed: ${postsRes.status}`);
    }

    const postsData = await postsRes.json();
    const itemList = postsData?.itemList || [];

    // 動画データを整形
    const videos: TikTokVideo[] = itemList.map((item: any) => ({
      id: item.id,
      url: `https://www.tiktok.com/@${username}/video/${item.id}`,
      desc: item.desc || "",
      createTime: item.createTime,
      durationSec: item.video?.duration,
      thumbnail: item.video?.cover,
      stats: {
        playCount: item.stats?.playCount || 0,
        likeCount: item.stats?.diggCount || 0,
        commentCount: item.stats?.commentCount || 0,
        shareCount: item.stats?.shareCount || 0,
        collectCount: item.stats?.collectCount || 0,
      },
    }));

    return {
      username,
      profileUrl: `https://www.tiktok.com/@${username}`,
      videos,
    };
  } catch (error) {
    console.error("getTikTokUserVideos error:", error);
    return null;
  }
}

function extractUsername(input: string): string | null {
  // @username 形式
  if (input.startsWith("@")) {
    return input.slice(1).split("?")[0];
  }
  // URL形式
  const match = input.match(/tiktok\.com\/@([\w.-]+)/);
  return match ? match[1].split("?")[0] : null;
}
```

---

## 3. 統計計算

動画データからエンゲージメント率などを算出。

```typescript
export function calculateAccountStats(videos: TikTokVideo[]): AccountStats {
  if (videos.length === 0) {
    return getEmptyStats();
  }

  // 合計値を計算
  const totals = videos.reduce(
    (acc, v) => ({
      views: acc.views + v.stats.playCount,
      likes: acc.likes + v.stats.likeCount,
      comments: acc.comments + v.stats.commentCount,
      shares: acc.shares + v.stats.shareCount,
      saves: acc.saves + v.stats.collectCount,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
  );

  const avgViews = totals.views / videos.length;

  // エンゲージメント率（%）
  const lvr = totals.views > 0 ? (totals.likes / totals.views) * 100 : 0;
  const cvr = totals.views > 0 ? (totals.comments / totals.views) * 100 : 0;
  const svr = totals.views > 0 ? (totals.shares / totals.views) * 100 : 0;
  const saveRate = totals.views > 0 ? (totals.saves / totals.views) * 100 : 0;
  const totalER = lvr + cvr + svr + saveRate;

  // パフォーマンス分布
  const viewCounts = videos.map((v) => v.stats.playCount).sort((a, b) => a - b);
  const maxViews = Math.max(...viewCounts);
  const minViews = Math.min(...viewCounts);
  const medianViews = calculateMedian(viewCounts);
  const stdDevViews = calculateStdDev(viewCounts);

  // バズ率（平均の2倍以上の動画の割合）
  const buzzThreshold = avgViews * 2;
  const buzzCount = videos.filter(
    (v) => v.stats.playCount >= buzzThreshold,
  ).length;
  const buzzRate = (buzzCount / videos.length) * 100;

  // 投稿頻度
  const { frequency, avgDays } = calculatePostingFrequency(videos);

  return {
    totalViews: totals.views,
    totalLikes: totals.likes,
    totalComments: totals.comments,
    totalShares: totals.shares,
    totalSaves: totals.saves,
    averageViews: avgViews,
    lvr,
    cvr,
    svr,
    saveRate,
    totalER,
    maxViews,
    minViews,
    medianViews,
    stdDevViews,
    buzzRate,
    postingFrequency: frequency,
    avgDaysBetweenPosts: avgDays,
  };
}

function calculateMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculatePostingFrequency(videos: TikTokVideo[]): {
  frequency: string;
  avgDays: number;
} {
  if (videos.length < 2) {
    return { frequency: "不定期", avgDays: 0 };
  }

  const timestamps = videos.map((v) => v.createTime).sort((a, b) => b - a);

  let totalDiff = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    totalDiff += timestamps[i] - timestamps[i + 1];
  }

  const avgSeconds = totalDiff / (timestamps.length - 1);
  const avgDays = avgSeconds / 86400;

  let frequency: string;
  if (avgDays <= 1.5) frequency = "毎日";
  else if (avgDays <= 3) frequency = "2日1回";
  else if (avgDays <= 8) frequency = "週1回";
  else frequency = "不定期";

  return { frequency, avgDays };
}
```

---

## 4. バッチ並列処理

複数アイテムを並列処理する汎用パターン。

```typescript
interface BatchResult<T> {
  item: T;
  result: any;
  error?: string;
}

type ProgressCallback = (
  stage: string,
  percent: number,
  current: number,
  total: number,
) => void;

export async function processBatches<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  options: {
    batchSize?: number;
    onProgress?: ProgressCallback;
    stageName?: string;
  } = {},
): Promise<BatchResult<T>[]> {
  const { batchSize = 5, onProgress, stageName = "処理中" } = options;

  const results: BatchResult<T>[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchEnd = Math.min(i + batchSize, total);

    // 進捗通知
    if (onProgress) {
      const percent = Math.round((i / total) * 100);
      onProgress(stageName, percent, i + 1, total);
    }

    // バッチ内を並列処理
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          const result = await processor(item);
          return { item, result, error: undefined };
        } catch (error) {
          return {
            item,
            result: null,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    results.push(...batchResults);
  }

  // 完了通知
  if (onProgress) {
    onProgress(stageName, 100, total, total);
  }

  return results;
}

// 使用例
const results = await processBatches(
  videos,
  async (video) => {
    const buffer = await downloadTikTokVideo(video.url);
    const analysis = await analyzeVideoWithGemini(buffer, video.id);
    return { analysis };
  },
  {
    batchSize: 5,
    stageName: "動画分析中",
    onProgress: (stage, percent, current, total) => {
      console.log(`${stage}... ${current}/${total} (${percent}%)`);
    },
  },
);
```

---

## 5. Gemini動画分析

Google Generative AIで動画を分析。

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

const ANALYSIS_PROMPT = `
この動画を分析して、以下の形式でレポートしてください：

### 動画内容
[1-2文で動画の内容を要約]

### タイムライン
| 秒数 | 内容 | 効果 |
|------|------|------|
| 0-2秒 | フック | [評価] |
| ... | ... | ... |

### バズ要因分析
- **フック力**: [10点満点] - [理由]
- **構成**: [10点満点] - [理由]
- **エンゲージメント誘導**: [10点満点] - [理由]

### 改善提案
1. [具体的な改善点]
2. [具体的な改善点]
`;

export async function analyzeVideoWithGemini(
  videoBuffer: Buffer,
  videoId: string,
): Promise<string | null> {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `video_${videoId}.mp4`);

  try {
    // 1. 一時ファイルとして保存
    fs.writeFileSync(tempPath, videoBuffer);

    // 2. FileManagerでアップロード
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: "video/mp4",
      displayName: `video_${videoId}.mp4`,
    });

    // 3. PROCESSING → ACTIVE を待機
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 2000));
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state !== "ACTIVE") {
      throw new Error(`File processing failed: ${file.state}`);
    }

    // 4. 分析実行
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
      { text: ANALYSIS_PROMPT },
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  } finally {
    // 5. 一時ファイル削除
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}
```

---

## 6. SSEストリーミング

Server-Sent Eventsでリアルタイム通信。

```typescript
// サーバー側（Next.js App Router）
export async function POST(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // ヘルパー関数
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const sendProgress = (stage: string, percent: number) => {
        send({ type: "progress", stage, percent });
      };

      try {
        // Step 1: プロフィール取得
        sendProgress("プロフィール取得中", 5);
        const userData = await getTikTokUserVideos(url);

        // Step 2: 動画分析
        sendProgress("動画分析中", 20);
        const analysisResults = await analyzeVideosInBatches(
          userData.videos,
          5,
          (stage, percent) => sendProgress(stage, 20 + percent * 0.6),
        );

        // Step 3: レポート生成
        sendProgress("レポート生成中", 85);
        const report = generateReport(stats, analysisResults);

        // Step 4: AI応答をストリーミング
        const chat = model.startChat({ systemInstruction: report });
        const result = await chat.sendMessageStream(userInput);

        for await (const chunk of result.stream) {
          send({
            choices: [{ delta: { content: chunk.text() } }],
          });
        }

        // 動画一覧を送信（UI用）
        send({
          type: "video_list",
          videos: videoListJson,
        });

        // 完了
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        send({ error: "処理中にエラーが発生しました" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

```typescript
// クライアント側
function useSSEChat() {
  const [messages, setMessages] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const sendMessage = async (input: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);

        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);

          if (parsed.type === "progress") {
            setProgress(parsed.percent);
          } else if (parsed.type === "video_list") {
            setVideos(parsed.videos);
          } else if (parsed.choices) {
            setMessages((prev) => prev + parsed.choices[0].delta.content);
          }
        } catch (e) {
          // JSONパースエラーは無視
        }
      }
    }
  };

  return { messages, progress, videos, sendMessage };
}
```

---

## 7. レポート生成

定量・定性レポートをMarkdownで生成。

```typescript
const BENCHMARKS = {
  lvr: { avg: 4.5, good: 6, bad: 3 },
  cvr: { avg: 0.2, good: 0.4, bad: 0.1 },
  svr: { avg: 0.15, good: 0.3, bad: 0.1 },
  saveRate: { avg: 0.5, good: 1.0, bad: 0.3 },
};

function getComparisonLabel(
  value: number,
  benchmark: typeof BENCHMARKS.lvr,
): string {
  if (value >= benchmark.good) return "🔥 優秀";
  if (value >= benchmark.avg) return "✅ 平均以上";
  if (value >= benchmark.bad) return "➖ 平均";
  return "⚠️ 要改善";
}

export function generateQuantitativeReport(stats: AccountStats): string {
  const formatNum = (n: number) => n.toLocaleString();
  const formatPct = (n: number) => n.toFixed(2) + "%";

  return `
## 定量分析

### 基本指標
| 指標 | 値 |
|------|------|
| 分析動画数 | ${stats.videoCount}件 |
| 総再生数 | ${formatNum(stats.totalViews)} |
| 平均再生数 | ${formatNum(Math.round(stats.averageViews))} |

### エンゲージメント率
| 指標 | 値 | 業界平均 | 評価 |
|------|------|----------|------|
| LVR（いいね率） | ${formatPct(stats.lvr)} | ${BENCHMARKS.lvr.avg}% | ${getComparisonLabel(stats.lvr, BENCHMARKS.lvr)} |
| CVR（コメント率） | ${formatPct(stats.cvr)} | ${BENCHMARKS.cvr.avg}% | ${getComparisonLabel(stats.cvr, BENCHMARKS.cvr)} |
| SVR（シェア率） | ${formatPct(stats.svr)} | ${BENCHMARKS.svr.avg}% | ${getComparisonLabel(stats.svr, BENCHMARKS.svr)} |
| 保存率 | ${formatPct(stats.saveRate)} | ${BENCHMARKS.saveRate.avg}% | ${getComparisonLabel(stats.saveRate, BENCHMARKS.saveRate)} |

### パフォーマンス分布
| 指標 | 値 |
|------|------|
| 最大再生数 | ${formatNum(stats.maxViews)} |
| 最小再生数 | ${formatNum(stats.minViews)} |
| 中央値 | ${formatNum(stats.medianViews)} |
| バズ率 | ${formatPct(stats.buzzRate)} |

### 投稿頻度
- 頻度: **${stats.postingFrequency}**
- 平均投稿間隔: ${stats.avgDaysBetweenPosts.toFixed(1)}日
`;
}

export function generateVideoRanking(
  videos: TikTokVideo[],
  analysisResults: VideoAnalysisResult[],
): { markdown: string; videoListJson: VideoItem[] } {
  // 再生数でソート
  const sorted = [...videos].sort(
    (a, b) => b.stats.playCount - a.stats.playCount,
  );

  const top3 = sorted.slice(0, 3);
  const worst = sorted[sorted.length - 1];

  const medals = ["🏆", "🥈", "🥉"];

  let markdown = `
## 動画ランキング

### Top 3
`;

  top3.forEach((video, i) => {
    const analysis = analysisResults.find((r) => r.videoId === video.id);
    markdown += `
${medals[i]} **#${i + 1}** - 再生数: ${video.stats.playCount.toLocaleString()}
- ${video.desc.slice(0, 50)}...
- LVR: ${((video.stats.likeCount / video.stats.playCount) * 100).toFixed(2)}%
`;
  });

  markdown += `
### 要改善動画
⚠️ 再生数: ${worst.stats.playCount.toLocaleString()}
- ${worst.desc.slice(0, 50)}...
`;

  // UI用のJSON
  const videoListJson: VideoItem[] = sorted.map((video) => {
    const analysis = analysisResults.find((r) => r.videoId === video.id);
    return {
      id: video.id,
      url: video.url,
      desc: video.desc,
      thumbnail: video.thumbnail || "",
      stats: video.stats,
      metrics: {
        lvr: (video.stats.likeCount / video.stats.playCount) * 100,
        cvr: (video.stats.commentCount / video.stats.playCount) * 100,
        svr: (video.stats.shareCount / video.stats.playCount) * 100,
        saveRate: (video.stats.collectCount / video.stats.playCount) * 100,
        totalER:
          ((video.stats.likeCount +
            video.stats.commentCount +
            video.stats.shareCount +
            video.stats.collectCount) /
            video.stats.playCount) *
          100,
      },
      analysis: analysis?.analysis || null,
      error: analysis?.error,
    };
  });

  return { markdown, videoListJson };
}
```

---

## まとめ

これらのコードは以下の特徴を持っています：

1. **モジュール化** - 各機能が独立しており再利用可能
2. **エラー耐性** - 部分的な失敗でも全体は継続
3. **型安全** - TypeScriptで型定義を明確化
4. **並列処理** - バッチ処理で効率的に実行
5. **ストリーミング** - リアルタイムでユーザーに進捗表示

他のプロジェクトでSNS分析機能を実装する際は、これらのパターンを参考にしてください。
