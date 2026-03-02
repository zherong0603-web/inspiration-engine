import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '请提供当前密码和新密码' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码至少需要6个字符' }, { status: 400 })
    }

    // 验证当前密码
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, dbUser.password)) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
    }

    // 更新密码
    const hashedPassword = hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 })
  }
}
