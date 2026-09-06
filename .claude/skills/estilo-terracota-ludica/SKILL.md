---
name: estilo-terracota-ludica
description: Sistema de diseño único y obligatorio de la plataforma de minijuegos "Mesa & Ficha". Paleta, tipografía, componentes, layout mobile-first + adaptación a web, motion y reglas anti-estética-genérica-de-IA. Derivado del mockup aprobado documentacion/mockups/05_terracota_ludica.html. Cargar SIEMPRE antes de crear, tocar o revisar cualquier pantalla, componente, clase de Tailwind o estilo del frontend.
---

# estilo-terracota-ludica — Sistema de diseño de "Mesa & Ficha"

Única fuente de verdad visual del proyecto. Ninguna pantalla se diseña "a criterio libre": se compone con
lo que ya está definido acá, tomado 1:1 de **`documentacion/mockups/05_terracota_ludica.html`**, que es el
contrato pixel a pixel. Esta skill es su documentación reutilizable.

## Misión

Una interfaz de nivel **premium y profesional** que se sienta **hecha por un estudio de diseño de juegos
de mesa** (tipo Big Potato / Exploding Kittens con dirección de arte real), nunca "generada". Alegre y
táctil, pero contenida y consistente pantalla tras pantalla.

## Contexto técnico que condiciona el diseño

- **Frontend: HTML + CSS + Tailwind** (Tailwind CLI compilando a un stylesheet; nada de CDN en producción).
- **Mobile-first de verdad.** El diseño nace en 360–430px de ancho. La versión web es *opcional* pero, si
  se ve, tiene que verse **igual de profesional**: sin botones estirados de lado a lado, sin tarjetas
  ensanchadas, sin filas con un solo elemento gigante. Todo contenido vive dentro de un contenedor con
  `max-width` y la grilla **reflowa a más columnas**, no infla las celdas.
- Backend: funciones Python en Vercel + Supabase (Postgres + Realtime + Auth anónima). El estado en vivo
  llega por **suscripción a Supabase Realtime** (no WebSocket propio); la UI tiene que tener estados de
  "conectando / reconectando" ya diseñados (no improvisar después). Se prueba en las URL de preview de Vercel.

## Regla de oro: reutilizar, nunca reinventar

Cuando una pantalla necesite un botón, una tarjeta, un chip, un badge, un campo o una animación, la pregunta
**no es** "¿cómo lo diseño?" sino **"¿cuál de los patrones de `references/componentes.md` uso?"**. Si de
verdad falta uno, se deriva de los mismos tokens (`references/tailwind-preset.md`) y se agrega a
`references/componentes.md` para la próxima vez.

## Anti-patrones prohibidos (la estética "por defecto de cualquier LLM")

1. **Ningún morado / lila / violeta**, ni suelto ni en degradé (`from-purple-500 to-pink-500`, `indigo-*`).
   Es la marca del "diseño de IA genérico".
2. **Ningún color primario de librería sin tonalizar** (`bg-blue-500`, `bg-indigo-600`, verdes de manual).
   Todo color sale de la paleta terracota de `references/tailwind-preset.md`.
3. **Ninguna tarjeta "de catálogo"**: `border border-gray-200 rounded-lg shadow-md` repetida en todos
   lados. Acá las superficies llevan **borde de 2px color tinta + sombra dura desplazada** (`shadow-hard`).
4. **Nada de hero centrado con texto en degradé sobre un blob difuminado.** El hero es asimétrico
   (texto + cluster de tiles rotadas), con `mark` sólido sobre la palabra clave.
5. **Nada de degradés de acento como fondo de sección.** Los colores se aplican planos (terracota, mostaza,
   verde-agua, berry) sobre superficies con borde.
6. **Nada de animaciones elásticas / con rebote exagerado.** Todo es `cubic-bezier(.22,1,.36,1)`,
   200–320ms. El hover hace `translate(-2px,-2px)` y **agranda la sombra dura**; el `:active` hace
   `translate(2px,2px)` y la achica. Nunca `overshoot`.
7. **Nunca estética gamer / cyberpunk / neón.** Es cálido y de papel, no de pantalla RGB.
8. **Nunca grillas de tarjetas idénticas.** Composición **bento**: la tarjeta destacada ocupa más, algunas
   celdas van con color de fondo (`terra`/`teal`/`mustard`/`berry`), el resto en `paper`.
