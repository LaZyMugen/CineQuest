import plugin from "tailwindcss/plugin";

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
        bg: "#1A1A1A",
        card: "#262626",
        border: "#3A3A3A",
        muted: "#9ca3af",
        accent: "#ffa116",
        success: "#00b86b",
        danger: "#ef4444",
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
      },

      borderRadius: {
        lg: "0.75rem",
      },

      boxShadow: {
        subtle: "0 0 0 1px rgba(255,255,255,0.05)",
      },
    },
  },

  plugins: [
    plugin(({ addBase, theme }) => {
      addBase({
        ":root": {
          "--cq-bg": theme("colors.bg"),
          "--cq-card": theme("colors.card"),
          "--cq-border": theme("colors.border"),
          "--cq-muted": theme("colors.muted"),
          "--cq-accent": theme("colors.accent"),
          "--cq-success": theme("colors.success"),
          "--cq-danger": theme("colors.danger"),
        },
      });
    }),
  ],
};
  0






































































































































































































































































































































































































































