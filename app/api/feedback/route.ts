import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

// 获取反馈列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId: user.id }
    if (status && status !== 'all') {
      where.status = status
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('获取反馈失败:', error)
    return NextResponse.json({ error: '获取反馈失败' }, { status: 500 })
  }
}

// 创建反馈
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    // 允许未登录用户提交反馈（匿名反馈）

    const body = await request.json()
    const { type, title, content, contact } = body

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user?.id,
        type,
        title,
        content,
        contact,
      },
    })

    // 记录反馈日志
    await logger.submitFeedback(user?.id, feedback.id, request)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('创建反馈失败:', error)
    return NextResponse.json({ error: '创建反馈失败' }, { status: 500 })
  }
}
