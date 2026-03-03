'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeGuide() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // 检查是否是首次访问
    const hasSeenGuide = localStorage.getItem('hasSeenGuide')
    if (!hasSeenGuide) {
      setShow(true)
    }
  }, [])

  const steps = [
    {
      title: '欢迎使用灵感引擎 🎉',
      content: 'AI 驱动的新媒体创作平台，让每一个创意都能成为爆款',
      icon: '⚡',
    },
    {
      title: '第一步：设置 IP 身份',
      content: '告诉 AI 你是谁，你的风格是什么，这样生成的内容才更符合你的特色',
      icon: '🎭',
      action: () => router.push('/ip-profile'),
    },
    {
      title: '第二步：建立内容库',
      content: '添加你过往的优质内容，让 AI 学习你的创作风格',
      icon: '📚',
      action: () => router.push('/content-library'),
    },
    {
      title: '第三步：开始创作',
      content: '选择参考内容，输入创作意图，AI 会帮你生成高质量脚本',
      icon: '✨',
      action: () => router.push('/create'),
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setShow(false)
  }

  const handleClose = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setShow(false)
    if (steps[step].action) {
      steps[step].action()
    }
  }

  if (!show) return null

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-center">
          <div className="text-6xl mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {currentStep.content}
          </p>

          {/* Progress */}
          <div className="flex gap-2 justify-center mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-violet-600'
                    : i < step
                    ? 'w-2 bg-violet-300'
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              跳过
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              {step < steps.length - 1 ? '下一步' : '开始使用'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
