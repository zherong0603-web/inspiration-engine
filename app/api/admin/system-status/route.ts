import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查是否是管理员
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    const isAdmin = user.id === firstUser?.id || user.email === 'demo@example.com'

    if (!isAdmin) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    // 获取系统状态
    const [
      userCount,
      contentCount,
      topicCount,
      creationCount,
      feedbackCount,
      ipProfileCount,
      activityLogCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
      prisma.topicIdea.count(),
      prisma.creation.count(),
      prisma.feedback.count(),
      prisma.iPProfile.count(),
      prisma.activityLog.count(),
    ])

    // 获取最近的用户
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isActive: true,
      },
    })

    // 获取数据库文件信息（仅开发环境）
    const dbInfo = {
      type: 'SQLite',
      file: 'dev.db',
      note: '生产环境建议使用 PostgreSQL',
    }

    // 检查环境变量
    const envCheck = {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json({
      counts: {
        users: userCount,
        contents: contentCount,
        topics: topicCount,
        creations: creationCount,
        feedbacks: feedbackCount,
        ipProfiles: ipProfileCount,
        activityLogs: activityLogCount,
      },
      recentUsers,
      database: dbInfo,
      environment: envCheck,
    })
  } catch (error) {
    console.error('获取系统状态失败:', error)
    return NextResponse.json({ error: '获取系统状态失败' }, { status: 500 })
  }
}
