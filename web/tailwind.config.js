/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        red: "#b32428",
        orange: "#d65a1f",
        yellow: "#d$af37",
        teal: "#2e9a8c",
        green: "#3a844b",
        blue: "#295b9c",
        indigo: "#44377a",
        purple: "#6c3ba4",
        pink: "#c656ao",
      },

      fontFamily: {
        viet: ["Be Vietnam Pro", "sans-serif"],
        lexend: ["Lexend", "sans-serif"],
        sora: ["Sora", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
