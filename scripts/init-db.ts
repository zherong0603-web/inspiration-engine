import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({
  adapter,
})

// 简单的密码加密（与 lib/auth.ts 中的方法一致）
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

// 生成随机邀请码
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function main() {
  console.log('🚀 开始初始化数据库...')

  // 检查是否已有用户
  const userCount = await prisma.user.count()

  if (userCount > 0) {
    console.log(`✓ 数据库中已有 ${userCount} 个用户`)

    // 显示所有用户的邀请码
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        inviteCode: true,
      }
    })

    console.log('\n📋 现有用户邀请码：')
    users.forEach(user => {
      console.log(`  - ${user.name || user.email}: ${user.inviteCode || '未生成'}`)
    })

    // 为没有邀请码的用户生成邀请码
    for (const user of users) {
      if (!user.inviteCode) {
        const inviteCode = generateInviteCode()
        await prisma.user.update({
          where: { email: user.email },
          data: { inviteCode }
        })
        console.log(`  ✓ 为 ${user.email} 生成邀请码: ${inviteCode}`)
      }
    }

    return
  }

  // 创建初始管理员用户
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  const adminInviteCode = generateInviteCode()

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashPassword(adminPassword),
      name: '管理员',
      inviteCode: adminInviteCode,
      isActive: true,
    }
  })

  console.log('\n✅ 初始化完成！')
  console.log('\n📧 管理员账号信息：')
  console.log(`  邮箱: ${adminEmail}`)
  console.log(`  密码: ${adminPassword}`)
  console.log(`  邀请码: ${adminInviteCode}`)
  console.log('\n💡 使用此邀请码注册新用户，或使用管理员账号登录后在"邀请好友"页面查看邀请码')
  console.log('\n⚠️  请及时修改管理员密码！')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
