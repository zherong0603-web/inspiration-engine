import { prisma } from '../lib/prisma'

async function main() {
  console.log('开始初始化默认分类和类型...')

  // 创建默认分类
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
      console.log(`✓ 创建分类: ${category.name}`)
    } else {
      console.log(`- 分类已存在: ${category.name}`)
    }
  }

  // 创建默认类型
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
      console.log(`✓ 创建类型: ${type.name}`)
    } else {
      console.log(`- 类型已存在: ${type.name}`)
    }
  }

  console.log('初始化完成！')
}

main()
  .catch((e) => {
    console.error('初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
