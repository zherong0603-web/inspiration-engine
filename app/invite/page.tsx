'use client'

import { useState, useEffect } from 'react'

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchInviteCode()
  }, [])

  async function fetchInviteCode() {
    try {
      const res = await fetch('/api/invite')
      if (res.ok) {
        const data = await res.json()
        setInviteCode(data.inviteCode)
      }
    } catch (error) {
      console.error('获取邀请码失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/login?invite=${inviteCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              🎁
            </div>
            <div>
              <h1 className="text-3xl font-bold">邀请好友</h1>
              <p className="text-white/80 text-sm mt-1">分享你的专属邀请码，邀请好友加入</p>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请码卡片 */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl mb-6">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="text-sm font-bold text-slate-600 mb-2">你的专属邀请码</div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-4 border-emerald-200 rounded-2xl px-12 py-6">
              <div className="text-5xl font-black text-emerald-700 tracking-wider font-mono">
                {inviteCode}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {copied ? '✓ 已复制' : '📋 复制邀请码'}
            </button>
            <button
              onClick={copyInviteLink}
              className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all"
            >
              🔗 复制邀请链接
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3 text-left">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <div className="font-bold text-blue-900 mb-2">如何邀请好友？</div>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">1.</span>
                    <span>复制你的邀请码或邀请链接</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">2.</span>
                    <span>分享给你的好友</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">3.</span>
                    <span>好友注册时填写邀请码即可</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请统计（未来扩展） */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">邀请统计</h2>
            <p className="text-slate-500 text-sm">查看你的邀请成果</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-black text-emerald-700 mb-2">0</div>
            <div className="text-sm text-emerald-800 font-medium">已邀请人数</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-black text-blue-700 mb-2">0</div>
            <div className="text-sm text-blue-800 font-medium">活跃用户</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-black text-purple-700 mb-2">∞</div>
            <div className="text-sm text-purple-800 font-medium">可用次数</div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          💡 提示：邀请码可以无限次使用，快分享给你的朋友吧！
        </div>
      </div>
    </div>
  )
}
