import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import Header from './components/Header'
import ChatArea from './components/ChatArea'
import InputArea from './components/InputArea'
import Sidebar from './components/Sidebar'
import WelcomeModal from './components/WelcomeModal'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Wand2, ImageIcon, Palette } from 'lucide-react'

function App() {
  const { 
    isDarkMode, 
    sidebarOpen, 
    sessionIds,
    calculateTotalCredits
  } = useAppStore()
  
  // 添加状态来控制欢迎页显示
  const [showWelcome, setShowWelcome] = useState(false)

  // 初始化主题
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  // 初始化时计算总积分
  useEffect(() => {
    calculateTotalCredits()
  }, [calculateTotalCredits])

  // 检查是否是首次访问（没有SessionID）
  const isFirstTime = sessionIds.length === 0

  // 控制欢迎页显示逻辑
  useEffect(() => {
    setShowWelcome(isFirstTime)
  }, [isFirstTime])

  // 首页欢迎界面组件
  const WelcomePage = () => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-h-full flex items-center justify-center p-apple-lg"
    >
      <div className="text-center max-w-2xl w-full">
        {/* 主图标 - Apple风格的多层动画 */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.3, 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="relative w-32 h-32 mx-auto mb-apple-xl"
        >
          {/* 背景毛玻璃圆形 - 移除复杂动画 */}
          <motion.div 
            className="absolute inset-0 bg-apple-gradient rounded-apple-3xl shadow-apple-2xl"
          />
          
          {/* 内部图标 - 简化动画 */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>
          </div>
          
          {/* 装饰性光环 - 移除复杂的多层动画 */}
          <motion.div 
            className="absolute -inset-4 rounded-apple-3xl border-2 border-apple-blue-500/30 dark:border-apple-blue-400/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* 标题 - 渐变文字效果 */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl md:text-5xl font-bold mb-apple-md"
        >
          <span className="apple-text-gradient">即梦AI</span>
        </motion.h1>

        {/* 副标题 */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-xl text-apple-gray-600 dark:text-apple-gray-400 mb-apple-xl leading-relaxed"
        >
          释放创意想象力，AI为你生成精美图像
          <br />
          <span className="text-lg text-apple-gray-500 dark:text-apple-gray-500">
            专业级图像生成，让每个创意都闪闪发光
          </span>
        </motion.p>

        {/* 特性展示 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-apple-md mb-apple-xl"
        >
          {[
            { icon: Wand2, title: '智能生成', desc: '先进AI算法', color: 'apple-blue' },
            { icon: ImageIcon, title: '多种风格', desc: '丰富图像类型', color: 'apple-purple' },
            { icon: Palette, title: '高质量', desc: '专业级输出', color: 'apple-green' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: 1.2 + index * 0.1, 
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="apple-card p-apple-lg text-center group cursor-default"
            >
              <motion.div 
                className={`w-12 h-12 mx-auto mb-apple-sm rounded-apple-md bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center group-hover:bg-${feature.color}-200 dark:group-hover:bg-${feature.color}-800/30 transition-colors`}
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
              </motion.div>
              <h3 className="font-semibold text-apple-gray-900 dark:text-apple-gray-100 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 开始提示 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 1.6, 
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="apple-card p-apple-lg bg-gradient-to-br from-apple-blue-50 to-apple-purple-50 dark:from-apple-blue-900/10 dark:to-apple-purple-900/10 border-apple-blue-500/20"
        >
          <div className="flex items-center justify-center space-x-apple-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-6 rounded-full bg-apple-blue-100 dark:bg-apple-blue-900/30 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-apple-blue-600 dark:text-apple-blue-400" />
            </motion.div>
            <p className="text-apple-blue-700 dark:text-apple-blue-300 font-medium">
              点击上方菜单添加SessionID开始创作之旅
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-900 font-apple transition-colors duration-300 apple-smooth-transition">
      {/* 主要布局 */}
      <div className="flex h-screen overflow-hidden">
        {/* 侧边栏 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                transition: {
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8
                }
              }}
              exit={{ 
                x: -320, 
                opacity: 0,
                transition: {
                  type: "spring",
                  damping: 30,
                  stiffness: 400,
                  mass: 0.6
                }
              }}
              className="fixed inset-y-0 left-0 z-40 w-80"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主内容区域 */}
        <motion.div 
          className="flex-1 flex flex-col relative"
          animate={{
            marginLeft: sidebarOpen ? '320px' : '0px'
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
        >
          {/* 顶部导航 - Apple风格毛玻璃效果 */}
          <div className="apple-header">
            <Header />
          </div>
          
          {/* 主要内容区域 - 根据是否有SessionID显示不同内容 */}
          <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-100 dark:from-apple-gray-900 dark:via-apple-gray-800 dark:to-apple-gray-900">
            {isFirstTime ? (
              <WelcomePage />
            ) : (
              <ChatArea />
            )}
          </main>
          
          {/* 底部输入区域 - 只在有SessionID时显示 */}
          {!isFirstTime && <InputArea />}
        </motion.div>
      </div>

      {/* 侧边栏遮罩 - Apple风格的毛玻璃遮罩 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            exit={{ 
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-apple-md z-30 lg:hidden"
            onClick={() => useAppStore.getState().setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

              {/* 首次访问欢迎弹窗 */}
        <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
      
      {/* Apple风格的全局装饰元素 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 背景渐变装饰 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-apple-blue-500/5 dark:bg-apple-blue-400/5 rounded-full blur-3xl animate-apple-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-apple-purple-500/5 dark:bg-apple-purple-400/5 rounded-full blur-3xl animate-apple-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}

export default App 