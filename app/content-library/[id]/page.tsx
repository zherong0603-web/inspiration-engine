'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate, parseJSON } from '@/lib/utils'

interface Content {
  id: string
  title: string
  category: string
  type: string
  content: string
  transcript?: string
  tags: string
  createdAt: string
  updatedAt: string
}

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchContent()
    }
  }, [params.id])

  async function fetchContent() {
    try {
      const res = await fetch(`/api/content/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  if (!content) {
    return <div className="text-center py-12">内容不存在</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← 返回
      </button>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{content.title}</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editing ? '取消编辑' : '编辑'}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            {content.category}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
            {content.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {parseJSON<string[]>(content.tags, []).map((tag) => (
            <span key={tag} className="text-sm text-gray-600">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>创建：{formatDate(content.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>更新：{formatDate(content.updatedAt)}</span>
          </div>
        </div>

        {editing ? (
          <EditForm content={content} onSuccess={() => {
            setEditing(false)
            fetchContent()
          }} />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">内容</h2>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {content.content}
              </div>
            </div>

            {content.transcript && (
              <div>
                <h2 className="text-xl font-semibold mb-2">逐字稿</h2>
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {content.transcript}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EditForm({ content, onSuccess }: { content: Content; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: content.title,
    category: content.category,
    type: content.type,
    content: content.content,
    transcript: content.transcript || '',
    tags: parseJSON<string[]>(content.tags, []),
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/content/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
      } else {
        alert('保存失败，请重试')
      }
    } catch (error) {
      console.error('Failed to update content:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">标题</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">分类</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border rounded-lg"
          >
            <option value="职场">职场</option>
            <option value="家庭">家庭</option>
            <option value="生活">生活</option>
            <option value="学习">学习</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">类型</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border rounded-lg"
          >
            <option value="视频">视频</option>
            <option value="文章">文章</option>
            <option value="笔记">笔记</option>
            <option value="想法">想法</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">内容</label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border rounded-lg"
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">逐字稿</label>
        <textarea
          value={formData.transcript}
          onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
          className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border rounded-lg"
          rows={6}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {saving ? '保存中...' : '保存修改'}
      </button>
    </form>
  )
}
