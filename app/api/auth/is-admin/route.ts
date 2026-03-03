import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ isAdmin: false })
    }

    const userWithEmail = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true }
    })

    const isAdmin = userWithEmail && isAdminEmail(userWithEmail.email)
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('检查管理员权限失败:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
