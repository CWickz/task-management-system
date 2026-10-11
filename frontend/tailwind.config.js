/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Must be 'class' (not media, and not inside theme)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}