# PROYECTO DE JUEGO WEB
# "INTRIGA EN EL CASTILLO"

Documento de diseño del juego (Game Design Document inicial)
Versión: 0.1

Este documento recoge TODO el diseño conceptual desarrollado hasta ahora
para crear un juego de deducción para navegador inspirado en la mecánica
de deducción de Cluedo, pero con ambientación medieval y mecánicas propias.

El objetivo es que este documento sirva como base para desarrollo.

---------------------------------------------------------------------

# 1. CONCEPTO GENERAL DEL JUEGO

Nombre provisional:
Intriga en el Castillo

Género:
Juego de deducción / misterio / estrategia ligera

Inspiración:
mecánica de deducción tipo Cluedo pero con sistema ampliado y ambientación medieval.

Objetivo del jugador:
Descubrir la combinación secreta del misterio antes que los demás jugadores.

La solución del misterio está formada por cuatro elementos:

- Conspirador
- Método
- Lugar
- Motivo

Los jugadores recorren el castillo investigando habitaciones, obteniendo pistas,
interrogando a otros jugadores y deduciendo información hasta poder realizar
una acusación final.

---------------------------------------------------------------------

# 2. ESTRUCTURA DEL MISTERIO

La solución del misterio se genera al inicio de cada partida.

Se elige aleatoriamente una carta de cada categoría:

- 1 conspirador
- 1 método
- 1 lugar
- 1 motivo

Estas cartas se colocan en un sobre secreto.

El resto de cartas se mezclan y se reparten entre los jugadores.

Los jugadores utilizan las cartas que poseen y las pistas obtenidas para
deducir la combinación secreta.

---------------------------------------------------------------------

# 3. CARTAS DEL JUEGO

Total de cartas: 27

Tipos de carta:

1. Conspirador
2. Método
3. Lugar
4. Motivo

---------------------------------------------------------------------

## 3.1 CARTAS DE CONSPIRADOR

Total: 6

Cartas:

Caballero Real  
Reina  
Alquimista  
Embajador  
Sacerdotisa  
Bufón  

Estas representan posibles responsables del crimen o conspiración.

---------------------------------------------------------------------

## 3.2 CARTAS DE MÉTODO

Total: 6

Cartas:

Veneno  
Daga  
Hechizo  
Flecha  
Trampa  
Bestia liberada  

Representan el método utilizado para cometer el crimen.

---------------------------------------------------------------------

## 3.3 CARTAS DE LUGAR

Total: 9

Cartas:

Salón del Trono  
Biblioteca  
Armería  
Torre del Mago  
Mazmorras  
Jardines  
Capilla  
Cocina Real  
Sala del Consejo  

Representan el lugar donde ocurrió el crimen.

---------------------------------------------------------------------

## 3.4 CARTAS DE MOTIVO

Total: 6

Cartas:

Ambición al trono  
Venganza  
Conspiración extranjera  
Herejía  
Deuda  
Amor prohibido  

Representan el motivo del conspirador.

---------------------------------------------------------------------

# 4. COMBINACIONES POSIBLES

Número total de misterios posibles:

6 conspiradores
6 métodos
9 lugares
6 motivos

6 × 6 × 9 × 6 = 1944 combinaciones posibles

Esto asegura alta rejugabilidad.

---------------------------------------------------------------------

# 5. TABLERO DEL JUEGO

El tablero representa un castillo medieval.

Diseño:

3 × 3 habitaciones.

Distribución:

[Torre del Mago]    [Biblioteca]        [Armería]

[Capilla]           [Salón del Trono]   [Sala del Consejo]

[Cocina Real]       [Jardines]          [Mazmorras]

---------------------------------------------------------------------

# 6. CONEXIONES ENTRE HABITACIONES

Las habitaciones están conectadas horizontal y verticalmente.

Ejemplo de conexiones:

Torre del Mago <-> Biblioteca  
Biblioteca <-> Armería  

Capilla <-> Salón del Trono  
Salón del Trono <-> Sala del Consejo  

Cocina Real <-> Jardines  
Jardines <-> Mazmorras  

Verticales:

Torre <-> Capilla  
Capilla <-> Cocina  

Biblioteca <-> Trono  
Trono <-> Jardines  

Armería <-> Consejo  
Consejo <-> Mazmorras  

---------------------------------------------------------------------

# 7. PASADIZOS SECRETOS

Conexiones especiales entre habitaciones lejanas.

Ejemplos:

Torre del Mago <-> Mazmorras  
Biblioteca <-> Cocina Real  

Permiten movimiento estratégico.

---------------------------------------------------------------------

# 8. FUNCIONES DE LAS HABITACIONES

Cada habitación tiene un efecto especial.

Torre del Mago
Analizar objetos o pistas mágicas.

Biblioteca
Obtener pistas documentales.

Armería
Descubrir pistas relacionadas con métodos.

Capilla
Detectar mentiras o realizar preguntas especiales.

Salón del Trono
Lugar donde se pueden realizar acusaciones finales.

Sala del Consejo
Obtener rumores políticos.

Cocina Real
Escuchar rumores entre sirvientes.

Jardines
Permiten movimiento adicional o rutas alternativas.

Mazmorras
Permiten interrogar a otros jugadores.

---------------------------------------------------------------------

# 9. MOVIMIENTO

Cada turno:

1. Tirar un dado (1–6)
2. Moverse por pasillos
3. Entrar en una habitación
4. Realizar acción de investigación

