/* The Long Table — generative score. One scene per course, crossfaded. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, A = LT.audio;
  const M = (LT.music = { scenes: {}, cur: null, params: {} });
  const mtof = A.mtof;
  const R = U.rand;

  /* ---------- instruments: (bus, t, note, dur, vel) ---------- */
  const I = (M.instruments = {});
  function osc(type, f, t, end, detune) {
    const o = A.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.value = detune; o.start(t); o.stop(end); return o;
  }
  function gainEnv(t, a, peak, d, sustain, end) {
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    if (sustain != null) {
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustain), t + a + d);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    return g;
  }
  I.piano = (bus, t, n, dur = 1.2, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n), tail = n < 55 ? 2.6 : n < 72 ? 1.8 : 1.2;
    const end = t + dur + tail;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v * 0.2, t + 0.005);
    g.gain.exponentialRampToValueAtTime(v * 0.07, t + 0.3);
    g.gain.setValueAtTime(v * 0.07 * Math.exp(-dur * 0.6), t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(14000, f * 9), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.6), end);
    [[1, 1], [2.002, 0.42], [3.004, 0.17], [4.01, 0.09], [5.03, 0.04]].forEach(([m, a]) => {
      const o = osc('sine', f * m, t, end + 0.05);
      const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(lp);
    });
    lp.connect(g); g.connect(bus);
  };
  I.pad = (bus, t, notes, dur, v = 0.5, o = {}) => {
    const ctx = A.ctx, a = o.a ?? 1.4, r = o.r ?? 2;
    notes.forEach((n) => {
      const f = mtof(n), end = t + dur + r;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.cut || 900; lp.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v * 0.035, t + a);
      g.gain.setValueAtTime(v * 0.035, t + dur);
      g.gain.linearRampToValueAtTime(0.0001, end);
      [-7, 7].forEach((d) => { const s = osc(o.wave || 'sawtooth', f, t, end + 0.05, d + R(-2, 2)); s.connect(lp); });
      lp.connect(g); g.connect(bus);
    });
  };
  I.choir = (bus, t, notes, dur, v = 0.5) => {
    const ctx = A.ctx, a = 1.6, r = 2.4;
    notes.forEach((n) => {
      const f = mtof(n), end = t + dur + r;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.05, t + a);
      g.gain.setValueAtTime(v * 0.05, t + dur); g.gain.linearRampToValueAtTime(0.0001, end);
      const sum = ctx.createGain(); sum.gain.value = 1;
      [-5, 4].forEach((d) => {
        const s = osc('sawtooth', f, t, end + 0.05, d);
        const vib = ctx.createOscillator(); vib.frequency.value = R(4.6, 5.4);
        const vg = ctx.createGain(); vg.gain.value = 5; vib.connect(vg); vg.connect(s.detune); vib.start(t); vib.stop(end);
        s.connect(sum);
      });
      [[750, 5, 1], [1150, 6, 0.7], [2600, 8, 0.25]].forEach(([ff, q, amp]) => {
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q;
        const ag = ctx.createGain(); ag.gain.value = amp;
        sum.connect(bp); bp.connect(ag); ag.connect(g);
      });
      g.connect(bus);
    });
  };
  I.pluck = (bus, t, n, dur = 0.4, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n), end = t + dur + 0.3;
    const o = osc('triangle', f, t, end);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(8000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(200, f * 1.2), t + 0.25);
    const g = gainEnv(t, 0.003, v * 0.32, 0.12, 0.35, end);
    o.connect(lp); lp.connect(g); g.connect(bus);
  };
  I.marimba = (bus, t, n, dur = 0.5, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n);
    [[1, 1, 0.55], [3.93, 0.28, 0.1], [9.2, 0.08, 0.03]].forEach(([m, a, d]) => {
      const o = osc('sine', f * m, t, t + d + 0.4);
      const g = gainEnv(t, 0.002, v * 0.26 * a, d, null, t + d + 0.35);
      o.connect(g); g.connect(bus);
    });
  };
  I.musicbox = (bus, t, n, dur = 1, v = 0.6) => {
    const f = mtof(n);
    [[1, 1, 1.9], [3.0, 0.14, 0.6], [5.98, 0.05, 0.25]].forEach(([m, a, d]) => {
      const o = osc('sine', f * m, t, t + d + 0.05);
      const g = gainEnv(t, 0.002, v * 0.16 * a, d, null, t + d);
      o.connect(g); g.connect(bus);
    });
  };
  I.bass = (bus, t, n, dur = 0.5, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n), end = t + dur + 0.2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = gainEnv(t, 0.006, v * 0.42, 0.25, 0.4, end);
    osc('sine', f, t, end).connect(lp); osc('triangle', f, t, end).connect(lp);
    lp.connect(g); g.connect(bus);
  };
  I.tuba = (bus, t, n, dur = 0.18, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n), end = t + dur + 0.08;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 2.5;
    const g = gainEnv(t, 0.02, v * 0.35, dur * 0.6, 0.5, end);
    osc('square', f, t, end).connect(lp); osc('sine', f, t, end).connect(g);
    lp.connect(g); g.connect(bus);
  };
  I.accordion = (bus, t, n, dur = 0.2, v = 0.6, detune = 0) => {
    const ctx = A.ctx, f = mtof(n + detune), end = t + dur + 0.05;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1300; pk.Q.value = 1.2; pk.gain.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.07, t + 0.015);
    g.gain.setValueAtTime(v * 0.07, t + dur); g.gain.linearRampToValueAtTime(0.0001, end);
    const trem = ctx.createOscillator(); trem.frequency.value = 6.2;
    const tg = ctx.createGain(); tg.gain.value = v * 0.015; trem.connect(tg); tg.connect(g.gain); trem.start(t); trem.stop(end);
    osc('sawtooth', f, t, end, -9).connect(lp); osc('sawtooth', f, t, end, 9).connect(lp);
    const sq = osc('square', f * 2, t, end); const sg = ctx.createGain(); sg.gain.value = 0.25; sq.connect(sg); sg.connect(lp);
    lp.connect(pk); pk.connect(g); g.connect(bus);
  };
  I.cello = (bus, t, n, dur = 1, v = 0.6) => {
    const ctx = A.ctx, f = mtof(n), end = t + dur + 0.6;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.7;
    const body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 280; body.Q.value = 1.2; body.gain.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.075, t + 0.28);
    g.gain.setValueAtTime(v * 0.07, t + dur); g.gain.linearRampToValueAtTime(0.0001, end);
    [-4, 5].forEach((d) => {
      const s = osc('sawtooth', f, t, end + 0.05, d);
      const vib = ctx.createOscillator(); vib.frequency.value = 5.3;
      const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(9, t + 0.5);
      vib.connect(vg); vg.connect(s.detune); vib.start(t); vib.stop(end);
      s.connect(lp);
    });
    lp.connect(body); body.connect(g); g.connect(bus);
  };
  I.kick = (bus, t, v = 0.6) => { const o = osc('sine', 120, t, t + 0.2); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); const g = gainEnv(t, 0.002, v * 0.6, 0.15, null, t + 0.18); o.connect(g); g.connect(bus); };
  I.noiseHit = (bus, t, f, q, dur, v, type = 'bandpass') => {
    const ctx = A.ctx, src = ctx.createBufferSource(); src.buffer = A.buf.white;
    const bp = ctx.createBiquadFilter(); bp.type = type; bp.frequency.value = f; bp.Q.value = q;
    const g = gainEnv(t, 0.002, v, dur, null, t + dur);
    src.connect(bp); bp.connect(g); g.connect(bus); src.start(t, R(2)); src.stop(t + dur + 0.02);
  };
  I.brush = (bus, t, v = 0.5) => I.noiseHit(bus, t, 3000, 0.6, 0.18, v * 0.12);
  I.hat = (bus, t, v = 0.5) => I.noiseHit(bus, t, 7500, 0.8, 0.04, v * 0.08, 'highpass');
  I.snare = (bus, t, v = 0.5) => { I.noiseHit(bus, t, 1800, 0.7, 0.14, v * 0.22); const o = osc('triangle', 190, t, t + 0.08); const g = gainEnv(t, 0.002, v * 0.15, 0.06, null, t + 0.07); o.connect(g); g.connect(bus); };
  I.clap = (bus, t, v = 0.5) => { [0, 0.01, 0.022].forEach((d) => I.noiseHit(bus, t + d, 1500, 1.2, 0.05, v * 0.2)); };

  /* ---------- scheduler ---------- */
  const LOOK = 0.14;
  let timer = null;
  function pump() {
    const s = M.cur;
    if (!s || !A.ready) return;
    const now = A.ctx.currentTime;
    if (s.next < now - 0.25) s.next = now + 0.05; // recover after a suspended tab
    while (s.next < now + LOOK) {
      try { s.def.step.call(s, s.i, s.next, s); } catch (e) { console.warn('music step', e); }
      const bpm = typeof s.def.bpm === 'function' ? s.def.bpm(M.params) : s.def.bpm;
      s.next += 60 / bpm / (s.def.div || 2);
      s.i++;
    }
  }

  M.define = (name, def) => { M.scenes[name] = def; };

  M.play = function (name, fade = 2.2) {
    if (!A.ready) { M.pending = name; return; }
    if (M.cur && M.cur.name === name) return;
    M.stop(fade);
    const def = M.scenes[name];
    if (!def) return;
    const ctx = A.ctx;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(def.level ?? 1, ctx.currentTime + Math.max(0.05, fade * 0.8));
    bus.connect(A.musicBus);
    const rev = ctx.createGain(); rev.gain.value = def.reverb ?? 0.35; bus.connect(rev); rev.connect(A.revIn);
    M.params = Object.assign({}, def.params || {});
    const s = { name, def, bus, i: 0, next: ctx.currentTime + 0.12, level: def.level ?? 1, data: {} };
    M.cur = s;
    def.init && def.init.call(s, s);
    if (!timer) timer = setInterval(pump, 25);
    pump();
  };
  M.stop = function (fade = 1.5) {
    const s = M.cur;
    if (!s) return;
    M.cur = null;
    const t = A.ctx.currentTime;
    s.bus.gain.cancelScheduledValues(t);
    s.bus.gain.setValueAtTime(Math.max(0.0001, s.bus.gain.value), t);
    s.bus.gain.linearRampToValueAtTime(0.0001, t + fade);
    s.def.stop && s.def.stop.call(s, s);
    setTimeout(() => { try { s.bus.disconnect(); } catch (e) {} }, fade * 1000 + 4000);
  };
  M.param = function (k, v) {
    M.params[k] = v;
    if (k === 'level' && M.cur && A.ready) {
      const t = A.ctx.currentTime, g = M.cur.bus.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t);
      g.linearRampToValueAtTime(Math.max(0.0001, (M.cur.def.level ?? 1) * v), t + 0.8);
    }
  };
  M.duck = function (level = 0.3, seconds = 1.5) {
    if (!A.ready) return;
    const g = A.musicBus.gain, t = A.ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.5 * level, t + 0.15);
    g.setValueAtTime(0.5 * level, t + seconds);
    g.linearRampToValueAtTime(0.5, t + seconds + 0.8);
  };
  LT.bus.on('audio:ready', () => { if (M.pending) { const p = M.pending; M.pending = null; M.play(p); } });

  /* ---------- the score ---------- */
  const P = () => M.params;
  const beat = (s) => 60 / (typeof s.def.bpm === 'function' ? s.def.bpm(M.params) : s.def.bpm);

  // Prelude: a low drone and a few sparks of a music box.
  M.define('prelude', {
    bpm: 50, div: 1, level: 0.9,
    step(i, t) {
      const b = beat(this);
      if (i % 8 === 0) I.pad(this.bus, t, [38, 45, 50, 57], b * 8.4, 0.9, { a: 3.5, r: 4.5, cut: 520 });
      if (i % 8 === 4) I.pad(this.bus, t, [62, 66], b * 4, 0.35, { a: 2.5, r: 3, cut: 900, wave: 'triangle' });
      if (Math.random() < 0.22) I.musicbox(this.bus, t + R(0, 0.3), U.pick([74, 76, 78, 81, 83, 86, 88]), 1, 0.5);
    },
  });

  // Menu: a slow parlor waltz in F.
  const W = { bass: [41, 38, 46, 36, 41, 38, 43, 41], chord: [[57, 60, 65], [57, 62, 65], [58, 62, 65], [55, 60, 64], [57, 60, 65], [57, 62, 65], [58, 62, 67], [57, 60, 65]],
    mel: [[[0, 72, 4], [4, 69, 2]], [[0, 74, 4], [4, 77, 2]], [[0, 74, 2], [2, 72, 2], [4, 70, 2]], [[0, 67, 6]], [[0, 69, 4], [4, 72, 2]], [[0, 77, 4], [4, 76, 2]], [[0, 74, 2], [2, 70, 2], [4, 67, 2]], [[0, 65, 6]]] };
  M.define('menu', {
    bpm: 88, div: 2, level: 0.8,
    step(i, t) {
      const st = i % 6, bar = Math.floor(i / 6) % 8, loop = Math.floor(i / 48), sp = beat(this) / 2;
      if (st === 0) I.piano(this.bus, t, W.bass[bar], sp * 4, 0.55);
      if (bar === 6 && st === 3) I.piano(this.bus, t, 36, sp * 3, 0.5);
      if (st === 2 || st === 4) W.chord[bar].forEach((n) => I.piano(this.bus, t, n, sp * 1.5, 0.2));
      W.mel[bar].forEach(([o, n, d]) => {
        if (o !== st) return;
        if (loop % 2 === 0) I.piano(this.bus, t, n, sp * d, 0.42);
        else { I.musicbox(this.bus, t, n + 12, sp * d, 0.6); I.piano(this.bus, t, n, sp * d, 0.18); }
      });
    },
  });

  // The Record: a lament in D minor; cello over a soft pad.
  const REC = {
    pad: [[50, 57, 62, 65], [46, 53, 58, 62], [45, 53, 57, 60], [48, 55, 60, 64], [50, 57, 62, 65], [43, 50, 55, 58], [46, 53, 58, 62], [45, 52, 57, 61]],
    root: [38, 34, 41, 36, 38, 43, 34, 33],
    mel: [[[0, 62, 6], [6, 64, 2]], [[0, 65, 6], [6, 62, 2]], [[0, 60, 4], [4, 57, 4]], [[0, 55, 6], [6, 57, 2]], [[0, 62, 4], [4, 65, 4]], [[0, 67, 6], [6, 65, 2]], [[0, 65, 4], [4, 62, 2], [6, 64, 2]], [[0, 61, 4], [4, 64, 4]]],
  };
  M.define('record', {
    bpm: 54, div: 2, level: 0.85, params: { cello: 1 },
    step(i, t) {
      const st = i % 8, bar = Math.floor(i / 8) % 8, cyc = Math.floor(i / 64), sp = beat(this) / 2;
      if (st === 0) {
        I.pad(this.bus, t, REC.pad[bar], sp * 8.2, 0.8, { a: 1.6, r: 2.2, cut: 760 });
        I.bass(this.bus, t, REC.root[bar] + 12, sp * 7, 0.45);
        I.piano(this.bus, t + R(0, 0.04), U.pick(REC.pad[bar]) + 24, sp * 3, 0.22);
        if (bar === 0) LT.audio.sfx('bell', { n: 38, g: 0.08, decay: 7 });
      }
      if (st === 4 && Math.random() < 0.45) I.piano(this.bus, t, U.pick(REC.pad[bar]) + 24, sp * 2, 0.16);
      if (cyc > 0 || i >= 0) {
        if ((P().cello ?? 1) > 0) REC.mel[bar].forEach(([o, n, d]) => { if (o === st) I.cello(this.bus, t, n, sp * d * 0.98, 0.8 * (P().cello ?? 1)); });
      }
    },
  });

  // The Spread: a jaunty swing in F. Marimba, pizzicato, brushes.
  const SP = {
    root: [41, 38, 43, 36, 46, 41, 43, 36],
    chord: [[57, 60, 65], [57, 62, 65], [58, 62, 65], [58, 60, 64], [58, 62, 65], [57, 60, 65], [59, 62, 65], [58, 60, 64]],
    mel: [[72, 0, 69, 72, 77, 0, 76, 74], [74, 0, 69, 74, 77, 74, 72, 0], [70, 0, 67, 70, 74, 0, 72, 70], [72, 70, 69, 67, 64, 0, 60, 0],
      [70, 0, 74, 77, 74, 0, 70, 74], [72, 0, 69, 72, 77, 72, 69, 0], [71, 74, 77, 74, 71, 0, 67, 0], [72, 0, 70, 67, 64, 67, 70, 76]],
  };
  M.define('spread', {
    bpm: 112, div: 4, level: 0.75, params: { melody: 1 },
    step(i, t) {
      const st = i % 16, bar = Math.floor(i / 16) % 8, loop = Math.floor(i / 128), sp = beat(this) / 4;
      const swing = st % 4 === 2 ? sp * 0.66 : 0, tt = t + swing;
      if (st === 0) I.pluck(this.bus, t, SP.root[bar], sp * 6, 0.9);
      if (st === 8) I.pluck(this.bus, t, SP.root[bar] + 7, sp * 6, 0.8);
      if (st === 14 && Math.random() < 0.7) I.pluck(this.bus, tt, SP.root[(bar + 1) % 8] + U.pick([-1, 1, 2]), sp * 2, 0.6);
      if (st === 6 || st === 14) SP.chord[bar].forEach((n) => I.pluck(this.bus, tt, n, sp * 1.5, 0.25));
      if (st === 4 || st === 12) I.brush(this.bus, t, 0.8);
      if (st % 2 === 0) I.hat(this.bus, tt, st % 4 === 0 ? 0.7 : 0.45);
      if (st === 0 || st === 8) I.kick(this.bus, t, 0.35);
      if (st % 2 === 0 && (P().melody ?? 1) > 0) {
        const n = SP.mel[bar][st / 2];
        if (n) { I.marimba(this.bus, tt, n, sp * 2, 0.8); if (loop % 2 === 1) I.musicbox(this.bus, tt, n + 12, sp * 2, 0.35); }
      }
    },
  });

  // The Table: a polka that speeds up as the family heats up.
  const PK = {
    chords: ['C', 'C', 'G', 'G', 'G', 'G', 'C', 'C', 'C', 'C', 'F', 'F', 'C', 'G', 'C', 'C'],
    oom: { C: [36, 43], G: [43, 38], F: [41, 36] },
    stab: { C: [60, 64, 67], G: [59, 62, 65], F: [60, 65, 69] },
    mel: [[76, 79, 76, 72], [67, 72, 76, 79], [77, 74, 71, 67], [74, 77, 81, 79], [77, 74, 77, 74], [71, 67, 71, 74], [72, 76, 79, 76], [72, 0, 72, 0],
      [76, 76, 77, 79], [81, 79, 77, 76], [77, 81, 84, 81], [77, 0, 69, 72], [76, 79, 84, 79], [77, 74, 71, 74], [72, 67, 64, 67], [72, 0, 0, 0]],
  };
  M.define('table', {
    bpm: (p) => 112 + (p.tension || 0) * 100, div: 2, level: 0.7, params: { tension: 0 },
    step(i, t) {
      const st = i % 4, bar = Math.floor(i / 4) % 16, sp = beat(this) / 2, ten = P().tension || 0;
      const ch = PK.chords[bar];
      if (st === 0 || st === 2) I.tuba(this.bus, t, PK.oom[ch][st / 2], sp * 0.9, 0.9);
      if (st === 1 || st === 3) PK.stab[ch].forEach((n) => I.accordion(this.bus, t, n, sp * 0.45, 0.45));
      const n = PK.mel[bar][st];
      const wob = ten > 0.8 ? R(-0.45, 0.45) * (ten - 0.8) * 5 : 0;
      if (n) {
        I.accordion(this.bus, t, n, sp * 0.85, 0.8, wob);
        if (ten > 0.55) I.accordion(this.bus, t, n + 12, sp * 0.6, 0.35, wob);
      }
      if (ten > 0.25 && (st === 1 || st === 3)) I.snare(this.bus, t, 0.5 + ten * 0.4);
      if (ten > 0.45) I.hat(this.bus, t, 0.6);
      if (ten > 0.75) I.clap(this.bus, t + sp * 0.5, 0.6);
      if (ten > 0.9 && Math.random() < 0.3) I.kick(this.bus, t + sp * 0.5, 0.5);
    },
  });

  // Grace: rolling piano in D-flat; a choir that rises when asked.
  const GR = {
    ch: [[49, 53, 56], [46, 49, 53], [42, 46, 49], [44, 48, 51], [49, 53, 56], [41, 44, 48], [42, 46, 49], [44, 49, 51]],
  };
  M.define('grace', {
    bpm: 66, div: 2, level: 0.85, reverb: 0.6, params: { swell: 0, melody: 0.4 },
    step(i, t) {
      const st = i % 8, bar = Math.floor(i / 8) % 8, sp = beat(this) / 2;
      let [r, th, f] = GR.ch[bar];
      if (bar === 7 && st >= 4) th = 48; // sus4 -> 3
      const pat = [r, f, r + 12, th + 12, f + 12, th + 12, r + 12, f];
      I.piano(this.bus, t + R(0, 0.012), pat[st], sp * 2.2, st === 0 ? 0.32 : 0.24);
      if (st === 0) {
        I.piano(this.bus, t, r - 12, sp * 8, 0.36);
        I.pad(this.bus, t, [r + 12, th + 12, f + 12], sp * 8.3, 0.55, { a: 2, r: 2.5, cut: 1100, wave: 'triangle' });
        const sw = P().swell || 0;
        if (sw > 0.02) I.choir(this.bus, t, [r + 12, th + 12, f + 12, r + 24], sp * 8.4, sw);
      }
      const mel = P().melody ?? 0.4;
      if ((st === 0 || st === 4 || st === 6) && Math.random() < mel) I.piano(this.bus, t + sp * 0.1, U.pick([r, th, f]) + 36, sp * 3, 0.2);
    },
  });

  // Leftovers: a music-box lullaby in G; at night it thins to a pad.
  const LO = {
    bass: [[0, 43], [0, 40], [0, 36], [0, 38], [0, 43], [0, 40], [0, 33], [0, 43]],
    bass2: { 6: [3, 38] },
    pad: [[55, 59, 62], [52, 55, 59], [52, 55, 60], [54, 57, 62], [55, 59, 62], [52, 55, 59], [52, 57, 60], [55, 59, 62]],
    mel: [[[0, 71, 2], [2, 74, 2], [4, 79, 2]], [[0, 78, 2], [2, 76, 2], [4, 71, 2]], [[0, 72, 2], [2, 76, 2], [4, 79, 2]], [[0, 78, 4], [4, 74, 2]],
      [[0, 71, 2], [2, 74, 2], [4, 79, 2]], [[0, 83, 2], [2, 81, 2], [4, 79, 2]], [[0, 81, 2], [2, 79, 2], [4, 78, 2]], [[0, 79, 6]]],
  };
  M.define('leftovers', {
    bpm: 72, div: 2, level: 0.85, reverb: 0.55, params: { night: 0 },
    step(i, t) {
      const st = i % 6, bar = Math.floor(i / 6) % 8, sp = beat(this) / 2, night = P().night || 0;
      if (st === 0) I.pad(this.bus, t, LO.pad[bar], sp * 6.3, 0.5 + night * 0.4, { a: 1.2, r: 2, cut: 800, wave: 'triangle' });
      if (Math.random() < 1 - night * 0.85) {
        LO.mel[bar].forEach(([o, n, d]) => { if (o === st) I.musicbox(this.bus, t, n, sp * d, 0.75); });
        if (st === 0) I.musicbox(this.bus, t, LO.bass[bar][1] + 12, sp * 4, 0.5);
        if (LO.bass2[bar] && LO.bass2[bar][0] === st) I.musicbox(this.bus, t, LO.bass2[bar][1] + 12, sp * 3, 0.5);
      } else if (Math.random() < 0.2) I.musicbox(this.bus, t, U.pick([79, 83, 86, 88, 91]), 1, 0.35);
    },
  });

  M.define('silence', { bpm: 60, div: 1, level: 0, step() {} });
})();
