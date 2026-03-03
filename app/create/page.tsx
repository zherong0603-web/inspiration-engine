'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { parseJSON } from '@/lib/utils'

interface Content {
  id: string
  title: string
  category: string
  type: string
  tags: string
  content: string
  createdAt: string
}

interface IPProfile {
  id: string
  name: string
  description: string
  persona: string
  style: string
  topics: string
}

interface GeneratedResult {
  id: string
  content: string
  createdAt: string
}

// 创作类型
const CREATION_TYPES = [
  { value: 'short-video', label: '短视频脚本', icon: '🎬', desc: '3秒抓眼球，60秒讲清楚' },
  { value: 'knowledge', label: '知识科普', icon: '📚', desc: '通俗易懂，干货满满' },
  { value: 'story', label: '故事化表达', icon: '📖', desc: '有情节，有共鸣' },
  { value: 'tips', label: '干货清单', icon: '✅', desc: '要点清晰，实用性强' },
]

// 内容风格
const STYLE_OPTIONS = [
  { value: 'casual', label: '口语化', icon: '💬', desc: '接地气、聊天感' },
  { value: 'professional', label: '专业化', icon: '🎓', desc: '严谨、权威' },
  { value: 'emotional', label: '情感化', icon: '❤️', desc: '走心、有温度' },
]

