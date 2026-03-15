// ─────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
    // Restore language preference
    const savedLang = localStorage.getItem('intriga-lang');
    if (savedLang && I18n.locales[savedLang]) {
        I18n.currentLocale = savedLang;
    }
    I18n.translateDOM();

    // Board3D is initialized by BoardManager after THREE.js loads (dynamic script)
    Menu.init();
    if (typeof MobileUI !== 'undefined') MobileUI.init();

    // Boot screen → Menu
    setTimeout(() => {
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }, 800);
});
