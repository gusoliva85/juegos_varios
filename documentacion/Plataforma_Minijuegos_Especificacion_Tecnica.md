# Arquitectura e Ingeniería de Plataforma Web de Minijuegos Multijugador en Tiempo Real

## 1. Visión General del Proyecto
El objetivo principal es diseñar y desplegar una plataforma web modular y escalable para alojar minijuegos casuales y de cartas (Truco Argentino, Ludo, Ta-Te-Ti, Tutti Frutti, Ahorcado, entre otros). La plataforma debe permitir el juego tanto en modo solitario (contra IA/Bots) como en modo **multijugador en tiempo real** (P2P o basado en salas), garantizando la posibilidad de invitar a otros usuarios mediante un enlace único (URL con *room ID*) compatible con WhatsApp y redes sociales.

Este documento sirve como especificación técnica completa (blueprint de arquitectura e implementación) para ser consumido por un desarrollador o un modelo de lenguaje (LLM) de generación de código.

---

## 2. Decisiones de Arquitectura y Stack Tecnológico

Para garantizar baja latencia, desarrollo ágil, bajo costo de hosting inicial y facilidad de mantenimiento, se selecciona un stack moderno basado totalmente en JavaScript/TypeScript.

### 2.1 Stack Frontend
- **Framework Principal:** React 18+ (con Vite) o Next.js 14+ (App Router). 
  - *Recomendación:* **Next.js 14 (App Router)** si se requiere Server-Side Rendering (SSR) y Optimización Open Graph (tarjetas visuales atractivas cuando se comparte el link por WhatsApp). Si se busca máxima simplicidad, **Vite + React (SPA)** desplegado en Vercel/Netlify.
- **Estilos:** Tailwind CSS (diseño responsivo móvil-primero) + Lucide Icons + Framer Motion (animaciones de cartas/fichas).
- **Gestión de Estado Local/UI:** Zustand (más liviano y performante que Redux para sincronización fluida de estado de juegos).
- **Motor de Juegos 2D (Opcional según el juego):**
  - Para Ta-Te-Ti, Tutti Frutti, Ahorcado, Truco: **HTML Canvas / React DOM (Tailwind + CSS Transitions)** es suficiente y más ligero.
  - Para Ludo o juegos con físicas/tableros complejos: **Phaser.js** o **PixiJS** integrado en componentes de React.

### 2.2 Stack Backend (Real-Time Server)
El corazón del multijugador en tiempo real requiere mantener un estado persistente de las partidas y comunicación bidireccional de baja latencia.

- **Opción A (Recomendada para Juegos de Lógica/Turnos): Node.js + Colyseus.io (o Socket.io)**
  - **Colyseus:** Framework de servidor multijugador enfocado en juegos para Node.js. Proporciona sincronización de estado automática (*state mutation*), manejo de salas (*rooms*), autoritariedad de servidor y reconexión de clientes.
  - **Socket.io:** Excelente alternativa si se busca un enfoque nativo sobre WebSockets sin opiniones estrictas de framework.
- **Opción B (Infraestructura Serverless / Managed): PartyKit / Firebase Realtime Database / Supabase Realtime**
  - **PartyKit:** Basado en Cloudflare Workers (Edge Websockets), ideal para baja latencia global y arquitectura basada en salas (1 "party" = 1 sala de juego).

### 2.3 Base de Datos y Autenticación
- **Base de Datos:** PostgreSQL (vía Supabase o Prisma + Render/NeonDB).
  - Almacena: Usuarios, estadísticas (partidas ganadas/perdidas), monedas/puntos, historial de salas y minijuegos desbloqueados/habilitados.
- **Autenticación:** Supabase Auth, Clerk o NextAuth.js.
  - Métodos: Autenticación Anónima (para jugar al instante sin registro) + OAuth (Google/WhatsApp) para guardar progreso.

---

## 3. Modelo de Dominio y Arquitectura Real-Time

### 3.1 Arquitectura de Comunicación: Client-Server Autoritario
Para evitar trampas (*cheating*) en juegos como el Truco (donde las cartas de la mano deben ser secretas), la lógica del juego **DEBE ser autoritaria en el servidor**.

