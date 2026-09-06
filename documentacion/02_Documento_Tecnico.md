# 02 · Documento Técnico — Plataforma de Minijuegos "Mesa & Ficha"

> Traduce el **Documento Funcional** (`01_Documento_funcional.md`) y el **mockup aprobado**
> (`mockups/05_terracota_ludica.html`) a una arquitectura concreta, simple y escalable.
> El estilo visual está congelado en la skill del proyecto **`estilo-terracota-ludica`**.
>
> **Stack de despliegue (definido por el cliente): Vercel + Supabase.**
> Frontend estático en Vercel · lógica de juego en **Vercel Python Serverless Functions** ·
> datos, tiempo real y autenticación en **Supabase**.
> Las pruebas se hacen **en las URL de preview de Vercel**, no en local — lo más cercano al producto final.

---

## 0. Nota sobre "SQLite" → PostgreSQL

El pedido original mencionaba SQLite. **Supabase corre PostgreSQL**, no SQLite. Se conserva todo lo que
importaba de esa decisión: **base SQL relacional + ORM tipado (SQLModel) + Python**. El cambio real es el
*connection string* y el motor; los modelos SQLModel son casi idénticos. A cambio ganamos: tiempo real
gestionado, autenticación anónima lista, y cero servidores que mantener.

---

## 1. Principios de arquitectura

1. **Serverless y sin estado.** No hay ningún proceso corriendo de forma continua. Cada request entra a una
   función efímera, hace su trabajo contra Postgres y termina. El estado vive **siempre en la base**.
2. **Servidor autoritario igual.** Toda regla, reparto, tirada y puntaje se resuelven en las funciones
   Python. El cliente manda intención; recibe estado filtrado por Supabase Realtime.
3. **Tiempo real gestionado.** No escribimos un servidor WebSocket. El cliente se **suscribe a cambios de
   filas** en Supabase; las funciones Python escriben esas filas.
4. **Mobile-first real.** Se diseña y prueba en 360–430px. La web es una adaptación del mismo HTML.
5. **Juegos como plugins.** Agregar un juego = una carpeta de lógica + un registro. El core no se toca.
   El motor de juego (`GameEngine`) es **lógica pura**: no sabe de HTTP, de Supabase ni de sockets.
6. **Escalable por capas.** Los puntos de crecimiento (rate-limit → Upstash, proyecto Supabase dev → prod,
   cuotas de Realtime, Broadcast para eventos) están aislados desde el día 1.
7. **Nada se integra sin probarse.** Cada tarea del roadmap termina con `git push` → Vercel genera una
   preview → el cliente la prueba ahí.

---

## 2. Stack

### 2.1 Frontend — Vercel (estático)

| Pieza | Elección | Motivo |
|---|---|---|
| Marcado | **HTML estático** multipágina | Sin framework: menos peso, alineado al pedido. |
| Estilos | **Tailwind CSS v3.4** (CLI → `frontend/public/app.css`) | Preset de la skill `estilo-terracota-ludica`. Se compila en el build de Vercel. |
| Interactividad | **JavaScript vanilla, ES Modules** | Sin bundler. Módulos chicos por responsabilidad. |
| Cliente de datos/tiempo real/auth | **`@supabase/supabase-js` v2** (vendorizado y fijado en `frontend/public/vendor/`) | Suscripción a Realtime, login anónimo, lecturas permitidas por RLS. |
| Estado de UI | Store observable propio (`store.js`) | Suficiente para lobby + partida. |
| Assets | SVG inline + sprites en `frontend/assets/` | Baraja española (Chinchón), tablero de Batalla Naval, sonidos. |
| Fuentes | Self-hosted en `frontend/assets/fonts/` (Bricolage Grotesque, Inter) | Sin llamada a Google Fonts en runtime. |
| Hosting | **Vercel** (deploy automático desde GitHub, **preview URL por cada push**) | Es donde se prueba cada tarea. |

### 2.2 Lógica de juego / API — Vercel Python Serverless Functions

