"use client";

import { X, User, Target, Activity, MessageSquare, BarChart3, CheckCircle, Info, Lightbulb, TrendingUp, AlertCircle, Heart } from "lucide-react";
import { Persona } from "@/types/persona.types";
import { BRAND_COLORS } from "@/lib/utils/colors";

interface PersonaDetailPanelProps {
  persona: Persona | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonaDetailPanel({
  persona,
  isOpen,
  onClose,
}: PersonaDetailPanelProps) {
  if (!isOpen || !persona) return null;

  const brandColor = BRAND_COLORS[persona.brand] || "#666";

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* パネル */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* ヘッダー */}
        <div
          className="sticky top-0 p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: brandColor + "10" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{persona.name}</h2>
              <p className="text-sm" style={{ color: brandColor }}>
                {persona.brand}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* 説明 */}
          <div>
            <p className="text-muted-foreground">{persona.description}</p>
          </div>

          {/* ポジション */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              散布図上の位置
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">時間・労力投資</p>
                <p className="text-lg font-bold">
                  {persona.position.x.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({persona.position.x < 0 ? "手軽・効率重視" : "丁寧・時間投資"})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">心理的関与度</p>
                <p className="text-lg font-bold">
                  {persona.position.y.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({persona.position.y < 0 ? "ルーティン" : "こだわり派"})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* プロフィール */}
          <div>
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              プロフィール
            </h3>
            <div className="space-y-2">
              <ProfileItem label="ライフステージ" value={persona.attributes.life_stage} />
              <ProfileItem label="料理スキル" value={persona.attributes.cooking_skill} />
              <ProfileItem label="主な動機" value={persona.attributes.primary_motivation} />
              <ProfileItem label="調理シーン" value={persona.attributes.primary_occasion} />
              <ProfileItem label="主な感情" value={persona.attributes.primary_emotion} />
            </div>
          </div>

          {/* 行動パターン */}
          <div>
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              行動パターン
            </h3>
            <div className="space-y-3">
              {persona.behavior.cooking_for.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">調理対象</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.behavior.cooking_for.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: brandColor + "20", color: brandColor }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {persona.behavior.peak_occasions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">よく使うシーン</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.behavior.peak_occasions.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {persona.behavior.keywords.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">関連キーワード</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.behavior.keywords.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                      >
                        #{item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* メトリクス */}
          <div>
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              指標
              {persona.metrics.is_real_data && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  実測値
                </span>
              )}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <MetricCard
                label="投稿数"
                value={persona.metrics.post_count.toLocaleString()}
                unit="件"
                isRealData={persona.metrics.is_real_data}
              />
              <MetricCard
                label="平均エンゲージ"
                value={persona.metrics.avg_engagement.toLocaleString()}
                isRealData={persona.metrics.is_real_data}
              />
              <MetricCard
                label="シェア"
                value={persona.metrics.share_percentage.toFixed(1)}
                unit="%"
                isRealData={persona.metrics.is_real_data}
              />
            </div>
            {persona.metrics.is_real_data && (
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  このペルソナはk-meansクラスタリングにより{persona.metrics.post_count.toLocaleString()}件の投稿から抽出されました。
                  指標は実際のクラスター統計に基づいています。
                </span>
              </div>
            )}
          </div>

          {/* インサイト（深い洞察） */}
          {persona.insights && (persona.insights.painPoints?.length || persona.insights.motivations?.length || persona.insights.brandPerception) && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2 text-purple-800">
                <Lightbulb className="w-4 h-4" />
                インサイト
              </h3>
              <div className="space-y-3">
                {persona.insights.painPoints && persona.insights.painPoints.length > 0 && (
                  <div>
                    <p className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      課題・不満
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {persona.insights.painPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.insights.motivations && persona.insights.motivations.length > 0 && (
                  <div>
                    <p className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      動機・欲求
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {persona.insights.motivations.map((motive, i) => (
                        <li key={i}>{motive}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.insights.brandPerception && (
                  <div>
                    <p className="text-xs text-purple-600 mb-1">ブランド認識</p>
                    <p className="text-sm text-gray-700 italic">&ldquo;{persona.insights.brandPerception}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 行動推奨 */}
          {persona.recommendations && (persona.recommendations.targetCEPs?.length || persona.recommendations.contentThemes?.length || persona.recommendations.communicationTips?.length) && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2 text-green-800">
                <TrendingUp className="w-4 h-4" />
                行動推奨
              </h3>
              <div className="space-y-3">
                {persona.recommendations.targetCEPs && persona.recommendations.targetCEPs.length > 0 && (
                  <div>
                    <p className="text-xs text-green-600 mb-1">効果的なCEP（利用文脈）</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.recommendations.targetCEPs.map((cep, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        >
                          {cep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {persona.recommendations.contentThemes && persona.recommendations.contentThemes.length > 0 && (
                  <div>
                    <p className="text-xs text-green-600 mb-1">推奨コンテンツテーマ</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {persona.recommendations.contentThemes.map((theme, i) => (
                        <li key={i}>{theme}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.recommendations.communicationTips && persona.recommendations.communicationTips.length > 0 && (
                  <div>
                    <p className="text-xs text-green-600 mb-1">コミュニケーション施策</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {persona.recommendations.communicationTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* サンプル投稿 */}
          {persona.sample_posts && persona.sample_posts.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                代表的な投稿（{persona.sample_posts.length}件）
              </h3>
              <div className="space-y-2">
                {persona.sample_posts.map((post, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground"
                  >
                    &ldquo;{post}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-200 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  isRealData,
}: {
  label: string;
  value: string;
  unit?: string;
  isRealData?: boolean;
}) {
  return (
    <div className={`p-2 rounded text-center ${isRealData ? "bg-green-50" : "bg-gray-50"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">
        {value}
        {unit && <span className="text-xs font-normal">{unit}</span>}
      </p>
    </div>
  );
}
