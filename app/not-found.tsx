import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            404
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          页面不存在
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          抱歉，你访问的页面不存在或已被移除。
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
          >
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}
