# Reglas · Batalla Naval (Guerra Naval)

> Documento vivo. Lo que está bajo **"Reglas de la casa"** es lo que hay que **confirmar / ajustar** antes
> de implementar el engine (`backend/app/games/batalla_naval/`).
> Estado: **borrador para revisión**.

---

## 1. Resumen

Cada jugador ubica en secreto su **flota** en una grilla y por turnos **dispara** a coordenadas del
tablero rival tratando de hundir todos sus barcos. Información oculta (no ves los barcos del otro).
Adaptado a **2–4 jugadores**.

- **Jugadores:** 2 a 4.
- **Duración:** 5–15 min.
- **Material:** por jugador, un tablero de **10×10** (columnas 1–10, filas A–J) y una flota. Tablero SVG
  propio del juego (no usa la baraja compartida).
- **Azar:** ninguno en las reglas base (la incertidumbre viene de la info oculta). *(RC opcional: disparo
  al azar del bot / al agotarse el tiempo.)*

---

## 2. Preparación (fase de despliegue)

1. La sala necesita **2 a 4 jugadores listos**. El anfitrión da "Jugar".
2. **Cada jugador coloca su flota** en su propia grilla, en privado, dentro de un tiempo de despliegue.
   *(RC-1: tiempo de despliegue 90 s; al agotarse, el servidor autocompleta al azar los barcos que falten.)*
3. Reglas de colocación:
   - Los barcos ocupan casillas **consecutivas en horizontal o vertical** (no diagonal). *(RC-2.)*
   - **No pueden salirse** de la grilla ni **superponerse**.
   - **Separación:** por defecto **los barcos no pueden tocarse entre sí, ni siquiera en diagonal**
     (queda al menos 1 casilla de agua alrededor de cada barco). *(RC-3: alternativa clásica de "Hasbro" =
     sí pueden estar pegados. Elegir una.)*
4. Cuando **todos** confirmaron su despliegue (o venció el tiempo), empieza la fase de disparos.

### 2.1 Flota estándar (regla de la casa RC-4)

**Por defecto (variante internacional clásica, 17 casillas):**

| Barco | Tamaño | Cantidad |
|---|---|---|
| Portaaviones | 5 | 1 |
| Acorazado | 4 | 1 |
| Submarino | 3 | 1 |
| Crucero | 3 | 1 |
| Destructor | 2 | 1 |

**Alternativa "escalera" (tradición hispana, 15 casillas):** 1 barco de 4, 2 de 3, 3 de 2, 4 de 1.

> **Decisión pendiente RC-4:** elegir la composición. Para 3–4 jugadores puede convenir una flota **más
> chica** (p. ej. 4-3-2-2 = 11) para que las partidas no se hagan largas. Configurable por el anfitrión.

---

## 3. Fase de disparos

### 3.1 Turno (2 jugadores)
- En tu turno hacés **un disparo** a una coordenada del tablero rival.
- El rival responde: **Agua** / **Tocado** / **Hundido** (cuando cae la última casilla de un barco).
- *(RC-5: "tocado = seguís disparando" — **desactivado por defecto** en esta plataforma, para que los
  turnos sean parejos y las partidas de 3–4 no se descontrolen. Activable por el anfitrión.)*
- No se puede repetir una coordenada ya disparada al mismo jugador.

### 3.2 Turno (3–4 jugadores) — regla de la casa RC-6
- En tu turno **elegís a qué jugador** disparás y a qué coordenada (un disparo).
- El objetivo responde Agua / Tocado / Hundido.
- Cada jugador mantiene **un registro de disparos por cada rival** (tu "radar" de cada tablero enemigo).
- **Eliminación:** cuando a un jugador le hunden **toda la flota**, queda **eliminado** (sigue como
  espectador). Sus casillas dejan de ser un objetivo válido.
- **Gana** el **último jugador con al menos un barco a flote**.
- *(RC-7: "represalia" — no podés disparar dos turnos seguidos al mismo jugador si hay otros vivos.
  Desactivado por defecto.)*

