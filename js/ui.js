// ─────────────────────────────────────────────────
// UI (Top Bar + Panels + Overlays)
// ─────────────────────────────────────────────────

function closeOverlay(id, callback) {
    const el = document.getElementById(id);
    el.classList.add('closing');
    setTimeout(() => { el.classList.remove('active', 'closing'); if (callback) callback(); }, 400);
}

// Wrap overlay panel content into header / scrollable body / footer structure
function wrapOverlayBody(panel) {
    const title = panel.querySelector('.overlay-title');
    const buttons = panel.querySelector('.overlay-buttons');
    const body = document.createElement('div');
    body.className = 'overlay-body';
    // Move all children between title and buttons into body
    const children = Array.from(panel.children);
    for (const child of children) {
        if (child === title || child === buttons) continue;
        body.appendChild(child);
    }
    // Reassemble: title, body, buttons
    panel.innerHTML = '';
    if (title) panel.appendChild(title);
    panel.appendChild(body);
    if (buttons) panel.appendChild(buttons);
}

// Parchment roll helpers (legacy — kept for reference)
function addParchmentRolls(panel) {
    // Wrap all existing children into a scrollable content div
    const wrapper = document.createElement('div');
    wrapper.className = 'parchment-content';
    while (panel.firstChild) {
        wrapper.appendChild(panel.firstChild);
    }
    const top = document.createElement('div');
    top.className = 'parchment-roll-top';
    const bottom = document.createElement('div');
    bottom.className = 'parchment-roll-bottom';
    panel.appendChild(top);
    panel.appendChild(wrapper);
    panel.appendChild(bottom);
}

function getCardCategory(card) {
    if (CARDS.conspiradores.includes(card)) return 'conspirador';
    if (CARDS.metodos.includes(card)) return 'metodo';
    if (CARDS.lugares.includes(card)) return 'lugar';
    if (CARDS.motivos.includes(card)) return 'motivo';
    return '';
}

const SUSPICION_STEPS_CORE = [
    { key: 'conspirador', cards: CARDS.conspiradores, labelKey: 'suspicion.chooseConspirador', color: '#c0a060' },
    { key: 'metodo',      cards: CARDS.metodos,       labelKey: 'suspicion.chooseMetodo',      color: '#E74C3C' },
    { key: 'motivo',      cards: CARDS.motivos,       labelKey: 'suspicion.chooseMotivo',      color: '#9B59B6' }
];
const SUSPICION_STEPS_ADDITIONAL = [
    { key: 'conspirador', cards: CARDS.conspiradores, labelKey: 'suspicion.chooseConspirador', color: '#c0a060' },
    { key: 'metodo',      cards: CARDS.metodos,       labelKey: 'suspicion.chooseMetodo',      color: '#E74C3C' },
    { key: 'lugar',       cards: CARDS.lugares,        labelKey: 'suspicion.chooseLugar',       color: '#2ECC71' },
    { key: 'motivo',      cards: CARDS.motivos,       labelKey: 'suspicion.chooseMotivo',      color: '#9B59B6' }
];

