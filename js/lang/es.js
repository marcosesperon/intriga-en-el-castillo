// ─────────────────────────────────────────────────
// LOCALE: Español
// ─────────────────────────────────────────────────

I18n.register('es', {
    LANG_NAME: 'Español',

    // Card display names (key = internal name)
    CARD_NAMES: {
        'Caballero Real': 'Caballero Real',
        'Reina': 'Reina',
        'Alquimista': 'Alquimista',
        'Embajador': 'Embajador',
        'Sacerdotisa': 'Sacerdotisa',
        'Bufón': 'Bufón',
        'Veneno': 'Veneno',
        'Daga': 'Daga',
        'Hechizo': 'Hechizo',
        'Flecha': 'Flecha',
        'Trampa': 'Trampa',
        'Bestia liberada': 'Bestia liberada',
        'Torre del Mago': 'Torre del Mago',
        'Biblioteca': 'Biblioteca',
        'Armería': 'Armería',
        'Capilla': 'Capilla',
        'Salón del Trono': 'Salón del Trono',
        'Sala del Consejo': 'Sala del Consejo',
        'Cocina Real': 'Cocina Real',
        'Jardines': 'Jardines',
        'Mazmorras': 'Mazmorras',
        'Ambición al trono': 'Ambición al trono',
        'Venganza': 'Venganza',
        'Conspiración extranjera': 'Conspiración extranjera',
        'Herejía': 'Herejía',
        'Deuda': 'Deuda',
        'Amor prohibido': 'Amor prohibido'
    },

    // Room display names by index
    ROOM_DISPLAY_NAMES: [
        'Torre del Mago', 'Biblioteca', 'Armería',
        'Capilla', 'Salón del Trono', 'Sala del Consejo',
        'Cocina Real', 'Jardines', 'Mazmorras'
    ],

    // Player names
    PLAYER_NAMES: ['Tú', 'Bot Cedric', 'Bot Isolda', 'Bot Gareth', 'Bot Morgana'],

    // ── Buttons ──
    'btn.rollDice': 'Tirar dado',
    'btn.endMove': 'Terminar movimiento',
    'btn.suspect': 'Hacer sospecha',
    'btn.roomAction': 'Acción de sala',
    'btn.accuse': 'Acusar (Trono)',
    'btn.skip': 'Pasar turno',
    'btn.notebook': 'Libreta',
    'btn.startGame': 'Comenzar partida',
    'btn.continue': 'Continuar',
    'btn.cancel': 'Cancelar',
    'btn.close': 'Cerrar',
    'btn.investigate': 'Investigar',
    'btn.accuse_action': 'ACUSAR',
    'btn.consult': 'Consultar',
    'btn.ask': 'Preguntar',
    'btn.interrogate': 'Interrogar',
    'btn.backToMenu': 'Volver al menú',
    'btn.previous': 'Anterior',
    'btn.next': 'Siguiente',
    'btn.block': 'Bloquear',
    'btn.confirm': 'Confirmar',
    'btn.exchange': 'Intercambiar',
    'btn.declare': 'Declarar',

    // ── HUD ──
    'hud.turn': 'Turno: {name}',
    'hud.players': 'Jugadores:',
    'hud.yourCards': 'Tus cartas:',
    'hud.log': 'Registro:',

    // ── Phases ──
    'phase.ROLL_DICE': 'Tira el dado',
    'phase.MOVING': 'Movimiento ({remaining} restantes)',
    'phase.ACTION_CHOICE': 'Elige acción',
    'phase.SUSPICION_INPUT': 'Formulando sospecha...',
    'phase.REFUTATION_ROUND': 'Refutación...',
    'phase.ACCUSATION': 'Acusación...',
    'phase.END_TURN': 'Fin de turno',
    'phase.GAME_OVER': 'Partida terminada',

    // ── Categories ──
    'cat.conspiradores': 'Conspiradores',
    'cat.metodos': 'Métodos',
    'cat.lugares': 'Lugares',
    'cat.motivos': 'Motivos',
    'cat.conspirador': 'conspirador',
    'cat.metodo': 'método',
    'cat.motivo': 'motivo',

    // ── Menu ──
    'menu.title': 'Intriga en el Castillo',
    'menu.loading': 'Cargando...',
    'menu.loadingTitle': 'Preparando el castillo...',
    'loading.layout': 'Diseñando el castillo',
    'loading.rooms': 'Creando habitaciones',
    'loading.gamestate': 'Preparando la partida',
    'loading.reputation': 'Sistema de reputación',
    'loading.inventory': 'Inventario de objetos',
    'loading.ai': 'Entrenando a los rivales',
    'loading.board': 'Montando el tablero',
    'loading.ui': 'Preparando la interfaz',
    'loading.refutation': 'Sistema de refutación',
    'loading.game': 'Motor del juego',
    'loading.3d': 'Motor gráfico 3D',
    'loading.castle3d': 'Construyendo el castillo 3D',
    'loading.finishing': 'Últimos preparativos',
    'mobile.action': 'Acción',
    'mobile.cards': 'Cartas',
    'mobile.notebook': 'Libreta',
    'mobile.log': 'Registro',
    'menu.subtitle': 'Un juego de deducción medieval',
    'menu.numPlayers': 'Número de jugadores:',
    'menu.helpMode': 'Modo ayuda',
    'menu.stats': '27 cartas | 4 categorías | 1944 combinaciones posibles<br>Conspiradores, Métodos, Lugares y Motivos',
    'menu.playerInfo': '1 humano + {bots} bots',
    'menu.manualNotebook': 'Libreta manual (sin marcado automático)',
    'menu.board3d': 'Tablero 3D',
    'menu.yourCharacter': 'Tu personaje:',
    'menu.namePlaceholder': 'Escribe tu nombre...',
    'menu.language': 'Idioma:',

    // ── Log messages ──
    'log.gameStarted': 'Partida iniciada con {count} jugadores.',
    'log.usedSecretPassage': 'Usaste el pasadizo secreto a {room}.',
    'log.movedTo': 'Te moviste a {room}.',
    'log.rolledDice': 'Tiraste el dado: {value}{penalty}.',
    'log.rolledDicePenalty': ' (penalización -{penalty}, movimientos: {effective})',
    'log.botRolledDice': '{name} tira el dado: {value}.',
    'log.botUsedSecretPassage': '{name} usa pasadizo secreto a {room}.',
    'log.botMovedTo': '{name} se mueve a {room}.',
    'log.botCannotAct': '{name} no puede actuar (pacto de silencio).',
    'log.botMakesAccusation': '{name} hace una acusación!',
    'log.botSolvedMystery': '{name} ha resuelto el misterio!',
    'log.botFailedAccusation': '{name} falló la acusación y queda eliminado.',
    'log.botSuspects': '{name} sospecha: {conspirador} con {metodo} en {lugar} por {motivo}.',
    'log.accusationCorrect': '{name} acertó la acusación!',
    'log.accusationFailed': '{name} falló la acusación y queda eliminado.',
    'log.event': 'Evento: {name} — {desc}',
    'log.rumorInCourt': 'Rumor en la corte: {text}',
    'log.botHearsRumor': '{name} escucha un rumor en la corte.',
    'log.informantReveals': 'El informante revela: {text}',
    'log.botReceivesClue': '{name} recibe una pista del informante.',
    'log.lostTurnTrap': '{name} pierde su turno por una trampa.',
    'log.suspicion': 'Sospechas: {conspirador} con {metodo} en {lugar} por {motivo}.',
    'log.accusation': 'Acusación: {conspirador}, {metodo}, {lugar}, {motivo} — {result}',
    'log.accusationCorrectResult': 'CORRECTO!',
    'log.accusationIncorrectResult': 'INCORRECTO!',

    // ── Log: Room actions ──
    'log.torre': 'Torre del Mago: {text}',
    'log.biblioteca': 'Biblioteca: {text}',
    'log.armeria': 'Armería: {text}',
    'log.capilla': 'Capilla: {text}',
    'log.rumor': '{room}: Rumor recibido.',
    'log.jardines': 'Jardines: +2 movimientos extra.',
    'log.mazmorras': 'Mazmorras: {text}',
    'log.botTorre': '{name} analiza pistas en la Torre del Mago.',
    'log.botArmeria': '{name} examina armas en la Armería.',
    'log.botBiblioteca': '{name} consulta archivos en la Biblioteca.',
    'log.botCapilla': '{name} usa intuición en la Capilla sobre {target}.',
    'log.botRumor': '{name} escucha rumores en {room}.',
    'log.botMazmorras': '{name} interroga a {target} en las Mazmorras.',
    'log.mazmorrasShowCard': '{target} te muestra {card}.',

    // ── Log: Events ──
    'log.botBlocksRoom': '{name} bloquea {room}.',
    'log.botInspects': '{name} inspecciona a {target}.',
    'log.botNegotiates': '{name} negocia con {target}.',
    'log.botSendsGuards': '{name} envía guardias. {result}',
    'log.noOneMoved': 'Nadie se movió.',
    'log.playerMovedTo': '{name} → {room}',
    'log.botConfession': '{name} obtiene una confesión de {target}.',
    'log.botDeclaresSuspect': '{name} declara sospecha de: {card}.',
    'log.doorsClosed': 'Puertas cerradas: {room} bloqueada.',
    'log.inspection': 'Inspección: {target} revela {card}.',
    'log.negotiation': 'Negociación: Intercambio con {target}.',
    'log.experiment': 'Experimento: Viste una carta de {target}.',
    'log.guards': 'Guardias: {result}',
    'log.confession': 'Confesión: {text}',
    'log.publicDeclaration': 'Declaras públicamente: {card}',

    // ── Clue texts ──
    'clue.notSolution': '{card} no es la solución.',
    'clue.servantWhispers': 'Un sirviente susurra: ',
    'clue.hallwayRumor': 'Se comenta en los pasillos: ',
    'clue.solutionOf': 'La solución de {category} es: {card}.',
    'clue.notSolutionVerified': '{card} no es la solución. (Verificado)',
    'clue.archivesNoReveal': 'Los archivos no revelan nada nuevo sobre {category}.',
    'clue.documentsConfirm': 'Los documentos confirman que {card} no es la solución.',
    'clue.hasCardsOf': '{name} tiene cartas de {category}.',
    'clue.noCardsOf': '{name} NO tiene cartas de {category}.',
    'clue.noCardsToShow': '{name} no tiene cartas que mostrar.',
    'clue.showsCard': '{target} te muestra una carta:',

    // ── Event result texts ──
    'event.newPassage': 'Nuevo pasadizo: {roomA} ↔ {roomB}',
    'event.reveals': '{name} revela: {card}',
    'event.methodDiscarded': 'Método descartado: {card}',
    'event.placeDiscarded': 'Lugar descartado: {card}',
    'event.conspiratorDiscarded': 'Conspirador descartado: {card}',
    'event.sentToDungeons': '{name} es enviado a las Mazmorras.',
    'event.losesNextTurn': '{name} pierde su próximo turno.',
    'event.suspectsOf': '{name} sospecha de: {card} ({category})',

    // ── Event names and descriptions ──
    'event.1.name': 'Puertas cerradas',
    'event.1.desc': 'El jugador activo elige una habitación. Nadie puede entrar ni salir de esa sala hasta el próximo evento.',
    'event.2.name': 'Pasadizo descubierto',
    'event.2.desc': 'Se descubre un pasadizo secreto temporal entre dos habitaciones al azar.',
    'event.3.name': 'Incendio en la cocina',
    'event.3.desc': 'La Cocina Real queda bloqueada. Los jugadores dentro deben salir.',
    'event.4.name': 'Guardia en alerta',
    'event.4.desc': 'Los guardias patrullan. Todos reducen su movimiento en 1 punto.',
    'event.5.name': 'Inspección de la guardia',
    'event.5.desc': 'El jugador activo elige a otro jugador. Ese jugador revela una carta al azar.',
    'event.6.name': 'Pasillos confusos',
    'event.6.desc': 'Los pasillos generan confusión. Solo puedes moverte 1 sala por turno.',
    'event.7.name': 'Torre sellada',
    'event.7.desc': 'La Torre del Mago queda cerrada por orden real.',
    'event.8.name': 'Guardias reposicionados',
    'event.8.desc': 'El jugador activo elige una habitación. Jugadores en salas conectadas se mueven.',
    'event.9.name': 'Banquete Real',
    'event.9.desc': 'El rey organiza un banquete. Todos se mueven al Salón del Trono.',
    'event.10.name': 'Negociación secreta',
    'event.10.desc': 'El jugador activo elige a otro jugador. Ambos intercambian una carta al azar.',
    'event.11.name': 'Rumor en la corte',
    'event.11.desc': 'Los sirvientes comparten rumores. El jugador activo recibe un rumor.',
    'event.12.name': 'Audiencia del Rey',
    'event.12.desc': 'El rey exige explicaciones. Cada jugador declara públicamente un sospechoso, método o motivo.',
    'event.13.name': 'Espía descubierto',
    'event.13.desc': 'Un espía ha sido descubierto. Un jugador al azar revela una carta a todos.',
    'event.14.name': 'Pacto de silencio',
    'event.14.desc': 'Los nobles guardan silencio. Las acciones de sala están bloqueadas hasta el próximo evento.',
    'event.15.name': 'Archivos reales',
    'event.15.desc': 'Se descubren documentos antiguos. Se revela un método que NO es la solución.',
    'event.16.name': 'Documento secreto',
    'event.16.desc': 'Un pergamino revela información. Se revela un lugar que NO es la solución.',
    'event.17.name': 'Experimento del alquimista',
    'event.17.desc': 'El jugador activo puede ver una carta al azar de otro jugador.',
    'event.18.name': 'Confesión en la capilla',
    'event.18.desc': 'El jugador activo elige categoría y jugador. Ese jugador responde SÍ o NO.',
    'event.19.name': 'Informe del consejo',
    'event.19.desc': 'El consejo comparte información. Se descarta un conspirador que NO es la solución.',
    'event.20.name': 'Informante secreto',
    'event.20.desc': 'Un informante entrega una pista verdadera sobre la solución.',
    'event.21.name': 'Tormenta en el castillo',
    'event.21.desc': 'Una tormenta sacude el castillo. Los Jardines quedan bloqueados.',
    'event.22.name': 'Bestia suelta',
    'event.22.desc': 'Una criatura peligrosa se libera. Un jugador al azar es enviado a las Mazmorras.',
    'event.23.name': 'Fiesta del bufón',
    'event.23.desc': 'El bufón provoca caos. Todas las cartas se mezclan y se reparten de nuevo.',
    'event.24.name': 'Trampa activada',
    'event.24.desc': 'Una trampa se activa. Un jugador al azar pierde su próximo turno.',

    // ── Event category labels ──
    'event.cat.castillo': 'Evento del Castillo',
    'event.cat.social': 'Evento Social',
    'event.cat.investigacion': 'Evento de Investigación',
    'event.cat.caotico': 'Evento Caótico',

    // ── Event UI ──
    'eventUI.chooseRoom': 'Elige una sala para bloquear:',
    'eventUI.choosePlayer': 'Elige un jugador:',
    'eventUI.chooseExchange': 'Elige con quién intercambiar una carta al azar:',
    'eventUI.chooseGuards': 'Elige una sala. Jugadores en salas conectadas se moverán:',
    'eventUI.choosePlayerCat': 'Elige jugador y categoría:',
    'eventUI.publicDeclarations': 'Declaraciones públicas:',
    'eventUI.yourDeclaration': 'Tu declaración:',
    'eventUI.room': 'Sala:',
    'eventUI.player': 'Jugador:',
    'eventUI.category': 'Categoría:',
    'eventUI.gave': 'Diste: {card}. Recibiste:',
    'eventUI.has': '{name} tiene:',
    'eventUI.reveals': '{name} revela:',

    // ── Overlay titles ──
    'overlay.suspicion': 'Formular sospecha',
    'overlay.accusation': 'ACUSACIÓN FINAL',
    'overlay.refutation': 'Refutación',
    'overlay.notebook': 'Libreta de investigación',
    'overlay.help': 'Reglas del juego',
    'overlay.confession': 'Confesión',

    // ── Suspicion/Accusation ──
    'suspicion.place': 'Lugar: {room}',
    'suspicion.conspirador': 'Conspirador',
    'suspicion.metodo': 'Método',
    'suspicion.motivo': 'Motivo',
    'suspicion.lugar': 'Lugar',
    'suspicion.chooseConspirador': 'Elige un Conspirador',
    'suspicion.chooseMetodo': 'Elige un Método',
    'suspicion.chooseMotivo': 'Elige un Motivo',
    'suspicion.tableTitle': 'Mesa de Investigación',
    'suspicion.autoPlace': 'Lugar (automático)',
    'accusation.warning': 'Si fallas, quedarás eliminado!',

    // ── Refutation ──
    'refute.chooseCard': 'Tienes cartas que refutan. Elige cuál mostrar:',
    'refute.noCards': 'No tienes cartas para refutar.',
    'refute.checking': '{name} está revisando sus cartas...',
    'refute.shows': '{name} te muestra:',
    'refute.refuted': '{name} refutó la sospecha.',
    'refute.cannotRefute': '{name} no puede refutar.',
    'refute.nobodyRefuted': 'Nadie pudo refutar la sospecha!',
    'refute.youShowed': 'Mostraste: {card}',
    'refute.youShowedTo': 'Mostraste {card} a {name}.',
    'refute.botShowed': '{name} te mostró: {card}.',
    'refute.nobodyRefutedLog': 'Nadie refutó la sospecha.',
    'refute.botCannotRefute': '{name} no puede refutar.',

    // ── Room action overlays ──
    'roomAction.torre.title': 'Torre del Mago',
    'roomAction.torre.subtitle': 'Analizar pistas mágicas',
    'roomAction.biblioteca.title': 'Biblioteca',
    'roomAction.biblioteca.subtitle': 'Consultar archivos del castillo',
    'roomAction.biblioteca.resultSubtitle': 'Resultado de la consulta',
    'roomAction.armeria.title': 'Armería',
    'roomAction.armeria.subtitle': 'Examinar armas',
    'roomAction.capilla.title': 'Capilla',
    'roomAction.capilla.subtitle': 'Intuición sagrada',
    'roomAction.capilla.askDesc': 'Pregunta a un jugador si tiene cartas de una categoría.',
    'roomAction.capilla.resultSubtitle': 'Resultado de la intuición',
    'roomAction.capilla.question': '¿{name} tiene cartas de {category}?',
    'roomAction.mazmorras.title': 'Mazmorras',
    'roomAction.mazmorras.subtitle': 'Interrogar prisionero',
    'roomAction.mazmorras.resultSubtitle': 'Resultado del interrogatorio',
    'roomAction.mazmorras.seeCard': 'Ver carta al azar',
    'roomAction.mazmorras.askQuestion': 'Pregunta sí/no (categoría)',
    'roomAction.mazmorras.type': 'Tipo:',
    'roomAction.mazmorras.question': '¿{name} tiene cartas de {category}?',
    'roomAction.jardines.log': 'Jardines: +2 movimientos extra.',
    'roomAction.autoMarked': 'Marcado automáticamente en tu libreta.',

    // ── Clue labels ──
    'clueLabel.evidencia': 'EVIDENCIA',
    'clueLabel.evidenciaMethods': 'EVIDENCIA (Métodos)',
    'clueLabel.archivo': 'ARCHIVO',
    'clueLabel.rumor': 'RUMOR',
    'clueLabel.interrogatorio': 'INTERROGATORIO',
    'clueLabel.intuicion': 'INTUICIÓN',
    'clueLabel.confesion': 'CONFESIÓN',
    'clue.rumorWarning': 'Los rumores pueden ser falsos. Decide si confiar.',

    // ── Notebook ──
    'notebook.cluesReceived': 'Pistas recibidas:',
    'notebook.legend': '? = Desconocida    X = Descartada    O = Posible solución',

    // ── Result ──
    'result.victory': '¡Victoria!',
    'result.defeat': 'Derrota',
    'result.allEliminated': 'Todos eliminados',
    'result.gameEnd': 'Fin de partida',
    'result.youSolved': '¡Has resuelto el misterio!',
    'result.botSolved': '{name} ha resuelto el misterio.',
    'result.nobodySolved': 'Nadie resolvió el misterio.',
    'result.solutionWas': 'La solución era:',
    'result.conspirador': 'Conspirador: {card}',
    'result.metodo': 'Método: {card}',
    'result.lugar': 'Lugar: {card}',
    'result.motivo': 'Motivo: {card}',

    // ── Room action labels (for HUD button) ──
    'roomActionLabel.0': 'Analizar pistas mágicas',
    'roomActionLabel.1': 'Consultar archivos',
    'roomActionLabel.2': 'Examinar armas',
    'roomActionLabel.3': 'Intuición sagrada',
    'roomActionLabel.5': 'Escuchar rumores políticos',
    'roomActionLabel.6': 'Escuchar a los sirvientes',
    'roomActionLabel.7': 'Rutas del jardín',
    'roomActionLabel.8': 'Interrogar prisionero',

    // ── Event turn label ──
    'event.turn': 'Turno {turn}',

    // ── Help tips (tutorial) ──
    // Fases del turno
    'help.ROLL_DICE': 'El dado determina cuántas salas puedes recorrer (1-6). Planifica tu ruta hacia las salas que necesitas investigar.',
    'help.MOVING': 'Las salas doradas son alcanzables. Las líneas moradas son pasadizos secretos que conectan salas lejanas (Torre↔Mazmorras, Biblioteca↔Cocina). Usar un pasadizo consume todo el movimiento.',
    'help.ACTION_CHOICE': 'Sospecha: investiga eligiendo cartas que NO conozcas (?). Acción de sala: usa el poder especial de esta habitación. Acusación: solo en el Trono, ¡debes acertar las 4 categorías o serás penalizado! Pasar: termina tu turno sin actuar.',
    'help.SUSPICION_INPUT': 'Formula una sospecha eligiendo conspirador, método y motivo.',
    'help.REFUTATION_ROUND': 'Los jugadores intentan refutar tu sospecha mostrando una carta.',
    'help.ACCUSATION': 'Haz tu acusación final. Si fallas, quedarás eliminado.',
    'help.END_TURN': 'Tu turno ha terminado. Espera al siguiente.',
    'help.GAME_OVER': 'La partida ha terminado.',
    // Sospecha
    'help.SUSPICION_START': 'Formula una sospecha para investigar. El lugar será esta sala automáticamente. CONSEJO: Elige cartas marcadas con ? en tu libreta para obtener información nueva.',
    'help.SUSPICION_START_ADDITIONAL': 'Formula una sospecha para investigar. Deberás elegir el lugar entre las 9 salas principales. CONSEJO: Elige cartas marcadas con ? en tu libreta para obtener información nueva.',
    'help.SUSPICION_CONFIRM': 'Al confirmar, los demás jugadores intentarán refutar por turnos. Si alguien tiene una de estas cartas, te la mostrará en privado. Si nadie puede refutar, ¡ganarás reputación!',
    // Refutación
    'help.REFUTATION_SCENE_CHOOSE': 'Tienes cartas que coinciden con la sospecha. Debes elegir UNA para mostrar al sospechoso. Estrategia: muestra la carta que creas menos útil para tu rival.',
    'help.REFUTATION_SCENE_NOCARD': 'No tienes ninguna carta que coincida con la sospecha. La refutación pasará al siguiente jugador.',
    'help.REFUTATION_RESULT_SHOWN': 'Un jugador te ha mostrado esta carta. Márcala como X (descartada) en tu libreta — no es parte de la solución.',
    'help.REFUTATION_NOBODY': '¡Nadie pudo refutar tu sospecha! Esto puede significar que algunas de las cartas elegidas son parte de la solución. Revisa tu libreta con cuidado.',
    // Acusación
    'help.ACCUSATION_SCENE': '¡Acusación final! Debes elegir las 4 categorías correctamente: conspirador, método, lugar Y motivo. Si aciertas todas, ¡ganas! Si fallas aunque sea una, la penalización depende de tu reputación. Consulta tu libreta antes de decidir.',
    // Libreta
    'help.NOTEBOOK': 'Tu herramienta de deducción. Haz clic en las marcas: ? (desconocida) → X (descartada) → O (posible solución). Tus cartas se marcan con X automáticamente. Cuando solo quede una carta sin descartar en una categoría, ¡esa será la solución!',
    'help.SUSPICION_SCENE': 'Elige cartas desconocidas (?) de tu libreta para obtener información.',
    // Acciones de sala
    'help.ROOM_TORRE': 'La Torre del Mago revela una evidencia (siempre verdadera). Se marca automáticamente en tu libreta. Las evidencias son las pistas más valiosas del juego.',
    'help.ROOM_BIBLIOTECA': 'La Biblioteca te permite consultar archivos. Elige una categoría y se descartará una carta que NO es la solución. Se marca automáticamente en tu libreta.',
    'help.ROOM_ARMERIA': 'La Armería revela una evidencia sobre métodos (siempre verdadera). Ideal para descartar armas del crimen.',
    'help.ROOM_CAPILLA': 'La Capilla permite hacer una pregunta de sí/no. Elige un jugador y una categoría: te dirá si tiene alguna carta de ese tipo. Úsalo para acotar sospechas.',
    'help.ROOM_RUMOR': 'Los rumores pueden ser verdaderos (70%) o falsos (30%). NO se marcan automáticamente en tu libreta. Úsalos con precaución y verifica cruzando con otras pistas.',
    'help.ROOM_JARDINES': 'Los Jardines te conceden +2 movimientos extra. Úsalos para llegar rápidamente a la sala que necesitas investigar.',
    'help.ROOM_MAZMORRAS': 'Las Mazmorras permiten interrogar a otro jugador. Puedes ver una carta al azar de su mano, o hacer una pregunta de sí/no sobre una categoría.',
    // Eventos
    'help.EVENT': 'Los eventos del castillo modifican temporalmente las reglas. Algunos son interactivos (tú decides). Presta atención: salas bloqueadas, pasadizos temporales, o información revelada.',
    // Reputación
    'help.FAVOR_DEL_REY': 'Tu alta reputación te permite consultar al Rey. Elige una categoría y descubrirás la carta de la solución. ¡Es la pista más poderosa del juego! Solo puedes usarlo una vez.',
    'help.CHANTAJE': 'Tu baja reputación te permite chantajear. Elige un jugador y verás una carta al azar de su mano. Cuidado: usar chantaje reduce tu reputación en 1 punto.',

    // ── Help pages ──
    'help.page.0': 'OBJETIVO DEL JUEGO\n\nIntriga en el Castillo es un juego de deducción medieval.\n\nAl inicio de cada partida se seleccionan 4 cartas secretas\n(una de cada categoría) y se guardan en un "sobre secreto".\nEl resto de cartas se reparten entre los jugadores.\n\nTu objetivo es deducir las 4 cartas secretas:\n\n  \u2022 Conspirador: quién cometió el crimen\n  \u2022 Método: cómo lo hizo\n  \u2022 Lugar: dónde ocurrió\n  \u2022 Motivo: por qué lo hizo\n\nUsa las cartas que tienes en la mano (esas NO son la solución),\nlas pistas de otros jugadores y tu libreta de deducción\npara resolver el misterio antes que nadie.',
    'help.page.1': 'ESTRUCTURA DEL TURNO\n\nCada turno tiene 3 fases:\n\n1. DADO — Tira el dado para determinar cuántas salas\n   puedes moverte (1 a 6).\n\n2. MOVIMIENTO — Haz clic en una sala adyacente (dorada)\n   para moverte. También puedes usar pasadizos secretos\n   (líneas moradas) que conectan salas lejanas.\n   Puedes terminar el movimiento antes si lo deseas.\n\n3. ACCIÓN — Una vez en una sala, puedes:\n   \u2022 Hacer una sospecha (investigar)\n   \u2022 Usar la acción especial de la sala\n   \u2022 Hacer una acusación final (solo en el Salón del Trono)\n   \u2022 Pasar turno (no hacer nada)\n   \u2022 Consultar tu libreta en cualquier momento',
    'help.page.2': 'SOSPECHAS Y REFUTACIÓN\n\nAl sospechar, eliges un conspirador, método y motivo.\nEl lugar es siempre la sala donde estás.\n\nTras sospechar, los demás jugadores intentan REFUTAR:\n  \u2022 Se consulta en orden (sentido horario)\n  \u2022 Si un jugador tiene una carta que coincide,\n    DEBE mostrarla al sospechoso\n  \u2022 Si tiene varias, elige cuál mostrar\n  \u2022 La refutación se detiene cuando alguien muestra carta\n  \u2022 Si nadie puede refutar, ¡la sospecha queda sin resolver!\n\nCONSEJO: Sospecha con cartas que NO conozcas (?)\npara obtener nueva información. Las cartas que ya tienes\no has visto (X) no te aportan nada nuevo.',
    'help.page.3': 'ACUSACIÓN FINAL Y LIBRETA\n\nACUSACIÓN:\n  \u2022 Solo puedes acusar en el Salón del Trono\n  \u2022 Debes elegir las 4 categorías (incluido el lugar)\n  \u2022 Si aciertas las 4, ¡GANAS la partida!\n  \u2022 Si fallas aunque sea una, quedas ELIMINADO\n  \u2022 ¡Asegúrate antes de acusar!\n\nLIBRETA DE DEDUCCIÓN:\n  \u2022 Cada carta tiene una marca que puedes cambiar:\n    ? = Desconocida (no sabes si es la solución)\n    X = Descartada (la has visto, no es la solución)\n    O = Posible solución (crees que podría serlo)\n  \u2022 Tus propias cartas se marcan automáticamente como X\n  \u2022 Haz clic en la marca para cambiarla: ? → X → O → ?',
    'help.page.4': 'TABLERO Y ESTADÍSTICAS\n\nEl castillo tiene 9 salas en una cuadrícula 3×3:\n\n  Torre del Mago  |  Biblioteca    |  Armería\n  Capilla         |  Salón Trono   |  Sala Consejo\n  Cocina Real     |  Jardines      |  Mazmorras\n\nPASADIZOS SECRETOS (líneas moradas):\n  \u2022 Torre del Mago ↔ Mazmorras\n  \u2022 Biblioteca ↔ Cocina Real\n  Usar un pasadizo consume todo el movimiento.\n\nESTADÍSTICAS:\n  \u2022 27 cartas totales (6+6+9+6)\n  \u2022 4 categorías: conspiradores, métodos, lugares, motivos\n  \u2022 1944 combinaciones posibles (6×6×9×6)',
    'help.page.5': 'ACCIONES DE SALA Y PISTAS\n\nCada sala tiene una acción especial (excepto el Trono):\n\n  Torre del Mago — Evidencia (siempre verdadera)\n  Biblioteca — Archivo: descarta carta de una categoría\n  Armería — Evidencia sobre métodos\n  Capilla — Intuición: pregunta sí/no a un jugador\n  Sala del Consejo — Rumor (puede ser falso)\n  Cocina Real — Rumor (puede ser falso)\n  Jardines — +2 movimientos extra\n  Mazmorras — Interrogatorio: ver carta o pregunta sí/no\n\nTIPOS DE PISTAS:\n  \u2022 Evidencias (verde): siempre verdaderas. Auto-marcan libreta.\n  \u2022 Archivos (azul): siempre verdaderos. Auto-marcan libreta.\n  \u2022 Rumores (ámbar): ¡70% verdaderos, 30% falsos! NO auto-marcan.\n  \u2022 Interrogatorios (morado): información directa.',
    'help.page.6': 'EVENTOS DEL CASTILLO\n\nCada 3 turnos se activa un evento aleatorio.\nHay 24 eventos en 4 categorías:\n\n  \u{1F3F0} Castillo (8): bloquean salas, modifican movimiento,\n     crean pasadizos temporales, etc.\n  \u{1F465} Social (6): afectan interacción entre jugadores,\n     revelan cartas, intercambios forzados.\n  \u{1F50D} Investigación (6): dan pistas verdaderas o rumores,\n     revelan información sobre la solución.\n  \u{1F480} Caótico (4): efectos impredecibles como redistribuir\n     cartas, mover jugadores, perder turnos.\n\nAlgunos eventos son interactivos (el jugador activo elige).\nOtros se resuelven automáticamente.\n\nLas líneas verdes en el tablero indican pasadizos\ntemporales creados por eventos.\nLas salas con borde rojo están bloqueadas.',

    // ── Help page indicator ──
    'help.pageOf': 'Página {current} de {total}',

    // ── Board token label ──
    'board.humanToken': 'T',

    // ── Reputation ──
    'rep.label': 'Reputación',
    'rep.change': '{name}: reputación {delta} (ahora {value})',
    'rep.level.legend': 'Leyenda de la Corte',
    'rep.level.high': 'Honorable',
    'rep.level.good': 'Respetado',
    'rep.level.neutral': 'Neutral',
    'rep.level.low': 'Sospechoso',
    'rep.level.enemy': 'Enemigo de la Corte',
    'rep.accusationEliminated': '{name} falla la acusación y es eliminado (reputación baja).',
    'rep.accusationNoAccuse': '{name} falla la acusación. Pierde el derecho a acusar.',
    'rep.accusationStay': '{name} falla la acusación pero su honor le protege.',
    'rep.cannotAccuse': 'Tu reputación no te permite acusar de nuevo.',
    'rep.guardSurveillance': 'Los guardias vigilan a {name} y revelan: {card}.',
    'rep.favorDelRey': 'Favor del Rey',
    'rep.favorDelReyDesc': 'Tu alta reputación permite ver una carta de la solución. (Uso único)',
    'rep.favorResult': 'El Rey revela: la solución de {category} es {card}.',
    'rep.chantaje': 'Chantaje',
    'rep.chantajeDesc': 'Tu baja reputación te permite forzar a un jugador a mostrarte una carta.',
    'rep.chantajeResult': 'Chantaje: {target} revela {card}.',
    'rep.botFavorDelRey': '{name} usa el Favor del Rey.',
    'rep.botChantaje': '{name} usa chantaje contra {target}.',

    // ── Reputation events ──
    'event.25.name': 'Rumor Malicioso',
    'event.25.desc': 'Un rumor malicioso circula por la corte. Un jugador al azar pierde reputación.',
    'event.26.name': 'Honor de la Corte',
    'event.26.desc': 'La corte reconoce al más honorable. El jugador con mayor reputación la aumenta.',
    'event.27.name': 'Escándalo',
    'event.27.desc': 'Un escándalo sacude la corte. El jugador activo pierde reputación.',
    'event.rumorMalicioso': '{name} sufre un rumor malicioso.',
    'event.honorCorte': '{name} es reconocido por la corte.',
    'event.escandalo': '{name} se ve envuelto en un escándalo.',

    // ── Help page: Reputation ──
    'help.page.7': 'SISTEMA DE REPUTACIÓN\n\nCada jugador tiene una reputación de -5 a +5.\nComienza en 0 (Neutral).\n\n  AUMENTA (+1) cuando:\n  • Refutas una sospecha mostrando una carta\n  • Nadie puede refutar tu sospecha\n  • Usas salas de investigación (Torre, Armería, Biblioteca)\n\n  DISMINUYE cuando:\n  • Fallas una acusación (-2 a -3)\n  • Usas chantaje (-1)\n  • Eventos negativos (rumor malicioso, escándalo)\n\nHABILIDADES ESPECIALES:\n\n  👑 Favor del Rey (reputación ≥+3):\n  Puedes ver una carta de la solución. Uso único por partida.\n  No consume tu acción del turno.\n\n  🗡 Chantaje (reputación ≤-2):\n  Fuerza a un jugador a mostrarte una carta al azar.\n  Cuesta -1 de reputación. No consume tu acción.\n\nVIGILANCIA (reputación ≤-3):\n  Los guardias pueden revelar una de tus cartas a todos.\n\nACUSACIÓN FALLIDA:\n  • Rep ≥+2: pierdes 2 rep, sigues jugando\n  • Rep -1 a +1: pierdes 3 rep, no puedes acusar más\n  • Rep ≤-2: eliminado del juego',

    // ── New UI keys ──
    'phase.botThinking': '{name} está pensando...',
    'prompt.rollDice': 'Tira el dado para determinar cuántas salas puedes moverte.',
    'prompt.moving': 'Haz clic en una sala dorada para moverte.',
    'prompt.chooseAction': 'Elige una acción para realizar.',
    'action.roomAction.desc': 'Acción especial de esta sala',
    'action.suspicion.desc': 'Investiga el misterio',
    'action.accuse.desc': 'Acusación final (solo en el Trono)',
    'action.skip.desc': 'No realizar ninguna acción',
    'accusation.confirmPrompt': '¿Estás seguro?',
    'accusation.penaltyEliminated': 'Si fallas serás eliminado del juego (reputación baja).',
    'accusation.penaltyNoAccuse': 'Si fallas perderás el derecho a acusar de nuevo.',
    'accusation.penaltyStay': 'Si fallas perderás reputación pero seguirás jugando.',
    'refute.suspector': 'acusador',

    // ── Card notes ──
    'note.refutedBy': '{name} mostró esta carta',
    'note.youShowedTo': 'Mostraste a {name}',
    'note.evidence': 'Evidencia — {room}',
    'note.archive': 'Archivo — descartado',
    'note.intuition': 'Capilla — {name} {answer} cartas de {category}',
    'note.interrogation': 'Mazmorras — {name} mostró esta carta',
    'note.rumor': 'Rumor (puede ser falso) — {room}',
    'note.event': 'Evento — {eventName}',
    'note.addPlaceholder': 'Añadir nota...',
    'note.chantaje': 'Chantaje — {name} mostró esta carta',
    'note.favorDelRey': 'Favor del Rey — solución revelada',
    'note.experiment': 'Experimento — carta de {name}',
    'note.negotiation': 'Negociación — intercambio con {name}',

    // ── Misc ──
    'misc.yes': 'SÍ',
    'misc.no': 'NO',

    // ── Major Events ──
    'major.category': 'Evento Mayor del Castillo',
    'major.revuelta.name': 'Revuelta en el Castillo',
    'major.revuelta.desc': 'El caos se apodera del castillo. Todos los jugadores son movidos a habitaciones aleatorias.',
    'major.asalto_mazmorras.name': 'Asalto a las Mazmorras',
    'major.asalto_mazmorras.desc': 'Los rebeldes asaltan las mazmorras y revelan secretos ocultos. Se revelan 2 pistas públicas.',
    'major.intriga_real.name': 'Intriga Real',
    'major.intriga_real.desc': 'Una conspiración en la corte provoca que dos jugadores intercambien cartas al azar.',
    'major.noche_tormenta.name': 'Noche de Tormenta',
    'major.noche_tormenta.desc': 'Una tormenta terrible azota el castillo. Todos los pasadizos secretos y atajos se abren.',
    'major.juicio_real.name': 'Juicio Real',
    'major.juicio_real.desc': 'El rey convoca un juicio. Un jugador debe revelar una de sus cartas públicamente.',
    'major.result.revuelta': 'Todos los jugadores han sido movidos a nuevas habitaciones.',
    'major.result.asalto': 'Pistas reveladas: {clue1} / {clue2}',
    'major.result.intriga': '{p1} y {p2} han intercambiado una carta.',
    'major.result.tormenta': 'Todos los pasadizos y atajos están abiertos este turno.',
    'major.result.juicio': '{name} debe revelar una carta.',
    'major.result.juicioNoTarget': 'No hay jugadores con cartas para revelar.',
    'major.juicioRevealed': '{name} revela: {card}',
    'major.juicioChooseCard': 'Debes elegir una carta para revelar públicamente:',
    'log.majorEvent': '\u2757 EVENTO MAYOR: {name}',
    'log.chaosIncreased': '\uD83D\uDD25 El caos aumenta (nivel {level})',
    'log.roomEvent': '\uD83C\uDFE0 {room}: {name}',
    'combo.chained': 'Encadenado',

    // ── Room Events ──
    'roomEvent.category': 'Evento de Habitación',
    'roomEvent.result.reveal': '{target} revela una carta: {card}',
    'roomEvent.result.moveBonus': '+1 movimiento extra',
    'roomEvent.result.blocked': '{room} ha sido bloqueada temporalmente',
    'roomEvent.result.repPlus': '+1 reputación',
    'roomEvent.result.repMinus': '-1 reputación',

    // Torre del Mago room events
    'roomEvent.torre_1.name': 'Visión Arcana',
    'roomEvent.torre_1.desc': 'Una visión mágica te revela una pista adicional.',
    'roomEvent.torre_2.name': 'Poción Misteriosa',
    'roomEvent.torre_2.desc': 'Encuentras una poción burbujeante sobre la mesa del mago.',
    'roomEvent.torre_2.flavor': 'La poción emite un brillo extraño pero no parece tener efecto.',
    'roomEvent.torre_3.name': 'Libro Arcano',
    'roomEvent.torre_3.desc': 'Un libro antiguo se abre solo, revelando información.',
    'roomEvent.torre_4.name': 'Energía Inestable',
    'roomEvent.torre_4.desc': 'Una explosión mágica bloquea la torre temporalmente.',
    'roomEvent.torre_5.name': 'Portal Dimensional',
    'roomEvent.torre_5.desc': 'Un portal se abre brevemente, permitiendo movimiento extra.',

    // Biblioteca room events
    'roomEvent.biblio_1.name': 'Libro Prohibido',
    'roomEvent.biblio_1.desc': 'Encuentras un libro prohibido con información valiosa.',
    'roomEvent.biblio_2.name': 'Archivo Secreto',
    'roomEvent.biblio_2.desc': 'Un compartimento oculto revela documentos comprometedores.',
    'roomEvent.biblio_3.name': 'Diario Antiguo',
    'roomEvent.biblio_3.desc': 'Un diario polvoriento yace abierto sobre una mesa.',
    'roomEvent.biblio_3.flavor': 'Las páginas están demasiado deterioradas para leerlas.',
    'roomEvent.biblio_4.name': 'Estantería Secreta',
    'roomEvent.biblio_4.desc': 'Una estantería se mueve revelando un pasaje oculto.',
    'roomEvent.biblio_5.name': 'Manuscrito Sospechoso',
    'roomEvent.biblio_5.desc': 'Un manuscrito con anotaciones crípticas llama tu atención.',
    'roomEvent.biblio_5.flavor': 'Las anotaciones son ilegibles, pero parecen importantes.',

    // Armería room events
    'roomEvent.arme_1.name': 'Arma Desaparecida',
    'roomEvent.arme_1.desc': 'Notas que falta un arma en el inventario.',
    'roomEvent.arme_1.flavor': 'El hueco vacío en la pared es inquietante.',
    'roomEvent.arme_2.name': 'Espada Ensangrentada',
    'roomEvent.arme_2.desc': 'Una espada con manchas sospechosas cuelga de la pared.',
    'roomEvent.arme_2.flavor': 'Las manchas parecen recientes...',
    'roomEvent.arme_3.name': 'Armadura Rota',
    'roomEvent.arme_3.desc': 'Una armadura cae bloqueando la entrada temporalmente.',
    'roomEvent.arme_4.name': 'Inventario Alterado',
    'roomEvent.arme_4.desc': 'El registro de armas revela discrepancias sospechosas.',
    'roomEvent.arme_5.name': 'Armero Sospechoso',
    'roomEvent.arme_5.desc': 'El armero actúa de forma extraña y te señala como sospechoso.',

    // Capilla room events
    'roomEvent.capi_1.name': 'Confesión Secreta',
    'roomEvent.capi_1.desc': 'Escuchas una confesión que revela información crucial.',
    'roomEvent.capi_2.name': 'Sacerdote Preocupado',
    'roomEvent.capi_2.desc': 'El sacerdote murmura preocupado sobre los eventos recientes.',
    'roomEvent.capi_2.flavor': 'Sus palabras son crípticas pero llenas de temor.',
    'roomEvent.capi_3.name': 'Símbolo Extraño',
    'roomEvent.capi_3.desc': 'Un símbolo misterioso aparece en el suelo de la capilla.',
    'roomEvent.capi_3.flavor': 'El símbolo parece antiguo, quizás de una orden secreta.',
    'roomEvent.capi_4.name': 'Oración Protectora',
    'roomEvent.capi_4.desc': 'Una oración en la capilla mejora tu reputación.',
    'roomEvent.capi_5.name': 'Testigo Silencioso',
    'roomEvent.capi_5.desc': 'Alguien ha dejado una nota con información sobre otro jugador.',

    // Salón del Trono room events
    'roomEvent.trono_1.name': 'Audiencia con el Rey',
    'roomEvent.trono_1.desc': 'El rey concede una audiencia privada.',
    'roomEvent.trono_1.flavor': 'El rey te mira con interés pero no dice nada relevante.',
    'roomEvent.trono_2.name': 'Acusación Pública',
    'roomEvent.trono_2.desc': 'Un noble acusa públicamente a alguien, revelando información.',
    'roomEvent.trono_3.name': 'Favor del Rey',
    'roomEvent.trono_3.desc': 'El rey te reconoce con un gesto de aprobación.',
    'roomEvent.trono_4.name': 'Disputa Noble',
    'roomEvent.trono_4.desc': 'Dos nobles discuten acaloradamente en el salón.',
    'roomEvent.trono_4.flavor': 'La discusión no revela nada útil, pero es entretenida.',
    'roomEvent.trono_5.name': 'Mensaje Real',
    'roomEvent.trono_5.desc': 'Un mensajero entrega un decreto que mejora tu posición.',

    // Sala del Consejo room events
    'roomEvent.conse_1.name': 'Debate Político',
    'roomEvent.conse_1.desc': 'Participas en un debate que mejora tu reputación.',
    'roomEvent.conse_2.name': 'Alianza Secreta',
    'roomEvent.conse_2.desc': 'Descubres indicios de una alianza secreta entre cortesanos.',
    'roomEvent.conse_2.flavor': 'Los susurros en el consejo sugieren una alianza oculta.',
    'roomEvent.conse_3.name': 'Espía Descubierto',
    'roomEvent.conse_3.desc': 'Un espía es capturado y revela información valiosa.',
    'roomEvent.conse_4.name': 'Documento Oficial',
    'roomEvent.conse_4.desc': 'Un documento oficial proporciona una pista adicional.',
    'roomEvent.conse_5.name': 'Intriga Cortesana',
    'roomEvent.conse_5.desc': 'Las intrigas de la corte se intensifican.',
    'roomEvent.conse_5.flavor': 'Los cortesanos murmuran entre ellos, pero nadie te incluye.',

    // Cocina Real room events
    'roomEvent.cocina_1.name': 'Sirviente Nervioso',
    'roomEvent.cocina_1.desc': 'Un sirviente nervioso evita tu mirada.',
    'roomEvent.cocina_1.flavor': 'El sirviente sale corriendo antes de que puedas hablarle.',
    'roomEvent.cocina_2.name': 'Veneno Sospechoso',
    'roomEvent.cocina_2.desc': 'Encuentras un frasco sospechoso entre los ingredientes.',
    'roomEvent.cocina_2.flavor': 'El frasco tiene una etiqueta ilegible. Podría ser veneno... o especias.',
    'roomEvent.cocina_3.name': 'Cena Interrumpida',
    'roomEvent.cocina_3.desc': 'Un incidente en la cocina bloquea la sala temporalmente.',
    'roomEvent.cocina_4.name': 'Ingrediente Extraño',
    'roomEvent.cocina_4.desc': 'Un ingrediente exótico aparece entre las provisiones.',
    'roomEvent.cocina_4.flavor': 'Nadie sabe de dónde vino este ingrediente tan raro.',
    'roomEvent.cocina_5.name': 'Rumor del Cocinero',
    'roomEvent.cocina_5.desc': 'El cocinero comparte un secreto que escuchó.',

    // Jardines room events
    'roomEvent.jardin_1.name': 'Huellas en el Barro',
    'roomEvent.jardin_1.desc': 'Sigues unas huellas que te permiten moverte más.',
    'roomEvent.jardin_2.name': 'Mensaje Escondido',
    'roomEvent.jardin_2.desc': 'Encuentras un mensaje oculto entre las plantas.',
    'roomEvent.jardin_3.name': 'Encuentro Secreto',
    'roomEvent.jardin_3.desc': 'Presencias un encuentro clandestino en la oscuridad.',
    'roomEvent.jardin_3.flavor': 'Dos figuras hablan en voz baja pero se alejan al verte.',
    'roomEvent.jardin_4.name': 'Estatua Misteriosa',
    'roomEvent.jardin_4.desc': 'Una estatua tiene una inscripción críptica.',
    'roomEvent.jardin_4.flavor': 'La inscripción dice algo sobre secretos bajo las raíces.',
    'roomEvent.jardin_5.name': 'Rastro de Perfume',
    'roomEvent.jardin_5.desc': 'Un aroma peculiar llama tu atención.',
    'roomEvent.jardin_5.flavor': 'El perfume es inconfundible, pero no puedes identificar a quién pertenece.',

    // Mazmorras room events
    'roomEvent.mazmo_1.name': 'Prisionero Sospechoso',
    'roomEvent.mazmo_1.desc': 'Un prisionero ofrece información a cambio de clemencia.',
    'roomEvent.mazmo_2.name': 'Gritos en la Oscuridad',
    'roomEvent.mazmo_2.desc': 'Gritos lejanos resuenan en las mazmorras.',
    'roomEvent.mazmo_2.flavor': 'Los gritos se detienen abruptamente. El silencio es peor.',
    'roomEvent.mazmo_3.name': 'Cadena Rota',
    'roomEvent.mazmo_3.desc': 'Una cadena rota sugiere que alguien escapó recientemente.',
    'roomEvent.mazmo_4.name': 'Guardia Corrupto',
    'roomEvent.mazmo_4.desc': 'Un guardia corrupto te ofrece información comprometedora.',
    'roomEvent.mazmo_5.name': 'Fuga de Prisionero',
    'roomEvent.mazmo_5.desc': 'Un prisionero escapa causando confusión. Puedes moverte.',

    // ── Day/Night Cycle ──
    'timePeriod.dia': 'Día',
    'timePeriod.atardecer': 'Atardecer',
    'timePeriod.noche': 'Noche',
    'timePeriod.madrugada': 'Madrugada',
    'timePeriod.change.dia': 'Amanece. El sol ilumina el castillo.',
    'timePeriod.change.atardecer': 'El sol se pone. Las sombras se alargan.',
    'timePeriod.change.noche': 'Cae la noche. La oscuridad envuelve el castillo.',
    'timePeriod.change.madrugada': 'La madrugada llega. Una luz tenue se filtra por las ventanas.',
    'help.page.8': 'CICLO DÍA/NOCHE\n\nEl castillo vive un ciclo de tiempo que cambia cada 2 rondas:\n\n  ☀️ DÍA (Rondas 1-2, 9-10...)\n  Más eventos sociales. Buena visibilidad.\n\n  🌅 ATARDECER (Rondas 3-4, 11-12...)\n  Aumentan los rumores y eventos sociales.\n\n  🌙 NOCHE (Rondas 5-6, 13-14...)\n  Más eventos caóticos. Investigación menos efectiva.\n\n  🌄 MADRUGADA (Rondas 7-8, 15-16...)\n  Investigación más efectiva. Las salas revelan más pistas.\n\nUsa el ciclo a tu favor: investiga durante la madrugada\ny ten cuidado con los eventos caóticos de la noche.',

    // ── Narrative Events ──
    'hud.narrativeEvents': 'Eventos activos:',
    'narrative.turnsLeft': '{turns} turno(s)',
    'narrative.resolved': '✅ RESUELTO',
    'narrative.started': '📜 Nuevo evento narrativo',

    // Categories
    'narrative.cat.ambiental': 'Evento Ambiental',
    'narrative.cat.politico': 'Evento Político',
    'narrative.cat.investigacion': 'Evento de Investigación',
    'narrative.cat.caotico': 'Evento Caótico',

    // 1. Tormenta
    'narrative.narr_tormenta.name': 'Tormenta sobre el Castillo',
    'narrative.narr_tormenta.desc': 'Una tormenta feroz azota el castillo. Los Jardines quedan inaccesibles durante la tormenta.',
    'narrative.narr_tormenta.perTurn': 'La tormenta continúa rugiendo sobre el castillo.',
    'narrative.narr_tormenta.resolution': 'La tormenta amaina. Entre los escombros se descubre una pista olvidada.',
    'narrative.narr_tormenta.short': 'Tormenta',

    // 2. Niebla
    'narrative.narr_niebla.name': 'Niebla Espesa',
    'narrative.narr_niebla.desc': 'Una niebla densa invade el castillo. Es difícil ver a los demás y moverse con agilidad.',
    'narrative.narr_niebla.perTurn': 'La niebla sigue cubriendo los pasillos del castillo.',
    'narrative.narr_niebla.resolution': 'La niebla se disipa revelando rumores que circulaban en la oscuridad.',
    'narrative.narr_niebla.short': 'Niebla',

    // 3. Incendio en el Ala
    'narrative.narr_incendio_ala.name': 'Incendio en el Ala Norte',
    'narrative.narr_incendio_ala.desc': 'Un incendio se ha declarado en el ala norte. La Biblioteca y la Armería están bloqueadas.',
    'narrative.narr_incendio_ala.perTurn': 'Las llamas siguen consumiendo el ala norte del castillo.',
    'narrative.narr_incendio_ala.resolution': 'El incendio se extingue. Entre las cenizas se encuentran evidencias reveladoras.',
    'narrative.narr_incendio_ala.short': 'Incendio',

    // 4. Investigación Real
    'narrative.narr_investigacion_real.name': 'Investigación Real',
    'narrative.narr_investigacion_real.desc': 'El Rey ordena una investigación oficial. Cada turno, un jugador revela información sobre sus cartas.',
    'narrative.narr_investigacion_real.perTurn': '{player} revela: {answer} tiene cartas de {category}.',
    'narrative.narr_investigacion_real.resolution': 'La investigación concluye. {player} gana reconocimiento.',
    'narrative.narr_investigacion_real.short': 'Investigación',

    // 5. Consejo de Emergencia
    'narrative.narr_consejo_emergencia.name': 'Consejo de Emergencia',
    'narrative.narr_consejo_emergencia.desc': 'El Consejo se reúne de urgencia. Todas las salas otorgan pistas extra durante la sesión.',
    'narrative.narr_consejo_emergencia.perTurn': 'El Consejo sigue deliberando. Las pistas fluyen con más facilidad.',
    'narrative.narr_consejo_emergencia.resolution': 'El Consejo concluye con una revelación pública.',
    'narrative.narr_consejo_emergencia.short': 'Consejo',

    // 6. Cacería de Traidores
    'narrative.narr_caceria_traidores.name': 'Cacería de Traidores',
    'narrative.narr_caceria_traidores.desc': 'Se buscan traidores en el castillo. Los jugadores con mala reputación sufren consecuencias.',
    'narrative.narr_caceria_traidores.perTurn': 'Los cazadores patrullan. {players} pierden reputación.',
    'narrative.narr_caceria_traidores.resolution': 'La cacería termina. {player} revela: {card}.',
    'narrative.narr_caceria_traidores.short': 'Cacería',

    // 7. Archivos Secretos
    'narrative.narr_archivos_secretos.name': 'Archivos Secretos Abiertos',
    'narrative.narr_archivos_secretos.desc': 'Los archivos secretos de la Torre han sido abiertos. La Torre del Mago ofrece pistas garantizadas.',
    'narrative.narr_archivos_secretos.perTurn': 'Los archivos secretos siguen disponibles para consulta.',
    'narrative.narr_archivos_secretos.resolution': 'Los archivos se cierran. Una última evidencia se hace pública.',
    'narrative.narr_archivos_secretos.short': 'Archivos',

    // 8. Testigo Protegido
    'narrative.narr_testigo_protegido.name': 'Testigo Protegido',
    'narrative.narr_testigo_protegido.desc': 'Un testigo oculto en la Cocina Real puede revelar secretos. Visitar la Cocina garantiza eventos.',
    'narrative.narr_testigo_protegido.perTurn': 'El testigo protegido sigue oculto en la Cocina Real.',
    'narrative.narr_testigo_protegido.resolution': 'El testigo decide hablar... ¿pero dice la verdad?',
    'narrative.narr_testigo_protegido.short': 'Testigo',

    // 9. Análisis Alquímico
    'narrative.narr_analisis_alquimico.name': 'Análisis Alquímico',
    'narrative.narr_analisis_alquimico.desc': 'El Alquimista analiza pruebas en la Torre del Mago. La Torre ofrece resultados especiales.',
    'narrative.narr_analisis_alquimico.perTurn': 'El análisis alquímico continúa en la Torre del Mago.',
    'narrative.narr_analisis_alquimico.resolution': 'El análisis concluye eliminando un método del misterio.',
    'narrative.narr_analisis_alquimico.short': 'Alquimia',

    // 10. Fuga de Mazmorras
    'narrative.narr_fuga_mazmorras.name': 'Fuga de las Mazmorras',
    'narrative.narr_fuga_mazmorras.desc': 'Prisioneros se han fugado causando caos. Cada turno, un jugador es movido aleatoriamente.',
    'narrative.narr_fuga_mazmorras.perTurn': '{player} es arrastrado por los fugitivos a {room}.',
    'narrative.narr_fuga_mazmorras.resolution': 'Los prisioneros son capturados. {players} obtienen evidencia.',
    'narrative.narr_fuga_mazmorras.resolutionNone': 'Los prisioneros son capturados. Nadie estaba en las Mazmorras.',
    'narrative.narr_fuga_mazmorras.short': 'Fuga',

    // 11. Ritual Prohibido
    'narrative.narr_ritual_prohibido.name': 'Ritual Prohibido',
    'narrative.narr_ritual_prohibido.desc': 'Un ritual oscuro está en marcha. Los eventos caóticos son más probables.',
    'narrative.narr_ritual_prohibido.perTurn': 'El ritual oscuro intensifica la energía caótica del castillo.',
    'narrative.narr_ritual_prohibido.resolution': 'El ritual concluye revelando una evidencia aleatoria.',
    'narrative.narr_ritual_prohibido.short': 'Ritual',

    // 12. Oscuridad Total
    'narrative.narr_oscuridad_total.name': 'Oscuridad Total',
    'narrative.narr_oscuridad_total.desc': 'Una oscuridad sobrenatural envuelve el castillo. El movimiento es penalizado y las interacciones sociales imposibles.',
    'narrative.narr_oscuridad_total.perTurn': 'La oscuridad total impide ver y comunicarse.',
    'narrative.narr_oscuridad_total.resolution': 'La oscuridad se retira. Rumores contradictorios emergen de las sombras.',
    'narrative.narr_oscuridad_total.short': 'Oscuridad',

    // Log messages
    'log.narrativeStarted': '📜 {name} comienza ({turns} turnos)',
    'log.narrativeResolved': '✅ {name} resuelto: {text}',
    'yes': 'Sí',
    'no': 'No',
    'clue.notMethod': '{card} no es el método utilizado.',

    // Help page 9
    'help.page.9': 'EVENTOS NARRATIVOS\n\nA partir del turno 4, pueden activarse eventos narrativos que duran 1-3 turnos:\n\n  ⛈️ AMBIENTALES\n  Bloquean salas o penalizan el dado.\n\n  🏛️ POLÍTICOS\n  Revelan información o afectan la reputación.\n\n  📚 INVESTIGACIÓN\n  Garantizan pistas en ciertas salas.\n\n  🔮 CAÓTICOS\n  Mueven jugadores o aumentan el caos.\n\nMáximo 2 eventos narrativos simultáneos.\nAl resolverse, generan consecuencias para todos.\nObserva el indicador lateral para ver los activos.',

    // ─── Inventory System ───────────────────────────
    // Item names
    'item.lupa_ancestral.name': 'Lupa Ancestral',
    'item.lupa_ancestral.desc': 'Genera una pista de evidencia. 3 usos.',
    'item.pergamino_sellado.name': 'Pergamino Sellado',
    'item.pergamino_sellado.desc': 'Revela una carta de la solución. Un solo uso.',
    'item.mapa_secreto.name': 'Mapa Secreto',
    'item.mapa_secreto.desc': 'Permite moverse a cualquier sala en el siguiente turno.',
    'item.cristal_revelador.name': 'Cristal Revelador',
    'item.cristal_revelador.desc': 'Ve una carta al azar de otro jugador. 2 usos.',
    'item.botas_sigilo.name': 'Botas de Sigilo',
    'item.botas_sigilo.desc': '+2 movimiento en el siguiente dado. 3 usos.',
    'item.capa_invisibilidad.name': 'Capa de Invisibilidad',
    'item.capa_invisibilidad.desc': 'Protege de interrogatorios y robos durante 1 turno.',
    'item.sello_real.name': 'Sello Real',
    'item.sello_real.desc': '+1 reputación inmediato. Un solo uso.',
    'item.mascara_cortesana.name': 'Máscara Cortesana',
    'item.mascara_cortesana.desc': 'Bloquea la habilidad del Bufón en la siguiente sospecha. 2 usos.',
    'item.carta_recomendacion.name': 'Carta de Recomendación',
    'item.carta_recomendacion.desc': 'Fuerza a un jugador a revelar una carta. Un solo uso.',
    'item.veneno_lento.name': 'Veneno Lento',
    'item.veneno_lento.desc': 'El jugador objetivo pierde -1 reputación. Un solo uso.',
    'item.trampa_sala.name': 'Trampa de Sala',
    'item.trampa_sala.desc': 'Coloca una trampa. El próximo jugador pierde su turno.',
    'item.polvo_cegador.name': 'Polvo Cegador',
    'item.polvo_cegador.desc': 'El objetivo no puede usar acción de sala en su siguiente turno.',
    'item.amuleto_guardian.name': 'Amuleto Guardián',
    'item.amuleto_guardian.desc': 'Pasivo: bloquea la vigilancia de la guardia.',
    'item.anillo_poder.name': 'Anillo de Poder',
    'item.anillo_poder.desc': 'Tu siguiente sospecha no puede ser refutada. 2 usos.',
    'item.reliquia_antigua.name': 'Reliquia Antigua',
    'item.reliquia_antigua.desc': 'Pasivo: +1 al dado permanente mientras la poseas.',
    'item.dado_trucado.name': 'Dado Trucado',
    'item.dado_trucado.desc': 'Elige el resultado del dado en vez de tirarlo. Un solo uso.',

    // Item rarity
    'item.rarity.comun': 'Común',
    'item.rarity.raro': 'Raro',
    'item.rarity.legendario': 'Legendario',

    // Item type
    'item.type.investigacion': 'Investigación',
    'item.type.movimiento': 'Movimiento',
    'item.type.social': 'Social',
    'item.type.sabotaje': 'Sabotaje',
    'item.type.proteccion': 'Protección',
    'item.type.especial': 'Especial',

    // Item UI
    'action.useItem.title': 'Usar Objeto',
    'action.useItem.desc': 'Usa un objeto de tu inventario',
    'item.pickup.title': '¡Objeto encontrado!',
    'item.pickup.inventoryFull': 'Tu inventario está lleno ({max}/{max}). Descarta un objeto o rechaza este.',
    'item.pickup.discard': 'Descartar',
    'item.pickup.reject': 'Rechazar',
    'item.pickup.accept': 'Recoger',
    'item.passive': 'Pasivo',
    'item.durability': 'Durabilidad: {n}',
    'item.chooseTarget': 'Elige objetivo:',
    'item.inventory': 'Inventario',
    'item.empty': 'Sin objetos',
    'item.dadoChoose': 'Elige el resultado del dado:',

    // Item log messages
    'log.foundItem': '🎒 {name} encontró: {item}',
    'log.botFoundItem': '🎒 {name} encontró un objeto: {item}',
    'log.usedItem': '🎒 {name} usó {item}',
    'log.itemBroke': '💔 {item} se ha roto',
    'log.itemLupa': '🔍 {name} usó la Lupa Ancestral y obtuvo una pista',
    'log.itemPergamino': '📜 {name} abrió un Pergamino Sellado y descubrió: {card}',
    'log.itemMapa': '🗺️ {name} estudió un Mapa Secreto — puede ir a cualquier sala',
    'log.itemCristal': '🔮 {name} usó el Cristal Revelador sobre {target}',
    'log.itemCristalBlocked': '🔮 {name} intentó usar el Cristal sobre {target}, pero está protegido',
    'log.itemBotas': '👢 {name} se calzó las Botas de Sigilo — +2 movimiento',
    'log.itemCapa': '🧥 {name} se cubrió con la Capa de Invisibilidad',
    'log.itemSello': '👑 {name} presentó el Sello Real — +1 reputación',
    'log.itemMascara': '🎭 {name} se puso la Máscara Cortesana',
    'log.itemCarta': '💌 {name} presentó una Carta de Recomendación a {target}',
    'log.itemCartaBlocked': '💌 {name} intentó usar la Carta sobre {target}, pero está protegido',
    'log.itemVeneno': '☠️ {name} envenenó discretamente a {target} — -1 reputación',
    'log.itemTrampa': '🪤 {name} colocó una trampa en {room}',
    'log.itemPolvo': '💨 {name} cegó a {target} con polvo — no podrá usar acción de sala',
    'log.itemAnillo': '💍 {name} activó el Anillo de Poder — siguiente sospecha irrefutable',
    'log.itemDado': '🎲 {name} preparó un Dado Trucado',
    'log.trapTriggered': '🪤 ¡{name} cayó en una trampa en {room}! Pierde su turno',
    'log.stealSuccess': '🦹 {name} robó un objeto a {target}',
    'log.stealFail': '🦹 {name} intentó robar a {target} pero falló — -1 reputación',
    'log.stealBlockedCloak': '🦹 {name} intentó robar a {target} pero está protegido por su capa',
    'log.itemBlinded': '💨 {name} está cegado y no puede usar la acción de sala',

    // Help page 10
    'help.page.10': 'INVENTARIO\n\nTras realizar una acción de sala, puedes encontrar objetos (35% prob.).\n\n  🔍 INVESTIGACIÓN\n  Lupa, Pergamino, Mapa, Cristal: obtén pistas.\n\n  👢 MOVIMIENTO\n  Botas +2 dado, Capa protege de robos.\n\n  👑 SOCIAL\n  Sello +rep, Máscara anti-bufón, Carta fuerza revelación.\n\n  ☠️ SABOTAJE\n  Veneno -rep, Trampa pierde turno, Polvo ciega.\n\n  🛡️ PROTECCIÓN\n  Amuleto bloquea guardia (pasivo), Anillo sospecha irrefutable.\n\n  ⚱️ ESPECIAL\n  Reliquia +1 dado (pasivo), Dado trucado elige resultado.\n\nMáx. 3 objetos. Rareza: Común > Raro > Legendario.',

    // ── Tutorial intro ──
    'tutorial.title': 'Bienvenido a Intriga en el Castillo',
    'tutorial.subtitle': 'Una intriga se teje entre los muros del castillo…',
    'tutorial.intro': '<p style="font-size:14px;line-height:1.5;margin:0 0 10px">Un crimen ha sacudido el reino. Cuatro secretos se ocultan tras los muros del castillo: <b>quién</b> lo hizo, <b>cómo</b>, <b>dónde</b> y <b>por qué</b>.</p><p style="font-size:14px;line-height:1.5;margin:0 0 10px">Tu misión es descubrir la verdad antes que nadie. Recorre las <b>9 salas</b> del castillo, recoge pistas, interroga sospechosos y usa tu libreta de deducción para descartar posibilidades.</p>',
    'tutorial.steps.title': 'Cada turno sigue estos pasos:',
    'tutorial.step.1': '<b>🎲 Dado</b> — Tira el dado para moverte entre salas.',
    'tutorial.step.2': '<b>🏰 Movimiento</b> — Haz clic en una sala iluminada para entrar.',
    'tutorial.step.3': '<b>🔎 Acción</b> — Investiga, sospecha o usa un objeto.',
    'tutorial.step.4': '<b>📓 Deduce</b> — Marca en tu libreta lo que descubras.',
    'tutorial.accusation': '¡Cuando lo tengas claro, ve al <b>Salón del Trono</b> para hacer tu acusación final!',
    'tutorial.tips.title': 'Consejos rápidos:',
    'tutorial.tip.1': 'Las pistas con borde <span style="color:#2ECC71;font-weight:bold">verde</span> son siempre verdaderas.',
    'tutorial.tip.2': 'Los <span style="color:#F39C12;font-weight:bold">rumores</span> pueden ser falsos — ¡no te fíes del todo!',
    'tutorial.tip.3': 'Las cartas en tu mano <b>no</b> son la solución — descártalas.',
    'tutorial.tip.4': 'Verás tips de ayuda durante la partida con el <b>modo ayuda</b> activo.',
    'tutorial.begin': '¡Que empiece la intriga!',

    // ═══ Additional Rooms ═══
    'addRoom.sala_banquetes.name': 'Sala de Banquetes',
    'addRoom.sala_banquetes.action': 'Escuchar rumores del banquete',
    'addRoom.sala_banquetes.desc': 'Los invitados murmuran entre copas de vino.',

    'addRoom.galeria_retratos.name': 'Galería de Retratos',
    'addRoom.galeria_retratos.action': 'Examinar los retratos',
    'addRoom.galeria_retratos.desc': 'Los ojos de los ancestros parecen seguirte...',

    'addRoom.sala_musica.name': 'Sala de Música',
    'addRoom.sala_musica.action': 'Escuchar melodías reveladoras',
    'addRoom.sala_musica.desc': 'Las notas musicales esconden secretos entre acordes.',

    'addRoom.sala_audiencias.name': 'Sala de Audiencias',
    'addRoom.sala_audiencias.action': 'Interrogar a los peticionarios',
    'addRoom.sala_audiencias.desc': 'Los súbditos revelan información valiosa al pedir audiencia.',

    'addRoom.terraza_real.name': 'Terraza Real',
    'addRoom.terraza_real.action': 'Explorar la terraza',
    'addRoom.terraza_real.desc': 'Desde las alturas se divisan rutas alternativas por el castillo.',

    'addRoom.archivo_real.name': 'Archivo Real',
    'addRoom.archivo_real.action': 'Consultar los archivos',
    'addRoom.archivo_real.desc': 'Documentos antiguos revelan verdades olvidadas.',

    'addRoom.cuartel_guardias.name': 'Cuartel de Guardias',
    'addRoom.cuartel_guardias.action': 'Interrogar a los guardias',
    'addRoom.cuartel_guardias.desc': 'Los guardias han visto y oído mucho durante sus rondas.',

    'addRoom.sala_estrategia.name': 'Sala de Estrategia',
    'addRoom.sala_estrategia.action': 'Analizar los planes tácticos',
    'addRoom.sala_estrategia.desc': 'Los mapas de batalla revelan pistas sobre los métodos usados.',

    'addRoom.patio_entrenamiento.name': 'Patio de Entrenamiento',
    'addRoom.patio_entrenamiento.action': 'Entrenar y explorar',
    'addRoom.patio_entrenamiento.desc': 'El ejercicio abre nuevas rutas por el castillo.',

    'addRoom.forja.name': 'Forja',
    'addRoom.forja.action': 'Examinar las armas forjadas',
    'addRoom.forja.desc': 'El herrero sabe qué armas se han fabricado recientemente.',

    'addRoom.torre_arquero.name': 'Torre del Arquero',
    'addRoom.torre_arquero.action': 'Observar desde la torre',
    'addRoom.torre_arquero.desc': 'Desde lo alto se observan los movimientos de todos.',

    'addRoom.cripta_real.name': 'Cripta Real',
    'addRoom.cripta_real.action': 'Investigar las tumbas',
    'addRoom.cripta_real.desc': 'Los muertos guardan secretos que los vivos prefieren olvidar.',

    'addRoom.camara_runas.name': 'Cámara de Runas',
    'addRoom.camara_runas.action': 'Descifrar las runas antiguas',
    'addRoom.camara_runas.desc': 'Las runas brillan revelando verdades arcanas.',

    'addRoom.camara_invocacion.name': 'Cámara de Invocación',
    'addRoom.camara_invocacion.action': 'Realizar una invocación',
    'addRoom.camara_invocacion.desc': 'Los espíritus invocados revelan secretos del más allá.',

    'addRoom.observatorio.name': 'Observatorio',
    'addRoom.observatorio.action': 'Consultar las estrellas',
    'addRoom.observatorio.desc': 'Los astros nunca mienten sobre los asuntos terrenales.',

    'addRoom.despensa.name': 'Despensa',
    'addRoom.despensa.action': 'Buscar entre las provisiones',
    'addRoom.despensa.desc': 'Entre barriles y sacos se esconden objetos útiles.',

    'addRoom.dormitorio_criados.name': 'Dormitorio de Criados',
    'addRoom.dormitorio_criados.action': 'Escuchar a los criados',
    'addRoom.dormitorio_criados.desc': 'Los sirvientes siempre saben más de lo que aparentan.',

    'addRoom.lavanderia.name': 'Lavandería',
    'addRoom.lavanderia.action': 'Revisar las ropas',
    'addRoom.lavanderia.desc': 'Las prendas olvidadas esconden pistas inesperadas.',

    'addRoom.establos.name': 'Establos',
    'addRoom.establos.action': 'Preparar un caballo',
    'addRoom.establos.desc': 'Un buen caballo permite llegar más lejos.',

    'addRoom.granero.name': 'Granero',
    'addRoom.granero.action': 'Buscar entre el grano',
    'addRoom.granero.desc': 'Objetos escondidos entre la cosecha esperan ser encontrados.',

    'addRoom.taller.name': 'Taller',
    'addRoom.taller.action': 'Examinar las herramientas',
    'addRoom.taller.desc': 'Las herramientas revelan pistas sobre los métodos empleados.',

    'addRoom.sala_mensajeros.name': 'Sala de Mensajeros',
    'addRoom.sala_mensajeros.action': 'Interceptar mensajes',
    'addRoom.sala_mensajeros.desc': 'Las cartas interceptadas contienen rumores valiosos.',

    'addRoom.jardin_claustro.name': 'Jardín del Claustro',
    'addRoom.jardin_claustro.action': 'Meditar en el claustro',
    'addRoom.jardin_claustro.desc': 'La paz del claustro mejora tu reputación entre los cortesanos.',

    'addRoom.laberinto_setos.name': 'Laberinto de Setos',
    'addRoom.laberinto_setos.action': 'Explorar el laberinto',
    'addRoom.laberinto_setos.desc': 'Atajos secretos se esconden entre los setos.',

    'addRoom.estanque_real.name': 'Estanque Real',
    'addRoom.estanque_real.action': 'Contemplar el estanque',
    'addRoom.estanque_real.desc': 'Las aguas cristalinas reflejan verdades ocultas.',

    'addRoom.cementerio.name': 'Cementerio',
    'addRoom.cementerio.action': 'Investigar las lápidas',
    'addRoom.cementerio.desc': 'Los epitafios esconden mensajes cifrados del pasado.',

    'addRoom.jardin_hierbas.name': 'Jardín de Hierbas',
    'addRoom.jardin_hierbas.action': 'Recolectar hierbas',
    'addRoom.jardin_hierbas.desc': 'Las plantas medicinales y venenosas crecen lado a lado.',

    'addRoom.sala_reliquias.name': 'Sala de Reliquias',
    'addRoom.sala_reliquias.action': 'Examinar las reliquias',
    'addRoom.sala_reliquias.desc': 'Los objetos sagrados guardan evidencias irrefutables.',

    'addRoom.torre_campanas.name': 'Torre de Campanas',
    'addRoom.torre_campanas.action': 'Tocar las campanas',
    'addRoom.torre_campanas.desc': 'El sonido de las campanas revela verdades escondidas.',

    'addRoom.torre_reloj.name': 'Torre del Reloj',
    'addRoom.torre_reloj.action': 'Manipular el mecanismo',
    'addRoom.torre_reloj.desc': 'Los engranajes del reloj abren pasajes inesperados.',

    // ═══ Additional general keys ═══
    'suspicion.chooseLugar': 'Elige el lugar de la sospecha',
    'suspicion.lugar': 'Lugar',
    'log.roomAction': '{room}: acción completada',
    'log.botRoomAction': '{name} investiga en {room}.',

    // ═══════════════════════════════════════════════════
    // ROOM EVENTS — Additional Rooms (30 rooms × 5 events)
    // ═══════════════════════════════════════════════════

    // ── 1. Sala de Banquetes ──────────────────────────
    'roomEvent.banq_1.name': 'Confesión entre copas',
    'roomEvent.banq_1.desc': 'Un noble ebrio deja escapar un detalle revelador sobre el crimen mientras brinda.',

    'roomEvent.banq_2.name': 'Banquete suntuoso',
    'roomEvent.banq_2.desc': 'Las mesas rebosan de manjares y el vino fluye sin cesar.',
    'roomEvent.banq_2.flavor': 'El aroma de jabalí asado y especias exóticas inunda la sala. Los comensales ríen y brindan, ajenos al peligro que acecha.',

    'roomEvent.banq_3.name': 'Brindis en tu honor',
    'roomEvent.banq_3.desc': 'El anfitrión te dedica un brindis público, elevando tu prestigio ante la corte.',

    'roomEvent.banq_4.name': 'Nota bajo el plato',
    'roomEvent.banq_4.desc': 'Al levantar tu plato encuentras una nota con información comprometedora sobre otro investigador.',

    'roomEvent.banq_5.name': 'Música y danza',
    'roomEvent.banq_5.desc': 'Los músicos tocan mientras los nobles bailan entre risas y secretos.',
    'roomEvent.banq_5.flavor': 'Las parejas giran al compás de una pavana. Entre el bullicio, los susurros se pierden como humo entre las vigas del techo.',

    // ── 2. Galería de Retratos ────────────────────────
    'roomEvent.gale_1.name': 'Retrato revelador',
    'roomEvent.gale_1.desc': 'Un retrato familiar contiene un detalle pictórico que apunta hacia una pista crucial.',

    'roomEvent.gale_2.name': 'Ojos que observan',
    'roomEvent.gale_2.desc': 'Los retratos de los ancestros parecen seguirte con la mirada.',
    'roomEvent.gale_2.flavor': 'Los ojos pintados al óleo brillan a la luz de las velas. Juras que uno de ellos acaba de parpadear.',

    'roomEvent.gale_3.name': 'Retrato con mensaje oculto',
    'roomEvent.gale_3.desc': 'Detrás de un cuadro descubres una inscripción que delata a otro investigador.',

    'roomEvent.gale_4.name': 'Paseo contemplativo',
    'roomEvent.gale_4.desc': 'Caminas entre siglos de historia familiar plasmados en lienzo.',
    'roomEvent.gale_4.flavor': 'Cada retrato cuenta una historia de ambición y poder. Los marcos dorados reflejan la luz temblorosa de los candelabros.',

    'roomEvent.gale_5.name': 'Linaje reconocido',
    'roomEvent.gale_5.desc': 'Un cortesano identifica tu semejanza con un héroe de los retratos y te elogia públicamente.',

    // ── 3. Sala de Música ─────────────────────────────
    'roomEvent.musi_1.name': 'Melodía delatora',
    'roomEvent.musi_1.desc': 'Las notas de una antigua canción popular esconden una pista cifrada en su letra.',
    'roomEvent.musi_1.flavor': 'Una vieja tonada resuena entre los instrumentos abandonados. Su letra cuenta una historia que nadie quiere recordar.',

    'roomEvent.musi_2.name': 'Partitura escondida',
    'roomEvent.musi_2.desc': 'Entre las partituras encuentras un documento con información valiosa sobre el misterio.',

    'roomEvent.musi_3.name': 'Actuación magistral',
    'roomEvent.musi_3.desc': 'Tu interpretación musical impresiona a los presentes y ganas su admiración.',

    'roomEvent.musi_4.name': 'Eco de cuerdas',
    'roomEvent.musi_4.desc': 'Los instrumentos vibran suavemente como si alguien invisible los acariciara.',
    'roomEvent.musi_4.flavor': 'Las cuerdas del laúd tiemblan solas. Un arpa lejana entona una melodía que nadie reconoce pero todos temen.',

    'roomEvent.musi_5.name': 'Secreto en la canción',
    'roomEvent.musi_5.desc': 'Un trovador canta una balada que contiene detalles sospechosos sobre otro investigador.',

    // ── 4. Sala de Audiencias ─────────────────────────
    'roomEvent.audi_1.name': 'Testimonio inesperado',
    'roomEvent.audi_1.desc': 'Un peticionario revela sin querer información comprometedora sobre otro investigador.',

    'roomEvent.audi_2.name': 'Petición reveladora',
    'roomEvent.audi_2.desc': 'Entre las solicitudes de audiencia descubres un documento con pistas sobre el crimen.',

    'roomEvent.audi_3.name': 'Justicia ejemplar',
    'roomEvent.audi_3.desc': 'Tu intervención justa en una disputa te granjea el respeto de todos los presentes.',

    'roomEvent.audi_4.name': 'Cola de peticionarios',
    'roomEvent.audi_4.desc': 'Decenas de súbditos esperan su turno para ser escuchados por la corona.',
    'roomEvent.audi_4.flavor': 'Los murmullos de los peticionarios llenan la sala. Campesinos, mercaderes y nobles menores aguardan con rostros ansiosos.',

    'roomEvent.audi_5.name': 'Acusación infundada',
    'roomEvent.audi_5.desc': 'Un peticionario airado te señala como sospechoso, dañando tu reputación ante la corte.',

    // ── 5. Terraza Real ───────────────────────────────
    'roomEvent.terr_1.name': 'Atajo por las almenas',
    'roomEvent.terr_1.desc': 'Desde la terraza descubres un camino por las almenas que conecta con otra parte del castillo.',

    'roomEvent.terr_2.name': 'Atardecer dorado',
    'roomEvent.terr_2.desc': 'El sol se pone tiñendo de oro las torres del castillo.',
    'roomEvent.terr_2.flavor': 'El cielo arde en tonos púrpura y dorado. Las sombras del castillo se alargan como dedos oscuros sobre los jardines.',

    'roomEvent.terr_3.name': 'Conversación al viento',
    'roomEvent.terr_3.desc': 'El viento trae fragmentos de una conversación lejana que contiene una pista importante.',

    'roomEvent.terr_4.name': 'Brisa nocturna',
    'roomEvent.terr_4.desc': 'El aire fresco de la noche aclara la mente y calma el espíritu.',
    'roomEvent.terr_4.flavor': 'La brisa arrastra el aroma de los jardines de abajo. Las estrellas titilan sobre un castillo que guarda más secretos que piedras.',

    'roomEvent.terr_5.name': 'Vigía respetado',
    'roomEvent.terr_5.desc': 'Los guardias de la terraza te reconocen como aliado leal, mejorando tu reputación.',

    // ── 6. Archivo Real ───────────────────────────────
    'roomEvent.arch_1.name': 'Documento clasificado',
    'roomEvent.arch_1.desc': 'Entre legajos polvorientos encuentras un documento oficial que contiene una pista decisiva.',

    'roomEvent.arch_2.name': 'Registro comprometedor',
    'roomEvent.arch_2.desc': 'Un registro de visitas revela información delicada sobre otro investigador.',

    'roomEvent.arch_3.name': 'Polvo de siglos',
    'roomEvent.arch_3.desc': 'El archivo guarda documentos que nadie ha consultado en décadas.',
    'roomEvent.arch_3.flavor': 'El polvo danza en los rayos de luz que se cuelan entre los estantes. Pergaminos enrollados esperan a quien sepa leerlos.',

    'roomEvent.arch_4.name': 'Tinta desvanecida',
    'roomEvent.arch_4.desc': 'Los documentos más antiguos apenas son legibles, pero su contenido sigue siendo valioso.',
    'roomEvent.arch_4.flavor': 'Las letras se desvanecen en los pergaminos amarillentos. El olor a tinta vieja y cuero impregna cada rincón del archivo.',

    'roomEvent.arch_5.name': 'Carta sellada olvidada',
    'roomEvent.arch_5.desc': 'Encuentras una carta sin abrir cuyo contenido arroja luz sobre el misterio.',

    // ── 7. Cuartel de Guardias ────────────────────────
    'roomEvent.cuar_1.name': 'Informe del centinela',
    'roomEvent.cuar_1.desc': 'Un guardia comparte su informe nocturno que revela datos comprometedores sobre otro investigador.',

    'roomEvent.cuar_2.name': 'Ronda de vigilancia',
    'roomEvent.cuar_2.desc': 'Acompañas a los guardias en su ronda y descubres una pista que habían pasado por alto.',

    'roomEvent.cuar_3.name': 'Cuartel cerrado',
    'roomEvent.cuar_3.desc': 'Los guardias sellan el cuartel por un protocolo de seguridad. Nadie puede entrar hasta que se levante el cierre.',

    'roomEvent.cuar_4.name': 'Cambio de guardia',
    'roomEvent.cuar_4.desc': 'Los soldados intercambian puestos con disciplina militar.',
    'roomEvent.cuar_4.flavor': 'Las armaduras resuenan al chocar. Los guardias marchan en formación, sus rostros pétreos iluminados por las antorchas del muro.',

    'roomEvent.cuar_5.name': 'Deserción sospechosa',
    'roomEvent.cuar_5.desc': 'Te encuentran en el cuartel sin autorización. Los guardias desconfían de tus intenciones.',

    // ── 8. Sala de Estrategia ─────────────────────────
    'roomEvent.estr_1.name': 'Mapa con anotaciones',
    'roomEvent.estr_1.desc': 'Un mapa táctico tiene anotaciones manuscritas que revelan una pista sobre el crimen.',

    'roomEvent.estr_2.name': 'Piezas de ajedrez',
    'roomEvent.estr_2.desc': 'Las piezas de un tablero de ajedrez permanecen a mitad de una partida inacabada.',
    'roomEvent.estr_2.flavor': 'El rey negro está en jaque. Alguien abandonó la partida a toda prisa. ¿Quién huye de un juego... y de qué?',

    'roomEvent.estr_3.name': 'Planes interceptados',
    'roomEvent.estr_3.desc': 'Encuentras planes militares que contienen información reveladora sobre otro investigador.',

    'roomEvent.estr_4.name': 'Ruta estratégica',
    'roomEvent.estr_4.desc': 'Los mapas tácticos muestran un pasaje que permite moverte con mayor rapidez por el castillo.',

    'roomEvent.estr_5.name': 'Sala de guerra vacía',
    'roomEvent.estr_5.desc': 'La sala de estrategia está desierta, pero los mapas siguen desplegados.',
    'roomEvent.estr_5.flavor': 'Las figuras de madera representan tropas sobre un mapa detallado. Alguien planeaba algo grande. La vela aún está tibia.',

    // ── 9. Patio de Entrenamiento ─────────────────────
    'roomEvent.pati_1.name': 'Calentamiento intenso',
    'roomEvent.pati_1.desc': 'El entrenamiento físico te da energía extra para recorrer el castillo con mayor agilidad.',

    'roomEvent.pati_2.name': 'Duelo de práctica',
    'roomEvent.pati_2.desc': 'Dos escuderos practican esgrima con espadas de madera bajo la supervisión del maestro de armas.',
    'roomEvent.pati_2.flavor': 'El chocar de las espadas de madera resuena contra los muros de piedra. Los jóvenes escuderos sudan bajo el sol del mediodía.',

    'roomEvent.pati_3.name': 'Victoria en el torneo',
    'roomEvent.pati_3.desc': 'Demuestras tu destreza ante los soldados y ganas su respeto en un combate amistoso.',

    'roomEvent.pati_4.name': 'Resistencia del guerrero',
    'roomEvent.pati_4.desc': 'El entrenamiento de resistencia te prepara para recorrer grandes distancias sin fatigarte.',

    'roomEvent.pati_5.name': 'Ecos de acero',
    'roomEvent.pati_5.desc': 'Los sonidos del entrenamiento llenan el patio de una energía marcial.',
    'roomEvent.pati_5.flavor': 'El chasquido de las cuerdas de los arcos se mezcla con los gritos de los instructores. El olor a cuero y sudor impregna el aire.',

    // ── 10. Forja ─────────────────────────────────────
    'roomEvent.forj_1.name': 'Marca en el acero',
    'roomEvent.forj_1.desc': 'El herrero reconoce una marca en un arma que conecta con una pista del crimen.',

    'roomEvent.forj_2.name': 'Chispas en la oscuridad',
    'roomEvent.forj_2.desc': 'El martillo golpea el yunque y las chispas iluminan la forja como estrellas fugaces.',
    'roomEvent.forj_2.flavor': 'El calor de la fragua enrojece los rostros. El metal al rojo vivo sisea al sumergirse en el agua, envolviendo todo en vapor.',

    'roomEvent.forj_3.name': 'Temple del metal',
    'roomEvent.forj_3.desc': 'El herrero trabaja una pieza con maestría, el ritmo hipnótico del martillo te absorbe.',
    'roomEvent.forj_3.flavor': 'Cada golpe del martillo es preciso, medido. El herrero murmura una vieja canción mientras da forma al acero incandescente.',

    'roomEvent.forj_4.name': 'Fragua desbordada',
    'roomEvent.forj_4.desc': 'Un incendio en la forja obliga a evacuar la sala hasta que se controlen las llamas.',

    'roomEvent.forj_5.name': 'Espada para un héroe',
    'roomEvent.forj_5.desc': 'El herrero te obsequia una daga ceremonial como muestra de respeto, elevando tu prestigio.',

    // ── 11. Torre del Arquero ─────────────────────────
    'roomEvent.arqu_1.name': 'Flecha con mensaje',
    'roomEvent.arqu_1.desc': 'Una flecha clavada en la madera tiene un mensaje enrollado que contiene una pista valiosa.',

    'roomEvent.arqu_2.name': 'Vigía revelador',
    'roomEvent.arqu_2.desc': 'Desde la torre, observas a otro investigador realizando acciones sospechosas.',

    'roomEvent.arqu_3.name': 'Viento en las almenas',
    'roomEvent.arqu_3.desc': 'El viento silba entre las aspilleras de la torre con fuerza implacable.',
    'roomEvent.arqu_3.flavor': 'Las flechas en sus carcajes vibran con el viento. Desde aquí, el mundo parece pequeño y los secretos, insignificantes.',

    'roomEvent.arqu_4.name': 'Puente entre torres',
    'roomEvent.arqu_4.desc': 'Descubres un puente elevado que conecta con otra torre, permitiéndote moverte rápidamente.',

    'roomEvent.arqu_5.name': 'Diana perfecta',
    'roomEvent.arqu_5.desc': 'Las dianas de práctica muestran impactos precisos de los mejores arqueros del reino.',
    'roomEvent.arqu_5.flavor': 'Las flechas forman un patrón perfecto en el centro de la diana. El silencio solo se rompe por el zumbido de una cuerda tensa.',

    // ── 12. Cripta Real ───────────────────────────────
    'roomEvent.crip_1.name': 'Inscripción en la tumba',
    'roomEvent.crip_1.desc': 'Una inscripción grabada en un sarcófago revela una pista sobre el misterio actual.',

    'roomEvent.crip_2.name': 'Silencio sepulcral',
    'roomEvent.crip_2.desc': 'El silencio de la cripta es absoluto, interrumpido solo por el goteo del agua.',
    'roomEvent.crip_2.flavor': 'Las lápidas de mármol reflejan la luz mortecina de las velas. Un frío sobrenatural recorre tus huesos mientras lees los epitafios.',

    'roomEvent.crip_3.name': 'Espíritu revelador',
    'roomEvent.crip_3.desc': 'Una aparición espectral señala hacia otro investigador, revelando uno de sus secretos.',

    'roomEvent.crip_4.name': 'Profanador de tumbas',
    'roomEvent.crip_4.desc': 'Te descubren revolviendo entre las tumbas reales. La corte te considera un profanador.',

    'roomEvent.crip_5.name': 'Velas eternas',
    'roomEvent.crip_5.desc': 'Las velas votivas parpadean ante las tumbas de los antiguos reyes.',
    'roomEvent.crip_5.flavor': 'Las llamas de las velas danzan sin corriente de aire. Los rostros tallados en piedra de los difuntos reyes parecen observarte con desaprobación.',

    // ── 13. Cámara de Runas ───────────────────────────
    'roomEvent.runa_1.name': 'Runa luminosa',
    'roomEvent.runa_1.desc': 'Una runa antigua brilla al acercarte, revelando un mensaje oculto con una pista importante.',

    'roomEvent.runa_2.name': 'Susurros arcanos',
    'roomEvent.runa_2.desc': 'Las runas emiten un murmullo constante que resuena en la cámara de piedra.',
    'roomEvent.runa_2.flavor': 'Los símbolos tallados en las paredes pulsan con una luz azulada. El aire vibra con una energía antigua que eriza la piel.',

    'roomEvent.runa_3.name': 'Visión rúnica',
    'roomEvent.runa_3.desc': 'Las runas te conceden una visión momentánea que revela un secreto de otro investigador.',

    'roomEvent.runa_4.name': 'Trampa rúnica',
    'roomEvent.runa_4.desc': 'Activas accidentalmente una runa de protección que sella la cámara temporalmente.',

    'roomEvent.runa_5.name': 'Mensaje de los antiguos',
    'roomEvent.runa_5.desc': 'Descifras un conjunto de runas que contienen información crucial sobre el crimen.',

    // ── 14. Cámara de Invocación ──────────────────────
    'roomEvent.invo_1.name': 'Espíritu confidente',
    'roomEvent.invo_1.desc': 'Un espíritu invocado revela información comprometedora sobre otro investigador.',

    'roomEvent.invo_2.name': 'Círculo de invocación',
    'roomEvent.invo_2.desc': 'El círculo mágico grabado en el suelo emite un fulgor tenue y amenazador.',
    'roomEvent.invo_2.flavor': 'Las velas negras parpadean alrededor del pentáculo. El aire huele a incienso y azufre. Algo invisible roza tu nuca.',

    'roomEvent.invo_3.name': 'Eco del más allá',
    'roomEvent.invo_3.desc': 'Una voz espectral murmura una pista desde el otro lado del velo entre los mundos.',

    'roomEvent.invo_4.name': 'Invocación fallida',
    'roomEvent.invo_4.desc': 'El ritual sale mal y una presencia oscura te marca, dañando tu reputación ante los supersticiosos cortesanos.',

    'roomEvent.invo_5.name': 'Vórtice inestable',
    'roomEvent.invo_5.desc': 'Un vórtice de energía oscura bloquea la cámara hasta que la magia se disipe.',

    // ── 15. Observatorio ──────────────────────────────
    'roomEvent.obse_1.name': 'Alineación estelar',
    'roomEvent.obse_1.desc': 'La posición de las estrellas revela un patrón que se corresponde con una pista del misterio.',

    'roomEvent.obse_2.name': 'Cielo estrellado',
    'roomEvent.obse_2.desc': 'El firmamento nocturno se despliega en toda su magnificencia.',
    'roomEvent.obse_2.flavor': 'Miles de estrellas brillan a través de la cúpula abierta. El telescopio de latón apunta hacia constelaciones que cuentan historias ancestrales.',

    'roomEvent.obse_3.name': 'Mapa celeste comprometedor',
    'roomEvent.obse_3.desc': 'Un mapa estelar anotado revela los movimientos nocturnos de otro investigador.',

    'roomEvent.obse_4.name': 'Luna llena',
    'roomEvent.obse_4.desc': 'La luna baña el observatorio con su luz plateada mientras contemplas el horizonte.',
    'roomEvent.obse_4.flavor': 'La luna llena ilumina los instrumentos de latón y cristal. Tu sombra se alarga sobre las cartas estelares desperdigadas por la mesa.',

    'roomEvent.obse_5.name': 'Pasadizo tras el telescopio',
    'roomEvent.obse_5.desc': 'Al mover el telescopio descubres un pasadizo oculto que permite desplazarte con rapidez.',

    // ── 16. Despensa ──────────────────────────────────
    'roomEvent.desp_1.name': 'Nota entre las conservas',
    'roomEvent.desp_1.desc': 'Escondida dentro de un tarro de conserva encuentras una nota con una pista relevante.',

    'roomEvent.desp_2.name': 'Olor a especias',
    'roomEvent.desp_2.desc': 'El aroma de las especias almacenadas llena la despensa de un perfume embriagador.',
    'roomEvent.desp_2.flavor': 'Sacos de canela, pimienta y azafrán se apilan junto a barriles de vino. Las ratas escarban entre los suministros sin ser molestadas.',

    'roomEvent.desp_3.name': 'Miel y recuerdos',
    'roomEvent.desp_3.desc': 'Los tarros de miel y las hierbas secas evocan tiempos más pacíficos.',
    'roomEvent.desp_3.flavor': 'La miel ambarilla brilla a la luz de tu antorcha. Hileras de embutidos cuelgan del techo junto a ristras de ajos y cebollas.',

    'roomEvent.desp_4.name': 'Derrumbe de estantes',
    'roomEvent.desp_4.desc': 'Un estante cargado se desploma bloqueando el acceso a la despensa temporalmente.',

    'roomEvent.desp_5.name': 'Comida envenenada',
    'roomEvent.desp_5.desc': 'Te acusan de manipular los alimentos del castillo. Tu reputación sufre entre la servidumbre.',

    // ── 17. Dormitorio de Criados ─────────────────────
    'roomEvent.dorm_1.name': 'Diario del criado',
    'roomEvent.dorm_1.desc': 'Bajo un jergón descubres el diario de un sirviente que contiene observaciones reveladoras.',

    'roomEvent.dorm_2.name': 'Sueño ligero',
    'roomEvent.dorm_2.desc': 'Los criados descansan en catres estrechos, algunos murmurando en sueños.',
    'roomEvent.dorm_2.flavor': 'El crujir de los catres y los ronquidos llenan la estancia. Alguien habla en sueños, repitiendo un nombre una y otra vez.',

    'roomEvent.dorm_3.name': 'Confesión nocturna',
    'roomEvent.dorm_3.desc': 'Un criado soñoliento revela sin querer información comprometedora sobre otro investigador.',

    'roomEvent.dorm_4.name': 'Rincón tranquilo',
    'roomEvent.dorm_4.desc': 'El dormitorio ofrece un momento de calma lejos de las intrigas de la corte.',
    'roomEvent.dorm_4.flavor': 'La tenue luz de una vela proyecta sombras danzantes. Objetos personales humildes adornan los rincones: un peine, una flor seca, una carta ajada.',

    'roomEvent.dorm_5.name': 'Gratitud de los sirvientes',
    'roomEvent.dorm_5.desc': 'Tu trato amable con la servidumbre se propaga por el castillo, mejorando tu reputación.',

    // ── 18. Lavandería ────────────────────────────────
    'roomEvent.lava_1.name': 'Mensaje en la ropa',
    'roomEvent.lava_1.desc': 'En el bolsillo de una prenda olvidada encuentras un billete con una pista importante.',

    'roomEvent.lava_2.name': 'Vapor y lejía',
    'roomEvent.lava_2.desc': 'Las lavanderas trabajan entre nubes de vapor y cubas de lejía hirviente.',
    'roomEvent.lava_2.flavor': 'El vapor empapa el aire caliente. Las lavanderas frotan y retuercen las telas sin descanso, cantando una vieja tonada al ritmo del trabajo.',

    'roomEvent.lava_3.name': 'Tendedero de secretos',
    'roomEvent.lava_3.desc': 'Las sábanas tendidas ondean como fantasmas en la corriente de aire.',
    'roomEvent.lava_3.flavor': 'Las prendas colgadas gotean formando charcos. Entre las ropas de nobles y sirvientes, las manchas cuentan historias que nadie quiere leer.',

    'roomEvent.lava_4.name': 'Mancha delatora',
    'roomEvent.lava_4.desc': 'Una prenda manchada de tinta revela la caligrafía de otro investigador junto a un mensaje oculto.',

    'roomEvent.lava_5.name': 'Tubería reventada',
    'roomEvent.lava_5.desc': 'Una tubería revienta inundando la lavandería y bloqueando el acceso temporalmente.',

    // ── 19. Establos ──────────────────────────────────
    'roomEvent.esta_1.name': 'Caballo veloz',
    'roomEvent.esta_1.desc': 'Ensillas un caballo rápido que te permite recorrer mayores distancias este turno.',

    'roomEvent.esta_2.name': 'Relincho en la noche',
    'roomEvent.esta_2.desc': 'Los caballos se agitan nerviosos en sus cuadras, presintiendo algo que tú no ves.',
    'roomEvent.esta_2.flavor': 'El olor a heno y cuero te envuelve. Los caballos resoplan y piafan mientras el mozo de cuadra silba una canción desafinada.',

    'roomEvent.esta_3.name': 'Atajo por las caballerizas',
    'roomEvent.esta_3.desc': 'Encuentras un camino trasero que conecta los establos con una zona lejana del castillo.',

    'roomEvent.esta_4.name': 'Paja y silencio',
    'roomEvent.esta_4.desc': 'La calma de los establos ofrece un respiro del bullicio del castillo.',
    'roomEvent.esta_4.flavor': 'Los rayos de sol se cuelan entre las tablas iluminando el polvo dorado del heno. Un gato duerme enrollado sobre una manta vieja.',

    'roomEvent.esta_5.name': 'Herradura encontrada',
    'roomEvent.esta_5.desc': 'Encuentras una herradura con un símbolo grabado que resulta ser una pista sobre el crimen.',

    // ── 20. Granero ───────────────────────────────────
    'roomEvent.gran_1.name': 'Saco con documentos',
    'roomEvent.gran_1.desc': 'Dentro de un saco de grano alguien ocultó documentos que contienen una pista valiosa.',

    'roomEvent.gran_2.name': 'Ratones entre el grano',
    'roomEvent.gran_2.desc': 'Los ratones corretean entre los sacos de cereal, huyendo de tu presencia.',
    'roomEvent.gran_2.flavor': 'El grano cruje bajo tus pies. Las vigas de madera crujen con el viento mientras los ratones se escabullen por las grietas.',

    'roomEvent.gran_3.name': 'Cosecha olvidada',
    'roomEvent.gran_3.desc': 'Los sacos apilados cuentan la historia de una cosecha abundante ya olvidada.',
    'roomEvent.gran_3.flavor': 'Montañas de grano dorado se alzan hasta el techo. Las telarañas cubren los rincones como velos de plata en la penumbra.',

    'roomEvent.gran_4.name': 'Derrumbe de sacos',
    'roomEvent.gran_4.desc': 'Una pila de sacos se derrumba bloqueando la salida del granero temporalmente.',

    'roomEvent.gran_5.name': 'Grano contaminado',
    'roomEvent.gran_5.desc': 'Te descubren cerca del grano contaminado y te señalan como posible responsable.',

    // ── 21. Taller ────────────────────────────────────
    'roomEvent.tall_1.name': 'Herramienta sospechosa',
    'roomEvent.tall_1.desc': 'Encuentras una herramienta con marcas que coinciden con el método del crimen.',

    'roomEvent.tall_2.name': 'Aserrín y barniz',
    'roomEvent.tall_2.desc': 'El taller huele a madera fresca y barniz recién aplicado.',
    'roomEvent.tall_2.flavor': 'Las virutas de madera cubren el suelo como nieve rubia. Herramientas de todo tipo cuelgan de las paredes en un orden meticuloso.',

    'roomEvent.tall_3.name': 'Engranajes y poleas',
    'roomEvent.tall_3.desc': 'Mecanismos complejos a medio construir ocupan las mesas de trabajo.',
    'roomEvent.tall_3.flavor': 'Ruedas dentadas, palancas y muelles se amontonan en un caos creativo. Un plano desplegado muestra un invento que nadie terminó.',

    'roomEvent.tall_4.name': 'Cajón secreto',
    'roomEvent.tall_4.desc': 'Al mover un banco de trabajo descubres un cajón oculto con información sobre otro investigador.',

    'roomEvent.tall_5.name': 'Accidente en el taller',
    'roomEvent.tall_5.desc': 'Un mecanismo se desploma bloqueando la entrada del taller hasta que se retire.',

    // ── 22. Sala de Mensajeros ────────────────────────
    'roomEvent.mens_1.name': 'Carta interceptada',
    'roomEvent.mens_1.desc': 'Interceptas una carta sellada cuyo contenido revela una pista clave sobre el misterio.',

    'roomEvent.mens_2.name': 'Paloma mensajera capturada',
    'roomEvent.mens_2.desc': 'Capturas una paloma mensajera que lleva un mensaje con datos sobre otro investigador.',

    'roomEvent.mens_3.name': 'Aleteo de palomas',
    'roomEvent.mens_3.desc': 'Las palomas mensajeras revolotean en sus jaulas esperando ser enviadas.',
    'roomEvent.mens_3.flavor': 'El arrullo de las palomas llena la sala. Mensajes enrollados esperan en pequeños tubos de latón junto a plumas y lacre.',

    'roomEvent.mens_4.name': 'Sellos de cera',
    'roomEvent.mens_4.desc': 'Los sellos de cera de diferentes casas nobles adornan las cartas pendientes.',
    'roomEvent.mens_4.flavor': 'Sellos rojos, azules y dorados brillan sobre los sobres. Cada uno representa una casa, un pacto, una promesa... o una traición.',

    'roomEvent.mens_5.name': 'Mensajero agradecido',
    'roomEvent.mens_5.desc': 'Ayudas a un mensajero herido y la noticia de tu bondad se extiende, mejorando tu reputación.',

    // ── 23. Jardín del Claustro ───────────────────────
    'roomEvent.clau_1.name': 'Paz del claustro',
    'roomEvent.clau_1.desc': 'La serenidad del jardín te llena de calma y ganas el respeto de los monjes que allí meditan.',

    'roomEvent.clau_2.name': 'Fuente del claustro',
    'roomEvent.clau_2.desc': 'El agua cristalina de la fuente murmura entre las columnas de piedra.',
    'roomEvent.clau_2.flavor': 'El sonido del agua cayendo en la fuente central te transporta a un lugar de paz. Las rosas trepan por las columnas del claustro.',

    'roomEvent.clau_3.name': 'Sendero entre rosales',
    'roomEvent.clau_3.desc': 'Descubres un sendero oculto entre los rosales que conecta con otra zona del castillo.',

    'roomEvent.clau_4.name': 'Sombra del ciprés',
    'roomEvent.clau_4.desc': 'Los cipreses centenarios proyectan sombras alargadas sobre los senderos empedrados.',
    'roomEvent.clau_4.flavor': 'La brisa mueve las hojas de los cipreses con un susurro antiguo. Un monje camina lentamente con las manos cruzadas tras la espalda.',

    'roomEvent.clau_5.name': 'Bendición monástica',
    'roomEvent.clau_5.desc': 'Los monjes del claustro bendicen tu búsqueda de la verdad, elevando tu reputación en la corte.',

    // ── 24. Laberinto de Setos ────────────────────────
    'roomEvent.labe_1.name': 'Atajo en el laberinto',
    'roomEvent.labe_1.desc': 'Descubres un paso oculto entre los setos que te permite moverte con mayor rapidez.',

    'roomEvent.labe_2.name': 'Camino sin salida',
    'roomEvent.labe_2.desc': 'Te pierdes en el laberinto y los setos se cierran a tu espalda, bloqueándote temporalmente.',

    'roomEvent.labe_3.name': 'Objeto entre las ramas',
    'roomEvent.labe_3.desc': 'Atrapado entre las ramas de un seto encuentras un objeto que contiene una pista del crimen.',

    'roomEvent.labe_4.name': 'Verde laberinto',
    'roomEvent.labe_4.desc': 'Los muros vegetales se alzan imponentes, creando un mundo aparte del castillo.',
    'roomEvent.labe_4.flavor': 'Los setos perfectamente recortados forman pasillos verdes y sombríos. El cielo es apenas visible entre las paredes de hojas.',

    'roomEvent.labe_5.name': 'Encuentro furtivo',
    'roomEvent.labe_5.desc': 'En el corazón del laberinto sorprendes a alguien dejando un mensaje, revelando sus secretos.',

    // ── 25. Estanque Real ─────────────────────────────
    'roomEvent.estan_1.name': 'Reflejo revelador',
    'roomEvent.estan_1.desc': 'Las aguas del estanque reflejan una escena del pasado que contiene una pista sobre el crimen.',

    'roomEvent.estan_2.name': 'Peces dorados',
    'roomEvent.estan_2.desc': 'Los peces de colores nadan en círculos hipnóticos bajo los nenúfares.',
    'roomEvent.estan_2.flavor': 'Las carpas doradas y rojas se deslizan entre los nenúfares. La superficie del agua es un espejo perfecto del cielo nublado.',

    'roomEvent.estan_3.name': 'Mensaje en una botella',
    'roomEvent.estan_3.desc': 'Flotando en el estanque encuentras una botella sellada con información sobre otro investigador.',

    'roomEvent.estan_4.name': 'Bruma sobre el agua',
    'roomEvent.estan_4.desc': 'Una neblina sube del estanque envolviendo los jardines en misterio.',
    'roomEvent.estan_4.flavor': 'La niebla se eleva del agua tibia creando formas fantasmagóricas. Los sauces llorones rozan la superficie con sus ramas como dedos pálidos.',

    'roomEvent.estan_5.name': 'Ofrenda al estanque',
    'roomEvent.estan_5.desc': 'Realizas una ofrenda simbólica al estanque siguiendo la tradición, ganando el favor de la corte.',

    // ── 26. Cementerio ────────────────────────────────
    'roomEvent.ceme_1.name': 'Epitafio cifrado',
    'roomEvent.ceme_1.desc': 'Una lápida reciente tiene un epitafio que, descifrado, revela una pista sobre el crimen.',

    'roomEvent.ceme_2.name': 'Niebla entre las tumbas',
    'roomEvent.ceme_2.desc': 'La niebla se arrastra entre las lápidas como un manto fantasmal.',
    'roomEvent.ceme_2.flavor': 'Los cuervos graznan desde las ramas desnudas. La niebla se enrosca alrededor de las cruces de piedra como dedos de un espectro.',

    'roomEvent.ceme_3.name': 'Tumba abierta',
    'roomEvent.ceme_3.desc': 'Una tumba recién abierta contiene objetos que revelan secretos de otro investigador.',

    'roomEvent.ceme_4.name': 'Maldición del camposanto',
    'roomEvent.ceme_4.desc': 'Los supersticiosos te ven rondar el cementerio de noche y tu reputación se resiente.',

    'roomEvent.ceme_5.name': 'Flores marchitas',
    'roomEvent.ceme_5.desc': 'Las flores sobre las tumbas se marchitan lentamente bajo el cielo gris.',
    'roomEvent.ceme_5.flavor': 'Ramos de flores secas adornan las tumbas más antiguas. El musgo cubre los nombres tallados en piedra, borrando la memoria de los muertos.',

    // ── 27. Jardín de Hierbas ─────────────────────────
    'roomEvent.hier_1.name': 'Hierba reveladora',
    'roomEvent.hier_1.desc': 'Entre las plantas medicinales encuentras una hierba rara que conecta con una pista del crimen.',

    'roomEvent.hier_2.name': 'Aromas del jardín',
    'roomEvent.hier_2.desc': 'El aroma de las hierbas medicinales y aromáticas impregna el aire.',
    'roomEvent.hier_2.flavor': 'Lavanda, romero, tomillo y salvia crecen en hileras ordenadas. Las abejas zumban entre las flores mientras el sol calienta la tierra fragante.',

    'roomEvent.hier_3.name': 'Recetas antiguas',
    'roomEvent.hier_3.desc': 'Un cuaderno de recetas herbolarias descansa olvidado en un banco de piedra.',
    'roomEvent.hier_3.flavor': 'Las páginas amarillentas describen remedios y venenos con igual detalle. Alguien marcó una página con una flor prensada.',

    'roomEvent.hier_4.name': 'Curandero agradecido',
    'roomEvent.hier_4.desc': 'Ayudas al herbolario del castillo a recolectar plantas y tu generosidad es reconocida por la corte.',

    'roomEvent.hier_5.name': 'Sendero entre hierbas',
    'roomEvent.hier_5.desc': 'Descubres un sendero oculto entre los parterres que permite moverte con agilidad por el castillo.',

    // ── 28. Sala de Reliquias ─────────────────────────
    'roomEvent.reli_1.name': 'Reliquia parlante',
    'roomEvent.reli_1.desc': 'Al tocar una reliquia antigua, una visión te muestra una pista sobre el misterio.',

    'roomEvent.reli_2.name': 'Cofre sagrado abierto',
    'roomEvent.reli_2.desc': 'Un cofre de reliquias contiene un pergamino que revela información sobre otro investigador.',

    'roomEvent.reli_3.name': 'Aura de lo sagrado',
    'roomEvent.reli_3.desc': 'Las reliquias emiten un brillo tenue que inspira respeto reverencial.',
    'roomEvent.reli_3.flavor': 'Cálices de oro, fragmentos de hueso y telas bordadas reposan en vitrinas de cristal. El aire parece más denso aquí, cargado de historia.',

    'roomEvent.reli_4.name': 'Protector de reliquias',
    'roomEvent.reli_4.desc': 'Tu cuidado al examinar las reliquias impresiona al custodio, quien te elogia públicamente.',

    'roomEvent.reli_5.name': 'Grabado en el relicario',
    'roomEvent.reli_5.desc': 'Un relicario tiene inscripciones ocultas que revelan una pista decisiva sobre el crimen.',

    // ── 29. Torre de Campanas ─────────────────────────
    'roomEvent.camp_1.name': 'Campana delatora',
    'roomEvent.camp_1.desc': 'El badajo de la campana guarda un compartimento secreto con datos sobre otro investigador.',

    'roomEvent.camp_2.name': 'Tañido lejano',
    'roomEvent.camp_2.desc': 'Las campanas suenan marcando las horas con un eco que recorre todo el castillo.',
    'roomEvent.camp_2.flavor': 'El bronce vibra con cada tañido, haciendo temblar los peldaños de la escalera de caracol. El sonido se extiende sobre los tejados como una ola.',

    'roomEvent.camp_3.name': 'Escalera secreta',
    'roomEvent.camp_3.desc': 'Tras la maquinaria de las campanas descubres una escalera oculta que conecta con otra zona.',

    'roomEvent.camp_4.name': 'Mensaje en la cuerda',
    'roomEvent.camp_4.desc': 'Alguien ató un mensaje a la cuerda de la campana que contiene una pista valiosa.',

    'roomEvent.camp_5.name': 'Campanero honorable',
    'roomEvent.camp_5.desc': 'Ayudas al campanero en su labor y la noticia de tu servicio mejora tu reputación en la corte.',

    // ── 30. Torre del Reloj ───────────────────────────
    'roomEvent.relo_1.name': 'Engranaje secreto',
    'roomEvent.relo_1.desc': 'Al girar un engranaje del reloj se abre un pasaje que permite moverte rápidamente.',

    'roomEvent.relo_2.name': 'Tic-tac eterno',
    'roomEvent.relo_2.desc': 'El mecanismo del reloj marca el paso del tiempo con precisión hipnótica.',
    'roomEvent.relo_2.flavor': 'Los engranajes giran sin descanso detrás del enorme dial. El péndulo oscila como el corazón mecánico del castillo, contando cada segundo.',

    'roomEvent.relo_3.name': 'Nota entre los engranajes',
    'roomEvent.relo_3.desc': 'Oculta entre los mecanismos del reloj encuentras una nota con una pista importante.',

    'roomEvent.relo_4.name': 'Mecanismo acelerado',
    'roomEvent.relo_4.desc': 'Ajustas el mecanismo del reloj y desbloqueas un atajo que te permite moverte con mayor agilidad.',

    'roomEvent.relo_5.name': 'Hora detenida',
    'roomEvent.relo_5.desc': 'El reloj se ha detenido en una hora concreta, como si el tiempo mismo contuviera el aliento.',
    'roomEvent.relo_5.flavor': 'Las agujas señalan las tres en punto. El péndulo está inmóvil. El silencio es absoluto, como si el castillo entero esperase algo.',

    // ═══════════════════════════════════════════
    // CASTLE STORIES SYSTEM
    // ═══════════════════════════════════════════

    // Categories
    'story.cat.curiosidad': 'Curiosidad',
    'story.cat.rumor_pasado': 'Rumor del pasado',
    'story.cat.anecdota': 'Anécdota',
    'story.cat.leyenda': 'Leyenda',
    'story.cat.chisme': 'Chisme actual',

    // Rarity
    'story.rarity.comun': 'Común',
    'story.rarity.raro': 'Raro',
    'story.rarity.legendario': 'Legendario',

    // UI
    'story.disclaimer': 'Historia del castillo — no afecta la investigación.',
    'story.ambiguousHint': 'Hmm... ¿será relevante para el caso?',
    'story.seriesPart': 'Parte {part} de {total}',
    'story.collection.title': 'Historias del Castillo',
    'story.collection.count': '{count} de {total}',
    'story.undiscovered': '???',
    'story.found': '{name} descubrió una historia del castillo.',

    // ── CURIOSIDADES ───────────────────────────
    'story.cur_reloj_torre.text': 'El reloj de la torre se detuvo la noche de un antiguo asesinato. Nadie se ha atrevido a repararlo desde entonces.',
    'story.cur_baldosas_trono.text': 'El Salón del Trono tiene exactamente 73 baldosas de piedra. Un antiguo arquitecto las dispuso en un patrón que, según dicen, oculta un mensaje.',
    'story.cur_escudo_armeria.text': 'Uno de los escudos de la armería tiene una abolladura que ningún herrero ha podido reparar. Se dice que la causó una criatura, no un hombre.',
    'story.cur_gato_biblioteca.text': 'Un viejo gato negro vive entre las estanterías de la biblioteca. Los sirvientes juran que lleva ahí más años de los que debería ser posible.',
    'story.cur_fuente_jardines.text': 'La fuente de los jardines tiene inscripciones en un idioma que nadie ha logrado traducir. El agua que brota siempre está helada, incluso en verano.',
    'story.cur_campana_capilla.text': 'La campana de la capilla suena sola algunas noches. El sacristán insiste en que es el viento, pero nadie le cree del todo.',
    'story.cur_receta_cocina.text': 'En la cocina hay una receta tallada en la pared que nadie se atreve a preparar. Los ingredientes mencionados no existen en ningún herbolario conocido.',
    'story.cur_eco_mazmorras.text': 'Las mazmorras tienen un eco peculiar: si gritas tu nombre, dicen que la voz que regresa no es del todo la tuya.',
    'story.cur_mural_consejo.text': 'Hay un mural en la Sala del Consejo con los rostros de antiguos consejeros. Uno de los rostros fue borrado con tal saña que la piedra quedó dañada.',
    'story.cur_ventana_torre.text': 'Desde la ventana más alta de la Torre del Mago se pueden ver las ruinas de otro castillo en la distancia. Los mapas no registran ninguna construcción allí.',
    'story.cur_pasadizo_olvidado.text': 'Existe un pasadizo entre la torre y las mazmorras que fue sellado hace generaciones. Los planos originales del castillo lo muestran claramente, pero nadie recuerda por qué se cerró.',
    'story.cur_inscripcion_trono.text': 'Debajo del trono hay una inscripción casi borrada que dice: "El que se siente aquí carga con los pecados de todos los anteriores".',

    // ── RUMORES DEL PASADO ─────────────────────
    'story.rum_noble_mazmorras.text': 'Se dice que un noble desapareció en las mazmorras hace años. Algunos creen que aún vaga por los túneles más profundos.',
    'story.rum_incendio_cocina.text': 'Un incendio devastó la cocina hace décadas. Desde entonces, los cocineros cuentan que el fuego de los hornos a veces se aviva solo por las noches.',
    'story.rum_libro_prohibido.text': 'En la biblioteca hay un estante que permanece cerrado con llave. Se rumorea que contiene un libro que predice el futuro del reino.',
    'story.rum_duelo_jardin.text': 'Los jardines fueron escenario de un duelo secreto entre dos nobles. Solo uno salió caminando, y nunca se encontró el cuerpo del otro.',
    'story.rum_fantasma_capilla.text': 'Un monje fue visto rezando en la capilla años después de su muerte. Quienes lo han visto dicen que sus labios se mueven pero no emite sonido alguno.',
    'story.rum_tesoro_perdido.text': 'Una leyenda habla de un tesoro escondido entre la torre del mago y las mazmorras. Muchos lo han buscado, ninguno lo ha encontrado.',
    'story.rum_consejero_traidor.text': 'Un antiguo diario menciona a un traidor dentro del consejo real. La página con su nombre fue arrancada.',
    'story.rum_pacto_antiguo.text': 'Se dice que los fundadores del castillo hicieron un pacto con alguien... o algo. Los términos se perdieron con el tiempo.',
    'story.rum_armero_loco.text': 'El antiguo armero del castillo enloqueció de repente. Antes de desaparecer, forjó una espada que nadie puede levantar.',
    'story.rum_rey_insomne.text': 'El rey anterior nunca dormía en la misma habitación dos noches seguidas. Decía que "algo" lo visitaba en sueños.',

    // ── ANÉCDOTAS DE PERSONAJES ────────────────
    'story.ane_cocinero_veneno.text': 'El cocinero fue acusado de envenenamiento hace años, pero nunca se probó nada. Desde entonces cocina con guantes y prueba cada plato tres veces.',
    'story.ane_guardia_noche.text': 'Algunos guardias evitan patrullar las mazmorras por la noche. El capitán dice que es superstición, pero él tampoco lo hace.',
    'story.ane_bufon_secretos.text': 'El bufón del castillo lleva un diario donde anota todo lo que escucha. Dice que es "material para sus bromas", pero nadie está seguro.',
    'story.ane_sacerdotisa_sueno.text': 'La sacerdotisa afirma haber tenido un sueño profético la víspera de cada tragedia en el castillo. Nadie quiere preguntarle qué soñó anoche.',
    'story.ane_alquimista_exp.text': 'El alquimista una vez creó una poción que hacía invisible lo que tocaba. Desafortunadamente, derramó la fórmula y ahora no puede encontrarla.',
    'story.ane_embajador_carta.text': 'El embajador recibe cartas selladas con lacre negro que siempre lee a solas. Un sirviente dice haberle visto quemar una con expresión de terror.',
    'story.ane_reina_jardin.text': 'La reina tiene una rosa en los jardines que cuida personalmente. Habla con ella como si pudiera escucharla.',
    'story.ane_capitan_cicatriz.text': 'El capitán de la guardia tiene una cicatriz que cruza su espalda. Dice que fue en batalla, pero un viejo soldado cuenta otra historia.',
    'story.ane_caballero_juramento.text': 'El caballero real hizo un juramento secreto ante el altar de la capilla. Solo él y Dios saben sus palabras, pero desde ese día cambió por completo.',
    'story.ane_sirviente_llave.text': 'Un sirviente lleva siempre una llave colgada al cuello que no corresponde a ninguna cerradura conocida del castillo.',

    // ── LEYENDAS ───────────────────────────────
    'story.ley_figura_torre.text': 'Algunos aseguran ver una figura en la ventana de la torre del mago durante las noches de luna llena. El alquimista jura que no es él.',
    'story.ley_tuneles_castillo.text': 'Se dice que hay túneles bajo el castillo que nadie ha explorado del todo. Los que se adentraron demasiado volvieron... diferentes.',
    'story.ley_espejo_capilla.text': 'Un antiguo espejo en la capilla fue cubierto con una tela negra hace generaciones. La orden fue: "No lo destapéis jamás".',
    'story.ley_voz_biblioteca.text': 'Un sirviente afirma haber escuchado voces en la biblioteca cuando estaba completamente vacía. Las voces discutían sobre el destino del reino.',
    'story.ley_rosa_eterna.text': 'En lo más profundo de los jardines crece una rosa que nunca se marchita. Los botánicos del reino no pueden explicarlo.',
    'story.ley_pasos_vacios.text': 'Se escuchan pasos en los pasillos incluso cuando están vacíos. Los más viejos del castillo dicen que son los antiguos reyes que aún vigilan.',
    'story.ley_sombra_armeria.text': 'Una sombra se mueve entre las armaduras de la armería por las noches. No pertenece a nadie... al menos a nadie vivo.',
    'story.ley_llama_cocina.text': 'La llama del horno principal de la cocina nunca se ha apagado. Los cocineros dicen que lleva encendida desde que se fundó el castillo.',

    // ── CHISMES ACTUALES ───────────────────────
    'story.chi_dama_capitan.text': 'La dama de la corte discutió acaloradamente con el capitán de la guardia ayer. Nadie sabe el motivo, pero ambos se evitan desde entonces.',
    'story.chi_cocinero_ingredientes.text': 'El cocinero guarda ingredientes que no aparecen en los registros oficiales. Dice que son "especias exóticas", pero las esconde como si fueran otra cosa.',
    'story.chi_guardia_mazmorras.text': 'Un guardia fue visto bajando a las mazmorras a una hora inusual, llevando una cesta tapada. Cuando le preguntaron, dijo que era su almuerzo.',
    'story.chi_embajador_biblioteca.text': 'El embajador ha sido visto visitando la biblioteca a horas muy tardías. Buscaba algo específico, pero no dijo qué.',
    'story.chi_bufon_llora.text': 'Alguien vio al bufón llorando en los jardines cuando creía que estaba solo. Al notar la presencia, volvió a sonreír como si nada.',
    'story.chi_sirvientes_noche.text': 'Los sirvientes se reúnen en secreto por las noches en la cocina. Dicen que solo juegan a los dados, pero siempre callan cuando alguien se acerca.',
    'story.chi_consejero_ausente.text': 'Uno de los consejeros faltó a las últimas tres reuniones del consejo. Su excusa fue diferente cada vez.',
    'story.chi_reina_discusion.text': 'La reina fue escuchada discutiendo con alguien en la capilla, pero cuando entraron solo estaba ella. Dijo que "rezaba en voz alta".',
    'story.chi_alquimista_humo.text': 'Un humo púrpura salió de la torre del mago en mitad de la noche. Al día siguiente el alquimista tenía las cejas chamuscadas.',
    'story.chi_capitan_armeria.text': 'El capitán de la guardia fue visto afilando una daga en la armería a altas horas. No es inusual, pero parecía... nervioso.',

    // ── SERIES: El Secreto del Alquimista ──────
    'story.serie_alq_1.text': 'En un rincón polvoriento de la torre, encuentras una nota del alquimista: "He descubierto algo que no debería existir. Debo ocultarlo donde nadie buscaría".',
    'story.serie_alq_2.text': 'Un libro en la biblioteca tiene anotaciones al margen del alquimista: "Los textos antiguos confirman mis sospechas. La fórmula funciona, pero el precio es demasiado alto".',
    'story.serie_alq_3.text': 'En lo más profundo de las mazmorras, detrás de una piedra suelta, hay un frasco sellado con una sustancia brillante y una nota: "Si estás leyendo esto, ya es demasiado tarde. O demasiado pronto".',

    // ── SERIES: La Reina Perdida ───────────────
    'story.serie_reina_1.text': 'En la capilla hay una placa conmemorativa dedicada a una reina cuyo nombre ha sido borrado. Las fechas indican que reinó solo un año.',
    'story.serie_reina_2.text': 'Detrás de un tapiz del Salón del Trono hay un retrato oculto de una mujer con corona. En el reverso, una sola palabra: "Perdonadme".',

    // ── SERIES: Diario del Bufón ───────────────
    'story.serie_bufon_1.text': 'Encuentras una página suelta del diario del bufón: "Día 47. Me siento cerca del trono y nadie me mira. Pero yo lo veo todo. Absolutamente todo".',
    'story.serie_bufon_2.text': 'Otra página del diario aparece escondida en la cocina: "Día 112. Los sirvientes hablan cuando creen que nadie escucha. He aprendido más aquí que en cualquier sala del consejo".',
    'story.serie_bufon_3.text': 'La última página del diario, doblada entre las hojas de un arbusto del jardín: "Día 200. Sé demasiado. La risa es mi escudo, pero incluso los escudos se rompen".'
});
