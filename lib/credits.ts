import { prisma } from './db'

// 积分消耗规则
export const CREDIT_COSTS = {
  AI_GENERATE: 10,        // AI 生成内容
  TOPIC_EVALUATE: 5,      // 选题评估
  CONTENT_ANALYZE: 3,     // 内容分析
}

// 检查用户积分是否足够
export async function checkCredits(userId: string, cost: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  if (!user) return false
  return (user.credits || 0) >= cost
}

// 扣除积分
export async function deductCredits(userId: string, cost: number, reason: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user || (user.credits || 0) < cost) {
      return false
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: (user.credits || 0) - cost },
    })

    // 记录积分变动日志
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'credit_deduct',
        metadata: JSON.stringify({ cost, reason, remaining: (user.credits || 0) - cost }),
      },
    })

    return true
  } catch (error) {
    console.error('扣除积分失败:', error)
    return false
  }
}

// 增加积分
export async function addCredits(userId: string, amount: number, reason: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user) return false

    await prisma.user.update({
      where: { id: userId },
      data: { credits: (user.credits || 0) + amount },
    })

    // 记录积分变动日志
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'credit_add',
        metadata: JSON.stringify({ amount, reason, remaining: (user.credits || 0) + amount }),
      },
    })

    return true
  } catch (error) {
    console.error('增加积分失败:', error)
    return false
  }
}

// 获取用户积分
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  return user?.credits || 0
}
