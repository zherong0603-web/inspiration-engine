'use client'

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">使用指南</h1>

        {/* 快速开始 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            快速开始
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">设置 IP 身份</h3>
                <p className="text-sm text-gray-600">
                  前往「IP 设置」页面，填写你的 IP 名称、人设、风格和擅长话题。这是 AI 了解你的基础。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">建立内容库</h3>
                <p className="text-sm text-gray-600">
                  在「内容库」中添加你过往的优质内容，包括标题、正文、标签等。内容越多，AI 越了解你的风格。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">发现选题灵感</h3>
                <p className="text-sm text-gray-600">
                  在「选题灵感」页面，输入你想做的内容方向，AI 会推荐具体选题并评估爆款指数。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium mb-1">AI 智能创作</h3>
                <p className="text-sm text-gray-600">
                  在「内容创作」页面，选择参考内容，输入创作意图，AI 会基于你的 IP 人设生成高质量脚本。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 功能详解 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📖</span>
            功能详解
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-violet-600">🎭 IP 身份设置</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• <strong>IP 名称</strong>：你的个人品牌名称</li>
                <li>• <strong>人设</strong>：性格、价值观、说话风格（越详细越好）</li>
                <li>• <strong>内容风格</strong>：幽默/专业/温暖/犀利等</li>
                <li>• <strong>擅长话题</strong>：职场/情感/知识/生活等领域</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-emerald-600">📚 内容库</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 添加你的历史爆款内容作为参考素材</li>
                <li>• 支持按分类（职场/家庭/生活等）管理</li>
                <li>• 可添加标签方便检索</li>
                <li>• 支持搜索功能快速找到内容</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-amber-600">💡 选题灵感库</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• AI 推荐选题并评估爆款指数（0-100分）</li>
                <li>• 提供 3 个差异化的创作角度</li>
                <li>• 建议最佳发布时机</li>
                <li>• 预测播放量/阅读量范围</li>
                <li>• 支持保存选题到灵感库</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-rose-600">✨ 内容创作</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 选择内容库中的参考内容（可多选）</li>
                <li>• 输入创作意图和要求</li>
                <li>• AI 基于你的 IP 人设生成脚本</li>
                <li>• 采用爆款脚本结构（黄金3秒钩子 → 问题放大 → 解决方案 → 价值升华 → 行动召唤）</li>
                <li>• 可保存生成结果到内容库</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">❓</span>
            常见问题
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Q: 为什么要设置 IP 身份？</h3>
              <p className="text-sm text-gray-600">
                A: IP 身份是 AI 了解你的基础。设置得越详细，AI 生成的内容越符合你的风格，越有个人特色。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Q: 内容库需要添加多少内容？</h3>
              <p className="text-sm text-gray-600">
                A: 建议至少添加 5-10 篇优质内容。内容越多，AI 越能学习你的风格，生成的内容质量越高。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Q: AI 生成的内容可以直接发布吗？</h3>
              <p className="text-sm text-gray-600">
                A: 建议作为初稿参考，根据实际情况修改优化后再发布。AI 提供创意和结构，你的个人经验和细节更重要。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Q: 爆款指数是如何计算的？</h3>
              <p className="text-sm text-gray-600">
                A: 综合考虑需求强度、竞争程度、热度趋势、时机把握四个维度，基于数据分析和 AI 判断给出评分。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Q: 遇到问题怎么办？</h3>
              <p className="text-sm text-gray-600">
                A: 可以在「反馈」页面提交问题或建议，我们会尽快回复。也可以添加微信：wangzherongxx
              </p>
            </div>
          </div>
        </section>

        {/* 使用技巧 */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">💡</span>
            使用技巧
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>定期更新内容库</strong>：把新的爆款内容及时添加到内容库，让 AI 持续学习</p>
            <p>• <strong>详细描述创作意图</strong>：告诉 AI 你想表达什么、目标受众是谁、希望达到什么效果</p>
            <p>• <strong>多尝试不同角度</strong>：同一个选题可以从不同角度切入，多生成几版对比选择</p>
            <p>• <strong>结合热点话题</strong>：在创作意图中提到当前热点，提升内容时效性</p>
            <p>• <strong>保持人设一致</strong>：确保 IP 设置准确，生成的内容才能保持风格统一</p>
          </div>
        </section>
      </div>
    </div>
  )
}
