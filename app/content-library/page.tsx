'use client'

import { useState, useEffect } from 'react'
import { formatDate, parseJSON } from '@/lib/utils'

interface Content {
  id: string
  title: string
  category: string
  type: string
  tags: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function ContentLibraryPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [editingContentId, setEditingContentId] = useState<string | null>(null)
  const [editingTags, setEditingTags] = useState<string[]>([])
  const [showAddTagInput, setShowAddTagInput] = useState(false)
  const [newGlobalTag, setNewGlobalTag] = useState('')

  useEffect(() => {
    fetchContents()
  }, [])

  useEffect(() => {
    // 提取所有标签
    const tags = new Set<string>()
    contents.forEach(content => {
      const contentTags = parseJSON<string[]>(content.tags, [])
      contentTags.forEach(tag => tags.add(tag))
    })
    setAllTags(Array.from(tags).sort())
  }, [contents])

  async function fetchContents() {
    setLoading(true)
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        setContents(data)
      }
    } catch (error) {
      console.error('获取内容失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteContent(id: string) {
    if (!confirm('确定要删除这条内容吗？')) return

    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchContents()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  async function updateContentTags(contentId: string, tags: string[]) {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      })

      if (res.ok) {
        fetchContents()
        setEditingContentId(null)
      }
    } catch (error) {
      console.error('更新标签失败:', error)
      alert('更新标签失败，请重试')
    }
  }

  function startEditTags(content: Content) {
    setEditingContentId(content.id)
    setEditingTags(parseJSON<string[]>(content.tags, []))
  }

  function removeTag(tag: string) {
    setEditingTags(editingTags.filter(t => t !== tag))
  }

  function addGlobalTag() {
    const tag = newGlobalTag.trim()
    if (tag && !allTags.includes(tag)) {
      setAllTags([...allTags, tag].sort())
      setNewGlobalTag('')
      setShowAddTagInput(false)
    }
  }

  function saveTags(contentId: string) {
    updateContentTags(contentId, editingTags)
  }

  function toggleTagFilter(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 过滤内容
  const filteredContents = contents.filter(content => {
    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase()
      if (!content.title.toLowerCase().includes(searchLower) &&
          !content.content.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      const contentTags = parseJSON<string[]>(content.tags, [])
      if (!selectedTags.some(tag => contentTags.includes(tag))) {
        return false
      }
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页面头部 */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-bold">内容库</h1>
              <p className="text-white/80 text-sm mt-1">管理你的所有历史内容，通过标签快速查找</p>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题或内容..."
              className="w-full px-5 py-4 rounded-xl text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder:text-slate-400 font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
              🔍
            </div>
          </div>
        </div>
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
              🏷️
            </div>
            <h2 className="text-lg font-bold text-slate-800">标签筛选</h2>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                清除筛选
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.map(tag => {
              const isSelected = selectedTags.includes(tag)
              const count = contents.filter(c =>
                parseJSON<string[]>(c.tags, []).includes(tag)
              ).length

              return (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                  <span className={`ml-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          {/* 添加新标签 */}
          {!showAddTagInput ? (
            <button
              onClick={() => setShowAddTagInput(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
            >
              ➕ 添加新标签
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newGlobalTag}
                onChange={(e) => setNewGlobalTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGlobalTag()}
                placeholder="输入新标签名称，按 Enter 添加"
                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none text-sm text-slate-800"
                autoFocus
              />
              <button
                onClick={addGlobalTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowAddTagInput(false)
                  setNewGlobalTag('')
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}

      {/* 内容列表 */}
      {filteredContents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-slate-500 text-lg mb-2">
            {search || selectedTags.length > 0 ? '没有找到匹配的内容' : '暂无内容'}
          </p>
          <p className="text-slate-400 text-sm">
            {search || selectedTags.length > 0 ? '试试其他搜索条件' : '开始创作后，内容会自动保存到这里'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContents.map((content) => {
            const contentTags = parseJSON<string[]>(content.tags, [])
            const isEditing = editingContentId === content.id

            return (
              <div
                key={content.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                      {content.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        📁 {content.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        📝 {content.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        🕐 {formatDate(content.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/content-library/${content.id}`}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-medium"
                    >
                      查看详情
                    </a>
                    <button
                      onClick={() => deleteContent(content.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 内容预览 */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {content.content}
                </p>

                {/* 标签区域 */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">🏷️ 标签</span>
                      {contentTags.length === 0 && !isEditing && (
                        <span className="text-xs text-slate-400">暂无标签</span>
                      )}
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => startEditTags(content)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        ✏️ 编辑标签
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveTags(content.id)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          ✓ 保存
                        </button>
                        <button
                          onClick={() => setEditingContentId(null)}
                          className="text-sm text-slate-600 hover:text-slate-700 font-medium"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {contentTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {/* 已选择的标签 */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-slate-600 mb-2">已选择的标签：</div>
                        <div className="flex flex-wrap gap-2">
                          {editingTags.length === 0 ? (
                            <span className="text-xs text-slate-400">暂未选择标签</span>
                          ) : (
                            editingTags.map(tag => (
                              <span
                                key={tag}
                                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-md"
                              >
                                #{tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-red-200 transition-colors font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 可选择的标签 */}
                      <div>
                        <div className="text-xs font-bold text-slate-600 mb-2">
                          点击选择标签：
                          {allTags.length === 0 && (
                            <span className="ml-2 text-slate-400 font-normal">
                              暂无可用标签，请先在顶部"添加新标签"
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border-2 border-slate-200 max-h-40 overflow-y-auto">
                          {allTags.map(tag => {
                            const isSelected = editingTags.includes(tag)
                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    removeTag(tag)
                                  } else {
                                    setEditingTags([...editingTags, tag])
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                                    : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border-2 border-slate-200 hover:border-indigo-300'
                                }`}
                                disabled={isSelected}
                              >
                                #{tag}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
