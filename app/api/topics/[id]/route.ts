import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取单个选题
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const topic = await prisma.topicIdea.findFirst({
      where: { id, userId: user.id },
    })

    if (!topic) {
      return NextResponse.json({ error: '选题不存在' }, { status: 404 })
    }

    return NextResponse.json(topic)
  } catch (error) {
    console.error('获取选题失败:', error)
    return NextResponse.json({ error: '获取选题失败' }, { status: 500 })
  }
}

// 更新选题
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      category,
      platform,
      status,
      aiScore,
      angles,
      bestTime,
      expectedViews
    } = body

    const updateData: any = {}

    // 只更新提供的字段
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (platform !== undefined) updateData.platform = platform
    if (status !== undefined) updateData.status = status
    if (aiScore !== undefined) updateData.aiScore = aiScore
    if (angles !== undefined) updateData.angles = JSON.stringify(angles)
    if (bestTime !== undefined) updateData.bestTime = bestTime
    if (expectedViews !== undefined) updateData.expectedViews = expectedViews

    const result = await prisma.topicIdea.updateMany({
      where: { id, userId: user.id },
      data: updateData,
    })

    if (result.count === 0) {
      return NextResponse.json({ error: '选题不存在或无权限' }, { status: 404 })
    }

    const updated = await prisma.topicIdea.findUnique({ where: { id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('更新选题失败:', error)
    return NextResponse.json({ error: '更新选题失败' }, { status: 500 })
  }
}

// 删除选题
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const result = await prisma.topicIdea.deleteMany({
      where: { id, userId: user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: '选题不存在或无权限' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除选题失败:', error)
    return NextResponse.json({ error: '删除选题失败' }, { status: 500 })
  }
}
