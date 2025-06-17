/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Apple系统字体
      fontFamily: {
        'apple': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'apple-mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', 'DejaVu Sans Mono', 'monospace'],
      },
      
      // Apple风格色彩系统
      colors: {
        // 系统蓝色（iOS标准色）
        'apple-blue': {
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#bae3ff',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#007AFF', // iOS System Blue
          600: '#0066cc',
          700: '#0052a3',
          800: '#004085',
          900: '#003366',
        },
        
        // 苹果紫色
        'apple-purple': {
          50: '#f8f7ff',
          100: '#f1efff',
          200: '#e4e0ff',
          300: '#d0c9ff',
          400: '#b5a8ff',
          500: '#5856D6', // iOS System Purple
          600: '#4844b8',
          700: '#3b3799',
          800: '#2f2b7a',
          900: '#25225c',
        },
        
        // 苹果绿色
        'apple-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#34C759', // iOS System Green
          600: '#2ba548',
          700: '#22863a',
          800: '#1a6b2e',
          900: '#155624',
        },
        
        // 苹果红色
        'apple-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#FF3B30', // iOS System Red
          600: '#e6342a',
          700: '#cc2e24',
          800: '#b3271e',
          900: '#992118',
        },
        
        // 苹果橙色
        'apple-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF9500', // iOS System Orange
          600: '#e6850a',
          700: '#cc750a',
          800: '#b36509',
          900: '#995508',
        },
        
        // 苹果黄色
        'apple-yellow': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#FFCC00', // iOS System Yellow
          600: '#e6b800',
          700: '#cca300',
          800: '#b38f00',
          900: '#997a00',
        },
        
        // 中性色系统
        'apple-gray': {
          50: '#F2F2F7',   // iOS Light Gray
          100: '#E5E5EA',  // iOS Light Gray 2
          200: '#D1D1D6',  // iOS Light Gray 3
          300: '#C7C7CC',  // iOS Light Gray 4
          400: '#AEAEB2',  // iOS Light Gray 5
          500: '#8E8E93',  // iOS Light Gray 6
          600: '#636366',  // iOS Dark Gray
          700: '#48484A',  // iOS Dark Gray 2
          800: '#3A3A3C',  // iOS Dark Gray 3
          900: '#1C1C1E',  // iOS Dark Gray 4
        },
        
        // 主色调系统
        primary: {
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#bae3ff',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#007AFF',
          600: '#0066cc',
          700: '#0052a3',
          800: '#004085',
          900: '#003366',
        },
        
        // 语义化颜色
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#007AFF',
      },
      
      // Apple风格背景渐变
      backgroundImage: {
        'apple-gradient': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'gradient-primary': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'apple-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'apple-dark-gradient': 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
      },
      
      // Apple风格阴影系统
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'apple': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'apple-md': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'apple-lg': '0 12px 40px rgba(0, 0, 0, 0.18)',
        'apple-xl': '0 24px 48px rgba(0, 0, 0, 0.25)',
        'apple-2xl': '0 32px 64px rgba(0, 0, 0, 0.3)',
        'apple-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'apple-glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        
        // 暗色模式阴影
        'apple-dark-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'apple-dark': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'apple-dark-md': '0 8px 25px rgba(0, 0, 0, 0.5)',
        'apple-dark-lg': '0 12px 40px rgba(0, 0, 0, 0.6)',
      },
      
      // Apple风格圆角系统
      borderRadius: {
        'apple-xs': '4px',
        'apple-sm': '8px',
        'apple': '12px',
        'apple-md': '16px',
        'apple-lg': '20px',
        'apple-xl': '24px',
        'apple-2xl': '32px',
        'apple-3xl': '40px',
      },
      
      // Apple风格动画
      animation: {
        'apple-bounce': 'appleBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-fade-in': 'appleFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-slide-up': 'appleSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-slide-down': 'appleSlideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-scale': 'appleScale 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-pulse': 'applePulse 2s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
        'apple-shimmer': 'appleShimmer 2s linear infinite',
      },
      
      // Apple风格关键帧动画
      keyframes: {
        appleBounce: {
          '0%': { 
            transform: 'scale(0.3) translateY(0)',
            opacity: '0'
          },
          '50%': { 
            transform: 'scale(1.05) translateY(-10px)',
            opacity: '0.8'
          },
          '70%': { 
            transform: 'scale(0.95) translateY(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(1) translateY(0)',
            opacity: '1'
          },
        },
        appleFadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        appleSlideUp: {
          '0%': { 
            transform: 'translateY(100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        appleSlideDown: {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        appleScale: {
          '0%': { 
            transform: 'scale(0.95)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          },
        },
        applePulse: {
          '0%, 100%': { 
            opacity: '1'
          },
          '50%': { 
            opacity: '0.8'
          },
        },
        appleShimmer: {
          '0%': { 
            backgroundPosition: '-1000px 0'
          },
          '100%': { 
            backgroundPosition: '1000px 0'
          },
        },
      },
      
      // Apple风格过渡效果
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-ease-out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        'apple-ease-in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        'apple-bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Apple风格间距系统
      spacing: {
        'apple-xs': '4px',
        'apple-sm': '8px',
        'apple': '12px',
        'apple-md': '16px',
        'apple-lg': '24px',
        'apple-xl': '32px',
        'apple-2xl': '48px',
        'apple-3xl': '64px',
      },
      
      // Apple风格模糊效果
      backdropBlur: {
        'apple': '20px',
        'apple-md': '12px',
        'apple-lg': '24px',
      },
    },
  },
  plugins: [],
} 