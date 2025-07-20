import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Use class-based dark mode
  theme: {
    extend: {
      colors: {
        // Classic Cinema Palette
        cinema: {
          burgundy: {
            50: '#FDF2F3',
            100: '#FCE7E9', 
            200: '#F9D2D7',
            300: '#F4B0BA',
            400: '#EC7A8C',
            500: '#E04B66',
            600: '#CB2A4A',
            700: '#A61E42', // Main burgundy
            800: '#8B1538', // Dark burgundy
            900: '#6B0E26',
            950: '#4A0A1C',
          },
          gold: {
            50: '#FFFBF0',
            100: '#FEF6E0',
            200: '#FDEBC1',
            300: '#FBDC96',
            400: '#F8C969',
            500: '#F5B642',
            600: '#E6C08A', // Light gold
            700: '#D4A574', // Main gold
            800: '#B8925E', // Dark gold
            900: '#8B6E3A',
            950: '#5D4927',
          },
          copper: {
            50: '#FDF6F0',
            100: '#FAEDE0',
            200: '#F5DCC1',
            300: '#EFC196',
            400: '#E6A569',
            500: '#D48F42',
            600: '#C87F35',
            700: '#B87333', // Main copper
            800: '#935F2A',
            900: '#6F4720',
            950: '#4A2F15',
          },
          orange: {
            50: '#FFF8F0',
            100: '#FFEFDC',
            200: '#FFDCB8',
            300: '#FFC28A',
            400: '#FFA84D',
            500: '#FF8C00', // Main orange
            600: '#E67E00',
            700: '#CC7000',
            800: '#B8640A',
            900: '#945214',
            950: '#522D08',
          },
          cream: {
            50: '#FEFEFE',
            100: '#FDFDFC',
            200: '#F8F6F0', // Main cream
            300: '#F0EDE4',
            400: '#E8E3D8',
            500: '#DDD6C7',
            600: '#CFC5B0',
            700: '#BFB298',
            800: '#A69A80',
            900: '#8B8068',
            950: '#5A5347',
          },
          charcoal: {
            50: '#F6F6F5',
            100: '#EEEEEC',
            200: '#DDDDD9',
            300: '#C4C4BF',
            400: '#A8A29E', // Warm gray
            500: '#918B86',
            600: '#7A746F',
            700: '#66605B',
            800: '#56504C',
            900: '#2D2B28', // Main charcoal
            950: '#1A1818', // Velvet
          }
        },
        // Extended stone colors for better cinema theming
        stone: {
          850: '#1C1917',
          925: '#141211',
          975: '#0A0908',
        },
        // Custom amber variations
        amber: {
          350: '#FBBF24',
          450: '#F59E0B',
          550: '#D97706',
          650: '#B45309',
          750: '#92400E',
          850: '#78350F',
          925: '#451A03',
          975: '#1C0A00',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'cinema': '0 25px 50px -12px rgba(139, 21, 56, 0.25)',
        'cinema-lg': '0 35px 60px -12px rgba(139, 21, 56, 0.4)',
        'gold': '0 10px 30px -5px rgba(212, 165, 116, 0.4)',
        'gold-lg': '0 20px 40px -5px rgba(212, 165, 116, 0.6)',
        'theater': '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
        'inner-cinema': 'inset 0 2px 8px rgba(139, 21, 56, 0.1)',
      },
      backdropBlur: {
        '4xl': '72px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'blob': 'blob 8s infinite ease-in-out',
        'marquee': 'marquee 3s ease-in-out infinite',
        'cinema-pulse': 'cinemaPulse 2s ease-in-out infinite',
        'waveform': 'waveform 1.4s ease-in-out infinite',
        'film-grain': 'filmGrain 0.5s steps(8, end) infinite',
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
          '0%': {
            transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
          },
          '25%': {
            transform: 'translate(40px, -60px) scale(1.1) rotate(90deg)',
          },
          '50%': {
            transform: 'translate(-30px, 40px) scale(0.9) rotate(180deg)',
          },
          '75%': {
            transform: 'translate(20px, -20px) scale(1.05) rotate(270deg)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1) rotate(360deg)',
          },
        },
        marquee: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        cinemaPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        waveform: {
          '0%, 100%': {
            transform: 'scaleY(0.3)',
            opacity: '0.6',
          },
          '50%': {
            transform: 'scaleY(1)',
            opacity: '1',
          },
        },
        filmGrain: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '12.5%': { transform: 'translateX(-1px) translateY(-1px)' },
          '25%': { transform: 'translateX(1px) translateY(0px)' },
          '37.5%': { transform: 'translateX(1px) translateY(1px)' },
          '50%': { transform: 'translateX(-1px) translateY(1px)' },
          '62.5%': { transform: 'translateX(1px) translateY(-1px)' },
          '75%': { transform: 'translateX(0px) translateY(1px)' },
          '87.5%': { transform: 'translateX(-1px) translateY(0px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(135deg, #8B1538 0%, #D4A574 50%, #FF8C00 100%)',
        'theater-gradient': 'linear-gradient(180deg, #0F0F0F 0%, #1A1818 50%, #2D2B28 100%)',
        'film-strip': 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        'cinema': '1920px', // For ultra-wide cinema displays
      },
      aspectRatio: {
        'cinema': '21 / 9', // Ultra-wide cinema aspect ratio
        'film': '16 / 9',   // Standard film aspect ratio
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionTimingFunction: {
        'cinema': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'theater': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [
    // Custom plugin for cinema utilities
    function({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const newUtilities = {
        '.cinema-glass': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background': 'rgba(248, 246, 240, 0.85)',
          'border': '1px solid rgba(212, 165, 116, 0.2)',
          'box-shadow': '0 8px 32px rgba(139, 21, 56, 0.1), inset 0 1px 0 rgba(212, 165, 116, 0.2)',
        },
        '.cinema-glass-dark': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background': 'rgba(26, 24, 24, 0.85)',
          'border': '1px solid rgba(166, 30, 66, 0.2)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 165, 116, 0.1)',
        },
        '.cinema-text-gradient': {
          'background': 'linear-gradient(135deg, #8B1538 0%, #D4A574 50%, #FF8C00 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.cinema-border-gradient': {
          'border-image': 'linear-gradient(135deg, #8B1538, #D4A574, #FF8C00) 1',
        },
        '.cinema-scrollbar': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#8B1538 #F8F6F0',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F8F6F0',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #8B1538 0%, #6B0E26 100%)',
            'border-radius': '4px',
            border: '1px solid #D4A574',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, #A61E42 0%, #8B1538 100%)',
          },
        },
        '.film-strip-border': {
          'border-image': 'repeating-linear-gradient(90deg, #8B1538, #8B1538 10px, transparent 10px, transparent 20px) 10',
        },
      }
      
      addUtilities(newUtilities)
    },
  ],
}

export default config