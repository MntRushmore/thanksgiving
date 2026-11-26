/* Act III of the journey — The Table. The whole family, in paper, in the real room, at full volume. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;

  /* ---------- who sits where (the place cards already say so) ---------- */
  // seat index -> row k = floor(i/2), side = i % 2 ? right : left. Seat 5 is Grandpa Joe's, left empty.
  const SEATS = [
    { id: 'grandma', i: 0 }, { id: 'dale', i: 1 }, { id: 'linda', i: 2 }, { id: 'mom', i: 3, stand: true },
    { id: 'dad', i: 4 }, { id: 'tyler', i: 6 }, { id: 'skye', i: 7 }, { id: 'maya', i: 8 }, { id: 'benji', i: 9 },
  ];
  const U_M = 0.0027;              // metres per SVG unit
  const VB = [-95, -262, 190, 290]; // figure viewBox
  const DVB = [-80, -152, 170, 170]; // dog viewBox
  const VOICE = { grandma: 330, dale: 118, linda: 285, mom: 250, dad: 150, tyler: 182, skye: 222, maya: 268, benji: 420, you: 205 };

  /* ---------- the script ---------- */
  const OPENERS = [
    ['dad', 'Now, the secret to carving is respecting the grain…'],
    ['linda', 'So… are you seeing anyone?'],
    ['tyler', 'Have you guys tried cold plunging? Life-changing.'],
    ['grandma', "Denise, the turkey's a little dry."],
    ['benji', "Did you know T. rex couldn't clap?"],
    ['skye', 'This tofurkey is… really something!'],
    ['dale', "Now, I'm not trying to start anything, but…"],
    ['maya', 'can i be excused'],
    ['mom', 'Does everyone have what they need?'],
  ];
  const MINES = [
    { who: 'linda', say: 'So… are you seeing anyone?', you: "I'm seeing this pie.", boom: "Linda has set you up with her dentist's nephew. He's a Scorpio." },
    { who: 'linda', say: 'You look thin. Are you eating?', you: 'Eating right now. Watch me.', boom: 'Linda has put four more rolls on your plate.' },
    { who: 'linda', say: 'Tyler, honey, when are you two getting married?', you: 'Linda! Have you tried the cranberry?', boom: 'Skye went to the bathroom. It has been twenty minutes.' },
    { who: 'dale', say: "Now, I'm not trying to start anything, but…", you: 'Dale! More turkey?', boom: 'Dale has started something.' },
    { who: 'dale', say: "You know what's wrong with this country?", you: 'The gravy shortage. Pass it?', boom: "Everyone now knows what's wrong with this country. Again." },
    { who: 'dale', say: 'Fried turkey is just objectively better.', you: "Mom's turkey is perfect.", boom: 'Mom heard that.' },
    { who: 'dale', say: 'So what is it you actually DO for work?', you: "I'll explain after pie.", boom: 'You explained your job for nine minutes. Nobody understood.' },
    { who: 'tyler', say: 'Have you guys tried cold plunging? Life-changing.', you: 'Is that why the gravy is cold? Kidding. Pass it.', boom: 'Tyler is describing his morning routine. It starts at 4 a.m.' },
    { who: 'tyler', say: 'So my startup is basically Uber, but for leftovers.', you: 'Speaking of leftovers. Potatoes?', boom: 'Dale invested. Linda is crying.' },
    { who: 'tyler', say: 'Have you thought about crypto? Like, really thought?', you: 'Never once. Rolls?', boom: 'Tyler is drawing a blockchain on a napkin. Dad is nodding like he gets it.' },
    { who: 'skye', say: 'This tofurkey is… really something!', you: "It's great, Skye. Seconds?", boom: "Dale asked what's in tofurkey. Skye told him. Dale needs a minute." },
    { who: 'skye', say: 'Tyler said this would be low-key?', you: 'This IS low-key. Potatoes?', boom: 'Skye is texting their therapist under the table.' },
    { who: 'skye', say: 'Is there… meat in the green beans?', you: 'Only emotionally. Have a roll.', boom: 'There was bacon. There is always bacon.' },
    { who: 'mom', say: 'Does everyone have what they need?', you: "We're good, Mom. Sit down!", boom: 'Mom has gotten up four more times.' },
    { who: 'mom', say: 'Is the turkey dry? Be honest.', you: "It's perfect, Mom.", boom: 'Someone was honest. Mom is in the kitchen now.' },
    { who: 'mom', say: 'Nobody touch the pie until after.', you: 'We would never.', boom: 'Benji has touched the pie.' },
    { who: 'dad', say: 'Now, the secret to carving is respecting the grain…', you: 'Fascinating! Pass a slice?', boom: 'Dad is still carving. Dad will always be carving.' },
    { who: 'dad', say: "Why'd the turkey join the band? It had the drumsticks.", you: 'Wow. Gravy?', boom: 'Dad told four more. They got worse.' },
    { who: 'dad', say: "Has anyone tried my cranberry chutney? My mother's recipe.", you: "Pass it down, I'll try it!", boom: 'Nobody tried the chutney. Dad is fine. Dad is totally fine.' },
    { who: 'maya', say: 'can i be excused', you: 'One more bite, Maya.', boom: 'Maya has been excused. Spiritually.' },
    { who: 'maya', say: 'why is everyone yelling', you: "It's called family. Rolls?", boom: 'Maya is livestreaming this.' },
    { who: 'maya', say: "grandma you're on my story lol", you: 'Put it away, pie soon!', boom: 'Grandma has 40,000 views.' },
    { who: 'benji', say: "Did you know T. rex couldn't clap?", you: "It couldn't pass potatoes either.", boom: 'Benji is demonstrating. Loudly. Near the gravy.' },
    { who: 'benji', say: "I'm a velociraptor now.", you: 'Raptors eat their peas.', boom: 'Benji is under the table. With the dog.' },
    { who: 'benji', say: 'Uncle Dale said a bad word!', you: 'Benji, tell us about stegosaurus!', boom: 'Benji is repeating the bad word. With feeling.' },
    { who: 'grandma', say: "Denise, the turkey's a little dry.", you: 'Gravy fixes everything, Grandma!', boom: "Mom went to the kitchen to 'check on something.'" },
    { who: 'grandma', say: "Who's the new one?", you: 'Grandma, this is Skye! Skye, Grandma.', boom: 'Grandma asked Skye what their parents do. Then their grandparents.' },
    { who: 'grandma', say: "When I'm gone, you can all fight over the china.", you: "You'll outlive us all, Ruth.", boom: 'Everyone is now fighting over the china.' },
    { who: 'grandma', say: 'WHAT? Speak up!', you: 'MORE POTATOES, GRANDMA?', boom: 'Grandma heard that one. Grandma hears everything.' },
  ];
  const REACT = {
    linda: ['Ooh, potatoes!', 'Well, aren’t you sweet.'], dale: ['…Yeah, alright.', 'Now THAT’s a turkey.'],
    tyler: ['Bro. Yes.', 'Okay, carb day.'], skye: ['Oh, thank god.', 'You’re my favorite.'],
    mom: ['Okay. Okay. Good.', 'I’m sitting! I’m sitting.'], dad: ['A person of culture.', 'Ha! Fair.'],
    maya: ['fine.', 'k'], benji: ['RAWR.', 'Can I have pie?'], grandma: ['Hmph.', 'That’s better.'],
  };
  const CHAOS = ["IT'S NOT DRY!", 'BISCUIT, NO!', 'Is that SMOKE?', "I'm JUST saying—", 'WHO TOUCHED THE PIE?', 'lol', 'BENJI!', "It's called a BLOCKCHAIN—", 'Can I be EXCUSED?', 'PASS THE— PASS THE—', 'This is fine.', 'WHAT?', 'MY GOOD TABLECLOTH!', 'RAWR!'];

  /* ---------- act state ---------- */
  const S = {
    figs: {}, dog: null, group: null, W: null,
    temp: 40, tempShown: 40, kitchen: 0, kitchenT: 0, frozen: false, popped: 0,
    shake: 0, murmur: null, alarm: null, bubbles: new Set(), dogMode: 'floor', dogK: 0,
    flicker: 0, ready: false,
  };

  /* ---------- paper cut-outs: SVG figure -> canvas -> texture ---------- */
  function svgToTexture(W, markup, vb, cw, ch) {
    return new Promise((resolve) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" viewBox="${vb.join(' ')}">${markup}</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = cw; c.height = ch;
        const x = c.getContext('2d');
        // a white paper margin around the silhouette, and a soft shadow behind it
        const sil = document.createElement('canvas'); sil.width = cw; sil.height = ch;
        const sx = sil.getContext('2d');
        sx.drawImage(img, 0, 0, cw, ch); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#f3ead6'; sx.fillRect(0, 0, cw, ch);
        const pad = Math.round(cw * 0.022);
        x.globalAlpha = 0.35; x.filter = 'blur(3px)'; x.drawImage(sil, 2, 3); x.filter = 'none'; x.globalAlpha = 1;
        // tint the shadow copy dark
        x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(20,12,6,1)'; x.fillRect(0, 0, cw, ch); x.globalCompositeOperation = 'source-over';
        for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; x.drawImage(sil, Math.cos(a) * pad, Math.sin(a) * pad); }
        x.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        const t = new W.T.CanvasTexture(c); t.encoding = W.T.sRGBEncoding; t.anisotropy = 4;
        resolve(t);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }
  function defsMarkup() { const d = document.querySelector('#lt-family-defs defs'); return d ? d.outerHTML : ''; }
  const VARIANTS = {
    neutral: { mood: 'neutral' }, talk: { mood: 'neutral', talk: true }, happy: { mood: 'grin' },
    mad: { mood: 'mad', talk: true }, chaos: { mood: 'shock', armL: 150, armR: -150 },
    toast: { mood: 'tender', armR: -150, glass: true },
  };
  async function figureTextures(W, id, names, out = {}) {
    const make = async (name, set) => {
      const f = LT.family.figure(id, { mood: set.mood || 'neutral' });
      const root = f.el;
      const arms = root.querySelectorAll('.fam-arm');
      arms[0] && arms[0].setAttribute('transform', `rotate(${set.armL ?? 12})`);
      arms[1] && arms[1].setAttribute('transform', `rotate(${set.armR ?? -12})`);
      const mouth = root.querySelector('.fam-face') && root.querySelector('.fam-face').children[4];
      if (set.talk && mouth) { mouth.setAttribute('d', 'M-9 19 Q0 35 9 19 Q0 17 -9 19Z'); mouth.setAttribute('fill', '#5a1f1a'); }
      if (set.glass && arms[1]) {
        const g = arms[1];
        g.appendChild(U.svg('path', { d: 'M-8 70 L8 70 L4 92 L1 94 L1 112 L8 116 L-8 116 L-1 112 L-1 94 L-4 92 Z', fill: 'rgba(235,240,245,.85)', stroke: '#1c130c', 'stroke-width': 2, transform: 'translate(2,-6)' }));
        g.appendChild(U.svg('path', { d: 'M-7 74 L7 74 L4 88 L-4 88 Z', fill: '#6f1526', transform: 'translate(2,-6)' }));
      }
      const markup = defsMarkup() + root.outerHTML;
      f.destroy();
      out[name] = await svgToTexture(W, markup, VB, W.LOW ? 192 : 232, W.LOW ? 293 : 354);
    };
    await Promise.all(names.filter((n) => n !== 'toast' || id === 'grandma').map((n) => make(n, VARIANTS[n])));
    return out;
  }
  async function dogTextures(W, names, out = {}) {
    const make = async (name, mood) => {
      const d = LT.family.dogFigure({ mood });
      const markup = d.el.outerHTML;
      d.destroy();
      out[name] = await svgToTexture(W, markup, DVB, 200, 200);
    };
    await Promise.all(names.map((n) => make(n, n)));
    return out;
  }

  /* ---------- figure placement ---------- */
  function seatInfo(W, i) {
    const k = Math.floor(i / 2), side = i % 2 ? 1 : -1;
    return { k, side, z: 0.15 - k * W.SEAT };
  }
  function makePaper(W, group, w, h) {
    const T = W.T;
    const mat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0, transparent: false, alphaTest: 0.5, side: T.DoubleSide, emissive: '#2a1a0c', emissiveIntensity: 0.25 });
    const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    m.visible = false;
    group.add(m);
    return m;
  }

  /* ---------- the room's extra light (lives in the scene, starts dark) ---------- */
  let kitchenLight, kitchenHemi, bulbMat, popper;

  function build(group, W) {
    const T = W.T;
    S.W = W; S.group = group;
    // a pendant lamp over the head of the table
    const lamp = new T.Group(); lamp.position.set(0, 2.08, -1.25); group.add(lamp);
    const cord = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, 1.6, 6), new T.MeshStandardMaterial({ color: '#111', roughness: 0.6 }));
    cord.position.y = 0.85; lamp.add(cord);
    const shade = new T.Mesh(W.lathe([[0.02, 0.1], [0.05, 0.09], [0.16, 0.0], [0.2, -0.05], [0.198, -0.052], [0.155, -0.002], [0.045, 0.085], [0.015, 0.095]], 40),
      new T.MeshStandardMaterial({ color: '#7f8f6c', roughness: 0.45, metalness: 0.2, side: T.DoubleSide }));
    lamp.add(shade);
    bulbMat = new T.MeshStandardMaterial({ color: '#fff6e2', emissive: '#ffe7b8', emissiveIntensity: 0, roughness: 0.3 });
    const bulb = new T.Mesh(new T.SphereGeometry(0.045, 16, 12), bulbMat); bulb.position.y = -0.03; lamp.add(bulb);
    kitchenLight = new T.PointLight('#fff1d6', 0, 9, 2); kitchenLight.position.set(0, 1.9, -1.25); W.scene.add(kitchenLight);
    kitchenHemi = new T.HemisphereLight('#fff4e4', '#3a281a', 0); W.scene.add(kitchenHemi);
    // the pop-up timer in the turkey
    popper = new T.Group(); popper.position.set(0.15, W.TOP + 0.135, -0.16); group.add(popper);
    const stem = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.05, 10), new T.MeshStandardMaterial({ color: '#d83a2a', roughness: 0.4 }));
    stem.position.y = 0.0; popper.add(stem);
    const cap = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, 0.005, 14), new T.MeshStandardMaterial({ color: '#f2efe8', roughness: 0.5 }));
    cap.position.y = -0.01; popper.add(cap);
    popper.userData.stem = stem;

    // paper people
    const fw = VB[2] * U_M, fh = VB[3] * U_M;
    SEATS.forEach((s) => {
      const info = seatInfo(W, s.i);
      const def = LT.family.get(s.id);
      const mesh = makePaper(W, group, fw, fh);
      const x = info.side * (s.stand ? 0.98 : 0.86);
      const y0 = s.stand ? 0.84 : 0.64;
      mesh.position.set(x, y0 + (-VB[1] - VB[3] / 2) * U_M, info.z);
      S.figs[s.id] = { id: s.id, mesh, x, y0, z: info.z, side: info.side, scale: def.scale, tex: null, variant: 'neutral', talkUntil: 0, phase: U.rand(10), pop: 0, popT: 0 };
    });
    // Biscuit
    const dw = DVB[2] * U_M * 0.9, dh = DVB[3] * U_M * 0.9;
    const dmesh = makePaper(W, group, dw, dh);
    S.dog = { mesh: dmesh, home: new T.Vector3(0.62, 0.12 + dh / 2, -3.38), table: new T.Vector3(0.1, W.TOP + 0.06 + dh / 2 - 0.05, -0.28), pos: new T.Vector3(), tex: null, variant: 'beg', pop: 0, popT: 0 };
    S.dog.pos.copy(S.dog.home); dmesh.position.copy(S.dog.home);

    // textures, without blocking the journey
    (async () => {
      // first everyone's plain face, so they can appear; then the rest of their expressions
      await Promise.all([
        ...SEATS.map(async (s) => { S.figs[s.id].tex = await figureTextures(W, s.id, ['neutral']); setVariant(s.id, S.figs[s.id].variant); }),
        (async () => { S.dog.tex = await dogTextures(W, ['beg']); setDogVariant(S.dog.variant); })(),
      ]);
      await Promise.all([
        ...SEATS.map(async (s) => { await figureTextures(W, s.id, ['talk', 'happy', 'mad', 'chaos', 'toast'], S.figs[s.id].tex); setVariant(s.id, S.figs[s.id].variant); }),
        (async () => { await dogTextures(W, ['happy', 'guilty'], S.dog.tex); setDogVariant(S.dog.variant); })(),
      ]);
      S.ready = true;
    })().catch((e) => console.warn('act3 textures', e));

    W.onFrame(tick);
  }
  function setVariant(id, v) {
    const f = S.figs[id]; if (!f) return;
    f.variant = v;
    if (!f.tex) return;
    const t = f.tex[v] || f.tex.neutral;
    if (f.mesh.material.map !== t) { f.mesh.material.map = t; f.mesh.material.needsUpdate = true; }
  }
  function setDogVariant(v) {
    S.dog.variant = v;
    if (!S.dog.tex) return;
    const t = S.dog.tex[v] || S.dog.tex.beg;
    if (S.dog.mesh.material.map !== t) { S.dog.mesh.material.map = t; S.dog.mesh.material.needsUpdate = true; }
  }
  function everyone(v) { Object.keys(S.figs).forEach((id) => setVariant(id, v)); }

  /* ---------- every frame while the act is up ---------- */
  function tick(dt, t, raw) {
    const W = S.W;
    if (!S.group || !S.group.visible) return;
    const cam = W.camera.position;
    const k = Math.min(1, raw * 6);
    Object.values(S.figs).forEach((f) => {
      const m = f.mesh;
      f.pop += (f.popT - f.pop) * Math.min(1, raw * 7);
      m.visible = f.pop > 0.01 && !!m.material.map;
      const s = U.ease.outBack(U.clamp(f.pop, 0, 1));
      m.scale.set(f.scale * (0.6 + 0.4 * s), f.scale * s, 1);
      const talking = !S.frozen && t < f.talkUntil;
      const bob = S.frozen ? 0 : Math.sin(t * 1.7 + f.phase) * 0.006 + (talking ? Math.abs(Math.sin(t * 11 + f.phase)) * 0.012 : 0);
      // keep the figure's feet where they are while it scales
      m.position.y = f.y0 + (-VB[1] - VB[3] / 2) * U_M * f.scale * s + bob;
      m.position.x = f.x; m.position.z = f.z;
      m.rotation.y = Math.atan2(cam.x - m.position.x, cam.z - m.position.z);
      m.rotation.z = S.frozen ? 0 : Math.sin(t * 1.1 + f.phase) * 0.02 + (talking ? Math.sin(t * 7 + f.phase) * 0.025 : 0);
      if (talking && f.tex && (f.variant === 'neutral' || f.variant === 'talk')) setVariant(f.id, Math.sin(t * 22 + f.phase) > 0 ? 'talk' : 'neutral');
      else if (!talking && f.variant === 'talk') setVariant(f.id, 'neutral');
    });
    const d = S.dog;
    if (d) {
      d.pop += (d.popT - d.pop) * Math.min(1, raw * 6);
      d.mesh.visible = d.pop > 0.01 && !!d.mesh.material.map;
      const target = S.dogMode === 'table' ? d.table : d.home;
      if (!S.frozen) {
        d.dogK = Math.min(1, (d.dogK || 0) + raw * 1.6);
        d.pos.lerp(target, Math.min(1, raw * 5));
      }
      const total = d.home.distanceTo(d.table), prog = 1 - U.clamp(d.pos.distanceTo(target) / total, 0, 1);
      const hop = S.dogMode === 'table' ? Math.sin(prog * Math.PI) * 0.45 : 0;
      d.mesh.position.set(d.pos.x, d.pos.y + hop + (S.frozen ? 0 : Math.abs(Math.sin(t * (S.dogMode === 'table' ? 9 : 3))) * 0.01), d.pos.z);
      d.mesh.scale.setScalar(Math.max(0.001, U.ease.outBack(U.clamp(d.pop, 0, 1))));
      d.mesh.rotation.y = Math.atan2(cam.x - d.mesh.position.x, cam.z - d.mesh.position.z);
      d.mesh.rotation.z = S.dogMode === 'table' && !S.frozen ? Math.sin(t * 8) * 0.06 : 0;
    }
    // the kitchen light
    S.kitchen += (S.kitchenT - S.kitchen) * Math.min(1, raw * 9);
    let lvl = S.kitchen;
    if (S.flicker > 0) { S.flicker -= raw; lvl *= Math.random() < 0.35 ? 0.15 : 1; }
    kitchenLight.intensity = lvl * 0.85;
    kitchenHemi.intensity = lvl * 0.62;
    bulbMat.emissiveIntensity = lvl * 5;
    // the pop-up timer
    S.tempShown += (S.temp - S.tempShown) * k;
    const popT = S.temp >= 165 ? 1 : 0;
    S.popped += (popT - S.popped) * Math.min(1, raw * 10);
    popper.userData.stem.position.y = S.popped * 0.032;
    // shaking the room (the canvas), since the DOM shake can't reach WebGL
    const cv = document.getElementById('world');
    if (cv) {
      if (S.shake > 0.05 && !S.frozen && !U.reducedMotion) { S.shake *= Math.pow(0.15, raw); cv.style.transform = `translate(${U.rand(-S.shake, S.shake).toFixed(1)}px, ${U.rand(-S.shake, S.shake).toFixed(1)}px)`; }
      else if (cv.style.transform) cv.style.transform = '';
    }
    // tension follows the thermometer
    if (!S.frozen) LT.music.param('tension', U.clamp((S.tempShown - 40) / 125, 0, 1));
  }

  /* ---------- voices ---------- */
  function babble(id, n = 5) {
    const A = LT.audio; if (!A.ready || A.muted) return;
    const f0 = VOICE[id] || 220;
    for (let i = 0; i < n; i++) A.tone({ t: A.now() + i * 0.085, f: f0 * U.rand(0.85, 1.25), dur: 0.07, a: 0.004, type: 'triangle', g: 0.045, filter: { type: 'bandpass', f: f0 * 3, q: 1.3 }, pan: U.rand(-0.4, 0.4) });
  }
  function headPos(id) {
    const f = S.figs[id];
    if (!f) return null;
    const top = f.y0 + 252 * f.scale * U_M + 0.04;
    return new S.W.T.Vector3(f.x * 0.94, top, f.z);
  }

  /* ---------- pinned speech bubbles ---------- */
  function bubbleLayer(ctx) {
    const layer = ctx.overlay('a3-layer');
    const list = new Set();
    ctx.frame(() => {
      list.forEach((b) => {
        const p = headPos(b.who) || b.pos;
        if (!p) return;
        const s = S.W.project(p);
        const w = b.w || (b.w = b.n.offsetWidth), h = b.h || (b.h = b.n.offsetHeight);
        const x = U.clamp(s.x, w / 2 + 8, innerWidth - w / 2 - 8), y = U.clamp(s.y, h + 64, innerHeight - 12);
        b.n.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
        b.n.style.visibility = s.on ? 'visible' : 'hidden';
      });
    });
    return {
      layer,
      say(who, text, o = {}) {
        const def = LT.family.get(who);
        const n = el('div', { class: `a3-b ${o.cls || ''}`, 'data-who': who },
          el('span', { class: 'a3-who' }, def ? def.short : who), el('span', { class: 'a3-say' }, text));
        if (o.fuse) { const fz = el('span', { class: 'a3-fuse' }, el('i', { style: { animationDuration: `${o.fuse}s` } })); n.appendChild(fz); }
        layer.appendChild(n);
        const b = { n, who, alive: true };
        list.add(b);
        const f = S.figs[who];
        if (f && !o.silent) { f.talkUntil = performance.now() / 1000 + Math.min(2.2, 0.5 + text.length * 0.03); babble(who, Math.min(9, 3 + Math.round(text.length / 8))); }
        requestAnimationFrame(() => n.classList.add('on'));
        b.kill = (ms = 0) => { if (!b.alive) return; b.alive = false; setTimeout(() => { n.classList.add('out'); setTimeout(() => { n.remove(); list.delete(b); }, 380); }, ms); };
        if (o.ms) b.kill(o.ms);
        return b;
      },
      clear() { list.forEach((b) => b.kill()); },
    };
  }

  /* ---------- the thermometer (a dial you can read across the room) ---------- */
  function thermometer(ctx) {
    const layer = ctx.overlay('a3-hud');
    const needle = U.svg('line', { x1: 50, y1: 50, x2: 50, y2: 14, stroke: '#b8243d', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    const dial = U.svg('svg', { viewBox: '0 0 100 100', class: 'a3-dial', 'aria-hidden': 'true' },
      U.svg('circle', { cx: 50, cy: 50, r: 46, fill: '#f3ecdc', stroke: '#1c130c', 'stroke-width': 3 }),
      U.svg('path', { d: 'M17 74 A38 38 0 1 1 83 74', fill: 'none', stroke: 'rgba(28,19,12,.25)', 'stroke-width': 7 }),
      U.svg('path', { d: 'M71 18 A38 38 0 0 1 83 74', fill: 'none', stroke: '#b8243d', 'stroke-width': 7 }),
      needle, U.svg('circle', { cx: 50, cy: 50, r: 5, fill: '#1c130c' }));
    const read = el('div', { class: 'a3-read' }, '40°');
    const sub = el('div', { class: 'a3-sub' }, 'done at 165°F');
    const box = el('div', { class: 'a3-therm' }, dial, el('div', null, read, sub));
    layer.appendChild(box);
    ctx.frame(() => {
      const v = S.tempShown, a = U.map(v, 40, 175, -135, 135, true);
      needle.setAttribute('transform', `rotate(${a.toFixed(1)} 50 50)`);
      read.textContent = `${Math.round(v)}°`;
      box.classList.toggle('hot', v >= 140); box.classList.toggle('done', v >= 165);
      sub.textContent = v >= 165 ? 'DONE. SO DONE.' : 'done at 165°F';
    });
    return box;
  }

  /* ---------- shots (wider on a phone held upright) ---------- */
  const tall = () => innerWidth / innerHeight < 0.85;
  const SHOT = {
    head: () => (tall() ? { pos: [0, 2.95, 3.7], look: [0, 0.84, -1.6], fov: 56 } : { pos: [0, 2.05, 2.95], look: [0, 0.92, -1.5], fov: 40 }),
    push: () => (tall() ? { pos: [0.05, 2.65, 3.15], look: [0, 0.88, -1.6], fov: 56 } : { pos: [0.06, 1.82, 2.25], look: [0, 0.96, -1.6], fov: 42 }),
    chaos: () => (tall() ? { pos: [0.2, 2.45, 2.85], look: [-0.04, 0.92, -1.3], fov: 58 } : { pos: [0.3, 1.5, 1.8], look: [-0.08, 1.0, -1.3], fov: 48 }),
    grandma: () => (tall() ? { pos: [0.35, 2.1, 2.45], look: [-0.55, 1.02, -0.6], fov: 52 } : { pos: [0.55, 1.46, 1.62], look: [-0.7, 1.08, -0.25], fov: 42 }),
  };

  function setStage(o) {
    // put the room in a known state, whichever way the visitor arrived
    Object.values(S.figs).forEach((f) => { f.popT = 1; });
    S.dog.popT = 1;
    if (o.kitchen != null) S.kitchenT = o.kitchen;
    if (o.temp != null) S.temp = o.temp;
    if (o.dog) S.dogMode = o.dog;
    S.frozen = !!o.frozen;
    if (o.variant) everyone(o.variant);
    if (o.dogVariant) setDogVariant(o.dogVariant);
  }
  function ensureMusic() { if (!LT.music.cur || LT.music.cur.name !== 'table') LT.music.play('table', 0.6); }
  function startMurmur(level) {
    if (!S.murmur || !S.murmur.playing) S.murmur = LT.audio.sfx('murmur', { g: 0.3 });
    S.murmur && S.murmur.set && S.murmur.set(level);
  }
  function stopLoops() {
    if (S.murmur) { S.murmur.stop(0.6); S.murmur = null; }
    if (S.alarm) { S.alarm.stop(0.2); S.alarm = null; }
  }

  /* =================== the beats =================== */
  LT.journey.act({
    id: 'table', order: 3, numeral: 'III', course: 'Third Course', title: 'The Table', music: 'table',
    build,
    enter(W) {
      W.aftermath(false); W.setCandles(1); W.hero.light(); W.sky(0); W.fog(0.09);
      LT.music.param('tension', 0); LT.music.param('level', 1);
    },
    exit(W) {
      stopLoops();
      S.kitchenT = 0; S.kitchen = 0; S.frozen = false; S.shake = 0; S.temp = 40; S.tempShown = 40; S.dogMode = 'floor';
      if (kitchenLight) { kitchenLight.intensity = 0; kitchenHemi.intensity = 0; bulbMat.emissiveIntensity = 0; }
      Object.values(S.figs).forEach((f) => { f.popT = 0; f.pop = 0; });
      if (S.dog) { S.dog.popT = 0; S.dog.pop = 0; S.dog.pos.copy(S.dog.home); }
      const cv = document.getElementById('world'); if (cv) cv.style.transform = '';
      LT.music.param('tension', 0); LT.music.param('level', 1);
      W.mood({ dim: 1, cursor: 0.4 });
    },
    beats: [
      {
        id: 'table-everyone', caption: 'Everyone’s here.',
        note: 'Nine people, one dog, one empty chair. Skye has never been to one of these. Mom has not sat down since six this morning.',
        mood: { dim: 1, soft: 0, cursor: 0.25, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          W.shot(SHOT.head(), { dur: 2.8 });
          ensureMusic();
          S.frozen = false; S.temp = 40; S.dogMode = 'floor';
          S.kitchenT = 0;
          everyone('neutral'); setDogVariant('beg');
          // they pop up one by one, like a pop-up book
          const order = ['grandma', 'dale', 'linda', 'mom', 'dad', 'tyler', 'skye', 'maya', 'benji'];
          Object.values(S.figs).forEach((f) => { if (ctx.dir < 0) f.popT = 1; });
          order.forEach((id, i) => ctx.later(() => { S.figs[id].popT = 1; LT.audio.sfx('paper', { dur: 0.18, g: 0.7 }); }, ctx.dir < 0 ? 0 : 600 + i * 170));
          ctx.later(() => { S.dog.popT = 1; LT.audio.sfx('bark', { n: 1 }); }, ctx.dir < 0 ? 0 : 2300);
          startMurmur(0.3);
          const bub = bubbleLayer(ctx);
          // somebody hits the big light
          ctx.later(async () => {
            LT.audio.sfx('tick', { f: 1400, g: 0.16 });
            const flick = U.reducedMotion ? [[1, 0]] : [[1, 70], [0, 90], [1, 45], [0, 170], [1, 60], [0, 50], [1, 0]];
            for (const [on, ms] of flick) { S.kitchenT = on; S.kitchen = on; if (on) LT.audio.sfx('tick', { f: 2200, g: 0.06 }); if (ms) await ctx.wait(ms); }
            if (LT.audio.ready) LT.audio.tone({ f: 120, type: 'sawtooth', dur: 1.6, a: 0.02, r: 0.6, g: 0.02, filter: { type: 'lowpass', f: 500 } });
            W.mood({ cursor: 0.05 });
            startMurmur(0.55);
            setVariant('grandma', 'mad');
            bub.say('grandma', 'WHO turned on the BIG light?', { ms: 2000 });
            ctx.later(() => { bub.say('mom', 'So we can SEE, Mother.', { ms: 1900 }); setVariant('grandma', 'neutral'); }, 1500);
            ctx.later(() => bub.say('benji', 'BISCUIT IS UNDER THE TABLE', { ms: 1800 }), 3300);
          }, ctx.dir < 0 ? 200 : 3000);
        },
      },
      {
        id: 'table-begins', caption: 'It starts *small.*',
        note: 'Every family has landmines. Most of them are shaped like questions.',
        mood: { dim: 1, cursor: 0.05 },
        enter(ctx) {
          const W = ctx.W;
          W.shot(SHOT.push(), { dur: 9, ease: 'inOutSine' });
          ensureMusic();
          setStage({ kitchen: 1, temp: Math.max(S.temp, 52), dog: 'floor', variant: 'neutral' });
          startMurmur(0.6);
          thermometer(ctx);
          const bub = bubbleLayer(ctx);
          let i = 0;
          const one = () => {
            const [who, line] = OPENERS[i++ % OPENERS.length];
            bub.say(who, line, { ms: 2300 });
            S.temp = Math.min(118, S.temp + 7);
            if (i < OPENERS.length) ctx.later(one, 1250);
          };
          ctx.later(one, 700);
        },
      },
      {
        id: 'table-game', caption: 'Change the subject.',
        note: 'Tap a bubble before its fuse burns down and you’ll steer the conversation somewhere safe. The turkey thermometer is heading for 165°F. So is the family.',
        lock: true, mood: { dim: 1, cursor: 0.05 },
        enter(ctx) {
          const W = ctx.W;
          W.shot(SHOT.head(), { dur: 1.8 });
          ensureMusic();
          setStage({ kitchen: 1, temp: Math.max(70, Math.min(S.temp, 100)), dog: 'floor', variant: 'neutral', dogVariant: 'beg' });
          startMurmur(0.6);
          thermometer(ctx);
          const bub = bubbleLayer(ctx);
          const msgs = el('div', { class: 'a3-msgs', 'aria-live': 'polite' });
          bub.layer.appendChild(msgs);
          const say = (text, cls) => { const m = el('div', { class: `a3-msg ${cls || ''}` }, text); msgs.prepend(m); setTimeout(() => m.remove(), 2600); while (msgs.children.length > 3) msgs.lastChild.remove(); };
          let running = false, left = 30, spawnT = 0, defused = 0, exploded = 0, deck = [], watch = false;
          const live = new Map();
          const clock = el('div', { class: 'a3-clock' }, '');
          bub.layer.appendChild(clock);
          const finish = (won) => {
            running = false;
            live.forEach((b) => b.kill()); live.clear();
            LT.state.tableOutcome = watch ? LT.state.tableOutcome : won ? 'survived' : 'chaos';
            LT.save();
            if (won) {
              LT.audio.sfx('tada'); LT.fx.confetti(innerWidth / 2, innerHeight * 0.7, { count: 120 });
              ctx.caption('You made it\nto *pie.*'); ctx.note(`${defused} landmines defused. Promoted from the kids’ table, effective immediately.`);
              LT.stats.inc('dinnersSurvived');
              ctx.unlock();
              ctx.later(() => ctx.next(), 3800);
            } else {
              ctx.unlock();
              ctx.next();
            }
          };
          const spawn = () => {
            const busy = new Set([...live.values()].map((b) => b.who));
            if (!deck.length) deck = U.shuffle(MINES);
            let m = deck.findIndex((x) => !busy.has(x.who));
            if (m < 0) return;
            const mine = deck.splice(m, 1)[0];
            const prog = 1 - left / 30;
            const fuse = watch ? 1.3 : U.lerp(5.2, 3.3, prog);
            const b = bub.say(mine.who, mine.say, { fuse, cls: 'mine' });
            b.mine = mine; b.t = fuse;
            b.n.classList.add('jr-interactive');
            b.n.setAttribute('role', 'button'); b.n.setAttribute('tabindex', '0');
            const defuse = () => {
              if (!b.alive || !running) return;
              live.delete(b); b.kill();
              defused++; LT.stats.inc('fusesDefused'); if (/potato/i.test(mine.you)) LT.stats.inc('potatoesPassed');
              S.temp = Math.max(40, S.temp - 4);
              LT.audio.sfx('pop', { f: 700, g: 0.25 });
              const yb = el('div', { class: 'a3-you' }, el('span', null, 'You: '), mine.you);
              bub.layer.appendChild(yb); setTimeout(() => yb.classList.add('out'), 1500); setTimeout(() => yb.remove(), 1900);
              babble('you', 4);
              ctx.later(() => bub.say(mine.who, U.pick(REACT[mine.who] || ['Oh!']), { ms: 1300, cls: 'calm' }), 500);
              setVariant(mine.who, 'happy'); ctx.later(() => setVariant(mine.who, 'neutral'), 1600);
            };
            b.n.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); defuse(); });
            b.n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); defuse(); } });
            live.set(b, b);
          };
          const boom = (b) => {
            live.delete(b);
            b.n.classList.add('boom');
            b.kill(500);
            exploded++; LT.stats.inc('landminesExploded');
            S.temp += watch ? 22 : 15; S.shake = 7;
            LT.audio.sfx('thud', { g: 0.35 }); LT.audio.sfx('pop', { f: 260, g: 0.3 });
            setVariant(b.mine.who, 'mad'); ctx.later(() => setVariant(b.mine.who, 'neutral'), 1800);
            say(b.mine.boom, 'bad');
            if (Math.random() < 0.35) LT.fx.splat(U.rand(innerWidth * 0.15, innerWidth * 0.85), U.rand(innerHeight * 0.15, innerHeight * 0.6), { color: U.pick(['#6b3f1d', '#8f1023', '#d9a441']), size: U.rand(70, 130) });
            if (S.temp >= 165) finish(false);
          };
          ctx.frame((dt, t, raw) => {
            if (!running) return;
            left -= raw;
            clock.textContent = watch ? '' : `${Math.max(0, Math.ceil(left))}s to pie`;
            S.temp += raw * (watch ? 2.5 : 1.1);
            spawnT -= raw;
            const prog = 1 - left / 30;
            if (spawnT <= 0 && live.size < (watch ? 5 : 2 + Math.round(prog * 2))) { spawn(); spawnT = watch ? 0.6 : U.lerp(1.7, 0.85, prog); }
            live.forEach((b) => { b.t -= raw; if (b.t <= 0) boom(b); });
            if (S.temp >= 165) finish(false);
            else if (left <= 0 && !watch) finish(S.temp < 165);
          });
          const start = (w) => {
            watch = w; running = true; left = 30; spawnT = 0.2;
            play.remove(); just.remove();
            ctx.hint('');
            if (!w) ctx.note('Tap the bubbles. Thirty seconds to pie.');
          };
          const play = ctx.button('Play: 30 seconds', () => start(false));
          const just = ctx.button('Just watch it fall apart', () => start(true), { ghost: true });
          ctx.cleanup(() => { running = false; });
        },
      },
      {
        id: 'table-chaos', caption: 'TOTAL CHAOS.', lock: true, layout: '',
        mood: { dim: 1, cursor: 0 },
        enter(ctx) {
          const W = ctx.W;
          const survived = LT.state.tableOutcome === 'survived';
          if (survived) ctx.caption('You did everything right.\nThen the *dog* got on the table.');
          ctx.note('');
          W.shot(SHOT.chaos(), { dur: 1.2 });
          ensureMusic();
          setStage({ kitchen: 1, temp: Math.max(S.temp, 150), dog: 'floor', variant: 'chaos', dogVariant: 'happy' });
          S.temp = 172;
          startMurmur(1);
          thermometer(ctx);
          const bub = bubbleLayer(ctx);
          S.alarm = LT.audio.sfx('alarm', { g: 0.1 });
          S.shake = 14; LT.fx.shake(12, 3);
          S.flicker = 2.6;
          ctx.later(() => { S.dogMode = 'table'; LT.audio.sfx('bark', { n: 2 }); LT.audio.sfx('boing'); }, 500);
          ctx.later(() => { LT.audio.sfx('boom', { g: 0.22 }); LT.audio.sfx('crunch', { n: 12 }); }, 1250);
          const ids = Object.keys(S.figs);
          const blurt = () => { const id = U.pick(ids); bub.say(id, U.pick(CHAOS), { ms: 1100, cls: 'chaos' }); };
          for (let i = 0; i < 16; i++) ctx.later(blurt, 150 + i * 260);
          [500, 1300, 2100, 2900].forEach((ms) => ctx.later(() => { LT.fx.splat(U.rand(innerWidth * 0.1, innerWidth * 0.9), U.rand(innerHeight * 0.1, innerHeight * 0.65), { color: U.pick(['#6b3f1d', '#8f1023', '#5d6b2a', '#d9a441']), size: U.rand(90, 170), life: 7 }); LT.audio.sfx('splat'); S.shake = 12; }, ms));
          ctx.later(() => LT.audio.sfx('gobble'), 2000);
          // freeze frame
          ctx.later(() => {
            LT.audio.sfx('scratch');
            LT.music.stop(0.05);
            stopLoops();
            S.frozen = true; S.shake = 0;
            const cs = W.camState(); W.shot({ pos: cs.pos.toArray(), look: cs.look.toArray(), fov: cs.fov }, { dur: 0 });
            const fr = ctx.overlay('a3-freeze');
            fr.appendChild(el('div', { class: 'a3-freeze-txt' }, 'Yep. ', el('i', null, 'That’s us.')));
            ctx.caption('');
            ctx.note('Every family, every year: somebody brings up the thing, somebody spills the gravy, somebody’s dog gets the turkey. And everybody comes back next year.');
            ctx.unlock();
            if (survived) LT.state.tableOutcome = 'survived';
          }, 4300);
        },
      },
      {
        id: 'table-glass', caption: '*Ting. Ting. Ting.*', layout: '',
        mood: { dim: 0.85, cursor: 0.3, moon: 0 },
        enter(ctx) {
          const W = ctx.W;
          stopLoops();
          LT.music.stop(0.8);
          W.shot(SHOT.grandma(), { dur: 3.4, ease: 'inOutSine' });
          setStage({ kitchen: 0, temp: 165, dog: 'floor', variant: 'neutral', dogVariant: 'guilty', frozen: false });
          S.flicker = 0;
          const bub = bubbleLayer(ctx);
          ctx.note('');
          ctx.later(() => setVariant('grandma', 'toast'), 600);
          [900, 1400, 1900].forEach((ms) => ctx.later(() => LT.audio.sfx('ting', { f: 2250 }), ms));
          ctx.later(() => {
            bub.say('grandma', 'Before pie… let’s go around the table.', { ms: 4200, cls: 'calm' });
            ctx.caption('Before pie…\nlet’s go around *the table.*');
            ctx.note('Grandma’s rule. Nobody touches the pie until everybody has said one thing.');
          }, 2600);
          ctx.later(() => bub.say('maya', 'every year.', { ms: 1800, cls: 'calm' }), 5600);
          ctx.later(() => bub.say('grandma', 'Every year.', { ms: 2200, cls: 'calm' }), 7000);
          ctx.later(() => { setVariant('grandma', 'neutral'); everyone('neutral'); }, 9000);
          ctx.sideDoor('Survive dinner: the full game', 'table');
        },
      },
    ],
  });
})();
