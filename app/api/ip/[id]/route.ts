import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取单个 IP
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

    const profile = await prisma.iPProfile.findFirst({
      where: {
        id,
        userId: user.id, // 确保只能访问自己的 IP
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'IP profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching IP profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IP profile' },
      { status: 500 }
    )
  }
}

// 更新 IP
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
    const { name, description, persona, style, topics } = body

    // 确保只能更新自己的 IP
    const profile = await prisma.iPProfile.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        name,
        description,
        persona,
        style,
        topics: JSON.stringify(topics),
      },
    })

    if (profile.count === 0) {
      return NextResponse.json(
        { error: 'IP profile not found or unauthorized' },
        { status: 404 }
      )
    }

    // 返回更新后的数据
    const updated = await prisma.iPProfile.findUnique({
      where: { id },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating IP profile:', error)
    return NextResponse.json(
      { error: 'Failed to update IP profile' },
      { status: 500 }
    )
  }
}

// 删除 IP
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

    // 确保只能删除自己的 IP
    const result = await prisma.iPProfile.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'IP profile not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting IP profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete IP profile' },
      { status: 500 }
    )
  }
}
