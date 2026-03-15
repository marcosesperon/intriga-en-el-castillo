// ─────────────────────────────────────────────────
// I18N ENGINE
// ─────────────────────────────────────────────────

const I18n = {
    locales: {},
    currentLocale: 'es',
    fallbackLocale: 'es',

    register(code, translations) {
        this.locales[code] = translations;
    },

    setLocale(code) {
        if (this.locales[code]) {
            this.currentLocale = code;
            localStorage.setItem('intriga-lang', code);
        }
    },

    get(key, params) {
        let str = this.locales[this.currentLocale]?.[key]
                || this.locales[this.fallbackLocale]?.[key]
                || key;
        if (params) {
            for (let p in params) {
                str = str.replaceAll('{' + p + '}', params[p]);
            }
        }
        return str;
    },

    card(internalName) {
        return this.locales[this.currentLocale]?.CARD_NAMES?.[internalName]
            || this.locales[this.fallbackLocale]?.CARD_NAMES?.[internalName]
            || internalName;
    },

    room(index) {
        // Core rooms: use ROOM_DISPLAY_NAMES array
        if (index < (typeof CORE_ROOM_COUNT !== 'undefined' ? CORE_ROOM_COUNT : 9)) {
            return this.locales[this.currentLocale]?.ROOM_DISPLAY_NAMES?.[index]
                || this.locales[this.fallbackLocale]?.ROOM_DISPLAY_NAMES?.[index]
                || (typeof CARDS !== 'undefined' ? CARDS.lugares[index] : 'Room ' + index);
        }
        // Additional rooms: look up by catalog ID
        if (typeof GameState !== 'undefined' && GameState.getAdditionalRoom) {
            const addRoom = GameState.getAdditionalRoom(index);
            if (addRoom) {
                const key = 'addRoom.' + addRoom.def.id + '.name';
                const name = this.get(key);
                if (name !== key) return name;
                return addRoom.def.id.replace(/_/g, ' ');
            }
        }
        return 'Room ' + index;
    },

    getAvailableLocales() {
        return Object.keys(this.locales).map(code => ({
            code, name: this.locales[code]?.LANG_NAME || code
        }));
    },

    translateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.get(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = this.get(el.getAttribute('data-i18n-html'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.get(el.getAttribute('data-i18n-placeholder'));
        });
    }
};

function t(key, params) { return I18n.get(key, params); }
function tc(cardName) { return I18n.card(cardName); }
function tr(roomIndex) { return I18n.room(roomIndex); }
