# Componentes — "Mesa & Ficha"

Patrones con comportamiento fijo. Se copian y se les cambia el contenido, no se reinterpretan pantalla por
pantalla. Todo sale de `documentacion/mockups/05_terracota_ludica.html`. Las clases están en
`references/tailwind-preset.md`.

---

## Shell responsive (topbar + bottom-nav)

Regla: **mobile** = topbar compacta + `bottom-nav` fija. **Web (≥ md)** = topbar con enlaces, `bottom-nav`
oculta (`md:hidden`).

```html
<!-- Topbar -->
<header class="sticky top-0 z-30 border-b-2 border-ink bg-cream/90 backdrop-blur">
  <div class="container max-w-[1160px] flex items-center gap-4 py-3">
    <a href="/" class="font-display font-extrabold text-xl tracking-[-.02em] flex items-center gap-2.5">
      <span class="w-9 h-9 grid place-items-center rounded-[11px] border-2 border-ink bg-terra text-paper
                   text-base shadow-hard -rotate-3">◈</span>
      Mesa &amp; Ficha
    </a>

    <!-- enlaces: solo visibles en web -->
    <nav class="ml-auto hidden md:flex gap-1">
      <a href="#catalogo" class="px-3 py-2 rounded-[9px] text-sm font-semibold text-ink-2 hover:bg-cream-2">Juegos</a>
      <a href="#lobby"    class="px-3 py-2 rounded-[9px] text-sm font-semibold text-ink-2 hover:bg-cream-2">Salas</a>
      <a href="/creditos" class="px-3 py-2 rounded-[9px] text-sm font-semibold text-ink-2 hover:bg-cream-2">Créditos</a>
    </nav>

    <!-- estado en vivo: siempre; en mobile queda a la derecha -->
    <span class="pill ml-auto md:ml-2"><span class="dot"></span> 7 salas</span>

    <!-- botón menú: solo mobile -->
    <button class="md:hidden btn !p-2 !shadow-hard-sm" aria-label="Menú" data-sheet="menu">☰</button>
  </div>
</header>

<!-- Bottom nav: solo mobile -->
<nav class="bottom-nav" aria-label="Navegación">
  <a href="/"          aria-current="page"><span class="text-lg leading-none">◈</span>Inicio</a>
  <a href="#catalogo"><span class="text-lg leading-none">♠</span>Juegos</a>
  <a href="#lobby"><span class="text-lg leading-none">⚇</span>Salas</a>
  <a href="/perfil"><span class="text-lg leading-none">★</span>Perfil</a>
</nav>

<!-- el <main> lleva padding-bottom en mobile para no quedar tapado por la bottom-nav -->
<main class="container max-w-[1160px] pb-24 md:pb-12"> … </main>
```

- **Nunca** dejar la `bottom-nav` visible en desktop, ni la topbar sin enlaces en desktop.
- El menú-hoja (mobile) sube desde abajo con `animate-slide-up`, backdrop translúcido que cierra al tocar
  afuera (no oscurecido a negro pleno: `bg-ink/20`).

---

## Hero

Asimétrico: texto a la izquierda, cluster de tiles rotadas a la derecha. En mobile el cluster va **arriba**
(`order-first`) y más chico.

