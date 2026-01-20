export const reportMeta = {
  title: "Phone Farm 脅威インテリジェンスレポート",
  subtitle: "初心者業者の手法分析",
  classification: "社内限定 - セキュリティチーム向け",
  purpose: "不正業者の検出・取り締まりのための脅威理解",
  date: "2026-01-20",
};

// レポートの目的と使い方
export const reportPurpose = {
  objective: "TikTok等のソーシャルメディアプラットフォームにおいて、Phone Farmを使用した不正エンゲージメント操作を行う業者を特定・取り締まるためのインテリジェンス資料",
  targetAudience: [
    "プラットフォームセキュリティチーム",
    "不正検出エンジニア",
    "Trust & Safety担当者",
    "データアナリスト",
  ],
  howToUse: [
    "業者が使用するハードウェア・ソフトウェアの特徴を把握し、検出ルールを設計する",
    "初心者業者の典型的なパターンを理解し、優先的に取り締まる対象を特定する",
    "各セクションの「検出ポイント」を参考に、異常検知アルゴリズムを構築する",
    "SQLクエリ例を実際の検出システムに応用する",
  ],
  keyTerms: [
    { term: "Phone Farm", desc: "複数のスマートフォンを一括管理し、自動化ツールで不正操作を行うシステム" },
    { term: "エンゲージメント", desc: "いいね、フォロー、コメント、再生などのユーザーアクション" },
    { term: "Bot", desc: "自動化されたアカウント。人間の操作を模倣するが、機械的なパターンを持つ" },
    { term: "検出シグナル", desc: "不正を示唆する技術的な特徴や行動パターン" },
    { term: "ADB", desc: "Android Debug Bridge。PCからAndroid端末を制御するためのツール" },
  ],
};

// セクションの説明
export const sectionDescriptions = {
  overview: {
    title: "概要",
    purpose: "Phone Farmとは何か、初心者業者の特徴、不正行為の市場相場を理解する",
    keyPoint: "初心者業者は検出回避が不十分なため、取り締まりの優先ターゲットとなる",
  },
  hardware: {
    title: "ハードウェア構成",
    purpose: "業者が使用する端末の機種・特徴を把握し、デバイスフィンガープリントによる検出に活用する",
    keyPoint: "安価な端末（Xiaomi, OPPO等）や中古端末への集中が検出の手がかりになる",
  },
  hardwareSolutions: {
    title: "専用ハードウェアソリューション",
    purpose: "Phone Farm専用のボックス製品の役割と、利用者の検出方法を理解する",
    keyPoint: "専用製品は「10台/16台/20台」など製品仕様に合致する規模が特徴",
  },
  some3cProducts: {
    title: "Some3C製品ラインナップ",
    purpose: "初心者業者に最も選ばれているメーカーの具体的な製品と価格を把握する",
    keyPoint: "Some3Cはハードウェア＋ソフトウェア（Panda）のワンストップ提供で人気",
  },
  autoClicker: {
    title: "自動クリッカーデバイス",
    purpose: "ソフトウェア検出を回避する物理デバイスの仕組みと、対抗策を理解する",
    keyPoint: "物理タップはソフトウェアで検出できないため、行動分析ベースの検出が必須",
  },
  panda: {
    title: "Panda Software",
    purpose: "Some3C提供の制御ソフトウェアの機能と、利用者を検出するシグナルを把握する",
    keyPoint: "40台まで無料のため、この規模に合わせた業者が多い",
  },
  software: {
    title: "ソフトウェアプラットフォーム",
    purpose: "業者が使用するPC側・Android側のツール、SMS認証回避、プロキシサービスを網羅的に把握する",
    keyPoint: "初心者は無料〜安価なツール/サービスを使うため、検出しやすい",
  },
  automation: {
    title: "自動化実装",
    purpose: "業者が実際に使用するスクリプトの例を理解し、パターン検出に活用する",
    keyPoint: "ADBコマンドや Auto.js のスクリプトは特定の座標・タイミングパターンを持つ",
  },
  detection: {
    title: "検出戦略",
    purpose: "ハードウェア・ソフトウェア・行動・ネットワークの4観点から検出ロジックを構築する",
    keyPoint: "初心者業者は複数のシグナルが重複するため、組み合わせで高精度に検出可能",
  },
};

