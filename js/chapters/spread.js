/* II. The Spread — the strange true stories of the food.
   A candlelit still-life table. Each dish opens into a hands-on toy and its true story. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, S = U.svg, A = LT.audio;
  const RM = U.reducedMotion;
  const TAU = Math.PI * 2;
  const R = U.rand, clamp = U.clamp, lerp = U.lerp;

  LT.defineEgg('pegleg', 'Peg-Leg Webb would be proud', 'Bounce fifty cranberries.');
  LT.defineEgg('vanitas', 'Vanitas', 'Every Dutch still life has one.');
  LT.defineEgg('enoughgravy', 'Enough gravy', 'It is possible. Once.');
  LT.defineEgg('cleanplate', 'Clean plate club', 'Taste everything on the table.');
  LT.defineEgg('learned', 'Learned the hard way', 'Burn the driveway, then do it right.');

  /* ---------- little sounds of our own ---------- */
  const snd = {
    slice() { A.noise({ dur: 0.17, a: 0.01, g: 0.2, filters: [{ type: 'bandpass', f: 2600, f2: 5600, q: 1.3 }] }); },
    plop(p = 0.5) { A.tone({ f: 200 + p * 200, f2: 80, dur: 0.13, a: 0.004, g: 0.26 }); A.noise({ dur: 0.05, g: 0.07, filters: [{ type: 'lowpass', f: 900 }] }); },
    tick() { A.tone({ f: R(1500, 1900), dur: 0.018, a: 0.001, g: 0.05, type: 'square', filter: { type: 'lowpass', f: 3200 } }); },
    stretch(v) { A.tone({ f: 110 + v * 80, f2: 150 + v * 140, dur: 0.2, a: 0.04, g: 0.045, type: 'triangle', filter: { type: 'lowpass', f: 650 } }); },
    snap() { A.tone({ f: 820, f2: 260, dur: 0.06, a: 0.001, g: 0.07 }); },
    chomp() { const t = A.now(); [0, 0.13, 0.26].forEach((d) => A.noise({ t: t + d, dur: 0.07, a: 0.003, g: 0.2, filters: [{ type: 'lowpass', f: 1200 }] })); },
    shake() { A.noise({ dur: 0.12, a: 0.005, g: 0.12, color: 'brown', filters: [{ type: 'lowpass', f: 500 }] }); A.tone({ f: 140, f2: 90, dur: 0.1, g: 0.18 }); },
    fizz() { A.noise({ dur: 0.5, a: 0.02, g: 0.1, filters: [{ type: 'highpass', f: 4000 }] }); },
    yawn() { const t = A.now(); A.tone({ t, f: 330, f2: 170, dur: 1.6, a: 0.4, g: 0.06, type: 'sawtooth', filters: [{ type: 'bandpass', f: 700, q: 2 }], vib: { rate: 4, depth: 8 } }); A.noise({ t, dur: 1.6, a: 0.5, g: 0.06, color: 'pink', filters: [{ type: 'bandpass', f: 600, q: 1 }] }); },
  };

  /* ---------- a scope: like the chapter api, but for one open dish ---------- */
  function makeScope() {
    const c = [];
    const s = {
      alive: true,
      on(t, ty, fn, o) { t.addEventListener(ty, fn, o); c.push(() => t.removeEventListener(ty, fn, o)); return fn; },
      frame(fn) { const off = LT.loop.add((dt, t) => s.alive && fn(dt, t)); c.push(off); return off; },
      timeout(fn, ms) { const id = setTimeout(() => s.alive && fn(), ms); c.push(() => clearTimeout(id)); return id; },
      interval(fn, ms) { const id = setInterval(() => s.alive && fn(), ms); c.push(() => clearInterval(id)); return id; },
      sound(h) { if (h && h.stop) c.push(() => h.stop(0.3)); return h; },
      cleanup(fn) { c.push(fn); },
      wait(ms) { return new Promise((r) => s.timeout(r, ms)); },
      destroy() { if (!s.alive) return; s.alive = false; c.reverse().forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); },
    };
    return s;
  }

  /* ---------- a canvas with a virtual coordinate system ("contain" fit) ---------- */
  function vcanvas(host, VW, VH, sc, cls) {
    const cv = el('canvas', { class: 'sp-canvas' + (cls ? ' ' + cls : '') });
    host.appendChild(cv);
    const cx = cv.getContext('2d');
    const v = { cv, cx, VW, VH, k: 1, ox: 0, oy: 0, W: 1, H: 1, dpr: 1, ptr: { x: VW / 2, y: VH / 2, down: false, inside: false } };
    function resize() {
      const r = host.getBoundingClientRect();
      v.dpr = Math.min(2, devicePixelRatio || 1);
      v.W = Math.max(1, r.width); v.H = Math.max(1, r.height);
      cv.width = Math.round(v.W * v.dpr); cv.height = Math.round(v.H * v.dpr);
      v.k = Math.min(v.W / VW, v.H / VH);
      v.ox = (v.W - VW * v.k) / 2; v.oy = (v.H - VH * v.k) / 2;
    }
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro && ro.observe(host);
    sc.cleanup(() => { ro && ro.disconnect(); cv.remove(); });
    v.screen = () => { cx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0); };
    v.begin = (bg) => {
      cx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
      cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
      if (bg) { cx.fillStyle = bg; cx.fillRect(0, 0, v.W, v.H); } else cx.clearRect(0, 0, v.W, v.H);
      cx.setTransform(v.dpr * v.k, 0, 0, v.dpr * v.k, v.dpr * v.ox, v.dpr * v.oy);
    };
    // extents of the visible canvas in virtual units (for backgrounds that bleed)
    v.ext = () => ({ x0: -v.ox / v.k, y0: -v.oy / v.k, x1: (v.W - v.ox) / v.k, y1: (v.H - v.oy) / v.k });
    v.toV = (clientX, clientY) => { const r = cv.getBoundingClientRect(); return { x: (clientX - r.left - v.ox) / v.k, y: (clientY - r.top - v.oy) / v.k }; };
    v.toScreen = (x, y) => { const r = cv.getBoundingClientRect(); return { x: r.left + v.ox + x * v.k, y: r.top + v.oy + y * v.k }; };
    v.input = (h) => {
      let id = null;
      sc.on(cv, 'pointerdown', (e) => {
        id = e.pointerId;
        try { cv.setPointerCapture(id); } catch (_) {}
        const p = v.toV(e.clientX, e.clientY);
        Object.assign(v.ptr, p, { down: true, inside: true, type: e.pointerType });
        h.down && h.down(p, e);
        e.preventDefault();
      });
      sc.on(cv, 'pointermove', (e) => {
        const p = v.toV(e.clientX, e.clientY);
        Object.assign(v.ptr, p, { inside: true, type: e.pointerType });
        if (id !== null) h.move && h.move(p, e); else h.hover && h.hover(p, e);
      });
      const up = (e) => {
        if (id === null) return;
        id = null;
        const p = v.toV(e.clientX, e.clientY);
        v.ptr.down = false;
        if (e.pointerType !== 'mouse') v.ptr.inside = false;
        h.up && h.up(p, e);
      };
      sc.on(cv, 'pointerup', up);
      sc.on(cv, 'pointercancel', up);
      sc.on(cv, 'pointerleave', () => { if (id === null) v.ptr.inside = false; });
    };
    return v;
  }

  // canvas drawing helpers
  function ell(cx, x, y, rx, ry, rot = 0) { cx.beginPath(); cx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
  function rr(cx, x, y, w, h, r) { cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, r); else cx.rect(x, y, w, h); }
  function radial(cx, x, y, r, stops, x0, y0) {
    const g = cx.createRadialGradient(x0 ?? x, y0 ?? y, 0, x, y, r);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function linear(cx, x0, y0, x1, y1, stops) {
    const g = cx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
    const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
    const bl = Math.round(lerp(pa & 255, pb & 255, t));
    return `rgb(${r},${g},${bl})`;
  }
  function ramp(stops, t) {
    // stops: [[t, '#hex'], ...] sorted
    if (t <= stops[0][0]) return mix(stops[0][1], stops[0][1], 0);
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    }
    return mix(stops[stops.length - 1][1], stops[stops.length - 1][1], 0);
  }
  function bg(v, top = '#1d1710', bot = '#0f0c08') {
    const cx = v.cx;
    v.screen();
    cx.fillStyle = linear(cx, 0, 0, 0, v.H, [[0, top], [1, bot]]);
    cx.fillRect(0, 0, v.W, v.H);
  }
  // a pewter or ceramic plate seen at an angle
  function plate(cx, x, y, rx, ry, kind = 'ceramic') {
    cx.fillStyle = 'rgba(0,0,0,.45)'; ell(cx, x + 6, y + ry * 0.35, rx * 1.02, ry * 1.05); cx.fill();
    if (kind === 'pewter') {
      cx.fillStyle = linear(cx, x - rx, 0, x + rx, 0, [[0, '#4a4c48'], [0.3, '#a9aba3'], [0.5, '#d9dad1'], [0.7, '#8d8f88'], [1, '#3a3c38']]);
    } else {
      cx.fillStyle = linear(cx, x - rx, 0, x + rx, 0, [[0, '#b9ad94'], [0.35, '#f3ecdc'], [0.6, '#efe6d2'], [1, '#a99d84']]);
    }
    ell(cx, x, y, rx, ry); cx.fill();
    cx.strokeStyle = 'rgba(28,19,12,.7)'; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = kind === 'pewter' ? 'rgba(40,42,38,.35)' : 'rgba(120,100,70,.14)';
    ell(cx, x, y + ry * 0.04, rx * 0.8, ry * 0.76); cx.fill();
    if (kind === 'delft') {
      cx.strokeStyle = 'rgba(45,79,138,.75)'; cx.lineWidth = 3; cx.setLineDash([10, 7]);
      ell(cx, x, y, rx * 0.9, ry * 0.88); cx.stroke(); cx.setLineDash([]);
    }
  }
  // tiny local particle system for toys
  function particles() {
    const list = [];
    return {
      list,
      add(p) { p.life = 0; p.max = p.max || 1; list.push(p); if (list.length > 900) list.shift(); return p; },
      step(dt, onEach) {
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.life += dt;
          if (p.life >= p.max) { list.splice(i, 1); continue; }
          p.vy += (p.g || 0) * dt; p.vx *= p.drag ?? 1; p.vy *= p.drag ?? 1;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.vr) p.rot = (p.rot || 0) + p.vr * dt;
          onEach && onEach(p, i);
        }
      },
      clear() { list.length = 0; },
    };
  }

  const TOYS = {};

  /* ======================================================================
     CRANBERRIES — the bounce test
     ====================================================================== */
  TOYS.cranberries = function (host, sc, ui) {
    const VW = 1000, VH = 620, G = 1650;
    const v = vcanvas(host, VW, VH, sc);
    const cx = v.cx;
    const berries = [];
    const BOARD = [130, 292, 425, 425];
    const segs = [
      [...BOARD, 'board'],
      [565, 600, 565, 405, 'wall'], [565, 405, 595, 405, 'wall'], [595, 405, 595, 600, 'wall'],
      [96, 0, 96, 600, 'wall'], [0, 600, 1000, 600, 'floor'], [992, 0, 992, 600, 'wall'],
    ];
    const BOWL = { x: 790, y: 470, rx: 150, ry: 118 };
    const bowlPts = [];
    for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI; bowlPts.push([BOWL.x + Math.cos(a) * BOWL.rx, BOWL.y + Math.sin(a) * BOWL.ry]); }
    for (let i = 0; i < bowlPts.length - 1; i++) segs.push([...bowlPts[i], ...bowlPts[i + 1], 'bowl']);
    let good = 0, soft = 0, sessionBounces = 0;
    const rnd = U.seeded(7);
    const hopperPile = Array.from({ length: 26 }, () => ({ x: 182 + rnd() * 136, y: 40 + rnd() * 46, r: 9 + rnd() * 2 }));

    function spawn() {
      const fresh = Math.random() < 0.78;
      berries.push({ x: R(236, 292), y: 98, vx: R(-10, 10), vy: R(0, 30), r: R(9, 11.5), fresh, e: fresh ? R(0.78, 0.86) : R(0.06, 0.16), bounced: false, counted: false, rot: R(TAU), sq: fresh ? 1 : R(0.78, 0.88), hue: R(-1, 1) });
      if (berries.length > 90) { const i = berries.findIndex((b) => b.counted); berries.splice(i >= 0 ? i : 0, 1); }
    }
    function collide(b, s) {
      const [x1, y1, x2, y2, kind] = s;
      const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
      let t = ((b.x - x1) * dx + (b.y - y1) * dy) / L2; t = clamp(t, 0, 1);
      const px = x1 + t * dx, py = y1 + t * dy;
      let nx = b.x - px, ny = b.y - py; const d = Math.hypot(nx, ny);
      if (d >= b.r || d === 0) return;
      nx /= d; ny /= d;
      b.x = px + nx * b.r; b.y = py + ny * b.r;
      const vn = b.vx * nx + b.vy * ny;
      if (vn >= 0) return;
      const e = kind === 'board' ? b.e : b.e * 0.3;
      b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
      const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty, f = kind === 'board' ? 0.015 : 0.06;
      b.vx -= vt * f * tx; b.vy -= vt * f * ty;
      const impact = -vn;
      if (kind === 'board' && !b.bounced && impact > 240) {
        b.bounced = true;
        if (b.fresh) {
          sessionBounces++;
          const n = LT.stats.inc('cranberriesBounced');
          A.sfx('bounce', { p: clamp(0.35 + impact / 2600 + R(-0.08, 0.08), 0, 1), g: 0.2, pan: -0.4 });
          if (n >= 50) LT.egg('pegleg', 'Peg-Leg Webb would be proud', 'Fifty fresh cranberries, bounced.');
        } else A.sfx('thud', { g: 0.16 });
      } else if (impact > 180) A.sfx('bounce', { p: b.fresh ? R(0.15, 0.3) : 0.05, g: 0.06, pan: (b.x - 500) / 600 });
    }
    function step(dt) {
      const n = Math.max(3, Math.ceil(dt * 320)), h = dt / n; // small steps: no tunnelling through the board
      for (let k = 0; k < n; k++) {
        for (const b of berries) {
          b.vy += G * h; b.x += b.vx * h; b.y += b.vy * h; b.rot += b.vx * h * 0.05;
          for (const s of segs) collide(b, s);
        }
        for (let i = 0; i < berries.length; i++) for (let j = i + 1; j < berries.length; j++) {
          const a = berries[i], b = berries[j];
          if (a.y < 430 || b.y < 430) continue; // only berries that have landed jostle
          const dx = b.x - a.x, dy = b.y - a.y, rr2 = a.r + b.r;
          if (Math.abs(dx) > rr2 || Math.abs(dy) > rr2) continue;
          const d = Math.hypot(dx, dy);
          if (d >= rr2 || d === 0) continue;
          const nx = dx / d, ny = dy / d, o = (rr2 - d) / 2;
          a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const imp = -(1.15) * rv / 2; a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny; }
        }
      }
      for (const b of berries) {
        if (b.counted || b.y < 455) continue;
        if (b.x > 620) { good += b.fresh ? 1 : 0; soft += b.fresh ? 0 : 1; b.counted = true; }
        else if (b.x > 100 && b.x < 560) { soft++; b.counted = true; }
      }
    }
    function drawBerry(b) {
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.rot); cx.scale(1, b.sq);
      const base = b.fresh ? (b.hue > 0 ? '#b3122c' : '#c41a33') : '#5a1a1c';
      cx.fillStyle = radial(cx, 0, 0, b.r, [[0, b.fresh ? '#f06a7c' : '#8a4a3c'], [0.45, base], [1, b.fresh ? '#5c0614' : '#2c0c0a']], -b.r * 0.35, -b.r * 0.4);
      ell(cx, 0, 0, b.r, b.r); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.55)'; ell(cx, -b.r * 0.38, -b.r * 0.42, b.r * 0.22, b.r * 0.14, -0.6); cx.fill();
      cx.fillStyle = 'rgba(30,10,6,.8)'; ell(cx, b.r * 0.55, b.r * 0.1, 1.6, 1.6); cx.fill();
      if (!b.fresh) { cx.fillStyle = 'rgba(0,0,0,.25)'; ell(cx, b.r * 0.1, b.r * 0.3, b.r * 0.5, b.r * 0.25); cx.fill(); }
      cx.restore();
    }
    function wood(x, y, w, h, rot = 0) {
      cx.save(); cx.translate(x, y); cx.rotate(rot);
      cx.fillStyle = linear(cx, 0, -h / 2, 0, h / 2, [[0, '#a8743f'], [0.5, '#7a4e26'], [1, '#4d2f15']]);
      rr(cx, -w / 2, -h / 2, w, h, 4); cx.fill();
      cx.strokeStyle = 'rgba(30,18,8,.6)'; cx.lineWidth = 2; cx.stroke();
      cx.strokeStyle = 'rgba(255,220,170,.12)'; cx.lineWidth = 1.2;
      for (let i = -w / 2 + 14; i < w / 2; i += 37) { cx.beginPath(); cx.moveTo(i, -h / 2 + 3); cx.quadraticCurveTo(i + 9, 0, i + 2, h / 2 - 3); cx.stroke(); }
      cx.restore();
    }
    function draw() {
      bg(v, '#1e1812', '#0d0a07');
      v.begin(null);
      const e = v.ext();
      // floor & wall
      cx.fillStyle = 'rgba(255,200,140,.035)'; cx.fillRect(e.x0, 0, e.x1 - e.x0, 600);
      cx.fillStyle = '#120d09'; cx.fillRect(e.x0, 600, e.x1 - e.x0, e.y1 - 600);
      cx.strokeStyle = 'rgba(239,230,210,.12)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(e.x0, 600); cx.lineTo(e.x1, 600); cx.stroke();
      // hopper
      cx.fillStyle = linear(cx, 170, 0, 330, 0, [[0, '#4d2f15'], [0.5, '#8a5a2c'], [1, '#4d2f15']]);
      cx.beginPath(); cx.moveTo(160, 20); cx.lineTo(340, 20); cx.lineTo(300, 96); cx.lineTo(200, 96); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(20,12,6,.8)'; cx.lineWidth = 3; cx.stroke();
      cx.save(); cx.beginPath(); cx.moveTo(166, 24); cx.lineTo(334, 24); cx.lineTo(298, 90); cx.lineTo(202, 90); cx.closePath(); cx.clip();
      hopperPile.forEach((h) => drawBerry({ x: h.x, y: h.y + 6, r: h.r, rot: 0, sq: 1, fresh: true, hue: h.x % 2 - 0.5 }));
      cx.restore();
      cx.fillStyle = '#efe6d2'; cx.font = '600 22px ' + 'Caveat, cursive'; cx.textAlign = 'center';
      cx.fillText('tap to drop', 250, 14);
      // reject crate (back)
      cx.fillStyle = 'rgba(90,60,30,.35)'; cx.fillRect(100, 470, 462, 130);
      // board, barrier
      const ang = Math.atan2(BOARD[3] - BOARD[1], BOARD[2] - BOARD[0]);
      const bl = Math.hypot(BOARD[2] - BOARD[0], BOARD[3] - BOARD[1]);
      wood((BOARD[0] + BOARD[2]) / 2 + Math.sin(ang) * 8, (BOARD[1] + BOARD[3]) / 2 + Math.cos(ang) * 8 + 0, bl + 6, 16, ang);
      cx.save(); cx.translate((BOARD[0] + BOARD[2]) / 2, (BOARD[1] + BOARD[3]) / 2 + 40); cx.rotate(ang);
      cx.fillStyle = 'rgba(239,230,210,.55)'; cx.font = '600 22px Caveat, cursive'; cx.fillText('bounce board', 0, 0); cx.restore();
      cx.strokeStyle = 'rgba(20,12,6,.8)'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(BOARD[2] - 6, BOARD[3] + 6); cx.lineTo(BOARD[2] - 6, 600); cx.stroke();
      wood(580, 502, 30, 196, 0);
      // bowl back
      cx.fillStyle = 'rgba(210,230,240,.06)'; ell(cx, BOWL.x, BOWL.y, BOWL.rx + 8, 26); cx.fill();
      // berries
      berries.forEach(drawBerry);
      // bowl front: clear glass, so you can see the haul
      cx.save();
      cx.beginPath(); cx.moveTo(BOWL.x - BOWL.rx - 8, BOWL.y); cx.ellipse(BOWL.x, BOWL.y, BOWL.rx + 8, BOWL.ry + 10, 0, Math.PI, 0, true);
      cx.ellipse(BOWL.x, BOWL.y, BOWL.rx + 8, 26, 0, 0, Math.PI, false); cx.closePath();
      cx.fillStyle = linear(cx, BOWL.x - BOWL.rx, 0, BOWL.x + BOWL.rx, 0, [[0, 'rgba(210,230,240,.22)'], [0.3, 'rgba(210,230,240,.05)'], [0.7, 'rgba(210,230,240,.04)'], [1, 'rgba(210,230,240,.2)']]);
      cx.fill(); cx.strokeStyle = 'rgba(225,238,245,.55)'; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 6; cx.lineCap = 'round';
      cx.beginPath(); cx.ellipse(BOWL.x, BOWL.y, BOWL.rx - 14, BOWL.ry - 14, 0, Math.PI * 0.62, Math.PI * 0.85); cx.stroke();
      cx.lineWidth = 3; cx.beginPath(); cx.ellipse(BOWL.x, BOWL.y, BOWL.rx - 18, BOWL.ry - 20, 0, Math.PI * 0.12, Math.PI * 0.22); cx.stroke();
      cx.restore();
      cx.fillStyle = 'rgba(225,238,245,.25)'; ell(cx, BOWL.x, BOWL.y + BOWL.ry + 12, 70, 10); cx.fill();
      cx.strokeStyle = 'rgba(225,238,245,.6)'; cx.lineWidth = 2.5; ell(cx, BOWL.x, BOWL.y, BOWL.rx + 8, 26); cx.stroke();
      // crate front lip
      cx.fillStyle = linear(cx, 0, 560, 0, 600, [[0, '#7a4e26'], [1, '#3e2510']]);
      cx.fillRect(100, 566, 462, 34);
      cx.strokeStyle = 'rgba(20,12,6,.8)'; cx.lineWidth = 2; cx.strokeRect(100, 566, 462, 34);
      cx.fillStyle = '#efe6d2'; cx.font = '700 24px Caveat, cursive'; cx.textAlign = 'center';
      cx.fillText('soft ones', 330, 590);
      cx.fillStyle = 'rgba(242,193,78,.9)'; cx.fillText('fresh ones ↓', BOWL.x, BOWL.y - 70);
    }
    let pouring = false, pourAcc = 0;
    v.input({
      down() { pouring = true; pourAcc = 0.2; A.init && A.init(); },
      up() { pouring = false; },
    });
    sc.frame((dt) => {
      if (pouring) { pourAcc += dt; while (pourAcc > 0.11) { pourAcc -= 0.11; spawn(); } }
      step(dt);
      draw();
    });
    let lastG = -1, lastS = -1;
    sc.interval(() => {
      if (good === lastG && soft === lastS) return;
      lastG = good; lastS = soft;
      ui.status(`Into the bowl: ${good} · Left behind: ${soft} · Fresh bounces, all time: ${LT.stats.get('cranberriesBounced')}`);
    }, 200);
    ui.status('Into the bowl: 0 · Left behind: 0');
    ui.hint('Tap to drop a berry. Hold to pour.');
    ui.button('Pour a handful', () => { for (let i = 0; i < 12; i++) sc.timeout(spawn, i * 90); });
    sc.timeout(() => { for (let i = 0; i < 5; i++) sc.timeout(spawn, i * 260); }, 500);
  };

  /* ======================================================================
     THE CAN — jellied, ridged, correct
     ====================================================================== */
  TOYS.can = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc);
    const cx = v.cx;
    const PX = 500, PY = 548; // plate centre
    const CW = 160, CH = 236; // can size
    const JW = 148, JH = 224; // jelly size
    const RIDGES = [0.17, 0.34, 0.51, 0.68, 0.85];
    const st = { mode: 'closed', canX: PX, canY: 300, canRot: 0, open: 0, lidY: 0, lidRot: 0, lidOn: true, shake: 0, suction: 0, jellyY: -400, jellyTop: 0, wob: 0, wv: 0, sq: 0, sv: 0, pieces: [], discs: [], cuts: 0, stroke: null };
    // jelly geometry (virtual): bottom at PY, top at PY - JH*(1-jellyTop)
    const jBottom = () => PY - 6;
    const topY = () => jBottom() - JH * (1 - st.jellyTop);
    function jellyOffset(y) { const k = clamp((jBottom() - y) / JH, 0, 1); return st.wob * Math.pow(k, 1.5); }
    function squashY(y) { return jBottom() - (jBottom() - y) * (1 - st.sq); }

    function drawPlate() {
      plate(cx, PX, PY, 300, 62, 'ceramic');
      cx.strokeStyle = 'rgba(111,21,38,.5)'; cx.lineWidth = 2; ell(cx, PX, PY, 270, 54); cx.stroke();
    }
    function drawCan() {
      cx.save(); cx.translate(st.canX, st.canY); cx.rotate(st.canRot + Math.sin(st.shake * 40) * st.shake * 0.35);
      const w = CW, h = CH;
      // body
      cx.fillStyle = linear(cx, -w / 2, 0, w / 2, 0, [[0, '#55585a'], [0.25, '#c9cbcc'], [0.42, '#f2f3f3'], [0.6, '#9a9d9f'], [1, '#3f4244']]);
      cx.fillRect(-w / 2, -h / 2, w, h);
      // label
      cx.fillStyle = linear(cx, -w / 2, 0, w / 2, 0, [[0, '#5a1222'], [0.3, '#a8263c'], [0.5, '#b72d44'], [1, '#4a0d1a']]);
      cx.fillRect(-w / 2, -h / 2 + 30, w, h - 60);
      cx.fillStyle = 'rgba(239,230,210,.95)';
      cx.fillRect(-w / 2, -h / 2 + 64, w, 58);
      cx.fillStyle = '#6f1526'; cx.textAlign = 'center';
      cx.font = '18px "IM Fell English SC", Georgia, serif'; cx.fillText('CRANBERRY', 0, -h / 2 + 88);
      cx.font = 'italic 16px "IM Fell Double Pica", Georgia, serif'; cx.fillText('sauce · jellied', 0, -h / 2 + 110);
      for (let i = 0; i < 5; i++) { cx.fillStyle = '#e04a5c'; ell(cx, -40 + i * 20, -h / 2 + 150 + (i % 2) * 8, 8, 8); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.5)'; ell(cx, -43 + i * 20, -h / 2 + 147 + (i % 2) * 8, 2.5, 2); cx.fill(); }
      // ridges on the metal
      cx.strokeStyle = 'rgba(0,0,0,.28)'; cx.lineWidth = 2;
      [12, 20, h - 20, h - 12].forEach((y) => { cx.beginPath(); cx.moveTo(-w / 2, -h / 2 + y); cx.lineTo(w / 2, -h / 2 + y); cx.stroke(); });
      cx.strokeStyle = 'rgba(28,19,12,.8)'; cx.lineWidth = 2.5; cx.strokeRect(-w / 2, -h / 2, w, h);
      // top rim & lid
      const rimY = -h / 2;
      cx.fillStyle = '#d9dbdc'; ell(cx, 0, rimY, w / 2 + 3, 15); cx.fill(); cx.stroke();
      if (st.lidOn) {
        cx.fillStyle = linear(cx, -w / 2, 0, w / 2, 0, [[0, '#8d9092'], [0.5, '#e6e7e7'], [1, '#7b7e80']]);
        ell(cx, 0, rimY, w / 2 - 6, 11); cx.fill();
        cx.strokeStyle = 'rgba(0,0,0,.25)'; ell(cx, 0, rimY, w / 2 - 20, 7); cx.stroke();
        if (st.open > 0) { cx.strokeStyle = '#fff'; cx.lineWidth = 2.5; cx.beginPath(); cx.ellipse(0, rimY, w / 2 - 6, 11, 0, -Math.PI / 2, -Math.PI / 2 + TAU * st.open); cx.stroke(); }
      } else {
        cx.fillStyle = '#7a0d1e'; ell(cx, 0, rimY, w / 2 - 6, 11); cx.fill();
        cx.fillStyle = 'rgba(255,140,150,.25)'; ell(cx, -20, rimY - 2, 30, 4); cx.fill();
      }
      cx.restore();
      if (st.mode === 'opening') {
        // the opener
        const a = -Math.PI / 2 + TAU * st.open;
        const ox = st.canX + Math.cos(a) * (CW / 2 + 4), oy = st.canY - CH / 2 + Math.sin(a) * 15;
        cx.save(); cx.translate(ox, oy - 14);
        cx.fillStyle = '#9aa0a4'; rr(cx, -6, -60, 12, 64, 4); cx.fill();
        cx.fillStyle = '#6f1526'; rr(cx, -9, -100, 18, 46, 6); cx.fill();
        cx.fillStyle = '#d9dbdc'; ell(cx, 0, 0, 12, 12); cx.fill(); cx.strokeStyle = '#333'; cx.stroke();
        cx.restore();
      }
    }
    function drawLid() {
      if (st.lidOn || st.lidY < -50) return;
      cx.save(); cx.translate(st.canX + st.lidX, st.lidY); cx.rotate(st.lidRot);
      cx.fillStyle = '#cfd1d2'; ell(cx, 0, 0, CW / 2 - 6, 11); cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.5)'; cx.lineWidth = 2; cx.stroke();
      cx.restore();
    }
    function jellyPath(y0, y1, offsetFn, hw, ryCap) {
      const N = 14;
      cx.beginPath();
      for (let i = 0; i <= N; i++) { const y = lerp(y0, y1, i / N); cx.lineTo(PX - hw + offsetFn(y), squashY(y)); }
      cx.ellipse(PX + offsetFn(y1), squashY(y1), hw, ryCap, 0, Math.PI, 0, true);
      for (let i = N; i >= 0; i--) { const y = lerp(y0, y1, i / N); cx.lineTo(PX + hw + offsetFn(y), squashY(y)); }
      cx.closePath();
    }
    function drawJelly() {
      cx.save(); cx.translate(0, st.jOff || 0);
      drawJellyBody();
      cx.restore();
    }
    function drawJellyBody() {
      const hw = JW / 2, t = topY(), b = jBottom();
      cx.fillStyle = 'rgba(40,0,8,.35)'; ell(cx, PX + 12, b + 8, hw + 26, 16); cx.fill();
      // body
      jellyPath(t, b, jellyOffset, hw, 13);
      cx.fillStyle = linear(cx, PX - hw, 0, PX + hw, 0, [[0, '#4d0612'], [0.2, '#97182f'], [0.42, '#d83a52'], [0.6, '#b5213a'], [1, '#55091a']]);
      cx.fill();
      cx.strokeStyle = 'rgba(40,0,10,.65)'; cx.lineWidth = 2.5; cx.stroke();
      // ridges
      RIDGES.forEach((r) => {
        const y = b - JH * (1 - r);
        if (y <= t + 4) return;
        const o = jellyOffset(y), sy = squashY(y);
        cx.strokeStyle = 'rgba(50,0,10,.55)'; cx.lineWidth = 3.5;
        cx.beginPath(); cx.ellipse(PX + o, sy, hw, 12, 0, 0.05, Math.PI - 0.05); cx.stroke();
        cx.strokeStyle = 'rgba(255,170,180,.28)'; cx.lineWidth = 2;
        cx.beginPath(); cx.ellipse(PX + o, sy + 4, hw - 3, 12, 0, 0.3, Math.PI - 0.3); cx.stroke();
      });
      // gloss
      cx.strokeStyle = 'rgba(255,230,235,.3)'; cx.lineWidth = 9; cx.lineCap = 'round';
      cx.beginPath();
      for (let i = 0; i <= 10; i++) { const y = lerp(t + 18, b - 10, i / 10); cx.lineTo(PX - hw * 0.45 + jellyOffset(y), squashY(y)); }
      cx.stroke();
      // top cap
      const ot = jellyOffset(t), st2 = squashY(t);
      cx.fillStyle = radial(cx, PX + ot, st2, hw, [[0, '#ea5468'], [0.7, '#c22a42'], [1, '#8a1022']], PX + ot - 20, st2 - 4);
      ell(cx, PX + ot, st2, hw, 13); cx.fill(); cx.strokeStyle = 'rgba(40,0,10,.6)'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,.35)'; ell(cx, PX + ot - 26, st2 - 3, 24, 3.5, -0.08); cx.fill();
    }
    function drawPiece(p) {
      const h = p.h, hw = JW / 2;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
      cx.fillStyle = linear(cx, -hw, 0, hw, 0, [[0, '#4d0612'], [0.42, '#d83a52'], [1, '#55091a']]);
      rr(cx, -hw, -h / 2, JW, h, 10); cx.fill(); cx.strokeStyle = 'rgba(40,0,10,.65)'; cx.lineWidth = 2.5; cx.stroke();
      cx.restore();
    }
    function drawDisc(d) {
      cx.fillStyle = 'rgba(40,0,10,.3)'; ell(cx, d.x + 5, d.y + 6, 62, 18); cx.fill();
      cx.fillStyle = '#6a0b1a'; ell(cx, d.x, d.y + d.th * 0.5, 60, 17); cx.fill();
      cx.fillStyle = '#8f1428'; cx.fillRect(d.x - 60, d.y - d.th * 0.5, 120, d.th);
      cx.fillStyle = radial(cx, d.x, d.y - d.th * 0.5, 60, [[0, '#e9566b'], [1, '#a81d36']], d.x - 15, d.y - d.th * 0.5 - 4);
      ell(cx, d.x, d.y - d.th * 0.5, 60, 17); cx.fill();
      cx.strokeStyle = 'rgba(60,0,12,.5)'; cx.lineWidth = 2; ell(cx, d.x, d.y - d.th * 0.5, 52, 14); cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,.3)'; ell(cx, d.x - 18, d.y - d.th * 0.5 - 5, 16, 3); cx.fill();
    }
    function draw() {
      bg(v, '#1f1811', '#0e0b07');
      v.begin(null);
      const e = v.ext();
      cx.fillStyle = linear(cx, 0, 470, 0, e.y1, [[0, '#2a2015'], [1, '#17110b']]); cx.fillRect(e.x0, 470, e.x1 - e.x0, e.y1 - 470);
      drawPlate();
      st.discs.forEach(drawDisc);
      if (st.mode === 'standing' || st.mode === 'sliding' || st.mode === 'done') drawJelly();
      st.pieces.forEach(drawPiece);
      if (st.mode !== 'standing' && st.mode !== 'done') drawCan();
      drawLid();
      if (st.stroke) {
        cx.strokeStyle = 'rgba(239,230,210,.8)'; cx.lineWidth = 3; cx.setLineDash([8, 8]);
        cx.beginPath(); cx.moveTo(st.stroke.x0, st.stroke.y0); cx.lineTo(st.stroke.x, st.stroke.y); cx.stroke(); cx.setLineDash([]);
        // a butter knife
        cx.save(); cx.translate(st.stroke.x, st.stroke.y); cx.rotate(-0.1);
        cx.fillStyle = linear(cx, 0, -10, 0, 10, [[0, '#f2f3f3'], [1, '#8d9092']]); rr(cx, -4, -8, 90, 16, 8); cx.fill();
        cx.fillStyle = '#3a2a1a'; rr(cx, 84, -7, 70, 14, 6); cx.fill();
        cx.restore();
      }
    }
    async function open() {
      st.mode = 'opening'; ui.hint('Opening…');
      const t0 = performance.now();
      let lastTick = 0;
      await U.tween({ from: 0, to: 1, dur: RM ? 0.3 : 1.4, ease: 'linear', onUpdate: (k) => { st.open = k; const n = Math.floor(k * 22); if (n !== lastTick) { lastTick = n; snd.tick(); } } }).done;
      if (!sc.alive) return;
      st.lidOn = false; st.lidX = 0; st.lidY = st.canY - CH / 2; A.sfx('pop', { f: 1200 });
      U.tween({ from: [0, st.lidY, 0], to: [260, -120, 5], dur: 0.9, ease: 'outCubic', onUpdate: ([x, y, r]) => { st.lidX = x; st.lidY = y; st.lidRot = r; } });
      await sc.wait(300);
      ui.hint('Now flip it. Tap the can to shake it out.');
      await U.tween({ from: [0, 300], to: [Math.PI, 230], dur: 0.6, ease: 'inOutCubic', onUpdate: ([r, y]) => { st.canRot = r; st.canY = y; } }).done;
      st.mode = 'open';
    }
    async function slideOut() {
      st.mode = 'sliding'; ui.hint('…');
      A.sfx('squish');
      st.jellyTop = 0; st.sq = 0;
      // the jelly emerges from the can's mouth and drops
      st.wob = 0;
      st.jOff = st.canY + CH / 2 - jBottom();
      const tw = U.tween({ from: st.jOff, to: 0, dur: 0.45, ease: 'inQuad', onUpdate: (dy) => { st.jOff = dy; } });
      U.tween({ from: [st.canY, st.canRot], to: [-260, Math.PI * 1.3], dur: 0.9, ease: 'inCubic', onUpdate: ([y, r]) => { st.canY = y; st.canRot = r; } });
      await tw.done;
      st.jOff = 0;
      if (!sc.alive) return;
      st.sv = -2.6; st.wv = R(-120, 120);
      A.sfx('thud', { g: 0.3 }); snd.plop(0.2);
      st.mode = 'standing';
      ui.hint('Poke it. Then drag across a ridge to slice.');
      ui.status('There it is. Ridges and all.');
    }
    function cutAt(y) {
      const t = topY();
      const candidates = RIDGES.map((r) => jBottom() - JH * (1 - r)).filter((ry) => ry > t + 10);
      if (!candidates.length) return;
      let best = candidates[0];
      candidates.forEach((c) => { if (Math.abs(c - y) < Math.abs(best - y)) best = c; });
      const h = best - t;
      const newTop = (jBottom() - best) / JH;
      st.jellyTop = 1 - newTop;
      const side = st.cuts % 2 ? 1 : -1;
      const piece = { x: PX + jellyOffset(t), y: t + h / 2, h, rot: 0 };
      st.pieces.push(piece);
      st.cuts++;
      LT.stats.inc('jellySlices');
      snd.slice(); A.sfx('squish');
      st.wv += side * -160; st.sv = -1.2;
      const slot = Math.floor((st.cuts - 1) / 2);
      const target = { x: PX + side * (155 + slot * 38), y: PY + 4 - slot * 8 };
      U.tween({ from: [piece.x, piece.y, 0], to: [target.x, target.y - 8, side * Math.PI / 2], dur: 0.7, ease: 'inOutCubic', onUpdate: ([x, y, r]) => { piece.x = x; piece.y = y; piece.rot = r; } }).done.then(() => {
        if (!sc.alive) return;
        st.pieces.splice(st.pieces.indexOf(piece), 1);
        st.discs.push({ x: target.x, y: target.y, th: clamp(h * 0.35, 10, 26) });
        st.discs.sort((a, b) => a.y - b.y);
        snd.plop(0.4);
      });
      if (topY() >= jBottom() - JH * (1 - RIDGES[RIDGES.length - 1]) - 2) {
        ui.hint('Served. Ridges intact.');
        ui.status('Every slice exactly one ridge thick. The can did the measuring.');
        st.mode = 'done';
        ui.button('Another can', reset);
      }
    }
    function reset() {
      Object.assign(st, { mode: 'closed', canX: PX, canY: 300, canRot: 0, open: 0, lidOn: true, lidY: 0, shake: 0, suction: 0, jellyTop: 0, wob: 0, wv: 0, sq: 0, sv: 0, pieces: [], discs: [], cuts: 0, stroke: null });
      ui.hint('Tap the can to open it.'); ui.status(''); ui.clearButtons();
    }
    const overJelly = (p) => st.mode === 'standing' && Math.abs(p.x - PX) < JW / 2 + 30 && p.y > topY() - 20 && p.y < jBottom() + 10;
    v.input({
      down(p) {
        if (st.mode === 'closed') { open(); return; }
        if (st.mode === 'open') {
          st.shake = 1; snd.shake();
          st.suction += R(0.26, 0.4);
          if (st.suction >= 1) slideOut(); else ui.hint(['Shake it again.', 'Hear that? Suction.', 'Almost…'][Math.min(2, Math.floor(st.suction * 3))]);
          return;
        }
        if (st.mode === 'standing') st.stroke = { x0: p.x, y0: p.y, x: p.x, y: p.y, poked: overJelly(p) };
      },
      move(p) { if (st.stroke) { st.stroke.x = p.x; st.stroke.y = p.y; } },
      up(p) {
        if (!st.stroke) return;
        const s = st.stroke; st.stroke = null;
        const dx = s.x - s.x0, len = Math.hypot(dx, s.y - s.y0);
        const crossed = Math.min(s.x0, s.x) < PX - JW / 2 + 20 && Math.max(s.x0, s.x) > PX + JW / 2 - 20;
        if (len > 60 && crossed) cutAt((s.y0 + s.y) / 2);
        else if (s.poked) { st.wv += (p.x < PX ? 1 : -1) * R(160, 260); st.sv = -1.6; A.sfx('squish'); LT.stats.inc('jellyPokes'); }
      },
    });
    sc.frame((dt) => {
      st.shake = Math.max(0, st.shake - dt * 2.5);
      // springs
      st.wv += (-170 * st.wob - 5 * st.wv) * dt; st.wob += st.wv * dt;
      st.sv += (-260 * st.sq - 9 * st.sv) * dt; st.sq += st.sv * dt;
      st.sq = clamp(st.sq, -0.25, 0.3);
      draw();
    });
    ui.hint('Tap the can to open it.');
  };

  /* ======================================================================
     THE BIRD — carve it
     ====================================================================== */
  TOYS.turkey = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc, 'sp-knifecursor');
    const cx = v.cx;
    const TX = 500, TY = 330, BRX = 220, BRY = 138;
    const rnd = U.seeded(1784);
    const speckles = Array.from({ length: 160 }, () => { const a = rnd() * TAU, r = Math.sqrt(rnd()); return { x: TX + Math.cos(a) * r * BRX * 0.95, y: TY + Math.sin(a) * r * BRY * 0.92, s: 1 + rnd() * 3, a: 0.1 + rnd() * 0.25 }; });
    const garnish = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * TAU + 0.2; return { x: 500 + Math.cos(a) * 345, y: 405 + Math.sin(a) * 140, a, kind: i % 4 === 0 ? 'orange' : i % 4 === 2 ? 'berry' : 'sage' }; });
    const cuts = [], slices = [];
    let stroke = null, nSlices = 0, gobbles = 0;
    const fan = (i) => { const a = Math.PI * (0.18 + (i % 10) * 0.07); const side = i % 2 ? 1 : -1; return { x: 500 + side * Math.cos(a) * 300, y: 470 + Math.sin(a) * 60 - Math.floor(i / 10) * 10, r: side * (0.5 + i * 0.03) }; };
    function inBody(p, k = 1) { return Math.pow((p.x - TX) / (BRX * k), 2) + Math.pow((p.y - TY) / (BRY * k), 2) < 1; }
    function drumstick(x, y, rot) {
      cx.save(); cx.translate(x, y); cx.rotate(rot);
      cx.fillStyle = radial(cx, 0, 0, 70, [[0, '#e7a85c'], [0.6, '#b5612a'], [1, '#6e3415']], -10, -14);
      cx.beginPath(); cx.ellipse(0, 0, 66, 40, 0, 0, TAU); cx.fill(); cx.strokeStyle = 'rgba(40,18,6,.7)'; cx.lineWidth = 3; cx.stroke();
      cx.fillStyle = '#efe1c4'; rr(cx, 56, -9, 46, 18, 8); cx.fill(); cx.stroke();
      cx.fillStyle = '#fbf6ea';
      cx.beginPath(); for (let i = 0; i <= 10; i++) { const yy = -18 + i * 3.6; cx.lineTo(96 + (i % 2 ? 22 : 10), yy); } cx.lineTo(96, 18); cx.lineTo(96, -18); cx.closePath(); cx.fill(); cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = 'rgba(255,240,200,.35)'; ell(cx, -12, -16, 30, 9, -0.2); cx.fill();
      cx.restore();
    }
    function draw() {
      bg(v, '#1d1610', '#0d0a07');
      v.begin(null);
      plate(cx, 500, 405, 410, 170, 'pewter');
      garnish.forEach((g) => {
        if (g.kind === 'sage') { cx.save(); cx.translate(g.x, g.y); cx.rotate(g.a + 1.2); cx.fillStyle = '#6d7a45'; ell(cx, 0, 0, 22, 8); cx.fill(); cx.strokeStyle = '#3e4826'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(-20, 0); cx.lineTo(20, 0); cx.stroke(); cx.restore(); }
        else if (g.kind === 'orange') { cx.fillStyle = '#e8892e'; ell(cx, g.x, g.y, 22, 12); cx.fill(); cx.fillStyle = '#f6c068'; ell(cx, g.x, g.y, 17, 9); cx.fill(); cx.strokeStyle = 'rgba(232,137,46,.8)'; cx.lineWidth = 1.2; for (let i = 0; i < 6; i++) { cx.beginPath(); cx.moveTo(g.x, g.y); cx.lineTo(g.x + Math.cos(i) * 17, g.y + Math.sin(i) * 9); cx.stroke(); } }
        else { for (let i = 0; i < 4; i++) { cx.fillStyle = radial(cx, g.x + i * 9 - 12, g.y + (i % 2) * 6, 8, [[0, '#e04a5c'], [1, '#6a0a18']]); ell(cx, g.x + i * 9 - 12, g.y + (i % 2) * 6, 7, 7); cx.fill(); } }
      });
      slices.filter((s) => s.landed).forEach(drawSlice);
      // body shadow
      cx.fillStyle = 'rgba(0,0,0,.35)'; ell(cx, TX + 10, TY + 60, BRX * 1.02, BRY * 0.7); cx.fill();
      drumstick(TX - 190, TY + 74, Math.PI + 0.55);
      drumstick(TX + 190, TY + 74, -0.55);
      // wings
      cx.fillStyle = '#8c4518'; ell(cx, TX - 200, TY - 30, 52, 34, 0.5); cx.fill(); ell(cx, TX + 200, TY - 30, 52, 34, -0.5); cx.fill();
      // body
      cx.fillStyle = radial(cx, TX, TY, BRX * 1.1, [[0, '#f2be6a'], [0.45, '#d27f33'], [0.8, '#a14f1d'], [1, '#6a3010']], TX - 40, TY - 60);
      ell(cx, TX, TY, BRX, BRY); cx.fill();
      cx.strokeStyle = 'rgba(40,18,6,.75)'; cx.lineWidth = 3.5; cx.stroke();
      cx.save(); ell(cx, TX, TY, BRX, BRY); cx.clip();
      speckles.forEach((s) => { cx.fillStyle = `rgba(90,35,8,${s.a})`; ell(cx, s.x, s.y, s.s, s.s * 0.7); cx.fill(); });
      cx.fillStyle = 'rgba(255,235,190,.28)'; ell(cx, TX - 50, TY - 64, 110, 36, -0.15); cx.fill();
      cx.fillStyle = 'rgba(255,250,230,.35)'; ell(cx, TX - 80, TY - 78, 40, 9, -0.25); cx.fill();
      cx.strokeStyle = 'rgba(100,40,10,.45)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(TX, TY - BRY); cx.quadraticCurveTo(TX + 14, TY, TX, TY + BRY); cx.stroke();
      // cuts
      cuts.forEach((c) => {
        cx.strokeStyle = '#6e3415'; cx.lineWidth = 11; cx.lineCap = 'round';
        cx.beginPath(); c.pts.forEach((p, i) => (i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y))); cx.stroke();
        cx.strokeStyle = '#f1dcbd'; cx.lineWidth = 7;
        cx.beginPath(); c.pts.forEach((p, i) => (i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y))); cx.stroke();
      });
      if (stroke && stroke.pts.length > 1) {
        cx.strokeStyle = 'rgba(241,220,189,.85)'; cx.lineWidth = 4; cx.lineCap = 'round';
        cx.beginPath(); stroke.pts.forEach((p, i) => (i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y))); cx.stroke();
      }
      cx.restore();
      slices.filter((s) => !s.landed).forEach(drawSlice);
      // the knife
      if (v.ptr.inside || v.ptr.down) drawKnife(v.ptr.x, v.ptr.y);
    }
    function drawSlice(s) {
      cx.save(); cx.translate(s.x, s.y); cx.rotate(s.rot);
      cx.fillStyle = 'rgba(0,0,0,.25)'; ell(cx, 4, 6, 50, 19); cx.fill();
      cx.fillStyle = radial(cx, 0, 0, 52, [[0, '#f6e6cc'], [0.75, '#ead0aa'], [1, '#d9b88a']]);
      ell(cx, 0, 0, 48, 18); cx.fill();
      cx.strokeStyle = '#a8581f'; cx.lineWidth = 6; cx.beginPath(); cx.ellipse(0, 0, 48, 18, 0, Math.PI * 1.05, Math.PI * 1.95); cx.stroke();
      cx.strokeStyle = 'rgba(180,140,100,.35)'; cx.lineWidth = 1; for (let i = -30; i < 32; i += 10) { cx.beginPath(); cx.moveTo(i, -10); cx.lineTo(i + 6, 12); cx.stroke(); }
      cx.restore();
    }
    function drawKnife(x, y) {
      cx.save(); cx.translate(x, y); cx.rotate(-0.7);
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.moveTo(8, 10); cx.lineTo(150, 4); cx.lineTo(150, 24); cx.lineTo(20, 22); cx.fill();
      cx.fillStyle = linear(cx, 0, -12, 0, 12, [[0, '#f7f8f8'], [0.5, '#c6c9cb'], [1, '#7c8083']]);
      cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(60, -16, 140, -10); cx.lineTo(140, 10); cx.lineTo(10, 8); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(30,30,30,.6)'; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = '#2b1a10'; rr(cx, 138, -9, 90, 18, 7); cx.fill();
      cx.fillStyle = '#d9dbdc'; [158, 184, 210].forEach((rx) => { ell(cx, rx, 0, 2.6, 2.6); cx.fill(); });
      cx.restore();
    }
    const quips = ['Habit.', 'Sorry.', '(a phantom gobble)', 'It does that.', 'Muscle memory.'];
    v.input({
      down(p) { stroke = { pts: [p], len: 0, start: p }; },
      move(p) {
        if (!stroke) return;
        const l = stroke.pts[stroke.pts.length - 1];
        const d = Math.hypot(p.x - l.x, p.y - l.y);
        if (d > 4) { stroke.pts.push(p); stroke.len += d; if (inBody(p, 0.92) && Math.random() < 0.25) A.noise({ dur: 0.05, g: 0.05, filters: [{ type: 'bandpass', f: R(2500, 4000), q: 2 }] }); }
      },
      up(p) {
        if (!stroke) return;
        const s = stroke; stroke = null;
        if (s.len < 12) {
          if (inBody(p, 1.05)) {
            A.sfx('gobble', { g: 0.22 }); gobbles++;
            const sp = v.toScreen(p.x, p.y - 40);
            LT.fx.float(sp.x, sp.y, quips[(gobbles - 1) % quips.length], { size: 26, color: '#efe6d2' });
            LT.stats.inc('gobbles');
          }
          return;
        }
        const inside = s.pts.filter((q) => inBody(q, 0.92));
        if (s.len < 60 || inside.length < 4) { ui.hint('Longer strokes, across the breast.'); return; }
        if (nSlices >= 12) { ui.hint('That’s the breast. Dad is already narrating the thighs.'); return; }
        cuts.push({ pts: inside });
        const mid = inside[Math.floor(inside.length / 2)];
        const f = fan(nSlices++);
        const sl = { x: mid.x, y: mid.y, rot: 0, landed: false };
        slices.push(sl);
        snd.slice();
        LT.stats.inc('turkeySlices');
        U.tween({ from: [mid.x, mid.y, 0], to: [f.x, f.y, f.r], dur: 0.75, ease: 'inOutCubic', onUpdate: ([x, y, r]) => { sl.x = x; sl.y = y - Math.sin(Math.PI * Math.min(1, Math.abs(x - mid.x) / 300)) * 40; sl.rot = r; } }).done.then(() => { if (sc.alive) { sl.landed = true; snd.plop(0.5); } });
        ui.status(`${nSlices} slice${nSlices > 1 ? 's' : ''}. ${['Nice.', 'Dad would have narrated that one.', 'Against the grain, too.', 'White meat for Aunt Linda.', 'Someone is hovering.', 'Biscuit is watching you.', 'Thin. Professional.', 'Save one for sandwiches.'][(nSlices - 1) % 8]}`);
        if (nSlices === 8) ui.hint('That’s plenty for the first round. Tap the bird for a last word.');
      },
    });
    sc.frame(draw);
    ui.hint('Drag the knife across the breast to carve. Tap the bird and see what happens.');
  };

  /* ======================================================================
     THE FRYER — in the driveway, too close to the garage
     ====================================================================== */
  TOYS.fryer = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc, 'sp-grab');
    const cx = v.cx;
    const POT = { x: 560, top: 300, bot: 486, rx: 96 };
    const st = { frozen: true, ty: 140, target: 140, vy: 0, oil: 334, oilBase: 334, phase: 'idle', fire: 0, char: 0, bubbles: 0, done: false, splashT: 0, firesThisVisit: 0 };
    const P = particles();
    let sizzle = null, dragStart = null;
    const rnd = U.seeded(451);
    const frost = Array.from({ length: 40 }, () => ({ a: rnd() * TAU, r: rnd(), s: 2 + rnd() * 4 }));
    const stars = Array.from({ length: 40 }, () => ({ x: rnd() * 1400 - 200, y: rnd() * 220, s: rnd() * 1.6 + 0.3 }));

    function drawTurkey(x, y) {
      // hook & rod
      cx.strokeStyle = '#8d9092'; cx.lineWidth = 5;
      cx.beginPath(); cx.moveTo(x, -400); cx.lineTo(x, y - 62); cx.stroke();
      cx.lineWidth = 4; cx.beginPath(); cx.arc(x, y - 52, 10, Math.PI, TAU * 0.98); cx.stroke();
      cx.save(); cx.translate(x, y);
      const raw = st.frozen ? ['#e9dbd6', '#c9b5b3', '#8f7a7c'] : ['#f4d8bf', '#e2b590', '#a87652'];
      cx.fillStyle = radial(cx, 0, 0, 80, [[0, raw[0]], [0.6, raw[1]], [1, raw[2]]], -20, -20);
      ell(cx, 0, 0, 70, 56); cx.fill(); cx.strokeStyle = 'rgba(40,20,10,.7)'; cx.lineWidth = 3; cx.stroke();
      // legs up
      [-1, 1].forEach((s) => { cx.fillStyle = raw[1]; ell(cx, s * 40, -50, 18, 30, s * 0.5); cx.fill(); cx.stroke(); cx.fillStyle = '#f3e7d2'; rr(cx, s * 46 - 6, -96, 12, 26, 5); cx.fill(); cx.stroke(); });
      if (st.frozen) {
        frost.forEach((f) => { cx.fillStyle = 'rgba(235,245,255,.75)'; ell(cx, Math.cos(f.a) * f.r * 62, Math.sin(f.a) * f.r * 48, f.s, f.s * 0.8); cx.fill(); });
        cx.fillStyle = 'rgba(180,210,255,.25)'; ell(cx, 0, 0, 70, 56); cx.fill();
        cx.strokeStyle = 'rgba(230,245,255,.9)'; cx.lineWidth = 2;
        for (let i = 0; i < 5; i++) { cx.beginPath(); cx.moveTo(-50 + i * 24, 54); cx.lineTo(-48 + i * 24, 66 + (i % 2) * 6); cx.stroke(); }
      }
      cx.restore();
    }
    function draw(t) {
      v.screen();
      cx.fillStyle = linear(cx, 0, 0, 0, v.H, [[0, '#070912'], [0.6, '#141017'], [1, '#100c09']]); cx.fillRect(0, 0, v.W, v.H);
      v.begin(null);
      const e = v.ext();
      stars.forEach((s) => { cx.fillStyle = `rgba(239,230,210,${0.3 + 0.3 * Math.sin(t * 2 + s.x)})`; ell(cx, s.x, s.y, s.s, s.s); cx.fill(); });
      // the house, too close
      cx.fillStyle = '#2a2420'; cx.fillRect(e.x0, 120, 330 - e.x0, 420);
      cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = 2;
      for (let y = 140; y < 540; y += 18) { cx.beginPath(); cx.moveTo(e.x0, y); cx.lineTo(330, y); cx.stroke(); }
      cx.fillStyle = '#1a1512'; cx.beginPath(); cx.moveTo(e.x0, 120); cx.lineTo(360, 120); cx.lineTo(330, 90); cx.lineTo(e.x0, 90); cx.fill();
      // window, warm
      cx.fillStyle = linear(cx, 0, 210, 0, 360, [[0, '#ffcf7a'], [1, '#e08a3a']]); cx.fillRect(120, 210, 150, 150);
      cx.fillStyle = 'rgba(60,30,10,.75)';
      [[150, 300, 18], [200, 290, 22], [240, 306, 16]].forEach(([x, y, r]) => { ell(cx, x, y, r, r); cx.fill(); cx.fillRect(x - r, y + r - 4, r * 2, 60); });
      cx.strokeStyle = '#1a1512'; cx.lineWidth = 8; cx.strokeRect(120, 210, 150, 150); cx.beginPath(); cx.moveTo(195, 210); cx.lineTo(195, 360); cx.moveTo(120, 285); cx.lineTo(270, 285); cx.stroke();
      if (st.char > 0) { cx.fillStyle = `rgba(10,6,4,${0.6 * st.char})`; ell(cx, 330, 260, 90, 170); cx.fill(); }
      // driveway
      cx.fillStyle = '#1b1715'; cx.fillRect(e.x0, 540, e.x1 - e.x0, e.y1 - 540);
      cx.strokeStyle = 'rgba(239,230,210,.08)'; for (let x = 340; x < 1100; x += 120) { cx.beginPath(); cx.moveTo(x, 540); cx.lineTo(x - 60, 620); cx.stroke(); }
      cx.fillStyle = 'rgba(239,230,210,.45)'; cx.font = '600 22px Caveat, cursive'; cx.textAlign = 'center';
      cx.fillText('← about four feet from the garage', 450, 600);
      // propane tank
      cx.fillStyle = linear(cx, 760, 0, 840, 0, [[0, '#9fa3a5'], [0.4, '#eef0f0'], [1, '#8a8e90']]); rr(cx, 760, 430, 80, 110, 30); cx.fill(); cx.strokeStyle = '#222'; cx.lineWidth = 2; cx.stroke();
      cx.strokeStyle = '#555'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(770, 470); cx.bezierCurveTo(700, 520, 680, 520, 640, 512); cx.stroke();
      // burner stand
      cx.strokeStyle = '#2a2a2a'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(POT.x - 80, 540); cx.lineTo(POT.x - 60, POT.bot + 6); cx.moveTo(POT.x + 80, 540); cx.lineTo(POT.x + 60, POT.bot + 6); cx.moveTo(POT.x, 544); cx.lineTo(POT.x, POT.bot + 6); cx.stroke();
      for (let i = -5; i <= 5; i++) { const fl = 14 + Math.sin(t * 30 + i) * 4; cx.fillStyle = 'rgba(80,140,255,.85)'; ell(cx, POT.x + i * 11, POT.bot + 12 - fl / 2, 4, fl / 2); cx.fill(); }
      // pot back rim, oil
      cx.fillStyle = '#2a2b2c'; ell(cx, POT.x, POT.top, POT.rx, 20); cx.fill();
      const oilTop = Math.max(POT.top - 40, st.oil);
      cx.fillStyle = radial(cx, POT.x, oilTop, POT.rx, [[0, '#ffd87a'], [0.7, '#c98a2a'], [1, '#7a4a10']], POT.x - 30 + Math.sin(t * 3) * 12, oilTop);
      if (st.oil > POT.top + 2) { cx.save(); ell(cx, POT.x, POT.top, POT.rx - 4, 18); cx.clip(); ell(cx, POT.x, st.oil, POT.rx - 4, 16); cx.fill(); cx.restore(); }
      // turkey (behind front wall when lowered)
      drawTurkey(POT.x, st.ty);
      // pot front body
      cx.save();
      cx.beginPath(); cx.moveTo(POT.x - POT.rx, POT.top); cx.lineTo(POT.x - POT.rx + 6, POT.bot); cx.ellipse(POT.x, POT.bot, POT.rx - 6, 16, 0, Math.PI, 0, true); cx.lineTo(POT.x + POT.rx, POT.top); cx.ellipse(POT.x, POT.top, POT.rx, 20, 0, 0, Math.PI, false); cx.closePath();
      cx.fillStyle = linear(cx, POT.x - POT.rx, 0, POT.x + POT.rx, 0, [[0, '#3c3e40'], [0.3, '#b9bcbe'], [0.45, '#e6e8e9'], [0.62, '#8c9092'], [1, '#2c2e30']]);
      cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.8)'; cx.lineWidth = 3; cx.stroke(); cx.restore();
      cx.strokeStyle = '#151515'; cx.lineWidth = 4; ell(cx, POT.x, POT.top, POT.rx, 20); cx.stroke();
      // overflow oil on the outside
      if (st.phase === 'boilover' || st.phase === 'fire' || st.phase === 'after') {
        cx.fillStyle = 'rgba(214,150,50,.85)';
        for (let i = 0; i < 7; i++) { const x = POT.x - POT.rx + 14 + i * 28, len = clamp(st.spill * (80 + (i % 3) * 40), 0, 200); rr(cx, x, POT.top, 10, len, 5); cx.fill(); }
      }
      // particles (foam, fire, smoke)
      P.list.forEach((p) => {
        const k = p.life / p.max;
        if (p.kind === 'foam') { cx.fillStyle = `rgba(255,235,180,${0.8 * (1 - k)})`; ell(cx, p.x, p.y, p.r, p.r); cx.fill(); }
        else if (p.kind === 'fire') {
          cx.globalCompositeOperation = 'lighter';
          const r = p.r * (1 + k * 2.4);
          cx.fillStyle = radial(cx, p.x, p.y, r, [[0, `rgba(255,${Math.round(240 - k * 150)},${Math.round(160 - k * 150)},${0.9 * (1 - k)})`], [1, 'rgba(255,80,20,0)']]);
          ell(cx, p.x, p.y, r, r); cx.fill();
          cx.globalCompositeOperation = 'source-over';
        } else if (p.kind === 'smoke') { const r = p.r * (1 + k * 3); cx.fillStyle = radial(cx, p.x, p.y, r, [[0, `rgba(30,26,24,${0.55 * (1 - k)})`], [1, 'rgba(30,26,24,0)']]); ell(cx, p.x, p.y, r, r); cx.fill(); }
        else if (p.kind === 'bubble') { cx.strokeStyle = `rgba(255,240,200,${0.7 * (1 - k)})`; cx.lineWidth = 1.5; ell(cx, p.x, p.y, p.r, p.r * 0.6); cx.stroke(); }
      });
      if (st.fire > 0) {
        cx.globalCompositeOperation = 'lighter';
        cx.fillStyle = radial(cx, POT.x, 300, 900, [[0, `rgba(255,150,60,${0.45 * st.fire})`], [1, 'rgba(255,100,40,0)']]);
        cx.fillRect(e.x0, e.y0, e.x1 - e.x0, e.y1 - e.y0);
        cx.globalCompositeOperation = 'source-over';
      }
      // Dale's line
      cx.textAlign = 'left'; cx.fillStyle = '#efe6d2'; cx.font = '700 25px Caveat, cursive';
      const line = st.frozen ? 'Dale: “Frozen’s fine. It all cooks the same.”' : 'Dale: “Thawed? Fancy.”';
      if (st.phase === 'idle' || st.phase === 'lowering') cx.fillText(line, 380, 70);
    }
    function boilover() {
      st.phase = 'boilover'; st.spill = 0; ui.hint('Uh oh.');
      const hiss = sc.sound(A.sfx('sizzle', { g: 0.8 }));
      U.tween({ from: st.oil, to: POT.top - 34, dur: 0.75, ease: 'inQuad', onUpdate: (o) => { st.oil = o; } });
      U.tween({ from: 0, to: 1, dur: 1.1, ease: 'inQuad', delay: 0.3, onUpdate: (s) => { st.spill = s; } });
      for (let i = 0; i < 60; i++) sc.timeout(() => P.add({ kind: 'foam', x: POT.x + R(-90, 90), y: POT.top - R(0, 30), vx: R(-40, 40), vy: R(-200, -40), g: 500, r: R(4, 10), max: R(0.5, 1) }), i * 14);
      sc.timeout(() => { hiss.stop(0.2); fireball(); }, 1150);
    }
    function fireball() {
      st.phase = 'fire';
      st.firesThisVisit++;
      LT.stats.inc('fryerFires');
      A.sfx('boom', { g: 1 });
      LT.fx.flash('#ffb347', 0.55); LT.fx.shake(26, 1.4); LT.light.pulse();
      const sp = v.toScreen(POT.x, POT.top);
      LT.fx.sparks(sp.x, sp.y, 80, { speed: [200, 900] });
      LT.fx.embers(10); sc.timeout(() => LT.fx.embers(0), 4000); sc.cleanup(() => LT.fx.embers(0));
      for (let i = 0; i < (RM ? 60 : 220); i++) {
        sc.timeout(() => {
          const a = -Math.PI / 2 + R(-0.9, 0.9);
          P.add({ kind: 'fire', x: POT.x + R(-100, 100), y: POT.top + R(-10, 80), vx: Math.cos(a) * R(60, 420), vy: Math.sin(a) * R(200, 700), g: -80, drag: 0.985, r: R(18, 46), max: R(0.6, 1.5) });
          if (Math.random() < 0.3) P.add({ kind: 'smoke', x: POT.x + R(-80, 80), y: POT.top - R(60, 200), vx: R(-60, 60), vy: R(-160, -60), r: R(30, 60), max: R(2, 3.5) });
        }, i * 9);
      }
      U.tween({ from: 0, to: 1, dur: 0.2, onUpdate: (f) => { st.fire = f; } });
      U.tween({ from: 1, to: 0.15, dur: 3, delay: 0.6, onUpdate: (f) => { st.fire = f; } });
      U.tween({ from: st.char, to: 1, dur: 1.4, delay: 0.3, onUpdate: (c) => { st.char = c; } });
      U.tween({ from: st.ty, to: st.ty - 120, dur: 0.35, ease: 'outQuad', onUpdate: (y) => { st.ty = y; st.target = y; } });
      sc.timeout(advice, 2600);
    }
    function advice() {
      st.phase = 'after';
      const card = el('div', { class: 'sp-advice lt-card' },
        el('div', { class: 'lt-eyebrow' }, 'Okay. Here’s what just happened.'),
        el('p', null, 'Water hits 350°F oil and flashes to steam. A frozen bird is mostly water. The oil foams over the rim, onto the flame, and up.'),
        el('ol', null,
          el('li', null, 'Thaw it all the way, in the fridge: about one day for every 4 to 5 pounds.'),
          el('li', null, 'Pat it dry, inside and out.'),
          el('li', null, 'Measure the oil first: put the bird in the pot with water, mark the line, then dry everything.'),
          el('li', null, 'Outside, on flat ground, far from the house. Never on a deck, never in a garage.'),
          el('li', null, 'Burner off while you lower it. Slowly.'),
          el('li', null, 'Keep a fire extinguisher nearby. Never water on a grease fire.')),
        el('p', { class: 'sp-small' }, 'Thanksgiving is the peak day of the year for home cooking fires.'),
        el('div', { class: 'sp-row' },
          el('button', { class: 'lt-btn lt-btn--ink', type: 'button', on: { click: () => { card.remove(); reset(false); } } }, 'Try again, thawed'),
          el('button', { class: 'lt-btn lt-btn--ghost sp-ghost-ink', type: 'button', on: { click: () => { card.remove(); reset(true); } } }, 'Let Dale try again')));
      host.appendChild(card);
      sc.cleanup(() => card.remove());
      ui.hint('');
    }
    function success() {
      st.phase = 'done';
      ui.hint('Golden brown in about three to four minutes a pound. Uncle Dale is, for once, speechless.');
      ui.status('Safe fry. The garage lives.');
      A.sfx('tada');
      const sp = v.toScreen(POT.x, POT.top - 80);
      LT.fx.confetti(sp.x, sp.y, { count: 60 });
      if (st.firesThisVisit > 0 || LT.stats.get('fryerFires') > 0) LT.egg('learned', 'Learned the hard way', 'Burned the driveway, then did it right.');
    }
    function reset(frozen) {
      st.frozen = frozen; st.ty = 140; st.target = 140; st.oil = st.oilBase; st.phase = 'idle'; st.fire = 0; st.spill = 0; st.done = false;
      P.clear(); if (sizzle) { sizzle.stop(0.2); sizzle = null; }
      setToggle();
      ui.hint('Drag down to lower the turkey into the oil.');
      ui.status('');
    }
    v.input({
      down(p) { if (st.phase === 'idle' || st.phase === 'lowering') dragStart = { y: p.y, ty: st.target }; },
      move(p) { if (dragStart) st.target = clamp(dragStart.ty + (p.y - dragStart.y), 60, 452); },
      up() { dragStart = null; },
    });
    sc.on(v.cv, 'keydown', (e) => { if (e.key === 'ArrowDown') { st.target = clamp(st.target + 14, 60, 452); e.preventDefault(); } if (e.key === 'ArrowUp') { st.target = clamp(st.target - 14, 60, 452); e.preventDefault(); } });
    v.cv.tabIndex = 0; v.cv.setAttribute('aria-label', 'Turkey fryer. Use the arrow keys to lower the turkey.');
    let smoothV = 0;
    sc.frame((dt, t) => {
      const prev = st.ty;
      if (st.phase === 'idle' || st.phase === 'lowering') {
        st.ty += (st.target - st.ty) * Math.min(1, dt * 14);
        smoothV = lerp(smoothV, (st.ty - prev) / Math.max(dt, 0.001), 0.3);
        const bottom = st.ty + 56;
        if (bottom > st.oil && st.phase === 'idle') {
          st.phase = 'lowering';
          if (st.frozen) { boilover(); }
          else if (smoothV > 260) {
            ui.hint('Too fast! Splash. Lower it slowly.');
            A.sfx('whoomp'); A.sfx('splat', { g: 0.3 });
            for (let i = 0; i < 40; i++) P.add({ kind: 'fire', x: POT.x + R(-100, 100), y: POT.top + R(0, 40), vx: R(-80, 80), vy: R(-300, -80), g: -40, r: R(10, 22), max: R(0.4, 0.9) });
            LT.fx.shake(6, 0.3);
          }
        }
        if (st.phase === 'lowering' && !st.frozen) {
          if (!sizzle) sizzle = sc.sound(A.sfx('sizzle', { g: 0.25 }));
          const depth = clamp((st.ty + 56 - st.oil) / 140, 0, 1);
          sizzle.set(0.3 + depth * 1.2);
          if (Math.random() < 0.6) P.add({ kind: 'bubble', x: POT.x + R(-80, 80), y: st.oil + R(-4, 6), vx: 0, vy: R(-30, -10), r: R(2, 6), max: R(0.3, 0.8) });
          if (st.ty >= 440 && !st.done) { st.done = true; success(); }
          if (st.ty + 56 < st.oil - 6) { st.phase = 'idle'; if (sizzle) { sizzle.stop(0.3); sizzle = null; } }
        }
      } else if (st.phase === 'fire' || st.phase === 'after') {
        if (Math.random() < 0.5) P.add({ kind: 'fire', x: POT.x + R(-70, 70), y: POT.top + R(-10, 30), vx: R(-30, 30), vy: R(-200, -80), g: -40, r: R(12, 26), max: R(0.5, 1) });
        if (Math.random() < 0.15) P.add({ kind: 'smoke', x: POT.x + R(-60, 60), y: POT.top - 80, vx: R(-20, 20), vy: R(-90, -40), r: R(20, 40), max: 3 });
      }
      P.step(dt);
      draw(t);
    });
    let tg;
    function setToggle() {
      if (!tg) return;
      tg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.f === '1') === st.frozen)));
    }
    tg = ui.segmented([['Frozen solid', '1'], ['Thawed & patted dry', '0']], (val) => { if (st.phase === 'idle' || st.phase === 'done' || st.phase === 'lowering') reset(val === '1'); });
    setToggle();
    ui.hint('Drag down to lower the turkey into the oil.');
  };

  /* ======================================================================
     GREEN BEAN CASSEROLE — make it rain onions
     ====================================================================== */
  TOYS.casserole = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc, 'sp-nocursor');
    const cx = v.cx;
    const D = { x: 170, y: 300, w: 660, h: 250, r: 46 }; // dish outer
    const I = { x: 210, y: 330, w: 580, h: 190, r: 30 }; // interior
    const rnd = U.seeded(1955);
    // pre-render beans in cream onto an offscreen layer
    const base = document.createElement('canvas'); base.width = I.w; base.height = I.h;
    { const b = base.getContext('2d');
      b.fillStyle = '#d8cca2'; rr(b, 0, 0, I.w, I.h, I.r); b.fill();
      for (let i = 0; i < 70; i++) { const x = 20 + rnd() * (I.w - 40), y = 16 + rnd() * (I.h - 32), a = rnd() * Math.PI, l = 26 + rnd() * 26;
        b.strokeStyle = '#4f6e2c'; b.lineWidth = 11; b.lineCap = 'round'; b.beginPath(); b.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2); b.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2); b.stroke();
        b.strokeStyle = '#7d9c48'; b.lineWidth = 4; b.beginPath(); b.moveTo(x - Math.cos(a) * l / 2.4, y - Math.sin(a) * l / 2.4 - 2); b.lineTo(x + Math.cos(a) * l / 2.4, y + Math.sin(a) * l / 2.4 - 2); b.stroke(); }
      for (let i = 0; i < 50; i++) { b.fillStyle = 'rgba(225,212,170,.75)'; ell(b, rnd() * I.w, rnd() * I.h, 10 + rnd() * 18, 5 + rnd() * 8); b.fill(); }
      for (let i = 0; i < 20; i++) { b.fillStyle = 'rgba(120,90,60,.5)'; ell(b, rnd() * I.w, rnd() * I.h, 5, 3); b.fill(); }
    }
    const top = document.createElement('canvas'); top.width = VW; top.height = VH;
    const tc = top.getContext('2d');
    const falling = [];
    let pouring = false, count = 0, baked = 0, lastCrunch = 0, joked = false;
    function onion(c, x, y, s, rot, shade) {
      c.save(); c.translate(x, y); c.rotate(rot);
      const col = shade || '#c98a3a';
      c.strokeStyle = 'rgba(60,30,8,.55)'; c.lineWidth = 6 * s; c.lineCap = 'round';
      c.beginPath(); c.arc(0, 0, 9 * s, 0.3, TAU * 0.8); c.stroke();
      c.strokeStyle = col; c.lineWidth = 4 * s;
      c.beginPath(); c.arc(0, 0, 9 * s, 0.3, TAU * 0.8); c.stroke();
      c.strokeStyle = 'rgba(255,230,160,.6)'; c.lineWidth = 1.4 * s; c.beginPath(); c.arc(0, 0, 9 * s, 1.2, 2.6); c.stroke();
      c.restore();
    }
    function spawn(x) {
      for (let i = 0; i < 2; i++) falling.push({ x: x + R(-20, 20), y: 150, vx: R(-60, 60), vy: R(-40, 80), rot: R(TAU), vr: R(-8, 8), s: R(0.8, 1.4), land: R(I.y + 10, I.y + I.h - 12), col: U.pick(['#c98a3a', '#d89a44', '#b87a2c', '#e0a84f']) });
    }
    const can = { x: 500, y: 120, tilt: 0 };
    function draw(t) {
      bg(v, '#1d1610', '#0e0b07');
      v.begin(null);
      const e = v.ext();
      cx.fillStyle = linear(cx, 0, 260, 0, e.y1, [[0, '#2a2015'], [1, '#140f0a']]); cx.fillRect(e.x0, 260, e.x1 - e.x0, e.y1 - 260);
      // dish
      cx.fillStyle = 'rgba(0,0,0,.45)'; rr(cx, D.x + 12, D.y + 24, D.w, D.h, D.r); cx.fill();
      cx.fillStyle = linear(cx, 0, D.y, 0, D.y + D.h, [[0, '#f5efe2'], [1, '#c9bea6']]); rr(cx, D.x, D.y, D.w, D.h, D.r); cx.fill();
      cx.strokeStyle = 'rgba(28,19,12,.8)'; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = 'rgba(45,79,138,.7)'; cx.lineWidth = 4; rr(cx, D.x + 10, D.y + 10, D.w - 20, D.h - 20, D.r - 8); cx.stroke();
      [D.x - 34, D.x + D.w + 4].forEach((x) => { cx.fillStyle = '#e8e0cd'; rr(cx, x, D.y + 90, 30, 70, 12); cx.fill(); cx.strokeStyle = 'rgba(28,19,12,.8)'; cx.lineWidth = 2.5; cx.stroke(); });
      cx.drawImage(base, I.x, I.y);
      cx.drawImage(top, 0, 0);
      if (baked > 0) { cx.save(); rr(cx, I.x, I.y, I.w, I.h, I.r); cx.clip(); cx.globalCompositeOperation = 'multiply'; cx.fillStyle = `rgba(150,90,40,${baked * 0.45})`; cx.fillRect(I.x, I.y, I.w, I.h); cx.restore(); }
      falling.forEach((o) => onion(cx, o.x, o.y, o.s, o.rot, o.col));
      // the can of fried onions
      const p = v.ptr;
      const tx = clamp(p.inside || p.down ? p.x : can.x, 120, 880);
      can.x += (tx - can.x) * 0.3;
      can.tilt += ((pouring ? 2.1 : 0.2) - can.tilt) * 0.2;
      cx.save(); cx.translate(can.x + 40, 110); cx.rotate(can.tilt);
      cx.fillStyle = linear(cx, -40, 0, 40, 0, [[0, '#7a3d10'], [0.4, '#e2902c'], [0.6, '#f0a83c'], [1, '#6a330c']]);
      rr(cx, -40, -70, 80, 130, 8); cx.fill(); cx.strokeStyle = 'rgba(28,19,12,.8)'; cx.lineWidth = 2.5; cx.stroke();
      cx.fillStyle = '#efe6d2'; cx.fillRect(-40, -30, 80, 44);
      cx.fillStyle = '#6f1526'; cx.textAlign = 'center'; cx.font = '13px "IM Fell English SC", Georgia, serif'; cx.fillText('FRIED', 0, -12); cx.fillText('ONIONS', 0, 6);
      cx.fillStyle = '#d9dbdc'; ell(cx, 0, -70, 40, 9); cx.fill(); cx.stroke();
      cx.restore();
      cx.fillStyle = 'rgba(239,230,210,.6)'; cx.font = '600 24px Caveat, cursive'; cx.textAlign = 'center';
      cx.fillText(count ? `${count} onion bits` : 'hold to pour', 500, 600);
    }
    v.input({ down() { pouring = true; }, up() { pouring = false; } });
    let acc = 0;
    sc.frame((dt, t) => {
      if (pouring) { acc += dt; while (acc > 0.025) { acc -= 0.025; spawn(can.x); } }
      for (let i = falling.length - 1; i >= 0; i--) {
        const o = falling[i];
        o.vy += 1300 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt;
        const inDish = o.x > I.x + 6 && o.x < I.x + I.w - 6;
        const floor = inDish ? o.land : 560 + (o.s * 10);
        if (o.y >= floor) {
          onion(tc, o.x, floor, o.s, o.rot, o.col);
          falling.splice(i, 1);
          count++;
          if (performance.now() - lastCrunch > 110) { lastCrunch = performance.now(); A.sfx('crunch', { n: 3, pan: (o.x - 500) / 600 }); }
        }
      }
      if (count && count % 25 === 0) LT.stats.set('onionsDropped', Math.max(LT.stats.get('onionsDropped'), count));
      if (count > 700 && !joked) { joked = true; ui.status('That is not a casserole anymore. That is a mattress of onions.'); }
      draw(t);
    });
    ui.button('Bake at 350°F', async () => {
      ui.status('Baking…'); A.sfx('ding');
      for (let i = 0; i < 6; i++) sc.timeout(() => { const sp = v.toScreen(R(I.x, I.x + I.w), I.y + 40); LT.fx.steam(sp.x, sp.y, { count: 4 }); }, i * 180);
      await U.tween({ from: baked, to: Math.min(1, baked + 0.5), dur: 1.4, onUpdate: (b) => { baked = b; } }).done;
      if (!sc.alive) return;
      ui.status(baked >= 1 ? 'Very golden. Someone will call it "rustic."' : 'Golden. Dorcas Reilly would be pleased.');
    });
    ui.button('Pour a handful', () => { for (let i = 0; i < 24; i++) sc.timeout(() => spawn(R(250, 750)), i * 20); });
    ui.hint('Press and hold to pour the onions.');
  };

  /* ======================================================================
     SWEET POTATOES — the torch
     ====================================================================== */
  TOYS.yams = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc, 'sp-nocursor');
    const cx = v.cx;
    const DX = 500, DY = 400, DRX = 360, DRY = 150;
    const rnd = U.seeded(1917);
    const mallows = [];
    for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) {
      const x = DX - 245 + i * 98 + (row % 2) * 49, y = DY - 80 + row * 52;
      if (Math.pow((x - DX) / (DRX * 0.82), 2) + Math.pow((y - DY) / (DRY * 0.78), 2) < 1) mallows.push({ x: x + rnd() * 10 - 5, y: y + rnd() * 8 - 4, t: 0, burning: false, charred: false, counted: false, wob: rnd() * TAU });
    }
    const flames = particles();
    let firing = false, holdT = 0, downAt = 0, torch = null, burntCount = 0, praised = false, ffx = { x: 700, y: 160 };
    const COL = [[0, '#fbf6ec'], [0.45, '#f3dba2'], [0.8, '#d39a4a'], [1.05, '#9a5a24'], [1.3, '#4a2812'], [1.6, '#1d120c']];
    function drawMallow(m) {
      const c = ramp(COL, m.t);
      cx.fillStyle = 'rgba(80,40,10,.35)'; ell(cx, m.x + 4, m.y + 10, 30, 11); cx.fill();
      cx.fillStyle = ramp(COL, Math.max(0, m.t - 0.25));
      rr(cx, m.x - 28, m.y - 14, 56, 24, 12); cx.fill();
      cx.fillStyle = c; ell(cx, m.x, m.y - 14, 28, 11); cx.fill();
      cx.strokeStyle = 'rgba(60,30,10,.35)'; cx.lineWidth = 1.5; ell(cx, m.x, m.y - 14, 28, 11); cx.stroke();
      if (m.t > 0.4 && m.t < 1.2) { cx.fillStyle = 'rgba(120,60,20,.25)'; ell(cx, m.x + 6, m.y - 15, 12, 4); cx.fill(); }
      if (m.t < 0.6) { cx.fillStyle = 'rgba(255,255,255,.7)'; ell(cx, m.x - 9, m.y - 17, 9, 3); cx.fill(); }
    }
    function draw(t) {
      bg(v, '#1d1610', '#0e0b07');
      v.begin(null);
      const e = v.ext();
      cx.fillStyle = linear(cx, 0, 300, 0, e.y1, [[0, '#2a2015'], [1, '#140f0a']]); cx.fillRect(e.x0, 300, e.x1 - e.x0, e.y1 - 300);
      plate(cx, DX, DY, DRX + 30, DRY + 22, 'ceramic');
      cx.fillStyle = radial(cx, DX, DY, DRX, [[0, '#f39a4a'], [0.7, '#d9702e'], [1, '#a84d1c']], DX - 60, DY - 40);
      ell(cx, DX, DY, DRX - 6, DRY - 6); cx.fill();
      cx.save(); ell(cx, DX, DY, DRX - 6, DRY - 6); cx.clip();
      for (let i = 0; i < 40; i++) { cx.fillStyle = 'rgba(255,200,140,.18)'; const a = i * 2.4; ell(cx, DX + Math.cos(a) * (i * 8 % 320), DY + Math.sin(a * 1.3) * (i * 3 % 130), 22, 8, a); cx.fill(); }
      cx.restore();
      mallows.slice().sort((a, b) => a.y - b.y).forEach(drawMallow);
      flames.list.forEach((p) => {
        const k = p.life / p.max;
        cx.globalCompositeOperation = 'lighter';
        cx.fillStyle = radial(cx, p.x, p.y, p.r * (1 - k * 0.5), [[0, `rgba(255,${p.blue ? 220 : 210},${p.blue ? 255 : 120},${0.85 * (1 - k)})`], [1, p.blue ? 'rgba(60,110,255,0)' : 'rgba(255,90,20,0)']]);
        ell(cx, p.x, p.y, p.r, p.r * 1.3); cx.fill();
        cx.globalCompositeOperation = 'source-over';
      });
      // the torch: nozzle aims down-left at the pointer
      const p = v.ptr;
      if (p.inside || p.down) { ffx.x = p.x; ffx.y = p.y; }
      const nz = nozzle();
      cx.save(); cx.translate(nz.x, nz.y); cx.rotate(0.5);
      cx.fillStyle = linear(cx, -8, 0, 8, 0, [[0, '#5a5e60'], [0.5, '#e4e6e7'], [1, '#4a4e50']]); rr(cx, -7, -70, 14, 70, 3); cx.fill();
      cx.fillStyle = '#1e1e1e'; rr(cx, -9, -6, 18, 8, 2); cx.fill();
      cx.fillStyle = '#2a2a2a'; rr(cx, -18, -112, 36, 46, 7); cx.fill();
      cx.fillStyle = '#f2c14e'; rr(cx, 14, -104, 14, 22, 4); cx.fill();
      cx.fillStyle = linear(cx, -27, 0, 27, 0, [[0, '#6a140e'], [0.45, '#d83a28'], [1, '#5a120c']]); rr(cx, -27, -232, 54, 124, 16); cx.fill();
      cx.strokeStyle = 'rgba(20,10,6,.85)'; cx.lineWidth = 2.5; cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,.25)'; rr(cx, -18, -224, 8, 100, 4); cx.fill();
      cx.restore();
      if (!firing && (p.inside || p.down)) { cx.strokeStyle = 'rgba(242,193,78,.4)'; cx.setLineDash([4, 6]); cx.lineWidth = 2; ell(cx, ffx.x, ffx.y, 26, 12); cx.stroke(); cx.setLineDash([]); }
    }
    const DIR = { x: -Math.sin(0.5), y: Math.cos(0.5) };
    function nozzle() { return { x: ffx.x - DIR.x * 96, y: ffx.y - DIR.y * 96 }; }
    v.input({
      down(p) {
        downAt = performance.now();
        // tap on a burning marshmallow blows it out
        const hit = mallows.find((m) => m.burning && Math.hypot(m.x - p.x, m.y - 14 - p.y) < 40);
        if (hit) { blowOut(hit); return; }
        firing = true; torch = sc.sound(A.sfx('torch', { g: 0.32 }));
      },
      up() { firing = false; if (torch) { torch.stop(0.15); torch = null; } },
    });
    function blowOut(m) {
      m.burning = false; m.t = Math.max(m.t, 1.35);
      A.sfx('blow', { dur: 0.5, g: 0.3 }); A.sfx('snuff');
      const sp = v.toScreen(m.x, m.y - 30); LT.fx.smoke(sp.x, sp.y, { count: 8 });
    }
    function report() {
      const gold = mallows.filter((m) => m.t >= 0.45 && m.t < 1.0).length;
      const burnt = mallows.filter((m) => m.t >= 1.3).length;
      const fire = mallows.filter((m) => m.burning).length;
      ui.status(`Golden: ${gold} · Burnt: ${burnt}${fire ? ` · On fire: ${fire}` : ''}`);
      if (gold >= 10 && !praised) { praised = true; ui.hint('Perfect. Janet McKenzie Hill would put this in a booklet.'); A.sfx('chime'); }
      if (burnt === mallows.length) ui.hint('Every single one. Uncle Dale has entered the chat.');
      blowBtn.hidden = fire === 0;
    }
    const blowBtn = ui.button('Blow them out', () => mallows.filter((m) => m.burning).forEach(blowOut));
    blowBtn.hidden = true;
    ui.button('Fresh marshmallows', () => { mallows.forEach((m) => { m.t = 0; m.burning = false; m.counted = false; }); praised = false; report(); });
    let acc = 0;
    sc.frame((dt, t) => {
      const nz = nozzle();
      const tip = { x: ffx.x, y: ffx.y };
      if (firing) {
        for (let i = 0; i < 5; i++) {
          const sp = R(420, 680), j = R(-0.12, 0.12);
          flames.add({ x: nz.x, y: nz.y, vx: (DIR.x + j) * sp, vy: (DIR.y - j * 0.5) * sp, drag: 0.96, r: R(7, 15), max: R(0.12, 0.22), blue: Math.random() < 0.55 });
        }
        mallows.forEach((m) => {
          const d = Math.hypot(m.x - tip.x, m.y - 14 - tip.y);
          if (d < 70) m.t += dt * (1.1 - d / 90) * 0.9;
        });
      }
      mallows.forEach((m) => {
        if (!m.burning && m.t > 1.35 && m.t < 1.9 && Math.random() < dt * 1.5) m.burning = true;
        if (m.burning) {
          m.t += dt * 0.12;
          if (Math.random() < 0.5) flames.add({ x: m.x + R(-10, 10), y: m.y - 22, vx: R(-15, 15), vy: R(-110, -60), r: R(6, 12), max: R(0.3, 0.6) });
          mallows.forEach((n) => { if (n !== m && Math.hypot(n.x - m.x, n.y - m.y) < 110) n.t += dt * 0.08; });
          if (m.t > 2.4) { m.burning = false; }
        }
        if (!m.counted && m.t >= 1.3) { m.counted = true; burntCount++; LT.stats.inc('marshmallowsBurnt'); }
      });
      flames.step(dt);
      acc += dt; if (acc > 0.25) { acc = 0; report(); }
      draw(t);
    });
    ui.hint('Press and hold to fire the torch. Tap a burning one to blow it out.');
    report();
  };

  /* ======================================================================
     PUMPKIN PIE — pipe the cream
     ====================================================================== */
  TOYS.pie = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc, 'sp-nocursor');
    const cx = v.cx;
    const PX = 500, PY = 330, PRX = 330, PRY = 230;
    const rnd = U.seeded(1796);
    const speck = Array.from({ length: 220 }, () => { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.82; return { x: PX + Math.cos(a) * r * PRX, y: PY + Math.sin(a) * r * PRY, s: 0.6 + rnd() * 1.8 }; });
    const cream = document.createElement('canvas'); cream.width = VW; cream.height = VH;
    const cc = cream.getContext('2d');
    let last = null, dollops = 0, lastSpray = 0, warned = false;
    function dollop(x, y, r) {
      cc.fillStyle = 'rgba(60,30,10,.25)'; ell(cc, x + 3, y + 5, r * 1.05, r * 0.8); cc.fill();
      cc.fillStyle = radial(cc, x, y, r * 1.1, [[0, '#ffffff'], [0.55, '#fbf4e6'], [1, '#dccfb4']], x - r * 0.35, y - r * 0.4);
      cc.beginPath();
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, rr2 = r * (i % 2 ? 0.86 : 1.02); cc.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2 * 0.86); }
      cc.closePath(); cc.fill();
      cc.strokeStyle = 'rgba(200,185,160,.7)'; cc.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.4; cc.beginPath(); cc.moveTo(x, y - r * 0.1); cc.quadraticCurveTo(x + Math.cos(a + 0.6) * r * 0.5, y + Math.sin(a + 0.6) * r * 0.4, x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.72); cc.stroke(); }
      cc.fillStyle = 'rgba(255,255,255,.9)'; ell(cc, x - r * 0.25, y - r * 0.35, r * 0.25, r * 0.12, -0.5); cc.fill();
      dollops++;
    }
    function drawPie() {
      plate(cx, PX, PY + 16, PRX + 50, PRY + 44, 'pewter');
      // crust
      cx.fillStyle = radial(cx, PX, PY, PRX + 30, [[0, '#e8b46a'], [0.85, '#d39a52'], [1, '#9a6a2c']]);
      ell(cx, PX, PY, PRX + 26, PRY + 22); cx.fill();
      for (let i = 0; i < 44; i++) {
        const a = (i / 44) * TAU, x = PX + Math.cos(a) * (PRX + 14), y = PY + Math.sin(a) * (PRY + 12);
        cx.fillStyle = radial(cx, x, y, 18, [[0, '#f2c584'], [1, '#c08440']], x - 4, y - 5);
        ell(cx, x, y, 17, 13, a); cx.fill(); cx.strokeStyle = 'rgba(110,60,20,.4)'; cx.lineWidth = 1.5; cx.stroke();
      }
      cx.fillStyle = radial(cx, PX, PY, PRX, [[0, '#d0843e'], [0.6, '#b8662a'], [1, '#8d4a1c']], PX - 80, PY - 60);
      ell(cx, PX, PY, PRX - 6, PRY - 6); cx.fill();
      speck.forEach((s) => { cx.fillStyle = 'rgba(90,40,12,.35)'; ell(cx, s.x, s.y, s.s, s.s); cx.fill(); });
      cx.fillStyle = 'rgba(255,220,170,.16)'; ell(cx, PX - 90, PY - 80, 150, 50, -0.3); cx.fill();
      cx.strokeStyle = 'rgba(80,35,10,.35)'; cx.lineWidth = 2; ell(cx, PX, PY, PRX - 6, PRY - 6); cx.stroke();
    }
    function drawCan(x, y, spraying) {
      cx.save(); cx.translate(x + 20, y - 26); cx.rotate(0.5);
      cx.fillStyle = linear(cx, -24, 0, 24, 0, [[0, '#7c8083'], [0.4, '#eef0f0'], [1, '#6a6e70']]); rr(cx, -24, -150, 48, 130, 10); cx.fill();
      cx.strokeStyle = 'rgba(20,20,20,.7)'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#2d4f8a'; cx.fillRect(-24, -120, 48, 40);
      cx.fillStyle = '#efe6d2'; cx.font = '12px "IM Fell English SC", serif'; cx.textAlign = 'center'; cx.fillText('CREAM', 0, -96);
      cx.fillStyle = '#d9dbdc'; rr(cx, -12, -24, 24, 18, 4); cx.fill(); cx.stroke();
      cx.fillStyle = '#f3ecdc'; cx.beginPath(); cx.moveTo(-7, -8); cx.lineTo(7, -8); cx.lineTo(3, 14); cx.lineTo(-3, 14); cx.closePath(); cx.fill(); cx.stroke();
      cx.restore();
    }
    v.input({
      down(p) { last = p; A.sfx('spray', { dur: 0.25 }); dollop(p.x, p.y, R(16, 21)); },
      move(p) {
        if (!last) return;
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        const step = 11;
        if (d >= step) {
          const n = Math.floor(d / step);
          for (let i = 1; i <= n; i++) dollop(lerp(last.x, p.x, i / n) + R(-1.5, 1.5), lerp(last.y, p.y, i / n) + R(-1.5, 1.5), R(14, 20));
          last = p;
        }
        if (performance.now() - lastSpray > 280) { lastSpray = performance.now(); A.sfx('spray', { dur: 0.3, g: 0.12 }); }
      },
      up() {
        last = null;
        LT.stats.set('creamDollops', Math.max(LT.stats.get('creamDollops'), dollops));
        if (dollops > 450 && !warned) { warned = true; ui.status('At this point it is cream, with a side of pie.'); }
        else ui.status(`${dollops} dollops of cream.`);
      },
    });
    sc.frame(() => {
      bg(v, '#1d1610', '#0e0b07');
      v.begin(null);
      drawPie();
      cx.drawImage(cream, 0, 0);
      if (v.ptr.inside || v.ptr.down) drawCan(v.ptr.x, v.ptr.y, v.ptr.down);
    });
    ui.button('Eat it', () => { snd.chomp(); cc.clearRect(0, 0, VW, VH); dollops = 0; ui.status('Gone. Somebody fetch another pie.'); LT.stats.inc('piesEaten'); });
    ui.hint('Press and drag to pipe whipped cream. Write something, if you like.');
  };

  /* ======================================================================
     GRAVY — there is never enough
     ====================================================================== */
  TOYS.gravy = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc);
    const cx = v.cx;
    const M = { x: 600, y: 430 }; // potato mound
    const st = { pouring: false, tilt: 0, boat: 1, fill: 0, streak: 0, overflow: 0, empty: false, pours: 0 };
    const drops = particles();
    const rnd = U.seeded(4);
    const lumps = Array.from({ length: 26 }, () => ({ a: rnd() * Math.PI, r: 0.5 + rnd() * 0.5, s: 14 + rnd() * 18 }));
    let glug = 0;
    const BOAT = { x: 300, y: 190 };
    function spout() { const a = st.tilt; return { x: BOAT.x + Math.cos(a) * 118, y: BOAT.y - 10 + Math.sin(a) * 118 }; }
    function draw(t) {
      bg(v, '#1d1610', '#0e0b07');
      v.begin(null);
      const e = v.ext();
      cx.fillStyle = linear(cx, 0, 360, 0, e.y1, [[0, '#2a2015'], [1, '#140f0a']]); cx.fillRect(e.x0, 360, e.x1 - e.x0, e.y1 - 360);
      plate(cx, M.x, 500, 300, 86, 'ceramic');
      // mound
      cx.fillStyle = radial(cx, M.x, M.y, 210, [[0, '#fffaf0'], [0.6, '#efe3c6'], [1, '#cdbb93']], M.x - 50, M.y - 60);
      cx.beginPath(); cx.moveTo(M.x - 190, 500);
      cx.bezierCurveTo(M.x - 200, 420, M.x - 120, 340, M.x - 70, 335);
      cx.lineTo(M.x + 70, 335);
      cx.bezierCurveTo(M.x + 120, 340, M.x + 200, 420, M.x + 190, 500);
      cx.ellipse(M.x, 500, 190, 40, 0, 0, Math.PI, false); cx.fill();
      lumps.forEach((l) => { cx.fillStyle = 'rgba(255,255,255,.35)'; ell(cx, M.x + Math.cos(l.a) * 150 * l.r - 0, 470 - Math.sin(l.a) * 120 * l.r, l.s, l.s * 0.5); cx.fill(); });
      // crater
      cx.fillStyle = '#d8c7a0'; ell(cx, M.x, 338, 74, 20); cx.fill();
      const lvl = clamp(st.fill, 0, 1);
      if (lvl > 0.02) { cx.fillStyle = radial(cx, M.x, 338, 74, [[0, '#8a5226'], [1, '#5a3214']], M.x - 20, 333); ell(cx, M.x, 338 + (1 - lvl) * 6, 70 * (0.4 + lvl * 0.6), 18 * (0.4 + lvl * 0.6)); cx.fill(); cx.fillStyle = 'rgba(255,230,190,.3)'; ell(cx, M.x - 20, 334, 20 * lvl, 3); cx.fill(); }
      if (st.overflow > 0) {
        cx.fillStyle = '#6b3f1d';
        [[-60, 1], [-20, 0.7], [30, 1.2], [70, 0.8]].forEach(([dx, k]) => { const len = st.overflow * 150 * k; rr(cx, M.x + dx - 9, 338, 18, len, 9); cx.fill(); ell(cx, M.x + dx, 338 + len, 12, 9); cx.fill(); });
        cx.fillStyle = 'rgba(107,63,29,.9)'; ell(cx, M.x, 505, 200 * st.overflow, 40 * st.overflow); cx.fill();
      }
      // stream
      if (st.pouring && st.boat > 0) {
        const s = spout();
        cx.strokeStyle = '#6b3f1d'; cx.lineWidth = 15 + Math.sin(t * 20) * 3; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(s.x, s.y); cx.quadraticCurveTo(s.x + 70, s.y + 10, M.x - 10 + Math.sin(t * 6) * 6, 336); cx.stroke();
        cx.strokeStyle = 'rgba(255,200,150,.3)'; cx.lineWidth = 4; cx.stroke();
      }
      drops.list.forEach((d) => { cx.fillStyle = '#6b3f1d'; ell(cx, d.x, d.y, d.r, d.r * 1.3); cx.fill(); });
      // boat
      cx.save(); cx.translate(BOAT.x, BOAT.y); cx.rotate(st.tilt);
      cx.fillStyle = 'rgba(0,0,0,.3)'; ell(cx, 10, 70, 120, 18); cx.fill();
      cx.fillStyle = linear(cx, 0, -30, 0, 60, [[0, '#f7f1e3'], [1, '#c9bea6']]);
      cx.beginPath(); cx.moveTo(-110, -24); cx.bezierCurveTo(-100, 50, 60, 60, 92, -4); cx.lineTo(126, -28); cx.lineTo(80, -24); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(28,19,12,.8)'; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = 'rgba(45,79,138,.7)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-100, -8); cx.bezierCurveTo(-60, 18, 40, 20, 84, 0); cx.stroke();
      cx.strokeStyle = 'rgba(28,19,12,.85)'; cx.lineWidth = 15; cx.beginPath(); cx.arc(-112, -2, 22, Math.PI * 0.55, Math.PI * 1.5); cx.stroke();
      cx.lineWidth = 10; cx.strokeStyle = '#efe6d2'; cx.beginPath(); cx.arc(-112, -2, 22, Math.PI * 0.55, Math.PI * 1.5); cx.stroke();
      if (st.boat > 0.02) { cx.fillStyle = '#5d3416'; ell(cx, -12, -24, 92 * Math.sqrt(st.boat), 9); cx.fill(); }
      cx.fillStyle = '#efe6d2'; ell(cx, -12, -26, 98, 10); cx.strokeStyle = 'rgba(28,19,12,.6)'; cx.lineWidth = 2; cx.stroke();
      cx.restore();
      // the meter
      const mx = 860, my = 110;
      cx.fillStyle = 'rgba(239,230,210,.08)'; rr(cx, mx - 118, my - 70, 236, 124, 8); cx.fill();
      cx.strokeStyle = 'rgba(239,230,210,.3)'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#efe6d2'; cx.textAlign = 'center'; cx.font = '13px "IM Fell English SC", Georgia, serif'; cx.fillText('IS THERE ENOUGH GRAVY?', mx, my - 46);
      cx.strokeStyle = 'rgba(239,230,210,.5)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(mx, my + 30, 60, Math.PI * 1.1, Math.PI * 1.9); cx.stroke();
      const needle = Math.PI * (1.12 + 0.76 * clamp(st.overflow > 0 ? 1 : st.fill * 0.62, 0, 1));
      cx.strokeStyle = '#f2c14e'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(mx, my + 30); cx.lineTo(mx + Math.cos(needle) * 54, my + 30 + Math.sin(needle) * 54); cx.stroke();
      cx.font = '700 22px Caveat, cursive'; cx.fillStyle = '#efe6d2';
      cx.fillText(st.overflow > 0 ? 'YES' : st.fill > 0.75 ? 'almost?' : 'no', mx, my + 44);
    }
    v.input({
      down() { if (st.boat <= 0) { ui.hint('The boat is empty. There is still not enough gravy.'); return; } st.pouring = true; st.pours++; LT.stats.inc('gravyPours'); A.sfx('pour', { n: 6 }); },
      up() { st.pouring = false; st.streak = 0; },
    });
    sc.frame((dt, t) => {
      st.tilt += ((st.pouring && st.boat > 0 ? 0.62 : 0) - st.tilt) * Math.min(1, dt * 8);
      if (st.pouring && st.boat > 0 && st.tilt > 0.4) {
        st.boat = Math.max(0, st.boat - dt * 0.085);
        st.streak += dt;
        st.fill += dt * 0.22;
        glug += dt; if (glug > 0.55) { glug = 0; A.sfx('pour', { n: 4 }); }
        if (Math.random() < 0.3) drops.add({ x: M.x + R(-40, 40), y: 336, vx: R(-80, 80), vy: R(-160, -60), g: 900, r: R(3, 6), max: 0.5 });
        if (st.boat <= 0) { st.pouring = false; ui.hint(st.overflow > 0 ? 'The boat is empty. For once, it does not matter.' : 'The boat is empty. There is still not enough gravy.'); }
      }
      // the potatoes drink it
      const absorb = st.pouring ? 0.13 : 0.55;
      st.fill = Math.max(0, st.fill - dt * absorb * (0.3 + st.fill));
      if (st.fill > 1 && st.overflow === 0) {
        st.overflow = 0.01;
        U.tween({ from: 0.01, to: 1, dur: 2.4, onUpdate: (o) => { st.overflow = o; } });
        A.sfx('splat'); A.sfx('cheer', { g: 0.12 });
        const sp = v.toScreen(M.x, 338);
        LT.fx.splat(sp.x - 40, sp.y + 30, { color: '#6b3f1d', size: 120 });
        LT.egg('enoughgravy', 'Enough gravy', 'For the first time in recorded history.');
        ui.status('There is, finally, enough gravy. Remember where you were.');
      }
      drops.step(dt, (d) => { if (d.y > 500) d.life = d.max; });
      draw(t);
    });
    ui.button('Make more gravy', () => { st.boat = 1; A.sfx('pour', { n: 5 }); ui.hint('Press and hold to pour.'); ui.status('Fresh gravy. Somebody whisked very hard.'); });
    ui.hint('Press and hold to pour.');
  };

  /* ======================================================================
     MACARONI AND CHEESE — a quiet forkful
     ====================================================================== */
  TOYS.mac = function (host, sc, ui) {
    const VW = 1000, VH = 620;
    const v = vcanvas(host, VW, VH, sc);
    const cx = v.cx;
    const DX = 500, DY = 420, DRX = 320, DRY = 138;
    const rnd = U.seeded(1765);
    const spots = Array.from({ length: 34 }, () => { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.88; return { x: DX + Math.cos(a) * r * DRX, y: DY + Math.sin(a) * r * DRY, rx: 10 + rnd() * 26, ry: 5 + rnd() * 10, a: rnd() * 0.6 }; });
    const elbows = Array.from({ length: 70 }, () => { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.9; return { x: DX + Math.cos(a) * r * DRX, y: DY + Math.sin(a) * r * DRY, rot: rnd() * TAU }; });
    const holes = [];
    let lift = null, pulls = 0;
    function draw(t) {
      bg(v, '#1a140e', '#0b0906');
      v.begin(null);
      const e = v.ext();
      cx.fillStyle = linear(cx, 0, 330, 0, e.y1, [[0, '#251c13'], [1, '#110d09']]); cx.fillRect(e.x0, 330, e.x1 - e.x0, e.y1 - 330);
      // dish: glazed earthenware
      cx.fillStyle = 'rgba(0,0,0,.5)'; ell(cx, DX + 10, DY + 40, DRX + 40, DRY + 34); cx.fill();
      cx.fillStyle = linear(cx, DX - DRX, 0, DX + DRX, 0, [[0, '#3e1c0c'], [0.35, '#8a4422'], [0.55, '#9c5029'], [1, '#3a1a0a']]);
      cx.beginPath(); cx.ellipse(DX, DY, DRX + 30, DRY + 26, 0, 0, Math.PI); cx.lineTo(DX - DRX - 30, DY + 50); cx.ellipse(DX, DY + 50, DRX + 26, DRY + 22, 0, Math.PI, 0, true); cx.closePath(); cx.fill();
      cx.fillStyle = '#a65a2e'; ell(cx, DX, DY, DRX + 30, DRY + 26); cx.fill(); cx.strokeStyle = 'rgba(20,10,4,.8)'; cx.lineWidth = 3; cx.stroke();
      cx.fillStyle = radial(cx, DX, DY, DRX, [[0, '#f6cf5c'], [0.7, '#e2a634'], [1, '#b8761c']], DX - 80, DY - 40);
      ell(cx, DX, DY, DRX, DRY); cx.fill();
      cx.save(); ell(cx, DX, DY, DRX, DRY); cx.clip();
      elbows.forEach((el2) => { cx.save(); cx.translate(el2.x, el2.y); cx.rotate(el2.rot); cx.strokeStyle = 'rgba(255,236,160,.75)'; cx.lineWidth = 7; cx.lineCap = 'round'; cx.beginPath(); cx.arc(0, 0, 9, 0.2, Math.PI * 0.9); cx.stroke(); cx.strokeStyle = 'rgba(150,90,20,.4)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 12, 0.2, Math.PI * 0.9); cx.stroke(); cx.restore(); });
      spots.forEach((s) => { cx.fillStyle = radial(cx, s.x, s.y, s.rx, [[0, `rgba(170,90,25,${0.3 + s.a * 0.4})`], [1, 'rgba(170,90,25,0)']]); ell(cx, s.x, s.y, s.rx, s.ry, s.a); cx.fill(); });
      holes.forEach((h) => { cx.fillStyle = radial(cx, h.x, h.y, 40, [[0, '#c98a2a'], [1, 'rgba(226,166,52,0)']]); ell(cx, h.x, h.y, 42, 18); cx.fill(); });
      cx.restore();
      cx.fillStyle = 'rgba(255,240,200,.14)'; ell(cx, DX - 120, DY - 60, 120, 22, -0.1); cx.fill();
      if (lift) {
        const f = lift;
        // strands
        f.strands.forEach((s) => {
          if (s.broken) return;
          const x0 = f.ax + s.dx, y0 = f.ay, x1 = f.x + s.dx * 0.4, y1 = f.y + 16;
          const dist = Math.hypot(x1 - x0, y1 - y0), w = clamp(9 - dist / 34, 1.2, 9) * s.w;
          cx.strokeStyle = '#f2c14e'; cx.lineWidth = w; cx.lineCap = 'round';
          cx.beginPath(); cx.moveTo(x0, y0); cx.quadraticCurveTo((x0 + x1) / 2 + s.sag, (y0 + y1) / 2 + dist * 0.12, x1, y1); cx.stroke();
          cx.strokeStyle = 'rgba(255,250,210,.5)'; cx.lineWidth = w * 0.3; cx.stroke();
        });
        f.dangles.forEach((d) => { cx.strokeStyle = '#f2c14e'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(f.x + d.dx * 0.4, f.y + 16); cx.quadraticCurveTo(f.x + d.dx * 0.4 + d.sway, f.y + 16 + d.len * 0.6, f.x + d.dx * 0.4 + d.sway * 0.4, f.y + 16 + d.len); cx.stroke(); });
        // clump + fork
        cx.fillStyle = radial(cx, f.x, f.y + 8, 40, [[0, '#f6d266'], [1, '#c98a2a']]); ell(cx, f.x, f.y + 8, 36, 20); cx.fill();
        for (let i = 0; i < 6; i++) { cx.strokeStyle = 'rgba(255,236,160,.85)'; cx.lineWidth = 6; cx.beginPath(); cx.arc(f.x - 22 + i * 9, f.y + 6 + (i % 2) * 6, 7, 0.3, 2.6); cx.stroke(); }
        cx.save(); cx.translate(f.x, f.y - 6); cx.rotate(-0.25);
        cx.fillStyle = linear(cx, -30, 0, 30, 0, [[0, '#8d9092'], [0.5, '#eef0f0'], [1, '#7c8083']]);
        for (let i = 0; i < 4; i++) { rr(cx, -24 + i * 13, -10, 6, 34, 3); cx.fill(); }
        rr(cx, -26, -18, 52, 14, 6); cx.fill();
        rr(cx, -7, -170, 14, 158, 6); cx.fill();
        cx.restore();
      }
    }
    v.input({
      down(p) {
        if (Math.pow((p.x - DX) / DRX, 2) + Math.pow((p.y - DY) / DRY, 2) > 1) return;
        lift = { ax: p.x, ay: p.y, x: p.x, y: p.y, strands: Array.from({ length: 7 }, (_, i) => ({ dx: (i - 3) * 9 + R(-4, 4), w: R(0.5, 1.2), limit: R(150, 330), sag: R(-14, 14), broken: false })), dangles: [] };
        A.sfx('squish');
      },
      move(p) {
        if (!lift) return;
        lift.x = p.x; lift.y = Math.min(p.y, lift.ay);
        const dist = Math.hypot(lift.x - lift.ax, lift.y - lift.ay);
        lift.strands.forEach((s) => {
          if (!s.broken && dist > s.limit) {
            s.broken = true; snd.snap();
            lift.dangles.push({ dx: s.dx, len: R(20, 46), sway: R(-10, 10) });
          }
        });
        if (Math.random() < 0.08 && dist > 40) snd.stretch(clamp(dist / 300, 0, 1));
      },
      up() {
        if (!lift) return;
        const dist = Math.hypot(lift.x - lift.ax, lift.y - lift.ay);
        if (dist > 60) {
          pulls++;
          LT.stats.inc('cheesePulls');
          holes.push({ x: lift.ax, y: lift.ay });
          const left = lift.strands.filter((s) => !s.broken).length;
          ui.status(left ? `Pull ${pulls}: ${left} strands still holding on.` : `Pull ${pulls}: a clean break. Somebody’s grandmother would approve.`);
        }
        lift = null;
      },
    });
    sc.frame((dt, t) => draw(t));
    ui.hint('Drag up from the dish to lift a forkful.');
  };

  /* ======================================================================
     THE 1621 PLATE vs TODAY — SVG
     ====================================================================== */
  TOYS.plate1621 = function (host, sc, ui) {
    const W = 1000, H = 620;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sp-svgtoy sp-then', role: 'img', 'aria-label': 'A plate from 1621 and a plate from today' });
    host.appendChild(svg);
    sc.cleanup(() => svg.remove());
    const ink = { stroke: '#1c130c', 'stroke-width': 3, 'stroke-linejoin': 'round' };
    svg.appendChild(S('defs', null,
      S('linearGradient', { id: 'sp-tr-wood', x1: 0, x2: 1, y1: 0, y2: 0.3 }, S('stop', { offset: 0, 'stop-color': '#6a4220' }), S('stop', { offset: 0.5, 'stop-color': '#9a6a38' }), S('stop', { offset: 1, 'stop-color': '#5a3518' })),
      S('radialGradient', { id: 'sp-tr-china', cx: 0.45, cy: 0.4 }, S('stop', { offset: 0, 'stop-color': '#fbf7ee' }), S('stop', { offset: 0.8, 'stop-color': '#ece3cf' }), S('stop', { offset: 1, 'stop-color': '#bfb398' }))));
    // the plate (wood trencher morphing into china)
    const plateG = S('g', { transform: 'translate(500 330)' });
    plateG.appendChild(S('ellipse', { cx: 10, cy: 30, rx: 400, ry: 190, fill: 'rgba(0,0,0,.45)' }));
    const trencher = S('rect', { class: 'sp-trencher', x: -380, y: -190, width: 760, height: 380, rx: 60, fill: 'url(#sp-tr-wood)', ...ink });
    const grain = S('g', { class: 'sp-trencher', stroke: 'rgba(40,20,6,.35)', 'stroke-width': 2, fill: 'none' });
    for (let i = 0; i < 9; i++) grain.appendChild(S('path', { d: `M-360 ${-160 + i * 38} C-120 ${-170 + i * 38 + (i % 3) * 10} 120 ${-150 + i * 38} 360 ${-162 + i * 38}` }));
    const china = S('g', { class: 'sp-china' },
      S('ellipse', { rx: 390, ry: 190, fill: 'url(#sp-tr-china)', ...ink }),
      S('ellipse', { rx: 300, ry: 140, fill: 'none', stroke: 'rgba(111,21,38,.45)', 'stroke-width': 3 }),
      S('ellipse', { rx: 360, ry: 172, fill: 'none', stroke: 'rgba(45,79,138,.5)', 'stroke-width': 4, 'stroke-dasharray': '14 10' }));
    plateG.append(trencher, grain, china);
    svg.appendChild(plateG);

    const caption = el('div', { class: 'sp-plate-note', 'aria-live': 'polite' });
    host.appendChild(caption);
    sc.cleanup(() => caption.remove());

    function item(x, y, label, note, art, era) {
      const g = S('g', { class: `sp-item sp-item--${era}`, transform: `translate(${x} ${y})`, tabindex: 0, role: 'button', 'aria-label': label });
      const inner = S('g', { class: 'sp-item-inner' });
      art.forEach((a) => inner.appendChild(a));
      g.appendChild(inner);
      g.appendChild(S('text', { class: 'sp-item-label', y: 70, 'text-anchor': 'middle' }, label));
      const show = () => { caption.textContent = note; caption.classList.add('on'); A.sfx('tick', { g: 0.04 }); };
      sc.on(g, 'click', show);
      sc.on(g, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
      sc.on(g, 'mouseenter', show);
      return g;
    }
    const then = [
      item(-230, -60, 'venison', 'Venison. Winslow wrote that the Wampanoag went out and killed five deer, and brought them to the plantation.', [
        S('path', { d: 'M-60 -10 C-50 -40 30 -44 56 -14 C64 10 30 28 -10 26 C-48 24 -66 10 -60 -10Z', fill: '#6e2a1c', ...ink }),
        S('path', { d: 'M-40 -10 C-20 -24 20 -26 40 -12', stroke: 'rgba(255,190,160,.3)', 'stroke-width': 4, fill: 'none' }),
        S('path', { d: 'M-50 14 C-20 4 30 6 50 0', stroke: '#3e140c', 'stroke-width': 3, fill: 'none' })], 'then'),
      item(-20, -100, 'wildfowl', 'Fowl. The governor sent four men fowling. Ducks and geese, most likely. Maybe turkey.', [
        S('ellipse', { cx: 0, cy: 0, rx: 54, ry: 34, fill: '#a85a26', ...ink }),
        S('path', { d: 'M40 -10 C70 -30 84 -10 70 4 C60 12 50 6 44 2Z', fill: '#8a4518', ...ink }),
        S('ellipse', { cx: -14, cy: -12, rx: 20, ry: 8, fill: 'rgba(255,220,170,.35)' })], 'then'),
      item(210, -60, 'nasaump', 'Nasaump: dried corn, pounded and boiled into a porridge. A Wampanoag staple.', [
        S('ellipse', { cx: 0, cy: 0, rx: 66, ry: 34, fill: '#6a4220', ...ink }),
        S('ellipse', { cx: 0, cy: -4, rx: 54, ry: 24, fill: '#e8cf7a', ...ink, 'stroke-width': 2 }),
        ...Array.from({ length: 10 }, (_, i) => S('circle', { cx: -36 + (i % 5) * 18, cy: -12 + Math.floor(i / 5) * 12, r: 4, fill: '#d4a83a' }))], 'then'),
      item(-170, 90, 'eels', 'Eels. In the spring of 1621, Tisquantum went out and came back with as many as he could lift, treading them out of the mud with his feet.', [
        S('path', { d: 'M-70 10 C-50 -30 -10 30 10 -6 C30 -40 60 10 76 -16', stroke: '#1c130c', 'stroke-width': 22, fill: 'none', 'stroke-linecap': 'round' }),
        S('path', { d: 'M-70 10 C-50 -30 -10 30 10 -6 C30 -40 60 10 76 -16', stroke: '#6b6152', 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }),
        S('path', { d: 'M-66 4 C-50 -24 -14 22 8 -10', stroke: 'rgba(255,240,210,.25)', 'stroke-width': 4, fill: 'none' })], 'then'),
      item(60, 100, 'mussels', 'Mussels and other shellfish from the bay. Plentiful, and easy to gather.', [
        ...[-44, -14, 16, 46].map((x, i) => S('g', { transform: `translate(${x} ${(i % 2) * 10}) rotate(${-30 + i * 20})` },
          S('ellipse', { rx: 22, ry: 13, fill: '#1f2533', ...ink, 'stroke-width': 2 }), S('ellipse', { rx: 15, ry: 7, fill: '#e08a4a' })))], 'then'),
      item(250, 90, 'squash', 'Squash. Grown with corn and beans, the three planted together.', [
        S('path', { d: 'M-50 20 C-60 -30 40 -40 60 0 C40 -10 -20 -8 -30 30Z', fill: '#e08a2e', ...ink }),
        S('path', { d: 'M-40 12 C-40 -16 30 -24 46 -2', stroke: '#f6c068', 'stroke-width': 5, fill: 'none' })], 'then'),
    ];
    const now = [
      item(-230, -60, 'turkey', 'Turkey. Probably not the star in 1621. The star now.', [
        ...[0, 1, 2].map((i) => S('g', { transform: `translate(${-26 + i * 24} ${i * 4}) rotate(${-10 + i * 8})` }, S('ellipse', { rx: 34, ry: 15, fill: '#efd7b2', ...ink, 'stroke-width': 2 }), S('path', { d: 'M-30 -6 C-10 -16 10 -16 30 -6', stroke: '#a8581f', 'stroke-width': 5, fill: 'none' })))], 'now'),
      item(-20, -100, 'potatoes', 'Mashed potatoes. Potatoes come from South America and were not yet a New England crop in 1621.', [
        S('path', { d: 'M-56 20 C-60 -20 -20 -42 0 -40 C30 -42 60 -16 56 20Z', fill: '#f6efdc', ...ink }),
        S('ellipse', { cx: 0, cy: -20, rx: 22, ry: 8, fill: '#6b3f1d' })], 'now'),
      item(210, -60, 'casserole', 'Green bean casserole. 1955.', [
        S('ellipse', { rx: 60, ry: 30, fill: '#d8cca2', ...ink }),
        ...Array.from({ length: 7 }, (_, i) => S('path', { d: `M${-40 + i * 13} ${-10 + (i % 2) * 10} l14 -6`, stroke: '#4f6e2c', 'stroke-width': 7, 'stroke-linecap': 'round' })),
        ...Array.from({ length: 8 }, (_, i) => S('path', { d: `M${-36 + i * 10} ${-4 + (i % 3) * 6} a5 5 0 1 1 6 4`, stroke: '#c98a3a', 'stroke-width': 3, fill: 'none' }))], 'now'),
      item(-170, 90, 'cranberry', 'Cranberry sauce. In 1621 there was likely no sugar to spare for sauce.', [
        S('ellipse', { cx: 0, cy: 6, rx: 46, ry: 18, fill: '#6a0b1a' }), S('rect', { x: -46, y: -8, width: 92, height: 14, fill: '#8f1428' }),
        S('ellipse', { cx: 0, cy: -8, rx: 46, ry: 18, fill: '#c22a42', ...ink, 'stroke-width': 2 }), S('ellipse', { cx: 0, cy: -8, rx: 36, ry: 12, fill: 'none', stroke: 'rgba(60,0,12,.5)', 'stroke-width': 2 })], 'now'),
      item(60, 100, 'stuffing', 'Stuffing, or dressing, depending on where you grew up.', [
        S('ellipse', { rx: 56, ry: 28, fill: '#a8723a', ...ink }),
        ...Array.from({ length: 12 }, (_, i) => S('rect', { x: -40 + (i % 6) * 14, y: -16 + Math.floor(i / 6) * 14, width: 11, height: 9, rx: 2, fill: i % 3 ? '#d9a35e' : '#6d7a45', transform: `rotate(${i * 17} ${-36 + (i % 6) * 14} ${-12 + Math.floor(i / 6) * 14})` }))], 'now'),
      item(250, 90, 'pie', 'Pumpkin pie. No butter, no wheat flour to spare, and no ovens in 1621.', [
        S('path', { d: 'M-50 20 L60 -10 C64 10 50 30 30 34Z', fill: '#c97a35', ...ink }),
        S('path', { d: 'M-50 20 L60 -10', stroke: '#e3b06d', 'stroke-width': 10, 'stroke-linecap': 'round' }),
        S('circle', { cx: 18, cy: 10, r: 12, fill: '#fffaf0', ...ink, 'stroke-width': 2 })], 'now'),
    ];
    const utensilsThen = S('g', { class: 'sp-item--then sp-utensils' },
      S('g', { transform: 'translate(-430 -40) rotate(8)' }, S('rect', { x: -6, y: -110, width: 12, height: 140, rx: 4, fill: '#cfd1d2', ...ink, 'stroke-width': 2 }), S('rect', { x: -9, y: 30, width: 18, height: 80, rx: 6, fill: '#5a3518', ...ink, 'stroke-width': 2 })),
      S('g', { transform: 'translate(430 -30) rotate(-8)' }, S('ellipse', { cx: 0, cy: -80, rx: 20, ry: 30, fill: '#cfd1d2', ...ink, 'stroke-width': 2 }), S('rect', { x: -5, y: -54, width: 10, height: 150, rx: 4, fill: '#cfd1d2', ...ink, 'stroke-width': 2 })),
      S('text', { class: 'sp-item-label', x: 430, y: 130, 'text-anchor': 'middle' }, 'no fork'));
    const utensilsNow = S('g', { class: 'sp-item--now sp-utensils' },
      S('g', { transform: 'translate(-430 -30) rotate(4)' }, ...[-12, -4, 4, 12].map((x) => S('rect', { x: x - 2.5, y: -110, width: 5, height: 50, rx: 2, fill: '#cfd1d2', ...ink, 'stroke-width': 1.5 })), S('rect', { x: -16, y: -66, width: 32, height: 20, rx: 8, fill: '#cfd1d2', ...ink, 'stroke-width': 2 }), S('rect', { x: -6, y: -50, width: 12, height: 160, rx: 5, fill: '#cfd1d2', ...ink, 'stroke-width': 2 })),
      S('g', { transform: 'translate(430 -30) rotate(-6)' }, S('rect', { x: -7, y: -110, width: 14, height: 120, rx: 5, fill: '#e6e8e9', ...ink, 'stroke-width': 2 }), S('rect', { x: -8, y: 10, width: 16, height: 90, rx: 6, fill: '#cfd1d2', ...ink, 'stroke-width': 2 })),
      S('text', { class: 'sp-item-label', x: -430, y: 140, 'text-anchor': 'middle' }, 'a fork!'));
    const items = S('g', { transform: 'translate(500 330)' });
    [...then, ...now].forEach((g) => items.appendChild(g));
    items.append(utensilsThen, utensilsNow);
    svg.appendChild(items);
    const yearTxt = S('text', { class: 'sp-year', x: 500, y: 92, 'text-anchor': 'middle' }, '1621');
    svg.appendChild(yearTxt);
    let era = 'then';
    function setEra(e2) {
      era = e2;
      svg.classList.toggle('sp-then', era === 'then');
      svg.classList.toggle('sp-now', era === 'now');
      yearTxt.textContent = era === 'then' ? '1621' : String(new Date().getFullYear());
      caption.textContent = era === 'then' ? 'Hover or tap any food for its note.' : 'Same table, four centuries later. Hover or tap any food.';
      caption.classList.add('on');
      A.sfx('whoosh', { dur: 0.5 });
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === era)));
    }
    const seg = ui.segmented([['1621', 'then'], ['Today', 'now']], setEra);
    setEra('then');
    ui.hint('Switch between 1621 and today. Hover or tap any food.');
  };

  /* ======================================================================
     THE WISHBONE — against Uncle Dale
     ====================================================================== */
  TOYS.wishbone = function (host, sc, ui) {
    const W = 1000, H = 620;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sp-svgtoy sp-wish', role: 'img', 'aria-label': 'A wishbone, held by you and Uncle Dale' });
    host.appendChild(svg);
    sc.cleanup(() => svg.remove());
    const ink = { stroke: '#1c130c', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    // Dale at right
    const dale = LT.family.figure('dale', { scale: 1.2, mood: 'smug' });
    const daleG = S('g', { transform: 'translate(850 735)' }, dale.el);
    svg.appendChild(daleG);
    sc.cleanup(() => dale.destroy());
    dale.arms(30, -70);
    // bone
    const CX = 500, CY = 330;
    const boneG = S('g', { transform: `translate(${CX} ${CY})` });
    const armL = S('g'), armR = S('g');
    const armPath = (s) => `M0 70 C${s * 6} 30 ${s * 30} -40 ${s * 110} -110`;
    [armL, armR].forEach((g, i) => {
      const s = i ? 1 : -1;
      g.appendChild(S('path', { d: armPath(s), stroke: '#1c130c', 'stroke-width': 20, fill: 'none', 'stroke-linecap': 'round' }));
      g.appendChild(S('path', { d: armPath(s), stroke: '#efe1c0', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }));
      g.appendChild(S('path', { d: `M${s * 8} 40 C${s * 14} 0 ${s * 40} -50 ${s * 100} -104`, stroke: 'rgba(255,255,255,.6)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
    });
    const knob = S('ellipse', { cx: 0, cy: 74, rx: 16, ry: 11, fill: '#efe1c0', ...ink });
    boneG.append(armL, armR, knob);
    // hands
    const hand = (x, y, sleeve, skin, flip) => S('g', { transform: `translate(${x} ${y}) scale(${flip ? -1 : 1} 1)` },
      S('rect', { x: -150, y: -24, width: 120, height: 48, rx: 22, fill: sleeve, ...ink }),
      S('ellipse', { cx: -20, cy: 0, rx: 30, ry: 26, fill: skin, ...ink }),
      S('path', { d: 'M-8 -18 C10 -20 14 -8 4 -4 M-6 -2 C12 -4 14 8 4 10 M-8 12 C8 12 10 22 0 24', stroke: '#1c130c', 'stroke-width': 2.5, fill: 'none' }));
    const youHand = hand(0, 0, '#3d5878', '#c9926c', false);
    const daleHand = hand(0, 0, 'url(#lt-plaid)', '#e3a985', true);
    const youWrap = S('g'), daleWrap = S('g');
    youWrap.appendChild(youHand); daleWrap.appendChild(daleHand);
    svg.append(boneG, youWrap, daleWrap);
    const label = S('text', { class: 'sp-wish-label', x: 500, y: 560, 'text-anchor': 'middle' }, '');
    svg.appendChild(label);
    LT.family.ensureDefs();

    const st = { you: 0, dale: 0, phase: 'wish', yanks: [], lastX: null, t: 0, broken: false };
    function layout() {
      const pl = st.you, pd = st.dale;
      const bend = (pl + pd) * 5;
      const aL = -(bend + pl * 7), aR = bend + pd * 7;
      armL.setAttribute('transform', `rotate(${aL} 0 70)`);
      armR.setAttribute('transform', `rotate(${aR} 0 70)`);
      const tip = (s, deg) => { const a = (deg * Math.PI) / 180, vx = s * 110, vy = -180; return { x: CX + vx * Math.cos(a) - vy * Math.sin(a), y: CY + 70 + vx * Math.sin(a) + vy * Math.cos(a) }; };
      const tL = tip(-1, aL), tR = tip(1, aR);
      youWrap.setAttribute('transform', `translate(${tL.x} ${tL.y}) rotate(${-20 + aL * 0.6})`);
      daleWrap.setAttribute('transform', `translate(${tR.x} ${tR.y}) rotate(${20 + aR * 0.6})`);
    }
    layout();
    // wish form
    const form = el('form', { class: 'sp-wishform' },
      el('label', { for: 'sp-wish-input', class: 'lt-eyebrow' }, 'Make a wish'),
      el('input', { id: 'sp-wish-input', type: 'text', maxlength: 80, placeholder: 'It stays here. It’s yours.', autocomplete: 'off' }),
      el('button', { class: 'lt-btn', type: 'submit' }, 'Ready'));
    host.appendChild(form);
    sc.cleanup(() => form.remove());
    sc.on(form, 'submit', (e) => {
      e.preventDefault();
      form.classList.add('gone');
      st.phase = 'pull';
      dale.mood('grin');
      ui.hint('Drag your end (the left one) away to pull. Folk wisdom says don’t yank.');
      label.textContent = '';
    });
    let drag = null;
    sc.on(svg, 'pointerdown', (e) => {
      if (st.phase !== 'pull') return;
      drag = { x: e.clientX, y: e.clientY };
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      st.yanks = [];
      e.preventDefault();
    });
    sc.on(svg, 'pointermove', (e) => {
      if (!drag || st.phase !== 'pull') return;
      const r = svg.getBoundingClientRect(), k = W / r.width;
      const d = Math.max(0, (drag.x - e.clientX) * k + (e.clientY - drag.y) * k * 0.3);
      const target = clamp(d / 180, 0, 1.4);
      st.yanks.push(Math.abs(target - st.you));
      st.you = target;
    });
    const release = () => { drag = null; if (st.phase === 'pull' && !st.broken) st.you = Math.max(0, st.you * 0.5); };
    sc.on(svg, 'pointerup', release); sc.on(svg, 'pointercancel', release);
    sc.on(svg, 'keydown', (e) => { if (st.phase === 'pull' && (e.key === 'ArrowLeft' || e.key === ' ')) { st.you = clamp(st.you + 0.12, 0, 1.4); st.yanks.push(0.12); e.preventDefault(); } });
    svg.tabIndex = 0;
    function snap() {
      st.broken = true; st.phase = 'done';
      ui.hint('');
      LT.stats.inc('wishbonesPulled');
      A.sfx('crack', { g: 0.8 });
      LT.fx.shake(6, 0.25);
      const jerk = st.yanks.length ? st.yanks.reduce((a, b) => Math.max(a, b), 0) : 0;
      const youWin = st.you <= st.dale + 0.05 && jerk < 0.2 ? true : Math.random() < (jerk < 0.2 ? 0.6 : 0.3);
      const sp = svg.getBoundingClientRect();
      const kx = sp.width / W;
      LT.fx.burst(sp.left + CX * kx, sp.top + (CY - 60) * kx, { count: 16, colors: ['#efe1c0', '#d8c9a4'], size: [1.5, 3.5], speed: [80, 260], gravity: 500 });
      // the halves fly apart; the winner keeps the knob
      const winArm = youWin ? armL : armR, loseArm = youWin ? armR : armL;
      knob.remove();
      winArm.appendChild(S('ellipse', { cx: 0, cy: 74, rx: 16, ry: 11, fill: '#efe1c0', ...ink }));
      const parts = [[armL, -1], [armR, 1], [youWrap, -1], [daleWrap, 1]].map(([g, s]) => ({ g, s, base: g.getAttribute('transform') || '' }));
      U.tween({ from: 0, to: 1, dur: 0.6, ease: 'outCubic', onUpdate: (k) => {
        parts.forEach((p) => p.g.setAttribute('transform', `translate(${p.s * 120 * k} ${40 * k}) ${p.base} rotate(${p.s * 18 * k})`));
      } });
      if (youWin) {
        dale.mood('sad');
        label.textContent = 'You got the bigger half. Your wish is safe with us.';
        A.sfx('chime');
        LT.fx.confetti(sp.left + sp.width * 0.3, sp.top + sp.height * 0.5, { count: 50 });
      } else {
        dale.mood('grin'); dale.raise('l');
        label.textContent = 'Dale got the bigger half. He wished for a bigger fryer.';
        A.sfx('sad');
      }
      ui.status(jerk >= 0.2 ? 'You yanked. Folk wisdom is disappointed.' : 'Smooth, steady pull. Nicely done.');
      sc.timeout(() => ui.button('Another wishbone (from next year’s bird)', () => ui.restart()), 900);
    }
    sc.frame((dt) => {
      st.t += dt;
      if (st.phase === 'pull') {
        if (st.you > 0.15) st.dale = clamp(st.dale + dt * (0.32 + Math.sin(st.t * 3) * 0.25), 0, 1.3);
        else st.dale = Math.max(0, st.dale - dt * 0.3);
        if (st.you > 0.08 && Math.random() < 0.02) A.noise({ dur: 0.04, g: 0.05, filters: [{ type: 'bandpass', f: 2600, q: 3 }] });
        if (st.you + st.dale > 1.75 && st.you > 0.35) snap();
      }
      if (!st.broken) layout();
    });
    ui.hint('Make a wish first.');
    label.textContent = '';
  };

  /* ======================================================================
     THE TABLE — a still life you can eat
     ====================================================================== */
  const INK = { stroke: '#1c130c', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const shadow = (rx, ry, dy = 10) => S('ellipse', { cx: 8, cy: dy, rx, ry, fill: 'rgba(0,0,0,.5)' });
  function seededPts(seed, n, rx, ry, cy = 0) {
    const r = U.seeded(seed), out = [];
    for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()); out.push([Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, r()]); }
    return out;
  }
  function tableDefs() {
    const lg = (id, stops, x2 = 1, y2 = 0) => S('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, ...stops.map(([o, c]) => S('stop', { offset: o, 'stop-color': c })));
    const rg = (id, stops, fx = 0.4, fy = 0.35) => S('radialGradient', { id, fx, fy }, ...stops.map(([o, c]) => S('stop', { offset: o, 'stop-color': c })));
    return S('defs', null,
      lg('sp-pewter', [[0, '#4a4c48'], [0.3, '#a9aba3'], [0.5, '#d9dad1'], [0.7, '#8d8f88'], [1, '#3a3c38']]),
      lg('sp-steel', [[0, '#3c3e40'], [0.35, '#c9cbcc'], [0.5, '#eef0f0'], [0.7, '#8c9092'], [1, '#2c2e30']]),
      rg('sp-china', [[0, '#fbf7ee'], [0.75, '#ece3cf'], [1, '#b9ad94']]),
      rg('sp-skin', [[0, '#f2be6a'], [0.45, '#d27f33'], [0.8, '#a14f1d'], [1, '#6a3010']]),
      rg('sp-berry', [[0, '#f06a7c'], [0.45, '#b8152f'], [1, '#55061a']], 0.3, 0.3),
      lg('sp-jelly', [[0, '#4d0612'], [0.42, '#d83a52'], [0.62, '#b5213a'], [1, '#55091a']], 0, 1),
      rg('sp-mash', [[0, '#f39a4a'], [0.7, '#d9702e'], [1, '#a84d1c']]),
      rg('sp-pie', [[0, '#d0843e'], [0.6, '#b8662a'], [1, '#8d4a1c']]),
      rg('sp-cheese', [[0, '#f6cf5c'], [0.7, '#e2a634'], [1, '#b8761c']]),
      rg('sp-lemon', [[0, '#fff0a0'], [0.55, '#f0c63a'], [1, '#b8861a']]),
      lg('sp-trench', [[0, '#5a3518'], [0.5, '#9a6a38'], [1, '#5a3518']]),
      lg('sp-tablewood', [[0, '#3a2414'], [0.5, '#2c1b0f'], [1, '#1c1109']], 0, 1),
      lg('sp-runner', [[0, '#d9ccb0'], [0.5, '#e8ddc6'], [1, '#cdbf9f']], 0, 1),
      rg('sp-flame', [[0, '#fff6d0'], [0.4, '#ffcf6b'], [1, 'rgba(255,120,40,0)']], 0.5, 0.7),
      rg('sp-candleglow', [[0, 'rgba(255,190,100,.55)'], [1, 'rgba(255,150,60,0)']], 0.5, 0.5),
      S('filter', { id: 'sp-grain', x: 0, y: 0, width: 1, height: 1 },
        S('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.006 0.12', numOctaves: 2, seed: 4 }),
        S('feColorMatrix', { values: '0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0 0.01  0 0 0 0.55 0' })));
  }

  const ART = {};
  ART.turkey = () => {
    const g = S('g');
    g.append(shadow(168, 72, 18), S('ellipse', { rx: 160, ry: 72, fill: 'url(#sp-pewter)', ...INK }), S('ellipse', { rx: 136, ry: 58, fill: 'rgba(40,42,38,.3)' }));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + 0.15, x = Math.cos(a) * 140, y = Math.sin(a) * 58;
      if (i % 3 === 0) g.append(S('circle', { cx: x, cy: y, r: 10, fill: '#e8892e', stroke: '#9a5216', 'stroke-width': 1.5 }), S('circle', { cx: x, cy: y, r: 7, fill: '#f6c068' }));
      else g.append(S('ellipse', { cx: x, cy: y, rx: 13, ry: 5, fill: '#6d7a45', transform: `rotate(${(a * 180) / Math.PI + 90} ${x} ${y})` }));
    }
    const drum = (x, y, rot) => S('g', { transform: `translate(${x} ${y}) rotate(${rot})` },
      S('ellipse', { rx: 36, ry: 21, fill: 'url(#sp-skin)', ...INK }),
      S('rect', { x: 30, y: -5, width: 22, height: 10, rx: 4, fill: '#efe1c4', ...INK, 'stroke-width': 2 }),
      S('path', { d: 'M50 -11 l8 4 -8 4 8 4 -8 4 8 4 -8 1 z', fill: '#fbf6ea', ...INK, 'stroke-width': 1.5 }));
    g.append(drum(-92, 30, 200), drum(92, 30, -20),
      S('ellipse', { cx: -100, cy: -16, rx: 26, ry: 16, fill: '#8c4518', ...INK }), S('ellipse', { cx: 100, cy: -16, rx: 26, ry: 16, fill: '#8c4518', ...INK }),
      S('ellipse', { cx: 0, cy: -8, rx: 104, ry: 62, fill: 'url(#sp-skin)', ...INK }),
      S('ellipse', { cx: -26, cy: -36, rx: 48, ry: 16, fill: 'rgba(255,235,190,.32)', transform: 'rotate(-10 -26 -36)' }),
      S('path', { d: 'M0 -68 Q9 -10 0 52', stroke: 'rgba(100,40,10,.45)', 'stroke-width': 3, fill: 'none' }));
    return g;
  };
  ART.cranberries = () => {
    const g = S('g');
    g.append(shadow(80, 30, 26),
      S('path', { d: 'M-76 0 C-72 46 -40 60 0 60 C40 60 72 46 76 0Z', fill: 'url(#sp-china)', ...INK }),
      S('path', { d: 'M-50 26 c8 -14 16 14 24 0 M-6 34 c8 -14 16 14 24 0 M36 24 c8 -14 16 14 24 0', stroke: '#2d4f8a', 'stroke-width': 3, fill: 'none' }),
      S('ellipse', { rx: 76, ry: 28, fill: '#f3eee2', ...INK }), S('ellipse', { rx: 76, ry: 28, fill: 'none', stroke: 'rgba(45,79,138,.6)', 'stroke-width': 3, 'stroke-dasharray': '7 6', transform: 'scale(.92)' }),
      S('ellipse', { rx: 62, ry: 20, fill: '#45070f' }));
    seededPts(9, 30, 54, 15, -2).sort((a, b) => a[1] - b[1]).forEach(([x, y]) => g.append(S('circle', { cx: x, cy: y, r: 6.5, fill: 'url(#sp-berry)' })));
    return g;
  };
  ART.can = () => {
    const g = S('g');
    g.append(shadow(80, 26, 14), S('ellipse', { rx: 78, ry: 28, fill: 'url(#sp-china)', ...INK }), S('ellipse', { rx: 62, ry: 21, fill: 'rgba(120,100,70,.12)' }));
    const j = S('g', { transform: 'translate(-4 -16)' },
      S('rect', { x: -56, y: -22, width: 104, height: 44, rx: 6, fill: 'url(#sp-jelly)', ...INK, 'stroke-width': 2.5 }),
      ...[-38, -20, -2, 16, 34].map((x) => S('path', { d: `M${x} -21 q6 21 0 42`, stroke: 'rgba(60,0,12,.55)', 'stroke-width': 3, fill: 'none' })),
      S('ellipse', { cx: 48, cy: 0, rx: 11, ry: 22, fill: '#c22a3e', ...INK, 'stroke-width': 2.5 }),
      S('rect', { x: -50, y: -16, width: 92, height: 5, rx: 2.5, fill: 'rgba(255,220,225,.35)' }));
    g.appendChild(j);
    return g;
  };
  ART.casserole = () => {
    const g = S('g');
    g.append(shadow(100, 48, 16),
      S('rect', { x: -112, y: -14, width: 24, height: 28, rx: 9, fill: '#ece3cf', ...INK, 'stroke-width': 2.5 }), S('rect', { x: 88, y: -14, width: 24, height: 28, rx: 9, fill: '#ece3cf', ...INK, 'stroke-width': 2.5 }),
      S('rect', { x: -96, y: -48, width: 192, height: 98, rx: 22, fill: 'url(#sp-china)', ...INK }),
      S('rect', { x: -88, y: -40, width: 176, height: 82, rx: 17, fill: 'none', stroke: 'rgba(45,79,138,.6)', 'stroke-width': 3 }),
      S('rect', { x: -80, y: -34, width: 160, height: 70, rx: 13, fill: '#d8cca2', ...INK, 'stroke-width': 2 }));
    seededPts(55, 18, 66, 24).forEach(([x, y, r]) => { const a = r * Math.PI; g.append(S('path', { d: `M${x - Math.cos(a) * 12} ${y - Math.sin(a) * 6} L${x + Math.cos(a) * 12} ${y + Math.sin(a) * 6}`, stroke: '#4f6e2c', 'stroke-width': 7, 'stroke-linecap': 'round' })); });
    seededPts(56, 26, 68, 26).forEach(([x, y, r]) => g.append(S('path', { d: `M${x} ${y} a5 5 0 1 1 ${4 + r * 3} 4`, stroke: '#c98a3a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' })));
    return g;
  };
  ART.yams = () => {
    const g = S('g');
    g.append(shadow(98, 42, 16), S('ellipse', { rx: 96, ry: 44, fill: 'url(#sp-china)', ...INK }), S('ellipse', { rx: 82, ry: 34, fill: 'url(#sp-mash)' }));
    const tones = ['#fbf3e4', '#f3dba2', '#e2b56a', '#fbf3e4', '#d9a35e'];
    seededPts(17, 14, 62, 22, -3).sort((a, b) => a[1] - b[1]).forEach(([x, y], i) => g.append(S('g', { transform: `translate(${x} ${y})` },
      S('rect', { x: -10, y: -6, width: 20, height: 11, rx: 5, fill: '#efe3c8', stroke: 'rgba(60,30,10,.3)', 'stroke-width': 1 }),
      S('ellipse', { cy: -6, rx: 10, ry: 5, fill: tones[i % tones.length], stroke: 'rgba(60,30,10,.35)', 'stroke-width': 1 }))));
    return g;
  };
  ART.pie = () => {
    const g = S('g');
    g.append(shadow(90, 40, 14), S('ellipse', { rx: 88, ry: 40, fill: 'url(#sp-pewter)', ...INK }), S('ellipse', { rx: 79, ry: 35, fill: '#d9a35e', ...INK, 'stroke-width': 2 }));
    for (let i = 0; i < 30; i++) { const a = (i / 30) * TAU; g.append(S('circle', { cx: Math.cos(a) * 74, cy: Math.sin(a) * 31, r: 6.5, fill: '#e6b26e', stroke: 'rgba(110,60,20,.45)', 'stroke-width': 1.2 })); }
    g.append(S('ellipse', { rx: 64, ry: 26, fill: 'url(#sp-pie)' }));
    const a1 = -0.25, a2 = 0.6;
    const p = (a, rx, ry) => `${(Math.cos(a) * rx).toFixed(1)} ${(Math.sin(a) * ry).toFixed(1)}`;
    g.append(S('path', { d: `M0 0 L${p(a1, 80, 35)} A80 35 0 0 1 ${p(a2, 80, 35)} Z`, fill: '#9a9c95', stroke: 'rgba(28,19,12,.6)', 'stroke-width': 2 }),
      S('path', { d: `M0 0 L${p(a1, 64, 26)} M0 0 L${p(a2, 64, 26)}`, stroke: '#7a3a14', 'stroke-width': 3 }),
      S('circle', { cx: -18, cy: -4, r: 11, fill: '#fffaf0', ...INK, 'stroke-width': 1.5 }), S('circle', { cx: -21, cy: -7, r: 4, fill: '#fff' }));
    return g;
  };
  ART.mac = () => {
    const g = S('g');
    g.append(shadow(88, 40, 16), S('ellipse', { rx: 86, ry: 40, fill: '#6e3518', ...INK }), S('ellipse', { rx: 80, ry: 35, fill: '#a65a2e' }), S('ellipse', { rx: 69, ry: 29, fill: 'url(#sp-cheese)' }));
    seededPts(1802, 14, 56, 20).forEach(([x, y, r]) => g.append(S('path', { d: `M${x - 4} ${y} a5 5 0 0 1 9 0`, stroke: '#fbe08a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' })));
    seededPts(1803, 11, 56, 20).forEach(([x, y, r]) => g.append(S('ellipse', { cx: x, cy: y, rx: 5 + r * 9, ry: 3 + r * 3, fill: 'rgba(150,80,20,.5)' })));
    return g;
  };
  ART.gravy = () => {
    const g = S('g');
    g.append(shadow(86, 26, 22), S('ellipse', { cy: 14, rx: 82, ry: 24, fill: 'url(#sp-china)', ...INK }),
      S('path', { d: 'M-64 -2 C-92 -8 -94 24 -60 18', stroke: '#1c130c', 'stroke-width': 10, fill: 'none' }), S('path', { d: 'M-64 -2 C-92 -8 -94 24 -60 18', stroke: '#efe6d2', 'stroke-width': 5, fill: 'none' }),
      S('path', { d: 'M-66 -8 C-58 34 40 34 58 2 L88 -18 L52 -12 Z', fill: 'url(#sp-china)', ...INK }),
      S('path', { d: 'M-58 2 C-40 20 30 20 52 4', stroke: 'rgba(45,79,138,.6)', 'stroke-width': 3, fill: 'none' }),
      S('ellipse', { cx: -6, cy: -10, rx: 54, ry: 9, fill: '#6b3f1d' }), S('ellipse', { cx: -20, cy: -12, rx: 16, ry: 2.5, fill: 'rgba(255,220,180,.35)' }),
      S('ellipse', { cx: -6, cy: -11, rx: 59, ry: 11, fill: 'none', ...INK, 'stroke-width': 2.5 }),
      S('path', { d: 'M14 -12 L44 -62', stroke: '#1c130c', 'stroke-width': 8, 'stroke-linecap': 'round' }), S('path', { d: 'M14 -12 L44 -62', stroke: '#cfd1d2', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    return g;
  };
  ART.plate1621 = () => {
    const g = S('g');
    g.append(shadow(88, 44, 16), S('rect', { x: -82, y: -46, width: 164, height: 92, rx: 16, fill: 'url(#sp-trench)', ...INK }));
    for (let i = 0; i < 5; i++) g.append(S('path', { d: `M-74 ${-32 + i * 16} C-30 ${-36 + i * 16} 30 ${-28 + i * 16} 74 ${-34 + i * 16}`, stroke: 'rgba(40,20,6,.35)', 'stroke-width': 1.5, fill: 'none' }));
    g.append(S('path', { d: 'M-66 -8 C-60 -30 -14 -32 -6 -12 C-2 4 -24 14 -44 12 C-62 10 -70 4 -66 -8Z', fill: '#6e2a1c', ...INK, 'stroke-width': 2 }),
      S('g', { transform: 'translate(30 -18) rotate(-18)' }, S('ellipse', { rx: 28, ry: 10, fill: '#e3bf45', ...INK, 'stroke-width': 2 }), ...[-16, -8, 0, 8, 16].map((x) => S('path', { d: `M${x} -8 v16`, stroke: 'rgba(150,100,20,.6)', 'stroke-width': 1.5 })), S('path', { d: 'M24 -6 C40 -14 50 -6 44 4', fill: '#9bb06a', ...INK, 'stroke-width': 1.5 })),
      ...[0, 1, 2].map((i) => S('g', { transform: `translate(${34 + i * 15} ${20 + (i % 2) * 5}) rotate(${-30 + i * 25})` }, S('ellipse', { rx: 10, ry: 6, fill: '#1f2533', ...INK, 'stroke-width': 1.5 }), S('ellipse', { rx: 6, ry: 3, fill: '#e08a4a' }))),
      S('path', { d: 'M-50 26 C-40 14 -26 34 -14 22 C-2 10 6 30 14 22', stroke: '#1c130c', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }), S('path', { d: 'M-50 26 C-40 14 -26 34 -14 22 C-2 10 6 30 14 22', stroke: '#6b6152', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }));
    return g;
  };
  ART.wishbone = () => {
    const g = S('g');
    g.append(shadow(48, 16, 8), S('ellipse', { rx: 46, ry: 17, fill: 'url(#sp-china)', ...INK }), S('ellipse', { rx: 36, ry: 12, fill: 'rgba(120,100,70,.14)' }));
    const d = 'M0 8 C-2 -6 -10 -26 -26 -40 M0 8 C2 -6 10 -26 26 -40';
    g.append(S('path', { d, stroke: '#1c130c', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }), S('path', { d, stroke: '#efe1c0', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }), S('ellipse', { cy: 9, rx: 6, ry: 4, fill: '#efe1c0', ...INK, 'stroke-width': 2 }));
    return g;
  };
  ART.fryer = () => {
    const g = S('g');
    g.append(S('ellipse', { cy: 44, rx: 90, ry: 14, fill: 'rgba(0,0,0,.5)' }),
      S('path', { d: 'M-34 40 L-24 14 M34 40 L24 14 M0 44 L0 14', stroke: '#2a2a2a', 'stroke-width': 5 }),
      ...[-16, -8, 0, 8, 16].map((x) => S('ellipse', { cx: x, cy: 14, rx: 2.5, ry: 5, fill: 'rgba(90,150,255,.9)', class: 'sp-blue' })),
      S('rect', { x: -38, y: -58, width: 76, height: 70, rx: 4, fill: 'url(#sp-steel)', ...INK }),
      S('ellipse', { cy: -58, rx: 38, ry: 8, fill: '#3a3c3e', ...INK, 'stroke-width': 2 }),
      S('rect', { x: 56, y: -16, width: 34, height: 54, rx: 13, fill: '#e6e8e9', ...INK, 'stroke-width': 2 }),
      S('path', { d: 'M60 10 C40 30 30 26 24 18', stroke: '#555', 'stroke-width': 3, fill: 'none' }),
      S('path', { d: 'M0 -58 L0 -118', stroke: '#8d9092', 'stroke-width': 3 }),
      S('ellipse', { cy: -100, rx: 20, ry: 15, fill: '#e9dbd6', ...INK, 'stroke-width': 2 }),
      ...seededPts(3, 8, 15, 10, -100).map(([x, y]) => S('circle', { cx: x, cy: y, r: 1.8, fill: '#f3fbff' })));
    return g;
  };
  // decor
  const decor = {
    candle(x, y, s = 1) {
      return S('g', { transform: `translate(${x} ${y}) scale(${s})`, class: 'sp-decor' },
        S('circle', { cy: -104, r: 70, fill: 'url(#sp-candleglow)', class: 'sp-candleglow' }),
        S('ellipse', { cy: 30, rx: 30, ry: 9, fill: 'url(#sp-pewter)', ...INK, 'stroke-width': 2 }),
        S('path', { d: 'M-8 28 C-4 10 -12 0 -6 -14 L6 -14 C12 0 4 10 8 28Z', fill: 'url(#sp-pewter)', ...INK, 'stroke-width': 2 }),
        S('ellipse', { cy: -16, rx: 22, ry: 6, fill: 'url(#sp-pewter)', ...INK, 'stroke-width': 2 }),
        S('rect', { x: -8, y: -88, width: 16, height: 72, rx: 3, fill: '#efe3c8', ...INK, 'stroke-width': 2 }),
        S('path', { d: 'M0 -88 v-7', stroke: '#1c130c', 'stroke-width': 2 }),
        S('ellipse', { cy: -104, rx: 6, ry: 14, fill: 'url(#sp-flame)', class: 'sp-flame' }));
    },
    roemer(x, y) {
      return S('g', { transform: `translate(${x} ${y})`, class: 'sp-decor' },
        S('ellipse', { cy: 42, rx: 28, ry: 7, fill: 'rgba(110,130,50,.55)', ...INK, 'stroke-width': 2 }),
        S('path', { d: 'M-12 40 L-10 -8 L10 -8 L12 40Z', fill: 'rgba(110,130,50,.5)', ...INK, 'stroke-width': 2 }),
        ...[[-6, 4], [6, 12], [-4, 22], [5, 30]].map(([px, py]) => S('circle', { cx: px, cy: py, r: 4, fill: 'rgba(160,180,90,.85)', stroke: 'rgba(28,19,12,.5)', 'stroke-width': 1 })),
        S('path', { d: 'M-32 -66 C-36 -22 -16 -8 0 -8 C16 -8 36 -22 32 -66Z', fill: 'rgba(140,160,70,.32)', ...INK, 'stroke-width': 2 }),
        S('path', { d: 'M-30 -40 C-30 -18 -14 -10 0 -10 C14 -10 30 -18 30 -40Z', fill: 'rgba(130,20,34,.6)' }),
        S('ellipse', { cy: -66, rx: 32, ry: 6, fill: 'rgba(200,220,150,.25)', ...INK, 'stroke-width': 1.5 }),
        S('path', { d: 'M-22 -56 C-24 -36 -16 -24 -10 -20', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
    },
    grapes(x, y) {
      const g = S('g', { transform: `translate(${x} ${y})`, class: 'sp-decor' });
      seededPts(12, 16, 30, 20).sort((a, b) => a[1] - b[1]).forEach(([px, py]) => g.append(S('circle', { cx: px, cy: py, r: 9, fill: '#3e2140', stroke: 'rgba(0,0,0,.5)', 'stroke-width': 1 }), S('circle', { cx: px - 3, cy: py - 3, r: 2.5, fill: 'rgba(255,255,255,.35)' })));
      g.append(S('path', { d: 'M0 -20 C4 -34 14 -38 20 -44', stroke: '#5a3a1a', 'stroke-width': 3, fill: 'none' }), S('path', { d: 'M16 -40 C30 -50 44 -40 34 -28 C26 -24 18 -30 16 -40Z', fill: '#6d7a45', ...INK, 'stroke-width': 1.5 }));
      return g;
    },
  };
  function lemon() {
    return S('g', null,
      S('ellipse', { cx: 6, cy: 18, rx: 40, ry: 12, fill: 'rgba(0,0,0,.45)' }),
      S('path', { d: 'M22 6 C60 20 34 54 70 74 C100 92 60 120 92 150', stroke: '#1c130c', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }),
      S('path', { d: 'M22 6 C60 20 34 54 70 74 C100 92 60 120 92 150', stroke: '#e9c23a', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }),
      S('path', { d: 'M24 4 C58 18 32 52 68 72 C98 90 58 118 90 148', stroke: '#f6f0dc', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
      S('ellipse', { rx: 36, ry: 25, fill: 'url(#sp-lemon)', ...INK }),
      S('path', { d: 'M4 -24 C30 -22 40 0 30 18 C20 26 8 24 4 22 C14 8 14 -10 4 -24Z', fill: '#f8edb8', ...INK, 'stroke-width': 2 }),
      S('path', { d: 'M8 -16 L22 -2 M10 0 L28 4 M8 14 L24 12', stroke: 'rgba(200,160,40,.6)', 'stroke-width': 1.5 }),
      S('ellipse', { cx: -36, rx: 6, ry: 5, fill: '#d9ac2a', ...INK, 'stroke-width': 2 }),
      S('ellipse', { cx: -14, cy: -12, rx: 10, ry: 4, fill: 'rgba(255,255,255,.45)', transform: 'rotate(-20 -14 -12)' }));
  }

  /* ---------- the dishes, their stories ---------- */
  const DISHES = [
    { id: 'turkey', name: 'The Bird', title: 'The Bird', kicker: 'The turkey', hot: true, labelDy: 102,
      land: [700, 430, 1.35], port: [380, 480, 1.15],
      story: [
        'Turkeys were domesticated in what is now Mexico about two thousand years ago. Spanish ships carried them to Europe in the 1500s, and the English, probably mixing them up with guinea fowl that came through Turkish merchants, gave them the wrong name. It stuck.',
        'In 1784, Benjamin Franklin wrote to his daughter that the bald eagle was “a Bird of bad moral Character,” and the turkey “a much more respectable Bird, and withal a true original Native of America.” A little “vain & silly,” he admitted, but “a Bird of Courage.”',
        'He never actually proposed it as the national bird. He was just being Franklin.',
        'Wild turkeys sleep in trees and fly fast in short bursts. Most farmed turkeys can’t fly at all; they’ve been bred too heavy to leave the ground.',
      ], cite: 'Sources: Franklin to Sarah Bache, Jan. 26, 1784 (Founders Online); Smithsonian Magazine.' },
    { id: 'cranberries', name: 'Cranberries', title: 'The Bounce Test', kicker: 'Cranberries', labelDy: 86,
      land: [410, 298, 1.1], port: [585, 250, 1.0],
      story: [
        'A fresh cranberry bounces. Inside it are four small pockets of air, which is also why it floats. Most of the crop is harvested wet: growers flood the bog, shake the berries loose, and corral a floating red lake.',
        'Sorting machines still use bounce boards. Firm berries hop the barrier; soft ones stay behind. The legend: a New Jersey grower named John “Peg-Leg” Webb, who couldn’t carry his berries down from the loft, poured them down the stairs instead, and noticed the best ones bounced all the way to the bottom.',
        'People ate them long before there was sauce. In 1643, Roger Williams wrote down the Narragansett word, sasemineash. On Martha’s Vineyard, the Aquinnah Wampanoag still hold Cranberry Day every fall.',
      ], cite: 'Sources: Cranberry Marketing Committee; Roger Williams, A Key into the Language of America (1643).' },
    { id: 'can', name: 'From the Can', title: 'From the Can', kicker: 'Jellied cranberry sauce', labelDy: 52,
      land: [975, 300, 1.1], port: [175, 730, 1.0],
      story: [
        'Canned cranberry sauce goes back to 1912, when Marcus Urann, a Massachusetts lawyer turned cranberry grower, started canning it so he could sell berries all year. His company became part of what is now Ocean Spray.',
        'The ridges come from the can. They make thin metal stronger. Everyone uses them as a slicing guide anyway, and that is correct.',
        'There are two kinds of families: the ones who spoon it into a crystal dish, and the ones who serve the cylinder. You know which one you are.',
      ], cite: 'Sources: Ocean Spray; Smithsonian Magazine.' },
    { id: 'casserole', name: 'Green Bean Casserole', title: 'Green Bean Casserole', kicker: 'A 1955 invention', hot: true, labelDy: 76,
      land: [290, 545, 1.1], port: [175, 935, 0.95],
      story: [
        'In 1955, Dorcas Reilly, a home economist in the Campbell Soup Company’s test kitchen in Camden, New Jersey, was asked to come up with a recipe for a newspaper feature. She used what most kitchens already had: green beans, cream of mushroom soup, milk, soy sauce, pepper, and fried onions on top.',
        'It became one of the most-made side dishes in America. In 2002, her original recipe card went to the National Inventors Hall of Fame.',
        'Reilly died in 2018, at 92. Tonight a lot of people will make her recipe without knowing her name. Now you do.',
      ], cite: 'Sources: National Inventors Hall of Fame; Campbell Soup Company.' },
    { id: 'yams', name: 'Sweet Potatoes', title: 'Sweet Potatoes, Marshmallowed', kicker: 'An advertisement you can eat', hot: true, labelDy: 68,
      land: [1120, 545, 1.1], port: [585, 935, 0.95],
      story: [
        'Marshmallows on sweet potatoes started as marketing. In 1917, Angelus Marshmallows hired Janet McKenzie Hill, founder of the Boston Cooking-School Magazine, to write a recipe booklet that would get people cooking with marshmallows. Mashed sweet potatoes, topped and baked, was one of the recipes.',
        'Also, they are probably not yams. In the 1930s, Louisiana growers started calling their soft, orange sweet potatoes “yams” to set them apart. True yams are a different plant entirely, grown mostly in West Africa.',
      ], cite: 'Sources: Smithsonian Magazine; Library of Congress.' },
    { id: 'pie', name: 'Pumpkin Pie', title: 'Pumpkin Pie', kicker: 'Dessert, technically', labelDy: 64,
      land: [1190, 300, 1.05], port: [585, 730, 1.0],
      story: [
        'The first cookbook written by an American and published in America, Amelia Simmons’s American Cookery (1796), has two recipes for “Pompkin” pudding baked in a crust. That’s pumpkin pie.',
        'There was no pie in 1621: no butter, no wheat flour to spare, and no proper ovens.',
        'The pumpkin in the can is mostly Dickinson squash, a tan, unglamorous cousin of the jack-o’-lantern. Much of it is grown and canned around Morton, Illinois, which calls itself the Pumpkin Capital of the World. Illinois grows more pumpkins than any other state.',
      ], cite: 'Sources: Amelia Simmons, American Cookery (1796); University of Illinois Extension.' },
    { id: 'mac', name: 'Macaroni & Cheese', title: 'Macaroni and Cheese', kicker: 'The dish, and the man', hot: true, quiet: true, labelDy: 64,
      land: [500, 652, 1.1], port: [175, 1135, 1.0],
      story: [
        'In 1784, Thomas Jefferson took James Hemings, a nineteen-year-old man he enslaved, to Paris to be trained in French cooking. Hemings apprenticed for years and became the chef of Jefferson’s household there.',
        'Back in Virginia, Hemings negotiated his own freedom: he would be freed once he had trained his brother Peter to replace him. He was freed in 1796. He died in 1801, at 36.',
        'Jefferson usually gets the credit for macaroni and cheese in America. He imported pasta and sketched a macaroni machine. But it was Hemings who brought French technique into that kitchen, and his training shaped what it cooked for years after he left.',
        'In 1802, a guest at Jefferson’s White House wrote in his diary about “a pie called macaroni,” which he mistook for a dish of very strong onions and did not care for. History has disagreed with him. Since then, it has become a cornerstone of Black American holiday tables. Whoever makes it in your family is a person of standing.',
      ], cite: 'Sources: Thomas Jefferson Foundation (Monticello); diary of Manasseh Cutler, Feb. 6, 1802.' },
    { id: 'gravy', name: 'Gravy', title: 'Gravy', kicker: 'A law of nature', hot: true, labelDy: 52,
      land: [900, 655, 1.1], port: [585, 1135, 1.0],
      story: [
        'There is never enough gravy. This is not a complaint. It is a law.',
        'Gravy is the drippings of the bird, thickened. Every family has a gravy person, and every gravy person has a secret that turns out to be more butter.',
        'The three gravy situations, ranked: there isn’t enough; someone made it from a packet and will not say; or it’s Grandma’s, which no one can replicate because her recipe says “until it looks right.”',
      ], cite: 'Source: every Thanksgiving ever.' },
    { id: 'plate1621', name: 'The 1621 Plate', title: 'The 1621 Plate', kicker: 'Then and now', labelDy: 70,
      land: [205, 300, 1.05], port: [175, 250, 1.0],
      story: [
        'Only two foods are named in the eyewitness account: fowl, which the governor sent four men to hunt, and the five deer the Wampanoag brought. The rest is informed guesswork from what grew, swam, and could be dug up nearby that fall.',
        'Likely there: venison, ducks and geese (maybe turkey), corn as bread or porridge, eels, mussels, squash. Not there: potatoes, pie, sugar for sauce, and forks.',
      ], cite: 'Sources: Edward Winslow, letter of Dec. 11, 1621, printed in Mourt’s Relation (1622); Plimoth Patuxet Museums.' },
    { id: 'wishbone', name: 'The Wishbone', title: 'The Wishbone', kicker: 'For later', labelDy: 42,
      land: [700, 212, 1.1], port: [380, 135, 1.0],
      story: [
        'The bone is the furcula, the bird’s fused collarbone. In England it was called the merrythought.',
        'Pulling it for luck is an old custom. Some say it goes back to the Romans, or the Etruscans before them; nobody can really prove it. Everyone agrees on one thing: let it dry for a few days first, or it bends instead of breaking.',
      ], cite: 'Sources: Oxford English Dictionary, “merrythought”; folklore, which does not cite its sources.' },
    { id: 'fryer', name: 'The Fryer (in the driveway)', title: 'The Fryer', kicker: 'In the driveway, too close to the garage', labelDy: 66,
      land: [1262, 812, 1.0], port: [590, 1425, 1.0],
      story: [
        'Deep-frying a turkey takes about 45 minutes and makes a very good bird. It is also how a lot of Thanksgivings end up on the local news.',
        'The physics: oil for frying sits around 350°F. Water that touches it flashes to steam instantly. A frozen or wet turkey carries a lot of water. The oil foams up, spills over onto the flame, and becomes a fireball.',
        'Thanksgiving is the peak day of the year for home cooking fires in the U.S., by a wide margin.',
      ], cite: 'Sources: National Fire Protection Association; USDA Food Safety and Inspection Service.' },
  ];
  const BY = Object.fromEntries(DISHES.map((d) => [d.id, d]));

  /* ======================================================================
     THE CHAPTER
     ====================================================================== */
  LT.chapter({
    id: 'spread', index: 2, numeral: 'II', course: 'Second Course', title: 'The Spread',
    blurb: 'The strange true stories of the food.', music: 'spread', transition: 'cloth',
    light: { darkness: 0.58, radius: 440 },
    mount(root, api) {
      root.classList.add('scrolls', 'sp-root');
      if (!Array.isArray(LT.state.spreadTasted)) LT.state.spreadTasted = [];
      const tasted = new Set(LT.state.spreadTasted.filter((id) => BY[id]));
      const LIGHT_TABLE = { darkness: 0.58, radius: 440 };

      const count = el('p', { class: 'sp-count' });
      const head = el('header', { class: 'sp-head' },
        el('p', { class: 'lt-eyebrow' }, 'Second Course'),
        U.html('<h1 class="lt-display">The <i>Spread</i></h1>'),
        el('p', { class: 'sp-lede' }, 'Every dish on this table has a stranger story than you’d guess. Reach for one.'),
        count);
      const tableWrap = el('div', { class: 'sp-tablewrap' });
      const foot = el('footer', { class: 'sp-foot' },
        el('p', { class: 'sp-foot-note' }, 'Full yet? You can come back for seconds from the bill of fare.'),
        el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', on: { click: () => sleepy() } }, 'Push back from the table'));
      const wrap = el('div', { class: 'sp-wrap' }, head, tableWrap, foot);
      root.appendChild(wrap);

      function renderCount() {
        count.textContent = `Tasted ${tasted.size} of ${DISHES.length}`;
        count.classList.toggle('all', tasted.size === DISHES.length);
      }

      /* --- build the table SVG for the current orientation --- */
      let layout = null, svg = null;
      const dishEls = {};
      function build() {
        const portrait = root.clientWidth < 720;
        const want = portrait ? 'port' : 'land';
        if (want === layout) return;
        layout = want;
        tableWrap.innerHTML = '';
        const VB = portrait ? [760, 1520] : [1400, 900];
        svg = S('svg', { viewBox: `0 0 ${VB[0]} ${VB[1]}`, class: 'sp-table' + (portrait ? ' is-port' : ''), role: 'group', 'aria-label': 'The Thanksgiving table' });
        svg.appendChild(tableDefs());
        // floor, table, runner
        svg.appendChild(S('rect', { width: VB[0], height: VB[1], fill: '#0f0b08' }));
        const T = portrait ? { x: 24, y: 30, w: 712, h: 1330 } : { x: 30, y: 40, w: 1340, h: 712 };
        svg.appendChild(S('rect', { x: T.x, y: T.y + T.h - 20, width: T.w, height: 56, rx: 10, fill: '#1a0f07' }));
        svg.appendChild(S('rect', { x: T.x, y: T.y, width: T.w, height: T.h, rx: 30, fill: 'url(#sp-tablewood)' }));
        svg.appendChild(S('rect', { x: T.x, y: T.y, width: T.w, height: T.h, rx: 30, filter: 'url(#sp-grain)', opacity: 0.9 }));
        const run = portrait ? { x: 290, y: T.y, w: 180, h: T.h } : { x: T.x, y: 322, w: T.w, h: 196 };
        svg.appendChild(S('rect', { ...{ x: run.x, y: run.y, width: run.w, height: run.h }, fill: 'url(#sp-runner)', opacity: 0.9 }));
        const stripe = (o) => portrait
          ? S('rect', { x: run.x + o, y: run.y, width: 8, height: run.h, fill: '#6f1526', opacity: 0.75 })
          : S('rect', { x: run.x, y: run.y + o, width: run.w, height: 8, fill: '#6f1526', opacity: 0.75 });
        [14, 28].forEach((o) => { svg.appendChild(stripe(o)); svg.appendChild(stripe((portrait ? run.w : run.h) - o - 8)); });
        // decor
        if (portrait) { svg.append(decor.candle(84, 500, 0.85), decor.candle(676, 500, 0.85), decor.roemer(380, 1270), decor.grapes(640, 1290)); }
        else { svg.append(decor.candle(570, 170), decor.candle(830, 170), decor.roemer(1070, 150), decor.grapes(1300, 150), decor.grapes(120, 150)); }
        // the lemon (a still-life signature)
        const lp = portrait ? [150, 1300] : [140, 690];
        const lem = S('g', { transform: `translate(${lp[0]} ${lp[1]})`, class: 'sp-dish sp-lemon', tabindex: 0, role: 'button', 'aria-label': 'A half-peeled lemon' }, S('g', { class: 'sp-dish-art' }, lemon()));
        svg.appendChild(lem);
        const lemonClick = () => {
          A.sfx('pluck', { n: 76 });
          LT.egg('vanitas', 'Vanitas', 'The half-peeled lemon was a fixture of Dutch still lifes in the years right after the Pilgrims left Leiden: lovely skin, sour inside, already spoiling. A reminder that the feast doesn’t last. Eat the pie.');
        };
        api.on(lem, 'click', lemonClick);
        api.on(lem, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lemonClick(); } });
        // dishes, back to front
        DISHES.slice().sort((a, b) => a[layout][1] - b[layout][1]).forEach((d) => {
          const [x, y, s] = d[layout];
          const art = S('g', { class: 'sp-dish-art' }, ART[d.id]());
          const label = S('text', { class: 'sp-label', y: d.labelDy, 'text-anchor': 'middle' }, d.name);
          const mark = S('tspan', { class: 'sp-tasted', dx: 8 }, tasted.has(d.id) ? '✓' : '');
          label.appendChild(mark);
          const g = S('g', { class: 'sp-dish' + (tasted.has(d.id) ? ' is-tasted' : ''), transform: `translate(${x} ${y}) scale(${s})`, tabindex: 0, role: 'button', 'aria-label': `${d.name}${tasted.has(d.id) ? ' (tasted)' : ''}` }, art, label);
          dishEls[d.id] = { g, art, mark };
          api.on(g, 'click', () => openDish(d.id, g));
          api.on(g, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDish(d.id, g); } });
          api.on(g, 'mouseenter', () => A.sfx('tick', { g: 0.025 }));
          svg.appendChild(g);
        });
        tableWrap.appendChild(svg);
      }
      build();
      renderCount();
      let rz;
      api.on(window, 'resize', () => { clearTimeout(rz); rz = setTimeout(build, 150); });

      // steam from the hot dishes
      const hot = DISHES.filter((d) => d.hot).map((d) => d.id);
      api.interval(() => {
        if (scene || RM || document.hidden) return;
        const id = U.pick(hot), d = dishEls[id];
        if (!d) return;
        const r = d.art.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        LT.fx.steam(r.left + r.width * R(0.3, 0.7), r.top + r.height * 0.3, { count: 2 });
      }, 280);

      /* --- opening a dish --- */
      let scene = null;
      function markTasted(id) {
        if (tasted.has(id)) return;
        tasted.add(id);
        LT.state.spreadTasted = Array.from(tasted);
        LT.stats.set('dishesTasted', tasted.size);
        const d = dishEls[id];
        if (d) { d.mark.textContent = '✓'; d.g.classList.add('is-tasted'); }
        renderCount();
        if (tasted.size === DISHES.length) LT.egg('cleanplate', 'Clean plate club', 'You tried everything on the table. Your grandmother is so proud.');
      }
      function openDish(id, fromEl) {
        if (scene) closeScene(true);
        const d = BY[id];
        LT.audio.sfx('clink', { g: 0.1 });
        const r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
        const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
        const hint = el('div', { class: 'sp-hint', 'aria-live': 'polite' });
        const controls = el('div', { class: 'sp-controls' });
        const toyHost = el('div', { class: 'sp-toy' });
        const back = el('button', { class: 'sp-back', type: 'button' }, el('span', { 'aria-hidden': 'true' }, '←'), ' Table');
        const stage = el('div', { class: 'sp-stage' }, toyHost, hint, controls, back);
        const status = el('p', { class: 'sp-status', 'aria-live': 'polite' });
        const order = DISHES.map((x) => x.id);
        const nextId = order.find((x, i) => i > order.indexOf(id) && !tasted.has(x)) || order.find((x) => !tasted.has(x) && x !== id) || order[(order.indexOf(id) + 1) % order.length];
        const nextBtn = el('button', { class: 'lt-btn', type: 'button' }, `Next: ${BY[nextId].name}`, el('span', { 'aria-hidden': 'true' }, ' →'));
        const backBtn = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Back to the table');
        const story = el('aside', { class: 'sp-story' },
          el('p', { class: 'lt-eyebrow' }, d.kicker),
          el('h2', { class: 'lt-display' }, d.title),
          status,
          el('div', { class: 'lt-prose' }, ...d.story.map((p) => el('p', null, p))),
          el('p', { class: 'lt-cite' }, d.cite),
          el('div', { class: 'sp-actions' }, nextBtn, backBtn));
        const wrapEl = el('div', { class: `sp-scene sp-scene--${id}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': d.title }, stage, story);
        root.appendChild(wrapEl);
        let toyScope = makeScope();
        const ui = {
          hint(t) { hint.textContent = t || ''; hint.hidden = !t; },
          status(t) { status.textContent = t || ''; status.hidden = !t; },
          button(label, fn) { const b = el('button', { class: 'lt-btn sp-ctl', type: 'button', on: { click: fn } }, label); controls.appendChild(b); return b; },
          segmented(opts, fn) {
            const g = el('div', { class: 'sp-seg', role: 'group' });
            opts.forEach(([l, v]) => {
              const b = el('button', { type: 'button', 'data-f': v, 'aria-pressed': 'false' }, l);
              b.addEventListener('click', () => { g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); fn(v); });
              g.appendChild(b);
            });
            controls.prepend(g);
            return g;
          },
          clearButtons() { controls.innerHTML = ''; },
          restart() { toyScope.destroy(); toyHost.innerHTML = ''; controls.innerHTML = ''; ui.status(''); toyScope = makeScope(); start(); },
        };
        ui.status('');
        function start() { try { TOYS[id](toyHost, toyScope, ui); } catch (e) { console.error(e); ui.hint('This one spilled. Try another dish.'); } }
        start();
        scene = { id, wrapEl, get scope() { return toyScope; }, ox, oy };
        markTasted(id);
        LT.light.set({ darkness: 0.18, radius: 900 });
        if (d.quiet) { LT.music.param('melody', 0); LT.music.param('level', 0.55); }
        if (!RM) wrapEl.animate([{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${ox}px ${oy}px)` }], { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)' });
        nextBtn.addEventListener('click', () => { const g = dishEls[nextId] && dishEls[nextId].g; openDish(nextId, null); });
        backBtn.addEventListener('click', () => closeScene());
        back.addEventListener('click', () => closeScene());
        setTimeout(() => { try { back.focus({ preventScroll: true }); } catch (_) {} }, 50);
      }
      function closeScene(instant) {
        if (!scene) return;
        const s = scene; scene = null;
        s.scope.destroy();
        LT.light.set(LIGHT_TABLE);
        LT.music.param('melody', 1); LT.music.param('level', 1);
        if (instant || RM) { s.wrapEl.remove(); return; }
        LT.audio.sfx('whoosh', { dur: 0.4, g: 0.12 });
        const d = dishEls[s.id], r = d ? d.g.getBoundingClientRect() : null;
        const x = r ? r.left + r.width / 2 : s.ox, y = r ? r.top + r.height / 2 : s.oy;
        const a = s.wrapEl.animate([{ clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }], { duration: 480, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
        a.onfinish = () => s.wrapEl.remove();
        if (d) setTimeout(() => { try { d.g.focus({ preventScroll: true }); } catch (_) {} }, 60);
      }
      api.on(window, 'keydown', (e) => { if (e.key === 'Escape' && scene && !document.querySelector('.menu-overlay')) closeScene(); });
      api.cleanup(() => { if (scene) { scene.scope.destroy(); scene = null; } LT.music.param('melody', 1); LT.music.param('level', 1); });

      /* --- the closer: tryptophan --- */
      let sleeping = false;
      async function sleepy() {
        if (sleeping) return;
        sleeping = true;
        if (scene) closeScene(true);
        const lidT = el('div', { class: 'sp-lid sp-lid--top' }), lidB = el('div', { class: 'sp-lid sp-lid--bot' });
        const line = el('p', { class: 'sp-sleep-line', 'aria-live': 'polite' });
        const end = el('div', { class: 'sp-sleep-end' });
        const skip = el('button', { class: 'sp-sleep-skip', type: 'button' }, 'Skip');
        const ov = el('div', { class: 'sp-sleepy' }, lidT, lidB, line, end, skip);
        root.appendChild(ov);
        root.scrollTo({ top: 0 });
        wrap.classList.add('drowsy');
        LT.music.param('level', 0.4);
        LT.light.set({ darkness: 0.3, radius: 700 });
        let skipped = false;
        skip.addEventListener('click', () => { skipped = true; finish(); });
        const lids = (k, dur = 1.6) => { lidT.style.transitionDuration = lidB.style.transitionDuration = dur + 's'; lidT.style.transform = `translateY(${-100 + k * 100}%)`; lidB.style.transform = `translateY(${100 - k * 100}%)`; };
        const say = async (t, hold) => {
          if (skipped) return;
          line.classList.remove('on');
          await api.wait(400);
          if (skipped) return;
          line.textContent = t; line.classList.add('on');
          await api.wait(hold);
        };
        const lines = [
          ['Getting sleepy?', 2200, 0.32],
          ['Everyone blames the turkey. Turkey has tryptophan, which your body uses to make serotonin and melatonin.', 4200, 0.48],
          ['So do chicken, eggs and cheese. Turkey has about as much as any of them.', 3400, 0.62],
          ['What actually knocks you out is the size of the meal. And the pie. And the couch.', 3600, 0.76],
        ];
        snd.yawn();
        for (const [t, hold, k] of lines) {
          if (skipped) return;
          lids(k * 0.7, 1.2);
          await api.wait(700);
          if (skipped) return;
          lids(k, 2.2);
          await say(t, hold);
        }
        if (!skipped) finish();
        async function finish() {
          if (ov.classList.contains('done')) return;
          ov.classList.add('done');
          skip.remove();
          lids(1.02, 1.1);
          line.classList.remove('on');
          await api.wait(1800);
          // ding-dong
          const t0 = A.now();
          A.tone({ t: t0, f: 659, dur: 1.4, a: 0.004, g: 0.14, rev: 0.4 }); A.tone({ t: t0, f: 1318, dur: 0.6, a: 0.004, g: 0.04 });
          A.tone({ t: t0 + 0.55, f: 523, dur: 1.8, a: 0.004, g: 0.14, rev: 0.4 }); A.tone({ t: t0 + 0.55, f: 1046, dur: 0.7, a: 0.004, g: 0.04 });
          await api.wait(700);
          // eyes snap open
          lids(0, 0.35);
          wrap.classList.remove('drowsy'); wrap.classList.add('awake');
          LT.light.set({ darkness: 0.45, radius: 560 });
          LT.fx.flash('rgba(255,236,200,.5)', 0.25);
          await api.wait(500);
          A.sfx('bark', { n: 2 });
          LT.music.param('level', 1);
          end.append(el('p', { class: 'sp-wake' }, 'Wake up. They’re here.'), api.nextButton());
          end.classList.add('on');
          const b = end.querySelector('.lt-next'); b && b.focus({ preventScroll: true });
        }
      }
    },
  });
})();
