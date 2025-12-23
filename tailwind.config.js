/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'brand': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Accent - Electric Teal
        'accent': {
          50: '#CFFAFE',
          100: '#A5F3FC',
          200: '#67E8F9',
          300: '#22D3EE',
          400: '#06B6D4',
          500: '#0891B2',
          600: '#0E7490',
        },
        // Score colors
        'score': {
          excellent: '#10B981',    // 0-40 (inverted: low = good)
          good: '#F59E0B',         // 41-60
          warning: '#F97316',      // 61-80
          critical: '#EF4444',     // 81-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '52px', letterSpacing: '-0.02em' }],
        'hero-mobile': ['28px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        'h1': ['36px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        'h2': ['28px', { lineHeight: '36px' }],
        'h3': ['20px', { lineHeight: '28px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(6, 182, 212, 0.15)',
      },
      animation: {
        'gauge-fill': 'gaugeFill 750ms ease-out forwards',
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'slide-up': 'slideUp 300ms ease-out forwards',
      },
      keyframes: {
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
