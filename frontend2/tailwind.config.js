/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'custom-green': '#07492C',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