```html
<section class="grid gap-10 py-12 md:py-16 md:grid-cols-[1.05fr_.95fr] items-center">
  <div>
    <span class="badge-rot">◉ sin descargar nada</span>
    <h1 class="font-display font-extrabold leading-[1.02] tracking-[-.025em]
               text-[clamp(2.5rem,5.6vw,4rem)] my-4">
      Abrí la mesa,<br>pasá el <mark class="bg-terra text-paper px-1 rounded-lg
        [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">código</mark>,<br>que jueguen todos.
    </h1>
    <p class="text-ink-2 text-[1.03rem] leading-relaxed max-w-[44ch]">
      Ta-te-ti, chinchón, ahorcado y batalla naval. Para dos a cuatro. Compartís el código por WhatsApp
      y cuando están todos, el anfitrión aprieta arrancar.
    </p>
    <div class="flex flex-wrap gap-3 mt-6">
      <button class="btn btn-primary btn-full">Crear sala rápida ▷</button>
      <a href="#catalogo" class="btn btn-full">Ver los juegos</a>
    </div>
  </div>

  <div class="relative h-[280px] md:h-[330px] order-first md:order-none">
    <!-- tiles: posición y rotación inline; color de token -->
    <div class="absolute left-2 top-10 w-[150px] h-[196px] grid place-items-center border-2 border-ink
                rounded-[20px] bg-paper text-terra font-display font-extrabold text-[62px] shadow-hard
                -rotate-[8deg]">♠</div>
    <div class="absolute right-4 top-0 w-[132px] h-[132px] grid place-items-center border-2 border-ink
                rounded-[20px] bg-teal text-paper font-display font-extrabold text-[46px] shadow-hard
                rotate-[7deg]">⚄</div>
    <div class="absolute right-0 bottom-6 w-[120px] h-[120px] grid place-items-center border-2 border-ink
                rounded-[20px] bg-mustard text-ink font-display font-extrabold text-[44px] shadow-hard
                -rotate-[5deg]">♦</div>
    <div class="absolute left-[120px] bottom-0 w-[104px] h-[104px] grid place-items-center border-2
                border-ink rounded-[20px] bg-berry text-paper font-display font-extrabold text-[40px]
                shadow-hard rotate-[9deg]">⚇</div>
  </div>
</section>
```

---

## Módulo "Unirse con código"

```html
<section class="panel !shadow-soft p-5 grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center my-2">
  <div>
    <h3 class="font-display font-extrabold text-[17px]">¿Te pasaron un código?</h3>
    <p class="text-ink-3 text-[12.5px] mt-0.5">Pegalo y entrás a la sala de espera.</p>
  </div>
  <input class="field" placeholder="LUDO-M4XQ" aria-label="Código de sala"
         inputmode="text" autocapitalize="characters" spellcheck="false" maxlength="12">
  <button class="btn btn-primary btn-full">Unirme ➜</button>
</section>
```

---

## Bento del catálogo

```html
<section id="catalogo">
  <div class="flex flex-wrap items-center justify-between gap-3 my-5">
    <h2 class="font-display font-extrabold text-[1.75rem]">Elegí tu juego</h2>
    <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo">
      <button class="chip" aria-pressed="true">Todos</button>
      <button class="chip" aria-pressed="false">Cartas</button>
      <button class="chip" aria-pressed="false">Dados</button>
      <button class="chip" aria-pressed="false">Tablero</button>
      <button class="chip" aria-pressed="false">Palabras</button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
    <!-- destacada -->
    <article class="card-chunky is-link col-span-2 xl:col-span-3 min-h-[224px] p-5 flex flex-col
                    justify-between bg-terra text-paper" role="button" tabindex="0">
      <span class="badge-state badge-live absolute top-4 right-4"><span class="dot"></span>3 salas</span>
      <span class="font-display font-extrabold text-[30px]">⊗</span>
      <div>
        <h4 class="font-display font-extrabold text-2xl">Ta-Te-Ti</h4>
        <p class="text-paper/80 text-xs mt-1 font-medium">2 jugadores · o contra el bot</p>
      </div>
    </article>

    <!-- normal con color de rol -->
    <article class="card-chunky is-link col-span-2 xl:col-span-3 min-h-[156px] p-5 flex flex-col
                    justify-between bg-teal text-paper" role="button" tabindex="0">
      <span class="badge-state badge-live absolute top-4 right-4"><span class="dot"></span>1 sala</span>
      <span class="font-display font-extrabold text-[30px]">⚄</span>
      <div><h4 class="font-display font-extrabold text-lg">Generala</h4>
        <p class="text-paper/80 text-xs mt-1 font-medium">2 a 6 · cinco dados</p></div>
    </article>

    <!-- normal en paper -->
    <article class="card-chunky is-link col-span-2 xl:col-span-2 min-h-[156px] p-5 flex flex-col
                    justify-between" role="button" tabindex="0">
      <span class="badge-state absolute top-4 right-4">Activo</span>
      <span class="font-display font-extrabold text-[30px]">♣</span>
      <div><h4 class="font-display font-extrabold text-lg">Chinchón</h4>
        <p class="text-ink-3 text-xs mt-1 font-medium">2 a 4</p></div>
    </article>

    <!-- bloqueada -->
    <article class="card-chunky col-span-2 xl:col-span-2 min-h-[156px] p-5 flex flex-col justify-between
                    opacity-50 pointer-events-none">
      <span class="badge-state badge-lock absolute top-4 right-4">Bloqueado</span>
      <span class="font-display font-extrabold text-[30px]">⚀</span>
      <div><h4 class="font-display font-extrabold text-lg">Dudo</h4>
        <p class="text-ink-3 text-xs mt-1 font-medium">2 a 6</p></div>
    </article>
  </div>
</section>
```

