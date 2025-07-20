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
        // Enhanced Light Mode Stone Colors
        stone: {
          50: '#FFFBF7',
          75: '#FEF9F4', 
          100: '#F8F4F0',
          150: '#F2ECE6',
          200: '#E8DDD3',
          250: '#DDD0C2',
          300: '#D1C4B5',
          350: '#C4B6A5',
          400: '#B6A694',
          450: '#A89785',
          500: '#9A8876',
          550: '#8C7967',
          600: '#7D6A58',
          650: '#6F5B49',
          700: '#604C3A',
          750: '#523F2F',
          800: '#443325',
          825: '#3A2C1F',
          850: '#2F251B',
          875: '#251E17',
          900: '#1C1813',
          925: '#14110F',
          950: '#0C0A08',
          975: '#06050425',
        },
        
        // Enhanced Amber for Light Mode
        amber: {
          25: '#FFFCF0',
          50: '#FFFBF0',
          75: '#FFF8E6',
          100: '#FEF3C7',
          150: '#FDF0A7',
          200: '#FDE68A',
          250: '#FBBF2485',
          300: '#FCD34D',
          350: '#FBBF24',
          400: '#F59E0B',
          450: '#F59E0B',
          500: '#D97706',
          550: '#D97706',
          600: '#B45309',
          650: '#B45309',
          700: '#92400E',
          750: '#92400E',
          800: '#78350F',
          850: '#78350F',
          900: '#451A03',
          925: '#451A03',
          950: '#1C0A00',
          975: '#1C0A00',
        },

        // Classic Cinema Palette - Enhanced
        cinema: {
          burgundy: {
            25: '#FEF8F8',
            50: '#FDF2F3',
            75: '#FCE9EA',
            100: '#FCE7E9', 
            150: '#FADDE0',
            200: '#F9D2D7',
            250: '#F6C7CE',
            300: '#F4B0BA',
            350: '#F099A6',
            400: '#EC7A8C',
            450: '#E85D75',
            500: '#E04B66',
            550: '#D63856',
            600: '#CB2A4A',
            650: '#B8253F',
            700: '#A61E42', // Main burgundy
            750: '#941B3A',
            800: '#8B1538', // Dark burgundy
            825: '#7A1230',
            850: '#6B0E26',
            875: '#5C0B21',
            900: '#4A0A1C',
            925: '#3A0816',
            950: '#2A0510',
            975: '#1A030A',
          },
          gold: {
            25: '#FFFEF8',
            50: '#FFFBF0',
            75: '#FFF8E6',
            100: '#FEF6E0',
            150: '#FEF2D1',
            200: '#FDEBC1',
            250: '#FCE4B0',
            300: '#FBDC96',
            350: '#F9D47B',
            400: '#F8C969',
            450: '#F6BE56',
            500: '#F5B642',
            550: '#F0AC3A',
            600: '#E6C08A', // Light gold
            650: '#DEB57D',
            700: '#D4A574', // Main gold
            750: '#CA9A6B',
            800: '#B8925E', // Dark gold
            825: '#A68856',
            850: '#8B6E3A',
            875: '#7D623D',
            900: '#5D4927',
            925: '#4A3A1F',
            950: '#3A2D18',
            975: '#2A2011',
          },
          copper: {
            25: '#FFFCF8',
            50: '#FDF6F0',
            75: '#FAF0E6',
            100: '#FAEDE0',
            150: '#F7E7D1',
            200: '#F5DCC1',
            250: '#F2D1B0',
            300: '#EFC196',
            350: '#ECB67B',
            400: '#E6A569',
            450: '#E09A56',
            500: '#D48F42',
            550: '#C8853A',
            600: '#C87F35',
            650: '#BC7530',
            700: '#B87333', // Main copper
            750: '#A6682E',
            800: '#935F2A',
            825: '#865725',
            850: '#6F4720',
            875: '#633F1C',
            900: '#4A2F15',
            925: '#3A2510',
            950: '#2A1B0C',
            975: '#1A1108',
          },
          orange: {
            25: '#FFFEF8',
            50: '#FFF8F0',
            75: '#FFF3E6',
            100: '#FFEFDC',
            150: '#FFE9CC',
            200: '#FFDCB8',
            250: '#FFCFA3',
            300: '#FFC28A',
            350: '#FFB570',
            400: '#FFA84D',
            450: '#FF9E33',
            500: '#FF8C00', // Main orange
            550: '#FF8000',
            600: '#E67E00',
            650: '#D97706',
            700: '#CC7000',
            750: '#BF6600',
            800: '#B8640A',
            825: '#A55C09',
            850: '#945214',
            875: '#824911',
            900: '#522D08',
            925: '#412306',
            950: '#301A05',
            975: '#201103',
          },
          cream: {
            25: '#FFFFFF',
            50: '#FEFEFE',
            75: '#FDFDFC',
            100: '#FDFDFC',
            150: '#FAFAF8',
            200: '#F8F6F0', // Main cream
            250: '#F5F3EC',
            300: '#F0EDE4',
            350: '#ECEA E1',
            400: '#E8E3D8',
            450: '#E3DDD0',
            500: '#DDD6C7',
            550: '#D6CEB7',
            600: '#CFC5B0',
            650: '#C7BC9F',
            700: '#BFB298',
            750: '#B5A88A',
            800: '#A69A80',
            825: '#9B8E72',
            850: '#8B8068',
            875: '#7A715A',
            900: '#5A5347',
            925: '#4A4439',
            950: '#3A352B',
            975: '#2A251D',
          },
          charcoal: {
            25: '#FEFEFD',
            50: '#F6F6F5',
            75: '#F3F3F2',
            100: '#EEEEEC',
            150: '#E9E9E6',
            200: '#DDDDD9',
            250: '#D1D1CC',
            300: '#C4C4BF',
            350: '#B7B7B1',
            400: '#A8A29E', // Warm gray
            450: '#9C9691',
            500: '#918B86',
            550: '#857F79',
            600: '#7A746F',
            650: '#6E6862',
            700: '#66605B',
            750: '#5C5651',
            800: '#56504C',
            825: '#4D4743',
            850: '#433E3A',
            875: '#3A3531',
            900: '#2D2B28', // Main charcoal
            925: '#242220',
            950: '#1A1818', // Velvet
            975: '#111010',
          }
        },
        
        // Extended warm tones for light mode
        warmGray: {
          25: '#FFFDF9',
          50: '#FAF9F7',
          100: '#F5F4F2',
          200: '#E8E6E4',
          300: '#D6D3D0',
          400: '#A8A29E',
          500: '#918B86',
          600: '#6B6560',
          700: '#504A45',
          800: '#3A342F',
          900: '#2C1810',
          950: '#1C1410',
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
        'cinema-light': '0 10px 30px -5px rgba(44, 24, 16, 0.15)',
        'cinema-light-lg': '0 20px 40px -5px rgba(44, 24, 16, 0.25)',
        'gold': '0 10px 30px -5px rgba(212, 165, 116, 0.4)',
        'gold-lg': '0 20px 40px -5px rgba(212, 165, 116, 0.6)',
        'gold-light': '0 8px 25px -5px rgba(201, 150, 91, 0.3)',
        'gold-light-lg': '0 15px 35px -5px rgba(201, 150, 91, 0.4)',
        'theater': '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
        'theater-light': '0 25px 50px -12px rgba(44, 24, 16, 0.2)',
        'inner-cinema': 'inset 0 2px 8px rgba(139, 21, 56, 0.1)',
        'inner-cinema-light': 'inset 0 1px 4px rgba(44, 24, 16, 0.08)',
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
        'cinema-gradient-light': 'linear-gradient(135deg, #A61E42 0%, #C9965B 50%, #E67E00 100%)',
        'theater-gradient': 'linear-gradient(180deg, #0F0F0F 0%, #1A1818 50%, #2D2B28 100%)',
        'theater-gradient-light': 'linear-gradient(180deg, #FFFBF7 0%, #F8F4F0 50%, #F2ECE6 100%)',
        'film-strip': 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
        'film-strip-light': 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(44,24,16,0.08) 10px, rgba(44,24,16,0.08) 20px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
    // Enhanced plugin for cinema utilities with better light mode support
    function({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const newUtilities = {
        '.cinema-glass': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background': 'rgba(255, 251, 247, 0.85)',
          'border': '1px solid rgba(201, 150, 91, 0.25)',
          'box-shadow': '0 8px 32px rgba(139, 21, 56, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        '.cinema-glass-dark': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background': 'rgba(26, 24, 24, 0.85)',
          'border': '1px solid rgba(166, 30, 66, 0.2)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 165, 116, 0.1)',
        },
        '.cinema-glass-light': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background': 'rgba(248, 244, 240, 0.90)',
          'border': '1px solid rgba(201, 150, 91, 0.3)',
          'box-shadow': '0 4px 24px rgba(44, 24, 16, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        '.cinema-text-gradient': {
          'background': 'linear-gradient(135deg, #8B1538 0%, #D4A574 50%, #FF8C00 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.cinema-text-gradient-light': {
          'background': 'linear-gradient(135deg, #A61E42 0%, #C9965B 50%, #E67E00 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.cinema-border-gradient': {
          'border-image': 'linear-gradient(135deg, #8B1538, #D4A574, #FF8C00) 1',
        },
        '.cinema-border-gradient-light': {
          'border-image': 'linear-gradient(135deg, #A61E42, #C9965B, #E67E00) 1',
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
        '.film-strip-border-light': {
          'border-image': 'repeating-linear-gradient(90deg, #A61E42, #A61E42 10px, transparent 10px, transparent 20px) 10',
        },
      }
      
      addUtilities(newUtilities)
    },
  ],
}

export default config