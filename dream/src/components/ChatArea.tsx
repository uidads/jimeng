import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import MessageBubble from './MessageBubble'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const ChatArea: React.FC = () => {
  const { messages } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputAreaHeight, setInputAreaHeight] = useState(140) // 默认输入框高度

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 监听输入框高度变化
  useEffect(() => {
    const calculateInputAreaHeight = () => {
      const inputArea = document.querySelector('.apple-input-floating')
      if (inputArea) {
        const rect = inputArea.getBoundingClientRect()
        // 设置底部padding为输入框高度 + 20px额外间距
        setInputAreaHeight(rect.height + 20)
      }
    }

    // 初始计算
    calculateInputAreaHeight()

    // 监听窗口大小变化
    window.addEventListener('resize', calculateInputAreaHeight)

    // 使用MutationObserver监听DOM变化（如API面板展开/收起）
    const observer = new MutationObserver(calculateInputAreaHeight)
    const inputArea = document.querySelector('.apple-input-floating')
    if (inputArea) {
      observer.observe(inputArea, {
        attributes: true,
        childList: true,
        subtree: true
      })
    }

    // 监听自定义事件（输入框状态变化）
    const handleInputChange = () => {
      setTimeout(calculateInputAreaHeight, 100) // 延迟执行，确保DOM更新完成
    }
    
    window.addEventListener('inputAreaChanged', handleInputChange)

    return () => {
      window.removeEventListener('resize', calculateInputAreaHeight)
      window.removeEventListener('inputAreaChanged', handleInputChange)
      observer.disconnect()
    }
  }, [])

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-1 flex items-center justify-center p-apple-lg"
    >
              <div className="text-center max-w-lg">
          {/* 主图标 - Apple风格的多层动画 */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
            className="relative w-24 h-24 mx-auto mb-apple-lg"
          >
            {/* 背景毛玻璃圆形 */}
            <motion.div 
              className="absolute inset-0 bg-apple-gradient rounded-apple-3xl shadow-apple-lg"
              animate={{ 
                boxShadow: [
                  '0 12px 40px rgba(0, 122, 255, 0.18)',
                  '0 16px 50px rgba(88, 86, 214, 0.25)',
                  '0 12px 40px rgba(0, 122, 255, 0.18)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* 内部图标 */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            
            {/* 装饰性光环 */}
            <motion.div 
              className="absolute -inset-2 rounded-apple-3xl border border-apple-blue-500/20 dark:border-apple-blue-400/20"
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

                  {/* 标题 - 渐变文字效果 */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl font-semibold mb-apple-sm"
          >
            <span className="apple-text-gradient">欢迎使用即梦AI</span>
          </motion.h2>

          {/* 描述 */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-apple-gray-600 dark:text-apple-gray-400 mb-apple-xl leading-relaxed text-lg"
          >
            输入你的创意描述，让AI为你生成精美的图像
            <br />
            <span className="text-apple-gray-500 dark:text-apple-gray-500 text-base">
              支持多种风格和尺寸，释放你的想象力！
            </span>
          </motion.p>

        {/* 示例提示词 - Apple风格卡片网格 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-apple-sm mb-apple-lg"
        >
          {[
            { text: '🌸 樱花飞舞的少女', icon: '🌸' },
            { text: '🐱 可爱的橘猫漫画', icon: '🐱' },
            { text: '🏔️ 雪山下的小屋', icon: '🏔️' },
            { text: '🌅 赛博朋克都市夜景', icon: '🌅' }
          ].map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: 1 + index * 0.1, 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="apple-card p-apple-sm cursor-pointer group"
              onClick={() => {
                // 触发自定义事件来设置输入框内容
                const event = new CustomEvent('setInputContent', { 
                  detail: { content: example.text.replace(/^[🌸🐱🏔️🌅]\s/, '') } 
                })
                window.dispatchEvent(event)
              }}
            >
              <div className="flex items-center space-x-apple-sm">
                <motion.div 
                  className="w-8 h-8 rounded-apple-md bg-gradient-to-br from-apple-blue-100 to-apple-purple-100 dark:from-apple-blue-900/20 dark:to-apple-purple-900/20 flex items-center justify-center"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-lg">{example.icon}</span>
                </motion.div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 group-hover:text-apple-blue-600 dark:group-hover:text-apple-blue-400 transition-colors">
                    {example.text}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 提示信息 - Apple风格的信息卡片 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 1.5, 
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="apple-card p-apple-md"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(88, 86, 214, 0.05) 100%)'
          }}
        >
          <div className="flex items-start space-x-apple-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-5 rounded-full bg-apple-blue-100 dark:bg-apple-blue-900/30 flex items-center justify-center mt-0.5"
            >
              <Sparkles className="w-3 h-3 text-apple-blue-600 dark:text-apple-blue-400" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-apple-blue-700 dark:text-apple-blue-300 mb-1">
                创作小贴士
              </h4>
              <p className="text-sm text-apple-blue-600 dark:text-apple-blue-400 leading-relaxed">
                描述越详细，生成的图像效果越好。可以包含风格、颜色、场景、情感等要素。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* 聊天消息区域 */}
      <div 
        className="flex-1 overflow-y-auto apple-scrollbar p-apple-md transition-all duration-300" 
        style={{ paddingBottom: `${inputAreaHeight}px` }}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-4xl mx-auto space-y-apple-lg">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <MessageBubble
                    message={message}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>


          </div>
        )}
        
        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 背景装饰性渐变 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-apple-blue-500/3 dark:bg-apple-blue-400/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-apple-purple-500/3 dark:bg-apple-purple-400/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
    </div>
  )
}

export default ChatArea 