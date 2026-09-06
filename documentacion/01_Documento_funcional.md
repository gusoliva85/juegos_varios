# 01 · Documento Funcional — Plataforma de Minijuegos Online

> Documento de producto (el "qué" y el "cómo se resuelve") derivado de la idea inicial del cliente y de
> `Plataforma_Minijuegos_Especificacion_Tecnica.md` (el "con qué stack"). Este documento manda sobre el
> alcance funcional; la spec técnica manda sobre decisiones de infraestructura. Donde haya que elegir algo
> no cerrado, queda marcado en **§13 Decisiones abiertas**.

---

## 1. Resumen ejecutivo

Una **landing page** que funciona como portal de entrada a un catálogo de **minijuegos online casuales**
(cartas, dados, tablero, palabras), pensados para **2 a 4 jugadores** la mayoría, algunos hasta 8.

El recorrido es siempre el mismo, sin importar el juego:

1. El usuario entra a la landing y elige un juego.
2. Se abre una **sesión de ese juego** (una *sala* con un **ID único**).
3. El anfitrión **comparte el ID / enlace / clave** — en primera instancia por **WhatsApp**, o copiándolo
   para pegarlo donde quiera.
4. Los demás jugadores entran con ese dato y quedan en la **sala de espera** (*lobby* de la partida).
5. Cuando están todos, **solo el anfitrión presiona "Jugar"** y arranca la partida.
6. La partida se juega dentro de un **contenedor "main"** que reemplaza la vista de la landing y muestra el
   juego con **su propia estética**, mientras la **estética del portal permanece fija**.

Esa secuencia — sala → compartir → esperar → el host da el play — es **una regla transversal obligatoria**
para el 100% de los juegos.

### Objetivo de este documento

- Definir el comportamiento funcional completo de la plataforma y de una partida.
- Dejar resuelto el **sistema de assets compartidos** (cartas, dados, fichas, tableros) — interno vs. repo externo.
- Entregar el **análisis de fuentes**: de dónde salen las reglas de cada juego, las librerías de tiempo real,
  los repositorios de imágenes, los sonidos y los efectos, **con su licencia y su riesgo**.
- Fijar la dirección de arte (portal fijo + "main" por juego) y el sistema de glyphs curados.

---

## 2. Objetivos y alcance

### 2.1 Objetivos de producto

| # | Objetivo | Métrica de éxito (propuesta) |
|---|---|---|
| O1 | Entrar y jugar en < 20 s desde la landing, sin registro. | Tiempo mediano "landing → primera acción de juego". |
| O2 | Invitar y que el otro se una en 1 toque desde WhatsApp. | % de invitados que llegan a la sala sobre invitaciones enviadas. |
| O3 | Estética "premium" y consistente entre portal y juegos. | Revisión de diseño; 0 pantallas "genéricas". |
| O4 | Agregar un juego nuevo sin tocar el core. | Un juego nuevo = 1 carpeta + 1 registro. |
| O5 | Partida estable en red móvil (reconexión sin perder el lugar). | % de partidas terminadas sin abandono por desconexión. |

### 2.2 Dentro de alcance (v1)

- Landing + catálogo de juegos con estados (activo / próximamente / bloqueado).
- Identidad **anónima** (nombre + avatar elegido), sin login obligatorio.
- Creación/entrada a sala por **ID corto**, **enlace** y **clave**.
- Compartir por **WhatsApp** (deep link `wa.me`) y **copiar al portapapeles**.
- Lobby de partida: lista de jugadores, estado "listo", control de inicio solo para el host.
- Motor de tiempo real autoritario en servidor (según spec técnica).
- 2 juegos "ultraligeros" como prueba de concepto + 1 juego de cartas insignia.
- Sistema de assets compartido (un set base de cartas / dados / fichas).
- Reconexión con *grace period*.
- Modo oscuro/claro del portal (opcional pero recomendado).

### 2.3 Fuera de alcance (v1, backlog)

- Cuentas con progreso persistente, monedas, niveles, desbloqueos por economía.
- Ranking global, torneos, matchmaking con desconocidos.
- Chat de voz. Chat de texto global (sí chat **dentro de la sala**, mínimo).
- Bots/IA para todos los juegos (sí para Ta-Te-Ti y Ahorcado como relleno de sala).
- App nativa (la web responsive es el entregable).
- Compartir por otras redes con tarjetas específicas (se cubre con Open Graph genérico).

---

## 3. Reglas transversales obligatorias

Estas reglas se aplican **a todos los juegos, sin excepción**. Un juego que no las cumpla no se publica.

### R1 · Toda partida vive en una sala con ID único

- Al abrir un juego se crea (o se pide) una **sala**. Nunca se juega "suelto".
- El ID es **corto, legible y pronunciable** para poder dictarlo por teléfono: prefijo del juego + 4–5
  caracteres sin ambigüedad (sin `0/O`, `1/I/L`). Ej.: `TRUCO-7K2P`, `LUDO-M4XQ`.
- El ID es único mientras la sala está viva; se puede reciclar una vez cerrada y expirada.

### R2 · El anfitrión puede compartir de tres formas equivalentes

1. **ID / clave**: el string corto, para dictar o pegar.
2. **Enlace**: `https://<dominio>/jugar/<juego>?sala=<ID>` (abre directo la sala).
3. **Botón WhatsApp**: abre WhatsApp con un texto pre-armado + el enlace (ver §6).

Las tres llevan al mismo lugar. "Copiar" siempre disponible al lado de cada una.

### R3 · Sala de espera antes de jugar

- Al entrar a una sala (creándola o uniéndose) se cae en el **lobby de la partida**: lista de jugadores
  conectados, avatar y nombre, indicador de "conectado/reconectando", y estado **"listo / no listo"**.
- Los cupos vacíos se muestran como **slots abiertos** con el enlace de invitación a mano.
- Si el juego admite bots (Ta-Te-Ti, Ahorcado), el host puede llenar un slot con un bot.

### R4 · Solo el anfitrión inicia la partida

- El botón **"Jugar"** (start) **solo existe para el host**.
- Se habilita cuando se cumplen las condiciones del juego: `jugadoresConectados >= minPlayers` y (según config)
  todos "listos".
- Si el host se va antes de empezar, se **transfiere el rol** al siguiente jugador por orden de llegada.

### R5 · Estética del portal fija, estética del juego dentro del "main"

- El **cascarón del portal** (barra superior, fondos, tipografía de marca, transiciones) es **uno solo** y
  no cambia entre juegos.
- Al iniciar una partida, el contenido central (`<main>`) se reemplaza por la **vista del juego**, que trae
  su propia paleta y clima visual, **contenida** en ese main (no "pinta" toda la página).
- Volver al portal restaura el cascarón sin recargar.

### R6 · Assets base compartidos

- Cartas, dados y fichas usan **un set visual base común** a toda la plataforma (ver §7). Un juego puede
  ofrecer *skins* alternativas, pero el set base siempre existe y es el default.

### R7 · Servidor autoritario

- Ninguna regla, reparto, tirada de dado ni cálculo de puntaje se resuelve en el cliente (spec técnica §3.1
  y §8). El cliente manda **intención**, el servidor responde **estado filtrado**.

### R8 · Reconexión

- Caída de conexión < *grace period* (30–60 s) → el jugador conserva su lugar y su mano; al reconectar se
  **rehidrata** el estado (spec técnica §8.1).

---

## 4. Actores y roles

| Actor | Descripción |
|---|---|
| **Visitante** | Entró a la landing, todavía no eligió juego. |
| **Jugador anónimo** | Eligió nombre + avatar. Identidad efímera guardada en el dispositivo (localStorage) + sesión de servidor. |
| **Anfitrión (host)** | El jugador que creó la sala. Único que ve el botón "Jugar" y controla config de sala. |
| **Invitado** | Jugador que entró con un ID/enlace/clave ajeno. |
| **Espectador** *(opcional, backlog)* | Entra a una sala llena o ya empezada; solo mira. |
| **Bot** | Ocupa un slot en juegos que lo permiten. Lógica en servidor. |

---

## 5. Flujos funcionales

### 5.1 Flujo maestro (feliz)

```
Landing ──► elegir juego ──► ¿tengo sala?
                               │
              ┌────────────────┴─────────────────┐
              │ NO (crear)                       │ SÍ (unirme)
              ▼                                  ▼
   set nombre+avatar (si falta)         pegar ID / abrir enlace / clave
              ▼                                  ▼
   POST crear sala  ─── ID ───►          validar sala (existe / hay cupo / no empezó)
              ▼                                  ▼
        LOBBY DE PARTIDA  ◄──────────────────────┘
   ┌─────────────────────────────────────────────┐
   │ lista jugadores · slots libres · invitar    │
   │ estado listo/no-listo · chat mínimo         │
   │ [host] config de sala · [host] botón JUGAR  │
   └─────────────────────────────────────────────┘
              ▼  (host presiona Jugar, se cumplen condiciones)
        MAIN DEL JUEGO (partida en curso)
              ▼
        FIN DE PARTIDA ──► resumen ──► [revancha] / [volver al portal]
```

### 5.2 Estados de una sala (máquina de estados)

```
                 crear
   (none) ─────────────────►  OPEN ──────────► LOBBY_READY ──────► IN_GAME
                               │  (llega gente)   │  (min. jugadores  │
                               │                  │   + listos)       │
                               │◄─────────────────┘                   │
                               │   (alguien se va y baja del mínimo)  │
                               ▼                                      ▼
                            CLOSED  ◄──────────── FINISHED ◄──────────┘
                          (expira / se     (revancha → vuelve a LOBBY_READY)
                           vacía / host
                           la cierra)
```

| Estado | Qué se puede hacer | Quién |
|---|---|---|
| `OPEN` | Unirse, invitar, elegir avatar, chatear, marcar "listo". | Todos |
| `LOBBY_READY` | Igual que OPEN + iniciar. | Iniciar: **solo host** |
| `IN_GAME` | Jugar. Entrar = espectador (si está habilitado) o rechazo. | Jugadores de la partida |
| `FINISHED` | Ver resumen, pedir revancha, volver al portal. | Todos los de la partida |
| `CLOSED` | Nada. El enlace muestra "sala cerrada" + CTA a crear una nueva. | — |

**Reglas de transición**

- `OPEN → LOBBY_READY`: `conectados >= minPlayers`. Si `requiereTodosListos`, además todos en "listo".
- `LOBBY_READY → OPEN`: cae por debajo del mínimo o alguien saca su "listo".
- `* → CLOSED`: sala vacía por > `TTL_VACIA` (ej. 2 min), o inactiva por > `TTL_INACTIVA` (ej. 30 min),
  o el host la cierra.
- `IN_GAME → FINISHED`: condición de victoria/fin del juego, o todos abandonan.
- `FINISHED → LOBBY_READY`: "revancha" con los mismos jugadores presentes.

### 5.3 Flujo de invitación (detalle)

1. Host abre el panel **"Invitar"** en el lobby.
2. Ve tres bloques: **ID/clave**, **enlace**, **WhatsApp**. Cada uno con "copiar".
3. WhatsApp → abre `https://wa.me/?text=<texto+enlace>` (o `whatsapp://send?text=` en móvil).
4. El invitado abre el enlace → el cliente lee `?sala=<ID>` → pide nombre/avatar si falta → intenta unirse.
5. Validaciones al unirse: sala existe · no está `CLOSED` · hay cupo · (si `IN_GAME`) espectador o rechazo ·
   clave correcta si la sala es privada.
6. Éxito → entra al lobby. Error → pantalla clara con motivo + acción alternativa.

### 5.4 Flujo dentro del "main" del juego

- Transición de entrada: el portal hace *fade/scale* del catálogo y monta el main del juego (lazy-load del
  bundle de ese juego).
- Header mínimo persistente dentro del main: nombre del juego, jugadores, turno actual, botón "salir".
- Fin de partida: overlay de resultado con animación propia del juego (confeti/estrellas curadas, §9), luego
  resumen + acciones.

---

## 6. Compartir por WhatsApp y enlaces

### 6.1 Deep links

| Contexto | URL |
|---|---|
| Móvil (app instalada) | `whatsapp://send?text=<texto>` |
| Universal (web + móvil) | `https://wa.me/?text=<texto>` |
| Con destinatario fijo *(no aplica: invitación abierta)* | `https://wa.me/<num>?text=<texto>` |

`<texto>` = `encodeURIComponent("¡Te invito a jugar <Juego>! Entrá acá 👉 " + enlaceSala)`
(el glyph de invitación sale del set curado, no del emoji genérico — ver §9.4).

### 6.2 Enlace de sala

`https://<dominio>/jugar/<slug-juego>?sala=<ID>[&k=<clave>]`

- `k` solo si la sala es privada; alternativamente la clave se pide en pantalla.
- El enlace es **idempotente**: abrirlo dos veces no crea dos jugadores (se reconcilia por identidad de
  dispositivo).

### 6.3 Open Graph (tarjeta de preview)

Para que el mensaje en WhatsApp muestre una tarjeta linda (spec técnica §3.2), la ruta `/jugar/<juego>`
debe servir meta tags dinámicos:

- `og:title`: `"<Nombre> te invitó a una partida de <Juego>"`
- `og:description`: `"Tocá para unirte. <n>/<max> jugadores en la sala."`
- `og:image`: imagen 1200×630 generada por el juego (mesa/tablero + ID). Puede ser estática por juego en v1
  y dinámica (Edge/Satori) más adelante.

### 6.4 Copiar al portapapeles

- API `navigator.clipboard.writeText`. Fallback: `<input readonly>` + `execCommand`.
- Feedback visual inmediato ("copiado ✓" con el check del set curado).

---

## 7. Sistema de assets compartidos (cartas, dados, fichas, tableros)

### 7.1 Requisitos

- **Un set base único** de cartas (francesas y españolas), dados (d6 y variantes), fichas/peones, y piezas
  de tablero, coherente entre todos los juegos.
- Escalable sin pixelar (móvil chico → desktop grande) → **vector (SVG)** como formato primario.
- Cargable rápido: sprite/atlas o SVG symbols, no 52 requests sueltos.
- **Tematizable**: color de dorso, color de peón, modo claro/oscuro, sin duplicar arte.
- Licencia limpia para uso comercial y redistribución.

### 7.2 Interno vs. repositorio externo — recomendación

| Opción | Pro | Contra |
|---|---|---|
| **Interno al repo** (`/public/assets/...` o paquete `@plataforma/assets`) | Control total, versionado con el código, sin dependencia de terceros, funciona offline. | El repo crece; hay que curar y optimizar a mano. |
| **Repo externo propio** (`plataforma-assets` como submódulo o paquete npm privado) | Reutilizable entre front y game-server, releases independientes, CDN propio. | Un poco más de fricción de setup. |
| **CDN/servicio de terceros** (ej. Deck of Cards API) | Cero mantenimiento de arte. | Dependencia de disponibilidad, sin control de estética, no cumple "estética unificada", latencia. |

**Recomendación:** **assets internos, organizados como paquete versionado** (`packages/assets/` en el
monorepo, publicable como paquete privado si más adelante se separa el game-server). Nada de depender de una
API de imágenes de terceros en runtime: rompe R5/R6 (estética unificada) y agrega un punto de falla.
El arte se **importa una vez** desde fuentes libres (§8.3), se **redibuja/normaliza** al lenguaje visual de
la plataforma, y se **congela** en el paquete.

### 7.3 Estructura propuesta del paquete de assets

```
packages/assets/
  cards/
    french/            # 52 + 2 comodines — baraja francesa (póker, chinchón, uno-like, etc.)
      faces/           # svg symbols: c-2..c-A por palo (♠♥♦♣)
      backs/           # dorsos tematizables (var --back-color)
    spanish/           # 40/48 — baraja española (Truco, Escoba, Chinchón español)
      faces/           # oros, copas, espadas, bastos
      backs/
  dice/
    d6/                # cara 1..6 como paths, pips tematizables
    variants/          # d4 d8 d10 d12 d20 (para juegos futuros de rol/generala extendida)
  tokens/
    pawns/             # peón Ludo/Parchís en 4+ colores (un path, var --token-color)
    checkers/          # damas
    generic/           # discos, meeples
  boards/
    ludo.svg  tateti.svg  damas.svg  batalla-naval.svg  ...
  ui/
    seats/  timers/  spinners/   # ruleta de letras de Tutti Frutti, etc.
  motion/
    deal.json  flip.json  roll.json   # Lottie opcionales para repartir/dar vuelta/tirar
  index.ts             # API tipada: getCard('spanish','espada',7), getDie(6), getBoard('ludo')
  tokens.css           # variables de tematización (--back-color, --token-color, ...)
  LICENSES.md          # procedencia y licencia de cada familia de assets
```

### 7.4 Convenciones

- **Naming**: `baraja/palo/valor` en minúscula ASCII: `spanish/espada/07`, `french/hearts/K`.
- **Formato**: SVG `<symbol>` combinados en 1–2 sprites por baraja + `<use>` en el cliente. Fallback PNG
  atlas solo si algún dispositivo lo pide.
- **Tematización**: colores por `currentColor` y variables CSS (`--back-color`, `--pip-color`,
  `--token-color`), nunca hardcodeados en el path.
- **Peso objetivo**: baraja completa < 60 KB gzip; tablero < 15 KB; set de dados < 8 KB.
- **Accesibilidad**: cada asset expone `aria-label` legible ("7 de espadas").

---

## 8. Análisis de fuentes (de dónde sale todo)

> Antes de usar cualquier recurso: verificar licencia **al momento de integrarlo** y registrar procedencia
> en `LICENSES.md` / `CREDITS.md`. Las notas de licencia de acá son orientativas y hay que reconfirmarlas.

### 8.1 Reglas de los juegos

| Juego | Fuente primaria de reglas | Fuente secundaria / validación | Notas |
|---|---|---|---|
| **Truco argentino** | Reglas caseras estándar (15/30 pts, con/sin flor). | Wikipedia "Truco argentino"; canales/comunidades de truco; libros de juegos de naipes rioplatenses. | Definir de entrada: **con flor / sin flor**, envido/real envido/falta envido, "vale cuatro". Documentar la variante elegida como "reglas de la casa". |
| **Ta-Te-Ti** | Trivial, dominio público. | — | Definir empate y quién empieza. |
| **Ahorcado** | Trivial. Necesita **diccionario/banco de palabras** (ver 8.3). | — | Modo cooperativo vs. competitivo por turnos. |
| **Tutti Frutti / Basta** | Reglas caseras. | Necesita **validación de palabras** (diccionario español) o **votación entre jugadores**. | Categorías configurables; puntaje 10/5/0 clásico. |
| **Ludo / Parchís** | Reglas estándar del Ludo (versión simple). | Wikipedia "Ludo (juego)"; reglamento Parchís. | Definir: salida con 6, comer, casillas seguras, premio por comer/llegar. |
| **Escoba de 15** | Reglas rioplatenses. | Wikipedia "Escoba (juego de naipes)". | Baraja española 40. Bien para 2–4. |
| **Chinchón** | Reglas estándar. | Wikipedia "Chinchón (juego)". | Baraja española (o francesa 52). 2–4. |
| **Dominó** | Reglas estándar (doble-6). | Federaciones de dominó para desempates. | 2–4. |
| **Generala / Yahtzee-like** | Reglas de la Generala (5 dados). | — | 100% dados, calza con el set de assets. 2–4+. |
| **Damas** | Reglas internacionales u "españolas". | FMJD para reglas de competición. | Elegir variante (captura obligatoria, dama voladora). |
| **Batalla naval** | Trivial. | — | Tablero propio, sin assets de baraja. |
| **Dudo / Perudo (mentiroso con dados)** | Reglas de Perudo. | — | 2–6, muy social, buen fit para "compartir por WhatsApp". |

**Formato interno de reglas:** cada juego documenta sus reglas efectivas en
`games/<juego>/RULES.md` + las codifica como **FSM/reducer en el servidor**. Las "reglas de la casa"
configurables van en `games/<juego>/config.ts` bajo `houseRules`.

### 8.2 Tiempo real / conexiones

| Necesidad | Opciones | Licencia | Recomendación |
|---|---|---|---|
| Servidor de salas con estado + sync | **Colyseus** (MIT), **Socket.IO** (MIT), **PartyKit** (MIT, sobre Cloudflare), **Nakama** (Apache-2). | Libres | **Colyseus** para juegos de turnos (rooms, state sync, reconexión y filtrado de estado ya resueltos). Alternativa serverless: **PartyKit** (1 party = 1 sala). Coincide con spec técnica §2.2. |
| Presencia / estado efímero | **Redis** (Upstash) pub/sub, o el propio state del framework. | BSD / servicio | Redis solo si hay varias instancias del game-server. |
| Realtime "managed" (si no se quiere servidor propio) | **Supabase Realtime** (Apache-2), **Ably**, **Pusher**, **Liveblocks**. | Libre / SaaS | Solo para juegos triviales sin lógica secreta; el Truco necesita autoridad de servidor. |
| Transporte | WebSocket (WSS) nativo; fallback long-polling (Socket.IO lo da gratis). | — | — |
| RNG seguro (dados, reparto) | `crypto.randomInt` / CSPRNG del runtime en **servidor**. | — | Nunca `Math.random` para nada que afecte resultado (spec técnica §8.2). |
| IDs de sala | `nanoid` (MIT) con alfabeto sin ambigüedad. | MIT | — |
| Hosting game-server | Render / Railway / Fly.io (procesos stateful). | SaaS | Igual que spec técnica §6. |

### 8.3 Repositorios de imágenes

> Todo lo importado se **re-dibuja/normaliza** al lenguaje visual de la plataforma antes de congelarlo (§7.2).

| Familia | Fuentes candidatas | Licencia (verificar) | Uso |
|---|---|---|---|
| **Baraja francesa (SVG)** | *svg-cards* de David Bellot; *Vector Playing Cards* de Byron Knoll / Adrian Kennard; sets en Wikimedia Commons; `deckofcardsapi.com` (solo referencia visual). | LGPL 2.1 (Bellot) · dominio público (varios de Commons) | Base para póker/chinchón/uno-like. Preferir los de **dominio público** para evitar arrastre de LGPL. |
| **Baraja española (SVG)** | Wikimedia Commons "Baraja española" (varios sets, algunos dominio público); repos GitHub `naipes-espanoles` / `spanish-deck`; naipes de Chile/Argentina en Commons. | Mayormente dominio público / CC0 en Commons; revisar caso por caso | Base para Truco, Escoba, Chinchón. **Ítem de riesgo**: menos sets libres y de buena calidad que la francesa → presupuestar rediseño propio de la baraja española como plan B. |
| **Dados** | Generados como SVG propio (paths triviales); *game-icons.net* (dados); *Kenney "Boardgame Pack"* / "Dice Pack". | game-icons.net CC BY 3.0 · Kenney CC0 | Barato de hacer nativo. Kenney CC0 como referencia. |
| **Fichas / peones / meeples** | *Kenney "Boardgame Pack"* (CC0); SVG propio (un path + variable de color). | CC0 | Hacer nativo, es un path. |
| **Tableros (Ludo, Damas, etc.)** | Diseño propio en SVG (es geometría); referencias en Wikimedia Commons. | Propio | Nativo. |
| **Avatares** | *DiceBear* (colecciones con licencias variadas — filtrar CC0/MIT), *Boring Avatars* (MIT), *multiavatar* (varía), o set ilustrado propio. | MIT / CC0 según colección | **Boring Avatars (MIT)** o set propio: pocos, con estilo, tematizados. |
| **Texturas (fieltro, madera, papel)** | *Kenney*, *ambientCG* (CC0), *Poly Haven* (CC0), generación con CSS/SVG (gradientes + noise). | CC0 | Preferir CSS/SVG procedural por peso; texturas CC0 solo si suman mucho. |
| **Ilustración de marca / hero** | Ilustración propia o *unDraw* (licencia propia permisiva) muy retocada, *Open Peeps* (CC0). | CC0 / permisiva | Cuidar no caer en "estética unDraw genérica". |

### 8.4 Sonido y música

| Tipo | Fuentes | Licencia | Notas |
|---|---|---|---|
| SFX (repartir, flip, dado, ficha, victoria, notificación de jugador) | *Kenney* audio packs (CC0), *freesound.org* (filtrar CC0), *Pixabay* audio, *sonniss.com* GDC bundles. | CC0 preferente | Set corto y consistente (< 15 sonidos), mismo carácter. |
| Música de fondo (loop suave, opcional, mute por defecto) | *Pixabay Music*, *Free Music Archive* (CC), *incompetech* (CC BY), *FreePD* (CC0). | CC0 / CC BY | Un solo loop para el portal + variantes por clima de juego. Silencio por defecto. |
| Motor de audio | *Howler.js* (MIT) o WebAudio nativo. | MIT | Sprite de audio único para minimizar requests. |

### 8.5 Efectos visuales, animación y partículas

| Necesidad | Librería / técnica | Licencia | Notas de performance |
|---|---|---|---|
| Transiciones de UI (montaje del main, cambios de vista) | **CSS transitions/keyframes** + `View Transitions API`; **Motion One** (MIT) o **Framer Motion** (MIT) si se usa React. | MIT | Preferir CSS; JS de animación solo donde CSS no llega. `prefers-reduced-motion` siempre respetado. |
| Cartas / fichas (repartir, volar, dar vuelta) | Transforms 3D CSS (`rotateY`, `translate3d`), `will-change` acotado; **GSAP** (licencia estándar gratuita) para secuencias complejas de reparto. | — | Animar solo `transform` y `opacity`. Nunca `top/left/width`. |
| Confeti / estrellas de victoria | **canvas-confetti** (ISC) con **formas/emoji curados**; o partículas SVG propias. | ISC | Cap de partículas; desmontar al terminar; pausar en `visibilitychange`. |
| Fondo "aurora" / luces del portal | Gradientes cónicos/radiales animados en CSS (`@property` + keyframes), 1 capa de `filter: blur`; **tsParticles** (MIT) solo si se quiere interactividad. | MIT | Fondo en su propia capa `contain: paint`; `@media (prefers-reduced-motion)` lo congela. |
| Glow / neón sobrio | `box-shadow` + `drop-shadow` en capas, sin saturar (no "gamer/cyberpunk"). | — | Evitar `filter` sobre árboles grandes. |
| Micro-animaciones de estado (listo, copiado, jugador entró) | Lottie (**lottie-web**, MIT) con archivos chicos, o SVG SMIL/CSS. | MIT | Lottie solo para 3–4 momentos; si no, CSS. |
| Skeletons / carga | CSS shimmer propio. | — | — |

**Presupuesto de rendimiento (portal):** LCP < 2.5 s en 4G, JS inicial < 150 KB gzip (sin el bundle de un
juego), 60 fps en el fondo animado en gama media, animaciones desactivables. Cada juego carga su bundle
**on-demand** al iniciar la partida.

### 8.6 Iconografía y tipografía

| Elemento | Fuente | Licencia | Regla |
|---|---|---|---|
| Íconos de UI | **Lucide** (ISC), **Phosphor** (MIT), **Tabler** (MIT) — **un solo set**, redibujado a `stroke-width` y `viewBox` consistentes. | ISC / MIT | No mezclar sets. SVG inline. |
| Glyphs de palos / dados / piezas | Caracteres Unicode de ajedrez/cartas/dados (`♠ ♥ ♦ ♣ ♟ ♞ ⚀–⚅`) o SVG propio. | — | Se usan como **motivo gráfico**, no como "emoji de relleno". |
| Tipografía display / marca | Google Fonts con licencia OFL: **Clash Display**/**Cabinet Grotesk** (Fontshare, gratis), **Sora**, **Space Grotesk**, **Bricolage Grotesque**. | OFL / Fontshare | Una display + una de cuerpo. `font-display: swap`, subset. |
| Tipografía de cuerpo | **Inter**, **Geist**, **Instrument Sans** (OFL). | OFL | — |
| Tipografía "temática" por juego (opcional) | Solo dentro del main del juego (ej. una serif para el Truco). | OFL | No afecta al portal. |

### 8.7 Licencias — resumen de política

- **Preferencia**: CC0 / dominio público / MIT / ISC / Apache-2 / OFL.
- **Con cuidado**: CC BY (exige atribución → mantener `CREDITS.md` visible en la landing).
- **Evitar**: CC BY-SA y LGPL en **arte** (contaminan el paquete de assets), CC BY-NC (prohíbe uso comercial),
  cualquier cosa sin licencia explícita.
- Todo asset/ín­dice de terceros → fila en `LICENSES.md` con: qué es, de dónde salió, licencia, link, y si
  fue modificado.

---

## 9. Dirección de arte

### 9.1 Portal (cascarón fijo)

- **Clima**: "club de juegos premium" — mesa de fieltro + materiales nobles (madera, latón/oro viejo,
  papel), no casino chillón ni arcade infantil.
- **Estructura**: barra superior mínima (marca, buscador de juego, avatar, tema) · hero corto con CTA
  "Crear sala rápida" · **catálogo tipo bento** (tarjetas de distinto tamaño, no grilla uniforme) ·
  módulo "Unirse con código" siempre accesible · footer con créditos.
- **Superficies**: vidrio real (blur + ring interior + sombra en capas), no "card de catálogo" con
  `border-gray-200`.
- **Un acento de marca** + un set de estados (en sala / jugando / lleno / próximamente). Sin segundo color
  de marca compitiendo.
- **Prohibido** (estética "IA por defecto): degradés violeta/magenta, hero centrado con texto en degradé
  sobre blob difuminado, grillas de tarjetas idénticas, animaciones con rebote elástico, neón cyberpunk,
  `Inter` en los titulares.

### 9.2 "Main" del juego

- Cada juego define **paleta, textura de mesa, tipografía de apoyo y sonidos**, **contenidos en el main**.
- Comparte: layout de asientos, HUD de turno/tiempo, overlay de resultado, y el **set base de assets**.
- Transición de entrada/salida coherente en todos (mismo timing, misma curva).

### 9.3 Motion tokens (compartidos)

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Casi todo. |
| `--dur-fast` | 160 ms | Hover, toggles. |
| `--dur-base` | 280 ms | Cambios de vista, modales. |
| `--dur-slow` | 480 ms | Montaje del main, reparto. |
| Rebote | **no** | Nada de `spring` con overshoot. |
| `prefers-reduced-motion` | corta todo a fade ≤ 120 ms | Obligatorio. |

### 9.4 Sistema de glyphs curados (en lugar de los emojis típicos de LLM)

**No usar** el repertorio habitual (🚀 ✨ 🎯 🔥 ✅ 📊 💡 🎉 👍). **Sí usar** un set corto y con carácter,
que además rima con "juegos de mesa":

| Concepto | Glyph curado | Alternativa |
|---|---|---|
| Invitar / enviar | `➜` `⤳` | flecha SVG propia |
| Copiado / hecho | `✓` `❯` | check SVG |
| Sala / mesa | `⊞` `◈` | — |
| Jugadores | `♟` `⚇` | — |
| Cartas | `♠ ♥ ♦ ♣` | — |
| Dados | `⚀ ⚁ ⚂ ⚃ ⚄ ⚅` | — |
| Turno / play | `▷` `❭` | — |
| Victoria | `✦` `❖` `⁂` | corona SVG |
| Nuevo / destacado | `✧` `◆` | — |
| Tiempo | `◔ ◑ ◕` | reloj SVG |
| Estado en vivo | `◉` (pulsante) | — |
| Advertencia | `⚠` (uso mínimo) | triángulo SVG |

En texto de UI se prefiere **ícono SVG**; los glyphs Unicode se reservan para acentos tipográficos y para
representar cartas/dados/piezas como motivo.

---

## 10. Modelo de datos (funcional, no de implementación)

```
Jugador (efímero)
  id            # id de dispositivo/sesión
  nombre        # 2–16 chars
  avatarId
  createdAt

Sala
  id            # "TRUCO-7K2P"
  juegoSlug
  estado        # OPEN | LOBBY_READY | IN_GAME | FINISHED | CLOSED
  hostId
  privada       # bool
  clave?        # si privada
  maxJugadores  # de la config del juego
  minJugadores
  houseRules    # opciones elegidas por el host
  jugadores[]   # { jugadorId, asiento, listo, conectado, esBot }
  createdAt, lastActivityAt

Partida (1:1 con Sala mientras IN_GAME/FINISHED)
  salaId
  estadoJuego   # opaco al portal — lo maneja la FSM del juego en servidor
  turnoDe
  resultado?    # ganador(es), puntajes
  startedAt, endedAt
```

- **Persistencia v1**: en memoria del game-server + Redis para TTL/presencia. Sin base relacional
  obligatoria hasta que existan cuentas (backlog).
- **Nada sensible del juego** (manos, mazo) sale del servidor sin filtrar.

---

## 11. Requisitos no funcionales

| Área | Requisito |
|---|---|
| **Rendimiento** | Portal: LCP < 2.5 s / TBT < 200 ms en 4G gama media. JS inicial < 150 KB gz. Bundle de juego on-demand. 60 fps en animaciones de fondo o degradación automática. |
| **Responsive** | Mobile-first. Un breakpoint real (~880 px). Todo jugable con una mano en vertical. |
| **Reconexión** | Grace period 30–60 s configurable por juego. Indicador "reconectando" claro. |
| **Anti-trampa** | Autoridad total de servidor. RNG CSPRNG. Rate-limit de eventos por socket. Validación de turno y de legalidad de cada acción. |
| **Accesibilidad** | Contraste AA. Foco visible. Navegable por teclado en el portal. `aria-label` en assets. `prefers-reduced-motion`. Textos, no solo color, para estados. |
| **i18n** | Español rioplatense por defecto; estructura preparada para otras variantes. Números de sala y reglas localizables. |
| **Moderación** | Filtro básico de nombres. Reporte de jugador (backlog). Sin chat global en v1. |
| **Privacidad** | Identidad anónima, sin PII. Cookie/localStorage mínimos. Aviso claro. |
| **Observabilidad** | Métricas de salas creadas/terminadas/abandonadas, latencia de sync, errores de reconexión. |
| **SEO / share** | SSR o pre-render de `/` y `/jugar/<juego>` con Open Graph. |

---

## 12. Roadmap por fases

Alineado con la spec técnica §7, ajustado a este alcance funcional.

### Fase 0 — Fundaciones (design + esqueleto)
- Aprobar mockup del portal (este entregable).
- Monorepo: `app/` (front), `server/` (game-server), `packages/assets`, `packages/ui`.
- Motion tokens, paleta, tipografía, componentes base del cascarón.
- Paquete de assets: baraja francesa + d6 + peones + 1 tablero, normalizados.

### Fase 1 — Core de salas + PoC
- `GameRegistry`, config por juego, ruteo `/jugar/<slug>?sala=<ID>`.
- Identidad anónima, crear/unirse, lobby, botón "Jugar" solo-host, reconexión.
- Compartir: ID + enlace + WhatsApp + copiar. Open Graph estático.
- **Ta-Te-Ti** y **Ahorcado** como PoC (incluye bots).

### Fase 2 — Juego de cartas insignia
- **Truco argentino** (sin flor primero): FSM de servidor, mesa, cantos, envido, reconexión de mano.
- Baraja **española** normalizada. Sonidos base. Overlay de resultado.
- Open Graph dinámico del Truco.

### Fase 3 — Ampliar catálogo
- **Generala** (aprovecha dados), **Escoba de 15**, **Ludo** (tablero SVG + RNG servidor).
- Skins alternativas de dorso/peón. Música de fondo opcional.

### Fase 4 — Pulido y social
- Revancha, historial de sala, espectadores, chat mínimo en sala.
- Tutti Frutti (validación por votación). Damas / Dominó / Dudo según prioridad.
- Métricas y panel de salud.

### Fase 5 (backlog) — Cuentas y progresión
- Login opcional, progreso, monedas, desbloqueos, ranking. Base relacional.

---

## 13. Decisiones abiertas

> **Actualización (stack cerrado por el cliente):** el despliegue es **Vercel + Supabase**. Frontend
> estático HTML/CSS/Tailwind en Vercel; lógica de juego en **funciones Python de Vercel**; datos, tiempo
> real y auth anónima en **Supabase** (PostgreSQL + Realtime + Auth). Sin servidor WebSocket propio, sin
> SQLite, sin monorepo de paquetes. Las pruebas se hacen en las **URL de preview de Vercel**. El detalle
> técnico está en `02_Documento_Tecnico.md`; el análisis de fuentes de §8.2 queda como referencia histórica.
> El catálogo inicial se acota a **4 juegos** (ver `03_Roadmap.md`).

| # | Decisión | Estado |
|---|---|---|
| D1 | Framework front | **Cerrado:** sin framework — HTML + Tailwind + JS vanilla, estático en Vercel. |
| D2 | Motor realtime | **Cerrado:** Supabase Realtime (Postgres Changes + Presence + Broadcast). |
| D3 | Truco: reglas de la casa | Diferido a Fase 11 (backlog). |
| D4 | Baraja española | Abierto — adaptar set de dominio público vs. dibujar propia (Fase 7). |
| D5 | Assets | **Cerrado:** internos en `frontend/public/assets/`. |
| D6 | Avatares | Abierto — Boring Avatars (MIT) vs. set propio (Fase 1). |
| D7 | Salas privadas en v1 | **Cerrado:** el ID funciona como clave; privada explícita más adelante. |
| D8 | Espectadores en v1 | **Cerrado:** a Fase 9. |
| D9 | Música de fondo | **Cerrado:** sí, muteada por defecto (Fase 9, opcional). |
| D10 | Persistencia | **Cerrado:** Supabase PostgreSQL desde el día 1. |
| D11 | Identidad / nombre | **Cerrado:** nombre **obligatorio** para entrar a un juego (nombre rápido anónimo, Fase 1). Vincular cuenta email/Google para portabilidad = **opcional**, Fase 11. Sin nav footer/bottom-nav: menú único (`☰`). |
| D12 | Chat de voz | **Cerrado:** sí — WebRTC malla P2P (≤4), signaling por Supabase Broadcast, STUN gratis + TURN de respaldo. Feature autónoma, Fase 9 · Tema 9.7. Muteado por defecto. |
| D13 | Navegación del portal | **Cerrado:** sin footer ni bottom-nav; una sola navegación por el menú-hoja del `☰` (todos los tamaños). |

---

## 14. Anexo · Checklist para agregar un juego nuevo

- [ ] `games/<slug>/config.ts` — nombre, descripción, thumbnail, min/max jugadores, estado, houseRules.
- [ ] `games/<slug>/RULES.md` — reglas efectivas y variante de la casa.
- [ ] `games/<slug>/server/` — FSM/reducer autoritario, validación de acciones, RNG servidor, estado filtrado.
- [ ] `games/<slug>/components/` — vista del **main** (usa layout de asientos + HUD + overlay compartidos).
- [ ] Usa el **set base de assets**; si trae skin propia, la registra sin romper el default.
- [ ] Cumple **R1–R8** (sala, compartir, lobby, host-inicia, estética contenida, assets base, servidor
      autoritario, reconexión).
- [ ] Transiciones con los **motion tokens** compartidos; respeta `prefers-reduced-motion`.
- [ ] Open Graph (estático mínimo) para `/jugar/<slug>`.
- [ ] Sonidos del set común (o aporta 2–3 propios en el mismo carácter, CC0).
- [ ] Entradas en `LICENSES.md` / `CREDITS.md` por cualquier asset nuevo.
- [ ] Prueba de reconexión y de "host se va antes de empezar".

---

*Fin del documento funcional. Próximo entregable: 5 mockups del portal para aprobación.*
