# Reglas · Chinchón

> Documento vivo. Lo que está bajo **"Reglas de la casa"** es lo que hay que **confirmar / ajustar** antes
> de implementar el engine (`backend/app/games/chinchon/`).
> Estado: **borrador para revisión**.

---

## 1. Resumen

Juego de naipes de combinaciones, por turnos, con **mano oculta** (cada jugador ve solo sus cartas). En
cada ronda se roba y se descarta una carta buscando **ligar** todas las cartas en escaleras del mismo palo
o en grupos de igual número, para poder **cerrar**. Al cerrar se cuentan los puntos de las cartas sin
ligar; se acumulan entre rondas y **queda eliminado quien llega a 100**. Gana el último en pie (o el de
menos puntos si se juega a un número fijo de rondas).

- **Jugadores:** 2 a 4.
- **Duración:** 10–25 min (varias rondas).
- **Material:** baraja española + comodín (ver §3). Assets compartidos de la plataforma (Fase 7 del roadmap).
- **Azar:** reparto y robo del mazo.

---

## 2. Objetivo

- **De la ronda:** ligar las 7 cartas de la mano y **cerrar** descartando una carta de valor bajo
  (ver §6), para sumar pocos (o restar) puntos.
- **De la partida:** no llegar a **100 puntos**. Cuando alguien llega, queda eliminado; gana el último que
  queda. *(RC-1: alternativa = jugar N rondas fijas y gana el de menor puntaje.)*

---

## 3. Baraja (regla de la casa RC-2)

**Por defecto:** baraja española de **40 cartas** (1–7, 10, 11, 12 de oros, copas, espadas, bastos) **+ 2
comodines** = **42 cartas**. El comodín sustituye cualquier carta dentro de una combinación.

Alternativas habituales:
- 40 cartas usando **el as de oros como único comodín**.
- 48 cartas (incluye 8 y 9) + 2 comodines.

> **Decisión pendiente RC-2:** definir baraja. La recomendación es **40 + 2 comodines** por ser la más
> común en Argentina/Uruguay y encajar con el set de assets de baraja española.

---

## 4. Valor de las cartas (para contar puntos al final de la ronda)

| Carta | Puntos |
|---|---|
| As (1) | 1 |
| 2 – 7 | su valor nominal (2 a 7) |
| Sota (10) | 8 |
| Caballo (11) | 9 |
| Rey (12) | 10 |
| Comodín **sin ligar** en la mano | **25** (RC-3; alternativa: 20 o 50) |

Solo cuentan las **cartas que NO forman parte de una combinación válida**.

---

## 5. Combinaciones válidas ("ligues")

- **Escalera:** 3 o más cartas **consecutivas del mismo palo** (ej.: 4-5-6 de copas).
  - El orden es 1, 2, 3, 4, 5, 6, 7, **10 (sota), 11 (caballo), 12 (rey)**. La escalera **no da la vuelta**
    (no vale …11-12-1…). *(RC-4: confirmar que el 7 y la sota son consecutivos, que es lo estándar en la
    baraja de 40.)*
- **Grupo (o "pierna"):** 3 o 4 cartas del **mismo número** y **distinto palo** (ej.: tres reyes).
- Una carta **no puede usarse en dos combinaciones** a la vez.
- El **comodín** puede completar cualquier combinación, ocupando el lugar de la carta faltante. *(RC-5:
  ¿se permite más de un comodín en la misma combinación? Por defecto: **sí**, salvo que la combinación
  quede formada solo por comodines.)*

**Chinchón:** las 7 cartas forman **una única escalera del mismo palo** (7 consecutivas, sin comodín).
*(RC-6: ¿el chinchón "impuro", con comodín, también gana la partida? Por defecto: **no**, solo resta -25.)*

---

## 6. Desarrollo de una ronda

### 6.1 Reparto
- Se reparten **7 cartas a cada jugador**.
- El resto forma el **mazo** (boca abajo). Se da vuelta la primera carta para iniciar el **pozo de
  descartes** (boca arriba).
- Empieza el jugador a la **izquierda del que repartió** (el "repartidor" rota cada ronda).

### 6.2 Turno de un jugador
1. **Robar** una carta: del **mazo** (boca abajo) **o** la carta de arriba del **pozo de descartes**.
   - *(RC-7: por defecto no se puede robar del pozo la misma carta que uno acaba de descartar. Y si el mazo
     se agota, se baraja el pozo (dejando la última carta) y sigue.)*
2. Queda con 8 cartas.
3. **Descartar** una carta al pozo (boca arriba). Vuelve a 7.
4. **Opcional:** en vez de descartar normal, **cerrar** (ver §7).

El turno pasa al siguiente jugador.

---

## 7. Cerrar la ronda

Un jugador puede **cerrar** en su turno, **después de robar**, si puede dejar sus 7 cartas así:

