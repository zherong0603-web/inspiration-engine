import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 管理员邮箱列表
const ADMIN_EMAILS = ['admin@example.com']

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  return user && ADMIN_EMAILS.includes(user.email)
}

// 更新反馈（回复、更新状态）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查是否是管理员
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { reply, status } = body

    const updateData: any = {}
    if (reply !== undefined) updateData.reply = reply
    if (status !== undefined) updateData.status = status

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('更新反馈失败:', error)
    return NextResponse.json({ error: '更新反馈失败' }, { status: 500 })
  }
}
