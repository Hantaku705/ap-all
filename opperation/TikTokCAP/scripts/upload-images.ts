/**
 * 画像をimgBBにアップロードしてURLを取得するスクリプト
 *
 * 使い方:
 * 1. imgBB APIキーを取得: https://api.imgbb.com/
 * 2. 環境変数に設定: export IMGBB_API_KEY=your_key
 * 3. 実行: npx tsx upload-images.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const IMAGES_DIR = path.join(__dirname, '../data/images_by_row')
const MAPPING_FILE = path.join(__dirname, '../data/image-mapping.json')
const OUTPUT_FILE = path.join(__dirname, '../data/image-urls.json')

interface ImageMapping {
  row: number
  originalFile: string
  newFile: string
}

interface UploadResult {
  row: number
  url: string
  deleteUrl?: string
}

async function uploadToImgBB(imagePath: string, apiKey: string): Promise<{ url: string; deleteUrl: string } | null> {
  const imageData = fs.readFileSync(imagePath)
  const base64 = imageData.toString('base64')

  const formData = new FormData()
  formData.append('key', apiKey)
  formData.append('image', base64)

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      return {
        url: result.data.url,
        deleteUrl: result.data.delete_url,
      }
    } else {
      console.error('Upload failed:', result)
      return null
    }
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}

async function main() {
  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    console.error('❌ IMGBB_API_KEY が設定されていません')
    console.log('\n以下の手順で設定してください:')
    console.log('1. https://api.imgbb.com/ でアカウント作成')
    console.log('2. APIキーを取得')
    console.log('3. export IMGBB_API_KEY=your_key')
    console.log('4. 再度実行')
    process.exit(1)
  }

  console.log('📤 画像アップロードを開始...')

  // マッピングファイルを読み込み
  const mappings: ImageMapping[] = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'))
  console.log(`📁 ${mappings.length} 件の画像を処理します`)

  const results: UploadResult[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i]
    const imagePath = path.join(IMAGES_DIR, mapping.newFile)

    process.stdout.write(`\r⏳ アップロード中: ${i + 1}/${mappings.length} (行 ${mapping.row})`)

    const result = await uploadToImgBB(imagePath, apiKey)

    if (result) {
      results.push({
        row: mapping.row,
        url: result.url,
        deleteUrl: result.deleteUrl,
      })
      successCount++
    } else {
      failCount++
    }

    // レート制限対策: 100ms待機
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n')
  console.log(`✅ 成功: ${successCount} 件`)
  console.log(`❌ 失敗: ${failCount} 件`)

  // 結果を保存
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2))
  console.log(`📄 結果を保存: ${OUTPUT_FILE}`)
}

main().catch(console.error)
