import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SessionID {
  id: string
  sessionid: string
  name: string
  credits: {
    giftCredit: number
    purchaseCredit: number
    vipCredit: number
    totalCredit: number
  }
  isActive: boolean
  lastUpdated: Date
}

export interface AspectRatio {
  label: string
  value: string
  width: number
  height: number
  icon: string
  description: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  timestamp: Date
  generating?: boolean
  model?: string
  aspectRatio?: string
}

export interface GenerationSettings {
  model: string
  aspectRatio: string
  negativePrompt: string
  sampleStrength: number
}

interface AppState {
  // SessionID管理
  sessionIds: SessionID[]
  activeSessionId: string | null
  
  // 聊天相关
  messages: ChatMessage[]
  isGenerating: boolean
  
  // 设置相关
  settings: GenerationSettings
  isDarkMode: boolean
  sidebarOpen: boolean
  settingsExpanded: boolean
  
  // 新增：悬浮菜单状态
  modelMenuOpen: boolean
  aspectMenuOpen: boolean
  
  // UI状态
  totalCredits: number
}

interface AppActions {
  // SessionID操作
  addSessionId: (sessionid: string, name?: string) => void
  removeSessionId: (id: string) => void
  updateSessionIdCredits: (id: string, credits: SessionID['credits']) => void
  setActiveSessionId: (id: string) => void
  
  // 聊天操作
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setGenerating: (generating: boolean) => void
  
  // 设置操作
  updateSettings: (updates: Partial<GenerationSettings>) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  setSettingsExpanded: (expanded: boolean) => void
  
  // 新增：悬浮菜单操作
  setModelMenuOpen: (open: boolean) => void
  setAspectMenuOpen: (open: boolean) => void
  
  // 计算总积分
  calculateTotalCredits: () => void
}

export const ASPECT_RATIOS: AspectRatio[] = [
  {
    label: '1:1',
    value: '1:1',
    width: 1328,
    height: 1328,
    icon: '⏹️',
    description: '正方形'
  },
  {
    label: '3:4',
    value: '3:4', 
    width: 1104,
    height: 1472,
    icon: '📱',
    description: '竖屏'
  },
  {
    label: '9:16',
    value: '9:16',
    width: 936,
    height: 1664,
    icon: '📲',
    description: '手机竖屏'
  },
  {
    label: '4:3',
    value: '4:3',
    width: 1472,
    height: 1104,
    icon: '🖥️',
    description: '横屏'
  },
  {
    label: '16:9',
    value: '16:9',
    width: 1664,
    height: 936,
    icon: '📺',
    description: '宽屏'
  }
]

export const MODELS = [
  { value: 'jimeng-3.0', label: 'Jimeng 3.0', description: '最新版本，效果最佳' },
  { value: 'jimeng-2.1', label: 'Jimeng 2.1', description: '稳定版本' },
]

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      sessionIds: [],
      activeSessionId: null,
      messages: [],
      isGenerating: false,
      settings: {
        model: 'jimeng-3.0',
        aspectRatio: '1:1',
        negativePrompt: '',
        sampleStrength: 0.5,
      },
      isDarkMode: false,
      sidebarOpen: false,
      settingsExpanded: false,
      modelMenuOpen: false,
      aspectMenuOpen: false,
      totalCredits: 0,

      // SessionID操作
      addSessionId: (sessionid: string, name?: string) => {
        const id = generateId()
        const newSessionId: SessionID = {
          id,
          sessionid: sessionid.trim(),
          name: name || `账号 ${get().sessionIds.length + 1}`,
          credits: {
            giftCredit: 0,
            purchaseCredit: 0,
            vipCredit: 0,
            totalCredit: 0,
          },
          isActive: get().sessionIds.length === 0, // 第一个添加的设为活跃
          lastUpdated: new Date(),
        }
        
        set((state) => ({
          sessionIds: [...state.sessionIds, newSessionId],
          activeSessionId: state.activeSessionId || id,
        }))
        
        get().calculateTotalCredits()
      },

      removeSessionId: (id: string) => {
        set((state) => {
          const newSessionIds = state.sessionIds.filter(s => s.id !== id)
          const newActiveId = state.activeSessionId === id 
            ? (newSessionIds[0]?.id || null)
            : state.activeSessionId
          
          return {
            sessionIds: newSessionIds,
            activeSessionId: newActiveId,
          }
        })
        get().calculateTotalCredits()
      },

      updateSessionIdCredits: (id: string, credits: SessionID['credits']) => {
        set((state) => ({
          sessionIds: state.sessionIds.map(s => 
            s.id === id 
              ? { ...s, credits, lastUpdated: new Date() }
              : s
          ),
        }))
        get().calculateTotalCredits()
      },

      setActiveSessionId: (id: string) => {
        set((state) => ({
          activeSessionId: id,
          sessionIds: state.sessionIds.map(s => ({
            ...s,
            isActive: s.id === id,
          })),
        }))
      },

      // 聊天操作
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        }
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },

      updateMessage: (id: string, updates) => {
        set((state) => ({
          messages: state.messages.map(m => 
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      clearMessages: () => {
        set({ messages: [] })
      },

      setGenerating: (generating: boolean) => {
        set({ isGenerating: generating })
      },

      // 设置操作
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setSettingsExpanded: (expanded: boolean) => {
        set({ settingsExpanded: expanded })
      },

      // 新增：悬浮菜单操作
      setModelMenuOpen: (open: boolean) => {
        set({ modelMenuOpen: open })
      },

      setAspectMenuOpen: (open: boolean) => {
        set({ aspectMenuOpen: open })
      },

      // 计算总积分
      calculateTotalCredits: () => {
        const total = get().sessionIds.reduce((sum, session) => 
          sum + session.credits.totalCredit, 0
        )
        set({ totalCredits: total })
      },
    }),
    {
      name: 'jimeng-dream-store',
      partialize: (state) => ({
        sessionIds: state.sessionIds,
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        settings: state.settings,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
) 