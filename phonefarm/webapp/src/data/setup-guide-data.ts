// セットアップガイド専用データ

export const guideMeta = {
  title: "Phone Farm セットアップガイド (0→1)",
  subtitle: "初心者が導入するまでの完全マニュアル",
  purpose: "脅威インテリジェンス目的：業者の手法を理解し、検出・取り締まりに活用",
  totalDays: "約30日",
  disclaimer: "本ガイドは不正行為を推奨するものではありません。検出・対策のための理解を目的としています。",
};

// フェーズ定義
export const setupPhases = [
  { id: "planning", phase: 0, title: "計画", days: "Day 1", icon: "clipboard-list" },
  { id: "procurement", phase: 1, title: "機材調達", days: "Days 2-7", icon: "shopping-cart" },
  { id: "hardware-setup", phase: 2, title: "ハードウェア構築", days: "Days 8-10", icon: "cpu" },
  { id: "device-config", phase: 3, title: "端末設定", days: "Days 11-14", icon: "smartphone" },
  { id: "pc-software", phase: 4, title: "PCソフトウェア", days: "Days 15-17", icon: "monitor" },
  { id: "accounts", phase: 5, title: "アカウント作成", days: "Days 18-25", icon: "users" },
  { id: "automation", phase: 6, title: "自動化設定", days: "Days 26-30", icon: "play" },
  { id: "operations", phase: 7, title: "日常運用", days: "継続", icon: "activity" },
];

// 予算構成
export const budgetConfigs = {
  minimum: {
    name: "最小構成",
    scale: "5台",
    total: 26920,
    description: "中古端末を使った最低コスト構成。まず試してみたい人向け",
    detectionRisk: "高（同一機種・古いOS）",
    items: [
      { category: "端末", name: "Galaxy A20/A21（中古）", qty: 5, unitPrice: 4000, subtotal: 20000, where: "メルカリ/ヤフオク" },
      { category: "充電器", name: "Sabrent 60W 10ポート USB充電器", qty: 1, unitPrice: 3500, subtotal: 3500, where: "Amazon" },
      { category: "ケーブル", name: "USB-C ケーブル 30cm 10本セット", qty: 1, unitPrice: 1200, subtotal: 1200, where: "Amazon" },
      { category: "スタンド", name: "10台用スマホスタンド（100均）", qty: 2, unitPrice: 110, subtotal: 220, where: "ダイソー" },
      { category: "SMS認証", name: "5sim.net クレジット", qty: 1, unitPrice: 2000, subtotal: 2000, where: "5sim.net" },
    ],
  },
  standard: {
    name: "スタンダード構成",
    scale: "10台",
    total: 174200,
    description: "新品端末＋専用ボックスの安定構成。本格運用向け",
    detectionRisk: "中（新品だが同一機種）",
    items: [
      { category: "端末", name: "Xiaomi Redmi 12C（新品）", qty: 10, unitPrice: 15000, subtotal: 150000, where: "Amazon/楽天" },
      { category: "ボックス", name: "Some3C 10 USBポート電話ホルダーファームボックス", qty: 1, unitPrice: 10000, subtotal: 10000, where: "some3c.com" },
      { category: "ケーブル", name: "USB-C ケーブル 30cm 10本セット", qty: 1, unitPrice: 1200, subtotal: 1200, where: "Amazon" },
      { category: "SMS認証", name: "sms-activate.org クレジット", qty: 1, unitPrice: 5000, subtotal: 5000, where: "sms-activate.org" },
      { category: "プロキシ", name: "データセンタープロキシ（1ヶ月）", qty: 1, unitPrice: 8000, subtotal: 8000, where: "ProxyRack" },
    ],
  },
};

