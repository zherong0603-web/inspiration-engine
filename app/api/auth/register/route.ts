import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateInviteCode, setUserSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, inviteCode } = body

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 如果提供了邀请码，验证邀请码
    let invitedBy = null
    if (inviteCode) {
      // 查找邀请码对应的用户
      const inviter = await prisma.user.findUnique({
        where: { inviteCode: inviteCode.toUpperCase() },
      })

      if (!inviter) {
        return NextResponse.json(
          { error: '邀请码无效' },
          { status: 400 }
        )
      }

      invitedBy = inviteCode.toUpperCase()
    }

    // 为新用户生成唯一的邀请码
    let newUserInviteCode = generateInviteCode()
    let codeExists = await prisma.user.findUnique({
      where: { inviteCode: newUserInviteCode }
    })

    // 确保邀请码唯一
    while (codeExists) {
      newUserInviteCode = generateInviteCode()
      codeExists = await prisma.user.findUnique({
        where: { inviteCode: newUserInviteCode }
      })
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name: name || email.split('@')[0],
        inviteCode: newUserInviteCode,
        invitedBy,
      },
    })

    // 设置 session
    await setUserSession(user.id)

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
    console.error('注册失败:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
