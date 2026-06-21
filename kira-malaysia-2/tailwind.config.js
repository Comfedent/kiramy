/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        graphite: "#111827",
        mist: "#eef4ff",
        neon: "#7cffc4",
        cobalt: "#2764ff",
        violet: "#8b5cf6"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(39,100,255,0.18)"
      }
    }
  },
  plugins: []
};
