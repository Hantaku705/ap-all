export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="mb-4 text-gray-600">最終更新日: 2026年1月29日</p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">1. 収集する情報</h2>
            <p className="mb-4 text-gray-700">
              本サービスでは、TikTokログインを通じて以下の情報を収集します：
            </p>
            <ul className="list-inside list-disc text-gray-700">
              <li>TikTokユーザーID（Open ID）</li>
              <li>表示名</li>
              <li>プロフィール画像URL</li>
              <li>フォロワー数、フォロー数</li>
              <li>いいね数、動画数</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">2. 情報の利用目的</h2>
            <p className="text-gray-700">
              収集した情報は以下の目的で利用します：
            </p>
            <ul className="mt-2 list-inside list-disc text-gray-700">
              <li>ユーザー認証およびアカウント管理</li>
              <li>サービスの提供および改善</li>
              <li>クリエイターのプロフィール表示</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">3. 情報の共有</h2>
            <p className="text-gray-700">
              ユーザーの個人情報は、法令に基づく場合を除き、
              ユーザーの同意なく第三者に提供することはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">4. データの保護</h2>
            <p className="text-gray-700">
              当社は適切な技術的・組織的措置を講じ、
              ユーザーの個人情報を不正アクセス、紛失、破壊から保護します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">5. Cookieの使用</h2>
            <p className="text-gray-700">
              本サービスでは、セッション管理およびユーザー体験の向上のためにCookieを使用します。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">6. お問い合わせ</h2>
            <p className="text-gray-700">
              プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
