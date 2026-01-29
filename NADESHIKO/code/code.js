/**
 * URLを入れた行に、プラットフォームに応じてタイトル・再生数などを自動入力する
 * （YouTubeは公式API / TikTokは公開エンドポイントを想定）
 *
 * 対応カラム（csvと同じ並びを想定）
 * A:投稿日 | B:アカウント名 | C:PR/通常 | D:sns | E:担当者 | F:タイトル | G:URL | H:種別
 * I:更新日 | J:動画尺 | K:再生数 | L:いいね | M:コメント | N:共有 | O:保存
 * （P列以降：いいね率、コメント率、共有率、保存率、平均視聴時間、視聴維持率、継続率、フォロー率、おすすめ率）
 *
 * メニュー: シートを開いた際に「インサイト自動入力」を追加。
 * 手動実行: メニューの「今すぐ実行」を押すと、投稿リストのURLを読み、
 *            未入力の項目を埋めます（既存値は上書きしません）。
 *
 * 備考:
 * - InstagramはoEmbedでタイトルのみ取得し、数値系は空のままにしています。
 */

const INSIGHT_CONF = {
  SHEET: '1月',
START_ROW: 21,  // データ開始行（行1-16サマリー、行17-20ヘッダー）
  URL_COL: 7,  // G列（E列にアカウント追加により+1）
  // 必要列数（投稿日〜おすすめ率まで、A-AB列）
  MIN_COLS: 28,
DEFAULT_TYPE: '単品',
  // RapidAPI Key (TikTok / Instagram / X 共用)
  RAPIDAPI_KEY: '64b6e140famshd084ac154d96681p142bbbjsncac563e58e50',
  TZ: 'Asia/Tokyo',
  DAILY_SHEET_PROP: 'insight_daily_sheet',
  UPDATED_AT_COL: 9,  // I列（E列にアカウント追加により+1）
  // データ再取得の時間間隔（ミリ秒）
  // 24時間 = 24 * 60 * 60 * 1000
  // 12時間 = 12 * 60 * 60 * 1000
  // 6時間  = 6 * 60 * 60 * 1000
  UPDATE_INTERVAL_MS: 48 * 60 * 60 * 1000,  // 48時間（2日）
  // タイムアウト対策
  MAX_EXECUTION_MS: 5.5 * 60 * 1000,  // 最大実行時間: 5.5分（6分制限の余裕を持たせる）
  RESUME_PROP_KEY: 'insight_resume_state',  // 中断・再開用のスクリプトプロパティキー
  // 定時実行の時刻設定
  DAILY_TRIGGER_HOUR: 10  // 毎日の自動実行時刻（0〜23）
};

function onOpen() {
const ui = safeGetUi_();
if (!ui) return;
ui
  .createMenu('インサイト自動入力')
  .addItem('今すぐ実行（このシート）', 'insight_run_current_sheet')
  .addItem(`今すぐ実行（${INSIGHT_CONF.SHEET}シート）`, 'insight_run_test_sheet')
  .addSubMenu(
    ui.createMenu('sns指定で実行（このシート）')
      .addItem('YouTubeのみ', 'insight_run_current_sheet_youtube_only')
      .addItem('TikTokのみ', 'insight_run_current_sheet_tiktok_only')
      .addItem('Instagramのみ', 'insight_run_current_sheet_instagram_only')
      .addItem('X(Twitter)のみ', 'insight_run_current_sheet_x_only')
  )
  .addSeparator()
  .addItem('毎日10時の自動実行を設定', 'setupDailyTrigger')
  .addItem('自動実行を解除', 'removeDailyTrigger')
  .addToUi();
}

// メニューから実行：アクティブシートで実行
function insight_run_current_sheet() {
// 排他制御：同時実行を防止
const lock = LockService.getScriptLock();
if (!lock.tryLock(30000)) {
  uiAlert('別のスクリプトが実行中です。しばらくお待ちください。');
  return;
}

try {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  uiToast(`「${sheet.getName()}」シートでインサイト取得を開始します...`);
  insight_run_on_sheet(sheet);
} finally {
  lock.releaseLock();
}
}

// sns指定実行（このシート）
function insight_run_current_sheet_youtube_only() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();
uiToast(`「${sheet.getName()}」シートでYouTubeのみインサイト取得を開始します...`);
insight_run_on_sheet(sheet, ['YT']);
}
function insight_run_current_sheet_tiktok_only() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();
uiToast(`「${sheet.getName()}」シートでTikTokのみインサイト取得を開始します...`);
insight_run_on_sheet(sheet, ['TT']);
}
function insight_run_current_sheet_instagram_only() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();
uiToast(`「${sheet.getName()}」シートでInstagramのみインサイト取得を開始します...`);
insight_run_on_sheet(sheet, ['IG']);
}
function insight_run_current_sheet_x_only() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();
uiToast(`「${sheet.getName()}」シートでX(Twitter)のみインサイト取得を開始します...`);
insight_run_on_sheet(sheet, ['X']);
}

// メニューから実行：設定シート（INSIGHT_CONF.SHEET）で実行
function insight_run_test_sheet() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
let sheet = ss.getSheetByName(INSIGHT_CONF.SHEET);
if (!sheet) {
    uiAlert(`シート「${INSIGHT_CONF.SHEET}」が見つかりません。`);
    return;
  }
  uiToast(`「${INSIGHT_CONF.SHEET}」シートでインサイト取得を開始します...`);
  insight_run_on_sheet(sheet);
}

// Apps Script IDEの「実行」から直接呼ぶ用（メニューを押さずに動かしたい場合）
function insight_run_from_script() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Active spreadsheet not found.');
  const sheet = ss.getSheetByName(INSIGHT_CONF.SHEET);
  if (!sheet) throw new Error(`Sheet "${INSIGHT_CONF.SHEET}" not found.`);
  Logger.log(`Running insight on sheet "${sheet.getName()}" via script execution`);
  insight_run_on_sheet(sheet);
}

