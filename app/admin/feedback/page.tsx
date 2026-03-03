'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import Loading from '@/components/ui/Loading'

interface Feedback {
  id: string
  type: string
  title: string
  content: string
  contact: string | null
  status: string
  reply: string | null
  createdAt: string
  user: {
    email: string
    name: string | null
  } | null
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadFeedbacks()
  }, [statusFilter])

  async function loadFeedbacks() {
    try {
      const res = await fetch(`/api/admin/feedback?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data)
      } else if (res.status === 403) {
        toast.error('无权限访问管理员页面')
      } else {
        toast.error('加载反馈失败')
      }
    } catch (error) {
      console.error('加载反馈失败:', error)
      toast.error('加载反馈失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  async function handleReply(feedbackId: string) {
    if (!replyText.trim()) {
      toast.warning('请输入回复内容')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: replyText,
          status: '已解决'
        })
      })

      if (res.ok) {
        toast.success('回复成功')
        setReplyText('')
        setSelectedFeedback(null)
        loadFeedbacks()
      } else {
        const data = await res.json()
        toast.error(data.error || '回复失败')
      }
    } catch (error) {
      console.error('回复失败:', error)
      toast.error('回复失败，请检查网络连接')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(feedbackId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        toast.success('状态更新成功')
        loadFeedbacks()
      } else {
        toast.error('状态更新失败')
      }
    } catch (error) {
      console.error('状态更新失败:', error)
      toast.error('状态更新失败')
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case '待处理':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '处理中':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case '已解决':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case '已关闭':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="加载中..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">反馈管理</h1>
        <p className="text-gray-600">查看和回复用户反馈</p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', '待处理', '处理中', '已解决', '已关闭'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : status}
              {status !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({feedbacks.filter(f => f.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 反馈列表 */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">暂无反馈</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(feedback.type)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{feedback.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{feedback.user?.name || feedback.user?.email || '匿名用户'}</span>
                      <span>•</span>
                      <span>{new Date(feedback.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}>
                    {feedback.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {feedback.type}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{feedback.content}</p>
                {feedback.contact && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                    <span className="font-medium">联系方式：</span>{feedback.contact}
                  </div>
                )}
              </div>

              {feedback.reply && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-700 font-bold">✓ 管理员回复</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{feedback.reply}</p>
                </div>
              )}

              <div className="flex gap-2">
                {feedback.status !== '已解决' && (
                  <button
                    onClick={() => {
                      setSelectedFeedback(feedback)
                      setReplyText(feedback.reply || '')
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    {feedback.reply ? '修改回复' : '回复'}
                  </button>
                )}
                <select
                  value={feedback.status}
                  onChange={(e) => updateStatus(feedback.id, e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="待处理">待处理</option>
                  <option value="处理中">处理中</option>
                  <option value="已解决">已解决</option>
                  <option value="已关闭">已关闭</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 回复弹窗 */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">回复反馈</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">用户：</span>
                {selectedFeedback.user?.name || selectedFeedback.user?.email || '匿名用户'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">标题：</span>
                {selectedFeedback.title}
              </p>
              <p className="text-sm text-gray-700">{selectedFeedback.content}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="输入回复内容..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none text-gray-900 bg-white h-32"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedFeedback(null)
                  setReplyText('')
                }}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={() => handleReply(selectedFeedback.id)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交回复'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
