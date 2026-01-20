import Link from 'next/link'

export default function TextbookPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/concept" className="text-blue-600 hover:underline text-sm">
          ← コンセプト学習に戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">コンセプトの教科書</h1>
      <p className="text-lg text-gray-600 mb-8">
        コンセプトとは、商品やサービスの本質的な価値を「短く伝わる言葉」で表現したもの。
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-12">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> 良いコンセプトの定義は複数あり、それぞれの視点から評価することが重要。
        </p>
      </div>

      {/* 目次 */}
      <nav className="bg-gray-50 rounded-lg p-6 mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">目次</h2>
        <ul className="space-y-2 text-sm">
          <li><a href="#chapter1" className="text-blue-600 hover:underline">第1章: コンセプトの公式</a></li>
          <li><a href="#chapter2" className="text-blue-600 hover:underline">第2章: 良いコンセプトの4要素</a></li>
          <li><a href="#chapter3" className="text-blue-600 hover:underline">第3章: いい商品コンセプトの5条件</a></li>
          <li><a href="#chapter4" className="text-blue-600 hover:underline">第4章: 良いコンセプトの7条件</a></li>
          <li><a href="#chapter5" className="text-blue-600 hover:underline">第5章: 定義の使い分け</a></li>
          <li><a href="#chapter6" className="text-blue-600 hover:underline">第6章: 良いコンセプトの評価項目</a></li>
        </ul>
      </nav>

      {/* 第1章 */}
      <section id="chapter1" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第1章: コンセプトの公式
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">リフレーミング公式</h3>
          <p className="font-mono text-blue-800 text-sm">
            （既存の概念）を（新しい視点）で捉え直し、<br />
            （顧客のインサイト）に応える、（短く伝わる言葉）
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">例</h4>
          <p className="text-gray-700 text-sm mb-2">
            「ジムを、コンビニの視点で捉え直し、『手軽に運動したい』というインサイトに応える、直感的なネーミング」
          </p>
          <p className="text-xl font-bold text-blue-600">→ コンビニジム</p>
        </div>
      </section>

      {/* 第2章 */}
      <section id="chapter2" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第2章: 良いコンセプトの4要素
        </h2>

        {/* 2-1 リフレーミング */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">1. リフレーミング（視点のズラし）</h3>
          <p className="text-gray-600 mb-4">既存の常識にとらわれず、新しい視点で捉え直す。</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b">既存の概念</th>
                  <th className="px-4 py-2 text-left border-b">新しい視点</th>
                  <th className="px-4 py-2 text-left border-b">コンセプト</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">マスカラ</td><td className="px-4 py-2 border-b">つけまつげ視点で再定義</td><td className="px-4 py-2 border-b font-bold">塗るつけまつげ</td></tr>
                <tr><td className="px-4 py-2 border-b">シャンプー</td><td className="px-4 py-2 border-b">夜のスキンケア視点</td><td className="px-4 py-2 border-b font-bold">夜間美容シャンプー</td></tr>
                <tr><td className="px-4 py-2">ファンデーション</td><td className="px-4 py-2">防御・死守の視点</td><td className="px-4 py-2 font-bold">顔面死守ファンデ</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-2 顧客インサイト */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">2. 顧客インサイトに刺さる</h3>
          <p className="text-gray-600 mb-4">「本当はこうしたいけど○○だからできない」という潜在的な欲求や葛藤を解決する。</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b">インサイト</th>
                  <th className="px-4 py-2 text-left border-b">解決策</th>
                  <th className="px-4 py-2 text-left border-b">コンセプト</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">つけまは面倒だけど盛りたい</td><td className="px-4 py-2 border-b">マスカラで実現</td><td className="px-4 py-2 border-b font-bold">塗るつけまつげ</td></tr>
                <tr><td className="px-4 py-2 border-b">ジムに通いたいけど時間がない</td><td className="px-4 py-2 border-b">24時間・着替え不要</td><td className="px-4 py-2 border-b font-bold">コンビニジム</td></tr>
                <tr><td className="px-4 py-2 border-b">夜はスキンケアするのに髪はおろそか</td><td className="px-4 py-2 border-b">夜専用シャンプー</td><td className="px-4 py-2 border-b font-bold">夜間美容シャンプー</td></tr>
                <tr><td className="px-4 py-2">メイクが崩れるのが嫌</td><td className="px-4 py-2">崩れない設計</td><td className="px-4 py-2 font-bold">顔面死守ファンデ</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-3 シンプルで直感的 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">3. シンプルで直感的</h3>
          <p className="text-gray-600 mb-4">短く、伝わりやすく、覚えやすい表現にする。</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-2">良い例</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>「顔面死守ファンデ」→ メイクが崩れないことが即座に伝わる</li>
                <li>「塗るつけまつげ」→ 塗るだけでつけま級になることが伝わる</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-red-800 mb-2">NG例</h4>
              <p className="text-sm text-red-700">
                「超高密着・長時間キープリキッドファンデーション」→ 長すぎて覚えられない
              </p>
            </div>
          </div>
        </div>

        {/* 2-4 行動を生み出す */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">4. 行動を生み出す</h3>
          <p className="text-gray-600 mb-4">「試したくなる・使いたくなる」言葉で表現する。</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-green-800 mb-2">良い例</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>「紫外線、浴びたら洗おう」→ 新習慣を提案している</li>
              <li>「コンビニジム」→ 気軽に行けそうな印象</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-800 mb-2">ポイント</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>・使用シーンが想像できる</li>
              <li>・自分事として捉えられる</li>
              <li>・行動のハードルが低く感じられる</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 第3章 */}
      <section id="chapter3" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第3章: いい商品コンセプトの5条件
        </h2>
        <p className="text-sm text-gray-500 mb-6">出典: HADO マーケティングブートキャンプ</p>

        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left border-b">#</th>
                <th className="px-4 py-2 text-left border-b">条件</th>
                <th className="px-4 py-2 text-left border-b">ポイント</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-4 py-2 border-b">1</td><td className="px-4 py-2 border-b font-bold">お金を払ってでも手に入れたいもの</td><td className="px-4 py-2 border-b">需要とコストのバランス</td></tr>
              <tr><td className="px-4 py-2 border-b">2</td><td className="px-4 py-2 border-b font-bold">新しさや意外性が入っている</td><td className="px-4 py-2 border-b">需要の半歩先を行く</td></tr>
              <tr><td className="px-4 py-2 border-b">3</td><td className="px-4 py-2 border-b font-bold">ベネフィットが入っている</td><td className="px-4 py-2 border-b">顧客が得られる価値</td></tr>
              <tr><td className="px-4 py-2 border-b">4</td><td className="px-4 py-2 border-b font-bold">ベネフィットを信じてもらえる</td><td className="px-4 py-2 border-b">理解できるロジック</td></tr>
              <tr><td className="px-4 py-2">5</td><td className="px-4 py-2 font-bold">シンプルである</td><td className="px-4 py-2">分かりやすさ</td></tr>
            </tbody>
          </table>
        </div>

        {/* 詳細説明 */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">1. お金を払ってでも手に入れたいもの</h3>
            <p className="text-gray-600 text-sm mb-4">欲求や痛みと比較し、何が優先度が高いのかを考える。</p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">コスト</th>
                    <th className="px-4 py-2 text-left border-b">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-4 py-2 border-b font-medium">金銭的コスト</td><td className="px-4 py-2 border-b">お金を払う負担</td></tr>
                  <tr><td className="px-4 py-2 border-b font-medium">時間的コスト</td><td className="px-4 py-2 border-b">時間がかかる負担</td></tr>
                  <tr><td className="px-4 py-2 font-medium">肉体的コスト</td><td className="px-4 py-2">手間や労力の負担</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800">
                <strong>重要:</strong> 先に売るものがある際は「需要（インサイト）」と「供給（商品コンセプト）」を一本線でつなぐことが大事
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. 新しさや意外性が入っている</h3>
            <p className="text-gray-600 text-sm mb-4">ユーザーの需要の半歩先をいく供給を提供することが大事。</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-bold text-gray-800 mb-2">例: BBクリームを買わない人の理由:</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>メイクばれるのが恥ずかしい</li>
                <li>肌が荒れるかも…みたいな不安</li>
              </ol>
              <p className="font-bold text-gray-800 mt-3 mb-2">ここに先回りして:</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>ばれない（メイクと指摘されない）</li>
                <li>隠すだけじゃなくて美肌成分</li>
              </ol>
              <p className="mt-3 text-blue-700">→ これらを広告に差し込めると、ユーザーの需要の半歩先を行けている状態</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">3. ベネフィットが入っている</h3>
            <p className="text-gray-600 text-sm mb-4">顧客が商品を使うことで得られる具体的な価値・メリットが明確に伝わること。</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>・機能ではなく、顧客が得られる結果を示す</li>
              <li>・「〇〇できる」「〇〇になれる」という形で表現</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">4. ベネフィットを信じてもらえる</h3>
            <p className="text-gray-600 text-sm mb-4">その効果の裏付けやロジックが難しすぎてはいけない。</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>・専門用語を避ける</li>
              <li>・直感的に「なるほど」と思えるロジック</li>
              <li>・信じられる根拠を提示</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">5. シンプルである</h3>
            <p className="text-gray-600 text-sm mb-4">複雑な説明なしに、一言で価値が伝わること。</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>・一言で説明できるか？</li>
              <li>・聞いた人がすぐに理解できるか？</li>
              <li>・覚えやすいか？</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 第4章 */}
      <section id="chapter4" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第4章: 良いコンセプトの7条件
        </h2>
        <p className="text-gray-600 mb-6">UGC（ユーザー生成コンテンツ）で自然に拡散されやすいコンセプトの条件。</p>

        <div className="space-y-6">
          {[
            { num: 1, title: '口に出したくなる、つぶやきたくなる', desc: '短く、リズムがよく、話しやすいほど、SNSや会話で自然に使われる。', good: ['「塗るつけまつげ」', '「顔面死守ファンデ」', '「コンビニジム」'], bad: '「超高密着・長時間キープリキッドファンデーション」→ 話題にしづらい' },
            { num: 2, title: '感情を喚起するワードを入れる', desc: '実際に体験した感動をそのまま投稿しやすいワードを含める。', good: ['「沼らせボディクリーム」', '「モテ肌仕込みクリーム」', '「溺愛スキン」'], bad: '「しっとり保湿ボディクリーム」→ つぶやく気にならない' },
            { num: 3, title: '使った自分を演出できる', desc: '使うことが「かっこいい」「可愛い」「おしゃれ」に見えるネーミング。', good: ['「夜仕込みボディ」', '「秒で垢抜けティント」', '「ギャップ萌えリップ」'], bad: '「しっとりリップカラー」→ 特別感がない' },
            { num: 4, title: '擬音・カタカナ・造語を活用する', desc: '「音の響き」を意識する。カタカナや造語は流行しやすい。', good: ['「ふわモテバーム」', '「バブみリップ」', '「ぷるるんクッションファンデ」'], bad: '「ツヤツヤリップスティック」→ どこにでもありそう' },
            { num: 5, title: '「○○したら△△」のストーリー性を持たせる', desc: '「使用後の変化」や「期待感」を想起させるネーミング。', good: ['「塗るだけで沼る」', '「触れたくなる肌」', '「塗るだけでモテ仕込み」'], bad: '「高保湿ボディクリーム」→ 感情が湧かない' },
            { num: 6, title: 'ハッシュタグ化しやすい', desc: 'SNSのトレンドに乗るための、#（ハッシュタグ）と相性が良いワード。', good: ['「#沼らせ肌」', '「#秒で垢抜け」', '「#塗るだけでモテる」'], bad: '「#しっとりクリーム」→ 普通すぎて埋もれる' },
            { num: 7, title: '使った後の自分を妄想できる', desc: '「このアイテムを使うとこんな自分になれる」というビジョンを持たせる。', good: ['「夜仕込みで、翌朝ふわモテ肌」', '「このリップで告白成功した…！」', '「これ塗ったら彼が沼った」'], bad: '「保湿力抜群のボディクリームです」→ UGCに載せる意味がない' },
          ].map((item) => (
            <div key={item.num} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.num}. {item.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-bold text-green-800 text-sm mb-2">良い例</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    {item.good.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-bold text-red-800 text-sm mb-2">NG</h4>
                  <p className="text-xs text-red-700">{item.bad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 第5章 */}
      <section id="chapter5" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第5章: 定義の使い分け
        </h2>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left border-b">観点</th>
                <th className="px-4 py-2 text-left border-b">リフレーミング公式</th>
                <th className="px-4 py-2 text-left border-b">5条件</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-4 py-2 border-b font-medium">焦点</td><td className="px-4 py-2 border-b">コンセプト表現</td><td className="px-4 py-2 border-b">商品コンセプト全体</td></tr>
              <tr><td className="px-4 py-2 border-b font-medium">強み</td><td className="px-4 py-2 border-b">差別化・独自性</td><td className="px-4 py-2 border-b">購買までの説得力</td></tr>
              <tr><td className="px-4 py-2 font-medium">使いどころ</td><td className="px-4 py-2">コピー・ネーミング開発</td><td className="px-4 py-2">商品企画・広告設計</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>ポイント:</strong> 両方の定義を組み合わせることで、より強力なコンセプトが作れる
          </p>
        </div>
      </section>

      {/* 第6章 */}
      <section id="chapter6" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          第6章: 良いコンセプトの評価項目
        </h2>
        <p className="text-gray-600 mb-6">コンセプトを評価する際のチェックリスト。全14項目。</p>

        {/* マスト */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">マスト（7項目）- コンセプトの本質</h3>
          <p className="text-gray-600 text-sm mb-4">最低限クリアすべき必須項目。</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b">#</th>
                  <th className="px-4 py-2 text-left border-b">項目</th>
                  <th className="px-4 py-2 text-center border-b">チェック</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">1</td><td className="px-4 py-2 border-b font-bold">新しい視点・独自性があるか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">2</td><td className="px-4 py-2 border-b font-bold">顧客インサイトに応えているか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">3</td><td className="px-4 py-2 border-b font-bold">ベネフィットが明確か</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">4</td><td className="px-4 py-2 border-b font-bold">シンプルで伝わりやすいか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">5</td><td className="px-4 py-2 border-b font-bold">行動・購買意欲を生むか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">6</td><td className="px-4 py-2 border-b font-bold">信じられる理由があるか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2">7</td><td className="px-4 py-2 font-bold">誤解なく伝わるか</td><td className="px-4 py-2 text-center">☐</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 任意 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">任意（7項目）- 拡散力強化</h3>
          <p className="text-gray-600 text-sm mb-4">SNSでの拡散やUGCを狙う場合に追加でチェック。</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b">#</th>
                  <th className="px-4 py-2 text-left border-b">項目</th>
                  <th className="px-4 py-2 text-center border-b">チェック</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">8</td><td className="px-4 py-2 border-b font-bold">口に出したくなる・語呂が良いか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">9</td><td className="px-4 py-2 border-b font-bold">感情を喚起するワードがあるか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">10</td><td className="px-4 py-2 border-b font-bold">使った自分を演出できるか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">11</td><td className="px-4 py-2 border-b font-bold">ストーリー性・妄想できるか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">12</td><td className="px-4 py-2 border-b font-bold">擬音・造語を活用しているか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2 border-b">13</td><td className="px-4 py-2 border-b font-bold">ハッシュタグ化しやすいか</td><td className="px-4 py-2 border-b text-center">☐</td></tr>
                <tr><td className="px-4 py-2">14</td><td className="px-4 py-2 font-bold">主張の核心が込められているか</td><td className="px-4 py-2 text-center">☐</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ヒント */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">コンセプト作成のヒント</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li><strong>USPをもとに作る</strong> - 商品の独自の強みを軸にする</li>
            <li><strong>5音と7音のリズム</strong> - 日本語は5音・7音が響きやすい</li>
            <li><strong>リフレーミング</strong> - 視点をズラして新しい価値を見せる</li>
            <li><strong>顧客インサイト</strong> - 「本当はこうしたい」気持ちを代弁する</li>
          </ul>
        </div>
      </section>

      {/* 事例へのリンク */}
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">事例で学ぶ</h3>
        <p className="text-gray-600 mb-4">実際の成功事例を分析して、コンセプト作りのコツを掴もう</p>
        <Link
          href="/concept/examples"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          事例一覧を見る →
        </Link>
      </div>
    </div>
  )
}
