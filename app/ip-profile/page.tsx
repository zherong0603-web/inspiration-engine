'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Badge, Loading } from '@/components/ui'
import { parseJSON } from '@/lib/utils'

interface IPProfile {
  id: string
  name: string
  description: string
  persona: string
  style: string
  topics: string // JSON string from database
}

const MAX_IP_COUNT = 8

export default function IPProfilePage() {
  const [loading, setLoading] = useState(true)
  const [ipProfiles, setIpProfiles] = useState<IPProfile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/ip/list')
      if (res.ok) {
        const data = await res.json()
        setIpProfiles(data)
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProfile(id: string) {
    if (!confirm('确定要删除这个 IP 身份吗？')) return

    try {
      const res = await fetch(`/api/ip/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProfiles()
      }
    } catch (error) {
      console.error('Failed to delete profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" text="加载中..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-12 px-8 rounded-2xl mb-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">IP 身份管理</h1>
            <p className="text-white/90 text-lg">
              管理你的多个 IP 身份，每个 IP 都有独特的人设和风格
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">{ipProfiles.length}</div>
            <div className="text-white/80">/ {MAX_IP_COUNT} 个 IP</div>
          </div>
        </div>
      </div>

      {/* IP 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {ipProfiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-violet-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{profile.name}</h3>
                {profile.description && (
                  <p className="text-slate-600 text-sm mb-3">{profile.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(profile.id)}
                  className="text-violet-600 hover:text-violet-700 font-medium text-sm"
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => deleteProfile(profile.id)}
                  className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  🗑️ 删除
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">内容风格</div>
                <Badge variant="secondary" size="sm">{profile.style}</Badge>
              </div>

              {parseJSON<string[]>(profile.topics, []).length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">擅长话题</div>
                  <div className="flex flex-wrap gap-2">
                    {parseJSON<string[]>(profile.topics, []).slice(0, 5).map((topic) => (
                      <Badge key={topic} variant="primary" size="sm">
                        {topic}
                      </Badge>
                    ))}
                    {parseJSON<string[]>(profile.topics, []).length > 5 && (
                      <Badge variant="neutral" size="sm">
                        +{parseJSON<string[]>(profile.topics, []).length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">人设描述</div>
                <p className="text-sm text-slate-600 line-clamp-3">{profile.persona}</p>
              </div>
            </div>
          </div>
        ))}

        {/* 添加新 IP 按钮 */}
        {ipProfiles.length < MAX_IP_COUNT && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-dashed border-violet-300 rounded-xl p-6 hover:border-violet-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">➕</div>
            <div className="text-xl font-bold text-violet-600 mb-2">添加新 IP</div>
            <div className="text-sm text-slate-500">
              还可以添加 {MAX_IP_COUNT - ipProfiles.length} 个 IP 身份
            </div>
          </button>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {(showAddForm || editingId) && (
        <IPProfileForm
          profileId={editingId}
          onClose={() => {
            setShowAddForm(false)
            setEditingId(null)
          }}
          onSuccess={() => {
            setShowAddForm(false)
            setEditingId(null)
            fetchProfiles()
          }}
        />
      )}
    </div>
  )
}

function IPProfileForm({
  profileId,
  onClose,
  onSuccess,
}: {
  profileId: string | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: '',
    style: '',
    topics: [] as string[],
  })
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/ip/${profileId}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          ...data,
          topics: JSON.parse(data.topics || '[]'),
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const url = profileId ? `/api/ip/${profileId}` : '/api/ip'
      const method = profileId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(profileId ? 'IP 配置更新成功！' : 'IP 配置创建成功！')
        onSuccess()
      } else {
        alert('保存失败，请重试')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  function addTopic() {
    if (topicInput.trim() && !formData.topics.includes(topicInput.trim())) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()],
      })
      setTopicInput('')
    }
  }

  function removeTopic(topic: string) {
    setFormData({
      ...formData,
      topics: formData.topics.filter((t) => t !== topic),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            {profileId ? '编辑 IP 身份' : '添加新 IP 身份'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="IP 名称"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：职场小王"
            helperText="给你的 IP 起一个容易记住的名字"
          />

          <Textarea
            label="IP 简介"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="简单介绍一下你的 IP"
            helperText="用一段话概括你的 IP 定位和特点"
          />

          <Textarea
            label="IP 人设"
            required
            value={formData.persona}
            onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
            rows={8}
            placeholder="详细描述你的 IP 人设，包括性格、价值观、说话风格等"
            helperText="越详细越好，这将帮助 AI 更准确地模拟你的风格"
          />

          <Input
            label="内容风格"
            type="text"
            required
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            placeholder="例如：幽默风趣、专业严谨、温暖治愈"
            helperText="用几个关键词描述你的内容风格"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              擅长话题
            </label>
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-300 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  className="flex-1 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200 focus:outline-none"
                  placeholder="输入话题后按回车添加"
                />
                <Button
                  type="button"
                  onClick={addTopic}
                  variant="secondary"
                  size="md"
                >
                  添加
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="primary"
                  size="md"
                  className="cursor-pointer hover:bg-violet-200 transition-colors"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="ml-2 text-violet-600 hover:text-violet-800 font-bold"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {formData.topics.length === 0 && (
              <p className="text-sm text-slate-500 mt-2">还没有添加话题，添加一些你擅长的领域吧</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={saving}
              className="flex-1"
            >
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
