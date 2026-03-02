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

    const profile = await prisma.iPProfile.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching IP profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IP profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, persona, style, topics } = body

    // 创建新的 IP profile，关联当前用户
    const profile = await prisma.iPProfile.create({
      data: {
        userId: user.id,
        name,
        description,
        persona,
        style,
        topics: JSON.stringify(topics),
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error saving IP profile:', error)
    return NextResponse.json(
      { error: 'Failed to save IP profile' },
      { status: 500 }
    )
  }
}
