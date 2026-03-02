import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 更新内容类型
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, icon, order } = body

    const type = await prisma.contentType.update({
      where: { id },
      data: { name, icon, order },
    })

    return NextResponse.json(type)
  } catch (error) {
    console.error('Failed to update content type:', error)
    return NextResponse.json({ error: 'Failed to update content type' }, { status: 500 })
  }
}

// 删除内容类型
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.contentType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content type:', error)
    return NextResponse.json({ error: 'Failed to delete content type' }, { status: 500 })
  }
}
