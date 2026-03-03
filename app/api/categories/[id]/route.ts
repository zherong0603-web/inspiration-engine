import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 更新分类（需要登录）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, color, icon, order } = body

    const category = await prisma.category.update({
      where: { id },
      data: { name, color, icon, order },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// 删除分类（需要登录）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
