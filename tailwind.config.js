/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#dce8f4',
          200: '#b8d1e8',
          300: '#87b0d7',
          400: '#4f87c1',
          500: '#2d66a4',
          600: '#1e3a5f',
          700: '#183050',
          800: '#142842',
          900: '#112137',
        },
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#16a34a',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
