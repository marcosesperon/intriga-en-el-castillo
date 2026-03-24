// ─────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────

const CARDS = {
    conspiradores: ['Caballero Real','Reina','Alquimista','Embajador','Sacerdotisa','Bufón'],
    metodos: ['Veneno','Daga','Hechizo','Flecha','Trampa','Bestia liberada'],
    lugares: ['Torre del Mago','Biblioteca','Armería','Capilla','Salón del Trono','Sala del Consejo','Cocina Real','Jardines','Mazmorras'],
    motivos: ['Ambición al trono','Venganza','Conspiración extranjera','Herejía','Deuda','Amor prohibido']
};

const ROOM_NAMES = CARDS.lugares;

// Dynamic per game — reassigned by CastleLayout.generate() each new game
let CONNECTIONS = {
    0:[1,3], 1:[0,2,4], 2:[1,5],
    3:[0,4,6], 4:[1,3,5,7], 5:[2,4,8],
    6:[3,7], 7:[4,6,8], 8:[5,7]
};

let SECRET_PASSAGES = { 0:8, 8:0, 1:6, 6:1 };

const THRONE_ROOM_INDEX = 4;

const PLAYER_COLORS = ['#FFD700','#E74C3C','#3498DB','#2ECC71','#9B59B6'];
const PLAYER_COLORS_HEX = [0xFFD700, 0xE74C3C, 0x3498DB, 0x2ECC71, 0x9B59B6];

const SELECTABLE_COLORS = [
    { css: '#FFD700', hex: 0xFFD700 },
    { css: '#E74C3C', hex: 0xE74C3C },
    { css: '#3498DB', hex: 0x3498DB },
    { css: '#2ECC71', hex: 0x2ECC71 },
    { css: '#9B59B6', hex: 0x9B59B6 },
    { css: '#E67E22', hex: 0xE67E22 }
];

function getPlayerNames() {
    return I18n.locales[I18n.currentLocale]?.PLAYER_NAMES || ['Tú','Bot Cedric','Bot Isolda','Bot Gareth','Bot Morgana'];
}

const PHASES = {
    ROLL_DICE:'ROLL_DICE', MOVING:'MOVING', ACTION_CHOICE:'ACTION_CHOICE',
    SUSPICION_INPUT:'SUSPICION_INPUT', REFUTATION_ROUND:'REFUTATION_ROUND',
    SUSPICION_RESULT:'SUSPICION_RESULT', ACCUSATION:'ACCUSATION',
    END_TURN:'END_TURN', GAME_OVER:'GAME_OVER'
};

const ROOM_ACTIONS = [
    { idx: 0, type: 'evidencia', emoji: '\u{1F52E}', labelKey: 'roomActionLabel.0', descKey: 'roomAction.torre.subtitle' },
    { idx: 1, type: 'archivo', emoji: '\u{1F4DC}', labelKey: 'roomActionLabel.1', descKey: 'roomAction.biblioteca.subtitle' },
    { idx: 2, type: 'pista_metodo', emoji: '\u{2694}', labelKey: 'roomActionLabel.2', descKey: 'roomAction.armeria.subtitle' },
    { idx: 3, type: 'intuicion', emoji: '\u{1F64F}', labelKey: 'roomActionLabel.3', descKey: 'roomAction.capilla.subtitle' },
    { idx: 4, type: null, emoji: '\u{1F451}', labelKey: null, descKey: null },
    { idx: 5, type: 'rumor', emoji: '\u{1F5E3}', labelKey: 'roomActionLabel.5', descKey: 'roomAction.biblioteca.subtitle' },
    { idx: 6, type: 'rumor', emoji: '\u{1F377}', labelKey: 'roomActionLabel.6', descKey: 'roomAction.biblioteca.subtitle' },
    { idx: 7, type: 'movimiento_extra', emoji: '\u{1F33F}', labelKey: 'roomActionLabel.7', descKey: 'roomAction.jardines.log' },
    { idx: 8, type: 'interrogatorio', emoji: '\u{26D3}', labelKey: 'roomActionLabel.8', descKey: 'roomAction.mazmorras.subtitle' }
];