1. **Cliente:** Envía solo acciones del usuario (ej: `PLAY_CARD { cardId: '4_Espada' }`, `CANTAR_TRUCO`).
2. **Servidor:** Valida el turno, ejecuta las reglas del juego, modifica el estado de la sala (*GameState*) y emite una versión filtrada/segura del estado a cada cliente.
3. **Visibilidad de datos:** El servidor nunca debe enviar el mazo completo o las cartas de los oponentes a los clientes no autorizados.

```
+-------------------------------------------------------------------+
|                        CLIENTE A (Navegador)                      |
|  - Interfaz de Usuario (React)                                    |
|  - Renderizado de Estado                                          |
|  - Envía: Action("CANTAR_VALE_FOUR")                              |
+-------------------------------------------------------------------+
                                 ^ | (WebSocket / Socket.io)
                                 | v
+-------------------------------------------------------------------+
|                    SERVIDOR CENTRAL (Node.js / Colyseus)           |
|  - Room Manager (Mapeo de Room IDs)                               |
|  - Game Logic Engine (Validación de reglas, turnos, puntajes)      |
|  - State Broadcast (Envía estado filtrado según el jugador)      |
+-------------------------------------------------------------------+
                                 ^ |
                                 | v
+-------------------------------------------------------------------+
|                        CLIENTE B (Navegador)                      |
+-------------------------------------------------------------------+
```

### 3.2 Flujo de Invitación por Enlace (WhatsApp Integration)
1. **Creación de Sala:** El Usuario A presiona "Crear Sala" en el minijuego (ej: Truco).
2. **Generación de ID Único:** El servidor crea la sala con un ID corto y aleatorio (ej: `TRU-8X2A`).
3. **Generación de Enlace:** La URL del cliente se convierte en `https://mi-plataforma.com/play/truco?room=TRU-8X2A`.
4. **Metadatos Open Graph Dinámicos (Meta Tags):**
   - Cuando se envía el enlace por WhatsApp, el servidor Next.js o un Edge Worker genera tags Open Graph personalizados:
     - `og:title`: "¡Juan te desafió a una partida de Truco!"
     - `og:description`: "Hacé clic acá para unirte instantáneamente."
     - `og:image`: Imagen dinámica de preview de la mesa de juego.
5. **Conexión Directa:** Cuando el Usuario B abre el link, el cliente extrae `room=TRU-8X2A`, autentica anónimamente al usuario si no inició sesión y se conecta mediante WebSocket a esa sala.

---

## 4. Diseño Modular para Habilitación de Minijuegos

Para permitir que los juegos se vayan "desbloqueando" o habilitando de forma dinámica sin rehacer el código central, se implementa una arquitectura basada en **Registro de Módulos (Plugin Architecture)**.

### 4.1 Estructura del Core
```text
/src
  /core
    /lobby           # Sistema de salas, chat global, invitaciones
    /auth            # Autenticación anónima y de usuarios
    /ui              # Componentes de UI compartidos (modales, avatares, botones)
  /games             # Registro modular de juegos
    /index.ts        # GameRegistry: Define qué juegos están activos/bloqueados
    /truco
      /components    # UI propia del Truco
      /logic         # Lógica de cliente / reducers
      /server        # Lógica del servidor (reglas, estado)
      config.ts      # Metadatos del juego (nombre, minPlayers, maxPlayers, enabled)
    /tateti
    /ludo
    /tutifruti
    /ahorcado
```

### 4.2 Configuración Única de Juego (`config.ts`)
```typescript
export interface GameConfig {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  minPlayers: number;
  maxPlayers: number;
  status: 'active' | 'coming_soon' | 'locked';
  unlockRequirement?: {
    level?: number;
    coins?: number;
  };
  component: React.ComponentType;
}
```

---

## 5. Especificación Técnica de los Minijuegos Iniciales

### 5.1 Truco Argentino (Carta / Estrategia)
- **Jugadores:** 2 (1v1) o 4 (2v2).
- **Servidor Engine:**
  - Máquina de estados finitos (FSM) para manejar envidos, trucos, re-trucos, vale cuatro, flor y quieros/no quieros.
  - Mazo de 40 cartas españolas (sin 8, 9 ni comodines).
  - Algoritmo de jerarquía de cartas (Ancho de Espadas > Ancho de Bastos > 7 de Espadas > ...).
- **Puntos:** 15 o 30 puntos.

