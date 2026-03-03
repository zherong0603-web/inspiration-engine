import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // TODO: 添加管理员权限检查
    // 暂时允许所有登录用户查看（后续可以添加 isAdmin 字段）

    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('获取反馈失败:', error)
    return NextResponse.json({ error: '获取反馈失败' }, { status: 500 })
  }
}
