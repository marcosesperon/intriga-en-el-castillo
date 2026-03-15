// ─────────────────────────────────────────────────
// ADDITIONAL ROOMS SYSTEM
// ─────────────────────────────────────────────────

const CORE_ROOM_COUNT = 9;

// ─── Room Category Visual Themes ─────────────────

const ROOM_CATEGORY_THEMES = {
    noble:    { baseColor: 0x8a7530, wallColor: 0x9B8860 },
    military: { baseColor: 0x5a5a6a, wallColor: 0x6a6a7a },
    mystical: { baseColor: 0x4a3a6a, wallColor: 0x5a4a7a },
    service:  { baseColor: 0x7a6530, wallColor: 0x8B7355 },
    nature:   { baseColor: 0x3a6a2a, wallColor: null },
    special:  { baseColor: 0x6a5a4a, wallColor: 0x7a6a5a }
};

// ─── Additional Room Catalog (~30 rooms) ─────────

const ADDITIONAL_ROOM_CATALOG = [

    // ═══════════════════════════════════════════
    // NOBLE (6)
    // ═══════════════════════════════════════════

    // 1. Sala de Banquetes
    {
        id: 'sala_banquetes',
        category: 'noble',
        action: {
            type: 'rumor',
            emoji: '\u{1F37D}\u{FE0F}',
            labelKey: 'addRoom.sala_banquetes.action',
            descKey: 'addRoom.sala_banquetes.desc'
        },
        tint: 0x8a7530,
        clueProbability: 0.3,
        itemPool: ['sello_real', 'mascara_cortesana', 'carta_recomendacion', 'dado_trucado'],
        events: [
            { id: 'banq_1', effect: 'bonus_clue', emoji: '\u{1F37D}\u{FE0F}' },
            { id: 'banq_2', effect: 'flavor', emoji: '\u{1F377}' },
            { id: 'banq_3', effect: 'rep_plus', emoji: '\u{1F389}' },
            { id: 'banq_4', effect: 'reveal_card', emoji: '\u{1F944}' },
            { id: 'banq_5', effect: 'flavor', emoji: '\u{1F357}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 2. Galeria de Retratos
    {
        id: 'galeria_retratos',
        category: 'noble',
        action: {
            type: 'evidencia',
            emoji: '\u{1F5BC}\u{FE0F}',
            labelKey: 'addRoom.galeria_retratos.action',
            descKey: 'addRoom.galeria_retratos.desc'
        },
        tint: 0x9B8860,
        clueProbability: 0.45,
        itemPool: ['mascara_cortesana', 'carta_recomendacion', 'lupa_ancestral', 'sello_real'],
        events: [
            { id: 'gale_1', effect: 'bonus_clue', emoji: '\u{1F5BC}\u{FE0F}' },
            { id: 'gale_2', effect: 'flavor', emoji: '\u{1F3A8}' },
            { id: 'gale_3', effect: 'reveal_card', emoji: '\u{1F441}\u{FE0F}' },
            { id: 'gale_4', effect: 'flavor', emoji: '\u{1F576}\u{FE0F}' },
            { id: 'gale_5', effect: 'rep_plus', emoji: '\u{1F451}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 3. Sala de Musica
    {
        id: 'sala_musica',
        category: 'noble',
        action: {
            type: 'rumor',
            emoji: '\u{1F3B6}',
            labelKey: 'addRoom.sala_musica.action',
            descKey: 'addRoom.sala_musica.desc'
        },
        tint: 0x8B7A40,
        clueProbability: 0.25,
        itemPool: ['mascara_cortesana', 'carta_recomendacion', 'sello_real', 'dado_trucado'],
        events: [
            { id: 'musi_1', effect: 'flavor', emoji: '\u{1F3B5}' },
            { id: 'musi_2', effect: 'bonus_clue', emoji: '\u{1F3BB}' },
            { id: 'musi_3', effect: 'rep_plus', emoji: '\u{1F3B6}' },
            { id: 'musi_4', effect: 'flavor', emoji: '\u{1F3B8}' },
            { id: 'musi_5', effect: 'reveal_card', emoji: '\u{1F442}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    },

    // 4. Sala de Audiencias
    {
        id: 'sala_audiencias',
        category: 'noble',
        action: {
            type: 'interrogatorio',
            emoji: '\u{2696}\u{FE0F}',
            labelKey: 'addRoom.sala_audiencias.action',
            descKey: 'addRoom.sala_audiencias.desc'
        },
        tint: 0x9A8540,
        clueProbability: 0.35,
        itemPool: ['sello_real', 'carta_recomendacion', 'mascara_cortesana', 'anillo_poder'],
        events: [
            { id: 'audi_1', effect: 'reveal_card', emoji: '\u{2696}\u{FE0F}' },
            { id: 'audi_2', effect: 'bonus_clue', emoji: '\u{1F4DC}' },
            { id: 'audi_3', effect: 'rep_plus', emoji: '\u{1F3DB}\u{FE0F}' },
            { id: 'audi_4', effect: 'flavor', emoji: '\u{1F5E3}\u{FE0F}' },
            { id: 'audi_5', effect: 'rep_minus', emoji: '\u{1F4A2}' }
        ],
        weight: 1.0,
        sizeHint: 'large'
    },

    // 5. Terraza Real
    {
        id: 'terraza_real',
        category: 'noble',
        action: {
            type: 'movimiento_extra',
            emoji: '\u{1F3F0}',
            labelKey: 'addRoom.terraza_real.action',
            descKey: 'addRoom.terraza_real.desc'
        },
        tint: 0x8A8050,
        clueProbability: 0.2,
        itemPool: ['mascara_cortesana', 'botas_sigilo', 'carta_recomendacion', 'mapa_secreto'],
        events: [
            { id: 'terr_1', effect: 'movement_bonus', emoji: '\u{1F3F0}' },
            { id: 'terr_2', effect: 'flavor', emoji: '\u{1F305}' },
            { id: 'terr_3', effect: 'bonus_clue', emoji: '\u{1F52D}' },
            { id: 'terr_4', effect: 'flavor', emoji: '\u{1F32C}\u{FE0F}' },
            { id: 'terr_5', effect: 'rep_plus', emoji: '\u{2B50}' }
        ],
        weight: 0.9,
        sizeHint: 'medium',
        outdoor: true
    },

    // 6. Archivo Real
    {
        id: 'archivo_real',
        category: 'noble',
        action: {
            type: 'archivo',
            emoji: '\u{1F4DA}',
            labelKey: 'addRoom.archivo_real.action',
            descKey: 'addRoom.archivo_real.desc'
        },
        tint: 0x8A7020,
        clueProbability: 0.4,
        itemPool: ['pergamino_sellado', 'lupa_ancestral', 'carta_recomendacion', 'mapa_secreto'],
        events: [
            { id: 'arch_1', effect: 'bonus_clue', emoji: '\u{1F4DA}' },
            { id: 'arch_2', effect: 'reveal_card', emoji: '\u{1F4D1}' },
            { id: 'arch_3', effect: 'flavor', emoji: '\u{1F58B}\u{FE0F}' },
            { id: 'arch_4', effect: 'flavor', emoji: '\u{1F4C2}' },
            { id: 'arch_5', effect: 'bonus_clue', emoji: '\u{1F5C3}\u{FE0F}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // ═══════════════════════════════════════════
    // MILITARY (5)
    // ═══════════════════════════════════════════

    // 7. Cuartel de Guardias
    {
        id: 'cuartel_guardias',
        category: 'military',
        action: {
            type: 'interrogatorio',
            emoji: '\u{1F6E1}\u{FE0F}',
            labelKey: 'addRoom.cuartel_guardias.action',
            descKey: 'addRoom.cuartel_guardias.desc'
        },
        tint: 0x5a5a6a,
        clueProbability: 0.35,
        itemPool: ['trampa_sala', 'amuleto_guardian', 'polvo_cegador', 'botas_sigilo'],
        events: [
            { id: 'cuar_1', effect: 'reveal_card', emoji: '\u{1F6E1}\u{FE0F}' },
            { id: 'cuar_2', effect: 'bonus_clue', emoji: '\u{1F575}\u{FE0F}' },
            { id: 'cuar_3', effect: 'movement_block', emoji: '\u{26D4}' },
            { id: 'cuar_4', effect: 'flavor', emoji: '\u{1F94A}' },
            { id: 'cuar_5', effect: 'rep_minus', emoji: '\u{1F6AB}' }
        ],
        weight: 1.0,
        sizeHint: 'large'
    },

    // 8. Sala de Estrategia
    {
        id: 'sala_estrategia',
        category: 'military',
        action: {
            type: 'pista_metodo',
            emoji: '\u{1F5FA}\u{FE0F}',
            labelKey: 'addRoom.sala_estrategia.action',
            descKey: 'addRoom.sala_estrategia.desc'
        },
        tint: 0x606070,
        clueProbability: 0.35,
        itemPool: ['mapa_secreto', 'trampa_sala', 'amuleto_guardian', 'polvo_cegador'],
        events: [
            { id: 'estr_1', effect: 'bonus_clue', emoji: '\u{1F5FA}\u{FE0F}' },
            { id: 'estr_2', effect: 'flavor', emoji: '\u{265F}\u{FE0F}' },
            { id: 'estr_3', effect: 'reveal_card', emoji: '\u{1F4CB}' },
            { id: 'estr_4', effect: 'movement_bonus', emoji: '\u{1F3AF}' },
            { id: 'estr_5', effect: 'flavor', emoji: '\u{1FA96}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 9. Patio de Entrenamiento
    {
        id: 'patio_entrenamiento',
        category: 'military',
        action: {
            type: 'movimiento_extra',
            emoji: '\u{1F93A}',
            labelKey: 'addRoom.patio_entrenamiento.action',
            descKey: 'addRoom.patio_entrenamiento.desc'
        },
        tint: 0x585868,
        clueProbability: 0.15,
        itemPool: ['botas_sigilo', 'amuleto_guardian', 'trampa_sala', 'polvo_cegador'],
        events: [
            { id: 'pati_1', effect: 'movement_bonus', emoji: '\u{1F93A}' },
            { id: 'pati_2', effect: 'flavor', emoji: '\u{1F3CB}\u{FE0F}' },
            { id: 'pati_3', effect: 'rep_plus', emoji: '\u{1F4AA}' },
            { id: 'pati_4', effect: 'movement_bonus', emoji: '\u{1F3C3}' },
            { id: 'pati_5', effect: 'flavor', emoji: '\u{2694}\u{FE0F}' }
        ],
        weight: 0.9,
        sizeHint: 'large',
        outdoor: true
    },

    // 10. Forja
    {
        id: 'forja',
        category: 'military',
        action: {
            type: 'pista_metodo',
            emoji: '\u{1F525}',
            labelKey: 'addRoom.forja.action',
            descKey: 'addRoom.forja.desc'
        },
        tint: 0x6A5A5A,
        clueProbability: 0.3,
        itemPool: ['trampa_sala', 'polvo_cegador', 'amuleto_guardian', 'anillo_poder'],
        events: [
            { id: 'forj_1', effect: 'bonus_clue', emoji: '\u{1F525}' },
            { id: 'forj_2', effect: 'flavor', emoji: '\u{1F528}' },
            { id: 'forj_3', effect: 'flavor', emoji: '\u{2692}\u{FE0F}' },
            { id: 'forj_4', effect: 'movement_block', emoji: '\u{1F975}' },
            { id: 'forj_5', effect: 'rep_plus', emoji: '\u{1F5E1}\u{FE0F}' }
        ],
        weight: 0.9,
        sizeHint: 'medium'
    },

    // 11. Torre del Arquero
    {
        id: 'torre_arquero',
        category: 'military',
        action: {
            type: 'evidencia',
            emoji: '\u{1F3F9}',
            labelKey: 'addRoom.torre_arquero.action',
            descKey: 'addRoom.torre_arquero.desc'
        },
        tint: 0x5A6A7A,
        clueProbability: 0.4,
        itemPool: ['mapa_secreto', 'botas_sigilo', 'amuleto_guardian', 'lupa_ancestral'],
        events: [
            { id: 'arqu_1', effect: 'bonus_clue', emoji: '\u{1F3F9}' },
            { id: 'arqu_2', effect: 'reveal_card', emoji: '\u{1F52D}' },
            { id: 'arqu_3', effect: 'flavor', emoji: '\u{1F4A8}' },
            { id: 'arqu_4', effect: 'movement_bonus', emoji: '\u{1F985}' },
            { id: 'arqu_5', effect: 'flavor', emoji: '\u{1F3AF}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    },

    // ═══════════════════════════════════════════
    // MYSTICAL (4)
    // ═══════════════════════════════════════════

    // 12. Cripta Real
    {
        id: 'cripta_real',
        category: 'mystical',
        action: {
            type: 'rumor',
            emoji: '\u{26B0}\u{FE0F}',
            labelKey: 'addRoom.cripta_real.action',
            descKey: 'addRoom.cripta_real.desc'
        },
        tint: 0x3A2A4A,
        clueProbability: 0.35,
        itemPool: ['cristal_revelador', 'reliquia_antigua', 'pergamino_sellado', 'lupa_ancestral'],
        events: [
            { id: 'crip_1', effect: 'bonus_clue', emoji: '\u{26B0}\u{FE0F}' },
            { id: 'crip_2', effect: 'flavor', emoji: '\u{1F480}' },
            { id: 'crip_3', effect: 'reveal_card', emoji: '\u{1F47B}' },
            { id: 'crip_4', effect: 'rep_minus', emoji: '\u{1F9DB}' },
            { id: 'crip_5', effect: 'flavor', emoji: '\u{1F56F}\u{FE0F}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 13. Camara de Runas
    {
        id: 'camara_runas',
        category: 'mystical',
        action: {
            type: 'evidencia',
            emoji: '\u{1FA84}',
            labelKey: 'addRoom.camara_runas.action',
            descKey: 'addRoom.camara_runas.desc'
        },
        tint: 0x4A3A7A,
        clueProbability: 0.45,
        itemPool: ['cristal_revelador', 'pergamino_sellado', 'reliquia_antigua', 'lupa_ancestral'],
        events: [
            { id: 'runa_1', effect: 'bonus_clue', emoji: '\u{1FA84}' },
            { id: 'runa_2', effect: 'flavor', emoji: '\u{2728}' },
            { id: 'runa_3', effect: 'reveal_card', emoji: '\u{1F52E}' },
            { id: 'runa_4', effect: 'movement_block', emoji: '\u{1F300}' },
            { id: 'runa_5', effect: 'bonus_clue', emoji: '\u{1F4DC}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 14. Camara de Invocacion
    {
        id: 'camara_invocacion',
        category: 'mystical',
        action: {
            type: 'reveal_random',
            emoji: '\u{1F54A}\u{FE0F}',
            labelKey: 'addRoom.camara_invocacion.action',
            descKey: 'addRoom.camara_invocacion.desc'
        },
        tint: 0x5A2A6A,
        clueProbability: 0.3,
        itemPool: ['cristal_revelador', 'reliquia_antigua', 'pergamino_sellado', 'anillo_poder'],
        events: [
            { id: 'invo_1', effect: 'reveal_card', emoji: '\u{1F54A}\u{FE0F}' },
            { id: 'invo_2', effect: 'flavor', emoji: '\u{1F9D9}' },
            { id: 'invo_3', effect: 'bonus_clue', emoji: '\u{1F320}' },
            { id: 'invo_4', effect: 'rep_minus', emoji: '\u{1F608}' },
            { id: 'invo_5', effect: 'movement_block', emoji: '\u{1F32A}\u{FE0F}' }
        ],
        weight: 0.9,
        sizeHint: 'medium'
    },

    // 15. Observatorio
    {
        id: 'observatorio',
        category: 'mystical',
        action: {
            type: 'evidencia',
            emoji: '\u{1F52D}',
            labelKey: 'addRoom.observatorio.action',
            descKey: 'addRoom.observatorio.desc'
        },
        tint: 0x3A3A6A,
        clueProbability: 0.45,
        itemPool: ['cristal_revelador', 'mapa_secreto', 'pergamino_sellado', 'lupa_ancestral'],
        events: [
            { id: 'obse_1', effect: 'bonus_clue', emoji: '\u{1F52D}' },
            { id: 'obse_2', effect: 'flavor', emoji: '\u{2B50}' },
            { id: 'obse_3', effect: 'reveal_card', emoji: '\u{1F30C}' },
            { id: 'obse_4', effect: 'flavor', emoji: '\u{1F319}' },
            { id: 'obse_5', effect: 'movement_bonus', emoji: '\u{2604}\u{FE0F}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // ═══════════════════════════════════════════
    // SERVICE (7)
    // ═══════════════════════════════════════════

    // 16. Despensa
    {
        id: 'despensa',
        category: 'service',
        action: {
            type: 'bonus_item',
            emoji: '\u{1F9C0}',
            labelKey: 'addRoom.despensa.action',
            descKey: 'addRoom.despensa.desc'
        },
        tint: 0x7A6530,
        clueProbability: 0.15,
        itemPool: ['veneno_lento', 'dado_trucado', 'lupa_ancestral', 'mascara_cortesana'],
        events: [
            { id: 'desp_1', effect: 'bonus_clue', emoji: '\u{1F9C0}' },
            { id: 'desp_2', effect: 'flavor', emoji: '\u{1F356}' },
            { id: 'desp_3', effect: 'flavor', emoji: '\u{1F36F}' },
            { id: 'desp_4', effect: 'movement_block', emoji: '\u{1FAA4}' },
            { id: 'desp_5', effect: 'rep_minus', emoji: '\u{1F9C3}' }
        ],
        weight: 0.7,
        sizeHint: 'small'
    },

    // 17. Dormitorio de Criados
    {
        id: 'dormitorio_criados',
        category: 'service',
        action: {
            type: 'rumor',
            emoji: '\u{1F6CF}\u{FE0F}',
            labelKey: 'addRoom.dormitorio_criados.action',
            descKey: 'addRoom.dormitorio_criados.desc'
        },
        tint: 0x7A6040,
        clueProbability: 0.3,
        itemPool: ['mascara_cortesana', 'carta_recomendacion', 'lupa_ancestral', 'dado_trucado'],
        events: [
            { id: 'dorm_1', effect: 'bonus_clue', emoji: '\u{1F6CF}\u{FE0F}' },
            { id: 'dorm_2', effect: 'flavor', emoji: '\u{1F634}' },
            { id: 'dorm_3', effect: 'reveal_card', emoji: '\u{1F4AC}' },
            { id: 'dorm_4', effect: 'flavor', emoji: '\u{1F56F}\u{FE0F}' },
            { id: 'dorm_5', effect: 'rep_plus', emoji: '\u{1F91D}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    },

    // 18. Lavanderia
    {
        id: 'lavanderia',
        category: 'service',
        action: {
            type: 'bonus_item',
            emoji: '\u{1F9F9}',
            labelKey: 'addRoom.lavanderia.action',
            descKey: 'addRoom.lavanderia.desc'
        },
        tint: 0x6A6A50,
        clueProbability: 0.2,
        itemPool: ['capa_invisibilidad', 'mascara_cortesana', 'botas_sigilo', 'polvo_cegador'],
        events: [
            { id: 'lava_1', effect: 'bonus_clue', emoji: '\u{1F9F9}' },
            { id: 'lava_2', effect: 'flavor', emoji: '\u{1F4A7}' },
            { id: 'lava_3', effect: 'flavor', emoji: '\u{1F9FA}' },
            { id: 'lava_4', effect: 'reveal_card', emoji: '\u{1F457}' },
            { id: 'lava_5', effect: 'movement_block', emoji: '\u{1FAA3}' }
        ],
        weight: 0.7,
        sizeHint: 'small'
    },

    // 19. Establos
    {
        id: 'establos',
        category: 'service',
        action: {
            type: 'movimiento_extra',
            emoji: '\u{1F40E}',
            labelKey: 'addRoom.establos.action',
            descKey: 'addRoom.establos.desc'
        },
        tint: 0x7A5A30,
        clueProbability: 0.15,
        itemPool: ['botas_sigilo', 'capa_invisibilidad', 'mapa_secreto', 'trampa_sala'],
        events: [
            { id: 'esta_1', effect: 'movement_bonus', emoji: '\u{1F40E}' },
            { id: 'esta_2', effect: 'flavor', emoji: '\u{1F434}' },
            { id: 'esta_3', effect: 'movement_bonus', emoji: '\u{1F6B6}' },
            { id: 'esta_4', effect: 'flavor', emoji: '\u{1F33E}' },
            { id: 'esta_5', effect: 'bonus_clue', emoji: '\u{1F9D1}\u{200D}\u{1F33E}' }
        ],
        weight: 0.9,
        sizeHint: 'medium'
    },

    // 20. Granero
    {
        id: 'granero',
        category: 'service',
        action: {
            type: 'bonus_item',
            emoji: '\u{1F33E}',
            labelKey: 'addRoom.granero.action',
            descKey: 'addRoom.granero.desc'
        },
        tint: 0x7A6A30,
        clueProbability: 0.2,
        itemPool: ['trampa_sala', 'veneno_lento', 'dado_trucado', 'amuleto_guardian'],
        events: [
            { id: 'gran_1', effect: 'bonus_clue', emoji: '\u{1F33E}' },
            { id: 'gran_2', effect: 'flavor', emoji: '\u{1F400}' },
            { id: 'gran_3', effect: 'flavor', emoji: '\u{1F4E6}' },
            { id: 'gran_4', effect: 'movement_block', emoji: '\u{1FAB5}' },
            { id: 'gran_5', effect: 'rep_minus', emoji: '\u{1F9A0}' }
        ],
        weight: 0.7,
        sizeHint: 'medium'
    },

    // 21. Taller
    {
        id: 'taller',
        category: 'service',
        action: {
            type: 'pista_metodo',
            emoji: '\u{1F527}',
            labelKey: 'addRoom.taller.action',
            descKey: 'addRoom.taller.desc'
        },
        tint: 0x6A5A40,
        clueProbability: 0.3,
        itemPool: ['trampa_sala', 'polvo_cegador', 'amuleto_guardian', 'lupa_ancestral'],
        events: [
            { id: 'tall_1', effect: 'bonus_clue', emoji: '\u{1F527}' },
            { id: 'tall_2', effect: 'flavor', emoji: '\u{1F6E0}\u{FE0F}' },
            { id: 'tall_3', effect: 'flavor', emoji: '\u{2699}\u{FE0F}' },
            { id: 'tall_4', effect: 'reveal_card', emoji: '\u{1F50D}' },
            { id: 'tall_5', effect: 'movement_block', emoji: '\u{1F4A5}' }
        ],
        weight: 0.8,
        sizeHint: 'medium'
    },

    // 22. Sala de Mensajeros
    {
        id: 'sala_mensajeros',
        category: 'service',
        action: {
            type: 'rumor',
            emoji: '\u{1F4E8}',
            labelKey: 'addRoom.sala_mensajeros.action',
            descKey: 'addRoom.sala_mensajeros.desc'
        },
        tint: 0x7A7050,
        clueProbability: 0.35,
        itemPool: ['carta_recomendacion', 'pergamino_sellado', 'mapa_secreto', 'mascara_cortesana'],
        events: [
            { id: 'mens_1', effect: 'bonus_clue', emoji: '\u{1F4E8}' },
            { id: 'mens_2', effect: 'reveal_card', emoji: '\u{1F4E9}' },
            { id: 'mens_3', effect: 'flavor', emoji: '\u{1F54A}\u{FE0F}' },
            { id: 'mens_4', effect: 'flavor', emoji: '\u{1F3F3}\u{FE0F}' },
            { id: 'mens_5', effect: 'rep_plus', emoji: '\u{1F4EC}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    },

    // ═══════════════════════════════════════════
    // NATURE (5)
    // ═══════════════════════════════════════════

    // 23. Jardin del Claustro
    {
        id: 'jardin_claustro',
        category: 'nature',
        action: {
            type: 'rep_bonus',
            emoji: '\u{1F338}',
            labelKey: 'addRoom.jardin_claustro.action',
            descKey: 'addRoom.jardin_claustro.desc'
        },
        tint: 0x3A6A2A,
        clueProbability: 0.15,
        itemPool: ['botas_sigilo', 'capa_invisibilidad', 'amuleto_guardian', 'sello_real'],
        events: [
            { id: 'clau_1', effect: 'rep_plus', emoji: '\u{1F338}' },
            { id: 'clau_2', effect: 'flavor', emoji: '\u{1F9D8}' },
            { id: 'clau_3', effect: 'movement_bonus', emoji: '\u{1F343}' },
            { id: 'clau_4', effect: 'flavor', emoji: '\u{26F2}' },
            { id: 'clau_5', effect: 'rep_plus', emoji: '\u{1F54C}' }
        ],
        weight: 0.8,
        sizeHint: 'medium'
    },

    // 24. Laberinto de Setos
    {
        id: 'laberinto_setos',
        category: 'nature',
        action: {
            type: 'movimiento_extra',
            emoji: '\u{1F332}',
            labelKey: 'addRoom.laberinto_setos.action',
            descKey: 'addRoom.laberinto_setos.desc'
        },
        tint: 0x2A5A2A,
        clueProbability: 0.2,
        itemPool: ['botas_sigilo', 'capa_invisibilidad', 'mapa_secreto', 'trampa_sala'],
        events: [
            { id: 'labe_1', effect: 'movement_bonus', emoji: '\u{1F332}' },
            { id: 'labe_2', effect: 'movement_block', emoji: '\u{1F648}' },
            { id: 'labe_3', effect: 'bonus_clue', emoji: '\u{1F5FF}' },
            { id: 'labe_4', effect: 'flavor', emoji: '\u{1F33F}' },
            { id: 'labe_5', effect: 'reveal_card', emoji: '\u{1F575}\u{FE0F}' }
        ],
        weight: 1.0,
        sizeHint: 'large'
    },

    // 25. Estanque Real
    {
        id: 'estanque_real',
        category: 'nature',
        action: {
            type: 'evidencia',
            emoji: '\u{1F4A7}',
            labelKey: 'addRoom.estanque_real.action',
            descKey: 'addRoom.estanque_real.desc'
        },
        tint: 0x2A5A5A,
        clueProbability: 0.4,
        itemPool: ['cristal_revelador', 'lupa_ancestral', 'mapa_secreto', 'botas_sigilo'],
        events: [
            { id: 'estan_1', effect: 'bonus_clue', emoji: '\u{1F4A7}' },
            { id: 'estan_2', effect: 'flavor', emoji: '\u{1F41F}' },
            { id: 'estan_3', effect: 'reveal_card', emoji: '\u{1FA9E}' },
            { id: 'estan_4', effect: 'flavor', emoji: '\u{1F338}' },
            { id: 'estan_5', effect: 'rep_plus', emoji: '\u{1F9D8}\u{200D}\u{2640}\u{FE0F}' }
        ],
        weight: 1.0,
        sizeHint: 'medium'
    },

    // 26. Cementerio
    {
        id: 'cementerio',
        category: 'nature',
        action: {
            type: 'rumor',
            emoji: '\u{1FAA6}',
            labelKey: 'addRoom.cementerio.action',
            descKey: 'addRoom.cementerio.desc'
        },
        tint: 0x3A4A3A,
        clueProbability: 0.35,
        itemPool: ['reliquia_antigua', 'pergamino_sellado', 'cristal_revelador', 'amuleto_guardian'],
        events: [
            { id: 'ceme_1', effect: 'bonus_clue', emoji: '\u{1FAA6}' },
            { id: 'ceme_2', effect: 'flavor', emoji: '\u{1F480}' },
            { id: 'ceme_3', effect: 'reveal_card', emoji: '\u{1F47B}' },
            { id: 'ceme_4', effect: 'rep_minus', emoji: '\u{1F9DF}' },
            { id: 'ceme_5', effect: 'flavor', emoji: '\u{26B0}\u{FE0F}' }
        ],
        weight: 0.9,
        sizeHint: 'medium'
    },

    // 27. Jardin de Hierbas
    {
        id: 'jardin_hierbas',
        category: 'nature',
        action: {
            type: 'bonus_item',
            emoji: '\u{1F33F}',
            labelKey: 'addRoom.jardin_hierbas.action',
            descKey: 'addRoom.jardin_hierbas.desc'
        },
        tint: 0x4A6A2A,
        clueProbability: 0.2,
        itemPool: ['veneno_lento', 'botas_sigilo', 'capa_invisibilidad', 'cristal_revelador'],
        events: [
            { id: 'hier_1', effect: 'bonus_clue', emoji: '\u{1F33F}' },
            { id: 'hier_2', effect: 'flavor', emoji: '\u{1F33B}' },
            { id: 'hier_3', effect: 'flavor', emoji: '\u{1F9EA}' },
            { id: 'hier_4', effect: 'rep_plus', emoji: '\u{2618}\u{FE0F}' },
            { id: 'hier_5', effect: 'movement_bonus', emoji: '\u{1F98B}' }
        ],
        weight: 0.7,
        sizeHint: 'small'
    },

    // ═══════════════════════════════════════════
    // SPECIAL (3)
    // ═══════════════════════════════════════════

    // 28. Sala de Reliquias
    {
        id: 'sala_reliquias',
        category: 'special',
        action: {
            type: 'evidencia',
            emoji: '\u{1F3FA}',
            labelKey: 'addRoom.sala_reliquias.action',
            descKey: 'addRoom.sala_reliquias.desc'
        },
        tint: 0x6A5A4A,
        clueProbability: 0.5,
        itemPool: ['reliquia_antigua', 'anillo_poder', 'cristal_revelador', 'pergamino_sellado'],
        events: [
            { id: 'reli_1', effect: 'bonus_clue', emoji: '\u{1F3FA}' },
            { id: 'reli_2', effect: 'reveal_card', emoji: '\u{1F48E}' },
            { id: 'reli_3', effect: 'flavor', emoji: '\u{1F3F5}\u{FE0F}' },
            { id: 'reli_4', effect: 'rep_plus', emoji: '\u{2728}' },
            { id: 'reli_5', effect: 'bonus_clue', emoji: '\u{1FA99}' }
        ],
        weight: 0.8,
        sizeHint: 'medium'
    },

    // 29. Torre de Campanas
    {
        id: 'torre_campanas',
        category: 'special',
        action: {
            type: 'reveal_random',
            emoji: '\u{1F514}',
            labelKey: 'addRoom.torre_campanas.action',
            descKey: 'addRoom.torre_campanas.desc'
        },
        tint: 0x7A6A5A,
        clueProbability: 0.3,
        itemPool: ['dado_trucado', 'mapa_secreto', 'lupa_ancestral', 'reliquia_antigua'],
        events: [
            { id: 'camp_1', effect: 'reveal_card', emoji: '\u{1F514}' },
            { id: 'camp_2', effect: 'flavor', emoji: '\u{1F56D}\u{FE0F}' },
            { id: 'camp_3', effect: 'movement_bonus', emoji: '\u{1F54E}' },
            { id: 'camp_4', effect: 'bonus_clue', emoji: '\u{1F3B5}' },
            { id: 'camp_5', effect: 'rep_plus', emoji: '\u{1F570}\u{FE0F}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    },

    // 30. Torre del Reloj
    {
        id: 'torre_reloj',
        category: 'special',
        action: {
            type: 'movimiento_extra',
            emoji: '\u{1F551}',
            labelKey: 'addRoom.torre_reloj.action',
            descKey: 'addRoom.torre_reloj.desc'
        },
        tint: 0x5A5A5A,
        clueProbability: 0.2,
        itemPool: ['dado_trucado', 'botas_sigilo', 'mapa_secreto', 'anillo_poder'],
        events: [
            { id: 'relo_1', effect: 'movement_bonus', emoji: '\u{1F551}' },
            { id: 'relo_2', effect: 'flavor', emoji: '\u{23F3}' },
            { id: 'relo_3', effect: 'bonus_clue', emoji: '\u{2699}\u{FE0F}' },
            { id: 'relo_4', effect: 'movement_bonus', emoji: '\u{231A}' },
            { id: 'relo_5', effect: 'flavor', emoji: '\u{1F550}' }
        ],
        weight: 0.8,
        sizeHint: 'small'
    }
];

// ─── Accessor Functions ──────────────────────────

/**
 * Get the room action definition for any room index (core or additional).
 * @param {number} roomIndex
 * @returns {object|null} action definition with type, emoji, labelKey, descKey
 */
function getRoomAction(roomIndex) {
    if (roomIndex < CORE_ROOM_COUNT) return ROOM_ACTIONS[roomIndex];
    const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom
        ? GameState.getAdditionalRoom(roomIndex) : null;
    return addRoom ? addRoom.def.action : null;
}

/**
 * Get the room theme/category for any room index.
 * @param {number} roomIndex
 * @returns {string} theme identifier (e.g. 'torre', 'noble', 'military')
 */
function getRoomTheme(roomIndex) {
    if (roomIndex < CORE_ROOM_COUNT) return ROOM_THEMES[roomIndex];
    const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom
        ? GameState.getAdditionalRoom(roomIndex) : null;
    return addRoom ? addRoom.def.category : '';
}

/**
 * Get room-specific events for any room index.
 * @param {number} roomIndex
 * @returns {Array} array of event objects { id, effect, emoji }
 */
function getRoomEvents(roomIndex) {
    if (roomIndex < CORE_ROOM_COUNT) return ROOM_EVENTS[roomIndex];
    const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom
        ? GameState.getAdditionalRoom(roomIndex) : null;
    return addRoom ? addRoom.def.events : [];
}

/**
 * Get the item pool for any room index.
 * @param {number} roomIndex
 * @returns {Array} array of item ID strings
 */
function getRoomItemPool(roomIndex) {
    if (roomIndex < CORE_ROOM_COUNT) return ROOM_ITEM_POOLS[roomIndex];
    const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom
        ? GameState.getAdditionalRoom(roomIndex) : null;
    return addRoom ? addRoom.def.itemPool : [];
}

/**
 * Get the total number of rooms in the current game (core + additional).
 * @returns {number}
 */
function getTotalRoomCount() {
    if (typeof GameState !== 'undefined' && GameState.additionalRooms) {
        return CORE_ROOM_COUNT + GameState.additionalRooms.length;
    }
    return CORE_ROOM_COUNT;
}

/**
 * Check if a room index refers to an additional (non-core) room.
 * @param {number} roomIndex
 * @returns {boolean}
 */
function isAdditionalRoom(roomIndex) {
    return roomIndex >= CORE_ROOM_COUNT;
}

/**
 * Check if a room index refers to a core room.
 * @param {number} roomIndex
 * @returns {boolean}
 */
function isCoreRoom(roomIndex) {
    return roomIndex >= 0 && roomIndex < CORE_ROOM_COUNT;
}
