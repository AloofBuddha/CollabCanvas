/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#ffffff',
          grid: '#f0f0f0',
        },
      },
    },
  },
  plugins: [],
}

