// ═══════════════════════════════════════════════════════════════
// AUDIO MANAGER — Sound effects, music & ambient for the game
// ═══════════════════════════════════════════════════════════════

const AUDIO_CATALOG = {
    // SFX (one-shot)
    'sfx/dice_roll':    { src: 'assets/audio/sfx/dice_roll.mp3',    cat: 'sfx' },
    'sfx/dice_land':    { src: 'assets/audio/sfx/dice_land.mp3',    cat: 'sfx' },
    'sfx/footstep':     { src: 'assets/audio/sfx/footstep.mp3',     cat: 'sfx' },
    'sfx/door':         { src: 'assets/audio/sfx/door.mp3',         cat: 'sfx' },
    'sfx/card_flip':    { src: 'assets/audio/sfx/card_flip.mp3',    cat: 'sfx' },
    'sfx/discovery':    { src: 'assets/audio/sfx/discovery.mp3',    cat: 'sfx' },
    'sfx/story':        { src: 'assets/audio/sfx/story.mp3',        cat: 'sfx' },
    'sfx/item_pickup':  { src: 'assets/audio/sfx/item_pickup.mp3',  cat: 'sfx' },
    'sfx/notification': { src: 'assets/audio/sfx/notification.mp3', cat: 'sfx' },
    'sfx/success':      { src: 'assets/audio/sfx/success.mp3',      cat: 'sfx' },
    'sfx/fail':         { src: 'assets/audio/sfx/fail.mp3',         cat: 'sfx' },
    // Music (looped)
    'music/menu':       { src: 'assets/audio/music/menu.mp3',       cat: 'music' },
    'music/gameplay':   { src: 'assets/audio/music/gameplay.mp3',   cat: 'music' },
    'music/tension':    { src: 'assets/audio/music/tension.mp3',    cat: 'music' },
    // Ambient (looped)
    'ambient/castle':   { src: 'assets/audio/ambient/castle.mp3',   cat: 'ambient' }
};

