'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TopicIdea {
  id: string
  title: string
  description: string | null
  platform: string
  category: string
  status: string
  aiScore: number
  angles: string | null
  bestTime: string | null
  expectedViews: string | null
  createdAt: string
}

interface RecommendedTopic {
  title: string
  aiScore: number
  reason: string
  category: string
}

const CATEGORIES = ['职场', '生活', '情感', '知识', '娱乐', '科技', '其他']
const PLATFORMS = ['通用', '抖音', '小红书', '视频号', 'B站', '快手', '知乎']

export default function TopicsPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<TopicIdea[]>([])
  const [loading, setLoading] = useState(true)

  // AI推荐相关
  const [direction, setDirection] = useState('')
  const [platform, setPlatform] = useState('通用')
  const [recommending, setRecommending] = useState(false)
  const [recommendedTopics, setRecommendedTopics] = useState<RecommendedTopic[]>([])

  // 展开的选题详情
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 手动添加选题
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    platform: '通用',
    category: '职场',
  })

  useEffect(() => {
    fetchTopics()
  }, [])

  async function fetchTopics() {
    try {
      const res = await fetch('/api/topics')
      if (res.ok) {
        const data = await res.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('获取选题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRecommend() {
    if (!direction.trim()) {
      alert('请输入内容方向')
      return
    }

    setRecommending(true)
    try {
      const res = await fetch('/api/ai/recommend-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, platform }),
      })

      if (res.ok) {
        const data = await res.json()
        setRecommendedTopics(data.topics || [])
      } else {
        alert('AI推荐失败，请重试')
      }
    } catch (error) {
      console.error('AI推荐失败:', error)
      alert('AI推荐失败，请重试')
    } finally {
      setRecommending(false)
    }
  }

  async function saveRecommendedTopic(topic: RecommendedTopic, index: number) {
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic.title,
          category: topic.category,
          platform,
          aiScore: topic.aiScore,
        }),
      })

      if (res.ok) {
        fetchTopics()
        // 更新推荐列表，标记为已保存
        const newRecommendedTopics = [...recommendedTopics]
        newRecommendedTopics[index] = { ...topic, saved: true } as any
        setRecommendedTopics(newRecommendedTopics)

        // 滚动到"我的选题记录"区域
        setTimeout(() => {
          const myTopicsSection = document.getElementById('my-topics-section')
          if (myTopicsSection) {
            myTopicsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  async function startCreation(topic: TopicIdea | RecommendedTopic) {
    const title = topic.title
    const topicId = 'id' in topic ? topic.id : undefined

    // 如果是推荐选题，先保存
    if (!topicId && 'reason' in topic) {
      try {
        const res = await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: topic.title,
            category: topic.category,
            platform,
            aiScore: topic.aiScore,
            status: '已创作',
          }),
        })

        if (res.ok) {
          const savedTopic = await res.json()
          router.push(`/create?topic=${encodeURIComponent(title)}&platform=${encodeURIComponent(platform)}&topicId=${savedTopic.id}`)
          return
        }
      } catch (error) {
        console.error('保存失败:', error)
      }
    }

    // 如果是已有选题，更新状态
    if (topicId) {
      await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '已创作' }),
      })
    }

    router.push(`/create?topic=${encodeURIComponent(title)}&platform=${encodeURIComponent(platform)}${topicId ? `&topicId=${topicId}` : ''}`)
  }

  async function handleAddTopic() {
    if (!newTopic.title.trim()) {
      alert('请输入选题标题')
      return
    }

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewTopic({
          title: '',
          description: '',
          platform: '通用',
          category: '职场',
        })
        fetchTopics()
      }
    } catch (error) {
      console.error('添加选题失败:', error)
      alert('添加失败，请重试')
    }
  }

  async function deleteTopic(id: string) {
    if (!confirm('确定要删除这个选题吗？')) return

    try {
      await fetch(`/api/topics/${id}`, { method: 'DELETE' })
      fetchTopics()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  async function updateTopicStatus(id: string, status: string) {
    try {
      await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchTopics()
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 75) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-blue-600'
    return 'text-slate-600'
  }

  function getScoreEmoji(score: number) {
    if (score >= 75) return '🔥🔥🔥'
    if (score >= 60) return '🔥🔥'
    if (score >= 40) return '🔥'
    return ''
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
      {/* AI 选题助手 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              💡
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI 选题助手</h1>
              <p className="text-white/80 text-sm mt-1">输入内容方向，AI 为你生成爆款选题</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="例如：职场沟通技巧、家庭教育方法、个人成长..."
                className="w-full px-5 py-4 rounded-xl text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder:text-slate-400 font-medium"
                onKeyPress={(e) => e.key === 'Enter' && handleRecommend()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                按 Enter 快速生成
              </div>
            </div>

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-5 py-4 rounded-xl text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all font-medium cursor-pointer appearance-none bg-no-repeat bg-right pr-12"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundSize: '1.5rem',
                backgroundPosition: 'right 0.75rem center'
              }}
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button
              onClick={handleRecommend}
              disabled={recommending}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {recommending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中
                </span>
              ) : (
                '✨ AI 生成'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 推荐选题 */}
      {recommendedTopics.length > 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
              ✨
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">AI 推荐选题</h2>
              <p className="text-slate-500 text-sm">根据你的需求生成的爆款选题</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendedTopics.map((topic, idx) => {
              const isSaved = (topic as any).saved
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-800 flex-1 leading-tight">
                      {topic.title}
                    </h3>
                    <div className="flex flex-col items-end ml-4">
                      <div className={`text-2xl font-black ${getScoreColor(topic.aiScore)}`}>
                        {topic.aiScore}
                      </div>
                      <div className="text-lg">
                        {getScoreEmoji(topic.aiScore)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                      {topic.category}
                    </span>
                    <span className="text-slate-500 text-sm">•</span>
                    <span className="text-slate-600 text-sm">{topic.reason}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startCreation(topic)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      ✨ 立即创作
                    </button>
                    <button
                      onClick={() => saveRecommendedTopic(topic, idx)}
                      disabled={isSaved}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 cursor-not-allowed'
                          : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                    >
                      {isSaved ? '✓ 已保存' : '💾 保存选题'}
                    </button>
                  </div>

                  {isSaved && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>已保存到下方"我的选题记录"，可随时查看和创作</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 我的选题记录 */}
      <div id="my-topics-section" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl scroll-mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
              📝
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">我的选题记录</h2>
              <p className="text-slate-500 text-sm">已保存的选题，随时可以开始创作</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            ➕ 手动添加
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">💡</div>
            <p className="text-lg font-medium">还没有选题记录</p>
            <p className="text-sm mt-2">使用 AI 生成选题或手动添加</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => {
              const angles = topic.angles ? JSON.parse(topic.angles) : []
              const isExpanded = expandedId === topic.id

              return (
                <div
                  key={topic.id}
                  className="border-2 border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {topic.category}
                        </span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                          平台：{topic.platform}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          topic.status === '已创作' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          topic.status === '已放弃' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {topic.status}
                        </span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                          {new Date(topic.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    {topic.aiScore > 0 && (
                      <div className="flex flex-col items-end ml-4 group relative">
                        <div className={`text-2xl font-black ${getScoreColor(topic.aiScore)}`}>
                          {topic.aiScore}
                        </div>
                        <div className="text-lg">
                          {getScoreEmoji(topic.aiScore)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">爆款指数</div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                          <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-bold mb-1">爆款指数说明</div>
                            <div>75-100分：爆款潜力极高 🔥🔥🔥</div>
                            <div>60-74分：爆款潜力较高 🔥🔥</div>
                            <div>40-59分：有一定潜力 🔥</div>
                            <div className="mt-1 text-slate-300">分数越高，成为爆款的可能性越大</div>
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {topic.description && (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{topic.description}</p>
                  )}

                  {angles.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 mb-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                        className="text-sm font-bold text-amber-800 hover:text-amber-900 w-full text-left flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          💡 推荐创作角度
                          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                            {angles.length} 个
                          </span>
                        </span>
                        <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                      </button>
                      {isExpanded && (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                          {angles.map((angle: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
                              <span className="text-amber-600 font-bold flex-shrink-0">{idx + 1}.</span>
                              <span>{angle}</span>
                            </li>
                          ))}
                          {topic.bestTime && (
                            <li className="mt-3 pt-3 border-t border-amber-200 flex items-start gap-2">
                              <span className="font-bold text-amber-800">⏰ 最佳时机：</span>
                              <span>{topic.bestTime}</span>
                            </li>
                          )}
                          {topic.expectedViews && (
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-amber-800">📊 预期数据：</span>
                              <span>{topic.expectedViews}</span>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-slate-200">
                    {topic.status === '待创作' && (
                      <button
                        onClick={() => startCreation(topic)}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        ✨ 开始创作
                      </button>
                    )}
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium border-2 border-red-200 hover:border-red-300"
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

      {/* 手动添加选题弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                ✏️
              </div>
              <h2 className="text-2xl font-bold text-slate-800">手动添加选题</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  选题标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="例如：职场新人如何快速适应新环境"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  选题描述
                </label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="简单描述这个选题的内容方向..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none resize-none transition-all"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    目标平台
                  </label>
                  <select
                    value={newTopic.platform}
                    onChange={(e) => setNewTopic({ ...newTopic, platform: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    分类
                  </label>
                  <select
                    value={newTopic.category}
                    onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
              >
                取消
              </button>
              <button
                onClick={handleAddTopic}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                ✓ 添加选题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