const EVENTS = [
    // Eventos del Castillo (8)
    { id:1, emoji:'\u{1F6AA}', category:'castillo', effect:'puertas_cerradas', interactive:true },
    { id:2, emoji:'\u{1F573}', category:'castillo', effect:'pasadizo_descubierto', interactive:false },
    { id:3, emoji:'\u{1F525}', category:'castillo', effect:'incendio_cocina', interactive:false },
    { id:4, emoji:'\u{1F6E1}', category:'castillo', effect:'guardia_alerta', interactive:false },
    { id:5, emoji:'\u{1F50D}', category:'castillo', effect:'inspeccion', interactive:true },
    { id:6, emoji:'\u{1F300}', category:'castillo', effect:'pasillos_confusos', interactive:false },
    { id:7, emoji:'\u{1F512}', category:'castillo', effect:'torre_sellada', interactive:false },
    { id:8, emoji:'\u{2694}', category:'castillo', effect:'guardias_repos', interactive:true },
    // Eventos Sociales (6)
    { id:9, emoji:'\u{1F389}', category:'social', effect:'banquete', interactive:false },
    { id:10, emoji:'\u{1F91D}', category:'social', effect:'negociacion', interactive:true },
    { id:11, emoji:'\u{1F442}', category:'social', effect:'rumor_corte', interactive:false },
    { id:12, emoji:'\u{1F451}', category:'social', effect:'audiencia', interactive:true },
    { id:13, emoji:'\u{1F575}', category:'social', effect:'espia', interactive:false },
    { id:14, emoji:'\u{1F92B}', category:'social', effect:'pacto_silencio', interactive:false },
    // Eventos de Investigación (6)
    { id:15, emoji:'\u{1F4CB}', category:'investigacion', effect:'archivos_reales', interactive:false },
    { id:16, emoji:'\u{1F4DC}', category:'investigacion', effect:'documento_secreto', interactive:false },
    { id:17, emoji:'\u{2697}', category:'investigacion', effect:'experimento', interactive:true },
    { id:18, emoji:'\u{26EA}', category:'investigacion', effect:'confesion', interactive:true },
    { id:19, emoji:'\u{1F4CA}', category:'investigacion', effect:'informe_consejo', interactive:false },
    { id:20, emoji:'\u{1F5DD}', category:'investigacion', effect:'informante', interactive:false },
    // Eventos Caóticos (4)
    { id:21, emoji:'\u{26C8}', category:'caotico', effect:'tormenta', interactive:false },
    { id:22, emoji:'\u{1F409}', category:'caotico', effect:'bestia', interactive:false },
    { id:23, emoji:'\u{1F0CF}', category:'caotico', effect:'fiesta_bufon', interactive:false },
    { id:24, emoji:'\u{26A0}', category:'caotico', effect:'trampa', interactive:false },
    // Reputation events (3)
    { id:25, emoji:'\u{1F5E3}', category:'social', effect:'rumor_malicioso', interactive:false },
    { id:26, emoji:'\u{1F3C6}', category:'social', effect:'honor_corte', interactive:false },
    { id:27, emoji:'\u{1F4A5}', category:'caotico', effect:'escandalo', interactive:false }
];

// ─── Dynamic Event System ───────────────────────────

// Events that increase chaos level when triggered
const CHAOS_EVENTS = new Set([
    'tormenta', 'bestia', 'fiesta_bufon', 'trampa', 'escandalo', 'incendio_cocina'
]);

// Event probability weights by game phase (turn ranges)
const EVENT_PHASE_WEIGHTS = {
    early:  { investigacion: 40, castillo: 30, social: 25, caotico: 5 },   // turns 1-3
    mid:    { investigacion: 25, social: 30, castillo: 25, caotico: 20 },   // turns 4-7
    late:   { social: 30, castillo: 25, investigacion: 20, caotico: 25 }    // turns 8+
};

// ─── Day/Night Cycle ─────────────────────────────
const TIME_PERIODS = ['dia', 'atardecer', 'noche', 'madrugada'];
const TIME_PERIOD_ROUNDS = 2; // rounds per period

const TIME_PERIOD_EMOJI = {
    dia: '\u2600\uFE0F', atardecer: '\uD83C\uDF05', noche: '\uD83C\uDF19', madrugada: '\uD83C\uDF04'
};

