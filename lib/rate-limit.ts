// 简单的内存限流器（生产环境建议使用 Redis）
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// 清理过期记录
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // 每分钟清理一次

export interface RateLimitConfig {
  interval: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const record = store[identifier]

  if (!record || record.resetTime < now) {
    // 创建新记录
    store[identifier] = {
      count: 1,
      resetTime: now + config.interval,
    }
    return true
  }

  if (record.count >= config.maxRequests) {
    // 超过限制
    return false
  }

  // 增加计数
  record.count++
  return true
}

export function getRateLimitInfo(identifier: string) {
  const record = store[identifier]
  if (!record) {
    return { count: 0, remaining: 0, resetTime: 0 }
  }

  return {
    count: record.count,
    remaining: Math.max(0, record.count),
    resetTime: record.resetTime,
  }
}

// 预设的限流配置
export const RATE_LIMITS = {
  // AI 生成：每分钟 5 次
  AI_GENERATE: {
    interval: 60 * 1000,
    maxRequests: 5,
  },
  // 登录：每分钟 5 次
  LOGIN: {
    interval: 60 * 1000,
    maxRequests: 5,
  },
  // 注册：每小时 3 次
  REGISTER: {
    interval: 60 * 60 * 1000,
    maxRequests: 3,
  },
  // 反馈提交：每小时 10 次
  FEEDBACK: {
    interval: 60 * 60 * 1000,
    maxRequests: 10,
  },
  // 一般 API：每分钟 30 次
  GENERAL: {
    interval: 60 * 1000,
    maxRequests: 30,
  },
}
