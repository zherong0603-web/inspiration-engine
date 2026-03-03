import { prisma } from './db'
import { NextRequest } from 'next/server'

interface LogOptions {
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: any
  duration?: number
  status?: 'success' | 'error'
  error?: string
  request?: NextRequest
}

export async function logActivity(options: LogOptions) {
  try {
    const { userId, action, resource, resourceId, metadata, duration, status, error, request } = options

    // 从请求中提取 IP 和 User-Agent
    let ip: string | undefined
    let userAgent: string | undefined

    if (request) {
      ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      userAgent = request.headers.get('user-agent') || undefined
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip,
        userAgent,
        duration,
        status: status || 'success',
        error,
      },
    })
  } catch (err) {
    // 日志记录失败不应该影响主流程
    console.error('记录活动日志失败:', err)
  }
}

// 便捷方法
export const logger = {
  // 用户登录
  login: (userId: string, request?: NextRequest) =>
    logActivity({ userId, action: 'login', request }),

  // 创建内容
  createContent: (userId: string, contentId: string, request?: NextRequest) =>
    logActivity({ userId, action: 'create_content', resource: 'content', resourceId: contentId, request }),

  // AI 生成
  aiGenerate: (userId: string, type: string, duration?: number, request?: NextRequest) =>
    logActivity({ userId, action: 'ai_generate', metadata: { type }, duration, request }),

  // 查看页面
  viewPage: (userId: string | undefined, page: string, request?: NextRequest) =>
    logActivity({ userId, action: 'view_page', metadata: { page }, request }),

  // 创建选题
  createTopic: (userId: string, topicId: string, request?: NextRequest) =>
    logActivity({ userId, action: 'create_topic', resource: 'topic', resourceId: topicId, request }),

  // 提交反馈
  submitFeedback: (userId: string | undefined, feedbackId: string, request?: NextRequest) =>
    logActivity({ userId, action: 'submit_feedback', resource: 'feedback', resourceId: feedbackId, request }),

  // 错误日志
  error: (userId: string | undefined, action: string, error: string, request?: NextRequest) =>
    logActivity({ userId, action, status: 'error', error, request }),
}