- Colores de fondo permitidos en celdas: `bg-terra` (solo la destacada / juego insignia), `bg-teal`,
  `bg-mustard`, `bg-berry`. El resto en `paper`. No más de 2–3 celdas con color por vista.
- Estado: `badge-live` (teal, con dot), `badge-soon`/"Pronto" (mustard), `badge-lock` (gris), sin badge = activo.

---

## Sala de espera (lobby)

```html
<div class="panel my-6">
  <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-cream px-5 py-4">
    <span class="font-display font-extrabold text-base">Chinchón · <span class="text-terra-2">CHIN-7K2P</span></span>
    <span class="flex items-center gap-2">
      <span class="badge-state badge-wait">En espera</span>
      <span class="text-ink-3 text-xs font-bold">3 / 4</span>
    </span>
  </div>

  <div class="grid lg:grid-cols-[1.15fr_1fr]">
    <!-- asientos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 lg:border-r-2 lg:border-ink border-b-2 lg:border-b-0 border-ink">
      <div class="seat"><span class="pic bg-terra text-paper">◈</span>
        <span><span class="font-bold text-[13.5px]">Sofía <span class="text-terra-2">★</span></span><br>
        <span class="text-teal text-[11px] font-bold">✓ lista</span></span></div>
      <div class="seat"><span class="pic bg-teal text-paper">♞</span>
        <span><span class="font-bold text-[13.5px]">Nacho</span><br>
        <span class="text-teal text-[11px] font-bold">✓ listo</span></span></div>
      <div class="seat"><span class="pic bg-mustard">♟</span>
        <span><span class="font-bold text-[13.5px]">Vicky</span><br>
        <span class="text-ink-3 text-[11px]">conectando…</span></span></div>
      <div class="seat seat--empty">＋ silla libre</div>
    </div>

    <!-- compartir -->
    <div class="flex flex-col gap-3 p-5">
      <div>
        <label class="text-[11px] font-extrabold uppercase tracking-[.08em] text-ink-3">Código para dictar</label>
        <div class="flex items-center gap-2 border-2 border-ink rounded-sm bg-cream-2 px-3 py-2.5 text-[13px] mt-1">
          <span class="flex-1 font-extrabold tracking-[.06em]">CHIN-7K2P</span>
          <button class="btn !py-1.5 !px-2.5 !text-[11px] !shadow-hard-sm" data-copy="CHIN-7K2P">copiar</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-extrabold uppercase tracking-[.08em] text-ink-3">Enlace directo</label>
        <div class="flex items-center gap-2 border-2 border-ink rounded-sm bg-cream-2 px-3 py-2.5 text-[13px] mt-1">
          <span class="flex-1 font-semibold text-ink-2 truncate">mesayficha.club/t/CHIN-7K2P</span>
          <button class="btn !py-1.5 !px-2.5 !text-[11px] !shadow-hard-sm"
                  data-copy="https://mesayficha.club/t/CHIN-7K2P">copiar</button>
        </div>
      </div>
      <button class="btn btn-teal w-full" data-wa
              data-wa-text="Te invito a jugar al Chinchón ➜ https://mesayficha.club/t/CHIN-7K2P">
        Compartir por WhatsApp ➜
      </button>
      <button class="btn btn-primary w-full mt-auto" data-start>Empezar la partida ▷</button>
      <p class="text-ink-3 text-[11px] text-center">Solo la anfitriona puede iniciar</p>
    </div>
  </div>
</div>
```