const UI = {
    _logExpanded: false,
    _suspicionStep: 0,
    _suspicionSelections: {},
    _suspicionFanAnimating: false,
    _miniNotebookDelegated: false,

    // ═══════════════════════════════════════════
    // MAIN UPDATE (delegates to sub-methods)
    // ═══════════════════════════════════════════

    updateHUD() {
        const cp = GameState.currentPlayer();
        if (!cp) return;
        this.updateTopBar();
        this.updatePlayersSection();
        this.updateNarrativeIndicator();
        this.renderActionPanel();
        this.updateMiniNotebook();
        this.updateInventoryDisplay();
    },

    updatePlayersSection() {
        const container = document.getElementById('players-list');
        if (!container) return;
        const cp = GameState.currentPlayer();
        let html = '';
        for (const p of GameState.players) {
            const rep = p.reputation;
            const pct = Reputation.getBarPercent(rep);
            const color = Reputation.getBarColor(rep);
            const sign = rep > 0 ? '+' : '';
            const level = Reputation.getLevelName(p.id);
            const nameClass = p.isEliminated ? 'is-eliminated' : (cp && p.id === cp.id ? 'is-current' : '');
            html += '<div class="player-row">' +
                '<span class="player-row-dot" style="background:' + p.color + '"></span>' +
                '<span class="player-row-name ' + nameClass + '">' + p.name + '</span>' +
                '<div class="rep-bar-container"><div class="rep-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
                '<span class="player-row-rep" style="color:' + color + '">' + sign + rep + '</span>' +
                '<span class="player-row-level" style="color:' + color + '">' + level + '</span>' +
                '</div>';
        }
        container.innerHTML = html;
    },

    // ═══════════════════════════════════════════
    updateTimePeriod() {
        const el = document.getElementById('time-period-indicator');
        if (!el || !GameState.getTimePeriod) return;
        const tp = GameState.getTimePeriod();
        el.textContent = (TIME_PERIOD_EMOJI[tp] || '') + ' ' + t('timePeriod.' + tp);
        el.className = 'time-period time-' + tp;
    },

    // TOP BAR
    // ═══════════════════════════════════════════

    updateTopBar() {
        const cp = GameState.currentPlayer();
        if (!cp) return;

        // Phase badge
        const phaseEl = document.getElementById('top-phase');
        let phaseText;
        if (GameState.phase === PHASES.MOVING) {
            phaseText = t('phase.MOVING', { remaining: GameState.movesRemaining });
        } else if (!cp.isHuman && GameState.phase !== PHASES.GAME_OVER) {
            phaseText = t('phase.botThinking', { name: cp.name });
        } else {
            phaseText = t('phase.' + GameState.phase);
        }
        if (GameState.activeEvent) {
            phaseText += ' | ' + GameState.activeEvent.emoji + ' ' + t('event.' + GameState.activeEvent.id + '.name');
        }
        // Chaos indicator
        if (GameState.chaosLevel > 0) {
            const chaosEmoji = GameState.chaosLevel >= 3 ? '\u{1F525}\u{1F525}\u{1F525}' : GameState.chaosLevel === 2 ? '\u{1F525}\u{1F525}' : '\u{1F525}';
            phaseText += ' | ' + chaosEmoji;
        }
        // Combo indicator
        if (GameState.comboNextEventId != null) {
            phaseText += ' | \u{1F517} ' + t('combo.chained');
        }
        // Time period indicator
        if (typeof TIME_PERIOD_EMOJI !== 'undefined' && GameState.getTimePeriod) {
            const tp = GameState.getTimePeriod();
            phaseText += ' | ' + (TIME_PERIOD_EMOJI[tp] || '') + ' ' + t('timePeriod.' + tp);
        }
        // Active narrative events indicator
        if (GameState.activeNarrativeEvents && GameState.activeNarrativeEvents.length > 0) {
            for (const ne of GameState.activeNarrativeEvents) {
                phaseText += ' | ' + ne.def.emoji + ' ' + ne.turnsRemaining;
            }
        }
        phaseEl.textContent = phaseText;

        // Update dedicated time period badge
        this.updateTimePeriod();

        // Phase color
        const phaseClasses = Object.values(PHASE_COLORS);
        phaseEl.classList.remove(...phaseClasses, 'phase-bot');
        if (!cp.isHuman && GameState.phase !== PHASES.GAME_OVER) {
            phaseEl.classList.add('phase-bot');
        } else {
            phaseEl.classList.add(PHASE_COLORS[GameState.phase] || 'phase-end');
        }

        // Dice
        const diceEl = document.getElementById('top-dice');
        const diceFaces = ['', '\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];
        if (GameState.diceValue > 0) {
            diceEl.textContent = diceFaces[GameState.diceValue];
        } else {
            diceEl.textContent = '';
        }

        // Help button
        document.getElementById('help-btn').style.display = '';
    },

    // ═══════════════════════════════════════════
    // ACTION PANEL (Left - contextual by phase)
    // ═══════════════════════════════════════════

    renderActionPanel() {
        const cp = GameState.currentPlayer();
        if (!cp) return;
        const panel = document.getElementById('action-panel');
        const isHuman = cp.isHuman;
        const phase = GameState.phase;

        if (!isHuman) {
            // Bot turn indicator
            panel.innerHTML = `
                <div class="bot-thinking">
                    <div class="bot-avatar" style="background:${cp.color}">${cp.name.charAt(4) || 'B'}</div>
                    <div class="bot-thinking-text">${t('phase.botThinking', { name: cp.name })}<span class="thinking-dots">...</span></div>
                </div>
            `;
            // Hide action drawer on mobile during bot turns
            if (typeof MobileUI !== 'undefined' && MobileUI.isMobile() && MobileUI._activeDrawer === 'action') {
                MobileUI.closeAll();
            }
            return;
        }

        let html = '';

        if (phase === PHASES.ROLL_DICE) {
            const helpTip = GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROLL_DICE') + '</div>' : '';
            // Dado trucado: show chooser instead of roll button
            if (cp.dadoTrucadoActive) {
                let diceHtml = '<div class="action-prompt">' + helpTip +
                    '<div class="overlay-subtitle">' + t('item.dadoChoose') + '</div>' +
                    '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0">';
                for (let v = 1; v <= 6; v++) {
                    diceHtml += '<button class="action-btn" style="min-width:44px;font-size:20px" onclick="UI.onRollDice(' + v + ')">' + v + '</button>';
                }
                diceHtml += '</div></div>';
                html = diceHtml;
            } else {
                html = `
                    <div class="action-prompt">
                        ${helpTip}
                        <button class="action-btn-big pulse" onclick="UI.onRollDice()">\u{1F3B2} ${t('btn.rollDice')}</button>
                    </div>
                `;
            }
        } else if (phase === PHASES.MOVING) {
            const helpTip = GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.MOVING') + '</div>' : '';
            html = `
                <div class="action-prompt">
                    ${helpTip}
                    <button class="action-btn" onclick="UI.onEndMovement()">${t('btn.endMove')}</button>
                </div>
            `;
        } else if (phase === PHASES.ACTION_CHOICE) {
            const helpTip = GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ACTION_CHOICE') + '</div>' : '';
            html = helpTip;

            // Room action (highlighted) — blocked if blinded by polvo_cegador
            const roomAction = getRoomAction(cp.roomIndex);
            const isBlinded = cp.itemBlindedBy !== null;
            if (roomAction.type !== null && !GameState.roomActionUsedThisTurn && !GameState.eventSocialBlock && !GameState.narrativeSocialBlock && !isBlinded) {
                html += `<div class="action-card highlight" onclick="UI.openRoomAction()">
                    <div class="action-icon">${roomAction.emoji}</div>
                    <div class="action-info">
                        <div class="action-title">${t(roomAction.labelKey)}</div>
                        <div class="action-desc">${t('action.roomAction.desc')}</div>
                    </div>
                </div>`;
            } else if (isBlinded && roomAction.type !== null) {
                html += `<div class="action-card" style="opacity:0.5;pointer-events:none">
                    <div class="action-icon">\u{1F4A8}</div>
                    <div class="action-info">
                        <div class="action-title">${t(roomAction.labelKey)}</div>
                        <div class="action-desc">${t('log.itemBlinded', { name: cp.name })}</div>
                    </div>
                </div>`;
            }

            // Suspicion
            if (!GameState.eventSocialBlock && !GameState.narrativeSocialBlock) {
                html += `<div class="action-card" onclick="UI.openSuspicion()">
                    <div class="action-icon">\u{1F50D}</div>
                    <div class="action-info">
                        <div class="action-title">${t('btn.suspect')}</div>
                        <div class="action-desc">${t('action.suspicion.desc')}</div>
                    </div>
                </div>`;
            }

            // Accusation (only in Throne)
            if (cp.roomIndex === THRONE_ROOM_INDEX && Reputation.canPlayerAccuse(cp.id)) {
                html += `<div class="action-card danger" onclick="UI.openAccusation()">
                    <div class="action-icon">\u{2694}</div>
                    <div class="action-info">
                        <div class="action-title">${t('btn.accuse')}</div>
                        <div class="action-desc">${t('action.accuse.desc')}</div>
                    </div>
                </div>`;
            }

            // Favor del Rey (bonus)
            if (Reputation.canUseFavorDelRey(cp.id)) {
                html += `<div class="action-card bonus" onclick="UI.openFavorDelRey()">
                    <div class="action-icon">\u{1F451}</div>
                    <div class="action-info">
                        <div class="action-title">${t('rep.favorDelRey')}</div>
                        <div class="action-desc">${t('rep.favorDelReyDesc')}</div>
                    </div>
                </div>`;
            }

            // Chantaje (bonus)
            if (Reputation.canUseChantaje(cp.id) && !GameState.eventSocialBlock && !GameState.narrativeSocialBlock) {
                html += `<div class="action-card bonus" onclick="UI.openChantaje()">
                    <div class="action-icon">\u{1F5E1}</div>
                    <div class="action-info">
                        <div class="action-title">${t('rep.chantaje')}</div>
                        <div class="action-desc">${t('rep.chantajeDesc')}</div>
                    </div>
                </div>`;
            }

            // Use Item (if player has items and hasn't used item this turn)
            if (cp.inventory && cp.inventory.length > 0 && !cp.itemActionUsedThisTurn) {
                html += `<div class="action-card bonus" onclick="UI.openUseItem()">
                    <div class="action-icon">\u{1F392}</div>
                    <div class="action-info">
                        <div class="action-title">${t('action.useItem.title')}</div>
                        <div class="action-desc">${t('action.useItem.desc')}</div>
                    </div>
                </div>`;
            }

            // Skip
            html += `<div class="action-card" onclick="UI.onSkipAction()">
                <div class="action-icon">\u{23ED}</div>
                <div class="action-info">
                    <div class="action-title">${t('btn.skip')}</div>
                    <div class="action-desc">${t('action.skip.desc')}</div>
                </div>
            </div>`;
        } else {
            // Other phases: show waiting state
            html = `<div class="action-prompt">
                <div class="action-prompt-text">${t('phase.' + phase)}</div>
            </div>`;
        }

        panel.innerHTML = html;

        // Auto-show action drawer on mobile (non-blocking, no backdrop)
        if (isHuman && typeof MobileUI !== 'undefined' && MobileUI.isMobile()) {
            const actionPhases = [PHASES.ROLL_DICE, PHASES.ACTION_CHOICE, PHASES.MOVING];
            if (actionPhases.includes(phase) && MobileUI._activeDrawer !== 'action') {
                MobileUI.toggle('action');
            }
        }
    },

    // ═══════════════════════════════════════════
    // MINI NOTEBOOK (Right panel, always visible)
    // ═══════════════════════════════════════════

    updateMiniNotebook() {
        const human = GameState.players[0];
        if (!human) return;
        const nb = human.notebook;
        const notes = human.notebookNotes || {};
        const container = document.getElementById('mini-notebook-content');

        const categories = [
            { key: 'conspiradores', title: t('cat.conspiradores'), cards: CARDS.conspiradores },
            { key: 'metodos', title: t('cat.metodos'), cards: CARDS.metodos },
            { key: 'lugares', title: t('cat.lugares'), cards: CARDS.lugares },
            { key: 'motivos', title: t('cat.motivos'), cards: CARDS.motivos }
        ];

        let html = '';
        for (let cat of categories) {
            const otherCards = cat.cards.filter(c => !human.cards.includes(c));
            const discarded = otherCards.filter(c => nb[c] === 'X').length;
            const unknown = otherCards.filter(c => nb[c] === '?').length;
            const glowClass = unknown === 1 ? ' glow' : '';

            html += '<div class="mn-category">';
            html += '<div class="mn-cat-header' + glowClass + '"><span>' + cat.title + '</span><span class="mn-progress">' + discarded + '/' + otherCards.length + '</span></div>';
            for (let card of cat.cards) {
                // Hide own cards from notebook — player already knows them
                if (human.cards.includes(card)) continue;
                const mark = nb[card] || '?';
                const hasNotes = !!notes[card];
                const markClass = mark === 'X' ? 'mark-discarded' : mark === 'O' ? 'mark-possible' : 'mark-unknown';
                const nameClass = mark === 'X' ? 'mn-name crossed' : 'mn-name';
                const noteIndicatorClass = hasNotes ? 'mn-note-indicator has-notes' : 'mn-note-indicator';
                html += '<div class="mn-row">';
                html += '<span class="' + nameClass + '">' + tc(card) + '</span>';
                html += '<span class="' + noteIndicatorClass + '" data-card="' + card + '">' + (hasNotes ? '\u270E' : '') + '</span>';
                html += '<span class="mn-mark ' + markClass + '" data-card="' + card + '" data-own="false">' + mark + '</span>';
                html += '</div>';
                // Note popover (hidden by default)
                const noteLines = notes[card] ? notes[card].split('\n') : [];
                html += '<div class="mn-note-popover hidden" data-card="' + card + '">';
                if (noteLines.length > 0) {
                    html += '<div class="mn-note-auto">' + noteLines.map(l => l.replace(/</g, '&lt;')).join('<br>') + '</div>';
                }
                html += '<input class="mn-note-input" placeholder="' + t('note.addPlaceholder') + '" data-card="' + card + '" />';
                html += '</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        // Use event delegation (attach once) instead of per-element listeners
        if (!this._miniNotebookDelegated) {
            this._miniNotebookDelegated = true;

            container.addEventListener('click', (e) => {
                const target = e.target;

                // Note indicator or name clicks → toggle popover
                if (target.classList.contains('mn-note-indicator') || target.classList.contains('mn-name')) {
                    const card = target.dataset.card || target.parentElement.querySelector('.mn-note-indicator')?.dataset.card;
                    if (!card) return;
                    const popover = container.querySelector('.mn-note-popover[data-card="' + card + '"]');
                    if (!popover) return;
                    container.querySelectorAll('.mn-note-popover').forEach(p => {
                        if (p !== popover) p.classList.add('hidden');
                    });
                    popover.classList.toggle('hidden');
                    if (!popover.classList.contains('hidden')) {
                        const input = popover.querySelector('.mn-note-input');
                        if (input) input.focus();
                    }
                    return;
                }

                // Mark clicks → cycle ?, X, O
                if (target.classList.contains('mn-mark') && target.dataset.own !== 'true') {
                    const human = GameState.players[0];
                    if (!human) return;
                    const card = target.dataset.card;
                    const cur = human.notebook[card];
                    const next = cur === '?' ? 'X' : cur === 'X' ? 'O' : '?';
                    human.notebook[card] = next;
                    target.textContent = next;
                    target.className = 'mn-mark ' + (next === 'X' ? 'mark-discarded' : next === 'O' ? 'mark-possible' : 'mark-unknown');
                    const nameEl = target.parentElement.querySelector('.mn-name');
                    if (nameEl) nameEl.className = next === 'X' ? 'mn-name crossed' : 'mn-name';
                    this.updateMiniNotebookProgress();
                }
            });

            container.addEventListener('keydown', (e) => {
                const input = e.target;
                if (!input.classList.contains('mn-note-input')) return;
                if (e.key === 'Enter' && input.value.trim()) {
                    const card = input.dataset.card;
                    GameState.addCardNote(0, card, input.value.trim());
                    input.value = '';
                    this.updateMiniNotebook();
                }
            });
        }
    },

    updateMiniNotebookProgress() {
        const human = GameState.players[0];
        if (!human) return;
        const nb = human.notebook;
        const categories = [
            { cards: CARDS.conspiradores },
            { cards: CARDS.metodos },
            { cards: CARDS.lugares },
            { cards: CARDS.motivos }
        ];
        const headers = document.querySelectorAll('#mini-notebook-content .mn-cat-header');
        headers.forEach((hdr, i) => {
            if (i >= categories.length) return;
            const cat = categories[i];
            const discarded = cat.cards.filter(c => nb[c] === 'X').length;
            const unknown = cat.cards.filter(c => nb[c] === '?').length;
            hdr.querySelector('.mn-progress').textContent = discarded + '/' + cat.cards.length;
            hdr.classList.toggle('glow', unknown === 1);
        });
    },

    // ═══════════════════════════════════════════
    // PLAYER CARDS (Left panel)
    // ═══════════════════════════════════════════

    initCards() {
        const container = document.getElementById('player-cards');
        container.innerHTML = '';
        const human = GameState.players[0];
        if (!human) return;
        for (let card of human.cards) {
            const div = document.createElement('div');
            div.className = 'player-card-tile cat-' + getCardCategory(card);
            div.textContent = tc(card);
            container.appendChild(div);
        }
    },

    // ═══════════════════════════════════════════
    // BOTTOM LOG
    // ═══════════════════════════════════════════

    updateLog() {
        const container = document.getElementById('bottom-log');
        const entries = GameState.log.slice(-15);
        container.innerHTML = entries.map(e => '<div class="log-entry">&gt; ' + e + '</div>').join('');
        container.scrollTop = container.scrollHeight;
    },

    toggleLog() {
        const bar = document.getElementById('bottom-bar');
        this._logExpanded = !this._logExpanded;
        bar.classList.toggle('expanded', this._logExpanded);
    },

    // ═══════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════

    onRollDice(chosenValue) {
        if (GameState.phase !== PHASES.ROLL_DICE) return;
        const cp = GameState.currentPlayer();
        if (!cp.isHuman) return;
        const val = GameState.rollDice(chosenValue || undefined);
        const penalty = GameState.eventDicePenalty + (GameState.narrativeDicePenalty || 0);
        const effective = GameState.movesRemaining;
        const penaltyText = penalty > 0 ? t('log.rolledDicePenalty', { penalty: penalty, effective: effective }) : '';
        GameState.addLog(t('log.rolledDice', { value: val, penalty: penaltyText }));

        if (typeof Board3D !== 'undefined' && Board3D._camera) {
            Board3D.focusOnRoom(cp.roomIndex);
        }

        this.showDiceAnimation(val, () => {
            // Keep camera focused on player during movement phase
            Board.updateHighlights();
            Board.draw();
            this.updateHUD();
            this.updateLog();
        });
    },

    showDiceAnimation(value, callback) {
        const overlay = document.getElementById('dice-overlay');
        const cube = overlay.querySelector('.dice-cube');
        const label = overlay.querySelector('.dice-result-label');

        // Final rotations so the correct face points toward the viewer
        const faceRotations = {
            1: 'rotateX(0deg) rotateY(0deg)',
            2: 'rotateX(90deg) rotateY(0deg)',
            3: 'rotateX(0deg) rotateY(-90deg)',
            4: 'rotateX(0deg) rotateY(90deg)',
            5: 'rotateX(-90deg) rotateY(0deg)',
            6: 'rotateX(180deg) rotateY(0deg)'
        };

        // Reset state
        overlay.classList.remove('hidden', 'fade-out');
        cube.classList.remove('tumbling', 'settling');
        cube.style.transform = '';
        label.classList.add('fade-hidden');
        label.textContent = '';

        // Phase 1: Tumble (1.2s)
        requestAnimationFrame(() => {
            cube.classList.add('tumbling');
        });

        // Phase 2: Settle to final face
        setTimeout(() => {
            cube.classList.remove('tumbling');
            cube.classList.add('settling');
            cube.style.transform = faceRotations[value];
        }, 1200);

        // Phase 3: Show result label
        setTimeout(() => {
            label.textContent = value;
            label.classList.remove('fade-hidden');
        }, 1700);

        // Phase 4: Fade out and clean up
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('fade-out');
                cube.classList.remove('settling');
                cube.style.transform = '';
                if (callback) callback();
            }, 250);
        }, 2200);
    },

    onEndMovement() {
        if (GameState.phase !== PHASES.MOVING) return;
        GameState.movesRemaining = 0;
        Game.afterMove();
    },

    onSkipAction() {
        if (GameState.phase !== PHASES.ACTION_CHOICE) return;
        Game.endTurn();
    },

    // ═══════════════════════════════════════════
    // SUSPICION (Card Picker)
    // ═══════════════════════════════════════════

    _buildCardPickRow(cards, pickGroup) {
        const nb = GameState.players[0].notebook;
        return cards.map(card => {
            const mark = nb[card] || '?';
            let statusClass = '';
            if (mark === 'X') statusClass = 'dimmed';
            else if (mark === 'O') statusClass = 'possible';
            return '<div class="card-pick ' + statusClass + '" data-card="' + card + '" data-pick="' + pickGroup + '">' + tc(card) + '</div>';
        }).join('');
    },

    _bindCardPicker(panel, confirmBtnId) {
        panel.querySelectorAll('.card-pick').forEach(el => {
            el.addEventListener('click', () => {
                const group = el.dataset.pick;
                panel.querySelectorAll('.card-pick[data-pick="' + group + '"]').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                this._updatePickerConfirm(panel, confirmBtnId);
            });
        });
    },

    _updatePickerConfirm(panel, confirmBtnId) {
        const groups = new Set();
        panel.querySelectorAll('.card-pick').forEach(el => groups.add(el.dataset.pick));
        const allSelected = Array.from(groups).every(g =>
            panel.querySelector('.card-pick[data-pick="' + g + '"].selected')
        );
        const btn = document.getElementById(confirmBtnId);
        if (btn) btn.disabled = !allSelected;
    },

    _getPickerSelection(panel, group) {
        const sel = panel.querySelector('.card-pick[data-pick="' + group + '"].selected');
        return sel ? sel.dataset.card : null;
    },

    openSuspicion() {
        if (GameState.phase !== PHASES.ACTION_CHOICE) return;
        GameState.phase = PHASES.SUSPICION_INPUT;

        const cp = GameState.currentPlayer();
        this._suspicionStep = 0;
        this._suspicionSelections = {};
        this._suspicionFanAnimating = false;

        const inAdditionalRoom = isAdditionalRoom(cp.roomIndex);
        this._suspicionSteps = inAdditionalRoom ? SUSPICION_STEPS_ADDITIONAL : SUSPICION_STEPS_CORE;
        const roomCard = inAdditionalRoom ? null : ROOM_NAMES[cp.roomIndex];
        const panel = document.getElementById('suspicion-panel');

        // Build lugar slot: filled for core rooms, waiting for additional rooms
        const lugarSlotHtml = inAdditionalRoom
            ? '<div class="suspicion-table-slot waiting" data-slot="lugar" id="sus-slot-lugar">' +
                  '<span class="suspicion-table-slot-label">' + t('suspicion.lugar') + '</span>' +
              '</div>'
            : '<div class="suspicion-table-slot filled" data-slot="lugar" id="sus-slot-lugar">' +
                  this._buildTableCard(roomCard, 'lugar') +
                  '<span class="suspicion-table-slot-label">' + t('suspicion.autoPlace') + '</span>' +
              '</div>';

        // Build step dots
        let dotsHtml = '';
        for (let d = 0; d < this._suspicionSteps.length; d++) {
            dotsHtml += '<div class="suspicion-step-dot' + (d === 0 ? ' active' : '') + '" id="sus-dot-' + d + '"></div>';
        }

        const suspHelpKey = inAdditionalRoom ? 'help.SUSPICION_START_ADDITIONAL' : 'help.SUSPICION_START';
        const suspHelpTip = GameState.helpEnabled ? '<div class="help-tip-inline suspicion-help-tip">' + t(suspHelpKey) + '</div>' : '';
        panel.innerHTML =
            '<div class="suspicion-header">' +
                suspHelpTip +
                '<button class="btn-secondary suspicion-cancel-btn" onclick="UI.cancelSuspicion()">' + t('btn.cancel') + '</button>' +
            '</div>' +
            '<div class="suspicion-table">' +
                '<div class="suspicion-table-title">' + t('suspicion.tableTitle') + '</div>' +
                '<div class="suspicion-table-slots">' +
                    '<div class="suspicion-table-slot waiting" data-slot="conspirador" id="sus-slot-conspirador">' +
                        '<span class="suspicion-table-slot-label">' + t('suspicion.conspirador') + '</span>' +
                    '</div>' +
                    '<div class="suspicion-table-slot waiting" data-slot="metodo" id="sus-slot-metodo">' +
                        '<span class="suspicion-table-slot-label">' + t('suspicion.metodo') + '</span>' +
                    '</div>' +
                    lugarSlotHtml +
                    '<div class="suspicion-table-slot waiting" data-slot="motivo" id="sus-slot-motivo">' +
                        '<span class="suspicion-table-slot-label">' + t('suspicion.motivo') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="suspicion-step-indicator" id="sus-step-indicator">' +
                dotsHtml +
                '<span class="suspicion-step-label" id="sus-step-label">' + t(this._suspicionSteps[0].labelKey) + '</span>' +
            '</div>' +
            '<div class="suspicion-fan-area">' +
                '<div class="suspicion-fan" id="sus-fan"></div>' +
            '</div>' +
            '<div class="suspicion-buttons" id="sus-buttons">' +
                '<button class="btn-primary" onclick="UI.confirmSuspicion()">' + t('btn.investigate') + '</button>' +
            '</div>';

        document.getElementById('suspicion-overlay').classList.add('active');
        this.updateHUD();

        // Start first fan after overlay entrance animation
        setTimeout(() => this._renderFanStep(0), 350);
    },

    _buildTableCard(card, category) {
        return '<div class="table-card">' +
            '<div class="fan-card-inner" data-cat="' + category + '">' +
                '<div class="fan-card-category" data-cat="' + category + '"></div>' +
                '<div class="fan-card-name">' + tc(card) + '</div>' +
            '</div>' +
        '</div>';
    },

    _renderFanStep(stepIndex) {
        const step = this._suspicionSteps[stepIndex];
        const fan = document.getElementById('sus-fan');
        if (!fan) return;
        const nb = GameState.players[0].notebook;
        const cards = step.cards;
        const n = cards.length;

        const totalSpread = n > 6 ? 40 : 50;
        const startAngle = -totalSpread / 2;
        const angleStep = n > 1 ? totalSpread / (n - 1) : 0;
        // Horizontal spread: cards also shift left/right from center
        // Responsive: fit within available width (fan container)
        // Account for rotation adding ~30% extra apparent width
        const fanWidth = fan.parentElement ? fan.parentElement.clientWidth : window.innerWidth;
        const cardW = window.innerWidth <= 600 ? 70 : 100;
        const rotMargin = cardW * 0.55;
        const usableWidth = fanWidth - cardW - rotMargin * 2;
        const maxSpread = Math.max(15, usableWidth / Math.max(n - 1, 1));
        const hSpread = Math.min(55, maxSpread);
        const centerIdx = (n - 1) / 2;

        fan.innerHTML = '';

        cards.forEach((card, i) => {
            const angle = startAngle + angleStep * i;
            const hOffset = (i - centerIdx) * hSpread;
            const mark = nb[card] || '?';
            let statusClass = 'unknown';
            let markText = '?';
            if (mark === 'X') { statusClass = 'dimmed'; markText = '✗'; }
            else if (mark === 'O') { statusClass = 'possible'; markText = '✓'; }

            const el = document.createElement('div');
            el.className = 'fan-card ' + statusClass;
            el.dataset.card = card;
            el.dataset.index = i;
            const rot = 'rotate(' + angle + 'deg)';
            const trans = 'translateX(' + hOffset + 'px) rotate(' + angle + 'deg)';
            el.style.setProperty('--fan-rotation', trans);
            el.style.transform = trans;
            el.style.zIndex = i + 1;
            el.style.left = 'calc(50% - ' + (cardW / 2) + 'px)';
            el.style.bottom = '-20px';

            el.innerHTML =
                '<div class="fan-card-inner" data-cat="' + step.key + '">' +
                    '<div class="fan-card-category" data-cat="' + step.key + '"></div>' +
                    '<div class="fan-card-name">' + tc(card) + '</div>' +
                    '<div class="fan-card-mark">' + markText + '</div>' +
                '</div>';

            el.style.animation = 'fanCardEnter 0.4s ease-out ' + (i * 60) + 'ms both';

            el.addEventListener('click', () => this._onFanCardClick(card, step.key, el));

            fan.appendChild(el);
        });
    },

    _onFanCardClick(card, category, cardEl) {
        if (this._suspicionFanAnimating) return;
        this._suspicionFanAnimating = true;

        this._suspicionSelections[category] = card;

        const slotEl = document.getElementById('sus-slot-' + category);
        const cardRect = cardEl.getBoundingClientRect();
        const slotRect = slotEl.getBoundingClientRect();

        const dx = (slotRect.left + slotRect.width / 2) - (cardRect.left + cardRect.width / 2);
        const dy = (slotRect.top + slotRect.height / 2) - (cardRect.top + cardRect.height / 2);

        const fan = document.getElementById('sus-fan');
        const otherCards = fan.querySelectorAll('.fan-card:not([data-card="' + card + '"])');

        const currentTransform = cardEl.style.transform;
        cardEl.style.zIndex = 200;

        // Fly card to table slot
        const flyAnim = cardEl.animate([
            { transform: currentTransform, opacity: 1 },
            { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(0deg) scale(0.95)', opacity: 1, offset: 0.7 },
            { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(0deg) scale(1)', opacity: 1 }
        ], {
            duration: 500,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
            fill: 'forwards'
        });

        // Slide remaining cards out
        otherCards.forEach((c, i) => {
            const rot = c.style.getPropertyValue('--fan-rotation');
            c.animate([
                { transform: rot + ' translateY(0)', opacity: 1 },
                { transform: rot + ' translateY(200px)', opacity: 0 }
            ], {
                duration: 300,
                delay: 80 + i * 30,
                easing: 'ease-in',
                fill: 'forwards'
            });
        });

        flyAnim.onfinish = () => {
            // Place card on table (clickable to undo)
            slotEl.innerHTML = this._buildTableCard(card, category) +
                '<span class="suspicion-table-slot-label">' + t('suspicion.' + category) + '</span>';
            slotEl.classList.remove('waiting');
            slotEl.classList.add('filled');
            slotEl.style.cursor = 'pointer';
            slotEl.onclick = () => this._undoSlotSelection(category);

            const tableCard = slotEl.querySelector('.table-card');
            if (tableCard) tableCard.style.animation = 'cardLandBounce 0.3s ease-out';

            fan.innerHTML = '';

            // Update step dots
            const dotEl = document.getElementById('sus-dot-' + this._suspicionStep);
            if (dotEl) { dotEl.classList.remove('active'); dotEl.classList.add('completed'); }

            this._suspicionStep++;

            if (this._suspicionStep < this._suspicionSteps.length) {
                const nextDot = document.getElementById('sus-dot-' + this._suspicionStep);
                if (nextDot) nextDot.classList.add('active');
                const nextStep = this._suspicionSteps[this._suspicionStep];
                const label = document.getElementById('sus-step-label');
                if (label) label.textContent = t(nextStep.labelKey);

                setTimeout(() => {
                    this._renderFanStep(this._suspicionStep);
                    this._suspicionFanAnimating = false;
                }, 250);
            } else {
                // All done — show confirm button
                const label = document.getElementById('sus-step-label');
                if (label) label.textContent = '✓ ' + t('btn.investigate');
                if (GameState.helpEnabled) {
                    const btns = document.getElementById('sus-buttons');
                    btns.insertAdjacentHTML('beforebegin', '<div class="help-tip-inline">' + t('help.SUSPICION_CONFIRM') + '</div>');
                }
                document.getElementById('sus-buttons').classList.add('visible');
                this._suspicionFanAnimating = false;
            }
        };
    },

    _undoSlotSelection(category) {
        if (this._suspicionFanAnimating) return;

        // Find which step index corresponds to this category
        const targetStep = this._suspicionSteps.findIndex(s => s.key === category);
        if (targetStep < 0) return;

        // Clear selections from this step onwards
        for (let i = targetStep; i < this._suspicionSteps.length; i++) {
            const key = this._suspicionSteps[i].key;
            delete this._suspicionSelections[key];
            const slot = document.getElementById('sus-slot-' + key);
            if (slot && slot.classList.contains('filled')) {
                // Don't undo auto-filled lugar in core rooms
                if (key === 'lugar' && !this._suspicionSteps.find(s => s.key === 'lugar')) continue;
                slot.innerHTML = '<span class="suspicion-table-slot-label">' + t('suspicion.' + key) + '</span>';
                slot.classList.remove('filled');
                slot.classList.add('waiting');
                slot.style.cursor = '';
                slot.onclick = null;
            }
            // Reset step dots
            const dot = document.getElementById('sus-dot-' + i);
            if (dot) { dot.classList.remove('completed', 'active'); }
        }

        // Set step to target
        this._suspicionStep = targetStep;
        const dot = document.getElementById('sus-dot-' + targetStep);
        if (dot) dot.classList.add('active');
        const label = document.getElementById('sus-step-label');
        if (label) label.textContent = t(this._suspicionSteps[targetStep].labelKey);

        // Hide confirm button
        const btns = document.getElementById('sus-buttons');
        if (btns) btns.classList.remove('visible');
        // Remove confirm help tip if present
        const confirmTip = btns ? btns.previousElementSibling : null;
        if (confirmTip && confirmTip.classList.contains('help-tip-inline')) confirmTip.remove();

        // Render fan for target step
        this._renderFanStep(targetStep);
    },

    confirmSuspicion() {
        const cp = GameState.currentPlayer();
        const lugar = this._suspicionSelections.lugar || ROOM_NAMES[cp.roomIndex];
        const suspicion = {
            conspirador: this._suspicionSelections.conspirador,
            metodo: this._suspicionSelections.metodo,
            lugar: lugar,
            motivo: this._suspicionSelections.motivo
        };
        if (!suspicion.conspirador || !suspicion.metodo || !suspicion.lugar || !suspicion.motivo) return;
        GameState.activeSuspicion = suspicion;
        GameState.addLog(t('log.suspicion', {
            conspirador: tc(suspicion.conspirador),
            metodo: tc(suspicion.metodo),
            lugar: tr(cp.roomIndex),
            motivo: tc(suspicion.motivo)
        }));
        GameState.phase = PHASES.REFUTATION_ROUND;
        closeOverlay('suspicion-overlay', () => {
            this.updateLog();
            Refutation.start();
        });
    },

    cancelSuspicion() {
        this._suspicionStep = 0;
        this._suspicionSelections = {};
        this._suspicionFanAnimating = false;
        GameState.phase = PHASES.ACTION_CHOICE;
        closeOverlay('suspicion-overlay', () => {
            this.updateHUD();
        });
    },

    // ═══════════════════════════════════════════
    // ACCUSATION (Card Picker + Double Confirm)
    // ═══════════════════════════════════════════

    openAccusation() {
        if (GameState.phase !== PHASES.ACTION_CHOICE) return;
        const cp = GameState.currentPlayer();
        if (cp.roomIndex !== THRONE_ROOM_INDEX) return;
        if (!Reputation.canPlayerAccuse(cp.id)) {
            GameState.addLog(t('rep.cannotAccuse'));
            this.updateLog();
            return;
        }
        GameState.phase = PHASES.ACCUSATION;

        // Penalty preview
        const penalty = Reputation.getAccusationPenalty(cp.id);
        let penaltyText = '';
        if (penalty === 'eliminated') penaltyText = t('accusation.penaltyEliminated');
        else if (penalty === 'lose_rep_no_accuse') penaltyText = t('accusation.penaltyNoAccuse');
        else penaltyText = t('accusation.penaltyStay');

        const panel = document.getElementById('accusation-panel');
        panel.innerHTML = `
            <div class="overlay-title" style="color:#E74C3C">${t('overlay.accusation')}</div>
            <div class="accusation-warning">
                <div class="warning-text">${t('accusation.warning')}</div>
                <div class="accusation-penalty-preview">${penaltyText}</div>
            </div>
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ACCUSATION_SCENE') + '</div>' : ''}
            <div class="card-picker-section">
                <div class="card-picker-label">${t('suspicion.conspirador')}</div>
                <div class="card-picker-row">${this._buildCardPickRow(CARDS.conspiradores, 'conspirador')}</div>
            </div>
            <div class="card-picker-section">
                <div class="card-picker-label">${t('suspicion.metodo')}</div>
                <div class="card-picker-row">${this._buildCardPickRow(CARDS.metodos, 'metodo')}</div>
            </div>
            <div class="card-picker-section">
                <div class="card-picker-label">${t('suspicion.lugar')}</div>
                <div class="card-picker-row">${this._buildCardPickRow(CARDS.lugares, 'lugar')}</div>
            </div>
            <div class="card-picker-section">
                <div class="card-picker-label">${t('suspicion.motivo')}</div>
                <div class="card-picker-row">${this._buildCardPickRow(CARDS.motivos, 'motivo')}</div>
            </div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelAccusation()">${t('btn.cancel')}</button>
                <button class="btn-danger" id="accusation-confirm-btn" disabled onclick="UI.confirmAccusation()">${t('btn.accuse_action')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        this._bindCardPicker(panel, 'accusation-confirm-btn');
        document.getElementById('accusation-overlay').classList.add('active');
        this.updateHUD();
    },

    _accusationConfirmed: false,

    confirmAccusation() {
        const btn = document.getElementById('accusation-confirm-btn');
        if (!this._accusationConfirmed) {
            this._accusationConfirmed = true;
            btn.textContent = t('accusation.confirmPrompt');
            btn.disabled = true;
            setTimeout(() => { btn.disabled = false; }, 1000);
            return;
        }
        this._accusationConfirmed = false;

        const panel = document.getElementById('accusation-panel');
        const accusation = {
            conspirador: this._getPickerSelection(panel, 'conspirador'),
            metodo: this._getPickerSelection(panel, 'metodo'),
            lugar: this._getPickerSelection(panel, 'lugar'),
            motivo: this._getPickerSelection(panel, 'motivo')
        };
        if (!accusation.conspirador || !accusation.metodo || !accusation.lugar || !accusation.motivo) return;

        const correct = GameState.checkAccusation(accusation);
        GameState.addLog(t('log.accusation', {
            conspirador: tc(accusation.conspirador),
            metodo: tc(accusation.metodo),
            lugar: tc(accusation.lugar),
            motivo: tc(accusation.motivo),
            result: correct ? t('log.accusationCorrectResult') : t('log.accusationIncorrectResult')
        }));
        closeOverlay('accusation-overlay', () => {
            this.updateLog();
            Game.onAccusationComplete(correct);
        });
    },

    cancelAccusation() {
        this._accusationConfirmed = false;
        GameState.phase = PHASES.ACTION_CHOICE;
        closeOverlay('accusation-overlay', () => {
            this.updateHUD();
        });
    },

    // ═══════════════════════════════════════════
    // NOTEBOOK (Full Overlay)
    // ═══════════════════════════════════════════

    openNotebook() {
        const human = GameState.players[0];
        const nb = human.notebook;
        const notes = human.notebookNotes || {};
        const panel = document.getElementById('notebook-panel');

        const buildCol = (cats) => {
            let html = '';
            for (let cat of cats) {
                html += '<div class="notebook-cat-title">' + cat.title + '</div>';
                for (let card of cat.cards) {
                    // Hide own cards from notebook — player already knows them
                    if (human.cards.includes(card)) continue;
                    const mark = nb[card] || '?';
                    const markClass = mark === 'X' ? 'mark-discarded' : mark === 'O' ? 'mark-possible' : 'mark-unknown';
                    const nameClass = mark === 'X' ? 'notebook-card-name crossed' : 'notebook-card-name';
                    html += '<div class="notebook-row">';
                    html += '<span class="' + nameClass + '">' + tc(card) + '</span>';
                    html += '<div class="notebook-mark ' + markClass + '" data-card="' + card + '" data-own="false">' + mark + '</div>';
                    html += '</div>';
                    // Notes section for this card
                    const cardNotes = notes[card];
                    html += '<div class="notebook-card-notes" data-card="' + card + '">';
                    if (cardNotes) {
                        const lines = cardNotes.split('\n');
                        for (let line of lines) {
                            html += '<div class="note-line auto">' + line.replace(/</g, '&lt;') + '</div>';
                        }
                    }
                    html += '<input class="notebook-note-input" placeholder="' + t('note.addPlaceholder') + '" data-card="' + card + '" />';
                    html += '</div>';
                }
            }
            return html;
        };

        const leftCats = [
            { title: t('cat.conspiradores'), cards: CARDS.conspiradores },
            { title: t('cat.metodos'), cards: CARDS.metodos }
        ];
        const rightCats = [
            { title: t('cat.lugares'), cards: CARDS.lugares },
            { title: t('cat.motivos'), cards: CARDS.motivos }
        ];

        // Build clue log section
        let clueLogHtml = '';
        const recentClues = GameState.clueLog.filter(c => c.playerId === 0).slice(-8);
        if (recentClues.length > 0) {
            const clueTypeIcon = (type) => {
                if (type === 'rumor') return '\u26A0\uFE0F ';
                if (type === 'evidencia') return '\uD83D\uDD0D ';
                if (type === 'archivo') return '\uD83D\uDCDC ';
                if (type === 'interrogatorio') return '\uD83D\uDDE3 ';
                return '';
            };
            clueLogHtml = '<div class="clue-log-section"><div class="clue-log-title">' + t('notebook.cluesReceived') + '</div>';
            for (let i = recentClues.length - 1; i >= 0; i--) {
                const c = recentClues[i];
                clueLogHtml += '<div class="clue-log-entry ' + (c.type || '') + '">' + clueTypeIcon(c.type) + '[R' + (c.round || '?') + '] ' + c.text + '</div>';
            }
            clueLogHtml += '<div class="clue-log-legend">'
                + '\uD83D\uDD0D ' + t('clueLabel.evidencia') + ' &nbsp; '
                + '\uD83D\uDCDC ' + t('clueLabel.archivo') + ' &nbsp; '
                + '\uD83D\uDDE3 ' + t('clueLabel.interrogatorio') + ' &nbsp; '
                + '\u26A0\uFE0F ' + t('clueLabel.rumor') + ' (' + t('clue.rumorWarning') + ')'
                + '</div>';
            clueLogHtml += '</div>';
        }

        panel.innerHTML = `
            <div class="overlay-title">${t('overlay.notebook')}</div>
            <hr class="parchment-divider">
            <div class="notebook-columns">
                <div class="notebook-col">${buildCol(leftCats)}</div>
                <div class="notebook-col">${buildCol(rightCats)}</div>
            </div>
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.NOTEBOOK') + '</div>' : ''}
            <div class="notebook-legend">${t('notebook.legend')}</div>
            ${clueLogHtml}
            ${this._buildStoryCollectionHtml()}
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.closeNotebook()">${t('btn.close')}</button>
            </div>
        `;
        wrapOverlayBody(panel);

        // Bind mark clicks
        panel.querySelectorAll('.notebook-mark').forEach(el => {
            if (el.dataset.own === 'true') return;
            el.addEventListener('click', () => {
                const card = el.dataset.card;
                const cur = human.notebook[card];
                const next = cur === '?' ? 'X' : cur === 'X' ? 'O' : '?';
                human.notebook[card] = next;
                el.textContent = next;
                el.className = 'notebook-mark ' + (next === 'X' ? 'mark-discarded' : next === 'O' ? 'mark-possible' : 'mark-unknown');
                const nameEl = el.parentElement.querySelector('.notebook-card-name');
                nameEl.className = next === 'X' ? 'notebook-card-name crossed' : 'notebook-card-name';
                // Also update mini-notebook
                this.updateMiniNotebook();
            });
        });

        // Bind note inputs in full notebook
        panel.querySelectorAll('.notebook-note-input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    const card = input.dataset.card;
                    GameState.addCardNote(0, card, input.value.trim());
                    input.value = '';
                    // Add the note line visually
                    const notesDiv = input.parentElement;
                    const newLine = document.createElement('div');
                    newLine.className = 'note-line';
                    newLine.textContent = input.value || '';
                    // Re-read the latest note
                    const allNotes = (human.notebookNotes[card] || '').split('\n');
                    newLine.textContent = allNotes[allNotes.length - 1];
                    notesDiv.insertBefore(newLine, input);
                    this.updateMiniNotebook();
                }
            });
        });

        document.getElementById('notebook-overlay').classList.add('active');
    },

    closeNotebook() {
        closeOverlay('notebook-overlay');
        this.updateMiniNotebook();
    },

    // ═══════════════════════════════════════════
    // ROOM ACTIONS
    // ═══════════════════════════════════════════

    _getRoomTheme(roomIdx) {
        return getRoomTheme(roomIdx) || '';
    },

    _applyRoomTheme(panel, roomIdx) {
        panel.setAttribute('data-room-theme', this._getRoomTheme(roomIdx));
    },

    openRoomAction() {
        if (GameState.phase !== PHASES.ACTION_CHOICE) return;
        const cp = GameState.currentPlayer();
        if (!cp.isHuman) return;
        const action = getRoomAction(cp.roomIndex);
        if (!action || !action.type) return;
        if (GameState.roomActionUsedThisTurn) return;

        const inAdditional = isAdditionalRoom(cp.roomIndex);
        switch (action.type) {
            case 'evidencia':
                if (inAdditional) this.renderGenericEvidenciaAction(cp.roomIndex, action);
                else this.renderTorreAction();
                break;
            case 'archivo':
                if (inAdditional) this.renderGenericArchivoAction(cp.roomIndex, action);
                else this.renderBibliotecaAction();
                break;
            case 'pista_metodo':
                if (inAdditional) this.renderGenericEvidenciaAction(cp.roomIndex, action, 'metodos');
                else this.renderArmeriaAction();
                break;
            case 'intuicion':
                if (inAdditional) this.renderGenericIntuicionAction(cp.roomIndex, action);
                else this.renderCapillaAction();
                break;
            case 'rumor': this.renderRumorAction(cp.roomIndex); break;
            case 'movimiento_extra': this.executeJardinesAction(); break;
            case 'interrogatorio':
                if (inAdditional) this.renderGenericInterrogatorioAction(cp.roomIndex, action);
                else this.renderMazmorrasAction();
                break;
            case 'bonus_item': this.renderBonusItemAction(); break;
            case 'reveal_random': this.renderRevealRandomAction(); break;
            case 'rep_bonus': this.renderRepBonusAction(); break;
        }
    },

    renderTorreAction() {
        const clue = GameState.generateEvidence();
        GameState.applyClueToNotebook(0, clue);
        GameState.addClue(0, clue);
        if (clue.card) {
            GameState.addCardNote(0, clue.card, 'R' + GameState.roundNumber + ': ' + t('note.evidence', { room: tr(0) }));
        }
        Reputation.change(0, 1);
        GameState.addLog(t('log.torre', { text: clue.text }));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, 0);
        panel.innerHTML = `
            <div class="overlay-title">\u{1F52E} ${t('roomAction.torre.title')}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_TORRE') + '</div>' : ''}
            <div class="overlay-subtitle">${t('roomAction.torre.subtitle')}</div>
            <div class="clue-result evidencia slide-in">
                <span class="clue-label">${t('clueLabel.evidencia')}</span>
                ${clue.text}
            </div>
            <div style="text-align:center;font-size:12px;color:#1e7a40;margin-top:4px">${t('roomAction.autoMarked')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    renderBibliotecaAction() {
        const categories = ['conspiradores', 'metodos', 'lugares', 'motivos'];
        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, 1);

        let booksHtml = categories.map(c =>
            '<div class="action-card" style="cursor:pointer" data-cat="' + c + '">' +
            '<div class="action-icon">\u{1F4D6}</div>' +
            '<div class="action-info"><div class="action-title">' + GameState.getCategoryLabel(c) + '</div></div></div>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">\u{1F4DC} ${t('roomAction.biblioteca.title')}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_BIBLIOTECA') + '</div>' : ''}
            <div class="overlay-subtitle">${t('roomAction.biblioteca.subtitle')}</div>
            <div id="biblioteca-books">${booksHtml}</div>
            <div id="biblioteca-result"></div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        // Bind book clicks
        panel.querySelectorAll('[data-cat]').forEach(el => {
            el.addEventListener('click', () => {
                const cat = el.dataset.cat;
                this.confirmArchive(cat);
            });
        });
    },

    confirmArchive(cat) {
        const clue = GameState.generateArchive(cat);
        GameState.applyClueToNotebook(0, clue);
        GameState.addClue(0, clue);
        if (clue.card) {
            GameState.addCardNote(0, clue.card, 'R' + GameState.roundNumber + ': ' + t('note.archive'));
        }
        Reputation.change(0, 1);
        GameState.addLog(t('log.biblioteca', { text: clue.text }));

        const cp = GameState.currentPlayer();
        const inAdd = isAdditionalRoom(cp.roomIndex);
        const act = getRoomAction(cp.roomIndex);
        const archTitleEmoji = inAdd ? (act?.emoji || '\u{1F4DC}') : '\u{1F4DC}';
        const archTitleText = inAdd ? tr(cp.roomIndex) : t('roomAction.biblioteca.title');

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title">${archTitleEmoji} ${archTitleText}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t('roomAction.biblioteca.resultSubtitle')}</div>
            <div class="clue-result archivo slide-in">
                <span class="clue-label">${t('clueLabel.archivo')}</span>
                ${clue.text}
            </div>
            ${clue.card ? '<div style="text-align:center;font-size:12px;color:#2573a0;margin-top:4px">' + t('roomAction.autoMarked') + '</div>' : ''}
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        this.updateLog();
    },

    renderArmeriaAction() {
        const clue = GameState.generateEvidence('metodos');
        GameState.applyClueToNotebook(0, clue);
        GameState.addClue(0, clue);
        if (clue.card) {
            GameState.addCardNote(0, clue.card, 'R' + GameState.roundNumber + ': ' + t('note.evidence', { room: tr(2) }));
        }
        Reputation.change(0, 1);
        GameState.addLog(t('log.armeria', { text: clue.text }));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, 2);
        panel.innerHTML = `
            <div class="overlay-title">\u{2694} ${t('roomAction.armeria.title')}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_ARMERIA') + '</div>' : ''}
            <div class="overlay-subtitle">${t('roomAction.armeria.subtitle')}</div>
            <div class="clue-result evidencia slide-in">
                <span class="clue-label">${t('clueLabel.evidenciaMethods')}</span>
                ${clue.text}
            </div>
            <div style="text-align:center;font-size:12px;color:#1e7a40;margin-top:4px">${t('roomAction.autoMarked')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    renderCapillaAction() {
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        if (otherPlayers.length === 0) { this.cancelRoomAction(); return; }

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, 3);

        // Player portraits
        let playersHtml = otherPlayers.map(p =>
            '<div class="refute-portrait" style="cursor:pointer;opacity:0.7" data-pid="' + p.id + '">' +
            '<div class="portrait-circle" style="background:' + p.color + '">' + p.name.charAt(4) + '</div>' +
            '<div class="portrait-name">' + p.name + '</div></div>'
        ).join('');

        // Category buttons
        let catHtml = ['conspiradores', 'metodos', 'lugares', 'motivos'].map(c =>
            '<button class="btn-nav" data-cat="' + c + '" style="opacity:0.5" disabled>' + GameState.getCategoryLabel(c) + '</button>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">\u{1F64F} ${t('roomAction.capilla.title')}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_CAPILLA') + '</div>' : ''}
            <div class="overlay-subtitle">${t('roomAction.capilla.subtitle')}</div>
            <div style="text-align:center;font-size:13px;color:#6d5a3f;margin-bottom:8px">${t('roomAction.capilla.askDesc')}</div>
            <div id="capilla-players" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${playersHtml}</div>
            <div id="capilla-cats" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${catHtml}</div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
                <button class="btn-primary" id="capilla-confirm" disabled onclick="UI.confirmCapilla()">${t('btn.ask')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        // Selection state
        let selectedPlayer = null;

        // Bind player clicks
        panel.querySelectorAll('[data-pid]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-pid]').forEach(p => p.style.opacity = '0.7');
                el.style.opacity = '1';
                el.style.boxShadow = '0 0 8px rgba(255,215,0,0.5)';
                selectedPlayer = parseInt(el.dataset.pid);
                // Enable category buttons
                panel.querySelectorAll('[data-cat]').forEach(b => { b.disabled = false; b.style.opacity = '1'; });
            });
        });

        panel.querySelectorAll('[data-cat]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-cat]').forEach(b => b.style.background = '');
                el.style.background = '#5a3a8a';
                el.dataset.selected = 'true';
                // Enable confirm
                if (selectedPlayer !== null) {
                    document.getElementById('capilla-confirm').disabled = false;
                }
            });
        });

        // Store selection getter
        this._capillaGetSelection = () => {
            const catEl = panel.querySelector('[data-cat][data-selected="true"]');
            return { playerId: selectedPlayer, cat: catEl ? catEl.dataset.cat : null };
        };
    },

    confirmCapilla() {
        const sel = this._capillaGetSelection();
        if (sel.playerId === null || !sel.cat) return;
        const target = GameState.players[sel.playerId];
        const cat = sel.cat;
        const catCards = CARDS[cat];
        const hasCard = target.cards.some(c => catCards.includes(c));
        const answer = hasCard ? t('misc.yes') : t('misc.no');
        const answerColor = hasCard ? '#2ECC71' : '#E74C3C';

        const clueText = hasCard ? t('clue.hasCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) }) : t('clue.noCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) });
        const clue = { type: 'interrogatorio', text: clueText, round: GameState.roundNumber };
        GameState.addClue(0, clue);
        Reputation.change(0, 1);
        GameState.addLog(t('log.capilla', { text: clue.text }));

        const cp = GameState.currentPlayer();
        const inAdd = isAdditionalRoom(cp.roomIndex);
        const act = getRoomAction(cp.roomIndex);
        const capTitleEmoji = inAdd ? (act?.emoji || '\u{1F64F}') : '\u{1F64F}';
        const capTitleText = inAdd ? tr(cp.roomIndex) : t('roomAction.capilla.title');

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title">${capTitleEmoji} ${capTitleText}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t('roomAction.capilla.resultSubtitle')}</div>
            <div class="clue-result interrogatorio slide-in">
                <span class="clue-label">${t('clueLabel.intuicion')}</span>
                ${t('roomAction.capilla.question', { name: target.name, category: GameState.getCategoryLabel(cat) })}
                <div style="font-size:24px;font-weight:bold;color:${answerColor};margin-top:8px">${answer}</div>
            </div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        this.updateLog();
    },

    renderRumorAction(roomIdx) {
        const clue = GameState.generateRumor(roomIdx);
        GameState.addClue(0, clue);
        if (clue.cardMentioned) {
            GameState.addCardNote(0, clue.cardMentioned, 'R' + GameState.roundNumber + ': ' + t('note.rumor', { room: tr(roomIdx) }));
        }
        GameState.addLog(t('log.rumor', { room: tr(roomIdx) }));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, roomIdx);
        const roomAct = getRoomAction(roomIdx);
        const emoji = roomAct ? roomAct.emoji : '';
        panel.innerHTML = `
            <div class="overlay-title">${emoji} ${tr(roomIdx)}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_RUMOR') + '</div>' : ''}
            <div class="overlay-subtitle">${roomAct ? t(roomAct.labelKey) : ''}</div>
            <div class="clue-result rumor slide-in">
                <span class="clue-label">${t('clueLabel.rumor')}</span>
                ${clue.text}
                <div class="clue-warning">${t('clue.rumorWarning')}</div>
            </div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    executeJardinesAction() {
        GameState.movesRemaining += 2;
        GameState.roomActionUsedThisTurn = true;
        GameState.phase = PHASES.MOVING;
        GameState.addLog(t('roomAction.jardines.log'));

        // Show floating notification
        this.showFloatNotification('+2 ' + t('roomActionLabel.7'));

        Board.updateHighlights();
        Board.draw();
        this.updateHUD();
        this.updateLog();
    },

    showFloatNotification(text) {
        const existing = document.querySelector('.float-notification');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'float-notification';
        div.textContent = text;
        document.getElementById('game-container').appendChild(div);
        setTimeout(() => div.remove(), 1500);
    },

    renderMazmorrasAction() {
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        if (otherPlayers.length === 0) { this.cancelRoomAction(); return; }

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, 8);

        // Player portraits
        let playersHtml = otherPlayers.map(p =>
            '<div class="refute-portrait" style="cursor:pointer;opacity:0.7" data-pid="' + p.id + '">' +
            '<div class="portrait-circle" style="background:' + p.color + '">' + p.name.charAt(4) + '</div>' +
            '<div class="portrait-name">' + p.name + '</div></div>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">\u{26D3} ${t('roomAction.mazmorras.title')}</div>
            <hr class="parchment-divider">
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.ROOM_MAZMORRAS') + '</div>' : ''}
            <div class="overlay-subtitle">${t('roomAction.mazmorras.subtitle')}</div>
            <div id="mazmorras-players" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${playersHtml}</div>
            <div class="overlay-row"><label>${t('roomAction.mazmorras.type')}</label><select id="mazmorras-type">
                <option value="carta">${t('roomAction.mazmorras.seeCard')}</option>
                <option value="pregunta">${t('roomAction.mazmorras.askQuestion')}</option>
            </select></div>
            <div id="mazmorras-cat-row" class="overlay-row" style="display:none"><label>${t('eventUI.category')}</label><select id="mazmorras-cat">
                <option value="conspiradores">${t('cat.conspiradores')}</option>
                <option value="metodos">${t('cat.metodos')}</option>
                <option value="lugares">${t('cat.lugares')}</option>
                <option value="motivos">${t('cat.motivos')}</option>
            </select></div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
                <button class="btn-primary" id="mazmorras-confirm" disabled onclick="UI.confirmMazmorras()">${t('btn.interrogate')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        // Selection state
        let selectedPlayer = null;
        this._mazmorrasPlayer = null;

        panel.querySelectorAll('[data-pid]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-pid]').forEach(p => { p.style.opacity = '0.7'; p.style.boxShadow = ''; });
                el.style.opacity = '1';
                el.style.boxShadow = '0 0 8px rgba(255,215,0,0.5)';
                this._mazmorrasPlayer = parseInt(el.dataset.pid);
                document.getElementById('mazmorras-confirm').disabled = false;
            });
        });

        document.getElementById('mazmorras-type').addEventListener('change', (e) => {
            document.getElementById('mazmorras-cat-row').style.display = e.target.value === 'pregunta' ? 'flex' : 'none';
        });
    },

    confirmMazmorras() {
        const targetId = this._mazmorrasPlayer;
        if (targetId === null) return;
        const type = document.getElementById('mazmorras-type').value;
        const target = GameState.players[targetId];

        // Dynamic title: use actual room name for additional rooms
        const cp = GameState.currentPlayer();
        const inAdditional = isAdditionalRoom(cp.roomIndex);
        const action = getRoomAction(cp.roomIndex);
        const titleEmoji = inAdditional ? (action?.emoji || '\u{26D3}') : '\u{26D3}';
        const titleText = inAdditional ? tr(cp.roomIndex) : t('roomAction.mazmorras.title');
        const resultTitle = `<div class="overlay-title">${titleEmoji} ${titleText}</div>`;

        if (type === 'carta') {
            if (target.cards.length === 0) {
                const panel = document.getElementById('roomaction-panel');
                panel.innerHTML = `
                    ${resultTitle}
                    <hr class="parchment-divider">
                    <div class="clue-result interrogatorio">
                        <span class="clue-label">${t('clueLabel.interrogatorio')}</span>
                        ${t('clue.noCardsToShow', { name: target.name })}
                    </div>
                    <div class="overlay-buttons">
                        <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
                    </div>
                `;
                wrapOverlayBody(panel);
                return;
            }
            const card = target.cards[Math.floor(Math.random() * target.cards.length)];
            GameState.markCardSeen(0, card);
            GameState.addCardNote(0, card, 'R' + GameState.roundNumber + ': ' + t('note.interrogation', { name: target.name }));
            Reputation.change(0, 1);
            GameState.addLog(t('log.mazmorras', { text: t('log.mazmorrasShowCard', { target: target.name, card: tc(card) }) }));

            const panel = document.getElementById('roomaction-panel');
            panel.innerHTML = `
                ${resultTitle}
                <hr class="parchment-divider">
                <div class="overlay-subtitle">${t('roomAction.mazmorras.resultSubtitle')}</div>
                <div class="clue-result interrogatorio slide-in">
                    <span class="clue-label">${t('clueLabel.interrogatorio')}</span>
                    ${t('clue.showsCard', { target: target.name })}
                    <div class="card-flip-container"><div class="card-flip">${tc(card)}</div></div>
                </div>
                <div style="text-align:center;font-size:12px;color:#7b3fa5;margin-top:4px">${t('roomAction.autoMarked')}</div>
                <div class="overlay-buttons">
                    <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
                </div>
            `;
            wrapOverlayBody(panel);
            // Trigger flip animation
            setTimeout(() => {
                const flipEl = panel.querySelector('.card-flip');
                if (flipEl) flipEl.classList.add('flipped');
            }, 100);
        } else {
            const cat = document.getElementById('mazmorras-cat').value;
            const catCards = CARDS[cat];
            const hasCard = target.cards.some(c => catCards.includes(c));
            const answer = hasCard ? t('misc.yes') : t('misc.no');
            const answerColor = hasCard ? '#2ECC71' : '#E74C3C';

            const clueText = hasCard ? t('clue.hasCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) }) : t('clue.noCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) });
            const clue = { type: 'interrogatorio', text: clueText, round: GameState.roundNumber };
            GameState.addClue(0, clue);
            GameState.addLog(t('log.mazmorras', { text: clue.text }));

            const panel = document.getElementById('roomaction-panel');
            panel.innerHTML = `
                ${resultTitle}
                <hr class="parchment-divider">
                <div class="overlay-subtitle">${t('roomAction.mazmorras.resultSubtitle')}</div>
                <div class="clue-result interrogatorio slide-in">
                    <span class="clue-label">${t('clueLabel.interrogatorio')}</span>
                    ${t('roomAction.mazmorras.question', { name: target.name, category: GameState.getCategoryLabel(cat) })}
                    <div style="font-size:24px;font-weight:bold;color:${answerColor};margin-top:8px">${answer}</div>
                </div>
                <div class="overlay-buttons">
                    <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
                </div>
            `;
            wrapOverlayBody(panel);
        }
        this.updateLog();
    },

    renderBonusItemAction() {
        const cp = GameState.currentPlayer();
        const action = getRoomAction(cp.roomIndex);
        const pickup = (typeof Inventory !== 'undefined') ? Inventory.tryPickup(cp.id, cp.roomIndex) : null;
        GameState.roomActionUsedThisTurn = true;

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, cp.roomIndex);
        if (pickup) {
            GameState.addLog(t('log.foundItem', { item: t('item.' + pickup.itemDef.id + '.name') }));
            panel.innerHTML = `
                <div class="overlay-title">${action.emoji} ${tr(cp.roomIndex)}</div>
                <hr class="parchment-divider">
                <div class="overlay-subtitle">${t(action.labelKey)}</div>
                <div class="clue-result evidencia slide-in">${t('item.' + pickup.itemDef.id + '.name')}</div>
                <div class="overlay-buttons">
                    <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
                </div>`;
        } else {
            panel.innerHTML = `
                <div class="overlay-title">${action.emoji} ${tr(cp.roomIndex)}</div>
                <hr class="parchment-divider">
                <div class="overlay-subtitle">${t(action.labelKey)}</div>
                <div class="clue-result flavor slide-in">${t(action.descKey)}</div>
                <div class="overlay-buttons">
                    <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
                </div>`;
        }
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    renderRevealRandomAction() {
        const cp = GameState.currentPlayer();
        const action = getRoomAction(cp.roomIndex);
        const others = GameState.players.filter(p => p.id !== cp.id && !p.isEliminated && p.cards.length > 0);
        let resultText = t(action.descKey);
        if (others.length > 0) {
            const target = others[Math.floor(Math.random() * others.length)];
            const card = target.cards[Math.floor(Math.random() * target.cards.length)];
            GameState.markCardSeen(cp.id, card);
            resultText = t('roomEvent.result.reveal', { target: target.name, card: tc(card) });
        }
        GameState.roomActionUsedThisTurn = true;
        Reputation.change(cp.id, 1);
        GameState.addLog(t('log.roomAction', { room: tr(cp.roomIndex) }));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, cp.roomIndex);
        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(cp.roomIndex)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div class="clue-result evidencia slide-in">${resultText}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>`;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    renderRepBonusAction() {
        const cp = GameState.currentPlayer();
        const action = getRoomAction(cp.roomIndex);
        Reputation.change(cp.id, 1);
        GameState.roomActionUsedThisTurn = true;
        GameState.addLog(t('roomEvent.result.repPlus'));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, cp.roomIndex);
        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(cp.roomIndex)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div class="clue-result flavor slide-in">${t(action.descKey)}</div>
            <div style="text-align:center;font-size:12px;color:#1e7a40;margin-top:4px">${t('roomEvent.result.repPlus')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>`;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    // ─── Generic renderers for additional rooms ───

    renderGenericEvidenciaAction(roomIdx, action, category) {
        const clue = category ? GameState.generateEvidence(category) : GameState.generateEvidence();
        GameState.applyClueToNotebook(0, clue);
        GameState.addClue(0, clue);
        if (clue.card) {
            GameState.addCardNote(0, clue.card, 'R' + GameState.roundNumber + ': ' + t('note.evidence', { room: tr(roomIdx) }));
        }
        Reputation.change(0, 1);
        GameState.addLog(t('log.roomAction', { room: tr(roomIdx) }));

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, roomIdx);
        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(roomIdx)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div class="clue-result evidencia slide-in">
                <span class="clue-label">${t('clueLabel.evidencia')}</span>
                ${clue.text}
            </div>
            <div style="text-align:center;font-size:12px;color:#1e7a40;margin-top:4px">${t('roomAction.autoMarked')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeRoomAction()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
        this.updateLog();
    },

    renderGenericArchivoAction(roomIdx, action) {
        const categories = ['conspiradores', 'metodos', 'lugares', 'motivos'];
        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, roomIdx);

        let booksHtml = categories.map(c =>
            '<div class="action-card" style="cursor:pointer" data-cat="' + c + '">' +
            '<div class="action-icon">\u{1F4D6}</div>' +
            '<div class="action-info"><div class="action-title">' + GameState.getCategoryLabel(c) + '</div></div></div>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(roomIdx)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div id="biblioteca-books">${booksHtml}</div>
            <div id="biblioteca-result"></div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        panel.querySelectorAll('[data-cat]').forEach(el => {
            el.addEventListener('click', () => {
                const cat = el.dataset.cat;
                this.confirmArchive(cat);
            });
        });
    },

    renderGenericIntuicionAction(roomIdx, action) {
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        if (otherPlayers.length === 0) { this.cancelRoomAction(); return; }

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, roomIdx);

        let playersHtml = otherPlayers.map(p =>
            '<div class="refute-portrait" style="cursor:pointer;opacity:0.7" data-pid="' + p.id + '">' +
            '<div class="portrait-circle" style="background:' + p.color + '">' + p.name.charAt(4) + '</div>' +
            '<div class="portrait-name">' + p.name + '</div></div>'
        ).join('');

        let catHtml = ['conspiradores', 'metodos', 'lugares', 'motivos'].map(c =>
            '<button class="btn-nav" data-cat="' + c + '" style="opacity:0.5" disabled>' + GameState.getCategoryLabel(c) + '</button>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(roomIdx)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div style="text-align:center;font-size:13px;color:#6d5a3f;margin-bottom:8px">${t('roomAction.capilla.askDesc')}</div>
            <div id="capilla-players" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${playersHtml}</div>
            <div id="capilla-cats" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${catHtml}</div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
                <button class="btn-primary" id="capilla-confirm" disabled onclick="UI.confirmCapilla()">${t('btn.ask')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        // Selection state (reuse same logic as core capilla)
        let selectedPlayer = null;
        panel.querySelectorAll('[data-pid]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-pid]').forEach(p => p.style.opacity = '0.7');
                el.style.opacity = '1';
                el.style.boxShadow = '0 0 8px rgba(255,215,0,0.5)';
                selectedPlayer = parseInt(el.dataset.pid);
                panel.querySelectorAll('[data-cat]').forEach(b => { b.disabled = false; b.style.opacity = '1'; });
            });
        });
        panel.querySelectorAll('[data-cat]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-cat]').forEach(b => b.style.background = '');
                el.style.background = '#5a3a8a';
                el.dataset.selected = 'true';
                if (selectedPlayer !== null) {
                    document.getElementById('capilla-confirm').disabled = false;
                }
            });
        });
        this._capillaGetSelection = () => {
            const catEl = panel.querySelector('[data-cat][data-selected="true"]');
            return { playerId: selectedPlayer, cat: catEl ? catEl.dataset.cat : null };
        };
    },

    renderGenericInterrogatorioAction(roomIdx, action) {
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        if (otherPlayers.length === 0) { this.cancelRoomAction(); return; }

        const panel = document.getElementById('roomaction-panel');
        this._applyRoomTheme(panel, roomIdx);

        let playersHtml = otherPlayers.map(p =>
            '<div class="refute-portrait" style="cursor:pointer;opacity:0.7" data-pid="' + p.id + '">' +
            '<div class="portrait-circle" style="background:' + p.color + '">' + p.name.charAt(4) + '</div>' +
            '<div class="portrait-name">' + p.name + '</div></div>'
        ).join('');

        panel.innerHTML = `
            <div class="overlay-title">${action.emoji} ${tr(roomIdx)}</div>
            <hr class="parchment-divider">
            <div class="overlay-subtitle">${t(action.labelKey)}</div>
            <div id="mazmorras-players" style="display:flex;justify-content:center;gap:8px;margin:8px 0">${playersHtml}</div>
            <div class="overlay-row"><label>${t('roomAction.mazmorras.type')}</label><select id="mazmorras-type">
                <option value="carta">${t('roomAction.mazmorras.seeCard')}</option>
                <option value="pregunta">${t('roomAction.mazmorras.askQuestion')}</option>
            </select></div>
            <div id="mazmorras-cat-row" class="overlay-row" style="display:none"><label>${t('eventUI.category')}</label><select id="mazmorras-cat">
                <option value="conspiradores">${t('cat.conspiradores')}</option>
                <option value="metodos">${t('cat.metodos')}</option>
                <option value="lugares">${t('cat.lugares')}</option>
                <option value="motivos">${t('cat.motivos')}</option>
            </select></div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.cancelRoomAction()">${t('btn.cancel')}</button>
                <button class="btn-primary" id="mazmorras-confirm" disabled onclick="UI.confirmMazmorras()">${t('btn.interrogate')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        // Selection state (reuse same logic as core mazmorras)
        this._mazmorrasPlayer = null;
        panel.querySelectorAll('[data-pid]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-pid]').forEach(p => { p.style.opacity = '0.7'; p.style.boxShadow = ''; });
                el.style.opacity = '1';
                el.style.boxShadow = '0 0 8px rgba(255,215,0,0.5)';
                this._mazmorrasPlayer = parseInt(el.dataset.pid);
                document.getElementById('mazmorras-confirm').disabled = false;
            });
        });
        document.getElementById('mazmorras-type').addEventListener('change', (e) => {
            document.getElementById('mazmorras-cat-row').style.display = e.target.value === 'pregunta' ? 'flex' : 'none';
        });
    },

    closeRoomAction() {
        closeOverlay('roomaction-overlay', () => {
            GameState.roomActionUsedThisTurn = true;
            this.updateMiniNotebook();
            const cp = GameState.currentPlayer();

            // Chain: item pickup → story → room event → end turn
            const afterStory = () => {
                Game.checkRoomEvent(cp, () => Game.endTurn());
            };

            const afterPickup = () => {
                // Try story discovery after item pickup
                const story = (typeof Stories !== 'undefined') ? Stories.tryStory(cp.id, cp.roomIndex) : null;
                if (story && cp.isHuman) {
                    this.showStoryDiscovery(story, afterStory);
                    return;
                }
                if (story && !cp.isHuman) {
                    GameState.addLog(t('story.found', { name: cp.name }));
                    this.updateLog();
                }
                afterStory();
            };

            // Try item pickup after room action
            const pickup = (typeof Inventory !== 'undefined') ? Inventory.tryPickup(cp.id, cp.roomIndex) : null;
            if (pickup && cp.isHuman) {
                this.showItemPickup(pickup, afterPickup);
                return;
            }
            if (pickup && !cp.isHuman) {
                GameState.addLog(t('log.botFoundItem', { name: cp.name, item: t('item.' + pickup.itemDef.id + '.name') }));
                this.updateLog();
            }
            afterPickup();
        });
    },

    cancelRoomAction() {
        closeOverlay('roomaction-overlay', () => {
            GameState.phase = PHASES.ACTION_CHOICE;
            this.updateHUD();
        });
    },

    // ═══════════════════════════════════════════
    // REPUTATION ABILITIES
    // ═══════════════════════════════════════════

    openFavorDelRey() {
        if (!Reputation.canUseFavorDelRey(0)) return;
        const cats = ['conspiradores', 'metodos', 'lugares', 'motivos'];
        const catOpts = cats.map(c => '<option value="' + c + '">' + GameState.getCategoryLabel(c) + '</option>').join('');

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title" style="color:#FFD700">\u{1F451} ${t('rep.favorDelRey')}</div>
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.FAVOR_DEL_REY') + '</div>' : ''}
            <div class="overlay-subtitle">${t('rep.favorDelReyDesc')}</div>
            <div class="overlay-row"><label>${t('eventUI.category')}</label><select id="favor-cat">${catOpts}</select></div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.confirmFavorDelRey()">${t('btn.confirm')}</button>
                <button class="btn-secondary" onclick="UI.closeAbility()">${t('btn.cancel')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
    },

    confirmFavorDelRey() {
        const cat = document.getElementById('favor-cat').value;
        const solution = GameState.getSolutionForCategory(cat);
        Reputation.useFavorDelRey(0);
        GameState.markCardSeen(0, solution, true);
        GameState.addCardNote(0, solution, 'R' + GameState.roundNumber + ': ' + t('note.favorDelRey'));
        GameState.addLog(t('rep.favorResult', { category: GameState.getCategoryLabel(cat), card: tc(solution) }));

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title" style="color:#FFD700">\u{1F451} ${t('rep.favorDelRey')}</div>
            <div class="clue-result evidencia slide-in">
                <span class="clue-label">${t('rep.favorDelRey')}</span>
                ${t('rep.favorResult', { category: GameState.getCategoryLabel(cat), card: tc(solution) })}
            </div>
            <div style="text-align:center;font-size:12px;color:#2ECC71;margin-top:4px">${t('roomAction.autoMarked')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeAbility()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        this.updateLog();
        this.updateMiniNotebook();
    },

    openChantaje() {
        if (!Reputation.canUseChantaje(0)) return;
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        if (otherPlayers.length === 0) return;

        // Player portraits
        let playersHtml = otherPlayers.map(p =>
            '<div class="refute-portrait" style="cursor:pointer;opacity:0.7" data-pid="' + p.id + '">' +
            '<div class="portrait-circle" style="background:' + p.color + '">' + p.name.charAt(4) + '</div>' +
            '<div class="portrait-name">' + p.name + '</div></div>'
        ).join('');

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title" style="color:#E74C3C">\u{1F5E1} ${t('rep.chantaje')}</div>
            ${GameState.helpEnabled ? '<div class="help-tip-inline">' + t('help.CHANTAJE') + '</div>' : ''}
            <div class="overlay-subtitle">${t('rep.chantajeDesc')}</div>
            <div style="display:flex;justify-content:center;gap:8px;margin:12px 0">${playersHtml}</div>
            <div class="overlay-buttons">
                <button class="btn-secondary" onclick="UI.closeAbility()">${t('btn.cancel')}</button>
                <button class="btn-primary" id="chantaje-confirm" disabled onclick="UI.confirmChantaje()">${t('btn.confirm')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        this._chantajePlayer = null;
        panel.querySelectorAll('[data-pid]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('[data-pid]').forEach(p => { p.style.opacity = '0.7'; p.style.boxShadow = ''; });
                el.style.opacity = '1';
                el.style.boxShadow = '0 0 8px rgba(255,215,0,0.5)';
                this._chantajePlayer = parseInt(el.dataset.pid);
                document.getElementById('chantaje-confirm').disabled = false;
            });
        });
    },

    confirmChantaje() {
        const targetId = this._chantajePlayer;
        if (targetId === null) return;
        const target = GameState.players[targetId];
        if (target.cards.length === 0) {
            const panel = document.getElementById('roomaction-panel');
            panel.innerHTML = `
                <div class="overlay-title" style="color:#E74C3C">\u{1F5E1} ${t('rep.chantaje')}</div>
                <div class="clue-result interrogatorio">
                    <span class="clue-label">${t('rep.chantaje')}</span>
                    ${t('clue.noCardsToShow', { name: target.name })}
                </div>
                <div class="overlay-buttons">
                    <button class="btn-primary" onclick="UI.closeAbility()">${t('btn.continue')}</button>
                </div>
            `;
            wrapOverlayBody(panel);
            return;
        }
        const card = target.cards[Math.floor(Math.random() * target.cards.length)];
        GameState.markCardSeen(0, card);
        GameState.addCardNote(0, card, 'R' + GameState.roundNumber + ': ' + t('note.chantaje', { name: target.name }));
        Reputation.change(0, -1);
        GameState.addLog(t('rep.chantajeResult', { target: target.name, card: tc(card) }));

        const panel = document.getElementById('roomaction-panel');
        panel.innerHTML = `
            <div class="overlay-title" style="color:#E74C3C">\u{1F5E1} ${t('rep.chantaje')}</div>
            <div class="clue-result interrogatorio slide-in">
                <span class="clue-label">${t('rep.chantaje')}</span>
                ${t('rep.chantajeResult', { target: target.name, card: tc(card) })}
                <div class="card-flip-container"><div class="card-flip">${tc(card)}</div></div>
            </div>
            <div style="text-align:center;font-size:12px;color:#9B59B6;margin-top:4px">${t('roomAction.autoMarked')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.closeAbility()">${t('btn.continue')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        setTimeout(() => {
            const flipEl = panel.querySelector('.card-flip');
            if (flipEl) flipEl.classList.add('flipped');
        }, 100);
        this.updateLog();
        this.updateMiniNotebook();
    },

    closeAbility() {
        closeOverlay('roomaction-overlay', () => {
            this.updateHUD();
        });
    },

    // ═══════════════════════════════════════════
    // INVENTORY
    // ═══════════════════════════════════════════

    openUseItem() {
        if (GameState.phase !== PHASES.ACTION_CHOICE) return;
        const cp = GameState.currentPlayer();
        if (!cp.isHuman || !cp.inventory || cp.inventory.length === 0) return;

        const panel = document.getElementById('roomaction-panel');
        let html = `<div class="overlay-title">\u{1F392} ${t('action.useItem.title')}</div>`;
        html += '<div style="display:flex;flex-direction:column;gap:8px;margin:8px 0">';

        for (const invItem of cp.inventory) {
            const def = Inventory.getItemDef(invItem.id);
            if (!def) continue;
            const isPassive = ITEM_PASSIVE.has(invItem.id);
            const needsTarget = ITEM_NEEDS_TARGET.has(invItem.id);
            const rarityColor = def.rarity === 'legendario' ? '#FFD700' : def.rarity === 'raro' ? '#9B59B6' : '#888';
            const durText = def.durability === 0 ? '\u221E' : invItem.durability + '/' + def.durability;

            html += '<div class="action-card' + (isPassive ? '' : ' highlight') + '" style="padding:8px;margin:0"' +
                (isPassive ? '' : ' onclick="UI._selectItemToUse(\'' + invItem.id + '\',' + (needsTarget ? 'true' : 'false') + ')"') + '>' +
                '<div class="action-icon" style="font-size:24px">' + def.emoji + '</div>' +
                '<div class="action-info" style="flex:1">' +
                    '<div class="action-title">' + t('item.' + def.id + '.name') +
                    ' <span style="font-size:10px;color:' + rarityColor + '">[' + t('item.rarity.' + def.rarity) + ']</span></div>' +
                    '<div class="action-desc">' + t('item.' + def.id + '.desc') + '</div>' +
                    '<div style="font-size:10px;color:#666;margin-top:2px">' +
                    (isPassive ? '<span style="color:#2ECC71;font-weight:bold">' + t('item.passive') + '</span>' : t('item.durability', { n: durText })) +
                    '</div>' +
                '</div>' +
                '</div>';
        }
        html += '</div>';
        html += '<div class="overlay-buttons"><button class="btn-secondary" onclick="UI.cancelRoomAction()">' + t('btn.cancel') + '</button></div>';

        panel.innerHTML = html;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');
    },

    _selectItemToUse(itemId, needsTarget) {
        if (needsTarget) {
            this._showTargetSelector(itemId);
        } else {
            this._executeUseItem(itemId, null);
        }
    },

    _showTargetSelector(itemId) {
        const cp = GameState.currentPlayer();
        const others = GameState.players.filter(p => p.id !== cp.id && !p.isEliminated);
        if (others.length === 0) return;

        const def = Inventory.getItemDef(itemId);
        const panel = document.getElementById('roomaction-panel');
        let html = `<div class="overlay-title">${def.emoji} ${t('item.' + itemId + '.name')}</div>`;
        html += '<div class="overlay-subtitle">' + t('item.chooseTarget') + '</div>';
        html += '<div style="display:flex;justify-content:center;gap:12px;margin:12px 0;flex-wrap:wrap">';
        for (const p of others) {
            html += '<div class="refute-portrait" style="cursor:pointer" onclick="UI._executeUseItem(\'' + itemId + '\',' + p.id + ')">' +
                '<div class="portrait-circle" style="background:' + p.color + '">' + (p.name.charAt(4) || 'B') + '</div>' +
                '<div class="portrait-name">' + p.name + '</div></div>';
        }
        html += '</div>';
        html += '<div class="overlay-buttons"><button class="btn-secondary" onclick="UI.openUseItem()">' + t('btn.cancel') + '</button></div>';
        panel.innerHTML = html;
        wrapOverlayBody(panel);
    },

    _executeUseItem(itemId, targetId) {
        const cp = GameState.currentPlayer();
        const result = Inventory.useItem(cp.id, itemId, targetId);
        if (!result.success) return;

        cp.itemActionUsedThisTurn = true;
        GameState.addLog(t(result.logKey, result.params));

        const def = Inventory.getItemDef(itemId);
        const panel = document.getElementById('roomaction-panel');
        let html = `<div class="overlay-title">${def ? def.emoji : '\u{1F392}'} ${def ? t('item.' + def.id + '.name') : ''}</div>`;
        html += '<div class="clue-result evidencia slide-in"><span class="clue-label">' + t('action.useItem.title') + '</span>';
        html += t(result.logKey, result.params);
        if (result.revealedCard) {
            html += '<div class="card-flip-container"><div class="card-flip">' + tc(result.revealedCard) + '</div></div>';
        }
        if (result.evidence) {
            html += '<div style="margin-top:6px;font-style:italic;color:#555">' + result.evidence.text + '</div>';
        }
        html += '</div>';
        html += '<div class="overlay-buttons"><button class="btn-primary" onclick="UI.closeAbility()">' + t('btn.continue') + '</button></div>';
        panel.innerHTML = html;
        wrapOverlayBody(panel);

        if (result.revealedCard) {
            setTimeout(() => {
                const flipEl = panel.querySelector('.card-flip');
                if (flipEl) flipEl.classList.add('flipped');
            }, 100);
        }

        this.updateLog();
        this.updateMiniNotebook();
    },

    showItemPickup(pickupResult, callback) {
        const { itemDef, inventoryFull } = pickupResult;
        const cp = GameState.currentPlayer();

        const panel = document.getElementById('roomaction-panel');
        const rarityColor = itemDef.rarity === 'legendario' ? '#FFD700' : itemDef.rarity === 'raro' ? '#9B59B6' : '#888';
        let html = `<div class="overlay-title">\u{1F392} ${t('item.pickup.title')}</div>`;
        html += '<div style="text-align:center;font-size:36px;margin:8px 0">' + itemDef.emoji + '</div>';
        html += '<div style="text-align:center;font-size:16px;font-weight:bold">' + t('item.' + itemDef.id + '.name') + '</div>';
        html += '<div style="text-align:center;font-size:11px;color:' + rarityColor + '">[' + t('item.rarity.' + itemDef.rarity) + ']</div>';
        html += '<div style="text-align:center;font-size:12px;color:#666;margin:4px 0">' + t('item.' + itemDef.id + '.desc') + '</div>';

        if (inventoryFull) {
            html += '<div style="text-align:center;color:#E74C3C;font-size:12px;margin:8px 0">' +
                t('item.pickup.inventoryFull', { max: MAX_INVENTORY }) + '</div>';
            // Show current inventory items to discard
            html += '<div style="display:flex;flex-direction:column;gap:4px;margin:8px 0">';
            for (const inv of cp.inventory) {
                const d = Inventory.getItemDef(inv.id);
                if (!d) continue;
                html += '<div class="action-card" style="padding:6px;margin:0;cursor:pointer" onclick="UI._discardAndPickup(\'' + inv.id + '\',\'' + itemDef.id + '\')">' +
                    '<div class="action-icon" style="font-size:18px">' + d.emoji + '</div>' +
                    '<div class="action-info" style="flex:1">' +
                    '<div class="action-title" style="font-size:12px">' + t('item.' + d.id + '.name') + '</div>' +
                    '</div>' +
                    '<div style="font-size:10px;color:#E74C3C">' + t('item.pickup.discard') + '</div>' +
                    '</div>';
            }
            html += '</div>';
            html += '<div class="overlay-buttons"><button class="btn-secondary" onclick="UI._rejectPickup()">' + t('item.pickup.reject') + '</button></div>';
        } else {
            GameState.addLog(t('log.foundItem', { name: cp.name, item: t('item.' + itemDef.id + '.name') }));
            this.updateLog();
            html += '<div class="overlay-buttons"><button class="btn-primary" onclick="UI._acceptPickup()">' + t('item.pickup.accept') + '</button></div>';
        }

        panel.innerHTML = html;
        wrapOverlayBody(panel);
        document.getElementById('roomaction-overlay').classList.add('active');

        this._pickupCallback = callback;
        this._pickupItemDef = itemDef;
    },

    _acceptPickup() {
        closeOverlay('roomaction-overlay', () => {
            this.updateHUD();
            if (this._pickupCallback) this._pickupCallback();
            this._pickupCallback = null;
            this._pickupItemDef = null;
        });
    },

    _rejectPickup() {
        // Inventory was full, item not added — just close
        closeOverlay('roomaction-overlay', () => {
            this.updateHUD();
            if (this._pickupCallback) this._pickupCallback();
            this._pickupCallback = null;
            this._pickupItemDef = null;
        });
    },

    _discardAndPickup(discardId, newItemId) {
        const cp = GameState.currentPlayer();
        Inventory.removeItem(cp.id, discardId);
        Inventory.addItem(cp.id, newItemId);
        GameState.addLog(t('log.foundItem', { name: cp.name, item: t('item.' + newItemId + '.name') }));
        this.updateLog();
        closeOverlay('roomaction-overlay', () => {
            this.updateHUD();
            if (this._pickupCallback) this._pickupCallback();
            this._pickupCallback = null;
            this._pickupItemDef = null;
        });
    },

    updateInventoryDisplay() {
        const container = document.getElementById('inventory-display');
        if (!container) return;
        const human = GameState.players[0];
        if (!human || !human.inventory) { container.innerHTML = ''; return; }

        if (human.inventory.length === 0) {
            container.innerHTML = '<div style="font-size:11px;color:#888;text-align:center;padding:4px">' + t('item.empty') + '</div>';
            return;
        }

        let html = '';
        for (const inv of human.inventory) {
            const def = Inventory.getItemDef(inv.id);
            if (!def) continue;
            const durText = def.durability === 0 ? '\u221E' : inv.durability;
            const rarityBorder = def.rarity === 'legendario' ? '#FFD700' : def.rarity === 'raro' ? '#9B59B6' : '#666';
            html += '<div class="inv-badge" title="' + t('item.' + def.id + '.name') + ' - ' + t('item.' + def.id + '.desc') + ' (' + durText + ')" ' +
                'style="display:inline-block;border:2px solid ' + rarityBorder + ';border-radius:6px;padding:2px 6px;margin:2px;font-size:16px;cursor:default;background:rgba(0,0,0,0.2)">' +
                def.emoji + '<span style="font-size:9px;vertical-align:super;color:' + rarityBorder + '">' + durText + '</span></div>';
        }
        container.innerHTML = html;
    },

    // ═══════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════

    // Helper: show event in unified overlay system
    _showEventOverlay(panel, html, variantClass, callback, boardEffect) {
        const overlay = document.getElementById('event-toast');
        panel.className = 'overlay-panel' + (variantClass ? ' ' + variantClass : '');
        panel.innerHTML = html;
        wrapOverlayBody(panel);
        overlay.classList.add('active');
        if (boardEffect) boardEffect();

        document.getElementById('event-toast-continue').addEventListener('click', () => {
            if (Board.clearEventEffects) Board.clearEventEffects();
            closeOverlay('event-toast', () => {
                panel.className = 'overlay-panel';
                panel.innerHTML = '';
                if (callback) callback();
            });
        });
    },

    showEvent(event, callback) {
        const panel = document.getElementById('event-toast-panel');
        const catLabel = t('event.cat.' + event.category);
        const resultText = GameState._eventResultText || '';
        const html = `
            <div class="overlay-title">${event.emoji} ${t('event.' + event.id + '.name')}</div>
            <div class="event-cat-label">${catLabel}</div>
            <div class="event-desc">${t('event.' + event.id + '.desc')}</div>
            ${resultText ? '<div class="event-result-text">' + resultText + '</div>' : ''}
            ${GameState.helpEnabled ? '<div class="help-tip-inline" style="color:#6d5a3f">' + t('help.EVENT') + '</div>' : ''}
            <div class="event-round">${t('event.turn', { turn: GameState.turnCounter })}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        const cp = GameState.players && GameState.players[GameState.currentPlayerIndex];
        this._showEventOverlay(panel, html, '', callback, () => {
            if (Board.showEventEffect) Board.showEventEffect(event, cp ? cp.roomIndex : -1);
        });
    },

    showMajorEvent(event, callback) {
        const panel = document.getElementById('event-toast-panel');
        const resultText = GameState._eventResultText || '';
        const html = `
            <div class="overlay-title" style="color:#E74C3C">${event.emoji} ${t('major.' + event.id + '.name')}</div>
            <div class="event-cat-label" style="color:#E74C3C">${t('major.category')}</div>
            <div class="event-desc">${t('major.' + event.id + '.desc')}</div>
            ${resultText ? '<div class="event-result-text">' + resultText + '</div>' : ''}
            <div class="event-round">${t('event.turn', { turn: GameState.turnCounter })}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        this._showEventOverlay(panel, html, 'major-event', callback, () => {
            if (Board.showEventEffect) Board.showEventEffect(event, -1);
        });
    },

    showRoomEvent(roomEvt, callback) {
        const panel = document.getElementById('event-toast-panel');
        const resultText = GameState._roomEventResultText || t('roomEvent.' + roomEvt.id + '.desc');
        const html = `
            <div class="overlay-title">${roomEvt.emoji} ${t('roomEvent.' + roomEvt.id + '.name')}</div>
            <div class="event-cat-label">${t('roomEvent.category')}</div>
            <div class="event-desc" style="font-size:13px">${t('roomEvent.' + roomEvt.id + '.desc')}</div>
            ${resultText ? '<div class="event-result-text" style="font-size:12px">' + resultText + '</div>' : ''}
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        const cp2 = GameState.players && GameState.players[GameState.currentPlayerIndex];
        this._showEventOverlay(panel, html, 'room-event', callback, () => {
            if (Board.showEventEffect) Board.showEventEffect(roomEvt, cp2 ? cp2.roomIndex : -1);
        });
    },

    // ═══════════════════════════════════════════
    // NARRATIVE EVENTS
    // ═══════════════════════════════════════════

    showNarrativeStart(narDef, callback) {
        const panel = document.getElementById('event-toast-panel');
        const catClass = 'narr-cat-' + narDef.category;
        const perTurnTexts = GameState._narrativePerTurnTexts || [];
        let perTurnHtml = '';
        if (perTurnTexts.length > 0) {
            perTurnHtml = '<div class="narrative-perturn-log">';
            for (const txt of perTurnTexts) {
                perTurnHtml += '<div class="narrative-perturn-entry">' + txt + '</div>';
            }
            perTurnHtml += '</div>';
            GameState._narrativePerTurnTexts = [];
        }
        const html = `
            <div class="overlay-title">${narDef.emoji} ${t('narrative.' + narDef.id + '.name')}</div>
            <div class="event-cat-label ${catClass}">${t('narrative.cat.' + narDef.category)}</div>
            <div class="event-desc">${t('narrative.' + narDef.id + '.desc')}</div>
            <div class="narrative-duration-badge">${t('narrative.turnsLeft', { turns: narDef.duration })}</div>
            ${perTurnHtml}
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        this._showEventOverlay(panel, html, 'narrative-event', callback);
    },

    showNarrativeResolution(narDef, resultText, callback) {
        const panel = document.getElementById('event-toast-panel');
        const catClass = 'narr-cat-' + narDef.category;
        const html = `
            <div class="overlay-title">${narDef.emoji} ${t('narrative.' + narDef.id + '.name')}</div>
            <div class="narrative-resolved-header">${t('narrative.resolved')}</div>
            <div class="event-cat-label ${catClass}">${t('narrative.cat.' + narDef.category)}</div>
            <div class="event-desc">${resultText}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        this._showEventOverlay(panel, html, 'narrative-resolution', callback);
    },

    // ═══════════════════════════════════════════
    // CASTLE STORIES
    // ═══════════════════════════════════════════

    _buildStoryCollectionHtml() {
        if (typeof STORY_CATALOG === 'undefined') return '';
        const collected = GameState.players[0].collectedStories || [];
        if (collected.length === 0 && GameState.turnCounter < 3) return ''; // Don't show section until first story or a few turns in
        const total = STORY_CATALOG.length;
        let html = '<div class="story-collection-section">';
        html += '<div class="story-collection-title">' + STORY_CATEGORY_EMOJI.curiosidad + ' '
            + t('story.collection.title') + ' <span class="story-collection-count">'
            + t('story.collection.count', { count: collected.length, total: total }) + '</span></div>';

        for (const cat of STORY_CATEGORIES) {
            const storiesInCat = STORY_CATALOG.filter(s => s.category === cat);
            const found = storiesInCat.filter(s => collected.includes(s.id));
            if (storiesInCat.length === 0) continue;
            html += '<div class="story-cat-group">';
            html += '<div class="story-cat-header">' + (STORY_CATEGORY_EMOJI[cat] || '') + ' ' + t('story.cat.' + cat) + ' (' + found.length + '/' + storiesInCat.length + ')</div>';
            for (const s of storiesInCat) {
                const seen = collected.includes(s.id);
                const rarityClass = 'story-rarity-dot ' + s.rarity;
                if (seen) {
                    const text = t('story.' + s.id + '.text');
                    const shortText = text.length > 80 ? text.substring(0, 77) + '...' : text;
                    html += '<div class="story-entry found"><span class="' + rarityClass + '"></span>' + shortText + '</div>';
                } else {
                    html += '<div class="story-entry undiscovered"><span class="' + rarityClass + '"></span>' + t('story.undiscovered') + '</div>';
                }
            }
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    showStoryDiscovery(storyDef, callback) {
        const panel = document.getElementById('event-toast-panel');
        const catEmoji = STORY_CATEGORY_EMOJI[storyDef.category] || '\u{1F4D6}';
        const catLabel = t('story.cat.' + storyDef.category);
        const rarityLabel = t('story.rarity.' + storyDef.rarity);
        const seriesHtml = storyDef.series
            ? '<div class="story-series-badge">' + t('story.seriesPart', { part: storyDef.series.part, total: storyDef.series.total }) + '</div>'
            : '';
        const ambiguousHtml = storyDef.ambiguous
            ? '<div class="story-ambiguous-note">' + t('story.ambiguousHint') + '</div>'
            : '';
        const html = `
            <div class="overlay-title" style="color:#C9A96E">${catEmoji} ${catLabel}</div>
            <div class="story-rarity-badge ${storyDef.rarity}">${rarityLabel}</div>
            ${seriesHtml}
            <div class="event-desc">${t('story.' + storyDef.id + '.text')}</div>
            ${ambiguousHtml}
            <div class="story-disclaimer">${t('story.disclaimer')}</div>
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('btn.continue')}</button>
            </div>
        `;
        this._showEventOverlay(panel, html, 'story-event', callback);
    },

    updateNarrativeIndicator() {
        const section = document.getElementById('narrative-events-section');
        if (!section) return;
        const events = GameState.activeNarrativeEvents || [];
        if (events.length === 0) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');
        const list = document.getElementById('narrative-events-list');
        let html = '';
        for (const ne of events) {
            const catClass = 'narr-cat-' + ne.def.category;
            html += '<div class="narrative-indicator">' +
                '<span class="' + catClass + '">' + ne.def.emoji + ' ' + t('narrative.' + ne.def.id + '.short') + '</span>' +
                '<span class="nar-turns">' + t('narrative.turnsLeft', { turns: ne.turnsRemaining }) + '</span>' +
                '</div>';
        }
        list.innerHTML = html;
    },

    showJuicioRealInteraction(target, callback) {
        if (target.cards.length === 0) { callback(); return; }
        const panel = document.getElementById('event-panel');
        let html = '<div class="overlay-title">\u{2696}\u{FE0F} ' + t('major.juicio_real.name') + '</div>';
        html += '<hr class="parchment-divider">';
        html += '<p style="text-align:center;color:#c4a878">' + t('major.juicioChooseCard') + '</p>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px">';
        for (const card of target.cards) {
            html += '<button class="btn-primary juicio-card-btn" data-card="' + card + '" style="padding:8px 12px;font-size:13px">' + tc(card) + '</button>';
        }
        html += '</div>';
        panel.innerHTML = html;
        wrapOverlayBody(panel);
        const overlay = document.getElementById('event-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('active');

        panel.querySelectorAll('.juicio-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.dataset.card;
                // Reveal this card to all players
                for (const p of GameState.players) {
                    if (!p.isEliminated) GameState.markCardSeen(p.id, card);
                }
                GameState.addLog(t('major.juicioRevealed', { name: target.name, card: tc(card) }));
                UI.updateLog();
                closeOverlay('event-overlay', callback);
            });
        });
    },

    showEventInteraction(event, callback) {
        // For interactive events, use the full overlay with parchment scroll
        const cp = GameState.currentPlayer();
        const otherPlayers = GameState.players.filter(p => !p.isHuman && !p.isEliminated);
        const playerOpts = otherPlayers.map(p => '<option value="' + p.id + '">' + p.name + '</option>').join('');
        const roomOpts = ROOM_NAMES.map((r, i) => '<option value="' + i + '">' + tr(i) + '</option>').join('');
        const catOpts = ['conspiradores', 'metodos', 'lugares', 'motivos'].map(c => '<option value="' + c + '">' + GameState.getCategoryLabel(c) + '</option>').join('');
        const panel = document.getElementById('event-panel');
        let html = '<div class="overlay-title">' + event.emoji + ' ' + t('event.' + event.id + '.name') + '</div>';
        html += '<hr class="parchment-divider">';

        switch (event.effect) {
            case 'puertas_cerradas':
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.chooseRoom') + '</div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.room') + '</label><select id="event-room">' + roomOpts + '</select></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.block') + '</button></div>';
                break;
            case 'inspeccion':
            case 'experimento':
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.choosePlayer') + '</div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.player') + '</label><select id="event-player">' + playerOpts + '</select></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.confirm') + '</button></div>';
                break;
            case 'negociacion':
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.chooseExchange') + '</div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.player') + '</label><select id="event-player">' + playerOpts + '</select></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.exchange') + '</button></div>';
                break;
            case 'guardias_repos':
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.chooseGuards') + '</div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.room') + '</label><select id="event-room">' + roomOpts + '</select></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.confirm') + '</button></div>';
                break;
            case 'confesion':
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.choosePlayerCat') + '</div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.player') + '</label><select id="event-player">' + playerOpts + '</select></div>';
                html += '<div class="overlay-row"><label>' + t('eventUI.category') + '</label><select id="event-cat">' + catOpts + '</select></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.ask') + '</button></div>';
                break;
            case 'audiencia': {
                const decls = GameState._eventDeclarations || [];
                let declHtml = '';
                for (let d of decls) declHtml += '<div style="font-size:13px;color:#6b4423;margin:2px 0">' + d + '</div>';
                const allCards = [...CARDS.conspiradores, ...CARDS.metodos, ...CARDS.motivos];
                const cardOpts = allCards.map(c => '<option value="' + c + '">' + tc(c) + '</option>').join('');
                html += '<div style="text-align:center;font-size:13px;color:#6d5a3f;margin:8px 0">' + t('eventUI.publicDeclarations') + '</div>';
                html += declHtml;
                html += '<div style="margin-top:12px"><div class="overlay-row"><label>' + t('eventUI.yourDeclaration') + '</label><select id="event-declare">' + cardOpts + '</select></div></div>';
                html += '<div class="overlay-buttons"><button class="btn-primary" id="event-confirm">' + t('btn.declare') + '</button></div>';
                break;
            }
        }

        panel.innerHTML = html;
        wrapOverlayBody(panel);
        document.getElementById('event-overlay').classList.add('active');
        document.getElementById('event-confirm').addEventListener('click', () => {
            this.resolveEventInteraction(event, callback);
        });
    },

    resolveEventInteraction(event, callback) {
        const cp = GameState.currentPlayer();
        switch (event.effect) {
            case 'puertas_cerradas': {
                const roomIdx = parseInt(document.getElementById('event-room').value);
                GameState.eventBlockedRooms.push(roomIdx);
                GameState.addLog(t('log.doorsClosed', { room: tr(roomIdx) }));
                for (let p of GameState.players) {
                    if (!p.isEliminated && p.roomIndex === roomIdx) {
                        const adj = CONNECTIONS[roomIdx].filter(r => !GameState.eventBlockedRooms.includes(r));
                        if (adj.length > 0) p.roomIndex = adj[Math.floor(Math.random() * adj.length)];
                    }
                }
                break;
            }
            case 'inspeccion': {
                const targetId = parseInt(document.getElementById('event-player').value);
                const target = GameState.players[targetId];
                if (target.cards.length > 0) {
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    GameState.markCardSeen(cp.id, card);
                    if (cp.isHuman) {
                        GameState.addCardNote(0, card, 'R' + GameState.roundNumber + ': ' + t('note.event', { eventName: t('event.' + event.id + '.name') }));
                    }
                    GameState.addLog(t('log.inspection', { target: target.name, card: tc(card) }));
                    this.showEventResultPanel(t('event.' + event.id + '.name'), t('eventUI.reveals', { name: target.name }), card, callback);
                    return;
                }
                break;
            }
            case 'negociacion': {
                const targetId = parseInt(document.getElementById('event-player').value);
                const target = GameState.players[targetId];
                if (cp.cards.length > 0 && target.cards.length > 0) {
                    const myCard = cp.cards[Math.floor(Math.random() * cp.cards.length)];
                    const theirCard = target.cards[Math.floor(Math.random() * target.cards.length)];
                    cp.cards = cp.cards.filter(c => c !== myCard);
                    target.cards = target.cards.filter(c => c !== theirCard);
                    cp.cards.push(theirCard);
                    target.cards.push(myCard);
                    GameState.markCardSeen(cp.id, theirCard);
                    GameState.markCardSeen(target.id, myCard);
                    if (cp.isHuman) {
                        GameState.addCardNote(0, theirCard, 'R' + GameState.roundNumber + ': ' + t('note.negotiation', { name: target.name }));
                    }
                    GameState.addLog(t('log.negotiation', { target: target.name }));
                    UI.initCards();
                    this.showEventResultPanel(t('event.' + event.id + '.name'), t('eventUI.gave', { card: tc(myCard) }), theirCard, callback);
                    return;
                }
                break;
            }
            case 'experimento': {
                const targetId = parseInt(document.getElementById('event-player').value);
                const target = GameState.players[targetId];
                if (target.cards.length > 0) {
                    const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                    GameState.markCardSeen(cp.id, card);
                    if (cp.isHuman) {
                        GameState.addCardNote(0, card, 'R' + GameState.roundNumber + ': ' + t('note.experiment', { name: target.name }));
                    }
                    GameState.addLog(t('log.experiment', { target: target.name }));
                    this.showEventResultPanel(t('event.' + event.id + '.name'), t('eventUI.has', { name: target.name }), card, callback);
                    return;
                }
                break;
            }
            case 'guardias_repos': {
                const roomIdx = parseInt(document.getElementById('event-room').value);
                const connectedRooms = CONNECTIONS[roomIdx];
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
                GameState.addLog(t('log.guards', { result: moved.length > 0 ? moved.join(', ') : t('log.noOneMoved') }));
                break;
            }
            case 'confesion': {
                const targetId = parseInt(document.getElementById('event-player').value);
                const cat = document.getElementById('event-cat').value;
                const target = GameState.players[targetId];
                const catCards = CARDS[cat];
                const hasCard = target.cards.some(c => catCards.includes(c));
                const answer = hasCard ? t('misc.yes') : t('misc.no');
                const answerColor = hasCard ? '#2ECC71' : '#E74C3C';
                const clueText = hasCard ? t('clue.hasCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) }) : t('clue.noCardsOf', { name: target.name, category: GameState.getCategoryLabel(cat) });
                const clue = { type: 'interrogatorio', text: clueText, round: GameState.roundNumber };
                GameState.addClue(cp.id, clue);
                GameState.addLog(t('log.confession', { text: clue.text }));
                const panel = document.getElementById('event-panel');
                panel.innerHTML = `
                    <div class="overlay-title">${event.emoji} ${t('overlay.confession')}</div>
                    <hr class="parchment-divider">
                    <div class="clue-result interrogatorio">
                        <span class="clue-label">${t('clueLabel.confesion')}</span>
                        ${t('roomAction.capilla.question', { name: target.name, category: GameState.getCategoryLabel(cat) })}
                        <div style="font-size:24px;font-weight:bold;color:${answerColor};margin-top:8px">${answer}</div>
                    </div>
                    <div class="overlay-buttons"><button class="btn-primary" id="event-continue-btn">${t('btn.continue')}</button></div>
                `;
                wrapOverlayBody(panel);
                document.getElementById('event-continue-btn').addEventListener('click', () => {
                    closeOverlay('event-overlay', () => {
                        Board.draw(); UI.updateLog(); UI.updateMiniNotebook(); callback();
                    });
                });
                return;
            }
            case 'audiencia': {
                const decl = document.getElementById('event-declare').value;
                GameState.addLog(t('log.publicDeclaration', { card: tc(decl) }));
                break;
            }
        }
        closeOverlay('event-overlay', () => {
            Board.draw(); UI.updateLog(); UI.updateMiniNotebook(); callback();
        });
    },

    showEventResultPanel(title, text, card, callback) {
        const panel = document.getElementById('event-panel');
        const cardHtml = card ? '<div class="card-flip-container"><div class="card-flip">' + tc(card) + '</div></div>' : '';
        panel.innerHTML = `
            <div class="overlay-title">${title}</div>
            <hr class="parchment-divider">
            <div style="text-align:center;font-size:15px;color:#3d2b1f;margin:12px 0;line-height:1.5">${text}</div>
            ${cardHtml}
            <div class="overlay-buttons"><button class="btn-primary" id="event-continue-btn">${t('btn.continue')}</button></div>
        `;
        wrapOverlayBody(panel);
        // Trigger flip
        setTimeout(() => {
            const flipEl = panel.querySelector('.card-flip');
            if (flipEl) flipEl.classList.add('flipped');
        }, 100);

        document.getElementById('event-continue-btn').addEventListener('click', () => {
            closeOverlay('event-overlay', () => {
                Board.draw(); UI.updateLog(); UI.updateMiniNotebook(); callback();
            });
        });
    },

    // ═══════════════════════════════════════════
    // HELP
    // ═══════════════════════════════════════════

    helpPage: 0,

    openHelp() {
        this.helpPage = 0;
        this.renderHelp();
        document.getElementById('help-overlay').classList.add('active');
    },

    renderHelp() {
        const panel = document.getElementById('help-panel');
        const total = 10;
        panel.innerHTML = `
            <div class="overlay-title">${t('overlay.help')}</div>
            <div id="help-content">${t('help.page.' + this.helpPage)}</div>
            <div id="help-nav">
                ${this.helpPage > 0 ? '<button class="btn-nav" onclick="UI.helpPrev()">' + t('btn.previous') + '</button>' : '<div style="width:90px"></div>'}
                <span id="help-page-indicator">${t('help.pageOf', { current: this.helpPage + 1, total: total })}</span>
                ${this.helpPage < total - 1 ? '<button class="btn-nav" onclick="UI.helpNext()">' + t('btn.next') + '</button>' : '<div style="width:90px"></div>'}
            </div>
            <div class="overlay-buttons" style="margin-top:8px">
                <button class="btn-secondary" onclick="UI.closeHelp()">${t('btn.close')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
    },

    helpPrev() { if (this.helpPage > 0) { this.helpPage--; this.renderHelp(); } },
    helpNext() { if (this.helpPage < 9) { this.helpPage++; this.renderHelp(); } },
    closeHelp() { closeOverlay('help-overlay'); },

    // ═══════════════════════════════════════════
    // TUTORIAL INTRO (shown on game start with help mode)
    // ═══════════════════════════════════════════

    showTutorialIntro(callback) {
        const panel = document.getElementById('event-toast-panel');
        panel.className = 'overlay-panel';
        panel.style.textAlign = 'left';
        panel.innerHTML = `
            <div class="overlay-title">🏰 ${t('tutorial.title')}</div>
            <div class="overlay-subtitle">${t('tutorial.subtitle')}</div>
            ${t('tutorial.intro')}
            <div style="margin:10px 0 6px;font-weight:bold;font-size:14px;color:#4a2810">${t('tutorial.steps.title')}</div>
            <div style="font-size:13px;line-height:1.7;margin-left:4px">
                ${t('tutorial.step.1')}<br>
                ${t('tutorial.step.2')}<br>
                ${t('tutorial.step.3')}<br>
                ${t('tutorial.step.4')}
            </div>
            <div style="text-align:center;font-size:13px;margin:10px 0 8px;color:#4a2810;font-weight:bold">${t('tutorial.accusation')}</div>
            <hr class="parchment-divider">
            <div style="margin:8px 0 4px;font-weight:bold;font-size:13px;color:#4a2810">${t('tutorial.tips.title')}</div>
            <div style="font-size:12px;line-height:1.7;margin-left:4px">
                • ${t('tutorial.tip.1')}<br>
                • ${t('tutorial.tip.2')}<br>
                • ${t('tutorial.tip.3')}<br>
                • ${t('tutorial.tip.4')}
            </div>
            <div class="overlay-buttons">
                <button class="btn-primary" id="event-toast-continue">${t('tutorial.begin')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('event-toast').classList.add('active');

        document.getElementById('event-toast-continue').addEventListener('click', () => {
            closeOverlay('event-toast', () => {
                panel.className = 'overlay-panel';
                panel.style.textAlign = '';
                panel.innerHTML = '';
                if (callback) callback();
            });
        });
    },

    // ═══════════════════════════════════════════
    // RESULT
    // ═══════════════════════════════════════════

    showResult() {
        const panel = document.getElementById('result-panel');
        const w = GameState.winner;
        const isHumanWin = w && w.isHuman;
        const title = GameState.gameOver
            ? (w ? (isHumanWin ? t('result.victory') : t('result.defeat')) : t('result.allEliminated'))
            : t('result.gameEnd');
        const titleColor = isHumanWin ? '#FFD700' : '#E74C3C';
        const winnerText = w ? (isHumanWin ? t('result.youSolved') : t('result.botSolved', { name: w.name })) : t('result.nobodySolved');
        const sol = GameState.solution;

        panel.innerHTML = `
            <div class="overlay-title" style="color:${titleColor}">${title}</div>
            <div style="text-align:center;font-size:16px;color:#ddd;margin:8px 0">${winnerText}</div>
            <div style="text-align:center;font-size:16px;color:#c0a060;font-weight:bold;margin:12px 0">${t('result.solutionWas')}</div>
            <div class="result-solution">
                ${t('result.conspirador', { card: tc(sol.conspirador) })}<br>
                ${t('result.metodo', { card: tc(sol.metodo) })}<br>
                ${t('result.lugar', { card: tc(sol.lugar) })}<br>
                ${t('result.motivo', { card: tc(sol.motivo) })}
            </div>
            <div class="overlay-buttons">
                <button class="btn-primary" onclick="UI.backToMenu()">${t('btn.backToMenu')}</button>
            </div>
        `;
        wrapOverlayBody(panel);
        document.getElementById('result-overlay').classList.add('active');
    },

    backToMenu() {
        document.getElementById('result-overlay').classList.remove('active');
        document.getElementById('top-bar').classList.add('hidden');
        document.getElementById('left-panel').classList.add('hidden');
        document.getElementById('right-panel').classList.add('hidden');
        document.getElementById('bottom-bar').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        Board.stopPulseAnimation();
        Board.clear();
        if (typeof BoardManager !== 'undefined') {
            BoardManager.stop();
        }
        I18n.translateDOM();
    }
};
