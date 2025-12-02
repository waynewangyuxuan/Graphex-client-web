/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F3EBE0',
          300: '#E6D9C6',
          400: '#C9B89A',
          500: '#A89274',
          600: '#8B7355',
          700: '#6B5A45',
          800: '#4A3F32',
          900: '#2D261E',
        },
        terra: {
          400: '#E07B5A',
          500: '#C96442',
          600: '#B54D2E',
          700: '#8B3A22',
        },
        accent: {
          400: '#2D9B8A',
          500: '#0F766E',
          600: '#0C5D58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(107, 90, 69, 0.06)',
        'warm-md': '0 2px 4px rgba(107, 90, 69, 0.06), 0 4px 12px rgba(107, 90, 69, 0.04)',
        'warm-lg': '0 4px 8px rgba(107, 90, 69, 0.08), 0 8px 24px rgba(107, 90, 69, 0.06)',
      },
    },
  },
  plugins: [],
}
