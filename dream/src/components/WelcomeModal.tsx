import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Sparkles, Key, ArrowRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api/client'
import toast from 'react-hot-toast'

interface WelcomeModalProps {
  open: boolean
  onClose?: () => void
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  const { addSessionId } = useAppStore()
  const [sessionId, setSessionId] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCreditsInput, setShowCreditsInput] = useState(false)
  const [manualCredits, setManualCredits] = useState({
    giftCredit: 0,
    purchaseCredit: 0,
    vipCredit: 0
  })

  const handleAddSessionId = async () => {
    if (!sessionId.trim()) {
      toast.error('请输入SessionID')
      return
    }

    setIsVerifying(true)
    try {
      // 检查SessionID有效性
      await api.checkToken(sessionId.trim())
      
      // 添加到store
      addSessionId(sessionId.trim(), sessionName.trim() || undefined)
      
      // 如果用户输入了手动积分，则验证积分
      if (showCreditsInput && (manualCredits.giftCredit > 0 || manualCredits.purchaseCredit > 0 || manualCredits.vipCredit > 0)) {
        try {
          await api.verifyCredits(sessionId.trim(), manualCredits)
          toast.success('SessionID和积分添加成功！')
        } catch (error) {
          toast.success('SessionID添加成功！积分信息将稍后更新')
        }
      } else {
        toast.success('SessionID添加成功！开始使用即梦AI吧！')
      }
    } catch (error) {
      toast.error('SessionID无效或已过期，请检查后重试')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleAddSessionId()
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* 关闭按钮 */}
            {onClose && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}

            {/* 头部 */}
            <div className="bg-gradient-primary p-6 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">欢迎使用即梦AI</h2>
              <p className="text-white/90 text-sm">
                开始您的AI图像创作之旅
              </p>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Key className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    添加SessionID
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  请输入您的即梦账号SessionID以开始使用。您可以在浏览器开发者工具的Cookie中找到它。
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SessionID *
                    </label>
                    <input
                      type="text"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入您的SessionID..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      disabled={isVerifying}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      别名（可选）
                    </label>
                    <input
                      type="text"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="例如：主账号"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      disabled={isVerifying}
                    />
                  </div>

                  {/* 手动积分输入选项 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        手动输入积分（可选）
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreditsInput(!showCreditsInput)}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        {showCreditsInput ? '隐藏' : '显示'}
                      </button>
                    </div>
                    
                    {showCreditsInput && (
                      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          如果自动获取积分失败，你可以手动输入你的积分信息
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              赠送积分
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={manualCredits.giftCredit}
                              onChange={(e) => setManualCredits(prev => ({ ...prev, giftCredit: parseInt(e.target.value) || 0 }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              disabled={isVerifying}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              购买积分
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={manualCredits.purchaseCredit}
                              onChange={(e) => setManualCredits(prev => ({ ...prev, purchaseCredit: parseInt(e.target.value) || 0 }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              disabled={isVerifying}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              VIP积分
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={manualCredits.vipCredit}
                              onChange={(e) => setManualCredits(prev => ({ ...prev, vipCredit: parseInt(e.target.value) || 0 }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              disabled={isVerifying}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          总积分: {manualCredits.giftCredit + manualCredits.purchaseCredit + manualCredits.vipCredit}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSessionId}
                disabled={!sessionId.trim() || isVerifying}
                className="apple-button primary-gradient w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>验证中...</span>
                  </>
                ) : (
                  <>
                    <span>开始使用</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* 帮助信息 */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  如何获取SessionID？
                </h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. 访问 jimeng.jianying.com 并登录</li>
                  <li>2. 按F12打开开发者工具</li>
                  <li>3. 在Application → Cookies中找到sessionid</li>
                  <li>4. 复制该值并粘贴到上方输入框</li>
                </ol>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WelcomeModal 