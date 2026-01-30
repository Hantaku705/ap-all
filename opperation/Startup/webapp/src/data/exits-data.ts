export type Category = 'hr' | 'marketing' | 'finops' | 'knowledge' | 'operations' | 'devtools' | 'ai' | 'security'
export type JapanStatus = 'none' | 'small' | 'competitive'
export type EntryDifficulty = 'low' | 'medium' | 'high'
export type CompanyStatus = 'exit' | 'growing' | 'ipo_planned'

export interface ExitCase {
  id: string
  company: string
  coreValue: string
  description: string
  category: Category
  exitAmount: string
  exitAmountNum: number
  acquirer: string
  exitYear: number
  japanStatus: JapanStatus
  entryDifficulty: EntryDifficulty
  opportunity: string
  sourceUrl?: string
  status: CompanyStatus
  valuation?: string
  fundingRound?: string
}

export const categoryLabels: Record<Category, string> = {
  hr: 'HR/人材管理',
  marketing: 'マーケティング/セールス',
  finops: '支出管理/FinOps',
  knowledge: 'ナレッジ/AI',
  operations: 'オペレーション',
  devtools: '開発ツール',
  ai: 'AI/LLM',
  security: 'セキュリティ',
}

export const statusLabels: Record<CompanyStatus, string> = {
  exit: 'EXIT済',
  growing: '成長中',
  ipo_planned: 'IPO予定',
}

export const japanStatusLabels: Record<JapanStatus, string> = {
  none: '類似なし',
  small: 'あるが小さい',
  competitive: '競合多数',
}

export const entryDifficultyLabels: Record<EntryDifficulty, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