export const sections = [
  { id: "overview", title: "概要" },
  { id: "hardware", title: "ハードウェア構成" },
  { id: "hardware-solutions", title: "専用ハードウェア" },
  { id: "some3c-products", title: "Some3C製品" },
  { id: "auto-clicker", title: "自動クリッカー" },
  { id: "panda", title: "Panda Software" },
  { id: "software", title: "ソフトウェア" },
  { id: "automation", title: "自動化実装" },
  { id: "detection", title: "検出戦略" },
];

export const overviewData = {
  description: "複数のスマートフォンを同時に管理・操作し、ソーシャルメディアでの不正なエンゲージメント（フォロワー水増し、いいね操作、再生数操作）を行うシステム。",
  whyTarget: "Phone Farm業者は、プラットフォームの健全性を損ない、広告主の信頼を毀損し、一般ユーザーの体験を悪化させる。初心者業者は検出回避スキルが低いため、効率的に取り締まることができる。",
  beginnerProfile: {
    scale: "5-20台程度",
    investment: "5-15万円",
    techLevel: "基本的なスクリプト、GUI自動化ツール",
    detection: "不十分（パターンが単純）",
  },
  fraudTypes: [
    { type: "フォロワー販売", price: "1000フォロワー = ¥500-2000", desc: "偽アカウントから一斉フォロー" },
    { type: "いいね販売", price: "1000いいね = ¥300-1000", desc: "動画への一斉いいね操作" },
    { type: "再生数操作", price: "10000再生 = ¥500-1500", desc: "自動スクロールで再生カウント" },
    { type: "コメント投稿代行", price: "要相談", desc: "定型文または指定コメントを投稿" },
  ],
};

export const hardwareDevices = {
  explanation: "初心者業者は「コスト最優先」で端末を選ぶ。そのため、安価な中国メーカー（Xiaomi, OPPO, realme）や中古端末に集中する傾向がある。この偏りが検出の手がかりとなる。",
  new: [
    { model: "Xiaomi Redmi 12C/13C", price: "¥15,000-20,000", reason: "最安価格帯で安定動作", detection: "MediaTek Helio G85, MIUI" },
    { model: "OPPO A77/A79", price: "¥20,000-25,000", reason: "国内で入手容易", detection: "ColorOS, Snapdragon 680" },
    { model: "realme C55/C67", price: "¥15,000-20,000", reason: "コスパが良い", detection: "realme UI" },
    { model: "moto g14/g24", price: "¥15,000-20,000", reason: "素のAndroidに近い", detection: "純正Android" },
  ],
  used: [
    { model: "Galaxy A20/A21", price: "¥3,000-5,000", source: "メルカリ、ヤフオク", detection: "Android 11で更新停止, 古いパッチ" },
    { model: "AQUOS sense3/4", price: "¥5,000-8,000", source: "中古ショップ", detection: "特定ビルド番号, 古いパッチ" },
    { model: "Pixel 3a/4a", price: "¥8,000-12,000", source: "中古ショップ", detection: "サポート終了, 古いパッチ" },
    { model: "Redmi Note 9S", price: "¥5,000-8,000", source: "メルカリ", detection: "MIUI旧バージョン" },
  ],
  accessories: [
    { name: "Anker PowerPort 10（10ポート）", price: "¥5,000", feature: "定番、安定" },
    { name: "UGREEN 16ポートUSB Hub", price: "¥4,000", feature: "多ポート" },
    { name: "Sabrent 60W 10ポート", price: "¥3,500", feature: "コスパ良" },
    { name: "AliExpress無名ブランド 20ポート", price: "¥2,000-3,000", feature: "最安、品質不安定" },
  ],
};

export const hardwareSolutionsExplanation = {
  purpose: "Phone Farm専用ボックスは、複数端末を効率的に運用するためのインフラ。以下の課題を解決する：",
  benefits: [
    { title: "物理的な整理・収納", desc: "10-20台のスマホを省スペースで管理" },
    { title: "電源供給の一元化", desc: "全端末への安定した給電（200-300W）" },
    { title: "冷却・排熱", desc: "長時間稼働時の発熱対策（ファン内蔵）" },
    { title: "ケーブル管理", desc: "USB配線の整理、断線防止" },
    { title: "視認性の確保", desc: "全画面を一度に確認できる配置" },
  ],
  detectionTip: "専用製品利用者は、起動時刻・温度センサー値・Wi-Fi接続パターンが類似するため、これらの相関を検出することで特定可能",
};

