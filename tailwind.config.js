/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'puzzle-primary': '#8c0a35',
        'puzzle-secondary': '#d71857',
        'puzzle-completed': '#1e90ff',
        'puzzle-found': '#ff9f43',
        'puzzle-selected': '#04cdff',
        'puzzle-solved': '#2ed573',
        'puzzle-bg': '#2c3e50',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