// 買い物リスト詳細
export const shoppingList = {
  devices: {
    used: [
      {
        name: "Galaxy A20/A21",
        price: "¥3,000-5,000",
        where: "メルカリ",
        searchUrl: "https://jp.mercari.com/search?keyword=galaxy%20a20",
        note: "画面割れ・バッテリー劣化なしを選ぶ。「動作確認済み」記載必須",
        checkPoints: ["SIMロック解除済み", "バッテリー80%以上", "画面割れなし"],
        detectionSignal: "Android 11、2022年以前のパッチ、同一モデル集中",
      },
      {
        name: "AQUOS sense3/4",
        price: "¥5,000-8,000",
        where: "ヤフオク",
        searchUrl: "https://auctions.yahoo.co.jp/search/search?p=aquos+sense3",
        note: "ドコモ版はSIMロック解除済みを確認",
        checkPoints: ["SIMロック解除済み", "動作確認済み"],
        detectionSignal: "特定ビルド番号、古いセキュリティパッチ",
      },
      {
        name: "Pixel 3a/4a",
        price: "¥8,000-12,000",
        where: "メルカリ/イオシス",
        searchUrl: "https://jp.mercari.com/search?keyword=pixel%204a",
        note: "サポート終了端末。純正Androidで扱いやすい",
        checkPoints: ["バッテリー状態", "画面焼け確認"],
        detectionSignal: "サポート終了、古いパッチ",
      },
    ],
    new: [
      {
        name: "Xiaomi Redmi 12C",
        price: "¥15,000-18,000",
        where: "Amazon",
        searchUrl: "https://www.amazon.co.jp/s?k=Xiaomi+Redmi+12C",
        note: "グローバル版を選ぶ（MIUI搭載）。色は混ぜると検出されにくい",
        checkPoints: ["グローバル版", "技適マークあり"],
        detectionSignal: "MediaTek Helio G85, MIUI, 同一モデル集中",
      },
      {
        name: "OPPO A77/A79",
        price: "¥20,000-25,000",
        where: "Amazon/楽天",
        searchUrl: "https://www.amazon.co.jp/s?k=OPPO+A77",
        note: "国内正規品で入手容易。ColorOS搭載",
        checkPoints: ["国内正規品"],
        detectionSignal: "ColorOS, Snapdragon 680",
      },
      {
        name: "moto g14/g24",
        price: "¥15,000-20,000",
        where: "Amazon",
        searchUrl: "https://www.amazon.co.jp/s?k=moto+g14",
        note: "素のAndroidに近い。開発者向けオプションが使いやすい",
        checkPoints: ["国内正規品"],
        detectionSignal: "純正Android",
      },
    ],
  },
  chargers: [
    {
      name: "Anker PowerPort 10 (60W 10ポート)",
      price: "¥4,999",
      where: "Amazon",
      url: "https://www.amazon.co.jp/s?k=Anker+PowerPort+10",
      note: "定番。10台に安定給電。PowerIQ搭載",
      specs: "60W / 10ポート / 各ポート最大2.4A",
    },
    {
      name: "Sabrent 60W 10-Port USB充電器",
      price: "¥3,499",
      where: "Amazon",
      url: "https://www.amazon.co.jp/s?k=Sabrent+60W+10+Port",
      note: "コスパ重視。Ankerより安い",
      specs: "60W / 10ポート",
    },
    {
      name: "AliExpress 20ポート充電器",
      price: "¥2,000-3,000",
      where: "AliExpress",
      url: "https://www.aliexpress.com/w/wholesale-20-port-usb-charger.html",
      note: "最安。品質不安定だが動く。納期2-3週間",
      specs: "100W / 20ポート",
    },
  ],
  farmBoxes: [
    {
      name: "Some3C 10 USBポート電話ホルダーファームボックス",
      price: "$65.62（約¥10,000）",
      where: "Some3C公式",
      url: "https://some3c.com/collections/all",
      note: "初心者の定番。Panda無料版と組み合わせ",
      specs: "10台収容 / USB充電スタンド / 縦置き",
      popular: true,
    },
    {
      name: "Some3C アクリルRGB 20USB充電HUBシャーシ",
      price: "$105-163（約¥16,000-25,000）",
      where: "Some3C公式",
      url: "https://some3c.com/collections/all",
      note: "見た目重視。RGB LED付き。透明アクリル",
      specs: "20台収容 / RGB LED / 透明ボディ",
      popular: true,
    },
    {
      name: "Some3C 2U サーバーラック",
      price: "$168-188（約¥25,000-28,000）",
      where: "Some3C公式",
      url: "https://some3c.com/collections/all",
      note: "本格派。19インチラックに収まる",
      specs: "20台収容 / 8冷却ファン / サーバーラック規格",
      popular: false,
    },
  ],
  cables: [
    {
      name: "UGREEN USB-C ケーブル 30cm 5本セット",
      price: "¥1,299",
      where: "Amazon",
      url: "https://www.amazon.co.jp/s?k=UGREEN+USB-C+30cm",
      note: "短いケーブルで配線スッキリ。品質安定",
    },
    {
      name: "AliExpress USB-C ケーブル 20cm 10本",
      price: "¥500-800",
      where: "AliExpress",
      url: "https://www.aliexpress.com/w/wholesale-usb-c-cable-20cm.html",
      note: "最安。品質はバラツキあり。予備含め多めに買う",
    },
  ],
  smsServices: [
    {
      name: "5sim.net",
      price: "¥10-50/認証",
      url: "https://5sim.net/",
      note: "最安。ロシア系。TikTok対応",
      minDeposit: "$5（約¥750）",
      supported: ["TikTok", "Instagram", "Twitter", "Discord"],
    },
    {
      name: "sms-activate.org",
      price: "¥15-60/認証",
      url: "https://sms-activate.org/",
      note: "大手。安定。種類豊富。API対応",
      minDeposit: "$2（約¥300）",
      supported: ["TikTok", "Instagram", "Twitter", "Discord", "その他100+"],
    },
    {
      name: "smspva.com",
      price: "¥10-40/認証",
      url: "https://smspva.com/",
      note: "種類豊富。価格安め",
      minDeposit: "$1",
      supported: ["TikTok", "Instagram", "Twitter"],
    },
  ],
  software: [
    {
      name: "Panda (Some3C)",
      price: "無料（40台まで）",
      url: "https://panda.some3c.com/",
      platform: "Windows",
      note: "複数端末一括制御。初心者の定番。40台まで無料",
      features: ["マルチデバイス同期", "画面ミラーリング", "一括アプリ管理", "スクリプト対応"],
      detectionSignal: "2ms以下の同期操作、40台境界",
    },
    {
      name: "scrcpy",
      price: "無料（オープンソース）",
      url: "https://github.com/Genymobile/scrcpy",
      platform: "Windows/Mac/Linux",
      note: "画面ミラーリング。軽量。複数起動で複数台表示",
      features: ["画面表示", "操作転送", "録画"],
      detectionSignal: "なし（単体では同期しない）",
    },
    {
      name: "Auto.js",
      price: "無料",
      url: "https://github.com/niceSaber/autojs",
      platform: "Android",
      note: "JavaScript自動化。アクセシビリティ権限必須",
      features: ["JavaScript実行", "UI自動化", "スケジュール実行"],
      detectionSignal: "アクセシビリティサービス有効化",
    },
    {
      name: "Tasker + AutoInput",
      price: "約¥500（有料）",
      url: "https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm",
      platform: "Android",
      note: "ノーコード自動化。プログラミング不要",
      features: ["GUI設定", "条件分岐", "タスク連携"],
      detectionSignal: "アクセシビリティサービス有効化",
    },
  ],
  proxies: [
    {
      type: "無料プロキシ",
      name: "Free Proxy List",
      price: "無料",
      url: "https://free-proxy-list.net/",
      note: "使い捨て。すぐブロックされる。テスト用",
      detectionRisk: "非常に高い（ブラックリスト化済み）",
    },
    {
      type: "データセンタープロキシ",
      name: "ProxyRack",
      price: "$50/月〜",
      url: "https://www.proxyrack.com/",
      note: "安定。IP数で課金。パターン検出されやすい",
      detectionRisk: "中（DC IPは識別可能）",
    },
    {
      type: "住宅プロキシ",
      name: "Bright Data",
      price: "$300/月〜",
      url: "https://brightdata.com/",
      note: "高品質。実際の家庭ISP経由。検出困難",
      detectionRisk: "低",
    },
    {
      type: "モバイルプロキシ",
      name: "Oxylabs",
      price: "$500/月〜",
      url: "https://oxylabs.io/",
      note: "最高品質。実際のキャリアIP。最も検出困難",
      detectionRisk: "非常に低",
    },
  ],
};

