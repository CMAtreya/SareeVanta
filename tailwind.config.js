/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF3E4',
          50: '#FDFBF7',
          100: '#FAF3E4',
          200: '#F5EBD4',
          300: '#EDE0C0',
          deep: '#F3E8D6',
        },
        charcoal: {
          DEFAULT: '#1F1B16',
          muted: 'rgba(31, 27, 22, 0.7)',
          50: '#F7F6F5',
          100: '#EBE9E6',
          200: '#D5D1CB',
          300: '#B0AAA0',
          400: '#7E766B',
          500: '#5C5449',
          600: '#474037',
          700: '#353029',
          800: '#26221D',
          900: '#1F1B16',
        },
        terracotta: {
          DEFAULT: '#C87F4A',
          50: '#FDF6F2',
          100: '#FBE9DF',
          200: '#F6D2C0',
          300: '#EEB197',
          400: '#DC966B',
          500: '#C87F4A',
          600: '#B36737',
          700: '#944D26',
          800: '#773D21',
          900: '#62341E',
        },
        gold: {
          DEFAULT: '#B8892B',
          300: '#E8D5A3',
          400: '#D9C187',
          500: '#B8892B',
          600: '#9E7422',
          700: '#7D5A18',
        },
      },
      fontFamily: {
        heading: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-cormorant)', 'Cormorant Garamond', 'Playfair Display', 'serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      boxShadow: {
        'silk': '0 10px 30px -10px rgba(31, 27, 22, 0.08)',
        'silk-lg': '0 20px 45px -12px rgba(31, 27, 22, 0.14)',
        'gold-glow': '0 0 25px -4px rgba(184, 137, 43, 0.28)',
      },
    },
  },
  plugins: [],
};