| Pieza | Elección | Motivo |
|---|---|---|
| Lenguaje | **Python 3.12** | Pedido. |
| Framework | **FastAPI** como app **ASGI única**, servida por el runtime `@vercel/python` desde `api/index.py` | Tipado, validación Pydantic, routing; un solo entrypoint. |
| Acceso a datos | **SQLModel** (SQLAlchemy 2) + **`psycopg` v3** contra el **pooler de Supabase** (Supavisor, puerto 6543, modo *transaction*) | El pooler es obligatorio en serverless para no agotar conexiones. |
| Auth | Verificación del **JWT de Supabase** (`Authorization: Bearer …`) con `pyjwt` + `SUPABASE_JWT_SECRET` | El `sub` del token **es** el `player_id`. |
| Publicación a Realtime | Escribir filas en `room_sync` / `player_view`; opcional **Broadcast** vía REST de Supabase para chat/animaciones | Sin servidor de sockets. |
| RNG | `secrets` / `random.SystemRandom` (CSPRNG) en la función | Dados/reparto, nunca `random` a secas. |
| Concurrencia por sala | `SELECT … FOR UPDATE` sobre la fila `game_state` de esa sala | Serializa acciones de una misma sala (reemplaza el lock en memoria). |
| Tests | **pytest** + `httpx.AsyncClient` contra la app ASGI + Postgres de test | Lógica de juego (pura) y API. |

### 2.3 Datos, tiempo real y auth — Supabase

| Servicio | Uso |
|---|---|
| **PostgreSQL** | Toda la persistencia: perfiles, salas, membresías, estado de juego, vistas por jugador, historial. |
| **Realtime (Postgres Changes)** | El cliente se suscribe a `room_sync` y `player_view` filtrados por sala; recibe push ante cada cambio. |
| **Realtime (Presence)** | "Quién está conectado" en el canal de la sala, sin escribir en la base. |
| **Realtime (Broadcast)** | Chat de sala y señales de animación efímeras (Fase 9). |
| **Auth (Anonymous Sign-In)** | Cada dispositivo obtiene un JWT + un `uid` estable = `player_id`. Sin registro. |
| **Row-Level Security (RLS)** | Un jugador solo puede leer **su** `player_view`; las salas, solo sus miembros. Las funciones Python usan la *service role key* y escriben por encima de RLS. |
| **`pg_cron`** | Barrido periódico (TTL de salas, timeouts no atendidos) cada 1–5 min. |
| **Supabase CLI** | Migraciones SQL versionadas en `supabase/migrations/` (esquema + políticas RLS + publicación Realtime + cron). |

### 2.4 Tooling y despliegue

- **GitHub**: `github.com/gusoliva85/juegos_varios`. Push desde la máquina de desarrollo vía **Deploy Key**
  (SSH, un repo, write access). Vercel y Supabase se conectan aparte con sus propias GitHub Apps.
- **Vercel**: importa el repo → build de Tailwind + publica `frontend/public` + detecta `api/index.py` como
  función Python. Producción = `main`; **preview = cada push / PR**.
- **Supabase**: un proyecto **dev** para todas las previews; (más adelante) un proyecto **prod** para `main`.
  La integración Vercel↔Supabase inyecta las variables de entorno.
- **Local (opcional, no es el flujo de prueba):** `vercel dev` + `supabase start` (o apuntar al proyecto
  dev). El cliente prueba en Vercel.

---

## 3. Estructura del repositorio