const TIME_PERIOD_EVENT_WEIGHTS = {
    dia:        { social: 15, investigacion: 0, castillo: 0, caotico: -5 },
    atardecer:  { social: 20, investigacion: 0, castillo: 0, caotico: 0 },
    noche:      { social: -10, investigacion: -5, castillo: 5, caotico: 20 },
    madrugada:  { social: 0, investigacion: 15, castillo: 0, caotico: -10 }
};

const TIME_PERIOD_INVESTIGATION_BONUS = {
    dia: 1.0, atardecer: 1.0, noche: 0.8, madrugada: 1.3
};

const TIME_PERIOD_LIGHTING = {
    dia: {
        background: 0x5a7a9a, fog: 0x5a7a9a, fogDensity: 0.018,
        ambientColor: 0xc0b8a8, ambientIntensity: 3.0,
        dirColor: 0xFFEECC, dirIntensity: 2.5, dirPosition: { x: 6, y: 14, z: 4 },
        hemiSky: 0xddeeff, hemiGround: 0xaa9977, hemiIntensity: 1.2,
        torchIntensity: 0.2, torchRange: 8
    },
    atardecer: {
        background: 0x3a2a20, fog: 0x3a2a20, fogDensity: 0.025,
        ambientColor: 0xBB8855, ambientIntensity: 2.2,
        dirColor: 0xFF9944, dirIntensity: 2.0, dirPosition: { x: -8, y: 6, z: 6 },
        hemiSky: 0xDD8844, hemiGround: 0x665533, hemiIntensity: 0.9,
        torchIntensity: 0.4, torchRange: 12
    },
    noche: {
        background: 0x0f0c08, fog: 0x0f0c08, fogDensity: 0.035,
        ambientColor: 0x908070, ambientIntensity: 2.0,
        dirColor: 0xFFE8C0, dirIntensity: 1.5, dirPosition: { x: 6, y: 12, z: 6 },
        hemiSky: 0xbbbbdd, hemiGround: 0x887766, hemiIntensity: 0.8,
        torchIntensity: 0.5, torchRange: 14
    },
    madrugada: {
        background: 0x1a1830, fog: 0x1a1830, fogDensity: 0.028,
        ambientColor: 0x7080a0, ambientIntensity: 2.4,
        dirColor: 0xBBCCFF, dirIntensity: 1.8, dirPosition: { x: 8, y: 8, z: -4 },
        hemiSky: 0x8899cc, hemiGround: 0x554466, hemiIntensity: 1.0,
        torchIntensity: 0.35, torchRange: 11
    }
};

// Event combo chains: effect → next event id
const EVENT_COMBOS = {
    'incendio_cocina': 4,   // Incendio → Guardia alerta
    'bestia': 8,            // Bestia liberada → Guardias repos
    'tormenta': 7,          // Tormenta → Torre sellada
    'fiesta_bufon': 11,     // Fiesta bufón → Rumor en la corte
    'espia': 14             // Espía descubierto → Pacto de silencio
};

// ─── Major Events (triggered when chaos >= 3) ──────

const MAJOR_EVENTS = [
    { id: 'revuelta', emoji: '\u{2694}\u{FE0F}', effect: 'revuelta', interactive: false },
    { id: 'asalto_mazmorras', emoji: '\u{1F5DD}\u{FE0F}', effect: 'asalto_mazmorras', interactive: false },
    { id: 'intriga_real', emoji: '\u{1F451}', effect: 'intriga_real', interactive: false },
    { id: 'noche_tormenta', emoji: '\u{1F329}\u{FE0F}', effect: 'noche_tormenta', interactive: false },
    { id: 'juicio_real', emoji: '\u{2696}\u{FE0F}', effect: 'juicio_real', interactive: true }
];

// ─── Narrative Events (multi-turn) ───────────────────

