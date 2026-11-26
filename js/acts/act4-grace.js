/* Act IV of the journey — Grace. Around the table, one candle each; the chair; your turn;
   the hands behind one cranberry, all the way out to the stars. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  const RM = U.reducedMotion;

  /* ---------------- who sits where (seat index = place card on the table) ---------------- */
  const SEAT_OF = { grandma: 0, dale: 1, linda: 2, mom: 3, dad: 4, joe: 5, tyler: 6, skye: 7, maya: 8, benji: 9 };
  const CHAIR_SEAT = 10; // W.setChair puts the visitor's card here

  /* the round, far end to the head; each person is one note of a tune */
  const LINES = {
    benji: { name: 'Benji, 4', say: '“Dinosaurs. Pie. Biscuit.”', more: 'He thinks about it for a long time. “And Maya. She lets me watch the volcano videos on her phone.”', mood: 'grin', n: 74 },
    maya: { name: 'Maya, 16', say: '“Grandma’s hands hurt now,\nand she still made the rolls.”', more: 'She takes out one AirPod, which is a big deal. “I came down at six for water and she was kneading. She didn’t know anyone was up. So. That.”', mood: 'tender', n: 76 },
    tyler: { name: 'Cousin Tyler', say: '“Honestly? I’m thankful\nthe startup failed.”', more: 'Uncle Dale puts down his fork. “I moved home for four months. Dad and I rebuilt the back porch. I didn’t know I liked him that much.”', mood: 'tender', n: 79 },
    skye: { name: 'Skye', say: '“Thank you for the chair.”', more: '“My family doesn’t really do this. Linda texted me twice this week to ask what I can eat. Nobody’s ever asked me that.”', mood: 'tender', n: 81 },
    dad: { name: 'Dad', say: '“For this turkey, who died\nso I could make the same joke.”', more: 'Groans all around. He beams; that was the point. “And for Denise, who’s been on her feet since six. Sit down. We’ve got the dishes.”', mood: 'grin', n: 74 },
    mom: { name: 'Mom', say: '“Oh. Okay. I’m sitting.”', more: 'First time she’s sat down since six. “I’m thankful for the mess. I clean this house all year so that one night it can look exactly like this.”', mood: 'happy', n: 76 },
    linda: { name: 'Aunt Linda', say: '“And for a clean scan in June.”', more: 'First she thanks Skye for laughing at one of Dale’s jokes; nobody has since 1994. Then, quieter: “I didn’t tell most of you. I’m telling you now. That’s all. Eat your vegetables.”', mood: 'tender', n: 79 },
    dale: { name: 'Uncle Dale', say: '“That the fire department\nhasn’t had to come out. *Yet.*”', more: 'He puts his hand over Linda’s and leaves it there. “And her. That’s the speech.”', mood: 'tender', n: 83 },
    biscuit: { name: 'Biscuit', say: 'Two thumps of a tail\nagainst the table leg.', more: 'Everyone agrees this counts.', n: 86 },
  };
  const ROUND1 = ['benji', 'maya', 'tyler', 'skye'];
  const ROUND2 = ['dad', 'mom', 'linda', 'dale'];
  const GRANDMA = [
    { say: '“Fifty-one Thanksgivings\nwith Joe.”', more: 'Grandma Ruth. “He carved like a surgeon and burned the rolls every single year. I let him. You let people do things.”', ms: 6500 },
    { say: '“I still set his place.\nIt’s not sad.”', more: 'She looks down the table at the empty chair, and lights the candle in front of it herself.', joe: true, ms: 6500 },
    { say: '“Well. It’s a little sad.”', more: 'Nobody says anything for a second. That’s allowed too.', ms: 5200 },
    { say: '“Pass the rolls.”', more: '', ms: 3000, end: true },
  ];

  /* the hands behind one cranberry (the first two rings are written by hand; the rest is everyone) */
  const HANDS = [
    { l: 'A grower in Wisconsin', t: 'p', note: 'Wisconsin grows more than half of America’s cranberries.', k: ['her father, who dug the first bog', 'the crew that floods the bog in October', 'the bank that waited out a bad year', 'her kids, on the harvest boom'] },
    { l: 'Honeybees, rented by the hive', t: 'n', note: 'Cranberry growers rent honeybee hives every summer to pollinate the flowers.', k: ['the beekeeper who trucks them in', 'the queen', 'wildflowers by the ditch'] },
    { l: 'A glacier', t: 'n', note: 'Many cranberry bogs began as kettle holes left behind by retreating glaciers.', k: ['the last ice age', 'a block of ice that melted into a kettle hole', 'ten thousand years of peat'] },
    { l: 'The Wampanoag', t: 'p', note: 'They ate sasumuneash, fresh and dried, for thousands of years before 1621. The Aquinnah Wampanoag still hold Cranberry Day.', k: ['grandmothers who knew which bogs to pick', 'Aquinnah families on Cranberry Day', 'the word sasumuneash'] },
    { l: 'A truck driver on I-94', t: 'p', note: '', k: ['the mechanic who did her brakes', 'the diner that fed her at 3 a.m.', 'her kid, who she called from the road'] },
    { l: 'Whoever stocked the shelf', t: 'p', note: '', k: ['the night manager', 'the forklift driver', 'the person who mopped aisle 7'] },
    { l: 'Rain', t: 'n', note: '', k: ['the Great Lakes', 'the sun, which lifted it into the clouds'] },
  ];
  const TYPE_COL = { p: [1.0, 0.72, 0.42], n: [0.62, 0.86, 0.72], t: [1.0, 0.86, 0.5] };
  const N_WEB = 1000;

  /* ---------------- state built once ---------------- */
  let S = null;

  function paperFigure(W, id, mood, dog) {
    // a family member, cut out of paper: the SVG figure rendered once into a texture
    const T = W.T;
    let svgInner = '';
    try {
      const f = dog ? LT.family.dogFigure({ mood: mood || 'happy' }) : LT.family.figure(id, { mood: mood || 'tender', bob: 0 });
      if (!dog && mood) f.mood(mood);
      svgInner = f.el.outerHTML;
      f.destroy();
    } catch (e) { console.warn('paper figure', id, e); }
    const defs = (document.getElementById('lt-family-defs') || { innerHTML: '' }).innerHTML;
    const vb = dog ? '-80 -160 160 190' : '-100 -268 200 296';
    const [vx, vy, vw, vh] = vb.split(' ').map(Number);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${vw * 2}" height="${vh * 2}">${defs}${svgInner}</svg>`;
    const cw = 256, ch = Math.round((256 * vh) / vw);
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      const x = cv.getContext('2d');
      try {
        // a white paper edge, like it was cut out with scissors
        x.filter = 'brightness(0) invert(1)';
        for (let a = 0; a < 12; a++) x.drawImage(img, Math.cos((a / 12) * 6.283) * 5, Math.sin((a / 12) * 6.283) * 5, cw, ch);
        x.filter = 'none';
      } catch (e) { /* no canvas filters: no paper edge */ }
      x.drawImage(img, 0, 0, cw, ch);
      tex.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const m = 0.0022; // metres per SVG unit
    const geo = new T.PlaneGeometry(vw * m, vh * m);
    geo.translate(0, (-(vy + vh) * m) + (vh * m) / 2, 0); // the figure's origin (seat level) sits at y = 0
    const mat = new T.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.22, roughness: 1, metalness: 0, alphaTest: 0.5, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, mat);
    return { mesh, mat, glow: 0.22, glowT: 0.22 };
  }

  function seatXZ(W, i) { const p = W.yearPos(2026 - i); return { x: p.x, z: p.z, side: p.side }; }

  function textCard(W, w, h) {
    // a folded card you can write on; returns {mesh, write(text)}
    const T = W.T;
    const cv = document.createElement('canvas'); cv.width = 768; cv.height = Math.round((768 * h) / w);
    const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
    const face = new T.MeshStandardMaterial({ map: tex, roughness: 0.85, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.12 });
    const plain = W.mats.china;
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, 0.002), [plain, plain, plain, plain, face, plain]);
    mesh.castShadow = true;
    const write = (text) => {
      const x = cv.getContext('2d'), W2 = cv.width, H2 = cv.height;
      x.fillStyle = '#f4ead6'; x.fillRect(0, 0, W2, H2);
      x.strokeStyle = 'rgba(61,88,120,.22)'; x.lineWidth = 2;
      for (let y = 86; y < H2 - 20; y += 52) { x.beginPath(); x.moveTo(30, y); x.lineTo(W2 - 30, y); x.stroke(); }
      x.strokeStyle = 'rgba(111,21,38,.5)'; x.lineWidth = 3; x.strokeRect(12, 12, W2 - 24, H2 - 24);
      x.fillStyle = '#6f1526'; x.font = '26px "IM Fell English SC", Georgia, serif'; x.textAlign = 'left';
      x.fillText('thankful for', 40, 56);
      x.fillStyle = '#26304a';
      let size = 36;
      const lines = (sz) => {
        x.font = `${sz}px "Homemade Apple", "Brush Script MT", cursive`;
        const out = []; let line = '';
        String(text).split(/\s+/).forEach((wd) => { const tr = line ? line + ' ' + wd : wd; if (x.measureText(tr).width > W2 - 90 && line) { out.push(line); line = wd; } else line = tr; });
        if (line) out.push(line);
        return out;
      };
      let L = lines(size);
      while (L.length * 52 > H2 - 110 && size > 18) { size -= 3; L = lines(size); }
      L.forEach((ln, i) => x.fillText(ln, 44, 80 + i * 52));
      tex.needsUpdate = true;
    };
    return { mesh, write };
  }

  function build(group, W) {
    const T = W.T, TOP = W.TOP, rnd = U.seeded(4004);
    S = { figs: {}, flames: {}, W };

    // the family, in paper, at their places
    Object.keys(SEAT_OF).forEach((id) => {
      if (id === 'joe') return;
      const s = seatXZ(W, SEAT_OF[id]);
      const p = paperFigure(W, id, (LINES[id] && LINES[id].mood) || (id === 'grandma' ? 'tender' : 'happy'));
      p.mesh.position.set(s.side * 0.74, TOP - 0.02, s.z + 0.02);
      group.add(p.mesh);
      S.figs[id] = p;
      // a little candle on the table in front of each of them
      const c = W.makeCandle(group, [s.side * 0.15, TOP, s.z + 0.16], { height: 0.07 + rnd() * 0.03, scale: 0.5 });
      S.flames[id] = c.flame;
    });
    // Biscuit, peeking over the corner by Grandma
    const dog = paperFigure(W, 'biscuit', 'beg', true);
    dog.mesh.position.set(-0.66, TOP - 0.2, 0.62); dog.mesh.scale.setScalar(0.95);
    group.add(dog.mesh); S.figs.biscuit = dog;
    // Grandpa Joe's candle, and one for whoever the visitor names
    const js = seatXZ(W, SEAT_OF.joe);
    S.flames.joe = W.makeCandle(group, [js.side * 0.15, TOP, js.z + 0.16], { height: 0.12, scale: 0.55 }).flame;
    const cs = seatXZ(W, CHAIR_SEAT);
    S.flames.chair = W.makeCandle(group, [cs.side * 0.15, TOP, cs.z + 0.16], { height: 0.12, scale: 0.55 }).flame;
    // your place: a plate, one cranberry, a card to write on, two candles for later
    const plateG = W.lathe([[0, 0], [0.085, 0], [0.095, 0.003], [0.113, 0.011], [0.128, 0.017], [0.132, 0.018], [0.13, 0.014], [0.11, 0.007], [0.09, 0.0035], [0, 0.0035]], 40);
    const plate = new T.Mesh(plateG, W.mats.china); plate.scale.setScalar(0.78); plate.position.set(-0.08, TOP, 0.76); plate.receiveShadow = true; group.add(plate);
    S.cranPos = new T.Vector3(-0.08, TOP + 0.016, 0.76);
    const cran = new T.Mesh(new T.SphereGeometry(0.013, 20, 14), W.mats.cran); cran.position.copy(S.cranPos); cran.castShadow = true; group.add(cran);
    S.cran = cran;
    const card = textCard(W, 0.17, 0.11);
    card.mesh.position.set(-0.16, TOP + 0.057, 0.58); card.mesh.rotation.set(-0.32, 0.25, 0); group.add(card.mesh);
    S.card = card;
    card.write(LT.state.thanks || '');
    card.mesh.visible = !!LT.state.thanks;
    if (document.fonts && document.fonts.load) document.fonts.load('30px "Homemade Apple"').then(() => card.write(LT.state.thanks || '')).catch(() => {});
    S.flames.have = W.makeCandle(group, [-0.44, TOP, 0.84], { height: 0.1, scale: 0.55 }).flame;
    S.flames.miss = W.makeCandle(group, [-0.5, TOP, 0.62], { height: 0.13, scale: 0.55 }).flame;

    buildWeb(group, W, rnd);

    // paper faces the camera; whoever is speaking glows a little
    W.onFrame((dt) => {
      if (!group.visible) return;
      const cp = W.camera.position;
      Object.values(S.figs).forEach((f) => {
        const m = f.mesh;
        m.rotation.y = Math.atan2(cp.x - m.position.x, cp.z - m.position.z);
        f.glow += (f.glowT - f.glow) * Math.min(1, dt * 4);
        f.mat.emissiveIntensity = f.glow;
      });
      stepWeb(dt);
    });
  }

  /* ---------------- the web of hands ---------------- */
  function buildWeb(group, W, rnd) {
    const T = W.T, TOP = W.TOP, c = S.cranPos;
    const pos = [], col = [], parent = [], label = [], type = [];
    const push = (x, y, z, t, p, l) => { pos.push(x, y, z); const k = TYPE_COL[t]; col.push(k[0], k[1], k[2]); type.push(t); parent.push(p); label.push(l || ''); return pos.length / 3 - 1; };
    push(c.x, c.y + 0.01, c.z, 'n', -1, '');
    // ring one: around the plate, rising
    HANDS.forEach((h, i) => {
      const a = -Math.PI * 0.95 + (i / (HANDS.length - 1)) * Math.PI * 1.9 + Math.PI, r = 0.62 + (i % 2) * 0.22;
      const id = push(c.x + Math.sin(a) * r, TOP + 0.38 + (i % 3) * 0.14, c.z - Math.cos(a) * r * 0.9 - 0.25, h.t, 0, h.l);
      h.id = id;
    });
    // ring two: their people
    HANDS.forEach((h, i) => {
      const p = pos.slice(h.id * 3, h.id * 3 + 3);
      h.kid = h.k.map((l, j) => {
        const a = Math.atan2(p[0] - c.x, -(p[2] - c.z)) + (j - (h.k.length - 1) / 2) * 0.42;
        const r = 1.35 + rnd() * 0.6;
        const t = /\b(her|his|the person|crew|kids|families|grandmothers|beekeeper|manager|driver|mechanic|diner|kid|bank|father)\b/.test(l) ? 'p' : h.t;
        return push(c.x + Math.sin(a) * r, TOP + 0.75 + rnd() * 0.75, c.z - Math.cos(a) * r - 0.25, t, h.id, l);
      });
    });
    S.handwritten = pos.length / 3;
    // everyone else: a two-armed spiral that becomes a galaxy over the table
    const start = pos.length / 3;
    const types = ['p', 'p', 'p', 'n', 't'];
    for (let i = start; i < N_WEB; i++) {
      const k = (i - start) / (N_WEB - start);
      const r = 2.2 + 40 * Math.pow(k, 0.85);
      const arm = i % 2, th = arm * Math.PI + r * 0.3 + (rnd() - 0.5) * (0.6 + k * 0.5);
      const rr = r * (0.88 + rnd() * 0.24);
      const y = TOP + 1.2 + r * 0.22 + (rnd() - 0.5) * (0.4 + r * 0.06);
      push(c.x + Math.cos(th) * rr, y, c.z - 2 + Math.sin(th) * rr, U.pick(types), -2, '');
    }
    // connect each later node to the nearest earlier one (a tree that grows outward)
    for (let i = start; i < N_WEB; i++) {
      let best = 1, bd = 1e9;
      const lo = Math.max(1, i - 90);
      for (let j = lo; j < i; j++) {
        const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bd) { bd = d; best = j; }
      }
      if (i < start + 40) { // the first strangers hang off the named hands
        let b2 = 1, d2 = 1e9;
        for (let j = 1; j < start; j++) { const dx = pos[i * 3] - pos[j * 3], dz = pos[i * 3 + 2] - pos[j * 3 + 2]; const d = dx * dx + dz * dz; if (d < d2) { d2 = d; b2 = j; } }
        best = b2;
      }
      parent[i] = best;
    }
    const n = N_WEB;
    const born = new Float32Array(n).fill(-1);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    g.setAttribute('aBorn', new T.BufferAttribute(born, 1));
    const sizes = new Float32Array(n); for (let i = 0; i < n; i++) sizes[i] = i === 0 ? 0.03 : i < 8 ? 0.06 : i < S.handwritten ? 0.045 : 0.08 + rnd() * 0.1;
    g.setAttribute('aSize', new T.BufferAttribute(sizes, 1));
    const uni = { uTime: { value: 0 }, uScale: { value: 800 }, uFade: { value: 1 } };
    const mat = new T.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: `attribute float aBorn; attribute float aSize; attribute vec3 color; uniform float uTime, uScale; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
          float age = aBorn < 0.0 ? -1.0 : uTime - aBorn;
          vA = age < 0.0 ? 0.0 : smoothstep(0.0, 0.5, age) * (1.0 + 2.0 * exp(-age * 3.0));
          vC = color; gl_PointSize = aSize * uScale / max(-mv.z, 0.05) * (age < 0.0 ? 0.0 : 1.0 + exp(-age * 4.0)); }`,
      fragmentShader: `uniform float uFade; varying vec3 vC; varying float vA;
        void main(){ if (vA <= 0.001) discard; float r = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - r), 2.2) + smoothstep(0.3, 0.0, r) * 1.5;
          gl_FragColor = vec4(vC * a * vA * 1.8 * uFade, 1.0); }`,
    });
    const pts = new T.Points(g, mat); pts.frustumCulled = false; group.add(pts);
    // threads, which grow from parent to child
    const segN = n - 1;
    const lp = new Float32Array(segN * 6), lc = new Float32Array(segN * 6);
    for (let i = 1; i < n; i++) {
      const p = parent[i], o = (i - 1) * 6;
      lp[o] = pos[p * 3]; lp[o + 1] = pos[p * 3 + 1]; lp[o + 2] = pos[p * 3 + 2];
      lp[o + 3] = pos[p * 3]; lp[o + 4] = pos[p * 3 + 1]; lp[o + 5] = pos[p * 3 + 2];
    }
    const lg = new T.BufferGeometry();
    lg.setAttribute('position', new T.BufferAttribute(lp, 3));
    lg.setAttribute('color', new T.BufferAttribute(lc, 3));
    const lines = new T.LineSegments(lg, new T.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    lines.frustumCulled = false; group.add(lines);
    S.web = { pos, col, parent, label, type, born, geo: g, uni, lines: lg, growing: [], count: 0, pts, lineObj: lines, t: 0 };
  }
  function spawn(i, t) {
    const wb = S.web;
    if (wb.born[i] >= 0) return;
    wb.born[i] = t; wb.geo.attributes.aBorn.needsUpdate = true;
    if (i > 0) wb.growing.push({ i, t0: t });
    wb.count++;
  }
  function stepWeb(dt) {
    const wb = S.web;
    if (!wb) return;
    wb.t = performance.now() / 1000;
    wb.uni.uTime.value = wb.t;
    wb.uni.uScale.value = (innerHeight * Math.min(1.5, devicePixelRatio || 1)) / (2 * Math.tan((S.W.camera.fov * Math.PI) / 360));
    if (!wb.growing.length) return;
    const lp = wb.lines.attributes.position.array, lc = wb.lines.attributes.color.array, P = wb.pos, C = wb.col;
    for (let k = wb.growing.length - 1; k >= 0; k--) {
      const g = wb.growing[k], i = g.i, p = wb.parent[i], o = (i - 1) * 6;
      const e = U.ease.outCubic(U.clamp((wb.t - g.t0) / 0.7, 0, 1));
      lp[o + 3] = P[p * 3] + (P[i * 3] - P[p * 3]) * e;
      lp[o + 4] = P[p * 3 + 1] + (P[i * 3 + 1] - P[p * 3 + 1]) * e;
      lp[o + 5] = P[p * 3 + 2] + (P[i * 3 + 2] - P[p * 3 + 2]) * e;
      const a = (i < S.handwritten ? 0.55 : 0.3) * e;
      lc[o] = C[p * 3] * a; lc[o + 1] = C[p * 3 + 1] * a; lc[o + 2] = C[p * 3 + 2] * a;
      lc[o + 3] = C[i * 3] * a; lc[o + 4] = C[i * 3 + 1] * a; lc[o + 5] = C[i * 3 + 2] * a;
      if (e >= 1) wb.growing.splice(k, 1);
    }
    wb.lines.attributes.position.needsUpdate = true; wb.lines.attributes.color.needsUpdate = true;
  }
  function webVisible(on) { if (!S || !S.web) return; S.web.pts.visible = on; S.web.lineObj.visible = on; S.web.uni.uFade.value = on ? 1 : 0; }
  function resetWeb(full) {
    const wb = S.web;
    wb.born.fill(-1); wb.geo.attributes.aBorn.needsUpdate = true;
    wb.growing.length = 0; wb.count = 0;
    const lp = wb.lines.attributes.position.array, lc = wb.lines.attributes.color.array;
    lc.fill(0);
    for (let i = 1; i < N_WEB; i++) { const p = wb.parent[i], o = (i - 1) * 6; lp[o + 3] = lp[o]; lp[o + 4] = lp[o + 1]; lp[o + 5] = lp[o + 2]; }
    if (full) { // everything at once (arriving from a later beat)
      const t = performance.now() / 1000 - 5;
      for (let i = 0; i < N_WEB; i++) wb.born[i] = t;
      for (let i = 1; i < N_WEB; i++) {
        const p = wb.parent[i], o = (i - 1) * 6, a = i < S.handwritten ? 0.55 : 0.3;
        lp[o + 3] = wb.pos[i * 3]; lp[o + 4] = wb.pos[i * 3 + 1]; lp[o + 5] = wb.pos[i * 3 + 2];
        lc[o] = wb.col[p * 3] * a; lc[o + 1] = wb.col[p * 3 + 1] * a; lc[o + 2] = wb.col[p * 3 + 2] * a;
        lc[o + 3] = wb.col[i * 3] * a; lc[o + 4] = wb.col[i * 3 + 1] * a; lc[o + 5] = wb.col[i * 3 + 2] * a;
      }
      wb.count = N_WEB;
    }
    wb.geo.attributes.aBorn.needsUpdate = true;
    wb.lines.attributes.position.needsUpdate = true; wb.lines.attributes.color.needsUpdate = true;
  }

  /* ---------------- helpers for beats ---------------- */
  const TOPY = () => S.W.TOP;
  function seatShot(id) {
    const W = S.W, i = id === 'biscuit' ? 0 : SEAT_OF[id], s = seatXZ(W, i), TOP = W.TOP;
    if (id === 'biscuit') return { pos: [0.25, TOP + 0.42, 1.55], look: [-0.62, TOP + 0.05, 0.6], fov: 32 };
    return { pos: [-s.side * 0.42, TOP + 0.52, s.z + 1.05], look: [s.side * 0.6, TOP + 0.28, s.z - 0.05], fov: 34 };
  }
  function headPos(id) {
    const f = S.figs[id];
    if (!f) return null;
    const p = f.mesh.position.clone(); p.y += id === 'biscuit' ? 0.12 : id === 'benji' ? 0.4 : 0.6; return p;
  }
  function family(on) { Object.values(S.figs).forEach((f) => { f.mesh.visible = on; }); }
  function focus(id) { Object.entries(S.figs).forEach(([k, f]) => { f.glowT = k === id ? 0.55 : id ? 0.12 : 0.22; }); }
  function setLit(ids, on, instant) {
    ids.forEach((id) => { const f = S.flames[id]; if (!f) return; on ? f.light() : f.out(); if (instant) f.lit = on ? 1 : 0; });
  }
  function chime(n) { LT.audio.note && LT.audio.note('musicbox', n, 1.6, 0.5); LT.audio.noise && LT.audio.ready && LT.audio.noise({ dur: 0.18, a: 0.01, g: 0.07, filters: [{ type: 'bandpass', f: 1300, f2: 500, q: 0.8 }], rev: 0.4 }); }
  function intro() {
    const o = LT.state.tableOutcome;
    if (o === 'chaos') return 'After all that, the room goes quiet. Grandma waits until it does. “Before pie, we go around. That’s the rule.”';
    if (o === 'survived') return 'Somehow, the dinner held. Grandma taps her glass one more time. “Before pie, we go around. That’s the rule.”';
    return 'The plates are mostly empty. The pie is cooling on the counter, and nobody is allowed to touch it yet. “Before pie, we go around. That’s the rule.” — Grandma Ruth';
  }

  /** run a list of speakers inside one beat: camera to each seat, candle, caption */
  function round(ctx, ids, head) {
    let k = -1;
    const advance = () => {
      if (!ctx.alive) return;
      k++;
      if (k >= ids.length) { focus(null); more && more.remove(); ctx.hint('Next →'); return; }
      const id = ids[k], L = LINES[id];
      ctx.shot(seatShot(id), { dur: RM ? 0.4 : 2.2, lift: 0.08 });
      focus(id);
      ctx.later(() => { setLit([id], true); chime(L.n); if (id === 'biscuit') { LT.audio.sfx('thud', { g: 0.25 }); ctx.later(() => LT.audio.sfx('thud', { g: 0.2 }), 240); } }, RM ? 100 : 900);
      ctx.caption(L.say); ctx.note(`${L.name} · ${L.more}`);
      if (tag) tag.set(L.name.split(',')[0]);
      tagPos = headPos(id);
      const ms = 3200 + (L.say.length + L.more.length) * 38;
      clearTimeout(timer); timer = ctx.later(advance, ms);
      if (k === ids.length - 1 && more) more.textContent = 'Last one →';
    };
    let timer = null, tagPos = null;
    const tag = ctx.label(() => tagPos, '', { cls: 'ga-name' });
    const more = ctx.button('Next person', () => { clearTimeout(timer); advance(); }, { ghost: true });
    more.classList.add('ga-more');
    if (head) { ctx.caption(head.caption); ctx.note(head.note); timer = ctx.later(advance, head.ms); } else advance();
  }

  /* ---------------- the act ---------------- */
  LT.journey.act({
    id: 'grace', order: 4, numeral: 'IV', course: 'Fourth Course', title: 'Grace', music: 'grace',
    build,
    enter(W) {
      W.aftermath(false); W.setCandles(1); W.hero.burn(0.3); W.hero.light();
      W.sky(0); W.fog(0.09);
      LT.music.param('swell', 0); LT.music.param('melody', 0.35);
      if (LT.state.thanks) S.card.write(LT.state.thanks);
      S.card.mesh.visible = !!LT.state.thanks;
      // candles already earned stay lit if we come back in from a later act
    },
    exit(W) {
      webVisible(false);
      Object.values(S.flames).forEach((f) => f && f.out());
      Object.values(S.figs).forEach((f) => { f.glowT = 0.22; });
      W.sky(0); W.fog(0.09);
      LT.music.param('swell', 0); LT.music.param('melody', 0.4);
    },
    beats: [
      {
        id: 'grace-round1', shot: { pos: [0.02, 1.78, 2.7], look: [0, 0.82, -2.0], fov: 40 }, dur: 3,
        mood: { dim: 0.92, soft: 0, cursor: 0.18, moon: 0.08 },
        enter(ctx) {
          webVisible(false); ctx.W.sky(0); ctx.W.fog(0.09);
          setLit(['benji', 'maya', 'tyler', 'skye', 'dad', 'mom', 'linda', 'dale', 'biscuit', 'grandma', 'joe'], false, true);
          setLit(['have', 'miss'], false, true);
          if (!LT.state.chair) setLit(['chair'], false, true); else setLit(['chair'], true);
          LT.music.param('swell', 0);
          round(ctx, ROUND1, { caption: 'Let’s go around\nthe table.', note: intro(), ms: RM ? 1500 : 5200 });
        },
      },
      {
        id: 'grace-round2', shot: seatShotLater('dad'), dur: 2,
        mood: { dim: 0.92, soft: 0, cursor: 0.18, moon: 0.08 },
        enter(ctx) {
          setLit(ROUND1, true, true);
          setLit(['dad', 'mom', 'linda', 'dale', 'biscuit', 'grandma', 'joe'], false, true);
          round(ctx, ROUND2);
        },
      },
      {
        id: 'grace-grandma', shot: seatShotLater('biscuit'), dur: 2,
        mood: { dim: 0.9, soft: 0, cursor: 0.12, moon: 0.08 },
        enter(ctx) {
          const W = ctx.W;
          setLit(ROUND1.concat(ROUND2), true, true);
          setLit(['grandma', 'joe'], false, true);
          // three pets for Biscuit and he gets a secret
          let pets = 0;
          ctx.on(window, 'pointerdown', () => {
            const ray = W.cursorRay(); if (!ray || !S.figs.biscuit) return;
            if (ray.intersectObject(S.figs.biscuit.mesh).length) {
              pets++; LT.audio.sfx('bark', { n: 1 }); LT.fx.float(LT.pointer.x, LT.pointer.y - 20, 'good boy', { size: 24 });
              if (pets >= 3) LT.egg('grace-biscuit', 'Under the table', 'Biscuit has been thanked. He would like a roll.');
            }
          });
          const steps = [{ who: 'biscuit' }].concat(GRANDMA.map((g) => Object.assign({ who: 'grandma' }, g)));
          let step = -1, timer = null, tagPos = headPos('biscuit');
          const tag = ctx.label(() => tagPos, 'Biscuit', { cls: 'ga-name' });
          const nextLine = () => {
            if (!ctx.alive) return;
            step++;
            const g = steps[step];
            if (!g) return;
            if (g.who === 'biscuit') {
              const L = LINES.biscuit;
              focus('biscuit');
              ctx.later(() => { LT.audio.sfx('thud', { g: 0.25 }); ctx.later(() => LT.audio.sfx('thud', { g: 0.2 }), 240); }, RM ? 50 : 1200);
              ctx.caption(L.say); ctx.note(`${L.name} \u00b7 ${L.more}`);
              timer = ctx.later(nextLine, RM ? 1500 : 5200);
              return;
            }
            if (step === 1) {
              ctx.shot(seatShot('grandma'), { dur: RM ? 0.4 : 2.4 });
              focus('grandma'); setLit(['grandma'], true); chime(72);
              tag.set('Grandma Ruth'); tagPos = headPos('grandma');
            }
            if (g.joe) {
              const js = seatXZ(W, SEAT_OF.joe);
              ctx.shot({ pos: [-0.32, W.TOP + 0.45, js.z + 1.25], look: [js.side * 0.55, W.TOP + 0.12, js.z], fov: 32 }, { dur: RM ? 0.4 : 3.2 });
              ctx.later(() => { setLit(['joe'], true); LT.audio.sfx('whoomp'); LT.music.param('swell', 0.45); }, RM ? 100 : 2000);
              ctx.label(new W.T.Vector3(js.side * 0.36, W.TOP + 0.12, js.z - 0.12), 'Grandpa Joe', { cls: 'ga-name ga-joe' });
            }
            if (g.end) { ctx.shot(seatShot('grandma'), { dur: RM ? 0.4 : 2.6 }); LT.music.param('swell', 0.2); ctx.hint('Next \u2192'); skip.remove(); }
            ctx.caption(g.say); ctx.note(g.more);
            timer = ctx.later(nextLine, RM ? Math.min(1500, g.ms) : g.ms);
          };
          const skip = ctx.button('Next line', () => { clearTimeout(timer); nextLine(); }, { ghost: true });
          skip.classList.add('ga-more');
          nextLine();
        },
      },
      {
        id: 'grace-chair', caption: 'Is someone missing\nfrom your table this year?', shot: chairShot(), dur: 3.2,
        note: 'You can put their name on a place card, and a candle will be lit for them. Or not. That’s allowed too.',
        mood: { dim: 0.9, soft: 0, cursor: 0.12, moon: 0.08 },
        enter(ctx) {
          const W = ctx.W;
          setLit(ROUND1.concat(ROUND2, ['biscuit', 'grandma', 'joe']), true, true);
          const done = (name) => {
            LT.state.chair = name; LT.save();
            W.setChair(name);
            setLit(['chair'], true); LT.audio.sfx('whoomp'); LT.stats.inc('candlesLit');
            LT.music.param('swell', 0.55);
            ctx.caption(`For *${name}.*`);
            ctx.note('Their place is set. That’s what places are for.');
            const cs = seatXZ(W, CHAIR_SEAT);
            ctx.label(new W.T.Vector3(cs.side * 0.36, W.TOP + 0.12, cs.z - 0.12), name, { cls: 'ga-name ga-joe' });
            f.form.remove(); no.remove();
            ctx.later(() => LT.music.param('swell', 0.15), 6000);
          };
          const f = ctx.input({ id: 'grace-chair', label: 'Their name', placeholder: 'Their name', submit: 'Set a place', max: 40, value: LT.state.chair || '', onSubmit: done });
          const no = ctx.button('Not this year', () => { ctx.next(); }, { ghost: true });
          if (LT.state.chair) { W.setChair(LT.state.chair); setLit(['chair'], true); }
        },
      },
      {
        id: 'grace-thanks', caption: 'What are you\nthankful for?', shot: { pos: [-0.42, 1.0, 1.02], look: [-0.15, 0.81, 0.58], fov: 32 }, dur: 3,
        note: 'Not the big list. One thing. A person, a place, something small from this week, something hard that taught you something.',
        mood: { dim: 0.9, soft: 0, cursor: 0.15, moon: 0.05 },
        enter(ctx) {
          setLit(ROUND1.concat(ROUND2, ['biscuit', 'grandma', 'joe']), true, true);
          if (LT.state.chair) setLit(['chair'], true);
          const f = ctx.input({ id: 'grace-thanks', label: 'What are you thankful for?', placeholder: 'my sister, who drove four hours', submit: 'Say it', max: 140, value: LT.state.thanks || '', onSubmit: (v) => {
            LT.state.thanks = v; LT.save();
            S.card.write(v); S.card.mesh.visible = true;
            f.form.remove(); pass.remove();
            // glasses, all the way around
            [0, 120, 260, 380, 540, 700].forEach((d, i) => ctx.later(() => LT.audio.sfx('clink', { f: 1700 + i * 120, pan: (i % 2 ? 0.5 : -0.5), g: 0.1 }), d));
            LT.music.param('swell', 0.6);
            ctx.caption('“Good.\nThat counts.”');
            ctx.note('Grandma Ruth. She writes it on your place card so you can’t take it back.');
            ctx.later(() => LT.music.param('swell', 0.15), 6000);
          } });
          const pass = ctx.button('I’ll keep it to myself', () => { ctx.caption('That’s allowed.'); ctx.note('Some thanks are better kept. Hold it in your head for a second anyway.'); f.form.remove(); pass.remove(); }, { ghost: true });
        },
      },
      {
        id: 'grace-think', caption: '', shot: { pos: [0.12, 1.2, 1.35], look: [-0.2, 1.02, 0.3], fov: 32 }, dur: 2.6,
        mood: { dim: 0.34, soft: 0.75, cursor: 0.0, moon: 0 },
        enter(ctx) {
          const o = ctx.overlay('ga-word');
          const word = el('div', { class: 'ga-letters', 'aria-label': 'think, then thank' });
          'THINK'.split('').forEach((ch, i) => word.appendChild(el('span', { class: 'ga-l', style: { animationDelay: `${0.1 + i * 0.08}s` } }, ch)));
          const thorn = el('div', { class: 'ga-thorn' }, el('button', { class: 'ga-th jr-interactive', type: 'button', 'aria-label': 'thorn' }, 'þ'), 'anc');
          o.append(word, thorn);
          const vowel = word.children[2];
          ctx.later(() => {
            vowel.classList.add('flip');
            LT.audio.sfx('ting', { f: 1900 });
            ctx.later(() => { vowel.textContent = 'A'; vowel.classList.add('gold'); }, 260);
            ctx.later(() => {
              thorn.classList.add('on');
              ctx.caption('*Thank* and *think*\nare the same word.');
              ctx.note('In Old English, þanc meant a thought, a remembering, a kindness held in mind. The oldest meaning of thank you is: I was thinking of you.');
            }, 1000);
          }, RM ? 300 : 1900);
          thorn.firstChild.addEventListener('click', () => LT.egg('grace-thorn', 'Ye olde thorn', 'The þ is a thorn, a letter English dropped. Printers short on thorns used a y, which is why the shop is Ye Olde. It was always pronounced the.'));
        },
      },
      {
        id: 'grace-hands', caption: 'Pick one thing\non your plate.', shot: { pos: [-0.3, 1.03, 1.14], look: [-0.08, 0.77, 0.75], fov: 26 }, dur: 2.6, lock: 'Follow the cranberry',
        note: 'One cranberry. Someone grew it, something pollinated it, something carved the bog it grew in.',
        mood: { dim: 1, soft: 0, cursor: 0.12, moon: 0.05 },
        enter(ctx, dir) {
          const W = ctx.W, T = W.T;
          W.sky(0); W.fog(0.09);
          resetWeb(false); webVisible(true); family(false);
          ctx.label(S.cranPos.clone().add(new T.Vector3(0, 0.05, 0)), 'one cranberry', { cls: 'ga-node' });
          let started = false;
          const go = ctx.button('Follow the cranberry', () => { if (!started) run(); });
          async function run() {
            started = true; go.remove();
            const t0 = () => performance.now() / 1000;
            spawn(0, t0());
            ctx.shot({ pos: [0.55, 1.75, 2.55], look: [-0.1, 1.05, -0.15], fov: 40 }, { dur: RM ? 0.5 : 4 });
            ctx.caption('Behind one cranberry…');
            LT.music.param('swell', 0.35); LT.music.param('melody', 0.8);
            const PENT = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86];
            for (let i = 0; i < HANDS.length; i++) {
              if (!ctx.alive) return;
              const h = HANDS[i];
              spawn(h.id, t0()); chime(PENT[i]);
              const p = new T.Vector3(...S.web.pos.slice(h.id * 3, h.id * 3 + 3));
              ctx.label(p, h.l, { cls: 'ga-node one' });
              if (h.note) ctx.note(h.note);
              LT.stats.inc('handsThanked');
              await ctx.wait(RM ? 120 : 950);
            }
            ctx.caption('…and behind each of them,\nsomeone else.');
            ctx.note('');
            const ring2 = [];
            HANDS.forEach((h) => h.kid.forEach((id) => ring2.push(id)));
            for (let i = 0; i < ring2.length; i++) {
              if (!ctx.alive) return;
              const id = ring2[i];
              spawn(id, t0()); if (i % 2 === 0) chime(PENT[(i % 9) + 2] + 12);
              const p = new T.Vector3(...S.web.pos.slice(id * 3, id * 3 + 3));
              const L = ctx.label(p, S.web.label[id], { cls: 'ga-node two' });
              ctx.later(() => L.n.classList.add('fade'), RM ? 600 : 3600);
              LT.stats.inc('handsThanked');
              await ctx.wait(RM ? 40 : 260);
            }
            await ctx.wait(RM ? 200 : 1600);
            // everyone else, all the way out
            document.querySelectorAll('.ga-node.one').forEach((n) => n.classList.add('fade'));
            ctx.caption('And behind them…');
            LT.music.param('swell', 0.8);
            W.sky(0.7); W.fog(0.025);
            W.fly({ points: [W.camState().pos, [1.6, 4.2, 6], [3, 16, 22], [0.5, 48, 34]], looks: [W.camState().look, [0, 1.5, -1], [0, 2, -2.5], [0, 0, -3]], dur: RM ? 1 : 12, fov: 52, ease: 'inOutSine' });
            const rest = N_WEB - S.handwritten, dur = RM ? 1 : 10.5;
            const tS = t0();
            await new Promise((res) => {
              let i = S.handwritten;
              const off = ctx.frame(() => {
                const k = Math.min(1, (t0() - tS) / dur), upto = S.handwritten + Math.floor(Math.pow(k, 1.4) * rest);
                for (; i < upto; i++) spawn(i, t0());
                if (Math.random() < 0.12) chime(U.pick(PENT) + 12);
                if (k >= 1) { off(); res(); }
              });
            });
            if (!ctx.alive) return;
            LT.stats.inc('handsThanked', rest + 1);
            await ctx.wait(RM ? 200 : 2200);
            ctx.caption('You have never eaten\na meal *alone.*');
            ctx.note('A.J. Jacobs once set out to thank everyone behind his morning cup of coffee. He thanked about a thousand people, and the list still wasn’t finished.');
            LT.audio.sfx('swell', { dur: 2.4, g: 0.1 });
            // the farthest point is a star older than the sun; find it and something happens
            let far = new T.Vector3(...S.web.pos.slice((N_WEB - 1) * 3, N_WEB * 3));
            for (let i = N_WEB - 1; i > N_WEB - 220; i--) {
              const v = new T.Vector3(...S.web.pos.slice(i * 3, i * 3 + 3)), q = W.project(v);
              if (q.on && q.x > innerWidth * 0.55 && q.x < innerWidth * 0.85 && q.y > innerHeight * 0.12 && q.y < innerHeight * 0.4) { far = v; break; }
            }
            ctx.label(far, 'a star that died before the sun was born', { cls: 'ga-node one' });
            ctx.on(window, 'pointerdown', () => { const s = W.project(far); if (Math.hypot(s.x - LT.pointer.x, s.y - LT.pointer.y) < 70) LT.egg('grace-stardust', 'Stardust', 'The iron in your blood and the calcium in your bones were made in stars that died before the sun was born. They count too.'); });
            ctx.unlock(); ctx.hint('');
            ctx.later(() => LT.music.param('swell', 0.4), 7000);
          }
          if (dir < 0) { // coming back from later: show the whole sky at once
            go.remove(); started = true;
            resetWeb(true); webVisible(true); W.sky(0.7); W.fog(0.025);
            ctx.shot({ pos: [0.5, 48, 34], look: [0, 0, -3], fov: 52 }, { dur: 1.5 });
            ctx.caption('You have never eaten\na meal *alone.*');
            ctx.note('A.J. Jacobs once set out to thank everyone behind his morning cup of coffee. He thanked about a thousand people, and the list still wasn’t finished.');
            ctx.unlock(); ctx.hint('');
          }
        },
        exit(ctx, dir) { if (dir > 0) { /* keep the sky for the descent */ } },
      },
      {
        id: 'grace-both', caption: 'Gratitude isn’t\n“everything is fine.”', shot: { pos: [0.02, 1.1, 1.45], look: [-0.42, 0.88, 0.62], fov: 32 }, dur: 6, ease: 'inOutSine',
        note: 'In 1863, in the middle of the Civil War, Lincoln’s Thanksgiving proclamation asked for thanks and, in the same breath, for care for “all those who have become widows, orphans, mourners or sufferers.” You can be grateful and grieving at the same table.',
        cite: 'Abraham Lincoln, Proclamation of Thanksgiving, October 3, 1863',
        mood: { dim: 0.95, soft: 0, cursor: 0.1, moon: 0.05 },
        enter(ctx) {
          const W = ctx.W;
          W.sky(0); W.fog(0.09);
          webVisible(false);
          setLit(['have', 'miss'], false, true);
          let n = 0;
          const after = () => { if (++n === 2) { ctx.hint('You don’t have to blow one out to light the other.'); LT.music.param('swell', 0.5); ctx.later(() => LT.music.param('swell', 0.15), 5000); } };
          const a = ctx.button('Light one for what you have', () => { setLit(['have'], true); LT.audio.sfx('whoomp'); LT.stats.inc('candlesLit'); a.remove(); after(); });
          const who = LT.state.chair;
          const b = ctx.button(who ? `Light one for ${who}` : 'Light one for what you miss', () => { setLit(['miss'], true); LT.audio.sfx('whoomp'); LT.stats.inc('candlesLit'); b.remove(); after(); });
        },
      },
      {
        id: 'grace-letter', caption: 'People underestimate\nwhat a thank-you does.', shot: { pos: [-0.5, 1.12, 1.4], look: [-0.12, 0.84, 0.48], fov: 32 }, dur: 3,
        note: 'In 2018, Amit Kumar and Nicholas Epley had people write letters of gratitude and guess how the recipients would feel. The writers underestimated how happy the letters made people, and overestimated how awkward it would be.',
        cite: 'Kumar & Epley, Psychological Science (2018). See also Emmons & McCullough (2003) on gratitude journals and Seligman et al. (2005) on the gratitude visit.',
        mood: { dim: 0.95, soft: 0, cursor: 0.15, moon: 0.05 },
        enter(ctx) {
          setLit(['have', 'miss'], true);
          webVisible(false);
          const start = ctx.button('Write one now', () => {
            start.remove(); door.remove();
            ctx.caption('Who have you never\nproperly thanked?');
            ctx.note('Just a first name. And then one specific thing they did.');
            const f1 = ctx.input({ id: 'grace-who', label: 'Their name', placeholder: 'Ms. Alvarez', submit: 'Next', max: 40, value: LT.state.letterTo || '', onSubmit: (name) => {
              f1.form.remove();
              ctx.caption(`What did ${name}\ndo?`);
              ctx.note('Be specific. Specific is what makes a thank-you land.');
              const f2 = ctx.input({ id: 'grace-what', label: 'What they did', placeholder: 'stayed after class every Tuesday to help me with algebra', submit: 'Write it', max: 160, onSubmit: (what) => {
                f2.form.remove();
                LT.state.letterTo = name; LT.save(); LT.stats.inc('lettersWritten');
                letter(ctx, name, what);
              } });
            } });
          });
          const door = ctx.sideDoor('Write the long version', 'grace');
        },
      },
      {
        id: 'grace-light', caption: 'Gratitude is a kind\nof *attention.*', shot: { pos: [0.0, 1.62, 1.7], look: [0, 0.86, -2.6], fov: 38 }, dur: 4, ease: 'inOutSine',
        note: 'It’s where you choose to hold the light. Move yours across the table.',
        mood: { dim: 1, soft: 0, cursor: 1, moon: 0.05 },
        enter(ctx) {
          webVisible(false);
          setLit(ROUND1.concat(ROUND2, ['biscuit', 'grandma', 'joe', 'have', 'miss']), true);
          if (LT.state.chair) setLit(['chair'], true);
          focus(null);
          LT.music.param('swell', 0.85);
          ctx.later(() => LT.music.param('swell', 0.25), 7000);
        },
      },
    ],
  });

  // shots that can only be computed once the world exists
  function seatShotLater(id) { return function () { return seatShot(id); }; }
  function chairShot() { return null; }

  /* the composed letter, on paper */
  function letter(ctx, name, what) {
    const thing = what.replace(/[.!\s]+$/, '');
    const text = `Dear ${name},\n\nI was thinking about you today. I don’t think I ever properly thanked you for ${thing}. I still think about it, more than you’d guess. It mattered. Thank you.\n\nWith love and thanks,`;
    const o = ctx.overlay('ga-letter-layer');
    const body = el('div', { class: 'ga-letter-text' }, text);
    const copy = el('button', { class: 'lt-btn lt-btn--ink jr-interactive', type: 'button' }, 'Copy the letter');
    const sheet = el('article', { class: 'ga-letter lt-card jr-interactive' }, body, el('div', { class: 'ga-letter-btns' }, copy));
    o.appendChild(sheet);
    copy.addEventListener('click', async () => {
      const ok = await U.copy(text, body);
      copy.textContent = ok ? 'Copied. Now send it.' : 'Selected. Copy it, then send it.';
    });
    ctx.caption('Now send it.\n*Today, not someday.*');
    ctx.note(`It will mean more to ${name} than you think. That’s the research, and it’s also just true.`);
    LT.music.param('swell', 0.5);
    ctx.later(() => LT.music.param('swell', 0.15), 6000);
  }

  // resolve function-valued shots when the beat is entered (the engine passes shots straight to W.shot)
  const J = LT.journey;
  const act = J.acts.find((a) => a.id === 'grace');
  act.beats.forEach((b) => {
    if (b.id !== 'grace-hands') {
      const en = b.enter;
      b.enter = function (ctx, dir) { webVisible(false); family(true); ctx.W.sky(0); ctx.W.fog(0.09); return en && en.call(this, ctx, dir); };
    }
    if (typeof b.shot === 'function') { const fn = b.shot; delete b.shot; const enter = b.enter; b.enter = function (ctx, dir) { ctx.shot(fn(), { dur: b.dur ?? 2.4 }); return enter.call(this, ctx, dir); }; }
    if (b.id === 'grace-chair') {
      delete b.shot;
      const enter = b.enter;
      b.enter = function (ctx, dir) {
        const W = ctx.W, cs = seatXZ(W, CHAIR_SEAT);
        ctx.shot({ pos: [-cs.side * 0.38, W.TOP + 0.5, cs.z + 1.15], look: [cs.side * 0.45, W.TOP + 0.15, cs.z], fov: 32 }, { dur: 3.2 });
        return enter.call(this, ctx, dir);
      };
    }
  });
})();