Comportamiento JS (mínimo, vanilla):

```js
// copiar
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  try{ await navigator.clipboard.writeText(b.dataset.copy); }catch{}
  const t=b.textContent; b.textContent="copiado ✓";
  setTimeout(()=>b.textContent=t,1400);
}));
// whatsapp
document.querySelectorAll("[data-wa]").forEach(b=>b.addEventListener("click",()=>{
  window.open("https://wa.me/?text="+encodeURIComponent(b.dataset.waText),"_blank","noopener");
}));
// filtros
document.querySelectorAll('[aria-label="Filtrar por tipo"] .chip').forEach(c=>c.addEventListener("click",()=>{
  c.parentElement.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed","false"));
  c.setAttribute("aria-pressed","true");
}));
```

- El botón "Empezar la partida" (`[data-start]`) **solo se renderiza si el jugador local es el host**, y
  arranca `disabled` hasta que se cumplen `minJugadores` + todos "listos".

---

## Overlay de resultado (fin de partida)

```html
<div class="fixed inset-0 z-50 grid place-items-center bg-ink/30 backdrop-blur-sm p-6">
  <div class="panel !shadow-soft-lg max-w-sm w-full p-7 text-center animate-slide-up">
    <div class="font-display font-extrabold text-[44px] text-terra">✦</div>
    <h3 class="font-display font-extrabold text-2xl mt-1">¡Ganó Sofía!</h3>
    <p class="text-ink-2 text-sm mt-1">Chinchón · 88 a 100</p>
    <div class="flex flex-col gap-2.5 mt-5">
      <button class="btn btn-primary w-full">Revancha ▷</button>
      <button class="btn w-full">Volver al portal</button>
    </div>
  </div>
</div>
```

---

## Estados obligatorios (diseñados antes de programar datos en vivo)

### Chip de conexión

```html
<span class="badge-state badge-live"><span class="dot"></span> Conectado</span>
<span class="badge-state badge-wait">Reconectando…</span>
<span class="badge-state" style="background:#a6425e;color:#fffaf0;border-color:#2b2320">Sin conexión</span>
```

### Estado de error de sala

```html
<section class="panel !shadow-soft max-w-md mx-auto my-16 p-8 text-center">
  <div class="font-display font-extrabold text-[40px] text-berry">⊘</div>
  <h3 class="font-display font-extrabold text-xl mt-2">Esa sala ya no está disponible</h3>
  <p class="text-ink-2 text-sm mt-1">Puede haber terminado o el anfitrión la cerró.</p>
  <button class="btn btn-primary btn-full mt-5">Crear una sala nueva ▷</button>
</section>
```

### Estado vacío (sin salas activas de un juego)

```html
<div class="text-center text-ink-3 py-10">
  <div class="font-display font-extrabold text-3xl">◈</div>
  <p class="text-sm mt-2 font-semibold">Todavía no hay partidas abiertas. Creá la primera.</p>
</div>
```

### Skeleton de tarjeta (carga del catálogo)

```html
<div class="skeleton col-span-2 min-h-[156px]"></div>
```
