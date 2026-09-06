# Reglas · Ahorcado

> Documento vivo. Lo que está bajo **"Reglas de la casa"** es lo que hay que **confirmar / ajustar** antes
> de implementar el engine (`backend/app/games/ahorcado/`).
> Estado: **borrador para revisión**.

---

## 1. Resumen

Juego de adivinar una **palabra oculta** letra por letra. Cada error suma un trazo al dibujo del
"ahorcado"; si se completa el dibujo antes que la palabra, se pierde. Adaptado a **2–4 jugadores** con dos
modos: **cooperativo** (todos contra la palabra) y **por turnos** (competitivo).

- **Jugadores:** 2 a 4.
- **Duración:** 2–5 min por palabra / ronda.
- **Material:** banco de palabras en español rioplatense + dibujo progresivo (SVG, estilo de la skill).
- **Azar:** elección de la palabra (del servidor).

---

## 2. Elementos comunes

- **Palabra oculta:** se muestra como guiones, uno por letra (`_ _ _ _ _`). Los espacios y guiones de
  palabras compuestas se muestran ya revelados.
- **Abecedario:** A–Z **incluida la Ñ**. *(RC-1: los dígrafos "ch"/"ll"/"rr" se tratan como letras
  simples c-h, l-l, r-r; las **tildes** no se piden — la "á" se acierta con "a" y se muestra con tilde.)*
- **Letra repetida:** si la letra ya fue intentada, **no cuenta** (ni suma error ni gasta turno). Se avisa.
- **Vidas / errores permitidos:** **6 por defecto** (cabeza, cuerpo, 2 brazos, 2 piernas). *(RC-2:
  configurable 5–10; con la soga/base serían 8–10 trazos.)*
- **Pista opcional:** categoría de la palabra (ej. "Animales", "Países", "Comida"). *(RC-3: mostrar
  categoría SÍ por defecto.)*

---

## 3. Modo Cooperativo (por defecto)

Todos los jugadores juegan **contra la misma palabra**, elegida por el servidor.

- Se juega **por turnos rotativos**: en tu turno proponés **una letra** (o arriesgás la palabra completa,
  ver §5).
- **Los errores son compartidos:** el contador de fallos es único para el equipo.
- **Ganan todos** si completan la palabra antes de quedarse sin vidas.
- **Pierden todos** si se acaban las vidas. Se revela la palabra.
- Se juega a **N palabras** (RC-4: por defecto 3) y al final se muestra cuántas adivinó el grupo.

*(RC-5: alternativa "todos a la vez" sin turnos — el primero que manda una letra la juega. Por defecto se
usa **por turnos** para que sea ordenado online.)*

---

## 4. Modo Por turnos / competitivo (regla de la casa RC-6)

Cada jugador tiene **su propia palabra** (misma longitud/categoría, distinta palabra) y **su propio
contador de errores**.

- Se turnan. En tu turno, tirás una letra **a tu palabra**.
- **Gana** el primero que **completa su palabra**.
- Si te quedás **sin vidas**, quedás **eliminado** de la ronda (seguís mirando).
- Si todos quedan eliminados, **nadie gana** esa ronda.
- Se juega a **N rondas** (RC-4) y gana quien ganó más.

*(RC-7: variante "el que pone la palabra" — un jugador escribe una palabra para que adivinen los demás y
va rotando. Requiere validar la palabra ingresada (largo, sin números, del idioma). Por defecto **no** en
v1; la palabra siempre la elige el servidor.)*

---

## 5. Arriesgar la palabra completa

- En tu turno, en lugar de una letra, podés **escribir la palabra completa**.
- Si acertás → **ganás** (tu palabra, en competitivo) o **el equipo gana esa palabra** (cooperativo).
- Si errás → cuenta como **error grave**: *(RC-8: por defecto resta **2 vidas**; alternativa: pierde el
  turno / pierde la ronda / resta 1).*

---

## 6. Fin y revancha

- Overlay de resultado estándar: palabra(s), quién ganó / si el grupo lo logró.
- **Revancha:** nuevas palabras, mismos jugadores. El orden de turno rota.

---

## 7. Reglas de la casa (resumen — a confirmar)

| ID | Tema | Propuesta por defecto |
|---|---|---|
| RC-1 | Tildes y dígrafos | No se piden tildes; dígrafos como letras simples |
| RC-2 | Vidas / errores | 6 |
| RC-3 | Mostrar categoría | Sí |
| RC-4 | Palabras / rondas por partida | 3 |
| RC-5 | Cooperativo: turnos vs. libre | Por turnos |
| RC-6 | Modo por defecto | Cooperativo |
| RC-7 | "El que pone la palabra" | No en v1 (palabra del servidor) |
| RC-8 | Fallar la palabra completa | −2 vidas |
| RC-9 | Longitud mínima de palabra | 4 letras |
| RC-10 | Tiempo por turno | Suave: 30 s; al agotarse, se pasa turno (sin penalidad) |
| RC-11 | Bot | Disponible: elige letras por frecuencia del español (a, e, o, s, r, n, i, d, l, c…) |

---

## 8. Banco de palabras

- Archivos por categoría en `backend/app/games/ahorcado/words/` (texto plano, una palabra por línea).
- Categorías iniciales: **Animales, Países, Comida, Deportes, Objetos de casa, Profesiones**.
- Reglas del banco: español rioplatense, sustantivos comunes en general, longitud ≥ RC-9, sin nombres
  propios salvo "Países", sin ofensivas.
- El servidor guarda dos formas: **normalizada** (sin tildes, mayúsculas) para comparar, y **para mostrar**
  (con tildes).

---

## 9. Notas para el engine (`GameEngine`)

- **Estado público (según modo):**
  - Cooperativo: máscara de la palabra, letras erradas, vidas restantes, categoría, de quién es el turno,
    palabras jugadas/pendientes.
  - Competitivo: además, el progreso (máscara + vidas) de **cada** jugador.
- **La palabra objetivo NUNCA se manda al cliente** hasta que la ronda termina (acierto o derrota).
- **Acciones del cliente:**
  - `{ "type": "guess_letter", "letter": "a" }`
  - `{ "type": "guess_word", "word": "elefante" }`
- **`legal_actions`:** solo en turno; letras aún no intentadas.
- **RNG servidor:** elección de palabra y categoría. Semilla fija en tests.
- **Reconexión:** re-mandar el estado público del modo; el jugador no pierde su turno ni sus vidas si
  reconecta dentro del *grace period*.

---

## 10. Fuentes

- Conocimiento general del juego (dominio público). Las reglas base son universales; las adaptaciones
  multijugador y de puntaje son **decisiones de la casa** documentadas arriba.
