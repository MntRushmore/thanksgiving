/* Act V of the journey — the night. Blow out the candle; the breath runs back through 405 years; look up. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  const ADDRESS = ['The People', 'The Earth Mother', 'The Waters', 'The Fish', 'The Plants', 'The Food Plants', 'The Medicine Herbs', 'The Animals', 'The Trees', 'The Birds', 'The Four Winds', 'The Thunderers', 'The Sun', 'Grandmother Moon', 'The Stars', 'The Enlightened Teachers', 'The Creator'];
  const HIGH = { pos: [0, 30, 14], look: [0, 0, -55], fov: 46 };
  const SKY = { pos: [0, 3.2, 6], look: [0, 40, -120], fov: 60 };
  let C = null; // constellations

  function buildSky(group, W) {
    const T = W.T, rnd = U.seeded(1126);
    const pts = [], seg = [], groups = [];
    ADDRESS.forEach((name, i) => {
      // spread across the sky in front of you, an arc from left to right
      const a = -1.15 + (i / (ADDRESS.length - 1)) * 2.3, el2 = 0.38 + Math.sin(i * 1.7) * 0.12 + (i % 2) * 0.08;
      const center = new T.Vector3(Math.sin(a) * Math.cos(el2), Math.sin(el2), -Math.cos(a) * Math.cos(el2)).multiplyScalar(300);
      const n = 3 + Math.floor(rnd() * 3), start = pts.length / 3, mine = [];
      for (let k = 0; k < n; k++) {
        const off = new T.Vector3((rnd() - 0.5) * 34, (rnd() - 0.5) * 26, (rnd() - 0.5) * 20);
        const p = center.clone().add(off);
        pts.push(p.x, p.y + 3, p.z); mine.push(start + k);
        if (k) seg.push(start + k - 1, start + k);
      }
      groups.push({ name, center, idx: mine });
    });
    const N = pts.length / 3;
    const lit = new Float32Array(N);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
    g.setAttribute('aLit', new T.BufferAttribute(lit, 1));
    const mat = new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 900 } },
      vertexShader: 'attribute float aLit; varying float vL; uniform float uScale; void main(){ vL = aLit; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uScale * (0.9 + aLit) / -mv.z * 6.0; }',
      fragmentShader: 'varying float vL; uniform float uTime; void main(){ if (vL < 0.01) discard; float r = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - r), 3.0) + smoothstep(0.25, 0.0, r) * 2.0; gl_FragColor = vec4(vec3(1.0, 0.86, 0.6) * a * vL * 1.6, 1.0); }',
      blending: T.AdditiveBlending, depthWrite: false, transparent: true,
    });
    const P = new T.Points(g, mat); P.frustumCulled = false; group.add(P);
    const lg = new T.BufferGeometry();
    const lpos = new Float32Array(seg.length * 3), lcol = new Float32Array(seg.length * 3);
    seg.forEach((vi, j) => { lpos.set(pts.slice(vi * 3, vi * 3 + 3), j * 3); });
    lg.setAttribute('position', new T.BufferAttribute(lpos, 3));
    lg.setAttribute('color', new T.BufferAttribute(lcol, 3));
    const L = new T.LineSegments(lg, new T.LineBasicMaterial({ vertexColors: true, blending: T.AdditiveBlending, transparent: true, depthWrite: false }));
    L.frustumCulled = false; group.add(L);
    C = { groups, lit, geo: g, mat, lines: lg, seg, target: new Float32Array(N) };
  }
  function lightConstellation(i) {
    const gp = C.groups[i];
    gp.idx.forEach((v, k) => setTimeout(() => { C.target[v] = 1; }, k * 140));
  }

  LT.journey.act({
    id: 'night', order: 5, numeral: 'V', course: 'Dessert', title: 'The Night', music: 'leftovers',
    build(group, W) {
      buildSky(group, W);
      W.onFrame((dt, t) => {
        if (!C) return;
        let ch = false;
        for (let i = 0; i < C.lit.length; i++) { const d = C.target[i] - C.lit[i]; if (Math.abs(d) > 0.002) { C.lit[i] += d * Math.min(1, dt * 2.5); ch = true; } }
        if (ch) {
          C.geo.attributes.aLit.needsUpdate = true;
          const col = C.lines.attributes.color.array;
          for (let j = 0; j < C.seg.length; j++) { const v = C.lit[C.seg[j]] * 0.35; col[j * 3] = v; col[j * 3 + 1] = v * 0.78; col[j * 3 + 2] = v * 0.45; }
          C.lines.attributes.color.needsUpdate = true;
        }
      });
    },
    enter(W) { W.aftermath(true); },
    exit(W) { W.sky(0); W.fog(0.09); W.mood({ moon: 0 }); },
    beats: [
      {
        id: 'late', caption: 'It’s late.', shot: 'finale', dur: 4,
        note: 'The pie is gone. Somebody is asleep on the couch with the game still on. The candle you lit at the beginning has burned a long way down.',
        mood: { dim: 0.78, soft: 0, cursor: 0.08, moon: 0.3 },
        enter(ctx) {
          const W = ctx.W;
          W.aftermath(true); W.setCandles(1); W.hero.burn(0.62); W.hero.light(); W.sky(0); W.fog(0.09);
          LT.music.param('night', 0.35);
        },
      },
      {
        id: 'blow', caption: 'Somebody has to\nblow out the candle.', shot: 'finale', dur: 1, lock: true,
        note: 'Press and hold.',
        mood: { dim: 0.78, cursor: 0.05, moon: 0.3 },
        enter(ctx) {
          const W = ctx.W, A = LT.audio;
          let pressing = false, strength = 0, done = false, breath = null;
          const btn = ctx.button('Hold to blow out the candle', () => {});
          btn.classList.add('hold-btn');
          const fill = el('span', { class: 'fill', 'aria-hidden': 'true' }); btn.prepend(fill);
          const start = (e) => { if (done) return; e.preventDefault(); pressing = true; if (A.ready && !breath) { const c = A.ctx, s = c.createBufferSource(); s.buffer = A.buf.pink; s.loop = true; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.6; const g = c.createGain(); g.gain.value = 0.0001; s.connect(bp); bp.connect(g); g.connect(A.sfxBus); s.start(); breath = { s, g, bp }; } };
          const stop = () => { pressing = false; };
          const kill = () => { if (!breath) return; const b = breath; breath = null; const t = A.ctx.currentTime; b.g.gain.setTargetAtTime(0.0001, t, 0.08); setTimeout(() => { try { b.s.stop(); } catch (e) {} }, 400); };
          ctx.on(btn, 'pointerdown', start); ctx.on(btn, 'pointerup', stop); ctx.on(btn, 'pointerleave', stop); ctx.on(btn, 'pointercancel', stop);
          ctx.on(btn, 'keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
          ctx.on(btn, 'keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
          ctx.on(btn, 'contextmenu', (e) => e.preventDefault());
          ctx.cleanup(kill);
          ctx.frame((dt, t, raw) => {
            if (done) return;
            strength = U.clamp(strength + (pressing ? raw / 1.6 : -raw / 0.6), 0, 1);
            W.hero.blow(strength * 0.95);
            fill.style.transform = `scaleX(${strength})`;
            if (breath) { const tt = A.ctx.currentTime; breath.g.gain.setTargetAtTime(0.02 + strength * 0.4, tt, 0.05); breath.bp.frequency.setTargetAtTime(500 + strength * 700, tt, 0.08); if (!pressing && strength <= 0.01) kill(); }
            if (strength >= 1) out();
          });
          async function out() {
            done = true; kill(); btn.remove();
            W.hero.out(); A.sfx('snuff');
            ctx.caption('');
            ctx.note('');
            await ctx.wait(700);
            ctx.caption('Your breath goes\nall the way back.');
            ctx.note('Every year at this table, back to 1640, back to the first harvest, goes dark, one after another.');
            W.mood({ cursor: 0, moon: 0.22 });
            A.sfx('blow', { dur: 2.6, g: 0.1 });
            W.fly({ points: [W.camState().pos, [0.2, 1.8, 2.2], [0, 6, 6], HIGH.pos], looks: [W.camState().look, [0, 0.9, -4], [0, 0.5, -25], HIGH.look], dur: U.reducedMotion ? 1 : 9, fov: HIGH.fov });
            await W.extinguish({ gap: 0.07 });
            ctx.unlock();
            ctx.hint('Next →');
          }
        },
      },
      {
        id: 'up', caption: 'Look up.', shot: SKY, dur: 6, ease: 'inOutSine',
        note: 'All those years of candles, and the sky was here the whole time.',
        mood: { dim: 1, cursor: 0, moon: 0.15 },
        enter(ctx) {
          const W = ctx.W;
          W.setCandles(0); W.hero.out && null;
          W.sky(1); W.fog(0.02);
          LT.music.param('night', 0.85);
          LT.audio.sfx('swell', { dur: 3, g: 0.08 });
        },
      },
      {
        id: 'address', caption: 'The words that come\n*before all else.*', shot: SKY, dur: 0.1, lock: true,
        note: 'Long before 1621, and still today, Haudenosaunee gatherings open with the Thanksgiving Address, Ohén:ton Karihwatéhkwen. It thanks the whole world, in order, and after each part asks everyone to agree. It isn’t ours to recite. But its order is a lesson in where to point the light.',
        mood: { dim: 1, cursor: 0, moon: 0.1 },
        enter(ctx) {
          const W = ctx.W;
          W.sky(1); W.fog(0.02);
          let lit = 0, auto = null;
          const SCALE = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86, 88, 91, 93, 95, 98, 100];
          const go = () => {
            if (lit >= ADDRESS.length) return;
            const i = lit++;
            lightConstellation(i);
            LT.audio.sfx('chime', { n: SCALE[i] - 12 });
            const g = C.groups[i];
            ctx.label(g.center.clone().add(new W.T.Vector3(0, 22, 0)), g.name, { cls: 'glow' });
            b.textContent = lit < ADDRESS.length ? `Light the next: ${ADDRESS[lit]}` : 'Now our minds are one.';
            if (lit >= ADDRESS.length) {
              clearInterval(auto); b.disabled = true; a.remove();
              ctx.later(() => {
                ctx.caption('*Now our minds are one.*');
                ctx.note('The refrain of the Thanksgiving Address. The names in the sky follow the order of its widely published English version. The full address, in English and in the Haudenosaunee languages, is shared by Haudenosaunee educators and is worth reading in their words.');
                LT.audio.sfx('swell', { dur: 2.6, g: 0.1 });
                ctx.unlock();
              }, 1400);
            }
          };
          const b = ctx.button(`Light the first: ${ADDRESS[0]}`, go);
          const a = ctx.button('Let it play', () => { a.remove(); auto = setInterval(go, U.reducedMotion ? 250 : 1100); ctx.cleanup(() => clearInterval(auto)); }, { ghost: true });
        },
        exit() { if (C) C.target.fill(1); },
      },
      {
        id: 'people', caption: 'Now go find\nyour people.', shot: SKY, dur: 0.1,
        mood: { dim: 1, cursor: 0 },
        enter(ctx) {
          const who = LT.state.letterTo;
          ctx.note(who ? `Or call them. Start with ${who}. Tell them one specific thing.` : 'Or call them. Tell one of them one specific thing they did, and what it changed.');
          if (C) C.target.fill(1);
          LT.music.param('night', 0.4);
        },
      },
      {
        id: 'credits', caption: '', shot: { pos: [0.1, 1.2, 1.4], look: [-0.22, 1.05, 0.3], fov: 32 }, dur: 6, layout: 'clear',
        mood: { dim: 0.85, cursor: 0.1, moon: 0.2 },
        enter(ctx) {
          const W = ctx.W;
          W.sky(0.35); W.fog(0.06);
          const layer = ctx.overlay('jr-credits');
          const found = Object.keys(LT.state.eggs || {}).length, total = (LT.eggCatalog || []).length;
          const roll = el('div', { class: 'jr-credits-in jr-interactive' },
            el('p', { class: 'lt-eyebrow' }, 'That was'),
            U.html('<h2 class="lt-display">The Long <i>Table</i></h2>'),
            el('p', null, 'Thanksgiving, in five courses, as one walk down one table. Made on Thanksgiving Day, 2026.'),
            el('p', null, 'Every sound was synthesized in your browser. Every picture, the room included, was drawn in code. No turkeys were harmed. Several were pardoned.'),
            found ? el('p', null, `You found ${found} of ${Math.max(found, total)} secrets.`) : null,
            el('div', { class: 'jr-credit-btns' },
              el('button', { class: 'lt-btn', type: 'button', on: { click: () => { J().resumeAt = J().i; LT.go('leftovers'); } } }, 'See what you did tonight'),
              el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', on: { click: () => LT.go('menu') } }, 'Second helpings'),
              el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', on: { click: () => { LT.audio.sfx('match'); LT.go('prelude', { transition: 'smoke' }); } } }, 'Light the candle again')),
            el('details', { class: 'jr-sources' }, el('summary', null, 'Sources and further reading'),
              el('ul', null, ...[
                'Edward Winslow’s letter of December 1621, printed in Mourt’s Relation (1622); William Bradford, Of Plymouth Plantation',
                'Plimoth Patuxet Museums and the Wampanoag Homesite; the National Museum of the American Indian',
                'Wamsutta Frank James, the suppressed 1970 speech, and the National Day of Mourning',
                'George Washington’s Thanksgiving Proclamation (1789); Abraham Lincoln’s (1863); Sarah Josepha Hale in Godey’s Lady’s Book',
                'Benjamin Franklin to Sarah Bache (1784); Amelia Simmons, American Cookery (1796)',
                'Emmons & McCullough (2003); Seligman, Steen, Park & Peterson (2005); Kumar & Epley (2018); A.J. Jacobs, Thanks a Thousand (2018)',
              ].map((s) => el('li', null, s)))));
          layer.appendChild(roll);
          // and then, quietly, someone lights it again
          ctx.later(() => {
            W.hero.burn(0.62); W.hero.light(); LT.audio.sfx('whoomp');
            const p = W.hero.worldPos();
            ctx.label(p.clone().add(new W.T.Vector3(0, 0.1, 0)), 'Grandma lit it again. Take a plate.', { cls: '' });
            LT.music.param('night', 0.1);
          }, 9000);
        },
      },
    ],
  });
  const J = () => LT.journey;
})();
