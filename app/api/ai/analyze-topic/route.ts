import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, platform, category } = body

    // 第1步：分析竞品密度（从数据库查询类似选题）
    const similarTopics = await prisma.topicIdea.count({
      where: {
        userId: user.id, // 只统计当前用户的选题
        OR: [
          { title: { contains: title.slice(0, 5) } },
          { category }
        ]
      }
    })

    // 第2步：查询爆款案例库，找相关案例
    const viralCases = await prisma.viralCase.findMany({
      where: {
        OR: [
          { category },
          { platform: platform || '通用' }
        ]
      },
      orderBy: { viewCount: 'desc' },
      take: 3
    })

    // 第3步：构建数据驱动的 Prompt
    const prompt = `你是一个资深的新媒体数据分析专家，请基于以下数据评估选题：

【选题信息】
标题：${title}
${description ? `描述：${description}` : ''}
平台：${platform || '通用'}
分类：${category || '未分类'}

【竞品分析】
- 同类选题数量：${similarTopics} 个
- 竞争密度：${similarTopics < 10 ? '低（蓝海）' : similarTopics < 30 ? '中等' : '高（红海）'}

【爆款参考】
${viralCases.length > 0 ? viralCases.map((c, i) =>
  `${i + 1}. ${c.title}
   播放量：${c.viewCount.toLocaleString()}
   点赞：${c.likeCount.toLocaleString()}
   评论：${c.commentCount.toLocaleString()}`
).join('\n\n') : '暂无相关爆款案例'}

【评估要求】
请基于以上数据，输出JSON格式的评估结果：

{
  "aiScore": 0-100,           // 爆款指数（综合评分）
  "scoreBreakdown": {         // 评分细分
    "demand": 0-100,          // 需求强度（用户需求有多强）
    "competition": 0-100,     // 竞争程度（100分表示竞争小）
    "trending": 0-100,        // 热度趋势（是否在上升期）
    "timing": 0-100           // 时机把握（现在做是否合适）
  },
  "angles": [                 // 3个推荐的创作切入角度
    "角度1：具体描述（要有差异化）",
    "角度2：具体描述（要有差异化）",
    "角度3：具体描述（要有差异化）"
  ],
  "bestTime": "最佳发布时机的具体建议（考虑用户活跃时间）",
  "expectedViews": "预期播放量/阅读量范围（基于同类爆款数据）",
  "riskWarning": "风险提示（如果有）",
  "optimization": "优化建议（如何提升爆款概率）"
}

评分逻辑：
1. 需求强度：基于话题的普遍性和痛点强度
2. 竞争程度：竞品越少分数越高（${similarTopics}个竞品）
3. 热度趋势：基于当前社会热点和季节性
4. 时机把握：是否处于话题的上升期

确保输出的是有效的JSON格式，不要包含其他文字说明。`

    const analysisText = await generateContent({ prompt })

    // 解析JSON
    let analysisData
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法提取JSON数据')
      }
    } catch (parseError) {
      console.error('解析AI返回的JSON失败:', parseError)
      // 如果解析失败，返回基于数据的默认评分
      const competitionScore = Math.max(0, 100 - similarTopics * 3)
      const baseScore = Math.round((competitionScore + 50) / 2)

      analysisData = {
        aiScore: baseScore,
        scoreBreakdown: {
          demand: 60,
          competition: competitionScore,
          trending: 50,
          timing: 50
        },
        angles: ['请手动分析', '请手动分析', '请手动分析'],
        bestTime: '工作日晚上8-10点',
        expectedViews: '待预测',
        riskWarning: '数据分析失败，建议手动评估',
        optimization: '建议增加更多细节描述'
      }
    }

    // 添加数据分析结果
    analysisData.dataAnalysis = {
      similarTopicsCount: similarTopics,
      competitionLevel: similarTopics < 10 ? '低' : similarTopics < 30 ? '中' : '高',
      viralCasesFound: viralCases.length,
      avgViews: viralCases.length > 0
        ? Math.round(viralCases.reduce((sum, c) => sum + c.viewCount, 0) / viralCases.length)
        : 0
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('分析选题失败:', error)
    return NextResponse.json({ error: '分析选题失败' }, { status: 500 })
  }
}
