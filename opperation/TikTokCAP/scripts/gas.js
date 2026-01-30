/**
 * Google Apps Script: 画像フォルダからURLを取得してスプレッドシートに書き込む
 *
 * 使い方:
 * 1. 画像をGoogle Driveにアップロード（フォルダ名: TikTok_Product_Images）
 * 2. スプレッドシートで 拡張機能 → Apps Script
 * 3. このコードを貼り付けて保存
 * 4. writeImageUrls() を実行
 */

const FOLDER_NAME = 'TikTok_Product_Images';
const SHEET_NAME = 'ALL';
const URL_COLUMN = 7;

function writeImageUrls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log('シート "' + SHEET_NAME + '" が見つかりません');
    return;
  }

  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!folders.hasNext()) {
    Logger.log('フォルダ "' + FOLDER_NAME + '" が見つかりません');
    return;
  }

  const folder = folders.next();
  Logger.log('フォルダを発見: ' + folder.getName());

  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const files = folder.getFiles();
  const imageMap = {};

  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const match = fileName.match(/row_(\d+)\./);

    if (match) {
      const row = parseInt(match[1], 10);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileId = file.getId();
      imageMap[row] = 'https://drive.google.com/uc?id=' + fileId;
      Logger.log('行 ' + row + ': ' + imageMap[row]);
    }
  }

  const rows = Object.keys(imageMap).map(Number).sort((a, b) => a - b);
  let writeCount = 0;

  for (const row of rows) {
    sheet.getRange(row, URL_COLUMN).setValue(imageMap[row]);
    writeCount++;
  }

  Logger.log('完了: ' + writeCount + ' 件のURLを書き込みました');
  SpreadsheetApp.getUi().alert('完了: ' + writeCount + ' 件のURLを書き込みました');
}

function listFiles() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!folders.hasNext()) {
    Logger.log('フォルダが見つかりません');
    return;
  }

  const folder = folders.next();
  const files = folder.getFiles();

  Logger.log('=== フォルダ内のファイル ===');
  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file.getName());
  }
}
