/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#475569',
          500: '#334155',
          600: '#1C232E',
          700: '#151B23',
          800: '#0f172a',
          900: '#020617',
        },
        surface: {
          DEFAULT: '#FFFBF0',
          card: '#ffffff',
          border: '#F5E6DA',
        },
        gold: {
          DEFAULT: '#D4C4A8',
          light: '#f1ebd9',
          dark: '#b9a584',
        },
        teal: { 
          DEFAULT: '#13325C', 50: '#ecf2fa', 100: '#d3e1f2', 200: '#a7c3e5', 
          300: '#7aa4d8', 400: '#4d86cb', 500: '#2263b6', 600: '#13325C', 
          700: '#0d2443', 800: '#08172b', 900: '#040a13' 
        },
        coral: { DEFAULT: '#e07c5a', light: '#f0a080' },
        cream: { DEFAULT: '#FFFBF0', dark: '#F5E6DA' },
        foyer: {
          ink:       '#0B0D11',
          panel:     '#0E1116',
          card:      '#10141A',
          gold:      '#DDC497',
          goldDeep:  '#C4A771',
          goldLight: '#E7D3AA',
          cream:     '#FBF8F1',
          creamSoft: '#EDE9DF',
          body:      '#E8E4DA',
          muted:     '#8A93A1',
          muted2:    '#6C7480',
          nav:       '#A9AFB9',
        },
        special: {
          cream: '#fefae0',
          sage: '#685952',
          darkSage: '#5a4a44',
          olive: '#333333',
          gold: '#e8bbbb',
          sand: '#f5f0eb',
          muted: '#999999',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        marcellus: ['Marcellus', 'Georgia', 'serif'],
        jost: ['Jost', 'Inter', 'system-ui', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
        karla: ['Karla', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px 0 rgba(0,33,71,0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
      },
      keyframes: {
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
    },
  },
  plugins: [],
}
