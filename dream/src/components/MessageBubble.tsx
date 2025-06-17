import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatMessage, useAppStore } from '../store/useAppStore'
import { User, Bot, ChevronLeft, ChevronRight, X, Download, Copy, Edit3, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface MessageBubbleProps {
  message: ChatMessage
  index: number
}

// 全屏预览Modal组件
interface ImageModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext
}) => {
  const handleDownload = useCallback(async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `dream-ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    // 阻止事件冒泡，确保这里的处理优先
    e.preventDefault()
    e.stopPropagation()
    
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        onPrevious()
        break
      case 'ArrowRight':
        onNext()
        break
      case ' ':
        handleDownload(images[currentIndex])
        break
    }
  }, [isOpen, currentIndex, images, onClose, onPrevious, onNext, handleDownload])

  React.useEffect(() => {
    if (isOpen) {
      // 添加body类来控制样式
      document.body.classList.add('image-modal-open')
    } else {
      // 移除body类
      document.body.classList.remove('image-modal-open')
    }

    return () => {
      // 清理：确保在组件卸载时移除类
      document.body.classList.remove('image-modal-open')
    }
  }, [isOpen])

  React.useEffect(() => {
    // 使用capture模式确保事件处理优先级
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-0 bg-black/95 backdrop-blur-apple-lg flex items-center justify-center apple-image-modal"
        style={{ 
          zIndex: 9999, // 最高层级，确保在所有内容之上
          padding: '20px' // 添加内边距，确保图片不会贴边
        }}
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.1 }}
          onClick={onClose}
          className="absolute top-6 right-6 z-10 apple-button secondary p-3 rounded-full"
          style={{ 
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>

        {/* 图片容器 - 优化尺寸控制 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex items-center justify-center w-full h-full"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '95vw',
            maxHeight: '95vh'
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`预览图片 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-apple-md shadow-apple-2xl"
            style={{
              // 确保图片完美适应屏幕
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              // Apple风格的阴影
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              handleDownload(images[currentIndex])
            }}
          />

          {/* 导航按钮 - 只在多张图片时显示 */}
          {images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 apple-button secondary p-3 rounded-full"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 apple-button secondary p-3 rounded-full"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </motion.button>
            </>
          )}
        </motion.div>

        {/* 底部信息栏 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div 
            className="px-6 py-3 rounded-apple-lg backdrop-blur-apple-md"
            style={{ 
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-6 text-sm text-white/90">
              {images.length > 1 && (
                <>
                  <span className="font-medium">{currentIndex + 1} / {images.length}</span>
                  <span className="w-px h-4 bg-white/20"></span>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(images[currentIndex])}
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下载图片</span>
              </motion.button>
              <span className="w-px h-4 bg-white/20"></span>
              <span className="text-white/60">ESC 关闭</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const { isGenerating } = useAppStore()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)



  const extractImages = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g
    const matches = []
    let match
    while ((match = imageRegex.exec(content)) !== null) {
      matches.push(match[1])
    }
    return matches
  }

  const images = message.images || extractImages(message.content)
  const textContent = message.content.replace(/!\[.*?\]\([^\)]+\)/g, '').trim()

  // 复制消息内容
  const handleCopyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      toast.success('已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }, [textContent])

  // 重新编辑消息
  const handleReEdit = useCallback(() => {
    // 触发自定义事件来设置输入框内容
    const event = new CustomEvent('setInputContent', { 
      detail: { content: textContent } 
    })
    window.dispatchEvent(event)
    toast.success('已填入输入框，请修改后重新发送')
    
    // 滚动到底部
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [textContent])

  // 检查是否需要折叠
  const shouldCollapse = textContent.length > 200 || textContent.split('\n').length > 3
  const displayText = shouldCollapse && !isExpanded 
    ? textContent.split('\n').slice(0, 3).join('\n').slice(0, 200) + '...'
    : textContent

  const handleImageLoad = useCallback((url: string) => {
    setLoadedImages(prev => new Set([...prev, url]))
  }, [])

  const handleImageError = useCallback((url: string) => {
    setErrorImages(prev => new Set([...prev, url]))
  }, [])

  const handleImageClick = useCallback((index: number) => {
    setCurrentImageIndex(index)
    setImageModalOpen(true)
  }, [])

  const handleDownloadImage = useCallback(async (url: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `dream-ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }, [])

  const handlePreviousImage = useCallback(() => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }, [images.length])

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }, [images.length])

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1,
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
                 className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-apple-md`}
      >
                 <div className={`flex items-start space-x-apple-sm max-w-4xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* 头像 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
            className="flex-shrink-0 relative"
          >
            {/* AI头像光环动效 - 仅在当前消息正在生成时显示 */}
            {message.role === 'assistant' && message.generating && isGenerating && (
              <>
                {/* 外层呼吸光圈 */}
                <motion.div
                  className="absolute inset-0 w-8 h-8 rounded-full border-2 border-apple-blue-400/30"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                {/* 中层光圈 */}
                <motion.div
                  className="absolute inset-0 w-8 h-8 rounded-full border border-apple-blue-500/50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                />
                {/* 内层发光效果 */}
                <motion.div
                  className="absolute inset-0 w-8 h-8 rounded-full bg-apple-blue-500/10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                  }}
                />
              </>
            )}
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
               message.role === 'user' 
                 ? 'bg-apple-blue-500 text-white' 
                 : 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-600 dark:text-apple-gray-400'
             } ${message.role === 'assistant' && message.generating && isGenerating ? 'shadow-lg shadow-apple-blue-500/25' : ''}`}>
                       {message.role === 'user' ? (
             <User className="w-4 h-4" />
            ) : (
             <Bot className="w-4 h-4" />
            )}
            </div>
          </motion.div>

            {/* 消息内容 */}
                     <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            {/* 文本内容 */}
            {textContent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`relative group ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}
                onMouseEnter={() => message.role === 'user' && setShowActions(true)}
                onMouseLeave={() => message.role === 'user' && setShowActions(false)}
              >
                <div className={`inline-block px-apple-md py-apple-sm rounded-apple-lg max-w-2xl ${
                   message.role === 'user'
                     ? 'apple-chat-bubble-user'
                     : 'apple-chat-bubble-ai'
                 }`}>
                  <div 
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      shouldCollapse && isExpanded ? 'max-h-64 overflow-y-auto apple-scrollbar' : ''
                    }`}
                    style={{
                      transition: 'max-height 0.3s ease',
                      textAlign: message.role === 'user' ? 'left' : 'inherit'
                    }}
                  >
                    {displayText}
                  </div>
                  
                  {/* 展开/收起按钮 */}
                  {shouldCollapse && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-2 flex items-center space-x-1 text-xs text-apple-blue-600 dark:text-apple-blue-400 hover:text-apple-blue-700 dark:hover:text-apple-blue-300 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>收起</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>展开</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                {/* 用户消息操作按钮 */}
                {message.role === 'user' && (
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-1 mt-2"
                      >
                        <motion.button
                          onClick={handleCopyMessage}
                          className="p-1.5 rounded-apple-md bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-blue-600 dark:hover:text-apple-blue-400 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="复制消息"
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>
                        
                        <motion.button
                          onClick={handleReEdit}
                          className="p-1.5 rounded-apple-md bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-green-600 dark:hover:text-apple-green-400 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="重新编辑"
                        >
                          <Edit3 className="w-3 h-3" />
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* 图片网格 - Apple风格4张一排 */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className={`mt-apple-sm ${textContent ? 'mt-apple-sm' : ''}`}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-apple-sm max-w-4xl">
                  {images.map((url, imgIndex) => (
                    <motion.div
                      key={imgIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: index * 0.1 + 0.5 + imgIndex * 0.1,
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -3,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="relative group cursor-pointer"
                    >
                      <div 
                        className="apple-generated-image aspect-square overflow-hidden relative"
                        onClick={() => handleImageClick(imgIndex)}
                        onContextMenu={(e) => handleDownloadImage(url, e)}
                        style={{
                          // 增强点击反馈
                          transition: 'all 0.2s ease',
                          cursor: 'zoom-in'
                        }}
                      >
                        {!loadedImages.has(url) && !errorImages.has(url) && (
                          <div className="absolute inset-0 bg-apple-gray-100 dark:bg-apple-gray-800 animate-apple-pulse flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-apple-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      
                        <img
                          src={url}
                          alt={`生成的图片 ${imgIndex + 1}`}
                          className="w-full h-full object-cover transition-all duration-300 ease-apple-ease"
                          onLoad={() => handleImageLoad(url)}
                          onError={() => handleImageError(url)}
                          style={{
                            opacity: loadedImages.has(url) ? 1 : 0
                          }}
                        />

                        {/* 悬浮时的微妙遮罩效果和放大提示 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 ease-apple-ease flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="w-12 h-12 bg-black/50 backdrop-blur-apple-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <svg 
                              className="w-6 h-6 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                              />
                            </svg>
                          </motion.div>
                        </div>
                        
                        {/* 图片序号指示器 */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.6 + imgIndex * 0.1 }}
                          className="absolute top-2 left-2 w-6 h-6 bg-black/60 backdrop-blur-apple-md rounded-full flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-medium">
                            {imgIndex + 1}
                          </span>
                        </motion.div>

                        {/* 右上角放大图标提示 */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.7 + imgIndex * 0.1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-apple-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <svg 
                            className="w-3 h-3 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 图片信息 - Apple风格 */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  className="mt-apple-sm flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400"
                >
                    <div className="flex items-center space-x-2">
                    <span>模型: {message.model || 'jimeng-v1'}</span>
                    <span>•</span>
                    <span>尺寸: {message.aspectRatio || '1:1'}</span>
                    <span>•</span>
                    <span>共{images.length}张图片</span>
                  </div>
                                     <div className="text-apple-gray-400 dark:text-apple-gray-500">
                     {message.timestamp.toLocaleTimeString('zh-CN', { 
                       hour: '2-digit', 
                       minute: '2-digit' 
                     })}
              </div>
                </motion.div>
              </motion.div>
            )}
          </div>
      </div>
    </motion.div>

      {/* 全屏预览Modal */}
      <ImageModal
        images={images}
        currentIndex={currentImageIndex}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
      />
    </>
  )
}

export default MessageBubble 