```
juegos_varios/                    (raíz del repo)
├─ vercel.json                    # build (Tailwind), output estático, función Python, rewrites
├─ package.json                   # script build:css (Tailwind CLI v3.4)  + package-lock.json
├─ tailwind.config.js             # preset de la skill; content: ./frontend/{public,src}/**
├─ requirements.txt               # deps de la FUNCIÓN Python (fastapi, sqlmodel, psycopg[binary], pyjwt, pydantic-settings)
├─ .gitignore  README.md
│
├─ api/
│  ├─ __init__.py
│  └─ index.py                    # entrypoint Vercel:  from backend.app.main import app
│
├─ backend/
│  ├─ app/
│  │  ├─ main.py                  # FastAPI(), routers, CORS (dominios de Vercel + previews)
│  │  ├─ config.py                # settings desde env (Supabase URL/keys, JWT secret, DSN, TTLs)
│  │  ├─ db.py                    # engine (DSN del pooler), get_session
│  │  ├─ auth.py                  # verificar JWT de Supabase -> player_id  (dependencia FastAPI)
│  │  │
│  │  ├─ models/                  # SQLModel — espejo de las migraciones SQL
│  │  │  ├─ player.py  room.py  room_player.py  game_state.py  player_view.py  match.py
│  │  │
│  │  ├─ schemas/                 # DTOs Pydantic (REST) + formas de payload de Realtime
│  │  │  ├─ room.py  player.py  actions.py  sync.py
│  │  │
│  │  ├─ api/                     # routers REST (montados bajo /api)
│  │  │  ├─ deps.py               # current_player (JWT)
│  │  │  ├─ players.py            # POST /api/players (perfil), GET /api/players/me
│  │  │  ├─ games.py              # GET /api/games (catálogo desde el registry)
│  │  │  ├─ rooms.py              # POST /api/rooms, /join, /leave, GET /api/rooms/{id}
│  │  │  └─ play.py               # POST /api/rooms/{id}/ready | start | action | tick | rematch
│  │  │
│  │  ├─ realtime/
│  │  │  └─ publish.py            # escribir room_sync + player_view (bump rev); broadcast opcional
│  │  │
│  │  ├─ games/                   # PLUGINS — lógica pura
│  │  │  ├─ base.py               # GameEngine (ABC): setup, apply_action, view_for, is_over, result, snapshot/restore
│  │  │  ├─ registry.py           # GAMES = {slug: GameSpec}
│  │  │  ├─ types.py              # GameSpec, Action, GameEvent, PlayerView, PlayerRef
│  │  │  ├─ tateti/     config.py  engine.py  bot.py  RULES.md
│  │  │  ├─ ahorcado/   config.py  engine.py  bot.py  words/   RULES.md
│  │  │  ├─ batalla_naval/ config.py  engine.py  bot.py  RULES.md
│  │  │  └─ chinchon/   config.py  engine.py  melds.py  RULES.md
│  │  │
│  │  ├─ core/
│  │  │  ├─ ids.py                # room_id corto sin ambigüedad
│  │  │  ├─ names.py              # validación de nombre
│  │  │  ├─ clock.py              # "ahora" inyectable (tests)
│  │  │  └─ ratelimit.py          # contador simple por jugador (Postgres); Upstash más adelante
│  │  │
│  │  └─ services/
│  │     ├─ rooms.py              # crear / unir / salir / ciclo de vida
│  │     └─ turn_engine.py        # cargar game_state -> engine.apply_action -> escribir estado + vistas + publicar
│  │
│  ├─ requirements.txt            # deps de DEV/TEST (pytest, pytest-asyncio, httpx, ruff)
│  └─ tests/  (games/  api/)
│
├─ frontend/
│  ├─ public/                     # <- Vercel sirve esto
│  │  ├─ index.html  jugar.html  perfil.html  creditos.html
│  │  ├─ app.css                  # generado por Tailwind (gitignored)
│  │  ├─ vendor/supabase.js       # @supabase/supabase-js v2 fijado
│  │  └─ og/
│  ├─ src/
│  │  ├─ styles/app.css           # entrada Tailwind
│  │  ├─ core/
│  │  │  ├─ supabase.js           # crea el client (URL + anon key inyectadas en build)
│  │  │  ├─ identity.js           # signInAnonymously + perfil (nombre/avatar)
│  │  │  ├─ api.js                # fetch a /api/* con el Bearer token
│  │  │  ├─ realtime.js           # suscripción a room_sync / player_view / presence
│  │  │  ├─ store.js              # store observable (descarta rev viejo)
│  │  │  └─ share.js  audio.js
│  │  ├─ ui/  shell.js  catalog.js  lobby.js  components.js
│  │  ├─ games/  index.js  tateti/view.js  ahorcado/view.js  batalla-naval/view.js  chinchon/view.js
│  │  └─ assets/ index.js         # getCard / getBack / getToken
│  └─ assets/  fonts/  deck/spanish/  backs/  tokens/  boards/  sfx/
│
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/                 # 0001_init.sql, 0002_rls.sql, 0003_realtime.sql, 0004_cron.sql, ...
│  └─ seed.sql
│
├─ documentacion/                 # estos documentos + mockups + reglas
└─ .claude/skills/estilo-terracota-ludica/   # sistema de diseño
```

**Regla de oro de carpetas:** todo lo de servidor en `backend/` (Python puro, testeable sin red), todo lo
de cliente en `frontend/`. `api/index.py` es solo el shim que Vercel necesita. `supabase/` es el esquema.

---

## 4. Modelo de datos (Supabase / PostgreSQL)

Autoría: **migraciones SQL** (`supabase/migrations/`, aplicadas con la Supabase CLI). Los modelos SQLModel
(`backend/app/models/`) las reflejan para el tipado en Python.

