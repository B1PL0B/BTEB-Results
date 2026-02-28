/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'primary': '#4f46e5',
        'secondary': '#ec4899',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