// 毎日9時の自動実行用：設定シート（INSIGHT_CONF.SHEET）で実行
// YouTubeとTikTokのみ対象（InstagramとX(Twitter)はタイムアウト回避のため除外）
// タイムアウト対策：途中で中断し、自動的に続きから再実行
function insight_run_daily() {
// 排他制御：同時実行を防止
const lock = LockService.getScriptLock();
if (!lock.tryLock(30000)) {  // 30秒待機してロック取得を試行
  Logger.log('Daily trigger: 別のスクリプトが実行中のためスキップします');
  return;
}

try {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dailyName = getDailySheetName_();
  let sheet = ss.getSheetByName(dailyName);
  if (!sheet) {
    Logger.log(`Daily trigger: Sheet "${dailyName}" not found.`);
    return;
  }
  Logger.log(`Daily trigger: Running on sheet "${dailyName}" (YouTube & TikTok only)`);
  insight_run_on_sheet_with_resume(sheet, ['YT', 'TT']);
} finally {
  lock.releaseLock();
}
}

// タイムアウト対策：中断・再開機能付きの実行
function insight_run_on_sheet_with_resume(sheet, allowedSns) {
const scriptProps = PropertiesService.getScriptProperties();
const startTime = Date.now();

// 前回の中断状態を取得
let resumeState = null;
try {
  const stateJson = scriptProps.getProperty(INSIGHT_CONF.RESUME_PROP_KEY);
  if (stateJson) {
    resumeState = JSON.parse(stateJson);
    Logger.log(`📂 前回の続きから再開: ソートインデックス ${resumeState.lastSortIdx} から`);
  }
} catch (e) {
  Logger.log(`Resume state parse error: ${e}`);
}

if (!sheet) {
  uiAlert('シートが指定されていません。');
  scriptProps.deleteProperty(INSIGHT_CONF.RESUME_PROP_KEY);
  return;
}

const allowedSet = Array.isArray(allowedSns) && allowedSns.length ? new Set(allowedSns) : null;
const lastRow = sheet.getLastRow();
if (lastRow < INSIGHT_CONF.START_ROW) {
  uiAlert('URLが入力された行がありません。');
  scriptProps.deleteProperty(INSIGHT_CONF.RESUME_PROP_KEY);
  return;
}

const width = Math.max(sheet.getLastColumn(), INSIGHT_CONF.MIN_COLS);
const nRows = lastRow - INSIGHT_CONF.START_ROW + 1;
const values = sheet.getRange(INSIGHT_CONF.START_ROW, 1, nRows, width).getValues();

// 処理順序をソート（TikTok→YouTube→IG→X、空白→日付古い順→エラー）
const sortedRows = sortRowsForProcessing_(values, allowedSet);
const totalRows = sortedRows.length;

// 開始インデックスを決定（前回の続きから or 最初から）
const startSortIdx = resumeState ? (resumeState.lastSortIdx + 1) : 0;

const startTimeStr = Utilities.formatDate(new Date(startTime), INSIGHT_CONF.TZ, 'HH:mm:ss');
const resumeMsg = resumeState ? `（${startSortIdx + 1}/${totalRows}から再開）` : '';
uiToast(`📊 インサイト取得開始 [${startTimeStr}]\n対象: ${totalRows - startSortIdx}件${resumeMsg}`);
Logger.log(`=== Insight run started on sheet "${sheet.getName()}" (${totalRows - startSortIdx} items) at ${startTimeStr} ${resumeMsg} ===`);
Logger.log(`📊 処理順序ソート完了: ${totalRows}件（TT→YT→IG→X、更新日順）`);

let urlCount = 0;
let resolvedCount = 0;
let skippedCount = 0;
const triedUrls = [];

const updatedAtIdx = INSIGHT_CONF.UPDATED_AT_COL - 1;
const maxAgeMs = INSIGHT_CONF.UPDATE_INTERVAL_MS;

let lastSortIdx = resumeState ? resumeState.lastSortIdx : -1;
let isTimeout = false;

for (let sortIdx = startSortIdx; sortIdx < sortedRows.length; sortIdx++) {
  // タイムアウトチェック
  if (Date.now() - startTime > INSIGHT_CONF.MAX_EXECUTION_MS) {
    Logger.log(`⏱️ タイムアウト間近のため中断します`);
    isTimeout = true;
    break;
  }
  
  const meta = sortedRows[sortIdx];
  const row = meta.row;
  const url = meta.url;
  const rowNum = meta.rowNum;
  const sns = meta.sns;
  
  lastSortIdx = sortIdx;
  urlCount++;
  triedUrls.push(url);
  
  const lastUpdatedValue = row[updatedAtIdx];
  if (lastUpdatedValue) {
    // 「エラー」の場合はスキップ（手動で削除するまで再取得しない）
    if (String(lastUpdatedValue).trim() === 'エラー') {
      skippedCount++;
      Logger.log(`⏭️ [${sortIdx + 1}/${totalRows}] 行${rowNum} エラー行をスキップ`);
      continue;
    }
    const parsed = new Date(lastUpdatedValue);
    if (!Number.isNaN(parsed.getTime())) {
      const age = Date.now() - parsed.getTime();
      if (age < maxAgeMs) {
        skippedCount++;
        Logger.log(`⏭️ [${sortIdx + 1}/${totalRows}] 行${rowNum} スキップ（${Math.round(age / 3600000)}時間前更新）`);
        continue;
      }
    }
  }
  
  const snsIcon = sns === 'YT' ? '📺' : sns === 'TT' ? '🎵' : sns === 'IG' ? '📸' : sns === 'X' ? '🐦' : '❓';
  const snsName = sns === 'YT' ? 'YouTube' : sns === 'TT' ? 'TikTok' : sns === 'IG' ? 'Instagram' : sns === 'X' ? 'X(Twitter)' : 'Unknown';
  
  const progressMsg = `${snsIcon} [${sortIdx + 1}/${totalRows}] ${snsName} 行${rowNum} 取得中...`;
  uiToast(progressMsg);
  Logger.log(`\n${'='.repeat(60)}\n${progressMsg}\nURL: ${url}\n${'='.repeat(60)}`);
  
  let info;
  try {
    info = fetchInsightForUrl_(url);
  } catch (e) {
    Logger.log(`❌ [${sortIdx + 1}/${totalRows}] 行${rowNum} 取得エラー: ${e}`);
    uiToast(`❌ [${sortIdx + 1}/${totalRows}] ${snsName} エラー`);
    try {
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
      SpreadsheetApp.flush();
    } catch (_) {}
    continue;
  }
  
  if (!info) {
    Logger.log(`⚠️ [${sortIdx + 1}/${totalRows}] 行${rowNum} データなし`);
    try {
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
      SpreadsheetApp.flush();
    } catch (_) {}
    continue;
  }
  
  resolvedCount++;
  
  // D〜O列のデータ（E列アカウントは保持、G列URLは保持、I列更新日は別途）
  const slice = row.slice(3, 15);  // D列(idx3)〜O列(idx14)
  slice[0] = info.sns || '';                                      // D: sns
  // slice[1] はアカウント（E列、保持）
  slice[2] = info.title || slice[2];                              // F: タイトル
  // slice[3] はURL（G列、保持）
  slice[4] = info.type || slice[4] || INSIGHT_CONF.DEFAULT_TYPE;  // H: 種別
  // slice[5] は更新日（I列、別途書き込み）
  slice[6] = info.durationSec || slice[6] || '';                  // J: 動画尺
  slice[7] = (info.view !== undefined && info.view !== null && info.view !== '') ? info.view : slice[7];    // K: 再生数
  slice[8] = (info.like !== undefined && info.like !== null && info.like !== '') ? info.like : slice[8];      // L: いいね
  slice[9] = (info.comment !== undefined && info.comment !== null && info.comment !== '') ? info.comment : slice[9]; // M: コメント
  slice[10] = (info.share !== undefined && info.share !== null && info.share !== '') ? info.share : slice[10]; // N: 共有
  slice[11] = (info.save !== undefined && info.save !== null && info.save !== '') ? info.save : slice[11];    // O: 保存
  
  try {
    // D〜H列（sns, アカウント, タイトル, URL, 種別）を書き込み
    sheet.getRange(rowNum, 4, 1, 5).setValues([slice.slice(0, 5)]);
    // J〜O列（動画尺, 再生数, いいね, コメント, 共有, 保存）を書き込み
    sheet.getRange(rowNum, 10, 1, 6).setValues([slice.slice(6, 12)]);
    const formatted = Utilities.formatDate(new Date(), INSIGHT_CONF.TZ, 'yyyy/MM/dd HH:mm:ss');
    sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue(formatted);
    SpreadsheetApp.flush();
    Logger.log(`✅ [${sortIdx + 1}/${totalRows}] 行${rowNum} シートに反映完了 (再生数: ${info.view || 'N/A'})`);
    if (resolvedCount % 5 === 0) {
      uiToast(`✅ [${sortIdx + 1}/${totalRows}] ${resolvedCount}件更新完了`);
    }
  } catch (writeErr) {
    Logger.log(`❌ [${sortIdx + 1}/${totalRows}] 行${rowNum} 書き込みエラー: ${writeErr}`);
    uiToast(`❌ [${sortIdx + 1}/${totalRows}] 書き込みエラー`);
    try {
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
      SpreadsheetApp.flush();
    } catch (_) {}
  }
}

// タイムアウトした場合は状態を保存し、次回実行をトリガー
if (isTimeout) {
  const newState = {
    sheetName: sheet.getName(),
    lastSortIdx: lastSortIdx,
    allowedSns: allowedSns,
    timestamp: new Date().toISOString()
  };
  scriptProps.setProperty(INSIGHT_CONF.RESUME_PROP_KEY, JSON.stringify(newState));
  Logger.log(`💾 中断状態を保存: ソートインデックス ${lastSortIdx} まで処理完了`);
  
  // 1分後に自動再実行をトリガー
  ScriptApp.newTrigger('insight_run_daily_resume')
    .timeBased()
    .after(1 * 60 * 1000)
    .create();
  
  const msg = `⏱️ タイムアウト対策で中断\n✅ 更新: ${resolvedCount}件\n📝 続きは1分後に自動実行されます`;
  uiToast(msg);
  Logger.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`);
  return;
}

// 完了：状態をクリア
scriptProps.deleteProperty(INSIGHT_CONF.RESUME_PROP_KEY);

const elapsedSec = Math.round((Date.now() - startTime) / 1000);
const elapsedMin = Math.floor(elapsedSec / 60);
const elapsedStr = elapsedMin > 0 ? `${elapsedMin}分${elapsedSec % 60}秒` : `${elapsedSec}秒`;
const msg = `🎉 完了！「${sheet.getName()}」\n✅ 更新: ${resolvedCount}行\n⏭️ スキップ: ${skippedCount}行\n📊 合計URL: ${urlCount}件\n⏱️ 処理時間: ${elapsedStr}`;
uiToast(msg);
Logger.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`);

if (resolvedCount === 0 && triedUrls.length) {
  Logger.log(`tried urls: ${triedUrls.join(', ')}`);
}
}