export const exits: ExitCase[] = [
  {
    id: 'airbase',
    company: 'Airbase',
    coreValue: '統合型企業支出管理',
    description: '企業支出管理・ワークフロー自動化プラットフォーム。経費精算、請求書処理、コーポレートカードを統合。',
    category: 'finops',
    exitAmount: '$325M',
    exitAmountNum: 325000000,
    acquirer: 'Paylocity',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: '日本では楽楽精算、Concur等が存在するが、統合型支出管理は未成熟。中堅企業向けに差別化可能。',
    sourceUrl: 'https://www.cpapracticeadvisor.com/2024/09/05/paylocity-to-buy-airbase-in-325-million-deal/110015/',
  },
  {
    id: 'cacheflow',
    company: 'Cacheflow',
    coreValue: 'B2B見積→請求自動化',
    description: 'B2B請求管理・CPQ（Configure, Price, Quote）ソリューション。見積から請求までを自動化。',
    category: 'finops',
    exitAmount: '$100M（推定）',
    exitAmountNum: 100000000,
    acquirer: 'HubSpot',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本にはCPQ専門のSaaSがほぼ存在しない。HubSpot/Salesforce連携で中堅企業の営業効率化に貢献可能。',
    sourceUrl: 'https://ir.hubspot.com/news-releases/news-release-details/hubspot-completes-acquisition-b2b-billing-management-and-cpq',
  },
  {
    id: 'qualified',
    company: 'Qualified',
    coreValue: 'AIリードジェネレーション',
    description: 'Agentic AIマーケティングプラットフォーム。AIが自律的にリードジェネレーション・パイプライン生成を実行。',
    category: 'marketing',
    exitAmount: '$1B-$1.5B',
    exitAmountNum: 1250000000,
    acquirer: 'Salesforce',
    exitYear: 2025,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本にはAgentic AIマーケティングツールが存在しない。B2Bセールス自動化の大きな機会。',
    sourceUrl: 'https://www.salesforce.com/news/stories/salesforce-signs-definitive-agreement-to-acquire-qualified/',
  },
  {
    id: 'payspace',
    company: 'PaySpace',
    coreValue: 'グローバル給与計算',
    description: 'アフリカ・グローバル給与計算・HR管理プラットフォーム。40カ国以上の給与計算に対応。',
    category: 'hr',
    exitAmount: '$100M+（推定）',
    exitAmountNum: 100000000,
    acquirer: 'Deel',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'medium',
    opportunity: '日本企業の海外子会社向け給与計算ニーズは高い。グローバル給与計算の日本語対応版に機会。',
    sourceUrl: 'https://techcrunch.com/2024/03/05/deel-acquires-payspace-500m-arr/',
  },
  {
    id: 'zavvy',
    company: 'Zavvy',
    coreValue: 'AI人材開発',
    description: 'AI駆動の人材開発・キャリア進行プラットフォーム。従業員のスキル開発を自動化。',
    category: 'hr',
    exitAmount: '$100M（推定）',
    exitAmountNum: 100000000,
    acquirer: 'Deel',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: 'AI駆動の人材開発は日本で未開拓。企業の人材育成DXに大きな機会。',
    sourceUrl: 'https://techcrunch.com/2024/03/05/deel-acquires-payspace-500m-arr/',
  },
  {
    id: 'hofy',
    company: 'Hofy',
    coreValue: 'グローバルデバイス管理',
    description: 'グローバルデバイス管理・供給サービス。127カ国で従業員デバイスの調達・配送・管理を提供。',
    category: 'operations',
    exitAmount: '$100M+（推定）',
    exitAmountNum: 100000000,
    acquirer: 'Deel',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: 'リモートワーク普及でデバイス管理需要増加。日本企業の海外拠点向けに差別化可能。',
    sourceUrl: 'https://techcrunch.com/2024/03/05/deel-acquires-payspace-500m-arr/',
  },
  {
    id: 'pento',
    company: 'Pento',
    coreValue: '給与計算自動化',
    description: 'UK給与計算自動化プラットフォーム。クラウドベースで給与計算を完全自動化。',
    category: 'hr',
    exitAmount: '$40M（£32M）',
    exitAmountNum: 40000000,
    acquirer: 'HiBob',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: 'SmartHR、freee等が存在するが、完全自動化は未実現。中小企業向けに差別化可能。',
    sourceUrl: 'https://www.hibob.com/news/hibob-acquires-uk-payroll-automation-platform-pento/',
  },
  {
    id: 'workforce-software',
    company: 'WorkForce Software',
    coreValue: '勤務管理・シフト最適化',
    description: '勤務管理・スケジューリング・タイムトラッキングプラットフォーム。大企業向けの労務管理を提供。',
    category: 'hr',
    exitAmount: '$100M+（推定）',
    exitAmountNum: 100000000,
    acquirer: 'ADP',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: '日本では勤怠管理は普及しているが、シフト最適化AIは未成熟。サービス業向けに機会。',
    sourceUrl: 'https://mediacenter.adp.com/2024-10-15-ADP-Acquires-WorkForce-Software',
  },
  {
    id: 'zoomin',
    company: 'Zoomin',
    coreValue: 'ナレッジ検索AI',
    description: 'ナレッジ管理・ドキュメント検索AIプラットフォーム。非構造化データから回答を生成。',
    category: 'knowledge',
    exitAmount: '$450M（実績$344M）',
    exitAmountNum: 344000000,
    acquirer: 'Salesforce',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'medium',
    opportunity: '日本企業のナレッジ管理は紙・属人的。AI検索による社内知識活用に大きな機会。',
    sourceUrl: 'https://techcrunch.com/2024/09/24/salesforce-snatches-up-zoomin-a-tool-for-organizing-company-knowledge/',
  },
  {
    id: 'sana',
    company: 'Sana',
    coreValue: 'AIパーソナライズ学習',
    description: 'AI駆動の企業向け学習プラットフォーム。パーソナライズされた学習体験とAIエージェント機能。',
    category: 'hr',
    exitAmount: '$1.1B',
    exitAmountNum: 1100000000,
    acquirer: 'Workday',
    exitYear: 2025,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本のLMSは静的コンテンツ中心。AIパーソナライズ学習は未開拓市場。',
    sourceUrl: 'https://newsroom.workday.com/2025-11-04-Workday-Completes-Acquisition-of-Sana',
  },
  {
    id: 'bridge',
    company: 'Bridge',
    coreValue: 'ステーブルコイン決済',
    description: 'ステーブルコイン決済・国際送金インフラ。企業の国際決済を簡素化。',
    category: 'finops',
    exitAmount: '$1.1B',
    exitAmountNum: 1100000000,
    acquirer: 'Stripe',
    exitYear: 2025,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本の国際送金は銀行中心で高コスト。規制クリアできれば大きな機会。',
    sourceUrl: 'https://fintechmagazine.com/articles/stripe-completes-us-1-1bn-bridge-acquisition',
  },
  {
    id: 'mparticle',
    company: 'mParticle',
    coreValue: '顧客データ統合（CDP）',
    description: '顧客データプラットフォーム（CDP）。統一顧客プロフィール・リアルタイムデータ活用。',
    category: 'marketing',
    exitAmount: '$300M',
    exitAmountNum: 300000000,
    acquirer: 'Rokt',
    exitYear: 2025,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本のマーテック成熟度は低い。CDP導入初期段階で先行者利益を獲得可能。',
    sourceUrl: 'https://www.adexchanger.com/commerce/rokt-acquires-mparticle-for-300-million/',
  },
  {
    id: 'paycor',
    company: 'Paycor',
    coreValue: '統合HCMプラットフォーム',
    description: 'HCM・給与計算・人事管理プラットフォーム。中堅企業向けの統合HR管理。',
    category: 'hr',
    exitAmount: '$4.1B',
    exitAmountNum: 4100000000,
    acquirer: 'Paychex',
    exitYear: 2025,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: '日本では分断されたHRツールが多い。統合HCMプラットフォームに機会。',
    sourceUrl: 'https://www.paychex.com/newsroom/news-releases/paycor-acquisition-complete',
  },
  {
    id: 'chili-piper',
    company: 'Chili Piper',
    coreValue: 'リード振り分け自動化',
    description: 'インバウンドリード管理・スケジューリング自動化。リードを即座に適切な営業担当に振り分け。',
    category: 'marketing',
    exitAmount: '$150M（推定）',
    exitAmountNum: 150000000,
    acquirer: 'ZoomInfo',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'medium',
    opportunity: '日本のインバウンドリード管理は手動が多い。自動振り分けで営業効率化に貢献。',
  },
  {
    id: 'productboard',
    company: 'Productboard',
    coreValue: 'プロダクトロードマップ管理',
    description: 'プロダクトマネジメントプラットフォーム。顧客フィードバックをロードマップに統合。',
    category: 'operations',
    exitAmount: '$200M（推定）',
    exitAmountNum: 200000000,
    acquirer: 'SAP',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: '日本のプロダクトマネジメントツール市場は未成熟。スタートアップ・DX企業向けに機会。',
  },
  {
    id: 'fireflies',
    company: 'Fireflies.ai',
    coreValue: '会議録音・要約AI',
    description: 'AI会議アシスタント。会議の自動録音・文字起こし・要約・アクションアイテム抽出。',
    category: 'knowledge',
    exitAmount: '$150M（推定）',
    exitAmountNum: 150000000,
    acquirer: '未公開',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: 'OtterやNottaが存在するが、日本語精度に課題。高精度日本語対応で差別化可能。',
  },
  {
    id: 'guru',
    company: 'Guru',
    coreValue: '社内ナレッジ即時検索',
    description: '企業ナレッジマネジメント。Slackやブラウザ拡張で即座に社内知識にアクセス。',
    category: 'knowledge',
    exitAmount: '$120M（推定）',
    exitAmountNum: 120000000,
    acquirer: 'Dialpad',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'medium',
    opportunity: '日本企業の社内知識は属人的・分散的。Slack連携ナレッジツールに大きな機会。',
  },
  {
    id: 'loom',
    company: 'Loom',
    coreValue: '非同期ビデオコミュニケーション',
    description: '非同期ビデオコミュニケーション。画面録画・共有で非同期コラボレーションを実現。',
    category: 'operations',
    exitAmount: '$975M',
    exitAmountNum: 975000000,
    acquirer: 'Atlassian',
    exitYear: 2023,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: 'Loomは日本でも認知されているが、日本語UI・字幕の最適化で差別化可能。',
  },
  {
    id: 'lattice',
    company: 'Lattice',
    coreValue: 'パフォーマンス管理・OKR',
    description: 'パフォーマンスマネジメント・エンゲージメントプラットフォーム。1on1、OKR、360度評価を統合。',
    category: 'hr',
    exitAmount: '$400M（推定）',
    exitAmountNum: 400000000,
    acquirer: '未公開（IPO検討中）',
    exitYear: 2024,
    japanStatus: 'small',
    entryDifficulty: 'medium',
    opportunity: 'カオナビ、HRMOSが存在するが、OKR・1on1統合は弱い。統合パフォーマンス管理に機会。',
  },
  {
    id: 'gong',
    company: 'Gong',
    coreValue: '営業会話分析AI',
    description: 'レベニューインテリジェンスプラットフォーム。営業会話を分析し、売上予測・コーチングを提供。',
    category: 'marketing',
    exitAmount: '$500M+（推定）',
    exitAmountNum: 500000000,
    acquirer: 'Salesforce（交渉中）',
    exitYear: 2025,
    japanStatus: 'none',
    entryDifficulty: 'high',
    opportunity: '日本のセールスイネーブルメント市場は未開拓。会話分析AIで営業生産性向上に貢献可能。',
  },
  {
    id: 'drata',
    company: 'Drata',
    coreValue: 'コンプライアンス自動化',
    description: 'コンプライアンス自動化プラットフォーム。SOC2、ISO27001等の認証取得を自動化。',
    category: 'operations',
    exitAmount: '$200M（推定）',
    exitAmountNum: 200000000,
    acquirer: 'CrowdStrike',
    exitYear: 2024,
    japanStatus: 'none',
    entryDifficulty: 'medium',
    opportunity: '日本企業のセキュリティ認証取得は手動で高コスト。自動化で中小企業にも普及可能。',
  },
]

// Helper functions
export function getExitsByCategory(category: Category): ExitCase[] {
  return exits.filter((e) => e.category === category)
}

export function getExitsByJapanStatus(status: JapanStatus): ExitCase[] {
  return exits.filter((e) => e.japanStatus === status)
}

export function getExitsByDifficulty(difficulty: EntryDifficulty): ExitCase[] {
  return exits.filter((e) => e.entryDifficulty === difficulty)
}

export function getCategoryCounts(): Record<Category, number> {
  return exits.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1
      return acc
    },
    {} as Record<Category, number>
  )
}

export function getJapanStatusCounts(): Record<JapanStatus, number> {
  return exits.reduce(
    (acc, e) => {
      acc[e.japanStatus] = (acc[e.japanStatus] || 0) + 1
      return acc
    },
    {} as Record<JapanStatus, number>
  )
}

export function getTotalExitValue(): number {
  return exits.reduce((sum, e) => sum + e.exitAmountNum, 0)
}

export function getAverageExitValue(): number {
  return getTotalExitValue() / exits.length
}
