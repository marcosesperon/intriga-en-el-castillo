// ─────────────────────────────────────────────────
// CASTLE LAYOUT — Procedural Castle Generator
// ─────────────────────────────────────────────────
// Generates a unique castle layout each game:
//   - N rooms placed on a virtual cell grid (growing algorithm)
//   - Variable room sizes
//   - Connections derived from cell adjacency
//   - Secret passages between distant rooms
//   - Perimeter boundary for outer walls

const CastleLayout = {
    CELL_SIZE: 4.0,
    MIN_ROOM: 2.5,
    MAX_ROOM: 3.8,
    THRONE_MIN: 3.2,

    current: null,

    // ── Size hints for additional rooms ──────────
    SIZE_HINTS: {
        small:  { minW: 2.2, maxW: 2.8, minD: 2.2, maxD: 2.8 },
        medium: { minW: 2.5, maxW: 3.8, minD: 2.5, maxD: 3.8 },
        large:  { minW: 3.0, maxW: 3.8, minD: 3.0, maxD: 3.8 }
    },

    // ── Seeded PRNG (mulberry32) ──────────────────
    _mulberry32(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    },

    // ── Main entry point ──────────────────────────
    generate(seed, additionalCount) {
        seed = seed || Math.floor(Math.random() * 2147483647);
        additionalCount = additionalCount || 0;
        const totalRooms = CORE_ROOM_COUNT + additionalCount;
        let rng = this._mulberry32(seed);

        for (let attempt = 0; attempt < 50; attempt++) {
            const cells = this._placeRooms(rng, totalRooms);
            const connections = this._deriveConnections(cells);

            // Validate: Throne (idx 4) must have ≥2 neighbors
            if (connections[4].length < 2) {
                rng = this._mulberry32(seed + attempt + 1);
                continue;
            }

            const roomSizes = this._assignRoomSizes(rng, totalRooms);
            const roomPositions = this._computeWorldPositions(cells);
            const secretPassages = this._chooseSecretPassages(cells, connections, rng);
            const safeSpots = this._computeSafeSpots(roomSizes);
            const boundarySegments = this._computeBoundary(cells, roomPositions, roomSizes);

            this.current = {
                cells,
                roomSizes,
                connections,
                secretPassages,
                roomPositions,
                safeSpots,
                boundarySegments,
                seed,
                totalRooms
            };
            return this.current;
        }

        // Fallback: classic 3×3 grid (core rooms only)
        console.warn('CastleLayout: generation failed, using fallback 3×3');
        this._fallback();
        return this.current;
    },

    // ── Room placement (growing algorithm) ────────
    _placeRooms(rng, totalRooms) {
        const cells = new Array(totalRooms);
        const occupied = new Map(); // "gx,gz" → roomIndex

        // Place Throne (index 4) at center
        cells[4] = { gx: 0, gz: 0 };
        occupied.set('0,0', 4);

        // Remaining rooms in shuffled order
        const remaining = [];
        for (let i = 0; i < totalRooms; i++) {
            if (i !== 4) remaining.push(i);
        }
        this._shuffle(remaining, rng);

        for (const roomIdx of remaining) {
            // Collect all empty cells adjacent to occupied cells
            const frontier = [];
            for (const [key] of occupied) {
                const [gx, gz] = key.split(',').map(Number);
                const neighbors = [
                    { gx: gx + 1, gz }, { gx: gx - 1, gz },
                    { gx, gz: gz + 1 }, { gx, gz: gz - 1 }
                ];
                for (const n of neighbors) {
                    const nk = n.gx + ',' + n.gz;
                    if (!occupied.has(nk)) {
                        // Bias toward compactness: prefer cells with more occupied neighbors
                        let score = 0;
                        for (const adj of [
                            { gx: n.gx + 1, gz: n.gz }, { gx: n.gx - 1, gz: n.gz },
                            { gx: n.gx, gz: n.gz + 1 }, { gx: n.gx, gz: n.gz - 1 }
                        ]) {
                            if (occupied.has(adj.gx + ',' + adj.gz)) score++;
                        }
                        frontier.push({ ...n, score });
                    }
                }
            }

            // Remove duplicates
            const unique = new Map();
            for (const f of frontier) {
                const k = f.gx + ',' + f.gz;
                if (!unique.has(k) || f.score > unique.get(k).score) {
                    unique.set(k, f);
                }
            }

            // Weighted pick: cells with higher score are more likely
            const candidates = Array.from(unique.values());
            const totalWeight = candidates.reduce((s, c) => s + (c.score + 1), 0);
            let pick = rng() * totalWeight;
            let chosen = candidates[0];
            for (const c of candidates) {
                pick -= (c.score + 1);
                if (pick <= 0) { chosen = c; break; }
            }

            cells[roomIdx] = { gx: chosen.gx, gz: chosen.gz };
            occupied.set(chosen.gx + ',' + chosen.gz, roomIdx);
        }

        return cells;
    },

    // ── Derive connections from cell adjacency ────
    _deriveConnections(cells) {
        const n = cells.length;
        const connections = {};
        for (let i = 0; i < n; i++) connections[i] = [];

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const ci = cells[i], cj = cells[j];
                const dist = Math.abs(ci.gx - cj.gx) + Math.abs(ci.gz - cj.gz);
                if (dist === 1) {
                    connections[i].push(j);
                    connections[j].push(i);
                }
            }
        }

        return connections;
    },

    // ── Choose secret passage pairs ─────────────
    _chooseSecretPassages(cells, connections, rng) {
        const n = cells.length;
        const numPassages = Math.max(2, Math.floor(n / 6));
        const passages = {};
        const candidates = [];

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (!connections[i].includes(j)) {
                    const dist = Math.abs(cells[i].gx - cells[j].gx) +
                                 Math.abs(cells[i].gz - cells[j].gz);
                    candidates.push({ a: i, b: j, dist });
                }
            }
        }

        // Sort by distance descending, with random tie-breaking
        candidates.sort((a, b) => b.dist - a.dist || rng() - 0.5);

        const used = new Set();
        let count = 0;
        for (const c of candidates) {
            if (count >= numPassages) break;
            if (used.has(c.a) || used.has(c.b)) continue;
            passages[c.a] = c.b;
            passages[c.b] = c.a;
            used.add(c.a);
            used.add(c.b);
            count++;
        }

        // Fallback: if not enough passages, relax distance constraint
        if (count < numPassages) {
            for (const c of candidates) {
                if (count >= numPassages) break;
                if (passages[c.a] !== undefined || passages[c.b] !== undefined) continue;
                passages[c.a] = c.b;
                passages[c.b] = c.a;
                count++;
            }
        }

        return passages;
    },

    // ── Assign room sizes ─────────────────────────
    _assignRoomSizes(rng, totalRooms) {
        const sizes = [];
        // Core room size overrides
        const coreThemes = {
            4: { minW: 3.2, minD: 3.2 }, // Trono: siempre grande
            7: { minW: 3.0, minD: 3.0 }, // Jardines: amplio
            8: { minW: 2.5, maxW: 3.0, minD: 2.5, maxD: 3.0 } // Mazmorras: estrecho
        };

        for (let i = 0; i < totalRooms; i++) {
            let minW, maxW, minD, maxD;

            if (i < CORE_ROOM_COUNT) {
                // Core room
                const t = coreThemes[i] || {};
                minW = t.minW || this.MIN_ROOM;
                maxW = t.maxW || this.MAX_ROOM;
                minD = t.minD || this.MIN_ROOM;
                maxD = t.maxD || this.MAX_ROOM;
            } else {
                // Additional room — use sizeHint from catalog
                const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom
                    ? GameState.getAdditionalRoom(i) : null;
                const hint = addRoom ? (addRoom.def.sizeHint || 'medium') : 'medium';
                const sh = this.SIZE_HINTS[hint] || this.SIZE_HINTS.medium;
                minW = sh.minW;
                maxW = sh.maxW;
                minD = sh.minD;
                maxD = sh.maxD;
            }

            sizes.push({
                w: minW + rng() * (maxW - minW),
                d: minD + rng() * (maxD - minD)
            });
        }

        return sizes;
    },

    // ── Compute world positions (centered) ────────
    _computeWorldPositions(cells) {
        const n = cells.length;
        // Center of mass
        let cx = 0, cz = 0;
        for (let i = 0; i < n; i++) {
            cx += cells[i].gx;
            cz += cells[i].gz;
        }
        cx /= n;
        cz /= n;

        const positions = [];
        for (let i = 0; i < n; i++) {
            positions.push({
                x: (cells[i].gx - cx) * this.CELL_SIZE,
                z: (cells[i].gz - cz) * this.CELL_SIZE
            });
        }
        return positions;
    },

    // ── Compute safe spots for player tokens ──────
    _computeSafeSpots(roomSizes) {
        const spots = [];
        for (let i = 0; i < roomSizes.length; i++) {
            const hw = roomSizes[i].w / 2 * 0.6;
            const hd = roomSizes[i].d / 2 * 0.6;
            spots.push([
                { x:  hw * 0.7, z:  hd * 0.7 },
                { x: -hw * 0.7, z: -hd * 0.7 },
                { x:  hw * 0.7, z: -hd * 0.5 },
                { x: -hw * 0.5, z:  hd * 0.7 },
                { x:  0,        z:  hd * 0.8 }
            ]);
        }
        return spots;
    },

    // ── Compute boundary segments (outer perimeter) ─
    // Uses grid-aligned coordinates (CELL_SIZE / 2) so all segments share
    // exact corner coordinates and form a closed, gap-free perimeter.
    _computeBoundary(cells, roomPositions, roomSizes) {
        const n = cells.length;
        const cellSet = new Set();
        for (let i = 0; i < n; i++) {
            cellSet.add(cells[i].gx + ',' + cells[i].gz);
        }

        const HALF = this.CELL_SIZE / 2; // grid-aligned half-cell
        const raw = [];

        for (let i = 0; i < n; i++) {
            const c = cells[i];
            const pos = roomPositions[i];

            // Top (no neighbor at gz - 1)
            if (!cellSet.has(c.gx + ',' + (c.gz - 1))) {
                raw.push({ x1: pos.x - HALF, z1: pos.z - HALF, x2: pos.x + HALF, z2: pos.z - HALF });
            }
            // Bottom (no neighbor at gz + 1)
            if (!cellSet.has(c.gx + ',' + (c.gz + 1))) {
                raw.push({ x1: pos.x - HALF, z1: pos.z + HALF, x2: pos.x + HALF, z2: pos.z + HALF });
            }
            // Left (no neighbor at gx - 1)
            if (!cellSet.has((c.gx - 1) + ',' + c.gz)) {
                raw.push({ x1: pos.x - HALF, z1: pos.z - HALF, x2: pos.x - HALF, z2: pos.z + HALF });
            }
            // Right (no neighbor at gx + 1)
            if (!cellSet.has((c.gx + 1) + ',' + c.gz)) {
                raw.push({ x1: pos.x + HALF, z1: pos.z - HALF, x2: pos.x + HALF, z2: pos.z + HALF });
            }
        }

        // ── Merge collinear adjacent segments ──
        // Group horizontal (same z) and vertical (same x), then merge overlapping ranges
        const hGroups = new Map(); // z → [{min, max}]
        const vGroups = new Map(); // x → [{min, max}]

        for (const s of raw) {
            const isH = Math.abs(s.z1 - s.z2) < 0.001;
            if (isH) {
                const zKey = s.z1.toFixed(4);
                if (!hGroups.has(zKey)) hGroups.set(zKey, []);
                hGroups.get(zKey).push({ min: Math.min(s.x1, s.x2), max: Math.max(s.x1, s.x2) });
            } else {
                const xKey = s.x1.toFixed(4);
                if (!vGroups.has(xKey)) vGroups.set(xKey, []);
                vGroups.get(xKey).push({ min: Math.min(s.z1, s.z2), max: Math.max(s.z1, s.z2) });
            }
        }

        const segments = [];

        // Merge horizontal
        for (const [zKey, ranges] of hGroups) {
            const z = parseFloat(zKey);
            ranges.sort((a, b) => a.min - b.min);
            let cur = { min: ranges[0].min, max: ranges[0].max };
            for (let r = 1; r < ranges.length; r++) {
                if (ranges[r].min <= cur.max + 0.01) {
                    cur.max = Math.max(cur.max, ranges[r].max);
                } else {
                    segments.push({ x1: cur.min, z1: z, x2: cur.max, z2: z });
                    cur = { min: ranges[r].min, max: ranges[r].max };
                }
            }
            segments.push({ x1: cur.min, z1: z, x2: cur.max, z2: z });
        }

        // Merge vertical
        for (const [xKey, ranges] of vGroups) {
            const x = parseFloat(xKey);
            ranges.sort((a, b) => a.min - b.min);
            let cur = { min: ranges[0].min, max: ranges[0].max };
            for (let r = 1; r < ranges.length; r++) {
                if (ranges[r].min <= cur.max + 0.01) {
                    cur.max = Math.max(cur.max, ranges[r].max);
                } else {
                    segments.push({ x1: x, z1: cur.min, x2: x, z2: cur.max });
                    cur = { min: ranges[r].min, max: ranges[r].max };
                }
            }
            segments.push({ x1: x, z1: cur.min, x2: x, z2: cur.max });
        }

        return segments;
    },

    // ── Fallback: classic 3×3 grid ────────────────
    _fallback() {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells.push({ gx: i % 3 - 1, gz: Math.floor(i / 3) - 1 });
        }
        const connections = {
            0:[1,3], 1:[0,2,4], 2:[1,5],
            3:[0,4,6], 4:[1,3,5,7], 5:[2,4,8],
            6:[3,7], 7:[4,6,8], 8:[5,7]
        };
        const secretPassages = { 0:8, 8:0, 1:6, 6:1 };
        const roomSizes = [];
        for (let i = 0; i < 9; i++) roomSizes.push({ w: 3.0, d: 3.0 });
        const roomPositions = this._computeWorldPositions(cells);
        const safeSpots = this._computeSafeSpots(roomSizes);
        const boundarySegments = this._computeBoundary(cells, roomPositions, roomSizes);

        this.current = {
            cells, roomSizes, connections, secretPassages,
            roomPositions, safeSpots, boundarySegments, seed: 0,
            totalRooms: 9
        };
    },

    // ── Utility: Fisher-Yates shuffle ─────────────
    _shuffle(arr, rng) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};