const NARRATIVE_EVENTS = [
    // AMBIENTALES
    { id: 'narr_tormenta', emoji: '\u{26C8}\u{FE0F}', category: 'ambiental', duration: 3,
      blockedRooms: [7], dicePenalty: 0, socialBlock: false },
    { id: 'narr_niebla', emoji: '\u{1F32B}\u{FE0F}', category: 'ambiental', duration: 2,
      blockedRooms: [], dicePenalty: 1, socialBlock: false, hidePositions: true },
    { id: 'narr_incendio_ala', emoji: '\u{1F525}', category: 'ambiental', duration: 3,
      blockedRooms: [1, 2], dicePenalty: 0, socialBlock: false },
    // POLÍTICOS
    { id: 'narr_investigacion_real', emoji: '\u{1F4DC}', category: 'politico', duration: 2,
      blockedRooms: [], dicePenalty: 0, socialBlock: false },
    { id: 'narr_consejo_emergencia', emoji: '\u{1F3DB}\u{FE0F}', category: 'politico', duration: 2,
      blockedRooms: [], dicePenalty: 0, socialBlock: false, bonusClueAllRooms: true },
    { id: 'narr_caceria_traidores', emoji: '\u{1F5E1}\u{FE0F}', category: 'politico', duration: 3,
      blockedRooms: [], dicePenalty: 0, socialBlock: false },
    // INVESTIGACIÓN
    { id: 'narr_archivos_secretos', emoji: '\u{1F4DA}', category: 'investigacion', duration: 3,
      blockedRooms: [], dicePenalty: 0, socialBlock: false,
      roomOverride: { room: 1, effectFilter: 'bonus_clue' } },
    { id: 'narr_testigo_protegido', emoji: '\u{1F575}\u{FE0F}', category: 'investigacion', duration: 2,
      blockedRooms: [], dicePenalty: 0, socialBlock: false,
      roomOverride: { room: 8 } },
    { id: 'narr_analisis_alquimico', emoji: '\u{2697}\u{FE0F}', category: 'investigacion', duration: 2,
      blockedRooms: [], dicePenalty: 0, socialBlock: false,
      roomOverride: { room: 0 } },
    // CAÓTICOS
    { id: 'narr_fuga_mazmorras', emoji: '\u{1F480}', category: 'caotico', duration: 3,
      blockedRooms: [], dicePenalty: 0, socialBlock: false },
    { id: 'narr_ritual_prohibido', emoji: '\u{1F52E}', category: 'caotico', duration: 2,
      blockedRooms: [], dicePenalty: 0, socialBlock: false, chaoticoBonus: 20 },
    { id: 'narr_oscuridad_total', emoji: '\u{1F311}', category: 'caotico', duration: 1,
      blockedRooms: [], dicePenalty: 2, socialBlock: true }
];

const NARRATIVE_EVENT_PROB = { early: 0, mid: 0.15, late: 0.30 };
const MAX_ACTIVE_NARRATIVES = 2;

// ─── Room-Specific Events (5 per room) ─────────────

