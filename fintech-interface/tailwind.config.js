/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        offwhite: "#f5f5f0",
        brand: {
          50: "#effefb",
          100: "#c8fff4",
          200: "#91feea",
          300: "#53f5dc",
          400: "#20e3cb",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        surface: {
          50: "#f8fafa",
          100: "#f0f2f2",
          200: "#dfe3e3",
          700: "#131818",
          800: "#0a0f0f",
          900: "#050808",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #22d3ee 100%)",
        "gradient-dark": "linear-gradient(135deg, #050808 0%, #042f2e 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(6,182,212,0.1) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(20,184,166,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.06)",
        "card-dark": "0 4px 24px rgba(0,0,0,0.4)",
        premium: "0 20px 60px rgba(0,0,0,0.15)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 2s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "counter-up": "counter-up 1s ease-out",
        ticker: "ticker 20s linear infinite",
        "spin-slow": "spin 12s linear infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "counter-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};