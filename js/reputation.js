// ─────────────────────────────────────────────────
// REPUTATION SYSTEM
// ─────────────────────────────────────────────────

const Reputation = {
    MIN: -5,
    MAX: 5,
    HIGH_THRESHOLD: 3,
    LOW_THRESHOLD: -3,
    BLACKMAIL_THRESHOLD: -2,

    favorDelReyUsed: [],
    accuseBlocked: [],

    init() {
        this.favorDelReyUsed = [];
        this.accuseBlocked = [];
    },

    get(playerId) {
        const p = GameState.players[playerId];
        return p ? p.reputation : 0;
    },

    change(playerId, delta) {
        const p = GameState.players[playerId];
        if (!p) return;
        const old = p.reputation;
        p.reputation = Math.max(this.MIN, Math.min(this.MAX, p.reputation + delta));
        if (p.reputation !== old) {
            const sign = delta > 0 ? '+' : '';
            GameState.addLog(t('rep.change', { name: p.name, delta: sign + delta, value: p.reputation }));
        }
    },

    getLevel(playerId) {
        const rep = this.get(playerId);
        if (rep >= 4) return 'legend';
        if (rep >= this.HIGH_THRESHOLD) return 'high';
        if (rep >= 1) return 'good';
        if (rep >= -1) return 'neutral';
        if (rep > this.LOW_THRESHOLD) return 'low';
        return 'enemy';
    },

    getLevelName(playerId) {
        return t('rep.level.' + this.getLevel(playerId));
    },

    isHigh(playerId) {
        return this.get(playerId) >= this.HIGH_THRESHOLD;
    },

    isLow(playerId) {
        return this.get(playerId) <= this.LOW_THRESHOLD;
    },

    // ── Abilities ──

    canUseFavorDelRey(playerId) {
        return this.get(playerId) >= this.HIGH_THRESHOLD &&
               !this.favorDelReyUsed.includes(playerId);
    },

    useFavorDelRey(playerId) {
        this.favorDelReyUsed.push(playerId);
    },

    canUseChantaje(playerId) {
        return this.get(playerId) <= this.BLACKMAIL_THRESHOLD;
    },

    // ── Accusation ──

    canPlayerAccuse(playerId) {
        return !this.accuseBlocked.includes(playerId);
    },

    getAccusationPenalty(playerId) {
        const rep = this.get(playerId);
        if (rep <= -2) return 'eliminated';
        if (rep >= 2) return 'lose_rep_stay';
        return 'lose_rep_no_accuse';
    },

    applyAccusationFailure(playerId) {
        const penalty = this.getAccusationPenalty(playerId);
        const p = GameState.players[playerId];
        switch (penalty) {
            case 'eliminated':
                p.isEliminated = true;
                this.change(playerId, -2);
                GameState.addLog(t('rep.accusationEliminated', { name: p.name }));
                return 'eliminated';
            case 'lose_rep_no_accuse':
                this.change(playerId, -3);
                this.accuseBlocked.push(playerId);
                GameState.addLog(t('rep.accusationNoAccuse', { name: p.name }));
                return 'no_accuse';
            case 'lose_rep_stay':
                this.change(playerId, -2);
                GameState.addLog(t('rep.accusationStay', { name: p.name }));
                return 'stay';
        }
    },

    // ── Vote weight ──

    getVoteWeight(playerId) {
        const rep = this.get(playerId);
        if (rep >= 4) return 2.0;
        if (rep >= 2) return 1.5;
        if (rep >= -1) return 1.0;
        if (rep >= -3) return 0.75;
        return 0.5;
    },

    // ── Guard surveillance ──

    shouldGuardSurveillance(playerId) {
        // Amuleto guardian blocks guard surveillance
        if (typeof Inventory !== 'undefined' && Inventory.playerHasItem(playerId, 'amuleto_guardian')) return false;
        return this.isLow(playerId) && Math.random() < 0.3;
    },

    applyGuardSurveillance(playerId) {
        const p = GameState.players[playerId];
        if (p.cards.length === 0) return null;
        const card = p.cards[Math.floor(Math.random() * p.cards.length)];
        for (let other of GameState.players) {
            if (other.id !== playerId && !other.isEliminated) {
                GameState.markCardSeen(other.id, card);
            }
        }
        return card;
    },

    // ── Display helpers ──

    getBarColor(rep) {
        if (rep >= 3) return '#2ECC71';
        if (rep >= 1) return '#3498DB';
        if (rep >= -1) return '#F39C12';
        if (rep >= -3) return '#E67E22';
        return '#E74C3C';
    },

    getBarPercent(rep) {
        return ((rep - this.MIN) / (this.MAX - this.MIN)) * 100;
    }
};