```
player                              -- perfil; id = auth.uid() (usuario anónimo de Supabase)
  id           uuid  PK  = auth.uid()
  name         text
  avatar_id    text
  created_at   timestamptz
  updated_at   timestamptz

room
  id                 text  PK        -- "CHIN-7K2P"
  game_slug          text
  state              text            -- OPEN | LOBBY_READY | IN_GAME | FINISHED | CLOSED
  host_id            uuid  FK player
  is_private         bool
  join_key           text  NULL
  min_players        int
  max_players        int
  house_rules        jsonb
  created_at         timestamptz
  last_activity_at   timestamptz
  closed_at          timestamptz NULL

room_player                          -- membresía (activa + histórica)
  room_id      text  FK room
  player_id    uuid  FK player
  seat         int
  is_bot       bool
  ready        bool
  last_seen_at timestamptz           -- heartbeat; se combina con Presence
  joined_at    timestamptz
  left_at      timestamptz NULL
  PK (room_id, player_id)

game_state                           -- 1 fila por sala mientras IN_GAME/FINISHED (estado autoritario, opaco)
  room_id        text  PK  FK room
  rev            bigint             -- versión incremental
  snapshot       jsonb              -- engine.snapshot()  (privado; nadie lo lee salvo la función)
  turn_player_id uuid  NULL
  turn_deadline  timestamptz NULL   -- para timeouts client-triggered / cron
  updated_at     timestamptz

room_sync                            -- ESPEJO PÚBLICO para Realtime (lo que puede ver cualquiera en la sala)
  room_id  text  PK  FK room
  rev      bigint
  state    jsonb                     -- { room: {...}, game_public: {...} }  sin datos secretos
  updated_at timestamptz

player_view                          -- vista PRIVADA por jugador para Realtime
  room_id   text  FK room
  player_id uuid  FK player
  rev       bigint
  view      jsonb                    -- engine.view_for(player)  (mano propia, etc.)
  updated_at timestamptz
  PK (room_id, player_id)

match                                -- historial de partidas
  id          uuid  PK
  room_id     text  FK room
  game_slug   text
  started_at  timestamptz
  ended_at    timestamptz NULL
  result      jsonb                  -- { winners:[...], scores:{...} }
```

### 4.1 RLS (resumen — detalle en `supabase/migrations/000X_rls.sql`)

| Tabla | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `player` | fila propia (`id = auth.uid()`) | fila propia |
| `room` | miembros de la sala (subquery a `room_player`) | **solo funciones** (service role) |
| `room_player` | miembros de la misma sala | **solo funciones** |
| `game_state` | **nadie** (ni con clave anon) | **solo funciones** |
| `room_sync` | miembros de la sala | **solo funciones** |
| `player_view` | **solo la fila propia** (`player_id = auth.uid()`) | **solo funciones** |
| `match` | miembros de esa sala | **solo funciones** |

El cliente **nunca escribe** estado de juego. Escribe solo su `player` (perfil). Todo lo demás pasa por
`/api/*`.

### 4.2 Publicación Realtime

`room_sync` y `player_view` se agregan a la `publication` de Realtime. El cliente:

```js
supabase.channel('room:CHIN-7K2P')
  .on('postgres_changes', { event:'*', schema:'public', table:'room_sync',
       filter:'room_id=eq.CHIN-7K2P' }, onPublic)
  .on('postgres_changes', { event:'*', schema:'public', table:'player_view',
       filter:'room_id=eq.CHIN-7K2P' }, onPrivate)   // RLS ya limita a la fila propia
  .on('presence', { event:'sync' }, onPresence)
  .subscribe()
```

---

## 5. API REST (Vercel Python Function)

Base `/api`. Auth: header `Authorization: Bearer <supabase_jwt>`. Sin token válido → 401 (el cliente hace
`signInAnonymously()` primero).

| Método | Ruta | Body | Efecto |
|---|---|---|---|
| `POST` | `/api/players` | `{name, avatarId}` | Crea/actualiza el perfil del `auth.uid()`. |
| `GET` | `/api/players/me` | — | Perfil propio. |
| `GET` | `/api/games` | — | Catálogo desde el registry + conteo de salas vivas por juego. |
| `POST` | `/api/rooms` | `{gameSlug, isPrivate?, houseRules?}` | Crea la sala; el creador queda `host`; escribe `room_sync`. |
| `POST` | `/api/rooms/{id}/join` | `{joinKey?}` | Valida (existe / no `CLOSED` / cupo / clave). Agrega `room_player`. Reescribe `room_sync`. |
| `GET` | `/api/rooms/{id}` | — | Snapshot puntual (para pintar antes de suscribirse). |
| `POST` | `/api/rooms/{id}/leave` | — | Sale; recalcula host; reescribe `room_sync`. |
| `POST` | `/api/rooms/{id}/ready` | `{ready}` | Marca listo; recalcula `OPEN`/`LOBBY_READY`. |
| `POST` | `/api/rooms/{id}/start` | — | **Solo host**; valida condiciones; instancia el engine; `IN_GAME`; escribe `game_state` + vistas. |
| `POST` | `/api/rooms/{id}/action` | `{action}` | La acción del juego. `turn_engine.apply()`. |
| `POST` | `/api/rooms/{id}/tick` | — | "Empujá el juego": aplica timeout si venció `turn_deadline`, o el movimiento del bot si es su turno. Idempotente. |
| `POST` | `/api/rooms/{id}/rematch` | — | Tras `FINISHED`: nueva partida con los presentes. |
| `POST` | `/api/rooms/{id}/ping` | — | Heartbeat → `room_player.last_seen_at`. |
| `GET` | `/api/cron/sweep` | — | (protegido) Barrido: salas TTL, timeouts abandonados. Lo llama `pg_cron`/Vercel Cron. |