const AudioManager = {

    enabled: true,
    muted: false,
    volumes: { master: 0.7, sfx: 1.0, music: 0.5, ambient: 0.4 },

    _cache: {},           // id → Audio element (preloaded)
    _loaded: {},          // id → boolean (file exists & loaded)
    _currentMusic: null,  // { id, audio }
    _currentAmbient: null,// { id, audio }
    _initialized: false,
    _userInteracted: false, // mobile autoplay gate

    // ─── Initialization ────────────────────────────

    init() {
        this._loadPrefs();
        this._initialized = true;

        // Mobile: unlock audio context on first user interaction
        const unlock = () => {
            this._userInteracted = true;
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock, { once: false });
        document.addEventListener('touchstart', unlock, { once: false });
    },

    /**
     * Preload all audio files. Returns a promise that resolves when done.
     * Files that don't exist are silently skipped.
     */
    preload() {
        const promises = [];
        for (const id in AUDIO_CATALOG) {
            const entry = AUDIO_CATALOG[id];
            promises.push(this._preloadOne(id, entry.src));
        }
        return Promise.allSettled(promises);
    },

    _preloadOne(id, src) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'auto';

            audio.addEventListener('canplaythrough', () => {
                this._cache[id] = audio;
                this._loaded[id] = true;
                resolve(id);
            }, { once: true });

            audio.addEventListener('error', () => {
                this._loaded[id] = false;
                resolve(id); // Don't reject — graceful degradation
            }, { once: true });

            audio.src = src;
        });
    },

    // ─── Playback ──────────────────────────────────

    /**
     * Play a one-shot SFX.
     * @param {string} id - Sound ID from AUDIO_CATALOG (e.g. 'sfx/dice_roll')
     * @param {object} opts - { volume: 0-1 } optional overrides
     */
    play(id, opts) {
        if (!this._canPlay(id)) return;
        const entry = AUDIO_CATALOG[id];
        if (!entry || entry.cat !== 'sfx') return;

        // Clone the cached audio for overlapping playback
        const source = this._cache[id];
        const audio = source.cloneNode();
        audio.volume = this._calcVolume('sfx', opts && opts.volume);
        audio.play().catch(() => {});
    },

    /**
     * Play background music with crossfade.
     * @param {string} id - Music ID (e.g. 'music/gameplay')
     * @param {object} opts - { fadeIn: ms, loop: bool }
     */
    playMusic(id, opts) {
        if (this._currentMusic && this._currentMusic.id === id) return; // Already playing

        const fadeIn = (opts && opts.fadeIn) || 1000;
        const loop = (opts && opts.loop !== undefined) ? opts.loop : true;

        // Fade out current music
        if (this._currentMusic) {
            this._fadeOut(this._currentMusic.audio, 800);
        }

        if (!this._canPlay(id)) { this._currentMusic = null; return; }
        const entry = AUDIO_CATALOG[id];
        if (!entry || entry.cat !== 'music') return;

        const audio = this._cache[id].cloneNode();
        audio.loop = loop;
        audio.volume = 0;
        audio.play().catch(() => {});

        const targetVol = this._calcVolume('music');
        this._fadeIn(audio, targetVol, fadeIn);

        this._currentMusic = { id, audio };
    },

    /**
     * Play ambient sound (looped).
     * @param {string} id - Ambient ID (e.g. 'ambient/castle')
     */
    playAmbient(id) {
        if (this._currentAmbient && this._currentAmbient.id === id) return;

        if (this._currentAmbient) {
            this._fadeOut(this._currentAmbient.audio, 600);
        }

        if (!this._canPlay(id)) { this._currentAmbient = null; return; }
        const entry = AUDIO_CATALOG[id];
        if (!entry || entry.cat !== 'ambient') return;

        const audio = this._cache[id].cloneNode();
        audio.loop = true;
        audio.volume = 0;
        audio.play().catch(() => {});

        const targetVol = this._calcVolume('ambient');
        this._fadeIn(audio, targetVol, 800);

        this._currentAmbient = { id, audio };
    },

    stopMusic(fadeMs) {
        if (!this._currentMusic) return;
        this._fadeOut(this._currentMusic.audio, fadeMs || 800);
        this._currentMusic = null;
    },

    stopAmbient(fadeMs) {
        if (!this._currentAmbient) return;
        this._fadeOut(this._currentAmbient.audio, fadeMs || 600);
        this._currentAmbient = null;
    },

    stopAll() {
        this.stopMusic(400);
        this.stopAmbient(400);
    },

    // ─── Volume & Mute ─────────────────────────────

    setMasterVolume(val) {
        this.volumes.master = Math.max(0, Math.min(1, val));
        this._applyVolumes();
        this._savePrefs();
    },

    toggleMute() {
        this.muted = !this.muted;
        this._applyVolumes();
        this._savePrefs();
        return this.muted;
    },

    _applyVolumes() {
        if (this._currentMusic) {
            this._currentMusic.audio.volume = this.muted ? 0 : this._calcVolume('music');
        }
        if (this._currentAmbient) {
            this._currentAmbient.audio.volume = this.muted ? 0 : this._calcVolume('ambient');
        }
    },

    _calcVolume(cat, override) {
        if (this.muted) return 0;
        const catVol = override !== undefined ? override : (this.volumes[cat] || 1);
        return catVol * this.volumes.master;
    },

    _canPlay(id) {
        return this._initialized && !this.muted && this._loaded[id] && this.volumes.master > 0;
    },

    // ─── Fade helpers ──────────────────────────────

    _fadeIn(audio, targetVol, durationMs) {
        const steps = 20;
        const stepMs = durationMs / steps;
        const increment = targetVol / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= targetVol) {
                audio.volume = targetVol;
                clearInterval(interval);
            } else {
                audio.volume = current;
            }
        }, stepMs);
    },

    _fadeOut(audio, durationMs) {
        const steps = 20;
        const stepMs = durationMs / steps;
        const startVol = audio.volume;
        const decrement = startVol / steps;
        let current = startVol;
        const interval = setInterval(() => {
            current -= decrement;
            if (current <= 0) {
                audio.volume = 0;
                audio.pause();
                clearInterval(interval);
            } else {
                audio.volume = current;
            }
        }, stepMs);
    },

    // ─── Persistence ───────────────────────────────

    _savePrefs() {
        try {
            localStorage.setItem('castle_audio', JSON.stringify({
                muted: this.muted,
                master: this.volumes.master
            }));
        } catch (e) { /* ignore */ }
    },

    _loadPrefs() {
        try {
            const data = JSON.parse(localStorage.getItem('castle_audio'));
            if (data) {
                if (data.muted !== undefined) this.muted = data.muted;
                if (data.master !== undefined) this.volumes.master = data.master;
            }
        } catch (e) { /* ignore */ }
    }
};