export const some3cProducts = {
  explanation: "Some3Cは、Phone Farm専用ハードウェアとソフトウェア（Panda）をセットで提供する中国メーカー。初心者にとって「ワンストップで揃う」ため最も選ばれている。",
  entry: [
    { name: "10 USBポート電話ホルダーファームボックス", price: "$65.62", capacity: "10台", feature: "最安、USB充電スタンド、初心者の第一歩", popular: true },
  ],
  standard: [
    { name: "アクリルRGB 20USB充電HUBシャーシ", price: "$105.00〜$163.20", capacity: "20台", feature: "RGB LED、透明、見た目重視", popular: true },
    { name: "アクリルRGB 20モバイル電話シャーシ", price: "$163.19", capacity: "20台", feature: "RGB LED付き、透明アクリル", popular: false },
    { name: "2U サーバーラック空ボックス", price: "$168.00", capacity: "20台", feature: "サーバーラック規格", popular: false },
    { name: "8冷却ファン付き2Uラック", price: "$168.00", capacity: "20台", feature: "冷却強化、LAN/USB OTG", popular: false },
    { name: "2U サーバーラック電話ケース", price: "$188.65", capacity: "20台", feature: "グループコントロール", popular: false },
  ],
  accessories: [
    { name: "自動クリッカーデバイス", price: "$30.66〜", use: "物理タップ自動化", detection: "最高（検出困難）", danger: true },
    { name: "カスタムルーター（OpenWrt）", price: "$45.00", use: "ネットワーク制御・IP偽装", detection: "高", danger: false },
    { name: "X86ソフトルーター", price: "$136.00", use: "高度なネットワーク管理", detection: "高", danger: false },
  ],
};

export const autoClickerExplanation = {
  whatIs: "自動クリッカーは、物理的にスマホ画面をタップするハードウェアデバイス。サーボモーターやソレノイドでタッチペン先端を駆動し、「本物のタッチ」と同じイベントを発生させる。",
  whyDangerous: "ソフトウェアベースの自動化（ADB、Auto.js等）はプロセス監視や特殊なタッチイベントで検出できるが、物理クリッカーは「本物の人間のタップ」と区別がつかない。そのため、行動パターン分析でのみ検出可能。",
  detectionApproach: "機械的な周期性、位置の固定性、24時間連続稼働、端末の静止状態（ジャイロ/加速度センサー）などの不自然さを総合的に判断する必要がある。",
};

export const pandaData = {
  name: "Panda - Android Screen Projection",
  url: "https://panda.some3c.com/",
  purpose: "複数Androidデバイスの一括制御・同期・自動化",
  explanation: "Some3Cが提供するPC用ソフトウェア。複数のAndroid端末をPCの1画面で一括表示・制御できる。「開発者・QAチーム向け」と謳っているが、実質的にPhone Farm運用の中核ツールとして使われている。",
  pricing: {
    free: "40台まで無料",
    paid: "40台超はプレミアム購読",
  },
  features: [
    { name: "マルチデバイス同期", desc: "2ms未満のレイテンシで数百台に同時操作。1クリックで全端末に同じ操作を送信" },
    { name: "ビジュアルダッシュボード", desc: "リアルタイム監視、24FPSリフレッシュ。全端末の画面を一目で確認" },
    { name: "有線/無線スクリーン投影", desc: "USB/OTG、無線ミラーリング対応。ケーブルレスでも運用可能" },
    { name: "アプリ管理", desc: "一括インストール・アンインストール。TikTok等のアプリを全端末に同時導入" },
    { name: "スマート自動化", desc: "JavaScript / ADBスクリプティング対応。カスタム自動化が可能" },
    { name: "Root不要", desc: "標準ADBプロトコル使用。端末改造なしで利用可能" },
  ],
  detectionSignals: [
    "2ms以下の同期操作（人間では不可能な精度）",
    "40台という境界（無料版上限に合わせた規模）",
    "同一スクリプトパターン（JS/ADB自動化の痕跡）",
    "24FPSの操作ログ（Pandaのリフレッシュレートに一致）",
    "一括アプリインストール履歴",
  ],
};

