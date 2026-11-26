/* The Long Table — audio engine. Everything you hear is synthesized here. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util;
  const A = (LT.audio = { ready: false, muted: false, ctx: null });
  const DUMMY = { stop() {}, set() {}, playing: false };
  let ctx = null;

  A.mtof = (n) => 440 * Math.pow(2, (n - 69) / 12);

  try { A.muted = !!U.store.read().muted; } catch (e) {}

  function makeIR(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const k = i / len;
        // darken the tail: one-pole lowpass whose cutoff falls over time
        const a = 0.35 + 0.6 * k;
        lp = lp * a + (Math.random() * 2 - 1) * (1 - a);
        d[i] = lp * Math.pow(1 - k, decay) * (i < rate * 0.01 ? i / (rate * 0.01) : 1);
      }
    }
    return buf;
  }
  function makeNoise(kind) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    }
    return buf;
  }

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = A.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return; }
    A.master = ctx.createGain();
    A.master.gain.value = A.muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    A.master.connect(comp); comp.connect(ctx.destination);
    A.reverb = ctx.createConvolver();
    A.reverb.buffer = makeIR(3.4, 2.4);
    A.revIn = ctx.createGain();
    const revOut = ctx.createGain(); revOut.gain.value = 0.55;
    A.revIn.connect(A.reverb); A.reverb.connect(revOut); revOut.connect(A.master);
    A.sfxBus = ctx.createGain(); A.sfxBus.gain.value = 0.85; A.sfxBus.connect(A.master);
    A.musicBus = ctx.createGain(); A.musicBus.gain.value = 0.5; A.musicBus.connect(A.master);
    A.buf = { white: makeNoise('white'), pink: makeNoise('pink'), brown: makeNoise('brown') };
    A.ready = true;
    if (ctx.state === 'suspended') ctx.resume();
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    LT.bus && LT.bus.emit('audio:ready');
  };

  A.now = () => (ctx ? ctx.currentTime : 0);

  A.setMuted = function (m) {
    A.muted = !!m;
    const s = U.store.read(); s.muted = A.muted; U.store.write(s);
    if (ctx) {
      const t = ctx.currentTime;
      A.master.gain.cancelScheduledValues(t);
      A.master.gain.setValueAtTime(A.master.gain.value, t);
      A.master.gain.linearRampToValueAtTime(A.muted ? 0 : 0.9, t + 0.25);
    }
    LT.bus && LT.bus.emit('audio:muted', A.muted);
  };
  A.toggle = () => A.setMuted(!A.muted);

  /* ---------- primitives ---------- */
  function envelope(param, t, dur, o) {
    const peak = Math.max(0.00011, o.g ?? 0.2), a = Math.max(0.001, o.a ?? 0.005);
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(peak, t + a);
    if (o.r != null) {
      const holdEnd = Math.max(t + a, t + dur - o.r);
      param.setValueAtTime(peak, holdEnd);
      param.exponentialRampToValueAtTime(0.0001, t + dur);
    } else {
      param.exponentialRampToValueAtTime(0.0001, t + dur);
    }
  }
  function route(node, o) {
    let n = node;
    if (o.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner(); p.pan.value = U.clamp(o.pan, -1, 1); n.connect(p); n = p;
    }
    n.connect(o.dest || A.sfxBus);
    if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev; n.connect(s); s.connect(A.revIn); }
    return n;
  }
  function filters(node, list, t, dur) {
    let n = node;
    for (const fd of list) {
      const f = ctx.createBiquadFilter();
      f.type = fd.type || 'lowpass';
      f.frequency.setValueAtTime(fd.f, t);
      if (fd.f2) f.frequency.exponentialRampToValueAtTime(Math.max(10, fd.f2), t + (fd.dur ?? dur));
      f.Q.value = fd.q ?? 0.8;
      if (fd.gain != null) f.gain.value = fd.gain;
      n.connect(f); n = f;
    }
    return n;
  }
  /** tone({f, f2, glide, type, t, dur, a, r, g, filter|filters, pan, rev, dest, detune, vib:{rate,depth}}) */
  A.tone = function (o) {
    if (!A.ready) return null;
    const nyq = ctx.sampleRate * 0.45;
    if (!(o.f > 0) || o.f >= nyq) return null;
    if (o.f2 && o.f2 >= nyq) o = Object.assign({}, o, { f2: nyq * 0.98 });
    const t = o.t ?? ctx.currentTime, dur = o.dur ?? 0.3;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t + (o.glide ?? dur));
    if (o.detune) osc.detune.value = o.detune;
    if (o.vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = o.vib.rate || 5; lg.gain.value = o.vib.depth || 4;
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.1);
    }
    const g = ctx.createGain();
    envelope(g.gain, t, dur, o);
    const f = filters(osc, o.filters || (o.filter ? [o.filter] : []), t, dur);
    f.connect(g);
    route(g, o);
    osc.start(t); osc.stop(t + dur + 0.05);
    return osc;
  };
  /** noise({color, t, dur, a, r, g, filter|filters, pan, rev, dest}) */
  A.noise = function (o) {
    if (!A.ready) return null;
    const t = o.t ?? ctx.currentTime, dur = o.dur ?? 0.3;
    const src = ctx.createBufferSource();
    src.buffer = A.buf[o.color || 'white']; src.loop = true;
    if (o.rate) src.playbackRate.value = o.rate;
    const f = filters(src, o.filters || (o.filter ? [o.filter] : []), t, dur);
    const g = ctx.createGain();
    envelope(g.gain, t, dur, o);
    f.connect(g); route(g, o);
    src.start(t, Math.random() * 2.5); src.stop(t + dur + 0.05);
    return src;
  };

  /** Build a looping noise voice; returns {src, out(gain)} */
  function loopNoise(color, filterList, gainVal, dest) {
    const src = ctx.createBufferSource();
    src.buffer = A.buf[color]; src.loop = true;
    const f = filters(src, filterList, ctx.currentTime, 1);
    const g = ctx.createGain(); g.gain.value = gainVal;
    f.connect(g); g.connect(dest);
    src.start(ctx.currentTime, Math.random() * 2.5);
    return { src, g };
  }
  /** Generic loop handle with master gain + fade in/out */
  function makeLoop(level, build, rev) {
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), ctx.currentTime + 0.25);
    out.connect(A.sfxBus);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; out.connect(s); s.connect(A.revIn); }
    const parts = build(out) || {};
    let alive = true;
    const h = {
      playing: true,
      set(v, time = 0.15) {
        if (!alive) return;
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t);
        out.gain.linearRampToValueAtTime(Math.max(0.0001, level * v), t + time);
        parts.set && parts.set(v);
      },
      stop(fade = 0.3) {
        if (!alive) return; alive = false; h.playing = false;
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + fade);
        parts.timer && clearInterval(parts.timer);
        setTimeout(() => { try { (parts.nodes || []).forEach((n) => n.stop && n.stop()); out.disconnect(); } catch (e) {} }, fade * 1000 + 120);
      },
    };
    return h;
  }

  /* ---------- the sound library ---------- */
  const R = U.rand;
  const S = {};
  S.match = () => {
    const t = A.now();
    A.noise({ t, dur: 0.14, g: 0.5, filters: [{ type: 'bandpass', f: 4200, f2: 1400, q: 1.4 }], pan: -0.1 });
    A.noise({ t: t + 0.05, dur: 0.09, g: 0.35, filters: [{ type: 'bandpass', f: 3000, f2: 900, q: 1.2 }] });
    A.noise({ t: t + 0.12, dur: 0.7, a: 0.06, g: 0.45, filters: [{ type: 'lowpass', f: 300, f2: 2600, dur: 0.18 }], rev: 0.2 });
    for (let i = 0; i < 6; i++) A.noise({ t: t + 0.15 + R(0.5), dur: 0.02, g: R(0.08, 0.2), filters: [{ type: 'highpass', f: 2500 }] });
  };
  S.whoomp = () => {
    const t = A.now();
    A.noise({ t, dur: 0.9, a: 0.12, g: 0.4, color: 'brown', filters: [{ type: 'lowpass', f: 200, f2: 1400, dur: 0.3 }], rev: 0.3 });
    A.tone({ t, f: 80, f2: 160, dur: 0.6, a: 0.1, g: 0.25 });
  };
  S.clink = (o = {}) => {
    const t = A.now() + (o.delay || 0), f0 = o.f || R(1650, 2100), g = o.g || 0.16;
    [[1, 1, 1.4], [2.76, 0.42, 0.9], [5.4, 0.2, 0.5], [8.93, 0.1, 0.3]].forEach(([m, a, d]) =>
      A.tone({ t, f: f0 * m, dur: d, a: 0.002, g: g * a, pan: o.pan, rev: 0.35 }));
    A.noise({ t, dur: 0.012, g: 0.12, filters: [{ type: 'highpass', f: 5000 }] });
  };
  S.ting = (o = {}) => S.clink({ f: o.f || 2350, g: o.g || 0.13, delay: o.delay, pan: o.pan });
  S.pop = (o = {}) => {
    const t = A.now();
    A.tone({ t, f: o.f || 900, f2: 140, dur: 0.08, a: 0.001, g: o.g || 0.35, pan: o.pan });
    A.noise({ t, dur: 0.015, g: 0.18, filters: [{ type: 'bandpass', f: 2000, q: 1 }], pan: o.pan });
  };
  S.bounce = (o = {}) => {
    const t = A.now(), p = o.p ?? R(), f = 260 + p * 900;
    A.tone({ t, f, dur: 0.28, a: 0.002, g: (o.g || 0.22), pan: o.pan, rev: 0.12 });
    A.tone({ t, f: f * 3.98, dur: 0.06, a: 0.001, g: (o.g || 0.22) * 0.35, pan: o.pan });
    A.noise({ t, dur: 0.01, g: 0.08, filters: [{ type: 'lowpass', f: 1800 }], pan: o.pan });
  };
  S.pluck = (o = {}) => {
    const t = A.now(), f = A.mtof(o.n ?? 64);
    A.tone({ t, f, type: 'triangle', dur: o.dur || 0.5, a: 0.002, g: o.g || 0.25, filter: { type: 'lowpass', f: 3500, f2: 400, dur: 0.3 }, pan: o.pan, rev: 0.2 });
  };
  S.whoosh = (o = {}) => {
    const t = A.now(), d = o.dur || 0.7;
    A.noise({ t, dur: d, a: d * 0.45, g: o.g || 0.28, color: 'pink', filters: [{ type: 'bandpass', f: o.low || 250, f2: o.high || 2200, dur: d * 0.6, q: 0.9 }], pan: o.pan, rev: 0.2 });
  };
  S.thud = (o = {}) => {
    const t = A.now();
    A.tone({ t, f: 130, f2: 42, dur: 0.28, a: 0.002, g: o.g || 0.6 });
    A.noise({ t, dur: 0.12, g: 0.25, color: 'brown', filters: [{ type: 'lowpass', f: 300 }] });
  };
  S.splat = (o = {}) => {
    const t = A.now();
    A.noise({ t, dur: 0.32, a: 0.004, g: o.g || 0.5, color: 'pink', filters: [{ type: 'lowpass', f: 1400, f2: 180 }] });
    A.tone({ t, f: 240, f2: 60, dur: 0.18, g: 0.3, type: 'sine' });
    for (let i = 0; i < 3; i++) A.tone({ t: t + 0.25 + i * R(0.09, 0.16), f: R(500, 800), f2: R(900, 1300), dur: 0.05, g: 0.06 });
  };
  S.crack = (o = {}) => {
    const t = A.now();
    [0, 0.011, 0.027, 0.05].forEach((d, i) =>
      A.noise({ t: t + d, dur: 0.025, a: 0.0008, g: (o.g || 0.7) * (1 - i * 0.2), filters: [{ type: 'highpass', f: 1500 }, { type: 'peaking', f: 3200, q: 2, gain: 8 }] }));
    A.tone({ t, f: 2200, f2: 500, dur: 0.05, g: 0.12 });
  };
  S.boom = (o = {}) => {
    const t = A.now(), g = o.g || 0.9;
    A.noise({ t, dur: 2.6, a: 0.005, g, color: 'brown', filters: [{ type: 'lowpass', f: 3500, f2: 70, dur: 2 }], rev: 0.3 });
    A.noise({ t, dur: 0.5, a: 0.002, g: g * 0.6, color: 'white', filters: [{ type: 'lowpass', f: 6000, f2: 400 }] });
    A.tone({ t, f: 75, f2: 26, dur: 1.8, a: 0.004, g: g * 0.9 });
    for (let i = 0; i < 26; i++) A.noise({ t: t + 0.1 + R(1.8), dur: R(0.01, 0.04), g: R(0.05, 0.22), filters: [{ type: 'highpass', f: R(1200, 4000) }], pan: R(-0.8, 0.8) });
  };
  S.scratch = (o = {}) => {
    if (!A.ready) return;
    const t = A.now();
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    const pts = [[0, 300], [0.08, 1400], [0.16, 260], [0.26, 1100], [0.42, 120]];
    pts.forEach(([d, f], i) => (i ? osc.frequency.exponentialRampToValueAtTime(f, t + d) : osc.frequency.setValueAtTime(f, t)));
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.8;
    const g = ctx.createGain(); envelope(g.gain, t, 0.48, { g: o.g || 0.3, a: 0.005, r: 0.08 });
    osc.connect(bp); bp.connect(g); g.connect(A.sfxBus);
    osc.start(t); osc.stop(t + 0.5);
    A.noise({ t, dur: 0.45, g: 0.18, filters: [{ type: 'bandpass', f: 2500, f2: 600, q: 1.5 }] });
  };
  S.gobble = (o = {}) => {
    const t = A.now(), n = 13, base = o.f || R(620, 760);
    for (let i = 0; i < n; i++) {
      const k = i / n, f = base * (1 - k * 0.38) * (i % 2 ? 1.12 : 0.92);
      A.tone({ t: t + i * 0.052, f, f2: f * 0.78, dur: 0.05, a: 0.004, type: 'sawtooth', g: (o.g || 0.22) * (1 - k * 0.4), filters: [{ type: 'bandpass', f: 1250, q: 2.5 }, { type: 'peaking', f: 2600, q: 3, gain: 6 }], pan: o.pan });
    }
  };
  function bellTone(t, f, g, decay, pan, partials) {
    (partials || [[1, 1], [2.0, 0.5], [3.01, 0.22], [4.2, 0.1]]).forEach(([m, a], i) =>
      A.tone({ t, f: f * m, dur: decay / (1 + i * 0.6), a: 0.002, g: g * a, pan, rev: 0.45 }));
  }
  S.chime = (o = {}) => {
    const t = A.now(), base = o.n ?? 79;
    [0, 4, 7, 12, 16].forEach((iv, i) => bellTone(t + i * 0.085, A.mtof(base + iv), 0.09, 1.8, (i - 2) * 0.2));
  };
  S.secret = () => {
    const t = A.now();
    [0, 7, 12, 19, 24].forEach((iv, i) => bellTone(t + i * 0.06, A.mtof(72 + iv), 0.08, 1.6, (i - 2) * 0.25));
    A.noise({ t, dur: 1.2, a: 0.4, g: 0.05, filters: [{ type: 'highpass', f: 6000 }], rev: 0.5 });
  };
  S.bell = (o = {}) => {
    const t = A.now(), f = A.mtof(o.n ?? 38);
    bellTone(t, f, o.g || 0.22, o.decay || 6, 0, [[0.5, 0.6], [1, 1], [1.19, 0.5], [1.5, 0.3], [2, 0.35], [2.66, 0.15], [3.01, 0.1]]);
  };
  S.tick = (o = {}) => A.tone({ f: o.f || 2600, dur: 0.025, a: 0.001, g: o.g || 0.05, type: 'triangle' });
  S.type = () => {
    const t = A.now();
    A.noise({ t, dur: 0.03, a: 0.001, g: 0.15, filters: [{ type: 'bandpass', f: R(2000, 3200), q: 1.2 }] });
    A.tone({ t, f: R(150, 200), dur: 0.03, g: 0.08 });
  };
  S.paper = (o = {}) => {
    if (!A.ready) return;
    const t = A.now(), d = o.dur || 0.45;
    const src = ctx.createBufferSource(); src.buffer = A.buf.white;
    const f = filters(src, [{ type: 'bandpass', f: 3200, q: 0.6 }, { type: 'highshelf', f: 6000, gain: -6 }], t, d);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    for (let i = 0; i < 9; i++) g.gain.linearRampToValueAtTime(R(0.02, 0.2) * (o.g || 1), t + (i + 1) * (d / 10));
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    f.connect(g); g.connect(A.sfxBus); src.start(t, R(2)); src.stop(t + d + 0.05);
  };
  S.pour = (o = {}) => {
    const t = A.now(), n = o.n || 7;
    for (let i = 0; i < n; i++) A.tone({ t: t + i * R(0.08, 0.13), f: 180 + i * 30, f2: 300 + i * 45, dur: 0.09, a: 0.01, g: 0.22, filter: { type: 'lowpass', f: 900 } });
    A.noise({ t, dur: n * 0.11, a: 0.05, g: 0.06, color: 'pink', filters: [{ type: 'lowpass', f: 700 }] });
  };
  S.spray = (o = {}) => A.noise({ dur: o.dur || 0.35, a: 0.015, r: 0.08, g: o.g || 0.16, filters: [{ type: 'highpass', f: 3500 }, { type: 'peaking', f: 7000, q: 1, gain: 6 }] });
  S.crunch = (o = {}) => {
    const t = A.now();
    for (let i = 0; i < (o.n || 7); i++) A.noise({ t: t + R(0.22), dur: R(0.01, 0.04), a: 0.001, g: R(0.1, 0.3), filters: [{ type: 'bandpass', f: R(1200, 4500), q: 1.5 }], pan: o.pan });
  };
  S.squish = () => {
    const t = A.now();
    A.tone({ t, f: 320, f2: 85, dur: 0.55, a: 0.03, g: 0.3, vib: { rate: 13, depth: 30 }, filter: { type: 'lowpass', f: 900 } });
    A.noise({ t, dur: 0.45, a: 0.05, g: 0.14, color: 'pink', filters: [{ type: 'lowpass', f: 600 }] });
    A.tone({ t: t + 0.48, f: 160, f2: 55, dur: 0.14, g: 0.45 });
  };
  S.bark = (o = {}) => {
    const t = A.now();
    [0, 0.22].slice(0, o.n || 2).forEach((d) => {
      A.tone({ t: t + d, f: 330, f2: 190, dur: 0.13, a: 0.008, type: 'sawtooth', g: 0.3, filters: [{ type: 'bandpass', f: 750, q: 1.6 }], pan: o.pan });
      A.noise({ t: t + d, dur: 0.11, a: 0.005, g: 0.22, filters: [{ type: 'bandpass', f: 1100, q: 1.2 }], pan: o.pan });
    });
  };
  S.cheer = (o = {}) => {
    const t = A.now(), d = o.dur || 2.2;
    A.noise({ t, dur: d, a: 0.3, r: 1, g: o.g || 0.18, color: 'pink', filters: [{ type: 'bandpass', f: 1100, q: 0.5 }], rev: 0.3 });
    for (let i = 0; i < 30; i++) A.noise({ t: t + R(d * 0.8), dur: 0.02, a: 0.001, g: R(0.05, 0.16), filters: [{ type: 'bandpass', f: R(1200, 2400), q: 1.4 }], pan: R(-0.8, 0.8) });
  };
  S.blow = (o = {}) => A.noise({ dur: o.dur || 1, a: 0.12, r: 0.4, g: o.g || 0.32, color: 'pink', filters: [{ type: 'bandpass', f: 650, q: 0.5 }], rev: 0.1 });
  S.snuff = () => {
    const t = A.now();
    A.noise({ t, dur: 0.1, a: 0.004, g: 0.3, filters: [{ type: 'bandpass', f: 1200, q: 0.8 }] });
    A.noise({ t: t + 0.05, dur: 1.4, a: 0.05, g: 0.035, filters: [{ type: 'highpass', f: 5500 }], rev: 0.4 });
  };
  S.swell = (o = {}) => {
    const t = A.now(), d = o.dur || 1.6;
    A.noise({ t, dur: d, a: d * 0.95, r: 0.04, g: o.g || 0.22, filters: [{ type: 'bandpass', f: 1200, f2: 9000, q: 0.8 }], rev: 0.3 });
  };
  S.heartbeat = () => {
    const t = A.now();
    A.tone({ t, f: 70, f2: 38, dur: 0.16, a: 0.005, g: 0.7 });
    A.tone({ t: t + 0.24, f: 60, f2: 34, dur: 0.18, a: 0.005, g: 0.5 });
  };
  S.ding = () => bellTone(A.now(), 2093, 0.12, 1.6, 0, [[1, 1], [2.4, 0.3], [3.9, 0.12]]);
  S.boing = () => A.tone({ f: 180, f2: 520, dur: 0.35, a: 0.005, g: 0.3, vib: { rate: 22, depth: 60 } });
  S.sad = () => {
    const t = A.now();
    [[67, 0], [66, 0.32], [65, 0.64], [64, 0.96]].forEach(([n, d], i) =>
      A.tone({ t: t + d, f: A.mtof(n - 12), dur: i === 3 ? 1.2 : 0.34, a: 0.02, type: 'sawtooth', g: 0.12, vib: i === 3 ? { rate: 6, depth: 10 } : null, filter: { type: 'lowpass', f: 1200 } }));
  };
  S.tada = () => {
    const t = A.now();
    [60, 64, 67, 72].forEach((n, i) => A.tone({ t: t + i * 0.07, f: A.mtof(n), dur: i === 3 ? 1.0 : 0.2, a: 0.01, type: 'sawtooth', g: 0.08, filter: { type: 'lowpass', f: 2600 }, rev: 0.2 }));
  };

  /* ---------- loops ---------- */
  const L = {};
  L.fire = (o = {}) => makeLoop(o.g || 0.5, (out) => {
    const rumble = loopNoise('brown', [{ type: 'lowpass', f: 380 }], 0.5, out);
    const hiss = loopNoise('pink', [{ type: 'bandpass', f: 2200, q: 0.4 }], 0.04, out);
    const timer = setInterval(() => {
      if (!A.ready || Math.random() > 0.55) return;
      A.noise({ dur: R(0.004, 0.03), a: 0.0006, g: R(0.04, 0.3) * (o.g || 0.5), filters: [{ type: 'highpass', f: R(900, 3600) }], pan: R(-0.5, 0.5), dest: out });
    }, 55);
    return { nodes: [rumble.src, hiss.src], timer };
  });
  L.sizzle = (o = {}) => makeLoop(o.g || 0.35, (out) => {
    const hiss = loopNoise('white', [{ type: 'highpass', f: 3000 }, { type: 'peaking', f: 6000, q: 1, gain: 4 }], 0.15, out);
    const timer = setInterval(() => {
      if (!A.ready) return;
      for (let i = 0; i < 3; i++) A.noise({ t: A.now() + R(0.05), dur: R(0.003, 0.012), a: 0.0005, g: R(0.05, 0.3), filters: [{ type: 'highpass', f: R(2000, 6000) }], dest: out });
    }, 40);
    return { nodes: [hiss.src], timer };
  });
  L.torch = (o = {}) => makeLoop(o.g || 0.4, (out) => {
    const roar = loopNoise('pink', [{ type: 'bandpass', f: 700, q: 0.5 }], 0.5, out);
    const hiss = loopNoise('white', [{ type: 'highpass', f: 5000 }], 0.06, out);
    return { nodes: [roar.src, hiss.src] };
  });
  L.wind = (o = {}) => makeLoop(o.g || 0.35, (out) => {
    const src = ctx.createBufferSource(); src.buffer = A.buf.brown; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.9;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 260;
    lfo.connect(lg); lg.connect(bp.frequency);
    const g = ctx.createGain(); g.gain.value = 0.9;
    src.connect(bp); bp.connect(g); g.connect(out);
    const s2 = loopNoise('pink', [{ type: 'bandpass', f: 1800, q: 3 }], 0.05, out);
    src.start(); lfo.start();
    return { nodes: [src, lfo, s2.src] };
  }, 0.2);
  L.murmur = (o = {}) => makeLoop(o.g || 0.35, (out) => {
    const nodes = [];
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(out);
    for (let i = 0; i < (o.voices || 7); i++) {
      const src = ctx.createBufferSource(); src.buffer = A.buf.pink; src.loop = true;
      const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = R(350, 900); f1.Q.value = R(4, 7);
      const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = R(1200, 2400); f2.Q.value = R(5, 9);
      const g = ctx.createGain(); g.gain.value = 0;
      const syl = ctx.createOscillator(); syl.type = 'sine'; syl.frequency.value = R(3.2, 6.5);
      const sg = ctx.createGain(); sg.gain.value = R(0.6, 1.1);
      syl.connect(sg); sg.connect(g.gain);
      const fl = ctx.createOscillator(); fl.frequency.value = R(0.2, 0.7);
      const fg = ctx.createGain(); fg.gain.value = R(120, 300); fl.connect(fg); fg.connect(f1.frequency);
      src.connect(f1); f1.connect(g); src.connect(f2); f2.connect(g); g.connect(lp);
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) { pan.pan.value = R(-0.7, 0.7); }
      src.start(0, R(2.5)); syl.start(); fl.start();
      nodes.push(src, syl, fl);
    }
    return { nodes };
  }, 0.15);
  L.alarm = (o = {}) => makeLoop(o.g || 0.12, (out) => {
    const osc = ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = 3150;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    const g = ctx.createGain(); g.gain.value = 0;
    osc.connect(lp); lp.connect(g); g.connect(out); osc.start();
    const pattern = () => {
      const t = A.now() + 0.02;
      for (let i = 0; i < 3; i++) {
        g.gain.setValueAtTime(0, t + i);
        g.gain.linearRampToValueAtTime(1, t + i + 0.01);
        g.gain.setValueAtTime(1, t + i + 0.5);
        g.gain.linearRampToValueAtTime(0, t + i + 0.51);
      }
    };
    pattern();
    const timer = setInterval(pattern, 4500);
    return { nodes: [osc], timer };
  });
  L.ringtone = (o = {}) => makeLoop(o.g || 0.1, (out) => {
    const seq = [76, 79, 84, 79, 76, 79, 84, 88, null, 84, 83, 79, null, null, null, null];
    let i = 0;
    const timer = setInterval(() => {
      const n = seq[i++ % seq.length];
      if (n && A.ready) A.tone({ f: A.mtof(n), dur: 0.1, a: 0.003, type: 'square', g: 0.5, filter: { type: 'lowpass', f: 3500 }, dest: out });
    }, 105);
    return { timer };
  });

  /* ---------- public API ---------- */
  A.sfx = function (name, o) {
    if (L[name]) {
      if (!A.ready) return DUMMY;
      try { return L[name](o || {}); } catch (e) { console.warn('sfx', name, e); return DUMMY; }
    }
    if (!A.ready || A.muted) return;
    const fn = S[name];
    if (!fn) { console.warn('no sfx', name); return; }
    try { fn(o || {}); } catch (e) { console.warn('sfx', name, e); }
  };
  A.names = () => Object.keys(S).concat(Object.keys(L));
  /** Play one note on a score instrument right now: A.note('musicbox', 76, 1, 0.6) */
  A.note = (inst, n, dur = 1, v = 0.6, delay = 0) => {
    if (!A.ready || A.muted || !LT.music || !LT.music.instruments[inst]) return;
    try { LT.music.instruments[inst](A.sfxBus, ctx.currentTime + delay, n, dur, v); } catch (e) { console.warn(e); }
  };
})();
