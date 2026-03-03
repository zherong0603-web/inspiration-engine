'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import Loading from '@/components/ui/Loading'
import Navbar from '@/components/Navbar'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    content: '',
    contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback')
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data)
      } else {
        toast.error('加载反馈失败')
      }
    } catch (error) {
      console.error('加载反馈失败:', error)
      toast.error('加载反馈失败，请检查网络连接')
    } finally {
      setPageLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('反馈提交成功！感谢你的反馈')
        setFormData({ type: 'bug', title: '', content: '', contact: '' })
        setShowForm(false)
        loadFeedbacks()
      } else {
        const data = await res.json()
        toast.error(data.error || '提交失败，请重试')
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      toast.error('提交失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <Loading size="lg" text="加载中..." />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">反馈中心</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '取消' : '+ 新建反馈'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">提交反馈</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">反馈类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-gray-900 bg-white"
              >
                <option value="bug">Bug 报告</option>
                <option value="建议">功能建议</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-gray-900 bg-white"
                placeholder="简短描述问题或建议"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">详细描述</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-gray-900 bg-white h-32 resize-none"
                placeholder="详细描述你遇到的问题或想法..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">联系方式（可选）</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-gray-900 bg-white"
                placeholder="邮箱或微信，方便我们联系你"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loading size="sm" />
                  提交中...
                </span>
              ) : (
                '提交反馈'
              )}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">我的反馈</h2>
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 border border-gray-200">
            <div className="text-5xl mb-3">💬</div>
            <p className="font-medium">还没有反馈记录</p>
            <p className="text-sm mt-1">点击上方按钮提交你的第一条反馈</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mr-2 font-medium">
                    {feedback.type}
                  </span>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 font-medium">
                    {feedback.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(feedback.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">{feedback.title}</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{feedback.content}</p>
              {feedback.reply && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-emerald-800">✓ 管理员回复：</span>
                    {feedback.reply}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
