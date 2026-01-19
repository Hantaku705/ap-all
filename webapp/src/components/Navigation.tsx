import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              コンセプト学習
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/concept/textbook"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              教科書
            </Link>
            <Link
              href="/concept/examples"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              事例
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
