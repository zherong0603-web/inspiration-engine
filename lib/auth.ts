import { cookies } from 'next/headers'
import { prisma } from './db'

// 简单的密码加密（生产环境建议使用 bcrypt）
export function hashPassword(password: string): string {
  // 这里使用简单的 base64 编码，生产环境应该使用 bcrypt
  return Buffer.from(password).toString('base64')
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}

// 生成随机邀请码
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 设置用户 session
export async function setUserSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  })
}

// 获取当前用户
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        inviteCode: true,
        isActive: true,
        createdAt: true,
      },
    })

    return user
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

// 清除用户 session
export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
}

// 检查用户是否已登录
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('未登录')
  }
  return user
}
