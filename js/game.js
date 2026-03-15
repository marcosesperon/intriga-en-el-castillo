// ─────────────────────────────────────────────────
// GAME ENGINE (turn logic)
// ─────────────────────────────────────────────────

const Game = {
    onRoomClick(roomIndex) {
        if (GameState.phase !== PHASES.MOVING) return;
        const cp = GameState.currentPlayer();
        if (!cp.isHuman) return;
        if (GameState.movesRemaining <= 0) return;

        // Secret passage
        if (SECRET_PASSAGES[cp.roomIndex] === roomIndex && GameState.canUseSecretPassage(cp.id)) {
            GameState.useSecretPassage(cp.id);
            GameState.addLog(t('log.usedSecretPassage', { room: tr(roomIndex) }));
            if (typeof Board3D !== 'undefined' && Board3D._camera) {
                Board3D.focusOnRoom(roomIndex);
            }
            UI.updateLog();
            this.afterMove();
            return;
        }

        // Normal movement
        if (!GameState.canMoveTo(cp.id, roomIndex)) return;
        GameState.movePlayer(cp.id, roomIndex);
        GameState.addLog(t('log.movedTo', { room: tr(roomIndex) }));

        // Focus camera on player's new position
        if (typeof Board3D !== 'undefined' && Board3D._camera) {
            Board3D.focusOnRoom(roomIndex);
        }

        if (GameState.movesRemaining <= 0) {
            UI.updateLog();
            this.afterMove();
        } else {
            Board.updateHighlights();
            Board.draw();
            UI.updateHUD();
            UI.updateLog();
        }
    },

    afterMove() {
        const cp = GameState.currentPlayer();
        // Check room trap
        if (GameState.roomTraps && GameState.roomTraps[cp.roomIndex] != null && GameState.roomTraps[cp.roomIndex] !== cp.id) {
            GameState.eventSkipTurn.push(cp.id);
            Reputation.change(cp.id, -1);
            GameState.addLog(t('log.trapTriggered', { name: cp.name, room: tr(cp.roomIndex) }));
            delete GameState.roomTraps[cp.roomIndex];
            UI.updateLog();
            Board.draw();
            UI.updateHUD();
            this.endTurn();
            return;
        }
        GameState.phase = PHASES.ACTION_CHOICE;
        // Unfocus camera when movement ends and action phase begins
        if (typeof Board3D !== 'undefined' && Board3D._camera) {
            Board3D.unfocusCamera();
        }
        Board.updateHighlights();
        Board.draw();
        UI.updateHUD();
    },

    endTurn() {
        GameState.advanceTurn();
        Board.updateHighlights();
        Board.draw();
        UI.updateHUD();
        UI.updateLog();

        // Day/night cycle: check for time period change
        if (GameState._timePeriodChanged) {
            const newPeriod = GameState._timePeriodChanged;
            GameState._timePeriodChanged = null;
            GameState.addLog(t('timePeriod.change.' + newPeriod));
            if (Board.setTimePeriod) Board.setTimePeriod(newPeriod);
            UI.updateTimePeriod();
            UI.updateLog();
        }

        // Narrative events: show resolutions then new starts, then continue
        const hasNarrRes = GameState._narrativeResolutions.length > 0;
        const hasNarrStart = GameState._pendingNarrativeStart != null;
        if (hasNarrRes || hasNarrStart) {
            // Mark event fired so dynamic event is skipped (max 1 event per turn)
            GameState.eventFiredThisTurn = true;
            Board.draw();
            UI.updateHUD();
            UI.updateLog();
            this._showNarrativeFlow(() => {
                this._continueEndTurnAfterNarrative();
            });
            return;
        }

        this._continueEndTurnAfterNarrative();
    },

    _showNarrativeFlow(callback) {
        const resolutions = [...GameState._narrativeResolutions];
        GameState._narrativeResolutions = [];
        const newStart = GameState._pendingNarrativeStart;
        GameState._pendingNarrativeStart = null;

        // Chain: show all resolutions, then new start, then callback
        const showResolutions = (idx) => {
            if (idx >= resolutions.length) {
                if (newStart) {
                    UI.showNarrativeStart(newStart, callback);
                } else {
                    callback();
                }
                return;
            }
            UI.showNarrativeResolution(resolutions[idx].def, resolutions[idx].text, () => {
                showResolutions(idx + 1);
            });
        };
        showResolutions(0);
    },

    _continueEndTurnAfterNarrative() {
        if (GameState.gameOver) {
            UI.showResult();
            return;
        }

        // Check for pending event (max 1 event per turn — skip if room event already fired)
        if (GameState._pendingEvent) {
            GameState._pendingEvent = false;
            if (GameState.eventFiredThisTurn) {
                // Room event already fired this turn; skip dynamic event
                this.continueAfterEvent();
                return;
            }
            GameState.eventFiredThisTurn = true;

            // MAJOR EVENT: triggered when chaos >= 3
            if (GameState.chaosLevel >= 3) {
                const majorEvent = GameState.drawMajorEvent();
                GameState.chaosLevel = 0;
                GameState.applyMajorEventAuto(majorEvent);
                GameState.addLog(t('log.majorEvent', { name: t('major.' + majorEvent.id + '.name') }));
                if (GameState._eventResultText) {
                    GameState.addLog(GameState._eventResultText);
                }
                Board.draw();
                UI.updateLog();

                const afterMajorBanner = () => {
                    this.processMajorEventAfter(majorEvent, () => {
                        this.continueAfterEvent();
                    });
                };

                UI.showMajorEvent(majorEvent, afterMajorBanner);
                return;
            }

            // NORMAL DYNAMIC EVENT
            const event = GameState.drawEvent();
            GameState.applyEventAuto(event);
            GameState.addLog(t('log.event', { name: t('event.' + event.id + '.name'), desc: t('event.' + event.id + '.desc') }));
            if (GameState._eventResultText) {
                GameState.addLog(GameState._eventResultText);
            }
            // Increment chaos if applicable
            if (CHAOS_EVENTS.has(event.effect)) {
                GameState.chaosLevel++;
                GameState.addLog(t('log.chaosIncreased', { level: GameState.chaosLevel }));
            }
            // Set combo chain
            if (EVENT_COMBOS[event.effect]) {
                GameState.comboNextEventId = EVENT_COMBOS[event.effect];
            }
            Board.draw();
            UI.updateLog();

            // After showing the event banner, handle interaction or continue
            const afterBanner = () => {
                this.processEventAfterBanner(event, () => {
                    this.continueAfterEvent();
                });
            };

            UI.showEvent(event, afterBanner);
            return;
        }

        this.continueAfterEvent();
    },

    processEventAfterBanner(event, callback) {
        const cp = GameState.currentPlayer();

        // Interactive events that need human UI or bot auto-resolve
        if (event.interactive) {
            if (cp.isHuman) {
                UI.showEventInteraction(event, callback);
            } else {
                this.resolveEventForBot(event, cp);
                callback();
            }
            return;
        }

        // Non-interactive events that generate clues for the active player
        if (event.effect === 'rumor_corte') {
            const rumor = GameState.generateRumor(cp.roomIndex);
            GameState.addClue(cp.id, rumor);
            if (cp.isHuman) {
                GameState.addLog(t('log.rumorInCourt', { text: rumor.text }));
                UI.updateLog();
            } else {
                if (rumor.isTruth && rumor.cardMentioned) {
                    cp.notebook[rumor.cardMentioned] = 'X';
                }
                GameState.addLog(t('log.botHearsRumor', { name: cp.name }));
                UI.updateLog();
            }
            callback();
            return;
        }

        if (event.effect === 'informante') {
            const evidence = GameState.generateEvidence();
            GameState.addClue(cp.id, evidence);
            GameState.applyClueToNotebook(cp.id, evidence);
            if (cp.isHuman) {
                GameState.addLog(t('log.informantReveals', { text: evidence.text }));
                UI.updateLog();
            } else {
                GameState.addLog(t('log.botReceivesClue', { name: cp.name }));
                UI.updateLog();
            }
            callback();
            return;
        }

        // fiesta_bufon: cards reshuffled, refresh human card display
        if (event.effect === 'fiesta_bufon') {
            UI.initCards();
        }

        callback();
    },

    processMajorEventAfter(event, callback) {
        const cp = GameState.currentPlayer();
        if (event.effect === 'juicio_real' && GameState._juicioTarget) {
            const target = GameState._juicioTarget;
            if (target.isHuman) {
                // Human must choose a card to reveal
                UI.showJuicioRealInteraction(target, callback);
            } else {
                // Bot auto-reveals a random card
                if (target.cards.length > 0) {
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    for (const p of GameState.players) {
                        if (!p.isEliminated) GameState.markCardSeen(p.id, card);
                    }
                    GameState.addLog(t('major.juicioRevealed', { name: target.name, card: tc(card) }));
                    UI.updateLog();
                }
                callback();
            }
            return;
        }
        callback();
    },

    // Room events: check after a room action completes
    checkRoomEvent(cp, callback) {
        // Skip if an event already fired this turn (max 1 per turn)
        if (GameState.eventFiredThisTurn) { callback(); return; }

        const roomEvt = GameState.drawRoomEvent(cp.roomIndex);
        if (roomEvt) {
            GameState.eventFiredThisTurn = true;
            GameState.applyRoomEventAuto(roomEvt, cp.roomIndex);
            GameState.addLog(t('log.roomEvent', { name: t('roomEvent.' + roomEvt.id + '.name'), room: tr(cp.roomIndex) }));
            if (GameState._roomEventResultText) {
                GameState.addLog(GameState._roomEventResultText);
            }
            UI.updateLog();
            if (cp.isHuman) {
                UI.showRoomEvent(roomEvt, callback);
            } else {
                // Bot just continues
                callback();
            }
        } else {
            callback();
        }
    },

    resolveEventForBot(event, bot) {
        switch (event.effect) {
            case 'puertas_cerradas': {
                const rooms = ROOM_NAMES.map((r,i) => i).filter(i => i !== bot.roomIndex);
                const pick = rooms[Math.floor(Math.random() * rooms.length)];
                GameState.eventBlockedRooms.push(pick);
                for (let p of GameState.players) {
                    if (!p.isEliminated && p.roomIndex === pick) {
                        const adj = CONNECTIONS[pick].filter(r => !GameState.eventBlockedRooms.includes(r));
                        if (adj.length > 0) p.roomIndex = adj[Math.floor(Math.random() * adj.length)];
                    }
                }
                GameState.addLog(t('log.botBlocksRoom', { name: bot.name, room: tr(pick) }));
                break;
            }
            case 'inspeccion':
            case 'experimento': {
                const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated && p.cards.length > 0);
                if (others.length > 0) {
                    const target = others[Math.floor(Math.random() * others.length)];
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    GameState.markCardSeen(bot.id, card);
                    GameState.addLog(t('log.botInspects', { name: bot.name, target: target.name }));
                }
                break;
            }
            case 'negociacion': {
                const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated && p.cards.length > 0);
                if (others.length > 0 && bot.cards.length > 0) {
                    const target = others[Math.floor(Math.random() * others.length)];
                    const myCard = bot.cards[Math.floor(Math.random() * bot.cards.length)];
                    const theirCard = target.cards[Math.floor(Math.random() * target.cards.length)];
                    bot.cards = bot.cards.filter(c => c !== myCard);
                    target.cards = target.cards.filter(c => c !== theirCard);
                    bot.cards.push(theirCard);
                    target.cards.push(myCard);
                    GameState.markCardSeen(bot.id, theirCard);
                    GameState.markCardSeen(target.id, myCard);
                    GameState.addLog(t('log.botNegotiates', { name: bot.name, target: target.name }));
                    if (target.isHuman) UI.initCards();
                }
                break;
            }
            case 'guardias_repos': {
                const pick = Math.floor(Math.random() * getTotalRoomCount());
                const connectedRooms = CONNECTIONS[pick];
                let moved = [];
                for (let p of GameState.players) {
                    if (p.isEliminated) continue;
                    if (connectedRooms.includes(p.roomIndex)) {
                        const adj = CONNECTIONS[p.roomIndex].filter(r => !GameState.eventBlockedRooms.includes(r) && r !== p.roomIndex);
                        if (adj.length > 0) {
                            const newRoom = adj[Math.floor(Math.random() * adj.length)];
                            p.roomIndex = newRoom;
                            moved.push(t('log.playerMovedTo', { name: p.name, room: tr(newRoom) }));
                        }
                    }
                }
                GameState.addLog(t('log.botSendsGuards', { name: bot.name, result: moved.length > 0 ? moved.join(', ') : t('log.noOneMoved') }));
                break;
            }
            case 'confesion': {
                const others = GameState.players.filter(p => p.id !== bot.id && !p.isEliminated);
                if (others.length > 0) {
                    const target = others[Math.floor(Math.random() * others.length)];
                    const cats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
                    const cat = cats[Math.floor(Math.random() * cats.length)];
                    const catCards = CARDS[cat];
                    const hasCard = target.cards.some(c => catCards.includes(c));
                    if (!hasCard) {
                        for (let c of catCards) {
                            if (bot.notebook[c] === '?' && !target.cards.includes(c)) {
                            }
                        }
                    }
                    GameState.addLog(t('log.botConfession', { name: bot.name, target: target.name }));
                }
                break;
            }
            case 'audiencia': {
                const cats = [CARDS.conspiradores, CARDS.metodos, CARDS.motivos];
                const catNames = [t('cat.conspirador'), t('cat.metodo'), t('cat.motivo')];
                const ci = Math.floor(Math.random() * 3);
                const unknowns = cats[ci].filter(c => bot.notebook[c] === '?');
                const pick = unknowns.length > 0 ? unknowns[Math.floor(Math.random() * unknowns.length)] : cats[ci][0];
                GameState.addLog(t('log.botDeclaresSuspect', { name: bot.name, card: tc(pick) }));
                break;
            }
        }
        Board.draw();
        UI.updateLog();
    },

    continueAfterEvent() {
        const cp = GameState.currentPlayer();
        if (GameState.eventSkipTurn.includes(cp.id)) {
            GameState.eventSkipTurn = GameState.eventSkipTurn.filter(id => id !== cp.id);
            GameState.addLog(t('log.lostTurnTrap', { name: cp.name }));
            UI.updateLog();
            this.endTurn();
            return;
        }

        // Guard surveillance for low reputation
        if (Reputation.shouldGuardSurveillance(cp.id)) {
            const card = Reputation.applyGuardSurveillance(cp.id);
            if (card) {
                GameState.addLog(t('rep.guardSurveillance', { name: cp.name, card: tc(card) }));
                if (cp.isHuman) UI.initCards();
                UI.updateLog();
            }
        }

        if (!cp.isHuman) {
            setTimeout(() => this.executeBotTurn(), 600);
        }
    },

    onAccusationComplete(correct) {
        if (correct) {
            GameState.gameOver = true;
            GameState.winner = GameState.currentPlayer();
            GameState.addLog(t('log.accusationCorrect', { name: GameState.currentPlayer().name }));
            UI.updateLog();
            UI.showResult();
        } else {
            const cp = GameState.currentPlayer();
            Reputation.applyAccusationFailure(cp.id);
            Board.draw();
            UI.updateLog();
            this.endTurn();
        }
    },

    executeBotTurn() {
        if (GameState.gameOver) return;
        const cp = GameState.currentPlayer();
        if (cp.isEliminated) { this.endTurn(); return; }

        try {
            // Bot: roll dice (dado trucado: always choose 6)
            const diceArg = cp.dadoTrucadoActive ? 6 : undefined;
            const val = GameState.rollDice(diceArg);
            GameState.addLog(t('log.botRolledDice', { name: cp.name, value: val }));
            UI.updateHUD();
            UI.updateLog();
        } catch (e) {
            console.error('Bot roll error:', e);
            this.endTurn();
            return;
        }

        // Bot: move — check trap on arrival
        setTimeout(() => {
            try {
                if (GameState.gameOver) return;
                const move = AI.chooseMove(cp);
                if (move !== null && move !== cp.roomIndex) {
                    if (SECRET_PASSAGES[cp.roomIndex] === move) {
                        GameState.useSecretPassage(cp.id);
                        GameState.addLog(t('log.botUsedSecretPassage', { name: cp.name, room: tr(move) }));
                    } else {
                        GameState.players[cp.id].roomIndex = move;
                        GameState.movesRemaining = 0;
                        GameState.addLog(t('log.botMovedTo', { name: cp.name, room: tr(move) }));
                    }
                    // Check room trap
                    if (GameState.roomTraps && GameState.roomTraps[cp.roomIndex] != null && GameState.roomTraps[cp.roomIndex] !== cp.id) {
                        GameState.eventSkipTurn.push(cp.id);
                        Reputation.change(cp.id, -1);
                        GameState.addLog(t('log.trapTriggered', { name: cp.name, room: tr(cp.roomIndex) }));
                        delete GameState.roomTraps[cp.roomIndex];
                        UI.updateLog();
                        Board.draw();
                        this.endTurn();
                        return;
                    }
                }
                Board.draw();
                GameState.phase = PHASES.ACTION_CHOICE;
                UI.updateHUD();
                UI.updateLog();

                // Bot: action
                setTimeout(() => {
                    if (GameState.gameOver) return;
                    try {
                        this.botAction(cp);
                    } catch (e) {
                        console.error('Bot action error (' + cp.name + '):', e);
                        this.endTurn();
                    }
                }, 600);
            } catch (e) {
                console.error('Bot move error (' + cp.name + '):', e);
                this.endTurn();
            }
        }, 600);
    },

    botAction(cp) {
        if (GameState.eventSocialBlock) {
            GameState.addLog(t('log.botCannotAct', { name: cp.name }));
            UI.updateLog();
            this.endTurn();
            return;
        }

        // Bonus: Favor del Rey (does not consume action)
        if (Reputation.canUseFavorDelRey(cp.id)) {
            const cats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
            let bestCat = null;
            let bestUnknowns = 0;
            for (let cat of cats) {
                const unknowns = CARDS[cat].filter(c => cp.notebook[c] === '?').length;
                if (unknowns > 0 && unknowns > bestUnknowns) {
                    bestUnknowns = unknowns;
                    bestCat = cat;
                }
            }
            if (bestCat) {
                const sol = GameState.getSolutionForCategory(bestCat);
                Reputation.useFavorDelRey(cp.id);
                GameState.markCardSeen(cp.id, sol, true);
                GameState.addLog(t('rep.botFavorDelRey', { name: cp.name }));
                UI.updateLog();
            }
        }

        // Bonus: Chantaje (does not consume action, 40% chance)
        if (Reputation.canUseChantaje(cp.id) && Math.random() < 0.4) {
            const others = GameState.players.filter(p => p.id !== cp.id && !p.isEliminated && p.cards.length > 0);
            if (others.length > 0) {
                const target = others[Math.floor(Math.random() * others.length)];
                const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                GameState.markCardSeen(cp.id, card);
                Reputation.change(cp.id, -1);
                GameState.addLog(t('rep.botChantaje', { name: cp.name, target: target.name }));
                UI.updateLog();
            }
        }

        // Bot: try to use an item (does not consume main action, once per turn)
        if (typeof AI.chooseItemToUse === 'function' && cp.inventory && cp.inventory.length > 0 && !cp.itemActionUsedThisTurn) {
            const itemChoice = AI.chooseItemToUse(cp);
            if (itemChoice) {
                const result = Inventory.useItem(cp.id, itemChoice.itemId, itemChoice.targetId);
                if (result.success) {
                    cp.itemActionUsedThisTurn = true;
                    GameState.addLog(t(result.logKey, result.params));
                    UI.updateLog();
                }
            }
        }

        // Try room action (blocked if blinded)
        if (AI.shouldUseRoomAction(cp) && cp.itemBlindedBy === null) {
            AI.executeRoomAction(cp);
            GameState.roomActionUsedThisTurn = true;
            UI.updateLog();
            // Try item pickup after room action
            if (typeof Inventory !== 'undefined') {
                const pickup = Inventory.tryPickup(cp.id, cp.roomIndex);
                if (pickup) {
                    // Bot: if inventory was full, discard worst item
                    if (pickup.inventoryFull && cp.inventory.length >= MAX_INVENTORY) {
                        // Discard lowest rarity item
                        const rarityOrder = { comun: 0, raro: 1, legendario: 2 };
                        let worstIdx = 0;
                        let worstRarity = 3;
                        for (let i = 0; i < cp.inventory.length; i++) {
                            const d = Inventory.getItemDef(cp.inventory[i].id);
                            const r = d ? (rarityOrder[d.rarity] || 0) : 0;
                            if (r < worstRarity) { worstRarity = r; worstIdx = i; }
                        }
                        const discarded = cp.inventory.splice(worstIdx, 1);
                        Inventory.addItem(cp.id, pickup.itemDef.id);
                    }
                    GameState.addLog(t('log.botFoundItem', { name: cp.name, item: t('item.' + pickup.itemDef.id + '.name') }));
                    UI.updateLog();
                }
            }
            // Check for room-specific event after action
            this.checkRoomEvent(cp, () => this.endTurn());
            return;
        } else if (cp.itemBlindedBy !== null && AI.shouldUseRoomAction(cp)) {
            // Blinded, log it
            GameState.addLog(t('log.itemBlinded', { name: cp.name }));
            UI.updateLog();
        }

        // Try accusation
        if (cp.roomIndex === THRONE_ROOM_INDEX && AI.shouldAccuse(cp) && Reputation.canPlayerAccuse(cp.id)) {
            const accusation = AI.buildAccusation(cp);
            GameState.addLog(t('log.botMakesAccusation', { name: cp.name }));
            const correct = GameState.checkAccusation(accusation);
            if (correct) {
                GameState.gameOver = true;
                GameState.winner = cp;
                GameState.addLog(t('log.botSolvedMystery', { name: cp.name }));
                UI.updateLog();
                setTimeout(() => UI.showResult(), 800);
                return;
            } else {
                Reputation.applyAccusationFailure(cp.id);
                Board.draw();
                UI.updateLog();
                this.endTurn();
                return;
            }
        }

        // Make suspicion
        const suspicion = AI.buildSuspicion(cp);

        // Determine lugar: if bot is in additional room, AI picks a core room
        let suspicionLugar;
        if (isAdditionalRoom(cp.roomIndex)) {
            suspicionLugar = AI.pickLugarForSuspicion(cp);
        } else {
            suspicionLugar = ROOM_NAMES[cp.roomIndex];
        }

        GameState.addLog(t('log.botSuspects', {
            name: cp.name,
            conspirador: tc(suspicion.conspirador),
            metodo: tc(suspicion.metodo),
            lugar: tc(suspicionLugar),
            motivo: tc(suspicion.motivo)
        }));
        UI.updateLog();

        const fullSuspicion = {
            conspirador: suspicion.conspirador,
            metodo: suspicion.metodo,
            lugar: suspicionLugar,
            motivo: suspicion.motivo
        };
        GameState.activeSuspicion = fullSuspicion;
        GameState.phase = PHASES.REFUTATION_ROUND;

        setTimeout(() => Refutation.start(), 600);
    }
};