**Errores tipados** (siempre igual): `{ "error": { "code": "ROOM_FULL", "message": "..." } }`.
Códigos: `ROOM_NOT_FOUND`, `ROOM_CLOSED`, `ROOM_FULL`, `ROOM_IN_GAME`, `BAD_JOIN_KEY`, `GAME_LOCKED`,
`NAME_REJECTED`, `NOT_YOUR_TURN`, `ILLEGAL_ACTION`, `NOT_HOST`, `RATE_LIMITED`.

`room_sync.state` (lo que viaja por Realtime):
```json
{
  "room": {
    "id": "CHIN-7K2P", "gameSlug": "chinchon", "state": "LOBBY_READY", "hostId": "…",
    "minPlayers": 2, "maxPlayers": 4, "houseRules": { "puntosMax": 100 },
    "players": [
      { "playerId": "…", "name": "Sofía", "avatarId": "fox", "seat": 0,
        "isBot": false, "connected": true, "ready": true, "isHost": true }
    ],
    "openSeats": 2, "shareLink": "https://mesa-y-ficha.vercel.app/jugar.html?sala=CHIN-7K2P&j=chinchon"
  },
  "gamePublic": null,
  "rev": 7
}
```

---

## 6. Cómo transcurre una acción (autoritario, sin servidor de sockets)

```
Cliente (en partida)                Vercel Function  /api/rooms/{id}/action        Supabase
──────────────────────              ────────────────────────────────────────       ─────────
tap en el tablero  ───── POST {action} + JWT ─────►
                                    verificar JWT -> player_id
                                    BEGIN
                                    SELECT game_state WHERE room_id=… FOR UPDATE  ◄── (lock por sala)
                                    engine = restore(snapshot)
                                    engine.apply_action(player_id, action)   -> [GameEvent...]
                                    snapshot' = engine.snapshot()
                                    para cada jugador p:
                                       view_p = engine.view_for(p)
                                       UPSERT player_view(room_id, p, rev+1, view_p)
                                    UPSERT game_state(snapshot', rev+1, turn, deadline)
                                    UPDATE room_sync(state.gamePublic, rev+1)
                                    (opcional) Broadcast 'game.event' en el canal
                                    COMMIT
                          ◄──── 200 {ok, rev}
                                                                    Realtime detecta los cambios ──►
◄──── push player_view (mío) + room_sync ──────────────────────────────────────────────────────────
render del nuevo estado
```

- **Concurrencia:** el `FOR UPDATE` sobre `game_state` serializa las acciones de una misma sala. Dos salas
  distintas no se bloquean entre sí.
- **`rev`:** el cliente ignora cualquier push con `rev` menor o igual al que ya tiene.
- **Turnos / timeouts / bots:** ver §7.4.

---

## 7. Arquitectura de juegos (plugins)

### 7.1 `GameEngine` (ABC) — lógica pura, sin cambios respecto del plan original

```python
class GameEngine(ABC):
    slug: str

    @abstractmethod
    def setup(self, players: list[PlayerRef], house_rules: dict, rng: Random) -> None: ...
    @abstractmethod
    def legal_actions(self, player_id: str) -> list[str]: ...
    @abstractmethod
    def apply_action(self, player_id: str, action: dict) -> list[GameEvent]:
        """Valida y aplica. Lanza IllegalAction si no corresponde."""
    @abstractmethod
    def view_for(self, player_id: str) -> dict:
        """Estado visible SOLO para ese jugador (nunca manos/mazo/barcos ajenos)."""
    @abstractmethod
    def public_view(self) -> dict:
        """Estado sin secretos de nadie (para room_sync.gamePublic y espectadores)."""
    @abstractmethod
    def is_over(self) -> bool: ...
    @abstractmethod
    def result(self) -> dict: ...

    @abstractmethod
    def snapshot(self) -> dict: ...
    @abstractmethod
    def restore(self, snapshot: dict) -> None: ...

    def bot_action(self, player_id: str) -> dict | None: ...
    def timeout_action(self, player_id: str) -> dict | None: ...   # qué hacer si se venció el reloj
```

