// ─────────────────────────────────────────────────
// BOARD STUB (methods overwritten by BoardManager → Board3D)
// ─────────────────────────────────────────────────
// This file declares the Board constant so all other scripts
// can reference Board.draw(), Board.updateHighlights(), etc.
// The actual implementations are injected by BoardManager.init()
// which points them to Board3D.

const Board = {
    highlightedRooms: [],
    secretHighlight: -1,

    // Stub methods — replaced by BoardManager.init()
    init() {},
    draw() {},
    clear() {},
    updateHighlights() {},
    startPulseAnimation() {},
    stopPulseAnimation() {}
};
