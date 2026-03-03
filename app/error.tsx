'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('应用错误:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            500
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          出错了
        </h1>

        <p className="text-gray-600 mb-2">
          抱歉，应用遇到了一个错误。
        </p>

        {error.message && (
          <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-100 p-3 rounded-lg">
            {error.message}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
          >
            重试
          </button>
          <a
            href="/"
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
