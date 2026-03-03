import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const credits = await getUserCredits(user.id)

    return NextResponse.json({ credits })
  } catch (error) {
    console.error('获取积分失败:', error)
    return NextResponse.json({ error: '获取积分失败' }, { status: 500 })
  }
}
