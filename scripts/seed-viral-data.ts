import { prisma } from '../lib/db'

async function seedViralCases() {
  console.log('🌱 开始添加爆款案例...')

  const cases = [
    {
      title: '职场新人如何快速融入团队',
      platform: '抖音',
      category: '职场',
      content: `【钩子】你知道吗？90%的职场新人都在第一个月犯这个错误

【问题】刚入职的时候，是不是总觉得自己格格不入？想融入团队，却不知道从哪里开始？

【方案】
第一，主动打招呼。每天早上见到同事，主动说"早上好"，这是最简单的破冰方式。

第二，多问多学。遇到不懂的，大方承认，虚心请教，没人会嘲笑爱学习的人。

第三，参加团建。公司组织的活动，一定要参加，这是快速拉近距离的最好机会。

【升华】记住，融入团队不是讨好所有人，而是让大家看到你的真诚和努力。

【CTA】如果对你有帮助，记得点赞收藏！`,
      viewCount: 1250000,
      likeCount: 85000,
      commentCount: 3200,
      shareCount: 12000,
      publishDate: new Date('2024-01-15'),
      tags: JSON.stringify(['职场', '新人', '团队融入']),
      structure: JSON.stringify({
        hook: '反常识数据',
        problem: '痛点共鸣',
        solution: '3个具体方法',
        value: '价值升华',
        cta: '点赞收藏'
      }),
      keyPoints: JSON.stringify(['数据钩子', '痛点场景', '具体可执行', '真诚态度'])
    },
    {
      title: '如何优雅地拒绝领导的不合理要求',
      platform: '小红书',
      category: '职场',
      content: `【钩子】领导让你周末加班，但你已经有安排了，怎么拒绝才不得罪人？

【问题】很多人遇到这种情况，要么硬着头皮答应，要么直接拒绝得罪领导。其实，有更好的方法。

【方案】
第一步，表达理解。"我理解这个项目很紧急"，先让领导知道你懂他的难处。

第二步，说明情况。"但我周末有个重要的家庭聚会，已经答应家人了"，给出合理的理由。

第三步，提供替代方案。"我可以周一早点来，或者今天晚上加个班把进度赶上"，展现你的责任心。

【升华】职场沟通的核心，不是拒绝，而是找到双赢的解决方案。

【CTA】学会了吗？点赞让更多人看到！`,
      viewCount: 980000,
      likeCount: 62000,
      commentCount: 2800,
      shareCount: 8500,
      publishDate: new Date('2024-02-20'),
      tags: JSON.stringify(['职场', '沟通', '拒绝技巧']),
      structure: JSON.stringify({
        hook: '场景化问题',
        problem: '两难困境',
        solution: '3步法',
        value: '沟通原则',
        cta: '点赞传播'
      }),
      keyPoints: JSON.stringify(['场景代入', '情感共鸣', '具体步骤', '双赢思维'])
    },
    {
      title: '3个让你效率翻倍的时间管理技巧',
      platform: '视频号',
      category: '知识',
      content: `【钩子】为什么别人一天能做完你三天的工作？秘密就在这3个技巧里。

【问题】是不是总觉得时间不够用？每天忙忙碌碌，却没什么成果？

【方案】
技巧一，番茄工作法。25分钟专注工作，5分钟休息，效率提升50%。

技巧二，二八法则。把80%的精力放在20%最重要的事情上，别被琐事拖累。

技巧三，时间块管理。把一天分成几个时间块，每个块只做一类事情，减少切换成本。

【升华】时间管理的本质，不是做更多事，而是做对的事。

【CTA】收藏起来，明天就开始实践！`,
      viewCount: 1580000,
      likeCount: 125000,
      commentCount: 4500,
      shareCount: 18000,
      publishDate: new Date('2024-03-01'),
      tags: JSON.stringify(['时间管理', '效率', '干货']),
      structure: JSON.stringify({
        hook: '对比冲击',
        problem: '效率焦虑',
        solution: '3个技巧',
        value: '本质思考',
        cta: '收藏实践'
      }),
      keyPoints: JSON.stringify(['数据对比', '痛点精准', '方法具体', '可执行性强'])
    }
  ]

  for (const caseData of cases) {
    await prisma.viralCase.create({ data: caseData })
    console.log(`✅ 已添加：${caseData.title}`)
  }

  console.log('✅ 爆款案例添加完成！')
}

