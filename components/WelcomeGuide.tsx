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
      // 延迟 500ms 显示，让页面先加载
      setTimeout(() => setShow(true), 500)
    }
  }, [])

  const steps = [
    {
      title: '欢迎使用灵感引擎 🎉',
      content: 'AI 驱动的新媒体创作平台，让每一个创意都能成为爆款。让我们快速了解如何使用。',
      icon: '⚡',
    },
    {
      title: '第一步：设置 IP 身份',
      content: '告诉 AI 你是谁，你的风格是什么。包括 IP 名称、人设、内容风格等，这样生成的内容才更符合你的特色。',
      icon: '🎭',
      action: () => router.push('/ip-profile'),
      actionLabel: '去设置 IP',
    },
    {
      title: '第二步：建立内容库',
      content: '添加你过往的优质内容作为参考素材。内容越多，AI 越了解你的风格，生成的内容质量越高。',
      icon: '📚',
      action: () => router.push('/content-library'),
      actionLabel: '添加内容',
    },
    {
      title: '第三步：发现选题灵感',
      content: '输入内容方向，AI 会推荐具体选题并评估爆款指数，帮你找到最有潜力的话题。',
      icon: '💡',
      action: () => router.push('/topics'),
      actionLabel: '发现选题',
    },
    {
      title: '第四步：开始创作',
      content: '选择参考内容，输入创作意图，AI 会基于你的 IP 人设生成高质量的短视频脚本。',
      icon: '✨',
      action: () => router.push('/create'),
      actionLabel: '立即创作',
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setShow(false)
  }

  const handleClose = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setShow(false)
  }

  const handleAction = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setShow(false)
    if (steps[step].action) {
      steps[step].action()
    }
  }

  if (!show) return null

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-in">
        {/* 进度条 */}
        <div className="h-2 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <div className="text-6xl mb-4">{currentStep.icon}</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
            <div className="text-sm text-white/80 font-medium">
              步骤 {step + 1} / {steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12">
          <p className="text-gray-600 text-center mb-8 leading-relaxed text-lg">
            {currentStep.content}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                上一步
              </button>
            )}

            {currentStep.action ? (
              <button
                onClick={handleAction}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                {currentStep.actionLabel}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                {step < steps.length - 1 ? '下一步' : '开始使用'}
              </button>
            )}
          </div>

          {/* Skip */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              跳过引导
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
