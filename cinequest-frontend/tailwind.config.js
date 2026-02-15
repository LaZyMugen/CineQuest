/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#1A1A1A",
        surface: "#262626",
        elevated: "#2F2F2F",
        border: "#3A3A3A",

        accent: "#FFA116",      // warm amber (primary action)
        success: "#22C55E",
        danger: "#EF4444",

        textPrimary: "#F5F5F5",
        textSecondary: "#A3A3A3",
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      borderRadius: {
        lg: "0.75rem",
      },

      boxShadow: {
        subtle: "0 0 0 1px rgba(255,255,255,0.05)",
      },
    },
  },

  plugins: [],
};
