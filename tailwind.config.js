/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'VT323': ['"VT323"', 'ui-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'),],
}
