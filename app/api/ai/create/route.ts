import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContent } from '@/lib/ai'
import { getCurrentUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { ipId, sourceIds, prompt: userPrompt } = body

    // 获取 IP Profile
    let ipProfile
    if (ipId) {
      ipProfile = await prisma.iPProfile.findFirst({
        where: { id: ipId, userId: user.id },
      })
    }
    if (!ipProfile) {
      ipProfile = await prisma.iPProfile.findFirst({
        where: { userId: user.id },
      })
    }
    if (!ipProfile) {
      return NextResponse.json(
        { error: 'Please set up your IP profile first' },
        { status: 400 }
      )
    }

    // 获取参考内容
    const sourceContents = await prisma.content.findMany({
      where: {
        id: { in: sourceIds },
        userId: user.id,
      },
    })

    // 获取爆款案例（相关分类）
    const viralCases = await prisma.viralCase.findMany({
      orderBy: { viewCount: 'desc' },
      take: 2
    })

    // 获取脚本结构模板
    const scriptTemplates = await prisma.scriptTemplate.findMany({
      orderBy: { successRate: 'desc' },
      take: 1
    })

    // 构建爆款创作 Prompt
    const prompt = `你是 ${ipProfile.name} 的专业内容创作助手，擅长创作爆款短视频脚本。

【IP 人设】
${ipProfile.persona}

【内容风格】
${ipProfile.style}

【参考内容】
${sourceContents.length > 0 ? sourceContents.map((c, i) =>
  `${i + 1}. ${c.title}\n${c.content.slice(0, 200)}...`
).join('\n\n') : '本次为全新创作'}

【爆款案例参考】
${viralCases.length > 0 ? viralCases.map((c, i) =>
  `案例${i + 1}：${c.title}\n播放量：${c.viewCount.toLocaleString()}\n${c.content.slice(0, 150)}...`
).join('\n\n') : ''}

【创作要求】
${userPrompt}

【爆款脚本结构】
请严格按照以下结构创作：

1. 【黄金3秒钩子】（0-3秒）
   - 使用疑问句/反常识/数据冲击/痛点共鸣
   - 例如："你知道吗？90%的人都在用错这个方法"
   - 目标：让用户停下来

2. 【问题放大】（3-10秒）
   - 描述痛点场景，引发共鸣
   - 使用"是不是经常..."、"有没有遇到..."
   - 目标：让用户点头认同

3. 【解决方案】（10-40秒）
   - 提供3个具体可执行的方法
   - 每个方法要简单、实用、有画面感
   - 使用"第一/第二/第三"结构

4. 【价值升华】（40-50秒）
   - 总结核心价值
   - 给出行动建议
   - 目标：让用户收藏转发

5. 【行动召唤】（50-60秒）
   - 引导互动（点赞/评论/关注）
   - 例如："如果对你有帮助，记得点赞收藏"

【创作要点】
1. 语言要口语化，像聊天一样
2. 每句话不超过15个字
3. 多用短句，节奏要快
4. 加入具体数字和案例
5. 符合 ${ipProfile.name} 的人设和风格

【输出格式】
请输出完整的短视频脚本，包括：
- 标题（吸引眼球）
- 完整脚本（标注时间节点）
- 拍摄建议（可选）

开始创作：`

    const result = await generateContent({ prompt })

    // 保存创作记录
    const creation = await prisma.creation.create({
      data: {
        userId: user.id,
        sourceIds: JSON.stringify(sourceIds),
        prompt: userPrompt,
        result,
        type: '二创',
        status: '草稿',
      },
    })

    // 如果使用了脚本模板，增加使用次数
    if (scriptTemplates.length > 0) {
      await prisma.scriptTemplate.update({
        where: { id: scriptTemplates[0].id },
        data: { usageCount: { increment: 1 } }
      })
    }

    // 记录 AI 生成日志
    const duration = Date.now() - startTime
    await logger.aiGenerate(user.id, 'content_creation', duration, request)

    return NextResponse.json({ result, creationId: creation.id })
  } catch (error) {
    console.error('创作内容时出错:', error)

    // 记录错误日志
    const user = await getCurrentUser()
    if (user) {
      await logger.error(user.id, 'ai_create', error instanceof Error ? error.message : String(error), request)
    }

    return NextResponse.json(
      { error: 'Failed to create content', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