function CreatePageContent() {
  const searchParams = useSearchParams()

  // 基础状态
  const [contents, setContents] = useState<Content[]>([])
  const [ipProfiles, setIpProfiles] = useState<IPProfile[]>([])
  const [selectedIpId, setSelectedIpId] = useState<string>('')

  // 内容选择
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([])
  const [recommendedContents, setRecommendedContents] = useState<Content[]>([])
  const [showAllContents, setShowAllContents] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  // 创作参数
  const [creationType, setCreationType] = useState('short-video')
  const [style, setStyle] = useState('casual')
  const [additionalRequirements, setAdditionalRequirements] = useState('')

  // 选题信息
  const [topicTitle, setTopicTitle] = useState('')
  const [topicAngles, setTopicAngles] = useState<string[]>([])

  // 生成结果
  const [results, setResults] = useState<GeneratedResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContents()
    fetchIPProfiles()

    // 从URL参数获取选题信息
    const topic = searchParams.get('topic')
    const topicId = searchParams.get('topicId')

    if (topic) {
      setTopicTitle(decodeURIComponent(topic))
    }
    if (topicId) {
      fetchTopicDetails(topicId)
    }
  }, [searchParams])

  useEffect(() => {
    // 提取所有标签
    const tags = new Set<string>()
    contents.forEach(content => {
      const contentTags = parseJSON<string[]>(content.tags, [])
      contentTags.forEach(tag => tags.add(tag))
    })
    setAllTags(Array.from(tags).sort())

    // 如果有选题且内容已加载，智能推荐相关内容
    if (topicTitle && contents.length > 0 && recommendedContents.length === 0) {
      recommendContents()
    } else if (contents.length > 0 && recommendedContents.length === 0) {
      // 如果没有选题，显示最新的5条
      setRecommendedContents(contents.slice(0, 5))
    }
  }, [contents, topicTitle])

  async function fetchTopicDetails(id: string) {
    try {
      const res = await fetch(`/api/topics/${id}`)
      if (res.ok) {
        const topic = await res.json()
        if (topic.angles) {
          const angles = JSON.parse(topic.angles)
          setTopicAngles(angles)
        }
      }
    } catch (error) {
      console.error('获取选题详情失败:', error)
    }
  }

  async function fetchContents() {
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        setContents(data)
      }
    } catch (error) {
      console.error('获取内容失败:', error)
    }
  }

  async function fetchIPProfiles() {
    try {
      const res = await fetch('/api/ip/list')
      if (res.ok) {
        const data = await res.json()
        setIpProfiles(data)
        if (data.length > 0) {
          setSelectedIpId(data[0].id)
        }
      }
    } catch (error) {
      console.error('获取IP失败:', error)
    }
  }

  async function recommendContents() {
    try {
      const res = await fetch('/api/ai/recommend-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          contentIds: contents.map(c => c.id),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const recommended = data.recommendedIds
          .map((id: string) => contents.find(c => c.id === id))
          .filter(Boolean)
          .slice(0, 5)
        setRecommendedContents(recommended)
      }
    } catch (error) {
      console.error('推荐内容失败:', error)
      // 如果推荐失败，显示最新的5条
      setRecommendedContents(contents.slice(0, 5))
    }
  }

  function toggleContent(id: string) {
    if (selectedContentIds.includes(id)) {
      setSelectedContentIds(selectedContentIds.filter(i => i !== id))
    } else {
      if (selectedContentIds.length >= 5) {
        alert('最多选择5条内容')
        return
      }
      setSelectedContentIds([...selectedContentIds, id])
    }
  }

  async function handleCreate() {
    if (!selectedIpId) {
      alert('请先选择IP身份')
      return
    }

    setLoading(true)
    setResults([])

    try {
      // 构建提示词
      let prompt = `创作类型：${CREATION_TYPES.find(t => t.value === creationType)?.label}\n`
      prompt += `内容风格：${STYLE_OPTIONS.find(s => s.value === style)?.label}\n`

      if (topicTitle) {
        prompt += `\n选题：${topicTitle}\n`
      }

      if (topicAngles.length > 0) {
        prompt += `\n推荐角度：\n${topicAngles.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n`
      }

      if (additionalRequirements) {
        prompt += `\n补充要求：${additionalRequirements}\n`
      }

      console.log('=== 开始创作 ===')
      console.log('请求参数:', {
        ipId: selectedIpId,
        sourceIds: selectedContentIds,
        prompt,
      })

      const res = await fetch('/api/ai/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipId: selectedIpId,
          sourceIds: selectedContentIds,
          prompt,
        }),
      })

      console.log('响应状态:', res.status, res.statusText)

      if (res.ok) {
        const data = await res.json()
        console.log('生成成功:', data)
        setResults([{
          id: `result-${Date.now()}`,
          content: data.result,
          createdAt: new Date().toISOString(),
        }])
      } else {
        const errorData = await res.json().catch(() => ({ error: '无法解析错误信息' }))
        console.error('生成失败:', errorData)
        alert(`生成失败：${errorData.error || res.statusText}\n\n请检查控制台查看详细错误信息`)
      }
    } catch (error) {
      console.error('创作失败（异常）:', error)
      alert(`创作失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查控制台查看详细错误信息`)
    } finally {
      setLoading(false)
    }
  }

  // 过滤内容
  const filteredContents = contents.filter(content => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!content.title.toLowerCase().includes(query) &&
          !content.content.toLowerCase().includes(query)) {
        return false
      }
    }

    if (selectedTags.length > 0) {
      const contentTags = parseJSON<string[]>(content.tags, [])
      if (!selectedTags.some(tag => contentTags.includes(tag))) {
        return false
      }
    }

    return true
  })

  const displayContents = showAllContents ? filteredContents : recommendedContents

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页面头部 */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm flex-shrink-0">
              ✨
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">AI 内容创作</h1>
              {topicTitle ? (
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white/70 text-base font-medium">正在创作：</span>
                    <p className="text-3xl font-bold leading-tight">《{topicTitle}》</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/80 text-base mt-2">选择素材，三步生成爆款内容</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：内容选择 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                📚
              </div>
              <h2 className="text-lg font-bold text-slate-800">参考内容</h2>
              <span className="ml-auto text-xs text-slate-500">
                已选 {selectedContentIds.length}/5
              </span>
            </div>

            {/* 智能推荐标题栏 */}
            {!showAllContents && recommendedContents.length > 0 && (
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                <span className="text-sm font-bold text-indigo-600">✨ AI 推荐</span>
                <button
                  onClick={() => setShowAllContents(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  查看全部 →
                </button>
              </div>
            )}

            {/* 搜索和筛选 */}
            {showAllContents && (
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索内容..."
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                />

                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {allTags.slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag))
                          } else {
                            setSelectedTags([...selectedTags, tag])
                          }
                        }}
                        className={`px-2 py-1 rounded-full text-xs transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowAllContents(false)}
                  className="text-xs text-slate-600 hover:text-slate-700"
                >
                  ← 返回推荐
                </button>
              </div>
            )}

            {/* 内容列表 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayContents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  暂无内容
                </div>
              ) : (
                displayContents.map(content => {
                  const isSelected = selectedContentIds.includes(content.id)
                  return (
                    <div
                      key={content.id}
                      onClick={() => toggleContent(content.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                            {content.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {content.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">{content.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* 右侧：创作参数和结果 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 创作参数 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">创作设置</h2>

            {/* IP选择 - 前置 */}
            {ipProfiles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  👤 选择 IP 身份（我在为谁创作？）
                </label>
                <select
                  value={selectedIpId}
                  onChange={(e) => setSelectedIpId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none cursor-pointer bg-white text-slate-800 font-medium"
                >
                  {ipProfiles.map(ip => (
                    <option key={ip.id} value={ip.id}>
                      {ip.name} - {ip.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 步骤1：选择创作类型 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                1️⃣ 选择创作类型
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CREATION_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setCreationType(type.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      creationType === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-bold text-slate-800 mb-1">{type.label}</div>
                    <div className="text-xs text-slate-500">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 步骤2：选择风格 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                2️⃣ 选择内容风格
              </label>
              <div className="grid grid-cols-3 gap-3">
                {STYLE_OPTIONS.map(styleOption => (
                  <button
                    key={styleOption.value}
                    onClick={() => setStyle(styleOption.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      style === styleOption.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{styleOption.icon}</div>
                    <div className="font-bold text-slate-800 text-sm mb-1">{styleOption.label}</div>
                    <div className="text-xs text-slate-500">{styleOption.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 步骤3：补充要求 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                3️⃣ 补充要求（可选）
              </label>
              <textarea
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="例如：重点突出实用性、加入具体案例、控制在300字以内..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none resize-none text-sm bg-white text-slate-800"
                rows={3}
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI 创作中...
                </span>
              ) : (
                '✨ 开始创作'
              )}
            </button>
          </div>

          {/* 生成结果 */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">生成结果</h2>
                <span className="text-xs text-slate-500">
                  {new Date(results[0].createdAt).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {results.map(result => (
                <div key={result.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                    {result.content}
                  </pre>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-300">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.content)
                        alert('已复制到剪贴板')
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm"
                    >
                      📋 复制内容
                    </button>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium text-sm"
                    >
                      🔄 重新生成
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              ✨
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI 内容创作</h1>
              <p className="text-white/80 text-sm mt-1">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  )
}
