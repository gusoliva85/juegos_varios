# Tailwind preset — "Mesa & Ficha"

Valores exactos tomados de `documentacion/mockups/05_terracota_ludica.html`. Toda pantalla usa **estas**
clases; nada de valores sueltos en `style=""` salvo cálculos de layout puntuales (posición de una tile).

---

## 1. `tailwind.config.js`

> **Tailwind CSS v3.4** (config JS clásico + `@tailwind`/`@layer`). `tailwind.config.js` vive en la **raíz
> del repo**; el CLI se corre desde ahí como `npm run build:css`
> (`tailwindcss -i frontend/src/styles/app.css -o frontend/public/app.css --minify`), y Vercel lo ejecuta
> en cada build.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/public/**/*.{html,js}",
    "./frontend/src/**/*.{html,js}",
    "!./frontend/public/vendor/**",
    "!./frontend/public/app.css",
  ],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "1.5rem" } },
    extend: {
      colors: {
        cream:   { DEFAULT: "#f6efe2", 2: "#efe5d2" },
        paper:   "#fffaf0",
        ink:     { DEFAULT: "#2b2320", 2: "#6a5d54", 3: "#9a8a7d" },
        terra:   { DEFAULT: "#d9683f", 2: "#c5552f" },
        mustard: "#e0a83e",
        teal:    "#2f8f81",
        berry:   "#a6425e",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { sm: "12px", md: "18px", lg: "26px" },
      boxShadow: {
        hard:      "4px 4px 0 #2b2320",
        "hard-lg": "6px 6px 0 #2b2320",
        "hard-sm": "2px 2px 0 #2b2320",
        soft:      "0 10px 30px -12px rgba(43,35,32,.28)",
        "soft-lg": "0 20px 50px -18px rgba(43,35,32,.34)",
      },
      transitionTimingFunction: { pop: "cubic-bezier(.22,1,.36,1)" },
      transitionDuration: { 250: "250ms", 280: "280ms" },
      keyframes: {
        bob:  { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(.5)" } },
        pulse:{ "0%,100%": { opacity: "1" },           "50%": { opacity: ".35" } },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        bob: "bob 1.6s cubic-bezier(.22,1,.36,1) infinite",
        pulse: "pulse 2s cubic-bezier(.22,1,.36,1) infinite",
        "slide-up": "slide-up .28s cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [],
};
```

> Borde por defecto de superficie interactiva: **`border-2 border-ink`** (no existe un color "line" aparte;
> es `ink`). El "hairline" divisor tenue es `border-ink/12`.

---

## 2. Entrada de CSS (`frontend/src/styles/app.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ---- Fuentes self-hosted ---- */
@font-face{
  font-family:"Bricolage Grotesque";
  src:url("/assets/fonts/bricolage-grotesque.woff2") format("woff2");
  font-weight:600 800; font-display:swap;
}
@font-face{
  font-family:"Inter";
  src:url("/assets/fonts/inter.woff2") format("woff2");
  font-weight:400 600; font-display:swap;
}

@layer base{
  :root{ color-scheme:light; }
  html{ scroll-behavior:smooth; }
  body{
    @apply bg-cream text-ink font-sans antialiased;
    background-image:
      radial-gradient(circle at 12% 8%, rgba(224,168,62,.14), transparent 40%),
      radial-gradient(circle at 90% 0%, rgba(47,143,129,.12), transparent 42%);
    background-attachment:fixed;
  }
  h1,h2,h3,h4{ @apply font-display tracking-[-.02em]; }
  ::selection{ @apply bg-terra text-paper; }
  :focus-visible{ @apply outline-none ring-2 ring-terra ring-offset-2 ring-offset-cream; }

  @media (prefers-reduced-motion:reduce){
    *,*::before,*::after{ animation-duration:.001ms!important; animation-iteration-count:1!important;
      transition-duration:.08s!important; scroll-behavior:auto!important; }
  }
}

@layer components{

  /* ---------- Botones ---------- */
  .btn{
    @apply inline-flex items-center justify-center gap-2 select-none cursor-pointer
           border-2 border-ink rounded-[14px] bg-paper text-ink font-bold
           px-5 py-3.5 text-sm shadow-hard transition-all duration-200 ease-pop
           -translate-x-0 -translate-y-0;
  }
  .btn:hover{ @apply -translate-x-0.5 -translate-y-0.5 shadow-hard-lg; }
  .btn:active{ @apply translate-x-0.5 translate-y-0.5 shadow-hard-sm; }
  .btn-primary{ @apply bg-terra text-paper; }
  .btn-teal{ @apply bg-teal text-paper; }
  .btn-full{ @apply w-full sm:w-auto; }
  .btn:disabled{ @apply opacity-50 pointer-events-none shadow-hard translate-x-0 translate-y-0; }

  /* ---------- Tarjeta troquelada ---------- */
  .card-chunky{
    @apply relative border-2 border-ink rounded-md bg-paper shadow-hard
           transition-all duration-200 ease-pop;
  }
  .card-chunky.is-link:hover{ @apply -translate-x-0.5 -translate-y-0.5 shadow-hard-lg cursor-pointer; }

  /* ---------- Panel (lobby, modal): sombra suave, no troquel ---------- */
  .panel{ @apply border-2 border-ink rounded-lg bg-paper shadow-soft overflow-hidden; }

  /* ---------- Campo de texto ---------- */
  .field{
    @apply w-full border-2 border-ink rounded-sm bg-cream-2 px-4 py-3 text-ink font-semibold
           tracking-[.13em] uppercase placeholder:text-ink-3 placeholder:font-medium;
  }
  .field:focus{ @apply outline-none shadow-hard; }

  /* ---------- Chip / filtro ---------- */
  .chip{
    @apply inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper
           px-3.5 py-1.5 text-[13px] font-bold cursor-pointer transition-all duration-200 ease-pop;
  }
  .chip:hover{ @apply -translate-y-0.5; }
  .chip[aria-pressed="true"]{ @apply bg-ink text-cream; }

  /* ---------- Badge de estado ---------- */
  .badge-state{
    @apply inline-flex items-center gap-1.5 border-2 border-ink rounded-full px-2.5 py-0.5
           text-[11px] font-extrabold uppercase tracking-[.04em] bg-cream;
  }
  .badge-live{ @apply bg-teal text-paper; }
  .badge-soon{ @apply bg-mustard text-ink; }
  .badge-wait{ @apply bg-mustard text-ink; }
  .badge-lock{ @apply bg-cream-2 text-ink-3; }
  .badge-live .dot{ @apply w-1.5 h-1.5 rounded-full bg-paper animate-pulse; }

  /* ---------- Pill "en vivo" de la topbar ---------- */
  .pill{
    @apply inline-flex items-center gap-2 border-2 border-ink rounded-full bg-paper
           px-3 py-1.5 text-[13px] font-semibold shadow-hard-sm;
  }
  .pill .dot{ @apply w-2 h-2 rounded-full bg-teal animate-bob; }

  /* ---------- Badge rotado (hero) ---------- */
  .badge-rot{
    @apply inline-flex items-center gap-2 border-2 border-ink rounded-full bg-mustard text-ink
           px-3.5 py-1.5 text-[13px] font-bold shadow-hard -rotate-1;
  }

  /* ---------- Bottom nav (solo mobile) ---------- */
  .bottom-nav{
    @apply md:hidden fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-cream/95 backdrop-blur
           grid grid-cols-4 pb-[env(safe-area-inset-bottom)];
  }
  .bottom-nav a{
    @apply flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-ink-3;
  }
  .bottom-nav a[aria-current="page"]{ @apply text-terra-2; }

  /* ---------- Asiento del lobby ---------- */
  .seat{
    @apply flex items-center gap-3 border-2 border-ink rounded-[14px] bg-cream-2 p-3;
  }
  .seat .pic{
    @apply w-9 h-9 grid place-items-center border-2 border-ink rounded-[11px] bg-paper
           font-display font-extrabold text-sm;
  }
  .seat--empty{ @apply justify-center border-dashed text-ink-3 text-xs font-semibold bg-transparent; }

  /* ---------- Skeleton ---------- */
  .skeleton{ @apply relative overflow-hidden bg-cream-2 rounded-md; }
  .skeleton::after{
    content:""; @apply absolute inset-0 -translate-x-full;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
    animation:shimmer 1.4s infinite;
  }
}
```

---

## 3. Reglas de uso rápidas

- **Contenedor de página:** `<div class="container max-w-[1160px]">` (el plugin `container` ya centra y
  pone el padding responsive definido arriba).
- **CTA:** siempre `class="btn btn-primary btn-full"` — full en mobile, auto en `sm+`.
- **Tarjeta clickeable:** `card-chunky is-link` + `role="button"` + `tabindex="0"`.
- **Grilla bento:** `grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6`; destacada
  `col-span-2 xl:col-span-3 min-h-[224px]`; normales `min-h-[156px]`.
- **Color de fondo de una celda del bento:** agregar `bg-teal text-paper` / `bg-mustard` / `bg-berry
  text-paper` — nunca degradés.
- **Rotaciones:** solo `badge-rot` y las tiles del hero (`-rotate-2`, `rotate-1`, etc. inline). Nunca en
  texto de párrafo, tablas ni la mesa de juego.
- **Divisor tenue:** `border-ink/12`. **Divisor marcado:** `border-2 border-ink`.
