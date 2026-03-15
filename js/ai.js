// ─────────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────────

const AI = {
    chooseMove(bot) {
        const reachable = GameState.getReachableRooms(bot.id);
        if (reachable.length === 0) return bot.roomIndex;

        if (this.shouldAccuse(bot) && reachable.includes(THRONE_ROOM_INDEX)) {
            return THRONE_ROOM_INDEX;
        }

        const scored = reachable.map(r => {
            let score = 0;
            if (isCoreRoom(r)) {
                const name = ROOM_NAMES[r];
                if (bot.notebook[name] === '?') score += 3;
            }
            if (r === THRONE_ROOM_INDEX) score += 1;
            // Room action scoring
            const action = getRoomAction(r);
            if (action && action.type) {
                if (action.type === 'evidencia') score += 2;
                else if (action.type === 'interrogatorio') score += 2.5;
                else if (action.type === 'archivo') score += 1.5;
                else if (action.type === 'pista_metodo') score += 1.5;
                else if (action.type === 'intuicion') score += 1;
                else if (action.type === 'rumor') score += 0.5;
                else if (action.type === 'movimiento_extra') score += 0.5;
                else if (action.type === 'bonus_item') score += 0.5;
                else if (action.type === 'reveal_random') score += 2;
                else if (action.type === 'rep_bonus') score += 0.5;
            }
            // Bonus for rooms with active narrative overrides (guaranteed events)
            if (GameState.narrativeRoomOverrides && GameState.narrativeRoomOverrides[r]) {
                score += 3;
            }
            score += Math.random();
            return { room: r, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored[0].room;
    },

    buildSuspicion(bot) {
        const pick = (cats) => {
            const unknowns = cats.filter(c => bot.notebook[c] === '?');
            return unknowns.length > 0 ? unknowns[Math.floor(Math.random() * unknowns.length)]
                : cats[Math.floor(Math.random() * cats.length)];
        };
        return {
            conspirador: pick(CARDS.conspiradores),
            metodo: pick(CARDS.metodos),
            motivo: pick(CARDS.motivos)
        };
    },

    shouldAccuse(bot) {
        if (bot.roomIndex !== THRONE_ROOM_INDEX) return false;
        const cats = ['conspiradores','metodos','lugares','motivos'];
        let allSingle = true;
        for (let cat of cats) {
            const unknowns = CARDS[cat].filter(c => bot.notebook[c] !== 'X');
            if (unknowns.length !== 1) { allSingle = false; break; }
        }
        if (allSingle) return true;

        const total = 27;
        const known = Object.values(bot.notebook).filter(v => v === 'X').length;
        return (known / total) > 0.95 && Math.random() < 0.3;
    },

    buildAccusation(bot) {
        const pick = (cats) => {
            const unknowns = cats.filter(c => bot.notebook[c] !== 'X');
            return unknowns.length > 0 ? unknowns[0] : cats[0];
        };
        return {
            conspirador: pick(CARDS.conspiradores),
            metodo: pick(CARDS.metodos),
            lugar: pick(CARDS.lugares),
            motivo: pick(CARDS.motivos)
        };
    },

    pickLugarForSuspicion(bot) {
        // Bot in additional room: pick a core room for the suspicion
        const unknowns = CARDS.lugares.filter(c => bot.notebook[c] === '?');
        if (unknowns.length > 0) return unknowns[Math.floor(Math.random() * unknowns.length)];
        return CARDS.lugares[Math.floor(Math.random() * CARDS.lugares.length)];
    },

    shouldUseRoomAction(bot) {
        const action = getRoomAction(bot.roomIndex);
        if (!action || !action.type) return false;
        if (action.type === 'movimiento_extra') return false;
        if (GameState.eventSocialBlock || GameState.narrativeSocialBlock) return false;
        const unknowns = Object.values(bot.notebook).filter(v => v === '?').length;
        if (unknowns <= 4) return false;
        return Math.random() < 0.55;
    },

    executeRoomAction(bot) {
        const action = getRoomAction(bot.roomIndex);
        switch (action.type) {
            case 'evidencia': {
                const clue = GameState.generateEvidence();
                GameState.applyClueToNotebook(bot.id, clue);
                GameState.addClue(bot.id, clue);
                Reputation.change(bot.id, 1);
                GameState.addLog(t('log.botTorre', { name: bot.name }));
                break;
            }
            case 'pista_metodo': {
                const clue = GameState.generateEvidence('metodos');
                GameState.applyClueToNotebook(bot.id, clue);
                GameState.addClue(bot.id, clue);
                Reputation.change(bot.id, 1);
                GameState.addLog(t('log.botArmeria', { name: bot.name }));
                break;
            }
            case 'archivo': {
                const cats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
                // Estrategia: elegir la categoría con más cartas desconocidas ('?')
                const scored = cats.map(c => ({
                    cat: c,
                    unknowns: CARDS[c].filter(card => bot.notebook[card] === '?').length
                }));
                scored.sort((a, b) => b.unknowns - a.unknowns);
                const cat = scored[0].unknowns > 0 ? scored[0].cat
                              : cats[Math.floor(Math.random() * cats.length)];
                const clue = GameState.generateArchive(cat);
                GameState.applyClueToNotebook(bot.id, clue);
                GameState.addClue(bot.id, clue);
                Reputation.change(bot.id, 1);
                GameState.addLog(t('log.botBiblioteca', { name: bot.name }));
                break;
            }
            case 'intuicion': {
                const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated);
                if (others.length === 0) break;
                // Elegir categoría con más '?' pendientes para maximizar información
                const allCats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
                const catScored = allCats.map(c => ({
                    cat: c,
                    unknowns: CARDS[c].filter(card => bot.notebook[card] === '?').length
                }));
                catScored.sort((a, b) => b.unknowns - a.unknowns);
                const cat = catScored[0].unknowns > 0 ? catScored[0].cat
                              : allCats[Math.floor(Math.random() * allCats.length)];
                const target = others[Math.floor(Math.random() * others.length)];
                const catCards = CARDS[cat];
                const hasCard = target.cards.some(c => catCards.includes(c));
                // Almacenar resultado: si NO tiene cartas de esa categoría,
                // guardar en notebook del bot para mejorar buildSuspicion
                if (!hasCard) {
                    // El target no tiene cartas de este tipo → esas cartas están en
                    // manos de otros o son la solución → priorizar en futuras sospechas
                    if (!bot._knownNoCards) bot._knownNoCards = {};
                    if (!bot._knownNoCards[cat]) bot._knownNoCards[cat] = [];
                    if (!bot._knownNoCards[cat].includes(target.id)) {
                        bot._knownNoCards[cat].push(target.id);
                    }
                    // Si TODOS los demás players dijeron NO para esta categoría,
                    // las cartas '?' de esa categoría son muy sospechosas
                    const otherCount = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated).length;
                    if (bot._knownNoCards[cat].length >= otherCount) {
                        for (const card of CARDS[cat]) {
                            if (bot.notebook[card] === '?') bot.notebook[card] = 'O';
                        }
                    }
                }
                Reputation.change(bot.id, 1);
                GameState.addLog(t('log.botCapilla', { name: bot.name, target: target.name }));
                break;
            }
            case 'rumor': {
                const rumor = GameState.generateRumor(bot.roomIndex);
                GameState.addClue(bot.id, rumor);
                if (rumor.isTruth && rumor.cardMentioned) {
                    bot.notebook[rumor.cardMentioned] = 'X';
                }
                GameState.addLog(t('log.botRumor', { name: bot.name, room: tr(bot.roomIndex) }));
                break;
            }
            case 'interrogatorio': {
                const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated);
                if (others.length === 0) break;
                const target = others[Math.floor(Math.random() * others.length)];
                if (target.cards.length > 0) {
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    GameState.markCardSeen(bot.id, card);
                    GameState.addLog(t('log.botMazmorras', { name: bot.name, target: target.name }));
                }
                break;
            }
            case 'bonus_item': {
                // Additional room: try to pick up an item
                if (typeof Inventory !== 'undefined') {
                    const item = Inventory.tryPickup(bot.id, bot.roomIndex);
                    if (item) GameState.addLog(t('log.botFoundItem', { name: bot.name }));
                }
                break;
            }
            case 'reveal_random': {
                // Reveal a random card from another player
                const others2 = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated && p.cards.length > 0);
                if (others2.length > 0) {
                    const tgt = others2[Math.floor(Math.random() * others2.length)];
                    const card = tgt.cards[Math.floor(Math.random() * tgt.cards.length)];
                    GameState.markCardSeen(bot.id, card);
                    GameState.addLog(t('log.botRoomAction', { name: bot.name, room: tr(bot.roomIndex) }));
                }
                break;
            }
            case 'rep_bonus': {
                Reputation.change(bot.id, 1);
                GameState.addLog(t('log.botRoomAction', { name: bot.name, room: tr(bot.roomIndex) }));
                break;
            }
            case 'movimiento_extra': {
                // Bot doesn't usually use this, but handle gracefully
                GameState.movesRemaining = (GameState.movesRemaining || 0) + 2;
                GameState.addLog(t('log.botRoomAction', { name: bot.name, room: tr(bot.roomIndex) }));
                break;
            }
        }
    },

    // ─── Inventory AI ────────────────────────────────

    /**
     * Choose an item to use for a bot. Returns { itemId, targetId } or null.
     * Priority-based: most impactful items first, with conditional checks.
     */
    chooseItemToUse(bot) {
        if (!bot.inventory || bot.inventory.length === 0) return null;
        const unknowns = Object.values(bot.notebook).filter(v => v === '?').length;
        const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated);

        // Check what items the bot has
        const has = (id) => bot.inventory.some(it => it.id === id);

        // 1. Dado trucado: use during ROLL_DICE phase (handled separately in executeBotTurn)
        //    We activate it here so it's ready for the roll
        if (has('dado_trucado') && GameState.phase === PHASES.ACTION_CHOICE) {
            return { itemId: 'dado_trucado', targetId: null };
        }

        // 2. Pergamino sellado: always use (reveals solution card)
        if (has('pergamino_sellado') && unknowns > 2) {
            return { itemId: 'pergamino_sellado', targetId: null };
        }

        // 3. Botas de sigilo: use if we want to go far
        if (has('botas_sigilo') && unknowns > 4) {
            return { itemId: 'botas_sigilo', targetId: null };
        }

        // 4. Lupa ancestral: use if many unknowns
        if (has('lupa_ancestral') && unknowns > 6) {
            return { itemId: 'lupa_ancestral', targetId: null };
        }

        // 5. Cristal revelador: use on player with most cards
        if (has('cristal_revelador') && unknowns > 4 && others.length > 0) {
            const target = others.filter(p => !p.cloakActive).sort((a, b) => b.cards.length - a.cards.length)[0];
            if (target) return { itemId: 'cristal_revelador', targetId: target.id };
        }

        // 6. Carta de recomendación: force reveal
        if (has('carta_recomendacion') && unknowns > 5 && others.length > 0) {
            const target = others.filter(p => !p.cloakActive && p.cards.length > 0).sort((a, b) => b.cards.length - a.cards.length)[0];
            if (target) return { itemId: 'carta_recomendacion', targetId: target.id };
        }

        // 7. Sello real: use if reputation is low
        if (has('sello_real') && bot.reputation < 0) {
            return { itemId: 'sello_real', targetId: null };
        }

        // 8. Veneno lento: target = player with most known cards (closest to winning)
        if (has('veneno_lento') && others.length > 0) {
            const target = others.sort((a, b) => {
                const aKnown = Object.values(a.notebook).filter(v => v === 'X').length;
                const bKnown = Object.values(b.notebook).filter(v => v === 'X').length;
                return bKnown - aKnown;
            })[0];
            if (target && Math.random() < 0.3) return { itemId: 'veneno_lento', targetId: target.id };
        }

        // 9. Polvo cegador: target = player in a good investigation room
        if (has('polvo_cegador') && others.length > 0) {
            const target = others.find(p => [0, 1, 8].includes(p.roomIndex) && !p.cloakActive);
            if (target && Math.random() < 0.3) return { itemId: 'polvo_cegador', targetId: target.id };
        }

        // 10. Trampa de sala: place in a high-value room if bot is there
        if (has('trampa_sala') && !GameState.roomTraps[bot.roomIndex] && [0, 1, 4, 8].includes(bot.roomIndex)) {
            if (Math.random() < 0.35) return { itemId: 'trampa_sala', targetId: null };
        }

        // 11. Capa de invisibilidad: use if reputation is very low (protect from theft/surveillance)
        if (has('capa_invisibilidad') && bot.reputation <= -2) {
            return { itemId: 'capa_invisibilidad', targetId: null };
        }

        // 12. Anillo de poder: use before making a critical suspicion
        if (has('anillo_poder') && unknowns <= 6) {
            return { itemId: 'anillo_poder', targetId: null };
        }

        // 13. Mapa secreto: use if current room is bad and a good room is far
        if (has('mapa_secreto') && unknowns > 4) {
            const goodRooms = [0, 1, 8]; // investigation rooms
            if (!goodRooms.includes(bot.roomIndex) && Math.random() < 0.4) {
                return { itemId: 'mapa_secreto', targetId: null };
            }
        }

        // 14. Máscara cortesana: use if about to make a suspicion
        if (has('mascara_cortesana') && unknowns > 3 && Math.random() < 0.3) {
            return { itemId: 'mascara_cortesana', targetId: null };
        }

        return null;
    }
};