- El engine se **reconstruye desde `snapshot` en cada request** y se vuelve a serializar. No hay instancia
  viva entre requests. Para juegos por turnos esto es barato (el estado de una partida es pequeño).
- El RNG se **inyecta** (`SystemRandom` en prod, `Random(seed)` en tests). La semilla usada se guarda en el
  snapshot para que el estado sea reproducible al restaurar.

### 7.2 `GameSpec` / registro

```python
@dataclass(frozen=True)
class GameSpec:
    slug: str; name: str; description: str; glyph: str
    category: str                 # cartas | tablero | palabras
    min_players: int; max_players: int
    status: str                   # active | coming_soon | locked
    engine_factory: Callable[[], GameEngine]
    default_house_rules: dict
    supports_bots: bool

GAMES: dict[str, GameSpec] = {}   # registry.py
```

`GET /api/games` serializa `GAMES` + cuenta salas vivas. Cambiar el `status` de un juego a `active` lo
"desbloquea" sin tocar frontend.

### 7.3 `turn_engine.py` — el pegamento entre el engine y Supabase

Una sola función central:

```python
def apply(session, room_id, actor_id, kind, payload) -> None:
    st = session.exec(select(GameState).where(...).with_for_update()).one()
    engine = registry[st.game_slug].engine_factory()
    engine.restore(st.snapshot)

    if kind == "action":   events = engine.apply_action(actor_id, payload["action"])
    elif kind == "tick":   events = _advance_timeout_or_bot(engine, st)   # ver 7.4
    ...

    st.snapshot = engine.snapshot(); st.rev += 1
    st.turn_player_id, st.turn_deadline = engine.turn_info()
    publish.player_views(session, room_id, engine, st.rev)
    publish.room_public(session, room_id, engine.public_view(), st.rev, over=engine.is_over())
    if engine.is_over(): _finish(session, room_id, engine.result())
```

### 7.4 Turnos, timeouts y bots sin proceso de fondo

- Cada acción deja en `game_state` el `turn_player_id` y un `turn_deadline` (si el juego usa reloj).
- **Timeout:** el cliente en turno muestra la cuenta regresiva. Al llegar a 0, **cualquier** cliente de la
  sala llama `POST /api/rooms/{id}/tick`. La función comprueba `now() > turn_deadline` y aplica
  `engine.timeout_action(...)`. Es idempotente: si otro cliente ya lo hizo, no pasa nada.
- **Bot:** si el turno cae en un asiento `is_bot`, la respuesta de `/action` (o de `/start`) marca
  `botToMove: true`; el cliente espera ~700 ms y llama `/tick`, que aplica `engine.bot_action(...)`.
- **Backstop:** un job **`pg_cron`** cada 1–2 min (o `/api/cron/sweep`) empuja las salas cuyo `turn_deadline`
  venció y nadie atendió, y cierra salas por TTL.

### 7.5 Agregar un juego (resumen; checklist completo en `01_Documento_funcional.md` §14)

1. `backend/app/games/<slug>/config.py` → `GameSpec`.
2. `backend/app/games/<slug>/engine.py` → implementa `GameEngine`.
3. `backend/app/games/<slug>/RULES.md` → sincronizado con `documentacion/reglas/`.
4. `backend/tests/games/test_<slug>.py` → suite de lógica pura.
5. `frontend/src/games/<slug>/view.js` → vista del `<main>` (usa layout de asientos + HUD + overlay).
6. Registrar en `registry.py` y en `frontend/src/games/index.js`.

---

## 8. Sistema de assets

- Paquete **interno** en `frontend/assets/`. Sin API de imágenes de terceros.
- Formato: **SVG `<symbol>`** + `<use>`; tematización por variables CSS (`--back-color`, `--pip-color`,
  `--token-color`).
- API JS: `frontend/src/assets/index.js` → `getCard('spanish','espada',7)`, `getBack(name)`,
  `getToken(colorIndex)`. (Catálogo inicial: solo baraja española para Chinchón; el tablero de Batalla
  Naval es propio de ese juego. Baraja francesa / dados: backlog.)