// ステップ詳細
export const setupSteps = [
  // Phase 0: 計画
  {
    phase: 0,
    step: 1,
    title: "規模を決める",
    description: "初心者は5-10台からスタート。いきなり大規模は失敗のもと",
    duration: "30分",
    actions: [
      "目標を設定（いいね販売？再生数操作？）",
      "予算を確認（最小3万円〜）",
      "5台 or 10台を選択",
    ],
    tips: "最初は5台で練習してから増やすのが安全",
    detectionSignal: "規模が大きいほど検出されやすい",
  },
  {
    phase: 0,
    step: 2,
    title: "予算を計算する",
    description: "機材費＋ランニングコストを計算",
    duration: "15分",
    actions: [
      "上記の予算構成表を参照",
      "初期費用（機材）を確認",
      "月額コスト（SMS、プロキシ）を確認",
    ],
    tips: "中古端末なら3万円以下でスタート可能",
    detectionSignal: null,
  },

  // Phase 1: 機材調達
  {
    phase: 1,
    step: 3,
    title: "端末を購入する",
    description: "中古 or 新品を選んで必要台数を調達",
    duration: "1-3日",
    actions: [
      "メルカリ/Amazonで検索",
      "状態・スペックを確認",
      "同じ出品者からまとめ買いがお得",
    ],
    tips: "色を混ぜると検出されにくい（赤3台、黒3台、白4台など）",
    detectionSignal: "同一機種集中、古いOSバージョン",
    shoppingCategory: "devices",
  },
  {
    phase: 1,
    step: 4,
    title: "充電器を購入する",
    description: "10ポート以上のUSB充電器を1台",
    duration: "1-2日",
    actions: [
      "Amazonで「USB充電器 10ポート」で検索",
      "60W以上を選ぶ（10台×6W）",
      "Anker or Sabrentが定番",
    ],
    tips: "安物は発熱・不安定になりやすいので注意",
    detectionSignal: null,
    shoppingCategory: "chargers",
  },
  {
    phase: 1,
    step: 5,
    title: "ボックス・スタンドを購入する",
    description: "端末を並べるスタンドまたは専用ボックス",
    duration: "1-7日（海外発送の場合）",
    actions: [
      "最安: 100均のスマホスタンド×2",
      "推奨: Some3Cの専用ボックス",
      "本格: サーバーラック型",
    ],
    tips: "Some3Cは海外発送で2-3週間かかることも",
    detectionSignal: "10台/20台という製品仕様に合致する規模",
    shoppingCategory: "farmBoxes",
  },
  {
    phase: 1,
    step: 6,
    title: "ケーブルを購入する",
    description: "短いUSBケーブル（30cm以下）を端末数分",
    duration: "1-2日",
    actions: [
      "USB-A to USB-C ケーブルを購入",
      "30cm以下の短いものを選ぶ",
      "予備含めて多めに（断線するので）",
    ],
    tips: "端末番号をケーブルにラベル貼りすると管理しやすい",
    detectionSignal: null,
    shoppingCategory: "cables",
  },

  // Phase 2: ハードウェア構築
  {
    phase: 2,
    step: 7,
    title: "機材を開梱・検品する",
    description: "届いた機材をすべて動作確認",
    duration: "1-2時間",
    actions: [
      "端末: 電源ON、画面表示、タッチ反応を確認",
      "充電器: 全ポートで給電確認",
      "不良品は早めに返品手続き",
    ],
    tips: "中古端末はバッテリー膨張がないか確認",
    detectionSignal: null,
  },
  {
    phase: 2,
    step: 8,
    title: "ボックスに端末を設置する",
    description: "スタンド/ボックスに端末を並べる",
    duration: "30分",
    actions: [
      "端末にナンバリング（1, 2, 3...）をシールで貼る",
      "ボックスに順番に設置",
      "全画面が見える角度に調整",
    ],
    tips: "端末番号とケーブル番号を一致させると管理が楽",
    detectionSignal: null,
  },
  {
    phase: 2,
    step: 9,
    title: "電源・ネットワークを接続する",
    description: "充電器とWi-Fiに全端末を接続",
    duration: "30分",
    actions: [
      "全端末を充電器に接続",
      "同一Wi-Fiに全端末を接続",
      "充電ランプが全端末で点灯確認",
    ],
    tips: "Wi-Fiは5GHz帯を使うと干渉が少ない",
    detectionSignal: "同一Wi-Fi APから5アカウント以上",
  },
  {
    phase: 2,
    step: 10,
    title: "24時間テストする",
    description: "全端末を24時間稼働させて安定性を確認",
    duration: "24時間",
    actions: [
      "全端末の電源をON",
      "24時間放置",
      "発熱・フリーズ・充電切れがないか確認",
    ],
    tips: "夏場は冷却ファンを検討。発熱で故障する端末が出る",
    detectionSignal: null,
  },

  // Phase 3: 端末設定
  {
    phase: 3,
    step: 11,
    title: "ファクトリーリセットする",
    description: "全端末を初期化してクリーンな状態に",
    duration: "30分",
    actions: [
      "設定 → システム → リセット → データを初期化",
      "初期設定をスキップ or 最小限で完了",
      "Googleアカウントは後で追加",
    ],
    command: "設定 → システム → リセット → すべてのデータを消去",
    tips: "中古端末は前所有者のデータが残っている可能性あり",
    detectionSignal: null,
  },
  {
    phase: 3,
    step: 12,
    title: "開発者オプションを有効化する",
    description: "USBデバッグを使うために必要",
    duration: "1分/台",
    actions: [
      "設定 → 端末情報（デバイス情報）を開く",
      "「ビルド番号」を7回連続タップ",
      "「開発者になりました」と表示されればOK",
    ],
    command: "設定 → 端末情報 → ビルド番号（7回タップ）",
    tips: "機種によって場所が違う。「About phone」配下にあることも",
    detectionSignal: null,
  },
  {
    phase: 3,
    step: 13,
    title: "USBデバッグを有効化する",
    description: "PCからADBで制御するために必須",
    duration: "1分/台",
    actions: [
      "設定 → システム → 開発者向けオプション",
      "「USBデバッグ」をON",
      "警告ダイアログで「OK」",
    ],
    command: "設定 → 開発者向けオプション → USBデバッグ → ON",
    tips: "PCに接続時「常に許可」にチェックを忘れずに",
    detectionSignal: "USBデバッグ有効化はADB使用の痕跡",
  },
  {
    phase: 3,
    step: 14,
    title: "省電力設定を無効化する",
    description: "バッテリーセーバーで自動化が止まるのを防ぐ",
    duration: "2分/台",
    actions: [
      "設定 → バッテリー → バッテリーセーバー → OFF",
      "設定 → バッテリー → 自動調整バッテリー → OFF",
      "設定 → ディスプレイ → 画面消灯 → 30分 or なし",
      "設定 → ディスプレイ → 明るさ自動調整 → OFF",
    ],
    command: "バッテリー設定すべてOFF、画面消灯を最大に",
    tips: "明るさは30%固定で十分。100%だと発熱する",
    detectionSignal: null,
  },
  {
    phase: 3,
    step: 15,
    title: "自動アップデートを無効化する",
    description: "勝手に再起動されるのを防ぐ",
    duration: "1分/台",
    actions: [
      "設定 → システム → ソフトウェアアップデート → 自動更新OFF",
      "Google Play → 設定 → アプリの自動更新 → しない",
    ],
    command: "システム更新・アプリ自動更新をすべてOFF",
    tips: "アップデートで動作が変わると自動化スクリプトが壊れる",
    detectionSignal: null,
  },

  // Phase 4: PCソフトウェア
  {
    phase: 4,
    step: 16,
    title: "ADBをインストールする",
    description: "Android Debug Bridge（PCから端末を制御するツール）",
    duration: "15分",
    actions: [
      "Android SDK Platform Toolsをダウンロード",
      "解凍してPATHに追加",
      "コマンドプロンプトで adb version を確認",
    ],
    commandWindows: `# 1. https://developer.android.com/studio/releases/platform-tools からダウンロード
# 2. 解凍して C:\\platform-tools に配置
# 3. システム環境変数 PATH に C:\\platform-tools を追加
# 4. 確認
adb version`,
    commandMac: `# Homebrewでインストール
brew install android-platform-tools

# 確認
adb version`,
    tips: "PATH設定後はコマンドプロンプトを再起動",
    detectionSignal: null,
  },
  {
    phase: 4,
    step: 17,
    title: "端末接続を確認する",
    description: "全端末がPCから認識されることを確認",
    duration: "15分",
    actions: [
      "全端末をUSBでPCに接続（ハブ経由OK）",
      "コマンドプロンプトで adb devices を実行",
      "全端末が device として表示されることを確認",
    ],
    command: `adb devices

# 期待される出力:
# List of devices attached
# R58M32XXXXX  device
# R58M32XXXXY  device
# R58M32XXXXZ  device`,
    tips: "「unauthorized」と表示されたら端末画面で「常に許可」をタップ",
    detectionSignal: null,
  },
  {
    phase: 4,
    step: 18,
    title: "Pandaをインストールする",
    description: "複数端末を一括制御するソフトウェア",
    duration: "15分",
    actions: [
      "https://panda.some3c.com/ にアクセス",
      "Windows版をダウンロード",
      "インストーラーを実行",
      "起動すると全端末が自動認識される",
    ],
    tips: "40台まで無料。Sync Modeで全端末に同じ操作を送信",
    detectionSignal: "2ms以下の操作同期、40台境界、24FPSパターン",
    shoppingCategory: "software",
  },

  // Phase 5: アカウント作成
  {
    phase: 5,
    step: 19,
    title: "SMS認証サービスに登録する",
    description: "使い捨て電話番号でアカウント認証を通す",
    duration: "15分",
    actions: [
      "5sim.net または sms-activate.org にアクセス",
      "メールアドレスでアカウント作成",
      "残高をチャージ（$5〜）",
    ],
    tips: "日本番号は高い（¥50-80）。ロシア番号は安い（¥10-20）",
    detectionSignal: "VOIP番号パターン、特定キャリアIP範囲",
    shoppingCategory: "smsServices",
  },
  {
    phase: 5,
    step: 20,
    title: "TikTokをインストールする",
    description: "全端末にTikTokアプリを導入",
    duration: "15分",
    actions: [
      "Google PlayからTikTokをインストール",
      "または apk をダウンロードして adb install",
    ],
    command: `# 全端末に一括インストール
for device in $(adb devices | grep device$ | cut -f1); do
  adb -s $device install -r tiktok.apk
done`,
    tips: "最新版より1-2バージョン前が安定することも",
    detectionSignal: "一括アプリインストール履歴",
  },
  {
    phase: 5,
    step: 21,
    title: "アカウントを作成する",
    description: "SMS認証を使ってTikTokアカウントを作成",
    duration: "5分/アカウント",
    actions: [
      "TikTokを起動 → 登録 → 電話番号",
      "SMS認証サービスで番号を取得",
      "番号を入力 → 認証コードを受け取る",
      "プロフィールを設定（後でOK）",
    ],
    tips: "アカウント作成直後は自動化せず、3-7日待つ（エイジング）",
    detectionSignal: "新規アカウントの即時自動化",
  },
  {
    phase: 5,
    step: 22,
    title: "アカウントをエイジングする",
    description: "新規アカウントを「熟成」させてBAN回避",
    duration: "3-7日",
    actions: [
      "手動で毎日5-10分使う",
      "動画を数本視聴",
      "1-2個いいね",
      "プロフィール写真を設定",
    ],
    tips: "すぐ自動化するとBANされやすい。人間らしい履歴を作る",
    detectionSignal: "エイジング期間なしの新規アカウント自動化",
  },

  // Phase 6: 自動化設定
  {
    phase: 6,
    step: 23,
    title: "Auto.jsをインストールする",
    description: "Android側の自動化ツール",
    duration: "10分/台",
    actions: [
      "GitHubからAuto.js APKをダウンロード",
      "端末にインストール（提供元不明を許可）",
      "設定 → アクセシビリティ → Auto.js → ON",
      "「他のアプリの上に表示」を許可",
    ],
    tips: "アクセシビリティ権限がないと動かない",
    detectionSignal: "アクセシビリティサービス有効化",
    shoppingCategory: "software",
  },
  {
    phase: 6,
    step: 24,
    title: "基本スクリプトを作成する",
    description: "自動スクロール＋いいねのスクリプト",
    duration: "30分",
    script: `// tiktok_auto_scroll.js

// 設定
var MIN_VIEW = 3000;  // 最小視聴時間(ms)
var MAX_VIEW = 8000;  // 最大視聴時間(ms)
var LIKE_PROB = 0.3;  // いいね確率(30%)

// メイン処理
function main() {
    // TikTokを起動
    app.launchApp("TikTok");
    sleep(5000);

    while (true) {
        // ランダム視聴
        var viewTime = random(MIN_VIEW, MAX_VIEW);
        sleep(viewTime);

        // 30%の確率でいいね
        if (Math.random() < LIKE_PROB) {
            click(device.width * 0.9, device.height * 0.5);
            sleep(500);
        }

        // 次の動画へスワイプ
        swipe(
            device.width / 2,
            device.height * 0.7,
            device.width / 2,
            device.height * 0.3,
            random(300, 500)
        );
    }
}

main();`,
    tips: "random()は均一分布で不自然。人間らしくするには対数正規分布に",
    detectionSignal: "均一分布の視聴時間、固定比率の座標、直線スワイプ",
  },
  {
    phase: 6,
    step: 25,
    title: "スクリプトをテストする",
    description: "1台でスクリプトの動作確認",
    duration: "1時間",
    actions: [
      "Auto.jsでスクリプトを実行",
      "TikTokが起動してスクロールが始まることを確認",
      "エラーが出たらログを確認して修正",
    ],
    tips: "最初は視聴時間を短く（1-2秒）してデバッグ",
    detectionSignal: null,
  },
  {
    phase: 6,
    step: 26,
    title: "全端末にデプロイする",
    description: "動作確認済みスクリプトを全端末に配布",
    duration: "30分",
    command: `# スクリプトを全端末にコピー
for device in $(adb devices | grep device$ | cut -f1); do
  adb -s $device push tiktok_auto.js /sdcard/
done`,
    tips: "Pandaの一括操作でスクリプト開始すると便利",
    detectionSignal: "同一スクリプトパターン",
  },

  // Phase 7: 日常運用
  {
    phase: 7,
    step: 27,
    title: "朝のチェック（15分）",
    description: "毎朝の定期点検",
    duration: "15分",
    actions: [
      "全端末が動作中か確認",
      "BANされたアカウントがないか確認",
      "エラーログを確認",
    ],
    tips: "問題があれば早めに対処。放置するとBAN連鎖",
    detectionSignal: null,
  },
  {
    phase: 7,
    step: 28,
    title: "昼のメンテナンス（30分）",
    description: "必要に応じて調整",
    duration: "30分",
    actions: [
      "フリーズした端末を再起動",
      "アプリキャッシュをクリア（週1程度）",
      "エンゲージメント数を記録",
    ],
    tips: "スプレッドシートで日次記録をつける",
    detectionSignal: null,
  },
  {
    phase: 7,
    step: 29,
    title: "週次メンテナンス",
    description: "週に1回の大掃除",
    duration: "1-2時間",
    actions: [
      "BANされたアカウントを新規作成で補充",
      "スクリプトの動作確認・調整",
      "端末の発熱・バッテリー状態確認",
    ],
    tips: "BAN率が高い場合はスクリプトか端末設定を見直す",
    detectionSignal: null,
  },
];

