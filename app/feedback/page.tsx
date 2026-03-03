'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback')
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('加载反馈失败:', error)
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
        alert('反馈提交成功！感谢你的反馈')
        setFormData({ type: 'bug', title: '', content: '', contact: '' })
        setShowForm(false)
        loadFeedbacks()
      } else {
        alert('提交失败，请重试')
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">反馈中心</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? '取消' : '+ 新建反馈'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">提交反馈</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">反馈类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="bug">Bug 报告</option>
                  <option value="建议">功能建议</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="简短描述问题或建议"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">详细描述</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="详细描述你遇到的问题或想法..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">联系方式（可选）</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="邮箱或微信，方便我们联系你"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '提交中...' : '提交反馈'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">我的反馈</h2>
          {feedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              还没有反馈记录
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mr-2">
                      {feedback.type}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      {feedback.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{feedback.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{feedback.content}</p>
                {feedback.reply && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">管理员回复：</span>
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
