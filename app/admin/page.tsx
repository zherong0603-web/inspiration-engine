'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState<any>(null)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats()
    } else if (activeTab === 'feedbacks') {
      loadFeedbacks()
    }
  }, [activeTab])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
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
