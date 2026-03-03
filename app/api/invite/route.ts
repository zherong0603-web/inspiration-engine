import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 生成随机邀请码
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉容易混淆的字符
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 获取我的邀请码
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 如果用户还没有邀请码，生成一个
    if (!user.inviteCode) {
      let inviteCode = generateInviteCode()

      // 确保邀请码唯一
      let exists = await prisma.user.findUnique({
        where: { inviteCode }
      })

      while (exists) {
        inviteCode = generateInviteCode()
        exists = await prisma.user.findUnique({
          where: { inviteCode }
        })
      }

      // 更新用户的邀请码
      await prisma.user.update({
        where: { id: user.id },
        data: { inviteCode }
      })

      return NextResponse.json({ inviteCode })
    }

    return NextResponse.json({ inviteCode: user.inviteCode })
  } catch (error) {
    console.error('获取邀请码失败:', error)
    return NextResponse.json({ error: '获取邀请码失败' }, { status: 500 })
  }
}

// 验证邀请码是否有效
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: '请输入邀请码' }, { status: 400 })
    }

    // 查找邀请码对应的用户
    const inviter = await prisma.user.findUnique({
      where: { inviteCode: code.toUpperCase() },
      select: { id: true, name: true, email: true }
    })

    if (!inviter) {
      return NextResponse.json({ error: '邀请码无效' }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      inviter: {
        name: inviter.name || inviter.email.split('@')[0]
      }
    })
  } catch (error) {
    console.error('验证邀请码失败:', error)
    return NextResponse.json({ error: '验证邀请码失败' }, { status: 500 })
  }
}
