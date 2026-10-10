/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stellar: {
          bg: '#000000',
          surface: '#0c0d12',
          card: '#12141d',
          violet: '#8B5CF6',
          purple: '#A78BFA',
          cyan: '#38BDF8',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
          text: '#F8FAFC',
          secondary: '#9ca3af',
          muted: '#64748b',
          border: '#171a24',
        },
        cosmic: {
          ink: '#080B16',
          cyan: '#38BDF8',
          violet: '#8B5CF6',
          purple: '#A78BFA',
          panel: '#131A30',
          surface: '#0D1224',
        },
      },
      boxShadow: {
        'cosmic-sm': '0 4px 20px -2px rgba(139, 92, 246, 0.15)',
        'cosmic-md': '0 8px 30px -4px rgba(139, 92, 246, 0.25), 0 0 15px rgba(56, 189, 248, 0.1)',
        'cosmic-lg': '0 16px 48px -8px rgba(139, 92, 246, 0.35), 0 0 25px rgba(56, 189, 248, 0.15)',
        'cyan-glow': '0 0 25px rgba(56, 189, 248, 0.25)',
        'violet-glow': '0 0 25px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'spin-medium': 'spin 14s linear infinite',
        'spin-slow': 'spin 26s linear infinite',
        'spin-fast': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

