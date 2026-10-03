/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8e1d5',
          300: '#d7cdbe',
          400: '#b8a994',
          500: '#8c7a65',
        },
        forest: {
          50: '#f1f8f3',
          100: '#deefe3',
          200: '#bfe0ca',
          500: '#348b5c',
          700: '#236340',
          800: '#1b4d32',
          900: '#163f29',
          950: '#0e291b',
        },
        terracotta: {
          DEFAULT: '#b85934',
          50: '#fcf3ee',
          100: '#fae4d7',
          600: '#b85934',
          700: '#9b4524',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