const ROOM_EVENTS = {
    0: [ // Torre del Mago
        { id: 'torre_1', effect: 'bonus_clue', emoji: '\u{1F52E}' },
        { id: 'torre_2', effect: 'flavor', emoji: '\u{2697}\u{FE0F}' },
        { id: 'torre_3', effect: 'bonus_clue', emoji: '\u{1F4D6}' },
        { id: 'torre_4', effect: 'movement_block', emoji: '\u{26A1}' },
        { id: 'torre_5', effect: 'movement_bonus', emoji: '\u{1F300}' }
    ],
    1: [ // Biblioteca
        { id: 'biblio_1', effect: 'bonus_clue', emoji: '\u{1F4D5}' },
        { id: 'biblio_2', effect: 'reveal_card', emoji: '\u{1F5C3}\u{FE0F}' },
        { id: 'biblio_3', effect: 'flavor', emoji: '\u{1F4D3}' },
        { id: 'biblio_4', effect: 'movement_bonus', emoji: '\u{1F6AA}' },
        { id: 'biblio_5', effect: 'flavor', emoji: '\u{1F4DC}' }
    ],
    2: [ // Armería
        { id: 'arme_1', effect: 'flavor', emoji: '\u{1F5E1}\u{FE0F}' },
        { id: 'arme_2', effect: 'flavor', emoji: '\u{2694}\u{FE0F}' },
        { id: 'arme_3', effect: 'movement_block', emoji: '\u{1F6E1}\u{FE0F}' },
        { id: 'arme_4', effect: 'bonus_clue', emoji: '\u{1F4CB}' },
        { id: 'arme_5', effect: 'rep_minus', emoji: '\u{1F528}' }
    ],
    3: [ // Capilla
        { id: 'capi_1', effect: 'reveal_card', emoji: '\u{1F64F}' },
        { id: 'capi_2', effect: 'flavor', emoji: '\u{26EA}' },
        { id: 'capi_3', effect: 'flavor', emoji: '\u{271D}\u{FE0F}' },
        { id: 'capi_4', effect: 'rep_plus', emoji: '\u{1F56F}\u{FE0F}' },
        { id: 'capi_5', effect: 'reveal_card', emoji: '\u{1F441}\u{FE0F}' }
    ],
    4: [ // Salón del Trono
        { id: 'trono_1', effect: 'flavor', emoji: '\u{1F451}' },
        { id: 'trono_2', effect: 'reveal_card', emoji: '\u{2696}\u{FE0F}' },
        { id: 'trono_3', effect: 'rep_plus', emoji: '\u{1F3C5}' },
        { id: 'trono_4', effect: 'flavor', emoji: '\u{1F93A}' },
        { id: 'trono_5', effect: 'rep_plus', emoji: '\u{1F4EF}' }
    ],
    5: [ // Sala del Consejo
        { id: 'conse_1', effect: 'rep_plus', emoji: '\u{1F5E3}\u{FE0F}' },
        { id: 'conse_2', effect: 'flavor', emoji: '\u{1F91D}' },
        { id: 'conse_3', effect: 'reveal_card', emoji: '\u{1F575}\u{FE0F}' },
        { id: 'conse_4', effect: 'bonus_clue', emoji: '\u{1F4C3}' },
        { id: 'conse_5', effect: 'flavor', emoji: '\u{1F480}' }
    ],
    6: [ // Cocina Real
        { id: 'cocina_1', effect: 'flavor', emoji: '\u{1F630}' },
        { id: 'cocina_2', effect: 'flavor', emoji: '\u{2620}\u{FE0F}' },
        { id: 'cocina_3', effect: 'movement_block', emoji: '\u{1F37D}\u{FE0F}' },
        { id: 'cocina_4', effect: 'flavor', emoji: '\u{1F9EA}' },
        { id: 'cocina_5', effect: 'bonus_clue', emoji: '\u{1F377}' }
    ],
    7: [ // Jardines
        { id: 'jardin_1', effect: 'movement_bonus', emoji: '\u{1F463}' },
        { id: 'jardin_2', effect: 'bonus_clue', emoji: '\u{1F48C}' },
        { id: 'jardin_3', effect: 'flavor', emoji: '\u{1F319}' },
        { id: 'jardin_4', effect: 'flavor', emoji: '\u{1F5FF}' },
        { id: 'jardin_5', effect: 'flavor', emoji: '\u{1F339}' }
    ],
    8: [ // Mazmorras
        { id: 'mazmo_1', effect: 'bonus_clue', emoji: '\u{26D3}\u{FE0F}' },
        { id: 'mazmo_2', effect: 'flavor', emoji: '\u{1F631}' },
        { id: 'mazmo_3', effect: 'movement_bonus', emoji: '\u{1F517}' },
        { id: 'mazmo_4', effect: 'reveal_card', emoji: '\u{1F4B0}' },
        { id: 'mazmo_5', effect: 'movement_bonus', emoji: '\u{1F3C3}' }
    ]
};

// Phase colors for UI
const PHASE_COLORS = {
    ROLL_DICE: 'phase-roll',
    MOVING: 'phase-moving',
    ACTION_CHOICE: 'phase-action',
    SUSPICION_INPUT: 'phase-suspicion',
    REFUTATION_ROUND: 'phase-refutation',
    ACCUSATION: 'phase-accusation',
    END_TURN: 'phase-end',
    GAME_OVER: 'phase-gameover'
};

// Room theme identifiers
const ROOM_THEMES = ['torre','biblioteca','armeria','capilla','trono','consejo','cocina','jardines','mazmorras'];

// ─── Inventory System ──────────────────────────────

