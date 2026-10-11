/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#0c0d12", panel: "#14161d", edge: "#262a36", accent: "#8b9cff" },
      fontFamily: { sans: ["var(--font-main)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