### 5.2 Tutti Frutti (Palabras / Velocidad)
- **Jugadores:** 2 a 8.
- **Mecánica Real-Time:**
  - Ruleta de letras en tiempo real.
  - Temporizador global (*countdown*) cuando un jugador presiona "¡STOP Tutti Frutti!".
  - Sistema de validación de palabras (integración con diccionario o validación comunitaria entre jugadores por votación).

### 5.3 Ludo (Tablero / Dados)
- **Jugadores:** 2 a 4.
- **Mecánica:**
  - Generación de números aleatorios segura en el servidor (CSPRNG).
  - Cálculo de caminos y colisiones (comer fichas, casilleros seguros).
  - Visualización del tablero en Canvas o SVG interactivo.

### 5.4 Ta-Te-Ti (Tres en Raya) y Ahorcado
- **Jugadores:** 2 (Ta-Te-Ti) o 1 a 4 (Ahorcado cooperativo/competitivo).
- **Propósito:** Juegos ultraligeros ideales para pruebas de carga iniciales e integración del sistema de salas.

---

## 6. Infraestructura de Despliegue y CI/CD (Producción)

### 6.1 Configuración de Servidores
Dado que los WebSockets requieren conexiones persistentes, la plataforma requiere dos componentes de infraestructura:

1. **Frontend & API Routes (Next.js):**
   - **Plataforma:** Vercel o Netlify.
   - **Función:** Renderizado de páginas, SEO, metadatos Open Graph dinámicos, assets estáticos (CDN).
2. **WebSocket & Game Server (Node.js / Colyseus / Socket.io):**
   - **Plataforma:** Render.com, Railway.app, Fly.io o AWS EC2/App Runner.
   - **Razón:** Requiere procesos *stateful* en ejecución continua (los servidores Serverless tradicionales de Vercel cortan conexiones WebSocket persistentes).
3. **Database & Caching:**
   - **Database:** Supabase (PostgreSQL).
   - **Cache / Session Store:** Redis (Upstash) para sincronizar presencia de usuarios online y estado temporal de salas.

```
                 +-----------------------+
                 |    Usuario / Client   |
                 +-----------------------+
                             |
             +---------------+---------------+
             | (HTTPS)                       | (WSS - WebSockets)
             v                               v
+------------------------+      +------------------------+
| Vercel / Netlify       |      | Render / Railway       |
| (Frontend Next.js)     |      | (Game Server Engine)   |
+------------------------+      +------------------------+
             |                               |
             +---------------+---------------+
                             |
                             v
                +------------------------+
                | Supabase / Redis       |
                | (Persistencia/Cache)   |
                +------------------------+
```

---

## 7. Hoja de Ruta (Roadmap) de Implementación para el LLM

### Fase 1: Core System & Ludo/Ta-Te-Ti (Semanas 1-2)
- Implementar estructura del proyecto Next.js + Tailwind.
- Configurar servidor Node.js/Express con Socket.io/Colyseus.
- Desarrollar sistema de generación de salas (`/room/[id]`) y sincronización de URL.
- Implementar autenticación anónima y sistema de invitaciones vía link.
- Construir Ta-Te-Ti como prueba de concepto (PoC) para validar la comunicación en tiempo real.

### Fase 2: Módulo de Truco Argentino y UI Polida (Semanas 3-4)
- Desarrollar la FSM del Truco en el servidor (Mazo, repartir, rondas, envido, truco).
- Crear la interfaz visual de la mesa de Truco (arrastrar/cliquear cartas, botones de canto).
- Configurar dinámicamente las imágenes de previsualización para compartir por WhatsApp.

### Fase 3: Tutti Frutti, Ludo y Sistema de Progresión (Semanas 5-6)
- Integrar Tutti Frutti con sincronización de inputs y timer global.
- Integrar Ludo con tablero en Canvas/SVG.
- Implementar lógica de desbloqueo de juegos (`GameRegistry`) basada en nivel o monedas acumuladas.

---

## 8. Consideraciones Técnicas Críticas y Seguridad

1. **Reconexión Automática:** Si la conexión a internet móvil de un usuario se interrumpe 5 segundos, el servidor debe mantener su lugar en la sala (*grace period* de 30-60 segundos) y rehidratar el estado del juego al reconectarse.
2. **Prevención de Trampas:** Ningún cálculo crítico de puntos, victoria o reparto de cartas se debe realizar en el cliente.
3. **Rate Limiting:** Prevenir ataques de denegación de servicio en las salas mediante restricción de emisiones de eventos por segundo por socket.
