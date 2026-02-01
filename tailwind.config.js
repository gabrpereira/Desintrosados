
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00B8A9',
        secondary: '#00635B',
        dark: '#021311',
        accent: '#FBCC01',
        surface: {
          light: '#f8fafc',
          dark: '#020d0c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      animation: {
        'in': 'animate-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
