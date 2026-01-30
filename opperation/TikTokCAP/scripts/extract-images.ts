/**
 * xlsxファイルから画像を抽出し、行番号にマッピングするスクリプト
 *
 * 使い方:
 * npx tsx extract-images.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { XMLParser } from 'fast-xml-parser'

const BASE_DIR = path.join(__dirname, '../data/xlsx_extracted')
const MEDIA_DIR = path.join(BASE_DIR, 'xl/media')
const DRAWING_XML = path.join(BASE_DIR, 'xl/drawings/drawing1.xml')
const RELS_XML = path.join(BASE_DIR, 'xl/drawings/_rels/drawing1.xml.rels')
const OUTPUT_DIR = path.join(__dirname, '../data/images_by_row')

interface Relationship {
  '@_Id': string
  '@_Target': string
}

interface Anchor {
  'xdr:from': {
    'xdr:row': number
    'xdr:col': number
  }
  'xdr:pic': {
    'xdr:blipFill': {
      'a:blip': {
        '@_r:embed': string
      }
    }
  }
}

async function main() {
  console.log('📂 画像抽出を開始...')

  // 1. リレーションシップファイルを解析（rId → 画像ファイル）
  const relsXml = fs.readFileSync(RELS_XML, 'utf-8')
  const relsParser = new XMLParser({ ignoreAttributes: false })
  const relsData = relsParser.parse(relsXml)

  const relationships = relsData.Relationships.Relationship
  const rIdToImage: Record<string, string> = {}

  for (const rel of relationships) {
    const rId = rel['@_Id']
    const target = rel['@_Target'].replace('../media/', '')
    rIdToImage[rId] = target
  }

  console.log(`✅ リレーションシップ解析完了: ${Object.keys(rIdToImage).length} 件`)

  // 2. Drawing XMLを解析（行番号 → rId）
  const drawingXml = fs.readFileSync(DRAWING_XML, 'utf-8')
  const drawingParser = new XMLParser({ ignoreAttributes: false })
  const drawingData = drawingParser.parse(drawingXml)

  const anchors = drawingData['xdr:wsDr']['xdr:oneCellAnchor']
  const rowToImage: Record<number, string> = {}

  for (const anchor of anchors) {
    const row = anchor['xdr:from']['xdr:row'] + 1 // 0-indexed → 1-indexed
    const col = anchor['xdr:from']['xdr:col']

    // F列（col=5）の画像のみ対象
    if (col !== 5) continue

    const rId = anchor['xdr:pic']['xdr:blipFill']['a:blip']['@_r:embed']
    const imageFile = rIdToImage[rId]

    if (imageFile) {
      rowToImage[row] = imageFile
    }
  }

  console.log(`✅ 行→画像マッピング完了: ${Object.keys(rowToImage).length} 件`)

  // 3. 画像をコピー（行番号付きファイル名）
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const mappingResult: Array<{ row: number; originalFile: string; newFile: string }> = []

  for (const [rowStr, imageFile] of Object.entries(rowToImage)) {
    const row = parseInt(rowStr)
    const ext = path.extname(imageFile)
    const newFileName = `row_${row.toString().padStart(3, '0')}${ext}`
    const srcPath = path.join(MEDIA_DIR, imageFile)
    const destPath = path.join(OUTPUT_DIR, newFileName)

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      mappingResult.push({ row, originalFile: imageFile, newFile: newFileName })
    }
  }

  // 行番号でソート
  mappingResult.sort((a, b) => a.row - b.row)

  console.log(`✅ 画像コピー完了: ${mappingResult.length} 件 → ${OUTPUT_DIR}`)

  // 4. マッピングファイルを出力
  const mappingPath = path.join(__dirname, '../data/image-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(mappingResult, null, 2))
  console.log(`✅ マッピングファイル出力: ${mappingPath}`)

  // 5. サマリー表示
  console.log('\n📊 サマリー:')
  console.log(`   - 総画像数: ${mappingResult.length}`)
  console.log(`   - 行範囲: ${mappingResult[0]?.row} 〜 ${mappingResult[mappingResult.length - 1]?.row}`)
  console.log(`   - 出力先: ${OUTPUT_DIR}`)

  console.log('\n🔜 次のステップ:')
  console.log('   1. images_by_row/ フォルダをGoogle Driveにアップロード')
  console.log('   2. アップロード先のフォルダIDを取得')
  console.log('   3. write-urls.ts を実行してスプレッドシートに書き込み')
}

main().catch(console.error)