- Sonido: sprite `assets/sfx/sfx.mp3` + `sfx.json`, motor WebAudio propio, **muteado por defecto**.
- Procedencia y licencia de cada familia en `frontend/assets/LICENSES.md` + `frontend/public/creditos.html`.
- Presupuestos: baraja completa < 60 KB gz; tablero < 15 KB; set de sonidos < 120 KB.

---

## 9. Seguridad y robustez

| Tema | Implementación v1 |
|---|---|
| Anti-trampa | La lógica corre en la función Python. `view_for` filtra secretos; `player_view` tiene RLS "solo la fila propia". El cliente nunca escribe estado de juego. |
| Auth | JWT de Supabase verificado en cada request (`pyjwt` + `SUPABASE_JWT_SECRET`). El `service_role_key` **solo** vive en variables de entorno de la función, nunca en el cliente. |
| RLS | Todas las tablas con RLS activada; políticas en `supabase/migrations/000X_rls.sql`; se testea que un jugador no pueda leer `player_view` ajeno ni `game_state`. |
| Turnos | El engine rechaza acciones fuera de turno o ilegales → `NOT_YOUR_TURN` / `ILLEGAL_ACTION`. |
| Concurrencia | `SELECT … FOR UPDATE` sobre `game_state`. |
| Rate limiting | v1: contador por `player_id` en una tabla `rate_hits` (ventana móvil). Más adelante: Upstash Redis. Vercel aporta protección DDoS de base. |
| Nombres | `core/names.py`: 2–16, sin URLs, lista negra básica → `NAME_REJECTED`. |
| Reconexión | No hay socket que reconectar: el cliente re-suscribe el canal y hace `GET /api/rooms/{id}` para rehidratar. El *grace period* se evalúa por `last_seen_at` + Presence. |
| Traspaso de host | Si el host se va (`leave` o sin heartbeat > grace en el sweep), pasa al siguiente por `seat`. |
| CORS | Orígenes: dominio de producción de Vercel + regex `https://*.vercel.app` (previews) + `http://localhost:3000` (`vercel dev`). |
| Entrada | Todo request valida con Pydantic; payloads desconocidos se descartan. |
| Secretos en el cliente | Solo `SUPABASE_URL` y `SUPABASE_ANON_KEY` (públicas por diseño). Nada más. |

---

## 10. Rendimiento (presupuestos)

| Métrica | Objetivo |
|---|---|
| LCP portal (4G, gama media) | < 2.5 s |
| JS inicial del portal (sin bundle de juego, sin contar supabase-js) | < 90 KB sin comprimir |
| `@supabase/supabase-js` | cargado en el portal (~30 KB gz); aceptable, es el core de datos |
| CSS (Tailwind purgeado) | < 40 KB gz |
| Bundle de un juego | `import()` dinámico al iniciar la partida |
| Latencia percibida de una jugada | acción → push de Realtime: típicamente 150–400 ms |
| Función Python (cold start) | objetivo < 1.5 s; se mitiga manteniendo la función chica y `psycopg` con pool del lado de Supabase |

---

## 11. Responsive — reglas técnicas (mobile-first + web)

Codificadas en la skill (`estilo-terracota-ludica/references/*`). Puntos que la estructura debe soportar:

- **Un solo HTML por pantalla** con clases responsive. No hay "versión mobile" aparte.
- **Navegación:** `bottom-nav` (`md:hidden`) en mobile; enlaces en la topbar (`hidden md:flex`) en web.
- **Bento:** `grid-cols-2 → md:grid-cols-4 → xl:grid-cols-6`; celdas con `min-h`, **no** se estiran (si
  sobra ancho, entra otra columna).
- **Contenedores** `max-w-[1160px] mx-auto`; CTA `w-full sm:w-auto`.
- **Main del juego:** `min-h-[100dvh]` menos header; la mesa se centra y escala.
- **Área táctil:** mínimo 44×44px en controles de juego.
- Prueba obligatoria por tarea de UI: 375 / 412 / 768 / 1280 px, **en la preview de Vercel**.

---

## 12. Configuración (variables de entorno)

Inyectadas por la integración Vercel↔Supabase + algunas propias. En `backend/app/config.py` (pydantic-settings).