- **6 cartas ligadas** en combinaciones válidas + **1 carta suelta de valor ≤ 5** (as, 2, 3, 4 o 5), que
  se **descarta boca abajo** como cierre. *(RC-8: el umbral ≤5 es el estándar; algunas casas usan ≤4 o
  exigen exactamente la carta de menor valor posible.)*
- **o las 7 cartas ligadas** (dos combinaciones que cubren todo, p. ej. 4+3, o una escalera de 7). En ese
  caso el jugador **se descuenta 10 puntos (−10)**. *(RC-9.)*
- **o Chinchón** (§5) → **gana la partida** al instante (o −25 y sigue, según RC-6).

### 7.1 Cuando alguien cierra
1. El que cerró muestra sus combinaciones.
2. **Los demás jugadores** muestran lo que tienen y **pueden "colgar" sus cartas sueltas en las
   combinaciones ajenas ya bajadas** (propias y del que cerró), respetando la validez de la combinación
   (agregar a una escalera por los extremos, agregar a un grupo la 4ª carta del mismo número).
   *(RC-10: por defecto SÍ se permite colgar en combinaciones del rival; alternativa = solo en las propias.)*
3. Cada jugador suma los puntos de las **cartas que le quedaron sin ligar** (§4) y se los anota.

---

## 8. Puntuación y fin de partida

- Los puntos de cada ronda **se acumulan**. Menos es mejor.
- **Eliminación:** al **llegar o superar 100**, el jugador queda **eliminado**.
  - **RC-11 (reenganche):** el jugador que llega a 100 puede **"reengancharse"** una vez, volviendo con el
    puntaje del jugador que va segundo peor (el más alto entre los que siguen). Por defecto: **1 reenganche
    por jugador**. Alternativa: sin reenganche.
- **Gana** el **último jugador no eliminado**.
- Si se juega la variante RC-1 (N rondas fijas), gana el de **menor puntaje** acumulado; el chinchón durante
  la partida resta −25 y no la termina.

### 8.1 Partida de 2 jugadores
Funciona igual (heads-up). Cuando uno llega a 100 y no le queda reenganche, gana el otro.

---

## 9. Reglas de la casa (resumen — a confirmar)

| ID | Tema | Propuesta por defecto |
|---|---|---|
| RC-1 | Formato | A eliminación (100 puntos) — *no* N rondas fijas |
| RC-2 | Baraja | Española 40 + **2 comodines** |
| RC-3 | Valor del comodín sin ligar | 25 |
| RC-4 | 7–sota consecutivos en escalera | Sí (estándar baraja 40) |
| RC-5 | Varios comodines por combinación | Permitido (no todo comodines) |
| RC-6 | Chinchón con comodín | No gana; resta −25 |
| RC-7 | Robo del pozo / mazo agotado | No la carta recién descartada; se rebaraja el pozo |
| RC-8 | Carta de cierre | Valor ≤ 5 |
| RC-9 | Cerrar con las 7 ligadas | −10 puntos |
| RC-10 | Colgar cartas en combinaciones del rival | Permitido |
| RC-11 | Reenganche a los 100 | 1 vez, con el puntaje del 2º peor |
| RC-12 | Tiempo por turno | Sin límite (evaluar reloj suave para partidas online) |
| RC-13 | Bot | No en v1 (Chinchón necesita IA de descarte razonable); evaluar bot simple más adelante |

---

## 10. Notas para el engine (`GameEngine`)

- **Estado por jugador (privado):** su mano (7–8 cartas).
- **Estado público:** carta superior del pozo, cantidad de cartas en el mazo, cantidad de cartas en mano de
  cada rival, puntajes acumulados, de quién es el turno, repartidor de la ronda.
- **Acciones del cliente:**
  - `{ "type": "draw", "from": "deck" | "discard" }`
  - `{ "type": "discard", "card": <id> }`
  - `{ "type": "close", "melds": [[...],[...]], "closeCard": <id> }` (el servidor **valida** las
    combinaciones; nunca confía en el cliente)
  - `{ "type": "layoff", "card": <id>, "meld": <ref> }` (fase post-cierre)
- **`view_for(player)`:** nunca revela cartas ajenas ni el mazo.
- **Validación de combinaciones y de cierre: 100% en el servidor.** El chinchón, el conteo de puntos, la
  eliminación y el reenganche los calcula el engine.
- **RNG servidor:** barajado y robo. Semilla fija solo en tests.
- **Reconexión:** snapshot de la ronda en curso; al volver, se re-manda la mano propia + estado público.

---

## 11. Fuentes

- [Chinchón (juego de naipes) — Wikipedia (es)](https://es.wikipedia.org/wiki/Chinch%C3%B3n_(juego_de_naipes))
- [Reglas del Chinchón — Mundijuegos](https://www.mundijuegos.com/multijugador/chinchon/reglas/)
- [Chinchón — Club Conservador de Cartes i Jocs (CCCJ)](https://www.cccj.es/reglaments/chinchon.htm)
- [Variantes del Chinchón — VIP Games](https://vipgames.com/es/blog/juego-chinchon/)
