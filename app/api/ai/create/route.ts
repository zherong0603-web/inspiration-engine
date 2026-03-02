import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContent } from '@/lib/ai'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ipId, sourceIds, prompt: userPrompt } = body

    console.log('📝 创作请求:', { ipId, sourceIds, promptLength: userPrompt?.length })

    // Fetch specified IP profile or fallback to first one (限制为当前用户)
    let ipProfile
    if (ipId) {
      ipProfile = await prisma.iPProfile.findFirst({
        where: {
          id: ipId,
          userId: user.id,
        },
      })
    }

    if (!ipProfile) {
      ipProfile = await prisma.iPProfile.findFirst({
        where: { userId: user.id },
      })
    }

    if (!ipProfile) {
      console.error('❌ IP Profile 未设置')
      return NextResponse.json(
        { error: 'Please set up your IP profile first' },
        { status: 400 }
      )
    }

    console.log('✅ IP Profile 已加载:', ipProfile.name)

    // Fetch source contents (限制为当前用户的内容)
    const sourceContents = await prisma.content.findMany({
      where: {
        id: { in: sourceIds },
        userId: user.id,
      },
    })

    console.log('✅ 参考内容已加载:', sourceContents.length, '条')

    // Build AI prompt
    const prompt = `你是 ${ipProfile.name} 的内容创作助手。

IP 人设：
${ipProfile.persona}

内容风格：${ipProfile.style}

${sourceContents.length > 0 ? `参考内容：
${sourceContents.map((c, i) => `${i + 1}. ${c.title}\n${c.content}`).join('\n\n')}` : '本次为全新创作，无参考内容。'}

创作要求：
${userPrompt}

请基于以上信息，创作一个符合 IP 形象的短视频内容脚本。`

    console.log('🤖 开始调用 AI API...')

    // Generate content
    const result = await generateContent({ prompt })

    console.log('✅ AI 生成成功，长度:', result.length)

    // Save creation record (关联当前用户)
    const creation = await prisma.creation.create({
      data: {
        userId: user.id,
        sourceIds: JSON.stringify(sourceIds),
        prompt: userPrompt,
        result,
        type: '二创',
        status: '草稿',
      },
    })

    console.log('✅ 创作记录已保存:', creation.id)

    return NextResponse.json({ result, creationId: creation.id })
  } catch (error) {
    console.error('❌ 创作内容时出错:', error)
    console.error('错误详情:', error instanceof Error ? error.message : error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { error: 'Failed to create content', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
