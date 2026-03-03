import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

// 生成邀请码
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function main() {
  console.log('🚀 开始完整初始化...\n')

  // 1. 初始化默认分类
  console.log('📁 初始化默认分类...')
  const defaultCategories = [
    { name: '职场', icon: '💼', order: 0 },
    { name: '家庭', icon: '🏠', order: 1 },
    { name: '生活', icon: '🌟', order: 2 },
    { name: '学习', icon: '📚', order: 3 },
    { name: '其他', icon: '📌', order: 4 },
  ]

  for (const category of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    })

    if (!existing) {
      await prisma.category.create({ data: category })
      console.log(`  ✓ 创建分类: ${category.name}`)
    } else {
      console.log(`  - 分类已存在: ${category.name}`)
    }
  }

  // 2. 初始化默认内容类型
  console.log('\n📝 初始化默认内容类型...')
  const defaultTypes = [
    { name: '视频', icon: '🎬', order: 0 },
    { name: '文章', icon: '📝', order: 1 },
    { name: '笔记', icon: '📖', order: 2 },
    { name: '想法', icon: '💡', order: 3 },
  ]

  for (const type of defaultTypes) {
    const existing = await prisma.contentType.findUnique({
      where: { name: type.name },
    })

    if (!existing) {
      await prisma.contentType.create({ data: type })
      console.log(`  ✓ 创建类型: ${type.name}`)
    } else {
      console.log(`  - 类型已存在: ${type.name}`)
    }
  }

  // 3. 创建管理员账号
  console.log('\n👤 初始化管理员账号...')
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const adminInviteCode = generateInviteCode()
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashPassword(adminPassword),
        name: '管理员',
        inviteCode: adminInviteCode,
      },
    })

    console.log(`  ✓ 创建管理员账号`)
    console.log(`  📧 邮箱: ${adminEmail}`)
    console.log(`  🔑 密码: ${adminPassword}`)
    console.log(`  🎫 邀请码: ${adminInviteCode}`)
  } else {
    console.log(`  - 管理员账号已存在`)
    console.log(`  📧 邮箱: ${adminEmail}`)
    console.log(`  🎫 邀请码: ${existingAdmin.inviteCode}`)
  }

  console.log('\n✅ 初始化完成！')
  console.log('\n📌 下一步:')
  console.log('  1. 确保 .env 文件中配置了 ADMIN_EMAILS=admin@example.com')
  console.log('  2. 运行 npm run dev 启动开发服务器')
  console.log('  3. 访问 http://localhost:3009 开始使用')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
