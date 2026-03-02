import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取当前用户的所有 IP 列表
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const profiles = await prisma.iPProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching IP profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IP profiles' },
      { status: 500 }
    )
  }
}
