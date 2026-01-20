import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set");
  console.error("Please set it in .env.local file:");
  console.error("GEMINI_API_KEY=your_api_key_here");
  process.exit(1);
}

const videoId = process.argv[2] || "W4YXD3zPUzc";

async function analyzeYouTubeVideo(videoId) {
  console.log(`\n📺 YouTube動画を分析中: ${videoId}\n`);

  // 1. Get transcript
  console.log("📝 字幕を取得中...");
  let transcript;
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "ja",
    });
    transcript = transcriptData.map((item) => item.text).join(" ");
    console.log(`✅ 字幕取得完了 (${transcript.length}文字)\n`);
  } catch (error) {
    console.error("❌ 字幕の取得に失敗しました:", error.message);
    console.log("英語字幕を試みます...");
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptData.map((item) => item.text).join(" ");
      console.log(`✅ 字幕取得完了 (${transcript.length}文字)\n`);
    } catch (error2) {
      console.error("❌ 字幕の取得に完全に失敗しました:", error2.message);
      process.exit(1);
    }
  }

  // 2. Analyze with Gemini
  console.log("🤖 Gemini APIで分析中...\n");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `あなたはマーケティングの専門家です。以下のYouTube動画の字幕を分析し、マーケティング学習者向けにわかりやすくまとめてください。

## 出力フォーマット

### 動画タイトル（推測）
[字幕から推測される動画のテーマ/タイトル]

### 要約
[3-5文で動画の主旨を要約]

### キーポイント
- [ポイント1]
- [ポイント2]
- [ポイント3]
（主要な学びを箇条書きで5-7個）

### マーケティング概念
[この動画で説明されているマーケティング概念や理論があれば説明]

### 実践への適用
[この知識を実務でどう活用できるか]

### 関連キーワード
[カンマ区切りで5-10個]

---

## 字幕テキスト:
${transcript}`;

  try {
    const result = await model.generateContent(prompt);
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

    const outputFile = path.join(outputDir, `${videoId}-analysis.md`);
    fs.writeFileSync(
      outputFile,
      `# YouTube動画分析結果

**Video ID:** ${videoId}
**URL:** https://www.youtube.com/watch?v=${videoId}
**分析日:** ${new Date().toISOString().split("T")[0]}

---

${analysis}

---

## 元の字幕テキスト

<details>
<summary>字幕を表示</summary>

${transcript}

</details>
`
    );

    console.log(`\n✅ 分析結果を保存しました: ${outputFile}\n`);

    return { analysis, transcript, videoId };
  } catch (error) {
    console.error("❌ Gemini分析に失敗しました:", error.message);
    process.exit(1);
  }
}

analyzeYouTubeVideo(videoId);
