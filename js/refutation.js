// ─────────────────────────────────────────────────
// REFUTATION LOGIC (Fan Card UI)
// ─────────────────────────────────────────────────

const Refutation = {
    suspicion: null,
    suspectorIdx: -1,
    currentCheckerIdx: -1,
    checkedCount: 0,
    refuted: false,

    _buildCardHtml(card) {
        const cat = getCardCategory(card);
        return '<div class="table-card">' +
            '<div class="fan-card-inner" data-cat="' + cat + '">' +
                '<div class="fan-card-category" data-cat="' + cat + '"></div>' +
                '<div class="fan-card-name">' + tc(card) + '</div>' +
            '</div>' +
        '</div>';
    },

    start() {
        this.suspicion = GameState.activeSuspicion;
        this.suspectorIdx = GameState.currentPlayerIndex;
        this.currentCheckerIdx = GameState.nextPlayerIndex(this.suspectorIdx);
        this.checkedCount = 0;
        this.refuted = false;

        // Anillo de Poder: skip refutation entirely
        const suspector = GameState.players[this.suspectorIdx];
        if (suspector && suspector.itemAnilloPowerTurns > 0) {
            suspector.itemAnilloPowerTurns = 0; // consumed
            GameState.addLog(t('log.itemAnillo', { name: suspector.name }));
            // Show refutation overlay briefly with "irrefutable" message then auto-close
            const panel = document.getElementById('refutation-panel');
            panel.innerHTML =
                '<div class="overlay-title">' + t('overlay.refutation') + '</div>' +
                '<div style="text-align:center;font-size:18px;color:#9B59B6;margin:20px 0">\u{1F48D} ' + t('log.itemAnillo', { name: suspector.name }) + '</div>' +
                '<div id="refute-continue" style="text-align:center;margin-top:12px">' +
                '<button class="btn-primary" onclick="Refutation.finish()">' + t('btn.continue') + '</button></div>';
            wrapOverlayBody(panel);
            document.getElementById('refutation-overlay').classList.add('active');

            // Count as unrefuted suspicion → +1 rep
            Reputation.change(this.suspectorIdx, 1);
            return;
        }

        const panel = document.getElementById('refutation-panel');

        // Suspicion cards as visual cards
        const susCardsHtml = [
            this._buildCardHtml(this.suspicion.conspirador),
            this._buildCardHtml(this.suspicion.metodo),
            this._buildCardHtml(this.suspicion.lugar),
            this._buildCardHtml(this.suspicion.motivo)
        ].join('');

        // Build player carousel
        let carouselHtml = '';
        const order = this._getCheckOrder();
        for (let i = 0; i < order.length; i++) {
            const p = GameState.players[order[i]];
            if (i > 0) carouselHtml += '<div class="refute-arrow">\u2192</div>';
            const initial = p.isHuman ? t('board.humanToken') : p.name.charAt(4);
            const isSuspector = order[i] === this.suspectorIdx;
            carouselHtml += '<div class="refute-portrait waiting" id="refute-p-' + order[i] + '">' +
                '<div class="portrait-circle" style="background:' + p.color + '">' + initial + '</div>' +
                '<div class="portrait-name">' + p.name + '</div>' +
                '<div class="portrait-status">' + (isSuspector ? '(' + t('refute.suspector') + ')' : '') + '</div>' +
                '</div>';
        }

        panel.innerHTML =
            '<div class="overlay-title">' + t('overlay.refutation') + '</div>' +
            '<hr class="parchment-divider">' +
            '<div class="refute-table-cards">' + susCardsHtml + '</div>' +
            '<div class="refute-carousel">' + carouselHtml + '</div>' +
            '<div id="refute-status" style="text-align:center;font-size:16px;color:#3d2b1f;margin:12px 0"></div>' +
            '<div id="refute-cards" style="text-align:center;margin:8px 0"></div>' +
            '<div id="refute-tip" style="text-align:center"></div>' +
            '<div id="refute-continue" style="text-align:center;margin-top:12px"></div>';

        wrapOverlayBody(panel);
        document.getElementById('refutation-overlay').classList.add('active');
        this.checkNext();
    },

    _getCheckOrder() {
        const order = [];
        let idx = GameState.nextPlayerIndex(this.suspectorIdx);
        let count = 0;
        while (count < GameState.totalPlayers - 1) {
            order.push(idx);
            idx = GameState.nextPlayerIndex(idx);
            count++;
        }
        return order;
    },

    _setPortraitState(playerId, state) {
        const el = document.getElementById('refute-p-' + playerId);
        if (!el) return;
        el.classList.remove('waiting', 'checking', 'cannot', 'refutes');
        el.classList.add(state);
        const statusEl = el.querySelector('.portrait-status');
        if (statusEl) {
            switch (state) {
                case 'checking': statusEl.textContent = '...'; break;
                case 'cannot': statusEl.textContent = '\u2717'; break;
                case 'refutes': statusEl.textContent = '\u2713'; break;
                default: statusEl.textContent = ''; break;
            }
        }
    },

    _renderRefuteFan(matching) {
        const n = matching.length;
        const totalSpread = Math.min(40, n * 18);
        const startAngle = -totalSpread / 2;
        const angleStep = n > 1 ? totalSpread / (n - 1) : 0;
        const hSpread = 50;
        const centerIdx = (n - 1) / 2;

        let html = '<div class="refute-fan-area"><div class="refute-fan">';

        matching.forEach((card, i) => {
            const angle = startAngle + angleStep * i;
            const hOffset = (i - centerIdx) * hSpread;
            const cat = getCardCategory(card);
            const trans = 'translateX(' + hOffset + 'px) rotate(' + angle + 'deg)';

            html += '<div class="fan-card" data-card="' + card + '" data-index="' + i + '"' +
                ' style="--fan-rotation:' + trans + '; transform:' + trans +
                '; z-index:' + (i + 1) + '; left:calc(50% - 40px); bottom:0px;' +
                ' animation: fanCardEnter 0.4s ease-out ' + (i * 60) + 'ms both;">' +
                '<div class="fan-card-inner" data-cat="' + cat + '">' +
                    '<div class="fan-card-category" data-cat="' + cat + '"></div>' +
                    '<div class="fan-card-name">' + tc(card) + '</div>' +
                '</div>' +
            '</div>';
        });

        html += '</div></div>';
        return html;
    },

    checkNext() {
        if (this.refuted || this.checkedCount >= GameState.totalPlayers - 1) {
            this.showFinal();
            return;
        }

        const checker = GameState.players[this.currentCheckerIdx];
        if (checker.isEliminated || this.currentCheckerIdx === this.suspectorIdx) {
            this.currentCheckerIdx = GameState.nextPlayerIndex(this.currentCheckerIdx);
            this.checkedCount++;
            this.checkNext();
            return;
        }

        this._setPortraitState(this.currentCheckerIdx, 'checking');
        const matching = GameState.findRefutingCards(this.currentCheckerIdx, this.suspicion);

        if (checker.isHuman) {
            if (matching.length > 0) {
                document.getElementById('refute-status').textContent = t('refute.chooseCard');
                document.getElementById('refute-cards').innerHTML = this._renderRefuteFan(matching);

                // Bind click handlers to fan cards
                document.querySelectorAll('#refute-cards .fan-card').forEach(el => {
                    el.addEventListener('click', () => {
                        const card = el.dataset.card;
                        this._animateRefuteCard(el, card);
                    });
                });

                if (GameState.helpEnabled) {
                    document.getElementById('refute-tip').innerHTML = '<div class="help-tip-inline">' + t('help.REFUTATION_SCENE_CHOOSE') + '</div>';
                }
            } else {
                document.getElementById('refute-status').textContent = t('refute.noCards');
                this._setPortraitState(this.currentCheckerIdx, 'cannot');
                if (GameState.helpEnabled) {
                    document.getElementById('refute-tip').innerHTML = '<div class="help-tip-inline">' + t('help.REFUTATION_SCENE_NOCARD') + '</div>';
                }
                setTimeout(() => {
                    this.currentCheckerIdx = GameState.nextPlayerIndex(this.currentCheckerIdx);
                    this.checkedCount++;
                    this.checkNext();
                }, 1000);
            }
        } else {
            // Bot
            document.getElementById('refute-status').textContent = t('refute.checking', { name: checker.name });
            setTimeout(() => {
                if (matching.length > 0) {
                    const card = matching[Math.floor(Math.random() * matching.length)];
                    this.refuted = true;
                    Reputation.change(this.currentCheckerIdx, 1);
                    this._setPortraitState(this.currentCheckerIdx, 'refutes');
                    const suspector = GameState.players[this.suspectorIdx];

                    if (suspector.isHuman) {
                        GameState.markCardSeen(suspector.id, card);
                        const roundLabel = 'R' + GameState.roundNumber;
                        GameState.addCardNote(suspector.id, card, roundLabel + ': ' + t('note.refutedBy', { name: checker.name }));
                        document.getElementById('refute-status').textContent = t('refute.shows', { name: checker.name });

                        // Show card with reveal animation
                        if (typeof AudioManager !== 'undefined') AudioManager.play('sfx/card_flip');
                        document.getElementById('refute-cards').innerHTML =
                            '<div class="refute-revealed-card">' + this._buildCardHtml(card) + '</div>';
                        setTimeout(() => {
                            const revealEl = document.querySelector('.refute-revealed-card');
                            if (revealEl) revealEl.classList.add('show');
                        }, 100);

                        if (GameState.helpEnabled) {
                            document.getElementById('refute-tip').innerHTML = '<div class="help-tip-inline">' + t('help.REFUTATION_RESULT_SHOWN') + '</div>';
                        }

                        GameState.addLog(t('refute.botShowed', { name: checker.name, card: tc(card) }));
                    } else {
                        GameState.markCardSeen(suspector.id, card);
                        document.getElementById('refute-status').textContent = t('refute.refuted', { name: checker.name });
                    }
                    this.showContinue();
                } else {
                    this._setPortraitState(this.currentCheckerIdx, 'cannot');
                    document.getElementById('refute-status').textContent = t('refute.cannotRefute', { name: checker.name });
                    GameState.addLog(t('refute.botCannotRefute', { name: checker.name }));
                    setTimeout(() => {
                        this.currentCheckerIdx = GameState.nextPlayerIndex(this.currentCheckerIdx);
                        this.checkedCount++;
                        this.checkNext();
                    }, 600);
                }
                UI.updateLog();
            }, 800);
        }
    },

    _animateRefuteCard(cardEl, card) {
        if (typeof AudioManager !== 'undefined') AudioManager.play('sfx/card_flip');
        // Animate selected card up and then show result
        const otherCards = document.querySelectorAll('#refute-cards .fan-card:not([data-card="' + card + '"])');

        cardEl.style.zIndex = 200;

        // Fly card upward to center
        const cardRect = cardEl.getBoundingClientRect();
        const container = document.getElementById('refute-cards');
        const contRect = container.getBoundingClientRect();
        const dx = (contRect.left + contRect.width / 2) - (cardRect.left + cardRect.width / 2);
        const dy = (contRect.top) - (cardRect.top + cardRect.height / 2);

        cardEl.animate([
            { transform: cardEl.style.transform, opacity: 1 },
            { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(0deg) scale(1.1)', opacity: 1, offset: 0.6 },
            { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(0deg) scale(1)', opacity: 0.8 }
        ], {
            duration: 400,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
            fill: 'forwards'
        });

        // Slide out other cards
        otherCards.forEach((c, i) => {
            const rot = c.style.getPropertyValue('--fan-rotation');
            c.animate([
                { transform: rot + ' translateY(0)', opacity: 1 },
                { transform: rot + ' translateY(150px)', opacity: 0 }
            ], {
                duration: 250,
                delay: 50 + i * 30,
                easing: 'ease-in',
                fill: 'forwards'
            });
        });

        // After animation, complete the human choice
        setTimeout(() => this.humanChoose(card), 500);
    },

    humanChoose(card) {
        this.refuted = true;
        const suspector = GameState.players[this.suspectorIdx];
        GameState.markCardSeen(suspector.id, card);
        const roundLabel = 'R' + GameState.roundNumber;
        GameState.addCardNote(0, card, roundLabel + ': ' + t('note.youShowedTo', { name: suspector.name }));
        GameState.addLog(t('refute.youShowedTo', { card: tc(card), name: suspector.name }));
        Reputation.change(0, 1);
        this._setPortraitState(0, 'refutes');

        // Show the card you revealed briefly, then auto-continue
        document.getElementById('refute-cards').innerHTML =
            '<div class="refute-revealed-card show">' + this._buildCardHtml(card) + '</div>';
        document.getElementById('refute-tip').innerHTML = '';
        document.getElementById('refute-status').textContent = t('refute.youShowed', { card: tc(card) });
        UI.updateLog();
        setTimeout(() => this.finish(), 1200);
    },

    showFinal() {
        if (!this.refuted) {
            Reputation.change(this.suspectorIdx, 1);
            document.getElementById('refute-status').textContent = t('refute.nobodyRefuted');
            if (GameState.helpEnabled && GameState.players[this.suspectorIdx].isHuman) {
                document.getElementById('refute-tip').innerHTML = '<div class="help-tip-inline">' + t('help.REFUTATION_NOBODY') + '</div>';
            }
            GameState.addLog(t('refute.nobodyRefutedLog'));
            UI.updateLog();
        }
        this.showContinue();
    },

    showContinue() {
        document.getElementById('refute-continue').innerHTML =
            '<button class="btn-primary" onclick="Refutation.finish()">' + t('btn.continue') + '</button>';
    },

    finish() {
        closeOverlay('refutation-overlay', () => {
            UI.updateMiniNotebook();
            Game.endTurn();
        });
    }
};
