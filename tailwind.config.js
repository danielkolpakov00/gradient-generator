/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Reddit Mono', 'monospace'],
      },
      colors: {
        'custom-bg': '#1a202c',
        'custom-text': '#f7fafc',
      },
    },
  },
  plugins: [],
}