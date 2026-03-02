import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始初始化邀请码...')

  // 创建10个初始邀请码
  const inviteCodes = [
    'WELCOME1',
    'WELCOME2',
    'WELCOME3',
    'WELCOME4',
    'WELCOME5',
    'BETA2026',
    'CREATOR1',
    'CREATOR2',
    'CREATOR3',
    'CREATOR4',
  ]

  for (const code of inviteCodes) {
    try {
      await prisma.inviteCode.create({
        data: {
          code,
          isUsed: false,
        },
      })
      console.log(`✅ 创建邀请码: ${code}`)
    } catch (error) {
      console.log(`⚠️  邀请码 ${code} 已存在，跳过`)
    }
  }

  console.log('✨ 邀请码初始化完成！')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
