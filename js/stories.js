// ═══════════════════════════════════════════════════════════════
// CASTLE STORIES SYSTEM — Narrative lore (no impact on mystery)
// ═══════════════════════════════════════════════════════════════

const STORY_CATEGORIES = ['curiosidad', 'rumor_pasado', 'anecdota', 'leyenda', 'chisme'];

const STORY_CATEGORY_EMOJI = {
    curiosidad: '\u{1F3F0}',     // castle
    rumor_pasado: '\u{1F4DC}',   // scroll
    anecdota: '\u{1F464}',       // bust
    leyenda: '\u{2728}',         // sparkles
    chisme: '\u{1F5E3}'          // speaking head
};

const STORY_RARITY_WEIGHTS = { comun: 60, raro: 30, legendario: 10 };

const STORY_PICKUP_PROB = 0.25; // 25% base probability

// ─── STORY CATALOG ─────────────────────────────────────
// rooms: indices of rooms where story can appear (core 0-8)
// Room mapping: 0=Torre del Mago, 1=Biblioteca, 2=Armería,
//   3=Capilla, 4=Salón del Trono, 5=Sala del Consejo,
//   6=Cocina Real, 7=Jardines, 8=Mazmorras

const STORY_CATALOG = [
    // ── CURIOSIDADES (12) ──────────────────────────
    { id: 'cur_reloj_torre',       category: 'curiosidad',   rarity: 'comun',      rooms: [0],    series: null, ambiguous: false },
    { id: 'cur_baldosas_trono',    category: 'curiosidad',   rarity: 'comun',      rooms: [4],    series: null, ambiguous: false },
    { id: 'cur_escudo_armeria',    category: 'curiosidad',   rarity: 'comun',      rooms: [2],    series: null, ambiguous: false },
    { id: 'cur_gato_biblioteca',   category: 'curiosidad',   rarity: 'comun',      rooms: [1],    series: null, ambiguous: false },
    { id: 'cur_fuente_jardines',   category: 'curiosidad',   rarity: 'comun',      rooms: [7],    series: null, ambiguous: false },
    { id: 'cur_campana_capilla',   category: 'curiosidad',   rarity: 'comun',      rooms: [3],    series: null, ambiguous: false },
    { id: 'cur_receta_cocina',     category: 'curiosidad',   rarity: 'comun',      rooms: [6],    series: null, ambiguous: false },
    { id: 'cur_eco_mazmorras',     category: 'curiosidad',   rarity: 'raro',       rooms: [8],    series: null, ambiguous: false },
    { id: 'cur_mural_consejo',     category: 'curiosidad',   rarity: 'raro',       rooms: [5],    series: null, ambiguous: false },
    { id: 'cur_ventana_torre',     category: 'curiosidad',   rarity: 'raro',       rooms: [0],    series: null, ambiguous: false },
    { id: 'cur_pasadizo_olvidado', category: 'curiosidad',   rarity: 'legendario', rooms: [8, 0], series: null, ambiguous: false },
    { id: 'cur_inscripcion_trono', category: 'curiosidad',   rarity: 'raro',       rooms: [4],    series: null, ambiguous: false },

    // ── RUMORES DEL PASADO (10) ────────────────────
    { id: 'rum_noble_mazmorras',   category: 'rumor_pasado', rarity: 'comun',      rooms: [8],    series: null, ambiguous: false },
    { id: 'rum_incendio_cocina',   category: 'rumor_pasado', rarity: 'comun',      rooms: [6],    series: null, ambiguous: false },
    { id: 'rum_libro_prohibido',   category: 'rumor_pasado', rarity: 'raro',       rooms: [1],    series: null, ambiguous: false },
    { id: 'rum_duelo_jardin',      category: 'rumor_pasado', rarity: 'comun',      rooms: [7],    series: null, ambiguous: false },
    { id: 'rum_fantasma_capilla',  category: 'rumor_pasado', rarity: 'raro',       rooms: [3],    series: null, ambiguous: false },
    { id: 'rum_tesoro_perdido',    category: 'rumor_pasado', rarity: 'raro',       rooms: [8, 0], series: null, ambiguous: false },
    { id: 'rum_consejero_traidor', category: 'rumor_pasado', rarity: 'comun',      rooms: [5],    series: null, ambiguous: true },
    { id: 'rum_pacto_antiguo',     category: 'rumor_pasado', rarity: 'comun',      rooms: [4],    series: null, ambiguous: false },
    { id: 'rum_armero_loco',       category: 'rumor_pasado', rarity: 'comun',      rooms: [2],    series: null, ambiguous: false },
    { id: 'rum_rey_insomne',       category: 'rumor_pasado', rarity: 'raro',       rooms: [4, 3], series: null, ambiguous: false },

    // ── ANÉCDOTAS DE PERSONAJES (10) ───────────────
    { id: 'ane_cocinero_veneno',   category: 'anecdota',     rarity: 'comun',      rooms: [6],    series: null, ambiguous: true },
    { id: 'ane_guardia_noche',     category: 'anecdota',     rarity: 'comun',      rooms: [2, 8], series: null, ambiguous: true },
    { id: 'ane_bufon_secretos',    category: 'anecdota',     rarity: 'comun',      rooms: [4, 7], series: null, ambiguous: false },
    { id: 'ane_sacerdotisa_sueno', category: 'anecdota',     rarity: 'raro',       rooms: [3],    series: null, ambiguous: false },
    { id: 'ane_alquimista_exp',    category: 'anecdota',     rarity: 'comun',      rooms: [0],    series: null, ambiguous: false },
    { id: 'ane_embajador_carta',   category: 'anecdota',     rarity: 'raro',       rooms: [5, 1], series: null, ambiguous: true },
    { id: 'ane_reina_jardin',      category: 'anecdota',     rarity: 'comun',      rooms: [7],    series: null, ambiguous: false },
    { id: 'ane_capitan_cicatriz',  category: 'anecdota',     rarity: 'comun',      rooms: [2],    series: null, ambiguous: false },
    { id: 'ane_caballero_juramento', category: 'anecdota',   rarity: 'raro',       rooms: [4, 3], series: null, ambiguous: false },
    { id: 'ane_sirviente_llave',   category: 'anecdota',     rarity: 'comun',      rooms: [6, 8], series: null, ambiguous: true },

    // ── LEYENDAS (8) ───────────────────────────────
    { id: 'ley_figura_torre',      category: 'leyenda',      rarity: 'raro',       rooms: [0],    series: null, ambiguous: false },
    { id: 'ley_tuneles_castillo',  category: 'leyenda',      rarity: 'raro',       rooms: [8],    series: null, ambiguous: false },
    { id: 'ley_espejo_capilla',    category: 'leyenda',      rarity: 'raro',       rooms: [3],    series: null, ambiguous: false },
    { id: 'ley_voz_biblioteca',    category: 'leyenda',      rarity: 'legendario', rooms: [1],    series: null, ambiguous: false },
    { id: 'ley_rosa_eterna',       category: 'leyenda',      rarity: 'legendario', rooms: [7],    series: null, ambiguous: false },
    { id: 'ley_pasos_vacios',      category: 'leyenda',      rarity: 'comun',      rooms: [5, 8], series: null, ambiguous: false },
    { id: 'ley_sombra_armeria',    category: 'leyenda',      rarity: 'raro',       rooms: [2],    series: null, ambiguous: false },
    { id: 'ley_llama_cocina',      category: 'leyenda',      rarity: 'comun',      rooms: [6],    series: null, ambiguous: false },

    // ── CHISMES ACTUALES (10) ──────────────────────
    { id: 'chi_dama_capitan',      category: 'chisme',       rarity: 'comun',      rooms: [5, 4], series: null, ambiguous: true },
    { id: 'chi_cocinero_ingredientes', category: 'chisme',   rarity: 'comun',      rooms: [6],    series: null, ambiguous: true },
    { id: 'chi_guardia_mazmorras', category: 'chisme',       rarity: 'comun',      rooms: [8, 2], series: null, ambiguous: true },
    { id: 'chi_embajador_biblioteca', category: 'chisme',    rarity: 'comun',      rooms: [1, 5], series: null, ambiguous: true },
    { id: 'chi_bufon_llora',       category: 'chisme',       rarity: 'raro',       rooms: [7, 4], series: null, ambiguous: false },
    { id: 'chi_sirvientes_noche',  category: 'chisme',       rarity: 'comun',      rooms: [6, 8], series: null, ambiguous: false },
    { id: 'chi_consejero_ausente', category: 'chisme',       rarity: 'raro',       rooms: [5],    series: null, ambiguous: false },
    { id: 'chi_reina_discusion',   category: 'chisme',       rarity: 'comun',      rooms: [4, 3], series: null, ambiguous: false },
    { id: 'chi_alquimista_humo',   category: 'chisme',       rarity: 'raro',       rooms: [0],    series: null, ambiguous: false },
    { id: 'chi_capitan_armeria',   category: 'chisme',       rarity: 'comun',      rooms: [2],    series: null, ambiguous: false },

    // ── SERIES MULTI-PARTE ─────────────────────────
    // Serie: El Secreto del Alquimista (3 partes, legendaria)
    { id: 'serie_alq_1', category: 'leyenda',      rarity: 'legendario', rooms: [0],    series: { id: 'serie_alquimista', part: 1, total: 3 }, ambiguous: false },
    { id: 'serie_alq_2', category: 'leyenda',      rarity: 'legendario', rooms: [1],    series: { id: 'serie_alquimista', part: 2, total: 3 }, ambiguous: false },
    { id: 'serie_alq_3', category: 'leyenda',      rarity: 'legendario', rooms: [8],    series: { id: 'serie_alquimista', part: 3, total: 3 }, ambiguous: false },
    // Serie: La Reina Perdida (2 partes, rara)
    { id: 'serie_reina_1', category: 'rumor_pasado', rarity: 'raro',     rooms: [3],    series: { id: 'serie_reina', part: 1, total: 2 }, ambiguous: false },
    { id: 'serie_reina_2', category: 'rumor_pasado', rarity: 'raro',     rooms: [4],    series: { id: 'serie_reina', part: 2, total: 2 }, ambiguous: false },
    // Serie: Diario del Bufón (3 partes, rara)
    { id: 'serie_bufon_1', category: 'anecdota',     rarity: 'raro',     rooms: [4],    series: { id: 'serie_bufon', part: 1, total: 3 }, ambiguous: false },
    { id: 'serie_bufon_2', category: 'anecdota',     rarity: 'raro',     rooms: [6],    series: { id: 'serie_bufon', part: 2, total: 3 }, ambiguous: false },
    { id: 'serie_bufon_3', category: 'anecdota',     rarity: 'raro',     rooms: [7],    series: { id: 'serie_bufon', part: 3, total: 3 }, ambiguous: false }
];

