import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const creations = await prisma.creation.findMany({
      where: { userId: user.id }, // 只查询当前用户的创作历史
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(creations)
  } catch (error) {
    console.error('Error fetching creations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creations' },
      { status: 500 }
    )
  }
}