| Variable | Dónde | Uso |
|---|---|---|
| `SUPABASE_URL` | Vercel (pública) + build del front | Endpoint del proyecto. |
| `SUPABASE_ANON_KEY` | Vercel (pública) + build del front | Client del navegador. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (**secreta**, solo función) | Escrituras por encima de RLS. |
| `SUPABASE_JWT_SECRET` | Vercel (**secreta**) | Verificar el JWT en la función. |
| `DATABASE_URL` | Vercel (**secreta**) | DSN del **pooler** (`…pooler.supabase.com:6543/…?sslmode=require`, modo transaction). |
| `PUBLIC_BASE_URL` | Vercel | Armar `shareLink` / Open Graph (dominio de la preview o de prod). |
| `CRON_SECRET` | Vercel (**secreta**) | Proteger `/api/cron/sweep`. |
| `APP_ROOM_TTL_EMPTY` / `APP_ROOM_TTL_IDLE` / `APP_GRACE_PERIOD` | Vercel | 120 s / 1800 s / 45 s. |
| `APP_MAX_ROOMS_PER_PLAYER` | Vercel | 3. |

El frontend recibe `SUPABASE_URL` y `SUPABASE_ANON_KEY` por sustitución en el build (un pequeño paso que
reemplaza placeholders en `frontend/src/core/supabase.js` antes de servir).

---

## 13. Despliegue y flujo de pruebas

**No hay arranque local como flujo principal.** El ciclo es:

```
editar  →  git push  →  Vercel construye una PREVIEW  →  el cliente abre la URL y prueba la tarea
                         (Tailwind build + función Python + estáticos)
                         (misma base: proyecto Supabase "dev")
```

- **Producción:** merge/push a `main` → deploy a `mesa-y-ficha.vercel.app` (dominio a definir).
- **Migraciones de Supabase:** se aplican con `supabase db push` (o CI) contra el proyecto dev antes de que
  el código que las necesita llegue a la preview. Cada tarea que toca el esquema incluye su migración.
- **Local opcional** (para iterar rápido sin gastar deploys): `vercel dev` + `supabase start`. No es donde
  se valida; el cliente valida en la preview.
- **`vercel.json`** (esquema):
  ```json
  {
    "buildCommand": "npm run build:css",
    "outputDirectory": "frontend/public",
    "functions": { "api/index.py": { "maxDuration": 30 } },
    "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index" }]
  }
  ```

---

## 14. Estrategia de pruebas

| Capa | Cómo | Cuándo |
|---|---|---|
| Lógica de juego (engine) | `pytest` puro, sin red, RNG con semilla. Turnos, acciones ilegales, fin, puntajes, `snapshot/restore` ida y vuelta. | Antes de tocar la función de ese juego. |
| API / servicios | `httpx.AsyncClient` contra la app ASGI + Postgres de test (Supabase local o contenedor). Crear/unir/errores, `action`, `tick`. | Antes del frontend de esa fase. |
| RLS | Tests que, con la *anon key* y un JWT de otro jugador, confirman que **no** se puede leer `player_view` ajeno ni `game_state`. | Al cerrar cada fase con datos sensibles. |
| Realtime | Test manual: dos navegadores, una jugada, verificar el push. (Automatizable con el client JS en Node, opcional.) | Al cerrar cada tarea de UI en vivo. |
| Frontend | **Manual, por el cliente, en la preview de Vercel**, con checklist de la tarea (375/412/768/1280) + smoke del flujo. | Al cerrar cada tarea de UI. |
| Regresión | `pytest` completo antes de cerrar una fase. | Fin de fase. |

**Regla del proyecto:** ninguna tarea se marca hecha sin que su criterio de prueba pase. El frontend de una
tarea no se implementa hasta que su lógica y su API estén probadas.

---

## 15. Puntos de escalabilidad (mapa)

| Hoy (v1) | Cuando haga falta | Qué cambia |
|---|---|---|
| 1 proyecto Supabase "dev" para todo | Proyecto **prod** separado para `main` | Segunda integración en Vercel; env por entorno. |
| Rate-limit en tabla Postgres | **Upstash Redis** (Vercel Marketplace) | Implementar `core/ratelimit.py` alternativo. |
| Timeouts/bots por `tick` del cliente + `pg_cron` | Cola / worker dedicado | Solo si aparecen juegos en tiempo real (no en el catálogo inicial). |
| Realtime "Postgres Changes" | **Broadcast** para todo lo efímero | Menos escrituras; ya previsto en `publish.py`. |
| Open Graph estático por juego | OG dinámico (imagen de la mesa + ID) | Vercel OG / Satori en una función. |
| Auth anónima | + OAuth (Google) para progreso | Supabase Auth ya lo soporta; el juego anónimo sigue igual. |
| Vanilla JS en la mesa | Motor 2D por juego | `import()` de PixiJS solo en ese `view.js`; portal intacto. |

---

*Fin del documento técnico. La ejecución paso a paso está en `03_Roadmap.md`.*