// ─── STORIES MODULE ────────────────────────────────────

const Stories = {

    /**
     * Try to discover a story after a room action.
     * Returns story def or null.
     */
    tryStory(playerId, roomIndex) {
        if (Math.random() > STORY_PICKUP_PROB) return null;

        const player = GameState.players[playerId];
        const seen = player.collectedStories || [];

        // Filter eligible stories for this room
        const eligible = STORY_CATALOG.filter(s => {
            // Must match room (core rooms or any additional room triggers all core-room stories assigned to it)
            if (!s.rooms.includes(roomIndex < 9 ? roomIndex : -1)) return false;
            // Not already seen
            if (seen.includes(s.id)) return false;
            // Series: only offer next sequential part
            if (s.series) {
                if (s.series.part > 1) {
                    // Need previous part
                    const prevId = s.id.replace(/_\d+$/, '_' + (s.series.part - 1));
                    if (!seen.includes(prevId)) return false;
                }
            }
            return true;
        });

        if (eligible.length === 0) return null;

        // Weighted random selection by rarity
        const story = this._weightedPick(eligible);

        // Record discovery
        if (!player.collectedStories) player.collectedStories = [];
        player.collectedStories.push(story.id);
        GameState.storyLog.push({ storyId: story.id, playerId, round: GameState.roundNumber });

        return story;
    },

    _weightedPick(stories) {
        let totalWeight = 0;
        const weights = stories.map(s => {
            const w = STORY_RARITY_WEIGHTS[s.rarity] || 60;
            totalWeight += w;
            return w;
        });
        let r = Math.random() * totalWeight;
        for (let i = 0; i < stories.length; i++) {
            r -= weights[i];
            if (r <= 0) return stories[i];
        }
        return stories[stories.length - 1];
    },

    getCollection(playerId) {
        const player = GameState.players[playerId];
        return (player.collectedStories || []).map(id => STORY_CATALOG.find(s => s.id === id)).filter(Boolean);
    },

    hasSeenStory(playerId, storyId) {
        const player = GameState.players[playerId];
        return (player.collectedStories || []).includes(storyId);
    },

    getTotalCount() {
        return STORY_CATALOG.length;
    }
};
