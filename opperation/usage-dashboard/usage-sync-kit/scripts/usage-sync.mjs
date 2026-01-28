#!/usr/bin/env node

/**
 * Claude Code 使用時間 Supabase同期スクリプト
 *
 * history.jsonlを解析し、日別の使用時間をSupabaseにUPSERT
 *
 * 環境変数:
 *   SUPABASE_URL: Supabase URL
 *   SUPABASE_KEY: Service Role Key
 *
 * 使用方法:
 *   node usage-sync.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { homedir, hostname, userInfo } from 'os'
import { join } from 'path'

const HISTORY_FILE = join(homedir(), '.claude', 'history.jsonl')
const LAST_SYNC_FILE = join(homedir(), '.claude', 'usage-last-sync.txt')
const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000 // 30分

/**
 * 環境変数チェック
 */
function checkEnvVars() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY

  if (!url || !key) {
    console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required')
    console.error('')
    console.error('Set them in your shell profile (~/.zshrc or ~/.bashrc):')
    console.error('  export SUPABASE_URL="https://your-project.supabase.co"')
    console.error('  export SUPABASE_KEY="your-service-role-key"')
    console.error('')
    process.exit(1)
  }

  return { url, key }
}

/**
 * 最終同期時刻を取得
 */
function getLastSyncTime() {
  if (!existsSync(LAST_SYNC_FILE)) {
    return null
  }
  const content = readFileSync(LAST_SYNC_FILE, 'utf-8').trim()
  return parseInt(content, 10) || null
}

/**
 * 最終同期時刻を保存
 */
function saveLastSyncTime(timestamp) {
  writeFileSync(LAST_SYNC_FILE, timestamp.toString())
}

/**
 * history.jsonlを読み込んでパース
 */
function loadHistory(sinceTimestamp = null) {
  if (!existsSync(HISTORY_FILE)) {
    console.error('Error: history.jsonl not found')
    process.exit(1)
  }

  const content = readFileSync(HISTORY_FILE, 'utf-8')
  const lines = content.trim().split('\n').filter(line => line.trim())

  const events = lines.map(line => {
    try {
      return JSON.parse(line)
    } catch {
      return null
    }
  }).filter(Boolean)

  // 最終同期以降のイベントのみ
  if (sinceTimestamp) {
    return events.filter(e => e.timestamp > sinceTimestamp)
  }

  return events
}

/**
 * セッション別に使用時間を計算
 */
function calculateSessionTimes(events) {
  const sessions = new Map()

  for (const event of events) {
    const { sessionId, timestamp } = event
    if (!sessionId || !timestamp) continue

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, [])
    }
    sessions.get(sessionId).push(timestamp)
  }

  const sessionTimes = []

  for (const [sessionId, timestamps] of sessions) {
    timestamps.sort((a, b) => a - b)

    let activeTimeMs = 0

    for (let i = 1; i < timestamps.length; i++) {
      const interval = timestamps[i] - timestamps[i - 1]
      if (interval < INACTIVITY_THRESHOLD_MS) {
        activeTimeMs += interval
      }
    }

    if (timestamps.length === 1) {
      activeTimeMs = 60 * 1000
    }

    sessionTimes.push({
      sessionId,
      startTime: new Date(timestamps[0]),
      activeTimeMs
    })
  }

  return sessionTimes
}

/**
 * 日別の使用時間を集計
 */
function aggregateByDay(sessionTimes) {
  const dailyStats = new Map()

  for (const session of sessionTimes) {
    const dateStr = session.startTime.toISOString().split('T')[0]

    if (!dailyStats.has(dateStr)) {
      dailyStats.set(dateStr, { minutes: 0, sessions: 0 })
    }

    const stats = dailyStats.get(dateStr)
    stats.minutes += Math.round(session.activeTimeMs / 60000)
    stats.sessions += 1
  }

  return dailyStats
}

/**
 * SupabaseにUPSERT
 */
async function syncToSupabase(dailyStats, supabaseUrl, supabaseKey) {
  const userId = `${userInfo().username}@${hostname()}`
  const user = userInfo().username
  const host = hostname()

  const records = []

  for (const [date, stats] of dailyStats) {
    records.push({
      user_id: userId,
      hostname: host,
      username: user,
      date,
      minutes: stats.minutes,
      sessions: stats.sessions,
      last_sync: new Date().toISOString()
    })
  }

  if (records.length === 0) {
    console.log('No new data to sync')
    return
  }

  console.log(`Syncing ${records.length} days of data...`)

  // UPSERT（user_id, date で一意）
  const response = await fetch(`${supabaseUrl}/rest/v1/usage_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(records)
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Sync failed:', response.status, error)
    process.exit(1)
  }

  console.log(`✓ Successfully synced ${records.length} days`)

  // 期間サマリー
  const totalMinutes = records.reduce((sum, r) => sum + r.minutes, 0)
  const totalSessions = records.reduce((sum, r) => sum + r.sessions, 0)
  console.log(`  Total: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m (${totalSessions} sessions)`)
}

/**
 * メイン処理
 */
async function main() {
  const { url, key } = checkEnvVars()

  const lastSync = getLastSyncTime()
  const events = loadHistory(lastSync)

  if (events.length === 0) {
    console.log('No new events since last sync')
    return
  }

  console.log(`Found ${events.length} new events`)

  const sessionTimes = calculateSessionTimes(events)
  const dailyStats = aggregateByDay(sessionTimes)

  await syncToSupabase(dailyStats, url, key)

  // 最新のタイムスタンプを保存
  const maxTimestamp = Math.max(...events.map(e => e.timestamp))
  saveLastSyncTime(maxTimestamp)

  console.log('')
  console.log('Last sync time saved')
}

main().catch(console.error)
