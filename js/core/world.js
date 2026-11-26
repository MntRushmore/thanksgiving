/* The Long Table — the world. One continuous 3D room, built from nothing but code:
   a table that runs into the dark forever, candlelight you carry, and a camera that walks its length.
   Needs THREE (r128 UMD). If WebGL or THREE is missing, LT.world.ok stays false and the 2D piece carries on. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util;
  const W = (LT.world = { ok: false, visible: false });
  const T = window.THREE;
  if (!T) return;
  const canGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!canGL) return;
  // A software renderer would turn the room into a slideshow; the 2D version is better there.
  const software = (() => {
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '');
    } catch (e) { return false; }
  })();
  if (software && !window.LT_FORCE_WORLD) return;

  const TOP = 0.76;            // table height (m)
  const HALF = 0.6;            // half table width
  const NEAR_END = 0.95;       // the head of the table (z)
  const FAR_END = -150.2;      // the dressed table runs back to about 1640; the act that visits 1621 builds the rest
  const SEAT = 0.78;           // spacing between seats
  const LOW = U.isTouch || Math.min(screen.width, screen.height) < 600;

  let renderer, scene, camera, canvas, clock, pmrem;
  const R = (W._ = {}); // internals, for debugging
  const v3 = (x, y, z) => new T.Vector3(x, y, z);
  const rnd = U.seeded(1621);

  /* ================= textures drawn on canvases ================= */
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function linenTex() {
    return canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#ece3cf'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < h; i += 2) { x.fillStyle = `rgba(120,95,60,${0.02 + rnd() * 0.05})`; x.fillRect(0, i, w, 1); }
      for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(120,95,60,${0.02 + rnd() * 0.04})`; x.fillRect(i, 0, 1, h); }
      for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(90,70,40,${rnd() * 0.06})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1); }
    }, [3, 30]);
  }
  function runnerTex() {
    return canvasTex(256, 512, (x, w, h) => {
      x.fillStyle = '#5e1020'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < h; i += 3) { x.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`; x.fillRect(0, i, w, 1); }
      [[14, 6], [28, 2], [w - 20, 6], [w - 30, 2]].forEach(([px, pw]) => { x.fillStyle = '#c9963a'; x.fillRect(px, 0, pw, h); });
      for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(255,200,150,${rnd() * 0.05})`; x.fillRect(rnd() * w, rnd() * h, 2, 1); }
    }, [1, 86]);
  }
  function woodTex() {
    return canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#2a1a0f'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        x.strokeStyle = `rgba(${70 + rnd() * 40},${40 + rnd() * 25},${20 + rnd() * 12},${0.25 + rnd() * 0.3})`;
        x.lineWidth = 1 + rnd() * 3; x.beginPath();
        const y0 = rnd() * h; x.moveTo(0, y0);
        for (let px = 0; px <= w; px += 32) x.lineTo(px, y0 + Math.sin(px / 60 + i) * 6 + rnd() * 2);
        x.stroke();
      }
      for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, (i * h) / 6, w, 2); }
    }, [8, 40]);
  }
  function leafTex() {
    return canvasTex(128, 128, (x) => {
      x.translate(64, 64); x.fillStyle = '#fff';
      const pts = [[0, -1], [0.18, -0.55], [0.55, -0.72], [0.45, -0.3], [0.95, -0.25], [0.6, 0.05], [0.75, 0.35], [0.3, 0.25], [0.08, 0.55], [0.06, 0.95], [-0.06, 0.95], [-0.08, 0.55], [-0.3, 0.25], [-0.75, 0.35], [-0.6, 0.05], [-0.95, -0.25], [-0.45, -0.3], [-0.55, -0.72], [-0.18, -0.55]];
      x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a * 58, b * 58) : x.moveTo(a * 58, b * 58))); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -48); x.lineTo(0, 55); x.stroke();
    });
  }
  function cardTex(name) {
    return canvasTex(256, 128, (x, w, h) => {
      x.fillStyle = '#f3ead6'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(111,21,38,.55)'; x.lineWidth = 2; x.strokeRect(8, 8, w - 16, h - 16);
      x.fillStyle = '#2a1b12';
      let size = 30;
      x.font = `${size}px "Homemade Apple", "Brush Script MT", cursive`;
      while (x.measureText(name).width > w - 40 && size > 12) { size -= 2; x.font = `${size}px "Homemade Apple", "Brush Script MT", cursive`; }
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, w / 2, h / 2 + 6);
    });
  }

  /* ================= geometry helpers ================= */
  const lathe = (pts, seg = 32) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), seg);
  function merge(geos) {
    const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
    let n = 0; parts.forEach((g) => (n += g.attributes.position.count));
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let o = 0;
    parts.forEach((g) => {
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      o += g.attributes.position.count;
    });
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3));
    out.setAttribute('normal', new T.BufferAttribute(nor, 3));
    out.setAttribute('uv', new T.BufferAttribute(uv, 2));
    return out;
  }
  const box = (w, h, d, x, y, z) => { const g = new T.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
  function instanced(geo, mat, list, shadow = true) {
    const m = new T.InstancedMesh(geo, mat, list.length);
    const o = new T.Object3D(), c = new T.Color();
    list.forEach((t, i) => {
      o.position.set(t.p[0], t.p[1], t.p[2]);
      o.rotation.set(t.r ? t.r[0] : 0, t.r ? t.r[1] : 0, t.r ? t.r[2] : 0);
      const s = t.s == null ? 1 : t.s;
      Array.isArray(s) ? o.scale.set(s[0], s[1], s[2]) : o.scale.setScalar(s);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      if (t.c) { c.set(t.c); m.setColorAt(i, c); }
    });
    m.castShadow = shadow; m.receiveShadow = true;
    return m;
  }
  function pumpkinGeo() {
    const g = new T.SphereGeometry(1, 40, 26), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const th = Math.atan2(z, x), groove = Math.pow(Math.abs(Math.cos(4 * th)), 10);
      const r = 1 - 0.09 * groove * (1 - Math.abs(y));
      x *= r; z *= r; y *= 0.7;
      if (y > 0.45) y -= (y - 0.45) * 0.9 * (1 - Math.min(1, Math.hypot(x, z) * 2));
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  }
  function turkeyGeo() {
    const g = new T.SphereGeometry(1, 64, 40), p = g.attributes.position;
    const col = new Float32Array(p.count * 3), a = new T.Color('#c27434'), b = new T.Color('#5a2a10'), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      // breast bulge forward-up, flat-ish bottom
      const breast = Math.exp(-(x * x * 3 + Math.pow(z - 0.35, 2) * 2)) * 0.25 * Math.max(0, y);
      y = y * 0.62 + breast;
      if (y < -0.32) y = -0.32 + (y + 0.32) * 0.2;
      x *= 0.78;
      p.setXYZ(i, x, y, z);
      const n = U.noise(i * 0.37) * 0.5 + 0.5, k = U.clamp(0.35 + y * 0.9 + n * 0.35, 0, 1);
      c.copy(b).lerp(a, k); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }
  function peelGeo() {
    // a spiral of lemon peel hanging over the edge of the table, the oldest joke in Dutch painting
    const pos = [], idx = [], N = 90;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = t * Math.PI * 5.5, r = 0.028 * (1 - t * 0.25);
      const cx = Math.cos(a) * r, cz = Math.sin(a) * r, y = -t * 0.17 + Math.max(0, 0.02 - t * 0.2);
      const out = new T.Vector3(Math.cos(a), 0.15, Math.sin(a)).normalize();
      const w = 0.011;
      pos.push(cx - out.x * 0.002, y + w, cz - out.z * 0.002, cx, y - w, cz);
      if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  function clothGeo() {
    // one long sheet: draped down the left side, across the top, down the right, with folds
    const prof = [];
    const hang = 0.3, segH = 8;
    for (let i = segH; i >= 1; i--) prof.push([-HALF - 0.012, TOP - (i / segH) * hang, i / segH]);
    for (let i = 0; i <= 12; i++) prof.push([-HALF + (i / 12) * HALF * 2, TOP + 0.002, 0]);
    for (let i = 1; i <= segH; i++) prof.push([HALF + 0.012, TOP - (i / segH) * hang, i / segH]);
    const zs = [];
    for (let z = NEAR_END; z >= FAR_END; z -= LOW ? 0.12 : 0.06) zs.push(z);
    const pos = [], uv = [], idx = [];
    let arc = 0;
    const arcs = prof.map((p, i) => (i ? (arc += Math.hypot(p[0] - prof[i - 1][0], p[1] - prof[i - 1][1])) : 0));
    zs.forEach((z, j) => {
      prof.forEach(([x, y, d], i) => {
        const fold = d * d * (0.016 * Math.sin(z * 9.3 + (x < 0 ? 0 : 2)) + 0.008 * Math.sin(z * 23.1 + 1.3));
        pos.push(x + Math.sign(x) * (fold + d * 0.01), y, z);
        uv.push(arcs[i] * 2, z * -0.5);
      });
    });
    const n = prof.length;
    for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < n - 1; i++) {
      const a = j * n + i, b = a + 1, c = a + n, d2 = c + 1;
      idx.push(a, c, b, b, c, d2);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    // the drape over the head of the table
    const ep = [], eu = [], ei = [], cols = 26, rows = 8;
    for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
      const x = -HALF - 0.012 + (c / cols) * (HALF * 2 + 0.024), d = r / rows;
      const fold = d * d * 0.02 * Math.sin(x * 14);
      ep.push(x, TOP - d * hang, NEAR_END + 0.012 + d * 0.012 + fold);
      eu.push(c / cols * 2, d);
    }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c, b = a + 1, cc = a + cols + 1, d2 = cc + 1;
      ei.push(a, b, cc, b, d2, cc);
    }
    const e = new T.BufferGeometry();
    e.setAttribute('position', new T.Float32BufferAttribute(ep, 3));
    e.setAttribute('uv', new T.Float32BufferAttribute(eu, 2));
    e.setIndex(ei); e.computeVertexNormals();
    return [g, e];
  }

  /* ================= shaders ================= */
  const FLAME_V = `
    uniform float uTime, uScale, uBend; attribute float aSeed; attribute float aLit; attribute float aSize;
    varying float vLit; varying float vSeed; varying float vFar;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float d = -mv.z;
      gl_PointSize = aSize * uScale / max(d, 0.05);
      vLit = aLit; vSeed = aSeed; vFar = d;
    }`;
  const FLAME_F = `
    uniform float uTime, uBend, uGain;
    varying float vLit; varying float vSeed; varying float vFar;
    void main(){
      if (vLit < 0.01) discard;
      vec2 p = gl_PointCoord; p.y = 1.0 - p.y;           // 0 at bottom
      float t = uTime * 1.0 + vSeed * 17.0;
      float h = 0.62 * (0.9 + 0.1 * sin(t * 13.0) + 0.05 * sin(t * 31.0)) * vLit * (1.0 - abs(uBend) * 0.4);
      float sway = (sin(t * 2.3) * 0.03 + sin(t * 7.7) * 0.015) * p.y + uBend * 0.55 * p.y * p.y;
      vec2 q = vec2(p.x - 0.5 - sway, p.y - 0.2);
      float yy = q.y / h;
      float w = 0.13 * (1.0 + abs(uBend) * 0.4) * smoothstep(-0.12, 0.25, yy) * pow(max(0.0, 1.0 - yy), 0.75);
      float body = smoothstep(w, w * 0.25, abs(q.x)) * step(-0.1, yy) * step(yy, 1.0);
      float core = smoothstep(w * 0.55, 0.0, abs(q.x)) * smoothstep(0.75, 0.05, yy) * step(-0.05, yy);
      float glow = exp(-dot(q - vec2(0.0, h * 0.35), q - vec2(0.0, h * 0.35)) * 26.0) * 0.35;
      float blue = smoothstep(0.08, 0.0, abs(yy + 0.02)) * smoothstep(w, 0.0, abs(q.x)) * 0.6;
      vec3 col = vec3(1.0, 0.45, 0.12) * body * 1.6 + vec3(1.0, 0.86, 0.55) * core * 3.2 + vec3(1.0, 0.55, 0.2) * glow + vec3(0.2, 0.35, 1.0) * blue;
      float fade = exp(-max(0.0, vFar - 2.0) * 0.045);
      gl_FragColor = vec4(col * vLit * uGain * fade, 1.0);
    }`;
  const HALO_F = `
    uniform float uGain; varying float vLit; varying float vSeed; varying float vFar; uniform float uTime;
    void main(){
      if (vLit < 0.01) discard;
      vec2 q = gl_PointCoord - 0.5;
      float r = length(q) * 2.0;
      float f = 0.9 + 0.1 * sin(uTime * 9.0 + vSeed * 40.0);
      float a = pow(max(0.0, 1.0 - r), 2.4) * 0.22 * f;
      float fade = exp(-max(0.0, vFar - 2.0) * 0.03);
      gl_FragColor = vec4(vec3(1.0, 0.6, 0.25) * a * vLit * uGain * fade, 1.0);
    }`;
  const POOL_V = `
    attribute float aLit; varying float vLit; varying vec2 vUv;
    void main(){
      vUv = uv; vLit = aLit;
      vec4 p = vec4(position, 1.0);
      #ifdef USE_INSTANCING
      p = instanceMatrix * p;
      #endif
      gl_Position = projectionMatrix * modelViewMatrix * p;
    }`;
  const POOL_F = `
    uniform float uTime; uniform float uGain; varying float vLit; varying vec2 vUv;
    void main(){
      float r = length(vUv - 0.5) * 2.0;
      float a = pow(max(0.0, 1.0 - r), 2.2) * (0.92 + 0.08 * sin(uTime * 8.0 + vUv.x * 3.0));
      gl_FragColor = vec4(vec3(1.0, 0.5, 0.18) * a * vLit * 0.24 * uGain, 1.0);
    }`;
  const DUST_V = `
    uniform float uTime, uScale; uniform vec3 uL1, uL2; attribute float aSeed; varying float vA;
    void main(){
      vec3 p = position;
      p.x += sin(uTime * 0.11 + aSeed * 6.0) * 0.12;
      p.y += mod(uTime * 0.012 * (0.4 + aSeed), 1.4) - 0.7 + sin(uTime * 0.3 + aSeed * 9.0) * 0.03;
      p.z += cos(uTime * 0.09 + aSeed * 4.0) * 0.12;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uScale * (0.6 + aSeed) / max(-mv.z, 0.1);
      float l = 1.0 / (1.0 + dot(p - uL1, p - uL1) * 9.0) + 1.0 / (1.0 + dot(p - uL2, p - uL2) * 12.0);
      vA = l * (0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 30.0));
    }`;
  const DUST_F = `
    varying float vA; uniform float uGain;
    void main(){ float r = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, r) * vA * uGain; gl_FragColor = vec4(vec3(1.0, 0.8, 0.55) * a * 0.9, 1.0); }`;

  const Q_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const DOWN_F = `
    uniform sampler2D tSrc; uniform vec2 uHp; uniform float uThr; varying vec2 vUv;
    vec3 pre(vec3 c){ if (uThr < 0.0) return c; float br = max(c.r, max(c.g, c.b)); float k = max(0.0, br - uThr) / max(br, 1e-4); return c * k; }
    void main(){
      vec3 s = pre(texture2D(tSrc, vUv).rgb) * 4.0;
      s += pre(texture2D(tSrc, vUv - uHp).rgb) + pre(texture2D(tSrc, vUv + uHp).rgb);
      s += pre(texture2D(tSrc, vUv + vec2(uHp.x, -uHp.y)).rgb) + pre(texture2D(tSrc, vUv - vec2(uHp.x, -uHp.y)).rgb);
      gl_FragColor = vec4(s / 8.0, 1.0);
    }`;
  const UP_F = `
    uniform sampler2D tSrc; uniform sampler2D tBase; uniform vec2 uHp; uniform float uBase; varying vec2 vUv;
    void main(){
      vec3 s = texture2D(tSrc, vUv + vec2(-uHp.x * 2.0, 0.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(-uHp.x, uHp.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(0.0, uHp.y * 2.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(uHp.x, uHp.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(uHp.x * 2.0, 0.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(uHp.x, -uHp.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(0.0, -uHp.y * 2.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(-uHp.x, -uHp.y)).rgb * 2.0;
      gl_FragColor = vec4(s / 12.0 + texture2D(tBase, vUv).rgb * uBase, 1.0);
    }`;
  const COMP_F = `
    uniform sampler2D tScene, tBloom, tSoft; uniform float uBloom, uExposure, uTime, uSoft, uDim, uVig, uGrain, uCA, uFade; uniform vec2 uRes;
    varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5;
      float ca = uCA * dot(c, c);
      vec3 col = vec3(texture2D(tScene, vUv - c * ca).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv + c * ca).b);
      if (uSoft > 0.001) col = mix(col, texture2D(tSoft, vUv).rgb, uSoft);
      col += texture2D(tBloom, vUv).rgb * uBloom;
      col *= uExposure * uDim;
      col = aces(col);
      col = pow(col, vec3(1.0 / 2.2));
      col *= vec3(1.03, 1.0, 0.93);
      float v = smoothstep(0.95, 0.25, length(c * vec2(1.15, 1.0)));
      col *= mix(1.0 - uVig, 1.0, v);
      col += (hash(vUv * uRes + fract(uTime * 7.13) * 91.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col * uFade, 1.0);
    }`;

  /* ================= the room ================= */
  const mats = {};
  const candles = []; // {pos: Vector3, lit, target, light?}
  let flames, halos, pools, dust, heroFlame, heroHalo, heroLight, cursorLight, cursorTarget, moon, hemi, nearLights = [];
  let heroCandleMesh, heroWax = 0.24, cards = [], feast = {};

  function buildRoom() {
    scene = new T.Scene();
    scene.background = new T.Color('#050403');
    scene.fog = new T.FogExp2('#050403', 0.09);

    // environment for reflections: a dark room with a few warm windows of light
    const env = new T.Scene();
    env.background = new T.Color('#0a0806');
    const eg = new T.SphereGeometry(0.4, 12, 8);
    [[3, 1.5, -2, '#ffb060', 6], [-2.5, 1.2, 2, '#ff9a40', 4], [0, 4, 0, '#2a2420', 1], [-4, 2, -3, '#8aa0d0', 1.6], [2, 0.5, 3, '#ffc080', 3]].forEach(([x, y, z, c, s]) => {
      const m = new T.Mesh(eg, new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(s) })); m.position.set(x, y, z); env.add(m);
    });
    pmrem = new T.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(env, 0.04).texture;

    mats.linen = new T.MeshStandardMaterial({ color: '#d6cab0', roughness: 0.93, metalness: 0, map: linenTex(), side: T.DoubleSide });
    mats.runner = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.82, map: runnerTex() });
    mats.pewter = new T.MeshStandardMaterial({ color: '#a4a69e', metalness: 0.9, roughness: 0.3, envMap, envMapIntensity: 1.1 });
    mats.china = new T.MeshStandardMaterial({ color: '#e2dacb', roughness: 0.24, metalness: 0, envMap, envMapIntensity: 0.55 });
    mats.gold = new T.MeshStandardMaterial({ color: '#c9a04a', metalness: 1, roughness: 0.3, envMap });
    mats.glass = new T.MeshStandardMaterial({ color: '#f6efe2', roughness: 0.03, metalness: 0.3, envMap, envMapIntensity: 1.0, transparent: true, opacity: 0.11, depthWrite: false, side: T.DoubleSide });
    mats.roemer = new T.MeshStandardMaterial({ color: '#8fae5a', roughness: 0.05, metalness: 0.1, envMap, envMapIntensity: 2, transparent: true, opacity: 0.45, depthWrite: false, side: T.DoubleSide });
    mats.wine = new T.MeshStandardMaterial({ color: '#4a0710', roughness: 0.1, metalness: 0, envMap, envMapIntensity: 0.8, transparent: true, opacity: 0.88 });
    mats.wax = new T.MeshStandardMaterial({ color: '#efe3c6', roughness: 0.6, emissive: '#3a1a05', emissiveIntensity: 0.4 });
    mats.wood = new T.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.62, metalness: 0, map: woodTex() });
    mats.floor = new T.MeshStandardMaterial({ color: '#4a3424', roughness: 0.55, map: woodTex() });
    mats.turkey = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0, envMap, envMapIntensity: 0.45 });
    mats.cran = new T.MeshStandardMaterial({ color: '#8c0f22', roughness: 0.18, envMap, envMapIntensity: 0.9 });
    mats.pumpkin = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, envMap, envMapIntensity: 0.25 });
    mats.lemon = new T.MeshStandardMaterial({ color: '#e7b72a', roughness: 0.42, envMap, envMapIntensity: 0.4 });
    mats.grape = new T.MeshStandardMaterial({ color: '#3a1830', roughness: 0.16, envMap, envMapIntensity: 1 });
    mats.bread = new T.MeshStandardMaterial({ color: '#c58842', roughness: 0.7 });
    mats.pie = new T.MeshStandardMaterial({ color: '#a8561f', roughness: 0.48, envMap, envMapIntensity: 0.3 });
    mats.crust = new T.MeshStandardMaterial({ color: '#d7a05a', roughness: 0.75 });
    mats.napkin = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 });
    mats.stem = new T.MeshStandardMaterial({ color: '#4a3a1c', roughness: 0.8 });
    mats.leaf = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, map: leafTex(), alphaTest: 0.5, side: T.DoubleSide });
    mats.frill = new T.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9 });
    mats.herb = new T.MeshStandardMaterial({ color: '#3f5a26', roughness: 0.7 });

    // floor and the table
    const floor = new T.Mesh(new T.PlaneGeometry(14, 156), mats.floor);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -76); floor.receiveShadow = true; scene.add(floor);
    const [clothG, endG] = clothGeo();
    const cloth = new T.Mesh(clothG, mats.linen); cloth.receiveShadow = true; cloth.castShadow = false; scene.add(cloth);
    const endCloth = new T.Mesh(endG, mats.linen); endCloth.receiveShadow = true; scene.add(endCloth);
    const runner = new T.Mesh(new T.PlaneGeometry(0.34, NEAR_END - FAR_END + 0.3), mats.runner);
    runner.rotation.x = -Math.PI / 2; runner.position.set(0, TOP + 0.003, (NEAR_END + FAR_END) / 2 + 0.15); runner.receiveShadow = true; scene.add(runner);
    const legs = [];
    for (let z = NEAR_END - 0.1; z > FAR_END; z -= 2.4) [-1, 1].forEach((s) => legs.push({ p: [s * (HALF - 0.08), (TOP - 0.3) / 2, z] }));
    scene.add(instanced(new T.BoxGeometry(0.07, TOP - 0.3, 0.07), mats.wood, legs));

    // place settings, both sides, all the way down
    const plateG = lathe([[0, 0], [0.085, 0], [0.095, 0.003], [0.113, 0.011], [0.128, 0.017], [0.132, 0.018], [0.13, 0.014], [0.11, 0.007], [0.09, 0.0035], [0, 0.0035]], 40);
    const glassG = lathe([[0, 0], [0.034, 0], [0.035, 0.003], [0.007, 0.009], [0.004, 0.022], [0.004, 0.085], [0.013, 0.096], [0.033, 0.12], [0.04, 0.15], [0.038, 0.18], [0.034, 0.2], [0.032, 0.2], [0.036, 0.18], [0.038, 0.15], [0.031, 0.121], [0.012, 0.098], [0, 0.097]], 28);
    const wineG = lathe([[0, 0.099], [0.012, 0.1], [0.03, 0.12], [0.036, 0.14], [0, 0.14]], 24);
    const forkG = new T.BoxGeometry(0.016, 0.004, 0.19);
    const napG = new T.CylinderGeometry(0.075, 0.075, 0.014, 3); napG.rotateY(Math.PI / 6);
    const chairG = merge([
      box(0.44, 0.045, 0.42, 0, 0.46, 0),
      box(0.04, 0.46, 0.04, -0.19, 0.23, -0.18), box(0.04, 0.46, 0.04, 0.19, 0.23, -0.18),
      box(0.04, 0.46, 0.04, -0.19, 0.23, 0.18), box(0.04, 0.46, 0.04, 0.19, 0.23, 0.18),
      box(0.042, 0.62, 0.042, -0.19, 0.78, 0.19), box(0.042, 0.62, 0.042, 0.19, 0.78, 0.19),
      box(0.4, 0.06, 0.025, 0, 0.7, 0.19), box(0.4, 0.06, 0.025, 0, 0.86, 0.19), box(0.4, 0.07, 0.025, 0, 1.03, 0.19),
    ]);
    const plates = [], smalls = [], glasses = [], wines = [], forks = [], knives = [], naps = [], chairs = [];
    const NAPS = ['#6f1526', '#646a3a', '#b9852e', '#3d5878', '#8a3a1c'];
    R.seats = [];
    for (let z = 0.15, k = 0; z > FAR_END + 0.6; z -= SEAT, k++) {
      [-1, 1].forEach((side) => {
        if (k === 3 && side === 1) R.emptySeat = { z, side };
        const x = side * 0.36, jitter = (rnd() - 0.5) * 0.02;
        R.seats.push({ x, z, side });
        plates.push({ p: [x, TOP + 0.004, z + jitter] });
        smalls.push({ p: [x, TOP + 0.021, z + jitter], s: 0.7 });
        naps.push({ p: [x, TOP + 0.03, z + jitter], r: [0, rnd() * 0.6 + (side > 0 ? Math.PI : 0), 0], c: NAPS[(k + (side > 0 ? 2 : 0)) % NAPS.length] });
        glasses.push({ p: [x - side * 0.15, TOP, z - 0.17] });
        wines.push({ p: [x - side * 0.15, TOP, z - 0.17], s: [1, 0.7 + rnd() * 0.5, 1] });
        forks.push({ p: [x, TOP + 0.003, z - 0.17 * side], r: [0, Math.PI / 2, 0] });
        knives.push({ p: [x, TOP + 0.003, z + 0.17 * side], r: [0, Math.PI / 2, 0], s: [1, 1, 0.9] });
        const out = (k + side) % 5 === 0 ? 0.12 : 0;
        chairs.push({ p: [side * (0.82 + out), 0, z], r: [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0] });
      });
    }
    scene.add(instanced(plateG, mats.china, plates));
    scene.add(instanced(plateG, mats.china, smalls));
    scene.add(instanced(napG, mats.napkin, naps));
    const gm = instanced(glassG, mats.glass, glasses, false); gm.renderOrder = 2; scene.add(gm);
    scene.add(instanced(wineG, mats.wine, wines, false));
    scene.add(instanced(forkG, mats.pewter, forks));
    scene.add(instanced(forkG, mats.pewter, knives));
    scene.add(instanced(chairG, mats.wood, chairs));
    R.counts = { seats: R.seats.length };

    // candlesticks every 1.56 m, gourds and leaves between
    const stickG = lathe([[0, 0], [0.058, 0], [0.059, 0.008], [0.047, 0.015], [0.021, 0.024], [0.016, 0.042], [0.025, 0.052], [0.014, 0.062], [0.012, 0.13], [0.021, 0.142], [0.014, 0.152], [0.013, 0.19], [0.036, 0.2], [0.037, 0.207], [0.016, 0.211], [0.016, 0.232], [0, 0.232]], 32);
    const candleG = new T.CylinderGeometry(0.0115, 0.0125, 1, 16); candleG.translate(0, 0.5, 0);
    const sticks = [], waxes = [];
    for (let z = -0.55, i = 0; z > FAR_END + 1; z -= 1.56, i++) {
      const h = 0.18 + rnd() * 0.1;
      sticks.push({ p: [0, TOP, z] });
      waxes.push({ p: [0, TOP + 0.232, z], s: [1, h, 1] });
      candles.push({ pos: v3(0, TOP + 0.232 + h + 0.012, z), lit: 0, target: 0, idx: candles.length });
    }
    scene.add(instanced(stickG, mats.pewter, sticks));
    R.stickG = stickG; R.candleG = candleG;
    R.waxMesh = instanced(candleG, mats.wax, waxes); scene.add(R.waxMesh);
    R.waxList = waxes;

    // the hero candle, close to you at the head of the table
    const hero = new T.Group(); hero.position.set(-0.24, TOP, 0.42);
    const hs = new T.Mesh(stickG, mats.pewter); hs.castShadow = true; hs.receiveShadow = true; hero.add(hs);
    heroCandleMesh = new T.Mesh(candleG, new T.MeshStandardMaterial({ color: '#f2e7cc', roughness: 0.55, emissive: '#ff8a30', emissiveIntensity: 0 }));
    heroCandleMesh.position.y = 0.232; heroCandleMesh.scale.set(1.05, heroWax, 1.05); heroCandleMesh.castShadow = true;
    hero.add(heroCandleMesh); scene.add(hero);
    R.hero = hero;

    // fruit, gourds, leaves between the candles
    const pumps = [], grapesL = [], leaves = [], stems = [];
    const PUMP = ['#c8641e', '#e08a2c', '#efe2c4', '#7c8a3a', '#b84c18', '#d9a441'];
    for (let z = -1.33; z > FAR_END + 1; z -= 1.56) {
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const s = 0.035 + rnd() * 0.035, x = (rnd() - 0.5) * 0.22, zz = z + (rnd() - 0.5) * 0.4;
        pumps.push({ p: [x, TOP + s * 0.7, zz], s, r: [0, rnd() * 6, 0], c: U.pick(PUMP) });
        stems.push({ p: [x, TOP + s * 1.32, zz], s: [s * 0.18, s * 0.5, s * 0.18], r: [rnd() * 0.4, 0, rnd() * 0.3] });
      }
      for (let i = 0; i < 9; i++) leaves.push({ p: [(rnd() - 0.5) * 0.5, TOP + 0.004 + rnd() * 0.004, z + (rnd() - 0.5) * 1.3], r: [-Math.PI / 2 + (rnd() - 0.5) * 0.3, 0, rnd() * 6], s: 0.05 + rnd() * 0.04, c: U.pick(['#9b3a18', '#c8641e', '#8a2a1c', '#c9963a', '#6d3b1a']) });
    }
    const pumpM = instanced(pumpkinGeo(), mats.pumpkin, pumps); scene.add(pumpM);
    scene.add(instanced(new T.CylinderGeometry(0.6, 1, 1, 6), mats.stem, stems));
    scene.add(instanced(new T.PlaneGeometry(1, 1), mats.leaf, leaves, false));

    buildFeast(envMap, plateG, glassG);

    // flames: every candle, one draw call
    const n = candles.length;
    const fp = new Float32Array(n * 3), fs = new Float32Array(n), fl = new Float32Array(n), fz = new Float32Array(n);
    candles.forEach((c, i) => { fp.set([c.pos.x, c.pos.y, c.pos.z], i * 3); fs[i] = rnd(); fl[i] = 0; fz[i] = 0.05; });
    const fg = new T.BufferGeometry();
    fg.setAttribute('position', new T.BufferAttribute(fp, 3));
    fg.setAttribute('aSeed', new T.BufferAttribute(fs, 1));
    fg.setAttribute('aLit', new T.BufferAttribute(fl, 1));
    fg.setAttribute('aSize', new T.BufferAttribute(fz, 1));
    const fu = { uTime: { value: 0 }, uScale: { value: 1 }, uBend: { value: 0 }, uGain: { value: 1 } };
    flames = new T.Points(fg, new T.ShaderMaterial({ uniforms: fu, vertexShader: FLAME_V, fragmentShader: FLAME_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    flames.frustumCulled = false; scene.add(flames);
    const hz = new Float32Array(n).fill(0.9);
    const hg = fg.clone(); hg.setAttribute('aSize', new T.BufferAttribute(hz, 1)); hg.setAttribute('aLit', fg.attributes.aLit);
    halos = new T.Points(hg, new T.ShaderMaterial({ uniforms: fu, vertexShader: FLAME_V, fragmentShader: HALO_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    halos.frustumCulled = false; scene.add(halos);

    // the hero's flame has its own uniforms (it bends when you blow)
    const hgeo = new T.BufferGeometry();
    hgeo.setAttribute('position', new T.BufferAttribute(new Float32Array(3), 3));
    hgeo.setAttribute('aSeed', new T.BufferAttribute(new Float32Array([0.3]), 1));
    hgeo.setAttribute('aLit', new T.BufferAttribute(new Float32Array([0]), 1));
    hgeo.setAttribute('aSize', new T.BufferAttribute(new Float32Array([0.055]), 1));
    const hu = { uTime: fu.uTime, uScale: fu.uScale, uBend: { value: 0 }, uGain: { value: 1.1 } };
    heroFlame = new T.Points(hgeo, new T.ShaderMaterial({ uniforms: hu, vertexShader: FLAME_V, fragmentShader: FLAME_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    heroFlame.frustumCulled = false; scene.add(heroFlame);
    const hhg = hgeo.clone(); hhg.setAttribute('aLit', hgeo.attributes.aLit); hhg.setAttribute('aSize', new T.BufferAttribute(new Float32Array([1.2]), 1));
    heroHalo = new T.Points(hhg, new T.ShaderMaterial({ uniforms: hu, vertexShader: FLAME_V, fragmentShader: HALO_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    heroHalo.frustumCulled = false; scene.add(heroHalo);
    R.heroU = hu; R.flameU = fu;

    // pools of light on the cloth under each candle
    const pg = new T.PlaneGeometry(0.95, 0.95); pg.rotateX(-Math.PI / 2);
    const pl = new Float32Array(n + 1);
    pg.setAttribute('aLit', new T.InstancedBufferAttribute(pl, 1));
    const pu = { uTime: fu.uTime, uGain: { value: 1 } };
    pools = new T.InstancedMesh(pg, new T.ShaderMaterial({ uniforms: pu, vertexShader: POOL_V, fragmentShader: POOL_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }), n + 1);
    const o = new T.Object3D();
    candles.forEach((c, i) => { o.position.set(c.pos.x, TOP + 0.006, c.pos.z); o.updateMatrix(); pools.setMatrixAt(i, o.matrix); });
    o.position.set(hero.position.x, TOP + 0.006, hero.position.z); o.updateMatrix(); pools.setMatrixAt(n, o.matrix);
    pools.frustumCulled = false; scene.add(pools);
    R.poolLit = pl;

    // dust in the light
    const DN = LOW ? 260 : 700, dp = new Float32Array(DN * 3), ds = new Float32Array(DN);
    for (let i = 0; i < DN; i++) { dp.set([(rnd() - 0.5) * 2.6, TOP + 0.1 + rnd() * 1.4, 1.6 - rnd() * 6], i * 3); ds[i] = rnd(); }
    const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3)); dg.setAttribute('aSeed', new T.BufferAttribute(ds, 1));
    const du = { uTime: fu.uTime, uScale: { value: 1 }, uL1: { value: v3(0, 1, 0) }, uL2: { value: v3(0, 1, 0) }, uGain: { value: 1 } };
    dust = new T.Points(dg, new T.ShaderMaterial({ uniforms: du, vertexShader: DUST_V, fragmentShader: DUST_F, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    dust.frustumCulled = false; scene.add(dust);
    R.dustU = du;

    // lights
    hemi = new T.HemisphereLight('#3a3348', '#0a0705', 0.06); scene.add(hemi);
    moon = new T.DirectionalLight('#7d93c8', 0.0); moon.position.set(-4, 5, -7); scene.add(moon);
    heroLight = new T.PointLight('#ff9a48', 0, 5, 2);
    heroLight.position.set(hero.position.x, TOP + 0.232 + heroWax + 0.05, hero.position.z);
    heroLight.castShadow = true; heroLight.shadow.mapSize.set(LOW ? 256 : 512, LOW ? 256 : 512); heroLight.shadow.bias = -0.002; heroLight.shadow.camera.near = 0.03;
    scene.add(heroLight);
    for (let i = 0; i < 3; i++) { const l = new T.PointLight('#ff9a48', 0, 3.2, 2); scene.add(l); nearLights.push(l); }
    cursorLight = new T.SpotLight('#ffb36a', 0, 5, 0.85, 1, 2);
    cursorTarget = new T.Object3D(); scene.add(cursorTarget); cursorLight.target = cursorTarget;
    cursorLight.castShadow = true; cursorLight.shadow.mapSize.set(LOW ? 512 : 1024, LOW ? 512 : 1024); cursorLight.shadow.bias = -0.0008; cursorLight.shadow.camera.near = 0.05; cursorLight.shadow.camera.far = 4;
    scene.add(cursorLight);

    // a sky, for when the walls fall away
    const skyU = { uAmount: { value: 0 }, uTime: fu.uTime };
    const sky = new T.Mesh(new T.SphereGeometry(600, 48, 24), new T.ShaderMaterial({
      uniforms: skyU, side: T.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uAmount, uTime; varying vec3 vDir;
        float h(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        void main(){
          if (uAmount < 0.002) discard;
          vec3 d = normalize(vDir);
          float horizon = smoothstep(-0.05, 0.25, d.y);
          vec3 col = mix(vec3(0.03, 0.035, 0.06), vec3(0.004, 0.006, 0.016), horizon);
          col += vec3(0.08, 0.05, 0.03) * pow(1.0 - abs(d.y), 8.0);
          float band = exp(-pow(dot(d, normalize(vec3(0.3, 0.6, -0.75))) * 3.2, 2.0));
          col += vec3(0.05, 0.05, 0.08) * band * horizon;
          vec3 p = d * 220.0; vec3 c = floor(p); vec3 f = fract(p) - 0.5;
          float r = h(c);
          if (r > 0.965) {
            vec3 o = vec3(h(c + 1.3), h(c + 2.7), h(c + 4.1)) - 0.5;
            float s = smoothstep(0.09 + 0.12 * (r - 0.965) * 25.0, 0.0, length(f - o * 0.6));
            float tw = 0.6 + 0.4 * sin(uTime * (1.0 + r * 5.0) + r * 60.0);
            col += vec3(1.0, 0.95, 0.85) * s * tw * (0.6 + band * 1.5) * horizon * 2.2;
          }
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }));
    sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
    R.skyU = skyU; R.sky = sky;

    // spare candles any act can place (a seat candle, a candle on a hill)
    const XN = 96, xp = new Float32Array(XN * 3), xs = new Float32Array(XN), xl = new Float32Array(XN), xz = new Float32Array(XN).fill(0.05);
    for (let i = 0; i < XN; i++) { xs[i] = rnd(); xp[i * 3 + 1] = -100; }
    const xg = new T.BufferGeometry();
    xg.setAttribute('position', new T.BufferAttribute(xp, 3)); xg.setAttribute('aSeed', new T.BufferAttribute(xs, 1));
    xg.setAttribute('aLit', new T.BufferAttribute(xl, 1)); xg.setAttribute('aSize', new T.BufferAttribute(xz, 1));
    const xf = new T.Points(xg, flames.material); xf.frustumCulled = false; scene.add(xf);
    const xhg = xg.clone(); xhg.setAttribute('aLit', xg.attributes.aLit); xhg.setAttribute('aSize', new T.BufferAttribute(new Float32Array(XN).fill(0.8), 1));
    const xh = new T.Points(xhg, halos.material); xh.frustumCulled = false; scene.add(xh);
    R.extra = { geo: xg, halo: xhg, n: 0, max: XN, list: [] };
  }

  function buildFeast(envMap, plateG, glassG) {
    const g = new T.Group(); scene.add(g); feast.group = g;
    // the bird
    const platter = new T.Mesh(plateG, mats.pewter); platter.scale.set(2.3, 1.2, 1.7); platter.position.set(0.12, TOP, -0.2);
    platter.receiveShadow = true; platter.castShadow = true; g.add(platter);
    const bird = new T.Group(); bird.position.set(0.12, TOP + 0.07, -0.2); bird.rotation.y = -0.5; g.add(bird); feast.bird = bird;
    const body = new T.Mesh(turkeyGeo(), mats.turkey); body.scale.set(0.15, 0.13, 0.19); body.castShadow = true; body.receiveShadow = true; bird.add(body);
    const legG = lathe([[0, 0], [0.024, 0.006], [0.036, 0.03], [0.04, 0.06], [0.034, 0.09], [0.018, 0.11], [0.011, 0.122], [0.013, 0.134], [0, 0.138]], 20);
    [-1, 1].forEach((s) => {
      const leg = new T.Mesh(legG, mats.turkey); leg.position.set(s * 0.085, -0.03, 0.06); leg.rotation.set(1.15, 0, -s * 0.35); leg.castShadow = true; bird.add(leg);
      const frill = new T.Mesh(new T.CylinderGeometry(0.014, 0.009, 0.026, 10, 1, true), mats.frill); frill.position.set(s * 0.115, 0.055, 0.155); frill.rotation.set(1.15, 0, -s * 0.35); bird.add(frill);
      const wing = new T.Mesh(new T.SphereGeometry(1, 20, 14), mats.turkey); wing.scale.set(0.03, 0.06, 0.1); wing.position.set(s * 0.13, 0.0, -0.03); wing.rotation.z = s * 0.4; wing.castShadow = true; bird.add(wing);
    });
    // herbs and cranberries around the platter
    const herbs = [], crans = [];
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, r = 0.2 + rnd() * 0.06; herbs.push({ p: [0.12 + Math.cos(a) * r * 1.1, TOP + 0.02, -0.2 + Math.sin(a) * r * 0.75], s: 0.012 + rnd() * 0.01 }); }
    g.add(instanced(new T.IcosahedronGeometry(1, 0), mats.herb, herbs));
    // cranberry sauce bowl
    const bowlG = lathe([[0, 0], [0.04, 0], [0.042, 0.004], [0.07, 0.035], [0.075, 0.05], [0.072, 0.05], [0.066, 0.036], [0.04, 0.008], [0, 0.008]], 32);
    const bowl = new T.Mesh(bowlG, mats.china); bowl.position.set(-0.22, TOP, -0.62); bowl.castShadow = true; bowl.receiveShadow = true; g.add(bowl);
    for (let i = 0; i < 90; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.062; crans.push({ p: [-0.22 + Math.cos(a) * r, TOP + 0.034 + rnd() * 0.022 - r * 0.2, -0.62 + Math.sin(a) * r], s: 0.0085 + rnd() * 0.003 }); }
    g.add(instanced(new T.SphereGeometry(1, 10, 8), mats.cran, crans));
    // pumpkin pie
    const dish = new T.Mesh(lathe([[0, 0], [0.09, 0], [0.11, 0.03], [0.118, 0.032], [0.115, 0.028], [0, 0.028]], 40), mats.crust); dish.position.set(0.3, TOP, -0.85); dish.castShadow = true; g.add(dish);
    const fill = new T.Mesh(new T.CylinderGeometry(0.104, 0.1, 0.008, 40), mats.pie); fill.position.set(0.3, TOP + 0.026, -0.85); g.add(fill);
    const rimG = new T.TorusGeometry(0.11, 0.008, 6, 48), rp = rimG.attributes.position;
    for (let i = 0; i < rp.count; i++) { const x = rp.getX(i), y = rp.getY(i), a = Math.atan2(y, x), k = 1 + 0.06 * Math.abs(Math.sin(a * 14)); rp.setXY(i, x * k, y * k); }
    rimG.computeVertexNormals();
    const rim = new T.Mesh(rimG, mats.crust); rim.rotation.x = -Math.PI / 2; rim.position.set(0.3, TOP + 0.03, -0.85); g.add(rim);
    // rolls in a basket
    const basket = new T.Mesh(lathe([[0, 0], [0.07, 0], [0.09, 0.045], [0.095, 0.05], [0.09, 0.05], [0.066, 0.008], [0, 0.008]], 24), mats.wood); basket.scale.set(1.3, 1, 1); basket.position.set(-0.2, TOP, -1.05); basket.castShadow = true; g.add(basket);
    const rolls = [];
    for (let i = 0; i < 6; i++) rolls.push({ p: [-0.2 + (rnd() - 0.5) * 0.12, TOP + 0.045 + rnd() * 0.01, -1.05 + (rnd() - 0.5) * 0.08], s: [0.034, 0.024, 0.028], r: [0, rnd() * 3, 0] });
    g.add(instanced(new T.SphereGeometry(1, 16, 12), mats.bread, rolls));
    // the still life by your hand: a lemon, half peeled, its rind over the edge; grapes; a roemer
    const lemon = new T.Mesh(new T.SphereGeometry(1, 24, 18), mats.lemon); lemon.scale.set(0.034, 0.028, 0.028); lemon.position.set(0.3, TOP + 0.03, 0.55); lemon.rotation.y = 0.6; lemon.castShadow = true; g.add(lemon);
    const peel = new T.Mesh(peelGeo(), new T.MeshStandardMaterial({ color: '#e5b22a', roughness: 0.5, side: T.DoubleSide })); peel.position.set(0.33, TOP + 0.03, 0.6); peel.castShadow = true; g.add(peel);
    feast.peel = peel;
    const grapes = [];
    for (let i = 0; i < 26; i++) { const t = i / 26, a = i * 2.4; grapes.push({ p: [0.43 + Math.cos(a) * 0.03 * (1 - t), TOP + 0.012 + (1 - t) * 0.03, 0.36 + Math.sin(a) * 0.03 * (1 - t) + t * 0.08], s: 0.0115 }); }
    g.add(instanced(new T.SphereGeometry(1, 12, 10), mats.grape, grapes));
    const roemer = new T.Mesh(lathe([[0, 0], [0.032, 0], [0.03, 0.01], [0.02, 0.02], [0.02, 0.07], [0.028, 0.08], [0.05, 0.12], [0.055, 0.15], [0.05, 0.18], [0.048, 0.18], [0.052, 0.15], [0.047, 0.12], [0.026, 0.083], [0, 0.082]], 28), mats.roemer);
    roemer.position.set(0.06, TOP, 0.62); roemer.renderOrder = 2; g.add(roemer);
    // an overturned glass, because every still life has one
    const tipped = new T.Mesh(glassG, mats.glass); tipped.rotation.set(0, 0.6, Math.PI / 2 - 0.08); tipped.position.set(0.44, TOP + 0.04, 0.05); tipped.renderOrder = 2; g.add(tipped);
    // place cards for the family, and one at Grandpa Joe's place
    const NAMES = ['Grandma Ruth', 'Uncle Dale', 'Aunt Linda', 'Mom', 'Dad', 'Grandpa Joe', 'Tyler', 'Skye', 'Maya', 'Benji'];
    const cardG = new T.BoxGeometry(0.085, 0.045, 0.002);
    R.seats.slice(0, NAMES.length).forEach((s, i) => {
      const m = new T.Mesh(cardG, [mats.china, mats.china, mats.china, mats.china, new T.MeshStandardMaterial({ map: cardTex(NAMES[i]), roughness: 0.8 }), mats.china]);
      m.position.set(s.x - s.side * 0.02, TOP + 0.03, s.z + 0.13 * 0 - 0.0);
      m.position.set(s.x, TOP + 0.05, s.z - 0.12);
      m.rotation.set(-0.25, s.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      m.castShadow = true; g.add(m); cards.push(m);
    });
    // "your" card, at the head of the table
    const yours = new T.Mesh(cardG, [mats.china, mats.china, mats.china, mats.china, new T.MeshStandardMaterial({ map: cardTex('You'), roughness: 0.8 }), mats.china]);
    yours.position.set(0.12, TOP + 0.05, 0.72); yours.rotation.set(-0.3, 0, 0); yours.castShadow = true; g.add(yours); R.yourCard = yours;
  }

  /* ================= post-processing ================= */
  let rtScene, down = [], up = [], softD = [], softU, quad, qscene, qcam, M = {};
  const LEVELS = 5;
  function makeRT(w, h, ms) {
    const opts = { type: renderer.capabilities.isWebGL2 ? T.HalfFloatType : T.UnsignedByteType, format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: !!ms, stencilBuffer: false };
    if (ms && renderer.capabilities.isWebGL2 && T.WebGLMultisampleRenderTarget && !LOW) { const r = new T.WebGLMultisampleRenderTarget(w, h, opts); r.samples = 4; return r; }
    return new T.WebGLRenderTarget(w, h, opts);
  }
  function buildPost() {
    qscene = new T.Scene(); qcam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quad = new T.Mesh(new T.PlaneGeometry(2, 2)); quad.frustumCulled = false; qscene.add(quad);
    const sm = (f, u) => new T.ShaderMaterial({ uniforms: u, vertexShader: Q_V, fragmentShader: f, depthTest: false, depthWrite: false });
    M.down = sm(DOWN_F, { tSrc: { value: null }, uHp: { value: new T.Vector2() }, uThr: { value: 1 } });
    M.up = sm(UP_F, { tSrc: { value: null }, tBase: { value: null }, uHp: { value: new T.Vector2() }, uBase: { value: 1 } });
    M.comp = sm(COMP_F, {
      tScene: { value: null }, tBloom: { value: null }, tSoft: { value: null },
      uBloom: { value: 0.62 }, uExposure: { value: 0.95 }, uTime: { value: 0 }, uSoft: { value: 0 }, uDim: { value: 1 },
      uVig: { value: 0.55 }, uGrain: { value: 0.035 }, uCA: { value: 0.012 }, uFade: { value: 1 }, uRes: { value: new T.Vector2(1, 1) },
    });
  }
  function sizePost(w, h) {
    [rtScene, ...down, ...up, ...softD, softU].forEach((r) => r && r.dispose());
    rtScene = makeRT(w, h, true);
    down = []; up = [];
    let dw = w, dh = h;
    for (let i = 0; i < LEVELS; i++) { dw = Math.max(2, dw >> 1); dh = Math.max(2, dh >> 1); down.push(makeRT(dw, dh)); up.push(makeRT(dw, dh)); }
    softD = [makeRT(w >> 1, h >> 1), makeRT(w >> 2, h >> 2), makeRT(w >> 3, h >> 3)];
    softU = makeRT(w >> 2, h >> 2);
    M.comp.uniforms.uRes.value.set(w, h);
  }
  function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(qscene, qcam); }
  function downPass(src, dst, thr) {
    M.down.uniforms.tSrc.value = src.texture;
    M.down.uniforms.uHp.value.set(0.5 / src.width, 0.5 / src.height);
    M.down.uniforms.uThr.value = thr; pass(M.down, dst);
  }
  function upPass(src, base, dst, baseK = 1) {
    M.up.uniforms.tSrc.value = src.texture; M.up.uniforms.tBase.value = base ? base.texture : src.texture;
    M.up.uniforms.uHp.value.set(0.5 / src.width, 0.5 / src.height); M.up.uniforms.uBase.value = base ? baseK : 0;
    pass(M.up, dst);
  }

  /* ================= camera ================= */
  const SHOTS = {
    dark: { pos: [0.02, 1.13, 1.12], look: [-0.24, 1.18, 0.42], fov: 28 },
    hero: { pos: [0.18, 1.1, 1.2], look: [-0.16, 1.02, 0.2], fov: 32 },
    reveal: { pos: [0.08, 1.7, 2.6], look: [0, 0.92, -7], fov: 34 },
    menu: { pos: [0.0, 2.05, 2.5], look: [0, 0.78, -3.2], fov: 38 },
    course1: { pos: [0.75, 1.32, -2.2], look: [-0.25, 0.92, -5.5], fov: 34 },
    course2: { pos: [-0.7, 1.4, -6.5], look: [0.2, 0.86, -9.6], fov: 34 },
    course3: { pos: [0.72, 1.3, -11], look: [-0.25, 0.9, -14], fov: 34 },
    course4: { pos: [-0.62, 1.2, -15.3], look: [0.15, 1.0, -18.2], fov: 32 },
    grace: { pos: [-0.62, 1.12, 1.35], look: [-0.05, 0.98, -0.6], fov: 30 },
    finale: { pos: [0.12, 1.16, 1.3], look: [-0.2, 1.02, 0.3], fov: 32 },
    above: { pos: [0, 7.5, 3.5], look: [0, 0.6, -10], fov: 42 },
  };
  W.SHOTS = SHOTS;
  const cam = { pos: v3(...SHOTS.dark.pos), look: v3(...SHOTS.dark.look), fov: SHOTS.dark.fov, tween: null, par: new T.Vector2(), name: 'dark' };
  W.shot = function (name, o = {}) {
    const s = typeof name === 'string' ? SHOTS[name] : name;
    if (!s) return Promise.resolve();
    cam.name = typeof name === 'string' ? name : 'custom';
    W.shotName = cam.name;
    const dur = U.reducedMotion ? Math.min(0.4, o.dur ?? 2.4) : o.dur ?? 2.4;
    if (cam.tween) cam.tween.cancel();
    if (dur <= 0.01) { cam.pos.set(...s.pos); cam.look.set(...s.look); cam.fov = s.fov; return Promise.resolve(); }
    const p0 = cam.pos.clone(), l0 = cam.look.clone(), f0 = cam.fov, p1 = v3(...s.pos), l1 = v3(...s.look), f1 = s.fov;
    const lift = o.lift ?? Math.min(0.5, p0.distanceTo(p1) * 0.06);
    cam.tween = U.tween({ from: 0, to: 1, dur, ease: o.ease || 'inOutCubic', onUpdate: (k) => {
      cam.pos.lerpVectors(p0, p1, k); cam.pos.y += Math.sin(k * Math.PI) * lift;
      cam.look.lerpVectors(l0, l1, U.ease.inOutSine(k)); cam.fov = U.lerp(f0, f1, k);
    } });
    return cam.tween.done;
  };

  /* ================= candles ================= */
  W.candleCount = () => candles.length;
  W.ignite = function (o = {}) {
    // light every candle down the table, near to far, like a rumor travelling
    const from = o.from ?? 0, gap = o.gap ?? 0.11, list = candles.slice(from);
    list.forEach((c, i) => {
      setTimeout(() => {
        c.target = 1;
        if (i < 22 && LT.audio.ready && !o.quiet && c.lit < 0.5) {
          const far = U.clamp(i / 22, 0, 1);
          LT.audio.noise({ dur: 0.16, a: 0.01, g: 0.12 * (1 - far * 0.8), filters: [{ type: 'bandpass', f: 1400, f2: 500, q: 0.8 }], pan: (i % 2 ? 0.25 : -0.25) * (1 - far), rev: 0.4 });
          if (i % 2 === 0) LT.audio.note('musicbox', [86, 83, 81, 79, 76, 74, 71, 69, 67, 64, 62][Math.floor(i / 2) % 11], 1.2, 0.35 * (1 - far * 0.7));
        }
      }, (o.delay || 0) + i * gap * 1000 * (1 + i * 0.012));
    });
    return U.wait((o.delay || 0) + list.length * gap * 1000);
  };
  W.extinguish = function (o = {}) {
    // a breath that travels: near to far, the long table goes to sleep
    const gap = o.gap ?? 0.07, order = candles.slice().sort((a, b) => (o.farFirst ? a.pos.z - b.pos.z : b.pos.z - a.pos.z));
    order.forEach((c, i) => setTimeout(() => {
      c.target = 0;
      if (i < 10 && LT.audio.ready) LT.audio.noise({ dur: 0.22, a: 0.01, g: 0.09 * (1 - i / 10), filters: [{ type: 'bandpass', f: 900, f2: 300, q: 0.7 }], rev: 0.5 });
    }, i * gap * 1000 * (1 + i * 0.01)));
    return U.wait(order.length * gap * 1000 * 1.3 + 400);
  };
  W.setCandles = (v) => candles.forEach((c) => { c.target = v; c.lit = v; });
  W.reset = () => { W.setCandles(0); heroS.lit = heroS.target = heroS.blow = 0; W.hero.burn(0); W.aftermath(false); };

  const heroS = { lit: 0, target: 0, blow: 0 };
  W.hero = {
    light() { heroS.target = 1; heroS.lit = Math.max(heroS.lit, 0.2); },
    out() {
      heroS.target = 0; heroS.lit = 0; heroS.blow = 0;
      const p = W.hero.screenPos();
      if (p && LT.fx) { LT.fx.smoke(p.x, p.y + 12, { count: 26, color: 'rgba(200,190,175,.28)', scale: 1.4 }); setTimeout(() => LT.fx.smoke(p.x, p.y + 10, { count: 12, color: 'rgba(200,190,175,.2)' }), 400); }
    },
    blow(v) { heroS.blow = U.clamp(v, 0, 1); },
    burn(v) { heroWax = 0.24 * (1 - U.clamp(v, 0, 1) * 0.75); heroCandleMesh.scale.y = heroWax; },
    get lit() { return heroS.target > 0; },
    worldPos() { return v3(R.hero.position.x, TOP + 0.232 + heroWax + 0.012, R.hero.position.z); },
    screenPos() {
      if (!camera) return null;
      const p = W.hero.worldPos().project(camera);
      return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
    },
  };
  W.setCard = (i, name) => { if (cards[i]) { cards[i].material[4].map = cardTex(name); cards[i].material[4].needsUpdate = true; } };
  W.setChair = (name) => {
    // a place set for someone who isn't here this year
    if (!name || !scene || R.chairName === name) return;
    R.chairName = name;
    const s = R.seats[10];
    if (!R.chairCard) {
      const g = new T.BoxGeometry(0.085, 0.045, 0.002), m = mats.china;
      R.chairCard = new T.Mesh(g, [m, m, m, m, new T.MeshStandardMaterial({ map: cardTex(name), roughness: 0.8 }), m]);
      R.chairCard.position.set(s.x, TOP + 0.05, s.z - 0.12);
      R.chairCard.rotation.set(-0.25, s.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      R.chairCard.castShadow = true; scene.add(R.chairCard);
    } else { R.chairCard.material[4].map = cardTex(name); R.chairCard.material[4].needsUpdate = true; }
  };
  W.setYourCard = (name) => { if (R.yourCard) { R.yourCard.material[4].map = cardTex(name); R.yourCard.material[4].needsUpdate = true; } };
  W.aftermath = function (on) {
    // the end of the night: a carved bird, lower wine, burned-down candles
    if (!feast.bird) return;
    feast.bird.scale.set(on ? 0.82 : 1, on ? 0.7 : 1, on ? 0.86 : 1);
    R.waxList.forEach((w, i) => {
      const o = new T.Object3D(); o.position.set(...w.p); o.scale.set(1, on ? w.s[1] * 0.38 : w.s[1], 1); o.updateMatrix(); R.waxMesh.setMatrixAt(i, o.matrix);
      candles[i].pos.y = TOP + 0.232 + (on ? w.s[1] * 0.38 : w.s[1]) + 0.012;
      flames.geometry.attributes.position.setY(i, candles[i].pos.y);
    });
    R.waxMesh.instanceMatrix.needsUpdate = true; flames.geometry.attributes.position.needsUpdate = true;
  };

  /* ================= tools for the acts ================= */
  W.T = T; W.TOP = TOP; W.HALF = HALF; W.SEAT = SEAT; W.NEAR_END = NEAR_END; W.FAR_END = FAR_END; W.LOW = LOW;
  W.mats = mats; W.lathe = lathe; W.merge = merge; W.box = box; W.instanced = instanced; W.canvasTex = canvasTex; W.cardTex = cardTex;
  W.candles = candles;
  W.rnd = rnd;
  /** where a year sits on the table: one seat per year, 2026 at the head */
  W.yearPos = (year) => {
    const i = Math.max(0, 2026 - year), row = Math.floor(i / 2), side = i % 2 ? 1 : -1;
    return { x: side * 0.36, z: 0.15 - row * SEAT, side, z0: 0.15 - (i / 2) * SEAT };
  };
  W.zOfYear = (year) => 0.15 - ((2026 - year) / 2) * SEAT;
  const hooks = new Set();
  W.onFrame = (fn) => { hooks.add(fn); return () => hooks.delete(fn); };
  /** screen position of a world point: {x, y, on} */
  W.project = (v) => {
    const p = (v.isVector3 ? v.clone() : v3(v[0], v[1], v[2])).project(camera);
    return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight, on: p.z < 1 && p.z > -1 && Math.abs(p.x) < 1.2 && Math.abs(p.y) < 1.2 };
  };
  const quake = { a: 0, t: 0, d: 0 };
  /** shake the camera itself (amount in metres-ish, seconds) */
  W.shake = (amount = 0.04, seconds = 0.6) => { if (U.reducedMotion) return; quake.a = Math.max(quake.a * (1 - quake.t / Math.max(quake.d, 0.001)), amount); quake.d = seconds; quake.t = 0; };
  W.cursorHit = () => hit.clone();
  W.cursorRay = () => ray;
  W.camState = () => ({ pos: cam.pos.clone(), look: cam.look.clone(), fov: cam.fov });
  /** fly the camera along a path of positions (and look targets) */
  W.fly = function (o) {
    if (cam.tween) cam.tween.cancel();
    const P = new T.CatmullRomCurve3(o.points.map((p) => (p.isVector3 ? p : v3(...p))), false, 'centripetal');
    const L = new T.CatmullRomCurve3(o.looks.map((p) => (p.isVector3 ? p : v3(...p))), false, 'centripetal');
    const f0 = cam.fov, f1 = o.fov ?? cam.fov;
    cam.name = 'flight'; W.shotName = 'flight';
    cam.tween = U.tween({ from: 0, to: 1, dur: U.reducedMotion ? Math.min(1, o.dur) : o.dur, ease: o.ease || 'inOutSine', onUpdate: (k) => {
      cam.pos.copy(P.getPointAt(k)); cam.look.copy(L.getPointAt(k)); cam.fov = U.lerp(f0, f1, k); o.onUpdate && o.onUpdate(k);
    } });
    return cam.tween.done;
  };
  const env = { sky: 0, skyT: 0, fog: 0.09, fogT: 0.09, exposure: 0.95, exposureT: 0.95, bloom: 0.62, bloomT: 0.62, floor: 1 };
  W.sky = (v) => { env.skyT = v; };
  W.fog = (v) => { env.fogT = v; };
  W.post = (o = {}) => { if (o.exposure != null) env.exposureT = o.exposure; if (o.bloom != null) env.bloomT = o.bloom; };
  W.floor = (on) => { scene.children.forEach((c) => { if (c.material === mats.floor) c.visible = on; }); };
  /** a spare candle flame (bring your own candlestick) */
  W.addFlame = (pos, o = {}) => {
    const X = R.extra;
    if (X.n >= X.max) return null;
    const i = X.n++;
    const p = pos.isVector3 ? pos.clone() : v3(...pos);
    X.geo.attributes.position.setXYZ(i, p.x, p.y, p.z); X.geo.attributes.position.needsUpdate = true;
    X.halo.attributes.position.setXYZ(i, p.x, p.y, p.z); X.halo.attributes.position.needsUpdate = true;
    if (o.size) { X.geo.attributes.aSize.setX(i, o.size); X.geo.attributes.aSize.needsUpdate = true; }
    const f = { i, lit: 0, target: 0, pos: p,
      light() { f.target = 1; return f; }, out() { f.target = 0; return f; },
      move(q) { f.pos.copy(q.isVector3 ? q : v3(...q)); X.geo.attributes.position.setXYZ(i, f.pos.x, f.pos.y, f.pos.z); X.halo.attributes.position.setXYZ(i, f.pos.x, f.pos.y, f.pos.z); X.geo.attributes.position.needsUpdate = X.halo.attributes.position.needsUpdate = true; } };
    X.list.push(f);
    return f;
  };
  /** a pewter candlestick with a candle, flame included; returns {group, flame} */
  W.makeCandle = (parent, pos, o = {}) => {
    const g = new T.Group(); g.position.copy(pos.isVector3 ? pos : v3(...pos));
    const h = o.height ?? 0.18, sc = o.scale ?? 0.7;
    const stick = new T.Mesh(R.stickG, mats.pewter); stick.scale.setScalar(sc); stick.castShadow = true; g.add(stick);
    const c = new T.Mesh(R.candleG, mats.wax); c.position.y = 0.232 * sc; c.scale.set(sc, h, sc); c.castShadow = true; g.add(c);
    (parent || scene).add(g);
    g.updateMatrixWorld(true);
    const tip = v3(0, 0.232 * sc + h + 0.01, 0).applyMatrix4(g.matrixWorld);
    const flame = W.addFlame(tip, { size: 0.045 * (sc / 0.7) });
    return { group: g, flame };
  };

  /* ================= state, visibility ================= */
  const look = { dim: 1, dimT: 1, soft: 0, softT: 0, cursor: 0, cursorT: 0, moon: 0, moonT: 0, ambient: 0.06, fade: 1 };
  W.mood = (o = {}) => {
    if (o.dim != null) look.dimT = o.dim;
    if (o.soft != null) look.softT = o.soft;
    if (o.cursor != null) look.cursorT = o.cursor;
    if (o.moon != null) look.moonT = o.moon;
    if (o.instant) { look.dim = look.dimT; look.soft = look.softT; look.cursor = look.cursorT; look.moon = look.moonT; }
  };
  W.show = function (on, o = {}) {
    if (!W.ok) return;
    W.visible = on;
    canvas.style.transition = `opacity ${o.dur ?? 0.9}s ease`;
    canvas.style.opacity = on ? '1' : '0';
    if (on) { running = true; } else { clearTimeout(hideT); hideT = setTimeout(() => { if (!W.visible) running = false; }, (o.dur ?? 0.9) * 1000 + 60); }
  };
  let running = false, hideT;

  /* ================= frame ================= */
  let pr = 1, maxPr = 1, slow = 0, fast = 0;
  const ray = new T.Raycaster(), ndc = new T.Vector2(), hit = v3(0, TOP, 0), cursorPos = v3(0, TOP + 0.55, 0.3);
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    sizePost(Math.round(w * pr), Math.round(h * pr));
  }
  let slowFor = 0;
  function frame(dt, t, raw) {
    if (!running) return;
    // if even the lowest resolution can't keep up, bow out and let the 2D piece carry on
    if (W.visible && !window.LT_FORCE_WORLD) {
      slowFor = raw > 0.09 && pr <= 0.61 ? slowFor + raw : Math.max(0, slowFor - raw);
      if (slowFor > 4) { W.ok = false; W.show(false); running = false; LT.bus.emit('world:lost'); console.info('The Long Table: 3D room turned off on this device to keep things smooth.'); return; }
    }
    // adaptive resolution
    if (dt > 1 / 38) slow += dt; else slow = Math.max(0, slow - dt * 0.5);
    if (dt < 1 / 55) fast += dt; else fast = 0;
    if (slow > 1.2 && pr > 0.6) { pr = Math.max(0.6, pr - 0.2); slow = 0; resize(); }
    else if (fast > 6 && pr < maxPr) { pr = Math.min(maxPr, pr + 0.1); fast = 0; resize(); }

    const k = 1 - Math.pow(0.04, dt);
    look.dim += (look.dimT - look.dim) * k; look.soft += (look.softT - look.soft) * k;
    look.cursor += (look.cursorT - look.cursor) * k; look.moon += (look.moonT - look.moon) * k;
    R.flameU.uTime.value = t;
    env.sky += (env.skyT - env.sky) * k; env.fog += (env.fogT - env.fog) * k;
    env.exposure += (env.exposureT - env.exposure) * k; env.bloom += (env.bloomT - env.bloom) * k;
    R.skyU.uAmount.value = env.sky; R.sky.visible = env.sky > 0.002; scene.fog.density = env.fog;
    M.comp.uniforms.uExposure.value = env.exposure; M.comp.uniforms.uBloom.value = env.bloom;
    const X = R.extra;
    if (X.list.length) {
      X.list.forEach((f) => { f.lit += (f.target - f.lit) * Math.min(1, dt * (f.target > f.lit ? 4 : 6)); X.geo.attributes.aLit.array[f.i] = f.lit; });
      X.geo.attributes.aLit.needsUpdate = true;
    }
    hooks.forEach((fn) => { try { fn(dt, t, raw); } catch (e) { console.warn('world hook', e); hooks.delete(fn); } });

    // candles flicker toward their targets
    const lit = flames.geometry.attributes.aLit;
    let anyLit = 0;
    candles.forEach((c, i) => {
      c.lit += (c.target - c.lit) * Math.min(1, dt * (c.target > c.lit ? 5 : 3));
      lit.array[i] = c.lit; R.poolLit[i] = c.lit * (0.9 + 0.1 * U.noise(t * 6 + i));
      anyLit += c.lit;
    });
    lit.needsUpdate = true;
    heroS.lit += (heroS.target - heroS.lit) * Math.min(1, dt * (heroS.target > heroS.lit ? 3 : 8));
    const hp = W.hero.worldPos();
    heroFlame.geometry.attributes.position.setXYZ(0, hp.x, hp.y, hp.z); heroFlame.geometry.attributes.position.needsUpdate = true;
    heroHalo.geometry.attributes.position.setXYZ(0, hp.x, hp.y, hp.z); heroHalo.geometry.attributes.position.needsUpdate = true;
    heroFlame.geometry.attributes.aLit.array[0] = heroS.lit; heroFlame.geometry.attributes.aLit.needsUpdate = true;
    R.heroU.uBend.value += (-heroS.blow * 1.1 + Math.sin(t * 1.3) * 0.04 * heroS.lit - R.heroU.uBend.value) * Math.min(1, dt * 10);
    R.poolLit[candles.length] = heroS.lit * (0.85 + 0.15 * U.noise(t * 9));
    pools.geometry.attributes.aLit.needsUpdate = true;
    heroCandleMesh.material.emissiveIntensity = heroS.lit * 0.35;
    const flick = 1 + U.noise(t * 7.3) * 0.12 + U.noise(t * 19 + 3) * 0.06;
    heroLight.intensity = heroS.lit * 1.5 * flick * (1 - heroS.blow * 0.5);
    heroLight.position.set(hp.x, hp.y + 0.03, hp.z);
    // the three nearest lit candles get real light
    const i0 = U.clamp(Math.round((-0.55 - cam.look.z * 0.6 - cam.pos.z * 0.4) / 1.56), 1, candles.length - 2);
    nearLights.forEach((l, j) => { const c = candles[i0 - 1 + j]; if (c) { l.position.copy(c.pos).y += 0.03; l.intensity = c.lit * 1.0 * (1 + U.noise(t * 8 + j * 5) * 0.12); } });
    moon.intensity = look.moon * 0.35;

    // the light you carry
    if (LT.pointer.active) {
      ndc.set((LT.pointer.x / innerWidth) * 2 - 1, -(LT.pointer.y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const d = ray.ray.direction, o = ray.ray.origin;
      if (d.y < -0.02) {
        const s = (TOP - o.y) / d.y;
        hit.set(U.clamp(o.x + d.x * s, -1.2, 1.2), TOP, U.clamp(o.z + d.z * s, cam.pos.z - 7, cam.pos.z + 0.4));
      }
    }
    const want = v3(hit.x * 0.92, TOP + 0.5, hit.z + 0.12);
    cursorPos.lerp(want, Math.min(1, dt * 6));
    cursorLight.position.copy(cursorPos);
    cursorTarget.position.set(cursorPos.x, TOP, cursorPos.z - 0.12);
    cursorLight.intensity = look.cursor * 1.25 * (1 + U.noise(t * 6.1 + 7) * 0.08);
    R.dustU.uL1.value.copy(cursorPos); R.dustU.uL2.value.copy(hp);
    R.dustU.uGain.value = 0.25 + look.cursor * 0.6 + heroS.lit * 0.4;

    // camera: the shot, a breath of handheld, a little parallax
    cam.par.x += ((LT.pointer.active ? LT.pointer.x / innerWidth - 0.5 : 0) - cam.par.x) * Math.min(1, dt * 2);
    cam.par.y += ((LT.pointer.active ? LT.pointer.y / innerHeight - 0.5 : 0) - cam.par.y) * Math.min(1, dt * 2);
    const hh = U.reducedMotion ? 0 : 1;
    camera.position.set(cam.pos.x + cam.par.x * 0.05 + U.noise(t * 0.31) * 0.006 * hh, cam.pos.y - cam.par.y * 0.03 + U.noise(t * 0.27 + 5) * 0.005 * hh, cam.pos.z);
    let qx = 0, qy = 0;
    if (quake.t < quake.d) { quake.t += raw || dt; const kq = 1 - quake.t / quake.d, a = quake.a * kq * kq; qx = (Math.random() - 0.5) * a; qy = (Math.random() - 0.5) * a; camera.position.x += qx; camera.position.y += qy; }
    camera.lookAt(cam.look.x + cam.par.x * 0.08 + qx * 0.5, cam.look.y - cam.par.y * 0.04 + qy * 0.5, cam.look.z);
    if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
    const sc = (innerHeight * pr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    R.flameU.uScale.value = sc; R.dustU.uScale.value = sc * 0.004;

    // render: scene -> bloom chain -> composite
    renderer.setRenderTarget(rtScene);
    renderer.render(scene, camera);
    downPass(rtScene, down[0], renderer.capabilities.isWebGL2 ? 1.8 : 0.85);
    for (let i = 1; i < LEVELS; i++) downPass(down[i - 1], down[i], -1);
    upPass(down[LEVELS - 1], down[LEVELS - 2], up[LEVELS - 2]);
    for (let i = LEVELS - 3; i >= 0; i--) upPass(up[i + 1], down[i], up[i]);
    if (look.soft > 0.01) {
      downPass(rtScene, softD[0], -1); downPass(softD[0], softD[1], -1); downPass(softD[1], softD[2], -1);
      upPass(softD[2], null, softU);
    }
    const u = M.comp.uniforms;
    u.tScene.value = rtScene.texture; u.tBloom.value = up[0].texture; u.tSoft.value = softU.texture;
    u.uSoft.value = look.soft; u.uDim.value = look.dim; u.uTime.value = t;
    pass(M.comp, null);
  }

  /* ================= mount ================= */
  W.mount = function (cv) {
    try {
      canvas = cv;
      renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
      renderer.outputEncoding = T.LinearEncoding;
      renderer.toneMapping = T.NoToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      maxPr = pr = Math.min(window.devicePixelRatio || 1, LOW ? 1 : 1.5);
      camera = new T.PerspectiveCamera(30, innerWidth / innerHeight, 0.02, 900);
      clock = new T.Clock();
      buildRoom();
      buildPost();
      resize();
      addEventListener('resize', () => resize());
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); W.ok = false; W.show(false); LT.bus.emit('world:lost'); });
      LT.loop.add(frame);
      W.ok = true;
      W.renderer = renderer; W.scene = scene; W.camera = camera;
      // warm the shaders up once so the first lit frame doesn't hitch
      running = true; frame(0.016, 0); running = false;
      canvas.style.opacity = '0';
      // the place cards want the handwriting font; redraw once it arrives
      if (document.fonts && document.fonts.load) document.fonts.load('30px "Homemade Apple"').then(() => {
        ['Grandma Ruth', 'Uncle Dale', 'Aunt Linda', 'Mom', 'Dad', 'Grandpa Joe', 'Tyler', 'Skye', 'Maya', 'Benji'].forEach((n, i) => W.setCard(i, n));
        W.setYourCard('You');
        if (LT.state && LT.state.chair) W.setChair(LT.state.chair);
      }).catch(() => {});
    } catch (e) {
      console.warn('world unavailable', e);
      W.ok = false;
      try { canvas.remove(); } catch (_) {}
    }
    return W.ok;
  };
})();
