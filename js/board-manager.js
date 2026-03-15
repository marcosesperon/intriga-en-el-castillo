// ─────────────────────────────────────────────────
// BOARD MANAGER (3D only — overwrites Board methods)
// ─────────────────────────────────────────────────
// Board3D is the only renderer. BoardManager.init() overwrites
// the stub Board object methods to delegate everything to Board3D.

const BoardManager = {
    init() {
        if (typeof Board3D === 'undefined') {
            console.error('Board3D not available');
            return;
        }

        // Init 3D board (creates scene)
        Board3D.init();

        // Show 3D container
        const container3d = document.getElementById('board-3d-container');
        if (container3d) container3d.classList.remove('hidden');

        // Overwrite Board stub methods to point directly to Board3D
        Board.draw = () => Board3D.draw();
        Board.updateHighlights = () => Board3D.updateHighlights();
        Board.clear = () => { if (Board3D._initialized) Board3D.clear(); };
        Board.startPulseAnimation = () => Board3D.startPulseAnimation();
        Board.stopPulseAnimation = () => Board3D.stopPulseAnimation();

        Board.showEventEffect = (eventData, roomIndex) => {
            if (Board3D._initialized) Board3D.showEventEffect(eventData, roomIndex);
        };
        Board.clearEventEffects = () => {
            if (Board3D._initialized) Board3D.clearEventEffects();
        };
        Board.setTimePeriod = (period) => {
            if (Board3D._initialized) Board3D.setTimePeriod(period);
        };

        // Start the 3D render loop
        Board3D.startRenderLoop();
        if (typeof GameState !== 'undefined' && GameState.getTimePeriod) {
            Board3D.setTimePeriod(GameState.getTimePeriod());
        }
    },

    // Rebuild castle with new procedural layout
    relayout() {
        if (typeof Board3D !== 'undefined' && Board3D._initialized) {
            Board3D.relayout();
        }
    },

    // Stop 3D rendering (used when returning to menu)
    stop() {
        if (typeof Board3D !== 'undefined' && Board3D._initialized) {
            Board3D.stopRenderLoop();
        }
    }
};
