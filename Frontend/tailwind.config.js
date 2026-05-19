/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd1ff",
          300: "#8db1ff",
          400: "#5e87ff",
          500: "#3b63f7",
          600: "#2645ec",
          700: "#1f35d3",
          800: "#1f30aa",
          900: "#1f2e85",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)",
        card: "0 1px 0 rgba(0,0,0,0.02), 0 1px 3px rgba(15,23,42,0.06), 0 12px 24px -16px rgba(15,23,42,0.10)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
