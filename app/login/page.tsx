'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 从 URL 参数中获取邀请码
  useEffect(() => {
    const inviteParam = searchParams.get('invite')
    if (inviteParam) {
      setInviteCode(inviteParam.toUpperCase())
      setIsLogin(false) // 自动切换到注册模式
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin
        ? { email, password }
        : { email, password, name, inviteCode }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // 确保发送和接收 cookies
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '操作失败')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            灵感引擎
          </h1>
          <p className="text-gray-600">
            {isLogin ? '欢迎回来' : '开始你的创作之旅'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-black/5">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isLogin ? '邮箱 / 手机号' : '邮箱'}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm text-gray-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm text-gray-900 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    用户名（可选）
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    邀请码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="请输入8位邀请码"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm text-gray-900 bg-white uppercase placeholder:text-gray-400"
                    maxLength={8}
                    required
                  />
                  {searchParams.get('invite') && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ 已自动填充邀请码
                    </p>
                  )}
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
