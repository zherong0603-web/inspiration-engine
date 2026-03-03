import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取我的反馈列表
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    return NextResponse.json({ error: '获取反馈列表失败' }, { status: 500 })
  }
}

// 提交新反馈
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    // 允许匿名反馈，但如果登录了就关联用户

    const body = await request.json()
    const { type, title, content, contact } = body

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: '请填写完整的反馈信息' },
        { status: 400 }
      )
    }

    // 验证反馈类型
    if (!['bug', '建议', '其他'].includes(type)) {
      return NextResponse.json(
        { error: '无效的反馈类型' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user?.id, // 如果登录了就关联用户
        type,
        title,
        content,
        contact,
        status: '待处理',
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('提交反馈失败:', error)
    return NextResponse.json({ error: '提交反馈失败' }, { status: 500 })
  }
}
