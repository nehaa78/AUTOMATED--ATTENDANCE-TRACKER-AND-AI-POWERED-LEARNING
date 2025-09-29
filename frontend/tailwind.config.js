/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cse-blue': '#1e40af',
        'cse-dark': '#1e3a8a',
      },
    },
  },
  plugins: [],
}












