import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 管理员邮箱列表（可以配置到环境变量）
const ADMIN_EMAILS = ['admin@example.com']

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  return user && ADMIN_EMAILS.includes(user.email)
}

// 获取所有反馈（管理员）
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查是否是管理员
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('获取反馈失败:', error)
    return NextResponse.json({ error: '获取反馈失败' }, { status: 500 })
  }
}