9. **Emojis: NO los del repertorio típico de LLM** (🚀 ✨ 🎯 🔥 ✅ 📊 💡 🎉 👍 🙌). **SÍ** el set curado de
   glyphs de abajo (§ "Glyphs curados"), que además rima con juegos de mesa. En texto de UI se prefiere
   **ícono SVG inline** dibujado a mano.
10. **Nunca `Inter` en titulares, números grandes o marca.** Titulares y nombres de juego usan
    **Bricolage Grotesque** (700–800). Inter es solo cuerpo, labels e inputs.
11. **Nunca un botón/tarjeta que ocupe el 100% del ancho en desktop** solo porque en mobile lo hacía.
    En ≥ `md` los CTA vuelven a `w-auto`, las tarjetas entran en grilla.

## Los tres pilares que sí definen esta estética

- **Trazo tinta + sombra dura.** Cada superficie interactiva: `border-2 border-ink` + `shadow-hard`
  (`4px 4px 0 #2b2320`). Es lo que da el aire "impreso / troquelado" en vez de "recortado en Figma".
- **Un acento de marca (terracota) + una paleta de apoyo acotada.** `terra` es marca / CTA / foco. `teal`,
  `mustard` y `berry` son **colores de rol** (estado "en vivo" = teal, "pronto" = mustard, acentos de
  variedad en el bento) — nunca decoración al azar, nunca un quinto color.
- **Rotaciones mínimas e intencionales.** Badges y tiles llevan `rotate(-1.5deg … 9deg)`. Es un gesto de
  marca; no se aplica a texto de cuerpo, tablas, ni a la mesa de juego.

## Paleta (resumen — valores exactos en `references/tailwind-preset.md`)

| Rol | Token | Claro |
|---|---|---|
| Fondo de página | `cream` | `#f6efe2` |
| Superficie hundida (campos, asientos) | `cream-2` | `#efe5d2` |
| Superficie elevada (tarjetas) | `paper` | `#fffaf0` |
| Texto principal / bordes | `ink` | `#2b2320` |
| Texto secundario | `ink-2` | `#6a5d54` |
| Texto terciario / metadatos | `ink-3` | `#9a8a7d` |
| **Marca / CTA / foco** | `terra` / `terra-2` | `#d9683f` / `#c5552f` |
| Rol: pendiente / "pronto" | `mustard` | `#e0a83e` |
| Rol: en vivo / éxito / listo | `teal` | `#2f8f81` |
| Rol: acento de variedad | `berry` | `#a6425e` |

**Modo oscuro:** no es v1. Cuando se agregue, se define como set de tokens espejo en
`references/tailwind-preset.md` (misma identidad cálida invertida), nunca valores sueltos.

## Tipografía

- **Display / titulares / nombres de juego / números grandes:** `Bricolage Grotesque` 700–800,
  `letter-spacing: -.02em`. Clase: `font-display`.
- **Cuerpo / labels / inputs / metadatos:** `Inter` 400–600.
- `font-display: swap`, subset latino, self-hosted en `frontend/public/assets/fonts/` (no depender de Google
  Fonts en runtime en producción).

## Radios, bordes, sombras

- Tarjetas medianas `rounded-md` (18px), paneles grandes `rounded-lg` (26px), chips/campos `rounded-sm`
  (12px), pills `rounded-full`.
- Borde estándar de superficie interactiva: `border-2 border-ink`.
- `shadow-hard` = `4px 4px 0 #2b2320` (reposo) · `shadow-hard-lg` = `6px 6px 0` (hover) ·
  `shadow-soft` = `0 10px 30px -12px rgba(43,35,32,.28)` (paneles que no "flotan troquelados": lobby, modales).

## Motion

| Token | Valor | Uso |
|---|---|---|
| Curva | `cubic-bezier(.22,1,.36,1)` (clase `ease-pop`) | Todo. |
| Rápido | 180–220ms | hover, toggles, chips. |
| Base | 260–320ms | cambios de vista, modales, montaje del main del juego. |
| Hover de superficie | `-translate-x-0.5 -translate-y-0.5` + `shadow-hard-lg` | botones, tarjetas. |
| Active | `translate-x-0.5 translate-y-0.5` + sombra chica | botones. |
| Rebote | **prohibido** | — |
| `prefers-reduced-motion` | corta todo a un fade ≤ 120ms; congela fondos y rotaciones animadas | **obligatorio**, ya contemplado en el mockup. |