### 3.3 Información que ve cada jugador
- **Su propio tablero** completo (su flota + los disparos recibidos).
- De cada rival: **solo el resultado de sus propios disparos** a ese rival (agua/tocado/hundido y qué barco
  se hundió). Nunca la posición de barcos no tocados.

---

## 4. Fin de partida y revancha

- Overlay estándar con el ganador y un resumen (disparos, % de aciertos, barcos hundidos).
- *(RC-8: revelar los tableros de todos al terminar. Por defecto **sí**.)*
- **Revancha:** nueva fase de despliegue con los mismos jugadores.

---

## 5. Reglas de la casa (resumen — a confirmar)

| ID | Tema | Propuesta por defecto |
|---|---|---|
| RC-1 | Tiempo de despliegue | 90 s; autocompletar al azar lo que falte |
| RC-2 | Orientación de barcos | Horizontal / vertical (no diagonal) |
| RC-3 | Barcos pueden tocarse | **No** (1 casilla de agua alrededor, incl. diagonal) |
| RC-4 | Composición de flota | 5-4-3-3-2 (17 casillas); flota chica opcional para 3–4 |
| RC-5 | Tocado = disparar de nuevo | **No** (un disparo por turno) |
| RC-6 | 3–4 jugadores | Elegís objetivo + eliminación + gana el último a flote |
| RC-7 | No repetir objetivo consecutivo | No (desactivado) |
| RC-8 | Revelar tableros al final | Sí |
| RC-9 | Tiempo por disparo | 30 s; al agotarse, disparo al azar a una celda no probada |
| RC-10 | Bot | Disponible: dispara al azar y, tras un "tocado", busca en las 4 casillas adyacentes ("hunt & target") |
| RC-11 | Tamaño del tablero | 10×10 (evaluar 8×8 para partidas rápidas de 4) |

---

## 6. Notas para el engine (`GameEngine`)

- **Fases del juego:** `DEPLOY` (colocación privada, en paralelo) → `BATTLE` (turnos) → `OVER`.
- **Estado privado por jugador:** su grilla (flota + impactos recibidos).
- **Estado público / semi-público:** de quién es el turno, jugadores vivos/eliminados, y para cada par
  (yo → rival) mi grilla de disparos (agua/tocado/hundido). Los barcos ajenos intactos **no** se envían.
- **Acciones del cliente:**
  - `DEPLOY`: `{ "type": "place_fleet", "ships": [{ "id": "portaaviones", "cells": ["A1","A2",...] }, ...] }`
    → el servidor valida tamaños, límites, superposición y separación (RC-3).
  - `DEPLOY`: `{ "type": "ready" }` (confirma despliegue).
  - `BATTLE`: `{ "type": "fire", "target": "<playerId>", "cell": "D7" }`.
- **`view_for(player)`:** nunca revela posiciones de barcos rivales no impactados; en `DEPLOY` no revela
  nada de los demás.
- **Autoridad del servidor:** valida el despliegue, resuelve cada disparo, determina hundimientos y
  eliminación, controla el orden de turno y los timers (despliegue y disparo).
- **RNG servidor:** autocompletado de flota, disparos del bot, disparo por timeout. Semilla fija en tests.
- **Reconexión:** snapshot de la partida; al volver, se re-manda la grilla propia + los radares propios +
  el estado público. Si reconecta durante `DEPLOY` dentro del *grace period*, no pierde su despliegue en curso.

---

## 7. Fuentes

- [Batalla naval (juego) — Wikipedia (es)](https://es.wikipedia.org/wiki/Batalla_naval_(juego))
- [Reglas de la Batalla Naval — asisejuega.com](https://asisejuega.com/juegos-de-mesa/batalla-naval/)
- [Reglas del juego Guerra Naval — Mundijuegos](https://www.mundijuegos.com/multijugador/guerranaval/reglas/)
- [Batalla naval — Reglas del juego (player22)](https://player22.com/help/html/ES/play_battleships.html)