// 自動再開用の関数（トリガーから呼ばれる）
function insight_run_daily_resume() {
// まず、このトリガー自体を削除
const triggers = ScriptApp.getProjectTriggers();
for (const trigger of triggers) {
  if (trigger.getHandlerFunction() === 'insight_run_daily_resume') {
    ScriptApp.deleteTrigger(trigger);
  }
}

// 続きから実行
const scriptProps = PropertiesService.getScriptProperties();
let resumeState = null;
try {
  const stateJson = scriptProps.getProperty(INSIGHT_CONF.RESUME_PROP_KEY);
  if (stateJson) {
    resumeState = JSON.parse(stateJson);
  }
} catch (e) {
  Logger.log(`Resume state parse error: ${e}`);
  return;
}

if (!resumeState) {
  Logger.log('No resume state found');
  return;
}

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName(resumeState.sheetName);
if (!sheet) {
  Logger.log(`Sheet "${resumeState.sheetName}" not found`);
  scriptProps.deleteProperty(INSIGHT_CONF.RESUME_PROP_KEY);
  return;
}

Logger.log(`🔄 自動再開: ${resumeState.lastProcessedRow}行目から続行`);
insight_run_on_sheet_with_resume(sheet, resumeState.allowedSns);
}

// 実際の処理：指定されたシートで実行
function insight_run_on_sheet(sheet, allowedSns) {
if (!sheet) {
  uiAlert('シートが指定されていません。');
  return;
}
const allowedSet = Array.isArray(allowedSns) && allowedSns.length ? new Set(allowedSns) : null;

const lastRow = sheet.getLastRow();
if (lastRow < INSIGHT_CONF.START_ROW) {
  uiAlert('URLが入力された行がありません。');
  return;
  }

const width = Math.max(sheet.getLastColumn(), INSIGHT_CONF.MIN_COLS);
const nRows = lastRow - INSIGHT_CONF.START_ROW + 1;
const values = sheet.getRange(INSIGHT_CONF.START_ROW, 1, nRows, width).getValues();

  // 処理開始メッセージ
  const startTime = Date.now();
  const startTimeStr = Utilities.formatDate(new Date(startTime), INSIGHT_CONF.TZ, 'HH:mm:ss');
  uiToast(`📊 インサイト取得開始 [${startTimeStr}]\n対象: ${nRows}行`);
  Logger.log(`=== Insight run started on sheet "${sheet.getName()}" (${nRows} rows) at ${startTimeStr} ===`);

let urlCount = 0;
let resolvedCount = 0;
let skippedCount = 0;
const triedUrls = [];

const updatedAtIdx = INSIGHT_CONF.UPDATED_AT_COL - 1;
const maxAgeMs = INSIGHT_CONF.UPDATE_INTERVAL_MS;

// 処理順序をソート（TikTok→YouTube→IG→X、空白→日付古い順→エラー）
const sortedRows = sortRowsForProcessing_(values, allowedSet);
const totalRows = sortedRows.length;
Logger.log(`📊 処理順序ソート完了: ${totalRows}件（TT→YT→IG→X、更新日順）`);

sortedRows.forEach((meta, sortIdx) => {
  const row = meta.row;
  const url = meta.url;
  const rowNum = meta.rowNum;
  const sns = meta.sns;
  
  urlCount++;
  triedUrls.push(url);
  
  const lastUpdatedValue = row[updatedAtIdx];
  if (lastUpdatedValue) {
    // 「エラー」の場合はスキップ（手動で削除するまで再取得しない）
    if (String(lastUpdatedValue).trim() === 'エラー') {
      skippedCount++;
      Logger.log(`⏭️ [${sortIdx + 1}/${totalRows}] 行${rowNum} エラー行をスキップ`);
      return;
    }
    const parsed = new Date(lastUpdatedValue);
    if (!Number.isNaN(parsed.getTime())) {
      const age = Date.now() - parsed.getTime();
      if (age < maxAgeMs) {
        skippedCount++;
        Logger.log(`⏭️ [${sortIdx + 1}/${totalRows}] 行${rowNum} スキップ（${Math.round(age / 3600000)}時間前更新）`);
        return;
      }
    }
  }
  const snsIcon = sns === 'YT' ? '📺' : sns === 'TT' ? '🎵' : sns === 'IG' ? '📸' : sns === 'X' ? '🐦' : '❓';
  const snsName = sns === 'YT' ? 'YouTube' : sns === 'TT' ? 'TikTok' : sns === 'IG' ? 'Instagram' : sns === 'X' ? 'X(Twitter)' : 'Unknown';
    
    // 処理開始メッセージ（目立つ形式）
    const progressMsg = `${snsIcon} [${sortIdx + 1}/${totalRows}] ${snsName} 行${rowNum} 取得中...`;
    uiToast(progressMsg);
    Logger.log(`\n${'='.repeat(60)}\n${progressMsg}\nURL: ${url}\n${'='.repeat(60)}`);

  let info;
  try {
      info = fetchInsightForUrl_(url);
  } catch (e) {
    Logger.log(`❌ [${sortIdx + 1}/${totalRows}] 行${rowNum} 取得エラー: ${e}`);
      uiToast(`❌ [${sortIdx + 1}/${totalRows}] ${snsName} エラー`);
    // I列に「エラー」を記載
    try {
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
      SpreadsheetApp.flush();
    } catch (_) {}
    return;
  }
    if (!info) {
      Logger.log(`⚠️ [${sortIdx + 1}/${totalRows}] 行${rowNum} データなし`);
    // I列に「エラー」を記載
    try {
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
      SpreadsheetApp.flush();
    } catch (_) {}
      return;
    }
  resolvedCount++;

    // sns〜保存を最新データで上書きする
    // D〜H列（5列）とJ〜O列（6列）に分けて書き込む（I列は更新日のためスキップ）
    const slice = row.slice(3, 15);  // D列(idx3)〜O列(idx14)
    // D列の既存値は見ず、URLから判定したsnsのみ書き込む
    slice[0] = info.sns || '';                                      // D: sns
    // slice[1] はアカウント（E列、保持）
    slice[2] = info.title || slice[2];                              // F: タイトル
    // slice[3] はURL（G列、保持）
    slice[4] = info.type || slice[4] || INSIGHT_CONF.DEFAULT_TYPE;  // H: 種別
    // slice[5] は 更新日（I列、ここでは更新しない）
    // J列以降のデータ
    slice[6] = info.durationSec || slice[6] || '';                  // J: 動画尺（秒）
    slice[7] = (info.view !== undefined && info.view !== null && info.view !== '') ? info.view : slice[7];    // K: 再生数
    slice[8] = (info.like !== undefined && info.like !== null && info.like !== '') ? info.like : slice[8];      // L: いいね
    slice[9] = (info.comment !== undefined && info.comment !== null && info.comment !== '') ? info.comment : slice[9]; // M: コメント
    slice[10] = (info.share !== undefined && info.share !== null && info.share !== '') ? info.share : slice[10]; // N: 共有
    slice[11] = (info.save !== undefined && info.save !== null && info.save !== '') ? info.save : slice[11];    // O: 保存

    // データ取得後すぐにシートに書き込む（タイムアウト対策）
    try {
      // D〜H列（sns, アカウント, タイトル, URL, 種別）を書き込み
      sheet.getRange(rowNum, 4, 1, 5).setValues([slice.slice(0, 5)]);
      // J〜O列（動画尺, 再生数, いいね, コメント, 共有, 保存）を書き込み
      sheet.getRange(rowNum, 10, 1, 6).setValues([slice.slice(6, 12)]);
      // I列に更新日を書き込み
      const formatted = Utilities.formatDate(new Date(), INSIGHT_CONF.TZ, 'yyyy/MM/dd HH:mm:ss');
      sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue(formatted);
      // 即座に反映させる（リアルタイム更新）
      SpreadsheetApp.flush();
      Logger.log(`✅ [${sortIdx + 1}/${totalRows}] 行${rowNum} シートに反映完了 (再生数: ${info.view || 'N/A'})`);
      // 進捗状況を定期的に通知（5件ごと）
      if (resolvedCount % 5 === 0) {
        uiToast(`✅ [${sortIdx + 1}/${totalRows}] ${resolvedCount}件更新完了`);
      }
    } catch (writeErr) {
      Logger.log(`❌ [${sortIdx + 1}/${totalRows}] 行${rowNum} 書き込みエラー: ${writeErr}`);
      uiToast(`❌ [${sortIdx + 1}/${totalRows}] 書き込みエラー`);
      // I列に「エラー」を記載
      try {
        sheet.getRange(rowNum, INSIGHT_CONF.UPDATED_AT_COL, 1, 1).setValue('エラー');
        SpreadsheetApp.flush();
      } catch (_) {}
    }
});

// 完了メッセージ
  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedStr = elapsedMin > 0 ? `${elapsedMin}分${elapsedSec % 60}秒` : `${elapsedSec}秒`;
  const msg = `🎉 完了！「${sheet.getName()}」\n✅ 更新: ${resolvedCount}行\n⏭️ スキップ: ${skippedCount}行\n📊 合計URL: ${urlCount}件\n⏱️ 処理時間: ${elapsedStr}`;
  uiToast(msg);
  Logger.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`);
if (resolvedCount === 0 && triedUrls.length) {
  Logger.log(`tried urls: ${triedUrls.join(', ')}`);
}
}

// URLからプラットフォームに応じた情報を取得
function fetchInsightForUrl_(url) {
const sns = detectPlatform_(url);
if (!sns) {
  Logger.log(`platform not detected: ${url}`);
  return null;
}
if (sns === 'YT') return fetchYouTubeInfo_(url);
if (sns === 'TT') return fetchTikTokInfo_(url);
if (sns === 'IG') {
  // RapidAPIレート制限対策: 10秒待機
  Utilities.sleep(10000);
  return fetchInstagramInfoWithRetry_(url);
}
  if (sns === 'X') {
    return fetchXInfo_(url);
}
return null;
}

function detectPlatform_(url) {
const s = sanitizeUrl_(url);
try {
  const u = new URL(s);
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  if (host.includes('youtube.com') || host === 'youtu.be' || host === 'm.youtube.com') return 'YT';
  if (host.includes('tiktok.com')) return 'TT';
  if (host.includes('instagram.com')) return 'IG';
    if (host.includes('twitter.com') || host === 'x.com') return 'X';
} catch (_) {}
// new URL に失敗した場合も素朴に判定
const low = s.toLowerCase();
if (low.includes('youtube.com') || low.includes('youtu.be')) return 'YT';
if (low.includes('tiktok.com')) return 'TT';
if (low.includes('instagram.com')) return 'IG';
  if (low.includes('twitter.com') || low.includes('x.com')) return 'X';
return null;
}

// ===== YouTube =====
function fetchYouTubeInfo_(url) {
const id = extractYouTubeId_(url);
if (!id) return null;
const resp = YouTube.Videos.list('snippet,statistics,contentDetails', { id });
const item = resp.items && resp.items[0];
if (!item) return null;

const sn = item.snippet || {};
const st = item.statistics || {};
const cd = item.contentDetails || {};
return {
  sns: 'YT',
  title: sn.title || '',
  view: toNum_(st.viewCount),
  like: toNum_(st.likeCount),
  comment: toNum_(st.commentCount),
  share: '',
  save: '',
  durationSec: parseDuration_(cd.duration),
  type: INSIGHT_CONF.DEFAULT_TYPE
};
}

function extractYouTubeId_(input) {
if (input == null) return '';
let s = sanitizeUrl_(input);
if (/^[A-Za-z0-9_-]{6,}$/.test(s) && !/^https?:/i.test(s)) return s;
try {
  const u = new URL(s);
  const host = u.hostname.replace(/^www\./i, '').toLowerCase();
  if (host === 'youtu.be') {
    const m = u.pathname.match(/^\/([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
  }
  if (host.endsWith('youtube.com') || host === 'm.youtube.com') {
    if (u.pathname === '/watch') { const v = u.searchParams.get('v'); if (v) return v; }
    const m = u.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/);
    if (m) return m[2];
  }
} catch (_) {}
const re1 = /[?&]v=([A-Za-z0-9_-]{6,})/i.exec(s);
if (re1) return re1[1];
const re2 = /\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/i.exec(s);
if (re2) return re2[2];
return '';
}

// ===== TikTok =====
// tiktok-video-downloader-api (RapidAPI) を使用
function fetchTikTokInfo_(url) {
  // URL をエンコードしてAPIに渡す
  const encodedUrl = encodeURIComponent(sanitizeUrl_(url));
  const apiUrl = `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodedUrl}`;

  const options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'X-RapidAPI-Key': INSIGHT_CONF.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com'
    }
  };

  let json;
  try {
    const res = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = res.getResponseCode();

    if (responseCode !== 200) {
      Logger.log(`TikTok RapidAPI status ${responseCode} for ${url}`);
      // 公式APIにフォールバック
      const id = extractTikTokId_(url);
      if (id) {
        const fallback = fetchTikTokViaWeb_(id, url);
        if (fallback) return fallback;
      }
      return { sns: 'TikTok', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '' };
    }

    const responseText = res.getContentText('utf-8');
    if (!responseText || responseText.trim() === '') {
      Logger.log(`TikTok RapidAPI empty response for ${url}`);
      return { sns: 'TikTok', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '' };
    }

    json = JSON.parse(responseText);
  } catch (e) {
    Logger.log(`TikTok RapidAPI error for ${url}: ${e.message || e}`);
    return { sns: 'TikTok', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '' };
  }

  // tiktok-video-downloader-api のレスポンス構造: トップレベルにstats
  // フィールド名: views, likes, comments, shares, saves
  if (!json || !json.stats) {
    Logger.log(`TikTok no stats for ${url}`);
    return { sns: 'TikTok', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '' };
  }

  const st = json.stats;
  Logger.log(`TikTok API response for ${url}: views=${st.views}, likes=${st.likes}, shares=${st.shares}, saves=${st.saves}`);
  return {
    sns: 'TikTok',
    title: json.description || '',
    view: toNum_(st.views),
    like: toNum_(st.likes),
    comment: toNum_(st.comments),
    share: toNum_(st.shares),
    save: toNum_(st.saves),
    durationSec: '',  // このAPIはdurationを返さない
    type: INSIGHT_CONF.DEFAULT_TYPE
  };
}

function extractTikTokId_(input) {
if (!input) return '';
const cleaned = sanitizeUrl_(input);
try {
  const u = new URL(cleaned);
  // パス例: /@user/video/1234567890 または /@user/photo/1234567890
  const m = u.pathname.match(/\/(video|photo)\/(\d+)/);
  if (m) return m[2];
} catch (_) {}
const re = /(\d{8,})/.exec(cleaned);
return re ? re[1] : '';
}

// vt.tiktok.com などの短縮URLをリダイレクト解決
function resolveTikTokUrl_(url) {
try {
  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    followRedirects: false,
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const code = res.getResponseCode();
  if (code >= 300 && code < 400) {
    const headers = res.getAllHeaders();
    const loc = headers.Location || headers.location || '';
    if (loc) {
      return sanitizeUrl_(loc);
    }
  }
} catch (e) {
  Logger.log(`resolveTikTokUrl_ error for ${url}: ${e}`);
}
return url;
}

// RapidAPIで取れないときのフォールバック（公式Web API）
function fetchTikTokViaWeb_(id, urlForLog) {
const apiUrl = `https://www.tiktok.com/api/item/detail/?itemId=${id}`;
const headers = { 
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
  'Referer': 'https://www.tiktok.com/'
};
try {
  const res = UrlFetchApp.fetch(apiUrl, {
    method: 'get',
    muteHttpExceptions: true,
    headers
  });
  const responseCode = res.getResponseCode();
  if (responseCode !== 200) {
    Logger.log(`TikTok fallback status ${responseCode} for ${urlForLog}`);
    return null;
  }
  
  const responseText = res.getContentText('utf-8');
  if (!responseText || responseText.trim() === '') {
    Logger.log(`TikTok fallback empty response for ${urlForLog}`);
    return null;
  }
  
  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    Logger.log(`TikTok fallback JSON parse error for ${urlForLog}: ${parseError}`);
    Logger.log(`Response preview (first 500 chars): ${responseText.slice(0, 500)}`);
    return null;
  }
  
  const item = json && json.itemInfo && json.itemInfo.itemStruct;
  if (!item) {
    Logger.log(`TikTok fallback no itemStruct for ${urlForLog}`);
    Logger.log(`Response structure: ${JSON.stringify(Object.keys(json || {})).slice(0, 200)}`);
    return null;
  }
  const st = item.stats || {};
  return {
    sns: 'TikTok',
    title: item.desc || '',
    view: toNum_(st.playCount),
    like: toNum_(st.diggCount),
    comment: toNum_(st.commentCount),
    share: toNum_(st.shareCount),
    save: toNum_(st.collectCount),
    durationSec: toNum_(item.video && item.video.duration),
    type: INSIGHT_CONF.DEFAULT_TYPE
  };
} catch (e) {
  Logger.log(`TikTok fallback error for ${urlForLog}: ${e.message || e}`);
  Logger.log(`Error stack: ${e.stack || 'N/A'}`);
  return null;
}
}