## Layout — mobile-first y su adaptación a web (no negociable)

Ver `references/componentes.md` → "Shell responsive" para el HTML/clases. Resumen:

- **Contenedor:** todo el contenido dentro de `mx-auto w-full max-w-[1160px] px-6`. En mobile el padding
  baja a `px-4`.
- **Navegación:**
  - **Mobile (< `md`):** barra superior compacta (marca + estado + botón de menú) y **barra inferior fija**
    (`bottom-nav`) con 3–4 destinos e íconos. El menú completo abre como hoja desde abajo.
  - **Web (≥ `md`):** la barra inferior **desaparece**; los destinos pasan a la barra superior como enlaces.
    Nada de dejar la bottom-nav flotando en desktop.
- **Bento del catálogo:** `grid grid-cols-2` en mobile → `md:grid-cols-4` → `xl:grid-cols-6`. La tarjeta
  destacada: `col-span-2 xl:col-span-3`. Las celdas **mantienen `min-h`** y no se estiran de más; si sobra
  ancho, entra otra columna, no se infla la celda.
- **Lobby / sala:** una sola columna en mobile (asientos arriba, compartir abajo); dos columnas
  `lg:grid-cols-[1.15fr_1fr]` en web, con divisor `border-ink`.
- **CTA:** `w-full` en mobile, `sm:w-auto` de ahí en más.
- **Main del juego:** ocupa el alto disponible (`min-h-[100dvh]` menos header), la mesa se centra y escala;
  nunca una mesa chica perdida arriba a la izquierda en desktop.
- **Breakpoints:** los de Tailwind por defecto. El quiebre que importa es `md` (768px): mobile ↔ web.

## Glyphs curados (en vez de los emojis típicos)

**No usar:** 🚀 ✨ 🎯 🔥 ✅ 📊 💡 🎉 👍 🙌 📈 ⚡.
**Sí usar**, con moderación y siempre que un ícono SVG no quede mejor:

| Concepto | Glyph |
|---|---|
| Palos de carta / motivo de marca | `♠ ♥ ♦ ♣` |
| Caras de dado | `⚀ ⚁ ⚂ ⚃ ⚄ ⚅` |
| Ficha / peón / jugadores | `⚇ ♟ ♞` |
| Sala / mesa / marca | `◈ ⊞` |
| Iniciar / turno / "play" | `▷ ❭` |
| Invitar / enviar | `➜` |
| Hecho / copiado / listo | `✓` |
| Anfitrión / destacado | `★ ◆` |
| En vivo (con animación de pulso) | `◉` |
| Slot / silla abierta | `＋` |
| Ta-Te-Ti | `⊗` |
| Tiempo | `◔ ◑ ◕` |

## Componentes de estado que ya tienen que estar diseñados

Antes de programar la primera pantalla con datos en vivo, existen (ver `references/componentes.md`):
`badge de estado` (en vivo / pronto / bloqueado / en espera), `chip de conexión` (conectado / reconectando /
caído), `slot vacío` (silla abierta), `campo de compartir` (valor + botón copiar con feedback `copiado ✓`),
`botón WhatsApp`, `botón iniciar (solo-host)`, `skeleton shimmer`, `estado vacío` y `estado de error de sala`.

## Archivos de referencia

- **`references/tailwind-preset.md`** — `tailwind.config` completo (colores, fuentes, radios, sombras,
  keyframes), el `@layer base` y el `@layer components` con todas las clases (`.btn`, `.card-chunky`,
  `.chip`, `.badge-state`, `.field`, `.bottom-nav`, …). Copiar de ahí, no reinventar.
- **`references/componentes.md`** — HTML + clases de cada patrón: shell responsive (topbar + bottom-nav),
  hero, módulo "unirse con código", bento del catálogo, sala de espera (asientos + compartir + WhatsApp +
  iniciar), overlay de resultado, y los estados (conexión, error, vacío, skeleton).

Antes de escribir la primera línea de una pantalla: leer las dos referencias. Es más rápido adaptar un
patrón resuelto que reinventarlo y caer, sin querer, en la estética genérica que esta skill existe para evitar.
