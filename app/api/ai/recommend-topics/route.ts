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
    const { direction, platform } = body

    if (!direction || !direction.trim()) {
      return NextResponse.json({ error: '请输入内容方向' }, { status: 400 })
    }

    const prompt = `作为一个资深的新媒体内容运营专家，用户想做"${direction}"相关的内容${platform ? `，目标平台是${platform}` : ''}。

请为用户推荐3-5个具体的选题建议，每个选题都要有明确的标题、爆款指数和推荐理由。

请以JSON格式输出，格式如下：

{
  "topics": [
    {
      "title": "具体的选题标题",
      "aiScore": 0-100,  // 爆款指数
      "reason": "一句话说明为什么推荐这个选题（20字以内）",
      "category": "职场/生活/情感/知识/娱乐/科技/其他"
    }
  ]
}

要求：
1. 选题要具体、可执行，不要太宽泛
2. 爆款指数要基于话题热度、需求强度、竞争程度综合评估
3. 推荐理由要简洁有力，突出核心优势
4. 选题之间要有差异化，覆盖不同角度
5. 确保输出的是有效的JSON格式，不要包含其他文字说明`

    const responseText = await generateContent({ prompt })

    // 解析JSON
    let data
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法提取JSON数据')
      }
    } catch (parseError) {
      console.error('解析AI返回的JSON失败:', parseError)
      return NextResponse.json({
        error: 'AI返回格式错误，请重试',
        raw: responseText
      }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('AI推荐选题失败:', error)
    return NextResponse.json({ error: 'AI推荐失败，请重试' }, { status: 500 })
  }
}
