import React, { useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Menu, Settings, Moon, Sun, Gem, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../api/client'

const Header: React.FC = () => {
  const { 
    totalCredits, 
    sidebarOpen, 
    setSidebarOpen, 
    isDarkMode, 
    toggleDarkMode,
    sessionIds,
    activeSessionId,
    updateSessionIdCredits,
    calculateTotalCredits,
    messages
  } = useAppStore()

  const activeSession = sessionIds.find(s => s.id === activeSessionId)
  const activeSessionsCount = sessionIds.filter(s => s.credits.totalCredit > 0).length
  const totalSessions = sessionIds.length

  // 实时刷新积分的函数
  const refreshCredits = useCallback(async () => {
    if (!activeSession) return
    
    try {
      const credits = await api.getCredits(activeSession.sessionid)
      if (credits && credits.length > 0) {
        const creditData = credits[0]
        updateSessionIdCredits(activeSession.id, {
          giftCredit: creditData.points.giftCredit,
          purchaseCredit: creditData.points.purchaseCredit,
          vipCredit: creditData.points.vipCredit,
          totalCredit: creditData.points.totalCredit
        })
        calculateTotalCredits()
      }
    } catch (error) {
      console.error('刷新积分失败:', error)
    }
  }, [activeSession, updateSessionIdCredits, calculateTotalCredits])

  // 监听消息变化，当有新的AI回复（包含图片）时刷新积分
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        ((lastMessage.images && lastMessage.images.length > 0) || lastMessage.content.includes('![image_'))) {
      // 延迟一下再刷新，确保后端已经扣除积分
      const timer = setTimeout(() => {
        refreshCredits()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [messages, refreshCredits])

  // 定期刷新积分（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCredits()
    }, 300000) // 改为5分钟 (300秒)
    
    return () => clearInterval(interval)
  }, [refreshCredits])

  // 组件挂载时刷新一次积分
  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  return (
    <header className="relative z-20">
      <div className="px-apple-md py-apple-sm">
        <div className="flex items-center justify-between">
          {/* 左侧：Logo和菜单 */}
          <div className="flex items-center space-x-apple-md">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-apple-sm rounded-apple-md transition-all duration-200 ease-apple apple-button secondary"
            >
              <Menu className="w-5 h-5 text-apple-gray-600 dark:text-apple-gray-400" />
            </motion.button>
            
            <motion.div 
              className="flex items-center space-x-apple-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div 
                className="w-8 h-8 bg-apple-gradient rounded-apple-md flex items-center justify-center shadow-apple-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-semibold apple-text-gradient leading-tight">
                  即梦AI
                </h1>
                <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 -mt-0.5">
                  图像生成工具
                </p>
              </div>
            </motion.div>
          </div>

          {/* 中间：积分显示 - Apple风格卡片 */}
          <div className="hidden md:flex items-center space-x-apple-md">
            <motion.div 
              key={totalCredits} // 添加key让积分变化时有动画
              initial={{ scale: 0.9, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="apple-card px-apple-md py-apple-sm"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
              }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Gem className="w-4 h-4 text-apple-purple-600 dark:text-apple-purple-400" />
                </motion.div>
                <motion.span 
                  key={`credits-${totalCredits}`}
                  initial={{ scale: 1.2, color: '#34C759' }}
                  animate={{ scale: 1, color: isDarkMode ? '#A855F7' : '#7C3AED' }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-medium text-apple-purple-700 dark:text-apple-purple-300"
                >
                  总积分 {totalCredits.toLocaleString()}
                </motion.span>
              </div>
            </motion.div>

            {totalSessions > 0 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center space-x-2 text-sm text-apple-gray-600 dark:text-apple-gray-400"
              >
                <div className="flex items-center space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 bg-apple-green-500 rounded-full"
                  />
                  <span className="text-apple-green-600 dark:text-apple-green-400 font-medium">
                    {activeSessionsCount}
                  </span>
                  <span className="text-apple-gray-500">/</span>
                  <span className="font-medium">{totalSessions}</span>
                </div>
                <span>可用账号</span>
              </motion.div>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 移动端积分显示 */}
            <motion.div 
              key={`mobile-credits-${totalCredits}`}
              className="md:hidden flex items-center space-x-2 apple-card px-apple-sm py-1.5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: isDarkMode 
                  ? 'rgba(139, 92, 246, 0.1)' 
                  : 'rgba(139, 92, 246, 0.05)'
              }}
            >
              <Gem className="w-4 h-4 text-apple-purple-600 dark:text-apple-purple-400" />
              <motion.span 
                key={`mobile-${totalCredits}`}
                initial={{ scale: 1.1, color: '#34C759' }}
                animate={{ scale: 1, color: isDarkMode ? '#A855F7' : '#7C3AED' }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-apple-purple-700 dark:text-apple-purple-300"
              >
                {totalCredits > 999 ? `${(totalCredits / 1000).toFixed(1)}k` : totalCredits}
              </motion.span>
            </motion.div>

            {/* 当前使用的SessionID指示 */}
            {activeSession && (
              <motion.div 
                key={`session-${activeSession.credits.totalCredit}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="hidden lg:flex items-center space-x-2 apple-card px-apple-sm py-1.5"
                style={{
                  background: isDarkMode 
                    ? 'rgba(52, 199, 89, 0.1)' 
                    : 'rgba(52, 199, 89, 0.05)'
                }}
              >
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 bg-apple-green-500 rounded-full"
                />
                <span className="text-sm text-apple-green-700 dark:text-apple-green-300 font-medium">
                  {activeSession.name}
                </span>
                <motion.span 
                  key={`session-credits-${activeSession.credits.totalCredit}`}
                  initial={{ scale: 1.2, color: '#34C759' }}
                  animate={{ scale: 1, color: isDarkMode ? '#34C759' : '#16A34A' }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-apple-green-600 dark:text-apple-green-400 bg-apple-green-100 dark:bg-apple-green-900/20 px-2 py-0.5 rounded-full"
                >
                  {activeSession.credits.totalCredit}
                </motion.span>
              </motion.div>
            )}

            {/* 主题切换 - Apple风格 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="apple-button secondary p-apple-sm rounded-apple-md relative overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-apple-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-apple-gray-600 dark:text-apple-gray-400" />
                )}
              </motion.div>
            </motion.button>

            {/* SessionID管理按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="apple-button secondary p-apple-sm rounded-apple-md relative"
            >
              <Settings className="w-5 h-5 text-apple-gray-600 dark:text-apple-gray-400" />
              {totalSessions > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-apple-red-500 rounded-full flex items-center justify-center shadow-apple-sm"
                >
                  <span className="text-[10px] text-white font-bold">
                    {totalSessions > 9 ? '9+' : totalSessions}
                  </span>
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>

        {/* 移动端次要信息 - 简化设计 */}
        {totalSessions > 0 && (
          <motion.div 
            className="md:hidden mt-apple-sm pt-apple-sm border-t border-apple-gray-200/50 dark:border-apple-gray-700/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {activeSession && (
                  <>
                    <div className="w-1.5 h-1.5 bg-apple-green-500 rounded-full animate-apple-pulse" />
                    <span className="text-apple-gray-600 dark:text-apple-gray-400">
                      当前: <span className="font-medium text-apple-green-600 dark:text-apple-green-400">{activeSession.name}</span>
                    </span>
                  </>
                )}
              </div>
              <div className="text-apple-gray-500 dark:text-apple-gray-400">
                可用账号: <span className="font-medium text-apple-green-600 dark:text-apple-green-400">{activeSessionsCount}</span>/{totalSessions}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

export default Header 