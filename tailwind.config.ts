import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FFFBF7',
          100: '#F8F4F0',
          200: '#E8DDD3',
          300: '#D1C4B5',
          400: '#B6A694',
          500: '#9A8876',
          600: '#7D6A58',
          700: '#604C3A',
          800: '#443325',
          900: '#1C1813',
          950: '#0C0A08',
        },
        amber: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        cinema: {
          burgundy: '#8B1538',
          'burgundy-light': '#A61E42',
          'burgundy-dark': '#7A1730',
          'burgundy-muted': 'rgba(139, 21, 56, 0.2)',
          gold: '#D4A574',
          'gold-light': '#E6C08A',
          'gold-dark': '#B8925E',
          'gold-muted': 'rgba(212, 167, 107, 0.2)',
          orange: '#FF8C00',
          'orange-light': '#FFA726',
          'orange-dark': '#E67E00',
          'orange-muted': 'rgba(255, 140, 0, 0.2)',
          cream: '#F8F6F0',
          charcoal: '#2D1B0F',
          'warm-gray': '#8B7A6B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'cinema': '0 25px 50px -12px rgba(139, 21, 56, 0.25)',
        'gold': '0 10px 30px -5px rgba(212, 165, 116, 0.4)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'blob': 'blob 8s infinite ease-in-out',
        'cinema-trophy': 'cinemaTrophy 1.5s infinite',
        'cinema-success': 'cinemaSuccess 1.2s ease-out',
        'cinema-error': 'cinemaError 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        cinemaTrophy: {
          '0%, 100%': {
            transform: 'translateY(-30%) rotate(-5deg)',
          },
          '50%': {
            transform: 'translateY(0) rotate(5deg)',
          },
        },
        cinemaSuccess: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0, 0, 0)',
          },
          '40%, 43%': {
            transform: 'translate3d(0, -25px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -12px, 0)',
          },
          '90%': {
            transform: 'translate3d(0, -4px, 0)',
          },
        },
        cinemaError: {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '10%, 30%, 50%, 70%, 90%': {
            transform: 'translateX(-10px)',
          },
          '20%, 40%, 60%, 80%': {
            transform: 'translateX(10px)',
          },
        },
      },
      aspectRatio: {
        'cinema': '21 / 9',
        'film': '16 / 9',
      },
    },
  },
  plugins: [],
}

export default config