// ===== Instagram =====
// instagram-scraper-stable-api (RapidAPI) を使用

// リトライ付きラッパー（レート制限対策）
function fetchInstagramInfoWithRetry_(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = fetchInstagramInfo_(url);

    // 成功した場合（データがある場合）
    if (result && (result.view !== '' || result.title !== '')) {
      return result;
    }

    // 最後の試行でなければ待機して再試行
    if (attempt < maxRetries) {
      const waitMs = attempt * 15000; // 15秒、30秒、45秒
      Logger.log(`IG retry ${attempt}/${maxRetries}: waiting ${waitMs/1000}s...`);
      Utilities.sleep(waitMs);
    }
  }

  // 全リトライ失敗
  Logger.log(`IG all ${maxRetries} retries failed for ${url}`);
  return { sns: 'IG', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
}

function fetchInstagramInfo_(url) {
  Logger.log(`Instagram RapidAPI fetch for ${url}`);
  const encodedUrl = encodeURIComponent(sanitizeUrl_(url));
  const apiUrl = `https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php?reel_post_code_or_url=${encodedUrl}&type=reel`;

  const options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'X-RapidAPI-Key': INSIGHT_CONF.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
    }
  };

  let json;
  try {
    const res = UrlFetchApp.fetch(apiUrl, options);
    if (res.getResponseCode() !== 200) {
      Logger.log(`IG RapidAPI status ${res.getResponseCode()} for ${url}`);
      return { sns: 'IG', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
    }
    json = JSON.parse(res.getContentText('utf-8') || '{}');
  } catch (e) {
    Logger.log(`IG RapidAPI error for ${url}: ${e.message || e}`);
    return { sns: 'IG', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  if (json.error) {
    Logger.log(`IG RapidAPI error: ${json.error}`);
    return { sns: 'IG', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  // instagram-scraper-stable-api のレスポンス構造: data.xdt_shortcode_media
  const media = (json.data && json.data.xdt_shortcode_media) || {};
  if (!media || Object.keys(media).length === 0) {
    Logger.log(`IG no media data for ${url}`);
    return { sns: 'IG', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  // キャプション取得
  const edgeCaption = media.edge_media_to_caption || {};
  let caption = '';
  if (edgeCaption.edges && edgeCaption.edges.length > 0) {
    caption = (edgeCaption.edges[0].node || {}).text || '';
  }

  // いいね数（-1の場合は非表示）
  const edgeLike = media.edge_media_preview_like || {};
  let likes = edgeLike.count;
  if (likes === -1) likes = '';

  // コメント数
  const edgeComment = media.edge_media_to_parent_comment || media.edge_media_to_comment || {};
  const comments = edgeComment.count || 0;

  return {
    sns: 'IG',
    title: caption,
    view: toNum_(media.video_play_count || media.video_view_count),
    like: toNum_(likes),
    comment: toNum_(comments),
    share: '',
    save: '',
    durationSec: toNum_(media.video_duration),
    type: INSIGHT_CONF.DEFAULT_TYPE
  };
}

// ===== utilities =====
function extractInstagramShortcode_(url) {
const s = sanitizeUrl_(url);
const m = /instagram\.com\/(?:p|reel)\/([^/?#]+)/i.exec(s);
return m ? m[1] : '';
}

// URL末尾の/やクエリ・ハッシュを除去し正規化
function normalizeInstagramUrl_(u) {
try {
  const x = new URL(String(u || '').trim());
    // RapidAPIが https://... を要求するため、httpはhttpsへ強制変換
    x.protocol = 'https:';
  x.hash = '';
  x.search = '';
    
    // /@username/reel/ID または /username/reel/ID → /reel/ID
    // /@username/p/ID または /username/p/ID → /p/ID
    // 例: /choa_cosme/reel/DPQsPHOkXeV/ → /reel/DPQsPHOkXeV/
    let path = x.pathname;
    const match = path.match(/^\/?@?([^/]+)\/(reel|p)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const type = match[2];  // 'reel' or 'p'
      const id = match[3];    // shortcode
      path = `/${type}/${id}`;
      Logger.log(`IG URL normalized: ${u} → https://www.instagram.com${path}`);
      return `https://www.instagram.com${path}`;
    }
    
  return x.href.replace(/\/$/, '');
} catch (_) {
    const s = String(u || '').trim().replace(/^http:\/\//i, 'https://').replace(/[#?].*$/, '').replace(/\/$/, '');
    // フォールバック: regex で直接処理
    const match = s.match(/instagram\.com\/?@?([^/]+)\/(reel|p)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const type = match[2];
      const id = match[3];
      Logger.log(`IG URL normalized (fallback): ${u} → https://www.instagram.com/${type}/${id}`);
      return `https://www.instagram.com/${type}/${id}`;
    }
    return s;
  }
}

// ===== X(Twitter) =====
// twitter241 (RapidAPI) を使用
function fetchXInfo_(url) {
  Logger.log(`X(Twitter) RapidAPI fetch for ${url}`);

  // ツイートIDを抽出
  const tweetId = extractTweetId_(url);
  if (!tweetId) {
    Logger.log(`X: Could not extract tweet ID from ${url}`);
    return { sns: 'X(Twitter)', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  const apiUrl = `https://twitter241.p.rapidapi.com/tweet-v2?pid=${tweetId}`;
  const options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'X-RapidAPI-Key': INSIGHT_CONF.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'twitter241.p.rapidapi.com'
    }
  };

  let json;
  try {
    const res = UrlFetchApp.fetch(apiUrl, options);
    if (res.getResponseCode() !== 200) {
      Logger.log(`X RapidAPI status ${res.getResponseCode()} for ${url}`);
      return { sns: 'X(Twitter)', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
    }
    json = JSON.parse(res.getContentText('utf-8') || '{}');
  } catch (e) {
    Logger.log(`X RapidAPI error for ${url}: ${e.message || e}`);
    return { sns: 'X(Twitter)', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  // twitter241 のレスポンス構造: result.tweetResult.result
  const tweetResult = (json.result && json.result.tweetResult && json.result.tweetResult.result) || {};
  if (!tweetResult || Object.keys(tweetResult).length === 0) {
    Logger.log(`X no tweetResult for ${url}`);
    return { sns: 'X(Twitter)', title: '', view: '', like: '', comment: '', share: '', save: '', durationSec: '', type: INSIGHT_CONF.DEFAULT_TYPE };
  }

  const legacy = tweetResult.legacy || {};
  const viewsObj = tweetResult.views || {};
  const viewCount = viewsObj.count;

  return {
    sns: 'X(Twitter)',
    title: legacy.full_text || '',
    view: toNum_(viewCount),
    like: toNum_(legacy.favorite_count),
    comment: toNum_(legacy.reply_count),
    share: toNum_(legacy.retweet_count),
    save: toNum_(legacy.bookmark_count),
    durationSec: '',
    type: INSIGHT_CONF.DEFAULT_TYPE
  };
}

// ツイートIDをURLから抽出
function extractTweetId_(url) {
  if (!url) return '';
  const s = sanitizeUrl_(url);
  const m = /status\/(\d+)/.exec(s);
  return m ? m[1] : '';
}

// 入力用: https付与 + x.com統一 + status/<id>を拾って標準化
function normalizeXUrlForInput_(u) {
  if (!u) return null;
  let s = String(u).trim();
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const x = new URL(s);
    x.protocol = 'https:'; // httpをhttpsへ
    const m = x.pathname.match(/status\/(\d+)/);
    if (m) return `https://x.com/i/web/status/${m[1]}`;
    x.hostname = x.hostname.replace('twitter.com', 'x.com');
    x.hash = '';
    x.search = '';
    return x.href.replace(/\/$/, '');
  } catch (_) {
    const idMatch = s.match(/status\/(\d+)/);
    if (idMatch) return `https://x.com/i/web/status/${idMatch[1]}`;
    return null;
  }
}

function parseDuration_(iso) {
if (!iso) return '';
const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
if (!m) return '';
const h = Number(m[1] || 0);
const min = Number(m[2] || 0);
const s = Number(m[3] || 0);
return h * 3600 + min * 60 + s;
}

function toNum_(v) {
if (v === undefined || v === null || v === '') return '';
const n = Number(String(v).replace(/,/g, ''));
return Number.isFinite(n) ? n : '';
}

function sanitizeUrl_(s) {
return String(s || '')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\u3000/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
}

function pickFirst_(...vals) {
for (const v of vals) {
  if (v === undefined || v === null) continue;
  const s = (typeof v === 'string') ? v.trim() : v;
  if (s === '') continue;
  return s;
}
return '';
}

function extractTikTokData_(json) {
if (!json) return null;
// パターン1: json.itemInfo.itemStruct (実際のAPIレスポンス構造)
if (json.itemInfo && json.itemInfo.itemStruct) return json.itemInfo.itemStruct;
// パターン2: json.data.itemInfo.itemStruct
if (json.data && json.data.itemInfo && json.data.itemInfo.itemStruct) return json.data.itemInfo.itemStruct;
// パターン3: その他の構造
const d = json.data || json.item || json.itemInfo;
if (d) {
  const itemInfo = d.item || d.itemInfo || d.item_info;
  if (itemInfo && itemInfo.itemStruct) return itemInfo.itemStruct;
  if (d.item_struct) return d.item_struct;
  if (d.itemStruct) return d.itemStruct;
  if (Array.isArray(d.aweme_details) && d.aweme_details.length) return d.aweme_details[0];
  if (d.aweme_detail) return d.aweme_detail;
  return d;
}
// パターン4: { aweme_detail: {...} }
if (json.aweme_detail) return json.aweme_detail;
if (Array.isArray(json.aweme_details) && json.aweme_details.length) return json.aweme_details[0];
return null;
}

// Ui が取れないコンテキスト（時間トリガーなど）でも例外を出さないようにする
function safeGetUi_() {
try {
  return SpreadsheetApp.getUi();
} catch (e) {
  Logger.log(`safeGetUi_: UI unavailable (${e})`);
  return null;
}
}

function getScriptProp_(key) {
try {
  return PropertiesService.getScriptProperties().getProperty(key);
} catch (_) {
  return '';
}
}

function getDailySheetName_() {
// 1. ScriptPropertiesに設定があればそれを使用
const savedName = getScriptProp_(INSIGHT_CONF.DAILY_SHEET_PROP);
if (savedName) {
  return savedName;
}

// 2. 設定がなければ現在の月名（例: "1月", "2月"）を自動判定
const currentMonth = new Date().getMonth() + 1;  // 0-indexed → 1-indexed
const currentMonthSheetName = `${currentMonth}月`;

// 3. 現在月のシートが存在するか確認
try {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(currentMonthSheetName)) {
    return currentMonthSheetName;
  }
} catch (_) {}

// 4. フォールバック: デフォルト設定
return INSIGHT_CONF.SHEET;
}

function setDailySheetName_(name) {
try {
  PropertiesService.getScriptProperties().setProperty(INSIGHT_CONF.DAILY_SHEET_PROP, name);
} catch (_) {}
}

function uiAlert(msg) { try { Browser.msgBox(String(msg)); } catch (_) {} }
function uiToast(msg) { try { SpreadsheetApp.getActive().toast(String(msg), 'インサイト取得', 5); } catch (_) {} }

// ===== 処理順ソート =====
// SNS優先度: TikTok(0) → YouTube(1) → IG(2) → X(3) → その他(4)
function getSnsPriority_(sns) {
  const priorities = { 'TT': 0, 'YT': 1, 'IG': 2, 'X': 3 };
  return priorities[sns] !== undefined ? priorities[sns] : 4;
}

// 更新日の優先度を返す（小さいほど先に処理）
// 空白: 0, 日付: タイムスタンプ（古いほど小さい）, エラー: Infinity
function getUpdatedAtPriority_(value) {
  if (!value || String(value).trim() === '') return 0;  // 空白は最優先
  if (String(value).trim() === 'エラー') return Infinity;  // エラーは最後
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();  // 日付は古い順
  return Infinity;  // パースできない場合は最後
}

// 行データをソートするための比較関数
// { row, rowNum, sns, updatedAtPriority } の配列をソート
function compareRowsForProcessing_(a, b) {
  // 1. SNS優先度で比較（TikTok → YouTube → IG → X）
  const snsDiff = getSnsPriority_(a.sns) - getSnsPriority_(b.sns);
  if (snsDiff !== 0) return snsDiff;
  
  // 2. 更新日優先度で比較（空白 → 日付古い順 → エラー）
  return a.updatedAtPriority - b.updatedAtPriority;
}

// 処理対象の行をソートして返す
function sortRowsForProcessing_(values, allowedSet) {
  const urlIdx = INSIGHT_CONF.URL_COL - 1;
  const updatedAtIdx = INSIGHT_CONF.UPDATED_AT_COL - 1;
  
  const rowsWithMeta = [];
  values.forEach((row, idx) => {
    const url = String(row[urlIdx] || '').trim();
    if (!url) return;  // URLがない行はスキップ
    
    const sns = detectPlatform_(url);
    if (allowedSet && !allowedSet.has(sns)) return;  // 対象外SNSはスキップ
    
    rowsWithMeta.push({
      row: row,
      originalIdx: idx,
      rowNum: INSIGHT_CONF.START_ROW + idx,
      url: url,
      sns: sns,
      updatedAtPriority: getUpdatedAtPriority_(row[updatedAtIdx])
    });
  });
  
  // ソート
  rowsWithMeta.sort(compareRowsForProcessing_);
  
  return rowsWithMeta;
}

// ===== トリガー設定 =====

// 毎日9時の自動実行トリガーを設定
function setupDailyTrigger() {
  try {
    // 既存のトリガーを削除
    removeDailyTrigger();

    // シート名を入力（キャンセル時は中断）
    const defaultName = getDailySheetName_();
    const resp = Browser.inputBox('毎日9時に実行するシート名を入力してください', defaultName, Browser.Buttons.OK_CANCEL);
    if (resp === 'cancel') {
      uiAlert('設定をキャンセルしました。');
      return;
    }
    const sheetName = String(resp || '').trim() || INSIGHT_CONF.SHEET;
    setDailySheetName_(sheetName);
    
    // 新しいトリガーを作成
    const triggerHour = INSIGHT_CONF.DAILY_TRIGGER_HOUR;
    ScriptApp.newTrigger('insight_run_daily')
      .timeBased()
      .atHour(triggerHour)
      .everyDays(1)
      .inTimezone(INSIGHT_CONF.TZ)
      .create();
    
    uiAlert(`毎日${triggerHour}時（${INSIGHT_CONF.TZ}）に「${sheetName}」シートで自動実行するよう設定しました。`);
    Logger.log(`Daily trigger created successfully at ${triggerHour}:00 for sheet "${sheetName}"`);
  } catch (e) {
    uiAlert(`トリガー設定中にエラーが発生しました: ${e}`);
    Logger.log(`Error setting up daily trigger: ${e}`);
  }
}

// 毎日の自動実行トリガーを解除
function removeDailyTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let removedCount = 0;
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'insight_run_daily') {
        ScriptApp.deleteTrigger(trigger);
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      uiAlert(`毎日の自動実行を解除しました（${removedCount}件）。`);
      Logger.log(`Removed ${removedCount} daily trigger(s)`);
    } else {
      uiAlert('設定されている自動実行トリガーはありません。');
      Logger.log('No daily triggers found to remove');
    }
  } catch (e) {
    uiAlert(`トリガー解除中にエラーが発生しました: ${e}`);
    Logger.log(`Error removing daily trigger: ${e}`);
  }
}

