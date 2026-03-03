import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取所有内容类型（所有用户可访问）
export async function GET() {
  try {
    const types = await prisma.contentType.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(types)
  } catch (error) {
    console.error('Failed to fetch content types:', error)
    return NextResponse.json({ error: 'Failed to fetch content types' }, { status: 500 })
  }
}

// 创建新内容类型（需要登录）
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon } = body

    // 获取当前最大的 order 值
    const maxOrder = await prisma.contentType.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const type = await prisma.contentType.create({
      data: {
        name,
        icon,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(type)
  } catch (error) {
    console.error('Failed to create content type:', error)
    return NextResponse.json({ error: 'Failed to create content type' }, { status: 500 })
  }
}
