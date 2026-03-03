import { prisma } from '../lib/db'
import { hashPassword, generateInviteCode } from '../lib/auth'


async function main() {
  console.log('🌱 开始添加示例数据...')

  // 1. 创建演示账号
  console.log('📝 创建演示账号...')
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashPassword('demo123456'),
      name: '演示账号',
      inviteCode: generateInviteCode(),
      isActive: true,
    },
  })
  console.log('✅ 演示账号创建成功:', demoUser.email)

  // 2. 创建 IP 身份
  console.log('📝 创建 IP 身份...')
  const ipProfile = await prisma.iPProfile.upsert({
    where: { id: 'demo-ip-1' },
    update: {},
    create: {
      id: 'demo-ip-1',
      userId: demoUser.id,
      name: '职场小王',
      description: '专注职场干货分享，帮助职场人快速成长',
      persona: '性格：真诚、专业、接地气\n价值观：实用主义，相信方法论\n说话风格：口语化但不失专业，喜欢用具体案例',
      style: '干货型、实用型、案例型',
      topics: JSON.stringify(['职场技能', '沟通技巧', '时间管理', '职业规划']),
    },
  })
  console.log('✅ IP 身份创建成功:', ipProfile.name)

  // 3. 创建示例内容
  console.log('📝 创建示例内容...')
  const contents = [
    {
      title: '如何在职场中高效沟通',
      category: '职场',
      type: '视频',
      content: `职场沟通的三个黄金法则：
1. 结论先行：先说结论，再说理由
2. 数据支撑：用数据说话，增加说服力
3. 换位思考：站在对方角度考虑问题

举个例子，向老板汇报工作时：
❌ 错误：我这周做了很多事情，首先...然后...最后...
✅ 正确：本周完成3个项目，超额20%，遇到1个问题需要支持

这样的沟通方式，能让对方快速抓住重点，提高沟通效率。`,
      tags: JSON.stringify(['职场沟通', '汇报技巧', '高效工作']),
    },
    {
      title: '时间管理的四象限法则',
      category: '职场',
      type: '文章',
      content: `把所有任务分为四类：
1. 重要且紧急：立即做（危机处理）
2. 重要不紧急：计划做（长期目标）
3. 紧急不重要：委托做（琐碎事务）
4. 不重要不紧急：不做（时间黑洞）

80%的人都在做第1和第3类任务，但真正拉开差距的是第2类。
每天至少花1小时在重要不紧急的事情上，比如学习、规划、锻炼。`,
      tags: JSON.stringify(['时间管理', '效率提升', '个人成长']),
    },
    {
      title: '新人如何快速融入团队',
      category: '职场',
      type: '视频',
      content: `入职前3个月的黄金期：
第1周：观察学习，多问少说
第2-4周：主动承担，展现价值
第2-3月：建立关系，找到定位

具体做法：
- 主动请教：不懂就问，但要带着思考
- 记录总结：每天写工作日志
- 提前交付：deadline前1天完成
- 帮助他人：力所能及地帮助同事`,
      tags: JSON.stringify(['职场新人', '团队协作', '职场适应']),
    },
  ]

  for (const content of contents) {
    await prisma.content.create({
      data: {
        userId: demoUser.id,
        ...content,
      },
    })
  }
  console.log(`✅ 创建了 ${contents.length} 条示例内容`)

  // 4. 创建示例选题
  console.log('📝 创建示例选题...')
  const topics = [
    {
      title: '职场中如何优雅地拒绝别人',
      description: '教大家如何在不得罪人的情况下，合理拒绝不合理的要求',
      category: '职场',
      platform: '抖音',
      aiScore: 85,
      angles: JSON.stringify([
        '从心理学角度：拒绝的艺术',
        '从实战案例：3个拒绝话术模板',
        '从职场规则：什么该接什么该拒',
      ]),
      bestTime: '工作日晚上8-10点',
      expectedViews: '10万-50万',
    },
    {
      title: '年轻人该不该考公务员',
      description: '分析体制内外的优劣势，帮助年轻人做出理性选择',
      category: '职场',
      platform: '小红书',
      aiScore: 78,
      angles: JSON.stringify([
        '从收入角度：长期vs短期',
        '从发展角度：稳定vs成长',
        '从生活角度：平衡vs拼搏',
      ]),
      bestTime: '周末下午2-4点',
      expectedViews: '5万-20万',
    },
  ]

  for (const topic of topics) {
    await prisma.topicIdea.create({
      data: {
        userId: demoUser.id,
        ...topic,
      },
    })
  }
  console.log(`✅ 创建了 ${topics.length} 条示例选题`)

  // 5. 创建默认分类
  console.log('📝 创建默认分类...')
  const categories = [
    { name: '职场', color: '#3b82f6', icon: '💼', order: 0 },
    { name: '生活', color: '#10b981', icon: '🏠', order: 1 },
    { name: '情感', color: '#f59e0b', icon: '❤️', order: 2 },
    { name: '知识', color: '#8b5cf6', icon: '📚', order: 3 },
    { name: '其他', color: '#6b7280', icon: '📝', order: 4 },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
  console.log(`✅ 创建了 ${categories.length} 个默认分类`)

  // 6. 创建默认内容类型
  console.log('📝 创建默认内容类型...')
  const contentTypes = [
    { name: '视频', icon: '🎬', order: 0 },
    { name: '文章', icon: '📄', order: 1 },
    { name: '笔记', icon: '📝', order: 2 },
    { name: '图文', icon: '🖼️', order: 3 },
  ]

  for (const type of contentTypes) {
    await prisma.contentType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    })
  }
  console.log(`✅ 创建了 ${contentTypes.length} 个默认内容类型`)

  console.log('\n🎉 示例数据添加完成！')
  console.log('\n📌 演示账号信息：')
  console.log('   邮箱: demo@example.com')
  console.log('   密码: demo123456')
  console.log('\n💡 提示：新用户可以使用此账号体验完整功能')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
