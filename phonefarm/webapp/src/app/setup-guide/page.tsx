"use client";

import Link from "next/link";
import { useState } from "react";
import {
  guideMeta,
  setupPhases,
  budgetConfigs,
  shoppingList,
  setupSteps,
  troubleshooting,
} from "@/data/setup-guide-data";

export default function SetupGuidePage() {
  const [selectedConfig, setSelectedConfig] = useState<"minimum" | "standard">("minimum");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStepsByPhase = (phaseNum: number) => {
    return setupSteps.filter((step) => step.phase === phaseNum);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-sky-600 text-sm">
              ← レポートに戻る
            </Link>
            <h1 className="text-lg font-bold text-sky-700">Phone Farm</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
            >
              レポート
            </Link>
            <span className="px-3 py-1.5 text-sm rounded-lg bg-sky-100 text-sky-700 font-medium">
              セットアップガイド
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="inline-block mb-4">
            <span className="badge badge-cyan">GUIDE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-2">
            {guideMeta.title}
          </h1>
          <p className="text-xl text-gray-600">{guideMeta.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>総所要期間: {guideMeta.totalDays}</span>
          </div>

          <div className="mt-6 alert alert-warning">
            <strong>注意:</strong> {guideMeta.disclaimer}
          </div>

          <div className="mt-4 alert alert-info">
            <strong>目的:</strong> {guideMeta.purpose}
          </div>
        </header>

        {/* Budget Configuration Selector */}
        <section className="mb-16">
          <h2 className="section-header">予算構成を選択</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Minimum Config */}
            <div
              className={`card cursor-pointer transition-all ${
                selectedConfig === "minimum"
                  ? "border-sky-500 border-2 bg-sky-50"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSelectedConfig("minimum")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {budgetConfigs.minimum.name}
                </h3>
                {selectedConfig === "minimum" && (
                  <span className="badge badge-cyan">選択中</span>
                )}
              </div>
              <p className="text-3xl font-bold text-sky-600 mb-2">
                {formatPrice(budgetConfigs.minimum.total)}
              </p>
              <p className="text-gray-600 mb-4">{budgetConfigs.minimum.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {budgetConfigs.minimum.scale}
                </span>
                <span className="text-red-600">
                  検出リスク: {budgetConfigs.minimum.detectionRisk}
                </span>
              </div>
            </div>

            {/* Standard Config */}
            <div
              className={`card cursor-pointer transition-all ${
                selectedConfig === "standard"
                  ? "border-sky-500 border-2 bg-sky-50"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSelectedConfig("standard")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {budgetConfigs.standard.name}
                </h3>
                {selectedConfig === "standard" && (
                  <span className="badge badge-cyan">選択中</span>
                )}
              </div>
              <p className="text-3xl font-bold text-sky-600 mb-2">
                {formatPrice(budgetConfigs.standard.total)}
              </p>
              <p className="text-gray-600 mb-4">{budgetConfigs.standard.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {budgetConfigs.standard.scale}
                </span>
                <span className="text-amber-600">
                  検出リスク: {budgetConfigs.standard.detectionRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Config Details */}
          <div className="mt-8 card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {budgetConfigs[selectedConfig].name} - 買い物リスト
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>カテゴリ</th>
                    <th>商品名</th>
                    <th>数量</th>
                    <th>単価</th>
                    <th>小計</th>
                    <th>購入先</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetConfigs[selectedConfig].items.map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium text-gray-700">{item.category}</td>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td className="price">{formatPrice(item.unitPrice)}</td>
                      <td className="price font-medium">{formatPrice(item.subtotal)}</td>
                      <td className="text-sky-600">{item.where}</td>
                    </tr>
                  ))}
                  <tr className="bg-sky-50">
                    <td colSpan={4} className="font-bold text-right">
                      合計
                    </td>
                    <td className="price font-bold text-lg">
                      {formatPrice(budgetConfigs[selectedConfig].total)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Shopping List Details */}
        <section className="mb-16">
          <h2 className="section-header">商品詳細・購入先</h2>

          {/* Devices */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">端末</h3>

            <h4 className="font-medium text-gray-700 mb-3">中古（コスト重視）</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {shoppingList.devices.used.map((device, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{device.name}</span>
                    <span className="text-sky-600 font-bold">{device.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{device.note}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {device.checkPoints.map((point, j) => (
                      <span key={j} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {point}
                      </span>
                    ))}
                  </div>
                  <a
                    href={device.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    {device.where}で検索 →
                  </a>
                  <p className="text-xs text-red-500 mt-2">
                    検出シグナル: {device.detectionSignal}
                  </p>
                </div>
              ))}
            </div>

            <h4 className="font-medium text-gray-700 mb-3">新品（安定重視）</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shoppingList.devices.new.map((device, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{device.name}</span>
                    <span className="text-sky-600 font-bold">{device.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{device.note}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {device.checkPoints.map((point, j) => (
                      <span key={j} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {point}
                      </span>
                    ))}
                  </div>
                  <a
                    href={device.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    {device.where}で検索 →
                  </a>
                  <p className="text-xs text-red-500 mt-2">
                    検出シグナル: {device.detectionSignal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chargers */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">充電器</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {shoppingList.chargers.map((charger, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{charger.name}</span>
                  </div>
                  <p className="text-sky-600 font-bold mb-2">{charger.price}</p>
                  <p className="text-sm text-gray-600 mb-2">{charger.note}</p>
                  <p className="text-xs text-gray-500">{charger.specs}</p>
                  <a
                    href={charger.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline mt-2 block"
                  >
                    {charger.where}で検索 →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Boxes */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Phone Farm ボックス</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {shoppingList.farmBoxes.map((box, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    box.popular ? "bg-sky-50 border-2 border-sky-200" : "bg-gray-50"
                  }`}
                >
                  {box.popular && (
                    <span className="badge badge-green mb-2 inline-block">人気</span>
                  )}
                  <h4 className="font-medium text-gray-800 mb-2">{box.name}</h4>
                  <p className="text-sky-600 font-bold mb-2">{box.price}</p>
                  <p className="text-sm text-gray-600 mb-2">{box.note}</p>
                  <p className="text-xs text-gray-500 mb-2">{box.specs}</p>
                  <a
                    href={box.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    {box.where} →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Services */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">SMS認証サービス</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {shoppingList.smsServices.map((service, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">{service.name}</h4>
                  <p className="text-sky-600 font-bold mb-2">{service.price}</p>
                  <p className="text-sm text-gray-600 mb-2">{service.note}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    最低チャージ: {service.minDeposit}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {service.supported.slice(0, 3).map((s, j) => (
                      <span key={j} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    サイトへ →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Software */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ソフトウェア</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {shoppingList.software.map((sw, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{sw.name}</h4>
                    <span className="text-sky-600 font-bold">{sw.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    プラットフォーム: {sw.platform}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{sw.note}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {sw.features.map((f, j) => (
                      <span key={j} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                  {sw.detectionSignal && (
                    <p className="text-xs text-red-500">
                      検出シグナル: {sw.detectionSignal}
                    </p>
                  )}
                  <a
                    href={sw.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline mt-2 block"
                  >
                    ダウンロード →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step by Step Guide */}
        <section className="mb-16">
          <h2 className="section-header">ステップバイステップガイド</h2>

          {/* Phase Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {setupPhases.map((phase) => (
              <a
                key={phase.id}
                href={`#phase-${phase.phase}`}
                className="card card-hover text-center"
              >
                <div className="text-2xl mb-2">
                  {phase.phase === 0 && "📋"}
                  {phase.phase === 1 && "🛒"}
                  {phase.phase === 2 && "🔧"}
                  {phase.phase === 3 && "📱"}
                  {phase.phase === 4 && "💻"}
                  {phase.phase === 5 && "👤"}
                  {phase.phase === 6 && "▶️"}
                  {phase.phase === 7 && "📊"}
                </div>
                <h3 className="font-medium text-gray-800">Phase {phase.phase}</h3>
                <p className="text-sm text-gray-600">{phase.title}</p>
                <p className="text-xs text-gray-400 mt-1">{phase.days}</p>
              </a>
            ))}
          </div>

          {/* Each Phase */}
          {setupPhases.map((phase) => (
            <div key={phase.id} id={`phase-${phase.phase}`} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">
                  {phase.phase === 0 && "📋"}
                  {phase.phase === 1 && "🛒"}
                  {phase.phase === 2 && "🔧"}
                  {phase.phase === 3 && "📱"}
                  {phase.phase === 4 && "💻"}
                  {phase.phase === 5 && "👤"}
                  {phase.phase === 6 && "▶️"}
                  {phase.phase === 7 && "📊"}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Phase {phase.phase}: {phase.title}
                  </h3>
                  <p className="text-sm text-gray-500">{phase.days}</p>
                </div>
              </div>

              <div className="space-y-4">
                {getStepsByPhase(phase.phase).map((step) => (
                  <div key={step.step} className="card border-l-4 border-l-sky-500">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-sky-100 text-sky-700 font-bold px-3 py-1 rounded-full text-sm">
                          Step {step.step}
                        </span>
                        <h4 className="font-bold text-gray-800">{step.title}</h4>
                      </div>
                      <span className="text-sm text-gray-500">{step.duration}</span>
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {step.actions && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">手順:</h5>
                        <ul className="space-y-1">
                          {step.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600">
                              <span className="text-sky-500 mt-1">→</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(step.command || step.commandWindows || step.commandMac) && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">コマンド:</h5>
                        <pre className="code-block text-sm overflow-x-auto">
                          {step.command || step.commandWindows || step.commandMac}
                        </pre>
                      </div>
                    )}

                    {step.script && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">スクリプト:</h5>
                        <pre className="code-block text-sm overflow-x-auto">
                          {step.script}
                        </pre>
                      </div>
                    )}

                    {step.tips && (
                      <div className="alert alert-info text-sm">
                        <strong>Tips:</strong> {step.tips}
                      </div>
                    )}

                    {step.detectionSignal && (
                      <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>検出シグナル:</strong> {step.detectionSignal}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Troubleshooting */}
        <section className="mb-16">
          <h2 className="section-header">トラブルシューティング</h2>

          <div className="space-y-4">
            {troubleshooting.map((item, i) => (
              <details key={i} className="card">
                <summary className="cursor-pointer font-bold text-gray-800 hover:text-sky-600">
                  {item.issue}
                </summary>
                <div className="mt-4">
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">症状:</h5>
                    <ul className="space-y-1">
                      {item.symptoms.map((s, j) => (
                        <li key={j} className="text-gray-600 flex items-center gap-2">
                          <span className="text-red-500">!</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">解決策:</h5>
                    <ul className="space-y-1">
                      {item.solutions.map((s, j) => (
                        <li key={j} className="text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>
            本ガイドはセキュリティ目的で作成されています。
            <br />
            記載された手法は検出・対策のための理解を目的としており、不正行為を推奨するものではありません。
          </p>
          <p className="mt-4">
            <Link href="/" className="text-sky-600 hover:underline">
              ← レポートに戻る
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
