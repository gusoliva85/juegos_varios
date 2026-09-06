# Mesa & Ficha

Plataforma web de **minijuegos online** para 2–4 jugadores. Abrís una sala, compartís el código por
WhatsApp, y cuando están todos el anfitrión da el arranque.

**Catálogo inicial:** Ta-Te-Ti · Chinchón · Ahorcado · Batalla Naval.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + **Tailwind v3.4** + JavaScript vanilla (ES Modules) — estático en **Vercel** |
| Lógica de juego / API | **Funciones Python de Vercel** (FastAPI ASGI en `api/index.py`) — autoritaria |
| Datos + tiempo real + auth | **Supabase** (PostgreSQL + Realtime + Anonymous Sign-In) |

Sin servidor propio que mantener: el estado vive en Postgres y llega a los clientes por suscripción a
Supabase Realtime.

## Estructura

```
api/            Shim de Vercel para la función Python
backend/        Todo el Python (lógica de juego, API, servicios) — testeable sin red
frontend/       Cliente: public/ (lo que sirve Vercel) + src/ (módulos JS) + assets/
supabase/       Migraciones SQL (esquema + RLS + Realtime + cron)
documentacion/  Documento funcional, técnico, roadmap y reglas de cada juego
.claude/skills/estilo-terracota-ludica/   Sistema de diseño (fuente de verdad visual)
```

## Desarrollo y pruebas

**El flujo de prueba es en Vercel, no en local.** Cada `git push` genera una **URL de preview** donde se
valida la tarea (lo más cercano al producto final).

```
editar  →  git push  →  Vercel construye una preview  →  abrir la URL y probar
```

- Build del frontend: `npm run build:css` (Tailwind → `frontend/public/app.css`). Vercel lo corre solo.
- Tests del backend: dentro de `backend/.venv`, `pip install -r backend/requirements.txt` y `pytest`.
- Local opcional (no es donde se valida): `vercel dev` + `supabase start`.

## Documentación

- `documentacion/01_Documento_funcional.md` — qué es y cómo se resuelve.
- `documentacion/02_Documento_Tecnico.md` — arquitectura Vercel + Supabase.
- `documentacion/03_Roadmap.md` — fases y tareas, una por vez, con aprobación.
- `documentacion/reglas/` — reglas de cada juego (documentos vivos).
