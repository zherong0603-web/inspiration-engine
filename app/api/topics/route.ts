import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取选题列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const topics = await prisma.topicIdea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('获取选题失败:', error)
    return NextResponse.json({ error: '获取选题失败' }, { status: 500 })
  }
}

// 创建选题
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      platform,
      aiScore,
      angles,
      bestTime,
      expectedViews
    } = body

    const topic = await prisma.topicIdea.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        platform: platform || '通用',
        aiScore: aiScore || 0,
        angles: angles ? JSON.stringify(angles) : null,
        bestTime,
        expectedViews,
      },
    })

    return NextResponse.json(topic)
  } catch (error) {
    console.error('创建选题失败:', error)
    return NextResponse.json({ error: '创建选题失败' }, { status: 500 })
  }
}
