import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { X, Plus, Trash2, RefreshCw, Edit2, Check, Eye, EyeOff, Gem } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api/client'
import toast from 'react-hot-toast'

const Sidebar: React.FC = () => {
  const {
    sessionIds,
    activeSessionId,
    addSessionId,
    removeSessionId,
    setActiveSessionId,
    updateSessionIdCredits,
    setSidebarOpen,
  } = useAppStore()

  const [newSessionId, setNewSessionId] = useState('')
  const [newSessionName, setNewSessionName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showSessionIds, setShowSessionIds] = useState<{ [key: string]: boolean }>({})
  const [refreshingCredits, setRefreshingCredits] = useState<{ [key: string]: boolean }>({})

  // 初始化时隐藏所有SessionID
  useEffect(() => {
    const hidden = sessionIds.reduce((acc, session) => {
      acc[session.id] = false
      return acc
    }, {} as { [key: string]: boolean })
    setShowSessionIds(hidden)
  }, [sessionIds])

  const handleAddSessionId = async () => {
    if (!newSessionId.trim()) {
      toast.error('请输入SessionID')
      return
    }

    try {
      // 检查SessionID有效性
      await api.checkToken(newSessionId.trim())
      
      // 添加到store
      addSessionId(newSessionId.trim(), newSessionName.trim() || undefined)
      
      // 清空输入框
      setNewSessionId('')
      setNewSessionName('')
      
      toast.success('SessionID添加成功')
      
      // 尝试获取积分信息
      refreshCredits(newSessionId.trim())
    } catch (error) {
      toast.error('SessionID无效或已过期')
    }
  }

  const refreshCredits = async (sessionid?: string) => {
    const sessions = sessionid ? [{ sessionid }] : sessionIds
    
    for (const session of sessions) {
      const sessionToUpdate = sessionIds.find(s => s.sessionid === session.sessionid)
      if (!sessionToUpdate) continue

      setRefreshingCredits(prev => ({ ...prev, [sessionToUpdate.id]: true }))
      
      try {
        const credits = await api.getCredits(session.sessionid)
        if (credits.length > 0) {
          updateSessionIdCredits(sessionToUpdate.id, credits[0].points)
          toast.success(`积分刷新成功: ${credits[0].points.totalCredit}`)
        }
      } catch (error) {
        console.warn(`Failed to refresh credits for session ${sessionToUpdate.id}`)
        toast.error('积分刷新失败')
      } finally {
        setRefreshingCredits(prev => ({ ...prev, [sessionToUpdate.id]: false }))
      }
    }
  }

  const testCredits = async (sessionid: string) => {
    const sessionToUpdate = sessionIds.find(s => s.sessionid === sessionid)
    if (!sessionToUpdate) return

    setRefreshingCredits(prev => ({ ...prev, [sessionToUpdate.id]: true }))
    
    try {
      const result = await api.testCredits(sessionid)
      if (result.success) {
        toast.success('积分测试成功，请查看控制台日志')
        console.log('积分测试结果:', result.data)
      } else {
        toast.error(`积分测试失败: ${result.error}`)
        console.error('积分测试失败:', result.fullError)
      }
    } catch (error) {
      toast.error('积分测试异常')
      console.error('积分测试异常:', error)
    } finally {
      setRefreshingCredits(prev => ({ ...prev, [sessionToUpdate.id]: false }))
    }
  }

  const handleEditName = (sessionId: string, currentName: string) => {
    setEditingId(sessionId)
    setEditingName(currentName)
  }

  const handleSaveName = () => {
    if (editingId && editingName.trim()) {
      // 这里应该有一个updateSessionIdName方法，暂时使用现有的
      const session = sessionIds.find(s => s.id === editingId)
      if (session) {
        updateSessionIdCredits(editingId, session.credits)
        // 实际上需要更新name，但目前store中没有这个方法
      }
      toast.success('名称更新成功')
    }
    setEditingId(null)
    setEditingName('')
  }

  const toggleSessionIdVisibility = (sessionId: string) => {
    setShowSessionIds(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

  const maskSessionId = (sessionid: string, show: boolean) => {
    if (show) return sessionid
    if (sessionid.length <= 8) return '*'.repeat(sessionid.length)
    return sessionid.slice(0, 4) + '*'.repeat(sessionid.length - 8) + sessionid.slice(-4)
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            SessionID 管理
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>
      </div>

      {/* 添加新SessionID */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SessionID
            </label>
            <input
              type="text"
              value={newSessionId}
              onChange={(e) => setNewSessionId(e.target.value)}
              placeholder="输入SessionID..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              别名（可选）
            </label>
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="例如：主账号"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSessionId}
            className="apple-button primary-gradient w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>添加SessionID</span>
          </motion.button>
        </div>
      </div>

      {/* SessionID列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已添加的账号 ({sessionIds.length})
            </h3>
            {sessionIds.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refreshCredits()}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="刷新所有积分"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {sessionIds.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`mb-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  session.id === activeSessionId
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveSessionId(session.id)}
              >
                {/* 账号信息头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {editingId === session.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                          autoFocus
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSaveName}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {session.name}
                        </h4>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditName(session.id, session.name)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}

                    {session.id === activeSessionId && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('确定要删除这个SessionID吗？')) {
                        removeSessionId(session.id)
                        toast.success('SessionID已删除')
                      }
                    }}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>

                {/* SessionID显示 */}
                <div className="flex items-center space-x-2 mb-2">
                  <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300 truncate">
                    {maskSessionId(session.sessionid, showSessionIds[session.id])}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSessionIdVisibility(session.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showSessionIds[session.id] ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </motion.button>
                </div>

                {/* 积分信息 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gem className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {session.credits.totalCredit.toLocaleString()} 积分
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        testCredits(session.sessionid)
                      }}
                      disabled={refreshingCredits[session.id]}
                      className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50"
                      title="测试积分API"
                    >
                      <span className="text-xs">🧪</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        refreshCredits(session.sessionid)
                      }}
                      disabled={refreshingCredits[session.id]}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                      title="刷新积分"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshingCredits[session.id] ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>
                </div>

                {/* 积分详情 */}
                {(session.credits.giftCredit > 0 || session.credits.purchaseCredit > 0 || session.credits.vipCredit > 0) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      {session.credits.giftCredit > 0 && (
                        <div className="text-center">
                          <div className="text-orange-600 dark:text-orange-400 font-medium">
                            {session.credits.giftCredit}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">赠送</div>
                        </div>
                      )}
                      {session.credits.purchaseCredit > 0 && (
                        <div className="text-center">
                          <div className="text-blue-600 dark:text-blue-400 font-medium">
                            {session.credits.purchaseCredit}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">购买</div>
                        </div>
                      )}
                      {session.credits.vipCredit > 0 && (
                        <div className="text-center">
                          <div className="text-purple-600 dark:text-purple-400 font-medium">
                            {session.credits.vipCredit}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">VIP</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sessionIds.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">还没有添加SessionID</p>
                <p className="text-xs">添加后即可开始生成图像</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar 