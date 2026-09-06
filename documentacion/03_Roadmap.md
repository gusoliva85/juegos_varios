# 03 · Roadmap de implementación — "Mesa & Ficha"

> Plan de ejecución escalonado de todo lo descripto en `01_Documento_funcional.md` y
> `02_Documento_Tecnico.md`, con el estilo congelado en la skill `estilo-terracota-ludica`
> (mockup base: `mockups/05_terracota_ludica.html`).
>
> **Stack de despliegue: Vercel (frontend estático + funciones Python) + Supabase (Postgres + Realtime +
> Auth).** Las pruebas se hacen **en las URL de preview de Vercel**.
>
> **Catálogo inicial: 4 juegos.**
>
> | # | Juego | Jugadores | Reglas | Fase |
> |---|---|---|---|---|
> | 1 | **Ta-Te-Ti** | 2 | `reglas/01_tateti.md` | Fase 4 |
> | 2 | **Chinchón** | 2–4 | `reglas/02_chinchon.md` | Fase 8 |
> | 3 | **Ahorcado** | 2–4 | `reglas/03_ahorcado.md` | Fase 5 |
> | 4 | **Batalla Naval** | 2–4 | `reglas/04_batalla_naval.md` | Fase 6 |

---

## Cómo se trabaja este roadmap (reglas del proyecto)

1. **Una tarea por vez.** No se implementa nada "todo junto". Se arrancó con un HTML básico solo con el
   estilo y se va sumando funcionalidad de a poco.
2. **Orden dentro de cada funcionalidad: primero la lógica, después el backend/API, después el frontend.**
3. **Nada se marca hecho sin probarse.** Lógica y API se prueban con `pytest`; el frontend lo prueba el
   cliente **a mano en la URL de preview de Vercel** con el criterio `→ Prueba:` de la tarea.
4. **Ciclo de cada tarea:** editar → `git push` → Vercel genera la **preview** → el cliente la abre y prueba
   → aprueba o pide cambios.
5. **Aprobación obligatoria para avanzar.** Con aprobación → `[x]`. Sin aprobación → se corrige esa tarea.
6. **Estado de las casillas:** `[ ]` pendiente · `[~]` en progreso / a revisión · `[x]` aprobada.
7. **Etiquetas:** `[Infra]` `[Diseño]` `[Lógica]` `[Backend]` `[Frontend]` `[Prueba]` `[Reglas]` `[DB]`.
8. **Migraciones de Supabase:** toda tarea que toca el esquema incluye su archivo en `supabase/migrations/`
   y se aplica (`supabase db push`) antes de que el código que la usa llegue a la preview.
9. Cada juego confirma sus "reglas de la casa" (RC-x de `documentacion/reglas/`) antes de programar su engine.
10. Al cerrar una fase se corre toda la suite `pytest` (regresión).

**Progreso global:** Fase 0 ▶ · Fase 1 ▢ · Fase 2 ▢ · Fase 3 ▢ · Fase 4 ▢ · Fase 5 ▢ · Fase 6 ▢ ·
Fase 7 ▢ · Fase 8 ▢ · Fase 9 ▢ · Fase 10 ▢ · Fase 11 ▢

---

# FASE 0 · Cimientos: proyecto, estilo, repo y despliegue

Objetivo: el portal (solo estética, datos hardcodeados) **corriendo en una URL de Vercel**, con el repo en
GitHub, el proyecto Supabase creado y la función Python respondiendo `/api/health` **en la preview**.

## Tema 0.1 · Estructura y tooling

- [x] **F0.1.1** · [Infra] Crear el árbol `backend/` y `frontend/` según `02_Documento_Tecnico.md` §3 (`.gitkeep`). → *Prueba:* el árbol coincide. · *Aprobada.*
- [x] **F0.1.2** · [Infra] `backend/`: `venv`, `requirements.txt`, `pyproject.toml` (pytest + ruff). → *Prueba:* `pip install` OK; `pytest` corre. · *Aprobada. (En F0.1.4 se separa: `backend/requirements.txt` = dev/test; `requirements.txt` raíz = deps de la función Vercel. Se quita `websockets`.)*
- [x] **F0.1.3** · [Infra] `frontend/`: `tailwind.config.js` (preset de la skill) + `src/styles/app.css` + placeholder `public/index.html`. → *Prueba:* compila a `public/app.css` sin warnings. · *Aprobada. Tailwind v3.4.*
- [x] **F0.1.4** · [Infra] Configuración de build para Vercel: `package.json` (`build:css` Tailwind v3.4), `vercel.json` (`buildCommand`, `outputDirectory: frontend/public`, función `api/index.py`, rewrite `/api/(.*)`), `tailwind.config.js` a la **raíz**, `requirements.txt` **raíz** (fastapi, sqlmodel, `psycopg[binary]`, pyjwt, pydantic-settings) y `backend/requirements.txt` reducido a dev/test (`-r ../requirements.txt` + pytest, pytest-asyncio, httpx, ruff; sin uvicorn/websockets). → *Prueba:* `npm run build:css` genera `frontend/public/app.css`; imports de la función OK. · *Aprobada.*
- [x] **F0.1.5** · [Infra] `.gitignore` + `.gitattributes` (LF) + `README.md` (stack Vercel+Supabase, se prueba en preview). → *Prueba:* `git status` no lista generados. · *Aprobada.*

## Tema 0.2 · Sistema de diseño operativo

- [x] **F0.2.1** · [Diseño] Self-host de fuentes (**Bricolage Grotesque**, **Inter**, variables, OFL) en `frontend/public/assets/fonts/` + `@font-face` + `LICENSES.md`. *(Esta tarea forzó la estructura del front: JS servido en `frontend/public/js/`, assets en `frontend/public/assets/`; `frontend/src/` queda solo para la entrada de Tailwind.)* → *Prueba (preview):* la página usa las fuentes sin pedir nada a `fonts.gstatic`. · *Aprobada (push `7858215`).*
- [x] **F0.2.2** · [Diseño] Verificar que `app.css` compilado tiene todas las clases del preset. → *Prueba:* búsqueda en `public/app.css`. · *Aprobada (32/32; fix del keyframe `shimmer`, push `e7d6e8b`).*
- [x] **F0.2.3** · [Diseño] `frontend/public/styleguide.html`: todos los componentes de `estilo-terracota-ludica/references/componentes.md`. → *Prueba:* en la preview de Vercel, comparación 1:1 contra el mockup 05. · *Aprobada (push `2a170a5`).*
- [x] **F0.2.4** · [Diseño] Verificar `prefers-reduced-motion` y `:focus-visible` en el styleguide. → *Prueba:* con reduce-motion activo en el SO. · *Aprobada (push `ad72941`). Cierra Tema 0.2.*

## Tema 0.3 · Cascarón estático del portal (HTML + estilo, SIN lógica)

- [x] **F0.3.1** · [Frontend] `index.html` — topbar responsive (marca · `pill` de estado · botón `☰`). Sticky, borde tinta, blur. → *Prueba (preview):* se ve en todos los anchos; `Tab` muestra anillo de foco. · *Aprobada (push `8536151`; la nav quedó solo en el menú-hoja).*
- [x] **F0.3.2** · [Frontend] Menú-hoja único (`animate-slide-up`, backdrop `bg-ink/20`) que abre el `☰`. `js/ui/shell.js` (abrir/cerrar, `Escape`, trampa de foco, scroll-lock). Stubs `creditos.html`/`perfil.html`. → *Prueba (preview):* el `☰` abre y cierra el menú en todos los anchos. · *Aprobada (push `0c76161`).*
- [x] **F0.3.3** · [Frontend] Hero (badge rotado, `<h1>` con `<mark>`, 2 CTA `btn-full`, cluster de 4 tiles rotadas con hover; en mobile el cluster arriba). `html{overflow-x:clip}` como guard. → *Prueba (preview):* coincide con el mockup; sin scroll horizontal en 360px. · *Aprobada (push `ed7f7a2`).*
- [x] **F0.3.4** · [Frontend] Módulo "unirse con código" (visual). → *Prueba (preview):* igual al mockup en mobile y web. · *Aprobada (push `57e4edd`).*
- [x] **F0.3.5** · [Frontend] Bento del catálogo con **datos hardcodeados** — los 4 juegos (Ta-Te-Ti destacado, 2 jug.; Chinchón, Ahorcado, Batalla Naval, 2–4; todos "Próximamente"). Grilla `grid-cols-2 md:grid-cols-4 xl:grid-cols-6`. Chips de filtro visuales + `data-cat`. → *Prueba (preview):* en desktop las 4 tarjetas aprovechan el ancho sin ensancharse; en mobile 2 columnas. · *Aprobada (push `548fb5a`).*
- [x] **F0.3.6** · [Frontend] **Sin footer.** Decisión del cliente: el portal no lleva footer ni barra de navegación; la única navegación es el menú-hoja del `☰`. Aplicado a `index.html` y a la skill. · *Aprobada (push `0637892`).*
- [x] **F0.3.7** · [Frontend] `jugar.html` — cascarón de partida estático: topbar + menú-hoja, cabecera de sala, lobby con asientos hardcodeados + panel compartir + botón iniciar + `<main>` placeholder. 1 columna mobile / 2 `lg`. → *Prueba (preview):* coincide con la "sala de espera" del mockup en ambos anchos. · *Aprobada (push `74d6d87`).*
- [x] **F0.3.8** · [Frontend] `creditos.html` y `perfil.html`: de stub a cascarón real (topbar + menú-hoja + contenido con la estética). `perfil.html` ya trae el placeholder de "vincular cuenta". → *Prueba (preview):* navegan, mantienen el estilo, el `☰` funciona. · *Aprobada (push `554be27`).*
- [x] **F0.3.9** · [Frontend] Auditoría responsive de las 5 páginas en 375 / 412 / 768 / 1280 px. Fix: texto del `pill` a `hidden sm:inline-flex`, `☰` con `ml-auto` en mobile. → *Prueba (preview):* sin scroll horizontal, nada estirado, el menú abre bien en los 4 anchos. · *Aprobada (push `fa2ca34`).*
- [x] **F0.3.10** · [Frontend] Micro-interacciones **de demo** (sin backend): `js/ui/toast.js`, `js/core/share.js` (`[data-copy]` → `copiado ✓`, `[data-wa]` → `wa.me`), `js/ui/portal.js` (filtros `aria-pressed` + ocultan `[data-cat]`, tarjetas → toast, hero → toast). `[hidden]{display:none!important}` al `app.css`. → *Prueba (preview):* cada interacción responde. · *Aprobada (push `ef85795`). Cierra Tema 0.3.*

## Tema 0.4 · Repo, Supabase y despliegue en Vercel

- [x] **F0.4.1** · [Infra] `git init` + `.gitignore`/`.gitattributes` + primer commit. Remoto SSH con la **Deploy Key** (`git@github-juegos:gusoliva85/juegos_varios.git`, con *Allow write access*) y `git push -u origin main`. → *Prueba:* el repo en GitHub tiene el código. · *Aprobada (commits `2b4b933`, `a23d12b`).*
- [ ] **F0.4.2** · [Infra] Crear el proyecto **Supabase "dev"** (el cliente lo crea; le paso los pasos). Anotar `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL` (pooler Supavisor, `:6543`, modo *transaction*, `?sslmode=require`). Cargar esas 5 en **Vercel → Project Settings → Environment Variables** (Production + Preview). `supabase` CLI: `supabase init` (`supabase/config.toml`) + `supabase link --project-ref <ref>`. → *Prueba:* `supabase db push` (sin migraciones aún) conecta OK; las env aparecen en la próxima preview.
- [x] **F0.4.3** · [Infra] Importar el repo en **Vercel** (preset "Other", root `./`; `vercel.json` define el build). Primer deploy. → *Prueba:* la **URL de preview** sirve el placeholder `index.html` con `app.css` aplicado. · *Aprobada — "quedó funcionando". La integración Vercel↔Supabase se hace en F0.4.2/F0.4.5.*
- [x] **F0.4.4** · [Backend] `api/index.py` (ajusta `sys.path`, importa `app.main:app`) + `backend/app/main.py` (FastAPI ASGI, CORS `*.vercel.app` + localhost, `GET /api/health`). → *Prueba:* `https://<preview>/api/health` responde `{"status":"ok"}` en Vercel; `pytest` del health. · *Aprobada (hecha adelantada para que el primer deploy no fallara).*
- [ ] **F0.4.5** · [Backend] `backend/app/config.py` (pydantic-settings con las vars de `02_Documento_Tecnico.md` §12; incluye `cors_origins` para que `main.py` deje de tener el regex hardcodeado) + `backend/app/db.py` (engine SQLModel al `DATABASE_URL` del pooler, `pool_pre_ping=True`, `get_session`). Endpoint temporal `GET /api/health/db` → `SELECT 1` (se saca en Fase 1). → *Prueba:* `https://<preview>/api/health/db` responde OK (la función se conecta a Supabase Postgres por el pooler).
- [ ] **F0.4.6** · [DB] `supabase/migrations/0001_init.sql`: extensiones base (`pgcrypto`), esquema vacío, y un `README` corto del flujo de migración (crear archivo → `supabase db push` → commitear). → *Prueba:* `supabase db push` aplica sin error; `supabase migration list` la muestra aplicada.
- [ ] **F0.4.7** · [Frontend] `frontend/public/vendor/supabase.js` (`@supabase/supabase-js` v2 vendorizado y fijado) + `scripts/gen-env.mjs` (genera `frontend/public/env.js` con `window.__ENV__ = {SUPABASE_URL, SUPABASE_ANON_KEY}` desde `process.env`; `env.js` gitignoreado) invocado desde `npm run build` + `frontend/public/js/core/supabase.js` (crea el client desde `window.__ENV__`). → *Prueba (preview):* en la consola del navegador, el client existe y `await supabase.auth.getSession()` no tira error.

> **Cierre Fase 0:** el portal se ve como el mockup **en una URL de Vercel**, el repo está en GitHub,
> Supabase dev creado, `/api/health` y `/api/health/db` responden en la preview. Ninguna funcionalidad real.

---

# FASE 1 · Identidad — nombre obligatorio (Supabase Auth)

Objetivo: **nadie entra a un juego sin nombre.** Cada visitante obtiene una sesión anónima de Supabase; la
primera vez que quiere crear o unirse a una sala se le pide un **nombre rápido** (2–16, + avatar) que queda
guardado y editable. Vincular una cuenta (email/Google) para portabilidad entre dispositivos es **opcional**
y va a Fase 11 (Backlog).

### Modelo de identidad (dos niveles)

| Nivel | Cómo | Qué persiste | Registro |
|---|---|---|---|
| **1 · Nombre rápido (obligatorio)** | Al intentar entrar a un juego sin nombre → modal bloqueante: nombre + avatar. Se guarda contra la **sesión anónima de Supabase** (`auth.uid()` estable en ese navegador) + `localStorage`. | Nombre, avatar, y —más adelante— historial/estadísticas, **en ese dispositivo/navegador**. Editable desde el perfil. | **No.** |
| **2 · Cuenta (opcional, Fase 11 · Backlog)** | Desde el perfil: "Guardá tu nombre y progreso" → vincular **email (OTP/magic link)** o **Google** (Supabase Auth `linkIdentity`). | Todo lo del nivel 1, pero **portable** a cualquier dispositivo, sin perderse al limpiar el navegador. | Sí, pero opcional. |

- El `player_id` es siempre el `auth.uid()`. Al vincular cuenta, el `uid` se conserva (no se migra data).
- Si alguien limpia el navegador sin haber vinculado cuenta → identidad nueva la próxima vez (nombre nuevo).
- Dentro de una sala, cada jugador se muestra por **nombre + avatar**; nunca hay un jugador "sin nombre".

## Tema 1.1 · Lógica

- [ ] **F1.1.1** · [Lógica] Definir: reglas de nombre (**obligatorio**, 2–16, sin URLs, lista negra básica, sin duplicado exacto dentro de una misma sala → se sufija " (2)") y set base de avatares (`avatar_id` + SVG). Doc breve `backend/app/core/IDENTITY.md`. El `player_id` **es** el `auth.uid()` de Supabase. → *Prueba:* revisión.
- [ ] **F1.1.2** · [Lógica] `core/names.py`: `validate_name(str) -> Result` + `dedupe_in_room(name, existing)`. → *Prueba:* `pytest` — válidos, corto, largo, con URL, con palabra vetada, colisión en sala.

## Tema 1.2 · Backend / DB

- [ ] **F1.2.1** · [DB] `supabase/migrations/0002_player.sql`: tabla `player` (`id uuid pk`, name, avatar_id, timestamps) + **RLS** (`select`/`insert`/`update` solo `id = auth.uid()`). → *Prueba:* `supabase db push`; con un JWT anónimo se puede upsert la fila propia, no otra.
- [ ] **F1.2.2** · [Backend] `models/player.py` (SQLModel espejo) + `schemas/player.py` (`PlayerCreate`, `PlayerDTO`). → *Prueba:* `pytest` de validación.
- [ ] **F1.2.3** · [Backend] `auth.py`: dependencia `current_player` — verifica `Authorization: Bearer <jwt>` con `SUPABASE_JWT_SECRET`, devuelve `player_id` (el `sub`). 401 si falta/inválido. → *Prueba:* `pytest` con un JWT firmado de prueba y uno inválido.
- [ ] **F1.2.4** · [Backend] `api/players.py`: `POST /api/players` (upsert perfil del `current_player`), `GET /api/players/me`. → *Prueba:* `pytest` API + `https://<preview>/api/players/me` con un token real responde.
- [ ] **F1.2.5** · [Backend] Registrar router + regresión. → *Prueba:* suite verde; deploy a preview OK.

## Tema 1.3 · Frontend

- [ ] **F1.3.1** · [Frontend] `js/core/identity.js`: al cargar, `supabase.auth.signInAnonymously()` si no hay sesión; expone `getPlayerId()`, `getToken()`. → *Prueba (preview):* primer ingreso crea sesión anónima; recarga la mantiene (localStorage de supabase-js).
- [ ] **F1.3.2** · [Frontend] `js/core/api.js`: wrapper de `fetch` a `/api/*` con `Authorization: Bearer` + parseo de errores tipados. → *Prueba (preview):* llamada a `/api/players/me` con y sin perfil.
- [ ] **F1.3.3** · [Frontend] `js/ui/name-modal.js` — **modal de nombre rápido**, bloqueante (no se puede cerrar sin nombre válido salvo "cancelar" que aborta la acción): `panel` + `field` (nombre) + grilla de avatares + botón "Listo ▷". Al confirmar → `POST /api/players` → resuelve una promesa `ensureName()`. → *Prueba (preview):* navegador limpio → aparece al tocar "Crear sala rápida"; nombre inválido no deja continuar; confirmar → persiste tras recarga.
- [ ] **F1.3.4** · [Frontend] Selector de avatares (set base SVG, ~8–12). → *Prueba (preview):* elegir, se guarda, se ve.
- [ ] **F1.3.5** · [Frontend] `perfil.html`: mostrar y **editar** nombre + avatar (mismo `POST /api/players`); mostrar nombre+avatar en la topbar (reemplaza el `pill` "en línea" por el avatar + nombre cuando hay identidad). → *Prueba (preview):* editar en el perfil se refleja en la topbar y en el menú.
- [ ] **F1.3.6** · [Frontend] `js/core/identity.js` expone `ensureName()`: si hay nombre → resuelve ya; si no → abre el modal y resuelve al confirmar (rechaza si cancela). **Todo botón que entra a un juego** ("Crear sala rápida", "Unirme con código", "Crear sala" de una tarjeta, y el deep-link `?sala=`) llama `await ensureName()` antes de seguir. → *Prueba (preview):* sin nombre, cualquiera de esas acciones abre el modal; con nombre, no.
- [ ] **F1.3.7** · [Frontend] *(La sección "Guardá tu nombre en cualquier dispositivo" ya quedó como placeholder en `perfil.html` en F0.3.8.)* Conectar el resto del perfil real: mostrar el nombre/avatar guardados, botón "Elegir nombre y avatar" funcional (abre el mismo modal), y quitar los "Disponible en la Fase 1". → *Prueba (preview):* el perfil muestra la identidad real y deja editarla.
- [ ] **F1.3.8** · [Prueba] Manual en la preview: navegador limpio → "Crear sala rápida" pide nombre → inválido no pasa → válido pasa → recarga mantiene el nombre → cambio de nombre desde el perfil → limpiar `localStorage`/sesión → vuelve a pedir nombre. En 375px y 1280px.

---

# FASE 2 · Catálogo real y salas (ciclo de vida, sin juego)

Objetivo: catálogo desde el backend; crear salas y unirse por código/enlace; ver el lobby con datos reales
(todavía sin tiempo real — se refresca al recargar).

## Tema 2.1 · Registro de juegos

- [ ] **F2.1.1** · [Lógica] `games/types.py`: `GameSpec`. `games/registry.py`: `GAMES`, `register()`, `list_specs()`. → *Prueba:* `pytest` — slugs únicos.
- [ ] **F2.1.2** · [Lógica] Configs (solo metadata, `engine_factory=None`) de los 4 juegos: `tateti` (2/2, "tablero"), `chinchon` (2/4, "cartas"), `ahorcado` (2/4, "palabras"), `batalla-naval` (2/4, "tablero"). Todos `status="coming_soon"`. → *Prueba:* `pytest` — `min<=max`, `glyph`, `category` de los 4.

## Tema 2.2 · Lógica de sala

- [ ] **F2.2.1** · [Lógica] FSM de sala (`RoomState`, transiciones, `can_transition`, `next_state_from_lobby`). → *Prueba:* `pytest` — todas las transiciones válidas/ inválidas de `01_Documento_funcional.md` §5.2.
- [ ] **F2.2.2** · [Lógica] `core/ids.py`: `new_room_id(game_slug)` — prefijo + 4–5 chars sin `0/O/1/I/L`. → *Prueba:* formato, 100k ids con < X colisiones.
- [ ] **F2.2.3** · [Lógica] Asignación de asientos (`assign_seat`, `compact_seats`) + "puede iniciar" + "traspaso de host" como funciones puras. → *Prueba:* `pytest`.

## Tema 2.3 · Backend / DB de salas

- [ ] **F2.3.1** · [DB] `supabase/migrations/0003_rooms.sql`: `room`, `room_player`, `room_sync` + RLS (lectura: miembros de la sala; escritura: solo service role) + agregar `room_sync` a la `publication` de Realtime. → *Prueba:* `supabase db push`; con anon key un no-miembro no lee `room`.
- [ ] **F2.3.2** · [Backend] `models/` + `schemas/room.py` (`RoomDTO`, `PlayerInRoomDTO`, error tipado). → *Prueba:* test de serialización del ejemplo de `02_Documento_Tecnico.md` §5.
- [ ] **F2.3.3** · [Backend] `services/rooms.py`: `create_room`, `join_room`, `leave_room`, `get_room` (validaciones + errores `ROOM_NOT_FOUND/CLOSED/FULL/IN_GAME/BAD_JOIN_KEY/GAME_LOCKED`). Cada mutación reescribe `room_sync`. `realtime/publish.py`: `room_public(session, room_id, ...)`. → *Prueba:* `pytest` de cada camino y error.
- [ ] **F2.3.4** · [Backend] `api/games.py`: `GET /api/games` (registry + conteo de salas vivas). `api/rooms.py`: `POST /api/rooms`, `/join`, `/leave`, `GET /api/rooms/{id}`. Límite `APP_MAX_ROOMS_PER_PLAYER`. → *Prueba:* `pytest` API + en la preview: `GET /api/games` lista los 4.
- [ ] **F2.3.5** · [Backend] Regresión + deploy. → *Prueba:* suite verde; preview OK.

## Tema 2.4 · Frontend catálogo

- [ ] **F2.4.1** · [Frontend] `js/ui/catalog.js`: consume `GET /api/games`, renderiza el bento (reemplaza el hardcode de F0.3.5). → *Prueba (preview):* el catálogo carga del backend; cambiar un `status` se refleja al recargar.
- [ ] **F2.4.2** · [Frontend] Skeleton shimmer al cargar. → *Prueba (preview):* con red lenta se ven.
- [ ] **F2.4.3** · [Frontend] Filtros por categoría (client-side) + badges de estado reales. → *Prueba (preview):* "Cartas" muestra solo Chinchón.
- [ ] **F2.4.4** · [Prueba] Manual en la preview: catálogo carga, filtros, `coming_soon` no crea sala.

## Tema 2.5 · Frontend crear / unir sala

- [ ] **F2.5.1** · [Frontend] "Crear sala rápida" + click en tarjeta activa → `POST /api/rooms` → navega a `jugar.html?sala=ID&j=<slug>`. → *Prueba (preview):* crea y navega; ID en la URL.
- [ ] **F2.5.2** · [Frontend] "Unirse con código" → `POST /api/rooms/{id}/join` → navega; errores tipados como toast/estado. → *Prueba (preview):* código inexistente / sala llena / cerrada → mensajes claros.
- [ ] **F2.5.3** · [Frontend] `jugar.html` lee `?sala=ID`, `GET /api/rooms/{id}`, pinta el lobby con datos reales (sin tiempo real — se ve al recargar). → *Prueba (preview):* dos pestañas, crear en una, unirse en otra, recargar y ver ambos.
- [ ] **F2.5.4** · [Frontend] Pantalla de error de sala (componente de la skill) + deep link (abrir `jugar.html?sala=ID` directo pide nombre si falta y se une). → *Prueba (preview):* pegar el enlace en una ventana nueva funciona; sala inexistente muestra el error.
- [ ] **F2.5.5** · [Prueba] Manual en la preview: crear → copiar enlace → abrir en otro navegador/dispositivo → unirse → ver ambos (recargando). 375px y 1280px.

> **Cierre Fase 2:** catálogo y salas reales en la preview; el lobby no se actualiza solo todavía.

---

# FASE 3 · Tiempo real: lobby en vivo (Supabase Realtime)

Objetivo: el lobby se actualiza solo por **suscripción a Supabase Realtime**; "listo/no listo", presencia,
reconexión, traspaso de host y el botón "Empezar" (solo host) funcionan. Al iniciar → `<main>` placeholder.

## Tema 3.1 · Lógica

- [ ] **F3.1.1** · [Lógica] Forma exacta de `room_sync.state` (§5 del técnico) y de `player_view.view`. Concepto de `rev` (incremental por sala) + helper de descarte de `rev` viejo. → *Prueba:* `pytest` de la serialización.
- [ ] **F3.1.2** · [Lógica] `can_start(state)` (host + `minPlayers` + todos listos), `reassign_host(state)`, grace por `last_seen_at` + Presence (`is_connected(player, now, presence_set)`). `core/clock.py` inyectable. → *Prueba:* `pytest` de casos límite con reloj falso.

## Tema 3.2 · Backend / DB

- [ ] **F3.2.1** · [DB] `supabase/migrations/0004_realtime_sweep.sql`: función SQL `sweep_rooms()` (cierra salas por TTL, marca desconectados) + job `pg_cron` cada 2 min que la llama (o llama a `/api/cron/sweep` vía `pg_net`). → *Prueba:* `supabase db push`; ejecutar `select sweep_rooms()` manualmente cierra una sala vieja de test.
- [ ] **F3.2.2** · [Backend] `realtime/publish.py`: `room_public(...)` y `player_views(...)` (upsert con `rev++`). → *Prueba:* `pytest` — tras publicar, las filas están y `rev` subió.
- [ ] **F3.2.3** · [Backend] `api/play.py`: `POST /api/rooms/{id}/ready` (recalcula `OPEN`/`LOBBY_READY`), `POST /api/rooms/{id}/ping` (heartbeat), `POST /api/rooms/{id}/start` (**solo host**, valida `can_start`, pasa a `IN_GAME`; engine **stub** por ahora). → *Prueba:* `pytest` — no-host → `NOT_HOST`; host sin condiciones → error; host OK → `IN_GAME` + `room_sync` actualizado.
- [ ] **F3.2.4** · [Backend] `GET /api/cron/sweep` (protegido por `CRON_SECRET`): TTL de salas, timeouts, traspaso de host por inactividad. → *Prueba:* `pytest` con reloj falso.
- [ ] **F3.2.5** · [Backend] Regresión + deploy. → *Prueba:* suite verde; preview OK.

## Tema 3.3 · Frontend

- [ ] **F3.3.1** · [Frontend] `js/core/realtime.js`: `joinRoom(roomId)` → `supabase.channel('room:'+id)` con `postgres_changes` sobre `room_sync` + `player_view` (filtro `room_id`) + `presence`. Reintento de suscripción si se cae. → *Prueba (preview):* al entrar, llega el estado; cortar la red y volver → re-suscribe.
- [ ] **F3.3.2** · [Frontend] `js/core/store.js`: store observable; ignora push con `rev` ≤ actual; combina `room_sync` (público) + `player_view` (privado) + `presence` (conectados). → *Prueba (preview):* un `rev` viejo no pisa el estado.
- [ ] **F3.3.3** · [Frontend] `js/ui/lobby.js`: render reactivo de asientos/slots desde el store (reemplaza F2.5.3). → *Prueba (preview):* en 3 pestañas, un cambio se ve en todas en < 1 s.
- [ ] **F3.3.4** · [Frontend] Chip de conexión desde Presence (conectado / reconectando). Heartbeat `POST /ping` cada 20 s. → *Prueba (preview):* cerrar una pestaña → en las otras ese jugador pasa a "desconectado" tras el grace.
- [ ] **F3.3.5** · [Frontend] Botón "listo / no listo" → `POST /ready`. Slots vacíos con invitación. → *Prueba (preview):* marcar listo se ve en las otras pestañas.
- [ ] **F3.3.6** · [Frontend] Panel compartir **funcional**: copiar código, copiar enlace (`PUBLIC_BASE_URL` = dominio de la preview), botón WhatsApp (`wa.me/?text=` con "Te invito a jugar a <Juego> ➜ <enlace>"). → *Prueba (preview):* copiar pega bien; WhatsApp abre con el texto y el enlace de la preview.
- [ ] **F3.3.7** · [Frontend] Botón "Empezar la partida": **solo si el jugador local es host**; `disabled` hasta `can_start`; → `POST /start`. Traspaso de host reflejado en vivo. → *Prueba (preview):* el invitado no ve el botón; cerrar la pestaña del host → otro pasa a host y lo ve.
- [ ] **F3.3.8** · [Frontend] Al pasar a `IN_GAME`: montar `<main>` placeholder con transición. → *Prueba (preview):* al iniciar, todas las pestañas cambian al `<main>`.
- [ ] **F3.3.9** · [Prueba] Manual en la preview con 2–4 pestañas/dispositivos: entrar, listo, iniciar, cerrar y reabrir una pestaña (rehidratación), cerrar la del host (traspaso), dejar la sala vacía (se cierra por el sweep).

> **Cierre Fase 3:** salas totalmente en vivo por Supabase Realtime. Falta el juego adentro.

---

# FASE 4 · Motor de juego base + Ta-Te-Ti (2 jugadores)

Reglas: **`reglas/01_tateti.md`**. Objetivo: primer juego jugable de punta a punta en la preview, con bot,
revancha y rehidratación.

## Tema 4.0 · Reglas

- [ ] **F4.0.1** · [Reglas] Confirmar RC-1..RC-6 de `reglas/01_tateti.md` con el cliente. Sincronizar a `backend/app/games/tateti/RULES.md`. → *Prueba:* el cliente aprueba.

## Tema 4.1 · Motor base

- [ ] **F4.1.1** · [Lógica] `games/base.py`: `GameEngine` ABC (`02_Documento_Tecnico.md` §7.1 — con `public_view`, `snapshot/restore`, `timeout_action`, `turn_info`). `games/types.py`: `Action`, `GameEvent`, `PlayerView`, `PlayerRef`, `IllegalAction`. → *Prueba:* `pytest` — subclase mínima cumple el contrato; `snapshot()` → `restore()` es idempotente.
- [ ] **F4.1.2** · [Lógica] `make_rng()` (SystemRandom prod / `Random(seed)` test); la semilla se guarda en el snapshot. → *Prueba:* `pytest` — misma semilla, misma secuencia; restore reproduce.

## Tema 4.2 · Lógica de Ta-Te-Ti

- [ ] **F4.2.1** · [Lógica] `engine.py`: 3×3, turnos, `apply_action(place, cell)`, detección de línea/empate, `view_for`/`public_view` (sin secretos), `result()`. Asignación de marcas y quién empieza (RC-1/RC-2). → *Prueba:* `pytest` — victoria fila/columna/diagonal, empate, celda ocupada, fuera de turno.
- [ ] **F4.2.2** · [Lógica] `bot.py` (RC-4): gana / bloquea / centro→esquinas→lados. → *Prueba:* `pytest` — nunca deja pasar victoria o bloqueo obvio; 1000 partidas bot vs bot sin crash.
- [ ] **F4.2.3** · [Lógica] Suite completa. → *Prueba:* verde.

## Tema 4.3 · Backend / integración

- [ ] **F4.3.1** · [DB] `supabase/migrations/0005_game_state.sql`: `game_state` (rev, snapshot jsonb, turn_player_id, turn_deadline), `player_view` (view jsonb) y `match`. RLS: `game_state` nadie lee; `player_view` solo la fila propia; ambas escritura solo service role. `player_view` en la `publication`. → *Prueba:* `supabase db push`; con anon + JWT de otro jugador **no** se lee `player_view` ajeno ni `game_state`.
- [ ] **F4.3.2** · [Backend] `services/turn_engine.py`: `apply(session, room_id, actor, kind, payload)` — `SELECT game_state FOR UPDATE` → `restore` → `apply_action` / bot / timeout → `snapshot` + `publish.player_views` + `publish.room_public` + `rev++`. `is_over()` → `FINISHED` + fila en `match`. → *Prueba:* `pytest` — jugada válida propaga; ilegal → `ILLEGAL_ACTION` sin cambiar estado; fin persiste `match`.
- [ ] **F4.3.3** · [Backend] `POST /api/rooms/{id}/action` y `POST /api/rooms/{id}/tick` (aplica timeout si venció el deadline, o la jugada del bot si el turno es de un asiento `is_bot`; idempotente). `POST /api/rooms/{id}/rematch`. `/start` instancia el engine de verdad (fin del stub). → *Prueba:* `pytest` WS-less + en la preview: jugar una partida entre dos pestañas.
- [ ] **F4.3.4** · [Backend] Marcar `tateti` como `status="active"` + regresión + deploy. → *Prueba:* `GET /api/games` lo muestra activo en la preview.

## Tema 4.4 · Frontend / mesa de Ta-Te-Ti

- [ ] **F4.4.1** · [Frontend] `js/games/index.js`: `loadGame(slug)` con `import()` dinámico. → *Prueba (preview):* el chunk del juego se baja al iniciar la partida, no antes.
- [ ] **F4.4.2** · [Frontend] Layout compartido del `<main>`: header de partida (juego, jugadores, turno `▷`, salir), zona de mesa centrada y escalable, chip de conexión. → *Prueba (preview):* en desktop la mesa está centrada y grande; en mobile ocupa el alto.
- [ ] **F4.4.3** · [Frontend] `js/games/tateti/view.js`: tablero 3×3 (celdas ≥44px), render desde `player_view`, `tap` → `POST /action`; deshabilitado fuera de turno. Estilo de la skill. → *Prueba (preview):* jugar una partida entre dos pestañas.
- [ ] **F4.4.4** · [Frontend] Turno del bot: si `botToMove`, esperar ~700 ms y `POST /tick`. → *Prueba (preview):* partida vs bot termina sola.
- [ ] **F4.4.5** · [Frontend] Overlay de resultado (`✦` ganador / empate) + "Revancha" (`POST /rematch`) + "Volver al portal". Transición de montaje del `<main>` (≤320ms; `reduced-motion`). → *Prueba (preview):* al terminar aparece; revancha reinicia.
- [ ] **F4.4.6** · [Frontend] Rehidratación: al recargar o reconectar, re-suscribe el canal + `GET /api/rooms/{id}` + toma `player_view`. → *Prueba (preview):* recargar a mitad de partida recupera el tablero.
- [ ] **F4.4.7** · [Prueba] Manual en la preview: 2 jugadores partida entera · empate · revancha · vs bot · reconexión · 375px y 1280px.

> **Cierre Fase 4:** un juego completo y probado en Vercel. El patrón queda listo para replicar.

---

# FASE 5 · Ahorcado (2–4)

Reglas: **`reglas/03_ahorcado.md`**.

- [ ] **F5.0.1** · [Reglas] Confirmar RC-1..RC-11 (modo por defecto, vidas, categoría, fallar palabra completa). Sincronizar a `RULES.md`. → *Prueba:* el cliente aprueba.
- [ ] **F5.1.1** · [Lógica] Banco de palabras es-AR en `games/ahorcado/words/` por categoría; carga + normalización (sin tildes para comparar, con tildes para mostrar). → *Prueba:* `pytest` — sin duplicados, largo ≥ RC-9.
- [ ] **F5.1.2** · [Lógica] `engine.py` — **cooperativo** (RC-6): palabra del servidor, turnos rotativos, vidas compartidas, N palabras. → *Prueba:* `pytest` — gana, pierde, letra repetida no descuenta ni gasta turno.
- [ ] **F5.1.3** · [Lógica] `engine.py` — **por turnos / competitivo**: palabra y vidas por jugador, eliminación, gana el primero que completa. → *Prueba:* `pytest`.
- [ ] **F5.1.4** · [Lógica] Arriesgar palabra completa (RC-8: −2 vidas). `view_for` **nunca** manda la palabra hasta el final; `public_view` muestra el progreso de cada jugador en competitivo. → *Prueba:* `pytest` — la palabra no aparece en la vista hasta `is_over`.
- [ ] **F5.1.5** · [Lógica] `bot.py` (RC-11): letras por frecuencia del español. Suite completa. → *Prueba:* `pytest` — 1000 partidas sin crash.
- [ ] **F5.2.1** · [Backend] `house_rules` (modo, vidas, categoría) desde el lobby al `setup`. Marcar `ahorcado` `active`. Regresión + deploy. → *Prueba:* `GET /api/games` lo lista activo en la preview.
- [ ] **F5.3.1** · [Frontend] `view.js`: palabra con guiones, teclado en pantalla (A–Z + Ñ), erradas tachadas, categoría visible. → *Prueba (preview):* jugar una partida entre pestañas.
- [ ] **F5.3.2** · [Frontend] Dibujo progresivo en SVG coherente con la skill (trazo tinta; "torre que se arma" si se prefiere no macabro — RC a definir). → *Prueba (preview):* cada error agrega un trazo.
- [ ] **F5.3.3** · [Frontend] Selección de modo/categoría/vidas en el lobby (`house_rules`); botón "arriesgar palabra"; en competitivo mostrar progreso de todos; reusa header + overlay + rehidratación. → *Prueba (preview):* el host elige, se aplica.
- [ ] **F5.3.4** · [Prueba] Manual en la preview: coop 2–4 · competitivo por turnos · vs bot · reconexión · 375/1280.

> **Cierre Fase 5:** dos juegos activos.

---

# FASE 6 · Batalla Naval (2–4)

Reglas: **`reglas/04_batalla_naval.md`**. Introduce **fase de despliegue** previa, **info oculta por
jugador**, **selección de objetivo** (3–4) y **eliminación**. Tablero propio del juego (no usa la baraja).

- [ ] **F6.0.1** · [Reglas] Confirmar RC-1..RC-11 (flota RC-4, "barcos se tocan" RC-3, "tocado = dispara de nuevo" RC-5, tamaño RC-11, tiempos). Sincronizar a `RULES.md`. → *Prueba:* el cliente aprueba.
- [ ] **F6.1.1** · [Lógica] Grilla 10×10, coordenadas `A1..J10`, representación de barco. → *Prueba:* `pytest`.
- [ ] **F6.1.2** · [Lógica] Validación de despliegue (límites, superposición, separación RC-3, tamaños RC-4) + autocompletado al azar (RC-1) con RNG inyectable. → *Prueba:* `pytest` — válidos e inválidos; 1000 autodespliegues válidos.
- [ ] **F6.1.3** · [Lógica] `engine.py` fase `DEPLOY` (`place_fleet` + `ready` en paralelo; a `BATTLE` cuando todos listos o vence el timer). → *Prueba:* `pytest`.
- [ ] **F6.1.4** · [Lógica] `engine.py` fase `BATTLE`: turnos, `fire(target, cell)`, agua/tocado/hundido, no repetir celda, RC-5 (por defecto un disparo). → *Prueba:* `pytest`.
- [ ] **F6.1.5** · [Lógica] 3–4 jugadores (RC-6): elección de objetivo, radar por rival, eliminación al hundir toda la flota, gana el último a flote. → *Prueba:* `pytest` — partida de 3 con una eliminación.
- [ ] **F6.1.6** · [Lógica] `view_for` (en `DEPLOY` nada ajeno; en `BATTLE` solo el radar propio de cada rival) + `public_view`. Timers autoritarios (`turn_deadline`, `deploy_deadline`) + `timeout_action`. → *Prueba:* `pytest` — la vista no contiene posiciones ajenas no impactadas; timeout con reloj falso.
- [ ] **F6.1.7** · [Lógica] `bot.py` (RC-10): despliegue al azar + "hunt & target". Suite completa (2/3/4). → *Prueba:* `pytest` — 500 partidas bot vs bot; el bot remata barcos tocados.
- [ ] **F6.2.1** · [Backend] Integración con `turn_engine` (fases `DEPLOY`/`BATTLE`/`OVER` dentro de `IN_GAME`). `house_rules` desde el lobby. Marcar `batalla-naval` `active`. Regresión + deploy. → *Prueba:* `pytest` + partida 2 jugadores en la preview.
- [ ] **F6.3.1** · [Diseño] Tablero SVG 10×10 con coordenadas (estilo de la skill) en `assets/boards/`; barcos como piezas simples. → *Prueba (preview):* legible en 375px y 1280px; < 15 KB.
- [ ] **F6.3.2** · [Frontend] `view.js` — **despliegue**: tocar/arrastrar para ubicar, rotar, "flota al azar", validación en vivo, "Listo", timer. → *Prueba (preview):* desplegar una flota completa con el pulgar en mobile.
- [ ] **F6.3.3** · [Frontend] `view.js` — **batalla**: "mi tablero" + "radar" del rival objetivo; en 3–4, selector de rival; tap en el radar → `fire`; feedback agua/tocado/hundido; lista de barcos del rival (hundidos tachados). → *Prueba (preview):* partida 1v1 entre pestañas.
- [ ] **F6.3.4** · [Frontend] Estado de jugadores (vivos/eliminados), "estás mirando" al ser eliminado, overlay de resultado + revelar tableros (RC-8) + revancha; rehidratación por fase. → *Prueba (preview):* partida de 3 con eliminación; recargar en cada fase recupera el estado.
- [ ] **F6.3.5** · [Prueba] Manual en la preview: 2 · 3 con eliminación · 4 · autocompletar · timeouts · vs bot · reconexión · 375/1280.

> **Cierre Fase 6:** tres juegos activos, uno con info oculta y fase de preparación.

---

# FASE 7 · Sistema de assets compartidos (para Chinchón)

Objetivo: baraja española + sonidos como paquete interno, tematizable, con licencias registradas. Acotado a
lo que el catálogo inicial necesita.

- [ ] **F7.1.1** · [Diseño] Poblar `frontend/public/assets/{decks/spanish, backs, tokens, sfx}` + `LICENSES.md`. `frontend/public/js/assets.js`: `getCard('spanish',suit,rank)`, `getBack(name)`, `getToken(i)` → nodos SVG. Sprites `<symbol>`/`<use>` + tematización por variables CSS. → *Prueba (preview):* página de test renderiza la baraja completa; cambiar `--back-color` cambia todos los dorsos.
- [ ] **F7.2.1** · [Reglas/Diseño] Confirmar la baraja de Chinchón (RC-2: **40 + 2 comodines** propuesto). → *Prueba:* el cliente elige.
- [ ] **F7.2.2** · [Diseño] Baraja española (40) importada de fuente de dominio público y normalizada al lenguaje visual de la skill; optimizar (< 60 KB gz). Comodín(es) + 2–3 dorsos + fichas/discos genéricos en 4 colores. → *Prueba (preview):* las 40 se ven bien a tamaño de mano en 375px; peso dentro del presupuesto.
- [ ] **F7.2.3** · [Diseño] Procedencia + licencia de cada familia en `assets/LICENSES.md` y `creditos.html`. → *Prueba (preview):* `creditos.html` lista todo con enlace y licencia.
- [ ] **F7.3.1** · [Diseño] SFX **CC0** (repartir, tomar carta, descartar, cerrar/victoria, disparo agua/tocado/hundido, letra ok/error, colocar ficha, entra jugador). → *Prueba:* set corto y consistente.
- [ ] **F7.3.2** · [Frontend] Sprite `sfx.mp3` + `sfx.json` + `js/core/audio.js` (WebAudio), **muteado por defecto**; toggle en topbar/perfil persistido. → *Prueba (preview):* por defecto no suena; activado se escuchan; persiste tras recarga.
- [ ] **F7.4.1** · [Frontend] Integrar audio en Ta-Te-Ti, Ahorcado y Batalla Naval. → *Prueba (preview):* suenan los eventos correctos en los 3.

> **Cierre Fase 7:** paquete de assets listo para el juego de cartas.

---

# FASE 8 · Chinchón (2–4)

Reglas: **`reglas/02_chinchon.md`**. El más complejo del catálogo inicial: cartas ocultas, robar/descartar,
ligar combinaciones, cerrar, puntaje acumulado, eliminación.

- [ ] **F8.0.1** · [Reglas] Confirmar RC-1..RC-13 a fondo (formato a 100 vs. N rondas, baraja, valor del comodín, umbral de cierre, colgar en combinaciones ajenas, reenganche, bot sí/no). Sincronizar a `RULES.md`. → *Prueba:* el cliente aprueba cada RC.
- [ ] **F8.1.1** · [Lógica] Carta española, baraja según RC-2, comodín; orden para escaleras (1..7,10,11,12; no da la vuelta); valor de puntos por carta (incl. comodín sin ligar RC-3). → *Prueba:* `pytest`.
- [ ] **F8.2.1** · [Lógica] `melds.py`: validador de **grupo** (3–4 mismo número) y **escalera** (3+ mismo palo) con comodín (RC-5); detección de **chinchón** (RC-6); **mejor partición** de una mano (máx. ligado / mín. puntos). → *Prueba:* `pytest` exhaustivo — con/sin comodín; puntajes óptimos de casos conocidos.
- [ ] **F8.3.1** · [Lógica] FSM de la ronda: reparto (7), mazo, pozo, rotación del repartidor; turno `draw` (mazo/pozo RC-7) → 8 → `discard`; mazo agotado → rebarajar pozo. → *Prueba:* `pytest`.
- [ ] **F8.3.2** · [Lógica] `close`: valida 6 ligadas + carta ≤ 5 (RC-8), o 7 ligadas (−10, RC-9), o chinchón; fase post-cierre `layoff` (RC-10). El servidor valida las combinaciones. → *Prueba:* `pytest` — cierres válidos e inválidos.
- [ ] **F8.3.3** · [Lógica] Conteo de la ronda, acumulado, fin de partida (eliminación a 100 + reenganche RC-11, o N rondas RC-1). `view_for` (mano propia; de rivales solo la cantidad; mazo oculto) + `public_view`. Suite completa (2/3/4). → *Prueba:* `pytest` — partida a eliminación y a N rondas; ronda guionada con su puntaje.
- [ ] **F8.4.1** · [Backend] `house_rules` de Chinchón desde el lobby; integración con `turn_engine`; Open Graph estático de `/jugar/chinchon`. Marcar `chinchon` `active`. Regresión + deploy. → *Prueba:* `pytest` + reconectar a mitad de ronda en la preview sin ver cartas ajenas; enlace en WhatsApp muestra la tarjeta.
- [ ] **F8.5.1** · [Frontend] Baraja española integrada (Fase 7); `view.js`: mano en abanico, mazo + pozo al centro, cantidad de cartas de cada rival, marcador. → *Prueba (preview):* se ve bien en 375px (abanico compacto) y 1280px.
- [ ] **F8.5.2** · [Frontend] Turno: robar del mazo/pozo, ordenar la mano (arrastrar/tocar), descartar; UI de armado de combinaciones (agrupar, indicador ligado/suelto + puntos estimados). → *Prueba (preview):* jugar varios turnos entre pestañas; al agrupar, la UI marca las válidas.
- [ ] **F8.5.3** · [Frontend] Botón "Cerrar" (solo si el armado es válido) + fase post-cierre (colgar cartas); overlay de fin de ronda (puntos) y de partida (eliminación/reenganche); animaciones desde eventos; rehidratación. → *Prueba (preview):* cerrar con 6+1 y con 7 ligadas; chinchón.
- [ ] **F8.5.4** · [Prueba] Manual en la preview: partida 2 a 100 · 3–4 · chinchón · cierre con las 7 · colgar cartas · reenganche · reconexión · tarjeta de WhatsApp · 375/1280.

> **Cierre Fase 8:** los 4 juegos del catálogo inicial, activos y probados en Vercel.

---

# FASE 9 · Social y pulido de experiencia

- [ ] **F9.1.1** · [Backend] Chat de sala vía Supabase **Broadcast** (canal de la sala): el cliente publica, todos reciben; rate limit (5 msg / 10 s) validado en el cliente + refuerzo en una función si hace falta; largo máx 200; sin persistencia. → *Prueba (preview):* chatear entre pestañas; rate limit.
- [ ] **F9.1.2** · [Frontend] Panel de chat en lobby y `<main>` (hoja/colapsable en mobile, columna lateral en desktop). → *Prueba (preview):* en mobile no tapa la mesa.
- [ ] **F9.2.1** · [Lógica/Backend] Pulir `rematch` en los 4 juegos (mismos jugadores, rota mano/turno, resetea marcador). → *Prueba:* `pytest` + 3 revanchas seguidas de cada juego en la preview.
- [ ] **F9.3.1** · [Backend] `GET /api/players/me/matches` (paginado, desde `match`). → *Prueba:* `pytest`.
- [ ] **F9.3.2** · [Frontend] `perfil.html`: lista de últimas partidas (juego, resultado, fecha, jugadores). → *Prueba (preview):* jugar 3 y verlas.
- [ ] **F9.4.1** · [Lógica/Backend] Rol **espectador**: entra a `IN_GAME` sin asiento; recibe `public_view` (sin secretos de nadie) por `room_sync`; sin `player_view`. → *Prueba:* `pytest` — la vista de espectador no tiene manos ni barcos ajenos.
- [ ] **F9.4.2** · [Frontend] Vista de espectador (sin controles, cartel "estás mirando"). → *Prueba (preview):* espectar Chinchón y Batalla Naval en curso.
- [ ] **F9.5.1** · [Frontend] Selector de dorso de carta y color de ficha en `perfil.html` (persistido); aplicado en las mesas vía variables CSS de assets. → *Prueba (preview):* cambiar skin y verla en Chinchón.
- [ ] **F9.6.1** · [Frontend] (Opcional) Música de fondo CC0 para el portal, muteada por defecto, toggle persistido, se agacha durante SFX. → *Prueba (preview):* no arranca sola; peso dentro de presupuesto.

## Tema 9.7 · Voz en la sala (chat de voz)

Feature **autónoma** — no toca la lógica de juego. Permite que jugadores en lugares distintos se escuchen.
**Complejidad: media.** Arquitectura: **WebRTC malla P2P** entre los ≤ 4 jugadores; el *signaling* (SDP +
ICE) viaja por **Supabase Realtime Broadcast** (que ya usamos); **STUN** gratis (Google) para NAT; y un
**TURN de respaldo** para el ~10–20 % de redes con NAT simétrico. Audio ≈ 30–50 kbps por par → 4 jugadores
= 6 conexiones, trivial. Costo ~cero a escala chica (el TURN gratis alcanza). Detalle en
`02_Documento_Tecnico.md` §16.

- [ ] **F9.7.1** · [Infra] Decidir el **TURN**: evaluar Cloudflare Calls (tier gratis ~1 TB/mes), Metered (50 GB/mes gratis) o Twilio. Config en env (`TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL`). Endpoint `GET /api/voice/ice` que devuelve la lista de servidores ICE (STUN públicos + TURN con credencial efímera si el proveedor la soporta). → *Prueba:* el endpoint responde una config ICE válida en la preview.
- [ ] **F9.7.2** · [Lógica] Protocolo de signaling sobre Broadcast: eventos `voice.offer` / `voice.answer` / `voice.ice` / `voice.leave` en el canal `room:<id>` (payload dirigido `to: <playerId>`). Reglas de "quién llama a quién" (el que entra después ofrece a los presentes). → *Prueba:* `pytest`/unit del reductor de estado de la malla.
- [ ] **F9.7.3** · [Frontend] `js/core/voice.js`: `getUserMedia({audio})`, crear `RTCPeerConnection` por peer, intercambiar SDP/ICE por Broadcast, adjuntar `MediaStream` remoto a un `<audio autoplay>` por jugador. Reintento/renegociación si un peer se cae. → *Prueba (preview):* 2 pestañas (o 2 dispositivos) se escuchan.
- [ ] **F9.7.4** · [Frontend] UI en el `<main>` del juego: botón **micrófono on/off** (mute local = `track.enabled=false`), **muteado por defecto**, pedir permiso solo al activarlo por primera vez. Indicador de **"hablando"** por jugador (analizar `AudioContext` level). Mutear a un jugador puntual (volumen 0 en su `<audio>`). → *Prueba (preview):* mute/unmute funciona; se ve quién habla.
- [ ] **F9.7.5** · [Frontend] Degradación elegante: sin permiso de micrófono / navegador sin WebRTC / falla de TURN → cartel claro ("no pudimos activar el micrófono, seguí jugando igual"); el juego nunca se bloquea por la voz. Aviso de privacidad al activar ("los demás jugadores de la sala te van a escuchar"). → *Prueba (preview):* negar el permiso no rompe la partida.
- [ ] **F9.7.6** · [Prueba] Manual: 3 jugadores en 3 dispositivos/redes distintas, activar voz, hablar, mutearse, uno recarga (se re-conecta la voz), uno sin micrófono. `prefers-reduced-motion` no afecta; el indicador de "hablando" respeta accesibilidad (no solo color).

---

# FASE 10 · Robustez, rendimiento, accesibilidad y producción

- [ ] **F10.1.1** · [Backend] `core/ratelimit.py` (tabla `rate_hits`, ventana móvil) aplicado a `/action`, `/tick`, `/join`, `/ready`; exceso → `RATE_LIMITED`. → *Prueba:* `pytest` — flood se corta.
- [ ] **F10.1.2** · [DB/Prueba] Revisión de RLS por tabla y de `view_for` de **cada** juego (Ta-Te-Ti, Ahorcado, Batalla Naval, Chinchón): un jugador con la anon key + su JWT **no** puede leer `player_view`/`game_state` ajenos. → *Prueba:* tests de RLS + tests por juego que buscan campos prohibidos en la vista ajena.
- [ ] **F10.1.3** · [Backend] Endurecer validación (payloads desconocidos se descartan, nunca crashean); proteger `/api/cron/sweep` con `CRON_SECRET`; límite de salas por jugador reforzado. → *Prueba:* `pytest`.
- [ ] **F10.2.1** · [Backend] Métricas simples (salas creadas/terminadas/abandonadas, jugadores activos) en una tabla o log estructurado; `/api/health` extendido. → *Prueba:* los números cambian al jugar.
- [ ] **F10.3.1** · [Frontend] Build de producción de Tailwind (purge) < 40 KB gz; confirmar `import()` dinámico por juego (no en el bundle inicial); medir LCP / peso JS del portal contra `02_Documento_Tecnico.md` §10. → *Prueba (preview):* Lighthouse mobile.
- [ ] **F10.3.2** · [Frontend] Lazy-load de sprites no críticos; `content-visibility` donde ayude; Lighthouse mobile ≥ 90 en Performance y Best Practices. → *Prueba (preview):* reporte.
- [ ] **F10.4.1** · [Frontend] Contraste AA en la paleta en uso; navegación por teclado del portal + `:focus-visible`; `aria-label` en assets (cartas, celdas de Batalla Naval), `aria-live` en el turno; `prefers-reduced-motion` en todas las animaciones (Fases 4–8). → *Prueba (preview):* checker de contraste + recorrido por teclado + reduce-motion.
- [ ] **F10.4.2** · [Frontend] Prueba con lector de pantalla del flujo crear → invitar → unir → jugar Ta-Te-Ti. → *Prueba (preview):* el flujo es entendible sin ver.
- [ ] **F10.5.1** · [Frontend] Textos de UI a `frontend/public/js/i18n/es-AR.js`; errores del backend con `code` estable + texto localizable. → *Prueba:* no quedan strings sueltos en el markup crítico.
- [ ] **F10.6.1** · [Infra] Proyecto **Supabase "prod"** separado; segunda integración en Vercel para `main`; dominio de producción; env por entorno (preview → dev, production → prod). → *Prueba:* push a `main` deploya a producción contra la base prod; las previews siguen contra dev.
- [ ] **F10.6.2** · [Infra] `core/ratelimit.py` → **Upstash Redis** (Vercel Marketplace); Open Graph **dinámico** (imagen de la mesa + ID) con Vercel OG. → *Prueba:* rate limit distribuido; la tarjeta de WhatsApp muestra el estado real.
- [ ] **F10.6.3** · [Prueba] Smoke test en producción: crear sala, invitar por WhatsApp, jugar una partida de **cada uno de los 4 juegos**, reconectar. → *Prueba:* todo OK en el dominio de producción.

> **Cierre Fase 10:** plataforma robusta, medida y en producción con los 4 juegos.

---

# FASE 11 · Backlog (más juegos + cuentas + escalado)

Uno por vez, mismo ciclo lógica→API→frontend→prueba-en-preview.

- [ ] **F11.1** · Nuevos juegos con su `reglas/0N_*.md`: **Truco** (baraja española + jerarquía + envido + FSM de cantos + 2v2), **Generala** (dados en assets), **Escoba de 15**, **Ludo** (tablero SVG), **Dudo/Perudo**, **Tutti Frutti** (timer autoritario + votación).
- [ ] **F11.2** · Cuentas: OAuth (Google) sobre Supabase Auth manteniendo el juego anónimo; migración anónimo→cuenta; estadísticas por juego, monedas/puntos, perfil con stats.
- [ ] **F11.3** · Desbloqueos (`unlockRequirement` por nivel/monedas) + ranking simple por juego.
- [ ] **F11.4** · Escalado: Broadcast en vez de Postgres Changes para todo lo efímero; worker/cron dedicado si aparece un juego en tiempo real; baraja francesa + dados en assets.

---

## Anexo · Trazabilidad con el Documento Funcional

| Requisito del funcional | Dónde se implementa |
|---|---|
| R1 · Sala con ID único | F2.2.2, F2.3.3 |
| R2 · Compartir (código / enlace / WhatsApp) | F0.3.10 (demo), F3.3.6 (real) |
| R3 · Sala de espera antes de jugar | F0.3.7 (visual), F2.5.3, F3.3.3 |
| R4 · Solo el host inicia | F3.1.2, F3.2.3, F3.3.7 |
| R5 · Estética portal fija + `<main>` del juego | Skill `estilo-terracota-ludica`, F0.3, F4.4.2 |
| R6 · Assets base compartidos | Fase 7 |
| R7 · Servidor autoritario | Funciones Python + `turn_engine` (F4.3.2) + RLS (F4.3.1, F10.1.2) |
| R8 · Reconexión con grace period | F3.1.2, F3.2.4, F4.4.6 (re-suscripción + rehidratación) |
| Máquina de estados de sala | F2.2.1, F3.2 |
| Catálogo con estados | F2.1.2, F2.3.4, F2.4 |
| **Nombre obligatorio para entrar a un juego** | Fase 1 (nombre rápido, anónimo, `ensureName()` en todo botón de juego) |
| Cuenta con nombre definido (portable) | Fase 11 · Backlog (vincular email/Google, opcional) |
| Identidad anónima persistente | Fase 1 (Supabase Anonymous Auth, `player_id = auth.uid()`) |
| **Chat de voz en la sala** | Fase 9 · Tema 9.7 (WebRTC malla P2P + signaling por Supabase Broadcast + STUN/TURN) |
| Ta-Te-Ti / Ahorcado / Batalla Naval / Chinchón | Fases 4 / 5 / 6 / 8 · `documentacion/reglas/` |
| Truco / Generala / Escoba / Ludo / Dudo / Tutti Frutti | Fase 11 (backlog) |
| Open Graph para WhatsApp | F8.4.1 (estático), F10.6.2 (dinámico) |
| Repositorio de imágenes / sonidos / licencias | Fase 7, `creditos.html` |
| Tiempo real | Supabase Realtime — Fase 3, integrado en cada juego |
| Rendimiento / Accesibilidad | Fase 10 |
| Cuentas / progresión / ranking | Fase 11 (backlog) |

---

*Este roadmap se actualiza a medida que se cierran tareas (marcar `[x]` solo con aprobación del cliente).*
