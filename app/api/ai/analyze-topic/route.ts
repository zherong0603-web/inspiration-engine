import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, platform, category } = body

    const prompt = `作为一个资深的新媒体内容运营专家，请快速评估以下选题：

选题标题：${title}
${description ? `选题描述：${description}` : ''}
目标平台：${platform || '通用'}
内容分类：${category || '未分类'}

请以JSON格式输出评估结果：

{
  "aiScore": 0-100,           // 爆款指数（综合评分）
  "angles": [                 // 3个推荐的创作切入角度
    "角度1：具体描述",
    "角度2：具体描述",
    "角度3：具体描述"
  ],
  "bestTime": "最佳发布时机的具体建议",
  "expectedViews": "预期播放量/阅读量范围"
}

要求：
1. 爆款指数要基于话题热度、需求强度、竞争程度综合评估
2. 推荐3个最有价值的创作角度，要具体可执行
3. 最佳时机要给出明确的时间建议
4. 预期数据要给出合理的范围
5. 确保输出的是有效的JSON格式，不要包含其他文字说明`

    const analysisText = await generateContent({ prompt })

    // 尝试解析JSON
    let analysisData
    try {
      // 提取JSON部分（如果AI返回了额外的文字）
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法提取JSON数据')
      }
    } catch (parseError) {
      console.error('解析AI返回的JSON失败:', parseError)
      // 如果解析失败，返回默认结构
      analysisData = {
        aiScore: 50,
        angles: ['请手动分析', '请手动分析', '请手动分析'],
        bestTime: '工作日晚上8-10点',
        expectedViews: '待预测'
      }
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('分析选题失败:', error)
    return NextResponse.json({ error: '分析选题失败' }, { status: 500 })
  }
}
