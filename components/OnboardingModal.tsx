'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  title: string
  description: string
  icon: string
  action?: {
    label: string
    href: string
  }
}

const steps: OnboardingStep[] = [
  {
    title: '欢迎使用灵感引擎！',
    description: '这是一个帮助你生成高质量短视频内容的 AI 工具。让我们快速了解如何使用。',
    icon: '👋',
  },
  {
    title: '设置你的 IP 身份',
    description: '首先，设置你的个人品牌定位。包括 IP 名称、人设、风格等。这是 AI 了解你的基础。',
    icon: '🎭',
    action: {
      label: '去设置 IP',
      href: '/ip-profile',
    },
  },
  {
    title: '建立内容库',
    description: '添加你过往的优质内容作为参考。内容越多，AI 越了解你的风格，生成的内容质量越高。',
    icon: '📚',
    action: {
      label: '添加内容',
      href: '/content-library',
    },
  },
  {
    title: '获取选题灵感',
    description: '输入内容方向，AI 会推荐具体选题并评估爆款指数，帮你找到最有潜力的话题。',
    icon: '💡',
    action: {
      label: '发现选题',
      href: '/topics',
    },
  },
  {
    title: '开始创作',
    description: '选择参考内容，输入创作意图，AI 会基于你的 IP 人设生成高质量的短视频脚本。',
    icon: '✨',
    action: {
      label: '立即创作',
      href: '/create',
    },
  },
]

export default function OnboardingModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // 检查是否是新用户（首次登录）
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsOpen(false)
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsOpen(false)
  }

  const handleAction = (href: string) => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsOpen(false)
    router.push(href)
  }

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-slide-in">
        {/* 进度条 */}
        <div className="h-2 bg-gray-100 rounded-t-3xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* 内容 */}
        <div className="p-8 sm:p-12">
          {/* 图标 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-3xl text-5xl mb-4">
              {step.icon}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              步骤 {currentStep + 1} / {steps.length}
            </div>
          </div>

          {/* 标题和描述 */}
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            {step.title}
          </h2>
          <p className="text-gray-600 text-center text-lg leading-relaxed mb-8">
            {step.description}
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                上一步
              </button>
            )}

            {step.action ? (
              <button
                onClick={() => handleAction(step.action!.href)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                {step.action.label}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                {currentStep === steps.length - 1 ? '开始使用' : '下一步'}
              </button>
            )}
          </div>

          {/* 跳过按钮 */}
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
