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
    const { topic, contentIds } = body

    if (!topic || !contentIds || contentIds.length === 0) {
      return NextResponse.json({ recommendedIds: [] })
    }

    // 使用AI推荐最相关的内容
    const prompt = `用户想要创作关于"${topic}"的内容。

现有内容ID列表：${contentIds.join(', ')}

请从这些内容ID中选择最相关的3-5个，用于辅助创作。

要求：
1. 只返回内容ID，用逗号分隔
2. 按相关性从高到低排序
3. 最多返回5个ID

输出格式：id1,id2,id3`

    const response = await generateContent({ prompt })

    // 解析返回的ID列表
    const recommendedIds = response
      .split(',')
      .map(id => id.trim())
      .filter(id => contentIds.includes(id))
      .slice(0, 5)

    return NextResponse.json({ recommendedIds })
  } catch (error) {
    console.error('推荐内容失败:', error)
    return NextResponse.json({ error: '推荐失败' }, { status: 500 })
  }
}
