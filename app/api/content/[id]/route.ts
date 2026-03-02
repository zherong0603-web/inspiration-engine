import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const content = await prisma.content.findFirst({
      where: {
        id,
        userId: user.id, // 确保只能访问自己的内容
      },
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, category, type, content, transcript, tags, metadata } = body

    // 确保只能更新自己的内容
    const result = await prisma.content.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        title,
        category,
        type,
        content,
        transcript,
        tags: JSON.stringify(tags || []),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    const updatedContent = await prisma.content.findUnique({
      where: { id },
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    // 确保只能删除自己的内容
    const result = await prisma.content.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
