import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitConfig } from '../rate-limit'

export function withRateLimit(config: RateLimitConfig) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ) => {
    // 获取客户端标识（IP 或用户 ID）
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 检查限流
    if (!rateLimit(identifier, config)) {
      return NextResponse.json(
        {
          error: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil(config.interval / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(config.interval / 1000)),
          },
        }
      )
    }

    return handler(request)
  }
}
