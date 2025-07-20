/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        skillsred: "#bd140b",
        centralpink: "#ff3e5b",
        projectsgreen: "#36732e",
        expblue: "639bff",
        contactbrown: "8f563b",
        project1grey: "696a6a",
        project2grey: "75645d",
      },

      fontFamily: {
        pixelify: ["Pixelify Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
