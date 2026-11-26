/* Act I of the journey — The Record.
   The table is time. Walk it back to 1621, past the end of it into the land before,
   then ride back up to tonight. Every number here is one we can stand behind. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;

  /* ---------- where things are ---------- */
  const TOP = 0.76, SEAT = 0.78;
  const zOf = (y) => 0.15 - ((2026 - y) / 2) * SEAT;               // the seat of a year, along the table
  const xOf = (y) => ((2026 - y) % 2 ? 1 : -1) * 0.36;              // which side it sits on
  const yearAtZ = (z) => 2026 - ((0.15 - z) / SEAT) * 2;
  const END = -150.2;                                                // the dressed table stops about here (1640)
  const FIRE = [2.4, 0, -156.4];                                     // the 1621 fire
  const PATUXET = [9, 0, -226];
  const MALAGA = [62, 0, -640];
  const ENGLAND = [-46, 0, -716];

  const S = {}; // everything built, shared by the beats

  /* ---------- small builders ---------- */
  function rotBox(T, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    const g = new T.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); if (rz) g.rotateZ(rz);
    g.translate(x, y, z); return g;
  }
  // textures drawn with period type get redrawn once the fonts arrive
  const redraws = [];
  function drawnTex(W, w, h, draw) {
    const tex = W.canvasTex(w, h, draw);
    redraws.push(() => { const c = tex.image, x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); draw(x, c.width, c.height); tex.needsUpdate = true; });
    return tex;
  }
  function paperTex(W, w, h, draw) {
    const t = drawnTex(W, w, h, (x, cw, ch) => {
      x.fillStyle = '#e9dcc0'; x.fillRect(0, 0, cw, ch);
      for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(110,80,40,${Math.random() * 0.06})`; x.fillRect(Math.random() * cw, Math.random() * ch, 2, 1); }
      const g = x.createRadialGradient(cw / 2, ch / 2, cw * 0.2, cw / 2, ch / 2, cw * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,25,.35)');
      x.fillStyle = g; x.fillRect(0, 0, cw, ch);
      draw(x, cw, ch);
    });
    return t;
  }
  const FELL = '"IM Fell Double Pica", Georgia, serif';
  const FELLSC = '"IM Fell English SC", Georgia, serif';

  /* ---------- the light-figures: 140 people, abstract and warm ---------- */
  const FIG_V = `
    attribute float aLit; attribute float aHue; attribute float aSeed;
    uniform float uTime;
    varying vec2 vUv; varying float vLit; varying float vHue; varying float vSeed;
    void main(){
      vUv = uv; vLit = aLit; vHue = aHue; vSeed = aSeed;
      vec4 base = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float s = length(instanceMatrix[1].xyz);
      vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
      right.y = 0.0; right = normalize(right + vec3(1e-5));
      vec3 p = base.xyz + right * position.x * s + vec3(0.0, position.y * s, 0.0);
      p += right * sin(uTime * 0.7 + aSeed * 6.2831) * 0.012 * position.y;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
    }`;
  const FIG_F = `
    uniform float uTime;
    varying vec2 vUv; varying float vLit; varying float vHue; varying float vSeed;
    void main(){
      if (vLit < 0.005) discard;
      vec2 m = vec2((vUv.x - 0.5) * 0.62, vUv.y * 1.8);
      float y = m.y, ax = abs(m.x);
      // a person, abstractly: robe, torso, shoulders, neck, head
      float hw = y < 0.85 ? mix(0.105, 0.125, y / 0.85)
               : y < 1.3 ? mix(0.125, 0.172, (y - 0.85) / 0.45)
               : y < 1.42 ? 0.172 * sqrt(max(0.0, 1.0 - pow((y - 1.3) / 0.12, 2.0)))
               : 0.0;
      hw = max(hw, y > 1.36 && y < 1.5 ? 0.042 : 0.0);
      float body = smoothstep(hw, hw - 0.028, ax) * smoothstep(0.0, 0.05, y);
      float hd = length(m - vec2(0.0, 1.585));
      float head = smoothstep(0.102, 0.078, hd);
      float shape = max(body, head);
      float rim = max(body * smoothstep(hw - 0.06, hw - 0.012, ax), head * smoothstep(0.05, 0.095, hd));
      float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(1.0, 0.9, vUv.y);
      float aura = exp(-dot(m - vec2(0.0, 0.95), m - vec2(0.0, 0.95)) * 3.0) * 0.06 * edge;
      float flick = 0.9 + 0.1 * sin(uTime * 2.7 + vSeed * 31.0);
      vec3 col = mix(vec3(1.0, 0.6, 0.26), vec3(0.95, 0.86, 0.72), vHue);
      gl_FragColor = vec4(col * (shape * 0.16 + rim * 0.62 + aura) * vLit * flick, 1.0);
    }`;

  function buildFigures(group, W) {
    const T = W.T, rnd = U.seeded(1621);
    const N = 154;
    const g = new T.PlaneGeometry(0.62, 1.8); g.translate(0, 0.9, 0);
    const aLit = new Float32Array(N), aHue = new Float32Array(N), aSeed = new Float32Array(N);
    g.setAttribute('aLit', new T.InstancedBufferAttribute(aLit, 1));
    g.setAttribute('aHue', new T.InstancedBufferAttribute(aHue, 1));
    g.setAttribute('aSeed', new T.InstancedBufferAttribute(aSeed, 1));
    const mat = new T.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: FIG_V, fragmentShader: FIG_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true });
    const mesh = new T.InstancedMesh(g, mat, N); mesh.frustumCulled = false; group.add(mesh);
    const figs = [];
    // 50 English: at the trestle tables and by the fire
    for (let i = 0; i < 50; i++) {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = -151.2 - row * 0.4 - rnd() * 0.15;
      const x = side * (0.95 + (row % 3) * 0.32 + rnd() * 0.2);
      figs.push({ group: 'en', home: [x, 0, z], start: [x, 0, z], pos: [x, 0, z], s: 0.92 + rnd() * 0.14 });
      aHue[i] = 1;
    }
    // 90 Wampanoag men with Massasoit: they come in from the dark woods
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 1.7 - Math.PI * 0.85 + (rnd() - 0.5) * 0.08;
      const r = 3.2 + (i % 4) * 0.75 + rnd() * 0.5;
      const home = [FIRE[0] - 0.6 + Math.sin(a) * r * 1.25, 0, FIRE[2] - 2.2 - Math.cos(a) * r * 0.85 + 2.6];
      const start = [home[0] * 2.6 + (rnd() - 0.5) * 6, 0, -178 - rnd() * 14];
      figs.push({ group: 'wa', home, start, pos: start.slice(), s: 0.94 + rnd() * 0.14, delay: rnd() * 2.6 });
      aHue[50 + i] = 0;
    }
    // 14 who gather on Cole's Hill (1970 and every year since)
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, r = 1.5 + rnd() * 0.6;
      const p = [S.hill[0] + Math.cos(a) * r, S.hillTop - 0.12 - r * 0.08, S.hill[2] + Math.sin(a) * r * 0.8];
      figs.push({ group: 'hill', home: p, start: p, pos: p.slice(), s: 0.9 + rnd() * 0.12 });
      aHue[140 + i] = 0.5;
    }
    for (let i = 0; i < N; i++) aSeed[i] = rnd();
    // the four: English women by the fire
    S.four = [6, 13, 20, 27];
    S.fig = { mesh, figs, aLit, target: new Float32Array(N), mat, N };
    placeFigures();
  }
  function placeFigures() {
    const F = S.fig, o = new S.T.Object3D();
    F.figs.forEach((f, i) => { o.position.set(f.pos[0], f.pos[1], f.pos[2]); o.scale.setScalar(f.s); o.updateMatrix(); F.mesh.setMatrixAt(i, o.matrix); });
    F.mesh.instanceMatrix.needsUpdate = true;
  }
  function figTargets(fn) { const F = S.fig; F.figs.forEach((f, i) => { F.target[i] = fn(f, i); }); }

  /* ---------- glowing points (village fires, the traveller) ---------- */
  const GLOW_V = `
    attribute float aLit; attribute float aSeed; attribute float aSize;
    uniform float uScale; uniform float uTime;
    varying float vLit; varying float vSeed;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * uScale / max(-mv.z, 0.1);
      vLit = aLit; vSeed = aSeed;
    }`;
  const GLOW_F = `
    uniform float uTime; uniform vec3 uCol;
    varying float vLit; varying float vSeed;
    void main(){
      if (vLit < 0.01) discard;
      float r = length(gl_PointCoord - 0.5) * 2.0;
      float a = pow(max(0.0, 1.0 - r), 2.6) * 0.8 + smoothstep(0.22, 0.0, r) * 1.6;
      float f = 0.85 + 0.15 * sin(uTime * (3.0 + vSeed * 4.0) + vSeed * 50.0);
      gl_FragColor = vec4(uCol * a * vLit * f, 1.0);
    }`;
  function glowPoints(T, group, positions, o = {}) {
    const n = positions.length / 3;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(positions), 3));
    const lit = new Float32Array(n), seed = new Float32Array(n), size = new Float32Array(n);
    for (let i = 0; i < n; i++) { seed[i] = Math.random(); size[i] = (o.size || 1) * (0.7 + Math.random() * 0.6); }
    g.setAttribute('aLit', new T.BufferAttribute(lit, 1));
    g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
    g.setAttribute('aSize', new T.BufferAttribute(size, 1));
    const mat = new T.ShaderMaterial({ uniforms: { uScale: S.uScale, uTime: S.uTime, uCol: { value: new T.Color(o.color || '#ffb060').multiplyScalar(o.gain || 1) } }, vertexShader: GLOW_V, fragmentShader: GLOW_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true });
    const p = new T.Points(g, mat); p.frustumCulled = false; group.add(p);
    return { points: p, lit, target: new Float32Array(n), geo: g, n };
  }

  /* ---------- the land and the sea ---------- */
  function buildOutdoors(group, W) {
    const T = W.T, rnd = U.seeded(1616);
    const earthTex = W.canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#2a2417'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${40 + rnd() * 40},${36 + rnd() * 30},${18 + rnd() * 14},${0.3 + rnd() * 0.5})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 3); }
    }, [60, 50]);
    S.earth = new T.MeshStandardMaterial({ color: '#4a4232', roughness: 1, map: earthTex });
    const ground = new T.Mesh(new T.PlaneGeometry(320, 96), S.earth);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.01, -186); ground.receiveShadow = true; group.add(ground);
    S.ground = ground;
    // the sea, out past the coast
    const sea = new T.Mesh(new T.PlaneGeometry(1600, 1000, 1, 1), new T.ShaderMaterial({
      uniforms: { uTime: S.uTime, uMoon: { value: 0.6 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uTime; uniform float uMoon; varying vec3 vW;
        void main(){
          vec2 p = vW.xz * 0.11;
          float n = sin(p.x * 3.1 + uTime * 0.6) * sin(p.y * 2.3 - uTime * 0.45) + 0.5 * sin(p.x * 7.3 - uTime * 1.1) * sin(p.y * 5.7 + uTime * 0.8);
          float glint = smoothstep(1.05, 1.42, n) * uMoon;
          vec3 col = vec3(0.012, 0.022, 0.04) + vec3(0.55, 0.65, 0.85) * glint * 0.32;
          float d = length(vW - cameraPosition);
          col *= exp(-d * 0.0012);
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.3, -734); group.add(sea);
    // a coastline you can just make out: a pale line of surf
    const surf = new T.Mesh(new T.PlaneGeometry(320, 0.5), new T.MeshBasicMaterial({ color: '#5b6a7a', transparent: true, opacity: 0.35 }));
    surf.rotation.x = -Math.PI / 2; surf.position.set(0, -0.005, -233.8); group.add(surf);
    // the woods around the clearing
    const trunk = new T.CylinderGeometry(0.08, 0.12, 1.4, 6); trunk.translate(0, 0.7, 0);
    const crown = new T.ConeGeometry(1.1, 3.6, 7); crown.translate(0, 2.9, 0);
    const treeG = W.merge([trunk, crown]);
    const trees = [];
    for (let i = 0; i < 220; i++) {
      const a = rnd() * Math.PI * 2, r = 13 + rnd() * 30;
      const x = Math.cos(a) * r * 1.5, z = -160 + Math.sin(a) * r * 0.9 - 8;
      if (z > -150 || z < -228 || (Math.abs(x) < 15 && z > -176)) continue;
      trees.push({ p: [x, 0, z], s: 0.8 + rnd() * 0.9, r: [0, rnd() * 6, 0] });
    }
    group.add(W.instanced(treeG, new T.MeshStandardMaterial({ color: '#1b2117', roughness: 0.95 }), trees, false));
    // village fires on the land: 100 of them, in clusters
    const pos = [], vil = [];
    for (let v = 0; v < 100; v++) {
      let cx, cz;
      if (v === 0) { cx = PATUXET[0]; cz = PATUXET[2]; }
      else {
        do { cx = (rnd() - 0.5) * 150; cz = -168 - rnd() * 60; } while (Math.abs(cx - FIRE[0]) < 14 && cz > -184);
      }
      const k = 3 + Math.floor(rnd() * 4), from = pos.length / 3;
      for (let j = 0; j < k; j++) pos.push(cx + (rnd() - 0.5) * 2.4, 0.3 + rnd() * 0.4, cz + (rnd() - 0.5) * 2);
      vil.push({ c: [cx, cz], from, n: k });
    }
    S.vil = glowPoints(T, group, pos, { size: 2.2, color: '#ffaa55', gain: 1.5 });
    S.villages = vil;
    S.alive = vil.map((_, i) => i);
    // the ninety who did not come back: pick which go out (Patuxet among them), seeded
    const order = U.seeded(1619);
    const idx = vil.map((_, i) => i).sort(() => order() - 0.5);
    S.survivors = new Set(idx.filter((i) => i !== 0).slice(0, 10));
    // the traveller
    S.trav = glowPoints(T, group, [PATUXET[0], 1.2, PATUXET[2]], { size: 9, color: '#ffe2a8', gain: 2.6 });
    const trailN = 120, tp = new Float32Array(trailN * 3);
    const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.BufferAttribute(tp, 3)); tg.setDrawRange(0, 0);
    S.trail = new T.Line(tg, new T.LineBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false }));
    S.trail.frustumCulled = false; group.add(S.trail);
    const pts = [[...PATUXET], [24, 26, -360], [58, 14, -540], [MALAGA[0], 1.2, MALAGA[2]], [20, 18, -700], [ENGLAND[0], 1.2, ENGLAND[2]], [-40, 30, -520], [-6, 18, -320], [PATUXET[0], 1.2, PATUXET[2]]];
    S.voyage = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], Math.max(1.2, p[1]), p[2])), false, 'centripetal');
  }

  /* ---------- 1621: trestle tables, a fire, food, wooden trenchers ---------- */
  function buildHarvest(group, W) {
    const T = W.T, rnd = U.seeded(1620);
    const plank = new T.MeshStandardMaterial({ color: '#5a3f26', roughness: 0.92, map: W.mats.wood.map });
    const parts = [];
    const L = 10.2, z0 = END - 0.4, zc = z0 - L / 2;
    [-0.3, 0, 0.3].forEach((x) => parts.push(rotBox(T, 0.28, 0.045, L, x + (rnd() - 0.5) * 0.02, TOP - 0.02, zc)));
    for (let z = z0 - 0.6; z > z0 - L; z -= 2.4) {
      parts.push(rotBox(T, 0.06, 0.9, 0.06, -0.3, TOP / 2 - 0.05, z, 0, 0, 0.32));
      parts.push(rotBox(T, 0.06, 0.9, 0.06, 0.3, TOP / 2 - 0.05, z, 0, 0, -0.32));
      parts.push(rotBox(T, 0.86, 0.05, 0.05, 0, 0.3, z));
    }
    // benches
    [-1, 1].forEach((s) => {
      parts.push(rotBox(T, 0.3, 0.05, L - 0.6, s * 0.72, 0.44, zc));
      for (let z = z0 - 0.8; z > z0 - L + 0.4; z -= 2.6) parts.push(rotBox(T, 0.06, 0.44, 0.06, s * 0.72, 0.22, z));
    });
    // two more tables, out by the fire
    [[5.4, -158.6, 0.18], [-3.4, -158.3, -0.12]].forEach(([x, z, ry]) => {
      const L2 = 5.5;
      [-0.25, 0.05, 0.35].forEach((dx) => parts.push(rotBox(T, 0.3, 0.045, L2, x + dx, TOP - 0.02, z, 0, ry, 0)));
      [-2, 0, 2].forEach((dz) => parts.push(rotBox(T, 0.8, 0.7, 0.06, x + 0.05 + Math.sin(ry) * dz, 0.36, z + Math.cos(ry) * dz, 0, ry, 0)));
    });
    const trestle = new T.Mesh(W.merge(parts), plank); trestle.castShadow = true; trestle.receiveShadow = true; group.add(trestle);
    // wooden trenchers (shared plates), knives, spoons. No forks.
    const tr = [], spoons = [];
    for (let z = z0 - 0.5; z > z0 - L + 0.3; z -= 0.62) [-1, 1].forEach((s) => {
      tr.push({ p: [s * 0.3, TOP + 0.012, z + (rnd() - 0.5) * 0.08], r: [0, rnd() * 0.4, 0], s: [1, 1, 1] });
      spoons.push({ p: [s * 0.44, TOP + 0.008, z + 0.1], r: [0, Math.PI / 2 + (rnd() - 0.5) * 0.3, 0] });
    });
    const trencherG = new T.BoxGeometry(0.22, 0.022, 0.2);
    const woodMat = new T.MeshStandardMaterial({ color: '#7a5634', roughness: 0.85 });
    group.add(W.instanced(trencherG, woodMat, tr));
    group.add(W.instanced(new T.BoxGeometry(0.018, 0.006, 0.16), W.mats.pewter, spoons));
    // the food: fowl, a haunch of venison, corn, squash, shellfish
    const food = new T.Group(); group.add(food);
    const brown = new T.MeshStandardMaterial({ color: '#7a3d17', roughness: 0.45 });
    S.foodAt = {};
    const birdsAt = [[0.05, -152.4], [-0.08, -154.1], [0.1, -155.8], [-0.05, -157.6]];
    birdsAt.forEach(([x, z]) => { const b = new T.Mesh(new T.SphereGeometry(1, 18, 12), brown); b.scale.set(0.08, 0.06, 0.11); b.position.set(x, TOP + 0.06, z); b.castShadow = true; food.add(b); });
    S.foodAt.fowl = [0.05, TOP + 0.12, -152.4];
    const venison = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshStandardMaterial({ color: '#4d1d12', roughness: 0.55 }));
    venison.scale.set(0.12, 0.08, 0.22); venison.position.set(0, TOP + 0.075, -153.3); venison.rotation.y = 0.4; venison.castShadow = true; food.add(venison);
    S.foodAt.deer = [0, TOP + 0.18, -153.3];
    const corn = [];
    for (let i = 0; i < 16; i++) corn.push({ p: [(rnd() - 0.5) * 0.5, TOP + 0.03, -155 + (rnd() - 0.5) * 0.9], r: [Math.PI / 2, rnd() * 0.6, rnd() * 6], s: [0.022, 0.09, 0.022] });
    group.add(W.instanced(new T.SphereGeometry(1, 10, 8), new T.MeshStandardMaterial({ color: '#d8a53a', roughness: 0.6 }), corn));
    S.foodAt.corn = [0, TOP + 0.1, -155];
    const squash = [];
    for (let i = 0; i < 7; i++) squash.push({ p: [(rnd() - 0.5) * 0.45, TOP + 0.05, -156.6 + (rnd() - 0.5) * 0.6], s: [0.07, 0.05, 0.07], c: U.pick(['#c8641e', '#b0752a', '#6f7a34']) });
    group.add(W.instanced(new T.SphereGeometry(1, 16, 12), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }), squash));
    S.foodAt.squash = [0, TOP + 0.12, -156.6];
    const shells = [];
    for (let i = 0; i < 40; i++) shells.push({ p: [(rnd() - 0.5) * 0.3, TOP + 0.02, -158.2 + (rnd() - 0.5) * 0.3], s: [0.03, 0.01, 0.018], r: [0, rnd() * 6, 0] });
    group.add(W.instanced(new T.SphereGeometry(1, 8, 6), new T.MeshStandardMaterial({ color: '#1f2230', roughness: 0.3 }), shells));
    S.foodAt.shell = [0, TOP + 0.08, -158.2];
    // stacked trenchers for the four who cooked: 4 stacks of 35
    const stackG = new T.CylinderGeometry(0.11, 0.11, 0.014, 18);
    const stacks = [];
    const base = [[-2.75, -152.35], [-3.1, -152.3], [-3.45, -152.4], [-3.8, -152.3]];
    base.forEach(([x, z]) => { for (let k = 0; k < 35; k++) stacks.push({ p: [x + (rnd() - 0.5) * 0.012, 0.03 + k * 0.0165, z + (rnd() - 0.5) * 0.012], r: [0, rnd() * 6, 0] }); });
    S.stack = W.instanced(stackG, woodMat, stacks); S.stack.count = 0; group.add(S.stack);
    S.stackTop = [-3.27, 0.03 + 35 * 0.0165 + 0.2, -152.35];
    // the fire: logs, flames, embers
    const logs = [];
    for (let i = 0; i < 7; i++) logs.push({ p: [FIRE[0], 0.12, FIRE[2]], r: [Math.PI / 2 - 0.35, (i / 7) * Math.PI * 2, 0], s: 1 });
    const logG = new T.CylinderGeometry(0.06, 0.07, 1.1, 8); logG.translate(0, 0.25, 0);
    group.add(W.instanced(logG, new T.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.9, emissive: '#3a1204', emissiveIntensity: 0.6 }), logs));
    const fN = 90, fp = new Float32Array(fN * 3), fs = new Float32Array(fN);
    for (let i = 0; i < fN; i++) { fp.set([FIRE[0] + (rnd() - 0.5) * 0.5, 0.15, FIRE[2] + (rnd() - 0.5) * 0.5], i * 3); fs[i] = rnd(); }
    const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fp, 3)); fg.setAttribute('aSeed', new T.BufferAttribute(fs, 1));
    S.fireU = { uTime: S.uTime, uScale: S.uScale, uGain: { value: 0 } };
    const fire = new T.Points(fg, new T.ShaderMaterial({
      uniforms: S.fireU, blending: T.AdditiveBlending, depthWrite: false, transparent: true,
      vertexShader: `attribute float aSeed; uniform float uTime, uScale; varying float vLife; varying float vSeed;
        void main(){
          float ember = step(0.86, aSeed);
          float life = fract(uTime * (0.55 + aSeed * 0.5) * (1.0 - ember * 0.6) + aSeed * 7.13);
          vec3 p = position;
          p.y += life * mix(1.1 + aSeed * 0.5, 3.4, ember);
          p.x += sin(aSeed * 40.0 + uTime * 2.0) * 0.12 * life + ember * sin(uTime + aSeed * 9.0) * 0.4 * life;
          p.z += cos(aSeed * 31.0 + uTime * 1.7) * 0.12 * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uScale * mix((1.0 - life) * 0.55 + 0.08, 0.035, ember) / max(-mv.z, 0.1);
          vLife = life; vSeed = aSeed;
        }`,
      fragmentShader: `uniform float uGain; varying float vLife; varying float vSeed;
        void main(){
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - r), 1.8);
          vec3 c = mix(vec3(1.0, 0.85, 0.45), vec3(1.0, 0.32, 0.08), vLife);
          if (vSeed > 0.86) c = vec3(1.0, 0.5, 0.15) * 2.0;
          gl_FragColor = vec4(c * a * (1.0 - vLife) * 1.7 * uGain, 1.0);
        }`,
    }));
    fire.frustumCulled = false; group.add(fire);
    // a light for the fire, kept out of the group (see the rules)
    S.fireLight = new T.PointLight('#ff8a3a', 0, 16, 2);
    S.fireLight.position.set(FIRE[0], 0.9, FIRE[2]);
    W.scene.add(S.fireLight);
  }

  /* ---------- along the table: eras, markers, history on the cloth ---------- */
  function buildAlong(group, W) {
    const T = W.T, rnd = U.seeded(2007);
    // phones, at the near end, where they belong (2007 onward)
    const bodies = [], screens = [];
    for (let y = 2026; y >= 2008; y -= 1) {
      if (rnd() < 0.45) continue;
      const x = xOf(y) * 0.95 + (rnd() - 0.5) * 0.06, z = zOf(y) + 0.12 + (rnd() - 0.5) * 0.05, ry = rnd() * 6;
      bodies.push({ p: [x, TOP + 0.03, z], r: [0, ry, 0] });
      screens.push({ p: [x, TOP + 0.036, z], r: [-Math.PI / 2, 0, ry], s: [1, 1, 1] });
    }
    group.add(W.instanced(new T.BoxGeometry(0.072, 0.009, 0.15), new T.MeshStandardMaterial({ color: '#15161a', roughness: 0.25, metalness: 0.4 }), bodies));
    const scr = new T.PlaneGeometry(0.064, 0.138);
    group.add(W.instanced(scr, new T.MeshBasicMaterial({ color: new T.Color('#bcd2ff').multiplyScalar(1.6), toneMapped: false }), screens, false));
    // 1955: a green bean casserole on the cloth
    const cz = zOf(1955), cx = xOf(1955) * 0.4;
    const dish = new T.Mesh(new T.BoxGeometry(0.24, 0.055, 0.17), W.mats.china); dish.position.set(cx, TOP + 0.03, cz); dish.castShadow = true; group.add(dish);
    const beans = new T.Mesh(new T.BoxGeometry(0.21, 0.012, 0.14), new T.MeshStandardMaterial({ color: '#58702e', roughness: 0.7 })); beans.position.set(cx, TOP + 0.062, cz); group.add(beans);
    const onions = [];
    for (let i = 0; i < 70; i++) onions.push({ p: [cx + (rnd() - 0.5) * 0.19, TOP + 0.07, cz + (rnd() - 0.5) * 0.12], r: [rnd() * 3, rnd() * 3, 0], s: [0.012, 0.004, 0.006] });
    group.add(W.instanced(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ color: '#a8692a', roughness: 0.8 }), onions, false));
    S.casserole = [cx, TOP + 0.1, cz];
    // 1789: the proclamation, on the cloth
    const proc = paperTex(W, 512, 640, (x, w, h) => {
      x.fillStyle = '#2a1b12'; x.textAlign = 'center';
      x.font = `28px ${FELLSC}`; x.fillText('By the President of the', w / 2, 70); x.fillText('United States of America', w / 2, 104);
      x.font = `italic 44px ${FELL}`; x.fillText('A Proclamation', w / 2, 170);
      x.font = `21px ${FELL}`; x.textAlign = 'left';
      const lines = ['Now therefore I do recommend', 'and assign Thursday the 26th', 'day of November next to be', 'devoted by the People of these', 'States to the service of that', 'great and glorious Being…'];
      lines.forEach((l, i) => x.fillText(l, 60, 240 + i * 38));
      x.font = `italic 26px ${FELL}`; x.textAlign = 'right'; x.fillText('Go: Washington', w - 60, 520);
      x.font = `18px ${FELL}`; x.fillText('New York, 3 October 1789', w - 60, 560);
    });
    const p1789 = new T.Mesh(new T.PlaneGeometry(0.3, 0.375), new T.MeshStandardMaterial({ map: proc, roughness: 0.9 }));
    p1789.rotation.set(-Math.PI / 2, 0, Math.PI + 0.25); p1789.position.set(xOf(1789) * 0.35, TOP + 0.008, zOf(1789) + 0.05); p1789.receiveShadow = true; group.add(p1789);
    S.p1789 = [p1789.position.x, TOP + 0.05, p1789.position.z];
    // 1863: Lincoln's proclamation, where the fifth letter lands
    const proc63 = paperTex(W, 512, 640, (x, w, h) => {
      x.fillStyle = '#2a1b12'; x.textAlign = 'center';
      x.font = `italic 40px ${FELL}`; x.fillText('Proclamation of', w / 2, 90); x.fillText('Thanksgiving', w / 2, 140);
      x.font = `20px ${FELL}`; x.textAlign = 'left';
      ['…to set apart and observe the last', 'Thursday of November next, as a day', 'of Thanksgiving and Praise…', '', '…and commend to His tender care all', 'those who have become widows,', 'orphans, mourners or sufferers in the', 'lamentable civil strife…'].forEach((l, i) => x.fillText(l, 52, 210 + i * 34));
      x.font = `italic 26px ${FELL}`; x.textAlign = 'right'; x.fillText('A. Lincoln', w - 60, 540); x.font = `18px ${FELL}`; x.fillText('3 October 1863', w - 60, 575);
    });
    const p1863 = new T.Mesh(new T.PlaneGeometry(0.3, 0.375), new T.MeshStandardMaterial({ map: proc63, roughness: 0.9, transparent: true, opacity: 0 }));
    p1863.rotation.set(-Math.PI / 2, 0, Math.PI - 0.2); p1863.position.set(xOf(1863) * 0.4, TOP + 0.009, zOf(1863) - 0.05); group.add(p1863);
    S.p1863 = p1863;
    // Sarah Josepha Hale's letters: five envelopes
    const env = drawnTex(W, 256, 160, (x, w, h) => {
      x.fillStyle = '#efe4cc'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(90,60,30,.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(w / 2, h * 0.55); x.lineTo(w, 0); x.stroke();
      x.fillStyle = '#7d1a2c'; x.beginPath(); x.arc(w / 2, h * 0.55, 16, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#2a1b12'; x.font = `20px ${FELL}`; x.textAlign = 'center'; x.fillText('To the President', w / 2, h - 26);
    });
    const envMat = new T.MeshStandardMaterial({ map: env, roughness: 0.85, side: T.DoubleSide });
    S.letters = [];
    [1849, 1850, 1853, 1857, 1863].forEach((yr, i) => {
      const m = new T.Mesh(new T.PlaneGeometry(0.16, 0.1), envMat); m.visible = false; m.castShadow = true; group.add(m);
      S.letters.push({ m, yr, name: ['Taylor', 'Fillmore', 'Pierce', 'Buchanan', 'Lincoln'][i] });
    });
    // 1924–1928: balloons
    S.balloons = [];
    const bcol = ['#c0392b', '#2c7a74', '#d9a441', '#5b4870', '#b9552a', '#3d5878', '#646a3a'];
    for (let i = 0; i < 7; i++) {
      const yr = 1924 + Math.floor(i * 0.7);
      const b = new T.Group();
      const ball = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshStandardMaterial({ color: bcol[i], roughness: 0.35, emissive: bcol[i], emissiveIntensity: 0.25 }));
      ball.scale.set(0.16 + (i % 3) * 0.04, 0.22 + (i % 2) * 0.06, 0.16); b.add(ball);
      const str = new T.Mesh(new T.CylinderGeometry(0.002, 0.002, 0.9, 4), W.mats.china); str.position.y = -0.62; b.add(str);
      const home = [xOf(yr) * 0.6 + (rnd() - 0.5) * 0.4, TOP + 0.95, zOf(yr) + (rnd() - 0.5) * 0.6];
      b.position.set(...home); b.visible = false; group.add(b);
      S.balloons.push({ g: b, home, t: 0, v: 0.09 + rnd() * 0.08, sway: rnd() * 6 });
    }
    // 1939: two calendars, arguing
    const cal = (day, who) => drawnTex(W, 256, 320, (x, w, h) => {
      x.fillStyle = '#f2e9d4'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#7d1a2c'; x.fillRect(0, 0, w, 64);
      x.fillStyle = '#f2e9d4'; x.font = `28px ${FELLSC}`; x.textAlign = 'center'; x.fillText('November 1939', w / 2, 42);
      x.fillStyle = '#24170e'; x.font = `150px ${FELL}`; x.fillText(day, w / 2, 210);
      x.font = `22px ${FELLSC}`; x.fillText('Thursday', w / 2, 250);
      x.fillStyle = '#7d1a2c'; x.font = `italic 26px ${FELL}`; x.fillText(who, w / 2, 292);
    });
    S.cals = [['23', 'Roosevelt’s'], ['30', 'Tradition’s']].map(([d, w], i) => {
      const m = new T.Mesh(new T.PlaneGeometry(0.16, 0.2), new T.MeshStandardMaterial({ map: cal(d, w), roughness: 0.85, side: T.DoubleSide }));
      m.position.set(xOf(1939) * 0.55 + (i ? 0.1 : -0.1), TOP + 0.1, zOf(1939) + 0.1); m.castShadow = true; group.add(m);
      return m;
    });
    // 1676: the rift (a cut of darkness across the table)
    const rift = new T.Mesh(new T.BoxGeometry(2.6, 1.9, 1), new T.MeshBasicMaterial({ color: '#050403' }));
    rift.position.set(0, 0.94, zOf(1676)); rift.scale.z = 0.001; rift.visible = false; group.add(rift);
    S.rift = rift;
    const edgeMat = new T.MeshBasicMaterial({ color: new T.Color('#ff6a2a').multiplyScalar(4), transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
    S.riftEdges = [-1, 1].map((s) => { const e = new T.Mesh(new T.PlaneGeometry(1.32, 0.02), edgeMat); e.rotation.x = -Math.PI / 2; e.position.set(0, TOP + 0.006, zOf(1676)); group.add(e); e.userData.s = s; return e; });
    S.riftEdgeMat = edgeMat;
    // 1970: a hill to the side of the table, and one candle on it
    S.hill = [-5.2, 0, zOf(1970) - 1.2]; S.hillTop = 0.78;
    const hill = new T.Mesh(new T.SphereGeometry(3.2, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: '#2c2a22', roughness: 1 }));
    hill.scale.set(1, 0.25, 0.8); hill.position.set(S.hill[0], 0, S.hill[2]); hill.receiveShadow = true; group.add(hill);
    const hc = W.makeCandle(group, [S.hill[0], S.hillTop, S.hill[2]], { height: 0.2, scale: 0.8 });
    S.hillFlame = hc.flame;
    S.hillCandle = hc.group;
  }

  /* ---------- per-frame upkeep for the act ---------- */
  function tick(W, dt, t, raw) {
    if (!S.group || !S.group.visible) return;
    S.uTime.value = t;
    S.uScale.value = (innerHeight * W.renderer.getPixelRatio()) / (2 * Math.tan((W.camera.fov * Math.PI) / 360));
    const F = S.fig;
    // figures walk home when told to
    if (S.walk) {
      S.walk.t += raw;
      let moved = false;
      F.figs.forEach((f) => {
        if (f.group !== 'wa') return;
        const k = U.clamp((S.walk.t - f.delay) / 5.2, 0, 1), e = U.ease.inOutSine(k);
        const nx = U.lerp(f.start[0], f.home[0], e), nz = U.lerp(f.start[2], f.home[2], e);
        if (nx !== f.pos[0] || nz !== f.pos[2]) { f.pos[0] = nx; f.pos[2] = nz; f.pos[1] = Math.abs(Math.sin(k * 40)) * 0.03 * (1 - k); moved = true; }
      });
      if (moved) placeFigures();
      if (S.walk.t > 8.5) S.walk = null;
    }
    let ch = false;
    for (let i = 0; i < F.N; i++) { const d = F.target[i] - F.aLit[i]; if (Math.abs(d) > 0.002) { F.aLit[i] += d * Math.min(1, raw * 2.2); ch = true; } }
    if (ch) F.mesh.geometry.attributes.aLit.needsUpdate = true;
    F.mat.uniforms.uTime.value = t;
    [S.vil, S.trav].forEach((G) => {
      let c2 = false;
      for (let i = 0; i < G.n; i++) { const d = G.target[i] - G.lit[i]; if (Math.abs(d) > 0.002) { G.lit[i] += d * Math.min(1, raw * (d < 0 ? 0.9 : 2.5)); c2 = true; } }
      if (c2) G.geo.attributes.aLit.needsUpdate = true;
    });
    // the fire
    S.fireOn += ((S.fireT || 0) - S.fireOn) * Math.min(1, raw * 1.5);
    S.fireU.uGain.value = S.fireOn;
    S.fireLight.intensity = S.fireOn * 2.6 * (1 + U.noise(t * 7) * 0.18 + U.noise(t * 17 + 3) * 0.08);
    // balloons drift up
    S.balloons.forEach((b) => {
      if (!b.g.visible) return;
      b.t += raw * (S.releasing ? 1 : 0);
      b.g.position.set(b.home[0] + Math.sin(t * 0.7 + b.sway) * 0.05 + (S.releasing ? Math.sin(b.t * 0.4 + b.sway) * b.t * 0.08 : 0), b.home[1] + (S.releasing ? b.t * b.v : Math.sin(t + b.sway) * 0.02), b.home[2]);
    });
  }

  /* ---------- helpers the beats share ---------- */
  function outdoors(W, on, o = {}) {
    W.floor(!on);
    W.sky(on ? (o.sky ?? 1) : 0);
    W.fog(on ? (o.fog ?? 0.022) : 0.09);
    W.mood({ moon: on ? (o.moon ?? 0.45) : 0, cursor: on ? 0 : 0.35 });
    S.fireT = on ? (o.fire ?? 1) : 0;
    if (on && !S.fireSnd && o.fire !== 0) S.fireSnd = LT.audio.sfx('fire', { g: 0.32 });
    if ((!on || o.fire === 0) && S.fireSnd) { S.fireSnd.stop(1.2); S.fireSnd = null; }
  }
  function odometer(ctx, o = {}) {
    const layer = ctx.overlay('a1-odo-layer');
    const wrap = el('div', { class: 'a1-odo' + (o.small ? ' small' : '') });
    const num = el('div', { class: 'a1-odo-num', 'aria-hidden': 'true' });
    const strips = [];
    for (let k = 3; k >= 0; k--) {
      const s = el('div', { class: 'a1-strip' });
      for (let d = 0; d <= 10; d++) s.appendChild(el('span', null, String(d % 10)));
      num.appendChild(el('div', { class: 'a1-digit' }, s));
      strips.push({ k, s });
    }
    const sub = el('div', { class: 'a1-odo-sub' }, o.sub || '');
    wrap.append(num, sub);
    layer.appendChild(wrap);
    let last = null, lastDec = null;
    const set = (v) => {
      v = U.clamp(v, 1600, 2026);
      if (last !== null && Math.abs(v - last) < 0.004) return;
      last = v;
      strips.forEach(({ k, s }) => {
        const p = Math.pow(10, k), base = Math.floor(v / p) % 10;
        const t = k === 0 ? v - Math.floor(v) : U.clamp((v % p) - (p - 1), 0, 1);
        s.style.transform = `translateY(${-(base + t)}em)`;
      });
      const dec = Math.floor(v / 10);
      if (lastDec !== null && dec !== lastDec && LT.audio.ready) LT.audio.tone({ f: 2200 + (dec % 5) * 90, dur: 0.03, a: 0.001, g: 0.03, type: 'triangle' });
      lastDec = dec;
    };
    return { set, sub: (t) => { sub.textContent = t; }, layer, wrap };
  }
  const follow = (ctx, odo) => ctx.frame(() => odo.set(yearAtZ(ctx.W.camState().pos.z)));
  const seatShot = (yr, o = {}) => {
    const z = zOf(yr), x = xOf(yr);
    return { pos: [o.px ?? -x * 1.25, o.py ?? 1.3, z - (o.back ?? 1.25)], look: [o.lx ?? x * 0.4, o.ly ?? 0.86, z + (o.ahead ?? 0.7)], fov: o.fov ?? 36 };
  };
  const villagesTo = (fn) => {
    S.villages.forEach((v, i) => { const on = fn(v, i); for (let j = 0; j < v.n; j++) S.vil.target[v.from + j] = on; });
  };
  const resetRift = () => { S.rift.visible = false; S.rift.scale.z = 0.001; S.riftEdgeMat.opacity = 0; };
  const hideHistoryProps = () => {
    S.letters.forEach((l) => { l.m.visible = false; });
    S.p1863.material.opacity = 0;
    S.balloons.forEach((b) => { b.g.visible = false; b.t = 0; }); S.releasing = false;
    S.hillFlame && S.hillFlame.out();
  };

  /* ---------- the act ---------- */
  LT.journey.act({
    id: 'record', order: 1, numeral: 'I', course: 'First Course', title: 'The Record', music: 'record',
    build(group, W) {
      S.group = group; S.T = W.T; S.uTime = { value: 0 }; S.uScale = { value: 800 }; S.fireOn = 0; S.fireT = 0;
      buildOutdoors(group, W);
      buildHarvest(group, W);
      buildAlong(group, W);
      buildFigures(group, W);
      W.onFrame((dt, t, raw) => tick(W, dt, t, raw));
      // the paper props want the period type; repaint once it has arrived
      if (document.fonts && document.fonts.load) Promise.all([document.fonts.load(`28px ${FELLSC}`), document.fonts.load(`italic 40px ${FELL}`), document.fonts.load(`20px ${FELL}`)])
        .then(() => redraws.forEach((f) => f())).catch(() => {});
    },
    enter(W) { W.setCandles(1); W.hero.light(); W.aftermath(false); LT.music.param('level', 1); },
    exit(W) {
      outdoors(W, false);
      resetRift(); hideHistoryProps();
      S.walk = null; S.fig.target.fill(0);
      LT.music.param('level', 1);
    },
    beats: [
      {
        id: 'seats', caption: 'Every seat at this table\nis a *year.*',
        note: 'This end is tonight. Walk far enough down it and you get to 1621.',
        shot: { pos: [0.55, 1.12, 1.05], look: [-0.1, 0.84, -3.2], fov: 38 }, dur: 3,
        mood: { dim: 1, soft: 0, cursor: 0.35, moon: 0 },
        enter(ctx) {
          outdoors(ctx.W, false); resetRift(); hideHistoryProps(); S.fig.target.fill(0); villagesTo(() => 0);
          for (let y = 2026; y >= 2015; y--) ctx.label([xOf(y) * 1.05, TOP + 0.05, zOf(y) - 0.02], String(y), { cls: 'year a1-seatyear' });
        },
      },
      {
        id: 'walk', caption: 'Let’s walk back.', note: '',
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          outdoors(W, false); resetRift(); hideHistoryProps(); S.fig.target.fill(0); villagesTo(() => 0);
          const odo = odometer(ctx, { sub: 'tonight' });
          follow(ctx, odo);
          const MARKS = [[2007, 'the first iPhone'], [1970, 'the Day of Mourning'], [1955, 'green bean casserole'], [1941, 'the fourth Thursday'], [1939, 'Franksgiving'], [1924, 'the first parade'], [1863, 'Lincoln'], [1789, 'Washington'], [1676, 'war'], [1640, '']];
          const marks = MARKS.map(([y, t]) => ({ z: zOf(y), L: ctx.label([xOf(y) * 0.2, TOP + 0.42, zOf(y)], t ? y + ' \u00b7 ' + t : String(y), { cls: 'year a1-marker' }) }));
          ctx.frame(() => {
            const cz = W.camState().pos.z;
            marks.forEach((m) => { const d = cz - m.z; m.L.n.style.opacity = d < 0.8 || d > 26 ? '0' : String(Math.min(1, (d - 0.8) / 2, (26 - d) / 6)); });
          });
          LT.audio.sfx('whoosh', { dur: 3, low: 80, high: 400, g: 0.12 });
          W.shot({ pos: [0.12, 1.2, 1.2], look: [0, 0.95, -6], fov: 40 }, { dur: 0.01 });
          const subs = [[2007, 'the phones are gone'], [1960, ''], [1900, ''], [1800, 'candles only'], [1700, ''], [1645, 'nearly there']];
          ctx.frame(() => {
            const y = yearAtZ(W.camState().pos.z);
            const s = subs.filter((q) => y < q[0]).pop();
            odo.sub(y > 2020 ? 'tonight' : s ? s[1] : '');
          });
          W.fly({
            points: [[0.12, 1.2, 1.2], [0.15, 1.15, -6], [-0.05, 1.22, -40], [0.1, 1.3, -100], [0.05, 1.4, -140], [-0.4, 1.6, -149.2]],
            looks: [[0, 0.95, -6], [0, 0.95, -14], [0, 0.95, -55], [0, 0.95, -115], [0, 0.95, -152], [0.6, 0.95, -158]],
            dur: U.reducedMotion ? 1.5 : 15, fov: 38, ease: 'inOutSine',
          }).then((ok) => { if (ok && ctx.alive) ctx.later(() => ctx.next(), 500); });
        },
      },
      {
        id: '1621', caption: '1621.', layout: '',
        note: '“Our harvest being gotten in, our governor sent four men on fowling, that so we might after a special manner rejoice together…”',
        cite: 'Edward Winslow, in a letter of December 1621. The only eyewitness account of the feast.',
        shot: { pos: [-5.2, 3.3, -146.4], look: [1.4, 0.8, -158.2], fov: 42 }, dur: 3.5,
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.45 },
        enter(ctx) {
          outdoors(ctx.W, true); resetRift(); hideHistoryProps(); villagesTo(() => 0);
          S.walk = null;
          S.fig.figs.forEach((f) => { if (f.group === 'wa') { f.pos = f.start.slice(); } });
          placeFigures();
          figTargets((f) => (f.group === 'en' ? 0.75 : 0));
          LT.audio.sfx('swell', { dur: 2.4, g: 0.08 });
          ctx.later(() => ctx.label([FIRE[0], 1.9, FIRE[2]], 'outdoors, at the harvest', { cls: 'glow' }), 1600);
        },
      },
      {
        id: 'guests', caption: 'About *90* Wampanoag men came,\nwith Massasoit. About *50* English were left.',
        note: 'The guests outnumbered the hosts nearly two to one. They brought five deer. It went on for three days.',
        shot: { pos: [-8.5, 6.2, -144.5], look: [1.6, 0.4, -162], fov: 48 }, dur: 3.2,
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.5 },
        enter(ctx) {
          outdoors(ctx.W, true); villagesTo(() => 0);
          figTargets((f) => (f.group === 'en' ? 0.85 : f.group === 'wa' ? 0.95 : 0));
          if (ctx.dir > 0) { S.fig.figs.forEach((f) => { if (f.group === 'wa') f.pos = f.start.slice(); }); placeFigures(); S.walk = { t: 0 }; LT.audio.sfx('swell', { dur: 3.5, g: 0.08 }); }
          else { S.fig.figs.forEach((f) => { if (f.group === 'wa') f.pos = f.home.slice(); }); placeFigures(); }
          ctx.label([0.2, 2.3, -153.6], '50', { cls: 'glow a1-count' });
          ctx.later(() => ctx.label([FIRE[0] - 0.4, 2.5, FIRE[2] - 2.6], '90', { cls: 'glow a1-count' }), ctx.dir > 0 ? 3800 : 0);
        },
      },
      {
        id: 'four', caption: 'Of 18 English women,\n*4* survived the first winter.',
        note: 'Historians think they did much of the cooking. For about 140 people. For three days.',
        shot: { pos: [-0.9, 1.75, -149.3], look: [-3.3, 0.75, -153.2], fov: 40 }, dur: 3,
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.4 },
        enter(ctx) {
          outdoors(ctx.W, true, { fire: 0.75 }); villagesTo(() => 0);
          S.fig.figs.forEach((f) => { if (f.group === 'wa') f.pos = f.home.slice(); });
          // the four stand by the trenchers
          const spots = [[-2.5, -153.55], [-3.05, -153.85], [-3.6, -153.8], [-4.15, -153.5]];
          S.four.forEach((fi, k) => { const f = S.fig.figs[fi]; f.saved = f.saved || f.pos.slice(); f.pos = [spots[k][0], 0, spots[k][1]]; });
          placeFigures();
          figTargets((f, i) => (S.four.includes(i) ? 1.3 : 0));
          S.stack.count = 0;
          let n = 0, el2 = -1.2;
          const lbl = ctx.label(S.stackTop, '0', { cls: 'glow a1-count' });
          ctx.frame((dt, t, raw) => {
            if (n >= 140) return;
            el2 += raw;
            const m = el2 < 0 ? 0 : Math.min(140, Math.floor(el2 < 1.2 ? el2 * 12 : 14 + (el2 - 1.2) * 48));
            if (m !== n) { if (Math.floor(m / 6) !== Math.floor(n / 6)) LT.audio.sfx('tick', { f: 900 + m * 6, g: 0.04 }); n = m; S.stack.count = n; lbl.set(String(n)); }
          });
        },
        exit() {
          S.four.forEach((fi) => { const f = S.fig.figs[fi]; if (f.saved) { f.pos = f.saved; f.saved = null; } });
          placeFigures();
        },
      },
      {
        id: 'notyet', caption: 'Nobody called it\n*Thanksgiving.*',
        note: 'Fowl, and the five deer. Corn. Probably shellfish and eels. No pie: no ovens, hardly any flour. No forks. Shared wooden trenchers, knives, spoons, and hands.',
        shot: { pos: [0.95, 1.45, -151.3], look: [-0.15, 0.76, -155.2], fov: 38 }, dur: 3,
        mood: { dim: 1, soft: 0, cursor: 0.2, moon: 0.35 },
        enter(ctx) {
          outdoors(ctx.W, true); villagesTo(() => 0);
          S.stack.count = 140;
          S.fig.figs.forEach((f) => { if (f.group === 'wa') f.pos = f.home.slice(); }); placeFigures();
          figTargets((f) => (f.group === 'hill' ? 0 : 0.3));
          const L = [[S.foodAt.fowl, 'fowl'], [S.foodAt.deer, 'venison'], [S.foodAt.corn, 'corn'], [S.foodAt.squash, 'squash'], [S.foodAt.shell, 'shellfish (likely)']];
          L.forEach(([p, t], i) => ctx.later(() => ctx.label(p, t, { cls: 'a1-tag' }), 300 + i * 350));
          ctx.later(() => ctx.label([0.35, TOP + 0.2, -152.9], 'no forks', { cls: 'a1-tag a1-no' }), 2400);
        },
      },
      {
        id: 'firstlight', caption: 'Go further back.\n*People of the First Light.*',
        note: 'The Wampanoag had lived along this coast for about 12,000 years. Their name means people of the first light: they live where the sun comes up first.',
        shot: { pos: [-6, 26, -150], look: [2, 0, -206], fov: 50 }, dur: 6, ease: 'inOutSine',
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.55 },
        enter(ctx) {
          outdoors(ctx.W, true, { fog: 0.006, fire: 0.25, moon: 0.6 });
          figTargets(() => 0);
          S.stack.count = 0;
          villagesTo(() => 1);
          LT.music.param('level', 1);
        },
      },
      {
        id: 'dying', caption: '1616–1619.',
        note: 'An epidemic, most likely carried by European sailors, swept the coastal nations. In some communities nine of every ten people died. Historians still argue about what the disease was.',
        shot: { pos: [-3, 34, -168], look: [2, 0, -208], fov: 52 }, dur: 4, ease: 'inOutSine',
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.4 },
        enter(ctx) {
          outdoors(ctx.W, true, { fog: 0.006, fire: 0, moon: 0.45 });
          figTargets(() => 0);
          villagesTo(() => 1);
          LT.music.param('level', 0.12);
          LT.audio.sfx('bell', { n: 38, g: 0.06, decay: 9 });
          const going = U.shuffle(S.villages.map((_, i) => i).filter((i) => !S.survivors.has(i)));
          const per = U.reducedMotion ? 30 : 115;
          going.forEach((vi, k) => ctx.later(() => {
            const v = S.villages[vi];
            for (let j = 0; j < v.n; j++) S.vil.target[v.from + j] = 0;
          }, 1500 + k * per));
          ctx.later(() => ctx.note('An epidemic, most likely carried by European sailors, swept the coastal nations. In some communities nine of every ten people died. When the English arrived, they found the fields already cleared, and empty.'), 1500 + going.length * per + 600);
        },
        exit() { LT.music.param('level', 1); },
      },
      {
        id: 'tisquantum', caption: '*Tisquantum.*',
        note: 'In 1614, before the sickness, an English captain named Thomas Hunt kidnapped him and others from the coast and sold them in Málaga, Spain.',
        shot: { pos: [8, 520, -462], look: [8, 0, -470], fov: 58 }, dur: 5, ease: 'inOutSine',
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.6 },
        enter(ctx) {
          const W = ctx.W;
          outdoors(W, true, { fog: 0.0012, fire: 0, moon: 0.7 });
          figTargets(() => 0);
          LT.music.param('level', 0.6);
          villagesTo((v, i) => (i === 0 ? 1 : S.survivors.has(i) ? 1 : 0));
          const geo = S.trail.geometry, tp = geo.attributes.position.array;
          geo.setDrawRange(0, 0);
          const start = S.voyage.getPointAt(0);
          S.trav.geo.attributes.position.setXYZ(0, start.x, start.y, start.z); S.trav.geo.attributes.position.needsUpdate = true;
          S.trav.target[0] = 1;
          ctx.label([PATUXET[0], 7, PATUXET[2]], 'Patuxet', { cls: 'glow' });
          const DUR = U.reducedMotion ? 3 : 13;
          let t = 0, stage = 0;
          ctx.frame((dt, tt, raw) => {
            if (t >= 1) return;
            t = Math.min(1, t + raw / DUR);
            const p = S.voyage.getPointAt(t);
            S.trav.geo.attributes.position.setXYZ(0, p.x, p.y, p.z); S.trav.geo.attributes.position.needsUpdate = true;
            const n = Math.min(119, Math.floor(t * 119));
            for (let i = 0; i <= n; i++) { const q = S.voyage.getPointAt((i / 119) * t); tp[i * 3] = q.x; tp[i * 3 + 1] = q.y; tp[i * 3 + 2] = q.z; }
            geo.attributes.position.needsUpdate = true; geo.setDrawRange(Math.max(0, n - 70), Math.min(70, n + 1));
            if (stage === 0 && t > 0.3) { stage = 1; ctx.label([MALAGA[0], 8, MALAGA[2]], 'Málaga, Spain', { cls: 'glow' }); }
            if (stage === 1 && t > 0.55) { stage = 2; ctx.label([ENGLAND[0], 8, ENGLAND[2]], 'England', { cls: 'glow' }); ctx.note('He got away, reached England, and learned English there. In 1619 he finally made it home.'); }
            if (stage === 2 && t > 0.7) { stage = 3; for (let j = 0; j < S.villages[0].n; j++) S.vil.target[S.villages[0].from + j] = 0; }
            if (stage === 3 && t >= 1) {
              stage = 4;
              ctx.caption('He came home in 1619.\nPatuxet was *empty.*');
              ctx.note('Everyone in his village had died in the epidemic. In 1620 the English built Plymouth on the same ground. Tisquantum, the man they called Squanto, stayed with them as an interpreter, and showed them how to plant corn.');
              LT.audio.sfx('bell', { n: 45, g: 0.05, decay: 7 });
            }
          });
        },
        exit() { S.trav.target[0] = 0; S.trail.geometry.setDrawRange(0, 0); LT.music.param('level', 1); },
      },
      {
        id: 'war', caption: 'Fifty-four years later,\ntheir sons were at *war.*',
        note: '1675–76, King Philip’s War. Metacom, Massasoit’s son, against the colonies; Josiah Winslow, Edward Winslow’s son, governed Plymouth. One of the deadliest wars, for its size, in American history.',
        shot: { pos: [3.6, 2.7, zOf(1676) + 0.9], look: [0, 0.72, zOf(1676) - 0.2], fov: 46 }, dur: 6,
        mood: { dim: 1, soft: 0, cursor: 0.15, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          outdoors(W, false); villagesTo(() => 0); figTargets(() => 0); hideHistoryProps();
          S.rift.visible = true; S.rift.scale.z = 0.001; S.riftEdgeMat.opacity = 0;
          ctx.later(() => {
            LT.audio.sfx('boom', { g: 0.45 });
            LT.fx.shake(6, 1.2);
            U.tween({ from: 0.001, to: 2.2, dur: 2.6, ease: 'outCubic', onUpdate: (v) => {
              if (!ctx.alive) return;
              S.rift.scale.z = v;
              S.riftEdges.forEach((e) => { e.position.z = zOf(1676) + e.userData.s * (v / 2 + 0.015); });
              S.riftEdgeMat.opacity = Math.min(1, v * 1.5) * (1 - Math.max(0, v - 1.6));
            } });
            // embers out of the crack
            for (let i = 0; i < 6; i++) ctx.later(() => { const p = W.project([0, TOP + 0.05, zOf(1676)]); if (p.on) LT.fx.sparks(p.x + U.rand(-120, 120), p.y, 10, { speed: [40, 180], gravity: -40 }); }, i * 220);
          }, 1800);
          ctx.label([0.1, TOP + 0.5, zOf(1676)], '1676', { cls: 'year a1-marker' });
        },
      },
      {
        id: '1789', caption: 'Then, slowly,\nit became a *holiday.*',
        note: '1789. President Washington proclaims a national day of thanksgiving for Thursday, November 26.',
        cite: 'George Washington, Thanksgiving Proclamation, 3 October 1789.',
        shot: seatShot(1789, { back: 0.9, py: 1.25, fov: 38 }), dur: 5,
        mood: { dim: 1, soft: 0, cursor: 0.45, moon: 0 },
        enter(ctx) {
          outdoors(ctx.W, false); villagesTo(() => 0); figTargets(() => 0); hideHistoryProps();
          const odo = odometer(ctx, { small: true }); follow(ctx, odo);
          ctx.later(() => ctx.label(S.p1789, 'the proclamation', { cls: 'a1-tag' }), 2600);
          const t = U.today();
          if (t.getMonth() === 10 && t.getDate() === 26) ctx.later(() => ctx.note(`1789. President Washington proclaims a national day of thanksgiving for Thursday, November 26. Today is ${U.DAYS[t.getDay()]}, November 26, ${t.getFullYear()}.`), 200);
        },
      },
      {
        id: '1863', caption: 'One woman wrote to\n*five presidents.*',
        note: 'Sarah Josepha Hale, magazine editor (and author of “Mary Had a Little Lamb”), campaigned for a national Thanksgiving for 36 years. Four presidents did nothing.',
        shot: { pos: [0.95, 1.7, zOf(1846) - 0.6], look: [-0.1, 0.8, zOf(1857)], fov: 42 }, dur: 5,
        mood: { dim: 1, soft: 0, cursor: 0.35, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          outdoors(W, false); hideHistoryProps();
          const odo = odometer(ctx, { small: true }); follow(ctx, odo);
          const from = new W.T.Vector3(xOf(1846) * 0.6, TOP + 0.3, zOf(1846));
          S.letters.forEach((L, i) => {
            const to = new W.T.Vector3(xOf(L.yr) * 0.6, TOP + 0.012, zOf(L.yr) + (i === 4 ? 0.25 : 0));
            ctx.later(() => {
              L.m.visible = true;
              ctx.label([to.x, TOP + 0.18, to.z], L.name + (i === 4 ? ', 1863' : ''), { cls: i === 4 ? 'a1-tag a1-yes' : 'a1-tag' });
              LT.audio.sfx('paper', { dur: 0.3, g: 0.5 });
              let k = 0;
              const off = ctx.frame((dt, t, raw) => {
                k = Math.min(1, k + raw / 1.6);
                const e = U.ease.inOutSine(k);
                L.m.position.set(U.lerp(from.x, to.x, e), U.lerp(from.y, to.y, e) + Math.sin(e * Math.PI) * 0.5, U.lerp(from.z, to.z, e));
                L.m.rotation.set(-Math.PI / 2 * e + (1 - e) * 0.3, 0, Math.sin(k * 9) * (1 - e) * 0.4 + i * 0.3);
                if (k >= 1) {
                  off();
                  if (i < 4) LT.audio.sfx('thud', { g: 0.12 });
                  else { LT.audio.sfx('chime'); S.p1863.material.opacity = 1; L.m.visible = false; }
                }
              });
            }, 900 + i * 1500);
          });
          ctx.later(() => {
            ctx.caption('The fifth said *yes.*');
            ctx.note('Lincoln, in October 1863, in the middle of the Civil War. His proclamation gave thanks, and asked care for “all those who have become widows, orphans, mourners or sufferers in the lamentable civil strife.”');
            W.shot({ pos: [0.7, 1.15, zOf(1863) - 0.75], look: [xOf(1863) * 0.4, 0.78, zOf(1863) + 0.1], fov: 36 }, { dur: 3 });
          }, 900 + 5 * 1500 + 600);
        },
      },
      {
        id: '1924', caption: '1924: the first parade.\n1928: they let the balloons *go.*',
        note: 'Macy’s first Thanksgiving parade borrowed animals from the Central Park Zoo. Giant balloons arrived in 1927. In 1928, at the end of the route, they simply let them go, and the balloons floated over the city until they burst.',
        shot: { pos: [0.7, 1.0, zOf(1928) - 2.0], look: [0, 1.75, zOf(1925) + 0.6], fov: 50 }, dur: 5,
        mood: { dim: 1, soft: 0, cursor: 0.3, moon: 0 },
        enter(ctx) {
          outdoors(ctx.W, false); hideHistoryProps();
          const odo = odometer(ctx, { small: true }); follow(ctx, odo);
          S.balloons.forEach((b, i) => { b.g.visible = true; b.t = 0; });
          S.releasing = false;
          ctx.later(() => { S.releasing = true; LT.audio.sfx('swell', { dur: 2, g: 0.06 }); }, 2600);
          const btn = ctx.button('Let them go', () => { S.releasing = true; btn.remove(); LT.audio.sfx('pop', { f: 500 }); LT.stats.inc('balloonsReleased', 7); });
          ctx.later(() => btn.isConnected && btn.remove(), 2600);
        },
        exit() { S.balloons.forEach((b) => { b.g.visible = false; b.t = 0; }); S.releasing = false; },
      },
      {
        id: '1939', caption: '1939. *Franksgiving.*',
        note: 'Roosevelt moved Thanksgiving up a week to lengthen the Christmas shopping season. About half the states refused. Texas took both days off. In 1941 Congress settled it: the fourth Thursday of November.',
        shot: { pos: [0.6, 1.08, zOf(1939) - 0.7], look: [xOf(1939) * 0.55, 0.86, zOf(1939) + 0.1], fov: 34 }, dur: 4,
        mood: { dim: 1, soft: 0, cursor: 0.5, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          outdoors(W, false); hideHistoryProps();
          const odo = odometer(ctx, { small: true }); follow(ctx, odo);
          let clicks = 0, flip = 0;
          ctx.frame((dt, t) => {
            S.cals.forEach((m, i) => {
              const s = i ? 1 : -1;
              m.rotation.set(0, Math.PI + s * 0.35 + Math.sin(t * 3 + i) * 0.12 + (flip > 0 ? Math.sin(flip * 20) * 0.6 * flip : 0), s * 0.06 * Math.sin(t * 4));
              m.position.x = xOf(1939) * 0.55 + s * (0.1 + Math.max(0, Math.sin(t * 2.2 + i * Math.PI)) * 0.025);
            });
            flip = Math.max(0, flip - dt * 1.6);
          });
          const layer = ctx.overlay('a1-cal-layer');
          const hit = el('button', { class: 'a1-cal-hit jr-interactive', type: 'button', 'aria-label': 'Settle the argument' });
          layer.appendChild(hit);
          ctx.frame(() => { const p = W.project([xOf(1939) * 0.55, TOP + 0.1, zOf(1939) + 0.1]); hit.style.transform = `translate(${p.x - 70}px, ${p.y - 70}px)`; hit.style.visibility = p.on ? 'visible' : 'hidden'; });
          hit.addEventListener('click', () => {
            clicks++; flip = 1; LT.audio.sfx('paper', { dur: 0.2, g: 0.5 });
            if (clicks === 7) LT.egg('franksgiving', 'Franksgiving', 'You argued with the 1939 calendars until they gave up. Texas would approve.');
          });
          ctx.hint('(Tap the calendars. They will keep arguing.)');
        },
      },
      {
        id: '1970', caption: '1970. *A day of mourning.*',
        note: 'Wamsutta Frank James, an Aquinnah Wampanoag man, was invited to speak at the 350th anniversary of the Pilgrims’ landing. When the organizers read his speech, they would not let him give it. He gave it anyway, on Cole’s Hill in Plymouth. People have gathered there every Thanksgiving since: the National Day of Mourning.',
        shot: { pos: [-0.2, 2.5, S0() - 6.8], look: [-5.0, 0.9, S0() - 1.2], fov: 40 }, dur: 5,
        mood: { dim: 1, soft: 0, cursor: 0.1, moon: 0.2 },
        enter(ctx) {
          outdoors(ctx.W, false); hideHistoryProps();
          ctx.W.mood({ moon: 0.25 });
          const odo = odometer(ctx, { small: true }); follow(ctx, odo);
          S.hillFlame.light();
          figTargets((f) => (f.group === 'hill' ? 0.42 : 0));
          LT.music.param('level', 0.55);
          ctx.label([S.hill[0], S.hillTop + 0.7, S.hill[2]], 'Cole’s Hill', { cls: 'glow' });
        },
        exit() { S.hillFlame.out(); figTargets(() => 0); LT.music.param('level', 1); },
      },
      {
        id: 'both', caption: 'Both things are\n*true at once.*',
        note: 'A harvest shared by wary allies, and the beginning of a catastrophe. A holiday can hold more than one story. So can a family. The Wampanoag are still here: the Mashpee and Aquinnah Wampanoag are federally recognized tribes, still on the land where the sun comes up first.',
        shot: { pos: [0.05, 1.75, 2.4], look: [0, 0.9, -7], fov: 36 }, dur: 7, ease: 'inOutSine',
        mood: { dim: 1, soft: 0, cursor: 0.45, moon: 0 },
        enter(ctx) {
          outdoors(ctx.W, false); hideHistoryProps(); figTargets(() => 0); villagesTo(() => 0);
          ctx.W.setCandles(1); ctx.W.hero.light();
          LT.audio.sfx('swell', { dur: 3, g: 0.07 });
          ctx.sideDoor('Read the full record', 'record');
        },
      },
    ],
  });
  function S0() { return zOf(1970); }
})();
