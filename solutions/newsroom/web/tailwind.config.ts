import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Newsroom — a quiet "printed at night" palette: ink, newsprint, brass.
        ink: {
          950: "#0d0f12",
          900: "#12151a",
          850: "#171b22",
          800: "#1d222b",
          700: "#2a313d",
          600: "#3a4250",
        },
        paper: {
          50: "#f5f3ee",
          100: "#e9e6dd",
          300: "#b7b2a6",
          500: "#8a8578",
        },
        brass: {
          DEFAULT: "#c9a24a",
          400: "#d8b766",
          600: "#a8842f",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
