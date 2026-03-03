import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, setUserSession } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱/手机号和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找用户（支持邮箱或手机号登录）
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: email }, // 用户可能输入手机号
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '邮箱/手机号或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: '邮箱/手机号或密码错误' },
        { status: 401 }
      )
    }

    // 检查账号是否激活
    if (!user.isActive) {
      return NextResponse.json(
        { error: '账号已被禁用' },
        { status: 403 }
      )
    }

    // 设置 session
    await setUserSession(user.id)

    // 记录登录日志
    await logger.login(user.id, request)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        inviteCode: user.inviteCode,
      },
    })
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
