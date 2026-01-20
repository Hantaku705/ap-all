import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set");
  process.exit(1);
}

const videoPath = process.argv[2];
const videoId = process.argv[3] || "unknown";

if (!videoPath) {
  console.error("Usage: node analyze-video-gemini.mjs <video_path> [video_id]");
  process.exit(1);
}

async function analyzeVideoWithGemini(videoPath, videoId) {
  console.log(`\n🎬 動画を分析中: ${videoPath}\n`);

  const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

  // 1. Upload video
  console.log("📤 動画をアップロード中...");
  const uploadResult = await fileManager.uploadFile(videoPath, {
    mimeType: "video/mp4",
    displayName: `video-${videoId}.mp4`,
  });

  console.log(`✅ アップロード完了: ${uploadResult.file.name}`);

  // 2. Wait for processing
  console.log("⏳ 動画の処理を待機中...");
  let file = await fileManager.getFile(uploadResult.file.name);
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes max

  while (file.state === "PROCESSING" && attempts < maxAttempts) {
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 2000));
    file = await fileManager.getFile(uploadResult.file.name);
    attempts++;
  }
  console.log("");

  if (file.state !== "ACTIVE") {
    console.error(`❌ 動画処理失敗: ${file.state}`);
    process.exit(1);
  }

  console.log("✅ 動画処理完了\n");

  // 3. Analyze with Gemini
  console.log("🤖 Gemini APIで分析中...\n");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `あなたはマーケティングの専門家です。この動画を詳しく分析し、マーケティング学習者向けにわかりやすくまとめてください。

## 出力フォーマット

### 動画タイトル（推測）
[動画の内容から推測されるタイトル]

### 要約
[3-5文で動画の主旨を要約]

### キーポイント
- [ポイント1]
- [ポイント2]
- [ポイント3]
（主要な学びを箇条書きで5-7個）

### マーケティング概念
[この動画で説明されているマーケティング概念や理論を詳しく説明]

### 具体例・事例
[動画内で紹介された具体例や事例があれば記載]

### 実践への適用
[この知識を実務でどう活用できるか]

### 関連キーワード
[カンマ区切りで5-10個]

### カテゴリ
[以下から最も適切なものを1つ選択]
- basics（マーケティング基礎）
- analysis（分析フレームワーク）
- strategy（戦略・WHO/WHAT/HOW）
- practice（実践・ケーススタディ）`;

  try {
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
      { text: prompt },
    ]);

    const analysis = result.response.text();

    console.log("=".repeat(60));
    console.log("📊 分析結果");
    console.log("=".repeat(60));
    console.log(analysis);
    console.log("=".repeat(60));

    // Save to file
    const outputDir = path.join(process.cwd(), "analysis-output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `${videoId}-video-analysis.md`);
    fs.writeFileSync(
      outputFile,
      `# YouTube動画分析結果

**Video ID:** ${videoId}
**URL:** https://www.youtube.com/watch?v=${videoId}
**分析日:** ${new Date().toISOString().split("T")[0]}
**分析方法:** Gemini 2.0 Flash (動画直接分析)

---

${analysis}
`
    );

    console.log(`\n✅ 分析結果を保存しました: ${outputFile}\n`);

    // Clean up uploaded file
    try {
      await fileManager.deleteFile(uploadResult.file.name);
      console.log("🗑️ アップロードファイルを削除しました\n");
    } catch (e) {
      // Ignore delete errors
    }

    return { analysis, videoId };
  } catch (error) {
    console.error("❌ Gemini分析に失敗しました:", error.message);
    process.exit(1);
  }
}

analyzeVideoWithGemini(videoPath, videoId);
