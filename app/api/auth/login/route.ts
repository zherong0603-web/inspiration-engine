import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, setUserSession } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // 限流检查
  const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  if (!rateLimit(identifier, RATE_LIMITS.LOGIN)) {
    console.log('登录限流触发:', identifier)
    return NextResponse.json(
      { error: '登录尝试过于频繁，请稍后再试' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = body

    console.log('登录尝试:', { email, passwordLength: password?.length })

    // 验证必填字段
    if (!email || !password) {
      console.log('缺少必填字段')
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
      console.log('用户不存在:', email)
      return NextResponse.json(
        { error: '邮箱/手机号或密码错误' },
        { status: 401 }
      )
    }

    console.log('找到用户:', { id: user.id, email: user.email })

    // 验证密码
    const passwordMatch = verifyPassword(password, user.password)
    console.log('密码验证:', { match: passwordMatch, hashedPassword: user.password })

    if (!passwordMatch) {
      console.log('密码错误')
      return NextResponse.json(
        { error: '邮箱/手机号或密码错误' },
        { status: 401 }
      )
    }

    // 检查账号是否激活
    if (!user.isActive) {
      console.log('账号未激活')
      return NextResponse.json(
        { error: '账号已被禁用' },
        { status: 403 }
      )
    }

    // 设置 session
    await setUserSession(user.id)
    console.log('登录成功:', user.id)

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
    console.error('登录失败 - 详细错误:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
