# Reglas · Ta-Te-Ti (Tres en línea)

> Documento vivo. Lo que está bajo **"Reglas de la casa"** es lo que hay que **confirmar / ajustar** antes
> de implementar el engine (`backend/app/games/tateti/`).
> Estado: **borrador para revisión**.

---

## 1. Resumen

Juego de tablero abstracto, por turnos, información perfecta (no hay nada oculto). Dos jugadores marcan
casillas de una grilla 3×3; gana quien alinea tres marcas propias.

- **Jugadores:** 2 (exactamente).
- **Duración:** < 1 minuto por partida.
- **Material:** grilla de 3×3. Un jugador es **✕**, el otro **◯** (glyphs de la skill; sin emoji).
- **Azar:** ninguno, salvo (opcional) sortear quién empieza.

---

## 2. Preparación

1. La sala necesita **2 jugadores conectados y "listos"**. El anfitrión da "Jugar".
2. Se asignan las marcas: el **anfitrión es ✕**, el invitado es **◯**.
   *(Regla de la casa RC-1: alternativa = sortear las marcas al azar.)*
3. Empieza **✕**.

---

## 3. Desarrollo de una partida

- Los jugadores se turnan. En su turno, el jugador **coloca su marca en una casilla vacía**. No se puede
  pasar ni deshacer.
- El turno pasa al otro jugador.
- La partida termina cuando:
  - un jugador forma **tres marcas propias en línea** (fila, columna o diagonal) → **ese jugador gana**; o
  - **no quedan casillas vacías** y nadie alineó tres → **empate** ("gato").

---

## 4. Fin de partida y revancha

- Se muestra el resultado (ganador o empate) con el overlay estándar.
- **Revancha:** vuelve a empezar con los mismos 2 jugadores.
  - **Regla de la casa RC-2:** en la revancha **empieza quien perdió** la partida anterior; si fue empate,
    alterna respecto de quién empezó la última.

---

## 5. Reglas de la casa (a confirmar)

| ID | Tema | Propuesta por defecto | Alternativas |
|---|---|---|---|
| RC-1 | Asignación de marcas | Anfitrión = ✕, invitado = ◯ | Sorteo al azar |
| RC-2 | Quién empieza la revancha | El perdedor de la partida anterior (alterna si hubo empate) | Siempre ✕ / siempre el anfitrión / sorteo |
| RC-3 | Tiempo por jugada | Sin límite | Reloj de 15–30 s; al agotarse, jugada al azar o derrota |
| RC-4 | Bot | Disponible: si falta el 2º jugador, el anfitrión puede llenar el slot con un bot | — |
| RC-5 | Serie | Partida única | "Al mejor de 3 / 5" con marcador acumulado |

---

## 6. Comportamiento del bot (RC-4)

Bot de dificultad fija, "imbatible razonable":
1. Si puede **ganar** en esta jugada, gana.
2. Si el rival **gana en la próxima**, lo bloquea.
3. Si no, prioriza **centro → esquinas → lados**.

*(Regla de la casa RC-6: agregar un nivel "fácil" que juega al azar el 40% de las veces.)*

---

## 7. Notas para el engine (`GameEngine`)

- **Acciones del cliente:** `{ "type": "place", "cell": 0..8 }`.
- **`legal_actions`:** todas las celdas vacías, solo si es el turno del jugador.
- **`view_for`:** el mismo estado para ambos (tablero, de quién es el turno, resultado). No hay info secreta.
- **`is_over` / `result`:** ganador (`x` | `o`) o `draw`.
- **RNG:** solo para RC-1/RC-2/RC-6 si se activan; se inyecta.
- **Reconexión:** el estado es chico; se re-manda `game.view` completo.

---

## 8. Fuentes

- Conocimiento general del juego (dominio público). No requiere fuente externa; las reglas son universales.