async function seedIPTemplates() {
  console.log('🌱 开始添加 IP 模板...')

  const templates = [
    {
      name: '职场导师型',
      category: '职场',
      persona: '有10年职场经验的资深HR，擅长职场沟通和人际关系处理',
      style: '专业但不说教，像朋友一样给建议',
      successCase: '代表账号：@职场老王、@HR小姐姐',
      keyStrategy: '用真实案例+具体方法+温暖鼓励的方式，帮助职场新人成长',
      targetAudience: '22-30岁职场新人，面临职场困惑',
      contentThemes: JSON.stringify([
        '职场沟通技巧',
        '如何与领导相处',
        '职场礼仪',
        '升职加薪方法',
        '职场人际关系'
      ])
    },
    {
      name: '知识科普型',
      category: '知识',
      persona: '热爱分享的知识博主，把复杂的知识讲得通俗易懂',
      style: '轻松幽默，用生活化的例子解释专业知识',
      successCase: '代表账号：@半佛仙人、@罗翔说刑法',
      keyStrategy: '用故事+类比+金句的方式，让知识变得有趣又好记',
      targetAudience: '18-35岁，热爱学习的年轻人',
      contentThemes: JSON.stringify([
        '生活小知识',
        '科学原理',
        '历史故事',
        '心理学',
        '经济学常识'
      ])
    },
    {
      name: '情感陪伴型',
      category: '情感',
      persona: '温暖治愈的情感博主，善于倾听和共情',
      style: '温柔细腻，像闺蜜一样聊天',
      successCase: '代表账号：@张德芬空间、@武志红',
      keyStrategy: '用共情+故事+正能量的方式，给予情感支持和人生建议',
      targetAudience: '25-40岁，需要情感慰藉的都市人群',
      contentThemes: JSON.stringify([
        '情感困惑',
        '自我成长',
        '人生感悟',
        '心灵治愈',
        '关系处理'
      ])
    }
  ]

  for (const template of templates) {
    await prisma.iPTemplate.create({ data: template })
    console.log(`✅ 已添加：${template.name}`)
  }

  console.log('✅ IP 模板添加完成！')
}

async function seedScriptTemplates() {
  console.log('🌱 开始添加脚本模板...')

  const templates = [
    {
      name: '知识科普型脚本',
      type: '知识科普',
      structure: JSON.stringify({
        sections: [
          {
            name: '钩子',
            duration: '0-3秒',
            method: '反常识/数据冲击',
            example: '你知道吗？90%的人都不知道这个秘密'
          },
          {
            name: '问题',
            duration: '3-10秒',
            method: '痛点共鸣',
            example: '是不是经常遇到这种情况...'
          },
          {
            name: '知识点',
            duration: '10-40秒',
            method: '3个要点',
            example: '第一...第二...第三...'
          },
          {
            name: '总结',
            duration: '40-50秒',
            method: '价值升华',
            example: '记住，核心就是...'
          },
          {
            name: 'CTA',
            duration: '50-60秒',
            method: '行动召唤',
            example: '点赞收藏，下次不迷路'
          }
        ]
      }),
      example: '参考爆款案例库中的知识类内容',
      usageCount: 0,
      successRate: 0.75
    },
    {
      name: '干货清单型脚本',
      type: '干货清单',
      structure: JSON.stringify({
        sections: [
          {
            name: '钩子',
            duration: '0-3秒',
            method: '数字+利益',
            example: '3个方法让你效率翻倍'
          },
          {
            name: '方法1',
            duration: '3-15秒',
            method: '具体可执行',
            example: '第一个方法是...'
          },
          {
            name: '方法2',
            duration: '15-30秒',
            method: '具体可执行',
            example: '第二个方法是...'
          },
          {
            name: '方法3',
            duration: '30-45秒',
            method: '具体可执行',
            example: '第三个方法是...'
          },
          {
            name: 'CTA',
            duration: '45-60秒',
            method: '收藏实践',
            example: '收藏起来，明天就开始用'
          }
        ]
      }),
      example: '参考爆款案例库中的干货类内容',
      usageCount: 0,
      successRate: 0.82
    }
  ]

  for (const template of templates) {
    await prisma.scriptTemplate.create({ data: template })
    console.log(`✅ 已添加：${template.name}`)
  }

  console.log('✅ 脚本模板添加完成！')
}

async function main() {
  try {
    await seedViralCases()
    await seedIPTemplates()
    await seedScriptTemplates()
    console.log('\n🎉 所有数据初始化完成！')
  } catch (error) {
    console.error('❌ 初始化失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
