import axios from 'axios'
import toast from 'react-hot-toast'

// 创建axios实例
export const apiClient = axios.create({
  baseURL: '/',
  timeout: 60000, // 60秒超时，因为图像生成需要较长时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加loading状态
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message || '请求失败'
    console.error('API Error:', error.response?.data || error.message)
    toast.error(message)
    return Promise.reject(error)
  }
)

// API类型定义
export interface GenerateImageRequest {
  model: string
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  sampleStrength?: number
}

export interface GenerateImageResponse {
  created: number
  data: Array<{
    url: string
  }>
}

export interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  model: string
  object: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  created: number
}

export interface TokenCheckRequest {
  token: string
}

export interface TokenCheckResponse {
  live: boolean
}

export interface CreditsResponse {
  token: string
  points: {
    giftCredit: number
    purchaseCredit: number
    vipCredit: number
    totalCredit: number
  }
}

// API函数
export const api = {
  // 图像生成
  async generateImages(request: GenerateImageRequest, sessionid: string): Promise<GenerateImageResponse> {
    const response = await apiClient.post('/v1/images/generations', request, {
      headers: {
        Authorization: `Bearer ${sessionid}`,
      },
    })
    return response.data
  },

  // 聊天补全（用于获取图像）
  async chatCompletion(request: ChatCompletionRequest, sessionid: string): Promise<ChatCompletionResponse> {
    const response = await apiClient.post('/v1/chat/completions', request, {
      headers: {
        Authorization: `Bearer ${sessionid}`,
      },
    })
    return response.data
  },

  // 流式聊天补全
  async streamChatCompletion(
    request: ChatCompletionRequest, 
    sessionid: string,
    onMessage: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionid}`,
        },
        body: JSON.stringify({ ...request, stream: true }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('ReadableStream not supported')
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
          const trimmed = line.trim()
          if (trimmed === '' || !trimmed.startsWith('data:')) continue
          
          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') {
            onComplete()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              onMessage(content)
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', e)
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  },

  // 检查Token有效性
  async checkToken(sessionid: string): Promise<TokenCheckResponse> {
    const response = await apiClient.post('/token/check', {
      token: sessionid,
    })
    return response.data
  },

  // 获取积分信息
  async getCredits(sessionid: string): Promise<CreditsResponse[]> {
    try {
      const response = await apiClient.post('/token/points', {}, {
        headers: {
          Authorization: `Bearer ${sessionid}`,
        },
      })
      console.log('Credits response:', response.data)
      return response.data
    } catch (error) {
      console.error('获取积分失败:', error)
      // 如果获取积分失败，返回默认值
      return [{
        token: sessionid,
        points: {
          giftCredit: 0,
          purchaseCredit: 0,
          vipCredit: 0,
          totalCredit: 0
        }
      }]
    }
  },

  // 测试积分获取（用于调试）
  async testCredits(sessionid: string): Promise<any> {
    try {
      const response = await apiClient.post('/token/points', {}, {
        headers: {
          Authorization: `Bearer ${sessionid}`,
        },
      })
      console.log('Test Credits Success:', response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Test Credits Error:', error.response?.data || error.message)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        fullError: error.response?.data
      }
    }
  },

  // 手动验证积分
  async verifyCredits(sessionid: string, credits: { giftCredit: number, purchaseCredit: number, vipCredit: number }): Promise<CreditsResponse[]> {
    const response = await apiClient.post('/token/verify-credits', credits, {
      headers: {
        Authorization: `Bearer ${sessionid}`,
      },
    })
    return response.data
  },

  // Ping测试
  async ping(): Promise<string> {
    const response = await apiClient.get('/ping')
    return response.data
  },

  // 提示词优化
  async enhancePrompt(prompt: string, params?: { scene?: string; style?: string; tone?: string; composition?: string; light?: string; userApiKey?: string }): Promise<{ original: string; enhanced: string; provider?: string }> {
    const response = await apiClient.post('/v1/enhance', {
      prompt,
      scene: params?.scene,
      style: params?.style,
      tone: params?.tone,
      composition: params?.composition,
      light: params?.light,
      userApiKey: params?.userApiKey
    })
    return response.data
  },

  // 细化提示词
  async refinePrompt(prompt: string, userApiKey?: string): Promise<{ original: string; refined: string; provider?: string }> {
    const response = await apiClient.post('/v1/enhance/refine', {
      prompt,
      userApiKey
    })
    return response.data
  },

  // API连通性测试
  async testApiConnectivity(apiKey?: string): Promise<{ status: string; provider: string; responseTime?: number; message: string; timestamp: string }> {
    const response = await apiClient.post('/v1/enhance/test', {
      apiKey
    })
    return response.data
  }
} 