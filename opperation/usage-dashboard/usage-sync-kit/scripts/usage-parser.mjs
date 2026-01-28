#!/usr/bin/env node

/**
 * Claude Code 使用時間解析スクリプト
 *
 * history.jsonlを解析し、セッション別・日別の使用時間を計算
 *
 * 使用方法:
 *   node usage-parser.mjs [--json] [--sync]
 *
 * オプション:
 *   --json  JSON形式で出力
 *   --sync  同期用データを出力（日別集計）
 */

import { readFileSync, existsSync } from 'fs'
import { homedir, hostname, userInfo } from 'os'
import { join } from 'path'

const HISTORY_FILE = join(homedir(), '.claude', 'history.jsonl')
const STATS_CACHE_FILE = join(homedir(), '.claude', 'stats-cache.json')
const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000 // 30分

/**
 * history.jsonlを読み込んでパース
 */
function loadHistory() {
  if (!existsSync(HISTORY_FILE)) {
    console.error('Error: history.jsonl not found')
    process.exit(1)
  }

  const content = readFileSync(HISTORY_FILE, 'utf-8')
  const lines = content.trim().split('\n').filter(line => line.trim())

  return lines.map(line => {
    try {
      return JSON.parse(line)
    } catch {
      return null
    }
  }).filter(Boolean)
}

/**
 * セッション別に使用時間を計算
 * 30分以上の入力間隔は非活動時間として除外
 */
function calculateSessionTimes(events) {
  // sessionId別にグループ化
  const sessions = new Map()

  for (const event of events) {
    const { sessionId, timestamp } = event
    if (!sessionId || !timestamp) continue

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, [])
    }
    sessions.get(sessionId).push(timestamp)
  }

  // 各セッションの活動時間を計算
  const sessionTimes = []

  for (const [sessionId, timestamps] of sessions) {
    // タイムスタンプをソート
    timestamps.sort((a, b) => a - b)

    let activeTimeMs = 0

    for (let i = 1; i < timestamps.length; i++) {
      const interval = timestamps[i] - timestamps[i - 1]

      // 30分未満の間隔のみカウント
      if (interval < INACTIVITY_THRESHOLD_MS) {
        activeTimeMs += interval
      }
    }

    // 最初の入力も1分としてカウント（最低限の活動）
    if (timestamps.length === 1) {
      activeTimeMs = 60 * 1000 // 1分
    }

    sessionTimes.push({
      sessionId,
      startTime: new Date(timestamps[0]),
      endTime: new Date(timestamps[timestamps.length - 1]),
      activeTimeMs,
      inputCount: timestamps.length
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
 * 期間別の集計
 */
function aggregateByPeriod(dailyStats) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // 今週の開始日（月曜日）
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // 今月の開始日
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  let todayMinutes = 0, todaySessions = 0
  let weekMinutes = 0, weekSessions = 0
  let monthMinutes = 0, monthSessions = 0
  let totalMinutes = 0, totalSessions = 0

  for (const [date, stats] of dailyStats) {
    totalMinutes += stats.minutes
    totalSessions += stats.sessions

    if (date === today) {
      todayMinutes += stats.minutes
      todaySessions += stats.sessions
    }

    if (date >= weekStartStr) {
      weekMinutes += stats.minutes
      weekSessions += stats.sessions
    }

    if (date >= monthStartStr) {
      monthMinutes += stats.minutes
      monthSessions += stats.sessions
    }
  }

  return {
    today: { minutes: todayMinutes, sessions: todaySessions },
    week: { minutes: weekMinutes, sessions: weekSessions },
    month: { minutes: monthMinutes, sessions: monthSessions },
    total: { minutes: totalMinutes, sessions: totalSessions }
  }
}

/**
 * 分を時間:分形式に変換
 */
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}分`
  }
  return `${hours}時間${mins}分`
}

/**
 * トークン数をフォーマット（K/M/B表記）
 */
function formatTokens(tokens) {
  if (tokens >= 1_000_000_000) {
    return `${(tokens / 1_000_000_000).toFixed(1)}B`
  } else if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`
  }
  return tokens.toString()
}

/**
 * stats-cache.json からトークン情報を取得
 */
function loadTokenStats() {
  if (!existsSync(STATS_CACHE_FILE)) {
    return null
  }

  try {
    const content = readFileSync(STATS_CACHE_FILE, 'utf-8')
    const stats = JSON.parse(content)

    let totalInput = 0
    let totalOutput = 0

    if (stats.modelUsage) {
      for (const model in stats.modelUsage) {
        const usage = stats.modelUsage[model]
        totalInput += usage.inputTokens || 0
        totalOutput += usage.outputTokens || 0
      }
    }

    return {
      inputTokens: totalInput,
      outputTokens: totalOutput,
      totalTokens: totalInput + totalOutput
    }
  } catch {
    return null
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2)
  const jsonOutput = args.includes('--json')
  const syncOutput = args.includes('--sync')

  const events = loadHistory()
  const sessionTimes = calculateSessionTimes(events)
  const dailyStats = aggregateByDay(sessionTimes)
  const periodStats = aggregateByPeriod(dailyStats)

  const userId = `${userInfo().username}@${hostname()}`

  // 最終セッション
  const lastSession = sessionTimes.length > 0
    ? sessionTimes.sort((a, b) => b.startTime - a.startTime)[0]
    : null

  if (syncOutput) {
    // 同期用：日別データをJSON出力
    const syncData = {
      userId,
      hostname: hostname(),
      username: userInfo().username,
      dailyStats: Object.fromEntries(dailyStats),
      generatedAt: new Date().toISOString()
    }
    console.log(JSON.stringify(syncData, null, 2))
    return
  }

  if (jsonOutput) {
    const tokenStats = loadTokenStats()
    const result = {
      userId,
      hostname: hostname(),
      username: userInfo().username,
      stats: periodStats,
      tokens: tokenStats,
      lastSession: lastSession ? {
        startTime: lastSession.startTime.toISOString(),
        endTime: lastSession.endTime.toISOString(),
        activeMinutes: Math.round(lastSession.activeTimeMs / 60000)
      } : null,
      generatedAt: new Date().toISOString()
    }
    console.log(JSON.stringify(result, null, 2))
    return
  }

  // トークン情報を取得
  const tokenStats = loadTokenStats()

  // テキスト出力
  console.log('')
  console.log('📊 Claude Code 使用時間レポート')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`ユーザー: ${userId}`)
  console.log('')
  console.log('⏱️  使用時間')
  console.log(`  📅 今日: ${formatDuration(periodStats.today.minutes)}（${periodStats.today.sessions}セッション）`)
  console.log(`  📆 今週: ${formatDuration(periodStats.week.minutes)}（${periodStats.week.sessions}セッション）`)
  console.log(`  📅 今月: ${formatDuration(periodStats.month.minutes)}（${periodStats.month.sessions}セッション）`)
  console.log(`  📈 累計: ${formatDuration(periodStats.total.minutes)}（${periodStats.total.sessions}セッション）`)

  if (tokenStats) {
    console.log('')
    console.log('🎯 トークン使用量')
    console.log(`  📊 累計: ${formatTokens(tokenStats.totalTokens)} tokens`)
    console.log(`     └ 入力: ${formatTokens(tokenStats.inputTokens)} / 出力: ${formatTokens(tokenStats.outputTokens)}`)
  }

  console.log('')

  if (lastSession) {
    const lastSessionDate = lastSession.startTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    console.log(`最終セッション: ${lastSessionDate}`)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
}

main()
