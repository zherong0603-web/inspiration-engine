'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('system')
  const [stats, setStats] = useState<any>(null)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'stats') {
        loadStats()
      } else if (activeTab === 'feedbacks') {
        loadFeedbacks()
      } else if (activeTab === 'system') {
        loadSystemStatus()
      }
    }
  }, [activeTab, isAdmin])

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/is-admin')
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.isAdmin)
        if (!data.isAdmin) {
          alert('你没有管理员权限')
          router.push('/')
        }
      }
    } catch (error) {
      console.error('检查权限失败:', error)
      router.push('/')
    } finally {
      setChecking(false)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats?days=7')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedbacks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feedbacks')
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('加载反馈失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/system-status')
      if (res.ok) {
        const data = await res.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('加载系统状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">检查权限中...</div>
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'system'
                ? 'text-violet-600 border-b-2 border-violet-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🖥️ 系统状态
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-violet-600 border-b-2 border-violet-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 数据统计
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'feedbacks'
                ? 'text-violet-600 border-b-2 border-violet-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 用户反馈
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        )}

        {/* System Status Tab */}
        {activeTab === 'system' && systemStatus && !loading && (
          <div className="space-y-6">
            {/* Database Counts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">📊 数据库统计</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{systemStatus.counts.users}</div>
                  <div className="text-sm text-gray-600 mt-1">用户数</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{systemStatus.counts.contents}</div>
                  <div className="text-sm text-gray-600 mt-1">内容数</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">{systemStatus.counts.topics}</div>
                  <div className="text-sm text-gray-600 mt-1">选题数</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{systemStatus.counts.creations}</div>
                  <div className="text-sm text-gray-600 mt-1">创作数</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-pink-600">{systemStatus.counts.feedbacks}</div>
                  <div className="text-sm text-gray-600 mt-1">反馈数</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600">{systemStatus.counts.ipProfiles}</div>
                  <div className="text-sm text-gray-600 mt-1">IP 配置</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <div className="text-3xl font-bold text-cyan-600">{systemStatus.counts.activityLogs}</div>
                  <div className="text-sm text-gray-600 mt-1">活动日志</div>
                </div>
              </div>
            </div>

            {/* Environment Check */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">⚙️ 环境配置</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">运行环境</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {systemStatus.environment.nodeEnv}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Claude API Key</span>
                  {systemStatus.environment.hasAnthropicKey ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✓ 已配置
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      ✗ 未配置
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">数据库连接</span>
                  {systemStatus.environment.hasDatabaseUrl ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✓ 已配置
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      ✗ 未配置
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Database Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">💾 数据库信息</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">类型</span>
                  <span className="font-medium">{systemStatus.database.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">文件</span>
                  <span className="font-medium">{systemStatus.database.file}</span>
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    ⚠️ {systemStatus.database.note}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">👥 最近注册用户</h2>
              <div className="space-y-2">
                {systemStatus.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{user.name || user.email}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                      {user.isActive ? (
                        <span className="text-xs text-green-600">● 活跃</span>
                      ) : (
                        <span className="text-xs text-gray-400">● 未激活</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && !loading && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">总用户数</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalUsers}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">活跃用户（7天）</div>
                <div className="text-3xl font-bold text-violet-600">
                  {stats.overview.activeUsers}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">AI 调用次数</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {stats.overview.aiCalls}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">平均响应时间</div>
                <div className="text-3xl font-bold text-amber-600">
                  {(stats.overview.avgAiDuration / 1000).toFixed(1)}s
                </div>
              </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">内容总数</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalContents}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">选题总数</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalTopics}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">反馈总数</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalFeedbacks}
                </div>
              </div>
            </div>

            {/* Popular Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">最受欢迎的功能（7天）</h2>
              <div className="space-y-3">
                {stats.popularActions.map((action: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 text-center text-sm text-gray-500">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{action.action}</span>
                        <span className="text-sm text-gray-600">{action.count} 次</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600 rounded-full"
                          style={{
                            width: `${(action.count / stats.popularActions[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedbacks Tab */}
        {activeTab === 'feedbacks' && !loading && (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                暂无反馈
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        {feedback.type}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                        {feedback.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{feedback.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{feedback.content}</p>
                  {feedback.contact && (
                    <p className="text-sm text-gray-500">
                      联系方式：{feedback.contact}
                    </p>
                  )}
                  {feedback.user && (
                    <p className="text-sm text-gray-500">
                      用户：{feedback.user.email}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
