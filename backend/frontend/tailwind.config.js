/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#d32f2f',
        'secondary-red': '#b71c1c',
        'accent-gold': '#ffc107',
        'dark-bg': '#1a1a1a',
        'light-bg': '#f5f5f5',
        'text-dark': '#222222',
        'text-light': '#ffffff',
        'text-gray': '#666666',
      },
      fontFamily: {
        sans: ['Open Sans', 'Segoe UI', 'Roboto', 'sans-serif'],
        headline: ['Montserrat', 'sans-serif'],
        'article-title': ['Georgia', 'serif'],
        'article-text': ['Georgia', 'Open Sans', 'sans-serif'],
        menu: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
