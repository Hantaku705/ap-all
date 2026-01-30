export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">利用規約</h1>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="mb-4 text-gray-600">最終更新日: 2026年1月29日</p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">1. サービスの概要</h2>
            <p className="text-gray-700">
              AnyBrand（以下「本サービス」）は、TikTokクリエイター向けのアフィリエイトプラットフォームです。
              本サービスを利用することで、クリエイターは商品を紹介し、コミッションを獲得することができます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">2. アカウント登録</h2>
            <p className="text-gray-700">
              本サービスの利用にはTikTokアカウントによるログインが必要です。
              ユーザーは正確な情報を提供し、アカウントの安全性を維持する責任があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">3. 禁止事項</h2>
            <ul className="list-inside list-disc text-gray-700">
              <li>虚偽の情報の提供</li>
              <li>不正なアクセスや操作</li>
              <li>他のユーザーへの迷惑行為</li>
              <li>法令に違反する行為</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">4. 免責事項</h2>
            <p className="text-gray-700">
              本サービスは「現状有姿」で提供され、明示または黙示を問わず、
              いかなる保証も行いません。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">5. お問い合わせ</h2>
            <p className="text-gray-700">
              本規約に関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