// トラブルシューティング
export const troubleshooting = [
  {
    issue: "端末がADBに認識されない",
    symptoms: ["adb devicesで表示されない", "unauthorizedと表示される"],
    solutions: [
      "USBケーブルを別のものに交換",
      "USBデバッグが有効か確認",
      "端末画面で「常に許可」をタップ",
      "adb kill-server && adb start-server で再起動",
    ],
  },
  {
    issue: "アカウントがすぐBANされる",
    symptoms: ["作成直後にBAN", "数日でBAN"],
    solutions: [
      "エイジング期間を延ばす（7日以上）",
      "自動化の速度を落とす",
      "プロキシを使う（住宅 or モバイル）",
      "端末機種を分散させる",
    ],
  },
  {
    issue: "端末が過熱する",
    symptoms: ["触ると熱い", "動作が遅くなる", "再起動する"],
    solutions: [
      "画面の明るさを下げる（30%以下）",
      "冷却ファンを追加",
      "端末の間隔を空ける",
      "夜間は自動化を止める",
    ],
  },
  {
    issue: "Wi-Fiが不安定",
    symptoms: ["接続が切れる", "速度が出ない"],
    solutions: [
      "5GHz帯を使う（2.4GHzは混雑）",
      "ルーターを端末の近くに設置",
      "端末数を減らす or ルーターを追加",
    ],
  },
  {
    issue: "スクリプトがエラーで止まる",
    symptoms: ["Auto.jsがクラッシュ", "操作が止まる"],
    solutions: [
      "例外処理を追加（try-catch）",
      "メモリ不足の場合は端末再起動",
      "TikTokアプリを再インストール",
    ],
  },
];