export const softwareTools = {
  pcExplanation: "PC側ツールは、Android端末をPCから制御するために使用。初心者はGUIベースの簡単なツール（scrcpy, Vysor）を好む。技術レベルが上がるとADBコマンドを直接使用する。",
  androidExplanation: "Android側自動化ツールは、端末上で直接動作してタップ・スワイプを自動実行する。Auto.jsが最も人気で、JavaScriptでスクリプトを書ける。",
  smsExplanation: "SMS認証回避サービスは、アカウント大量作成に使用される。1回の認証につき¥10-80程度で使い捨ての電話番号を提供。これらのサービスの電話番号パターンは検出の手がかりになる。",
  proxyExplanation: "プロキシサービスは、IPアドレスを偽装してアクセス元を隠すために使用。初心者は無料〜安価なものを使うため検出しやすいが、住宅/モバイルプロキシは検出が困難。",
  pc: [
    { name: "scrcpy", use: "画面ミラーリング・操作", level: "低", detection: "高", desc: "オープンソースの画面投影ツール。GUIで複数端末を表示" },
    { name: "Vysor", use: "GUI画面ミラーリング", level: "低", detection: "高", desc: "商用の画面ミラーリングツール。より使いやすいUI" },
    { name: "ADB", use: "コマンドライン制御", level: "中", detection: "中", desc: "Android標準の開発ツール。シェルスクリプトで自動化" },
    { name: "Appium", use: "自動テストフレームワーク", level: "高", detection: "低", desc: "本格的なテスト自動化。検出を回避しやすい" },
  ],
  android: [
    { name: "Auto.js", price: "無料", level: "低-中", feature: "JavaScript、初心者に最人気", desc: "JavaScriptでAndroid自動化。アクセシビリティサービスを利用" },
    { name: "Tasker + AutoInput", price: "有料", level: "低", feature: "GUI設定、プログラミング不要", desc: "ノーコードで自動化を設定できる" },
    { name: "MacroDroid", price: "無料/有料", level: "低", feature: "簡易マクロ", desc: "シンプルなマクロ記録・再生" },
    { name: "Automate", price: "無料", level: "低", feature: "フローチャート形式", desc: "ビジュアルにフローを組める" },
  ],
  sms: [
    { name: "5sim.net", price: "¥10-50", feature: "ロシア系、安価" },
    { name: "sms-activate.org", price: "¥15-60", feature: "大手、安定" },
    { name: "smspva.com", price: "¥10-40", feature: "種類豊富" },
    { name: "onlinesim.io", price: "¥20-80", feature: "品質高め" },
  ],
  proxy: [
    { type: "無料プロキシ", service: "Free Proxy List", price: "無料", detection: "検出容易", desc: "公開プロキシリスト。IPはすでにブラックリスト化されていることが多い" },
    { type: "データセンタープロキシ", service: "ProxyRack", price: "$50/月〜", detection: "中", desc: "クラウドサーバーのIP。パターンで検出可能" },
    { type: "住宅プロキシ", service: "Bright Data, SOAX", price: "$300/月〜", detection: "検出困難", desc: "実際の家庭用ISPのIP。一般ユーザーと区別しにくい" },
    { type: "モバイルプロキシ", service: "Oxylabs", price: "$500/月〜", detection: "最も検出困難", desc: "実際のモバイルキャリアIP。最も正規に見える" },
  ],
};

export const automationExplanation = {
  purpose: "以下は、初心者業者が実際に使用する自動化スクリプトの例。これらのコードパターンを理解することで、検出ルールを設計できる。",
  bashNote: "Bash + ADBは最もシンプルな方法。座標やタイミングが固定されているため、パターン検出が容易。",
  autojsNote: "Auto.jsはJavaScriptベースで柔軟だが、random()関数が均一分布のため、人間らしくない。また、アクセシビリティサービスの使用が検出の手がかりになる。",
};

export const automationCode = {
  bash: `#!/bin/bash
# tiktok_auto_scroll.sh - 初心者が使う基本スクリプト

DEVICES=$(adb devices | grep device$ | cut -f1)

while true; do
    for device in $DEVICES; do
        # 上にスワイプ（次の動画へ）
        adb -s $device shell input swipe 540 1500 540 500 300 &
    done

    # 待機（3-8秒のランダム）
    sleep $((RANDOM % 6 + 3))

    # 30%の確率でいいね
    if [ $((RANDOM % 10)) -lt 3 ]; then
        for device in $DEVICES; do
            adb -s $device shell input tap 950 1200 &
        done
    fi
done`,
  autojs: `// tiktok_auto.js - Auto.js用スクリプト

var CONFIG = {
    minViewTime: 3000,
    maxViewTime: 8000,
    likeProb: 0.3,
    followProb: 0.05,
};

function main() {
    app.launchApp("TikTok");
    sleep(3000);

    while (true) {
        var viewTime = random(CONFIG.minViewTime, CONFIG.maxViewTime);
        sleep(viewTime);

        if (Math.random() < CONFIG.likeProb) {
            click(device.width * 0.9, device.height * 0.5);
        }

        swipe(device.width / 2, device.height * 0.7,
              device.width / 2, device.height * 0.3,
              random(300, 500));
    }
}

main();`,
};

