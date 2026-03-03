import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 总体统计
    const totalUsers = await prisma.user.count()
    const totalContents = await prisma.content.count()
    const totalTopics = await prisma.topicIdea.count()
    const totalFeedbacks = await prisma.feedback.count()

    // 活跃用户（最近N天有登录）
    const activeUsers = await prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        action: 'login',
        createdAt: { gte: startDate },
        userId: { not: null },
      },
    })

    // 最受欢迎的功能
    const popularActions = await prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    })

    // AI 调用统计
    const aiCalls = await prisma.activityLog.count({
      where: {
        action: 'ai_generate',
        createdAt: { gte: startDate },
      },
    })

    // 平均 AI 响应时间
    const aiDurations = await prisma.activityLog.aggregate({
      where: {
        action: 'ai_generate',
        createdAt: { gte: startDate },
        duration: { not: null },
      },
      _avg: { duration: true },
    })

    // 每日活跃趋势
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(DISTINCT userId) as users,
        COUNT(*) as actions
      FROM ActivityLog
      WHERE createdAt >= ${startDate.toISOString()}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `

    return NextResponse.json({
      overview: {
        totalUsers,
        totalContents,
        totalTopics,
        totalFeedbacks,
        activeUsers: activeUsers.length,
        aiCalls,
        avgAiDuration: Math.round(aiDurations._avg.duration || 0),
      },
      popularActions: popularActions.map(a => ({
        action: a.action,
        count: a._count.action,
      })),
      dailyActivity,
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
