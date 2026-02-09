/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cult-dark': '#0f1115',
        'cult-card': '#1c1e26',
        'cult-green': '#D2FF44', // Neon Volt Green
        'cult-blue': '#449DFF',
        'cult-orange': '#FF6B44',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
