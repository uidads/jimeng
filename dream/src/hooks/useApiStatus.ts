import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export interface ApiStatus {
  status: 'testing' | 'online' | 'offline' | 'error' | 'unauthorized' | 'timeout' | 'rate_limited' | 'server_error' | 'unreachable' | 'unknown'
  provider: string
  responseTime?: number
  message: string
  lastChecked?: string
}

export interface ApiConfig {
  deepseek: ApiStatus
  userApiKey: string
}

const LOCAL_STORAGE_KEY = 'jimeng_api_config'

// 默认API状态
const defaultApiStatus: ApiStatus = {
  status: 'unknown',
  provider: 'DeepSeek官方',
  message: '未测试',
  lastChecked: undefined
}

const defaultConfig: ApiConfig = {
  deepseek: { ...defaultApiStatus },
  userApiKey: ''
}

export const useApiStatus = () => {
  const [config, setConfig] = useState<ApiConfig>(defaultConfig)
  const [isAutoTesting, setIsAutoTesting] = useState(false)

  // 从localStorage加载配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        setConfig(prev => ({
          ...prev,
          userApiKey: parsedConfig.userApiKey || '',
          // 不恢复状态，重新测试
        }))
      }
    } catch (error) {
      console.error('Failed to load API config from localStorage:', error)
    }
  }, [])

  // 保存配置到localStorage
  const saveConfig = useCallback((newConfig: Partial<ApiConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        userApiKey: updatedConfig.userApiKey,
        // 只保存API Key，状态不保存，每次重新测试
      }))
    } catch (error) {
      console.error('Failed to save API config to localStorage:', error)
    }
  }, [config])

  // 测试DeepSeek API
  const testDeepSeekApi = useCallback(async (apiKey?: string): Promise<ApiStatus> => {
    const testApiKey = apiKey || config.userApiKey
    
    if (!testApiKey.trim()) {
      const offlineStatus: ApiStatus = {
        status: 'offline',
        provider: 'DeepSeek官方',
        message: '未提供API Key',
        lastChecked: new Date().toLocaleString()
      }
      
      setConfig(prev => ({
        ...prev,
        deepseek: offlineStatus
      }))
      
      return offlineStatus
    }

    setConfig(prev => ({
      ...prev,
      deepseek: { ...prev.deepseek, status: 'testing', message: '测试中...' }
    }))

    try {
      const result = await api.testApiConnectivity(testApiKey)
      
      const status: ApiStatus = {
        status: result.status as ApiStatus['status'],
        provider: result.provider,
        responseTime: result.responseTime,
        message: result.message,
        lastChecked: new Date().toLocaleString()
      }

      setConfig(prev => ({
        ...prev,
        deepseek: status
      }))

      return status
    } catch (error: any) {
      console.error('DeepSeek API测试失败:', error)
      
      const errorStatus: ApiStatus = {
        status: 'error',
        provider: 'DeepSeek官方',
        message: error.message || 'API测试失败',
        lastChecked: new Date().toLocaleString()
      }

      setConfig(prev => ({
        ...prev,
        deepseek: errorStatus
      }))

      return errorStatus
    }
  }, [config.userApiKey])

  // 设置用户API Key
  const setUserApiKey = useCallback((apiKey: string) => {
    saveConfig({ userApiKey: apiKey })
    
    // 如果API Key不为空，立即测试
    if (apiKey.trim()) {
      testDeepSeekApi(apiKey)
    } else {
      // 如果清空了API Key，重置状态
      setConfig(prev => ({
        ...prev,
        deepseek: {
          ...defaultApiStatus,
          message: '未提供API Key'
        }
      }))
    }
  }, [saveConfig, testDeepSeekApi])

  // 测试API
  const testAllApis = useCallback(async () => {
    setIsAutoTesting(true)
    
    try {
      await testDeepSeekApi()
    } finally {
      setIsAutoTesting(false)
    }
  }, [testDeepSeekApi])

  // 获取当前API状态
  const getApiStatus = useCallback((): ApiStatus => {
    return config.deepseek
  }, [config])

  // 初始化时自动测试（如果有API Key）- 移除频繁测试
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    // 延迟2秒后开始测试，避免页面加载时的性能影响
    timeoutId = setTimeout(() => {
      if (config.userApiKey) {
        testDeepSeekApi()
      }
    }, 2000) // 增加延迟时间
    
    return () => clearTimeout(timeoutId)
  }, []) // 只在组件挂载时执行一次

  return {
    config,
    isAutoTesting,
    testDeepSeekApi,
    testAllApis,
    setUserApiKey,
    getApiStatus
  }
} 