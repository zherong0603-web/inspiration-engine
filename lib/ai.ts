export interface GenerateContentOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
}

export async function generateContent({
  prompt,
  maxTokens = 4096,
  temperature = 1,
}: GenerateContentOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  // 强制使用配置的 baseURL，忽略系统代理
  const baseURL = 'https://hone.vvvv.ee'

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  console.log('🔗 API 配置:', { baseURL, hasKey: !!apiKey })

  try {
    const url = `${baseURL}/v1/messages`
    console.log('📡 请求 URL:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    console.log('📥 响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 错误响应:', errorText)
      throw new Error(`API request failed: ${response.status} ${errorText}`)
    }

    const data: ClaudeResponse = await response.json()
    console.log('✅ API 响应成功，内容长度:', data.content[0]?.text?.length || 0)

    const textContent = data.content.find((block) => block.type === 'text')
    return textContent?.text || ''
  } catch (error) {
    console.error('❌ Claude API Error:', error)
    if (error instanceof Error) {
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    throw new Error('Failed to generate content')
  }
}

export async function* streamContent({
  prompt,
  maxTokens = 4096,
  temperature = 1,
}: GenerateContentOptions): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  // 强制使用配置的 baseURL，忽略系统代理
  const baseURL = 'https://hone.vvvv.ee'

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  try {
    const url = `${baseURL}/v1/messages`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Claude API Stream Error:', error)
    throw new Error('Failed to stream content')
  }
}
