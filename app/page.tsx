export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            灵感引擎
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
            AI 驱动的新媒体创作平台
          </p>
          <p className="text-base text-gray-500">
            让每一个创意都能成为爆款
          </p>
        </div>

        {/* Quick Start */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="bg-white rounded-2xl p-10 border border-black/5">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">快速开始</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { num: '1', label: '设置 IP 身份', color: 'from-violet-600 to-fuchsia-600' },
                { num: '2', label: '建立内容库', color: 'from-emerald-600 to-teal-600' },
                { num: '3', label: '发现爆款选题', color: 'from-amber-600 to-orange-600' },
                { num: '4', label: 'AI 智能创作', color: 'from-rose-600 to-pink-600' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} text-white rounded-xl flex items-center justify-center text-lg font-semibold mx-auto mb-3 shadow-sm`}>
                    {step.num}
                  </div>
                  <p className="text-sm text-gray-600">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {/* IP 设置 */}
            <a
              href="/ip-profile"
              className="group relative bg-white rounded-2xl p-8 border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🎭
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IP 身份设置</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    打造独特的 IP 人设，定义你的内容风格和创作方向
                  </p>
                </div>
              </div>
            </a>

            {/* 内容库 */}
            <a
              href="/content-library"
              className="group relative bg-white rounded-2xl p-8 border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  📚
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">内容库</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    沉淀你的创作素材，构建专属的内容知识库
                  </p>
                </div>
              </div>
            </a>

            {/* 选题灵感 */}
            <a
              href="/topics"
              className="group relative bg-white rounded-2xl p-8 border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  💡
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">选题灵感库</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    AI 智能分析选题潜力，帮你找到下一个爆款
                  </p>
                </div>
              </div>
            </a>

            {/* 内容创作 - 突出显示 */}
            <a
              href="/create"
              className="group relative bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 border border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
                  ✨
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">内容创作</h3>
                  <p className="text-violet-100 text-sm leading-relaxed">
                    一键生成高质量内容，让创作更高效
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto px-6 mt-20 text-center">
          <p className="text-sm text-gray-500">
            有任何问题或建议？微信：
            <span className="text-gray-900 font-medium ml-1">wangzherongxx</span>
          </p>
        </div>
      </div>
    </div>
  )
}
