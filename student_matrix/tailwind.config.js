/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: { ink: '#050609', cyan: '#00E5FF', violet: '#5A00FF', panel: '#10111A' },
      },
      animation: { 'spin-medium': 'spin 14s linear infinite' },
    },
  },
  plugins: [],
};
