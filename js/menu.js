// ─────────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────────

const Menu = {
    selectedPlayers: 4,
    helpEnabled: true,
    manualNotebook: true,
    playerName: '',
    selectedColorIndex: 0,
    _scriptsLoaded: false,

    init() {
        document.querySelectorAll('.player-num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedPlayers = parseInt(btn.dataset.num);
                this.updateButtons();
            });
        });

        // Language selector
        const langSelect = document.getElementById('lang-selector');
        if (langSelect) {
            const locales = I18n.getAvailableLocales();
            langSelect.innerHTML = locales.map(l =>
                '<option value="' + l.code + '"' + (l.code === I18n.currentLocale ? ' selected' : '') + '>' + l.name + '</option>'
            ).join('');
            langSelect.addEventListener('change', () => {
                I18n.setLocale(langSelect.value);
                I18n.translateDOM();
                this.updateButtons();
            });
        }

        // Color selector
        this.initColorSelector();

        // Show default checked states
        document.getElementById('help-checkbox').textContent = this.helpEnabled ? '\u2713' : '';
        document.getElementById('manual-notebook-checkbox').textContent = this.manualNotebook ? '\u2713' : '';
    },

    initColorSelector() {
        const container = document.getElementById('color-selector');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < SELECTABLE_COLORS.length; i++) {
            const circle = document.createElement('div');
            circle.className = 'color-option' + (i === this.selectedColorIndex ? ' selected' : '');
            circle.style.backgroundColor = SELECTABLE_COLORS[i].css;
            circle.dataset.index = i;
            circle.addEventListener('click', () => this.selectColor(i));
            container.appendChild(circle);
        }
        this.applyColorToInput();
    },

    selectColor(index) {
        this.selectedColorIndex = index;
        document.querySelectorAll('.color-option').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
        });
        this.applyColorToInput();
    },

    applyColorToInput() {
        const input = document.getElementById('player-name-input');
        if (input) {
            input.style.color = SELECTABLE_COLORS[this.selectedColorIndex].css;
        }
    },

    updateButtons() {
        document.querySelectorAll('.player-num-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.num) === this.selectedPlayers);
        });
        document.getElementById('player-info').textContent =
            t('menu.playerInfo', { bots: this.selectedPlayers - 1 });
    },

    toggleHelp() {
        this.helpEnabled = !this.helpEnabled;
        document.getElementById('help-checkbox').textContent = this.helpEnabled ? '\u2713' : '';
    },

    toggleManualNotebook() {
        this.manualNotebook = !this.manualNotebook;
        document.getElementById('manual-notebook-checkbox').textContent = this.manualNotebook ? '\u2713' : '';
    },

    // ── Deferred script loading ──────────────────

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(s);
        });
    },

    _loadGameScripts(onProgress) {
        const scripts = [
            { src: 'js/castle-layout.js',      label: t('loading.layout') || 'Diseñando el castillo' },
            { src: 'js/additional-rooms.js',    label: t('loading.rooms') || 'Creando habitaciones' },
            { src: 'js/gamestate.js',           label: t('loading.gamestate') || 'Preparando la partida' },
            { src: 'js/reputation.js',          label: t('loading.reputation') || 'Sistema de reputación' },
            { src: 'js/inventory.js',           label: t('loading.inventory') || 'Inventario de objetos' },
            { src: 'js/ai.js',                  label: t('loading.ai') || 'Entrenando a los rivales' },
            { src: 'js/board.js',               label: t('loading.board') || 'Montando el tablero' },
            { src: 'js/ui.js',                  label: t('loading.ui') || 'Preparando la interfaz' },
            { src: 'js/refutation.js',          label: t('loading.refutation') || 'Sistema de refutación' },
            { src: 'js/game.js',                label: t('loading.game') || 'Motor del juego' }
        ];
        // 10 game scripts + 3 Three.js/board scripts = 13 total steps
        const totalSteps = scripts.length + 3;
        let step = 0;

        const advance = (label) => {
            step++;
            if (onProgress) onProgress(step, totalSteps, label);
        };

        // Load sequentially to respect dependency order
        let chain = Promise.resolve();
        for (const entry of scripts) {
            chain = chain.then(() => this._loadScript(entry.src).then(() => advance(entry.label)));
        }
        // After game scripts, load Three.js + board3d
        return chain.then(() => this._loadThreeJS(advance));
    },

    _loadThreeJS(advance) {
        return new Promise((resolve, reject) => {
            const mod = document.createElement('script');
            mod.type = 'module';
            mod.textContent =
                "import * as THREE_CORE from 'three';" +
                "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';" +
                "import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';" +
                "window.THREE = Object.assign({}, THREE_CORE, { OrbitControls, CSS2DRenderer, CSS2DObject });" +
                "window.dispatchEvent(new Event('three-ready'));";
            document.head.appendChild(mod);

            window.addEventListener('three-ready', () => {
                advance(t('loading.3d') || 'Motor gráfico 3D');
                this._loadScript('js/board3d.js')
                    .then(() => { advance(t('loading.castle3d') || 'Construyendo el castillo 3D'); return this._loadScript('js/board-manager.js'); })
                    .then(() => {
                        advance(t('loading.finishing') || 'Últimos preparativos');
                        BoardManager.init();
                        resolve();
                    })
                    .catch(reject);
            }, { once: true });
        });
    },

    // ── Start game (with deferred loading) ───────

    _showLoadingOverlay() {
        document.getElementById('loading-overlay').classList.add('active');
    },

    _hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('active');
    },

    _updateLoadingProgress(step, total, label) {
        const pct = Math.round((step / total) * 100);
        document.getElementById('loading-bar-fill').style.width = pct + '%';
        const status = document.getElementById('loading-status');
        if (status) status.textContent = label || '';
    },

    startGame() {
        if (this._scriptsLoaded) {
            this._initGame();
            return;
        }

        this._showLoadingOverlay();

        this._loadGameScripts((step, total, label) => {
            this._updateLoadingProgress(step, total, label);
        }).then(() => {
            this._scriptsLoaded = true;
            this._hideLoadingOverlay();
            this._initGame();
        }).catch(err => {
            console.error('Error loading game scripts:', err);
            this._hideLoadingOverlay();
        });
    },

    _initGame() {
        GameState.helpEnabled = this.helpEnabled;
        GameState.manualNotebook = this.manualNotebook;
        const nameInput = document.getElementById('player-name-input');
        this.playerName = nameInput ? nameInput.value.trim() : '';
        GameState.init(this.selectedPlayers);

        // Rebuild 3D castle with new procedural layout
        if (typeof BoardManager !== 'undefined') {
            BoardManager.relayout();
        }

        // Hide menu, show game panels
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('top-bar').classList.remove('hidden');
        document.getElementById('left-panel').classList.remove('hidden');
        document.getElementById('right-panel').classList.remove('hidden');
        document.getElementById('bottom-bar').classList.remove('hidden');

        UI.initCards();

        // Ensure 3D render loop is running (may have been stopped by backToMenu)
        if (typeof Board3D !== 'undefined' && Board3D._initialized) {
            Board3D.startRenderLoop();
        }

        Board.updateHighlights();
        Board.draw();
        if (Board.setTimePeriod) Board.setTimePeriod(GameState.getTimePeriod());
        UI.updateHUD();
        UI.updateLog();

        // Show tutorial parchment when help mode is enabled
        if (this.helpEnabled) {
            UI.showTutorialIntro();
        }
    }
};
