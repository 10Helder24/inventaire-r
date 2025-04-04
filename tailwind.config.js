/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'rgb(209 213 219)',
      }
    },
  },
  plugins: [],
};