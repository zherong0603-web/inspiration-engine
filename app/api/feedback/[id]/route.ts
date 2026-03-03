import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 获取单个反馈详情
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
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        userId: user.id, // 只能查看自己的反馈
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: '反馈不存在' }, { status: 404 })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('获取反馈详情失败:', error)
    return NextResponse.json({ error: '获取反馈详情失败' }, { status: 500 })
  }
}

// 删除反馈（只能删除自己的）
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
    const result = await prisma.feedback.deleteMany({
      where: {
        id,
        userId: user.id, // 只能删除自己的反馈
      },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: '反馈不存在或无权限' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除反馈失败:', error)
    return NextResponse.json({ error: '删除反馈失败' }, { status: 500 })
  }
}
