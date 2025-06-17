import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { ApiStatus } from '../hooks/useApiStatus'

interface ApiStatusIndicatorProps {
  status: ApiStatus
  isLoading?: boolean
  onTest?: () => void
  compact?: boolean
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ 
  status, 
  isLoading = false, 
  onTest,
  compact = false 
}) => {
  const getStatusIcon = () => {
    if (isLoading || status.status === 'testing') {
      return <RefreshCw className="w-3 h-3 animate-spin" />
    }

    switch (status.status) {
      case 'online':
        return <Wifi className="w-3 h-3" />
      case 'offline':
      case 'unreachable':
        return <WifiOff className="w-3 h-3" />
      case 'timeout':
        return <Clock className="w-3 h-3" />
      case 'error':
      case 'unauthorized':
      case 'rate_limited':
      case 'server_error':
        return <AlertCircle className="w-3 h-3" />
      default:
        return <WifiOff className="w-3 h-3" />
    }
  }

  const getStatusColor = () => {
    if (isLoading || status.status === 'testing') {
      return 'text-apple-blue-600 dark:text-apple-blue-400'
    }

    switch (status.status) {
      case 'online':
        return 'text-apple-green-600 dark:text-apple-green-400'
      case 'offline':
      case 'unreachable':
        return 'text-apple-gray-500 dark:text-apple-gray-400'
      case 'timeout':
        return 'text-apple-yellow-600 dark:text-apple-yellow-400'
      case 'error':
      case 'unauthorized':
      case 'rate_limited':
      case 'server_error':
        return 'text-apple-red-600 dark:text-apple-red-400'
      default:
        return 'text-apple-gray-400 dark:text-apple-gray-500'
    }
  }

  const getBgColor = () => {
    if (isLoading || status.status === 'testing') {
      return 'bg-apple-blue-50 dark:bg-apple-blue-900/20 border-apple-blue-200 dark:border-apple-blue-800'
    }

    switch (status.status) {
      case 'online':
        return 'bg-apple-green-50 dark:bg-apple-green-900/20 border-apple-green-200 dark:border-apple-green-800'
      case 'offline':
      case 'unreachable':
        return 'bg-apple-gray-50 dark:bg-apple-gray-800/50 border-apple-gray-200 dark:border-apple-gray-700'
      case 'timeout':
        return 'bg-apple-yellow-50 dark:bg-apple-yellow-900/20 border-apple-yellow-200 dark:border-apple-yellow-800'
      case 'error':
      case 'unauthorized':
      case 'rate_limited':
      case 'server_error':
        return 'bg-apple-red-50 dark:bg-apple-red-900/20 border-apple-red-200 dark:border-apple-red-800'
      default:
        return 'bg-apple-gray-50 dark:bg-apple-gray-800/50 border-apple-gray-200 dark:border-apple-gray-700'
    }
  }

  const getStatusText = () => {
    if (isLoading || status.status === 'testing') {
      return '测试中'
    }

    switch (status.status) {
      case 'online':
        return '在线'
      case 'offline':
        return '离线'
      case 'timeout':
        return '超时'
      case 'unauthorized':
        return 'API Key无效'
      case 'rate_limited':
        return '频率限制'
      case 'server_error':
        return '服务器错误'
      case 'unreachable':
        return '无法访问'
      case 'error':
        return '错误'
      default:
        return '未知'
    }
  }

  if (compact) {
    return (
      <motion.div 
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getBgColor()} ${getStatusColor()}`}
        whileHover={{ scale: 1.05 }}
        title={`${status.provider}: ${status.message}${status.responseTime ? ` (${status.responseTime}ms)` : ''}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`p-3 rounded-apple-lg border ${getBgColor()}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          <div>
            <div className={`font-medium text-sm ${getStatusColor()}`}>
              {status.provider}
            </div>
            <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              {getStatusText()}
              {status.responseTime && ` • ${status.responseTime}ms`}
            </div>
          </div>
        </div>
        
        {onTest && (
          <motion.button
            onClick={onTest}
            disabled={isLoading || status.status === 'testing'}
            className="text-xs px-2 py-1 rounded-apple-md bg-apple-gray-100 dark:bg-apple-gray-700 text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            重新测试
          </motion.button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-apple-gray-600 dark:text-apple-gray-400">
        {status.message}
      </div>
      
      {status.lastChecked && (
        <div className="mt-1 text-xs text-apple-gray-400 dark:text-apple-gray-500">
          最后检测: {status.lastChecked}
        </div>
      )}
    </motion.div>
  )
}

export default ApiStatusIndicator 