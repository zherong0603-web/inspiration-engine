'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

export default function CreditsPage() {
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCredits()
  }, [])

  async function fetchCredits() {
    try {
      const res = await fetch('/api/user/credits', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('获取积分失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">加载中...</div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">我的积分</h1>

        {/* 当前积分 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">当前积分</div>
              <div className="text-5xl font-bold">{credits}</div>
            </div>
            <div className="text-6xl">💎</div>
          </div>
        </div>

        {/* 积分说明 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">积分规则</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">新用户注册</div>
                <div className="text-sm text-gray-600">首次注册即可获得</div>
              </div>
              <div className="text-green-600 font-semibold">+100 积分</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">邀请好友</div>
                <div className="text-sm text-gray-600">每邀请一位好友注册</div>
              </div>
              <div className="text-green-600 font-semibold">+50 积分</div>
            </div>
          </div>
        </div>

        {/* 积分消耗 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">积分消耗</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="font-medium text-gray-900">AI 内容创作</div>
                <div className="text-sm text-gray-600">生成一次完整内容</div>
              </div>
              <div className="text-red-600 font-semibold">-10 积分</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="font-medium text-gray-900">选题评估</div>
                <div className="text-sm text-gray-600">AI 评估一个选题</div>
              </div>
              <div className="text-red-600 font-semibold">-5 积分</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="font-medium text-gray-900">内容分析</div>
                <div className="text-sm text-gray-600">分析内容质量</div>
              </div>
              <div className="text-red-600 font-semibold">-3 积分</div>
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>提示：</strong>积分不足时，可以通过邀请好友获得更多积分。每位好友注册成功，你和好友都将获得积分奖励！
          </p>
        </div>
      </div>
    </div>
  )
}
