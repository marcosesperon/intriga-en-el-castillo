// ─────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────

const GameState = {
    solution: { conspirador:null, metodo:null, lugar:null, motivo:null },
    players: [],
    currentPlayerIndex: 0,
    phase: PHASES.ROLL_DICE,
    diceValue: 0,
    movesRemaining: 0,
    activeSuspicion: null,
    log: [],
    totalPlayers: 4,
    gameOver: false,
    winner: null,
    helpEnabled: false,
    manualNotebook: false,

    additionalRooms: [],

    selectAdditionalRooms(rng) {
        const count = 8 + Math.floor(rng() * 9); // 8-16 additional rooms
        const catalog = [...ADDITIONAL_ROOM_CATALOG];
        // Weighted shuffle: multiply weight into random score
        catalog.sort((a, b) => (rng() * b.weight) - (rng() * a.weight));
        const selected = catalog.slice(0, count);
        this.additionalRooms = selected.map((def, i) => ({
            index: CORE_ROOM_COUNT + i,
            catalogId: def.id,
            def: def
        }));
        return this.additionalRooms.length;
    },

    getAdditionalRoom(index) {
        if (index < CORE_ROOM_COUNT) return null;
        return this.additionalRooms[index - CORE_ROOM_COUNT] || null;
    },

    init(numPlayers) {
        // Select additional rooms first (needed by CastleLayout for sizing)
        this.additionalRooms = [];
        const selectionRng = typeof CastleLayout !== 'undefined'
            ? CastleLayout._mulberry32(Date.now()) : null;
        const additionalCount = selectionRng ? this.selectAdditionalRooms(selectionRng) : 0;

        // Generate procedural castle layout
        if (typeof CastleLayout !== 'undefined') {
            CastleLayout.generate(null, additionalCount);
            CONNECTIONS = CastleLayout.current.connections;
            SECRET_PASSAGES = CastleLayout.current.secretPassages;
        }

        this.totalPlayers = numPlayers;
        this.gameOver = false;
        this.winner = null;
        this.currentPlayerIndex = 0;
        this.phase = PHASES.ROLL_DICE;
        this.diceValue = 0;
        this.movesRemaining = 0;
        this.activeSuspicion = null;
        this.log = [];
        this.players = [];
        this.roundNumber = 1;
        this.turnCounter = 0;
        this.activeEvent = null;
        this.eventBlockedPassages = false;
        this.eventBlockedRooms = [];
        this.eventDicePenalty = 0;
        this.eventMaxMovement = 0;
        this.eventTempConnections = [];
        this.eventSkipTurn = [];
        this.eventSocialBlock = false;
        this.eventDeck = [];
        this._eventResultText = null;
        this._eventDeclarations = null;
        this.clueLog = [];
        this.roomActionUsedThisTurn = false;
        this._pendingEvent = false;
        this.chaosLevel = 0;
        this.comboNextEventId = null;
        this._timePeriodChanged = null;

        // Narrative events state
        this.activeNarrativeEvents = [];
        this.narrativeBlockedRooms = [];
        this.narrativeDicePenalty = 0;
        this.narrativeSocialBlock = false;
        this.narrativeHidePositions = false;
        this.narrativeRoomOverrides = {};
        this.narrativeBonusClueAllRooms = false;
        this.narrativeChaoticoBonus = 0;
        this._pendingNarrativeStart = null;
        this._narrativeResolutions = [];
        this._narrativePerTurnTexts = [];

        // One event per turn limit
        this.eventFiredThisTurn = false;

        // Inventory system
        this.roomTraps = {};  // {roomIdx: placedByPlayerId}

        const playerNames = getPlayerNames();
        const humanColorIdx = (typeof Menu !== 'undefined' && Menu.selectedColorIndex != null) ? Menu.selectedColorIndex : 0;
        const humanName = (typeof Menu !== 'undefined' && Menu.playerName) ? Menu.playerName : playerNames[0];
        const botColors = SELECTABLE_COLORS.filter((_, i) => i !== humanColorIdx);
        for (let i = 0; i < numPlayers; i++) {
            const isHuman = i === 0;
            this.players.push({
                id: i,
                name: isHuman ? humanName : playerNames[i],
                isHuman: isHuman,
                isEliminated: false,
                roomIndex: THRONE_ROOM_INDEX,
                cards: [],
                notebook: this.createEmptyNotebook(),
                notebookNotes: {},
                seenCards: [],
                color: isHuman ? SELECTABLE_COLORS[humanColorIdx].css : botColors[i - 1].css,
                colorHex: isHuman ? SELECTABLE_COLORS[humanColorIdx].hex : botColors[i - 1].hex,
                reputation: 0,
                // Inventory
                inventory: [],
                itemActionUsedThisTurn: false,
                itemBlindedBy: null,
                itemAnilloPowerTurns: 0,
                bootsBonusActive: false,
                mapSecretoActive: false,
                dadoTrucadoActive: false,
                cloakActive: false,
                mascaraActive: false
            });
        }

        Reputation.init();

        this.solution = {
            conspirador: this.randomFrom(CARDS.conspiradores),
            metodo: this.randomFrom(CARDS.metodos),
            lugar: this.randomFrom(CARDS.lugares),
            motivo: this.randomFrom(CARDS.motivos)
        };

        let deck = [
            ...CARDS.conspiradores, ...CARDS.metodos,
            ...CARDS.lugares, ...CARDS.motivos
        ].filter(c =>
            c !== this.solution.conspirador && c !== this.solution.metodo &&
            c !== this.solution.lugar && c !== this.solution.motivo
        );
        this.shuffle(deck);

        let idx = 0;
        for (let c of deck) {
            this.players[idx % numPlayers].cards.push(c);
            idx++;
        }

        for (let p of this.players) {
            for (let card of p.cards) {
                // Own cards are always marked — manual notebook only affects deduced clues
                p.notebook[card] = 'X';
                if (!p.seenCards.includes(card)) p.seenCards.push(card);
            }
        }

        this.addLog(t('log.gameStarted', { count: numPlayers }));
    },

    createEmptyNotebook() {
        const nb = {};
        const all = [...CARDS.conspiradores,...CARDS.metodos,...CARDS.lugares,...CARDS.motivos];
        for (let c of all) nb[c] = '?';
        return nb;
    },

    currentPlayer() { return this.players[this.currentPlayerIndex]; },

    nextPlayerIndex(fromIndex) {
        let next = (fromIndex + 1) % this.totalPlayers;
        let count = 0;
        while (this.players[next].isEliminated && count < this.totalPlayers) {
            next = (next + 1) % this.totalPlayers;
            count++;
        }
        return next;
    },

    advanceTurn() {
        const prevIndex = this.currentPlayerIndex;
        this.currentPlayerIndex = this.nextPlayerIndex(this.currentPlayerIndex);
        this.phase = PHASES.ROLL_DICE;
        this.diceValue = 0;
        this.movesRemaining = 0;
        this.activeSuspicion = null;
        this.roomActionUsedThisTurn = false;
        this.eventFiredThisTurn = false;
        this.turnCounter++;

        // Reset item per-turn flags for the player whose turn just ended
        const prevPlayer = this.players[prevIndex];
        if (prevPlayer) {
            prevPlayer.itemActionUsedThisTurn = false;
            prevPlayer.bootsBonusActive = false;
            prevPlayer.mapSecretoActive = false;
            prevPlayer.dadoTrucadoActive = false;
            prevPlayer.cloakActive = false;
            prevPlayer.mascaraActive = false;
            if (prevPlayer.itemAnilloPowerTurns > 0) prevPlayer.itemAnilloPowerTurns--;
            if (prevPlayer.itemBlindedBy !== null) prevPlayer.itemBlindedBy = null;
        }

        // Detect new round (for display)
        if (this.currentPlayerIndex <= prevIndex) {
            const prevPeriodIdx = Math.floor(((this.roundNumber - 1) < 0 ? 0 : this.roundNumber - 1) / TIME_PERIOD_ROUNDS) % TIME_PERIODS.length;
            this.roundNumber++;
            const newPeriodIdx = Math.floor((this.roundNumber - 1) / TIME_PERIOD_ROUNDS) % TIME_PERIODS.length;
            if (prevPeriodIdx !== newPeriodIdx) {
                this._timePeriodChanged = TIME_PERIODS[newPeriodIdx];
            }
        }

        // Tick narrative events (decrement timers, apply per-turn effects, resolve expired)
        this.tickNarrativeEvents();

        // Random event with 1/8 probability each turn, or forced by combo
        if (this.comboNextEventId != null || (this.turnCounter > 0 && Math.random() < 1 / 8)) {
            this._pendingEvent = true;
            this.activeEvent = null;
            this.eventBlockedPassages = false;
            this.eventBlockedRooms = [];
            this.eventDicePenalty = 0;
            this.eventMaxMovement = 0;
            this.eventTempConnections = [];
            this.eventSocialBlock = false;
            this._eventResultText = null;
            this._eventDeclarations = null;
        }

        const alive = this.players.filter(p => !p.isEliminated);
        if (alive.length === 1) {
            this.gameOver = true;
            this.winner = alive[0];
        }
    },

    getTimePeriod() {
        const idx = Math.floor((this.roundNumber - 1) / TIME_PERIOD_ROUNDS) % TIME_PERIODS.length;
        return TIME_PERIODS[idx];
    },

    getTimePeriodIndex() {
        return Math.floor((this.roundNumber - 1) / TIME_PERIOD_ROUNDS) % TIME_PERIODS.length;
    },

    // ─── Narrative Events ──────────────────────────────

    tickNarrativeEvents() {
        this._narrativeResolutions = [];
        this._narrativePerTurnTexts = [];
        this._pendingNarrativeStart = null;

        // Tick existing narrative events
        for (let i = this.activeNarrativeEvents.length - 1; i >= 0; i--) {
            const ne = this.activeNarrativeEvents[i];
            ne.turnsRemaining--;
            // Per-turn effect
            const ptText = this._applyNarrativePerTurn(ne);
            if (ptText) this._narrativePerTurnTexts.push(ptText);

            if (ne.turnsRemaining <= 0) {
                // Resolve
                const resText = this._resolveNarrative(ne);
                this._narrativeResolutions.push({ def: ne.def, text: resText });
                this.activeNarrativeEvents.splice(i, 1);
            }
        }

        // Recalculate consolidated effects
        this._recalcNarrativeEffects();

        // Check for new narrative event
        if (this.activeNarrativeEvents.length < MAX_ACTIVE_NARRATIVES) {
            const phase = this.turnCounter <= 3 ? 'early' : this.turnCounter <= 7 ? 'mid' : 'late';
            const prob = NARRATIVE_EVENT_PROB[phase] || 0;
            if (prob > 0 && Math.random() < prob) {
                const drawn = this._drawNarrativeEvent();
                if (drawn) {
                    this.activeNarrativeEvents.push({ def: drawn, turnsRemaining: drawn.duration });
                    this._pendingNarrativeStart = drawn;
                    this._recalcNarrativeEffects();
                    this.addLog(t('log.narrativeStarted', { name: t('narrative.' + drawn.id + '.name'), turns: drawn.duration }));
                }
            }
        }

        // Log per-turn texts
        for (const txt of this._narrativePerTurnTexts) {
            this.addLog(txt);
        }
        // Log resolutions
        for (const res of this._narrativeResolutions) {
            this.addLog(t('log.narrativeResolved', { name: t('narrative.' + res.def.id + '.name'), text: res.text }));
        }
    },

    _drawNarrativeEvent() {
        const activeIds = new Set(this.activeNarrativeEvents.map(ne => ne.def.id));
        const activeCats = new Set(this.activeNarrativeEvents.map(ne => ne.def.category));
        // Filter: not active, prefer different category
        let candidates = NARRATIVE_EVENTS.filter(e => !activeIds.has(e.id) && !activeCats.has(e.category));
        if (candidates.length === 0) {
            candidates = NARRATIVE_EVENTS.filter(e => !activeIds.has(e.id));
        }
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    },

    _recalcNarrativeEffects() {
        this.narrativeBlockedRooms = [];
        this.narrativeDicePenalty = 0;
        this.narrativeSocialBlock = false;
        this.narrativeHidePositions = false;
        this.narrativeRoomOverrides = {};
        this.narrativeBonusClueAllRooms = false;
        this.narrativeChaoticoBonus = 0;

        for (const ne of this.activeNarrativeEvents) {
            const d = ne.def;
            for (const r of d.blockedRooms) {
                if (!this.narrativeBlockedRooms.includes(r)) this.narrativeBlockedRooms.push(r);
            }
            if (d.dicePenalty > this.narrativeDicePenalty) this.narrativeDicePenalty = d.dicePenalty;
            if (d.socialBlock) this.narrativeSocialBlock = true;
            if (d.hidePositions) this.narrativeHidePositions = true;
            if (d.bonusClueAllRooms) this.narrativeBonusClueAllRooms = true;
            if (d.chaoticoBonus) this.narrativeChaoticoBonus += d.chaoticoBonus;
            if (d.roomOverride) {
                this.narrativeRoomOverrides[d.roomOverride.room] = {
                    effectFilter: d.roomOverride.effectFilter || null
                };
            }
        }

        // Move players out of newly blocked rooms
        for (const ri of this.narrativeBlockedRooms) {
            for (const p of this.players) {
                if (p.isEliminated || p.roomIndex !== ri) continue;
                const adj = CONNECTIONS[ri].filter(t => !this.narrativeBlockedRooms.includes(t) && !this.eventBlockedRooms.includes(t));
                if (adj.length > 0) p.roomIndex = adj[Math.floor(Math.random() * adj.length)];
            }
        }
    },

    _applyNarrativePerTurn(ne) {
        const d = ne.def;
        switch (d.id) {
            case 'narr_investigacion_real': {
                // Random player must reveal a card category yes/no
                const alive = this.players.filter(p => !p.isEliminated);
                const target = alive[Math.floor(Math.random() * alive.length)];
                const categories = ['conspiradores', 'metodos', 'lugares', 'motivos'];
                const cat = categories[Math.floor(Math.random() * categories.length)];
                const hasCard = target.cards.some(c => CARDS[cat].includes(c));
                return t('narrative.narr_investigacion_real.perTurn', {
                    player: target.name, category: t('cat.' + cat), answer: hasCard ? t('yes') : t('no')
                });
            }
            case 'narr_caceria_traidores': {
                // Players with rep <= 0 lose -1 rep
                const penalized = [];
                for (const p of this.players) {
                    if (p.isEliminated) continue;
                    if (p.reputation <= 0) {
                        Reputation.change(p.id, -1);
                        penalized.push(p.name);
                    }
                }
                if (penalized.length > 0) {
                    return t('narrative.narr_caceria_traidores.perTurn', { players: penalized.join(', ') });
                }
                return null;
            }
            case 'narr_fuga_mazmorras': {
                // Random player moved to random room
                const alive = this.players.filter(p => !p.isEliminated);
                const target = alive[Math.floor(Math.random() * alive.length)];
                const rooms = Array.from({ length: getTotalRoomCount() }, (_, i) => i).filter(r =>
                    !this.narrativeBlockedRooms.includes(r) && !this.eventBlockedRooms.includes(r));
                const newRoom = rooms[Math.floor(Math.random() * rooms.length)];
                target.roomIndex = newRoom;
                return t('narrative.narr_fuga_mazmorras.perTurn', {
                    player: target.name, room: tr(newRoom)
                });
            }
            default:
                return null;
        }
    },

    _resolveNarrative(ne) {
        const d = ne.def;
        switch (d.id) {
            case 'narr_tormenta': {
                const clue = this.generateEvidence();
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_tormenta.resolution') + ' ' + clue.text;
            }
            case 'narr_niebla': {
                const clue = this.generateRumor(true);
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_niebla.resolution') + ' ' + clue.text;
            }
            case 'narr_incendio_ala': {
                const clue = this.generateEvidence();
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_incendio_ala.resolution') + ' ' + clue.text;
            }
            case 'narr_investigacion_real': {
                const alive = this.players.filter(p => !p.isEliminated);
                const best = alive.reduce((a, b) => a.reputation >= b.reputation ? a : b);
                Reputation.change(best.id, 1);
                return t('narrative.narr_investigacion_real.resolution', { player: best.name });
            }
            case 'narr_consejo_emergencia': {
                const clue = this.generateEvidence();
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_consejo_emergencia.resolution') + ' ' + clue.text;
            }
            case 'narr_caceria_traidores': {
                const alive = this.players.filter(p => !p.isEliminated);
                const worst = alive.reduce((a, b) => a.reputation <= b.reputation ? a : b);
                if (worst.cards.length > 0) {
                    const card = worst.cards[Math.floor(Math.random() * worst.cards.length)];
                    for (const p of this.players) {
                        if (!p.isEliminated && !p.seenCards.includes(card)) p.seenCards.push(card);
                    }
                    return t('narrative.narr_caceria_traidores.resolution', { player: worst.name, card: tc(card) });
                }
                return t('narrative.narr_caceria_traidores.resolution', { player: worst.name, card: '?' });
            }
            case 'narr_archivos_secretos': {
                const clue = this.generateEvidence();
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_archivos_secretos.resolution') + ' ' + clue.text;
            }
            case 'narr_testigo_protegido': {
                const isTrue = Math.random() < 0.5;
                const clue = isTrue ? this.generateEvidence() : this.generateRumor(false);
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_testigo_protegido.resolution') + ' ' + clue.text;
            }
            case 'narr_analisis_alquimico': {
                // Reveal a non-solution method card
                const methodCards = CARDS.metodos.filter(c => c !== this.solution.metodo);
                if (methodCards.length > 0) {
                    const card = methodCards[Math.floor(Math.random() * methodCards.length)];
                    const clue = { text: t('clue.notMethod', { card: tc(card) }), card: card, type: 'evidence', category: 'metodos', value: false };
                    for (const p of this.players) {
                        if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                    }
                    this.addClue(-1, clue);
                    return t('narrative.narr_analisis_alquimico.resolution') + ' ' + clue.text;
                }
                return t('narrative.narr_analisis_alquimico.resolution');
            }
            case 'narr_fuga_mazmorras': {
                // Evidence for players in dungeon (room 8)
                const inDungeon = this.players.filter(p => !p.isEliminated && p.roomIndex === 8);
                if (inDungeon.length > 0) {
                    const clue = this.generateEvidence();
                    for (const p of inDungeon) {
                        this.applyClueToNotebook(p.id, clue);
                    }
                    this.addClue(-1, clue);
                    return t('narrative.narr_fuga_mazmorras.resolution', { players: inDungeon.map(p => p.name).join(', ') }) + ' ' + clue.text;
                }
                return t('narrative.narr_fuga_mazmorras.resolutionNone');
            }
            case 'narr_ritual_prohibido': {
                const clue = this.generateEvidence();
                for (const p of this.players) {
                    if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                }
                this.addClue(-1, clue);
                return t('narrative.narr_ritual_prohibido.resolution') + ' ' + clue.text;
            }
            case 'narr_oscuridad_total': {
                const clues = [];
                for (let i = 0; i < 2; i++) {
                    const clue = this.generateRumor(true);
                    clues.push(clue);
                    for (const p of this.players) {
                        if (!p.isEliminated) this.applyClueToNotebook(p.id, clue);
                    }
                    this.addClue(-1, clue);
                }
                return t('narrative.narr_oscuridad_total.resolution') + ' ' + clues.map(c => c.text).join('; ');
            }
            default:
                return '';
        }
    },

    rollDice(chosenValue) {
        const cp = this.currentPlayer();
        // Dado trucado: use chosen value instead of random
        if (chosenValue != null) {
            this.diceValue = chosenValue;
        } else {
            this.diceValue = Math.floor(Math.random() * 6) + 1;
        }
        let effective = this.diceValue - this.eventDicePenalty - this.narrativeDicePenalty;
        // Reliquia antigua: passive +1 while in inventory
        if (cp && typeof Inventory !== 'undefined' && Inventory.playerHasItem(cp.id, 'reliquia_antigua')) {
            effective += 1;
        }
        // Botas de sigilo: +2 movement bonus
        if (cp && cp.bootsBonusActive) {
            effective += 2;
        }
        if (effective < 1) effective = 1;
        if (this.eventMaxMovement > 0 && effective > this.eventMaxMovement) {
            effective = this.eventMaxMovement;
        }
        this.movesRemaining = effective;
        this.phase = PHASES.MOVING;
        return this.diceValue;
    },

    canMoveTo(pi, target) {
        if (this.eventBlockedRooms.includes(target) || this.narrativeBlockedRooms.includes(target)) return false;
        // Mapa secreto: can move to any room
        if (this.players[pi].mapSecretoActive) return true;
        const cur = this.players[pi].roomIndex;
        if (CONNECTIONS[cur].includes(target)) return true;
        for (let tc of (this.eventTempConnections || [])) {
            if ((tc.from === cur && tc.to === target) || (tc.to === cur && tc.from === target)) return true;
        }
        return false;
    },
    canUseSecretPassage(pi) {
        if (this.eventBlockedPassages) return false;
        return SECRET_PASSAGES[this.players[pi].roomIndex] !== undefined;
    },
    getSecretPassageTarget(pi) { return SECRET_PASSAGES[this.players[pi].roomIndex]; },

    movePlayer(pi, target) {
        this.players[pi].roomIndex = target;
        this.movesRemaining--;
    },

    useSecretPassage(pi) {
        this.players[pi].roomIndex = this.getSecretPassageTarget(pi);
        this.movesRemaining = 0;
    },

    getReachableRooms(pi) {
        const cur = this.players[pi].roomIndex;
        const allBlocked = [...this.eventBlockedRooms, ...this.narrativeBlockedRooms];
        // Mapa secreto: all non-blocked rooms reachable
        if (this.players[pi].mapSecretoActive) {
            const total = getTotalRoomCount();
            return Array.from({ length: total }, (_, i) => i).filter(i => i !== cur && !allBlocked.includes(i));
        }
        let r = CONNECTIONS[cur].filter(t => !allBlocked.includes(t));
        if (this.canUseSecretPassage(pi)) {
            const spTarget = SECRET_PASSAGES[cur];
            if (!allBlocked.includes(spTarget)) r.push(spTarget);
        }
        for (let tc of (this.eventTempConnections || [])) {
            if (tc.from === cur && !r.includes(tc.to) && !allBlocked.includes(tc.to)) r.push(tc.to);
            if (tc.to === cur && !r.includes(tc.from) && !allBlocked.includes(tc.from)) r.push(tc.from);
        }
        return r;
    },

    findRefutingCards(pi, sus) {
        return this.players[pi].cards.filter(c =>
            c === sus.conspirador || c === sus.metodo || c === sus.lugar || c === sus.motivo
        );
    },

    markCardSeen(pi, card, isSolution) {
        const p = this.players[pi];
        if (!p.seenCards.includes(card)) p.seenCards.push(card);
        if (this.manualNotebook && pi === 0) return;
        p.notebook[card] = isSolution ? 'O' : 'X';
    },

    checkAccusation(acc) {
        return acc.conspirador === this.solution.conspirador &&
            acc.metodo === this.solution.metodo &&
            acc.lugar === this.solution.lugar &&
            acc.motivo === this.solution.motivo;
    },

    addLog(msg) { this.log.push(msg); },

    getSolutionForCategory(cat) {
        const map = { conspiradores: 'conspirador', metodos: 'metodo', lugares: 'lugar', motivos: 'motivo' };
        return this.solution[map[cat]];
    },

    getCategoryLabel(cat) {
        return t('cat.' + cat);
    },

    getCategoryKey(cat) {
        const map = { conspiradores: 'conspiradores', metodos: 'metodos', lugares: 'lugares', motivos: 'motivos' };
        return map[cat] || cat;
    },

    generateRumor(flavorRoom) {
        const categories = ['conspiradores', 'metodos', 'lugares', 'motivos'];
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const cards = CARDS[cat];
        const solution = this.getSolutionForCategory(cat);
        const isTruth = Math.random() < 0.7;
        let text, cardMentioned;
        if (isTruth) {
            const nonSolution = cards.filter(c => c !== solution);
            cardMentioned = nonSolution[Math.floor(Math.random() * nonSolution.length)];
            text = t('clue.notSolution', { card: tc(cardMentioned) });
        } else {
            cardMentioned = solution;
            text = t('clue.notSolution', { card: tc(solution) });
        }
        const flavor = flavorRoom === 6 ? t('clue.servantWhispers') : t('clue.hallwayRumor');
        return { type: 'rumor', text: flavor + '"' + text + '"', isTruth, cat, cardMentioned, round: this.roundNumber };
    },

    generateEvidence(restrictCategory) {
        const allCats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
        const categories = restrictCategory ? [restrictCategory] : allCats;
        const cp = this.currentPlayer();
        const notebook = cp ? cp.notebook : {};

        // Intentar hasta 3 veces elegir una categoría con información nueva disponible
        let cat, nonSolution, freshCards;
        let attempts = 0;
        do {
            cat = categories[Math.floor(Math.random() * categories.length)];
            const solution = this.getSolutionForCategory(cat);
            nonSolution = CARDS[cat].filter(c => c !== solution);
            freshCards = nonSolution.filter(c => notebook[c] !== 'X');
            attempts++;
        } while (freshCards.length === 0 && attempts < (restrictCategory ? 1 : 3));

        const solution = this.getSolutionForCategory(cat);
        nonSolution = CARDS[cat].filter(c => c !== solution);
        // Preferir cartas no vistas; si no hay, usar el pool completo
        const pool = freshCards && freshCards.length > 0 ? freshCards : nonSolution;

        if (Math.random() < 0.6) {
            if (pool.length === 0) {
                return { type: 'evidencia', text: t('clue.solutionOf', { category: this.getCategoryLabel(cat), card: tc(solution) }), cat, card: solution, isReveal: true, round: this.roundNumber };
            }
            const card = pool[Math.floor(Math.random() * pool.length)];
            return { type: 'evidencia', text: t('clue.notSolutionVerified', { card: tc(card) }), cat, card, isReveal: false, round: this.roundNumber };
        } else {
            return { type: 'evidencia', text: t('clue.solutionOf', { category: this.getCategoryLabel(cat), card: tc(solution) }), cat, card: solution, isReveal: true, round: this.roundNumber };
        }
    },

    generateArchive(cat) {
        const cp = this.currentPlayer();
        const notebook = cp ? cp.notebook : {};
        const solution = this.getSolutionForCategory(cat);
        const nonSolution = CARDS[cat].filter(c => c !== solution);
        if (nonSolution.length === 0) {
            return { type: 'archivo', text: t('clue.archivesNoReveal', { category: this.getCategoryLabel(cat) }), cat, card: null, round: this.roundNumber };
        }
        // Preferir cartas aún desconocidas ('?') para evitar información redundante
        const freshCards = nonSolution.filter(c => notebook[c] !== 'X');
        const pool = freshCards.length > 0 ? freshCards : nonSolution;
        const card = pool[Math.floor(Math.random() * pool.length)];
        return { type: 'archivo', text: t('clue.documentsConfirm', { card: tc(card) }), cat, card, round: this.roundNumber };
    },

    applyClueToNotebook(playerId, clue) {
        const p = this.players[playerId];
        if (!clue.card) return;
        if (clue.type === 'evidencia') {
            if (!p.seenCards.includes(clue.card)) p.seenCards.push(clue.card);
            if (this.manualNotebook && playerId === 0) return;
            if (clue.isReveal) {
                p.notebook[clue.card] = 'O';
            } else {
                p.notebook[clue.card] = 'X';
            }
        } else if (clue.type === 'archivo') {
            if (!p.seenCards.includes(clue.card)) p.seenCards.push(clue.card);
            if (this.manualNotebook && playerId === 0) return;
            p.notebook[clue.card] = 'X';
        }
    },

    addClue(playerId, clue) {
        clue.playerId = playerId;
        this.clueLog.push(clue);
    },

    drawEvent() {
        return this.drawEventDynamic();
    },

    drawEventDynamic() {
        // Combo override: forced next event
        if (this.comboNextEventId != null) {
            const evt = EVENTS.find(e => e.id === this.comboNextEventId);
            this.comboNextEventId = null;
            if (evt) return evt;
        }
        // Refill deck if empty
        if (!this.eventDeck || this.eventDeck.length === 0) {
            this.eventDeck = [...Array(EVENTS.length).keys()];
            this.shuffle(this.eventDeck);
        }
        // Determine game phase
        const phase = this.turnCounter <= 3 ? 'early' : this.turnCounter <= 7 ? 'mid' : 'late';
        const weights = { ...EVENT_PHASE_WEIGHTS[phase] };
        // Time-period weight modifiers
        const tpWeights = TIME_PERIOD_EVENT_WEIGHTS[this.getTimePeriod()];
        if (tpWeights) {
            for (const cat in tpWeights) {
                weights[cat] = Math.max(0, (weights[cat] || 0) + tpWeights[cat]);
            }
        }
        // Dynamic adjustments
        if (this.chaosLevel >= 2) weights.caotico = (weights.caotico || 0) + 15;
        if (this.narrativeChaoticoBonus > 0) weights.caotico = (weights.caotico || 0) + this.narrativeChaoticoBonus;
        const avgRep = this.players.filter(p => !p.isEliminated).reduce((s, p) => s + p.reputation, 0) / Math.max(1, this.players.filter(p => !p.isEliminated).length);
        if (avgRep < -1) weights.social = (weights.social || 0) + 10;
        if (this.clueLog.length < 5) weights.investigacion = (weights.investigacion || 0) + 10;
        // Weighted random category
        const cat = this._weightedRandomCategory(weights);
        // Find an event of this category in the deck
        const idx = this.eventDeck.findIndex(i => EVENTS[i].category === cat);
        if (idx >= 0) {
            return EVENTS[this.eventDeck.splice(idx, 1)[0]];
        }
        // Fallback: pop any event
        return EVENTS[this.eventDeck.pop()];
    },

    _weightedRandomCategory(weights) {
        const cats = Object.keys(weights);
        const total = cats.reduce((s, c) => s + weights[c], 0);
        if (total <= 0) return cats[0];
        let r = Math.random() * total;
        for (const c of cats) {
            r -= weights[c];
            if (r <= 0) return c;
        }
        return cats[cats.length - 1];
    },

    drawMajorEvent() {
        return MAJOR_EVENTS[Math.floor(Math.random() * MAJOR_EVENTS.length)];
    },

    applyMajorEventAuto(event) {
        this.activeEvent = event;
        this._eventResultText = null;
        switch (event.effect) {
            case 'revuelta': {
                // All players move to random different rooms
                const totalR = getTotalRoomCount();
                const rooms = Array.from({ length: totalR }, (_, i) => i);
                this.shuffle(rooms);
                const alive = this.players.filter(p => !p.isEliminated);
                alive.forEach((p, i) => { p.roomIndex = rooms[i % totalR]; });
                this._eventResultText = t('major.result.revuelta');
                break;
            }
            case 'asalto_mazmorras': {
                // Reveal 2 public evidence clues for all players
                const clue1 = this.generateEvidence();
                const clue2 = this.generateEvidence();
                for (const p of this.players) {
                    if (p.isEliminated) continue;
                    this.applyClueToNotebook(p.id, clue1);
                    this.applyClueToNotebook(p.id, clue2);
                }
                this.addClue(-1, clue1);
                this.addClue(-1, clue2);
                this._eventResultText = t('major.result.asalto', { clue1: clue1.text, clue2: clue2.text });
                if (this.players[0] && !this.players[0].isEliminated) {
                    UI.initCards();
                }
                break;
            }
            case 'intriga_real': {
                // 2 random players exchange a card
                const alive = this.players.filter(p => !p.isEliminated && p.cards.length > 0);
                if (alive.length >= 2) {
                    const shuffled = [...alive];
                    this.shuffle(shuffled);
                    const p1 = shuffled[0], p2 = shuffled[1];
                    const c1 = p1.cards[Math.floor(Math.random() * p1.cards.length)];
                    const c2 = p2.cards[Math.floor(Math.random() * p2.cards.length)];
                    p1.cards = p1.cards.filter(c => c !== c1);
                    p2.cards = p2.cards.filter(c => c !== c2);
                    p1.cards.push(c2);
                    p2.cards.push(c1);
                    this.markCardSeen(p1.id, c2);
                    this.markCardSeen(p2.id, c1);
                    this._eventResultText = t('major.result.intriga', { p1: p1.name, p2: p2.name });
                    if (p1.isHuman || p2.isHuman) UI.initCards();
                }
                break;
            }
            case 'noche_tormenta': {
                // Add all diagonal connections temporarily
                const diagonals = [
                    { from: 0, to: 4 }, { from: 4, to: 0 },
                    { from: 2, to: 4 }, { from: 4, to: 2 },
                    { from: 4, to: 6 }, { from: 6, to: 4 },
                    { from: 4, to: 8 }, { from: 8, to: 4 },
                    { from: 0, to: 8 }, { from: 8, to: 0 },
                    { from: 2, to: 6 }, { from: 6, to: 2 }
                ];
                this.eventTempConnections = diagonals;
                this._eventResultText = t('major.result.tormenta');
                break;
            }
            case 'juicio_real': {
                // A random player must reveal a card (handled interactively)
                const alive = this.players.filter(p => !p.isEliminated && p.cards.length > 0);
                if (alive.length > 0) {
                    this._juicioTarget = alive[Math.floor(Math.random() * alive.length)];
                    this._eventResultText = t('major.result.juicio', { name: this._juicioTarget.name });
                } else {
                    this._eventResultText = t('major.result.juicioNoTarget');
                }
                break;
            }
        }
    },

    drawRoomEvent(roomIndex) {
        const pool = getRoomEvents(roomIndex);
        if (!pool || pool.length === 0) return null;
        // Narrative override: guaranteed room event
        const override = this.narrativeRoomOverrides[roomIndex];
        if (override) {
            if (override.effectFilter) {
                const filtered = pool.filter(e => e.effect === override.effectFilter);
                if (filtered.length > 0) return filtered[Math.floor(Math.random() * filtered.length)];
            }
            return pool[Math.floor(Math.random() * pool.length)];
        }
        const tpMult = TIME_PERIOD_INVESTIGATION_BONUS[this.getTimePeriod()] || 1.0;
        if (Math.random() > 0.15 * tpMult) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    applyRoomEventAuto(roomEvt, roomIndex) {
        const cp = this.currentPlayer();
        this._roomEventResultText = null;
        switch (roomEvt.effect) {
            case 'bonus_clue': {
                const clue = this.generateEvidence();
                this.applyClueToNotebook(cp.id, clue);
                this.addClue(cp.id, clue);
                this._roomEventResultText = clue.text;
                break;
            }
            case 'reveal_card': {
                const others = this.players.filter(p => p.id !== cp.id && !p.isEliminated && p.cards.length > 0);
                if (others.length > 0) {
                    const target = others[Math.floor(Math.random() * others.length)];
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    this.markCardSeen(cp.id, card);
                    this._roomEventResultText = t('roomEvent.result.reveal', { target: target.name, card: tc(card) });
                }
                break;
            }
            case 'movement_bonus': {
                this.movesRemaining = (this.movesRemaining || 0) + 1;
                this._roomEventResultText = t('roomEvent.result.moveBonus');
                break;
            }
            case 'movement_block': {
                this.eventBlockedRooms.push(roomIndex);
                this._roomEventResultText = t('roomEvent.result.blocked', { room: tr(roomIndex) });
                break;
            }
            case 'rep_plus': {
                Reputation.change(cp.id, 1);
                this._roomEventResultText = t('roomEvent.result.repPlus');
                break;
            }
            case 'rep_minus': {
                Reputation.change(cp.id, -1);
                this._roomEventResultText = t('roomEvent.result.repMinus');
                break;
            }
            case 'flavor':
            default:
                // No mechanical effect, just narrative text
                this._roomEventResultText = t('roomEvent.' + roomEvt.id + '.flavor', {});
                break;
        }
    },

    applyEventAuto(event) {
        this.activeEvent = event;
        this._eventResultText = null;
        this._eventDeclarations = null;
        switch (event.effect) {
            case 'incendio_cocina':
                this.eventBlockedRooms.push(6);
                for (let p of this.players) {
                    if (!p.isEliminated && p.roomIndex === 6) {
                        const adj = CONNECTIONS[6].filter(r => !this.eventBlockedRooms.includes(r));
                        if (adj.length > 0) p.roomIndex = adj[Math.floor(Math.random() * adj.length)];
                    }
                }
                break;
            case 'guardia_alerta':
                this.eventDicePenalty = 1;
                break;
            case 'pasillos_confusos':
                this.eventMaxMovement = 1;
                break;
            case 'torre_sellada':
                this.eventBlockedRooms.push(0);
                break;
            case 'banquete':
                for (let p of this.players) {
                    if (!p.isEliminated) p.roomIndex = THRONE_ROOM_INDEX;
                }
                break;
            case 'pacto_silencio':
                this.eventSocialBlock = true;
                break;
            case 'tormenta':
                this.eventBlockedRooms.push(7);
                break;
            case 'pasadizo_descubierto': {
                let attempts = 0;
                while (attempts < 30) {
                    const _totalR = getTotalRoomCount();
                    const a = Math.floor(Math.random() * _totalR);
                    const b = Math.floor(Math.random() * _totalR);
                    if (a !== b && !CONNECTIONS[a].includes(b) && SECRET_PASSAGES[a] !== b) {
                        this.eventTempConnections = [{from: a, to: b}];
                        this._eventResultText = t('event.newPassage', { roomA: tr(a), roomB: tr(b) });
                        break;
                    }
                    attempts++;
                }
                break;
            }
            case 'espia': {
                const eligible = this.players.filter(p => !p.isEliminated && p.cards.length > 0);
                if (eligible.length > 0) {
                    const target = eligible[Math.floor(Math.random() * eligible.length)];
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    for (let p of this.players) {
                        if (!p.isEliminated) this.markCardSeen(p.id, card);
                    }
                    this.addCardNote(0, card, 'R' + this.roundNumber + ': ' + t('note.event', { eventName: t('event.13.name') }));
                    this._eventResultText = t('event.reveals', { name: target.name, card: tc(card) });
                }
                break;
            }
            case 'archivos_reales': {
                const sol = this.solution.metodo;
                const nonSol = CARDS.metodos.filter(c => c !== sol);
                if (nonSol.length > 0) {
                    const card = nonSol[Math.floor(Math.random() * nonSol.length)];
                    for (let p of this.players) {
                        if (!p.isEliminated) this.markCardSeen(p.id, card);
                    }
                    this.addCardNote(0, card, 'R' + this.roundNumber + ': ' + t('note.event', { eventName: t('event.15.name') }));
                    this._eventResultText = t('event.methodDiscarded', { card: tc(card) });
                }
                break;
            }
            case 'documento_secreto': {
                const sol = this.solution.lugar;
                const nonSol = CARDS.lugares.filter(c => c !== sol);
                if (nonSol.length > 0) {
                    const card = nonSol[Math.floor(Math.random() * nonSol.length)];
                    for (let p of this.players) {
                        if (!p.isEliminated) this.markCardSeen(p.id, card);
                    }
                    this.addCardNote(0, card, 'R' + this.roundNumber + ': ' + t('note.event', { eventName: t('event.16.name') }));
                    this._eventResultText = t('event.placeDiscarded', { card: tc(card) });
                }
                break;
            }
            case 'informe_consejo': {
                const sol = this.solution.conspirador;
                const nonSol = CARDS.conspiradores.filter(c => c !== sol);
                if (nonSol.length > 0) {
                    const card = nonSol[Math.floor(Math.random() * nonSol.length)];
                    for (let p of this.players) {
                        if (!p.isEliminated) this.markCardSeen(p.id, card);
                    }
                    this.addCardNote(0, card, 'R' + this.roundNumber + ': ' + t('note.event', { eventName: t('event.19.name') }));
                    this._eventResultText = t('event.conspiratorDiscarded', { card: tc(card) });
                }
                break;
            }
            case 'bestia': {
                const eligible = this.players.filter(p => !p.isEliminated);
                if (eligible.length > 0) {
                    const target = eligible[Math.floor(Math.random() * eligible.length)];
                    target.roomIndex = 8;
                    this._eventResultText = t('event.sentToDungeons', { name: target.name });
                }
                break;
            }
            case 'fiesta_bufon': {
                let allCards = [];
                const cardCounts = [];
                for (let p of this.players) {
                    if (p.isEliminated) { cardCounts.push(0); continue; }
                    cardCounts.push(p.cards.length);
                    allCards.push(...p.cards);
                }
                this.shuffle(allCards);
                let ci = 0;
                for (let i = 0; i < this.players.length; i++) {
                    if (this.players[i].isEliminated) continue;
                    this.players[i].cards = allCards.slice(ci, ci + cardCounts[i]);
                    ci += cardCounts[i];
                    for (let card of this.players[i].cards) {
                        // Own cards are always marked — manual notebook only affects deduced clues
                        this.players[i].notebook[card] = 'X';
                        if (!this.players[i].seenCards.includes(card)) this.players[i].seenCards.push(card);
                    }
                }
                break;
            }
            case 'trampa': {
                const eligible = this.players.filter(p => !p.isEliminated);
                if (eligible.length > 0) {
                    const target = eligible[Math.floor(Math.random() * eligible.length)];
                    this.eventSkipTurn.push(target.id);
                    this._eventResultText = t('event.losesNextTurn', { name: target.name });
                }
                break;
            }
            case 'audiencia': {
                let declarations = [];
                for (let p of this.players) {
                    if (p.isEliminated || p.isHuman) continue;
                    const cats = [CARDS.conspiradores, CARDS.metodos, CARDS.motivos];
                    const catNames = [t('cat.conspirador'), t('cat.metodo'), t('cat.motivo')];
                    const ci = Math.floor(Math.random() * 3);
                    const unknowns = cats[ci].filter(c => p.notebook[c] === '?');
                    const pick = unknowns.length > 0 ? unknowns[Math.floor(Math.random() * unknowns.length)] : cats[ci][0];
                    declarations.push(t('event.suspectsOf', { name: p.name, card: tc(pick), category: catNames[ci] }));
                }
                this._eventDeclarations = declarations;
                break;
            }
            case 'rumor_malicioso': {
                const eligible = this.players.filter(p => !p.isEliminated);
                if (eligible.length > 0) {
                    const target = eligible[Math.floor(Math.random() * eligible.length)];
                    Reputation.change(target.id, -1);
                    this._eventResultText = t('event.rumorMalicioso', { name: target.name });
                }
                break;
            }
            case 'honor_corte': {
                let best = null;
                let bestRep = -999;
                for (let p of this.players) {
                    if (!p.isEliminated && p.reputation > bestRep) {
                        bestRep = p.reputation;
                        best = p;
                    }
                }
                if (best) {
                    Reputation.change(best.id, 1);
                    this._eventResultText = t('event.honorCorte', { name: best.name });
                }
                break;
            }
            case 'escandalo': {
                const cp = this.currentPlayer();
                Reputation.change(cp.id, -2);
                this._eventResultText = t('event.escandalo', { name: cp.name });
                break;
            }
        }
    },

    addCardNote(playerId, card, text) {
        const p = this.players[playerId];
        if (!p.notebookNotes) p.notebookNotes = {};
        const existing = p.notebookNotes[card] || '';
        const separator = existing ? '\n' : '';
        p.notebookNotes[card] = existing + separator + text;
    },

    randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};
