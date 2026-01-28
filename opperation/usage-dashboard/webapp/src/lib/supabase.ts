import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ビルド時は空のクライアントを作成（環境変数がない場合）
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type UsageLog = {
  id: string
  user_id: string
  hostname: string
  username: string
  date: string
  minutes: number
  sessions: number
  last_sync: string
  created_at: string
  updated_at: string
}

export type UsageSummary = {
  user_id: string
  hostname: string
  username: string
  total_minutes: number
  total_sessions: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  last_active_date: string
  last_sync: string
}

export type DailyTotal = {
  date: string
  total_minutes: number
  total_sessions: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  active_users: number
}

/**
 * ユーザー別累計を取得
 */
export async function fetchUsageSummary(): Promise<UsageSummary[]> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return []
  }

  const { data, error } = await supabase
    .from('usage_summary')
    .select('*')
    .order('total_minutes', { ascending: false })

  if (error) {
    console.error('Error fetching usage summary:', error)
    return []
  }

  return data || []
}

/**
 * 日別使用時間を取得
 */
export async function fetchDailyLogs(days: number = 30): Promise<UsageLog[]> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return []
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching daily logs:', error)
    return []
  }

  return data || []
}

/**
 * 日別合計を取得
 */
export async function fetchDailyTotals(days: number = 30): Promise<DailyTotal[]> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return []
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('usage_daily_total')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching daily totals:', error)
    return []
  }

  return data || []
}
