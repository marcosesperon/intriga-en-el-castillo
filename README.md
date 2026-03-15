# Intriga en el Castillo

Un juego de deduccion medieval para navegador, inspirado en la mecanica de Cluedo pero con ambientacion propia, sistema de reputacion y castillo 3D interactivo.

## El Misterio

Un crimen sacude el reino. Cuatro secretos se ocultan tras los muros del castillo:

- **Conspirador** - Quien lo hizo (6 sospechosos)
- **Metodo** - Como lo hizo (6 metodos)
- **Lugar** - Donde ocurrio (9 habitaciones)
- **Motivo** - Por que lo hizo (6 motivos)

**1.944 combinaciones posibles** garantizan alta rejugabilidad.

## Caracteristicas

- **Castillo 3D interactivo** con Three.js: habitaciones, pasillos, pasadizos secretos, antorchas y efectos visuales
- **IA para 1-4 bots** con estrategias de deduccion
- **Sistema de reputacion** (-5 a +5) que afecta al juego: habilidades especiales, consecuencias en acusaciones, vigilancia de la guardia
- **Ciclo dia/noche** con transiciones de iluminacion
- **Eventos del castillo**: tormentas, revueltas, juicios, intrigas
- **Eventos narrativos** persistentes que modifican las reglas temporalmente
- **Sistema de objetos** recogidos en habitaciones
- **6 personajes jugables** con habilidades unicas
- **Libreta de investigacion** interactiva con notas manuales
- **Sospechas y refutaciones** con animaciones de cartas
- **Multiidioma**: Espanol e Ingles
- **Responsive**: adaptado a escritorio y movil

## Como jugar

1. Abre `index.html` en un navegador o usa un servidor local
2. Configura el numero de jugadores y tu personaje
3. Pulsa "Comenzar partida"

### Turno del jugador

1. **Dado** - Tira el dado para moverte entre salas
2. **Movimiento** - Haz clic en una sala iluminada para entrar
3. **Accion** - Investiga la habitacion, formula sospechas o usa objetos
4. **Deduce** - Marca en tu libreta lo que descubras

Ve al **Salon del Trono** cuando tengas claro el misterio para hacer tu **acusacion final**.

## Servidor de desarrollo

```bash
npx http-server -p 8080 -c-1
```

Luego abre `http://localhost:8080` en el navegador.

## Estructura del proyecto

```
index.html              # Pagina unica (HTML + CSS inline)
js/
  i18n.js               # Motor de internacionalizacion
  lang/es.js            # Traducciones espanol (~420 claves)
  lang/en.js            # Traducciones ingles
  constants.js          # Constantes del juego
  castle-layout.js      # Generacion procedural del castillo
  additional-rooms.js   # Mecanicas especiales de habitaciones
  gamestate.js          # Estado central del juego
  reputation.js         # Sistema de reputacion
  inventory.js          # Sistema de objetos
  ai.js                 # Logica de IA para bots
  board.js              # Interfaz del tablero
  board3d.js            # Renderizado 3D con Three.js
  board-manager.js      # Proxy entre modos 2D/3D
  ui.js                 # Sistema de interfaz completo
  refutation.js         # Sistema de sospechas y refutaciones
  game.js               # Motor principal del juego
  menu.js               # Menu con carga diferida de scripts
  boot.js               # Inicializacion
assets/
  img/portada.png       # Imagen de portada
  img/tablero.png       # Imagen de referencia del tablero
```

## Tecnologia

- **Vanilla JavaScript** — sin frameworks ni herramientas de build
- **CSS Grid** — layout responsive con paneles laterales y drawers moviles
- **Three.js r160** — renderizado 3D (cargado desde CDN bajo demanda)
- **OrbitControls** — camara interactiva con rotacion y zoom
- **CSS2DRenderer** — etiquetas de habitaciones sobre la escena 3D

## Licencia

[MIT](LICENSE)
