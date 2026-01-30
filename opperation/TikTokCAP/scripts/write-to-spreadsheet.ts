/**
 * スプレッドシートF列に画像URLを書き込む
 *
 * 使い方: このスクリプトの出力をコピーしてMCPに渡す
 */

import * as fs from 'fs'
import * as path from 'path'

const dataPath = path.join(__dirname, '../data/f-column-update.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

console.log(`Total rows: ${data.length}`)
console.log(`Rows with URLs: ${data.filter((r: string[]) => r[0]).length}`)
console.log(`Empty rows: ${data.filter((r: string[]) => !r[0]).length}`)

// 書き込み範囲の確認
console.log(`\nRange: ALL!F4:F${3 + data.length} (${data.length} rows)`)
