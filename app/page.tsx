'use client'

import { useState, useEffect } from 'react'
import WelcomeGuide from '@/components/WelcomeGuide'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
}

interface Stats {
  contentCount: number
  creationCount: number
  topicCount: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        fetchStats()
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  // 已登录用户看到的首页
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
        <WelcomeGuide />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
          {/* 欢迎信息 + Slogan */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              灵感引擎
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2 font-light">
              AI 驱动的新媒体创作平台
            </p>
            <p className="text-base text-gray-500">
              让每一个创意都能成为爆款
            </p>
            <div className="mt-6 text-lg text-gray-700">
              欢迎回来，<span className="font-semibold text-violet-600">{user.name || user.email.split('@')[0]}</span> 👋
            </div>
          </div>

          {/* 快速上手 - 4步流程 */}
          <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">4 步创作爆款内容</h2>
            <p className="text-gray-600 text-center mb-8">跟随步骤，快速上手 AI 创作</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link href="/ip-profile" className="group">
                <div className="text-center p-6 rounded-xl border-2 border-gray-200 hover:border-violet-500 hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                    1
                  </div>
                  <div className="text-2xl mb-2">🎭</div>
                  <h3 className="font-semibold text-gray-900 mb-2">设置 IP 身份</h3>
                  <p className="text-sm text-gray-600">定义你的人设和风格</p>
                </div>
              </Link>

              <Link href="/content-library" className="group">
                <div className="text-center p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                    2
                  </div>
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold text-gray-900 mb-2">建立内容库</h3>
                  <p className="text-sm text-gray-600">添加你的优质素材</p>
                </div>
              </Link>

              <Link href="/topics" className="group">
                <div className="text-center p-6 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                    3
                  </div>
                  <div className="text-2xl mb-2">💡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">发现爆款选题</h3>
                  <p className="text-sm text-gray-600">AI 智能推荐选题</p>
                </div>
              </Link>

              <Link href="/create" className="group">
                <div className="text-center p-6 rounded-xl border-2 border-gray-200 hover:border-rose-500 hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                    4
                  </div>
                  <div className="text-2xl mb-2">✨</div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI 智能创作</h3>
                  <p className="text-sm text-gray-600">一键生成高质量内容</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 我的数据 - 简化版 */}
          {stats && (stats.contentCount > 0 || stats.topicCount > 0 || stats.creationCount > 0) && (
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-8 border border-violet-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">我的创作数据</h2>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-violet-600 mb-1">{stats.contentCount}</div>
                  <div className="text-sm text-gray-700">内容库素材</div>
                  <div className="text-xs text-gray-500 mt-1">已添加的参考内容</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-600 mb-1">{stats.topicCount}</div>
                  <div className="text-sm text-gray-700">选题灵感</div>
                  <div className="text-xs text-gray-500 mt-1">已收集的选题想法</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-rose-600 mb-1">{stats.creationCount}</div>
                  <div className="text-sm text-gray-700">AI 创作</div>
                  <div className="text-xs text-gray-500 mt-1">已生成的内容</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 未登录用户看到的首页
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            灵感引擎
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
            AI 驱动的新媒体创作平台
          </p>
          <p className="text-base text-gray-500 mb-8">
            让每一个创意都能成为爆款
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
            >
              立即开始
            </Link>
            <Link
              href="/help"
              className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              了解更多
            </Link>
          </div>
        </div>

        {/* Quick Start */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="bg-white rounded-2xl p-10 border border-black/5">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">快速开始</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { num: '1', label: '设置 IP 身份', color: 'from-violet-600 to-fuchsia-600' },
                { num: '2', label: '建立内容库', color: 'from-emerald-600 to-teal-600' },
                { num: '3', label: '发现爆款选题', color: 'from-amber-600 to-orange-600' },
                { num: '4', label: 'AI 智能创作', color: 'from-rose-600 to-pink-600' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} text-white rounded-xl flex items-center justify-center text-lg font-semibold mx-auto mb-3 shadow-sm`}>
                    {step.num}
                  </div>
                  <p className="text-sm text-gray-600">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <div className="bg-white rounded-2xl p-8 border border-black/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🎭
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IP 身份设置</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    打造独特的 IP 人设，定义你的内容风格和创作方向
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-black/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  📚
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">内容库</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    沉淀你的创作素材，构建专属的内容知识库
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-black/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  💡
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">选题灵感库</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    AI 智能分析选题潜力，帮你找到下一个爆款
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 border border-violet-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
                  ✨
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">内容创作</h3>
                  <p className="text-violet-100 text-sm leading-relaxed">
                    一键生成高质量内容，让创作更高效
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto px-6 mt-20">
          <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-8 text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">需要帮助？</h3>
            <p className="text-gray-600 mb-4">
              查看详细的使用指南，快速上手灵感引擎
            </p>
            <Link
              href="/help"
              className="inline-block px-6 py-2 bg-white text-violet-600 rounded-lg hover:shadow-md transition-all font-medium"
            >
              查看使用指南
            </Link>
          </div>

          <p className="text-sm text-gray-500 text-center">
            有任何问题或建议？
            <Link href="/feedback" className="text-violet-600 hover:underline ml-1">提交反馈</Link>
            {' '}或微信：
            <span className="text-gray-900 font-medium ml-1">wangzherongxx</span>
          </p>
        </div>
      </div>
    </div>
  )
}
