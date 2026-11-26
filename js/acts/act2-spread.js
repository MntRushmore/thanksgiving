/* Act II of the journey — The Spread. The strange true stories of the food, made physical:
   a room that floods into a cranberry bog, berries down the stairs, a fireball on the driveway,
   onions from the sky, a 1796 cookbook, and gravy. Never enough gravy. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  let S = null; // everything this act builds

  /* ---------- helpers ---------- */
  const portrait = () => innerHeight > innerWidth * 1.05;
  /** a camera shot that still frames its subject on a tall phone, above the caption */
  function V(pos, look, fov) {
    if (!portrait() || !S) return { pos, look, fov };
    const T = S.T, p = new T.Vector3(...pos), l = new T.Vector3(...look);
    const d = p.clone().sub(l);
    p.copy(l).add(d.multiplyScalar(1.6));
    l.y -= 0.05 * d.length();
    return { pos: p.toArray(), look: l.toArray(), fov: Math.min(62, fov * 1.2) };
  }
  function rippleNormalTex(T) {
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d'), img = x.createImageData(N, N);
    const r = U.seeded(4), waves = [];
    for (let i = 0; i < 18; i++) { const a = Math.round((r() - 0.5) * 22), b = Math.round((r() - 0.5) * 22), f = Math.hypot(a, b) || 1; waves.push([a, b, r() * 6.28, 1.6 / (f + 2)]); }
    const h = (u, v) => waves.reduce((s, [a, b, p, amp]) => s + amp * Math.sin((2 * Math.PI * (a * u + b * v)) / N + p), 0);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = (h(i + 1, j) - h(i - 1, j)) * 2.2, dy = (h(i, j + 1) - h(i, j - 1)) * 2.2;
      const l = Math.hypot(dx, dy, 1), k = (j * N + i) * 4;
      img.data[k] = ((-dx / l) * 0.5 + 0.5) * 255; img.data[k + 1] = ((-dy / l) * 0.5 + 0.5) * 255; img.data[k + 2] = ((1 / l) * 0.5 + 0.5) * 255; img.data[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  }
  function tex(W, w, h, draw) { return W.canvasTex(w, h, draw); }
  function noiseFill(x, w, h, cols, n, r0, r1, rnd) {
    for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(rnd() * cols.length)]; x.beginPath(); x.arc(rnd() * w, rnd() * h, r0 + rnd() * (r1 - r0), 0, Math.PI * 2); x.fill(); }
  }
  const ease = (from, to, k) => from + (to - from) * k;

  /* ======================================================================= */
  function build(group, W) {
    const T = W.T, TOP = W.TOP, rnd = U.seeded(1955), env = W.mats.pewter.envMap;
    S = { W, T, group, TOP, rnd };
    const normalTex = rippleNormalTex(T);
    S.normalTex = normalTex;
    const v3 = (x, y, z) => new T.Vector3(x, y, z);

    /* ---------- extra dishes, only while this act is on the table ---------- */
    const china = W.mats.china;
    // gravy boat
    const boat = new T.Group(); boat.position.set(-0.28, TOP, -0.3); boat.rotation.y = 0.5; group.add(boat);
    const boatG = W.lathe([[0, 0], [0.03, 0], [0.034, 0.005], [0.05, 0.035], [0.056, 0.058], [0.053, 0.058], [0.047, 0.04], [0.03, 0.008], [0, 0.008]], 32);
    const boatBody = new T.Mesh(boatG, china); boatBody.scale.set(1.55, 1, 1); boatBody.castShadow = true; boat.add(boatBody);
    const spout = new T.Mesh(new T.ConeGeometry(0.018, 0.05, 12, 1, true), china); spout.rotation.z = Math.PI / 2 + 0.5; spout.position.set(0.09, 0.055, 0); boat.add(spout);
    const handle = new T.Mesh(new T.TorusGeometry(0.022, 0.005, 6, 16, Math.PI), china); handle.position.set(-0.085, 0.045, 0); handle.rotation.z = Math.PI / 2; boat.add(handle);
    const gravyMat = new T.MeshStandardMaterial({ color: '#5b3214', roughness: 0.22, metalness: 0.15, envMap: env, envMapIntensity: 0.9, normalMap: normalTex, normalScale: new T.Vector2(0.25, 0.25) });
    const boatGravy = new T.Mesh(new T.CircleGeometry(0.05, 24), gravyMat); boatGravy.rotation.x = -Math.PI / 2; boatGravy.scale.set(1.5, 1, 1); boatGravy.position.y = 0.05; boat.add(boatGravy);
    const stream = new T.Mesh(new T.CylinderGeometry(0.006, 0.009, 1, 10, 1, true), gravyMat); stream.visible = false; group.add(stream);
    const saucer = new T.Mesh(W.lathe([[0, 0], [0.08, 0], [0.09, 0.006], [0, 0.006]], 28), china); saucer.scale.set(1.3, 1, 1); boat.add(saucer); boatBody.position.y = 0.006;
    S.boat = boat; S.stream = stream; S.gravyMat = gravyMat;

    // green bean casserole
    const cas = new T.Group(); cas.position.set(0.0, TOP, -1.78); group.add(cas); S.cas = cas;
    const casDish = new T.Mesh(W.lathe([[0, 0], [0.08, 0], [0.1, 0.004], [0.106, 0.05], [0.114, 0.056], [0.109, 0.056], [0.099, 0.05], [0.094, 0.008], [0, 0.008]], 40),
      new T.MeshStandardMaterial({ color: '#e7dfcf', roughness: 0.25, envMap: env, envMapIntensity: 0.6 }));
    casDish.scale.set(1.45, 1, 1); casDish.castShadow = true; casDish.receiveShadow = true; cas.add(casDish);
    const casTop = new T.Mesh(new T.CircleGeometry(0.097, 40), new T.MeshStandardMaterial({ roughness: 0.55, map: tex(W, 512, 512, (x, w, h) => {
      x.fillStyle = '#c9b98e'; x.fillRect(0, 0, w, h);
      noiseFill(x, w, h, ['rgba(140,120,70,.25)', 'rgba(240,230,200,.3)'], 400, 2, 9, rnd);
      for (let i = 0; i < 170; i++) {
        const a = rnd() * Math.PI, cx = rnd() * w, cy = rnd() * h, L = 30 + rnd() * 40;
        x.strokeStyle = rnd() < 0.5 ? '#4c6a28' : '#5f8233'; x.lineWidth = 9 + rnd() * 4; x.lineCap = 'round';
        x.beginPath(); x.moveTo(cx - Math.cos(a) * L, cy - Math.sin(a) * L); x.quadraticCurveTo(cx, cy + (rnd() - 0.5) * 12, cx + Math.cos(a) * L, cy + Math.sin(a) * L); x.stroke();
        x.strokeStyle = 'rgba(255,255,220,.25)'; x.lineWidth = 2; x.stroke();
      }
      noiseFill(x, w, h, ['rgba(210,200,170,.55)'], 120, 4, 12, rnd);
    }) }));
    casTop.rotation.x = -Math.PI / 2; casTop.scale.set(1.45, 1, 1); casTop.position.y = 0.046; cas.add(casTop);
    // crispy onions (they fall)
    const onionG = new T.TorusGeometry(0.0085, 0.0024, 4, 9, Math.PI * 1.25);
    const onionMat = new T.MeshStandardMaterial({ color: '#c98a3c', roughness: 0.62 });
    const ON = W.LOW ? 220 : 420;
    const onions = new T.InstancedMesh(onionG, onionMat, ON); onions.count = 0; onions.castShadow = false; onions.frustumCulled = false; cas.add(onions);
    S.onions = { mesh: onions, n: 0, max: ON, list: [] };

    // macaroni and cheese
    const mac = new T.Group(); mac.position.set(0.0, TOP, -2.48); group.add(mac); S.mac = mac;
    const macDish = new T.Mesh(W.merge([W.box(0.21, 0.012, 0.15, 0, 0.006, 0), W.box(0.012, 0.05, 0.15, -0.099, 0.025, 0), W.box(0.012, 0.05, 0.15, 0.099, 0.025, 0), W.box(0.21, 0.05, 0.012, 0, 0.025, -0.069), W.box(0.21, 0.05, 0.012, 0, 0.025, 0.069)]),
      new T.MeshStandardMaterial({ color: '#6e2f1c', roughness: 0.4, envMap: env, envMapIntensity: 0.4 }));
    macDish.castShadow = true; macDish.receiveShadow = true; mac.add(macDish);
    const macTop = new T.Mesh(new T.PlaneGeometry(0.186, 0.126), new T.MeshStandardMaterial({ roughness: 0.45, envMap: env, envMapIntensity: 0.35, map: tex(W, 512, 360, (x, w, h) => {
      x.fillStyle = '#e8a83a'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const cx = rnd() * w, cy = rnd() * h, r = 10 + rnd() * 5, a = rnd() * 6.28;
        x.strokeStyle = rnd() < 0.3 ? '#b8641c' : '#f3c25c'; x.lineWidth = 7; x.beginPath(); x.arc(cx, cy, r, a, a + 2.3); x.stroke();
      }
      noiseFill(x, w, h, ['rgba(140,70,20,.45)', 'rgba(90,40,10,.35)'], 160, 3, 14, rnd);
    }) }));
    macTop.rotation.x = -Math.PI / 2; macTop.position.y = 0.042; mac.add(macTop);
    S.macCandle = W.makeCandle(group, v3(0.12, TOP, -2.3), { height: 0.14, scale: 0.6 });

    // the cookbook, open beside the pie
    const book = new T.Group(); book.position.set(0.02, TOP + 0.004, -0.93); book.rotation.y = 0.35; book.scale.setScalar(0.8); group.add(book); S.book = book;
    const cover = new T.Mesh(W.box(0.27, 0.008, 0.18, 0, 0.004, 0), new T.MeshStandardMaterial({ color: '#5a2a16', roughness: 0.7 })); cover.castShadow = true; book.add(cover);
    const pageMat = (draw) => new T.MeshStandardMaterial({ roughness: 0.9, map: tex(W, 400, 540, draw) });
    const drawLeft = (x, w, h) => {
      x.fillStyle = '#efe3c4'; x.fillRect(0, 0, w, h); noiseFill(x, w, h, ['rgba(120,90,40,.07)'], 300, 1, 5, rnd);
      x.fillStyle = '#2a1b10'; x.textAlign = 'center';
      x.font = '34px "IM Fell English SC", Georgia, serif'; x.fillText('AMERICAN', w / 2, 110); x.fillText('COOKERY,', w / 2, 152);
      x.font = 'italic 19px "IM Fell Double Pica", Georgia, serif'; x.fillText('or the art of dressing viands, fish,', w / 2, 200); x.fillText('poultry and vegetables…', w / 2, 226);
      x.fillRect(w / 2 - 60, 252, 120, 1.5);
      x.font = '21px "IM Fell English SC", Georgia, serif'; x.fillText('BY AMELIA SIMMONS,', w / 2, 300);
      x.font = 'italic 20px "IM Fell Double Pica", Georgia, serif'; x.fillText('an American Orphan.', w / 2, 332);
      x.font = '19px "IM Fell English SC", Georgia, serif'; x.fillText('HARTFORD:', w / 2, 450); x.fillText('1796.', w / 2, 478);
    };
    const drawRight = (x, w, h) => {
      x.fillStyle = '#eee0bf'; x.fillRect(0, 0, w, h); noiseFill(x, w, h, ['rgba(120,90,40,.07)'], 300, 1, 5, rnd);
      x.fillStyle = '#2a1b10'; x.textAlign = 'center'; x.font = '26px "IM Fell English SC", Georgia, serif'; x.fillText('POMPKIN.', w / 2, 90);
      x.textAlign = 'left'; x.font = '19px "IM Fell Double Pica", Georgia, serif';
      const words = 'No. 1. One quart stewed and strained, 3 pints cream, 9 beaten eggs, sugar, mace, nutmeg and ginger, laid into paste No. 7 or 3, and with a dough spur, cross and chequer it, and baked in dishes three quarters of an hour.'.split(' ');
      let line = '', y = 140;
      words.forEach((wd) => { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > w - 80) { x.fillText(line, 40, y); y += 30; line = wd; } else line = t; });
      x.fillText(line, 40, y);
    };
    const left = new T.Mesh(new T.PlaneGeometry(0.128, 0.172), pageMat(drawLeft)); left.rotation.set(-Math.PI / 2, 0.1, 0); left.position.set(-0.066, 0.014, 0); book.add(left);
    const right = new T.Mesh(new T.PlaneGeometry(0.128, 0.172), pageMat(drawRight)); right.rotation.set(-Math.PI / 2, -0.1, 0); right.position.set(0.066, 0.014, 0); book.add(right);
    S.pages = [left, right, drawLeft, drawRight];
    // whipped cream (dollops drop onto the pie)
    const creamG = (() => {
      const g = W.lathe([[0, 0], [0.02, 0], [0.019, 0.008], [0.014, 0.02], [0.007, 0.03], [0.0015, 0.04], [0, 0.041]], 40), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x) + y * 32, r = Math.hypot(x, z) * (1 + 0.2 * Math.cos(8 * a)); p.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r); }
      g.computeVertexNormals(); return g;
    })();
    const cream = new T.InstancedMesh(creamG, new T.MeshStandardMaterial({ color: '#fbf6ec', roughness: 0.45, envMap: env, envMapIntensity: 0.3 }), 60);
    cream.count = 0; cream.frustumCulled = false; cream.castShadow = true; group.add(cream);
    S.cream = { mesh: cream, n: 0, list: [] };

    /* ---------- the room floods into a bog ---------- */
    const waterMat = new T.MeshStandardMaterial({ color: '#0b0405', roughness: 0.14, metalness: 0.1, envMap: env, envMapIntensity: 0.45, normalMap: normalTex, normalScale: new T.Vector2(0.22, 0.22), transparent: true, opacity: 0.95 });
    normalTex.repeat.set(5, 6);
    const water = new T.Mesh(new T.PlaneGeometry(12, 14), waterMat); water.rotation.x = -Math.PI / 2; water.position.set(0, 0, -2); water.receiveShadow = true; water.visible = false; group.add(water);
    const BN = W.LOW ? 1600 : 4200;
    const berryG = new T.SphereGeometry(0.0112, 10, 8);
    const phase = new Float32Array(BN);
    const bogU = { uTime: { value: 0 }, uRise: { value: 0 } };
    const berryMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.22, envMap: env, envMapIntensity: 0.9 });
    berryMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = bogU.uTime; sh.uniforms.uRise = bogU.uRise;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aPhase; uniform float uTime; uniform float uRise;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n float rr = clamp(uRise * 1.7 - aPhase * 0.7, 0.0, 1.0);\n transformed.y += (rr - 1.0) * 0.09 + sin(uTime * 1.6 + aPhase * 37.0) * 0.0025;\n transformed.x += sin(uTime * 0.4 + aPhase * 11.0) * 0.004;');
    };
    const berries = new T.InstancedMesh(berryG, berryMat, BN);
    berryG.setAttribute('aPhase', new T.InstancedBufferAttribute(phase, 1));
    const o = new T.Object3D(), col = new T.Color();
    // rafts of berries: denser in clumps, sparse between
    const clumps = Array.from({ length: 12 }, (_, i) => [(rnd() - 0.5) * (i < 7 ? 2.6 : 5), 1.2 - rnd() * 6, 0.35 + rnd() * 0.8]);
    for (let i = 0; i < BN; i++) {
      let x, z;
      if (rnd() < 0.72) { const c = clumps[Math.floor(rnd() * clumps.length)], a = rnd() * 6.28, r = Math.sqrt(rnd()) * c[2]; x = c[0] + Math.cos(a) * r; z = c[1] + Math.sin(a) * r * 1.3; }
      else { x = (rnd() - 0.5) * 6; z = 1.6 - rnd() * 8; }
      o.position.set(x, 0, z); o.rotation.set(rnd() * 6, rnd() * 6, 0); o.scale.setScalar(0.82 + rnd() * 0.4); o.updateMatrix();
      berries.setMatrixAt(i, o.matrix);
      col.set(U.pick(['#9a0f26', '#b3172d', '#7d0c1f', '#c22a37', '#8a1222', '#a8302a'])); berries.setColorAt(i, col);
      phase[i] = rnd();
    }
    berries.castShadow = false; berries.receiveShadow = true; berries.frustumCulled = false; berries.visible = false; group.add(berries);
    S.water = { mesh: water, mat: waterMat, level: 0, target: 0, kind: 'bog' };
    S.bog = { mesh: berries, u: bogU, rise: 0, riseT: 0 };
    // ripple rings
    const ringMat = () => new T.MeshBasicMaterial({ color: '#ffd9b0', transparent: true, opacity: 0, depthWrite: false });
    S.rings = Array.from({ length: 8 }, () => { const m = new T.Mesh(new T.RingGeometry(0.9, 1, 40), ringMat()); m.rotation.x = -Math.PI / 2; m.visible = false; group.add(m); return { m, t: 9 }; });

    /* ---------- berries that fly: splashes, pours, stairs ---------- */
    const FN = 380;
    const fly = new T.InstancedMesh(new T.SphereGeometry(0.0095, 10, 8), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.22, envMap: env, envMapIntensity: 0.9 }), FN);
    fly.count = FN; fly.frustumCulled = false; fly.castShadow = true;
    const hidden = new T.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < FN; i++) { fly.setMatrixAt(i, hidden); fly.setColorAt(i, col.set('#a3122a')); }
    group.add(fly);
    S.fly = { mesh: fly, list: [], free: Array.from({ length: FN }, (_, i) => FN - 1 - i), hidden, o: new T.Object3D(), col: new T.Color() };

    // the legend's staircase, by the right-hand chairs: a crate at the top, six steps down to the floor
    const st = new T.Group(); group.add(st); S.stairs = st;
    const X0 = 1.32, RUN = 0.17, RISE = 0.1, NSTEP = 6, TOPY = 0.62, SZ = -0.42;
    const steps = [];
    for (let i = 0; i < NSTEP; i++) steps.push(W.box(RUN + 0.002, TOPY - i * RISE, 0.5, X0 + RUN * (i + 0.5), (TOPY - i * RISE) / 2, SZ));
    steps.push(W.box(0.24, TOPY + 0.02, 0.5, X0 - 0.12, (TOPY + 0.02) / 2, SZ));
    const stairMesh = new T.Mesh(W.merge(steps), W.mats.wood); stairMesh.castShadow = true; stairMesh.receiveShadow = true; st.add(stairMesh);
    const crate = new T.Mesh(W.merge([W.box(0.2, 0.012, 0.22, 0, 0.006, 0), W.box(0.012, 0.11, 0.22, -0.094, 0.055, 0), W.box(0.012, 0.11, 0.22, 0.094, 0.055, 0), W.box(0.2, 0.11, 0.012, 0, 0.055, -0.104), W.box(0.2, 0.11, 0.012, 0, 0.055, 0.104)]), W.mats.wood);
    crate.position.set(X0 - 0.12, TOPY + 0.02, SZ); crate.rotation.z = -0.25; crate.castShadow = true; st.add(crate);
    const crateBerries = W.instanced(new T.SphereGeometry(0.0095, 8, 6), W.mats.cran, Array.from({ length: 50 }, () => ({ p: [X0 - 0.12 + (rnd() - 0.5) * 0.15, TOPY + 0.09 + rnd() * 0.03, SZ + (rnd() - 0.5) * 0.17] })), false);
    st.add(crateBerries);
    st.visible = false;
    S.stair = { X0, RUN, RISE, NSTEP, TOPY, SZ };

    /* ---------- the driveway: Uncle Dale's fryer ---------- */
    const dw = new T.Group(); dw.position.set(7, 0, 3); group.add(dw); S.dw = dw;
    const concrete = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, map: tex(W, 512, 512, (x, w, h) => {
      x.fillStyle = '#5d5a55'; x.fillRect(0, 0, w, h);
      noiseFill(x, w, h, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.06)'], 2600, 0.5, 2.5, rnd);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, h * 0.5); x.lineTo(w, h * 0.52); x.moveTo(w * 0.5, 0); x.lineTo(w * 0.48, h); x.stroke();
      [[0.3, 0.62, 60], [0.66, 0.4, 40], [0.45, 0.7, 26]].forEach(([a, b, r]) => { const g = x.createRadialGradient(a * w, b * h, 0, a * w, b * h, r); g.addColorStop(0, 'rgba(20,16,10,.55)'); g.addColorStop(1, 'rgba(20,16,10,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    }) });
    const slab = new T.Mesh(new T.PlaneGeometry(6, 7), concrete); slab.rotation.x = -Math.PI / 2; slab.position.y = 0.004; slab.receiveShadow = true; dw.add(slab);
    const scorch = new T.Mesh(new T.CircleGeometry(1.2, 32), new T.MeshBasicMaterial({ color: '#0b0705', transparent: true, opacity: 0, depthWrite: false })); scorch.rotation.x = -Math.PI / 2; scorch.position.y = 0.008; dw.add(scorch); S.scorch = scorch;
    // the garage behind it, a porch light, a door
    const garage = new T.Mesh(new T.BoxGeometry(0.25, 2.8, 6.5), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, map: tex(W, 512, 256, (x, w, h) => {
      x.fillStyle = '#8b8172'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#9b917f'; x.fillRect(w * 0.18, h * 0.22, w * 0.64, h * 0.78);
      for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(w * 0.18, h * 0.22 + i * h * 0.156, w * 0.64, 3); }
      noiseFill(x, w, h, ['rgba(0,0,0,.06)'], 900, 1, 3, rnd);
    }) }));
    garage.position.set(2.3, 1.4, -0.4); garage.receiveShadow = true; dw.add(garage);
    const porch = new T.Mesh(new T.BoxGeometry(0.08, 0.14, 0.1), new T.MeshBasicMaterial({ color: '#ffd38a' })); porch.position.set(2.15, 2.15, 1.9); dw.add(porch);
    // burner, legs, propane, hose
    const steel = new T.MeshStandardMaterial({ color: '#c8cbcf', metalness: 0.92, roughness: 0.32, envMap: env, envMapIntensity: 1.1 });
    const black = new T.MeshStandardMaterial({ color: '#1c1b1a', metalness: 0.4, roughness: 0.6 });
    const ring = new T.Mesh(new T.TorusGeometry(0.2, 0.014, 8, 32), black); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; dw.add(ring);
    [0, 2.1, 4.2].forEach((a) => { const leg = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.34, 6), black); leg.position.set(Math.cos(a) * 0.22, 0.15, Math.sin(a) * 0.22); leg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); dw.add(leg); });
    const burner = new T.Mesh(new T.TorusGeometry(0.07, 0.008, 6, 24), new T.MeshBasicMaterial({ color: '#4d7bff' })); burner.rotation.x = Math.PI / 2; burner.position.y = 0.22; dw.add(burner); S.burner = burner;
    const tank = new T.Mesh(W.lathe([[0, 0], [0.13, 0], [0.15, 0.03], [0.15, 0.36], [0.12, 0.42], [0.05, 0.44], [0.05, 0.5], [0, 0.5]], 24), new T.MeshStandardMaterial({ color: '#e8e6df', roughness: 0.4, metalness: 0.2 }));
    tank.position.set(-0.7, 0, 0.35); tank.castShadow = true; dw.add(tank);
    const hose = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([v3(-0.7, 0.5, 0.35), v3(-0.45, 0.06, 0.4), v3(-0.15, 0.02, 0.2), v3(0, 0.22, 0.05)]), 24, 0.009, 6), black); dw.add(hose);
    // the pot and its oil
    const pot = new T.Mesh(W.lathe([[0, 0], [0.17, 0], [0.172, 0.37], [0.18, 0.375], [0.165, 0.37], [0.162, 0.012], [0, 0.012]], 40), steel);
    pot.position.y = 0.3; pot.castShadow = true; pot.receiveShadow = true; dw.add(pot);
    const oilMat = new T.MeshStandardMaterial({ color: '#7a4a12', roughness: 0.08, metalness: 0.35, envMap: env, envMapIntensity: 1.2, emissive: '#3a1a04', emissiveIntensity: 0.6, normalMap: normalTex, normalScale: new T.Vector2(0.15, 0.15) });
    const oil = new T.Mesh(new T.CircleGeometry(0.162, 36), oilMat); oil.rotation.x = -Math.PI / 2; oil.position.y = 0.3 + 0.27; dw.add(oil); S.oil = oil; S.oilMat = oilMat;
    // the stand and hook
    const pole = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 1.75, 8), black); pole.position.set(0.45, 0.875, -0.05); dw.add(pole);
    const arm = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, 0.47, 8), black); arm.rotation.z = Math.PI / 2; arm.position.set(0.22, 1.74, -0.05); dw.add(arm);
    const line = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 1, 6), steel); line.position.set(0, 1.4, -0.05); dw.add(line); S.line = line;
    // the bird, frozen solid
    const birdG = (() => {
      const g = new T.SphereGeometry(1, 40, 28), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const b = Math.exp(-(x * x * 3 + (z - 0.35) * (z - 0.35) * 2)) * 0.25 * Math.max(0, y); y = y * 0.62 + b; x *= 0.8; p.setXYZ(i, x, y, z); }
      g.computeVertexNormals(); return g;
    })();
    const frost = new T.MeshStandardMaterial({ color: '#e6eef3', roughness: 0.32, metalness: 0.05, envMap: env, envMapIntensity: 1.3, emissive: '#1a2430', emissiveIntensity: 0.4 });
    const bird = new T.Group(); dw.add(bird); S.bird = bird; S.birdMat = frost;
    const bb = new T.Mesh(birdG, frost); bb.scale.set(0.12, 0.11, 0.15); bb.rotation.x = -Math.PI / 2 + 0.2; bb.castShadow = true; bird.add(bb);
    [-1, 1].forEach((s) => { const leg = new T.Mesh(new T.CylinderGeometry(0.018, 0.026, 0.1, 10), frost); leg.position.set(s * 0.06, -0.12, 0.02); leg.rotation.z = s * 0.3; bird.add(leg); });
    const ice = W.instanced(new T.OctahedronGeometry(0.006, 0), new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#bfe3ff', emissiveIntensity: 0.6, roughness: 0.1 }),
      Array.from({ length: 40 }, () => { const a = rnd() * 6.28, b = rnd() * 3.14; return { p: [Math.sin(b) * Math.cos(a) * 0.11, Math.cos(b) * 0.13, Math.sin(b) * Math.sin(a) * 0.11], s: 0.6 + rnd() }; }), false);
    bird.add(ice); S.ice = ice;
    // Dale's lawn chair and his cooler
    const chairTex = tex(W, 128, 256, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f0ece0' : '#3f7a4a'; x.fillRect(0, (i * h) / 16, w, h / 16); } });
    const chair = new T.Group(); chair.position.set(-1.15, 0, -0.75); chair.rotation.y = 0.9; dw.add(chair);
    const alu = new T.MeshStandardMaterial({ color: '#d9dcdf', metalness: 0.9, roughness: 0.35, envMap: env });
    [[-0.24, 0], [0.24, 0]].forEach(([x]) => { const r = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.9, 6), alu); r.position.set(x, 0.42, 0.05); r.rotation.x = 0.5; chair.add(r); const r2 = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.7, 6), alu); r2.position.set(x, 0.3, 0.1); r2.rotation.x = -0.7; chair.add(r2); });
    const seat = new T.Mesh(new T.PlaneGeometry(0.46, 0.4), new T.MeshStandardMaterial({ map: chairTex, side: T.DoubleSide, roughness: 0.9 })); seat.rotation.x = -Math.PI / 2 + 0.2; seat.position.set(0, 0.36, 0.1); chair.add(seat);
    const back = new T.Mesh(new T.PlaneGeometry(0.46, 0.5), new T.MeshStandardMaterial({ map: chairTex, side: T.DoubleSide, roughness: 0.9 })); back.rotation.x = 0.45; back.position.set(0, 0.62, 0.3); chair.add(back);
    const cooler = new T.Mesh(W.merge([W.box(0.5, 0.3, 0.32, 0, 0.15, 0)]), new T.MeshStandardMaterial({ color: '#b8243d', roughness: 0.5 })); cooler.position.set(-1.6, 0, 0.1); cooler.castShadow = true; dw.add(cooler);
    const lid = new T.Mesh(new T.BoxGeometry(0.52, 0.05, 0.34), new T.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.5 })); lid.position.set(-1.6, 0.32, 0.1); dw.add(lid);
    const ext = new T.Mesh(W.lathe([[0, 0], [0.055, 0], [0.055, 0.42], [0.04, 0.46], [0.012, 0.47], [0, 0.47]], 18), new T.MeshStandardMaterial({ color: '#c0182c', roughness: 0.35, metalness: 0.2 })); ext.position.set(2.0, 0, 1.3); dw.add(ext);

    /* ---------- fire ---------- */
    const FIRE_N = W.LOW ? 700 : 1700;
    const fa = { dir: new Float32Array(FIRE_N * 3), spd: new Float32Array(FIRE_N), life: new Float32Array(FIRE_N), delay: new Float32Array(FIRE_N), size: new Float32Array(FIRE_N), seed: new Float32Array(FIRE_N) };
    for (let i = 0; i < FIRE_N; i++) {
      const a = rnd() * 6.28, up = 0.2 + rnd() * 0.8, r = Math.sqrt(1 - up * up);
      const spray = i < FIRE_N * 0.18;
      fa.dir.set([Math.cos(a) * r, up * (spray ? 0.6 : 1), Math.sin(a) * r], i * 3);
      fa.spd[i] = spray ? 2.5 + rnd() * 3 : 0.6 + rnd() * 2.2;
      fa.life[i] = spray ? 0.5 + rnd() * 0.5 : 1.2 + rnd() * 2.2;
      fa.delay[i] = spray ? rnd() * 0.15 : rnd() * 0.9;
      fa.size[i] = spray ? 0.025 + rnd() * 0.025 : 0.09 + rnd() * 0.2;
      fa.seed[i] = rnd();
    }
    const fg = new T.BufferGeometry();
    fg.setAttribute('position', new T.BufferAttribute(new Float32Array(FIRE_N * 3), 3));
    fg.setAttribute('aDir', new T.BufferAttribute(fa.dir, 3)); fg.setAttribute('aSpd', new T.BufferAttribute(fa.spd, 1));
    fg.setAttribute('aLife', new T.BufferAttribute(fa.life, 1)); fg.setAttribute('aDelay', new T.BufferAttribute(fa.delay, 1));
    fg.setAttribute('aSize', new T.BufferAttribute(fa.size, 1)); fg.setAttribute('aSeed', new T.BufferAttribute(fa.seed, 1));
    const fireU = { uT: { value: -1 }, uScale: { value: 900 }, uOrigin: { value: v3(7, 0.6, 3) } };
    const FV = `uniform float uT, uScale; uniform vec3 uOrigin; uniform float uSmoke;
      attribute vec3 aDir; attribute float aSpd, aLife, aDelay, aSize, aSeed; varying float vK; varying float vSeed;
      void main(){
        float t = uT - aDelay - uSmoke * 0.55;
        float life = aLife * (1.0 + uSmoke * 1.6);
        vK = t / life; vSeed = aSeed;
        if (uT < 0.0 || t < 0.0 || vK > 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
        float drag = (1.0 - exp(-t * 2.6)) / 2.6;
        vec3 p = uOrigin + aDir * aSpd * drag * (1.0 - uSmoke * 0.5) + vec3(0.0, 1.0, 0.0) * (0.9 * t * t + 0.5 * t) * (1.0 + uSmoke * 0.4);
        p.x += sin(t * 3.0 + aSeed * 20.0) * 0.08 * t; p.z += cos(t * 2.7 + aSeed * 13.0) * 0.08 * t;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * (0.35 + vK * (1.8 + uSmoke * 2.0)) * uScale / max(0.2, -mv.z);
      }`;
    const fire = new T.Points(fg, new T.ShaderMaterial({
      uniforms: Object.assign({ uSmoke: { value: 0 } }, fireU), vertexShader: FV,
      fragmentShader: `varying float vK; varying float vSeed;
        void main(){
          vec2 q = gl_PointCoord - 0.5; float r = length(q) * 2.0;
          float a = smoothstep(1.0, 0.0, r); a *= a;
          vec3 hot = vec3(1.0, 0.8, 0.45), mid = vec3(1.0, 0.45, 0.08), cool = vec3(0.55, 0.08, 0.01);
          vec3 col = vK < 0.22 ? mix(hot, mid, vK / 0.22) : mix(mid, cool, (vK - 0.22) / 0.78);
          float fade = 1.0 - smoothstep(0.5, 1.0, vK);
          float inten = (vK < 0.12 ? 2.4 : 1.15) * fade * (0.7 + 0.5 * fract(vSeed * 91.7));
          gl_FragColor = vec4(col * a * inten, 1.0);
        }`,
      blending: T.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    fire.frustumCulled = false; fire.renderOrder = 5; dw.parent.add(fire);
    const smoke = new T.Points(fg, new T.ShaderMaterial({
      uniforms: Object.assign({ uSmoke: { value: 1 } }, fireU), vertexShader: FV,
      fragmentShader: `varying float vK; varying float vSeed;
        void main(){ vec2 q = gl_PointCoord - 0.5; float r = length(q) * 2.0; float a = smoothstep(1.0, 0.1, r) * smoothstep(0.0, 0.25, vK) * (1.0 - smoothstep(0.6, 1.0, vK)) * 0.28;
          gl_FragColor = vec4(vec3(0.09, 0.08, 0.075), a); }`,
      transparent: true, depthWrite: false,
    }));
    smoke.frustumCulled = false; smoke.renderOrder = 4; group.add(smoke);
    S.fire = { u: fireU, points: fire, t: -1, on: false };
    fire.visible = false;

    // one light for the whole driveway: a burner glow that can become a fireball (lives in the scene, not the group)
    const glow = new T.PointLight('#ff9a4a', 0, 9, 2); glow.position.set(7, 0.9, 3.1); W.scene.add(glow);
    S.glow = { light: glow, base: 0, flash: 0 };

    /* ---------- the gravy flood ---------- */
    const gmat = new T.MeshStandardMaterial({ color: '#241005', roughness: 0.12, metalness: 0.05, envMap: env, envMapIntensity: 0.35, normalMap: normalTex, normalScale: new T.Vector2(0.1, 0.1) });
    const gravy = new T.Mesh(new T.PlaneGeometry(12, 14), gmat); gravy.rotation.x = -Math.PI / 2; gravy.position.set(0, 0, -2); gravy.receiveShadow = true; gravy.visible = false; group.add(gravy);
    S.gravy = { mesh: gravy, level: 0, target: 0 };
    const floatList = [];
    for (let i = 0; i < 70; i++) floatList.push({ p: [(rnd() - 0.5) * 4, 0, 1.4 - rnd() * 6], s: rnd() < 0.3 ? [0.034, 0.024, 0.028] : 0.011, c: rnd() < 0.3 ? '#c58842' : '#6f9a3a', r: [0, rnd() * 6, 0] });
    const floaters = W.instanced(new T.SphereGeometry(1, 14, 10), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }), floatList, false);
    floaters.visible = false; group.add(floaters);
    S.floaters = { mesh: floaters, list: floatList, o: new T.Object3D() };

    /* ---------- one heartbeat for the act ---------- */
    W.onFrame((dt, t, raw) => { if (group.visible) update(dt, t, raw); });
  }

  /* ======================================================================= */
  function update(dt, t, raw) {
    const W = S.W, T = S.T;
    S.normalTex.offset.set((t * 0.012) % 1, (t * 0.008) % 1);
    // the bog
    const w = S.water;
    w.level += (w.target - w.level) * Math.min(1, raw * (w.target > w.level ? 0.9 : 2.6));
    if (w.target === 0 && w.level < 0.02) w.level = 0;
    w.mesh.position.y = w.level; w.mesh.visible = w.level > 0.01;
    S.bog.rise += (S.bog.riseT - S.bog.rise) * Math.min(1, raw * (S.bog.riseT > S.bog.rise ? 0.55 : 2.5));
    S.bog.u.uTime.value = t; S.bog.u.uRise.value = S.bog.rise;
    S.bog.mesh.visible = w.mesh.visible && S.bog.rise > 0.01;
    S.bog.mesh.position.y = w.level + 0.003;
    // gravy
    const g = S.gravy;
    g.level += (g.target - g.level) * Math.min(1, raw * (g.target > g.level ? 1.2 : 2.6));
    if (g.target === 0 && g.level < 0.02) g.level = 0;
    g.mesh.position.y = g.level; g.mesh.visible = g.level > 0.01;
    S.floaters.mesh.visible = g.mesh.visible && g.level > 0.5;
    if (S.floaters.mesh.visible) {
      const o = S.floaters.o;
      S.floaters.list.forEach((f, i) => {
        o.position.set(f.p[0] + Math.sin(t * 0.3 + i) * 0.05, g.level + 0.004 + Math.sin(t * 1.4 + i * 1.7) * 0.003, f.p[2] + Math.cos(t * 0.27 + i) * 0.05);
        o.rotation.set(0, f.r[1] + t * 0.1, 0); Array.isArray(f.s) ? o.scale.set(...f.s) : o.scale.setScalar(f.s); o.updateMatrix();
        S.floaters.mesh.setMatrixAt(i, o.matrix);
      });
      S.floaters.mesh.instanceMatrix.needsUpdate = true;
    }
    // ripples
    S.rings.forEach((r) => {
      if (r.t > 1.6) { r.m.visible = false; return; }
      r.t += dt; const k = r.t / 1.6;
      r.m.visible = true; r.m.scale.setScalar(0.02 + k * 0.32); r.m.material.opacity = (1 - k) * 0.35;
    });
    stepFlyers(dt, raw);
    stepOnions(dt);
    stepCream(dt);
    // the fire
    const f = S.fire;
    f.u.uScale.value = (innerHeight * W.renderer.getPixelRatio()) / (2 * Math.tan((W.camera.fov * Math.PI) / 360));
    if (f.on) {
      f.t += raw; f.u.uT.value = f.t;
      if (f.t > 6.5) { f.on = false; f.u.uT.value = -1; f.points.visible = false; }
    }
    const gl = S.glow;
    gl.flash *= Math.pow(0.3, raw);
    gl.light.intensity = gl.base * (1 + U.noise(t * 9) * 0.15) + gl.flash * (1 + U.noise(t * 23) * 0.3);
    S.burner.material.color.setRGB(0.3 + U.noise(t * 11) * 0.06, 0.48, 1).multiplyScalar(gl.base > 0 ? 1.4 : 0.2);
  }

  /* ---------- flying berries ---------- */
  function launch(x, y, z, vx, vy, vz, o = {}) {
    const F = S.fly;
    if (!F.free.length) { const old = F.list.shift(); F.mesh.setMatrixAt(old.i, F.hidden); F.free.push(old.i); }
    const i = F.free.pop();
    const soft = !!o.soft;
    F.mesh.setColorAt(i, F.col.set(soft ? U.pick(['#5c1a1c', '#6b2420', '#4e1a17']) : U.pick(['#a3122a', '#b8172e', '#8f0f22', '#c42a35'])));
    F.mesh.instanceColor.needsUpdate = true;
    F.list.push({ i, x, y, z, vx, vy, vz, soft, mode: o.mode || 'floor', rest: false, bounces: 0, squash: 0, life: 0, rx: S.rnd() * 6, ry: S.rnd() * 6 });
  }
  function groundAt(b) {
    if (b.mode === 'water') return S.water.level + 0.004;
    if (b.mode === 'stairs') {
      const st = S.stair, i = Math.floor((b.x - st.X0) / st.RUN);
      if (b.x < st.X0) return st.TOPY + 0.02 + 0.0095;
      if (i < st.NSTEP) return st.TOPY - i * st.RISE + 0.0095;
      return 0.0095;
    }
    return 0.0095;
  }
  let bounceSfxT = 0;
  function stepFlyers(dt, raw) {
    const F = S.fly, o = F.o;
    bounceSfxT -= dt;
    let changed = false;
    for (let k = F.list.length - 1; k >= 0; k--) {
      const b = F.list[k];
      b.life += dt;
      if (!b.rest) {
        b.vy -= 9.8 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
        const gy = groundAt(b);
        if (b.y < gy) {
          if (b.mode === 'water') {
            ring(b.x, b.z, 0.5); F.mesh.setMatrixAt(b.i, F.hidden); F.free.push(b.i); F.list.splice(k, 1); changed = true;
            if (bounceSfxT <= 0) { LT.audio.sfx('pop', { f: 300 + S.rnd() * 200, g: 0.12 }); bounceSfxT = 0.05; }
            continue;
          }
          b.y = gy;
          const speed = -b.vy;
          if (b.soft || speed < 0.35) {
            b.vy = 0; b.vx *= 0.3; b.vz *= 0.3; b.rest = true;
            if (b.soft && speed > 0.5) { b.squash = 1; if (bounceSfxT <= 0) { LT.audio.sfx('thud', { g: 0.12 }); bounceSfxT = 0.04; } }
          } else {
            b.vy = speed * 0.62; b.vx *= 0.92; b.vz *= 0.92; b.bounces++;
            if (b.bounces === 1) {
              const n = LT.stats.inc('cranberriesBounced');
              if (n >= 50) LT.egg('pegleg', 'Peg-Leg Webb would be proud', 'Fifty firm berries, bounced. The soft ones stayed behind.');
            }
            if (bounceSfxT <= 0) { LT.audio.sfx('bounce', { p: U.clamp(speed / 4, 0, 1), g: 0.16, pan: U.clamp((b.x - 1.7) * 0.6, -0.8, 0.8) }); bounceSfxT = 0.035; }
          }
        }
      } else if (b.mode === 'stairs' && !b.soft) {
        // a resting firm berry still rolls off its step, then slows on the floor
        const onStairs = b.x < S.stair.X0 + S.stair.RUN * S.stair.NSTEP;
        b.vx = onStairs ? Math.max(b.vx, 0.25) : b.vx * Math.pow(0.2, dt);
        b.x += b.vx * dt; b.z += b.vz * dt; b.vz *= Math.pow(0.2, dt);
        const gy = groundAt(b);
        if (gy < b.y - 0.01) b.rest = false; else b.y = gy;
      }
      b.squash = Math.max(0, b.squash - dt * 0.5);
      o.position.set(b.x, b.y, b.z);
      o.rotation.set(b.rx + b.x * 20, b.ry, b.z * 20);
      o.scale.set(1 + b.squash * 0.5, 1 - b.squash * 0.55, 1 + b.squash * 0.5);
      o.updateMatrix(); F.mesh.setMatrixAt(b.i, o.matrix); changed = true;
    }
    if (changed) F.mesh.instanceMatrix.needsUpdate = true;
  }
  function clearFlyers() {
    const F = S.fly;
    F.list.forEach((b) => { F.mesh.setMatrixAt(b.i, F.hidden); F.free.push(b.i); });
    F.list.length = 0; F.mesh.instanceMatrix.needsUpdate = true;
  }
  function ring(x, z, s) {
    const r = S.rings.find((q) => q.t > 1.6) || S.rings[0];
    r.t = 0; r.m.position.set(x, S.water.level + 0.002, z); r.base = s;
  }

  /* ---------- onions ---------- */
  function dropOnions(n) {
    const O = S.onions, rnd = S.rnd;
    for (let i = 0; i < n && O.n < O.max; i++) {
      const a = rnd() * 6.28, r = Math.sqrt(rnd());
      O.list.push({ i: O.n++, x: Math.cos(a) * r * 0.135, z: Math.sin(a) * r * 0.085, y: 0.55 + rnd() * 0.6, vy: -rnd() * 0.5, land: 0.05 + rnd() * 0.014, rot: [rnd() * 6, rnd() * 6, rnd() * 6], spin: (rnd() - 0.5) * 9, rest: false });
    }
    O.mesh.count = O.n;
    LT.stats.inc('onionsDropped', n);
  }
  let crunchT = 0;
  function stepOnions(dt) {
    const O = S.onions; if (!O.list.length) return;
    const o = S.fly.o; let ch = false;
    crunchT -= dt;
    O.list.forEach((p) => {
      if (p.rest) return;
      p.vy -= 6 * dt; p.y += p.vy * dt; p.rot[0] += p.spin * dt; p.rot[2] += p.spin * 0.7 * dt;
      if (p.y <= p.land) { p.y = p.land; p.rest = true; p.rot[0] = Math.PI / 2 + (S.rnd() - 0.5) * 0.8; if (crunchT <= 0) { LT.audio.sfx('crunch', { n: 3 }); crunchT = 0.12; } }
      o.position.set(p.x, p.y, p.z); o.rotation.set(...p.rot); o.scale.setScalar(1); o.updateMatrix(); O.mesh.setMatrixAt(p.i, o.matrix); ch = true;
    });
    if (ch) O.mesh.instanceMatrix.needsUpdate = true;
  }
  function clearOnions() { const O = S.onions; O.list.length = 0; O.n = 0; O.mesh.count = 0; }

  /* ---------- whipped cream ---------- */
  function dollop(x, z) {
    const C = S.cream; if (C.n >= 60) return;
    C.list.push({ i: C.n++, x, z, y: S.TOP + 0.4, vy: 0, land: S.TOP + 0.03, s: 0.8 + S.rnd() * 0.5, rot: S.rnd() * 6, squash: 0, rest: false });
    C.mesh.count = C.n;
    LT.audio.sfx('spray', { dur: 0.3 });
    LT.stats.inc('creamDollops');
  }
  function stepCream(dt) {
    const C = S.cream; if (!C.list.length) return;
    const o = S.fly.o; let ch = false;
    C.list.forEach((p) => {
      if (!p.rest) { p.vy -= 7 * dt; p.y += p.vy * dt; if (p.y <= p.land) { p.y = p.land; p.rest = true; p.squash = 1; LT.audio.sfx('pop', { f: 240, g: 0.1 }); } }
      p.squash = Math.max(0, p.squash - dt * 3);
      o.position.set(p.x, p.y, p.z); o.rotation.set(0, p.rot, 0); o.scale.set(p.s * (1 + p.squash * 0.4), p.s * (1 - p.squash * 0.45), p.s * (1 + p.squash * 0.4)); o.updateMatrix();
      C.mesh.setMatrixAt(p.i, o.matrix); ch = true;
    });
    if (ch) C.mesh.instanceMatrix.needsUpdate = true;
  }
  function clearCream() { const C = S.cream; C.list.length = 0; C.n = 0; C.mesh.count = 0; }

  /* ---------- the driveway ---------- */
  function resetFryer(state) {
    const T = S.T;
    S.fire.on = false; S.fire.u.uT.value = -1; S.fire.points.visible = false;
    S.scorch.material.opacity = state === 'scorched' ? 0.75 : 0;
    S.ice.visible = state === 'frozen';
    S.birdMat.color.set(state === 'thawed' ? '#e9c7a6' : '#e6eef3');
    S.birdMat.emissive.set(state === 'thawed' ? '#000000' : '#1a2430');
    S.birdMat.roughness = state === 'thawed' ? 0.55 : 0.32;
    setBirdHeight(1.12);
    S.bird.visible = true;
    S.oil.position.y = 0.57;
    S.oilMat.emissiveIntensity = 0.6;
  }
  function setBirdHeight(y) {
    S.bird.position.set(0, y, -0.05);
    const top = 1.74, bottom = y + 0.12;
    S.line.scale.y = Math.max(0.01, top - bottom); S.line.position.y = (top + bottom) / 2;
  }
  function ignite(ctx) {
    const W = S.W, T = S.T;
    const f = S.fire;
    f.on = true; f.t = 0; f.points.visible = true;
    f.u.uOrigin.value.set(7, 0.62, 2.95);
    S.glow.flash = 9;
    LT.audio.sfx('boom', { g: 1 });
    LT.fx.flash('rgba(255,196,130,.5)', 0.45);
    LT.fx.shake(16, 1.1);
    const roar = ctx.sound(LT.audio.sfx('fire', { g: 0.8 }));
    ctx.later(() => roar.set && roar.set(0.4, 1.5), 1800);
    ctx.later(() => roar.stop && roar.stop(1.5), 4200);
    S.ice.visible = false;
    ctx.later(() => { S.birdMat.color.set('#17110c'); S.birdMat.emissive.set('#200800'); S.scorch.material.opacity = 0.75; }, 500);
    // the camera flinches back
    const c = W.camState();
    W.shot(V([c.pos.x - 0.7, c.pos.y + 0.45, c.pos.z + 0.7], [7.0, 1.25, 2.95], 46), { dur: 0.9, ease: 'outCubic' });
  }

  /* ======================================================================= */
  const FEAST = () => [
    [[0.12, S.TOP + 0.24, -0.2], 'The bird'],
    [[-0.22, S.TOP + 0.11, -0.62], 'Cranberries'],
    [[0.3, S.TOP + 0.09, -0.85], 'Pumpkin pie'],
    [[-0.2, S.TOP + 0.1, -1.05], 'Rolls'],
    [[-0.28, S.TOP + 0.12, -0.3], 'Gravy'],
    [[0.0, S.TOP + 0.11, -1.78], 'Green bean casserole'],
    [[0.0, S.TOP + 0.1, -2.48], 'Mac and cheese'],
    [[0.3, S.TOP + 0.08, 0.55], 'A lemon (it’s a Dutch thing)'],
  ];

  LT.journey.act({
    id: 'spread', order: 2, numeral: 'II', course: 'Second Course', title: 'The Spread', music: 'spread',
    build,
    enter(W) {
      W.aftermath(false); W.hero.burn(0); W.hero.light(); W.ignite({ gap: 0.01, quiet: true });
      W.sky(0); W.fog(0.09); W.floor(true);
      W.post({ exposure: 0.86, bloom: 0.46 });
      LT.music.param('melody', 1);
    },
    exit(W) {
      S.water.target = S.water.level = 0; S.bog.riseT = S.bog.rise = 0;
      S.gravy.target = S.gravy.level = 0;
      S.glow.base = 0; S.glow.flash = 0; S.glow.light.intensity = 0;
      S.stream.visible = false; S.boat.rotation.z = 0;
      clearFlyers(); clearOnions(); clearCream();
      S.macCandle.flame.out();
      W.mood({ moon: 0, cursor: 0.45, dim: 1 }); W.sky(0); W.fog(0.09);
      W.post({ exposure: 0.95, bloom: 0.62 });
      LT.music.param('melody', 1);
    },
    beats: [
      /* 1 */ {
        id: 'spread-feast', caption: 'Now, *the food.*',
        note: 'Every dish on this table has a stranger story than you’d guess. Some of them are even true.',
        mood: { dim: 1, soft: 0, cursor: 0.55, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP;
          S.water.target = 0; S.gravy.target = 0; S.stairs.visible = false; S.dw.visible = false;
          const end = V([0.82, 1.42, 0.98], [-0.02, TOP + 0.04, -1.05], 38);
          if (ctx.dir >= 0) W.fly({ points: [W.camState().pos, [0.0, 2.35, 1.6], [0.5, 1.75, 1.25], end.pos], looks: [W.camState().look, [0, TOP, -0.8], [0, TOP, -1.0], end.look], dur: 5.5, fov: end.fov });
          else W.shot(end, { dur: 2.4 });
          FEAST().forEach(([p, name], i) => ctx.later(() => ctx.label(new S.T.Vector3(...p), name), 1600 + i * 260));
          ctx.later(() => LT.audio.sfx('gobble', { g: 0.12 }), 2600);
          ctx.on(window, 'pointerdown', (e) => {
            if (e.target.closest('button, input, form, a')) return;
            const p = W.cursorHit();
            if (Math.hypot(p.x - 0.3, p.z - 0.55) < 0.12) LT.egg('vanitas', 'Vanitas', 'Dutch painters put a half-peeled lemon in everything. Bitter outside, sweet inside, and already going off: enjoy it while it lasts.');
          });
        },
      },
      /* 2 */ {
        id: 'spread-bog', caption: 'Cranberries *float.*', lock: 'Tap the water',
        note: 'Each berry has little pockets of air inside. So growers flood the bog, knock the berries loose, and the whole harvest rises to the surface. Tap the water.',
        mood: { dim: 1, soft: 0, cursor: 0.45, moon: 0.15 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP;
          S.dw.visible = false; S.stairs.visible = false; S.gravy.target = 0;
          W.shot(V([0.66, TOP + 0.24, 1.18], [-0.2, TOP + 0.02, -1.4], 42), { dur: 3.2 });
          S.water.target = TOP + 0.05;
          LT.audio.sfx('whoosh', { dur: 2.8, low: 80, high: 380, g: 0.22 });
          const slosh = ctx.sound(LT.audio.sfx('wind', { g: 0.18 }));
          ctx.later(() => slosh.set && slosh.set(0.35, 2), 3500);
          ctx.later(() => { S.bog.riseT = 1; LT.audio.sfx('swell', { dur: 2.5, g: 0.08 }); }, 2600);
          let taps = 0;
          ctx.on(window, 'pointerdown', (e) => {
            if (e.target.closest('button, input, form, a, .jr-nav')) return;
            const ray = W.cursorRay(), d = ray.ray.direction, o = ray.ray.origin, lvl = S.water.level;
            if (d.y >= -0.01 || lvl < 0.3) return;
            const s = (lvl - o.y) / d.y, x = o.x + d.x * s, z = o.z + d.z * s;
            ring(x, z, 1); LT.audio.sfx('splat', { g: 0.18 });
            for (let i = 0; i < 9; i++) { const a = S.rnd() * 6.28, sp = 0.4 + S.rnd() * 0.7; launch(x, lvl + 0.01, z, Math.cos(a) * sp, 1.6 + S.rnd() * 1.4, Math.sin(a) * sp, { mode: 'water' }); }
            if (++taps === 1) { ctx.unlock(); ctx.hint(''); }
          });
        },
        exit() { S.bog.riseT = 0; },
      },
      /* 3 */ {
        id: 'spread-stairs', caption: 'The good ones *bounce.*', lock: 'Pour the berries',
        note: 'As the legend goes, John “Peg-Leg” Webb, a New Jersey grower, couldn’t carry his crop down from the loft, so he poured it down the stairs. The firm berries bounced to the bottom. The soft ones stayed on the steps. Growers still sort cranberries on bounce boards.',
        cite: 'Legend, as told by the cranberry industry for over a century',
        mood: { dim: 1, soft: 0, cursor: 0.85, moon: 0 },
        enter(ctx) {
          const W = ctx.W, st = S.stair;
          S.water.target = 0; S.bog.riseT = 0; S.dw.visible = false; S.stairs.visible = true;
          S.glow.light.position.set(1.6, 1.5, 0.55); S.glow.light.distance = 4.5; S.glow.base = 2.4;
          clearFlyers();
          W.shot(V([2.05, 0.98, 1.3], [1.62, 0.3, -0.42], 42), { dur: 3 });
          const pour = () => {
            for (let i = 0; i < 28; i++) ctx.later(() => {
              const soft = S.rnd() < 0.3;
              launch(st.X0 - 0.05 + S.rnd() * 0.03, st.TOPY + 0.12, st.SZ + (S.rnd() - 0.5) * 0.3, 0.45 + S.rnd() * 0.35, 0.3 + S.rnd() * 0.4, (S.rnd() - 0.5) * 0.2, { mode: 'stairs', soft });
            }, i * 45);
            LT.audio.sfx('crunch', { n: 6, g: 0.2 });
          };
          const b = ctx.button('Pour the berries', () => { pour(); ctx.unlock(); ctx.hint(''); b.textContent = 'Pour again'; });
          ctx.on(window, 'pointerdown', (e) => { if (!e.target.closest('button, input, form, a, .jr-nav')) { pour(); ctx.unlock(); ctx.hint(''); } });
        },
        exit() { clearFlyers(); S.stairs.visible = false; S.glow.base = 0; },
      },
      /* 4 */ {
        id: 'spread-franklin', caption: 'Benjamin Franklin\npreferred *the turkey.*',
        note: 'In a 1784 letter to his daughter, he called the bald eagle “a Bird of bad moral Character” and the turkey “a much more respectable Bird”: “though a little vain & silly, a Bird of Courage.” He never actually proposed it as the national bird. He was complaining about a medal.',
        cite: 'Benjamin Franklin to Sarah Bache, January 26, 1784',
        mood: { dim: 0.82, soft: 0, cursor: 0.2, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP, T = S.T;
          S.stairs.visible = false; S.dw.visible = false; S.water.target = 0; S.gravy.target = 0;
          // a slow orbit around the bird
          const c = new T.Vector3(0.12, TOP + 0.08, -0.2), pts = [], looks = [];
          for (let i = 0; i <= 6; i++) { const a = 0.4 + (i / 6) * 1.9, r = portrait() ? 1.0 : 0.62; pts.push([c.x + Math.sin(a) * r, TOP + 0.26 + Math.sin(i) * 0.03, c.z + Math.cos(a) * r]); looks.push([c.x, c.y + 0.01, c.z]); }
          W.shot({ pos: pts[0], look: looks[0], fov: portrait() ? 46 : 36 }, { dur: 2.4 });
          ctx.later(() => W.fly({ points: pts, looks, dur: U.reducedMotion ? 1 : 13, fov: portrait() ? 46 : 36, ease: 'inOutSine' }), 2500);
          ctx.later(() => LT.audio.sfx('gobble', { g: 0.2 }), 1800);
          ctx.later(() => ctx.label(c.clone().add(new T.Vector3(0, 0.2, 0)), '“a Bird of Courage”', { cls: 'glow' }), 2400);
          ctx.on(window, 'pointerdown', (e) => {
            if (e.target.closest('button, input, form, a, .jr-nav')) return;
            const p = W.cursorHit();
            if (Math.hypot(p.x - 0.12, p.z + 0.2) < 0.25) { LT.audio.sfx('gobble', { f: 560 + S.rnd() * 300, g: 0.22 }); LT.stats.inc('gobbles'); }
          });
        },
      },
      /* 5 */ {
        id: 'spread-fryer', caption: 'Uncle Dale\nhas a *fryer.*', lock: 'Lower the turkey',
        note: 'He’s been talking about it since July. The oil is at 350°F. The turkey came out of the freezer about an hour ago.',
        mood: { dim: 1, soft: 0, cursor: 0, moon: 0.6 },
        enter(ctx) {
          const W = ctx.W, T = S.T;
          S.stairs.visible = false; S.water.target = 0; S.gravy.target = 0;
          S.dw.visible = true; resetFryer('frozen');
          S.glow.light.position.set(6.6, 1.25, 3.6); S.glow.light.distance = 6; S.glow.base = 1.5;
          W.sky(0.55); W.fog(0.045);
          const shot = V([5.95, 1.12, 4.05], [7.0, 0.74, 2.95], 40);
          W.fly({ points: [W.camState().pos, [2.2, 1.9, 3.4], shot.pos], looks: [W.camState().look, [5, 1, 2.5], shot.look], dur: 4.2, fov: shot.fov });
          const sizz = ctx.sound(LT.audio.sfx('sizzle', { g: 0.12 }));
          let iceTag = null;
          ctx.later(() => { iceTag = ctx.label(new T.Vector3(7, 1.32, 2.95), 'frozen solid', { cls: '' }); }, 3800);
          ctx.later(() => ctx.label(new T.Vector3(5.85, 0.9, 2.25), 'Dale’s chair'), 4200);
          let stage = 'frozen';
          const b = ctx.button('Lower the frozen turkey', async () => {
            if (stage !== 'frozen') return;
            stage = 'lowering'; b.disabled = true;
            await U.tween({ from: 1.12, to: 0.66, dur: U.reducedMotion ? 0.4 : 1.6, ease: 'inQuad', onUpdate: (y) => setBirdHeight(y) }).done;
            if (!ctx.alive) return;
            // ice meets oil
            sizz.set && sizz.set(4, 0.1);
            LT.audio.sfx('spray', { dur: 0.5, g: 0.4 });
            S.oil.position.y = 0.6; S.oilMat.emissiveIntensity = 2;
            await ctx.wait(380);
            ignite(ctx);
            if (iceTag) iceTag.set('not frozen anymore');
            sizz.set && sizz.set(0.6, 2);
            LT.stats.inc('fryerFires');
            b.remove();
            await ctx.wait(3800);
            S.glow.base = 1.1;
            ctx.caption('Thanksgiving is the peak day\nfor *home cooking fires.*');
            ctx.note('Ice turns to steam, the oil boils over onto the flame, and that’s the fireball. Thaw the bird all the way (in the fridge, about a day for every 4 to 5 pounds), dry it, and fry outside, well away from the house and the garage. Or let Dale do it. From a distance.');
            stage = 'burnt';
            ctx.unlock(); ctx.hint('');
            const again = ctx.button('Try a thawed one', async () => {
              again.remove();
              resetFryer('thawed'); S.scorch.material.opacity = 0.75;
              if (iceTag) iceTag.set('thawed, patted dry');
              const shot2 = V([5.95, 1.12, 4.05], [7.0, 0.74, 2.95], 40);
              W.shot(shot2, { dur: 1.5 });
              await U.tween({ from: 1.12, to: 0.66, dur: U.reducedMotion ? 0.5 : 4, ease: 'inOutSine', onUpdate: (y) => setBirdHeight(y) }).done;
              if (!ctx.alive) return;
              sizz.set && sizz.set(1.6, 0.6);
              U.tween({ from: 0, to: 1, dur: 3.5, onUpdate: (k) => S.birdMat.color.lerpColors(new T.Color('#e9c7a6'), new T.Color('#a8622a'), k) });
              ctx.caption('That’s the one.');
              ctx.note('Slow, thawed, dry, outside. The driveway will need a hose either way.');
              LT.egg('learned', 'Learned the hard way', 'One fireball, one perfect bird. Dale would like you to stop telling people about the first one.');
            }, { ghost: true });
          });
        },
        exit() { S.dw.visible = false; S.glow.base = 0; S.fire.on = false; S.fire.points.visible = false; S.fire.u.uT.value = -1; },
      },
      /* 6 */ {
        id: 'spread-casserole', caption: '1955: green bean *casserole.*', lock: 'Tap for more onions',
        note: 'Dorcas Reilly made it up in Campbell’s test kitchen, out of things most pantries already had: green beans, cream of mushroom soup, crispy fried onions. Her original recipe card is in the National Inventors Hall of Fame. Tap for more onions.',
        mood: { dim: 0.8, soft: 0, cursor: 0.22, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP;
          S.dw.visible = false; S.water.target = 0; S.gravy.target = 0;
          W.sky(0); W.fog(0.09);
          W.shot(V([0.44, TOP + 0.4, -1.32], [0, TOP + 0.04, -1.8], 36), { dur: 3.2 });
          clearOnions();
          ctx.later(() => dropOnions(140), 1800);
          ctx.on(window, 'pointerdown', (e) => { if (!e.target.closest('button, input, form, a, .jr-nav')) { dropOnions(40); ctx.unlock(); ctx.hint(''); } });
          ctx.later(() => { ctx.unlock(); ctx.hint(''); }, 6000);
        },
      },
      /* 7 */ {
        id: 'spread-pie', caption: '1796: the first\nAmerican *cookbook.*', lock: 'Tap the pie',
        note: 'Amelia Simmons’s American Cookery included a “pompkin” pudding baked in a crust. Today most canned pumpkin isn’t the jack-o’-lantern kind at all; it’s a squash, the Dickinson. Tap the pie for whipped cream.',
        cite: 'Amelia Simmons, American Cookery (Hartford, 1796)',
        mood: { dim: 0.8, soft: 0, cursor: 0.22, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP;
          if (document.fonts && document.fonts.load) document.fonts.load('30px "IM Fell English SC"').then(() => {
            [0, 1].forEach((k) => { const m = S.pages[k].material; m.map = W.canvasTex(400, 540, S.pages[k + 2]); m.needsUpdate = true; });
          }).catch(() => {});
          W.shot(V([0.58, TOP + 0.38, -0.42], [0.17, TOP + 0.02, -0.93], 38), { dur: 3 });
          clearCream();
          ctx.later(() => dollop(0.3, -0.85), 1600);
          ctx.on(window, 'pointerdown', (e) => {
            if (e.target.closest('button, input, form, a, .jr-nav')) return;
            const a = S.rnd() * 6.28, r = Math.sqrt(S.rnd()) * 0.075;
            dollop(0.3 + Math.cos(a) * r, -0.85 + Math.sin(a) * r);
            ctx.unlock(); ctx.hint('');
          });
        },
      },
      /* 8 */ {
        id: 'spread-hemings', caption: 'James Hemings', layout: '',
        note: 'Enslaved by Thomas Jefferson, he was taken to Paris and trained as a chef, then brought French cooking home to Monticello. Macaroni dishes became a fixture at Jefferson’s table. Hemings won his freedom in 1796, on the condition that he first teach his brother Peter everything he knew.',
        cite: 'Monticello (Thomas Jefferson Foundation); Annette Gordon-Reed, The Hemingses of Monticello (2008)',
        mood: { dim: 0.68, soft: 0, cursor: 0.1, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP;
          LT.music.param('melody', 0);
          S.macCandle.flame.light();
          W.shot(V([-0.44, TOP + 0.3, -2.06], [0.02, TOP + 0.04, -2.46], 34), { dur: 3.6, ease: 'inOutSine' });
        },
        exit() { S.macCandle.flame.out(); LT.music.param('melody', 1); },
      },
      /* 9 */ {
        id: 'spread-gravy', caption: 'Is there enough *gravy?*', lock: 'Hold to pour',
        note: 'Hold the button. Keep pouring.',
        mood: { dim: 0.78, soft: 0, cursor: 0.2, moon: 0 },
        enter(ctx) {
          const W = ctx.W, TOP = S.TOP, T = S.T;
          S.water.target = 0; S.gravy.target = 0; S.gravy.level = 0;
          const shot = V([-0.78, TOP + 0.42, 0.42], [-0.12, TOP + 0.03, -0.62], 40);
          W.shot(shot, { dur: 3 });
          let pressing = false, poured = 0, done = false, glugT = 0;
          const btn = ctx.button('Hold to pour', () => {});
          btn.classList.add('hold-btn');
          const fill = el('span', { class: 'fill', 'aria-hidden': 'true' }); btn.prepend(fill);
          const start = (e) => { if (done) return; e.preventDefault(); pressing = true; };
          const stop = () => { pressing = false; };
          ctx.on(btn, 'pointerdown', start); ctx.on(btn, 'pointerup', stop); ctx.on(btn, 'pointerleave', stop); ctx.on(btn, 'pointercancel', stop);
          ctx.on(btn, 'keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
          ctx.on(btn, 'keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
          ctx.on(btn, 'contextmenu', (e) => e.preventDefault());
          const LINES = [[0.12, 'More.'], [0.3, 'More.'], [0.5, 'Still not enough.'], [0.7, 'Keep going.'], [0.86, 'MORE.']];
          let li = 0;
          const spoutWorld = new T.Vector3();
          ctx.frame((dt, t, raw) => {
            const tilt = pressing && !done ? 0.95 : 0;
            S.boat.rotation.z += (-tilt - S.boat.rotation.z) * Math.min(1, dt * 6);
            const flowing = S.boat.rotation.z < -0.6;
            if (flowing) {
              S.boat.updateMatrixWorld(true);
              spoutWorld.set(0.11, 0.065, 0).applyMatrix4(S.boat.matrixWorld);
              const bottom = Math.max(S.gravy.level, TOP + 0.005), h = Math.max(0.02, spoutWorld.y - bottom);
              S.stream.visible = true; S.stream.scale.set(1, h, 1); S.stream.position.set(spoutWorld.x, bottom + h / 2, spoutWorld.z);
              poured = Math.min(1, poured + raw / 5.5);
              glugT -= raw; if (glugT <= 0) { LT.audio.sfx('pour', { n: 3 }); glugT = 0.45; }
              if (poured > 0.08 && S.gravy.target < 0.05) LT.stats.inc('gravyPours');
              // the room fills to the table, then over it
              S.gravy.target = poured < 0.08 ? 0 : TOP - 0.03 + ((poured - 0.08) / 0.92) * 0.18;
              fill.style.transform = `scaleX(${poured})`;
              while (li < LINES.length && poured >= LINES[li][0]) { ctx.caption(LINES[li][1]); li++; }
              if (poured >= 1 && !done) finish();
            } else S.stream.visible = false;
          });
          async function finish() {
            done = true; btn.remove(); S.stream.visible = false;
            const c = W.camState();
            W.shot({ pos: [c.pos.x, TOP + 0.32, c.pos.z], look: [c.look.x, TOP + 0.12, c.look.z], fov: c.fov }, { dur: 2 });
            await ctx.wait(1400);
            ctx.caption('No. There is never\nenough *gravy.*');
            ctx.note('There never has been. There never will be. Somebody is already asking if there’s more in the kitchen.');
            LT.audio.sfx('tada');
            ctx.unlock(); ctx.hint('');
            ctx.sideDoor('Play with your food', 'spread');
          }
        },
        exit() { S.stream.visible = false; S.boat.rotation.z = 0; S.gravy.target = 0; },
      },
    ],
  });
})();
