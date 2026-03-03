'use client'

import { useState, useEffect } from 'react'

interface Feedback {
  id: string
  type: string
  title: string
  content: string
  contact: string | null
  status: string
  reply: string | null
  createdAt: string
  updatedAt: string
}

const FEEDBACK_TYPES = ['bug', '建议', '其他']

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [newFeedback, setNewFeedback] = useState({
    type: 'bug',
    title: '',
    content: '',
    contact: '',
  })

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  async function fetchFeedbacks() {
    try {
      const res = await fetch('/api/feedback')
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!newFeedback.title.trim() || !newFeedback.content.trim()) {
      alert('请填写标题和详细内容')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewFeedback({
          type: 'bug',
          title: '',
          content: '',
          contact: '',
        })
        fetchFeedbacks()
        alert('提交成功！感谢你的反馈')
      } else {
        alert('提交失败，请重试')
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('确定要删除这条反馈吗？')) return

    try {
      await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
      fetchFeedbacks()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case '待处理':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case '处理中':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case '已解决':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case '已关闭':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'bug':
        return '🐛'
      case '建议':
        return '💡'
      case '其他':
        return '💬'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                💬
              </div>
              <div>
                <h1 className="text-3xl font-bold">反馈中心</h1>
                <p className="text-white/80 text-sm mt-1">遇到问题或有建议？告诉我们</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              ✍️ 提交反馈
            </button>
          </div>
        </div>
      </div>

      {/* 反馈列表 */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
            📋
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">我的反馈记录</h2>
            <p className="text-slate-500 text-sm">查看你提交的所有反馈和处理状态</p>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">还没有反馈记录</p>
            <p className="text-sm mt-2">遇到问题或有建议？点击上方按钮提交反馈</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => {
              const isExpanded = expandedId === feedback.id

              return (
                <div
                  key={feedback.id}
                  className="border-2 border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(feedback.type)}</span>
                        <h3 className="text-xl font-bold text-slate-800 leading-tight">
                          {feedback.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {feedback.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(feedback.status)}`}>
                          {feedback.status}
                        </span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                          {new Date(feedback.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : feedback.id)}
                      className="text-sm font-bold text-slate-700 hover:text-slate-900 w-full text-left flex items-center justify-between"
                    >
                      <span>详细内容</span>
                      <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                    </button>
                    {isExpanded && (
                      <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {feedback.content}
                      </div>
                    )}
                  </div>

                  {feedback.reply && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-bold text-emerald-800">管理员回复</span>
                      </div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {feedback.reply}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => deleteFeedback(feedback.id)}
                      className="px-5 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium border-2 border-red-200 hover:border-red-300"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 提交反馈弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                ✍️
              </div>
              <h2 className="text-2xl font-bold text-slate-800">提交反馈</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  反馈类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newFeedback.type}
                  onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer"
                >
                  {FEEDBACK_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  placeholder="简要描述问题或建议"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  详细内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newFeedback.content}
                  onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                  placeholder="详细描述你遇到的问题或建议..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none resize-none transition-all"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  联系方式（可选）
                </label>
                <input
                  type="text"
                  value={newFeedback.contact}
                  onChange={(e) => setNewFeedback({ ...newFeedback, contact: e.target.value })}
                  placeholder="邮箱或微信，方便我们联系你"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold disabled:opacity-50"
              >
                {submitting ? '提交中...' : '✓ 提交反馈'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