export const detectionExplanation = {
  overview: "検出は4つの観点から行う：ハードウェア（端末の特徴）、ソフトウェア（自動化ツールの痕跡）、行動パターン（不自然な操作）、ネットワーク（IP・接続の異常）。初心者業者は複数のシグナルが重複するため、組み合わせることで高精度に検出できる。",
  strategy: "単一のシグナルではなく、複数のシグナルの組み合わせでスコアリングし、閾値を超えた場合にフラグを立てる方式が効果的。",
};

export const detectionStrategies = {
  hardware: [
    { item: "同一機種集中", method: "デバイスモデルの集計", threshold: "同一モデル5台以上で警告", why: "業者は同じ機種を大量購入する傾向" },
    { item: "古いOS/パッチ", method: "セキュリティパッチ日付", threshold: "2022年以前でフラグ", why: "中古端末はサポート終了していることが多い" },
    { item: "同一起動時刻", method: "boot_time の近似", threshold: "5分以内に3台以上", why: "Phone Farmは一括で電源を入れる" },
    { item: "同一Wi-Fi AP", method: "BSSID/SSID", threshold: "同一APから5アカウント以上", why: "同じ場所から大量アクセス" },
  ],
  software: [
    { item: "アクセシビリティ", method: "サービス有効化状態", threshold: "Auto.js等の存在", why: "自動化ツールはアクセシビリティを使用" },
    { item: "操作タイミング同期", method: "ミリ秒単位のログ", threshold: "100ms以内の同期操作", why: "複数端末への一括操作は同期する" },
    { item: "座標の固定性", method: "タップ/スワイプ座標", threshold: "同一座標への10回以上", why: "自動化は固定座標を使用" },
    { item: "軌跡の直線性", method: "スワイプパスの曲率", threshold: "曲率0.99以上", why: "人間のスワイプは曲線、自動化は直線" },
  ],
  behavior: [
    { item: "視聴時間分布", method: "統計分布の検定", threshold: "均一分布に近い場合", why: "人間は対数正規分布、自動化は均一分布" },
    { item: "操作間隔", method: "間隔のエントロピー", threshold: "低エントロピー", why: "人間はランダム、自動化は規則的" },
    { item: "いいね率", method: "いいね/視聴の比率", threshold: "通常5-15%、異常は30%超", why: "業者は高いいいね率を求められる" },
    { item: "セッション長", method: "連続使用時間", threshold: "人間は休憩あり、Farmは連続", why: "24時間稼働は人間ではありえない" },
  ],
  network: [
    { item: "IP集中", method: "同一IPからのアカウント数", threshold: "3アカウント以上", why: "通常は1IP1アカウント" },
    { item: "既知プロキシIP", method: "IPレピュテーションDB", threshold: "ブラックリストIP", why: "安価なプロキシは既知" },
    { item: "地理的不整合", method: "IP位置 vs 端末言語設定", threshold: "不一致でフラグ", why: "日本語設定なのに海外IPは不自然" },
  ],
};

export const detectionQueries = {
  sameDevice: `SELECT
    device_model,
    COUNT(DISTINCT user_id) as user_count,
    COUNT(*) as action_count
FROM user_actions
WHERE timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY device_model
HAVING user_count > 5
ORDER BY user_count DESC;`,
  sameIP: `SELECT
    ip_address,
    COUNT(DISTINCT user_id) as account_count,
    ARRAY_AGG(DISTINCT user_id) as user_ids
FROM login_logs
WHERE timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY ip_address
HAVING account_count > 2;`,
  syncTiming: `SELECT
    DATE_TRUNC('second', timestamp) as action_second,
    COUNT(*) as simultaneous_actions,
    ARRAY_AGG(user_id) as users
FROM user_actions
WHERE action_type = 'like'
  AND timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY action_second
HAVING simultaneous_actions > 3;`,
};
