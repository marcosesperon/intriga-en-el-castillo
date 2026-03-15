// ─────────────────────────────────────────────────
// BOARD 3D RENDERER (Three.js) — Medieval Castle
// ─────────────────────────────────────────────────

const Board3D = {
    _rooms: [],
    highlightedRooms: [],
    secretHighlight: -1,

    // Internal references
    _scene: null,
    _camera: null,
    _renderer: null,
    _css2dRenderer: null,
    _controls: null,
    _clock: null,
    _animFrameId: null,
    _initialized: false,

    // 3D objects
    _tokenMeshes: [],
    _roomLights: [],
    _roomDimOverlays: [],
    _roomHState: [],       // cached highlight state per room: 'H','S','B','C','D','' (for animate)
    _roomFloors: [],
    _roomWalls: [],
    _clickTargets: [],
    _torchLights: [],
    _torchFlames: [],
    _roomLabels: [],
    _passageLines: [],
    _tokenGeometry: null,
    _cachedLocale: null,

    // Event effect system
    _eventEffects: [],
    // Narrative visual effects (persistent, synced with activeNarrativeEvents)
    _narrativeEffects: [],
    _evtSwordGeo: null,
    _evtKeyShaftGeo: null,
    _evtKeyRingGeo: null,
    _evtCrownBaseGeo: null,
    _evtCrownPointGeo: null,
    _evtScaleBeamGeo: null,
    _evtScalePillarGeo: null,
    _evtScalePanGeo: null,
    _evtCloudGeo: null,
    _evtAuraGeo: null,
    _evtGlowGeo: null,

    // Scene lights (stored for day/night transitions)
    _ambientLight: null,
    _directionalLight: null,
    _hemisphereLight: null,

    // Terrain
    _terrainMesh: null,
    _terrainMat: null,

    // Day/night transition state
    _timePeriod: 'noche',
    _timePeriodTarget: null,
    _timePeriodTransitionT: -1,
    _timePeriodFrom: null,
    _TIME_PERIOD_TRANSITION_DURATION: 2.0,

    // Shared materials/textures
    _stoneMat: null,
    _floorMat: null,
    _corridorFloorMat: null,

    // Performance: cached bounding rect (updated on resize)
    _cachedRect: null,
    // Performance: CSS2DRenderer frame counter (render every N frames)
    _css2dFrame: 0,
    _CSS2D_INTERVAL: 3,

    // Camera reset
    _defaultCamPos: { x: 0, y: 14, z: 7 },
    _defaultCamTarget: { x: 0, y: 0, z: 0 },
    _cameraResetting: false,
    _cameraResetT: 0,
    _cameraResetFrom: null,
    _cameraResetTargetFrom: null,
    _CAMERA_RESET_DURATION: 0.6,
    _CAMERA_DEVIATION_THRESHOLD: 0.3,
    // Camera focus (zoom to room)
    _cameraFocusing: false,
    _cameraFocusT: 0,
    _cameraFocusFrom: null,
    _cameraFocusTargetFrom: null,
    _cameraFocusDest: null,
    _cameraFocusTargetDest: null,
    _CAMERA_FOCUS_DURATION: 0.8,

    // Token animation state
    _tokenTargetPos: [],
    _tokenStartPos: [],
    _tokenAnimT: [],
    _tokenLastRoom: [],
    _MOVE_DURATION: 0.55,
    _MOVE_ARC_HEIGHT: 2.5,

    // Safe token positions per room (relative to room center, avoids furniture)
    _ROOM_SAFE_SPOTS: [
        // 0 Torre del Mago: mesa lectura centro, caldero atrás-izq, telescopio derecha
        [{ x: 0.5, z: 0.5 }, { x: 0.7, z: -0.2 }, { x: 0.2, z: 0.7 }, { x: -0.3, z: 0.7 }, { x: 0.5, z: 0.0 }],
        // 1 Biblioteca: escritorio centro, globo der-frontal, estanterías en paredes
        [{ x: -0.5, z: 0.5 }, { x: -0.7, z: 0.0 }, { x: 0.0, z: 0.6 }, { x: -0.3, z: -0.5 }, { x: 0.3, z: 0.5 }],
        // 2 Armería: mesa centro, armas en paredes
        [{ x: 0.0, z: 0.6 }, { x: -0.5, z: 0.3 }, { x: 0.5, z: -0.3 }, { x: -0.3, z: -0.5 }, { x: 0.3, z: 0.3 }],
        // 3 Capilla: altar fondo, bancos centrales
        [{ x: 0.0, z: 0.6 }, { x: 0.5, z: 0.3 }, { x: -0.5, z: 0.3 }, { x: 0.3, z: 0.7 }, { x: -0.3, z: 0.7 }],
        // 4 Salón del Trono: alfombra central, espacio amplio delante del trono
        [{ x: 0.0, z: 0.3 }, { x: 0.4, z: 0.0 }, { x: -0.4, z: 0.0 }, { x: 0.3, z: 0.6 }, { x: -0.3, z: 0.6 }],
        // 5 Consejo: mesa redonda r=0.55 + sillas r=0.8 — tokens en puerta frontal
        [{ x: 0.0, z: 1.0 }, { x: -0.5, z: 0.9 }, { x: 0.5, z: 0.9 }, { x: -0.8, z: 0.5 }, { x: 0.8, z: 0.5 }],
        // 6 Cocina: fogón/mesa central
        [{ x: 0.5, z: 0.5 }, { x: -0.5, z: 0.5 }, { x: 0.0, z: 0.7 }, { x: 0.5, z: -0.3 }, { x: -0.5, z: -0.3 }],
        // 7 Jardines: fuente centro r=0.45
        [{ x: 0.7, z: 0.0 }, { x: -0.7, z: 0.0 }, { x: 0.0, z: 0.8 }, { x: 0.5, z: 0.6 }, { x: -0.5, z: 0.6 }],
        // 8 Mazmorras: cepo centro-izq, iron maiden centro-der, celdas en paredes
        [{ x: -0.7, z: -0.5 }, { x: -0.3, z: -0.7 }, { x: 0.0, z: -0.5 }, { x: -0.6, z: 0.0 }, { x: -0.5, z: -0.3 }],
    ],

    // Layout constants
    SPACING: 3.5,
    ROOM_SIZE: 3.0,
    WALL_HEIGHT: 1.4,
    WALL_THICKNESS: 0.18,
    MERLON_H: 0.25,
    MERLON_W: 0.2,
    OUTER_WALL_H: 1.0,

    // Terrain constants
    TERRAIN_SIZE: 40,
    TERRAIN_SEGMENTS: 80,
    TERRAIN_MAX_HEIGHT: 1.8,
    TERRAIN_FALLOFF_START: 5.5,
    TERRAIN_FALLOFF_END: 12.0,
    TERRAIN_NOISE_SCALE: 0.15,
    TERRAIN_NOISE_OCTAVES: 3,

    ROOM_POSITIONS: [],

    ROOM_TINTS: [
        0x4a3a6a, 0x7a6530, 0x5a5a6a, 0x8a8a7a, 0x8a7530,
        0x3a5a3a, 0x7a5030, 0x3a6a3a, 0x4a4a5a
    ],

    // ─── Procedural Textures ────────────────────────

    _createStoneTexture(w, h, base, mortar) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = mortar;
        ctx.lineWidth = 1;
        const rows = 8;
        const rh = h / rows;
        for (let r = 0; r < rows; r++) {
            const y = r * rh;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            const cols = 3 + (r % 2);
            const cw = w / cols;
            const offset = (r % 2) * cw * 0.5;
            for (let col = 0; col < cols; col++) {
                const x = offset + col * cw;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + rh); ctx.stroke();
            }
            // subtle color variation per block
            for (let col = 0; col < cols; col++) {
                const bx = offset + col * cw;
                const v = Math.random() * 15 - 7;
                ctx.fillStyle = `rgba(${128+v},${100+v},${70+v},0.08)`;
                ctx.fillRect(bx + 1, y + 1, cw - 2, rh - 2);
            }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    _createFloorTileTexture(base) {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        const ts = 32;
        for (let x = 0; x <= 128; x += ts) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke();
        }
        for (let y = 0; y <= 128; y += ts) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
        }
        // subtle variation
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                const v = Math.random() * 10 - 5;
                ctx.fillStyle = `rgba(${128+v},${100+v},${80+v},0.06)`;
                ctx.fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
            }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    },

    _createTerrainTexture() {
        const size = 512;
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        const half = size / 2;
        const tSize = this.TERRAIN_SIZE;

        // Pixel data for direct manipulation
        const imgData = ctx.createImageData(size, size);
        const d = imgData.data;

        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                // Map pixel to world coordinates
                const wx = (px / size - 0.5) * tSize;
                const wz = (py / size - 0.5) * tSize;
                const dist = Math.sqrt(wx * wx + wz * wz);

                // Noise values at different scales
                const n1 = this._fbm2D(wx * 0.3, wz * 0.3, 3);
                const n2 = this._fbm2D(wx * 0.8 + 50, wz * 0.8 + 50, 2);
                const n3 = this._fbm2D(wx * 1.5 + 100, wz * 1.5 + 100, 2);

                let r, g, b;

                if (dist < 5.5) {
                    // Inner zone: dark earth under platform
                    r = 50 + n1 * 15;
                    g = 38 + n1 * 10;
                    b = 25 + n1 * 8;
                } else if (dist < 10) {
                    // Mid zone: patchy grass + worn earth
                    const t = (dist - 5.5) / 4.5;
                    const grassMix = n2 * 0.7 + t * 0.3;
                    // Grass color
                    const gr = 50 + n1 * 20, gg = 72 + n1 * 25, gb = 35 + n1 * 12;
                    // Earth color
                    const er = 70 + n1 * 15, eg = 55 + n1 * 12, eb = 35 + n1 * 8;
                    r = er + (gr - er) * grassMix;
                    g = eg + (gg - eg) * grassMix;
                    b = eb + (gb - eb) * grassMix;
                } else {
                    // Outer zone: denser grass with dirt patches
                    const dirtPatch = n2 > 0.6 ? (n2 - 0.6) * 2.5 : 0;
                    // Grass base
                    r = 40 + n1 * 22 + dirtPatch * 30;
                    g = 65 + n1 * 28 - dirtPatch * 10;
                    b = 28 + n1 * 12 + dirtPatch * 8;
                }

                // Dirt path radials (3 paths at roughly cardinal directions)
                const angle = Math.atan2(wz, wx);
                const pathAngles = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];
                for (const pa of pathAngles) {
                    let angleDiff = Math.abs(angle - pa);
                    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                    if (angleDiff < 0.12 && dist > 5 && dist < 14) {
                        const pathStrength = (1 - angleDiff / 0.12) * 0.5;
                        // Blend towards dirt
                        r = r + (75 - r) * pathStrength;
                        g = g + (58 - g) * pathStrength;
                        b = b + (38 - b) * pathStrength;
                    }
                }

                // Fine detail noise variation
                const detail = (n3 - 0.5) * 18;
                r = Math.max(0, Math.min(255, r + detail));
                g = Math.max(0, Math.min(255, g + detail));
                b = Math.max(0, Math.min(255, b + detail));

                const idx = (py * size + px) * 4;
                d[idx] = r;
                d[idx + 1] = g;
                d[idx + 2] = b;
                d[idx + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(c);
        return tex;
    },

    // ─── Procedural Noise ──────────────────────────────

    _noise2D(x, y) {
        // Hash-based value noise with bilinear interpolation
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        // Smoothstep
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        // Hash function
        const h = (a, b) => {
            let n = a * 374761393 + b * 668265263 + 1013904223;
            n = (n ^ (n >> 13)) * 1274126177;
            return ((n ^ (n >> 16)) & 0x7fffffff) / 0x7fffffff;
        };
        const v00 = h(ix, iy), v10 = h(ix + 1, iy);
        const v01 = h(ix, iy + 1), v11 = h(ix + 1, iy + 1);
        const a = v00 + sx * (v10 - v00);
        const b = v01 + sx * (v11 - v01);
        return a + sy * (b - a);
    },

    _fbm2D(x, y, octaves) {
        let val = 0, amp = 0.5, freq = 1;
        for (let i = 0; i < octaves; i++) {
            val += amp * this._noise2D(x * freq, y * freq);
            amp *= 0.5;
            freq *= 2;
        }
        return val;
    },

    // ─── Event Effect Assets ──────────────────────────

    _initEventEffectAssets() {
        const RS = this.ROOM_SIZE;
        this._evtSwordGeo = new THREE.ConeGeometry(0.06, 0.8, 4);
        this._evtKeyShaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6);
        this._evtKeyRingGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 12);
        this._evtCrownBaseGeo = new THREE.TorusGeometry(0.25, 0.05, 8, 16);
        this._evtCrownPointGeo = new THREE.ConeGeometry(0.04, 0.18, 4);
        this._evtScaleBeamGeo = new THREE.BoxGeometry(0.8, 0.04, 0.06);
        this._evtScalePillarGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 6);
        this._evtScalePanGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12);
        this._evtCloudGeo = new THREE.SphereGeometry(0.6, 8, 6);
        this._evtGlowGeo = new THREE.SphereGeometry(0.3, 8, 6);
        this._evtAuraGeo = new THREE.PlaneGeometry(RS - 0.2, RS - 0.2);
        this._evtAuraGeo.rotateX(-Math.PI / 2);

        // Narrative effect geometries
        this._narrFlameGeo = new THREE.ConeGeometry(0.15, 0.6, 6);
        this._narrFogSphereGeo = new THREE.SphereGeometry(0.8, 8, 6);
        this._narrSkullGeo = new THREE.SphereGeometry(0.12, 8, 6);
        this._narrEyeGeo = new THREE.ConeGeometry(0.03, 0.06, 4);
        this._narrRingGeo = new THREE.TorusGeometry(0.8, 0.04, 8, 24);
    },

    // ─── Init ───────────────────────────────────────

    init() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, 3D board unavailable');
            return;
        }
        const container = document.getElementById('board-3d-container');
        if (!container) return;

        if (CastleLayout && CastleLayout.current) {
            this.ROOM_POSITIONS = CastleLayout.current.roomPositions;
            this._totalRooms = CastleLayout.current.totalRooms || 9;
        } else {
            const S = this.SPACING;
            this.ROOM_POSITIONS = [
                { x: -S, z: -S }, { x: 0, z: -S }, { x: S, z: -S },
                { x: -S, z: 0 },  { x: 0, z: 0 },  { x: S, z: 0 },
                { x: -S, z: S },  { x: 0, z: S },  { x: S, z: S }
            ];
            this._totalRooms = 9;
        }

        this._clock = new THREE.Clock(false);
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x0f0c08);
        // No scene fog — keep full visibility
        // this._scene.fog = new THREE.FogExp2(0x0f0c08, 0.035);

        // Shared materials
        const stoneTex = this._createStoneTexture(128, 128, '#6b5b45', 'rgba(30,25,15,0.5)');
        this._stoneMat = new THREE.MeshStandardMaterial({
            map: stoneTex, color: 0x8B7355, roughness: 0.92, metalness: 0.02
        });
        this._floorMat = new THREE.MeshStandardMaterial({
            map: this._createFloorTileTexture('#4a3a28'),
            color: 0x6a5a44, roughness: 0.9, metalness: 0.02
        });
        this._corridorFloorMat = new THREE.MeshStandardMaterial({
            map: this._createFloorTileTexture('#3a2a1a'),
            color: 0x4a3a28, roughness: 0.95, metalness: 0
        });

        this._setupCamera(container);
        this._setupRenderers(container);
        this._setupControls();
        this._setupLights();
        this._buildCastle();
        this._initEventEffectAssets();
        this._createTokens();
        this._hoveredRoomIndex = -1;
        this._setupRaycasting();
        this._setupResize(container);
        this._setupResetButton();

        this._initialized = true;
    },

    _setupCamera(container) {
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 600;
        this._camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        this._camera.position.set(0, 14, 7);
        this._camera.lookAt(0, 0, 0);

        // Adaptive camera distance for non-square layouts
        if (CastleLayout && CastleLayout.current) {
            let maxExtent = 0;
            for (const p of CastleLayout.current.roomPositions) {
                maxExtent = Math.max(maxExtent, Math.abs(p.x), Math.abs(p.z));
            }
            const dist = Math.max(14, maxExtent * 2.0 + 4);
            this._camera.position.set(0, dist, dist * 0.5);
            this._camera.lookAt(0, 0, 0);
            // Update default camera position for reset button
            this._defaultCamPos = { x: 0, y: dist, z: dist * 0.5 };
        }
    },

    _setupRenderers(container) {
        this._renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 600;
        this._renderer.setSize(w, h);
        this._renderer.domElement.style.display = 'block';
        this._renderer.shadowMap.enabled = false;
        this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this._renderer.toneMappingExposure = 1.1;
        container.appendChild(this._renderer.domElement);

        this._css2dRenderer = new THREE.CSS2DRenderer();
        this._css2dRenderer.setSize(w, h);
        this._css2dRenderer.domElement.style.position = 'absolute';
        this._css2dRenderer.domElement.style.top = '0';
        this._css2dRenderer.domElement.style.left = '0';
        this._css2dRenderer.domElement.style.pointerEvents = 'none';
        container.appendChild(this._css2dRenderer.domElement);
    },

    _setupControls() {
        this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
        this._controls.target.set(0, 0, 0);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.08;
        this._controls.minDistance = 8;
        this._controls.maxDistance = 25;
        this._controls.maxPolarAngle = Math.PI / 2.2;
        this._controls.minPolarAngle = 0.3;
        this._controls.enablePan = true;
        this._controls.screenSpacePanning = true;
        // Touch: one-finger rotate, two-finger zoom, disable pan on touch to avoid conflicts
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this._controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_ROTATE
            };
        }
        if (CastleLayout && CastleLayout.current) {
            let maxExt = 0;
            for (const p of CastleLayout.current.roomPositions) {
                maxExt = Math.max(maxExt, Math.abs(p.x), Math.abs(p.z));
            }
            this._controls.minDistance = Math.max(8, maxExt);
            this._controls.maxDistance = Math.max(25, maxExt * 3.5);
        }
    },

    _setupResetButton() {
        const btn = document.getElementById('reset-camera-btn');
        if (!btn) return;
        this._resetBtn = btn;
        btn.addEventListener('click', () => this._resetCamera());
    },

    _resetCamera() {
        if (this._cameraResetting) return;
        this._cameraResetting = true;
        this._cameraResetT = 0;
        this._cameraResetFrom = {
            x: this._camera.position.x,
            y: this._camera.position.y,
            z: this._camera.position.z
        };
        this._cameraResetTargetFrom = {
            x: this._controls.target.x,
            y: this._controls.target.y,
            z: this._controls.target.z
        };
    },

    focusOnRoom(roomIndex) {
        const pos = this.ROOM_POSITIONS[roomIndex];
        if (!pos || !this._camera || !this._controls) return;
        this._cameraFocusFrom = {
            x: this._camera.position.x,
            y: this._camera.position.y,
            z: this._camera.position.z
        };
        this._cameraFocusTargetFrom = {
            x: this._controls.target.x,
            y: this._controls.target.y,
            z: this._controls.target.z
        };
        this._cameraFocusTargetDest = { x: pos.x, y: 0, z: pos.z };
        this._cameraFocusDest = { x: pos.x, y: 8, z: pos.z + 4 };
        this._cameraFocusT = 0;
        this._cameraFocusing = true;
        this._cameraResetting = false;
    },

    unfocusCamera() {
        this._cameraFocusing = false;
        this._resetCamera();
    },

    _getCameraDeviation() {
        const cp = this._camera.position;
        const dp = this._defaultCamPos;
        const ct = this._controls ? this._controls.target : { x: 0, y: 0, z: 0 };
        const dt = this._defaultCamTarget;
        const posDist = Math.sqrt(
            (cp.x - dp.x) ** 2 + (cp.y - dp.y) ** 2 + (cp.z - dp.z) ** 2
        );
        const tgtDist = Math.sqrt(
            (ct.x - dt.x) ** 2 + (ct.y - dt.y) ** 2 + (ct.z - dt.z) ** 2
        );
        return posDist + tgtDist;
    },

    _setupLights() {
        // Ambient — warm interior castle feel
        this._ambientLight = new THREE.AmbientLight(0x908070, 2.0);
        this._scene.add(this._ambientLight);

        // Moon/sun directional with shadows
        this._directionalLight = new THREE.DirectionalLight(0xFFE8C0, 1.5);
        this._directionalLight.position.set(6, 12, 6);
        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.mapSize.width = 1024;
        this._directionalLight.shadow.mapSize.height = 1024;
        this._directionalLight.shadow.camera.near = 1;
        this._directionalLight.shadow.camera.far = 30;
        this._directionalLight.shadow.camera.left = -12;
        this._directionalLight.shadow.camera.right = 12;
        this._directionalLight.shadow.camera.top = 12;
        this._directionalLight.shadow.camera.bottom = -12;
        this._directionalLight.shadow.bias = -0.002;
        this._scene.add(this._directionalLight);

        // Hemisphere light for ambient color
        this._hemisphereLight = new THREE.HemisphereLight(0xbbbbdd, 0x887766, 0.8);
        this._scene.add(this._hemisphereLight);

        // Torch point lights at corners + torch meshes
        const S = this.SPACING;
        const torchPositions = [
            [-S - 1.2, 0, -S - 1.2],
            [S + 1.2, 0, -S - 1.2],
            [-S - 1.2, 0, S + 1.2],
            [S + 1.2, 0, S + 1.2]
        ];
        this._torchLights = [];
        this._torchFlames = [];
        torchPositions.forEach(pos => {
            const { light, flame } = this._buildTorchMesh(pos[0], pos[2]);
            this._torchLights.push(light);
            this._torchFlames.push(flame);
        });
    },

    // ─── Day/Night Cycle ──────────────────────────

    setTimePeriod(period) {
        if (!this._initialized || !TIME_PERIOD_LIGHTING[period]) return;
        if (period === this._timePeriod && this._timePeriodTransitionT < 0) return;

        // Capture current state as "from" snapshot
        this._timePeriodFrom = {
            background:      this._scene.background.clone(),
            fog:             this._scene.fog ? this._scene.fog.color.clone() : new THREE.Color(0x0f0c08),
            fogDensity:      this._scene.fog ? this._scene.fog.density : 0,
            ambientColor:    this._ambientLight.color.clone(),
            ambientIntensity: this._ambientLight.intensity,
            dirColor:        this._directionalLight.color.clone(),
            dirIntensity:    this._directionalLight.intensity,
            dirPosition:     this._directionalLight.position.clone(),
            hemiSky:         this._hemisphereLight.color.clone(),
            hemiGround:      this._hemisphereLight.groundColor.clone(),
            hemiIntensity:   this._hemisphereLight.intensity,
            torchIntensity:  this._torchLights.length > 0 ? (this._torchLights[0]._basePeriodIntensity || 0.5) : 0.5,
            torchRange:      this._torchLights.length > 0 ? this._torchLights[0].distance : 14
        };
        this._timePeriodTarget = period;
        this._timePeriodTransitionT = 0;
    },

    _buildTorchMesh(x, z) {
        const group = new THREE.Group();
        // Wall bracket
        const bracket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8, metalness: 0.3 })
        );
        bracket.position.set(0, 0.6, 0);
        bracket.castShadow = true;
        group.add(bracket);

        // Flame (cone with emissive)
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xFF6600, transparent: true, opacity: 0.85
        });
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.25, 6),
            flameMat
        );
        flame.position.set(0, 1.3, 0);
        group.add(flame);

        // Inner glow
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xFFAA00, transparent: true, opacity: 0.6 })
        );
        glow.position.set(0, 1.25, 0);
        group.add(glow);

        // Point light
        const light = new THREE.PointLight(0xFF8C00, 1.0, 14);
        light.position.set(0, 1.5, 0);
        light.castShadow = false;
        group.add(light);

        group.position.set(x, 0, z);
        this._scene.add(group);
        return { light, flame };
    },

    // ─── Castle Building ────────────────────────────

    _buildCastle() {
        this._buildPlatform();
        this._buildTerrainDecorations();
        this._buildOuterWalls();
        this._buildCornerTurrets();

        for (let i = 0; i < this._totalRooms; i++) {
            this._buildRoom(i);
        }
        this._buildCorridors();
        // Secret passages not drawn — gameplay still works via highlights
    },

    _buildPlatform() {
        // Raised stone platform
        let platW, platD;
        const layout = CastleLayout && CastleLayout.current;
        if (layout) {
            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            for (let i = 0; i < this._totalRooms; i++) {
                const p = layout.roomPositions[i];
                const hw = layout.roomSizes[i].w / 2;
                const hd = layout.roomSizes[i].d / 2;
                minX = Math.min(minX, p.x - hw);
                maxX = Math.max(maxX, p.x + hw);
                minZ = Math.min(minZ, p.z - hd);
                maxZ = Math.max(maxZ, p.z + hd);
            }
            platW = (maxX - minX) + 3.0;
            platD = (maxZ - minZ) + 3.0;
        } else {
            const platSize = this.SPACING * 2 + this.ROOM_SIZE + 2.5;
            platW = platSize;
            platD = platSize;
        }
        // ── Stone courtyard floor — one tile per grid cell ──
        if (layout && layout.cells) {
            const HALF = CastleLayout.CELL_SIZE / 2;
            const floorMat = new THREE.MeshStandardMaterial({
                map: this._createStoneTexture(256, 256, '#5a5045', 'rgba(30,25,18,0.35)'),
                color: 0x6a5e50, roughness: 0.95, metalness: 0.02
            });
            const tileGeom = new THREE.PlaneGeometry(CastleLayout.CELL_SIZE, CastleLayout.CELL_SIZE);
            tileGeom.rotateX(-Math.PI / 2);
            for (let i = 0; i < this._totalRooms; i++) {
                const p = layout.roomPositions[i];
                const tile = new THREE.Mesh(tileGeom, floorMat);
                tile.position.set(p.x, -0.01, p.z);
                tile.receiveShadow = true;
                this._scene.add(tile);
            }
        }

        // Procedural terrain
        const tSz = this.TERRAIN_SIZE;
        const tSeg = this.TERRAIN_SEGMENTS;
        const terrainGeom = new THREE.PlaneGeometry(tSz, tSz, tSeg, tSeg);
        terrainGeom.rotateX(-Math.PI / 2);

        // Vertex displacement
        const pos = terrainGeom.attributes.position;
        const castleExtent = Math.max(platW, platD) / 2;
        const fStart = castleExtent + 0.5;
        const fEnd = castleExtent + 7.0;
        const maxH = this.TERRAIN_MAX_HEIGHT;
        const nScale = this.TERRAIN_NOISE_SCALE;
        const nOct = this.TERRAIN_NOISE_OCTAVES;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const dist = Math.sqrt(x * x + z * z);

            // Radial falloff: flat under castle, rises outward
            let f = 0;
            if (dist > fStart) {
                const t = Math.min(1, (dist - fStart) / (fEnd - fStart));
                f = t * t * (3 - 2 * t); // smoothstep
            }

            // Subtle moat depression around castle edge
            let moat = 0;
            const moatInner = castleExtent + 0.5;
            const moatOuter = castleExtent + 2.5;
            const moatCenter = (moatInner + moatOuter) / 2;
            const moatHalfW = (moatOuter - moatInner) / 2;
            if (dist > moatInner && dist < moatOuter) {
                const mt = 1 - Math.abs(dist - moatCenter) / moatHalfW;
                moat = -0.15 * mt * mt;
            }

            const n = this._fbm2D(x * nScale, z * nScale, nOct);
            const y = f * n * maxH + moat;
            pos.setY(i, y);
        }

        terrainGeom.computeVertexNormals();

        this._terrainMat = new THREE.MeshStandardMaterial({
            map: this._createTerrainTexture(),
            color: 0x5a6a3a,
            roughness: 0.95,
            metalness: 0
        });
        this._terrainMesh = new THREE.Mesh(terrainGeom, this._terrainMat);
        this._terrainMesh.position.y = -0.42;
        this._terrainMesh.receiveShadow = true;
        this._scene.add(this._terrainMesh);
    },

    _buildTerrainDecorations() {
        const nScale = this.TERRAIN_NOISE_SCALE;
        const nOct = this.TERRAIN_NOISE_OCTAVES;
        const layoutData = CastleLayout && CastleLayout.current;
        let castleExt = this.SPACING + this.ROOM_SIZE / 2 + 1.0;
        if (layoutData) {
            let maxExt = 0;
            for (const p of layoutData.roomPositions) {
                maxExt = Math.max(maxExt, Math.abs(p.x), Math.abs(p.z));
            }
            castleExt = maxExt + 2.5;
        }
        const fStart = castleExt + 0.5;
        const fEnd = castleExt + 7.0;
        const maxH = this.TERRAIN_MAX_HEIGHT;
        const groundY = -0.42;

        // Helper: get terrain height at (x,z)
        const getTerrainY = (x, z) => {
            const dist = Math.sqrt(x * x + z * z);
            let f = 0;
            if (dist > fStart) {
                const t = Math.min(1, (dist - fStart) / (fEnd - fStart));
                f = t * t * (3 - 2 * t);
            }
            let moat = 0;
            const moatIn2 = castleExt + 0.5;
            const moatOut2 = castleExt + 2.5;
            const moatC2 = (moatIn2 + moatOut2) / 2;
            const moatHW2 = (moatOut2 - moatIn2) / 2;
            if (dist > moatIn2 && dist < moatOut2) {
                const mt = 1 - Math.abs(dist - moatC2) / moatHW2;
                moat = -0.15 * mt * mt;
            }
            return groundY + f * this._fbm2D(x * nScale, z * nScale, nOct) * maxH + moat;
        };

        // Deterministic pseudo-random using hash
        const hash = (seed) => {
            let n = seed * 374761393 + 1013904223;
            n = ((n ^ (n >> 13)) * 1274126177) & 0x7fffffff;
            return n / 0x7fffffff;
        };

        // Rocks (8 instances)
        const rockGeo = new THREE.DodecahedronGeometry(1, 0);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x6a6a60, roughness: 0.92, metalness: 0.05
        });

        for (let i = 0; i < 8; i++) {
            const angle = hash(i * 7 + 1) * Math.PI * 2;
            const dist = 8 + hash(i * 13 + 3) * 6;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const scale = 0.15 + hash(i * 19 + 5) * 0.3;

            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.scale.set(
                scale * (0.7 + hash(i * 23 + 7) * 0.6),
                scale * (0.5 + hash(i * 29 + 9) * 0.5),
                scale * (0.7 + hash(i * 31 + 11) * 0.6)
            );
            rock.position.set(x, getTerrainY(x, z) + scale * 0.2, z);
            rock.rotation.set(
                hash(i * 37 + 13) * Math.PI,
                hash(i * 41 + 15) * Math.PI,
                hash(i * 43 + 17) * Math.PI
            );
            rock.castShadow = true;
            this._scene.add(rock);
        }

        // Bushes (10 instances) - cross-billboard approach
        const bushCanvas = document.createElement('canvas');
        bushCanvas.width = 64; bushCanvas.height = 64;
        const bctx = bushCanvas.getContext('2d');
        // Draw bush: green oval
        const grad = bctx.createRadialGradient(32, 36, 4, 32, 32, 28);
        grad.addColorStop(0, '#4a6a2a');
        grad.addColorStop(0.5, '#3a5a20');
        grad.addColorStop(0.8, '#2a4a18');
        grad.addColorStop(1, 'rgba(30,50,15,0)');
        bctx.fillStyle = grad;
        bctx.fillRect(0, 0, 64, 64);
        const bushTex = new THREE.CanvasTexture(bushCanvas);

        const bushMat = new THREE.MeshBasicMaterial({
            map: bushTex, transparent: true, alphaTest: 0.1,
            side: THREE.DoubleSide, depthWrite: false
        });

        for (let i = 0; i < 10; i++) {
            const angle = hash(i * 11 + 100) * Math.PI * 2;
            const dist = 7 + hash(i * 17 + 102) * 5;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const bw = 0.5 + hash(i * 23 + 104) * 0.4;
            const bh = 0.3 + hash(i * 29 + 106) * 0.3;

            // Cross-billboard: two intersecting planes
            const group = new THREE.Group();
            for (let j = 0; j < 2; j++) {
                const plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(bw, bh),
                    bushMat
                );
                plane.rotation.y = j * Math.PI / 2;
                plane.position.y = bh / 2;
                group.add(plane);
            }
            group.position.set(x, getTerrainY(x, z), z);
            group.rotation.y = hash(i * 31 + 108) * Math.PI;
            this._scene.add(group);
        }
    },

    _buildOuterWalls() {
        const layout = CastleLayout && CastleLayout.current;
        const wallH = this.OUTER_WALL_H;
        const wallT = 0.2;
        const mat = this._stoneMat.clone();
        mat.color.set(0x6a5a48);

        if (layout && layout.boundarySegments) {
            for (const seg of layout.boundarySegments) {
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                const length = Math.sqrt(dx * dx + dz * dz);
                if (length < 0.01) continue;
                const midX = (seg.x1 + seg.x2) / 2;
                const midZ = (seg.z1 + seg.z2) / 2;
                const isH = Math.abs(dz) < 0.01; // horizontal segment

                const geom = isH
                    ? new THREE.BoxGeometry(length, wallH, wallT)
                    : new THREE.BoxGeometry(wallT, wallH, length);
                const mesh = new THREE.Mesh(geom, mat);
                mesh.position.set(midX, wallH / 2, midZ);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this._scene.add(mesh);

                // Merlons on top
                const mCount = Math.floor(length / (this.MERLON_W * 2.5));
                for (let m = 0; m < mCount; m++) {
                    const merlon = new THREE.Mesh(
                        new THREE.BoxGeometry(this.MERLON_W, this.MERLON_H, this.MERLON_W),
                        mat
                    );
                    const offset = -length / 2 + (m + 0.5) * (length / mCount);
                    if (isH) {
                        merlon.position.set(midX + offset, wallH + this.MERLON_H / 2, midZ);
                    } else {
                        merlon.position.set(midX, wallH + this.MERLON_H / 2, midZ + offset);
                    }
                    merlon.castShadow = true;
                    this._scene.add(merlon);
                }
            }
        } else {
            // Fallback: old 4-wall approach
            const S = this.SPACING;
            const extent = S + this.ROOM_SIZE / 2 + 0.5;
            const walls = [
                { w: extent * 2, d: wallT, x: 0, z: -extent },
                { w: extent * 2, d: wallT, x: 0, z: extent },
                { w: wallT, d: extent * 2, x: -extent, z: 0 },
                { w: wallT, d: extent * 2, x: extent, z: 0 }
            ];
            walls.forEach(w => {
                const geom = new THREE.BoxGeometry(w.w, wallH, w.d);
                const mesh = new THREE.Mesh(geom, mat);
                mesh.position.set(w.x, wallH / 2, w.z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this._scene.add(mesh);
            });
        }
    },

    _buildCornerTurrets() {
        const layout = CastleLayout && CastleLayout.current;
        const turretR = 0.5;
        const turretH = 2.0;
        const roofH = 0.8;
        const mat = this._stoneMat.clone();
        mat.color.set(0x7a6a55);

        let corners;
        if (layout && layout.boundarySegments) {
            // Build adjacency: for each point, track segment directions
            const pointDirs = new Map();
            for (const seg of layout.boundarySegments) {
                const key1 = seg.x1.toFixed(1) + ',' + seg.z1.toFixed(1);
                const key2 = seg.x2.toFixed(1) + ',' + seg.z2.toFixed(1);
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                if (!pointDirs.has(key1)) pointDirs.set(key1, []);
                pointDirs.get(key1).push({ dx, dz });
                if (!pointDirs.has(key2)) pointDirs.set(key2, []);
                pointDirs.get(key2).push({ dx: -dx, dz: -dz });
            }
            // Only place turrets at real corners (where wall changes direction)
            corners = [];
            for (const [key, dirs] of pointDirs) {
                const [x, z] = key.split(',').map(Number);
                if (dirs.length >= 3) {
                    // T-junction or cross: always a corner
                    corners.push([x, z]);
                } else if (dirs.length === 2) {
                    // Corner only if directions are perpendicular (not collinear)
                    const allH = dirs.every(d => Math.abs(d.dz) < 0.01);
                    const allV = dirs.every(d => Math.abs(d.dx) < 0.01);
                    if (!allH && !allV) corners.push([x, z]);
                }
            }
        } else {
            const S = this.SPACING;
            const extent = S + this.ROOM_SIZE / 2 + 0.5;
            corners = [
                [-extent, -extent], [extent, -extent],
                [-extent, extent], [extent, extent]
            ];
        }

        corners.forEach(([cx, cz]) => {
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(turretR, turretR * 1.05, turretH, 12),
                mat
            );
            body.position.set(cx, turretH / 2, cz);
            body.castShadow = true;
            body.receiveShadow = true;
            this._scene.add(body);

            const roof = new THREE.Mesh(
                new THREE.ConeGeometry(turretR * 1.3, roofH, 12),
                new THREE.MeshStandardMaterial({ color: 0x5a3020, roughness: 0.8, metalness: 0.05 })
            );
            roof.position.set(cx, turretH + roofH / 2, cz);
            roof.castShadow = true;
            this._scene.add(roof);

            for (let a = 0; a < 4; a++) {
                const angle = (a / 4) * Math.PI * 2;
                const merlon = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.2, 0.15),
                    mat
                );
                merlon.position.set(
                    cx + Math.cos(angle) * turretR * 0.9,
                    turretH + 0.1,
                    cz + Math.sin(angle) * turretR * 0.9
                );
                this._scene.add(merlon);
            }
        });
    },

    // ─── Room Building ──────────────────────────────

    _getConnectedSides(roomIndex) {
        const connected = { front: false, back: false, left: false, right: false };
        const conns = CONNECTIONS[roomIndex];
        if (!conns) return connected;

        if (CastleLayout && CastleLayout.current) {
            const myCell = CastleLayout.current.cells[roomIndex];
            conns.forEach(target => {
                const tCell = CastleLayout.current.cells[target];
                const dx = tCell.gx - myCell.gx;
                const dz = tCell.gz - myCell.gz;
                if (dz > 0) connected.front = true;
                if (dz < 0) connected.back = true;
                if (dx < 0) connected.left = true;
                if (dx > 0) connected.right = true;
            });
        } else {
            const row = Math.floor(roomIndex / 3);
            const col = roomIndex % 3;
            conns.forEach(target => {
                const tRow = Math.floor(target / 3);
                const tCol = target % 3;
                if (tRow > row) connected.front = true;
                if (tRow < row) connected.back = true;
                if (tCol < col) connected.left = true;
                if (tCol > col) connected.right = true;
            });
        }
        return connected;
    },

    _buildRoom(i) {
        const pos = this.ROOM_POSITIONS[i];
        const group = new THREE.Group();
        group.position.set(pos.x, 0, pos.z);

        const layout = CastleLayout && CastleLayout.current;
        const rw = layout ? layout.roomSizes[i].w : this.ROOM_SIZE;
        const rd = layout ? layout.roomSizes[i].d : this.ROOM_SIZE;
        const halfW = rw / 2;
        const halfD = rd / 2;
        const wallH = i === THRONE_ROOM_INDEX ? 1.7 : this.WALL_HEIGHT;
        const wallT = this.WALL_THICKNESS;
        const halfSize = Math.min(halfW, halfD); // compat for decorators
        const connected = this._getConnectedSides(i);

        // Determine if this is an additional room
        const isAdditional = i >= CORE_ROOM_COUNT;
        let addRoomDef = null;
        if (isAdditional) {
            const addRoom = typeof GameState !== 'undefined' && GameState.getAdditionalRoom ? GameState.getAdditionalRoom(i) : null;
            addRoomDef = addRoom ? addRoom.def : null;
        }
        const isGarden = (i === 7) || (addRoomDef && (addRoomDef.category === 'nature' || addRoomDef.outdoor));

        if (!isGarden) {
            // Wall material with stone texture
            let wallColor;
            if (i === THRONE_ROOM_INDEX) wallColor = 0x9B8860;
            else if (addRoomDef) wallColor = (typeof ROOM_CATEGORY_THEMES !== 'undefined' && ROOM_CATEGORY_THEMES[addRoomDef.category]) ? (ROOM_CATEGORY_THEMES[addRoomDef.category].wallColor || 0x8B7355) : 0x8B7355;
            else wallColor = 0x8B7355;
            const wallMat = this._stoneMat.clone();
            wallMat.color.set(wallColor);

            // Build walls with doorway openings
            this._buildWallWithDoor(group, wallMat, rw, wallH, wallT, halfW, 'front', connected.front, halfD);
            this._buildWallWithDoor(group, wallMat, rw, wallH, wallT, halfW, 'back', connected.back, halfD);
            this._buildWallWithDoor(group, wallMat, rd, wallH, wallT, halfD, 'left', connected.left, halfW);
            this._buildWallWithDoor(group, wallMat, rd, wallH, wallT, halfD, 'right', connected.right, halfW);

            // Merlons on top of walls
            this._addMerlons(group, wallMat, rw, rd, wallH, halfW, halfD, connected);
            this._roomWalls[i] = wallMat;

            // Interior corner columns
            this._addCornerColumns(group, halfW, halfD, wallH);
        } else {
            this._roomWalls[i] = null;
        }

        // Floor
        const floorGeom = new THREE.PlaneGeometry(rw - 0.1, rd - 0.1);
        floorGeom.rotateX(-Math.PI / 2);
        let floorMat;
        if (isGarden) {
            floorMat = new THREE.MeshStandardMaterial({
                color: 0x3a6a2a, roughness: 0.95, metalness: 0,
                emissive: 0x000000, emissiveIntensity: 0
            });
        } else {
            const floorTint = addRoomDef ? addRoomDef.tint : (this.ROOM_TINTS[i] || 0x6a5a44);
            floorMat = new THREE.MeshStandardMaterial({
                map: this._createFloorTileTexture(this._tintToCSS(floorTint)),
                color: floorTint,
                roughness: 0.85, metalness: 0.05,
                emissive: 0x000000, emissiveIntensity: 0
            });
        }
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.position.y = 0.01;
        floor.receiveShadow = true;
        group.add(floor);
        this._roomFloors[i] = floor;

        // Special room decorations
        if (isGarden) {
            this._buildGarden(group, halfSize);
        } else if (i === 6) { // Cocina Real
            this._buildKitchen(group, halfSize);
        } else if (i === 3) { // Capilla
            this._buildChapel(group, halfSize, wallH);
        } else if (i === 0) { // Torre del Mago
            this._buildTowerMage(group, halfSize, wallH);
        } else if (i === 1) { // Biblioteca
            this._buildLibrary(group, halfSize, wallH);
        } else if (i === 2) { // Armería
            this._buildArmory(group, halfSize, wallH);
        } else if (i === 5) { // Sala del Consejo
            this._buildCouncil(group, halfSize, wallH);
        } else if (i === 8) { // Mazmorras
            this._buildDungeon(group, halfSize, wallH);
        } else if (i === 4) { // Salón del Trono
            this._buildThroneRoom(group, halfSize, wallH);
        } else if (isAdditional && addRoomDef) {
            this._buildAdditionalRoomDecor(group, halfSize, wallH, addRoomDef);
        }

        // Room highlight light (intensity controlled dynamically)
        const roomLight = new THREE.PointLight(0xFFDD66, 0, 4);
        roomLight.position.set(0, wallH * 0.6, 0);
        group.add(roomLight);
        this._roomLights[i] = roomLight;

        // Dim overlay (dark plane over floor, opacity controlled dynamically)
        const dimGeo = new THREE.PlaneGeometry(rw - 0.08, rd - 0.08);
        dimGeo.rotateX(-Math.PI / 2);
        const dimMat = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0,
            depthWrite: false, blending: THREE.NormalBlending
        });
        const dimOverlay = new THREE.Mesh(dimGeo, dimMat);
        dimOverlay.position.y = 0.025;
        dimOverlay.renderOrder = 1;
        group.add(dimOverlay);
        this._roomDimOverlays[i] = dimOverlay;

        // Labels removed – room name shown only in top-bar on hover

        this._scene.add(group);
        this._rooms[i] = group;
    },

    // ─── Additional Room Category Decorators ───────

    _buildAdditionalRoomDecor(group, halfSize, wallH, def) {
        const method = '_buildRoom_' + def.id;
        if (typeof this[method] === 'function') {
            this[method](group, halfSize, wallH);
        }
    },

    // ═══════════════════════════════════════════════════
    // NOBLE ROOMS
    // ═══════════════════════════════════════════════════

    // 1. Sala de Banquetes — dos mesas en T con sillas
    _buildRoom_sala_banquetes(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
        const legGeo = new THREE.BoxGeometry(0.06, 0.35, 0.06);
        // T-shape table 1 (left side)
        const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.0, 0.07, hs * 0.25), wood);
        hBar1.position.set(-hs * 0.05, 0.37, -hs * 0.3);
        group.add(hBar1);
        const vBar1 = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.3, 0.07, hs * 0.7), wood);
        vBar1.position.set(-hs * 0.05, 0.37, 0.0);
        group.add(vBar1);
        // Legs for T1
        for (const [lx, lz] of [[-hs*0.5, -hs*0.4], [hs*0.4, -hs*0.4], [-hs*0.15, hs*0.3], [hs*0.1, hs*0.3]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.175, lz);
            group.add(leg);
        }
        // T-shape table 2 (right side, mirrored)
        const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.0, 0.07, hs * 0.25), wood);
        hBar2.position.set(hs * 0.05, 0.37, hs * 0.3);
        group.add(hBar2);
        const vBar2 = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.3, 0.07, hs * 0.7), wood);
        vBar2.position.set(hs * 0.05, 0.37, 0.0);
        group.add(vBar2);
        for (const [lx, lz] of [[-hs*0.4, hs*0.4], [hs*0.5, hs*0.4], [-hs*0.1, -hs*0.3], [hs*0.15, -hs*0.3]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.175, lz);
            group.add(leg);
        }
        // Chairs around tables
        const chairSeat = new THREE.BoxGeometry(0.14, 0.04, 0.14);
        const chairBack = new THREE.BoxGeometry(0.14, 0.2, 0.03);
        const chairPositions = [
            [-hs*0.6, -hs*0.55, 0], [hs*0.5, -hs*0.55, 0],
            [-hs*0.6, hs*0.55, Math.PI], [hs*0.5, hs*0.55, Math.PI],
            [-hs*0.35, -hs*0.55, 0], [hs*0.25, -hs*0.55, 0],
            [-hs*0.35, hs*0.55, Math.PI], [hs*0.25, hs*0.55, Math.PI],
        ];
        for (const [cx, cz, ry] of chairPositions) {
            const seat = new THREE.Mesh(chairSeat, wood);
            seat.position.set(cx, 0.25, cz);
            group.add(seat);
            const back = new THREE.Mesh(chairBack, wood);
            back.position.set(cx, 0.38, cz + (ry === 0 ? -0.08 : 0.08));
            group.add(back);
        }
    },

    // 2. Galería de Retratos — cuadros grandes en paredes
    _buildRoom_galeria_retratos(group, hs, wallH) {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xc4a030, roughness: 0.4, metalness: 0.5 });
        const canvasColors = [0x8a2020, 0x204080, 0x206040, 0x604020, 0x503060, 0x806020];
        const positions = [
            { x: -hs * 0.5, z: -hs + 0.06, ry: 0 },
            { x: hs * 0.5, z: -hs + 0.06, ry: 0 },
            { x: -hs + 0.06, z: -hs * 0.4, ry: Math.PI / 2 },
            { x: -hs + 0.06, z: hs * 0.4, ry: Math.PI / 2 },
            { x: hs - 0.06, z: -hs * 0.4, ry: -Math.PI / 2 },
            { x: hs - 0.06, z: hs * 0.4, ry: -Math.PI / 2 },
        ];
        for (let p = 0; p < positions.length; p++) {
            const pos = positions[p];
            // Frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.4, wallH * 0.45, 0.04), frameMat);
            frame.position.set(pos.x, wallH * 0.5, pos.z);
            frame.rotation.y = pos.ry;
            group.add(frame);
            // Canvas
            const canvas = new THREE.Mesh(
                new THREE.PlaneGeometry(hs * 0.33, wallH * 0.38),
                new THREE.MeshStandardMaterial({ color: canvasColors[p % canvasColors.length], roughness: 0.9 })
            );
            canvas.position.set(pos.x, wallH * 0.5, pos.z);
            canvas.rotation.y = pos.ry;
            canvas.translateZ(0.025);
            group.add(canvas);
        }
    },

    // 3. Sala de Música — piano y arpa
    _buildRoom_sala_musica(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.7 });
        // Piano body
        const body = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.8, 0.35, hs * 0.5), wood);
        body.position.set(-hs * 0.2, 0.35, -hs * 0.2);
        group.add(body);
        // Piano top (lid slightly raised)
        const lid = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.8, 0.03, hs * 0.5), wood);
        lid.position.set(-hs * 0.2, 0.55, -hs * 0.2);
        lid.rotation.z = 0.15;
        group.add(lid);
        // Keys (white strip)
        const keys = new THREE.Mesh(
            new THREE.BoxGeometry(hs * 0.75, 0.02, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.5 })
        );
        keys.position.set(-hs * 0.2, 0.53, hs * 0.06 - hs * 0.2);
        group.add(keys);
        // Piano legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.17, 8);
        for (const [lx, lz] of [[-hs*0.55, -hs*0.4], [hs*0.15, -hs*0.4], [-hs*0.55, 0.0], [hs*0.15, 0.0]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.085, lz);
            group.add(leg);
        }
        // Harp — triangular frame
        const harpMat = new THREE.MeshStandardMaterial({ color: 0x8a6a30, roughness: 0.6, metalness: 0.2 });
        // Vertical column
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.7, 8), harpMat);
        col.position.set(hs * 0.45, 0.35, hs * 0.35);
        group.add(col);
        // Curved neck (angled bar)
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), harpMat);
        neck.position.set(hs * 0.35, 0.6, hs * 0.35);
        neck.rotation.z = Math.PI / 4;
        group.add(neck);
        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.08), harpMat);
        base.position.set(hs * 0.4, 0.02, hs * 0.35);
        group.add(base);
        // Strings (thin cylinders)
        const stringMat = new THREE.MeshStandardMaterial({ color: 0xddcc88, roughness: 0.3, metalness: 0.6 });
        for (let s = 0; s < 5; s++) {
            const h = 0.25 + s * 0.08;
            const str = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, h, 4), stringMat);
            str.position.set(hs * 0.45 - s * 0.04, h / 2, hs * 0.35);
            group.add(str);
        }
    },

    // 4. Sala de Audiencias — mesa tribunal y barandilla
    _buildRoom_sala_audiencias(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
        // Tribunal desk (elevated, at the back)
        const platform = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.4, 0.12, hs * 0.5), wood);
        platform.position.set(0, 0.06, -hs * 0.5);
        group.add(platform);
        const desk = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.2, 0.3, hs * 0.4), wood);
        desk.position.set(0, 0.32, -hs * 0.5);
        group.add(desk);
        // Chair behind desk
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.2), wood);
        chairSeat.position.set(0, 0.22, -hs * 0.7);
        group.add(chairSeat);
        const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.04), wood);
        chairBack.position.set(0, 0.42, -hs * 0.82);
        group.add(chairBack);
        // Wooden railing separating public area
        const railMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 });
        const rail = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.6, 0.05, 0.06), railMat);
        rail.position.set(0, 0.45, -hs * 0.1);
        group.add(rail);
        // Railing posts
        const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6);
        for (let p = -3; p <= 3; p++) {
            const post = new THREE.Mesh(postGeo, railMat);
            post.position.set(p * hs * 0.22, 0.225, -hs * 0.1);
            group.add(post);
        }
        // Lower rail bar
        const lowerRail = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.6, 0.04, 0.05), railMat);
        lowerRail.position.set(0, 0.15, -hs * 0.1);
        group.add(lowerRail);
    },

    // 5. Terraza Real — exterior sin paredes, macetas y plantas
    _buildRoom_terraza_real(group, hs) {
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.85 });
        const greenMat = new THREE.MeshStandardMaterial({ color: 0x2a7a1a, roughness: 0.9 });
        const potPositions = [
            [-hs*0.6, -hs*0.6], [hs*0.6, -hs*0.6], [-hs*0.6, hs*0.6], [hs*0.6, hs*0.6],
            [0, -hs*0.7], [0, hs*0.7], [-hs*0.7, 0], [hs*0.7, 0]
        ];
        const plantColors = [0x2a7a1a, 0x3a8a2a, 0x1a6a2a, 0x4a9a3a, 0x2a6a3a, 0x358a28, 0x2a7a3a, 0x3a7a2a];
        for (let i = 0; i < potPositions.length; i++) {
            const [px, pz] = potPositions[i];
            // Pot
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8), potMat);
            pot.position.set(px, 0.075, pz);
            group.add(pot);
            // Plant (sphere or cone)
            const pColor = plantColors[i % plantColors.length];
            const pMat = new THREE.MeshStandardMaterial({ color: pColor, roughness: 0.9 });
            if (i % 2 === 0) {
                const bush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), pMat);
                bush.position.set(px, 0.27, pz);
                group.add(bush);
            } else {
                const tall = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), pMat);
                tall.position.set(px, 0.28, pz);
                group.add(tall);
            }
        }
    },

    // 6. Archivo Real — similar a biblioteca
    _buildRoom_archivo_real(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.85 });
        const shelfH = wallH * 0.65;
        // Build 3 bookshelves against walls
        const shelfPositions = [
            { x: 0, z: -hs + 0.12, ry: 0 },
            { x: -hs + 0.12, z: 0, ry: Math.PI / 2 },
            { x: hs - 0.12, z: 0, ry: -Math.PI / 2 }
        ];
        for (const sp of shelfPositions) {
            // Shelf frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.9, shelfH, 0.18), wood);
            frame.position.set(sp.x, shelfH / 2, sp.z);
            frame.rotation.y = sp.ry;
            group.add(frame);
            // Shelf planks and books
            for (let row = 0; row < 3; row++) {
                const y = 0.15 + row * (shelfH / 3.5);
                // Plank
                const plank = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.85, 0.02, 0.16), wood);
                plank.position.set(sp.x, y, sp.z);
                plank.rotation.y = sp.ry;
                group.add(plank);
                // Books on plank
                for (let b = 0; b < 6; b++) {
                    const bw = 0.03 + Math.random() * 0.03;
                    const bh = 0.08 + Math.random() * 0.06;
                    const bookColors = [0x8a2020, 0x204080, 0x206040, 0x604020, 0x503060, 0x806020];
                    const bMat = new THREE.MeshStandardMaterial({ color: bookColors[b % bookColors.length], roughness: 0.9 });
                    const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.1), bMat);
                    book.position.set(sp.x, y + 0.01 + bh / 2, sp.z);
                    book.rotation.y = sp.ry;
                    book.translateX(-hs * 0.35 + b * 0.12);
                    group.add(book);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════
    // MILITARY ROOMS
    // ═══════════════════════════════════════════════════

    // 7. Cuartel de Guardias — literas y armas
    _buildRoom_cuartel_guardias(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
        // 2 bunk beds
        for (const bx of [-hs * 0.45, hs * 0.45]) {
            // Posts
            const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
            for (const pz of [-hs * 0.35, hs * 0.05]) {
                for (const px of [bx - 0.2, bx + 0.2]) {
                    const post = new THREE.Mesh(postGeo, wood);
                    post.position.set(px, 0.4, pz);
                    group.add(post);
                }
            }
            // Lower bed
            const bed1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, hs * 0.4), bedMat);
            bed1.position.set(bx, 0.2, -hs * 0.15);
            group.add(bed1);
            // Upper bed
            const bed2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, hs * 0.4), bedMat);
            bed2.position.set(bx, 0.55, -hs * 0.15);
            group.add(bed2);
        }
        // Weapons on back wall
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x8a8a90, roughness: 0.4, metalness: 0.6 });
        for (let s = -2; s <= 2; s++) {
            // Sword blade
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.04), metalMat);
            blade.position.set(s * hs * 0.22, wallH * 0.45, -hs + 0.06);
            group.add(blade);
            // Handle
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 6), wood);
            handle.position.set(s * hs * 0.22, wallH * 0.22, -hs + 0.06);
            group.add(handle);
        }
    },

    // 8. Sala de Estrategia — gran mesa central con mapa
    _buildRoom_sala_estrategia(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
        // Large central table
        const table = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.3, 0.08, hs * 0.9), wood);
        table.position.y = 0.4;
        group.add(table);
        const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        for (const [lx, lz] of [[-hs*0.55, -hs*0.35], [hs*0.55, -hs*0.35], [-hs*0.55, hs*0.35], [hs*0.55, hs*0.35]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.2, lz);
            group.add(leg);
        }
        // Map on table
        const map = new THREE.Mesh(
            new THREE.PlaneGeometry(hs * 1.0, hs * 0.7),
            new THREE.MeshStandardMaterial({ color: 0xd4bc82, roughness: 0.95, side: THREE.DoubleSide })
        );
        map.rotation.x = -Math.PI / 2;
        map.position.y = 0.45;
        group.add(map);
        // Map details (lines)
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
        for (let l = 0; l < 3; l++) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.6, 0.005, 0.01), lineMat);
            line.position.set(0, 0.452, -hs * 0.2 + l * hs * 0.2);
            group.add(line);
        }
    },

    // 9. Patio de Entrenamiento — exterior sin paredes, armas
    _buildRoom_patio_entrenamiento(group, hs) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x8a8a90, roughness: 0.4, metalness: 0.6 });
        // Training dummy (center)
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8), wood);
        post.position.set(0, 0.45, 0);
        group.add(post);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc4a878, roughness: 0.9 }));
        head.position.set(0, 1.0, 0);
        group.add(head);
        // Arms (cross-bar)
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.06), wood);
        arm.position.set(0, 0.75, 0);
        group.add(arm);
        // Weapon racks on sides
        for (const rx of [-hs * 0.6, hs * 0.6]) {
            const rack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, hs * 0.5), wood);
            rack.position.set(rx, 0.3, -hs * 0.5);
            group.add(rack);
            // Swords on rack
            for (let s = 0; s < 3; s++) {
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.04), metalMat);
                blade.position.set(rx, 0.5, -hs * 0.6 + s * hs * 0.15);
                group.add(blade);
            }
        }
        // Shield on ground
        const shield = new THREE.Mesh(new THREE.CircleGeometry(0.15, 8), metalMat);
        shield.rotation.x = -Math.PI / 2;
        shield.position.set(hs * 0.3, 0.02, hs * 0.4);
        group.add(shield);
    },

    // 10. Forja — horno, forja, restos de hierro
    _buildRoom_forja(group, hs, wallH) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.5, metalness: 0.5 });
        // Furnace (large, against back wall)
        const furnace = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.6, wallH * 0.6, hs * 0.4), stoneMat);
        furnace.position.set(-hs * 0.3, wallH * 0.3, -hs * 0.55);
        group.add(furnace);
        // Furnace opening (glowing)
        const glow = new THREE.Mesh(
            new THREE.PlaneGeometry(hs * 0.25, wallH * 0.25),
            new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 })
        );
        glow.position.set(-hs * 0.3, wallH * 0.25, -hs * 0.33);
        group.add(glow);
        // Anvil
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), metalMat);
        anvil.position.set(hs * 0.2, 0.25, 0);
        group.add(anvil);
        const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.2), metalMat);
        anvilTop.position.set(hs * 0.2, 0.38, 0);
        group.add(anvilTop);
        // Iron scraps on floor
        const scrapMat = new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.6, metalness: 0.7 });
        const scrapPositions = [
            [-hs*0.1, hs*0.3], [hs*0.4, hs*0.4], [-hs*0.5, hs*0.2],
            [hs*0.1, hs*0.5], [-hs*0.3, hs*0.6], [hs*0.5, -hs*0.2],
            [hs*0.3, hs*0.2], [-hs*0.2, -hs*0.1]
        ];
        for (const [sx, sz] of scrapPositions) {
            const scrap = new THREE.Mesh(new THREE.BoxGeometry(0.06 + Math.random()*0.06, 0.02, 0.04 + Math.random()*0.04), scrapMat);
            scrap.position.set(sx, 0.01, sz);
            scrap.rotation.y = Math.random() * Math.PI;
            group.add(scrap);
        }
    },

    // 11. Torre del Arquero — arcos y flechas
    _buildRoom_torre_arquero(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x8a8a90, roughness: 0.4, metalness: 0.5 });
        // Bow rack on wall
        const rack = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.0, wallH * 0.5, 0.08), wood);
        rack.position.set(0, wallH * 0.4, -hs + 0.06);
        group.add(rack);
        // Bows on rack (curved shapes using torus segments)
        for (let b = -1; b <= 1; b++) {
            const bow = new THREE.Mesh(
                new THREE.TorusGeometry(0.18, 0.012, 6, 12, Math.PI),
                new THREE.MeshStandardMaterial({ color: 0x6a4a1a, roughness: 0.7 })
            );
            bow.position.set(b * hs * 0.3, wallH * 0.45, -hs + 0.1);
            bow.rotation.y = Math.PI / 2;
            group.add(bow);
            // Bowstring
            const string = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.35, 4), metalMat);
            string.position.set(b * hs * 0.3, wallH * 0.45, -hs + 0.1);
            group.add(string);
        }
        // Quiver with arrows on floor
        const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 }));
        quiver.position.set(hs * 0.4, 0.2, hs * 0.3);
        quiver.rotation.z = 0.15;
        group.add(quiver);
        // Arrow tips sticking out
        for (let a = 0; a < 4; a++) {
            const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 4), wood);
            arrow.position.set(hs * 0.4 + (a-1.5)*0.02, 0.45, hs * 0.3);
            group.add(arrow);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 4), metalMat);
            tip.position.set(hs * 0.4 + (a-1.5)*0.02, 0.7, hs * 0.3);
            group.add(tip);
        }
    },

    // ═══════════════════════════════════════════════════
    // MYSTICAL ROOMS
    // ═══════════════════════════════════════════════════

    // 12. Cripta Real — lúgubre, dos sarcófagos
    _buildRoom_cripta_real(group, hs, wallH) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.85 });
        for (const sx of [-hs * 0.35, hs * 0.35]) {
            // Sarcophagus base
            const base = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.45, 0.25, hs * 0.9), stoneMat);
            base.position.set(sx, 0.125, 0);
            group.add(base);
            // Lid (slightly trapezoidal — use box with slight taper)
            const lid = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.42, 0.1, hs * 0.87), darkMat);
            lid.position.set(sx, 0.3, 0);
            group.add(lid);
            // Ridge on top
            const ridge = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.1, 0.06, hs * 0.8), stoneMat);
            ridge.position.set(sx, 0.38, 0);
            group.add(ridge);
        }
    },

    // 13. Cámara de Runas — menhir reluciente, piedras preciosas
    _buildRoom_camara_runas(group, hs, wallH) {
        // Central glowing menhir
        const menhirMat = new THREE.MeshStandardMaterial({
            color: 0x6a8aff, emissive: 0x3344aa, emissiveIntensity: 0.7,
            roughness: 0.3, metalness: 0.4
        });
        const menhir = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallH * 0.8, 0.15), menhirMat);
        menhir.position.set(0, wallH * 0.4, 0);
        group.add(menhir);
        // Top taper
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 4), menhirMat);
        top.position.set(0, wallH * 0.82, 0);
        group.add(top);
        // Precious gems scattered on floor
        const gemColors = [0xff3333, 0x33ff33, 0x3333ff, 0xffff33, 0xff33ff, 0x33ffff, 0xff8833, 0xaa33ff];
        for (let g = 0; g < 12; g++) {
            const angle = (g / 12) * Math.PI * 2;
            const dist = hs * (0.3 + Math.random() * 0.5);
            const gMat = new THREE.MeshStandardMaterial({
                color: gemColors[g % gemColors.length],
                emissive: gemColors[g % gemColors.length],
                emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.3
            });
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.025 + Math.random() * 0.02, 6, 4), gMat);
            gem.position.set(Math.cos(angle) * dist, 0.03, Math.sin(angle) * dist);
            group.add(gem);
        }
    },

    // 14. Cámara de Invocación — altar reluciente, piedras preciosas
    _buildRoom_camara_invocacion(group, hs, wallH) {
        // Central glowing altar
        const altarMat = new THREE.MeshStandardMaterial({
            color: 0xaa66ff, emissive: 0x6633aa, emissiveIntensity: 0.6,
            roughness: 0.3, metalness: 0.3
        });
        const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.35, 8), altarMat);
        altarBase.position.set(0, 0.175, 0);
        group.add(altarBase);
        const altarTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.08, 8), altarMat);
        altarTop.position.set(0, 0.39, 0);
        group.add(altarTop);
        // Glowing orb on altar
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 12, 8),
            new THREE.MeshStandardMaterial({ color: 0xeedd88, emissive: 0xaa8800, emissiveIntensity: 0.8, roughness: 0.1 })
        );
        orb.position.set(0, 0.5, 0);
        group.add(orb);
        // Precious gems scattered on floor
        const gemColors = [0xff3333, 0x33ff33, 0x3333ff, 0xffff33, 0xff33ff, 0x33ffff, 0xff8833, 0xaa33ff];
        for (let g = 0; g < 10; g++) {
            const angle = (g / 10) * Math.PI * 2;
            const dist = hs * (0.35 + Math.random() * 0.45);
            const gMat = new THREE.MeshStandardMaterial({
                color: gemColors[g % gemColors.length],
                emissive: gemColors[g % gemColors.length],
                emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.3
            });
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.025 + Math.random() * 0.02, 6, 4), gMat);
            gem.position.set(Math.cos(angle) * dist, 0.03, Math.sin(angle) * dist);
            group.add(gem);
        }
    },

    // 15. Observatorio — oscuro, telescopio gigante
    _buildRoom_observatorio(group, hs, wallH) {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.4, metalness: 0.7 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 });
        // Giant telescope (angled tube)
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, hs * 1.0, 12), metalMat);
        tube.position.set(0, wallH * 0.45, -hs * 0.1);
        tube.rotation.z = Math.PI / 6;
        tube.rotation.y = Math.PI / 8;
        group.add(tube);
        // Lens (front end)
        const lens = new THREE.Mesh(
            new THREE.CircleGeometry(0.12, 12),
            new THREE.MeshStandardMaterial({ color: 0x88aadd, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.6 })
        );
        lens.position.set(-hs * 0.22, wallH * 0.7, -hs * 0.15);
        lens.rotation.y = -Math.PI / 8;
        lens.rotation.z = Math.PI / 6;
        group.add(lens);
        // Tripod legs
        const legGeo = new THREE.CylinderGeometry(0.025, 0.025, wallH * 0.6, 6);
        for (let l = 0; l < 3; l++) {
            const angle = (l / 3) * Math.PI * 2 + Math.PI / 6;
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(Math.cos(angle) * 0.2, wallH * 0.2, Math.sin(angle) * 0.2 - hs * 0.1);
            leg.rotation.x = (Math.cos(angle)) * 0.2;
            leg.rotation.z = (-Math.sin(angle)) * 0.2;
            group.add(leg);
        }
    },

    // ═══════════════════════════════════════════════════
    // SERVICE ROOMS
    // ═══════════════════════════════════════════════════

    // 16. Despensa — estanterías, barriles y cajas
    _buildRoom_despensa(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
        // 2 shelves against walls
        for (const [sx, sz, ry] of [[-hs + 0.1, 0, Math.PI / 2], [0, -hs + 0.1, 0]]) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.8, wallH * 0.6, 0.15), wood);
            shelf.position.set(sx, wallH * 0.3, sz);
            shelf.rotation.y = ry;
            group.add(shelf);
            // Items on shelf
            for (let item = 0; item < 4; item++) {
                const jar = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6),
                    new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.8 })
                );
                jar.position.set(sx, wallH * 0.35 + item * 0.12, sz);
                jar.rotation.y = ry;
                jar.translateX(-hs * 0.25 + item * hs * 0.15);
                group.add(jar);
            }
        }
        // Barrels in corner
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 });
        for (const [bx, bz] of [[hs*0.5, hs*0.5], [hs*0.5, hs*0.2], [hs*0.25, hs*0.5]]) {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.35, 10), barrelMat);
            barrel.position.set(bx, 0.175, bz);
            group.add(barrel);
        }
        // Wooden crates
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x6a5530, roughness: 0.9 });
        for (const [cx, cz, cy] of [[-hs*0.4, hs*0.5, 0.15], [-hs*0.4, hs*0.25, 0.15], [-hs*0.4, hs*0.38, 0.45]]) {
            const crate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), crateMat);
            crate.position.set(cx, cy, cz);
            group.add(crate);
        }
    },

    // 17. Dormitorio de Criados — litera y escritorio
    _buildRoom_dormitorio_criados(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
        // Bunk bed (left side)
        const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6);
        for (const [px, pz] of [[-hs*0.6, -hs*0.55], [-hs*0.25, -hs*0.55], [-hs*0.6, -hs*0.15], [-hs*0.25, -hs*0.15]]) {
            const post = new THREE.Mesh(postGeo, wood);
            post.position.set(px, 0.4, pz);
            group.add(post);
        }
        const bed1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, hs * 0.4), bedMat);
        bed1.position.set(-hs * 0.425, 0.18, -hs * 0.35);
        group.add(bed1);
        const bed2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, hs * 0.4), bedMat);
        bed2.position.set(-hs * 0.425, 0.53, -hs * 0.35);
        group.add(bed2);
        // Desk (right side)
        const desk = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.5, 0.06, hs * 0.35), wood);
        desk.position.set(hs * 0.3, 0.35, hs * 0.3);
        group.add(desk);
        const legGeo = new THREE.BoxGeometry(0.04, 0.35, 0.04);
        for (const [lx, lz] of [[hs*0.08, hs*0.15], [hs*0.52, hs*0.15], [hs*0.08, hs*0.45], [hs*0.52, hs*0.45]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.175, lz);
            group.add(leg);
        }
    },

    // 18. Lavandería — bañera y ropa colgada
    _buildRoom_lavanderia(group, hs, wallH) {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.5, metalness: 0.4 });
        // Bathtub (large basin)
        const tub = new THREE.Mesh(new THREE.CylinderGeometry(hs * 0.3, hs * 0.25, 0.3, 12), metalMat);
        tub.position.set(-hs * 0.2, 0.15, -hs * 0.2);
        group.add(tub);
        // Water inside
        const water = new THREE.Mesh(
            new THREE.CircleGeometry(hs * 0.27, 12),
            new THREE.MeshStandardMaterial({ color: 0x4488aa, roughness: 0.2, transparent: true, opacity: 0.6 })
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(-hs * 0.2, 0.28, -hs * 0.2);
        group.add(water);
        // Clothesline rope (between walls)
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.9 });
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, hs * 1.4, 4), ropeMat);
        rope.rotation.z = Math.PI / 2;
        rope.position.set(0, wallH * 0.6, hs * 0.3);
        group.add(rope);
        // Hanging clothes
        const clothColors = [0xcc4444, 0x4444cc, 0xdddddd, 0x44aa44, 0xccaa44];
        for (let c = 0; c < 5; c++) {
            const cloth = new THREE.Mesh(
                new THREE.PlaneGeometry(0.15, 0.25),
                new THREE.MeshStandardMaterial({ color: clothColors[c], roughness: 0.95, side: THREE.DoubleSide })
            );
            cloth.position.set(-hs * 0.5 + c * hs * 0.25, wallH * 0.4, hs * 0.3);
            cloth.rotation.x = 0.1;
            group.add(cloth);
        }
    },

    // 19. Establos — vaca y paja
    _buildRoom_establos(group, hs, wallH) {
        // Simplified cow
        const cowMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.9 });
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.6), cowMat);
        body.position.set(-hs * 0.2, 0.35, -hs * 0.1);
        group.add(body);
        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), whiteMat);
        head.position.set(-hs * 0.2, 0.4, -hs * 0.45);
        group.add(head);
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6);
        for (const [lx, lz] of [[-hs*0.3, -hs*0.3], [-hs*0.1, -hs*0.3], [-hs*0.3, hs*0.1], [-hs*0.1, hs*0.1]]) {
            const leg = new THREE.Mesh(legGeo, cowMat);
            leg.position.set(lx, 0.11, lz);
            group.add(leg);
        }
        // Hay/straw scattered on floor
        const hayMat = new THREE.MeshStandardMaterial({ color: 0xc4aa44, roughness: 0.95 });
        for (let h = 0; h < 15; h++) {
            const hay = new THREE.Mesh(new THREE.PlaneGeometry(0.12 + Math.random()*0.1, 0.08 + Math.random()*0.06),
                hayMat);
            hay.rotation.x = -Math.PI / 2;
            hay.rotation.z = Math.random() * Math.PI;
            hay.position.set((Math.random() - 0.5) * hs * 1.4, 0.01, (Math.random() - 0.5) * hs * 1.4);
            group.add(hay);
        }
        // Hay pile
        const pile = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 8), hayMat);
        pile.position.set(hs * 0.4, 0.15, hs * 0.3);
        group.add(pile);
    },

    // 20. Granero — montaña de trigo y cajas de madera
    _buildRoom_granero(group, hs, wallH) {
        const wheatMat = new THREE.MeshStandardMaterial({ color: 0xd4aa30, roughness: 0.95 });
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x6a5530, roughness: 0.9 });
        // Large wheat mountain
        const wheat = new THREE.Mesh(new THREE.ConeGeometry(hs * 0.5, hs * 0.7, 12), wheatMat);
        wheat.position.set(-hs * 0.15, hs * 0.35, -hs * 0.1);
        group.add(wheat);
        // Wheat base (flatten the base)
        const base = new THREE.Mesh(new THREE.CylinderGeometry(hs * 0.5, hs * 0.55, 0.1, 12), wheatMat);
        base.position.set(-hs * 0.15, 0.05, -hs * 0.1);
        group.add(base);
        // Wooden crates stacked
        for (const [cx, cz, cy] of [
            [hs*0.5, hs*0.3, 0.15], [hs*0.5, -hs*0.1, 0.15],
            [hs*0.2, hs*0.5, 0.15], [hs*0.5, hs*0.1, 0.45]
        ]) {
            const crate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), crateMat);
            crate.position.set(cx, cy, cz);
            group.add(crate);
        }
    },

    // 21. Taller — desastre de hierros, herramientas, ruedas
    _buildRoom_taller(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.5, metalness: 0.5 });
        // Work table
        const table = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.8, 0.06, hs * 0.4), wood);
        table.position.set(0, 0.4, -hs * 0.4);
        group.add(table);
        const legGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05);
        for (const [lx, lz] of [[-hs*0.35, -hs*0.55], [hs*0.35, -hs*0.55], [-hs*0.35, -hs*0.25], [hs*0.35, -hs*0.25]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.2, lz);
            group.add(leg);
        }
        // Wheel leaning against wall
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 16), wood);
        wheel.position.set(hs * 0.6, 0.25, -hs * 0.6);
        wheel.rotation.y = 0.3;
        group.add(wheel);
        // Spokes
        for (let s = 0; s < 4; s++) {
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 4), wood);
            spoke.position.set(hs * 0.6, 0.25, -hs * 0.6);
            spoke.rotation.y = 0.3;
            spoke.rotation.z = s * Math.PI / 4;
            group.add(spoke);
        }
        // Scattered tools and iron on floor
        const scatterItems = [
            [-hs*0.3, hs*0.2], [hs*0.1, hs*0.4], [-hs*0.5, hs*0.5],
            [hs*0.3, hs*0.2], [-hs*0.1, hs*0.6], [hs*0.5, hs*0.5],
            [-hs*0.4, -hs*0.1], [hs*0.2, -hs*0.1]
        ];
        for (const [sx, sz] of scatterItems) {
            const r = Math.random();
            let item;
            if (r < 0.4) {
                item = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.04), metalMat);
            } else if (r < 0.7) {
                item = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), metalMat);
                item.rotation.z = Math.PI / 2;
            } else {
                item = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.12), wood);
            }
            item.position.set(sx, 0.02, sz);
            item.rotation.y = Math.random() * Math.PI;
            group.add(item);
        }
    },

    // 22. Sala de Mensajeros — pared de buzones y escritorio central
    _buildRoom_sala_mensajeros(group, hs, wallH) {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
        // Wall of mailboxes (back wall)
        const wallPanel = new THREE.Mesh(new THREE.BoxGeometry(hs * 1.4, wallH * 0.7, 0.08), wood);
        wallPanel.position.set(0, wallH * 0.4, -hs + 0.06);
        group.add(wallPanel);
        // Mailbox grid (4 cols x 4 rows)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const slot = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.25, wallH * 0.12, 0.06), slotMat);
                slot.position.set(-hs * 0.45 + col * hs * 0.3, wallH * 0.18 + row * wallH * 0.15, -hs + 0.1);
                group.add(slot);
            }
        }
        // Central desk
        const desk = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.6, 0.06, hs * 0.4), wood);
        desk.position.set(0, 0.35, hs * 0.2);
        group.add(desk);
        const legGeo = new THREE.BoxGeometry(0.04, 0.35, 0.04);
        for (const [lx, lz] of [[-hs*0.25, hs*0.05], [hs*0.25, hs*0.05], [-hs*0.25, hs*0.35], [hs*0.25, hs*0.35]]) {
            const leg = new THREE.Mesh(legGeo, wood);
            leg.position.set(lx, 0.175, lz);
            group.add(leg);
        }
    },

    // ═══════════════════════════════════════════════════
    // NATURE ROOMS (all outdoor, no walls)
    // ═══════════════════════════════════════════════════

    // 23. Jardín del Claustro — jardín exterior simple
    _buildRoom_jardin_claustro(group, hs) {
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x2a7a1a, roughness: 0.9 });
        // Bushes and flowers scattered
        const plantPositions = [
            [-hs*0.5, -hs*0.5], [hs*0.5, -hs*0.5], [-hs*0.5, hs*0.5], [hs*0.5, hs*0.5],
            [0, -hs*0.6], [0, hs*0.6], [-hs*0.6, 0], [hs*0.6, 0]
        ];
        for (let i = 0; i < plantPositions.length; i++) {
            const [px, pz] = plantPositions[i];
            const bush = new THREE.Mesh(new THREE.SphereGeometry(0.1 + Math.random()*0.08, 8, 6), bushMat);
            bush.position.set(px, 0.12, pz);
            group.add(bush);
        }
        // Colorful flowers
        const flowerColors = [0xff4488, 0xffaa22, 0xff2244, 0xaa44ff, 0xffff44, 0xff66aa];
        for (let f = 0; f < 10; f++) {
            const fMat = new THREE.MeshStandardMaterial({ color: flowerColors[f % flowerColors.length], roughness: 0.8 });
            const flower = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), fMat);
            flower.position.set((Math.random() - 0.5) * hs * 1.2, 0.08, (Math.random() - 0.5) * hs * 1.2);
            group.add(flower);
        }
    },

    // 24. Laberinto de Setos — setos formando laberinto
    _buildRoom_laberinto_setos(group, hs) {
        const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x2a5a1a, roughness: 0.95 });
        // Maze hedges — simple labyrinth pattern
        const hedges = [
            // Outer border (partial — leave openings for doorways)
            { x: 0, z: -hs * 0.7, w: hs * 1.2, d: 0.12 },
            { x: 0, z: hs * 0.7, w: hs * 0.5, d: 0.12 },
            { x: -hs * 0.7, z: 0, w: 0.12, d: hs * 1.2 },
            { x: hs * 0.7, z: -hs * 0.2, w: 0.12, d: hs * 0.7 },
            // Inner walls
            { x: -hs * 0.25, z: -hs * 0.25, w: hs * 0.7, d: 0.12 },
            { x: hs * 0.2, z: hs * 0.2, w: hs * 0.5, d: 0.12 },
            { x: 0, z: 0, w: 0.12, d: hs * 0.5 },
            { x: -hs * 0.35, z: hs * 0.25, w: 0.12, d: hs * 0.6 },
        ];
        for (const h of hedges) {
            const hedge = new THREE.Mesh(new THREE.BoxGeometry(h.w, 0.35, h.d), hedgeMat);
            hedge.position.set(h.x, 0.175, h.z);
            group.add(hedge);
        }
    },

    // 25. Estanque Real — gran estanque central
    _buildRoom_estanque_real(group, hs) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.7 });
        // Stone border ring
        const border = new THREE.Mesh(new THREE.TorusGeometry(hs * 0.45, 0.06, 8, 24), stoneMat);
        border.rotation.x = -Math.PI / 2;
        border.position.y = 0.08;
        group.add(border);
        // Water surface
        const water = new THREE.Mesh(
            new THREE.CircleGeometry(hs * 0.43, 24),
            new THREE.MeshStandardMaterial({ color: 0x2266aa, roughness: 0.1, transparent: true, opacity: 0.7 })
        );
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.04;
        group.add(water);
        // Pond bottom
        const bottom = new THREE.Mesh(
            new THREE.CircleGeometry(hs * 0.43, 24),
            new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.95 })
        );
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.y = -0.02;
        group.add(bottom);
    },

    // 26. Cementerio — hierba con lápidas
    _buildRoom_cementerio(group, hs) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 0.9 });
        const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.85 });
        // Tombstones
        const tombPositions = [
            [-hs*0.5, -hs*0.4], [-hs*0.1, -hs*0.5], [hs*0.3, -hs*0.3],
            [-hs*0.4, hs*0.2], [hs*0.1, hs*0.1], [hs*0.5, hs*0.4]
        ];
        for (let t = 0; t < tombPositions.length; t++) {
            const [tx, tz] = tombPositions[t];
            const mat = t % 2 === 0 ? stoneMat : darkStoneMat;
            // Base
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.08), mat);
            base.position.set(tx, 0.02, tz);
            group.add(base);
            // Stone slab
            const slab = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.25 + Math.random()*0.1, 0.04), mat);
            slab.position.set(tx, 0.17, tz);
            group.add(slab);
            // Rounded top
            const top = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat);
            top.position.set(tx, 0.3 + (t % 2) * 0.05, tz);
            group.add(top);
        }
    },

    // 27. Jardín de Hierbas — hierba con plantas de colores
    _buildRoom_jardin_hierbas(group, hs) {
        const colors = [0xff4488, 0xffaa22, 0xff2244, 0xaa44ff, 0xffff44, 0x44aaff, 0xff66aa, 0x88ff44, 0xff8844, 0x44ff88];
        for (let p = 0; p < 18; p++) {
            const px = (Math.random() - 0.5) * hs * 1.4;
            const pz = (Math.random() - 0.5) * hs * 1.4;
            const pMat = new THREE.MeshStandardMaterial({ color: colors[p % colors.length], roughness: 0.8 });
            if (p % 3 === 0) {
                // Tall plant
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0x2a6a1a, roughness: 0.9 }));
                stem.position.set(px, 0.075, pz);
                group.add(stem);
                const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), pMat);
                bloom.position.set(px, 0.17, pz);
                group.add(bloom);
            } else if (p % 3 === 1) {
                // Bush
                const bush = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random()*0.04, 6, 4), pMat);
                bush.position.set(px, 0.06, pz);
                group.add(bush);
            } else {
                // Small ground flower
                const flower = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), pMat);
                flower.position.set(px, 0.04, pz);
                group.add(flower);
            }
        }
    },

    // ═══════════════════════════════════════════════════
    // SPECIAL ROOMS
    // ═══════════════════════════════════════════════════

    // 28. Sala de Reliquias — dorado, cofres de oro, piedras brillantes, muy lleno
    _buildRoom_sala_reliquias(group, hs, wallH) {
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.3, metalness: 0.7 });
        const darkGold = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.6 });
        // Multiple treasure chests
        const chestPositions = [
            [-hs*0.5, -hs*0.4], [hs*0.3, -hs*0.5], [-hs*0.3, hs*0.3],
            [hs*0.5, hs*0.2], [0, -hs*0.6], [-hs*0.6, 0]
        ];
        for (const [cx, cz] of chestPositions) {
            // Chest body
            const chest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), goldMat);
            chest.position.set(cx, 0.07, cz);
            group.add(chest);
            // Chest lid
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.18), darkGold);
            lid.position.set(cx, 0.17, cz);
            group.add(lid);
        }
        // Gem piles everywhere
        const gemColors = [0xff2222, 0x22ff22, 0x2222ff, 0xffff22, 0xff22ff, 0x22ffff, 0xff8822, 0xaa22ff];
        for (let g = 0; g < 20; g++) {
            const gx = (Math.random() - 0.5) * hs * 1.4;
            const gz = (Math.random() - 0.5) * hs * 1.4;
            const gMat = new THREE.MeshStandardMaterial({
                color: gemColors[g % gemColors.length],
                emissive: gemColors[g % gemColors.length],
                emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.4
            });
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.02 + Math.random() * 0.025, 6, 4), gMat);
            gem.position.set(gx, 0.025, gz);
            group.add(gem);
        }
        // Gold coins/pieces on floor
        for (let c = 0; c < 15; c++) {
            const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 8), goldMat);
            coin.rotation.x = -Math.PI / 2 + Math.random() * 0.5;
            coin.position.set((Math.random() - 0.5) * hs * 1.2, 0.01, (Math.random() - 0.5) * hs * 1.2);
            group.add(coin);
        }
    },

    // 29. Torre de Campanas — genérica (campana y cuerda)
    _buildRoom_torre_campanas(group, hs, wallH) {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8960b, roughness: 0.4, metalness: 0.6 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        // Bell (large, hanging from ceiling)
        const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.22, 0.3, 12), metalMat);
        bell.position.set(0, wallH * 0.55, 0);
        group.add(bell);
        // Bell rim
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 16), metalMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(0, wallH * 0.4, 0);
        group.add(rim);
        // Rope hanging down
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, wallH * 0.6, 4),
            new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.9 }));
        rope.position.set(0.15, wallH * 0.3, 0);
        group.add(rope);
        // Wooden beam (support)
        const beam = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.8, 0.08, 0.08), wood);
        beam.position.set(0, wallH * 0.75, 0);
        group.add(beam);
    },

    // 30. Torre del Reloj — genérica (engranajes y péndulo)
    _buildRoom_torre_reloj(group, hs, wallH) {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x8a7a30, roughness: 0.4, metalness: 0.6 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
        // Large gear on back wall
        const gear1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 12), metalMat);
        gear1.position.set(-hs * 0.25, wallH * 0.5, -hs + 0.06);
        group.add(gear1);
        // Gear teeth (small boxes around the torus)
        for (let t = 0; t < 8; t++) {
            const angle = (t / 8) * Math.PI * 2;
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), metalMat);
            tooth.position.set(
                -hs * 0.25 + Math.cos(angle) * 0.22,
                wallH * 0.5 + Math.sin(angle) * 0.22,
                -hs + 0.06
            );
            group.add(tooth);
        }
        // Smaller gear
        const gear2 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 10), metalMat);
        gear2.position.set(hs * 0.15, wallH * 0.55, -hs + 0.06);
        group.add(gear2);
        // Pendulum
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, wallH * 0.5, 4), metalMat);
        rod.position.set(hs * 0.3, wallH * 0.35, 0);
        group.add(rod);
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), metalMat);
        bob.position.set(hs * 0.3, wallH * 0.1, 0);
        group.add(bob);
        // Pivot
        const pivot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.04), wood);
        pivot.position.set(hs * 0.3, wallH * 0.6, 0);
        group.add(pivot);
    },

    _tintToCSS(hex) {
        const r = (hex >> 16) & 0xFF;
        const g = (hex >> 8) & 0xFF;
        const b = hex & 0xFF;
        return `rgb(${r},${g},${b})`;
    },

    _buildWallWithDoor(group, mat, roomSize, wallH, wallT, halfSize, side, hasDoor, halfPerp) {
        if (halfPerp === undefined) halfPerp = halfSize;
        const doorW = 0.7;
        const doorH = wallH * 0.7;

        if (!hasDoor) {
            // Solid wall
            const geom = side === 'left' || side === 'right'
                ? new THREE.BoxGeometry(wallT, wallH, roomSize)
                : new THREE.BoxGeometry(roomSize, wallH, wallT);
            const wall = new THREE.Mesh(geom, mat);
            const px = side === 'left' ? -halfPerp : side === 'right' ? halfPerp : 0;
            const pz = side === 'back' ? -halfPerp : side === 'front' ? halfPerp : 0;
            wall.position.set(px, wallH / 2, pz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            group.add(wall);
            return;
        }

        // Wall with doorway opening: two side segments + lintel
        const isLR = side === 'left' || side === 'right';
        const totalLen = roomSize;
        const sideLen = (totalLen - doorW) / 2;
        const px = side === 'left' ? -halfPerp : side === 'right' ? halfPerp : 0;
        const pz = side === 'back' ? -halfPerp : side === 'front' ? halfPerp : 0;

        // Left/bottom segment
        const seg1Geom = isLR
            ? new THREE.BoxGeometry(wallT, wallH, sideLen)
            : new THREE.BoxGeometry(sideLen, wallH, wallT);
        const seg1 = new THREE.Mesh(seg1Geom, mat);
        const offset1 = -(totalLen / 2) + sideLen / 2;
        if (isLR) seg1.position.set(px, wallH / 2, offset1);
        else seg1.position.set(offset1, wallH / 2, pz);
        seg1.castShadow = true; seg1.receiveShadow = true;
        group.add(seg1);

        // Right/top segment
        const seg2 = new THREE.Mesh(seg1Geom, mat);
        const offset2 = (totalLen / 2) - sideLen / 2;
        if (isLR) seg2.position.set(px, wallH / 2, offset2);
        else seg2.position.set(offset2, wallH / 2, pz);
        seg2.castShadow = true; seg2.receiveShadow = true;
        group.add(seg2);

        // Lintel above door
        const lintelH = wallH - doorH;
        if (lintelH > 0.01) {
            const lintelGeom = isLR
                ? new THREE.BoxGeometry(wallT, lintelH, doorW)
                : new THREE.BoxGeometry(doorW, lintelH, wallT);
            const lintel = new THREE.Mesh(lintelGeom, mat);
            if (isLR) lintel.position.set(px, doorH + lintelH / 2, 0);
            else lintel.position.set(0, doorH + lintelH / 2, pz);
            lintel.castShadow = true;
            group.add(lintel);
        }
    },

    _addMerlons(group, mat, rw, rd, wallH, halfW, halfD, connected) {
        const mW = this.MERLON_W;
        const mH = this.MERLON_H;

        const sides = [
            { length: rw, axis: 'z', pos: halfD, skip: connected.front },
            { length: rw, axis: 'z', pos: -halfD, skip: connected.back },
            { length: rd, axis: 'x', pos: -halfW, skip: connected.left },
            { length: rd, axis: 'x', pos: halfW, skip: connected.right }
        ];
        sides.forEach(s => {
            const count = Math.floor(s.length / (mW * 2.8));
            if (count <= 0) return;
            const step = s.length / count;
            for (let m = 0; m < count; m++) {
                const off = -s.length / 2 + (m + 0.5) * step;
                if (s.skip && Math.abs(off) < 0.4) continue;
                const merlon = new THREE.Mesh(
                    new THREE.BoxGeometry(mW, mH, mW), mat
                );
                if (s.axis === 'z') merlon.position.set(off, wallH + mH / 2, s.pos);
                else merlon.position.set(s.pos, wallH + mH / 2, off);
                merlon.castShadow = true;
                group.add(merlon);
            }
        });
    },

    _addCornerColumns(group, halfW, halfD, wallH) {
        const colR = 0.06;
        const colH = wallH * 0.9;
        const colMat = new THREE.MeshStandardMaterial({
            color: 0x7a6a55, roughness: 0.7, metalness: 0.1
        });
        const insetW = halfW - 0.12;
        const insetD = halfD - 0.12;
        const corners = [[-insetW, -insetD], [insetW, -insetD], [-insetW, insetD], [insetW, insetD]];
        corners.forEach(([cx, cz]) => {
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(colR, colR * 1.2, colH, 8),
                colMat
            );
            col.position.set(cx, colH / 2, cz);
            col.castShadow = true;
            group.add(col);
        });
    },

    _buildThroneRoom(group, halfSize, wallH) {
        // Room 4 — Salón del Trono (center room, all 4 sides have doors)
        // The most majestic room: grand golden throne, royal carpet, chandeliers, banners, gold accents

        const goldMat = new THREE.MeshStandardMaterial({ color: 0xDAA520, roughness: 0.25, metalness: 0.85 });
        const darkGoldMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, roughness: 0.3, metalness: 0.75 });
        const richRedMat = new THREE.MeshStandardMaterial({ color: 0x8B1A1A, roughness: 0.8, metalness: 0.05 });
        const velvetMat = new THREE.MeshStandardMaterial({ color: 0x6B0000, roughness: 0.9, metalness: 0 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.7, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x2a1508, roughness: 0.75, metalness: 0.05 });
        const marbleMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.35, metalness: 0.1 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.55, metalness: 0.6 });

        // ═══════════════════════════════════════════════
        // ── GRAND THRONE (back wall, center) ──
        // ═══════════════════════════════════════════════
        const tx = 0, tz = -halfSize + 0.45;

        // Throne platform (raised stone dais, 2 steps)
        const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.8), marbleMat);
        step1.position.set(tx, 0.03, tz + 0.1);
        step1.receiveShadow = true;
        group.add(step1);
        const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), marbleMat);
        step2.position.set(tx, 0.09, tz + 0.05);
        step2.receiveShadow = true;
        group.add(step2);
        // Gold trim on steps
        const stepTrim1 = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.015, 0.02), goldMat);
        stepTrim1.position.set(tx, 0.06, tz + 0.51);
        group.add(stepTrim1);
        const stepTrim2 = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.015, 0.02), goldMat);
        stepTrim2.position.set(tx, 0.12, tz + 0.36);
        group.add(stepTrim2);

        // Throne seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.4), darkWoodMat);
        seat.position.set(tx, 0.16, tz);
        seat.castShadow = true;
        group.add(seat);
        // Seat cushion (red velvet)
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.34), velvetMat);
        cushion.position.set(tx, 0.21, tz);
        group.add(cushion);

        // Throne backrest (tall)
        const backH = 0.9;
        const throneBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, backH, 0.06), darkWoodMat);
        throneBack.position.set(tx, 0.12 + backH / 2, tz - 0.22);
        throneBack.castShadow = true;
        group.add(throneBack);
        // Backrest padding (red velvet)
        const backPad = new THREE.Mesh(new THREE.BoxGeometry(0.4, backH - 0.15, 0.02), velvetMat);
        backPad.position.set(tx, 0.12 + backH / 2 + 0.05, tz - 0.19);
        group.add(backPad);

        // Throne crown (ornate top piece)
        const crownBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.06, 0.08), goldMat);
        crownBase.position.set(tx, 0.12 + backH + 0.03, tz - 0.22);
        group.add(crownBase);
        // Crown peaks (3 points)
        [-0.18, 0, 0.18].forEach((cx, idx) => {
            const peakH = idx === 1 ? 0.14 : 0.09;
            const peak = new THREE.Mesh(new THREE.ConeGeometry(0.04, peakH, 4), goldMat);
            peak.position.set(tx + cx, 0.12 + backH + 0.06 + peakH / 2, tz - 0.22);
            group.add(peak);
            // Jewel on peak
            const jewel = new THREE.Mesh(
                new THREE.SphereGeometry(0.015, 6, 6),
                new THREE.MeshStandardMaterial({ color: idx === 1 ? 0xFF0000 : 0x0044FF, roughness: 0.1, metalness: 0.3, emissive: idx === 1 ? 0x440000 : 0x000044, emissiveIntensity: 0.5 })
            );
            jewel.position.set(tx + cx, 0.12 + backH + 0.06 + peakH, tz - 0.22);
            group.add(jewel);
        });

        // Throne armrests
        [-0.28, 0.28].forEach(ax => {
            // Armrest post
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), darkWoodMat);
            post.position.set(tx + ax, 0.12 + 0.18, tz - 0.18);
            post.castShadow = true;
            group.add(post);
            // Armrest top
            const armTop = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.4), darkWoodMat);
            armTop.position.set(tx + ax, 0.12 + 0.35, tz - 0.02);
            group.add(armTop);
            // Gold lion head finial on armrest
            const lion = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), goldMat);
            lion.scale.set(1, 0.9, 1.2);
            lion.position.set(tx + ax, 0.12 + 0.37, tz + 0.18);
            group.add(lion);
            // Gold trim along armrest
            const armTrim = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.01, 0.42), goldMat);
            armTrim.position.set(tx + ax, 0.12 + 0.37, tz - 0.02);
            group.add(armTrim);
        });

        // Throne legs (ornate carved, gold capped)
        [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.15], [0.2, 0.15]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.06), darkWoodMat);
            leg.position.set(tx + lx, 0.06, tz + lz);
            group.add(leg);
            // Gold foot cap
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), goldMat);
            cap.scale.y = 0.5;
            cap.position.set(tx + lx, 0.01, tz + lz);
            group.add(cap);
        });

        // ═══════════════════════════════════════════════
        // ── ROYAL CARPET (red with gold border) ──
        // ═══════════════════════════════════════════════
        // Main carpet running from throne to front door
        const carpet = new THREE.Mesh(new THREE.PlaneGeometry(0.7, halfSize * 2 - 0.3), richRedMat);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.set(tx, 0.015, 0.15);
        group.add(carpet);
        // Gold carpet borders
        [-0.36, 0.36].forEach(bx => {
            const border = new THREE.Mesh(
                new THREE.PlaneGeometry(0.04, halfSize * 2 - 0.3),
                goldMat
            );
            border.rotation.x = -Math.PI / 2;
            border.position.set(tx + bx, 0.016, 0.15);
            group.add(border);
        });
        // Inner gold stripe
        [-0.28, 0.28].forEach(bx => {
            const inner = new THREE.Mesh(
                new THREE.PlaneGeometry(0.015, halfSize * 2 - 0.3),
                darkGoldMat
            );
            inner.rotation.x = -Math.PI / 2;
            inner.position.set(tx + bx, 0.016, 0.15);
            group.add(inner);
        });

        // ═══════════════════════════════════════════════
        // ── ROYAL BANNERS (on all 4 walls) ──
        // ═══════════════════════════════════════════════
        const bannerColors = [0x8B0000, 0x00008B, 0x8B6914, 0x2F4F2F, 0x4B0082, 0xCC6600];
        let bannerIdx = 0;

        const addBanner = (bx, bz, rotY, scale) => {
            const s = scale || 1;
            const bColor = bannerColors[bannerIdx++ % bannerColors.length];
            const fabricMat = new THREE.MeshStandardMaterial({
                color: bColor, roughness: 0.9, metalness: 0, side: THREE.DoubleSide
            });
            // Fabric
            const fabric = new THREE.Mesh(new THREE.PlaneGeometry(0.25 * s, 0.55 * s), fabricMat);
            fabric.position.set(bx, wallH * 0.62, bz);
            fabric.rotation.y = rotY;
            group.add(fabric);
            // Pointed bottom
            const triShape = new THREE.Shape();
            triShape.moveTo(-0.125 * s, 0);
            triShape.lineTo(0.125 * s, 0);
            triShape.lineTo(0, -0.1 * s);
            triShape.closePath();
            const tri = new THREE.Mesh(new THREE.ShapeGeometry(triShape), fabricMat);
            tri.position.set(bx, wallH * 0.62 - 0.275 * s, bz);
            tri.rotation.y = rotY;
            group.add(tri);
            // Gold rod
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32 * s, 5), goldMat);
            rod.rotation.z = Math.PI / 2;
            rod.position.set(bx, wallH * 0.62 + 0.275 * s, bz);
            rod.rotation.y = rotY;
            group.add(rod);
            // Gold emblem (diamond shape)
            const embShape = new THREE.Shape();
            embShape.moveTo(0, 0.06 * s);
            embShape.lineTo(0.04 * s, 0);
            embShape.lineTo(0, -0.06 * s);
            embShape.lineTo(-0.04 * s, 0);
            embShape.closePath();
            const emb = new THREE.Mesh(new THREE.ShapeGeometry(embShape), goldMat);
            emb.position.set(bx, wallH * 0.62, bz);
            emb.rotation.y = rotY;
            const offset = 0.005;
            emb.translateZ(offset);
            group.add(emb);
        };

        // Back wall banners (flanking throne)
        addBanner(-0.65, -halfSize + 0.08, 0, 1.1);
        addBanner(0.65, -halfSize + 0.08, 0, 1.1);
        // Left wall banners
        addBanner(-halfSize + 0.08, -0.5, Math.PI / 2);
        addBanner(-halfSize + 0.08, 0.5, Math.PI / 2);
        // Right wall banners
        addBanner(halfSize - 0.08, -0.5, -Math.PI / 2);
        addBanner(halfSize - 0.08, 0.5, -Math.PI / 2);
        // Front wall banners
        addBanner(-0.65, halfSize - 0.08, Math.PI);
        addBanner(0.65, halfSize - 0.08, Math.PI);

        // ═══════════════════════════════════════════════
        // ── CHANDELIER (large golden chandelier, center) ──
        // ═══════════════════════════════════════════════
        const chanY = wallH - 0.15;
        // Chain from ceiling
        const chanChain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4), goldMat);
        chanChain.position.set(0, chanY + 0.15, 0.15);
        group.add(chanChain);
        // Central hub
        const chanHub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), goldMat);
        chanHub.position.set(0, chanY, 0.15);
        group.add(chanHub);
        // Arms and candles (8 arms)
        for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2;
            const armLen = 0.28;
            const ax = Math.cos(angle) * armLen;
            const az = Math.sin(angle) * armLen;
            // Arm
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, armLen, 4), goldMat);
            arm.rotation.z = Math.PI / 2;
            arm.rotation.y = -angle;
            arm.position.set(ax / 2, chanY - 0.02, 0.15 + az / 2);
            group.add(arm);
            // Cup
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.02, 6), goldMat);
            cup.position.set(ax, chanY - 0.03, 0.15 + az);
            group.add(cup);
            // Candle
            const candle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.06, 5),
                new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.8, metalness: 0 })
            );
            candle.position.set(ax, chanY + 0.01, 0.15 + az);
            group.add(candle);
            // Flame
            const flame = new THREE.Mesh(
                new THREE.ConeGeometry(0.008, 0.025, 4),
                new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true, opacity: 0.85 })
            );
            flame.position.set(ax, chanY + 0.055, 0.15 + az);
            group.add(flame);
        }
        // Ring connecting arms
        const chanRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.008, 6, 24), goldMat
        );
        chanRing.rotation.x = Math.PI / 2;
        chanRing.position.set(0, chanY - 0.03, 0.15);
        group.add(chanRing);
        // Chandelier light
        const chanLight = new THREE.PointLight(0xFFDD88, 0.7, 5);
        chanLight.position.set(0, chanY - 0.05, 0.15);
        group.add(chanLight);

        // ═══════════════════════════════════════════════
        // ── GOLD PILLARS (flanking throne) ──
        // ═══════════════════════════════════════════════
        [-0.45, 0.45].forEach(px => {
            // Marble column
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, wallH * 0.75, 10), marbleMat);
            col.position.set(px, wallH * 0.375, tz - 0.05);
            col.castShadow = true;
            group.add(col);
            // Gold base
            const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), goldMat);
            colBase.position.set(px, 0.03, tz - 0.05);
            group.add(colBase);
            // Gold capital (top)
            const colCap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.055, 0.06, 10), goldMat);
            colCap.position.set(px, wallH * 0.75 + 0.03, tz - 0.05);
            group.add(colCap);
            // Decorative gold ring on column
            const colRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 12), goldMat);
            colRing.rotation.x = Math.PI / 2;
            colRing.position.set(px, wallH * 0.5, tz - 0.05);
            group.add(colRing);
        });

        // ═══════════════════════════════════════════════
        // ── ROYAL GUARD ARMOR STANDS (flanking entrance) ──
        // ═══════════════════════════════════════════════
        [-0.55, 0.55].forEach(gx => {
            const gz = halfSize - 0.4;
            const armorMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.35, metalness: 0.75 });
            // Base
            const aBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 8), darkWoodMat);
            aBase.position.set(gx, 0.02, gz);
            group.add(aBase);
            // Boots
            [-0.03, 0.03].forEach(bx => {
                const boot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.07), armorMat);
                boot.position.set(gx + bx, 0.09, gz);
                group.add(boot);
            });
            // Legs
            const legs = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.08), armorMat);
            legs.position.set(gx, 0.24, gz);
            group.add(legs);
            // Torso
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.1), armorMat);
            torso.position.set(gx, 0.45, gz);
            torso.castShadow = true;
            group.add(torso);
            // Gold chest emblem
            const chestEmb = new THREE.Mesh(new THREE.CircleGeometry(0.03, 6), goldMat);
            chestEmb.position.set(gx, 0.47, gz - 0.051);
            group.add(chestEmb);
            // Pauldrons
            [-0.12, 0.12].forEach(px => {
                const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), armorMat);
                p.scale.set(1.2, 0.7, 1);
                p.position.set(gx + px, 0.52, gz);
                group.add(p);
            });
            // Helmet
            const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), armorMat);
            helmet.scale.y = 1.1;
            helmet.position.set(gx, 0.62, gz);
            group.add(helmet);
            // Visor slit
            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.01, 0.02),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            visor.position.set(gx, 0.62, gz - 0.05);
            group.add(visor);
            // Plume (gold)
            const plume = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.12, 4), goldMat);
            plume.position.set(gx, 0.72, gz + 0.01);
            plume.rotation.x = 0.15;
            group.add(plume);
            // Spear / halberd
            const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 4), woodMat);
            spear.position.set(gx + (gx > 0 ? 0.1 : -0.1), 0.45, gz);
            group.add(spear);
            const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), armorMat);
            spearHead.position.set(gx + (gx > 0 ? 0.1 : -0.1), 0.94, gz);
            group.add(spearHead);
        });

        // ═══════════════════════════════════════════════
        // ── GOLD WALL SCONCES WITH CANDLES ──
        // ═══════════════════════════════════════════════
        const addSconce = (sx, sz, rotY) => {
            // Bracket
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.1), goldMat);
            bracket.position.set(sx, wallH * 0.55, sz);
            bracket.rotation.y = rotY;
            group.add(bracket);
            // Cup
            const sCup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.025, 6), goldMat);
            const fwd = 0.08;
            const fx = sx + Math.sin(rotY) * fwd;
            const fz = sz - Math.cos(rotY) * fwd;
            sCup.position.set(fx, wallH * 0.55, fz);
            group.add(sCup);
            // Candle
            const sCandle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.06, 5),
                new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.8 })
            );
            sCandle.position.set(fx, wallH * 0.55 + 0.04, fz);
            group.add(sCandle);
            // Flame
            const sFlame = new THREE.Mesh(
                new THREE.ConeGeometry(0.008, 0.02, 4),
                new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true, opacity: 0.8 })
            );
            sFlame.position.set(fx, wallH * 0.55 + 0.08, fz);
            group.add(sFlame);
        };
        // Sconces on all walls
        addSconce(-halfSize + 0.08, 0, Math.PI / 2);
        addSconce(halfSize - 0.08, 0, -Math.PI / 2);
        addSconce(0, -halfSize + 0.08, 0);
        addSconce(-0.8, -halfSize + 0.08, 0);
        addSconce(0.8, -halfSize + 0.08, 0);

        // ═══════════════════════════════════════════════
        // ── CROWN ON CUSHION (beside throne) ──
        // ═══════════════════════════════════════════════
        const crX = -0.6, crZ = tz + 0.15;
        // Pedestal
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.45, 8), marbleMat);
        ped.position.set(crX, 0.225, crZ);
        ped.castShadow = true;
        group.add(ped);
        // Gold ring on pedestal
        const pedRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 12), goldMat);
        pedRing.rotation.x = Math.PI / 2;
        pedRing.position.set(crX, 0.35, crZ);
        group.add(pedRing);
        // Velvet cushion on top
        const crCushion = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), velvetMat);
        crCushion.position.set(crX, 0.47, crZ);
        group.add(crCushion);
        // Crown
        const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), goldMat);
        crownRing.rotation.x = Math.PI / 2;
        crownRing.position.set(crX, 0.52, crZ);
        group.add(crownRing);
        // Crown points
        for (let cp = 0; cp < 5; cp++) {
            const ang = (cp / 5) * Math.PI * 2;
            const cpx = crX + Math.cos(ang) * 0.055;
            const cpz = crZ + Math.sin(ang) * 0.055;
            const point = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 4), goldMat);
            point.position.set(cpx, 0.55, cpz);
            group.add(point);
            // Tiny jewel
            if (cp % 2 === 0) {
                const j = new THREE.Mesh(
                    new THREE.SphereGeometry(0.008, 4, 4),
                    new THREE.MeshStandardMaterial({ color: 0xFF0033, roughness: 0.15, metalness: 0.2, emissive: 0x330000, emissiveIntensity: 0.5 })
                );
                j.position.set(cpx, 0.53, cpz);
                group.add(j);
            }
        }

        // ═══════════════════════════════════════════════
        // ── ROYAL SCEPTER (other side of throne) ──
        // ═══════════════════════════════════════════════
        const scX = 0.6, scZ = tz + 0.15;
        // Scepter stand
        const scStand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), marbleMat);
        scStand.position.set(scX, 0.25, scZ);
        scStand.castShadow = true;
        group.add(scStand);
        const scRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 6, 12), goldMat);
        scRing.rotation.x = Math.PI / 2;
        scRing.position.set(scX, 0.4, scZ);
        group.add(scRing);
        // Scepter (leaning)
        const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.55, 5), goldMat);
        scepter.position.set(scX, 0.65, scZ);
        scepter.rotation.z = 0.15;
        scepter.rotation.x = -0.1;
        group.add(scepter);
        // Orb on top
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.15, metalness: 0.9, emissive: 0x332200, emissiveIntensity: 0.3 })
        );
        orb.position.set(scX + 0.04, 0.93, scZ - 0.05);
        group.add(orb);

        // ═══════════════════════════════════════════════
        // ── GOLD DECORATIVE TRIM on walls ──
        // ═══════════════════════════════════════════════
        // Horizontal gold bands at wall mid-height
        [
            { pos: [0, wallH * 0.45, -halfSize + 0.04], size: [halfSize * 2 - 0.2, 0.02, 0.01] },
            { pos: [0, wallH * 0.45, halfSize - 0.04], size: [halfSize * 2 - 0.2, 0.02, 0.01] },
            { pos: [-halfSize + 0.04, wallH * 0.45, 0], size: [0.01, 0.02, halfSize * 2 - 0.2] },
            { pos: [halfSize - 0.04, wallH * 0.45, 0], size: [0.01, 0.02, halfSize * 2 - 0.2] },
        ].forEach(({ pos, size }) => {
            const trim = new THREE.Mesh(new THREE.BoxGeometry(...size), goldMat);
            trim.position.set(...pos);
            group.add(trim);
        });

        // ═══════════════════════════════════════════════
        // ── TREASURE CHEST (near right wall) ──
        // ═══════════════════════════════════════════════
        const chX = halfSize - 0.35, chZ = -0.4;
        // Chest body
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.2), darkWoodMat);
        chest.position.set(chX, 0.09, chZ);
        chest.castShadow = true;
        group.add(chest);
        // Chest lid (half cylinder)
        const lidGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8, 1, false, 0, Math.PI);
        const lid = new THREE.Mesh(lidGeo, darkWoodMat);
        lid.rotation.z = Math.PI / 2;
        lid.rotation.y = Math.PI / 2;
        lid.position.set(chX, 0.18, chZ);
        group.add(lid);
        // Gold bands on chest
        [-0.1, 0, 0.1].forEach(bOff => {
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.01), goldMat);
            band.position.set(chX, 0.1, chZ + bOff);
            group.add(band);
        });
        // Gold lock
        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), goldMat);
        lock.position.set(chX, 0.13, chZ + 0.11);
        group.add(lock);
        // Gold coins spilling out (small spheres)
        [[0.12, 0.02, 0.12], [-0.08, 0.01, 0.14], [0.05, 0.015, 0.16], [0.15, 0.01, 0.05],
         [-0.12, 0.01, 0.08], [0.0, 0.01, 0.18]].forEach(([cx, cy, cz]) => {
            const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.004, 8), goldMat);
            coin.rotation.x = Math.random() * 0.5;
            coin.rotation.z = Math.random() * Math.PI;
            coin.position.set(chX + cx, cy, chZ + cz);
            group.add(coin);
        });

        // ═══════════════════════════════════════════════
        // ── WARM AMBIENT LIGHTING ──
        // ═══════════════════════════════════════════════
        const throneSpot = new THREE.PointLight(0xFFDD88, 0.5, 4);
        throneSpot.position.set(tx, wallH * 0.8, tz + 0.5);
        group.add(throneSpot);
    },

    _buildGarden(group, halfSize) {
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x2d7a1e, roughness: 0.85, metalness: 0
        });
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x5a3a1a, roughness: 0.9, metalness: 0
        });
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x888888, roughness: 0.8, metalness: 0.1
        });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x3388aa, roughness: 0.2, metalness: 0.3,
            transparent: true, opacity: 0.7
        });
        const flowerColors = [0xcc3333, 0xddaa22, 0xcc55cc, 0xffffff];

        // Central fountain — stone basin
        const basinGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.25, 16);
        const basin = new THREE.Mesh(basinGeo, stoneMat);
        basin.position.y = 0.13;
        basin.castShadow = true;
        group.add(basin);

        // Water surface
        const waterGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = 0.24;
        group.add(water);

        // Fountain pillar
        const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
        const pillar = new THREE.Mesh(pillarGeo, stoneMat);
        pillar.position.y = 0.45;
        pillar.castShadow = true;
        group.add(pillar);

        // Fountain top
        const topGeo = new THREE.SphereGeometry(0.1, 8, 6);
        const topMesh = new THREE.Mesh(topGeo, stoneMat);
        topMesh.position.y = 0.72;
        group.add(topMesh);

        // Trees at corners
        const treePositions = [
            [-halfSize + 0.4, -halfSize + 0.4],
            [halfSize - 0.4, -halfSize + 0.4],
            [-halfSize + 0.4, halfSize - 0.4],
            [halfSize - 0.4, halfSize - 0.4]
        ];
        treePositions.forEach(([tx, tz]) => {
            // Trunk
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6), trunkMat
            );
            trunk.position.set(tx, 0.3, tz);
            trunk.castShadow = true;
            group.add(trunk);

            // Canopy (layered spheres)
            const canopy = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 8, 6), leafMat
            );
            canopy.position.set(tx, 0.75, tz);
            canopy.castShadow = true;
            group.add(canopy);

            const canopy2 = new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 8, 6), leafMat.clone()
            );
            canopy2.material.color.set(0x3a8a28);
            canopy2.position.set(tx + 0.1, 0.95, tz - 0.05);
            group.add(canopy2);
        });

        // Hedges along sides (low boxes)
        const hedgeMat = new THREE.MeshStandardMaterial({
            color: 0x1a5a12, roughness: 0.9, metalness: 0
        });
        const hedgePositions = [
            { x: 0, z: -halfSize + 0.15, sx: halfSize * 1.2, sz: 0.2 },
            { x: 0, z: halfSize - 0.15, sx: halfSize * 1.2, sz: 0.2 },
            { x: -halfSize + 0.15, z: 0, sx: 0.2, sz: halfSize * 1.2 },
            { x: halfSize - 0.15, z: 0, sx: 0.2, sz: halfSize * 1.2 }
        ];
        hedgePositions.forEach(h => {
            const hedge = new THREE.Mesh(
                new THREE.BoxGeometry(h.sx, 0.3, h.sz), hedgeMat
            );
            hedge.position.set(h.x, 0.15, h.z);
            hedge.castShadow = true;
            group.add(hedge);
        });

        // Small flower bushes scattered
        const bushPositions = [
            [0.6, 0.5], [-0.6, 0.5], [0.6, -0.5], [-0.6, -0.5],
            [0, 0.8], [0, -0.8]
        ];
        bushPositions.forEach(([bx, bz], idx) => {
            const bushMat = new THREE.MeshStandardMaterial({
                color: flowerColors[idx % flowerColors.length],
                roughness: 0.8, metalness: 0
            });
            const bush = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 6, 5), bushMat
            );
            bush.position.set(bx, 0.1, bz);
            group.add(bush);

            // Green base
            const base = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 6, 5), leafMat
            );
            base.position.set(bx, 0.06, bz);
            group.add(base);
        });
    },

    _buildChapel(group, halfSize, wallH) {
        // Room 3: doors on back(-z), right(+x), front(+z). Left wall(-x) is free → altar
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85, metalness: 0.05 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85, metalness: 0.1 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.6, metalness: 0.05 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.35, metalness: 0.5 });
        const carpetMat = new THREE.MeshStandardMaterial({ color: 0x8a1a1a, roughness: 0.95, metalness: 0 });
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xeee8d0, roughness: 0.6, metalness: 0 });
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFCC44, transparent: true, opacity: 0.85 });

        // ── Stained glass window on left wall ──
        // Frame
        const frameW = 0.06, frameH = wallH * 0.65, frameD = 0.7;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, frameD), stoneMat);
        frame.position.set(-halfSize + 0.02, wallH * 0.5, 0);
        group.add(frame);

        // Glass panels (colored translucent)
        const glassColors = [0x2244aa, 0xcc2222, 0x22aa44, 0xddaa22, 0x8822aa, 0x2288aa];
        const panelH = frameH / 3;
        const panelW = frameD / 2 - 0.04;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const glassMat = new THREE.MeshBasicMaterial({
                    color: glassColors[row * 2 + col],
                    transparent: true, opacity: 0.55, side: THREE.DoubleSide
                });
                const pane = new THREE.Mesh(new THREE.PlaneGeometry(panelW, panelH - 0.03), glassMat);
                pane.rotation.y = Math.PI / 2;
                pane.position.set(
                    -halfSize + 0.04,
                    wallH * 0.22 + row * panelH + panelH / 2,
                    (col - 0.5) * panelW + (col === 0 ? -0.01 : 0.01)
                );
                group.add(pane);
            }
        }

        // Arched top for window (half cylinder)
        const archGeo = new THREE.CylinderGeometry(frameD / 2, frameD / 2, frameW, 12, 1, false, 0, Math.PI);
        const arch = new THREE.Mesh(archGeo, stoneMat);
        arch.rotation.z = Math.PI / 2;
        arch.rotation.y = Math.PI / 2;
        arch.position.set(-halfSize + 0.02, wallH * 0.5 + frameH / 2, 0);
        group.add(arch);

        // Light coming through window
        const windowLight = new THREE.SpotLight(0xaabbff, 0.6, 6, Math.PI / 5, 0.8, 1);
        windowLight.position.set(-halfSize + 0.2, wallH * 0.5, 0);
        windowLight.target.position.set(0.5, 0, 0);
        group.add(windowLight);
        group.add(windowLight.target);

        // ── Altar against left wall ──
        const altarW = 0.7, altarH = 0.5, altarD = 0.35;
        const altar = new THREE.Mesh(new THREE.BoxGeometry(altarD, altarH, altarW), whiteMat);
        altar.position.set(-halfSize + altarD / 2 + 0.12, altarH / 2, 0);
        altar.castShadow = true;
        group.add(altar);

        // Altar cloth (thin gold-trimmed layer on top)
        const cloth = new THREE.Mesh(
            new THREE.BoxGeometry(altarD + 0.06, 0.02, altarW + 0.06), whiteMat
        );
        cloth.position.set(-halfSize + altarD / 2 + 0.12, altarH + 0.01, 0);
        group.add(cloth);

        // Gold cross on altar
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), goldMat);
        crossV.position.set(-halfSize + 0.2, altarH + 0.12, 0);
        group.add(crossV);
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.12), goldMat);
        crossH.position.set(-halfSize + 0.2, altarH + 0.18, 0);
        group.add(crossH);

        // Candles on altar (2 on each side)
        [-0.2, -0.12, 0.12, 0.2].forEach((cz, idx) => {
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 6), candleMat);
            candle.position.set(-halfSize + altarD / 2 + 0.12, altarH + 0.06, cz);
            group.add(candle);
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.025, 4), flameMat);
            flame.position.set(-halfSize + altarD / 2 + 0.12, altarH + 0.12, cz);
            group.add(flame);
        });

        // Altar candle light
        const altarLight = new THREE.PointLight(0xFFDD88, 0.4, 3);
        altarLight.position.set(-halfSize + 0.3, altarH + 0.3, 0);
        group.add(altarLight);

        // ── Central carpet / runner ──
        // Runs from front door (+z) toward altar (-x)
        // First: aisle section from center toward altar
        const carpet1 = new THREE.Mesh(
            new THREE.PlaneGeometry(halfSize * 1.2, 0.45),
            carpetMat
        );
        carpet1.rotation.x = -Math.PI / 2;
        carpet1.rotation.z = Math.PI / 2;
        carpet1.position.set(-halfSize / 2 + 0.15, 0.02, 0);
        group.add(carpet1);

        // Carpet strip from front door
        const carpet2 = new THREE.Mesh(
            new THREE.PlaneGeometry(halfSize * 0.8, 0.45),
            carpetMat
        );
        carpet2.rotation.x = -Math.PI / 2;
        carpet2.position.set(0.1, 0.02, halfSize / 2);
        group.add(carpet2);

        // Gold carpet border (thin strips)
        const borderMat = new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.7, metalness: 0.2 });
        [[-0.225, 0], [0.225, 0]].forEach(([bOff]) => {
            const border = new THREE.Mesh(new THREE.PlaneGeometry(halfSize * 1.2, 0.03), borderMat);
            border.rotation.x = -Math.PI / 2;
            border.rotation.z = Math.PI / 2;
            border.position.set(-halfSize / 2 + 0.15, 0.025, bOff);
            group.add(border);
        });

        // ── Pews (benches) — 2 rows on each side of aisle ──
        const benchW = 0.6, benchD = 0.18, benchH = 0.22, benchBackH = 0.38;
        const benchPositions = [
            // Right side of aisle (z > 0)
            { x: 0.1, z: 0.55 }, { x: 0.6, z: 0.55 },
            // Left side of aisle (z < 0)
            { x: 0.1, z: -0.55 }, { x: 0.6, z: -0.55 }
        ];
        benchPositions.forEach(bp => {
            // Seat
            const seat = new THREE.Mesh(new THREE.BoxGeometry(benchD, 0.03, benchW), woodMat);
            seat.position.set(bp.x, benchH, bp.z);
            seat.castShadow = true;
            group.add(seat);

            // Legs (simple)
            [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.025, benchH, 0.025), woodMat);
                leg.position.set(
                    bp.x + lx * (benchD / 2 - 0.02),
                    benchH / 2,
                    bp.z + lz * (benchW / 2 - 0.02)
                );
                group.add(leg);
            });

            // Backrest (on the side facing away from altar)
            const backX = bp.x + benchD / 2;
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.025, benchBackH - benchH, benchW), woodMat);
            back.position.set(backX, (benchH + benchBackH) / 2, bp.z);
            group.add(back);
        });

        // ── Holy water font (near front-right door) ──
        const fontBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 8), stoneMat);
        fontBase.position.set(halfSize - 0.3, 0.2, halfSize - 0.3);
        group.add(fontBase);
        const fontBowl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.06, 0.06, 8), stoneMat
        );
        fontBowl.position.set(halfSize - 0.3, 0.42, halfSize - 0.3);
        group.add(fontBowl);

        // ── Candelabra stands on sides ──
        [0.85, -0.85].forEach(cz => {
            const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.55, 6), goldMat);
            stand.position.set(-0.3, 0.275, cz);
            group.add(stand);
            // Candle on top
            const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), candleMat);
            c.position.set(-0.3, 0.6, cz);
            group.add(c);
            const f = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 4), flameMat);
            f.position.set(-0.3, 0.665, cz);
            group.add(f);
        });
    },

    _buildDungeon(group, halfSize, wallH) {
        // Room 8: doors on back(-z → Consejo) and left(-x → Jardines)
        // Free walls: front(+z) and right(+x) — prison cells here
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.55, metalness: 0.65 });
        const rustMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.7, metalness: 0.4 });
        const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.5 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a42, roughness: 0.95, metalness: 0.05 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2a15, roughness: 0.9, metalness: 0.02 });
        const strawMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3a, roughness: 0.95, metalness: 0 });
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.75, metalness: 0.05 });
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.5, metalness: 0.6 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x2a3a2a, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.5
        });
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.98, metalness: 0 });

        // ── Helper: chain hanging from wall ──
        const addChain = (cx, cy, cz, links, hangDown) => {
            const linkH = 0.03;
            for (let i = 0; i < links; i++) {
                const link = new THREE.Mesh(
                    new THREE.TorusGeometry(0.015, 0.004, 4, 6), chainMat
                );
                link.position.set(cx, cy - i * linkH * 0.8, cz);
                link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
                group.add(link);
            }
            if (hangDown) {
                // Shackle at the end
                const shackle = new THREE.Mesh(
                    new THREE.TorusGeometry(0.03, 0.006, 4, 8, Math.PI), darkIronMat
                );
                shackle.position.set(cx, cy - links * linkH * 0.8, cz);
                group.add(shackle);
            }
        };

        // ── Helper: build a full cage (bars on all open sides) ──
        // cx,cz = cage center; cw,cd = cage width(x), depth(z)
        // openSides: array of sides that are room walls (no bars needed there): 'right','left','front','back'
        const addCage = (cx, cz, cw, cd, openSides) => {
            const barH = wallH * 0.85;
            const barR = 0.012;
            const crossR = 0.009;
            const step = 0.09;

            const sides = [
                { key: 'front', axis: 'x', pos: [cx, barH / 2, cz + cd / 2], len: cw },
                { key: 'back',  axis: 'x', pos: [cx, barH / 2, cz - cd / 2], len: cw },
                { key: 'left',  axis: 'z', pos: [cx - cw / 2, barH / 2, cz], len: cd },
                { key: 'right', axis: 'z', pos: [cx + cw / 2, barH / 2, cz], len: cd },
            ];

            sides.forEach(({ key, axis, pos, len }) => {
                if (openSides.includes(key)) return; // skip room walls
                const count = Math.floor(len / step);
                const realStep = len / count;
                for (let b = 0; b <= count; b++) {
                    const off = -len / 2 + b * realStep;
                    const bar = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, barH, 5), ironMat);
                    if (axis === 'x') bar.position.set(pos[0] + off, barH / 2, pos[2]);
                    else               bar.position.set(pos[0], barH / 2, pos[2] + off);
                    bar.castShadow = true;
                    group.add(bar);
                }
                // Horizontal cross bars (mid + top)
                [barH * 0.35, barH * 0.92].forEach(hh => {
                    const cross = new THREE.Mesh(new THREE.CylinderGeometry(crossR, crossR, len, 5), ironMat);
                    if (axis === 'x') {
                        cross.rotation.z = Math.PI / 2;
                        cross.position.set(pos[0], hh, pos[2]);
                    } else {
                        cross.rotation.x = Math.PI / 2;
                        cross.position.set(pos[0], hh, pos[2]);
                    }
                    group.add(cross);
                });
            });
        };

        // ── Cell 1 — right-back corner ──
        const c1x = halfSize - 0.32, c1z = -halfSize + 0.35;
        addCage(c1x, c1z, 0.55, 0.6, ['right', 'back']); // right & back = room walls

        // Contents: straw bed + bucket
        const straw1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.4), strawMat);
        straw1.position.set(c1x + 0.05, 0.015, c1z - 0.05);
        group.add(straw1);
        const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.09, 8, 1, true), woodMat);
        bucket.position.set(c1x - 0.15, 0.045, c1z + 0.15);
        group.add(bucket);

        // ── Cell 2 — right-front corner ──
        const c2x = halfSize - 0.32, c2z = halfSize - 0.35;
        addCage(c2x, c2z, 0.55, 0.6, ['right', 'front']); // right & front = room walls

        // Contents: straw + chains
        const straw2 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.3), strawMat);
        straw2.rotation.x = -Math.PI / 2;
        straw2.position.set(c2x + 0.05, 0.015, c2z + 0.05);
        group.add(straw2);
        addChain(c2x + 0.2, wallH * 0.7, c2z + 0.18, 8, true);
        addChain(c2x + 0.2, wallH * 0.7, c2z - 0.1, 8, true);

        // ── Cell 3 — front-left area ──
        const c3x = -0.5, c3z = halfSize - 0.3;
        addCage(c3x, c3z, 0.55, 0.5, ['front']); // front = room wall

        // Contents: skull + bones + chain
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.035, 7, 7), boneMat);
        skull.scale.set(1, 0.85, 0.9);
        skull.position.set(c3x, 0.035, c3z + 0.05);
        group.add(skull);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        [[-0.01, 0.008], [0.01, 0.008]].forEach(([ex, ez]) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.007, 4, 4), eyeMat);
            eye.position.set(c3x + ex, 0.042, c3z + 0.05 + ez);
            group.add(eye);
        });
        [[-0.15, -0.1], [0.1, 0.12], [-0.05, -0.18]].forEach(([bx, bz], i) => {
            const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.09 + i * 0.02, 4), boneMat);
            bone.rotation.z = Math.PI / 2 + i * 0.4;
            bone.position.set(c3x + bx, 0.01, c3z + bz);
            group.add(bone);
        });
        addChain(c3x + 0.15, wallH * 0.65, c3z + 0.16, 6, true);

        // ── Cell 4 — front-center/right area ──
        const c4x = 0.2, c4z = halfSize - 0.3;
        addCage(c4x, c4z, 0.55, 0.5, ['front']); // front = room wall

        // Contents: straw + chains + bucket + rat
        const straw4 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.3), strawMat);
        straw4.position.set(c4x + 0.05, 0.012, c4z + 0.02);
        group.add(straw4);
        addChain(c4x - 0.1, wallH * 0.65, c4z + 0.16, 7, true);
        addChain(c4x + 0.2, wallH * 0.7, c4z + 0.16, 9, true);
        const bucket4 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 7, 1, true), woodMat);
        bucket4.position.set(c4x + 0.2, 0.04, c4z - 0.08);
        group.add(bucket4);
        const ratMat4 = new THREE.MeshStandardMaterial({ color: 0x2a2020, roughness: 0.9, metalness: 0 });
        const rat4 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 5), ratMat4);
        rat4.scale.set(1.5, 0.7, 0.8);
        rat4.position.set(c4x - 0.15, 0.014, c4z - 0.1);
        group.add(rat4);

        // ── Chains on back wall (near doors) — decorative ──
        addChain(-0.6, wallH * 0.75, -halfSize + 0.08, 10, true);

        // ── Chains on left wall ──
        addChain(-halfSize + 0.08, wallH * 0.7, 0.4, 7, true);
        addChain(-halfSize + 0.08, wallH * 0.7, -0.3, 9, true);

        // ── Stocks / pillory in center-left area ──
        const stX = -0.35, stZ = -0.1;
        // Vertical posts
        [-0.15, 0.15].forEach(off => {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.6, 0.06), woodMat
            );
            post.position.set(stX + off, 0.3, stZ);
            post.castShadow = true;
            group.add(post);
        });
        // Top board with holes
        const topBoard = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.04, 0.12), woodMat
        );
        topBoard.position.set(stX, 0.55, stZ);
        group.add(topBoard);
        // Middle board
        const midBoard = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.04, 0.12), woodMat
        );
        midBoard.position.set(stX, 0.48, stZ);
        group.add(midBoard);
        // Holes (dark circles) for head and hands
        [-0.1, 0, 0.1].forEach(hx => {
            const r = hx === 0 ? 0.03 : 0.02;
            const hole = new THREE.Mesh(
                new THREE.CircleGeometry(r, 8),
                new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })
            );
            hole.rotation.x = -Math.PI / 2;
            hole.position.set(stX + hx, 0.56, stZ);
            group.add(hole);
        });

        // ── Torture rack — back-left area ──
        const rackX = -0.75, rackZ = -0.65;
        // Frame (wooden A-frame)
        const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.25), woodMat);
        rackBase.position.set(rackX, 0.02, rackZ);
        group.add(rackBase);
        // Upright
        const rackUp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), woodMat);
        rackUp.position.set(rackX, 0.27, rackZ);
        group.add(rackUp);
        // Cross beam
        const rackCross = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.04), woodMat);
        rackCross.position.set(rackX, 0.45, rackZ);
        group.add(rackCross);
        // Iron hooks
        [-0.12, 0.12].forEach(hOff => {
            const hook = new THREE.Mesh(
                new THREE.TorusGeometry(0.02, 0.005, 4, 6, Math.PI), darkIronMat
            );
            hook.position.set(rackX + hOff, 0.42, rackZ);
            group.add(hook);
        });
        // Rope coil hanging from rack
        const rope = new THREE.Mesh(
            new THREE.TorusGeometry(0.04, 0.008, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.95, metalness: 0 })
        );
        rope.position.set(rackX + 0.18, 0.35, rackZ);
        rope.rotation.y = 0.5;
        group.add(rope);

        // ── Puddles of dirty water on floor ──
        [[-0.2, 0.5, 0.2], [0.3, -0.4, 0.15], [-0.6, 0.2, 0.12], [0.15, 0.3, 0.1]].forEach(([px, pz, pr]) => {
            const puddle = new THREE.Mesh(new THREE.CircleGeometry(pr, 8), waterMat);
            puddle.rotation.x = -Math.PI / 2;
            puddle.position.set(px, 0.013, pz);
            group.add(puddle);
        });

        // ── Dirt patches on floor ──
        [[0.2, 0.1, 0.25], [-0.4, -0.5, 0.2], [0.5, 0.6, 0.18], [-0.1, 0.7, 0.15],
         [0.6, -0.3, 0.2], [-0.7, 0.5, 0.12]].forEach(([dx, dz, dr]) => {
            const dirt = new THREE.Mesh(new THREE.CircleGeometry(dr, 6), dirtMat);
            dirt.rotation.x = -Math.PI / 2;
            dirt.rotation.z = Math.random() * Math.PI;
            dirt.position.set(dx, 0.012, dz);
            group.add(dirt);
        });

        // ── Scattered straw on main floor ──
        [[-0.1, 0.3], [0.4, -0.2], [-0.5, -0.3], [0.1, 0.7], [-0.3, 0.6]].forEach(([sx, sz]) => {
            const straw = new THREE.Mesh(
                new THREE.PlaneGeometry(0.15 + Math.random() * 0.1, 0.08 + Math.random() * 0.06), strawMat
            );
            straw.rotation.x = -Math.PI / 2;
            straw.rotation.z = Math.random() * Math.PI;
            straw.position.set(sx, 0.014, sz);
            group.add(straw);
        });

        // ── Iron maiden (center-right area) ──
        const imX = 0.25, imZ = 0.0;
        // Body (tall box)
        const imBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.18), darkIronMat);
        imBody.position.set(imX, 0.3, imZ);
        imBody.castShadow = true;
        group.add(imBody);
        // Roof (triangle top)
        const imRoof = new THREE.Mesh(
            new THREE.ConeGeometry(0.16, 0.15, 4), darkIronMat
        );
        imRoof.rotation.y = Math.PI / 4;
        imRoof.position.set(imX, 0.68, imZ);
        group.add(imRoof);
        // Door line (seam)
        const imSeam = new THREE.Mesh(
            new THREE.BoxGeometry(0.005, 0.5, 0.19),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        imSeam.position.set(imX, 0.28, imZ - 0.09);
        group.add(imSeam);
        // Handle
        const imHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.02, 0.02), rustMat
        );
        imHandle.position.set(imX + 0.05, 0.35, imZ - 0.1);
        group.add(imHandle);

        // ── Weapon/tool rack on left wall (whips, branding irons) ──
        const toolZ = 0.0;
        const toolX = -halfSize + 0.08;
        // Rack plank
        const toolRack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.6), woodMat);
        toolRack.position.set(toolX, 0.6, toolZ);
        group.add(toolRack);
        // Hooks with tools
        // Branding iron
        const brand = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 4), ironMat);
        brand.position.set(toolX + 0.02, 0.45, toolZ - 0.15);
        group.add(brand);
        const brandTip = new THREE.Mesh(new THREE.CircleGeometry(0.02, 5), rustMat);
        brandTip.position.set(toolX + 0.02, 0.32, toolZ - 0.15);
        brandTip.rotation.x = Math.PI / 2;
        group.add(brandTip);
        // Whip
        const whipHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.12, 4), woodMat);
        whipHandle.position.set(toolX + 0.02, 0.52, toolZ + 0.1);
        group.add(whipHandle);
        const whipLash = new THREE.Mesh(
            new THREE.CylinderGeometry(0.003, 0.003, 0.2, 3),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
        );
        whipLash.rotation.z = 0.3;
        whipLash.position.set(toolX + 0.04, 0.36, toolZ + 0.1);
        group.add(whipLash);
        // Iron tongs
        const tong1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 3), ironMat);
        tong1.rotation.z = 0.05;
        tong1.position.set(toolX + 0.02, 0.48, toolZ + 0.25);
        group.add(tong1);
        const tong2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 3), ironMat);
        tong2.rotation.z = -0.05;
        tong2.position.set(toolX + 0.02, 0.48, toolZ + 0.27);
        group.add(tong2);

        // ── Rats (small dark shapes on floor) ──
        [[0.15, 0.55], [-0.3, -0.45], [0.55, 0.15]].forEach(([rx, rz]) => {
            const ratMat = new THREE.MeshStandardMaterial({ color: 0x2a2020, roughness: 0.9, metalness: 0 });
            // Body
            const ratBody = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 5), ratMat);
            ratBody.scale.set(1.5, 0.7, 0.8);
            ratBody.position.set(rx, 0.015, rz);
            group.add(ratBody);
            // Tail
            const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.001, 0.05, 3), ratMat);
            tail.rotation.z = Math.PI / 3;
            tail.position.set(rx + 0.03, 0.015, rz);
            group.add(tail);
        });

        // ── Dim torch — single, flickering (dungeon is dark) ──
        const torchX = -halfSize + 0.08, torchZ = -halfSize + 0.3;
        const torchBracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.1), ironMat);
        torchBracket.position.set(torchX, wallH * 0.6, torchZ);
        group.add(torchBracket);
        const torchStick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.012, 0.25, 4), woodMat
        );
        torchStick.position.set(torchX + 0.06, wallH * 0.6, torchZ);
        group.add(torchStick);
        const torchFlame = new THREE.Mesh(
            new THREE.ConeGeometry(0.03, 0.06, 5),
            new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.7 })
        );
        torchFlame.position.set(torchX + 0.06, wallH * 0.6 + 0.15, torchZ);
        group.add(torchFlame);
        // Dim warm light
        const dungeonLight = new THREE.PointLight(0xFF6622, 0.35, 4);
        dungeonLight.position.set(torchX + 0.1, wallH * 0.7, torchZ);
        group.add(dungeonLight);
    },

    _buildCouncil(group, halfSize, wallH) {
        // Room 5: doors on back(-z → Armería), left(-x → Trono), front(+z → Mazmorras)
        // Free wall: right(+x) only — banners here + parts of other walls near corners
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.9, metalness: 0.02 });
        const richWoodMat = new THREE.MeshStandardMaterial({ color: 0x6a3a18, roughness: 0.75, metalness: 0.08 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.6 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.35, metalness: 0.5 });
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.85, metalness: 0.03 });
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xd8c89a, roughness: 0.9, metalness: 0 });
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xeee8d0, roughness: 0.6, metalness: 0 });
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFCC44, transparent: true, opacity: 0.85 });

        // Banner colors for each faction/house
        const bannerColors = [
            0x8a1a1a, 0x1a2a6a, 0x2a5a1a, 0x6a4a1a,
            0x4a1a5a, 0x1a5a5a, 0x5a1a3a, 0x3a3a1a
        ];

        // ── Round table — center ──
        const tableR = 0.55;
        const tableLegH = 0.3;
        const tableTopH = 0.04;
        const tX = 0, tZ = 0;

        // Table top (circular, rich wood)
        const tableTop = new THREE.Mesh(
            new THREE.CylinderGeometry(tableR, tableR - 0.02, tableTopH, 20), richWoodMat
        );
        tableTop.position.set(tX, tableLegH + tableTopH / 2, tZ);
        tableTop.castShadow = true;
        group.add(tableTop);

        // Table edge trim (gold ring)
        const edgeTrim = new THREE.Mesh(
            new THREE.TorusGeometry(tableR, 0.008, 4, 24), goldMat
        );
        edgeTrim.rotation.x = Math.PI / 2;
        edgeTrim.position.set(tX, tableLegH + tableTopH, tZ);
        group.add(edgeTrim);

        // Central pedestal (thick turned column)
        const pedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, tableLegH, 8), darkWoodMat
        );
        pedestal.position.set(tX, tableLegH / 2, tZ);
        group.add(pedestal);

        // 4 feet spreading from pedestal base
        for (let f = 0; f < 4; f++) {
            const angle = (f / 4) * Math.PI * 2 + Math.PI / 4;
            const foot = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 0.025, 0.05), darkWoodMat
            );
            foot.position.set(
                tX + Math.cos(angle) * 0.12,
                0.013,
                tZ + Math.sin(angle) * 0.12
            );
            foot.rotation.y = -angle;
            group.add(foot);
        }

        const dtY = tableLegH + tableTopH;

        // ── Items on table ──
        // Large map/document in center
        const map = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), paperMat);
        map.rotation.x = -Math.PI / 2;
        map.rotation.z = 0.1;
        map.position.set(tX, dtY + 0.003, tZ);
        group.add(map);
        // Map darker border to simulate aged parchment
        const mapBorder = new THREE.Mesh(
            new THREE.RingGeometry(0.18, 0.26, 4),
            new THREE.MeshStandardMaterial({ color: 0xb8a878, roughness: 0.9, metalness: 0, side: THREE.DoubleSide })
        );
        mapBorder.rotation.x = -Math.PI / 2;
        mapBorder.rotation.z = 0.85;
        mapBorder.position.set(tX, dtY + 0.004, tZ);
        group.add(mapBorder);

        // Candelabra in center of table (tall, 5-arm)
        const candBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.02, 8), goldMat);
        candBase.position.set(tX, dtY + 0.01, tZ);
        group.add(candBase);
        const candStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.22, 6), goldMat);
        candStem.position.set(tX, dtY + 0.12, tZ);
        group.add(candStem);
        // 5 arms with candles
        for (let a = 0; a < 5; a++) {
            const angle = (a / 5) * Math.PI * 2;
            const armLen = 0.07;
            const armX = tX + Math.cos(angle) * armLen;
            const armZ = tZ + Math.sin(angle) * armLen;
            const armY = dtY + 0.22;
            // Arm
            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.004, 0.004, armLen, 4), goldMat
            );
            arm.rotation.z = Math.PI / 2;
            arm.rotation.y = -angle;
            arm.position.set(tX + Math.cos(angle) * armLen / 2, armY, tZ + Math.sin(angle) * armLen / 2);
            group.add(arm);
            // Cup
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.008, 5), goldMat);
            cup.position.set(armX, armY + 0.004, armZ);
            group.add(cup);
            // Candle
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.05, 5), candleMat);
            candle.position.set(armX, armY + 0.033, armZ);
            group.add(candle);
            // Flame
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.015, 4), flameMat);
            flame.position.set(armX, armY + 0.065, armZ);
            group.add(flame);
        }
        // Candelabra light
        const candLight = new THREE.PointLight(0xFFDD88, 0.5, 4);
        candLight.position.set(tX, dtY + 0.35, tZ);
        group.add(candLight);

        // Goblets scattered around table
        const gobletMat = new THREE.MeshStandardMaterial({ color: 0x8a7530, roughness: 0.4, metalness: 0.4 });
        [[0.25, 0.15], [-0.3, 0.1], [0.1, -0.3], [-0.2, -0.25], [0.35, -0.1]].forEach(([gx, gz]) => {
            // Goblet stem
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.015, 0.04, 6), gobletMat);
            stem.position.set(tX + gx, dtY + 0.02, tZ + gz);
            group.add(stem);
            // Goblet cup
            const gcup = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.01, 0.03, 6), gobletMat);
            gcup.position.set(tX + gx, dtY + 0.055, tZ + gz);
            group.add(gcup);
        });

        // Sealed scroll
        const scrollBody = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 6), paperMat);
        scrollBody.rotation.z = Math.PI / 2;
        scrollBody.position.set(tX - 0.1, dtY + 0.015, tZ + 0.2);
        group.add(scrollBody);
        // Wax seal
        const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.005, 8),
            new THREE.MeshStandardMaterial({ color: 0xaa2222, roughness: 0.5, metalness: 0.1 })
        );
        seal.position.set(tX - 0.1, dtY + 0.018, tZ + 0.2);
        group.add(seal);

        // ── 8 Chairs around the table ──
        const chairDist = 0.8;
        const chairSeatH = 0.24;
        for (let c = 0; c < 8; c++) {
            const angle = (c / 8) * Math.PI * 2;
            const cx = tX + Math.cos(angle) * chairDist;
            const cz = tZ + Math.sin(angle) * chairDist;

            // Seat
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.18), leatherMat);
            seat.position.set(cx, chairSeatH, cz);
            seat.rotation.y = -angle + Math.PI;
            group.add(seat);

            // 4 Legs
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.012, 0.015, chairSeatH - 0.01, 4), darkWoodMat
                );
                const legAngle = -angle + Math.PI;
                const localX = lx * 0.07;
                const localZ = lz * 0.07;
                leg.position.set(
                    cx + Math.cos(legAngle) * localX - Math.sin(legAngle) * localZ,
                    (chairSeatH - 0.01) / 2,
                    cz + Math.sin(legAngle) * localX + Math.cos(legAngle) * localZ
                );
                group.add(leg);
            });

            // High backrest (facing outward from table)
            const backDist = 0.1;
            const backX = cx + Math.cos(angle) * backDist;
            const backZ = cz + Math.sin(angle) * backDist;
            const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.02), darkWoodMat);
            backrest.position.set(backX, chairSeatH + 0.13, backZ);
            backrest.rotation.y = -angle + Math.PI;
            group.add(backrest);

            // Decorative top of backrest (arched)
            const topPiece = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.025), richWoodMat);
            topPiece.position.set(backX, chairSeatH + 0.265, backZ);
            topPiece.rotation.y = -angle + Math.PI;
            group.add(topPiece);
        }

        // ── Banners/Standards ──
        // Helper: hanging banner on wall
        const addBanner = (bx, bz, rotY, color, h) => {
            const bannerMat = new THREE.MeshStandardMaterial({
                color, roughness: 0.85, metalness: 0, side: THREE.DoubleSide
            });
            const bannerW = 0.22, bannerH = h || 0.55;
            // Fabric
            const banner = new THREE.Mesh(new THREE.PlaneGeometry(bannerW, bannerH), bannerMat);
            banner.position.set(bx, wallH * 0.55, bz);
            banner.rotation.y = rotY;
            group.add(banner);
            // Pointed bottom (triangle)
            const pointGeo = new THREE.BufferGeometry();
            const hw = bannerW / 2;
            const ph = 0.1;
            const vertices = new Float32Array([
                -hw, 0, 0, hw, 0, 0, 0, -ph, 0
            ]);
            pointGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            pointGeo.computeVertexNormals();
            const point = new THREE.Mesh(pointGeo, bannerMat);
            point.position.set(bx, wallH * 0.55 - bannerH / 2, bz);
            point.rotation.y = rotY;
            group.add(point);
            // Rod at top
            const rod = new THREE.Mesh(
                new THREE.CylinderGeometry(0.008, 0.008, bannerW + 0.06, 4), goldMat
            );
            rod.rotation.z = Math.PI / 2;
            rod.position.set(bx, wallH * 0.55 + bannerH / 2 + 0.01, bz);
            rod.rotation.y = rotY;
            group.add(rod);
            // Rod finials
            [-1, 1].forEach(side => {
                const finial = new THREE.Mesh(
                    new THREE.SphereGeometry(0.012, 5, 5), goldMat
                );
                const fOff = side * (bannerW / 2 + 0.03);
                if (rotY === 0) {
                    finial.position.set(bx + fOff, wallH * 0.55 + bannerH / 2 + 0.01, bz);
                } else {
                    finial.position.set(bx, wallH * 0.55 + bannerH / 2 + 0.01, bz + fOff);
                }
                group.add(finial);
            });
            // Emblem stripe on banner (horizontal gold strip)
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(bannerW * 0.8, 0.02),
                new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide })
            );
            stripe.position.set(bx, wallH * 0.55 + 0.08, bz + (rotY === 0 ? 0.001 : 0));
            stripe.rotation.y = rotY;
            if (rotY !== 0) stripe.position.x += 0.001;
            group.add(stripe);
            // Small emblem diamond
            const diamond = new THREE.Mesh(
                new THREE.PlaneGeometry(0.06, 0.06),
                new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide })
            );
            diamond.rotation.z = Math.PI / 4;
            diamond.position.set(bx, wallH * 0.5, bz + (rotY === 0 ? 0.001 : 0));
            diamond.rotation.y = rotY;
            if (rotY !== 0) diamond.position.x += 0.001;
            group.add(diamond);
        };

        // Right wall (+x, free) — 3 banners
        addBanner(halfSize - 0.02, -0.5, Math.PI / 2, bannerColors[0]);
        addBanner(halfSize - 0.02, 0.15, Math.PI / 2, bannerColors[1]);
        addBanner(halfSize - 0.02, 0.8, Math.PI / 2, bannerColors[2]);

        // Back wall (-z) — 2 banners (near corners, avoiding door center)
        addBanner(-halfSize + 0.3, -halfSize + 0.02, 0, bannerColors[3]);
        addBanner(halfSize - 0.3, -halfSize + 0.02, 0, bannerColors[4]);

        // Front wall (+z) — 2 banners near corners
        addBanner(-halfSize + 0.3, halfSize - 0.02, Math.PI, bannerColors[5]);
        addBanner(halfSize - 0.3, halfSize - 0.02, Math.PI, bannerColors[6]);

        // Left wall (-x) — 1 banner near back corner
        addBanner(-halfSize + 0.02, -halfSize + 0.35, -Math.PI / 2, bannerColors[7]);

        // ── Circular rug under table ──
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x3a1a2a, roughness: 0.95, metalness: 0 });
        const rug = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(tX, 0.015, tZ);
        group.add(rug);
        // Rug decorative border rings
        [0.92, 0.88].forEach((rr, ri) => {
            const borderMat = new THREE.MeshStandardMaterial({
                color: ri === 0 ? 0x8a6a2a : 0x5a2a3a, roughness: 0.9, metalness: 0.05
            });
            const border = new THREE.Mesh(new THREE.RingGeometry(rr, rr + 0.025, 32), borderMat);
            border.rotation.x = -Math.PI / 2;
            border.position.set(tX, 0.016 + ri * 0.001, tZ);
            group.add(border);
        });
        // Inner medallion on rug
        const medallion = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x6a3a2a, roughness: 0.9, metalness: 0 })
        );
        medallion.rotation.x = -Math.PI / 2;
        medallion.rotation.z = Math.PI / 8;
        medallion.position.set(tX, 0.016, tZ);
        group.add(medallion);

        // ── Wall sconces for lighting ──
        [[halfSize - 0.08, -0.1], [halfSize - 0.08, 0.6]].forEach(([sx, sz]) => {
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.1), ironMat);
            bracket.position.set(sx, wallH * 0.6, sz);
            group.add(bracket);
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.07, 5), candleMat);
            candle.position.set(sx - 0.03, wallH * 0.6 + 0.05, sz);
            group.add(candle);
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.018, 4), flameMat);
            flame.position.set(sx - 0.03, wallH * 0.6 + 0.095, sz);
            group.add(flame);
        });
        const scLight = new THREE.PointLight(0xFFDD88, 0.25, 2.5);
        scLight.position.set(halfSize - 0.15, wallH * 0.7, 0.25);
        group.add(scLight);
    },

    _buildArmory(group, halfSize, wallH) {
        // Room 2: doors on left(-x → Biblioteca) and front(+z → Consejo)
        // Free walls: back(-z) and right(+x) — weapon racks, shields, armor
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.9, metalness: 0.02 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 0.4, metalness: 0.7 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.3, metalness: 0.8 });
        const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.45, metalness: 0.65 });
        const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xCCA832, roughness: 0.35, metalness: 0.5 });
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.85, metalness: 0.03 });
        const redMat = new THREE.MeshStandardMaterial({ color: 0x8a1a1a, roughness: 0.7, metalness: 0.05 });
        const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a2a6a, roughness: 0.7, metalness: 0.05 });
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.5, metalness: 0.6 });

        // ── Helper: sword on wall (blade + guard + grip + pommel) ──
        const addWallSword = (sx, sy, sz, rotZ, rotY, len) => {
            // Blade
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, len, 0.005), steelMat
            );
            blade.position.set(sx, sy, sz);
            blade.rotation.z = rotZ;
            blade.rotation.y = rotY;
            group.add(blade);
            // Guard (cross)
            const guard = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.015, 0.015), goldTrimMat
            );
            const gOff = -len / 2 + 0.01;
            guard.position.set(
                sx + Math.sin(rotZ) * gOff,
                sy - Math.cos(rotZ) * gOff * (rotZ > 0 ? -1 : 1) - (rotZ === 0 ? len / 2 - 0.01 : 0),
                sz
            );
            guard.rotation.z = rotZ;
            guard.rotation.y = rotY;
            group.add(guard);
            // Grip
            const grip = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.01, 0.07, 5), leatherMat
            );
            grip.position.set(sx, sy - len / 2 - 0.035, sz);
            grip.rotation.z = rotZ;
            group.add(grip);
        };

        // ── Helper: shield ──
        const addShield = (sx, sy, sz, rotY, color, shape) => {
            const shieldMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
            let shield;
            if (shape === 'round') {
                shield = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), shieldMat);
                // Boss (center)
                const boss = new THREE.Mesh(
                    new THREE.SphereGeometry(0.035, 8, 6), ironMat
                );
                boss.position.set(sx, sy, sz + 0.01);
                group.add(boss);
                // Metal rim
                const rim = new THREE.Mesh(
                    new THREE.TorusGeometry(0.14, 0.008, 4, 16), ironMat
                );
                rim.position.set(sx, sy, sz + 0.005);
                group.add(rim);
            } else {
                // Kite/heater shield
                const shieldShape = new THREE.Shape();
                shieldShape.moveTo(0, 0.17);
                shieldShape.lineTo(0.12, 0.1);
                shieldShape.lineTo(0.11, -0.05);
                shieldShape.lineTo(0, -0.18);
                shieldShape.lineTo(-0.11, -0.05);
                shieldShape.lineTo(-0.12, 0.1);
                shieldShape.closePath();
                const extrudeSettings = { depth: 0.02, bevelEnabled: false };
                shield = new THREE.Mesh(
                    new THREE.ExtrudeGeometry(shieldShape, extrudeSettings), shieldMat
                );
            }
            shield.position.set(sx, sy, sz);
            shield.rotation.y = rotY;
            group.add(shield);
            return shield;
        };

        // ── Weapon rack on BACK wall (-z) — swords & axes ──
        const rackZ = -halfSize + 0.1;
        // Wooden rack frame (horizontal bars)
        [0.3, 0.65, 0.95].forEach(ry => {
            const bar = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.04, 0.06), darkWoodMat
            );
            bar.position.set(0, ry, rackZ);
            bar.castShadow = true;
            group.add(bar);
        });
        // Vertical supports
        [-1.0, 0, 1.0].forEach(vx => {
            const support = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, wallH * 0.8, 0.06), darkWoodMat
            );
            support.position.set(vx, wallH * 0.4, rackZ);
            group.add(support);
        });

        // Swords on rack (hanging between bars)
        const swordPositions = [-0.8, -0.55, -0.3, -0.05, 0.2, 0.45, 0.7];
        swordPositions.forEach((sx, idx) => {
            const sLen = 0.32 + (idx % 3) * 0.06;
            // Blade
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.018, sLen, 0.004), idx % 4 === 0 ? steelMat : ironMat
            );
            blade.position.set(sx, 0.5, rackZ + 0.04);
            group.add(blade);
            // Guard
            const guard = new THREE.Mesh(
                new THREE.BoxGeometry(0.07, 0.012, 0.012), idx % 2 === 0 ? goldTrimMat : ironMat
            );
            guard.position.set(sx, 0.5 - sLen / 2, rackZ + 0.04);
            group.add(guard);
            // Grip
            const grip = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.008, 0.06, 5), leatherMat
            );
            grip.position.set(sx, 0.5 - sLen / 2 - 0.035, rackZ + 0.04);
            group.add(grip);
            // Pommel
            const pommel = new THREE.Mesh(
                new THREE.SphereGeometry(0.012, 5, 5), idx % 2 === 0 ? goldTrimMat : ironMat
            );
            pommel.position.set(sx, 0.5 - sLen / 2 - 0.07, rackZ + 0.04);
            group.add(pommel);
        });

        // Axes on top rack
        [-0.65, 0.1, 0.65].forEach((ax, idx) => {
            // Handle
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.35, 5), woodMat
            );
            handle.rotation.z = Math.PI / 2;
            handle.position.set(ax, 0.85, rackZ + 0.04);
            group.add(handle);
            // Axe head (wedge shape)
            const headMat = idx % 2 === 0 ? steelMat : darkSteelMat;
            const axeHead = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.1, 0.015), headMat
            );
            axeHead.position.set(ax + 0.16, 0.85, rackZ + 0.04);
            group.add(axeHead);
            // Blade edge (thinner wedge)
            const edge = new THREE.Mesh(
                new THREE.BoxGeometry(0.01, 0.12, 0.008), headMat
            );
            edge.position.set(ax + 0.19, 0.85, rackZ + 0.04);
            group.add(edge);
        });

        // ── Shields on RIGHT wall (+x) — facing inward ──
        const wallX = halfSize - 0.02;
        // Helper: wall-mounted round shield (facing -x, into the room)
        const addWallRoundShield = (sy, sz, color, radius) => {
            const sMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide });
            const shield = new THREE.Mesh(new THREE.CircleGeometry(radius, 12), sMat);
            shield.rotation.y = Math.PI / 2;
            shield.position.set(wallX - 0.01, sy, sz);
            group.add(shield);
            // Boss
            const boss = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.25, 8, 6), ironMat);
            boss.position.set(wallX - 0.02, sy, sz);
            group.add(boss);
            // Rim
            const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 4, 16), ironMat);
            rim.rotation.y = Math.PI / 2;
            rim.position.set(wallX - 0.015, sy, sz);
            group.add(rim);
        };
        // Helper: wall-mounted kite shield
        const addWallKiteShield = (sy, sz, color) => {
            const sMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
            // Build as flat box with tapered shape (simpler than extrude for wall mount)
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.2), sMat);
            body.position.set(wallX - 0.02, sy, sz);
            group.add(body);
            // Bottom point
            const point = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.1, 0.1, 3), sMat);
            point.rotation.z = Math.PI;
            point.rotation.x = Math.PI / 2;
            point.position.set(wallX - 0.02, sy - 0.2, sz);
            group.add(point);
            // Metal trim border
            const border = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, 0.22), goldTrimMat);
            border.position.set(wallX - 0.02, sy + 0.145, sz);
            group.add(border);
            // Cross/emblem
            const cv = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.015), goldTrimMat);
            cv.position.set(wallX - 0.03, sy - 0.02, sz);
            group.add(cv);
            const ch = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.1), goldTrimMat);
            ch.position.set(wallX - 0.03, sy + 0.04, sz);
            group.add(ch);
        };

        addWallRoundShield(0.65, -0.6, 0x8a1a1a, 0.15);
        addWallKiteShield(0.6, -0.1, 0x1a2a6a);
        addWallRoundShield(0.6, 0.4, 0x2a5a1a, 0.13);
        addWallRoundShield(0.9, 0.1, 0x6a5a1a, 0.1);

        // Crossed swords between shields on right wall (facing inward)
        [-0.35, 0.7].forEach(csz => {
            const csy = 0.7;
            [0.4, -0.4].forEach(rot => {
                const sw = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.3, 0.004), steelMat);
                sw.rotation.z = rot;
                sw.position.set(wallX - 0.03, csy, csz);
                group.add(sw);
            });
            // Small guard cross at intersection
            const gd = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.01), goldTrimMat);
            gd.position.set(wallX - 0.03, csy, csz);
            group.add(gd);
        });

        // ── Weapons laid on rack shelves (back wall) ──
        // Daggers on lower shelf (y ≈ 0.3)
        [-0.4, 0.3, 0.8].forEach((dx, i) => {
            const dBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.005, 0.015), steelMat);
            dBlade.position.set(dx, 0.33, rackZ + 0.06);
            dBlade.rotation.y = 0.3 * i;
            group.add(dBlade);
            const dGrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.005, 0.012), leatherMat);
            dGrip.position.set(dx + 0.07, 0.33, rackZ + 0.06);
            dGrip.rotation.y = 0.3 * i;
            group.add(dGrip);
        });
        // War hammer on mid shelf (y ≈ 0.65)
        const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4), woodMat);
        hammerShaft.rotation.z = Math.PI / 2;
        hammerShaft.position.set(-0.6, 0.68, rackZ + 0.06);
        group.add(hammerShaft);
        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.035), darkSteelMat);
        hammerHead.position.set(-0.74, 0.68, rackZ + 0.06);
        group.add(hammerHead);
        // Flail on mid shelf
        const flailHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.18, 4), woodMat);
        flailHandle.rotation.z = Math.PI / 2 + 0.15;
        flailHandle.position.set(0.5, 0.68, rackZ + 0.06);
        group.add(flailHandle);
        const flailBall = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), ironMat);
        flailBall.position.set(0.38, 0.67, rackZ + 0.06);
        group.add(flailBall);
        // Short swords laid flat on mid shelf
        [0.0, 0.2].forEach(px => {
            const sBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.015), steelMat);
            sBlade.position.set(px, 0.68, rackZ + 0.08);
            sBlade.rotation.y = 0.1;
            group.add(sBlade);
            const sGuard = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.004, 0.04), goldTrimMat);
            sGuard.position.set(px + 0.1, 0.68, rackZ + 0.08);
            group.add(sGuard);
        });
        // Helmets on top shelf (y ≈ 0.95)
        [-0.3, 0.4].forEach((hx, hi) => {
            const hMat = hi === 0 ? steelMat : darkSteelMat;
            const hel = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.7), hMat
            );
            hel.position.set(hx, 1.0, rackZ + 0.06);
            group.add(hel);
            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.007, 0.06),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            visor.position.set(hx, 0.98, rackZ + 0.09);
            group.add(visor);
        });

        // ── Shield also on BACK wall (between racks) ──
        const backShield = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10),
            new THREE.MeshStandardMaterial({ color: 0x6a1a3a, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide })
        );
        backShield.position.set(0, 0.85, rackZ - 0.01);
        group.add(backShield);
        const backBoss = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), goldTrimMat);
        backBoss.position.set(0, 0.85, rackZ - 0.02);
        group.add(backBoss);

        // ── Knight armor stand #1 — back-right corner ──
        const addArmorStand = (ax, az, bodyColor) => {
            const armorMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.7 });
            // Base platform
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 8), darkWoodMat);
            base.position.set(ax, 0.015, az);
            group.add(base);
            // Stand pole
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.15, 6), darkWoodMat);
            pole.position.set(ax, 0.1, az);
            group.add(pole);
            // Boots
            [-0.04, 0.04].forEach(bOff => {
                const boot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.07), darkSteelMat);
                boot.position.set(ax + bOff, 0.09, az);
                group.add(boot);
            });
            // Leg armor (greaves)
            [-0.04, 0.04].forEach(lOff => {
                const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.18, 6), armorMat);
                greave.position.set(ax + lOff, 0.24, az);
                group.add(greave);
            });
            // Torso (breastplate)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.12), armorMat);
            torso.position.set(ax, 0.46, az);
            torso.castShadow = true;
            group.add(torso);
            // Chainmail skirt
            const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), chainMat);
            skirt.position.set(ax, 0.33, az);
            group.add(skirt);
            // Shoulder pauldrons
            [-0.11, 0.11].forEach(sOff => {
                const pauldron = new THREE.Mesh(
                    new THREE.SphereGeometry(0.045, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), armorMat
                );
                pauldron.position.set(ax + sOff, 0.55, az);
                group.add(pauldron);
            });
            // Arms
            [-0.12, 0.12].forEach(aOff => {
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.18, 6), armorMat);
                arm.position.set(ax + aOff, 0.42, az);
                group.add(arm);
                // Gauntlet
                const gauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), darkSteelMat);
                gauntlet.position.set(ax + aOff, 0.31, az);
                group.add(gauntlet);
            });
            // Neck
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.04, 6), chainMat);
            neck.position.set(ax, 0.58, az);
            group.add(neck);
            // Helmet
            const helmet = new THREE.Mesh(
                new THREE.SphereGeometry(0.065, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.7), armorMat
            );
            helmet.position.set(ax, 0.64, az);
            helmet.castShadow = true;
            group.add(helmet);
            // Visor slit
            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.008, 0.07),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            visor.position.set(ax, 0.62, az + 0.04);
            group.add(visor);
            // Plume on top of helmet
            const plumeMat = new THREE.MeshStandardMaterial({ color: bodyColor === 0x8a8a8a ? 0xcc2222 : 0x2244aa, roughness: 0.8, metalness: 0 });
            const plume = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.1), plumeMat);
            plume.position.set(ax, 0.72, az - 0.01);
            group.add(plume);
        };

        addArmorStand(halfSize - 0.4, -halfSize + 0.4, 0x8a8a8a);
        addArmorStand(-halfSize + 0.4, halfSize - 0.4, 0x6a6a7a);

        // ── Spear/lance rack — left wall back portion (behind door area) ──
        const spearX = -halfSize + 0.12;
        // Wooden holders on wall
        [-0.7, -0.4].forEach(rz => {
            const holder = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.04, 0.4), darkWoodMat
            );
            holder.position.set(spearX, rz === -0.7 ? 0.35 : 0.75, rz);
            group.add(holder);
        });
        // Spears/lances (standing upright against wall)
        [-0.85, -0.65, -0.5, -0.35].forEach((sz, idx) => {
            const spearH = 1.1 + idx * 0.05;
            // Shaft
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.012, spearH, 5), woodMat
            );
            shaft.position.set(spearX + 0.05, spearH / 2, sz);
            group.add(shaft);
            // Spear tip
            const tipMat = idx % 2 === 0 ? steelMat : ironMat;
            const tip = new THREE.Mesh(
                new THREE.ConeGeometry(0.02, 0.08, 5), tipMat
            );
            tip.position.set(spearX + 0.05, spearH + 0.04, sz);
            group.add(tip);
        });

        // ── Central weapon display table ──
        const tX = 0, tZ = 0.15;
        const tW = 0.75, tD = 0.4, tLegH = 0.3, tTopH = 0.04;
        // Table top
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tW, tTopH, tD), woodMat);
        tableTop.position.set(tX, tLegH + tTopH / 2, tZ);
        tableTop.castShadow = true;
        group.add(tableTop);
        // Legs
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, tLegH, 0.04), darkWoodMat);
            leg.position.set(tX + lx * (tW / 2 - 0.04), tLegH / 2, tZ + lz * (tD / 2 - 0.04));
            group.add(leg);
        });
        const tY = tLegH + tTopH;

        // Dagger on table
        const daggerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.14, 0.003), steelMat);
        daggerBlade.rotation.z = Math.PI / 2;
        daggerBlade.position.set(tX - 0.15, tY + 0.008, tZ + 0.05);
        group.add(daggerBlade);
        const daggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.008), goldTrimMat);
        daggerGuard.position.set(tX - 0.15 + 0.07 + 0.02, tY + 0.008, tZ + 0.05);
        group.add(daggerGuard);
        const daggerGrip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.007, 0.05, 5), leatherMat
        );
        daggerGrip.rotation.z = Math.PI / 2;
        daggerGrip.position.set(tX - 0.15 + 0.12, tY + 0.008, tZ + 0.05);
        group.add(daggerGrip);

        // Chainmail piece laid out on table
        const chainPiece = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.18), chainMat);
        chainPiece.rotation.x = -Math.PI / 2;
        chainPiece.position.set(tX + 0.1, tY + 0.005, tZ - 0.02);
        group.add(chainPiece);

        // Small shield on table (lying flat)
        const tShield = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), redMat);
        tShield.rotation.x = -Math.PI / 2;
        tShield.position.set(tX - 0.2, tY + 0.008, tZ - 0.08);
        group.add(tShield);
        const tBoss = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), ironMat);
        tBoss.position.set(tX - 0.2, tY + 0.02, tZ - 0.08);
        group.add(tBoss);

        // Whetstone on table
        const whetstone = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x888880, roughness: 0.9, metalness: 0.05 })
        );
        whetstone.position.set(tX + 0.25, tY + 0.013, tZ + 0.1);
        group.add(whetstone);

        // ── Weapons on floor — leaning against walls ──
        // Halberd leaning on back-left
        const halbX = -0.5, halbZ = -halfSize + 0.2;
        const halbShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 1.2, 5), woodMat);
        halbShaft.rotation.z = 0.1;
        halbShaft.position.set(halbX, 0.6, halbZ);
        group.add(halbShaft);
        const halbHead = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.01), steelMat);
        halbHead.rotation.z = 0.1;
        halbHead.position.set(halbX - 0.06, 1.15, halbZ);
        group.add(halbHead);
        const halbSpike = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.06, 4), steelMat);
        halbSpike.rotation.z = 0.1;
        halbSpike.position.set(halbX - 0.04, 1.22, halbZ);
        group.add(halbSpike);

        // Mace on the floor
        const maceX = 0.4, maceZ = 0.65;
        const maceHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.3, 5), woodMat);
        maceHandle.rotation.z = Math.PI / 2 + 0.1;
        maceHandle.position.set(maceX, 0.04, maceZ);
        group.add(maceHandle);
        const maceHead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), ironMat);
        maceHead.position.set(maceX - 0.15, 0.05, maceZ);
        group.add(maceHead);
        // Spikes on mace
        for (let sp = 0; sp < 6; sp++) {
            const angle = (sp / 6) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 4), ironMat);
            spike.position.set(
                maceX - 0.15 + Math.cos(angle) * 0.035,
                0.05 + Math.sin(angle) * 0.035,
                maceZ
            );
            spike.lookAt(maceX - 0.15, 0.05, maceZ);
            group.add(spike);
        }

        // Bow leaning against right wall
        const bowX = halfSize - 0.2, bowZ = 0.3;
        const bowCurve = new THREE.TorusGeometry(0.18, 0.008, 4, 12, Math.PI * 0.8);
        const bow = new THREE.Mesh(bowCurve, woodMat);
        bow.rotation.y = Math.PI / 2;
        bow.rotation.x = -0.3;
        bow.position.set(bowX, 0.45, bowZ);
        group.add(bow);
        // Bowstring
        const stringGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.32, 3);
        const bowString = new THREE.Mesh(stringGeo,
            new THREE.MeshStandardMaterial({ color: 0xccbb99, roughness: 0.9 })
        );
        bowString.rotation.x = -0.3;
        bowString.position.set(bowX + 0.05, 0.45, bowZ);
        group.add(bowString);

        // Quiver with arrows on the floor near bow
        const quiverMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8, metalness: 0.05 });
        const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.35, 6), quiverMat);
        quiver.rotation.z = 0.3;
        quiver.position.set(bowX - 0.05, 0.15, bowZ + 0.15);
        group.add(quiver);
        // Arrow tips sticking out
        for (let a = 0; a < 3; a++) {
            const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 3), woodMat);
            arrow.rotation.z = 0.3;
            arrow.position.set(bowX - 0.08 + a * 0.015, 0.35 + a * 0.01, bowZ + 0.15);
            group.add(arrow);
            const arrowTip = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 3), ironMat);
            arrowTip.rotation.z = 0.3;
            arrowTip.position.set(bowX - 0.12 + a * 0.015, 0.38 + a * 0.01, bowZ + 0.15);
            group.add(arrowTip);
        }

        // ── Barrel with more weapons (swords sticking out) ──
        const brlX = halfSize - 0.35, brlZ = -0.3;
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: 0.85, metalness: 0.05 });
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.35, 8), barrelMat);
        barrel.position.set(brlX, 0.175, brlZ);
        barrel.castShadow = true;
        group.add(barrel);
        // Barrel bands
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.5 });
        [0.1, 0.25].forEach(by => {
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.131, 0.008, 4, 10), bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.set(brlX, by, brlZ);
            group.add(band);
        });
        // Swords/weapons poking out of barrel
        [[-0.02, 0.25], [0.04, 0.15], [-0.05, 0.2]].forEach(([off, tilt]) => {
            const sBlade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.3, 0.003), steelMat);
            sBlade.rotation.z = tilt;
            sBlade.rotation.x = off;
            sBlade.position.set(brlX + off * 2, 0.5, brlZ + off);
            group.add(sBlade);
        });

        // ── Hanging shields/weapons on right wall (upper area) ──
        // Crossed halberds high on right wall
        const chX = halfSize - 0.03, chY = wallH * 0.7, chZ = -0.7;
        [-0.4, 0.4].forEach(rot => {
            const hShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.5, 4), woodMat);
            hShaft.rotation.y = -Math.PI / 2;
            hShaft.rotation.x = rot;
            hShaft.position.set(chX, chY, chZ);
            group.add(hShaft);
        });

        // ── Torch / ambient light ──
        const torchLight = new THREE.PointLight(0xFFAA44, 0.3, 3.5);
        torchLight.position.set(0, wallH * 0.7, halfSize - 0.3);
        group.add(torchLight);

        // ── Floor rug (dark red, worn) ──
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x3a1a1a, roughness: 0.95, metalness: 0 });
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(tX, 0.015, tZ);
        group.add(rug);
    },

    _buildLibrary(group, halfSize, wallH) {
        // Room 1: doors on left(-x → Torre), right(+x → Armería), front(+z → Trono)
        // Free wall: back(-z) only — tall bookshelf wall + side shelves avoiding doors
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.9, metalness: 0.02 });
        const richWoodMat = new THREE.MeshStandardMaterial({ color: 0x6a3a18, roughness: 0.75, metalness: 0.08 });
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.85, metalness: 0.03 });
        const greenLeatherMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.8, metalness: 0.05 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xB08830, roughness: 0.35, metalness: 0.6 });
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xd8c89a, roughness: 0.9, metalness: 0 });
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xeee8d0, roughness: 0.6, metalness: 0 });
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFCC44, transparent: true, opacity: 0.85 });

        // Book cover colors (rich leather tones)
        const bookColors = [
            0x8a1a1a, 0x1a2a6a, 0x2a5a1a, 0x6a4a1a, 0x4a1a5a,
            0x1a5a5a, 0x5a1a3a, 0x3a3a1a, 0x1a3a5a, 0x6a2a2a,
            0x2a2a5a, 0x4a5a1a, 0x5a3a2a, 0x2a4a3a, 0x3a1a4a
        ];

        // Helper: build a bookshelf with books
        const addBookshelf = (sx, sz, shelfW, shelfD, rotY, shelfCount) => {
            const shelfH = wallH * 0.85;
            const shelfStepH = shelfH / shelfCount;

            // Bookshelf back panel
            const backPanel = new THREE.Mesh(
                new THREE.BoxGeometry(shelfW, shelfH, 0.02), darkWoodMat
            );
            backPanel.position.set(sx, shelfH / 2, sz);
            backPanel.rotation.y = rotY;
            backPanel.castShadow = true;
            group.add(backPanel);

            // Side panels
            [-1, 1].forEach(side => {
                const sidePanel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.02, shelfH, shelfD), darkWoodMat
                );
                const offX = side * (shelfW / 2);
                if (rotY === 0) {
                    sidePanel.position.set(sx + offX, shelfH / 2, sz + shelfD / 2 - 0.01);
                } else {
                    sidePanel.position.set(sx + shelfD / 2 - 0.01, shelfH / 2, sz + offX);
                }
                sidePanel.rotation.y = rotY;
                group.add(sidePanel);
            });

            // Shelves + books on each shelf
            for (let s = 0; s < shelfCount; s++) {
                const sy = s * shelfStepH + 0.02;

                // Shelf plank
                const plank = new THREE.Mesh(
                    new THREE.BoxGeometry(shelfW - 0.02, 0.02, shelfD), darkWoodMat
                );
                plank.position.set(sx, sy, sz + shelfD / 2 - 0.01);
                plank.rotation.y = rotY;
                group.add(plank);

                // Books on this shelf — packed tightly
                let bx = -shelfW / 2 + 0.02;
                const limit = shelfW / 2 - 0.02;
                let b = 0;

                while (bx < limit) {
                    const bW = 0.015 + Math.random() * 0.015;
                    if (bx + bW > limit) break;
                    const bH = shelfStepH * (0.55 + Math.random() * 0.38);
                    const bD = shelfD * (0.6 + Math.random() * 0.3);
                    const color = bookColors[(s * 7 + b * 3 + s) % bookColors.length];
                    const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 });

                    const book = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), bMat);

                    // Slightly tilted books occasionally
                    const tilt = (b % 5 === 3) ? 0.12 : (b % 7 === 5) ? -0.1 : (b % 11 === 0) ? 0.07 : 0;

                    if (rotY === 0) {
                        book.position.set(sx + bx + bW / 2, sy + 0.02 + bH / 2, sz + shelfD / 2 - 0.01);
                        book.rotation.z = tilt;
                    } else {
                        book.position.set(sx + shelfD / 2 - 0.01, sy + 0.02 + bH / 2, sz + bx + bW / 2);
                        book.rotation.x = tilt;
                    }
                    group.add(book);

                    bx += bW + 0.002;
                    b++;
                }
            }

            // Top ornamental crown molding
            const crown = new THREE.Mesh(
                new THREE.BoxGeometry(shelfW + 0.04, 0.03, shelfD + 0.02), richWoodMat
            );
            crown.position.set(sx, shelfH + 0.015, sz + shelfD / 2 - 0.01);
            crown.rotation.y = rotY;
            group.add(crown);
        };

        // ── Main bookshelf wall — back wall (-z), full width ──
        const backZ = -halfSize + 0.1;
        addBookshelf(-0.5, backZ, 0.85, 0.18, 0, 5);
        addBookshelf(0.5, backZ, 0.85, 0.18, 0, 5);

        // ── Side bookshelves — left and right walls, behind the door ──
        // Left wall (-x): door is in center, shelves on the back half (z < 0)
        addBookshelf(-halfSize + 0.1, -0.7, 0.7, 0.16, Math.PI / 2, 4);
        // Right wall (+x): door is in center, shelves on the back half (z < 0)
        addBookshelf(halfSize - 0.1, -0.7, 0.7, 0.16, -Math.PI / 2, 4);

        // ── Central writing desk ──
        const deskX = 0, deskZ = 0.15;
        const deskW = 0.9, deskD = 0.5, deskLegH = 0.33, deskTopH = 0.04;

        // Desktop (rich wood with green leather inlay)
        const desktop = new THREE.Mesh(new THREE.BoxGeometry(deskW, deskTopH, deskD), richWoodMat);
        desktop.position.set(deskX, deskLegH + deskTopH / 2, deskZ);
        desktop.castShadow = true;
        group.add(desktop);

        // Green leather writing surface inlay
        const inlay = new THREE.Mesh(
            new THREE.PlaneGeometry(deskW * 0.7, deskD * 0.7), greenLeatherMat
        );
        inlay.rotation.x = -Math.PI / 2;
        inlay.position.set(deskX, deskLegH + deskTopH + 0.002, deskZ);
        group.add(inlay);

        // Ornate desk legs (4 turned legs)
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
            // Main leg
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.035, deskLegH, 6), richWoodMat
            );
            leg.position.set(
                deskX + lx * (deskW / 2 - 0.05),
                deskLegH / 2,
                deskZ + lz * (deskD / 2 - 0.05)
            );
            leg.castShadow = true;
            group.add(leg);
            // Decorative bulge on leg
            const bulge = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 6, 6), richWoodMat
            );
            bulge.scale.set(1, 0.5, 1);
            bulge.position.set(
                deskX + lx * (deskW / 2 - 0.05),
                deskLegH * 0.35,
                deskZ + lz * (deskD / 2 - 0.05)
            );
            group.add(bulge);
        });

        // Desk drawers (front face)
        [-0.2, 0.2].forEach(dx => {
            const drawer = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.08, 0.02), darkWoodMat
            );
            drawer.position.set(deskX + dx, deskLegH - 0.02, deskZ + deskD / 2);
            group.add(drawer);
            // Drawer handle
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.005, 0.005, 0.06, 4), brassMat
            );
            handle.rotation.x = Math.PI / 2;
            handle.position.set(deskX + dx, deskLegH - 0.02, deskZ + deskD / 2 + 0.015);
            group.add(handle);
        });

        const dtY = deskLegH + deskTopH;

        // ── Items on desk ──
        // Open book (large tome)
        const pageW = 0.12, pageH = 0.16;
        const pageL = new THREE.Mesh(new THREE.PlaneGeometry(pageW, pageH), paperMat);
        pageL.rotation.x = -Math.PI / 2 + 0.12;
        pageL.position.set(deskX - 0.07, dtY + 0.012, deskZ - 0.02);
        group.add(pageL);
        const pageR = new THREE.Mesh(new THREE.PlaneGeometry(pageW, pageH), paperMat);
        pageR.rotation.x = -Math.PI / 2 - 0.12;
        pageR.position.set(deskX + 0.07, dtY + 0.012, deskZ - 0.02);
        group.add(pageR);
        const bookSpine = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 0.01, pageH),
            new THREE.MeshStandardMaterial({ color: 0x6a1a1a, roughness: 0.8, metalness: 0.05 })
        );
        bookSpine.position.set(deskX, dtY + 0.007, deskZ - 0.02);
        group.add(bookSpine);

        // Stacked books on the right side of desk
        [0x1a2a6a, 0x2a5a1a, 0x5a1a3a].forEach((col, bIdx) => {
            const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8, metalness: 0.05 });
            const stacked = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.16), bMat);
            stacked.rotation.y = 0.15 * bIdx;
            stacked.position.set(deskX + 0.3, dtY + 0.012 + bIdx * 0.027, deskZ + 0.05);
            stacked.castShadow = true;
            group.add(stacked);
        });

        // Inkwell and quill
        const inkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.4, metalness: 0.2 });
        const inkwell = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.03, 6), inkMat);
        inkwell.position.set(deskX + 0.2, dtY + 0.015, deskZ - 0.12);
        group.add(inkwell);
        const quill = new THREE.Mesh(
            new THREE.CylinderGeometry(0.002, 0.008, 0.14, 4),
            new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 })
        );
        quill.rotation.z = 0.6;
        quill.rotation.y = -0.3;
        quill.position.set(deskX + 0.22, dtY + 0.03, deskZ - 0.08);
        group.add(quill);

        // Candelabra on desk (brass with 3 candles)
        const candX = deskX - 0.32, candZ = deskZ + 0.08;
        // Base
        const candBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.02, 8), brassMat);
        candBase.position.set(candX, dtY + 0.01, candZ);
        group.add(candBase);
        // Stem
        const candStem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.15, 6), brassMat);
        candStem.position.set(candX, dtY + 0.085, candZ);
        group.add(candStem);
        // Three arms with candles
        [-0.04, 0, 0.04].forEach((cOff, cIdx) => {
            const armY = dtY + 0.15;
            if (cIdx !== 1) {
                // Horizontal arm
                const arm = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.005, 0.005, 0.06, 4), brassMat
                );
                arm.rotation.z = Math.PI / 2;
                arm.position.set(candX + cOff * 0.7, armY, candZ);
                group.add(arm);
            }
            // Candle cup
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.01, 6), brassMat);
            cup.position.set(candX + cOff, armY + 0.005, candZ);
            group.add(cup);
            // Candle
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.06, 6), candleMat);
            candle.position.set(candX + cOff, armY + 0.04, candZ);
            group.add(candle);
            // Flame
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 4), flameMat);
            flame.position.set(candX + cOff, armY + 0.078, candZ);
            group.add(flame);
        });
        // Desk candle light
        const deskLight = new THREE.PointLight(0xFFDD88, 0.35, 3);
        deskLight.position.set(candX, dtY + 0.2, candZ);
        group.add(deskLight);

        // Scroll on desk
        const scrollMat = new THREE.MeshStandardMaterial({ color: 0xd4c49a, roughness: 0.9, metalness: 0 });
        const scrollBody = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.2), scrollMat);
        scrollBody.rotation.x = -Math.PI / 2;
        scrollBody.rotation.z = 0.2;
        scrollBody.position.set(deskX - 0.15, dtY + 0.005, deskZ + 0.12);
        group.add(scrollBody);
        // Scroll rolled edge
        const rollGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6);
        const roll = new THREE.Mesh(rollGeo, paperMat);
        roll.rotation.y = 0.2;
        roll.position.set(deskX - 0.22, dtY + 0.01, deskZ + 0.12);
        group.add(roll);

        // ── Globe on stand — front-right area ──
        const globeX = 0.65, globeZ = 0.6;
        // Tripod stand
        const standH = 0.45;
        const standBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.05, 0.03, 8), darkWoodMat
        );
        standBase.position.set(globeX, 0.015, globeZ);
        group.add(standBase);
        // Stand column
        const standCol = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.018, standH, 6), darkWoodMat
        );
        standCol.position.set(globeX, standH / 2 + 0.03, globeZ);
        standCol.castShadow = true;
        group.add(standCol);
        // Support ring for globe
        const supportRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.11, 0.008, 6, 16), brassMat
        );
        supportRing.rotation.x = Math.PI / 2;
        supportRing.position.set(globeX, standH + 0.04, globeZ);
        group.add(supportRing);
        // Meridian arc (half ring)
        const meridian = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.005, 6, 16, Math.PI), brassMat
        );
        meridian.position.set(globeX, standH + 0.04, globeZ);
        meridian.rotation.z = 0.15; // slight tilt
        group.add(meridian);
        // Globe sphere (earth tones)
        const globeMat = new THREE.MeshStandardMaterial({
            color: 0xC8A55A, roughness: 0.6, metalness: 0.1
        });
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), globeMat);
        globe.position.set(globeX, standH + 0.04, globeZ);
        group.add(globe);
        // "Continent" patches (darker areas on globe surface)
        [
            [0.3, 0.5], [1.2, 0.8], [2.5, 0.4], [3.8, 1.0], [5.0, 0.6]
        ].forEach(([lng, lat]) => {
            const contMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.7, metalness: 0.05 });
            const cont = new THREE.Mesh(new THREE.CircleGeometry(0.025, 6), contMat);
            const r = 0.091;
            cont.position.set(
                globeX + r * Math.cos(lat) * Math.cos(lng),
                standH + 0.04 + r * Math.sin(lat) * 0.6,
                globeZ + r * Math.cos(lat) * Math.sin(lng)
            );
            cont.lookAt(globeX, standH + 0.04, globeZ);
            cont.rotation.z += lng;
            group.add(cont);
        });
        // "Ocean" lines (equator and tropics)
        const eqRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.091, 0.002, 4, 24), brassMat
        );
        eqRing.rotation.x = Math.PI / 2;
        eqRing.position.set(globeX, standH + 0.04, globeZ);
        group.add(eqRing);

        // ── Reading chair — behind desk (south side) ──
        const chairX = 0, chairZ = 0.55;
        const chairH = 0.24;
        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.28), leatherMat);
        seat.position.set(chairX, chairH, chairZ);
        group.add(seat);
        // Chair legs
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.02, chairH - 0.02, 5), darkWoodMat
            );
            leg.position.set(
                chairX + lx * 0.12,
                (chairH - 0.02) / 2,
                chairZ + lz * 0.11
            );
            group.add(leg);
        });
        // Backrest
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.025), leatherMat);
        backrest.position.set(chairX, chairH + 0.12, chairZ + 0.13);
        group.add(backrest);
        // Backrest frame (wood border)
        const bFrame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.02), darkWoodMat);
        bFrame.position.set(chairX, chairH + 0.12, chairZ + 0.14);
        group.add(bFrame);

        // ── Rug under desk ──
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x4a1a1a, roughness: 0.95, metalness: 0 });
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(deskX, 0.015, deskZ + 0.1);
        group.add(rug);
        // Rug ornate border
        const rugBorderMat = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: 0.9, metalness: 0.05 });
        // Long edges
        [-0.45, 0.45].forEach(rz => {
            const border = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.03), rugBorderMat);
            border.rotation.x = -Math.PI / 2;
            border.position.set(deskX, 0.016, deskZ + 0.1 + rz);
            group.add(border);
        });
        // Short edges
        [-0.6, 0.6].forEach(rx => {
            const border = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.9), rugBorderMat);
            border.rotation.x = -Math.PI / 2;
            border.position.set(deskX + rx, 0.016, deskZ + 0.1);
            group.add(border);
        });

        // ── Ladder leaning against back-left bookshelf ──
        const ladderX = -0.85, ladderZ = -halfSize + 0.35;
        const ladderH = wallH * 0.75;
        const ladderTilt = 0.18;
        // Rails
        [-0.06, 0.06].forEach(lOff => {
            const rail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, ladderH, 4), woodMat
            );
            rail.rotation.x = ladderTilt;
            rail.position.set(ladderX + lOff, ladderH / 2 * Math.cos(ladderTilt), ladderZ + ladderH / 2 * Math.sin(ladderTilt) * 0.5);
            group.add(rail);
        });
        // Rungs
        for (let r = 0; r < 5; r++) {
            const ry = 0.12 + r * (ladderH - 0.2) / 4;
            const rung = new THREE.Mesh(
                new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4), woodMat
            );
            rung.rotation.z = Math.PI / 2;
            rung.position.set(
                ladderX,
                ry * Math.cos(ladderTilt),
                ladderZ + ry * Math.sin(ladderTilt) * 0.5
            );
            group.add(rung);
        }

        // ── Small side table with more books — front-left ──
        const stX = -0.65, stZ = 0.6;
        const stLegH = 0.28;
        const stTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.025, 8), richWoodMat);
        stTop.position.set(stX, stLegH + 0.012, stZ);
        stTop.castShadow = true;
        group.add(stTop);
        // Pedestal
        const stPed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, stLegH, 6), darkWoodMat);
        stPed.position.set(stX, stLegH / 2, stZ);
        group.add(stPed);
        // 3 feet
        for (let f = 0; f < 3; f++) {
            const angle = (f / 3) * Math.PI * 2 + 0.3;
            const foot = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.02, 0.03), darkWoodMat
            );
            foot.position.set(
                stX + Math.cos(angle) * 0.06,
                0.01,
                stZ + Math.sin(angle) * 0.06
            );
            foot.rotation.y = angle;
            group.add(foot);
        }

        const stY = stLegH + 0.025;
        // A few stacked books on side table
        [0x8a1a1a, 0x1a4a3a].forEach((col, bIdx) => {
            const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8, metalness: 0.05 });
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.13), bMat);
            book.rotation.y = bIdx * 0.4;
            book.position.set(stX + 0.02, stY + 0.011 + bIdx * 0.024, stZ);
            group.add(book);
        });

        // ── Wall sconce with candle on right side ──
        const scX = halfSize - 0.08, scZ = 0.4;
        const scBracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.04, 0.12), ironMat
        );
        scBracket.position.set(scX, wallH * 0.55, scZ);
        group.add(scBracket);
        const scCandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.08, 6), candleMat);
        scCandle.position.set(scX - 0.03, wallH * 0.55 + 0.06, scZ);
        group.add(scCandle);
        const scFlame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 4), flameMat);
        scFlame.position.set(scX - 0.03, wallH * 0.55 + 0.11, scZ);
        group.add(scFlame);
        const scLight = new THREE.PointLight(0xFFDD88, 0.2, 2.5);
        scLight.position.set(scX - 0.05, wallH * 0.6, scZ);
        group.add(scLight);
    },

    _buildTowerMage(group, halfSize, wallH) {
        // Room 0: doors on right(+x → Biblioteca) and front(+z → Capilla)
        // Free walls: back(-z) and left(-x) — alchemy bench + telescope
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.85, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x352210, roughness: 0.9, metalness: 0.02 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.85, metalness: 0.1 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xB08830, roughness: 0.35, metalness: 0.6 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xB87333, roughness: 0.4, metalness: 0.55 });
        const clothMat = new THREE.MeshStandardMaterial({ color: 0x2a1a4a, roughness: 0.95, metalness: 0 });
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.9, metalness: 0.02 });
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x8844cc, roughness: 0.1, metalness: 0.3,
            transparent: true, opacity: 0.7
        });
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xaa66ff, transparent: true, opacity: 0.5
        });

        // Potion bottle colors
        const potionColors = [0x22cc44, 0xcc2244, 0x2244dd, 0xddaa22, 0x44dddd, 0xff6600];

        // ── Telescope — back-left corner ──
        // Tripod legs
        const tripodH = 0.65;
        const tripodX = -halfSize + 0.45, tripodZ = -halfSize + 0.45;
        const tripodLegGeo = new THREE.CylinderGeometry(0.015, 0.02, tripodH, 4);
        [[-0.12, -0.1], [0.1, -0.08], [0.0, 0.12]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(tripodLegGeo, darkWoodMat);
            leg.position.set(tripodX + lx, tripodH / 2, tripodZ + lz);
            leg.rotation.x = lz * 0.3;
            leg.rotation.z = -lx * 0.3;
            leg.castShadow = true;
            group.add(leg);
        });

        // Telescope tube (brass cylinder, tilted upward)
        const tubeGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.55, 10);
        const tube = new THREE.Mesh(tubeGeo, brassMat);
        tube.rotation.z = Math.PI / 4;
        tube.rotation.y = -Math.PI / 4;
        tube.position.set(tripodX, tripodH + 0.08, tripodZ);
        tube.castShadow = true;
        group.add(tube);

        // Lens (glass disc at the wide end)
        const lens = new THREE.Mesh(
            new THREE.CircleGeometry(0.055, 12),
            new THREE.MeshStandardMaterial({ color: 0x88aaff, transparent: true, opacity: 0.4, metalness: 0.3, roughness: 0.1, side: THREE.DoubleSide })
        );
        lens.position.set(tripodX - 0.17, tripodH + 0.27, tripodZ - 0.17);
        lens.rotation.z = Math.PI / 4;
        lens.rotation.y = -Math.PI / 4;
        group.add(lens);

        // ── Alchemy workbench — against left wall (-x) ──
        const benchX = -halfSize + 0.35;
        const benchZ = 0.1;
        const benchW = 0.4, benchD = 1.1, benchLegH = 0.35, benchTopH = 0.04;

        // Table top
        const top = new THREE.Mesh(new THREE.BoxGeometry(benchW, benchTopH, benchD), woodMat);
        top.position.set(benchX, benchLegH + benchTopH / 2, benchZ);
        top.castShadow = true;
        group.add(top);

        // Legs
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, benchLegH, 0.05), darkWoodMat
            );
            leg.position.set(
                benchX + lx * (benchW / 2 - 0.04),
                benchLegH / 2,
                benchZ + lz * (benchD / 2 - 0.04)
            );
            group.add(leg);
        });

        const benchTop = benchLegH + benchTopH;

        // Potions on bench (various colored bottles)
        const bottlePositions = [
            [-0.08, -0.3], [0.05, -0.15], [-0.1, 0.0], [0.08, 0.15],
            [-0.05, 0.32], [0.1, 0.45]
        ];
        bottlePositions.forEach(([bx, bz], idx) => {
            const color = potionColors[idx % potionColors.length];
            const bottleH = 0.08 + Math.random() * 0.04;
            const bottleR = 0.018 + Math.random() * 0.01;

            // Bottle body
            const glassMat = new THREE.MeshStandardMaterial({
                color, transparent: true, opacity: 0.65,
                roughness: 0.15, metalness: 0.2
            });
            const bottle = new THREE.Mesh(
                new THREE.CylinderGeometry(bottleR, bottleR * 1.1, bottleH, 8), glassMat
            );
            bottle.position.set(benchX + bx, benchTop + bottleH / 2, benchZ + bz);
            group.add(bottle);

            // Cork/stopper
            const cork = new THREE.Mesh(
                new THREE.CylinderGeometry(bottleR * 0.6, bottleR * 0.7, 0.015, 6),
                leatherMat
            );
            cork.position.set(benchX + bx, benchTop + bottleH + 0.008, benchZ + bz);
            group.add(cork);

            // Neck
            const neck = new THREE.Mesh(
                new THREE.CylinderGeometry(bottleR * 0.45, bottleR * 0.7, 0.025, 6), glassMat
            );
            neck.position.set(benchX + bx, benchTop + bottleH - 0.01, benchZ + bz);
            group.add(neck);
        });

        // Mortar & pestle on bench
        const mortar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.035, 0.05, 8, 1, true), stoneMat
        );
        mortar.position.set(benchX + 0.0, benchTop + 0.025, benchZ - 0.4);
        group.add(mortar);
        const pestle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.015, 0.09, 6), stoneMat
        );
        pestle.rotation.z = 0.4;
        pestle.position.set(benchX + 0.03, benchTop + 0.06, benchZ - 0.4);
        group.add(pestle);

        // ── Potion shelves on back wall (-z) ──
        const shelfZ = -halfSize + 0.12;
        [0.45, 0.75, 1.02].forEach((sy, sIdx) => {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.03, 0.14), darkWoodMat
            );
            shelf.position.set(0.1, sy, shelfZ);
            shelf.castShadow = true;
            group.add(shelf);

            // Bottles & jars on each shelf
            const count = 4 + sIdx;
            for (let j = 0; j < count; j++) {
                const px = -0.5 + j * (1.0 / (count - 1));
                const color = potionColors[(sIdx * 3 + j) % potionColors.length];
                const h = 0.06 + (j % 3) * 0.015;
                const r = 0.015 + (j % 2) * 0.008;
                const mat = new THREE.MeshStandardMaterial({
                    color, transparent: true, opacity: 0.6,
                    roughness: 0.15, metalness: 0.2
                });

                // Jar (wider) or bottle (taller narrow)
                if (j % 3 === 0) {
                    // Wider jar
                    const jar = new THREE.Mesh(
                        new THREE.CylinderGeometry(r * 1.5, r * 1.5, h * 0.7, 8), mat
                    );
                    jar.position.set(0.1 + px, sy + 0.03 + h * 0.35, shelfZ);
                    group.add(jar);
                    // Lid
                    const lid = new THREE.Mesh(
                        new THREE.CylinderGeometry(r * 1.6, r * 1.6, 0.01, 8), woodMat
                    );
                    lid.position.set(0.1 + px, sy + 0.03 + h * 0.7 + 0.005, shelfZ);
                    group.add(lid);
                } else {
                    const bottle = new THREE.Mesh(
                        new THREE.CylinderGeometry(r * 0.5, r, h, 7), mat
                    );
                    bottle.position.set(0.1 + px, sy + 0.03 + h / 2, shelfZ);
                    group.add(bottle);
                }
            }
        });

        // ── Spell books on reading table — center-right area ──
        const readX = 0.35, readZ = 0.3;
        const readLegH = 0.3;

        // Round reading table
        const tableTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.33, 0.035, 12), woodMat
        );
        tableTop.position.set(readX, readLegH + 0.018, readZ);
        tableTop.castShadow = true;
        group.add(tableTop);
        // Central pedestal
        const pedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.1, readLegH, 8), darkWoodMat
        );
        pedestal.position.set(readX, readLegH / 2, readZ);
        group.add(pedestal);

        const rtY = readLegH + 0.035;

        // Open spell book (two angled planes)
        const bookMat = new THREE.MeshStandardMaterial({ color: 0xd8c89a, roughness: 0.9, metalness: 0 });
        const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x6a1a1a, roughness: 0.8, metalness: 0.05 });
        const pageW = 0.1, pageH = 0.13;
        // Left page
        const pageL = new THREE.Mesh(new THREE.PlaneGeometry(pageW, pageH), bookMat);
        pageL.rotation.x = -Math.PI / 2 + 0.15;
        pageL.position.set(readX - 0.05, rtY + 0.01, readZ);
        group.add(pageL);
        // Right page
        const pageR = new THREE.Mesh(new THREE.PlaneGeometry(pageW, pageH), bookMat);
        pageR.rotation.x = -Math.PI / 2 - 0.15;
        pageR.position.set(readX + 0.05, rtY + 0.01, readZ);
        group.add(pageR);
        // Spine
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.008, pageH), bookCoverMat);
        spine.position.set(readX, rtY + 0.005, readZ);
        group.add(spine);

        // Stacked closed books
        const bookColors = [0x1a2a6a, 0x2a5a1a, 0x6a1a1a, 0x4a2a5a];
        bookColors.forEach((col, bIdx) => {
            const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8, metalness: 0.05 });
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.14), bMat);
            book.rotation.y = bIdx * 0.3 - 0.2;
            book.position.set(readX + 0.18, rtY + 0.012 + bIdx * 0.027, readZ - 0.1);
            book.castShadow = true;
            group.add(book);
        });

        // ── Crystal ball on pedestal — near center ──
        const crystalX = 0.0, crystalZ = -0.15;
        // Stone pedestal
        const cbPedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8), stoneMat
        );
        cbPedestal.position.set(crystalX, 0.175, crystalZ);
        cbPedestal.castShadow = true;
        group.add(cbPedestal);
        // Pedestal top dish
        const dish = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.06, 0.03, 8), stoneMat
        );
        dish.position.set(crystalX, 0.36, crystalZ);
        group.add(dish);
        // Crystal sphere
        const crystal = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16), crystalMat
        );
        crystal.position.set(crystalX, 0.45, crystalZ);
        group.add(crystal);
        // Inner glow
        const innerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 12, 12), glowMat
        );
        innerGlow.position.set(crystalX, 0.45, crystalZ);
        group.add(innerGlow);
        // Crystal ball light
        const cbLight = new THREE.PointLight(0x9944ff, 0.4, 3);
        cbLight.position.set(crystalX, 0.55, crystalZ);
        group.add(cbLight);

        // ── Cauldron — near front-left area ──
        const cauldX = -0.55, cauldZ = 0.65;
        // Cauldron body (open-top sphere)
        const cauldron = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6),
            ironMat
        );
        cauldron.rotation.x = Math.PI;
        cauldron.position.set(cauldX, 0.28, cauldZ);
        cauldron.castShadow = true;
        group.add(cauldron);
        // Cauldron rim
        const rim = new THREE.Mesh(
            new THREE.TorusGeometry(0.155, 0.015, 6, 16), ironMat
        );
        rim.rotation.x = Math.PI / 2;
        rim.position.set(cauldX, 0.28, cauldZ);
        group.add(rim);
        // Cauldron legs (3)
        for (let l = 0; l < 3; l++) {
            const angle = (l / 3) * Math.PI * 2;
            const cLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.02, 0.14, 4), ironMat
            );
            cLeg.position.set(
                cauldX + Math.cos(angle) * 0.12,
                0.07,
                cauldZ + Math.sin(angle) * 0.12
            );
            group.add(cLeg);
        }
        // Bubbling liquid (green glowing disc)
        const liquidMat = new THREE.MeshBasicMaterial({
            color: 0x33ff66, transparent: true, opacity: 0.55
        });
        const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12), liquidMat);
        liquid.rotation.x = -Math.PI / 2;
        liquid.position.set(cauldX, 0.26, cauldZ);
        group.add(liquid);
        // Bubbling glow
        const cauldLight = new THREE.PointLight(0x33ff66, 0.3, 2.5);
        cauldLight.position.set(cauldX, 0.4, cauldZ);
        group.add(cauldLight);

        // ── Star chart / scroll on back wall ──
        const scrollMat = new THREE.MeshStandardMaterial({ color: 0xd4c49a, roughness: 0.9, metalness: 0 });
        const scroll = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.4), scrollMat);
        scroll.position.set(-0.4, wallH * 0.6, -halfSize + 0.02);
        group.add(scroll);
        // Scroll rollers (top and bottom)
        const rollerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.58, 6);
        const rollerTop = new THREE.Mesh(rollerGeo, darkWoodMat);
        rollerTop.rotation.z = Math.PI / 2;
        rollerTop.position.set(-0.4, wallH * 0.6 + 0.2, -halfSize + 0.02);
        group.add(rollerTop);
        const rollerBot = new THREE.Mesh(rollerGeo, darkWoodMat);
        rollerBot.rotation.z = Math.PI / 2;
        rollerBot.position.set(-0.4, wallH * 0.6 - 0.2, -halfSize + 0.02);
        group.add(rollerBot);

        // ── Magical purple carpet / rug ──
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x2a1a4a, roughness: 0.95, metalness: 0 });
        const rug = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0.0, 0.015, 0.1);
        group.add(rug);
        // Rug border
        const rugBorderMat = new THREE.MeshStandardMaterial({ color: 0x6a3aaa, roughness: 0.9, metalness: 0 });
        const rugBorder = new THREE.Mesh(
            new THREE.RingGeometry(0.47, 0.52, 24), rugBorderMat
        );
        rugBorder.rotation.x = -Math.PI / 2;
        rugBorder.position.set(0.0, 0.016, 0.1);
        group.add(rugBorder);

        // ── Candle cluster on reading table ──
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xeee8d0, roughness: 0.6, metalness: 0 });
        const flameMat2 = new THREE.MeshBasicMaterial({ color: 0xFFCC44, transparent: true, opacity: 0.85 });
        [[-0.15, 0.2], [-0.2, 0.08]].forEach(([cx, cz]) => {
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.08, 6), candleMat);
            candle.position.set(readX + cx, rtY + 0.04, readZ + cz);
            group.add(candle);
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 4), flameMat2);
            flame.position.set(readX + cx, rtY + 0.09, readZ + cz);
            group.add(flame);
        });
        // Reading table candle light
        const readLight = new THREE.PointLight(0xFFDD88, 0.25, 2);
        readLight.position.set(readX - 0.1, rtY + 0.15, readZ + 0.1);
        group.add(readLight);

        // ── Hanging dried herbs from ceiling ──
        const herbMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.9, metalness: 0 });
        [[0.5, -0.5], [0.7, -0.2], [0.3, -0.7], [0.65, 0.1]].forEach(([hx, hz]) => {
            // String
            const str = new THREE.Mesh(
                new THREE.CylinderGeometry(0.003, 0.003, 0.2, 3), leatherMat
            );
            str.position.set(hx, wallH - 0.1, hz);
            group.add(str);
            // Herb bundle
            const herb = new THREE.Mesh(
                new THREE.ConeGeometry(0.04, 0.12, 5), herbMat
            );
            herb.rotation.x = Math.PI;
            herb.position.set(hx, wallH - 0.26, hz);
            group.add(herb);
        });

        // ── Small skull on workbench (decorative) ──
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.7, metalness: 0.05 });
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), boneMat);
        skull.scale.set(1, 0.85, 0.9);
        skull.position.set(benchX + 0.12, benchTop + 0.035, benchZ + 0.35);
        group.add(skull);

        // ── Quill and ink on reading table ──
        // Inkwell
        const inkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.4, metalness: 0.2 });
        const inkwell = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.03, 6), inkMat);
        inkwell.position.set(readX - 0.1, rtY + 0.015, readZ - 0.05);
        group.add(inkwell);
        // Quill (feather pen)
        const quill = new THREE.Mesh(
            new THREE.CylinderGeometry(0.002, 0.008, 0.14, 4),
            new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 })
        );
        quill.rotation.z = 0.5;
        quill.rotation.y = 0.3;
        quill.position.set(readX - 0.06, rtY + 0.03, readZ - 0.02);
        group.add(quill);
    },

    _buildKitchen(group, halfSize) {
        // Room 6 connects: front (Capilla, -z) and right (Jardines, +x)
        // Free walls: back (+z) and left (-x) — fireplace on back wall
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85, metalness: 0.05 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.9, metalness: 0.02 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9, metalness: 0.1 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 });
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 0.4, metalness: 0.15 });
        const fireMat = new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.8 });
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: 0.85, metalness: 0.05 });
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.5 });
        const breadMat = new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 0.9, metalness: 0 });
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xe8c840, roughness: 0.8, metalness: 0 });
        const meatMat = new THREE.MeshStandardMaterial({ color: 0x8a3a2a, roughness: 0.85, metalness: 0 });
        const ceramicMat = new THREE.MeshStandardMaterial({ color: 0x9a7a5a, roughness: 0.7, metalness: 0.05 });

        const legGeo = new THREE.BoxGeometry(0.05, 0.35, 0.05);
        const legH = 0.35, tH = 0.04;

        // Helper: add table with legs
        const addTable = (cx, cz, tw, td) => {
            const top = new THREE.Mesh(new THREE.BoxGeometry(tw, tH, td), woodMat);
            top.position.set(cx, legH + tH / 2, cz);
            top.castShadow = true;
            group.add(top);
            [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(legGeo, darkWoodMat);
                leg.position.set(cx + lx * (tw / 2 - 0.05), legH / 2, cz + lz * (td / 2 - 0.05));
                group.add(leg);
            });
            return legH + tH;
        };

        // Helper: add barrel
        const addBarrel = (bx, bz, r, h, sideways) => {
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(r, r * 0.9, h, 10), barrelMat
            );
            if (sideways) {
                barrel.rotation.z = Math.PI / 2;
                barrel.position.set(bx, r, bz);
            } else {
                barrel.position.set(bx, h / 2, bz);
            }
            barrel.castShadow = true;
            group.add(barrel);
            if (!sideways) {
                [0.3, 0.7].forEach(f => {
                    const band = new THREE.Mesh(
                        new THREE.TorusGeometry(r + 0.005, 0.01, 4, 10), bandMat
                    );
                    band.rotation.x = Math.PI / 2;
                    band.position.set(bx, h * f, bz);
                    group.add(band);
                });
            }
        };

        // ── Fireplace on BACK wall (+z side, no door) ──
        const fpW = 1.1, fpH = 0.95, fpD = 0.3;
        const fpZ = halfSize - fpD / 2 - 0.02;

        const fpBase = new THREE.Mesh(new THREE.BoxGeometry(fpW, fpH, fpD), stoneMat);
        fpBase.position.set(0, fpH / 2, fpZ);
        fpBase.castShadow = true;
        group.add(fpBase);

        // Opening
        const fpOpen = new THREE.Mesh(
            new THREE.BoxGeometry(fpW * 0.6, fpH * 0.55, 0.06),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        fpOpen.position.set(0, fpH * 0.32, fpZ - fpD / 2 - 0.01);
        group.add(fpOpen);

        // Chimney
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.25), stoneMat);
        chimney.position.set(0, fpH + 0.4, fpZ);
        chimney.castShadow = true;
        group.add(chimney);

        // Fire flames (multiple cones)
        [[-0.1, 0.15], [0.05, 0.22], [0.12, 0.14]].forEach(([fx, fh]) => {
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, fh, 5), fireMat);
            flame.position.set(fx, fh / 2 + 0.02, fpZ - fpD / 2 - 0.01);
            group.add(flame);
        });

        // Glowing embers
        const emberMat = new THREE.MeshBasicMaterial({ color: 0xFF3300, transparent: true, opacity: 0.6 });
        const embers = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.15), emberMat);
        embers.position.set(0, 0.02, fpZ - fpD / 2 - 0.01);
        group.add(embers);

        // Fire glow light
        const fireLight = new THREE.PointLight(0xFF6622, 0.8, 5);
        fireLight.position.set(0, 0.4, fpZ - 0.3);
        group.add(fireLight);

        // Hanging pot over fire
        const pot = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), ironMat
        );
        pot.rotation.x = Math.PI;
        pot.position.set(0, 0.55, fpZ - fpD / 2 - 0.05);
        group.add(pot);
        const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 4), ironMat);
        hook.position.set(0, 0.72, fpZ - fpD / 2 - 0.05);
        group.add(hook);

        // Iron spit/rack across fireplace
        const spit = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, fpW * 0.5, 4), ironMat);
        spit.rotation.z = Math.PI / 2;
        spit.position.set(0, 0.35, fpZ - fpD / 2 - 0.08);
        group.add(spit);

        // ── Large central table with food ──
        const ty = addTable(0, -0.15, 1.0, 0.55);

        // Plates
        [[-0.3, -0.05], [0.0, 0.05], [0.3, -0.08], [-0.15, 0.12]].forEach(([px, pz]) => {
            const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 10), plateMat);
            plate.position.set(px, ty + 0.01, -0.15 + pz);
            group.add(plate);
        });

        // Bread loaves
        [[-0.28, 0.02], [0.22, -0.06]].forEach(([bx, bz]) => {
            const bread = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), breadMat);
            bread.scale.set(1.4, 0.6, 1);
            bread.position.set(bx, ty + 0.04, -0.15 + bz);
            group.add(bread);
        });

        // Cheese wedge
        const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6, 1, false, 0, Math.PI * 1.3), cheeseMat);
        cheese.position.set(0.1, ty + 0.03, -0.15 + 0.1);
        group.add(cheese);

        // Meat leg
        const meat = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.14, 6), meatMat);
        meat.rotation.z = Math.PI / 5;
        meat.position.set(-0.05, ty + 0.04, -0.22);
        group.add(meat);

        // Spoons and knives
        [[0.35, 0.0, 0.3], [-0.35, -0.08, -0.5], [0.15, 0.15, 0.8]].forEach(([ux, uz, rot]) => {
            const utensil = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 4), ironMat);
            utensil.rotation.z = Math.PI / 2;
            utensil.rotation.y = rot;
            utensil.position.set(ux, ty + 0.02, -0.15 + uz);
            group.add(utensil);
        });

        // Ceramic jug on table
        const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 8), ceramicMat);
        jug.position.set(0.38, ty + 0.05, -0.1);
        group.add(jug);
        const jugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 4, 8, Math.PI), ceramicMat);
        jugHandle.rotation.y = Math.PI / 2;
        jugHandle.position.set(0.41, ty + 0.06, -0.1);
        group.add(jugHandle);

        // ── Small prep table near left wall ──
        const t2y = addTable(-halfSize + 0.55, 0.3, 0.55, 0.4);

        // Cutting board + food
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.13), darkWoodMat);
        board.position.set(-halfSize + 0.55, t2y + 0.01, 0.3);
        group.add(board);
        const veggie = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5),
            new THREE.MeshStandardMaterial({ color: 0xcc5500, roughness: 0.8 }));
        veggie.scale.set(1.5, 0.8, 1);
        veggie.position.set(-halfSize + 0.52, t2y + 0.03, 0.3);
        group.add(veggie);
        const knife = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 0.015), ironMat);
        knife.position.set(-halfSize + 0.6, t2y + 0.02, 0.35);
        group.add(knife);

        // ── Barrels cluster — left wall area ──
        addBarrel(-halfSize + 0.3, -0.5, 0.14, 0.42, false);
        addBarrel(-halfSize + 0.3, -0.85, 0.14, 0.42, false);
        addBarrel(-halfSize + 0.55, -0.65, 0.12, 0.38, false);
        // Stacked barrel on top
        addBarrel(-halfSize + 0.3, -0.5, 0.12, 0.35, false);
        // Adjust stacked one
        group.children[group.children.length - 3].position.y = 0.42 + 0.35 / 2;

        // ── Barrels — back-left corner ──
        addBarrel(-halfSize + 0.3, halfSize - 0.4, 0.13, 0.4, false);
        addBarrel(-halfSize + 0.55, halfSize - 0.35, 0.11, 0.35, false);
        // Sideways barrel
        addBarrel(-halfSize + 0.5, halfSize - 0.65, 0.12, 0.35, true);

        // ── Shelves on left wall (simple box shelves) ──
        const shelfMat = darkWoodMat;
        [0.5, 0.8].forEach(sy => {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.8), shelfMat);
            shelf.position.set(-halfSize + 0.12, sy, 0.0);
            group.add(shelf);
        });

        // Pots on shelves
        [[-0.25, 0.08], [0.0, 0.06], [0.2, 0.07], [-0.1, 0.05]].forEach(([sz, r], idx) => {
            const shelfY = idx < 2 ? 0.5 : 0.8;
            const spoon = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, r * 1.5, 6), ceramicMat);
            spoon.position.set(-halfSize + 0.12, shelfY + 0.03 + r * 0.75, sz);
            group.add(spoon);
        });

        // ── Hanging utensils from back wall (above fireplace) ──
        [-0.45, -0.55, 0.45, 0.5].forEach((hx, idx) => {
            const utensil = new THREE.Mesh(
                new THREE.CylinderGeometry(0.006, 0.006, 0.15 + idx * 0.02, 4), ironMat
            );
            utensil.position.set(hx, 0.7 + idx * 0.05, halfSize - 0.12);
            group.add(utensil);
        });

        // ── Sacks of flour/grain (near right-front area) ──
        const sackMat = new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 0.95, metalness: 0 });
        [[0.7, 0.6], [0.85, 0.5], [0.75, 0.8]].forEach(([sx, sz]) => {
            const sack = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), sackMat);
            sack.scale.set(1, 0.7, 0.9);
            sack.position.set(sx, 0.07, sz);
            sack.castShadow = true;
            group.add(sack);
        });

        // ── Bucket near fireplace ──
        const bucketMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8, metalness: 0.1 });
        const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 8, 1, true), bucketMat);
        bucket.position.set(0.4, 0.06, halfSize - 0.3);
        group.add(bucket);
        const bucketBand = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 4, 8), bandMat);
        bucketBand.rotation.x = Math.PI / 2;
        bucketBand.position.set(0.4, 0.1, halfSize - 0.3);
        group.add(bucketBand);

        // ── Broom leaning on wall ──
        const broomStick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 4), woodMat);
        broomStick.rotation.z = 0.15;
        broomStick.position.set(halfSize - 0.2, 0.35, halfSize - 0.15);
        group.add(broomStick);
    },

    // ─── Corridors ──────────────────────────────────

    _buildCorridors() {
        const built = new Set();
        const wallMat = this._stoneMat.clone();
        wallMat.color.set(0x5a4a38);
        const layout = CastleLayout && CastleLayout.current;

        for (let from = 0; from < this._totalRooms; from++) {
            for (let to of CONNECTIONS[from]) {
                const key = Math.min(from, to) + '-' + Math.max(from, to);
                if (built.has(key)) continue;
                built.add(key);

                const fp = this.ROOM_POSITIONS[from];
                const tp = this.ROOM_POSITIONS[to];
                const isH = Math.abs(fp.z - tp.z) < 0.1;
                const corrW = 0.7;
                const wallH = 0.5;

                let gapLen, midX, midZ;
                if (layout) {
                    const fsz = layout.roomSizes[from];
                    const tsz = layout.roomSizes[to];
                    if (isH) {
                        const dir = tp.x > fp.x ? 1 : -1;
                        const fromEdge = fp.x + dir * fsz.w / 2;
                        const toEdge = tp.x - dir * tsz.w / 2;
                        gapLen = Math.abs(toEdge - fromEdge);
                        midX = (fromEdge + toEdge) / 2;
                        midZ = fp.z;
                    } else {
                        const dir = tp.z > fp.z ? 1 : -1;
                        const fromEdge = fp.z + dir * fsz.d / 2;
                        const toEdge = tp.z - dir * tsz.d / 2;
                        gapLen = Math.abs(toEdge - fromEdge);
                        midX = fp.x;
                        midZ = (fromEdge + toEdge) / 2;
                    }
                } else {
                    gapLen = this.SPACING - this.ROOM_SIZE;
                    midX = (fp.x + tp.x) / 2;
                    midZ = (fp.z + tp.z) / 2;
                }

                if (gapLen < 0.05) continue; // rooms touching, no corridor needed

                // Floor
                const floorGeom = new THREE.BoxGeometry(
                    isH ? gapLen : corrW, 0.05, isH ? corrW : gapLen
                );
                const floorMesh = new THREE.Mesh(floorGeom, this._corridorFloorMat);
                floorMesh.position.set(midX, 0.02, midZ);
                floorMesh.receiveShadow = true;
                this._scene.add(floorMesh);

                // Side walls
                for (let side = -1; side <= 1; side += 2) {
                    const swGeom = isH
                        ? new THREE.BoxGeometry(gapLen, wallH, 0.08)
                        : new THREE.BoxGeometry(0.08, wallH, gapLen);
                    const sw = new THREE.Mesh(swGeom, wallMat);
                    if (isH) sw.position.set(midX, wallH / 2, midZ + side * corrW / 2);
                    else sw.position.set(midX + side * corrW / 2, wallH / 2, midZ);
                    sw.castShadow = true;
                    this._scene.add(sw);
                }
            }
        }
    },

    _buildSecretPassages() {
        const built = new Set();
        for (let from in SECRET_PASSAGES) {
            const to = SECRET_PASSAGES[from];
            const key = Math.min(from, to) + '-' + Math.max(from, to);
            if (built.has(key)) continue;
            built.add(key);

            const fp = this.ROOM_POSITIONS[from];
            const tp = this.ROOM_POSITIONS[to];
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(fp.x, 0.5, fp.z),
                new THREE.Vector3((fp.x + tp.x) / 2, -0.8, (fp.z + tp.z) / 2),
                new THREE.Vector3(tp.x, 0.5, tp.z)
            );
            const points = curve.getPoints(40);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineDashedMaterial({
                color: 0x9B59B6, dashSize: 0.3, gapSize: 0.15,
                transparent: true, opacity: 0.5
            });
            const line = new THREE.Line(geometry, material);
            line.computeLineDistances();
            this._scene.add(line);
            this._passageLines.push(line);
        }
    },

    // ─── Tokens ─────────────────────────────────────

    _createTokens() {
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.22, 0),
            new THREE.Vector2(0.22, 0.04),
            new THREE.Vector2(0.08, 0.12),
            new THREE.Vector2(0.08, 0.30),
            new THREE.Vector2(0.14, 0.38),
            new THREE.Vector2(0.14, 0.48),
            new THREE.Vector2(0.08, 0.54),
            new THREE.Vector2(0, 0.56)
        ];
        this._tokenGeometry = new THREE.LatheGeometry(points, 16);

        this._tokenMeshes = [];
        this._tokenTargetPos = [];
        this._tokenStartPos = [];
        this._tokenAnimT = [];
        this._tokenLastRoom = [];
        for (let i = 0; i < 5; i++) {
            const color = PLAYER_COLORS_HEX[i] || 0xFFFFFF;
            const mat = new THREE.MeshStandardMaterial({
                color, roughness: 0.35, metalness: 0.4,
                emissive: color, emissiveIntensity: 0.12,
                transparent: true, opacity: 1.0
            });
            const mesh = new THREE.Mesh(this._tokenGeometry, mat);
            mesh.scale.set(0.9, 0.9, 0.9);
            mesh.castShadow = true;
            mesh.visible = false;
            this._scene.add(mesh);
            this._tokenMeshes[i] = mesh;
            this._tokenAnimT[i] = -1;
            this._tokenLastRoom[i] = -1;
            this._tokenTargetPos[i] = { x: 0, y: 0.02, z: 0 };
            this._tokenStartPos[i] = { x: 0, y: 0.02, z: 0 };
        }
    },

    // ─── Helpers ────────────────────────────────────

    _createLabel(roomIndex) {
        const div = document.createElement('div');
        div.className = 'board3d-room-label';
        div.textContent = typeof tr === 'function' ? tr(roomIndex) : (roomIndex < CORE_ROOM_COUNT ? ROOM_NAMES[roomIndex] : 'Room ' + roomIndex);
        const label = new THREE.CSS2DObject(div);
        label.position.set(0, this.WALL_HEIGHT + 0.7, 0);
        return label;
    },

    // ─── Raycasting ─────────────────────────────────

    _setupRaycasting() {
        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this._clickTargets = [];

        const layout = CastleLayout && CastleLayout.current;
        for (let i = 0; i < this._totalRooms; i++) {
            const pos = this.ROOM_POSITIONS[i];
            const pw = layout ? layout.roomSizes[i].w : this.ROOM_SIZE;
            const pd = layout ? layout.roomSizes[i].d : this.ROOM_SIZE;
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(pw, pd),
                new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
            );
            plane.rotation.x = -Math.PI / 2;
            plane.position.set(pos.x, 0.05, pos.z);
            plane.userData.roomIndex = i;
            this._scene.add(plane);
            this._clickTargets.push(plane);
        }

        // ── Distinguish click/tap vs drag (OrbitControls) ──
        let _downX = 0, _downY = 0, _downTime = 0;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const DRAG_THRESHOLD = isTouchDevice ? 15 : 6; // larger threshold for touch
        this._renderer.domElement.addEventListener('pointerdown', (e) => {
            _downX = e.clientX; _downY = e.clientY;
            _downTime = Date.now();
        });
        // Use pointerup for more reliable touch handling
        this._renderer.domElement.addEventListener('pointerup', (e) => {
            const dx = e.clientX - _downX, dy = e.clientY - _downY;
            if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return; // was a drag
            if (Date.now() - _downTime > 500) return; // long press, not a tap
            const rect = this._cachedRect || this._renderer.domElement.getBoundingClientRect();
            this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this._raycaster.setFromCamera(this._mouse, this._camera);
            const hits = this._raycaster.intersectObjects(this._clickTargets, false);
            if (hits.length > 0) Game.onRoomClick(hits[0].object.userData.roomIndex);
        });

        // Throttle hover raycasting: store mouse coords, process in _animate()
        this._hoverPending = false;
        this._hoverClientX = 0;
        this._hoverClientY = 0;
        this._topHoverEl = document.getElementById('top-room-hover');
        this._renderer.domElement.addEventListener('pointermove', (e) => {
            this._hoverClientX = e.clientX;
            this._hoverClientY = e.clientY;
            this._hoverPending = true;
        });
    },

    _setupResize(container) {
        const resize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;
            this._camera.aspect = w / h;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(w, h);
            this._css2dRenderer.setSize(w, h);
            this._cachedRect = this._renderer.domElement.getBoundingClientRect();
        };
        this._resizeObserver = new ResizeObserver(resize);
        this._resizeObserver.observe(container);
        // Initial cache
        this._cachedRect = this._renderer.domElement.getBoundingClientRect();
    },

    // ─── Public API ─────────────────────────────────

    relayout() {
        if (!this._initialized) return;
        // Read new layout positions
        if (CastleLayout && CastleLayout.current) {
            this.ROOM_POSITIONS = CastleLayout.current.roomPositions;
            this._totalRooms = CastleLayout.current.totalRooms || 9;
        }

        // Simpler approach: remove everything from scene except lights, then rebuild
        const toRemove = [];
        this._scene.traverse(child => {
            if (child === this._scene) return;
            if (child.isLight && (child.isAmbientLight || child.isDirectionalLight || child.isHemisphereLight)) return;
            toRemove.push(child);
        });
        for (const obj of toRemove) {
            if (obj.parent === this._scene) {
                this._scene.remove(obj);
            }
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }

        // Clear tracking arrays
        this._rooms = [];
        this._roomFloors = [];
        this._roomWalls = [];
        this._roomLights = [];
        this._roomDimOverlays = [];
        this._highlightRings = [];
        this._secretRing = null;
        this._passageLines = [];
        if (this._clickTargets) {
            this._clickTargets.forEach(t => { this._scene.remove(t); if (t.geometry) t.geometry.dispose(); });
            this._clickTargets = [];
        }

        // Remove token meshes and recreate
        this._tokenMeshes.forEach(m => { if (m) this._scene.remove(m); });

        // Rebuild castle with new layout
        this._buildCastle();
        this._initEventEffectAssets();
        this._createTokens();
        this._setupRaycasting();

        // Adaptive camera
        if (CastleLayout && CastleLayout.current) {
            let maxExtent = 0;
            for (const p of CastleLayout.current.roomPositions) {
                maxExtent = Math.max(maxExtent, Math.abs(p.x), Math.abs(p.z));
            }
            const dist = Math.max(14, maxExtent * 2.0 + 4);
            this._camera.position.set(0, dist, dist * 0.5);
            this._camera.lookAt(0, 0, 0);
            this._defaultCamPos = { x: 0, y: dist, z: dist * 0.5 };
            this._controls.target.set(0, 0, 0);
            this._controls.minDistance = Math.max(8, maxExtent);
            this._controls.maxDistance = Math.max(25, maxExtent * 3.5);
            this._controls.update();
        }
    },

    draw() {
        if (!this._initialized) return;
        this._updateTokens();
        this._updateRoomStates();
        this.updateNarrativeEffects();
        this._updateLabels();
    },

    updateHighlights() {
        this.highlightedRooms = [];
        this.secretHighlight = -1;
        if (GameState.phase !== PHASES.MOVING || GameState.movesRemaining <= 0) {
            this.draw(); return;
        }
        const cp = GameState.currentPlayer();
        if (!cp || !cp.isHuman) { this.draw(); return; }

        const allBlocked = [...GameState.eventBlockedRooms, ...(GameState.narrativeBlockedRooms || [])];
        this.highlightedRooms = CONNECTIONS[cp.roomIndex]
            .filter(r => !allBlocked.includes(r));
        for (let tc of (GameState.eventTempConnections || [])) {
            let target = -1;
            if (tc.from === cp.roomIndex) target = tc.to;
            else if (tc.to === cp.roomIndex) target = tc.from;
            if (target >= 0 && !allBlocked.includes(target)
                && !this.highlightedRooms.includes(target)) {
                this.highlightedRooms.push(target);
            }
        }
        if (GameState.canUseSecretPassage(cp.id)) {
            this.secretHighlight = GameState.getSecretPassageTarget(cp.id);
        }
        this.draw();
    },

    clear() {
        if (!this._initialized) return;
        this.clearEventEffects();
        this.clearNarrativeEffects();
        this.highlightedRooms = [];
        this.secretHighlight = -1;
        this._tokenMeshes.forEach(m => { if (m) m.visible = false; });
        for (let i = 0; i < 5; i++) {
            this._tokenAnimT[i] = -1;
            this._tokenLastRoom[i] = -1;
        }
        for (let i = 0; i < this._totalRooms; i++) {
            this._roomHState[i] = '';
            if (this._roomFloors[i]) this._roomFloors[i].material.emissiveIntensity = 0;
            if (this._roomWalls[i]) this._roomWalls[i].emissiveIntensity = 0;
            if (this._roomLights[i]) this._roomLights[i].intensity = 0;
            if (this._roomDimOverlays[i]) this._roomDimOverlays[i].material.opacity = 0;
        }
    },

    startPulseAnimation() {},
    stopPulseAnimation() {},

    startRenderLoop() {
        if (!this._initialized || this._animFrameId) return;
        this._clock.start();
        this._animate();
    },

    stopRenderLoop() {
        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
        }
        this._clock.stop();
    },

    // ─── Internal updates ───────────────────────────

    _updateTokens() {
        this._tokenMeshes.forEach(m => { if (m) m.visible = false; });
        if (!GameState.players || GameState.players.length === 0) return;

        // Group players by room to assign safe spots
        const roomPlayers = {};
        for (const p of GameState.players) {
            if (!roomPlayers[p.roomIndex]) roomPlayers[p.roomIndex] = [];
            roomPlayers[p.roomIndex].push(p);
        }

        for (const roomIdx in roomPlayers) {
            const ri = Number(roomIdx);
            const players = roomPlayers[ri];
            const rp = this.ROOM_POSITIONS[ri];
            const layoutSpots = CastleLayout && CastleLayout.current && CastleLayout.current.safeSpots;
            const spots = (layoutSpots ? layoutSpots[ri] : this._ROOM_SAFE_SPOTS[ri]) || [{ x: 0, z: 0 }];

            players.forEach((p, idx) => {
                const mesh = this._tokenMeshes[p.id];
                if (!mesh) return;
                // Hide non-human tokens during narrative fog
                if (GameState.narrativeHidePositions && !p.isHuman) {
                    mesh.visible = false;
                    return;
                }
                mesh.visible = true;
                mesh.material.opacity = p.isEliminated ? 0.3 : 1.0;

                // Sync pawn color from player's selected color
                const pColor = p.colorHex != null ? p.colorHex : (PLAYER_COLORS_HEX[p.id] || 0xFFFFFF);
                if (mesh.material.color.getHex() !== pColor) {
                    mesh.material.color.setHex(pColor);
                    mesh.material.emissive.setHex(pColor);
                }

                // Target position using safe spot
                const spot = spots[idx % spots.length];
                const tx = rp.x + spot.x;
                const tz = rp.z + spot.z;

                // Detect room change → trigger animation
                if (this._tokenLastRoom[p.id] !== ri && this._tokenLastRoom[p.id] >= 0) {
                    // Save current position as start
                    this._tokenStartPos[p.id] = {
                        x: mesh.position.x,
                        y: mesh.position.y,
                        z: mesh.position.z
                    };
                    this._tokenTargetPos[p.id] = { x: tx, y: 0.02, z: tz };
                    this._tokenAnimT[p.id] = 0; // start animation
                } else if (this._tokenAnimT[p.id] < 0) {
                    // Not animating — place directly at safe spot
                    mesh.position.set(tx, 0.02, tz);
                }
                // else: animating — don't touch position (handled by _animate)

                this._tokenLastRoom[p.id] = ri;
            });
        }
    },

    _updateRoomStates() {
        const anyHighlights = this.highlightedRooms.length > 0 || this.secretHighlight >= 0;

        for (let i = 0; i < this._totalRooms; i++) {
            const isH = this.highlightedRooms.includes(i);
            const isS = this.secretHighlight === i;
            const isB = GameState.eventBlockedRooms.includes(i) || (GameState.narrativeBlockedRooms && GameState.narrativeBlockedRooms.includes(i));
            const isC = GameState.players.length > 0
                && GameState.currentPlayer()
                && GameState.currentPlayer().isHuman
                && GameState.currentPlayer().roomIndex === i;

            const floor = this._roomFloors[i];
            const walls = this._roomWalls[i];
            const light = this._roomLights[i];
            const dim   = this._roomDimOverlays[i];

            // Restore base colors if they were dimmed
            if (walls && walls._baseColor) walls.color.copy(walls._baseColor);
            if (floor && floor.material._baseColor) floor.material.color.copy(floor.material._baseColor);

            // --- Highlighted (accessible room) — BRIGHT golden glow ---
            if (isH) {
                this._roomHState[i] = 'H';
                if (floor) {
                    floor.material.emissive.set(0xBB8833);
                    floor.material.emissiveIntensity = 0.7;
                }
                if (walls) {
                    walls.emissive.set(0x886622);
                    walls.emissiveIntensity = 0.6;
                }
                if (light) {
                    light.color.set(0xFFCC33);
                    light.intensity = 2.5;
                }
                if (dim) dim.material.opacity = 0;

            // --- Secret passage — purple glow ---
            } else if (isS) {
                this._roomHState[i] = 'S';
                if (floor) {
                    floor.material.emissive.set(0x7744BB);
                    floor.material.emissiveIntensity = 0.7;
                }
                if (walls) {
                    walls.emissive.set(0x553388);
                    walls.emissiveIntensity = 0.5;
                }
                if (light) {
                    light.color.set(0xBB88FF);
                    light.intensity = 2.0;
                }
                if (dim) dim.material.opacity = 0;

            // --- Blocked room — red tint ---
            } else if (isB) {
                this._roomHState[i] = 'B';
                if (floor) {
                    floor.material.emissive.set(0x661111);
                    floor.material.emissiveIntensity = 0.3;
                }
                if (walls) {
                    walls.emissive.set(0x661111);
                    walls.emissiveIntensity = 0.4;
                }
                if (light) {
                    light.color.set(0xFF3311);
                    light.intensity = 0.6;
                }
                if (dim) dim.material.opacity = 0;

            // --- Current player room — cyan glow ---
            } else if (isC && anyHighlights) {
                this._roomHState[i] = 'C';
                if (floor) {
                    floor.material.emissive.set(0x2288AA);
                    floor.material.emissiveIntensity = 0.5;
                }
                if (walls) {
                    walls.emissive.set(0x1a6680);
                    walls.emissiveIntensity = 0.4;
                }
                if (light) {
                    light.color.set(0x44CCEE);
                    light.intensity = 1.5;
                }
                if (dim) dim.material.opacity = 0;

            // --- Dimmed (not accessible, when highlights are active) ---
            } else if (anyHighlights) {
                this._roomHState[i] = 'D';
                if (floor) {
                    floor.material.emissiveIntensity = 0;
                    if (!floor.material._baseColor) floor.material._baseColor = floor.material.color.clone();
                    floor.material.color.copy(floor.material._baseColor).multiplyScalar(0.45);
                }
                if (walls) {
                    walls.emissiveIntensity = 0;
                    if (!walls._baseColor) walls._baseColor = walls.color.clone();
                    walls.color.copy(walls._baseColor).multiplyScalar(0.4);
                }
                if (light) light.intensity = 0;
                if (dim) dim.material.opacity = 0.65;

            // --- Normal (no highlights active) ---
            } else {
                this._roomHState[i] = '';
                if (floor) floor.material.emissiveIntensity = 0;
                if (walls) {
                    walls.emissiveIntensity = 0;
                    if (walls._baseColor) walls.color.copy(walls._baseColor);
                }
                if (light) light.intensity = 0;
                if (dim) dim.material.opacity = 0;
            }
        }
    },

    _updateLabels() {
        // Labels removed from 3D map – nothing to update
    },

    // ─── Event Effect Factories ───────────────────────

    _createRevueltaEffect() {
        const pos = this.ROOM_POSITIONS[4]; // Salón del Trono
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xCC2222 });
        const s1 = new THREE.Mesh(this._evtSwordGeo, mat);
        s1.rotation.z = Math.PI / 4;
        s1.position.x = -0.15;
        group.add(s1);
        const s2 = new THREE.Mesh(this._evtSwordGeo, mat);
        s2.rotation.z = -Math.PI / 4;
        s2.position.x = 0.15;
        group.add(s2);
        const gMat = new THREE.MeshBasicMaterial({ color: 0xFF4444, transparent: true, opacity: 0.4 });
        const glow = new THREE.Mesh(this._evtGlowGeo, gMat);
        glow.userData.isGlow = true;
        group.add(glow);
        group.position.set(pos.x, 2.5, pos.z);
        this._scene.add(group);
        return { group, type: 'revuelta', startTime: this._clock.getElapsedTime() };
    },

    _createAsaltoEffect() {
        const pos = this.ROOM_POSITIONS[8]; // Mazmorras
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
        for (let i = 0; i < 3; i++) {
            const keyGrp = new THREE.Group();
            const shaft = new THREE.Mesh(this._evtKeyShaftGeo, mat);
            keyGrp.add(shaft);
            const ring = new THREE.Mesh(this._evtKeyRingGeo, mat);
            ring.position.y = 0.22;
            ring.rotation.x = Math.PI / 2;
            keyGrp.add(ring);
            const angle = (i / 3) * Math.PI * 2;
            keyGrp.position.set(Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35);
            keyGrp.userData.orbitAngle = angle;
            group.add(keyGrp);
        }
        group.position.set(pos.x, 2.5, pos.z);
        this._scene.add(group);
        return { group, type: 'asalto', startTime: this._clock.getElapsedTime() };
    },

    _createIntrigaRealEffect() {
        const pos = this.ROOM_POSITIONS[4]; // Salón del Trono
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
        const base = new THREE.Mesh(this._evtCrownBaseGeo, mat);
        base.rotation.x = Math.PI / 2;
        group.add(base);
        for (let i = 0; i < 5; i++) {
            const point = new THREE.Mesh(this._evtCrownPointGeo, mat);
            const a = (i / 5) * Math.PI * 2;
            point.position.set(Math.cos(a) * 0.25, 0.12, Math.sin(a) * 0.25);
            group.add(point);
        }
        const gMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44, transparent: true, opacity: 0.3 });
        const glow = new THREE.Mesh(this._evtGlowGeo, gMat);
        glow.scale.setScalar(1.2);
        glow.userData.isGlow = true;
        group.add(glow);
        group.position.set(pos.x, 2.5, pos.z);
        this._scene.add(group);
        return { group, type: 'intriga', startTime: this._clock.getElapsedTime() };
    },

    _createTormentaEffect() {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshBasicMaterial({ color: 0x334455, transparent: true, opacity: 0.6 });
        for (let i = 0; i < this._totalRooms; i++) {
            const cloud = new THREE.Mesh(this._evtCloudGeo, baseMat.clone());
            cloud.scale.set(1, 0.4, 1);
            const rp = this.ROOM_POSITIONS[i];
            const cx = rp.x + (Math.random() - 0.5) * 1.5;
            const cz = rp.z + (Math.random() - 0.5) * 1.5;
            cloud.position.set(cx, 0, cz);
            cloud.userData.drift = { x: (Math.random() - 0.5) * 0.3, z: (Math.random() - 0.5) * 0.3 };
            cloud.userData.basePos = { x: cx, z: cz };
            group.add(cloud);
        }
        const lightning = new THREE.PointLight(0xFFFFFF, 0, 15);
        lightning.position.set(0, 0.5, 0);
        lightning.userData.isLightning = true;
        lightning.userData.nextFlash = 2 + Math.random() * 3;
        group.add(lightning);
        group.position.y = 3.5;
        this._scene.add(group);
        return { group, type: 'tormenta', startTime: this._clock.getElapsedTime() };
    },

    _createJuicioRealEffect() {
        const pos = this.ROOM_POSITIONS[4]; // Salón del Trono
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
        const pillar = new THREE.Mesh(this._evtScalePillarGeo, mat);
        pillar.position.y = -0.1;
        group.add(pillar);
        const beam = new THREE.Mesh(this._evtScaleBeamGeo, mat);
        beam.position.y = 0.2;
        beam.userData.isBeam = true;
        group.add(beam);
        const panL = new THREE.Mesh(this._evtScalePanGeo, mat);
        panL.position.set(-0.35, 0.05, 0);
        panL.userData.isPanLeft = true;
        group.add(panL);
        const panR = new THREE.Mesh(this._evtScalePanGeo, mat);
        panR.position.set(0.35, 0.05, 0);
        panR.userData.isPanRight = true;
        group.add(panR);
        group.position.set(pos.x, 2.5, pos.z);
        this._scene.add(group);
        return { group, type: 'juicio', startTime: this._clock.getElapsedTime() };
    },

    _createCategoryAura(category, roomIdx) {
        const AURA_COLORS = {
            castillo: 0xFF6622, social: 0xFFCC33,
            investigacion: 0x22AADD, caotico: 0x9944CC
        };
        const color = AURA_COLORS[category] || 0xFFCC33;
        const pos = this.ROOM_POSITIONS[roomIdx];
        const group = new THREE.Group();
        const auraMat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.35,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const aura = new THREE.Mesh(this._evtAuraGeo, auraMat);
        aura.position.y = 0.02;
        group.add(aura);
        const light = new THREE.PointLight(color, 1.5, 4);
        light.position.y = 1.0;
        group.add(light);
        group.position.set(pos.x, 0, pos.z);
        this._scene.add(group);
        return { group, type: 'aura', category, startTime: this._clock.getElapsedTime() };
    },

    _createRoomEventAura(roomIdx) {
        const tint = this.ROOM_TINTS[roomIdx] || 0x888888;
        const pos = this.ROOM_POSITIONS[roomIdx];
        const group = new THREE.Group();
        const auraMat = new THREE.MeshBasicMaterial({
            color: tint, transparent: true, opacity: 0.2,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const aura = new THREE.Mesh(this._evtAuraGeo, auraMat);
        aura.position.y = 0.02;
        group.add(aura);
        const light = new THREE.PointLight(tint, 0.8, 3);
        light.position.y = 0.8;
        group.add(light);
        group.position.set(pos.x, 0, pos.z);
        this._scene.add(group);
        return { group, type: 'roomAura', startTime: this._clock.getElapsedTime() };
    },

    // ─── Narrative Effect Factories ──────────────────────

    _createNarrFireEffect(rooms) {
        const group = new THREE.Group();
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xFF4411, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const emberMat = new THREE.MeshBasicMaterial({
            color: 0xFFCC22, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        for (const ri of rooms) {
            const pos = this.ROOM_POSITIONS[ri];
            if (!pos) continue;
            const roomGrp = new THREE.Group();
            // 6 flames per room
            for (let f = 0; f < 6; f++) {
                const mat = (f % 2 === 0) ? flameMat.clone() : emberMat.clone();
                const flame = new THREE.Mesh(this._narrFlameGeo, mat);
                const ox = (Math.random() - 0.5) * 1.4;
                const oz = (Math.random() - 0.5) * 1.4;
                flame.position.set(ox, 0.3 + Math.random() * 0.2, oz);
                flame.userData.baseY = flame.position.y;
                flame.userData.phase = Math.random() * Math.PI * 2;
                flame.userData.isFlame = true;
                roomGrp.add(flame);
            }
            // Orange-red light per room
            const light = new THREE.PointLight(0xFF6611, 2.5, 5);
            light.position.set(0, 1.2, 0);
            light.userData.isFireLight = true;
            roomGrp.add(light);
            roomGrp.position.set(pos.x, 0, pos.z);
            group.add(roomGrp);
        }
        this._scene.add(group);
        return { group, type: 'fire', startTime: this._clock.getElapsedTime() };
    },

    _createNarrStormEffect(blockedRoom) {
        const group = new THREE.Group();
        const pos = this.ROOM_POSITIONS[blockedRoom] || { x: 0, z: 0 };
        // Dark storm clouds over the blocked room
        const cloudMat = new THREE.MeshBasicMaterial({
            color: 0x222233, transparent: true, opacity: 0.55
        });
        for (let i = 0; i < 5; i++) {
            const cloud = new THREE.Mesh(this._evtCloudGeo, cloudMat.clone());
            cloud.scale.set(1.2, 0.35, 1.2);
            const cx = (Math.random() - 0.5) * 2.5;
            const cz = (Math.random() - 0.5) * 2.5;
            cloud.position.set(cx, 0, cz);
            cloud.userData.drift = { x: (Math.random() - 0.5) * 0.4, z: (Math.random() - 0.5) * 0.4 };
            cloud.userData.basePos = { x: cx, z: cz };
            cloud.userData.isCloud = true;
            group.add(cloud);
        }
        // Lightning
        const lightning = new THREE.PointLight(0xFFFFFF, 0, 10);
        lightning.position.set(0, -0.5, 0);
        lightning.userData.isLightning = true;
        lightning.userData.nextFlash = 1.5 + Math.random() * 2;
        group.add(lightning);
        // Rain drops
        const rainMat = new THREE.MeshBasicMaterial({
            color: 0x8899BB, transparent: true, opacity: 0.4
        });
        const rainGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 3);
        for (let r = 0; r < 35; r++) {
            const drop = new THREE.Mesh(rainGeo, rainMat);
            drop.position.set(
                (Math.random() - 0.5) * 2.8,
                -Math.random() * 3,
                (Math.random() - 0.5) * 2.8
            );
            drop.userData.isRain = true;
            drop.userData.speed = 6 + Math.random() * 4;
            group.add(drop);
        }
        group.position.set(pos.x, 3.2, pos.z);
        this._scene.add(group);
        return { group, type: 'storm', startTime: this._clock.getElapsedTime() };
    },

    _createNarrFogEffect() {
        const group = new THREE.Group();
        const fogMat = new THREE.MeshBasicMaterial({
            color: 0xCCCCDD, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        // Spread fog spheres across all rooms
        for (let i = 0; i < this._totalRooms; i++) {
            const rp = this.ROOM_POSITIONS[i];
            // 2 fog spheres per room
            for (let f = 0; f < 2; f++) {
                const sphere = new THREE.Mesh(this._narrFogSphereGeo, fogMat.clone());
                const ox = (Math.random() - 0.5) * 1.5;
                const oz = (Math.random() - 0.5) * 1.5;
                const baseY = 0.6 + Math.random() * 0.6;
                sphere.position.set(rp.x + ox, baseY, rp.z + oz);
                sphere.scale.setScalar(0.8 + Math.random() * 0.5);
                sphere.userData.isFog = true;
                sphere.userData.drift = {
                    x: (Math.random() - 0.5) * 0.2,
                    z: (Math.random() - 0.5) * 0.2
                };
                sphere.userData.basePos = { x: rp.x + ox, y: baseY, z: rp.z + oz };
                sphere.userData.phase = Math.random() * Math.PI * 2;
                group.add(sphere);
            }
        }
        this._scene.add(group);
        return { group, type: 'fog', startTime: this._clock.getElapsedTime() };
    },

    _createNarrDarknessEffect() {
        const group = new THREE.Group();
        // Large dark sphere enveloping the scene
        const darkGeo = new THREE.SphereGeometry(12, 16, 12);
        const darkMat = new THREE.MeshBasicMaterial({
            color: 0x000011, transparent: true, opacity: 0.4,
            side: THREE.BackSide, depthWrite: false
        });
        const darkSphere = new THREE.Mesh(darkGeo, darkMat);
        darkSphere.userData.isDarkSphere = true;
        group.add(darkSphere);
        // Dim purple flashing lights
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(0x220044, 0.3, 8);
            const angle = (i / 3) * Math.PI * 2;
            light.position.set(Math.cos(angle) * 4, 2, Math.sin(angle) * 4);
            light.userData.isDarkFlash = true;
            light.userData.nextFlash = 2 + Math.random() * 3;
            group.add(light);
        }
        group.position.set(0, 2, 0);
        this._scene.add(group);
        return { group, type: 'darkness', startTime: this._clock.getElapsedTime() };
    },

    _createNarrRitualEffect() {
        const pos = this.ROOM_POSITIONS[4]; // Salón del Trono
        const group = new THREE.Group();
        // Pentacle ring on the floor
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x9944FF, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const ring = new THREE.Mesh(this._narrRingGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        ring.userData.isRing = true;
        group.add(ring);
        // Inner ring
        const innerRingGeo = new THREE.TorusGeometry(0.45, 0.02, 8, 24);
        const innerRing = new THREE.Mesh(innerRingGeo, ringMat.clone());
        innerRing.rotation.x = -Math.PI / 2;
        innerRing.position.y = 0.04;
        group.add(innerRing);
        // 5 orbiting particles
        const orbMat = new THREE.MeshBasicMaterial({
            color: 0xBB66FF, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const orbGeo = new THREE.SphereGeometry(0.06, 6, 4);
        for (let i = 0; i < 5; i++) {
            const orb = new THREE.Mesh(orbGeo, orbMat.clone());
            const angle = (i / 5) * Math.PI * 2;
            orb.position.set(Math.cos(angle) * 0.8, 0.3, Math.sin(angle) * 0.8);
            orb.userData.isOrbiter = true;
            orb.userData.orbitAngle = angle;
            orb.userData.orbitSpeed = 1.2 + Math.random() * 0.5;
            orb.userData.orbitY = 0.2 + Math.random() * 0.3;
            group.add(orb);
        }
        // Purple light
        const light = new THREE.PointLight(0x9944FF, 2, 5);
        light.position.set(0, 1, 0);
        light.userData.isRitualLight = true;
        group.add(light);
        group.position.set(pos.x, 0, pos.z);
        this._scene.add(group);
        return { group, type: 'ritual', startTime: this._clock.getElapsedTime() };
    },

    _createNarrSkullsEffect(roomIdx) {
        const pos = this.ROOM_POSITIONS[roomIdx];
        const group = new THREE.Group();
        const skullMat = new THREE.MeshBasicMaterial({
            color: 0x88CC88, transparent: true, opacity: 0.7
        });
        const eyeMat = new THREE.MeshBasicMaterial({
            color: 0x33FF66, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        // 3 skulls
        for (let i = 0; i < 3; i++) {
            const skullGrp = new THREE.Group();
            const skull = new THREE.Mesh(this._narrSkullGeo, skullMat.clone());
            skullGrp.add(skull);
            // Eyes
            const eyeL = new THREE.Mesh(this._narrEyeGeo, eyeMat.clone());
            eyeL.position.set(-0.05, 0.02, 0.10);
            eyeL.rotation.x = Math.PI / 2;
            eyeL.userData.isEye = true;
            skullGrp.add(eyeL);
            const eyeR = new THREE.Mesh(this._narrEyeGeo, eyeMat.clone());
            eyeR.position.set(0.05, 0.02, 0.10);
            eyeR.rotation.x = Math.PI / 2;
            eyeR.userData.isEye = true;
            skullGrp.add(eyeR);
            // Jaw (smaller sphere below)
            const jawGeo = new THREE.SphereGeometry(0.08, 6, 4);
            const jaw = new THREE.Mesh(jawGeo, skullMat.clone());
            jaw.position.y = -0.09;
            jaw.scale.set(1, 0.7, 0.9);
            skullGrp.add(jaw);

            const angle = (i / 3) * Math.PI * 2;
            skullGrp.position.set(Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6);
            skullGrp.userData.isSkull = true;
            skullGrp.userData.baseY = 1.8 + Math.random() * 0.4;
            skullGrp.userData.phase = Math.random() * Math.PI * 2;
            skullGrp.userData.skullIdx = i;
            group.add(skullGrp);
        }
        // Green spectral light
        const light = new THREE.PointLight(0x33FF66, 1.5, 4);
        light.position.set(0, 2, 0);
        light.userData.isSkullLight = true;
        group.add(light);
        group.position.set(pos.x, 0, pos.z);
        this._scene.add(group);
        return { group, type: 'skulls', startTime: this._clock.getElapsedTime() };
    },

    _createNarrGlowEffect(roomIdx, color) {
        const pos = this.ROOM_POSITIONS[roomIdx];
        const group = new THREE.Group();
        const auraMat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.3,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const aura = new THREE.Mesh(this._evtAuraGeo, auraMat);
        aura.position.y = 0.03;
        group.add(aura);
        const light = new THREE.PointLight(color, 1.5, 4);
        light.position.y = 1.0;
        group.add(light);
        group.position.set(pos.x, 0, pos.z);
        this._scene.add(group);
        return { group, type: 'glow', startTime: this._clock.getElapsedTime() };
    },

    // ─── Narrative Effect Sync ──────────────────────

    updateNarrativeEffects() {
        if (!this._initialized || !this._scene) return;
        const active = (GameState.activeNarrativeEvents || []);
        const activeIds = new Set(active.map(ne => ne.def.id));
        const renderedIds = new Set(this._narrativeEffects.map(ne => ne.id));

        // Remove effects no longer active
        this._narrativeEffects = this._narrativeEffects.filter(neff => {
            if (!activeIds.has(neff.id)) {
                neff.group.traverse(child => {
                    if (child.isMesh && child.material) child.material.dispose();
                    if (child.geometry && !this._isSharedNarrGeo(child.geometry)) child.geometry.dispose();
                });
                this._scene.remove(neff.group);
                return false;
            }
            return true;
        });

        // Create effects for newly active events
        for (const ne of active) {
            if (renderedIds.has(ne.def.id)) continue;
            let eff = null;
            switch (ne.def.id) {
                case 'narr_incendio_ala':
                    eff = this._createNarrFireEffect(ne.def.blockedRooms || [1, 2]);
                    break;
                case 'narr_tormenta':
                    eff = this._createNarrStormEffect(7);
                    break;
                case 'narr_niebla':
                    eff = this._createNarrFogEffect();
                    break;
                case 'narr_oscuridad_total':
                    eff = this._createNarrDarknessEffect();
                    break;
                case 'narr_ritual_prohibido':
                    eff = this._createNarrRitualEffect();
                    break;
                case 'narr_fuga_mazmorras':
                    eff = this._createNarrSkullsEffect(8);
                    break;
                case 'narr_investigacion_real':
                    eff = this._createNarrGlowEffect(4, 0xFFCC33);
                    break;
                case 'narr_consejo_emergencia':
                    eff = this._createNarrGlowEffect(5, 0x3388DD);
                    break;
                case 'narr_caceria_traidores':
                    eff = this._createNarrGlowEffect(4, 0xCC2222);
                    break;
                case 'narr_archivos_secretos':
                    eff = this._createNarrGlowEffect(1, 0x22CC66);
                    break;
                case 'narr_testigo_protegido':
                    eff = this._createNarrGlowEffect(8, 0x22CC66);
                    break;
                case 'narr_analisis_alquimico':
                    eff = this._createNarrGlowEffect(0, 0x22AADD);
                    break;
            }
            if (eff) {
                eff.id = ne.def.id;
                this._narrativeEffects.push(eff);
            }
        }
    },

    _isSharedNarrGeo(geo) {
        return geo === this._narrFlameGeo || geo === this._narrFogSphereGeo
            || geo === this._narrSkullGeo || geo === this._narrEyeGeo
            || geo === this._narrRingGeo || geo === this._evtCloudGeo
            || geo === this._evtAuraGeo || geo === this._evtGlowGeo;
    },

    clearNarrativeEffects() {
        for (const neff of this._narrativeEffects) {
            neff.group.traverse(child => {
                if (child.isMesh && child.material) child.material.dispose();
                if (child.geometry && !this._isSharedNarrGeo(child.geometry)) child.geometry.dispose();
            });
            this._scene.remove(neff.group);
        }
        this._narrativeEffects = [];
    },

    // ─── Event Effect API ─────────────────────────────

    showEventEffect(eventData, roomIndex) {
        this.clearEventEffects();
        if (!this._initialized || !this._scene) return;
        const majorIds = ['revuelta', 'asalto_mazmorras', 'intriga_real', 'noche_tormenta', 'juicio_real'];
        if (majorIds.includes(eventData.id)) {
            let eff;
            switch (eventData.id) {
                case 'revuelta': eff = this._createRevueltaEffect(); break;
                case 'asalto_mazmorras': eff = this._createAsaltoEffect(); break;
                case 'intriga_real': eff = this._createIntrigaRealEffect(); break;
                case 'noche_tormenta': eff = this._createTormentaEffect(); break;
                case 'juicio_real': eff = this._createJuicioRealEffect(); break;
            }
            if (eff) this._eventEffects.push(eff);
        } else if (eventData.category) {
            const ri = roomIndex >= 0 ? roomIndex : 4;
            this._eventEffects.push(this._createCategoryAura(eventData.category, ri));
        } else {
            const ri = roomIndex >= 0 ? roomIndex : 4;
            this._eventEffects.push(this._createRoomEventAura(ri));
        }
    },

    clearEventEffects() {
        for (const eff of this._eventEffects) {
            eff.group.traverse(child => {
                if (child.isMesh && child.material) child.material.dispose();
            });
            this._scene.remove(eff.group);
        }
        this._eventEffects = [];
    },

    // ─── Animation loop ─────────────────────────────

    _animate() {
        this._animFrameId = requestAnimationFrame(() => this._animate());
        const dt = this._clock.getDelta();
        const elapsed = this._clock.getElapsedTime();

        if (this._controls) this._controls.update();

        // Camera focus animation (zoom to room)
        if (this._cameraFocusing) {
            this._cameraFocusT = Math.min(this._cameraFocusT + dt / this._CAMERA_FOCUS_DURATION, 1);
            const e = 1 - Math.pow(1 - this._cameraFocusT, 3);
            const sf = this._cameraFocusFrom;
            const stf = this._cameraFocusTargetFrom;
            const dp = this._cameraFocusDest;
            const dtt = this._cameraFocusTargetDest;
            this._camera.position.set(
                sf.x + (dp.x - sf.x) * e,
                sf.y + (dp.y - sf.y) * e,
                sf.z + (dp.z - sf.z) * e
            );
            this._controls.target.set(
                stf.x + (dtt.x - stf.x) * e,
                stf.y + (dtt.y - stf.y) * e,
                stf.z + (dtt.z - stf.z) * e
            );
            if (this._cameraFocusT >= 1) {
                this._cameraFocusing = false;
            }
        }
        // Camera reset animation
        else if (this._cameraResetting) {
            this._cameraResetT = Math.min(this._cameraResetT + dt / this._CAMERA_RESET_DURATION, 1);
            // Ease out cubic
            const e = 1 - Math.pow(1 - this._cameraResetT, 3);
            const sf = this._cameraResetFrom;
            const stf = this._cameraResetTargetFrom;
            const dp = this._defaultCamPos;
            const dtt = this._defaultCamTarget;
            this._camera.position.set(
                sf.x + (dp.x - sf.x) * e,
                sf.y + (dp.y - sf.y) * e,
                sf.z + (dp.z - sf.z) * e
            );
            this._controls.target.set(
                stf.x + (dtt.x - stf.x) * e,
                stf.y + (dtt.y - stf.y) * e,
                stf.z + (dtt.z - stf.z) * e
            );
            if (this._cameraResetT >= 1) {
                this._cameraResetting = false;
            }
        }

        // Show/hide reset button (only update DOM when state changes)
        if (this._resetBtn) {
            const dev = this._getCameraDeviation();
            const show = !this._cameraResetting && dev > this._CAMERA_DEVIATION_THRESHOLD;
            if (show !== this._resetBtnVisible) {
                this._resetBtnVisible = show;
                this._resetBtn.classList.toggle('visible', show);
            }
        }

        // ─── Day/night cycle transition ──────────────
        if (this._timePeriodTransitionT >= 0 && this._timePeriodTarget) {
            this._timePeriodTransitionT = Math.min(this._timePeriodTransitionT + dt / this._TIME_PERIOD_TRANSITION_DURATION, 1);
            const raw = this._timePeriodTransitionT;
            const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
            const tgt = TIME_PERIOD_LIGHTING[this._timePeriodTarget];
            const frm = this._timePeriodFrom;
            const tBg = new THREE.Color(tgt.background);
            const tFog = new THREE.Color(tgt.fog);
            const tAmb = new THREE.Color(tgt.ambientColor);
            const tDir = new THREE.Color(tgt.dirColor);
            const tHSky = new THREE.Color(tgt.hemiSky);
            const tHGnd = new THREE.Color(tgt.hemiGround);

            this._scene.background.lerpColors(frm.background, tBg, e);
            if (this._scene.fog) {
                this._scene.fog.color.lerpColors(frm.fog, tFog, e);
                this._scene.fog.density = frm.fogDensity + (tgt.fogDensity - frm.fogDensity) * e;
            }
            this._ambientLight.color.lerpColors(frm.ambientColor, tAmb, e);
            this._ambientLight.intensity = frm.ambientIntensity + (tgt.ambientIntensity - frm.ambientIntensity) * e;
            this._directionalLight.color.lerpColors(frm.dirColor, tDir, e);
            this._directionalLight.intensity = frm.dirIntensity + (tgt.dirIntensity - frm.dirIntensity) * e;
            this._directionalLight.position.set(
                frm.dirPosition.x + (tgt.dirPosition.x - frm.dirPosition.x) * e,
                frm.dirPosition.y + (tgt.dirPosition.y - frm.dirPosition.y) * e,
                frm.dirPosition.z + (tgt.dirPosition.z - frm.dirPosition.z) * e
            );
            this._hemisphereLight.color.lerpColors(frm.hemiSky, tHSky, e);
            this._hemisphereLight.groundColor.lerpColors(frm.hemiGround, tHGnd, e);
            this._hemisphereLight.intensity = frm.hemiIntensity + (tgt.hemiIntensity - frm.hemiIntensity) * e;

            const newTorchBase = frm.torchIntensity + (tgt.torchIntensity - frm.torchIntensity) * e;
            const newTorchRange = frm.torchRange + (tgt.torchRange - frm.torchRange) * e;
            this._torchLights.forEach(tl => {
                tl._basePeriodIntensity = newTorchBase;
                tl.distance = newTorchRange;
            });

            if (this._timePeriodTransitionT >= 1) {
                this._timePeriod = this._timePeriodTarget;
                this._timePeriodTarget = null;
                this._timePeriodTransitionT = -1;
                this._timePeriodFrom = null;
            }
        }

        // Process throttled hover raycast (once per frame max)
        if (this._hoverPending) {
            this._hoverPending = false;
            const rect = this._cachedRect || this._renderer.domElement.getBoundingClientRect();
            this._mouse.x = ((this._hoverClientX - rect.left) / rect.width) * 2 - 1;
            this._mouse.y = -((this._hoverClientY - rect.top) / rect.height) * 2 + 1;
            this._raycaster.setFromCamera(this._mouse, this._camera);
            const hits = this._raycaster.intersectObjects(this._clickTargets, false);
            if (hits.length > 0) {
                const idx = hits[0].object.userData.roomIndex;
                const clickable = this.highlightedRooms.includes(idx) || this.secretHighlight === idx;
                this._renderer.domElement.style.cursor = clickable ? 'pointer' : 'default';
                if (idx !== this._hoveredRoomIndex) {
                    if (this._topHoverEl) {
                        this._topHoverEl.textContent = typeof tr === 'function' ? tr(idx) : (idx < CORE_ROOM_COUNT ? ROOM_NAMES[idx] : 'Room ' + idx);
                        this._topHoverEl.classList.add('visible');
                    }
                    this._hoveredRoomIndex = idx;
                }
            } else {
                this._renderer.domElement.style.cursor = 'default';
                if (this._hoveredRoomIndex >= 0) {
                    if (this._topHoverEl) this._topHoverEl.classList.remove('visible');
                    this._hoveredRoomIndex = -1;
                }
            }
        }

        // Room illumination pulse (precompute sines once per frame)
        const sinH = 0.5 + 0.5 * Math.sin(elapsed * 2.2);
        const sinS = 0.5 + 0.5 * Math.sin(elapsed * 2.2 + 1);
        const sinC = 0.5 + 0.5 * Math.sin(elapsed * 1.5);
        for (let i = 0; i < this._totalRooms; i++) {
            const st = this._roomHState[i];
            if (!st || st === 'D' || st === '') continue;

            const floor = this._roomFloors[i];
            const light = this._roomLights[i];
            const walls = this._roomWalls[i];

            if (st === 'H' && floor && light) {
                floor.material.emissiveIntensity = 0.5 + 0.4 * sinH;
                light.intensity = 1.8 + 1.4 * sinH;
                if (walls) walls.emissiveIntensity = 0.4 + 0.35 * sinH;
            } else if (st === 'S' && floor && light) {
                floor.material.emissiveIntensity = 0.5 + 0.35 * sinS;
                light.intensity = 1.5 + 1.0 * sinS;
                if (walls) walls.emissiveIntensity = 0.35 + 0.3 * sinS;
            } else if (st === 'C' && floor && light) {
                floor.material.emissiveIntensity = 0.35 + 0.25 * sinC;
                light.intensity = 1.0 + 0.8 * sinC;
                if (walls) walls.emissiveIntensity = 0.25 + 0.2 * sinC;
            }
        }

        // Torch flicker (lights + flame scale) — precompute base sines
        {
            const sinE5 = Math.sin(elapsed * 5);
            const cosE5 = Math.cos(elapsed * 5);
            const sinE6 = Math.sin(elapsed * 6);
            const sinE7 = Math.sin(elapsed * 7);
            const sinE4 = Math.sin(elapsed * 4);
            for (let i = 0; i < this._torchLights.length; i++) {
                const light = this._torchLights[i];
                const base = light._basePeriodIntensity || 0.5;
                // Approximate sin(elapsed*5 + idx*2.1) using angle addition
                const phase = i * 2.1;
                const sp = Math.sin(phase), cp = Math.cos(phase);
                light.intensity = base + 0.2 * (sinE5 * cp + cosE5 * sp);
            }
            for (let i = 0; i < this._torchFlames.length; i++) {
                const flame = this._torchFlames[i];
                const s = 1.0 + 0.15 * Math.sin(elapsed * 6 + i * 1.3);
                flame.scale.set(s, 1.0 + 0.1 * Math.sin(elapsed * 7 + i), s);
                flame.material.opacity = 0.7 + 0.15 * Math.sin(elapsed * 4 + i * 0.9);
            }
        }

        // ─── Event effects animation ─────────────────
        if (this._eventEffects.length > 0) {
            for (const eff of this._eventEffects) {
                const et = elapsed - eff.startTime;
                if (eff.type === 'revuelta' || eff.type === 'intriga' || eff.type === 'asalto') {
                    eff.group.rotation.y += dt * 1.2;
                    eff.group.position.y = 2.5 + 0.2 * Math.sin(et * 2);
                    // Use cached glow children to avoid traverse()
                    if (!eff._glowCache) {
                        eff._glowCache = [];
                        eff.group.traverse(child => {
                            if (child.userData && child.userData.isGlow) eff._glowCache.push(child);
                        });
                    }
                    const glowOp = 0.25 + 0.2 * Math.sin(et * 3);
                    for (let g = 0; g < eff._glowCache.length; g++) {
                        eff._glowCache[g].material.opacity = glowOp;
                    }
                } else if (eff.type === 'tormenta') {
                    eff.group.children.forEach(child => {
                        if (child.isMesh) {
                            const bp = child.userData.basePos;
                            const dr = child.userData.drift;
                            if (bp && dr) {
                                child.position.x = bp.x + Math.sin(et * 0.5 + bp.x) * dr.x;
                                child.position.z = bp.z + Math.cos(et * 0.5 + bp.z) * dr.z;
                            }
                            child.material.opacity = 0.4 + 0.2 * Math.sin(et * 1.5 + child.position.x);
                        }
                        if (child.userData && child.userData.isLightning) {
                            child.userData.nextFlash -= dt;
                            if (child.userData.nextFlash <= 0) {
                                child.intensity = 8;
                                child.userData.nextFlash = 2 + Math.random() * 3;
                            } else {
                                child.intensity *= 0.85;
                            }
                        }
                    });
                } else if (eff.type === 'juicio') {
                    eff.group.rotation.y += dt * 0.8;
                    eff.group.position.y = 2.5 + 0.15 * Math.sin(et * 1.5);
                    const tilt = Math.sin(et * 1.5) * 0.15;
                    if (!eff._partsCache) {
                        eff._partsCache = { beams: [], panLefts: [], panRights: [] };
                        eff.group.traverse(child => {
                            if (child.userData) {
                                if (child.userData.isBeam) eff._partsCache.beams.push(child);
                                if (child.userData.isPanLeft) eff._partsCache.panLefts.push(child);
                                if (child.userData.isPanRight) eff._partsCache.panRights.push(child);
                            }
                        });
                    }
                    for (const b of eff._partsCache.beams) b.rotation.z = tilt;
                    for (const p of eff._partsCache.panLefts) p.position.y = 0.05 - tilt * 0.5;
                    for (const p of eff._partsCache.panRights) p.position.y = 0.05 + tilt * 0.5;
                } else if (eff.type === 'aura') {
                    const speed = eff.category === 'caotico' ? 6 : 2.5;
                    const pulse = 0.5 + 0.5 * Math.sin(et * speed);
                    eff.group.children.forEach(child => {
                        if (child.isMesh) child.material.opacity = 0.2 + 0.25 * pulse;
                        if (child.isLight) child.intensity = 1.0 + 1.0 * pulse;
                    });
                } else if (eff.type === 'roomAura') {
                    const pulse = 0.5 + 0.5 * Math.sin(et * 2);
                    eff.group.children.forEach(child => {
                        if (child.isMesh) child.material.opacity = 0.12 + 0.12 * pulse;
                        if (child.isLight) child.intensity = 0.5 + 0.5 * pulse;
                    });
                }
            }
        }

        // ─── Narrative effects animation ─────────────────
        if (this._narrativeEffects.length > 0) {
            for (const neff of this._narrativeEffects) {
                const nt = elapsed - neff.startTime;

                if (neff.type === 'fire') {
                    if (!neff._cache) {
                        neff._cache = { flames: [], lights: [] };
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isFlame) neff._cache.flames.push(child);
                            if (child.userData && child.userData.isFireLight) neff._cache.lights.push(child);
                        });
                    }
                    for (const child of neff._cache.flames) {
                        const p = child.userData.phase;
                        child.scale.y = 1.0 + 0.4 * Math.sin(nt * 8 + p);
                        child.scale.x = 1.0 + 0.15 * Math.sin(nt * 6 + p + 1);
                        child.scale.z = child.scale.x;
                        child.position.y = child.userData.baseY + 0.15 * Math.sin(nt * 7 + p);
                        child.material.opacity = 0.5 + 0.35 * Math.sin(nt * 6 + p);
                    }
                    for (const child of neff._cache.lights) {
                        child.intensity = 2.0 + 1.2 * Math.sin(nt * 5 + child.position.x);
                    }

                } else if (neff.type === 'storm') {
                    if (!neff._cache) {
                        neff._cache = { clouds: [], lightnings: [], rains: [] };
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isCloud) neff._cache.clouds.push(child);
                            if (child.userData && child.userData.isLightning) neff._cache.lightnings.push(child);
                            if (child.userData && child.userData.isRain) neff._cache.rains.push(child);
                        });
                    }
                    for (const child of neff._cache.clouds) {
                        const bp = child.userData.basePos;
                        const dr = child.userData.drift;
                        child.position.x = bp.x + Math.sin(nt * 0.5 + bp.x) * dr.x;
                        child.position.z = bp.z + Math.cos(nt * 0.5 + bp.z) * dr.z;
                        child.material.opacity = 0.4 + 0.2 * Math.sin(nt * 1.5 + child.position.x);
                    }
                    for (const child of neff._cache.lightnings) {
                        child.userData.nextFlash -= dt;
                        if (child.userData.nextFlash <= 0) {
                            child.intensity = 10;
                            child.userData.nextFlash = 1.5 + Math.random() * 2.5;
                        } else {
                            child.intensity *= 0.85;
                        }
                    }
                    for (const child of neff._cache.rains) {
                        child.position.y -= dt * child.userData.speed;
                        if (child.position.y < -3.2) {
                            child.position.y = 0;
                            child.position.x = (Math.random() - 0.5) * 2.8;
                            child.position.z = (Math.random() - 0.5) * 2.8;
                        }
                    }

                } else if (neff.type === 'fog') {
                    if (!neff._cache) {
                        neff._cache = [];
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isFog) neff._cache.push(child);
                        });
                    }
                    for (const child of neff._cache) {
                        const bp = child.userData.basePos;
                        const dr = child.userData.drift;
                        const p = child.userData.phase;
                        child.position.x = bp.x + Math.sin(nt * 0.3 + p) * dr.x * 2;
                        child.position.z = bp.z + Math.cos(nt * 0.25 + p) * dr.z * 2;
                        child.position.y = bp.y + 0.1 * Math.sin(nt * 0.4 + p);
                        child.material.opacity = 0.12 + 0.08 * Math.sin(nt * 1.5 + p);
                    }

                } else if (neff.type === 'darkness') {
                    if (!neff._cache) {
                        neff._cache = { spheres: [], flashes: [] };
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isDarkSphere) neff._cache.spheres.push(child);
                            if (child.userData && child.userData.isDarkFlash) neff._cache.flashes.push(child);
                        });
                    }
                    const darkOp = 0.35 + 0.1 * Math.sin(nt * 2);
                    for (const child of neff._cache.spheres) {
                        child.material.opacity = darkOp;
                    }
                    for (const child of neff._cache.flashes) {
                        child.userData.nextFlash -= dt;
                        if (child.userData.nextFlash <= 0) {
                            child.intensity = 1.5;
                            child.userData.nextFlash = 3 + Math.random() * 4;
                        } else {
                            child.intensity *= 0.92;
                            if (child.intensity < 0.1) child.intensity = 0.1;
                        }
                    }

                } else if (neff.type === 'ritual') {
                    if (!neff._cache) {
                        neff._cache = { rings: [], orbiters: [], lights: [] };
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isRing) neff._cache.rings.push(child);
                            if (child.userData && child.userData.isOrbiter) neff._cache.orbiters.push(child);
                            if (child.userData && child.userData.isRitualLight) neff._cache.lights.push(child);
                        });
                    }
                    for (const child of neff._cache.rings) child.rotation.z += dt * 0.3;
                    for (const child of neff._cache.orbiters) {
                        child.userData.orbitAngle += dt * child.userData.orbitSpeed;
                        const a = child.userData.orbitAngle;
                        child.position.x = Math.cos(a) * 0.8;
                        child.position.z = Math.sin(a) * 0.8;
                        child.position.y = child.userData.orbitY + 0.15 * Math.sin(nt * 3 + a);
                        child.material.opacity = 0.5 + 0.3 * Math.sin(nt * 4 + a);
                    }
                    const ritualLightI = 1.5 + 0.8 * Math.sin(nt * 3);
                    for (const child of neff._cache.lights) child.intensity = ritualLightI;

                } else if (neff.type === 'skulls') {
                    if (!neff._cache) {
                        neff._cache = { skulls: [], eyes: [], lights: [] };
                        neff.group.traverse(child => {
                            if (child.userData && child.userData.isSkull) neff._cache.skulls.push(child);
                            if (child.userData && child.userData.isEye) neff._cache.eyes.push(child);
                            if (child.userData && child.userData.isSkullLight) neff._cache.lights.push(child);
                        });
                    }
                    for (const child of neff._cache.skulls) {
                        const p = child.userData.phase;
                        child.position.y = child.userData.baseY + 0.2 * Math.sin(nt * 2 + p);
                        child.rotation.y += dt * 0.8;
                    }
                    for (const child of neff._cache.eyes) {
                        child.material.opacity = 0.6 + 0.4 * Math.sin(nt * 4 + child.position.x * 10);
                    }
                    const skullLightI = 1.0 + 0.5 * Math.sin(nt * 2.5);
                    for (const child of neff._cache.lights) child.intensity = skullLightI;

                } else if (neff.type === 'glow') {
                    const pulse = 0.5 + 0.5 * Math.sin(nt * 2.5);
                    neff.group.children.forEach(child => {
                        if (child.isMesh) child.material.opacity = 0.2 + 0.25 * pulse;
                        if (child.isLight) child.intensity = 1.0 + 1.0 * pulse;
                    });
                }
            }
        }

        // Token movement animation + bob
        this._tokenMeshes.forEach((mesh, idx) => {
            if (!mesh || !mesh.visible) return;
            const t = this._tokenAnimT[idx];
            if (t >= 0) {
                // Animate movement with arc
                const newT = Math.min(t + dt / this._MOVE_DURATION, 1);
                this._tokenAnimT[idx] = newT;
                // Ease in-out cubic
                const e = newT < 0.5
                    ? 4 * newT * newT * newT
                    : 1 - Math.pow(-2 * newT + 2, 3) / 2;
                const sp = this._tokenStartPos[idx];
                const tp = this._tokenTargetPos[idx];
                mesh.position.x = sp.x + (tp.x - sp.x) * e;
                mesh.position.z = sp.z + (tp.z - sp.z) * e;
                // Parabolic arc (peak at midpoint)
                mesh.position.y = 0.02 + this._MOVE_ARC_HEIGHT * Math.sin(newT * Math.PI);
                if (newT >= 1) {
                    // Snap to final position
                    mesh.position.set(tp.x, 0.02, tp.z);
                    this._tokenAnimT[idx] = -1;
                }
            } else {
                // Normal bobbing when idle
                mesh.position.y = 0.02 + 0.02 * Math.sin(elapsed * 2 + idx * 0.8);
            }
        });

        this._renderer.render(this._scene, this._camera);
        // Throttle CSS2D label rendering (labels don't need 60fps updates)
        if (++this._css2dFrame >= this._CSS2D_INTERVAL) {
            this._css2dFrame = 0;
            this._css2dRenderer.render(this._scene, this._camera);
        }
    }
};
