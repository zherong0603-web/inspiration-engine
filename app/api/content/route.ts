import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {
      userId: user.id, // 只查询当前用户的内容
    }
    if (category && category !== 'all') {
      where.category = category
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        type: true,
        tags: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
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
    const { title, category, type, content, transcript, tags, metadata } = body

    const newContent = await prisma.content.create({
      data: {
        userId: user.id, // 关联当前用户
        title,
        category,
        type,
        content,
        transcript,
        tags: JSON.stringify(tags || []),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json(newContent)
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
