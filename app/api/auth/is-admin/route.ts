import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ isAdmin: false })
    }

    // 临时方案：第一个注册的用户是管理员
    // 或者邮箱是 demo@example.com 的用户
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    const isAdmin = user.id === firstUser?.id || user.email === 'demo@example.com'

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('检查管理员权限失败:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