const ITEMS = [
    // ── Investigación (4) ──
    { id: 'lupa_ancestral',      type: 'investigacion', rarity: 'comun',      emoji: '\u{1F50D}', consumable: false, durability: 3 },
    { id: 'pergamino_sellado',   type: 'investigacion', rarity: 'raro',       emoji: '\u{1F4DC}', consumable: true,  durability: 1 },
    { id: 'mapa_secreto',        type: 'investigacion', rarity: 'raro',       emoji: '\u{1F5FA}\u{FE0F}', consumable: true,  durability: 1 },
    { id: 'cristal_revelador',   type: 'investigacion', rarity: 'legendario', emoji: '\u{1F52E}', consumable: false, durability: 2 },
    // ── Movimiento (2) ──
    { id: 'botas_sigilo',        type: 'movimiento',    rarity: 'comun',      emoji: '\u{1F462}', consumable: false, durability: 3 },
    { id: 'capa_invisibilidad',  type: 'movimiento',    rarity: 'legendario', emoji: '\u{1F9E5}', consumable: false, durability: 1 },
    // ── Social (3) ──
    { id: 'sello_real',          type: 'social',        rarity: 'raro',       emoji: '\u{1F451}', consumable: true,  durability: 1 },
    { id: 'mascara_cortesana',   type: 'social',        rarity: 'comun',      emoji: '\u{1F3AD}', consumable: false, durability: 2 },
    { id: 'carta_recomendacion', type: 'social',        rarity: 'comun',      emoji: '\u{1F48C}', consumable: true,  durability: 1 },
    // ── Sabotaje (3) ──
    { id: 'veneno_lento',        type: 'sabotaje',      rarity: 'raro',       emoji: '\u{2620}\u{FE0F}', consumable: true,  durability: 1 },
    { id: 'trampa_sala',         type: 'sabotaje',      rarity: 'comun',      emoji: '\u{1FAA4}', consumable: true,  durability: 1 },
    { id: 'polvo_cegador',       type: 'sabotaje',      rarity: 'raro',       emoji: '\u{1F4A8}', consumable: true,  durability: 1 },
    // ── Protección (2) ──
    { id: 'amuleto_guardian',    type: 'proteccion',    rarity: 'comun',      emoji: '\u{1F6E1}\u{FE0F}', consumable: false, durability: 3 },
    { id: 'anillo_poder',        type: 'proteccion',    rarity: 'legendario', emoji: '\u{1F48D}', consumable: false, durability: 2 },
    // ── Especial (2) ──
    { id: 'reliquia_antigua',    type: 'especial',      rarity: 'legendario', emoji: '\u{26B1}\u{FE0F}', consumable: false, durability: 0 },
    { id: 'dado_trucado',        type: 'especial',      rarity: 'raro',       emoji: '\u{1F3B2}', consumable: true,  durability: 1 }
];

const ROOM_ITEM_POOLS = {
    0: ['cristal_revelador', 'lupa_ancestral', 'pergamino_sellado', 'reliquia_antigua'],   // Torre del Mago
    1: ['pergamino_sellado', 'mapa_secreto', 'lupa_ancestral', 'carta_recomendacion'],     // Biblioteca
    2: ['trampa_sala', 'polvo_cegador', 'botas_sigilo', 'amuleto_guardian'],               // Armería
    3: ['amuleto_guardian', 'sello_real', 'anillo_poder', 'reliquia_antigua'],              // Capilla
    4: ['sello_real', 'anillo_poder', 'carta_recomendacion', 'dado_trucado'],              // Salón del Trono
    5: ['mascara_cortesana', 'carta_recomendacion', 'sello_real', 'mapa_secreto'],         // Sala del Consejo
    6: ['veneno_lento', 'dado_trucado', 'mascara_cortesana', 'lupa_ancestral'],            // Cocina Real
    7: ['botas_sigilo', 'capa_invisibilidad', 'mapa_secreto', 'trampa_sala'],              // Jardines
    8: ['veneno_lento', 'polvo_cegador', 'cristal_revelador', 'capa_invisibilidad']        // Mazmorras
};

const ITEM_RARITY_WEIGHTS = { comun: 60, raro: 30, legendario: 10 };
const MAX_INVENTORY = 3;
const ITEM_PICKUP_PROB = 0.20;

// Items that require a target player to use
const ITEM_NEEDS_TARGET = new Set([
    'cristal_revelador', 'carta_recomendacion', 'veneno_lento', 'polvo_cegador'
]);

// Items with passive effects (no explicit "use" action)
const ITEM_PASSIVE = new Set(['amuleto_guardian', 'reliquia_antigua']);
