/** @type {import('tailwindcss').Config} */
// Preset de "Mesa & Ficha" — fuente de verdad: .claude/skills/estilo-terracota-ludica/references/tailwind-preset.md
// Tailwind CSS v3.4. Vive en la raíz del repo. Se compila con `npm run build:css` (script en package.json),
// que Vercel corre en el build. El CLI se ejecuta desde la raíz.
module.exports = {
  content: [
    "./frontend/public/**/*.{html,js}",
    "./frontend/src/**/*.{html,js}",
    "!./frontend/public/vendor/**", // libs vendorizadas: no escanear
    "!./frontend/public/app.css",
  ],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "1.5rem" } },
    extend: {
      colors: {
        cream: { DEFAULT: "#f6efe2", 2: "#efe5d2" },
        paper: "#fffaf0",
        ink: { DEFAULT: "#2b2320", 2: "#6a5d54", 3: "#9a8a7d" },
        terra: { DEFAULT: "#d9683f", 2: "#c5552f" },
        mustard: "#e0a83e",
        teal: "#2f8f81",
        berry: "#a6425e",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { sm: "12px", md: "18px", lg: "26px" },
      boxShadow: {
        hard: "4px 4px 0 #2b2320",
        "hard-lg": "6px 6px 0 #2b2320",
        "hard-sm": "2px 2px 0 #2b2320",
        soft: "0 10px 30px -12px rgba(43,35,32,.28)",
        "soft-lg": "0 20px 50px -18px rgba(43,35,32,.34)",
      },
      transitionTimingFunction: { pop: "cubic-bezier(.22,1,.36,1)" },
      transitionDuration: { 250: "250ms", 280: "280ms" },
      keyframes: {
        bob: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(.5)" } },
        pulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        bob: "bob 1.6s cubic-bezier(.22,1,.36,1) infinite",
        pulse: "pulse 2s cubic-bezier(.22,1,.36,1) infinite",
        "slide-up": "slide-up .28s cubic-bezier(.22,1,.36,1)",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
