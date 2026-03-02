import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取所有分类
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

// 创建新分类
export async function POST(request: Request) {
  try {
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
