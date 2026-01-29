/**
 * TikTok API テストスクリプト
 * Node.jsで実行: node test-tiktok-api.js
 */

const RAPIDAPI_KEY = '64b6e140famshd084ac154d96681p142bbbjsncac563e58e50';

// テスト用TikTok URL（CSVから取得）
const TEST_URLS = [
  'https://www.tiktok.com/@seibun_otakuchan/video/7592943045163748629',  // 成分オタクちゃん
  'https://www.tiktok.com/@mayas_beautytalk/video/7593300481510804766',  // Maya grant
  'https://www.tiktok.com/@cosme_katari.club/video/7592165697858456853', // コスメ俱楽部（再生数空白の行）
];

async function fetchTikTokInfo(url) {
  const encodedUrl = encodeURIComponent(url);
  const apiUrl = `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodedUrl}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    console.log(`❌ HTTP ${response.status} for ${url}`);
    return null;
  }

  const json = await response.json();
  const data = json.data || json;

  if (!data) {
    console.log(`❌ No data for ${url}`);
    return null;
  }

  const st = data.statistics || data.stats || {};

  return {
    title: data.title || data.desc || '',
    playCount: st.playCount || st.play_count,
    diggCount: st.diggCount || st.digg_count,
    commentCount: st.commentCount || st.comment_count,
    shareCount: st.shareCount || st.share_count,
    collectCount: st.collectCount || st.collect_count,
    duration: data.duration,
    rawStats: st,  // デバッグ用
  };
}

function toNum(v) {
  if (v === undefined || v === null || v === '') return '';
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : '';
}

// 修正前の条件（バグあり）
function shouldUpdateOld(value) {
  return value !== undefined && value !== null;
}

// 修正後の条件
function shouldUpdateNew(value) {
  return value !== undefined && value !== null && value !== '';
}

async function main() {
  console.log('='.repeat(60));
  console.log('TikTok API テスト');
  console.log('='.repeat(60));

  for (const url of TEST_URLS) {
    console.log(`\n📹 URL: ${url}`);
    console.log('-'.repeat(60));

    try {
      const info = await fetchTikTokInfo(url);

      if (!info) {
        console.log('❌ データ取得失敗');
        continue;
      }

      console.log(`📊 タイトル: ${info.title?.slice(0, 50)}...`);
      console.log(`📊 再生数 (raw): ${info.playCount}`);
      console.log(`📊 いいね (raw): ${info.diggCount}`);
      console.log(`📊 コメント (raw): ${info.commentCount}`);
      console.log(`📊 共有 (raw): ${info.shareCount}`);
      console.log(`📊 保存 (raw): ${info.collectCount}`);

      // toNum変換後
      const viewNum = toNum(info.playCount);
      console.log(`\n🔄 toNum(再生数): "${viewNum}" (型: ${typeof viewNum})`);

      // 条件テスト
      const existingValue = 123456;  // 既存データがあると仮定

      const resultOld = shouldUpdateOld(viewNum) ? viewNum : existingValue;
      const resultNew = shouldUpdateNew(viewNum) ? viewNum : existingValue;

      console.log(`\n🧪 修正前の条件: ${shouldUpdateOld(viewNum)} → 結果: ${resultOld}`);
      console.log(`🧪 修正後の条件: ${shouldUpdateNew(viewNum)} → 結果: ${resultNew}`);

      if (viewNum === '') {
        console.log(`\n⚠️ 注意: APIが再生数を返していません！`);
        console.log(`   修正前: 既存データ(${existingValue})を空文字で上書き → ${resultOld}`);
        console.log(`   修正後: 既存データ(${existingValue})を保持 → ${resultNew}`);
      }

    } catch (e) {
      console.log(`❌ エラー: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('テスト完了');
  console.log('='.repeat(60));
}

main();
