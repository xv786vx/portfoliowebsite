/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ptsans: ["PT Sans", "sans-serif"],
        sans: ["PT Sans", "sans-serif"], // Make PT Sans the default sans font
      },
    },
  },
  plugins: [],
};
