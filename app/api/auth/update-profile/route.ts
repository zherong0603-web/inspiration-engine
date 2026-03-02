import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { email, phone, name } = body

    const updateData: any = {}

    // 验证邮箱格式
    if (email !== undefined) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
      }
      // 检查邮箱是否已被使用
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: user.id } },
      })
      if (existingUser) {
        return NextResponse.json({ error: '该邮箱已被使用' }, { status: 400 })
      }
      updateData.email = email
    }

    // 验证手机号格式
    if (phone !== undefined) {
      if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
        return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
      }
      // 检查手机号是否已被使用
      if (phone) {
        const existingUser = await prisma.user.findFirst({
          where: { phone, id: { not: user.id } },
        })
        if (existingUser) {
          return NextResponse.json({ error: '该手机号已被使用' }, { status: 400 })
        }
      }
      updateData.phone = phone || null
    }

    if (name !== undefined) {
      updateData.name = name || null
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        name: updatedUser.name,
      },
    })
  } catch (error) {
    console.error('更新资料失败:', error)
    return NextResponse.json({ error: '更新资料失败' }, { status: 500 })
  }
}
