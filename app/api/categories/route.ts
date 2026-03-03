import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取所有分类（所有用户可访问）
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// 创建新分类（需要登录）
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color, icon } = body

    // 获取当前最大的 order 值
    const maxOrder = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