Movimiento real
	•	solo puedes ir a habitaciones conectadas

Dado funcional
	•	el resultado define cuántos movimientos puedes hacer
  
---------------------------------------------------------------------

# 10. PERSONAJES JUGABLES

Cada jugador controla un personaje.

Cada personaje posee una habilidad especial única.

Total: 6 personajes.

---------------------------------------------------------------------

## 10.1 CABALLERO REAL

Descripción:
Defensor del castillo.

Habilidad:
Marcha forzada.

Puede moverse +1 casilla después de tirar el dado.

---------------------------------------------------------------------

## 10.2 ALQUIMISTA

Descripción:
Experto en sustancias y experimentos.

Habilidad:
Análisis.

Una vez por partida puede:

ver una carta adicional o analizar un objeto.

---------------------------------------------------------------------

## 10.3 BUFÓN DEL CASTILLO

Descripción:
Observador silencioso que escucha todo.

Habilidad:
Oído fino.

Cuando otro jugador muestra una carta para refutar una sospecha,
el bufón también puede verla.

---------------------------------------------------------------------

## 10.4 SACERDOTISA

Descripción:
Guía espiritual del castillo.

Habilidad:
Intuición.

Una vez por partida puede preguntar a un jugador:

"¿Tienes alguna carta de esta categoría?"

Categorías posibles:

conspirador  
método  
lugar  
motivo  

El jugador responde sí o no.

---------------------------------------------------------------------

## 10.5 CAPITÁN DE LA GUARDIA

Descripción:
Responsable de la seguridad del castillo.

Habilidad:
Bloqueo.

Puede bloquear una sala durante un turno.

---------------------------------------------------------------------

## 10.6 EMBAJADOR EXTRANJERO

Descripción:
Diplomático con muchos secretos.

Habilidad:
Negociación.

Puede intercambiar una carta al azar con otro jugador.

---------------------------------------------------------------------

# 11. SISTEMA DE PISTAS

El juego incluye varios tipos de pistas.

---------------------------------------------------------------------

## 11.1 RUMORES

Se obtienen en ciertas habitaciones.

Ejemplos:

El crimen no ocurrió en la biblioteca  
El método no fue veneno  
La sacerdotisa es inocente  

Algunos rumores pueden ser falsos.

---------------------------------------------------------------------

## 11.2 EVIDENCIAS

Pistas siempre verdaderas.

Ejemplos:

El crimen ocurrió en la torre del mago  
El motivo fue venganza  

Son más raras que los rumores.

---------------------------------------------------------------------

## 11.3 INTERROGATORIOS

En las mazmorras se puede interrogar a otro jugador.

Opciones:

ver una carta al azar  
pregunta sí/no

---------------------------------------------------------------------

## 11.4 ARCHIVOS DEL CASTILLO

En la biblioteca se pueden consultar documentos.

Permiten eliminar opciones.

---------------------------------------------------------------------

## 11.5 EVENTOS DEL CASTILLO

Cada ronda se roba una carta de evento.

Ejemplos:

Banquete real  
Tormenta  
Mensajero  
Guardia alerta  

Los eventos modifican temporalmente el tablero o las reglas.

---------------------------------------------------------------------

# 12. EJEMPLO DE MISTERIO

Conspirador: Embajador  
Método: Veneno  
Lugar: Biblioteca  
Motivo: Conspiración extranjera

---------------------------------------------------------------------

# 13. SISTEMA DE DEDUCCIÓN

Los jugadores utilizan:

sus cartas  
rumores  
evidencias  
interrogatorios  
sospechas  

para eliminar posibilidades.

---------------------------------------------------------------------

# 14. SOSPECHAS

Cuando un jugador entra en una habitación puede formular una sospecha.

Ejemplo:

"Creo que el Embajador usó Veneno en la Biblioteca por Venganza."

Otros jugadores deben mostrar una carta si pueden refutar.

---------------------------------------------------------------------

# 15. ACUSACIÓN FINAL

Solo puede realizarse en el Salón del Trono.

Si el jugador acierta:

gana la partida.

Si falla:

queda eliminado de la posibilidad de ganar.

---------------------------------------------------------------------

# 16. SISTEMA DE REGISTRO DE INVESTIGACIÓN

Cada jugador tiene una libreta de deducción.

Ejemplo:

CONSPIRADORES

Caballero ❌  
Reina ❌  
Alquimista ❓  
Embajador ❓  

Esto ayuda a organizar pistas.

---------------------------------------------------------------------

# 17. ESTRUCTURA DEL PROYECTO WEB

Proyecto inicial:

castle-mystery/

index.html  
style.css  
game.js  
board.js  
players.js  
cards.js  

---------------------------------------------------------------------

# 18. REPRESENTACIÓN BÁSICA EN CÓDIGO

Ejemplo de estructura de cartas en JavaScript:

const cards = {

conspiradores: [
"Caballero",
"Reina",
"Alquimista",
"Embajador",
"Sacerdotisa",
"Bufon"
],

metodos: [
"Veneno",
"Daga",
"Hechizo",
"Flecha",
"Trampa",
"Bestia"
],

lugares: [
"Trono",
"Biblioteca",
"Armeria",
"Torre",
"Mazmorras",
"Jardines",
"Capilla",
"Cocina",
"Consejo"
],

motivos: [
"Ambicion",
"Venganza",
"Conspiracion",
"Herejia",
"Deuda",
"Amor"
]

};

---------------------------------------------------------------------

FIN DEL DOCUMENTO