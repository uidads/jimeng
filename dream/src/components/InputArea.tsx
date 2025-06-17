import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore, ASPECT_RATIOS, MODELS } from '../store/useAppStore'
import { Send, Loader, Palette, Crop, Trash2, Wand2, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { useApiStatus } from '../hooks/useApiStatus'
import ApiStatusIndicator from './ApiStatusIndicator'

const SCENE_OPTIONS = [
  { value: '', label: '选择场景' },
  { value: '海报设计', label: '海报设计' },
  { value: '小红书配图', label: '小红书配图' },
  { value: 'Logo设计', label: 'Logo设计' },
  { value: 'IP设计', label: 'IP设计' },
  { value: '插画创作', label: '插画创作' },
  { value: '封面设计', label: '封面设计' },
  { value: '头像设计', label: '头像设计' },
  { value: '壁纸制作', label: '壁纸制作' },
  { value: '表情包', label: '表情包' },
  { value: '商品图', label: '商品图' },
  { value: '概念图', label: '概念图' },
  { value: '漫画分镜', label: '漫画分镜' },
]
const STYLE_OPTIONS = [
  { value: '', label: '选择风格' },
  { value: '写实', label: '写实' },
  { value: '二次元', label: '二次元' },
  { value: '油画', label: '油画' },
  { value: '水彩', label: '水彩' },
  { value: '素描', label: '素描' },
  { value: '国画', label: '国画' },
  { value: '赛博朋克', label: '赛博朋克' },
  { value: '蒸汽波', label: '蒸汽波' },
  { value: '洛丽塔', label: '洛丽塔' },
  { value: '极简主义', label: '极简主义' },
]
const TONE_OPTIONS = [
  { value: '', label: '选择色调' },
  { value: '明亮', label: '明亮' },
  { value: '暗色', label: '暗色' },
  { value: '冷色', label: '冷色' },
  { value: '暖色', label: '暖色' },
  { value: '高饱和度', label: '高饱和度' },
  { value: '低饱和度', label: '低饱和度' },
  { value: '单色', label: '单色' },
  { value: '彩虹色', label: '彩虹色' },
]
const COMPOSITION_OPTIONS = [
  { value: '', label: '选择构图' },
  { value: '居中', label: '居中' },
  { value: '对角线', label: '对角线' },
  { value: '三分法', label: '三分法' },
  { value: '黄金分割', label: '黄金分割' },
  { value: '对称', label: '对称' },
  { value: '框架式', label: '框架式' },
  { value: '引导线', label: '引导线' },
]
const LIGHT_OPTIONS = [
  { value: '', label: '选择光照' },
  { value: '自然光', label: '自然光' },
  { value: '逆光', label: '逆光' },
  { value: '柔光', label: '柔光' },
  { value: '硬光', label: '硬光' },
  { value: '顶光', label: '顶光' },
  { value: '侧光', label: '侧光' },
  { value: '环境光', label: '环境光' },
  { value: '霓虹灯', label: '霓虹灯' },
]

const InputArea: React.FC = () => {
  const {
    sessionIds,
    activeSessionId,
    isGenerating,
    settings,
    modelMenuOpen,
    aspectMenuOpen,
    setModelMenuOpen,
    setAspectMenuOpen,
    updateSettings,
    addMessage,
    setGenerating,
  } = useAppStore()

  const [prompt, setPrompt] = useState('')
  const [scene, setScene] = useState('')
  const [style, setStyle] = useState('')
  const [tone, setTone] = useState('')
  const [composition, setComposition] = useState('')
  const [light, setLight] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isInputMinimized, setIsInputMinimized] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modelButtonRef = useRef<HTMLButtonElement>(null)
  const aspectButtonRef = useRef<HTMLButtonElement>(null)
  const apiSettingsRef = useRef<HTMLDivElement>(null)

  // 消息队列管理
  const messageQueue = useRef<Array<{
    id: string
    userMessage: string
    timestamp: number
  }>>([])
  const isProcessingQueue = useRef(false)

  // 强制重置机制
  const forceResetQueue = useCallback(() => {
    isProcessingQueue.current = false
    messageQueue.current = []
    setGenerating(false)
    console.log('队列状态已强制重置')
  }, [setGenerating])

  // 队列状态异常检测和修复
  useEffect(() => {
    const checkAndFixState = () => {
      // 如果正在生成但队列为空且没有处理中，说明状态异常
      if (isGenerating && messageQueue.current.length === 0 && !isProcessingQueue.current) {
        console.warn('检测到异常状态，正在自动修复...')
        forceResetQueue()
        toast.success('系统状态已自动修复，可以继续使用')
      }
    }

    // 初始检查
    checkAndFixState()
    
    // 移除定期检查，改为仅在状态变化时检查
    // const interval = setInterval(checkAndFixState, 5000)
    // return () => clearInterval(interval)
  }, [isGenerating, forceResetQueue])

  // 使用API状态管理hook
  const { 
    config: apiConfig,
    isAutoTesting,
    testDeepSeekApi,
    testAllApis,
    setUserApiKey,
    getApiStatus
  } = useApiStatus()

  const activeSession = sessionIds.find(s => s.id === activeSessionId)

  // 处理单个消息的函数
  const processMessage = useCallback(async (userMessage: string) => {
    if (!activeSession) {
      toast.error('请先添加SessionID')
      return
    }

    if (activeSession.credits.totalCredit <= 0) {
      toast.error('当前账号积分不足')
      return
    }

    // 添加生成中的AI消息
    addMessage({
      role: 'assistant',
      content: '',
      generating: true,
    })

    try {
      // 获取当前选择的比例
      const currentRatio = ASPECT_RATIOS.find(r => r.value === settings.aspectRatio)
      
      // 调用API生成图像
      const response = await api.chatCompletion({
        model: `${settings.model}:${currentRatio?.width}x${currentRatio?.height}`,
        messages: [
          {
            role: 'user',
            content: userMessage,
          }
        ],
      }, activeSession.sessionid)

      // 获取图片内容
      const imageContent = response.choices[0]?.message?.content || ''
      
      // 获取当前消息列表，找到最后一条助手消息并更新
      const currentMessages = useAppStore.getState().messages
      const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant')
      
      if (lastAssistantMessage) {
        useAppStore.getState().updateMessage(lastAssistantMessage.id, {
          content: imageContent,
          generating: false,
          model: settings.model,
          aspectRatio: settings.aspectRatio,
        })
      }

      toast.success('图像生成成功！')
    } catch (error) {
      console.error('Generation error:', error)
      
      // 处理错误情况
      const currentMessages = useAppStore.getState().messages
      const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant')
      
      if (lastAssistantMessage) {
        useAppStore.getState().updateMessage(lastAssistantMessage.id, {
          content: '抱歉，图像生成失败，请稍后重试。',
          generating: false,
        })
      }
      
      toast.error('图像生成失败')
    }
  }, [activeSession, settings, addMessage])

  // 队列处理函数
  const processMessageQueue = useCallback(async () => {
    if (isProcessingQueue.current || messageQueue.current.length === 0) return
    
    isProcessingQueue.current = true
    
    try {
      while (messageQueue.current.length > 0) {
        const queueItem = messageQueue.current.shift()
        if (!queueItem) break
        
        try {
          // 随机延迟500-2000ms
          const delay = Math.floor(Math.random() * 1500) + 500
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // 处理消息
          await processMessage(queueItem.userMessage)
          
        } catch (error) {
          console.error('Queue processing error:', error)
          // 单条消息失败不影响队列继续处理
        }
      }
    } finally {
      // 确保无论如何都重置状态
      isProcessingQueue.current = false
    }
  }, [processMessage])

  // 智能防重复添加参数到prompt
  const addStyleToPrompt = useCallback((newValue: string, paramType: 'scene' | 'style' | 'tone' | 'composition' | 'light') => {
    if (!newValue) return
    
    const currentText = prompt.trim()
    const words = currentText.split(/[,，\s]+/).filter(word => word.length > 0)
    
    // 根据参数类型创建搜索模式
    const searchPatterns = {
      scene: [`${newValue}用途`, newValue],
      style: [newValue],
      tone: [`${newValue}色调`, newValue],
      composition: [`${newValue}构图`, newValue],
      light: [newValue]
    }
    
    const patterns = searchPatterns[paramType] || [newValue]
    
    // 检查是否已存在（模糊匹配）
    const exists = words.some(word => 
      patterns.some(pattern => 
        word.toLowerCase().includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(word.toLowerCase())
      )
    )
    
    if (!exists) {
      const valueToAdd = paramType === 'scene' ? `${newValue}用途` :
                         paramType === 'tone' ? `${newValue}色调` :
                         paramType === 'composition' ? `${newValue}构图` :
                         newValue
      
      setPrompt(prev => prev.trim() ? `${prev}，${valueToAdd}` : valueToAdd)
    }
  }, [prompt])

  // 智能移除参数从prompt
  const removeStyleFromPrompt = useCallback((valueToRemove: string, paramType: 'scene' | 'style' | 'tone' | 'composition' | 'light') => {
    if (!valueToRemove) return
    
    const currentText = prompt.trim()
    const words = currentText.split(/[,，\s]+/).filter(word => word.length > 0)
    
    // 根据参数类型创建移除模式
    const removePatterns = {
      scene: [`${valueToRemove}用途`, valueToRemove],
      style: [valueToRemove],
      tone: [`${valueToRemove}色调`, valueToRemove],
      composition: [`${valueToRemove}构图`, valueToRemove],
      light: [valueToRemove]
    }
    
    const patterns = removePatterns[paramType] || [valueToRemove]
    
    // 过滤掉匹配的词汇
    const filteredWords = words.filter(word => 
      !patterns.some(pattern => 
        word.toLowerCase().includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(word.toLowerCase())
      )
    )
    
    setPrompt(filteredWords.join('，'))
  }, [prompt])

  // 智能处理样式参数变化
  const handleStyleChange = useCallback((newValue: string, oldValue: string, paramType: 'scene' | 'style' | 'tone' | 'composition' | 'light') => {
    // 先移除旧值
    if (oldValue) {
      removeStyleFromPrompt(oldValue, paramType)
    }
    
    // 添加新值
    if (newValue) {
      // 使用 setTimeout 确保移除操作完成后再添加
      setTimeout(() => {
        addStyleToPrompt(newValue, paramType)
      }, 0)
    }
     }, [addStyleToPrompt, removeStyleFromPrompt])

  // 统一清空功能
  const handleClearAll = useCallback(() => {
    setPrompt('')
    setScene('')
    setStyle('')
    setTone('')
    setComposition('')
    setLight('')
    toast.success('已清空所有内容')
  }, [])

  // 触发输入区域高度变化事件
  const triggerInputAreaChange = useCallback(() => {
    const event = new CustomEvent('inputAreaChanged')
    window.dispatchEvent(event)
  }, [])

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [prompt])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (modelMenuOpen && 
          modelButtonRef.current && 
          !modelButtonRef.current.contains(target) &&
          !document.querySelector('.apple-model-menu')?.contains(target)) {
        setModelMenuOpen(false)
      }
      
      if (aspectMenuOpen && 
          aspectButtonRef.current && 
          !aspectButtonRef.current.contains(target) &&
          !document.querySelector('.apple-aspect-menu')?.contains(target)) {
        setAspectMenuOpen(false)
      }
      
      // DeepSeek配置面板自动关闭
      if (showApiSettings && 
          apiSettingsRef.current && 
          !apiSettingsRef.current.contains(target) &&
          !(target instanceof Element && target.closest('[data-api-settings-trigger]'))) {
        setShowApiSettings(false)
        // 延迟触发，等待动画完成
        setTimeout(() => triggerInputAreaChange(), 300)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [modelMenuOpen, aspectMenuOpen, showApiSettings, setModelMenuOpen, setAspectMenuOpen])

  // ESC键关闭菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果有图片全屏预览打开，不处理ESC键
      if (document.body.classList.contains('image-modal-open')) {
        return
      }
      
      if (event.key === 'Escape') {
        setModelMenuOpen(false)
        setAspectMenuOpen(false)
        if (showApiSettings) {
          setShowApiSettings(false)
          setTimeout(() => triggerInputAreaChange(), 300)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setModelMenuOpen, setAspectMenuOpen])

  // 滚动检测，控制聊天框显示/隐藏和输入框最小化
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = Math.abs(currentScrollY - lastScrollY)
      
      // 设置最小滚动阈值，避免微小滚动造成闪烁
      if (scrollDifference < 10) return
      
      // 向下滚动超过100px，最小化输入框
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsInputMinimized(true)
        setIsChatBoxVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // 向上滚动，显示聊天框但保持输入框最小化状态
        setIsChatBoxVisible(true)
      }
      
      // 滚动到顶部时恢复输入框
      if (currentScrollY < 50) {
        setIsInputMinimized(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    // 使用节流避免频繁触发
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [lastScrollY])

  // 监听重新编辑事件
  useEffect(() => {
    const handleSetInputContent = (event: CustomEvent) => {
      const content = event.detail?.content
      if (content && typeof content === 'string') {
        setPrompt(content)
        // 聚焦到输入框
        textareaRef.current?.focus()
        // 确保输入框可见
        setIsInputMinimized(false)
        setIsChatBoxVisible(true)
      }
    }

    window.addEventListener('setInputContent', handleSetInputContent as EventListener)
    return () => window.removeEventListener('setInputContent', handleSetInputContent as EventListener)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!prompt.trim()) return
    
    if (!activeSession) {
      toast.error('请先添加SessionID')
      return
    }

    if (activeSession.credits.totalCredit <= 0) {
      toast.error('当前账号积分不足')
      return
    }

    const userMessage = prompt.trim()
    setPrompt('')

    // 关闭所有菜单
    setModelMenuOpen(false)
    setAspectMenuOpen(false)

    // 立即添加用户消息
    addMessage({
      role: 'user',
      content: userMessage,
    })

    // 将消息添加到队列
    const queueItem = {
      id: Date.now().toString(),
      userMessage,
      timestamp: Date.now()
    }
    
    messageQueue.current.push(queueItem)
    toast.success('消息已发送，正在队列中处理...')

    // 如果没有正在处理队列，启动队列处理
    if (!isProcessingQueue.current) {
      setGenerating(true)
      processMessageQueue().finally(() => {
        setGenerating(false)
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const currentModel = MODELS.find(m => m.value === settings.model)
  const currentAspect = ASPECT_RATIOS.find(r => r.value === settings.aspectRatio)

  // 预留功能按钮事件
  const handleRefinePrompt = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!prompt.trim()) {
      toast.error('请先输入提示词')
      return
    }
    
    setIsRefining(true)
    const originalPrompt = prompt.trim() // 保存原始提示词
    
    try {
      // 先清空输入框
      setPrompt('')
      
      // 调用细化提示词API
      const result = await api.refinePrompt(originalPrompt, apiConfig.userApiKey || undefined)
      
      // 填入返回的细化结果
      setPrompt(result.refined)
      
      // 显示使用的API提供商信息
      if (result.provider) {
        toast.success(`提示词细化完成！(使用${result.provider}API)`)
      } else {
        toast.success('提示词细化完成！')
      }
    } catch (error) {
      console.error('Refine prompt error:', error)
      toast.error('提示词细化失败，请稍后重试')
      // 如果失败，恢复原始提示词
      setPrompt(originalPrompt)
    } finally {
      setIsRefining(false)
    }
  }


  return (
    <AnimatePresence>
      {isChatBoxVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className={`apple-input-floating fixed bottom-4 left-4 right-4 z-50 transition-all duration-300 ${
            isInputMinimized ? 'transform translate-y-2 scale-95 opacity-80' : ''
          }`}
          style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            backdropFilter: isInputMinimized ? 'blur(20px)' : 'blur(12px)',
            background: isInputMinimized 
              ? 'rgba(255, 255, 255, 0.6)' 
              : undefined
          }}
          onMouseEnter={() => {
            setIsChatBoxVisible(true)
            setIsInputMinimized(false)
          }}
        >
      <div className="px-apple-md py-apple-sm">


        {/* 第一行：配置功能按钮 */}
        <div className="flex space-x-2 mb-3">
          {/* DeepSeek配置按钮 */}
          <motion.button
            type="button"
            onClick={() => {
              setShowApiSettings(!showApiSettings)
              // 延迟触发，等待动画完成
              setTimeout(() => triggerInputAreaChange(), 300)
            }}
            className="apple-input-func-btn flex items-center space-x-2 px-3 py-2 text-sm bg-apple-blue-50 dark:bg-apple-blue-900/20 border border-apple-blue-200 dark:border-apple-blue-800 rounded-apple-md text-apple-blue-700 dark:text-apple-blue-300 hover:bg-apple-blue-100 dark:hover:bg-apple-blue-900/30 transition-all"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            data-api-settings-trigger
          >
            <Settings className="w-4 h-4" />
            <span>DeepSeek配置</span>
            {showApiSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>

          {/* 宽高比按钮 */}
          <div className="relative">
            <motion.button
              ref={aspectButtonRef}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setAspectMenuOpen(!aspectMenuOpen)
                setModelMenuOpen(false)
              }}
              className="apple-input-func-btn flex items-center space-x-2 px-3 py-2 text-sm bg-apple-purple-50 dark:bg-apple-purple-900/20 border border-apple-purple-200 dark:border-apple-purple-800 rounded-apple-md text-apple-purple-700 dark:text-apple-purple-300 hover:bg-apple-purple-100 dark:hover:bg-apple-purple-900/30 transition-all"
            >
              <Crop className="w-4 h-4" />
              <span>宽高比</span>
            </motion.button>

            {/* 比例选择悬浮菜单 */}
            <AnimatePresence>
              {aspectMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  className="apple-floating-menu apple-aspect-menu"
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '0',
                    minWidth: '260px',
                    zIndex: 1000
                  }}
                >
                  <div className="py-apple-sm">
                    {ASPECT_RATIOS.map((ratio, index) => (
                      <motion.button
                        key={ratio.value}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          updateSettings({ aspectRatio: ratio.value })
                          setAspectMenuOpen(false)
                        }}
                        className={`apple-menu-item ${settings.aspectRatio === ratio.value ? 'active' : ''}`}
                      >
                        <div className="flex items-center space-x-apple-sm w-full">
                          <div className="w-8 h-8 bg-apple-purple-100 dark:bg-apple-purple-900/20 rounded-apple-md flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{ratio.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm text-apple-gray-900 dark:text-apple-gray-100">
                              {ratio.label}
                            </div>
                            <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                              {ratio.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 优化提示词按钮 */}
          <motion.button 
            type="button"
            className="apple-input-func-btn flex items-center space-x-2 px-3 py-2 text-sm bg-apple-green-50 dark:bg-apple-green-900/20 border border-apple-green-200 dark:border-apple-green-800 rounded-apple-md text-apple-green-700 dark:text-apple-green-300 hover:bg-apple-green-100 dark:hover:bg-apple-green-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefinePrompt}
            disabled={isRefining}
            whileHover={{ scale: isRefining ? 1 : 1.02, y: isRefining ? 0 : -1 }}
            whileTap={{ scale: isRefining ? 1 : 0.98 }}
          >
            {isRefining ? <Loader className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>{isRefining ? '优化中...' : '优化提示词'}</span>
          </motion.button>

          {/* 清空按钮 */}
          <motion.button 
            type="button"
            className="apple-input-func-btn flex items-center space-x-2 px-3 py-2 text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 transition-all"
            onClick={handleClearAll}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="w-4 h-4" />
            <span>清空</span>
          </motion.button>
        </div>

        {/* API设置展开面板 */}
        <AnimatePresence>
          {showApiSettings && (
            <motion.div
              ref={apiSettingsRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onAnimationComplete={() => triggerInputAreaChange()}
              className="mb-3 p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-apple-lg border border-apple-gray-200 dark:border-apple-gray-700 overflow-hidden"
            >
              <div className="space-y-4">
                {/* API状态显示 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
                      API连接状态
                    </label>
                    <motion.button
                      onClick={testAllApis}
                      disabled={isAutoTesting}
                      className="text-xs px-2 py-1 rounded-apple-md bg-apple-blue-100 dark:bg-apple-blue-900/30 text-apple-blue-700 dark:text-apple-blue-300 hover:bg-apple-blue-200 dark:hover:bg-apple-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isAutoTesting ? '测试中...' : '测试所有API'}
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <ApiStatusIndicator 
                      status={apiConfig.deepseek}
                      onTest={() => testDeepSeekApi(apiConfig.userApiKey)}
                    />
                  </div>
                </div>

                {/* API Key配置 */}
                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                    DeepSeek API Key (可选)
                  </label>
                  <input
                    type="password"
                    value={apiConfig.userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxx (留空使用默认API)"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="mt-2 text-xs text-apple-gray-500 dark:text-apple-gray-400">
                    <p>• 提供自己的API Key使用DeepSeek官方API</p>
                    <p>• API Key会持久保存到本地存储</p>
                  </div>
                  
                  {/* 当前API状态 */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-apple-gray-600 dark:text-apple-gray-400">当前状态:</span>
                    <ApiStatusIndicator 
                      status={getApiStatus()}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 第二行：风格参数选择 */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <motion.select 
            className="apple-input-select text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md px-3 py-2 text-apple-gray-900 dark:text-apple-gray-100 focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all" 
            value={scene} 
            onChange={e => {
              const newValue = e.target.value
              handleStyleChange(newValue, scene, 'scene')
              setScene(newValue)
            }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            {SCENE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </motion.select>
          <motion.select 
            className="apple-input-select text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md px-3 py-2 text-apple-gray-900 dark:text-apple-gray-100 focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all" 
            value={style} 
            onChange={e => {
              const newValue = e.target.value
              handleStyleChange(newValue, style, 'style')
              setStyle(newValue)
            }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            {STYLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </motion.select>
          <motion.select 
            className="apple-input-select text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md px-3 py-2 text-apple-gray-900 dark:text-apple-gray-100 focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all" 
            value={tone} 
            onChange={e => {
              const newValue = e.target.value
              handleStyleChange(newValue, tone, 'tone')
              setTone(newValue)
            }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            {TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </motion.select>
          <motion.select 
            className="apple-input-select text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md px-3 py-2 text-apple-gray-900 dark:text-apple-gray-100 focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all" 
            value={composition} 
            onChange={e => {
              const newValue = e.target.value
              handleStyleChange(newValue, composition, 'composition')
              setComposition(newValue)
            }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            {COMPOSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </motion.select>
          <motion.select 
            className="apple-input-select text-sm bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md px-3 py-2 text-apple-gray-900 dark:text-apple-gray-100 focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent transition-all" 
            value={light} 
            onChange={e => {
              const newValue = e.target.value
              handleStyleChange(newValue, light, 'light')
              setLight(newValue)
            }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            {LIGHT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </motion.select>
        </div>

        {/* 第三行：模型选择、输入框、发送按钮 */}
        <div className="flex items-center space-x-apple-sm relative">
          {/* Jimeng模型选择按钮 */}
          <div className="relative">
            <motion.button
              ref={modelButtonRef}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setModelMenuOpen(!modelMenuOpen)
                setAspectMenuOpen(false)
              }}
              className={`apple-input-button ${modelMenuOpen ? 'active' : ''}`}
            >
              <Palette className="w-5 h-5 text-apple-blue-600 dark:text-apple-blue-400" />
            </motion.button>

            {/* 模型选择悬浮菜单 */}
            <AnimatePresence>
              {modelMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  className="apple-floating-menu apple-model-menu"
                  style={{
                    position: 'absolute',
                    bottom: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '280px',
                    zIndex: 1000
                  }}
                >
                  <div className="py-apple-sm">
                    {MODELS.map((model, index) => (
                      <motion.button
                        key={model.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          updateSettings({ model: model.value })
                          setModelMenuOpen(false)
                        }}
                        className={`apple-menu-item ${settings.model === model.value ? 'active' : ''}`}
                      >
                        <div className="flex items-center space-x-apple-sm w-full">
                          <div className="w-8 h-8 bg-apple-gradient rounded-apple-md flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {model.label.includes('3.0') ? '✨' : 
                               model.label.includes('2.1') ? '🎯' : 
                               model.label.includes('Pro') ? '💎' : 
                               model.label.includes('2.0') ? '🌟' : 
                               model.label.includes('1.4') ? '🎨' : '🚀'}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm text-apple-gray-900 dark:text-apple-gray-100">
                              {model.label}
                            </div>
                            <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                              {model.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 聊天输入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={activeSession ? "使用文本生成精美图像..." : "请先添加SessionID"}
              disabled={!activeSession || isGenerating}
              className="w-full px-apple-md py-apple-sm bg-transparent border-none resize-none text-apple-gray-900 dark:text-apple-gray-100 placeholder-apple-gray-400 dark:placeholder-apple-gray-500 focus:outline-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* 发送按钮 */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!prompt.trim() || !activeSession || isGenerating}
            className="apple-button primary rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* 底部状态信息 */}
        <motion.div 
          className="mt-2 flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-apple-blue-500 rounded-full"></span>
              <span>{currentModel?.label}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-apple-purple-500 rounded-full"></span>
              <span>{currentAspect?.label}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {activeSession && (
              <span>剩余积分: {activeSession.credits.totalCredit}</span>
            )}
            <span>Shift+Enter 换行</span>
          </div>
        </motion.div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InputArea 