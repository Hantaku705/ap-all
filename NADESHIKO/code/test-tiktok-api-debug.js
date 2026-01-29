/**
 * TikTok API デバッグスクリプト
 * レスポンス全体を出力して構造を確認
 */

const RAPIDAPI_KEY = '64b6e140famshd084ac154d96681p142bbbjsncac563e58e50';

const TEST_URL = 'https://www.tiktok.com/@seibun_otakuchan/video/7592943045163748629';

async function main() {
  console.log('='.repeat(60));
  console.log('TikTok API レスポンス詳細');
  console.log('='.repeat(60));
  console.log(`URL: ${TEST_URL}\n`);

  const encodedUrl = encodeURIComponent(TEST_URL);
  const apiUrl = `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodedUrl}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com'
    }
  });

  console.log(`HTTP Status: ${response.status}`);

  const json = await response.json();
  console.log('\n📦 レスポンス全体:');
  console.log(JSON.stringify(json, null, 2));

  // 構造を探索
  console.log('\n\n📊 構造分析:');
  console.log('トップレベルキー:', Object.keys(json));

  if (json.data) {
    console.log('json.data キー:', Object.keys(json.data));
    if (json.data.statistics) {
      console.log('json.data.statistics:', json.data.statistics);
    }
    if (json.data.stats) {
      console.log('json.data.stats:', json.data.stats);
    }
  }
}

main().catch(console.error);
