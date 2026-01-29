/**
 * TikTok API テスト（修正後の構造）
 */

const RAPIDAPI_KEY = '64b6e140famshd084ac154d96681p142bbbjsncac563e58e50';

const TEST_URLS = [
  'https://www.tiktok.com/@seibun_otakuchan/video/7592943045163748629',  // 成分オタクちゃん
  'https://www.tiktok.com/@mayas_beautytalk/video/7593300481510804766',  // Maya grant
  'https://www.tiktok.com/@cosme_katari.club/video/7592165697858456853', // コスメ俱楽部
];

function toNum(v) {
  if (v === undefined || v === null || v === '') return '';
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : '';
}

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
    return { error: `HTTP ${response.status}` };
  }

  const json = await response.json();

  // 修正後の構造: トップレベルにstats
  if (!json || !json.stats) {
    return { error: 'No stats' };
  }

  const st = json.stats;
  return {
    sns: 'TikTok',
    title: json.description || '',
    view: toNum(st.views),
    like: toNum(st.likes),
    comment: toNum(st.comments),
    share: toNum(st.shares),
    save: toNum(st.saves),
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('TikTok API テスト（修正後）');
  console.log('='.repeat(60));

  for (const url of TEST_URLS) {
    console.log(`\n📹 ${url.split('/').pop()}`);
    console.log('-'.repeat(40));

    const info = await fetchTikTokInfo(url);

    if (info.error) {
      console.log(`❌ ${info.error}`);
      continue;
    }

    console.log(`✅ 再生数: ${info.view.toLocaleString()}`);
    console.log(`   いいね: ${info.like.toLocaleString()}`);
    console.log(`   コメント: ${info.comment.toLocaleString()}`);
    console.log(`   共有: ${info.share.toLocaleString()}`);
    console.log(`   保存: ${info.save.toLocaleString()}`);
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
