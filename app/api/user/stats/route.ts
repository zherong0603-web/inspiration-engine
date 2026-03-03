import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户的个人数据统计
    const [contentCount, topicCount, creationCount, ipProfileCount] = await Promise.all([
      prisma.content.count({ where: { userId: user.id } }),
      prisma.topicIdea.count({ where: { userId: user.id } }),
      prisma.creation.count({ where: { userId: user.id } }),
      prisma.iPProfile.count({ where: { userId: user.id } }),
    ])

    return NextResponse.json({
      contentCount,
      topicCount,
      creationCount,
      ipProfileCount,
    })
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
