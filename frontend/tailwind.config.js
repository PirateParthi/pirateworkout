/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pirate: {
          50: '#f6f8fb',
          100: '#ebf1f7',
          200: '#d3e0ee',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#0f172a',
          900: '#0b0f19',
          accent: '#06b6d4',
          gold: '#f59e0b',
          crimson: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
