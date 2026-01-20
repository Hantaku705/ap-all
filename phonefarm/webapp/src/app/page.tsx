import Navigation from "@/components/Navigation";
import {
  reportMeta,
  reportPurpose,
  sectionDescriptions,
  overviewData,
  hardwareDevices,
  hardwareSolutionsExplanation,
  some3cProducts,
  autoClickerExplanation,
  pandaData,
  softwareTools,
  automationCode,
  automationExplanation,
  detectionStrategies,
  detectionQueries,
  detectionExplanation,
} from "@/data/report-data";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="mb-12 text-center lg:text-left">
          <div className="inline-block mb-4">
            <span className="badge badge-red">INTERNAL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 glow mb-2">
            {reportMeta.title}
          </h1>
          <p className="text-xl text-gray-600">{reportMeta.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-500">
            <span>Purpose: {reportMeta.purpose}</span>
            <span>Date: {reportMeta.date}</span>
          </div>
        </header>

        {/* Report Purpose Section */}
        <section className="mb-16 card border-l-4 border-l-sky-500">
          <h2 className="text-xl font-bold text-sky-700 mb-4">このレポートの目的</h2>
          <p className="text-gray-700 mb-6">{reportPurpose.objective}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">対象読者</h3>
              <ul className="space-y-1">
                {reportPurpose.targetAudience.map((audience, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="text-sky-500">-</span>
                    {audience}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">活用方法</h3>
              <ul className="space-y-1">
                {reportPurpose.howToUse.map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-sky-500 mt-0.5">{i + 1}.</span>
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">用語解説</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportPurpose.keyTerms.map((term, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-sky-700">{term.term}</span>
                  <p className="text-sm text-gray-600 mt-1">{term.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section id="overview" className="mb-16">
          <h2 className="section-header">概要</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.overview.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.overview.keyPoint}</span>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Phone Farmとは
            </h3>
            <p className="text-gray-600">{overviewData.description}</p>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              なぜ初心者業者を対象にするのか
            </h3>
            <p className="text-gray-600">{overviewData.whyTarget}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                初心者業者のプロファイル
              </h3>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-700">規模</td>
                    <td>{overviewData.beginnerProfile.scale}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700">投資額</td>
                    <td className="price">
                      {overviewData.beginnerProfile.investment}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700">技術レベル</td>
                    <td>{overviewData.beginnerProfile.techLevel}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700">検出回避</td>
                    <td className="detection-easy">
                      {overviewData.beginnerProfile.detection}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                不正行為の種類と相場
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>種類</th>
                    <th>価格</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewData.fraudTypes.map((item, i) => (
                    <tr key={i}>
                      <td className="text-gray-700">{item.type}</td>
                      <td className="price">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Hardware Section */}
        <section id="hardware" className="mb-16">
          <h2 className="section-header">ハードウェア構成</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.hardware.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.hardware.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700">{hardwareDevices.explanation}</p>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              新品購入の場合
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>機種</th>
                    <th>価格帯</th>
                    <th>選定理由</th>
                    <th>検出シグナル</th>
                  </tr>
                </thead>
                <tbody>
                  {hardwareDevices.new.map((device, i) => (
                    <tr key={i}>
                      <td className="text-gray-700 font-medium">
                        {device.model}
                      </td>
                      <td className="price">{device.price}</td>
                      <td>{device.reason}</td>
                      <td className="text-yellow-500 text-sm">
                        {device.detection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              中古購入の場合（最低コスト）
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>機種</th>
                    <th>中古価格</th>
                    <th>入手先</th>
                    <th>検出シグナル</th>
                  </tr>
                </thead>
                <tbody>
                  {hardwareDevices.used.map((device, i) => (
                    <tr key={i}>
                      <td className="text-gray-700 font-medium">
                        {device.model}
                      </td>
                      <td className="price">{device.price}</td>
                      <td>{device.source}</td>
                      <td className="text-yellow-500 text-sm">
                        {device.detection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="alert alert-info">
            <strong>検出ポイント:</strong> 同一機種の集中、古いセキュリティパッチ日付（2022年以前）、サポート終了端末
          </div>
        </section>

        {/* Hardware Solutions Section */}
        <section id="hardware-solutions" className="mb-16">
          <h2 className="section-header">専用ハードウェアソリューション</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.hardwareSolutions.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.hardwareSolutions.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700 mb-4">{hardwareSolutionsExplanation.purpose}</p>
            <ul className="space-y-2">
              {hardwareSolutionsExplanation.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">{i + 1}.</span>
                  <div>
                    <span className="font-medium text-gray-800">{benefit.title}</span>
                    <span className="text-gray-600"> - {benefit.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="alert alert-warning mb-6">
            <strong>検出のヒント:</strong> {hardwareSolutionsExplanation.detectionTip}
          </div>
        </section>

        {/* Some3C Products Section */}
        <section id="some3c-products" className="mb-16">
          <h2 className="section-header">Some3C 製品ラインナップ</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.some3cProducts.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.some3cProducts.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700">{some3cProducts.explanation}</p>
          </div>

          <div className="alert alert-warning mb-6">
            <strong>公式サイト:</strong>{" "}
            <a
              href="https://some3c.com/collections/all"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              https://some3c.com/collections/all
            </a>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              初心者向け（エントリー）
            </h3>
            {some3cProducts.entry.map((product, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-lg"
              >
                <div>
                  <span className="text-gray-800 font-medium">
                    {product.name}
                  </span>
                  <span className="ml-2 badge badge-green">人気</span>
                  <p className="text-sm text-gray-600 mt-1">{product.feature}</p>
                </div>
                <div className="text-right">
                  <span className="price text-xl">{product.price}</span>
                  <p className="text-sm text-gray-600">{product.capacity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              20台対応（標準〜中級）
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>製品名</th>
                    <th>価格</th>
                    <th>特徴</th>
                  </tr>
                </thead>
                <tbody>
                  {some3cProducts.standard.map((product, i) => (
                    <tr key={i}>
                      <td className="text-gray-700">
                        {product.name}
                        {product.popular && (
                          <span className="ml-2 badge badge-green">人気</span>
                        )}
                      </td>
                      <td className="price">{product.price}</td>
                      <td>{product.feature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-red-400 mb-4">
              アクセサリー（重要）
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>製品名</th>
                    <th>価格</th>
                    <th>用途</th>
                    <th>検出難易度</th>
                  </tr>
                </thead>
                <tbody>
                  {some3cProducts.accessories.map((product, i) => (
                    <tr key={i} className={product.danger ? "bg-red-900/20" : ""}>
                      <td className="text-gray-700 font-medium">
                        {product.name}
                        {product.danger && (
                          <span className="ml-2 badge badge-red">危険</span>
                        )}
                      </td>
                      <td className="price">{product.price}</td>
                      <td>{product.use}</td>
                      <td
                        className={
                          product.detection === "最高（検出困難）"
                            ? "detection-hard"
                            : "detection-medium"
                        }
                      >
                        {product.detection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Auto Clicker Section */}
        <section id="auto-clicker" className="mb-16">
          <h2 className="section-header text-red-400">
            自動クリッカーデバイス（検出困難な脅威）
          </h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.autoClicker.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.autoClicker.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-red-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">自動クリッカーとは</h3>
            <p className="text-gray-700 mb-4">{autoClickerExplanation.whatIs}</p>

            <h3 className="text-lg font-semibold text-red-600 mb-3">なぜ危険なのか</h3>
            <p className="text-gray-700 mb-4">{autoClickerExplanation.whyDangerous}</p>

            <h3 className="text-lg font-semibold text-sky-700 mb-3">検出アプローチ</h3>
            <p className="text-gray-700">{autoClickerExplanation.detectionApproach}</p>
          </div>

          <div className="alert alert-danger mb-6">
            <strong>警告:</strong>{" "}
            このデバイスはソフトウェア検出では見つからないため、行動分析ベースの検出が必要
          </div>

          <div className="ascii-box mb-6">{`┌─────────────────────────────────────────────────────────────┐
│  自動クリッカーデバイスの仕組み                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────┐                                             │
│     │ 制御基板 │ ← タイミング/パターン設定                  │
│     └────┬────┘                                             │
│          │                                                  │
│     ┌────▼────┐                                             │
│     │サーボ/   │                                             │
│     │ソレノイド│ ← 物理的な駆動装置                         │
│     └────┬────┘                                             │
│          │                                                  │
│     ┌────▼────┐                                             │
│     │タッチペン│ ← 静電容量式タッチに対応                   │
│     │  先端   │                                             │
│     └────┬────┘                                             │
│          │                                                  │
│     ┌────▼────┐                                             │
│     │  画面   │ ← 「本物のタッチ」として認識               │
│     └─────────┘                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘`}</div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ソフトウェア自動化 vs 物理クリッカー
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>ソフトウェア自動化</th>
                    <th>物理クリッカー</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-gray-700">タッチイベント</td>
                    <td>ADB/アクセシビリティ経由</td>
                    <td className="detection-hard font-medium">
                      本物のタッチと同一
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-700">圧力センサー</td>
                    <td>0 or 固定値</td>
                    <td className="detection-hard font-medium">自然な値</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700">タッチサイズ</td>
                    <td>固定値</td>
                    <td className="detection-hard font-medium">自然な変動</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700">ソフトウェア痕跡</td>
                    <td>Auto.js等の存在</td>
                    <td className="detection-hard font-medium">なし</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700">検出方法</td>
                    <td className="detection-easy">プロセス監視で可能</td>
                    <td className="detection-hard font-medium">行動分析のみ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              物理クリッカー検出の着眼点
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">1.</span>
                <div>
                  <span className="text-gray-800 font-medium">
                    機械的な周期性
                  </span>
                  <p className="text-gray-500 text-sm">
                    タップ間隔が極めて規則的（人間は揺らぐ）
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">2.</span>
                <div>
                  <span className="text-gray-800 font-medium">位置の固定性</span>
                  <p className="text-gray-500 text-sm">
                    同一座標への繰り返しタップ（人間はずれる）
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">3.</span>
                <div>
                  <span className="text-gray-800 font-medium">
                    24時間連続稼働
                  </span>
                  <p className="text-gray-500 text-sm">
                    休憩・睡眠パターンがない
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">4.</span>
                <div>
                  <span className="text-gray-800 font-medium">
                    端末の静止状態
                  </span>
                  <p className="text-gray-500 text-sm">
                    ジャイロ/加速度センサーが完全静止
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">5.</span>
                <div>
                  <span className="text-gray-800 font-medium">
                    環境光センサーの変化なし
                  </span>
                  <p className="text-gray-500 text-sm">
                    同一環境で固定されている証拠
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Panda Section */}
        <section id="panda" className="mb-16">
          <h2 className="section-header">Some3C Panda（専用制御ソフトウェア）</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.panda.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.panda.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700">{pandaData.explanation}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                製品概要
              </h3>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td className="text-gray-700 font-medium">製品名</td>
                    <td>{pandaData.name}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 font-medium">URL</td>
                    <td>
                      <a
                        href={pandaData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 underline"
                      >
                        {pandaData.url}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 font-medium">無料版</td>
                    <td className="detection-easy font-medium">
                      {pandaData.pricing.free}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 font-medium">有料版</td>
                    <td>{pandaData.pricing.paid}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                主な機能
              </h3>
              <ul className="space-y-2">
                {pandaData.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <div>
                      <span className="text-gray-800">{feature.name}</span>
                      <p className="text-gray-500 text-sm">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Panda利用者の検出シグナル
            </h3>
            <ul className="space-y-2">
              {pandaData.detectionSignals.map((signal, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span className="text-gray-700">{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Software Section */}
        <section id="software" className="mb-16">
          <h2 className="section-header">ソフトウェアプラットフォーム</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.software.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.software.keyPoint}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                PC側ツール
              </h3>
              <p className="text-sm text-gray-600 mb-4">{softwareTools.pcExplanation}</p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ツール</th>
                      <th>技術レベル</th>
                      <th>検出</th>
                    </tr>
                  </thead>
                  <tbody>
                    {softwareTools.pc.map((tool, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{tool.name}</td>
                        <td>{tool.level}</td>
                        <td
                          className={
                            tool.detection === "高"
                              ? "detection-easy"
                              : tool.detection === "中"
                              ? "detection-medium"
                              : "detection-hard"
                          }
                        >
                          {tool.detection}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Android側自動化ツール
              </h3>
              <p className="text-sm text-gray-600 mb-4">{softwareTools.androidExplanation}</p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ツール</th>
                      <th>価格</th>
                      <th>特徴</th>
                    </tr>
                  </thead>
                  <tbody>
                    {softwareTools.android.map((tool, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{tool.name}</td>
                        <td>{tool.price}</td>
                        <td className="text-sm">{tool.feature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                SMS認証回避サービス
              </h3>
              <p className="text-sm text-gray-600 mb-4">{softwareTools.smsExplanation}</p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>サービス</th>
                      <th>価格/認証</th>
                    </tr>
                  </thead>
                  <tbody>
                    {softwareTools.sms.map((service, i) => (
                      <tr key={i}>
                        <td className="text-gray-700">{service.name}</td>
                        <td className="price">{service.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                プロキシサービス
              </h3>
              <p className="text-sm text-gray-600 mb-4">{softwareTools.proxyExplanation}</p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>種類</th>
                      <th>価格</th>
                      <th>検出</th>
                    </tr>
                  </thead>
                  <tbody>
                    {softwareTools.proxy.map((proxy, i) => (
                      <tr key={i}>
                        <td className="text-gray-700">{proxy.type}</td>
                        <td className="price">{proxy.price}</td>
                        <td
                          className={
                            proxy.detection === "検出容易"
                              ? "detection-easy"
                              : proxy.detection === "中"
                              ? "detection-medium"
                              : "detection-hard"
                          }
                        >
                          {proxy.detection}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Automation Section */}
        <section id="automation" className="mb-16">
          <h2 className="section-header">自動化実装例</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.automation.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.automation.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700">{automationExplanation.purpose}</p>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Bash + ADB（初心者定番）
            </h3>
            <p className="text-sm text-gray-600 mb-4">{automationExplanation.bashNote}</p>
            <pre className="code-block">{automationCode.bash}</pre>
            <div className="alert alert-warning mt-4">
              <strong>検出ポイント:</strong> input swipe
              のパラメータが固定、スワイプ軌跡が完全な直線、全端末が同一タイミングで動作
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Auto.js（初心者に最も人気）
            </h3>
            <p className="text-sm text-gray-600 mb-4">{automationExplanation.autojsNote}</p>
            <pre className="code-block">{automationCode.autojs}</pre>
            <div className="alert alert-warning mt-4">
              <strong>検出ポイント:</strong> random()
              が均一分布で不自然、座標が画面解像度に対して固定比率、アクセシビリティサービス経由のクリックイベント
            </div>
          </div>
        </section>

        {/* Detection Section */}
        <section id="detection" className="mb-16">
          <h2 className="section-header">検出戦略まとめ</h2>

          <div className="alert alert-info mb-6">
            <strong>このセクションの目的:</strong> {sectionDescriptions.detection.purpose}
            <br />
            <span className="text-sm">ポイント: {sectionDescriptions.detection.keyPoint}</span>
          </div>

          <div className="card mb-6 border-l-4 border-l-amber-500">
            <p className="text-gray-700 mb-3">{detectionExplanation.overview}</p>
            <p className="text-gray-600 text-sm">{detectionExplanation.strategy}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                ハードウェア由来の検出
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>検出項目</th>
                      <th>閾値目安</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionStrategies.hardware.map((item, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{item.item}</td>
                        <td className="text-sm">{item.threshold}</td>
                        <td className="text-sm text-gray-500">{item.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                ソフトウェア由来の検出
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>検出項目</th>
                      <th>閾値目安</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionStrategies.software.map((item, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{item.item}</td>
                        <td className="text-sm">{item.threshold}</td>
                        <td className="text-sm text-gray-500">{item.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                行動パターン由来の検出
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>検出項目</th>
                      <th>閾値目安</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionStrategies.behavior.map((item, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{item.item}</td>
                        <td className="text-sm">{item.threshold}</td>
                        <td className="text-sm text-gray-500">{item.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                ネットワーク由来の検出
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>検出項目</th>
                      <th>閾値目安</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionStrategies.network.map((item, i) => (
                      <tr key={i}>
                        <td className="text-gray-700 font-medium">{item.item}</td>
                        <td className="text-sm">{item.threshold}</td>
                        <td className="text-sm text-gray-500">{item.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              検出クエリ例
            </h3>
            <p className="text-sm text-gray-600 mb-4">以下はSQLクエリの例。実際のデータベーススキーマに合わせて調整が必要。</p>

            <div className="mb-4">
              <h4 className="text-gray-700 font-medium mb-2">同一機種からの異常アクセス</h4>
              <pre className="code-block">{detectionQueries.sameDevice}</pre>
            </div>

            <div className="mb-4">
              <h4 className="text-gray-700 font-medium mb-2">同一IPからの複数アカウント</h4>
              <pre className="code-block">{detectionQueries.sameIP}</pre>
            </div>

            <div>
              <h4 className="text-gray-700 font-medium mb-2">操作タイミングの同期検出</h4>
              <pre className="code-block">{detectionQueries.syncTiming}</pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>
            本レポートはセキュリティ目的で作成されています。
            <br />
            記載された手法は検出・対策のための理解を目的としており、不正行為を推奨するものではありません。
          </p>
          <p className="mt-4">
            Phone Farm Threat Intelligence Report | Classification: Internal |
            Date: 2026-01-20
          </p>
        </footer>
      </main>
    </div>
  );
}
